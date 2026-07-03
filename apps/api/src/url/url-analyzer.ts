import type { Dispatcher } from 'undici';
import { fetch as undiciFetch } from 'undici';

import { assertAllowedUrl, createSafeDispatcher } from '../security/ssrf.js';
import { isOfficialDomain } from './official-domains.js';

/** Signaux techniques d'une URL (§8.3), passés à l'IA et renvoyés à l'app. */
export interface UrlSignals {
  readonly finalUrl: string;
  readonly https: boolean;
  readonly redirects: number;
  readonly domainAgeDays: number | null;
  readonly isOfficialDomain: boolean;
  readonly pageTitle: string | null;
  readonly metaDescription: string | null;
  /** true si la page n'a pas pu être récupérée (délai, DNS, réseau). */
  readonly fetchFailed: boolean;
}

export interface UrlAnalyzer {
  analyze(rawUrl: string): Promise<UrlSignals>;
}

/** Cache du volet WHOIS/RDAP (lent et limité en débit) — table url_cache. */
export interface DomainAgeCache {
  get(domain: string): Promise<number | null | undefined>;
  set(domain: string, ageDays: number | null): Promise<void>;
}

const MAX_REDIRECTS = 5;
const FETCH_BUDGET_MS = 5_000;
const RDAP_TIMEOUT_MS = 3_000;
const MAX_BODY_BYTES = 20 * 1024;
const REDIRECT_STATUSES = new Set([301, 302, 303, 307, 308]);
const USER_AGENT = 'VigieBot/1.0 (verification anti-arnaque; +https://github.com)';

export type FetchFn = typeof undiciFetch;

export interface HttpUrlAnalyzerOptions {
  readonly fetchFn?: FetchFn;
  readonly dispatcher?: Dispatcher;
  readonly domainAgeCache?: DomainAgeCache;
  readonly now?: () => number;
}

/**
 * Analyse technique d'une URL (§8.3) :
 * redirections suivies manuellement (max 5, contrôle SSRF à CHAQUE saut),
 * lecture plafonnée à 20 Ko (title + meta description uniquement, jamais
 * d'exécution du contenu), âge du domaine via RDAP (WHOIS moderne) avec cache.
 */
export class HttpUrlAnalyzer implements UrlAnalyzer {
  private readonly fetchFn: FetchFn;
  private readonly dispatcher: Dispatcher;
  private readonly cache: DomainAgeCache | undefined;
  private readonly now: () => number;

  constructor(options: HttpUrlAnalyzerOptions = {}) {
    this.fetchFn = options.fetchFn ?? undiciFetch;
    this.dispatcher = options.dispatcher ?? createSafeDispatcher();
    this.cache = options.domainAgeCache;
    this.now = options.now ?? (() => Date.now());
  }

  async analyze(rawUrl: string): Promise<UrlSignals> {
    // Peut lever BlockedUrlError → 400 côté API.
    const initialUrl = assertAllowedUrl(rawUrl);

    const deadline = this.now() + FETCH_BUDGET_MS;
    let currentUrl = initialUrl;
    let redirects = 0;
    let pageTitle: string | null = null;
    let metaDescription: string | null = null;
    let fetchFailed = false;

    try {
      for (;;) {
        const response = await this.fetchOnce(currentUrl, deadline);
        if (REDIRECT_STATUSES.has(response.status) && redirects < MAX_REDIRECTS) {
          const location = response.headers.get('location');
          await response.body?.cancel();
          if (!location) {
            break;
          }
          // Chaque saut de redirection repasse par le contrôle SSRF complet.
          currentUrl = assertAllowedUrl(new URL(location, currentUrl).toString());
          redirects += 1;
          continue;
        }

        const contentType = response.headers.get('content-type') ?? '';
        if (contentType.includes('text/html') && response.body) {
          const html = await readAtMost(response.body, MAX_BODY_BYTES);
          pageTitle = extractTitle(html);
          metaDescription = extractMetaDescription(html);
        } else {
          await response.body?.cancel();
        }
        break;
      }
    } catch (error) {
      // Le refus SSRF remonte tel quel ; les erreurs réseau sont un signal, pas une panne.
      if ((error as Error).name === 'BlockedUrlError') {
        throw error;
      }
      fetchFailed = true;
    }

    const domainAgeDays = await this.resolveDomainAge(currentUrl.hostname);

    return {
      finalUrl: currentUrl.toString(),
      https: currentUrl.protocol === 'https:',
      redirects,
      domainAgeDays,
      isOfficialDomain: isOfficialDomain(currentUrl.hostname),
      pageTitle,
      metaDescription,
      fetchFailed,
    };
  }

  private async fetchOnce(url: URL, deadline: number): Promise<Awaited<ReturnType<FetchFn>>> {
    const remaining = deadline - this.now();
    if (remaining <= 0) {
      throw new Error('délai d’analyse dépassé');
    }
    return this.fetchFn(url, {
      method: 'GET',
      redirect: 'manual',
      dispatcher: this.dispatcher,
      signal: AbortSignal.timeout(remaining),
      headers: {
        'user-agent': USER_AGENT,
        accept: 'text/html,application/xhtml+xml;q=0.9,*/*;q=0.5',
        'accept-language': 'fr-FR,fr;q=0.9',
      },
    });
  }

  /** Âge du domaine en jours via RDAP (null si indisponible), avec cache. */
  private async resolveDomainAge(hostname: string): Promise<number | null> {
    const domain = registrableDomain(hostname);
    if (!domain) {
      return null;
    }
    const cached = await this.cache?.get(domain);
    if (cached !== undefined) {
      return cached;
    }

    let ageDays: number | null = null;
    try {
      const response = await this.fetchFn(`https://rdap.org/domain/${domain}`, {
        signal: AbortSignal.timeout(RDAP_TIMEOUT_MS),
        headers: { accept: 'application/rdap+json', 'user-agent': USER_AGENT },
      });
      if (response.ok) {
        const data = (await response.json()) as {
          events?: { eventAction?: string; eventDate?: string }[];
        };
        const registration = data.events?.find((e) => e.eventAction === 'registration');
        if (registration?.eventDate) {
          const registeredAt = Date.parse(registration.eventDate);
          if (!Number.isNaN(registeredAt)) {
            ageDays = Math.max(0, Math.floor((this.now() - registeredAt) / 86_400_000));
          }
        }
      }
    } catch {
      ageDays = null;
    }

    await this.cache?.set(domain, ageDays);
    return ageDays;
  }
}

/**
 * Domaine enregistrable approché : deux derniers labels (trois pour les
 * suffixes composés courants). Sans liste PSL complète, volontairement simple.
 */
export function registrableDomain(hostname: string): string | null {
  const host = hostname.toLowerCase().replace(/\.$/, '');
  if (!host.includes('.')) {
    return null;
  }
  const labels = host.split('.');
  const compoundSuffixes = new Set(['co.uk', 'org.uk', 'gouv.fr', 'asso.fr', 'com.br']);
  const lastTwo = labels.slice(-2).join('.');
  if (compoundSuffixes.has(lastTwo) && labels.length >= 3) {
    return labels.slice(-3).join('.');
  }
  return lastTwo;
}

async function readAtMost(body: ReadableStream<Uint8Array>, maxBytes: number): Promise<string> {
  const reader = body.getReader();
  const chunks: Uint8Array[] = [];
  let total = 0;
  try {
    while (total < maxBytes) {
      const { done, value } = await reader.read();
      if (done) {
        break;
      }
      chunks.push(value);
      total += value.byteLength;
    }
  } finally {
    await reader.cancel().catch(() => undefined);
  }
  const merged = new Uint8Array(Math.min(total, maxBytes));
  let offset = 0;
  for (const chunk of chunks) {
    const slice = chunk.subarray(0, Math.min(chunk.byteLength, merged.byteLength - offset));
    merged.set(slice, offset);
    offset += slice.byteLength;
    if (offset >= merged.byteLength) {
      break;
    }
  }
  return new TextDecoder('utf-8', { fatal: false }).decode(merged);
}

function extractTitle(html: string): string | null {
  const match = /<title[^>]*>([^<]{0,300})/i.exec(html);
  return match?.[1] ? decodeEntities(match[1].trim()) || null : null;
}

function extractMetaDescription(html: string): string | null {
  const match =
    /<meta[^>]+name=["']description["'][^>]*content=["']([^"']{0,500})["']/i.exec(html) ??
    /<meta[^>]+content=["']([^"']{0,500})["'][^>]*name=["']description["']/i.exec(html);
  return match?.[1] ? decodeEntities(match[1].trim()) || null : null;
}

function decodeEntities(text: string): string {
  return text
    .replaceAll('&amp;', '&')
    .replaceAll('&lt;', '<')
    .replaceAll('&gt;', '>')
    .replaceAll('&quot;', '"')
    .replaceAll('&#39;', "'")
    .replaceAll('&nbsp;', ' ');
}
