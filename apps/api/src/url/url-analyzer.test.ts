import { describe, expect, it, vi } from 'vitest';

import { createMemoryRepositories } from '../db/repositories.js';
import { BlockedUrlError } from '../security/ssrf.js';
import type { FetchFn } from './url-analyzer.js';
import { HttpUrlAnalyzer, registrableDomain } from './url-analyzer.js';

const NOW = Date.parse('2026-07-03T12:00:00Z');

type RouteMap = Record<string, () => Response>;

/** Fabrique un faux fetch routé par préfixe d'URL. RDAP répond 404 par défaut. */
function fakeFetch(routes: RouteMap): FetchFn {
  const fn = vi.fn((input: unknown) => {
    const url = String(input instanceof URL ? input.toString() : input);
    for (const [prefix, handler] of Object.entries(routes)) {
      if (url.startsWith(prefix)) {
        return Promise.resolve(handler());
      }
    }
    if (url.startsWith('https://rdap.org/')) {
      return Promise.resolve(new Response('not found', { status: 404 }));
    }
    return Promise.reject(new Error(`fetch inattendu : ${url}`));
  });
  return fn as unknown as FetchFn;
}

function html(body: string, status = 200): Response {
  return new Response(body, { status, headers: { 'content-type': 'text/html; charset=utf-8' } });
}

function redirect(location: string, status = 302): Response {
  return new Response(null, { status, headers: { location } });
}

function makeAnalyzer(routes: RouteMap): HttpUrlAnalyzer {
  return new HttpUrlAnalyzer({ fetchFn: fakeFetch(routes), now: () => NOW });
}

describe('HttpUrlAnalyzer', () => {
  it('suit les redirections et extrait titre + description', async () => {
    const analyzer = makeAnalyzer({
      'https://bit.ly/abc': () => redirect('https://arnaque-colis.example/page'),
      'https://arnaque-colis.example/page': () =>
        html(
          '<html><head><title>Suivi de votre colis</title>' +
            '<meta name="description" content="Payez 1,99 &euro; pour recevoir votre colis"></head></html>',
        ),
    });

    const signals = await analyzer.analyze('https://bit.ly/abc');
    expect(signals.finalUrl).toBe('https://arnaque-colis.example/page');
    expect(signals.redirects).toBe(1);
    expect(signals.https).toBe(true);
    expect(signals.pageTitle).toBe('Suivi de votre colis');
    expect(signals.metaDescription).toContain('Payez 1,99');
    expect(signals.fetchFailed).toBe(false);
  });

  it('refuse une redirection vers une IP privée (SSRF au 2e saut)', async () => {
    const analyzer = makeAnalyzer({
      'https://redirecteur.example/': () => redirect('http://127.0.0.1/admin'),
    });
    await expect(analyzer.analyze('https://redirecteur.example/')).rejects.toBeInstanceOf(
      BlockedUrlError,
    );
  });

  it('refuse une redirection vers les métadonnées cloud', async () => {
    const analyzer = makeAnalyzer({
      'https://redirecteur.example/': () => redirect('http://169.254.169.254/latest/meta-data/'),
    });
    await expect(analyzer.analyze('https://redirecteur.example/')).rejects.toBeInstanceOf(
      BlockedUrlError,
    );
  });

  it('s’arrête après 5 redirections (§8.3)', async () => {
    const analyzer = makeAnalyzer({
      'https://boucle.example/': () => redirect('https://boucle.example/'),
    });
    const signals = await analyzer.analyze('https://boucle.example/');
    expect(signals.redirects).toBe(5);
  });

  it('ne lit que 20 Ko : un titre placé au-delà est ignoré', async () => {
    const padding = '<!--'.padEnd(25 * 1024, 'x') + '-->';
    const analyzer = makeAnalyzer({
      'https://gros-site.example/': () => html(`<html>${padding}<title>Trop loin</title></html>`),
    });
    const signals = await analyzer.analyze('https://gros-site.example/');
    expect(signals.pageTitle).toBeNull();
  });

  it('signale fetchFailed sans échouer quand le site est injoignable', async () => {
    const analyzer = makeAnalyzer({
      'https://mort.example/': () => {
        throw new Error('ECONNREFUSED');
      },
    });
    const signals = await analyzer.analyze('https://mort.example/');
    expect(signals.fetchFailed).toBe(true);
    expect(signals.finalUrl).toBe('https://mort.example/');
  });

  it('détecte un domaine officiel français', async () => {
    const analyzer = makeAnalyzer({
      'https://www.ameli.fr/': () => html('<title>Ameli</title>'),
    });
    const signals = await analyzer.analyze('https://www.ameli.fr/');
    expect(signals.isOfficialDomain).toBe(true);
  });

  it('un domaine sosie n’est PAS officiel', async () => {
    const analyzer = makeAnalyzer({
      'https://ameli-remboursement.fr/': () => html('<title>Faux Ameli</title>'),
    });
    const signals = await analyzer.analyze('https://ameli-remboursement.fr/');
    expect(signals.isOfficialDomain).toBe(false);
  });

  it('calcule l’âge du domaine via RDAP et le met en cache', async () => {
    const registeredAt = new Date(NOW - 100 * 86_400_000).toISOString();
    const rdapCalls: string[] = [];
    const repos = createMemoryRepositories();
    const fetchFn = fakeFetch({
      'https://site.example/': () => html('<title>ok</title>'),
      'https://rdap.org/domain/site.example': () => {
        rdapCalls.push('hit');
        return new Response(
          JSON.stringify({ events: [{ eventAction: 'registration', eventDate: registeredAt }] }),
          { status: 200, headers: { 'content-type': 'application/rdap+json' } },
        );
      },
    });
    const analyzer = new HttpUrlAnalyzer({
      fetchFn,
      domainAgeCache: repos.domainAgeCache,
      now: () => NOW,
    });

    const first = await analyzer.analyze('https://site.example/');
    expect(first.domainAgeDays).toBe(100);

    const second = await analyzer.analyze('https://site.example/');
    expect(second.domainAgeDays).toBe(100);
    expect(rdapCalls).toHaveLength(1); // servi par le cache au second appel
  });

  it('âge du domaine null quand RDAP est indisponible', async () => {
    const analyzer = makeAnalyzer({
      'https://inconnu.example/': () => html('<title>ok</title>'),
    });
    const signals = await analyzer.analyze('https://inconnu.example/');
    expect(signals.domainAgeDays).toBeNull();
  });
});

describe('registrableDomain', () => {
  it.each([
    ['www.exemple.fr', 'exemple.fr'],
    ['a.b.c.exemple.com', 'exemple.com'],
    ['impots.gouv.fr', 'impots.gouv.fr'],
    ['sub.impots.gouv.fr', 'impots.gouv.fr'],
    ['exemple.co.uk', 'exemple.co.uk'],
    ['localhost', null],
  ])('%s → %s', (hostname, expected) => {
    expect(registrableDomain(hostname)).toBe(expected);
  });
});
