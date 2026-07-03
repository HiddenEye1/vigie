import { describe, expect, it } from 'vitest';

import { assertAllowedUrl, BlockedUrlError, isBlockedIpAddress } from './ssrf.js';

describe('isBlockedIpAddress', () => {
  it.each([
    ['loopback', '127.0.0.1'],
    ['loopback (autre)', '127.255.255.254'],
    ['privé 10/8', '10.0.0.8'],
    ['privé 172.16/12 (début)', '172.16.0.1'],
    ['privé 172.16/12 (fin)', '172.31.255.255'],
    ['privé 192.168/16', '192.168.1.254'],
    ['lien-local / métadonnées cloud', '169.254.169.254'],
    ['CGNAT 100.64/10', '100.64.0.1'],
    ['this-network', '0.0.0.0'],
    ['réservé IETF', '192.0.0.170'],
    ['documentation', '192.0.2.10'],
    ['documentation 198.51.100', '198.51.100.7'],
    ['documentation 203.0.113', '203.0.113.9'],
    ['bancs de test 198.18/15', '198.19.0.1'],
    ['multicast', '224.0.0.251'],
    ['réservé 240/4', '255.255.255.255'],
    ['IPv6 loopback', '::1'],
    ['IPv6 non spécifié', '::'],
    ['IPv6 ULA fc00::/7', 'fc00::1'],
    ['IPv6 ULA fd', 'fd12:3456::1'],
    ['IPv6 lien-local', 'fe80::1'],
    ['IPv6 multicast', 'ff02::1'],
    ['IPv6 mappé vers loopback', '::ffff:127.0.0.1'],
    ['IPv6 mappé vers privé', '::ffff:10.0.0.1'],
    ['IPv6 mappé vers 192.168', '::ffff:192.168.0.10'],
    ['NAT64', '64:ff9b::a00:1'],
    ['IPv6 documentation', '2001:db8::1'],
    ['chaîne non IP', 'pas-une-ip'],
  ])('bloque %s (%s)', (_label, ip) => {
    expect(isBlockedIpAddress(ip)).toBe(true);
  });

  it.each([
    ['IPv4 publique (DNS Google)', '8.8.8.8'],
    ['IPv4 publique (Cloudflare)', '1.1.1.1'],
    ['IPv4 publique au-dessus de 172.31', '172.32.0.1'],
    ['IPv4 publique au-dessus de 100.127', '100.128.0.1'],
    ['IPv6 publique', '2606:4700:4700::1111'],
  ])('autorise %s (%s)', (_label, ip) => {
    expect(isBlockedIpAddress(ip)).toBe(false);
  });
});

describe('assertAllowedUrl', () => {
  it.each([
    ['schéma file', 'file:///etc/passwd'],
    ['schéma ftp', 'ftp://exemple.fr/fichier'],
    ['schéma javascript', 'javascript:alert(1)'],
    ['localhost', 'http://localhost/admin'],
    ['sous-domaine .localhost', 'http://interne.localhost/'],
    ['IP loopback', 'http://127.0.0.1/x'],
    ['IP privée 10/8', 'http://10.0.0.8/'],
    ['IP privée 192.168', 'https://192.168.1.1/router'],
    ['métadonnées cloud', 'http://169.254.169.254/latest/meta-data/'],
    ['IPv6 loopback', 'http://[::1]/'],
    ['IPv6 mappée privée', 'http://[::ffff:10.0.0.1]/'],
    ['port SSH', 'http://exemple.fr:22/'],
    ['port base de données', 'http://exemple.fr:5432/'],
    ['identifiants embarqués', 'https://user:pass@exemple.fr/'],
    ['URL invalide', 'https://'],
  ])('refuse %s', (_label, url) => {
    expect(() => assertAllowedUrl(url)).toThrow(BlockedUrlError);
  });

  it.each([
    ['https standard', 'https://www.exemple.fr/page?a=1'],
    ['http standard', 'http://exemple.fr/'],
    ['port 443 explicite', 'https://exemple.fr:443/'],
    ['port 8080', 'http://exemple.fr:8080/'],
    ['IP publique', 'http://8.8.8.8/'],
  ])('autorise %s', (_label, url) => {
    expect(() => assertAllowedUrl(url)).not.toThrow();
  });
});
