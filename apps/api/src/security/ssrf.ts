import { lookup as dnsLookup } from 'node:dns';
import { isIP } from 'node:net';

import { Agent } from 'undici';

/**
 * Protection SSRF pour l'analyse d'URL (§8.3) :
 * - schéma http(s) uniquement, ports web standards uniquement ;
 * - résolution DNS contrôlée : toute IP privée/réservée/localhost est refusée ;
 * - le contrôle est appliqué AU MOMENT DE LA CONNEXION (lookup personnalisé
 *   du dispatcher undici), ce qui neutralise le DNS rebinding : l'IP vérifiée
 *   est celle réellement utilisée pour ouvrir la socket.
 */

/** URL refusée pour raison de sécurité → HTTP 400 côté API. */
export class BlockedUrlError extends Error {
  constructor(reason: string) {
    super(reason);
    this.name = 'BlockedUrlError';
  }
}

const ALLOWED_PORTS = new Set(['', '80', '443', '8080', '8443']);

const BLOCKED_HOSTNAMES = new Set(['localhost', 'localhost.localdomain', 'broadcasthost']);

/** Plages IPv4 interdites : privées, réservées, lien-local, multicast, CGNAT… */
const BLOCKED_IPV4_RANGES: readonly [number, number][] = [
  [ipv4ToInt('0.0.0.0'), 8], // « this network »
  [ipv4ToInt('10.0.0.0'), 8], // privé
  [ipv4ToInt('100.64.0.0'), 10], // CGNAT
  [ipv4ToInt('127.0.0.0'), 8], // loopback
  [ipv4ToInt('169.254.0.0'), 16], // lien-local (dont métadonnées cloud)
  [ipv4ToInt('172.16.0.0'), 12], // privé
  [ipv4ToInt('192.0.0.0'), 24], // réservé IETF
  [ipv4ToInt('192.0.2.0'), 24], // documentation
  [ipv4ToInt('192.168.0.0'), 16], // privé
  [ipv4ToInt('198.18.0.0'), 15], // bancs de test
  [ipv4ToInt('198.51.100.0'), 24], // documentation
  [ipv4ToInt('203.0.113.0'), 24], // documentation
  [ipv4ToInt('224.0.0.0'), 4], // multicast
  [ipv4ToInt('240.0.0.0'), 4], // réservé + broadcast
];

function ipv4ToInt(ip: string): number {
  return ip.split('.').reduce((acc, octet) => acc * 256 + Number(octet), 0);
}

function isBlockedIpv4(ip: string): boolean {
  const value = ipv4ToInt(ip);
  return BLOCKED_IPV4_RANGES.some(([base, prefix]) => {
    const mask = prefix === 0 ? 0 : (-1 << (32 - prefix)) >>> 0;
    return (value & mask) >>> 0 === (base & mask) >>> 0;
  });
}

/** Extrait l'IPv4 embarquée d'une adresse IPv6 mappée (::ffff:a.b.c.d) ou NAT64. */
function embeddedIpv4(ipv6: string): string | null {
  const normalized = ipv6.toLowerCase();
  const dotted = /(\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3})$/.exec(normalized);
  if (dotted?.[1] && isIP(dotted[1]) === 4) {
    return dotted[1];
  }
  // Forme hexadécimale ::ffff:XXXX:XXXX
  const hex = /^::ffff:([0-9a-f]{1,4}):([0-9a-f]{1,4})$/.exec(normalized);
  if (hex?.[1] && hex[2]) {
    const high = parseInt(hex[1], 16);
    const low = parseInt(hex[2], 16);
    return `${String(high >> 8)}.${String(high & 0xff)}.${String(low >> 8)}.${String(low & 0xff)}`;
  }
  return null;
}

function isBlockedIpv6(ip: string): boolean {
  const normalized = ip.toLowerCase().split('%')[0] ?? '';
  if (normalized === '::' || normalized === '::1') {
    return true; // non spécifié + loopback
  }
  const mapped = embeddedIpv4(normalized);
  if (mapped) {
    return isBlockedIpv4(mapped);
  }
  return (
    /^f[cd]/.test(normalized) || // fc00::/7 ULA
    /^fe[89ab]/.test(normalized) || // fe80::/10 lien-local
    normalized.startsWith('ff') || // ff00::/8 multicast
    normalized.startsWith('64:ff9b') || // NAT64
    normalized.startsWith('2001:db8') // documentation
  );
}

/** true si l'adresse IP (v4 ou v6) appartient à une plage interdite. */
export function isBlockedIpAddress(ip: string): boolean {
  const version = isIP(ip);
  if (version === 4) {
    return isBlockedIpv4(ip);
  }
  if (version === 6) {
    return isBlockedIpv6(ip);
  }
  return true; // non parsable → refus par défaut
}

/**
 * Vérifications statiques d'une URL avant toute résolution :
 * schéma, identifiants embarqués, port, hostname interdit, IP littérale privée.
 * Lève BlockedUrlError si l'URL ne doit pas être contactée.
 */
export function assertAllowedUrl(rawUrl: string): URL {
  let url: URL;
  try {
    url = new URL(rawUrl);
  } catch {
    throw new BlockedUrlError('URL invalide');
  }
  if (url.protocol !== 'http:' && url.protocol !== 'https:') {
    throw new BlockedUrlError(`schéma interdit : ${url.protocol}`);
  }
  if (url.username !== '' || url.password !== '') {
    throw new BlockedUrlError('identifiants embarqués dans l’URL');
  }
  if (!ALLOWED_PORTS.has(url.port)) {
    throw new BlockedUrlError(`port interdit : ${url.port}`);
  }
  const hostname = url.hostname.replace(/^\[|\]$/g, '').toLowerCase();
  if (BLOCKED_HOSTNAMES.has(hostname) || hostname.endsWith('.localhost')) {
    throw new BlockedUrlError('hôte local interdit');
  }
  if (isIP(hostname) !== 0 && isBlockedIpAddress(hostname)) {
    throw new BlockedUrlError('adresse IP privée ou réservée');
  }
  return url;
}

type LookupCallback = (
  err: NodeJS.ErrnoException | null,
  address: string | { address: string; family: number }[],
  family?: number,
) => void;

/**
 * Dispatcher undici dont le lookup DNS refuse toute résolution vers une IP
 * interdite. C'est la barrière effective contre le DNS rebinding.
 */
export function createSafeDispatcher(): Agent {
  return new Agent({
    connect: {
      lookup(hostname: string, options: object, callback: LookupCallback): void {
        dnsLookup(hostname, { ...options, all: true, verbatim: true }, (err, addresses) => {
          if (err) {
            callback(err, []);
            return;
          }
          const list = Array.isArray(addresses)
            ? addresses
            : [{ address: String(addresses), family: 4 }];
          const blocked = list.find((entry) => isBlockedIpAddress(entry.address));
          if (blocked) {
            callback(
              Object.assign(new Error(`résolution vers une adresse interdite`), {
                code: 'EBLOCKED',
              }),
              [],
            );
            return;
          }
          callback(null, list);
        });
      },
    },
  });
}
