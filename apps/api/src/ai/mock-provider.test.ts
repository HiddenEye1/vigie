import { describe, expect, it } from 'vitest';

import type { UrlSignals } from '../url/url-analyzer.js';
import { MockProvider } from './mock-provider.js';
import type { AIVerdict } from './provider.js';
import { aiVerdictSchema } from './verdict-schema.js';

const provider = new MockProvider({ delayMs: 0 });

function analyze(content: string): Promise<AIVerdict> {
  return provider.analyze({ kind: 'text', content });
}

function signals(overrides: Partial<UrlSignals> = {}): UrlSignals {
  return {
    finalUrl: 'https://site.example/',
    https: true,
    redirects: 0,
    domainAgeDays: 500,
    isOfficialDomain: false,
    pageTitle: null,
    metaDescription: null,
    fetchFailed: false,
    ...overrides,
  };
}

describe('MockProvider', () => {
  it.each([
    ['colis', 'Votre colis Chronopost est en attente, réglez 1,99 € ici.', 'PHISHING_COLIS'],
    [
      'banque',
      'Ici votre conseiller : votre compte bloqué nécessite vos codes.',
      'FAUX_CONSEILLER_BANCAIRE',
    ],
    [
      'administration',
      'Dernier rappel : votre amende ANTAI reste impayée.',
      'PHISHING_ADMINISTRATION',
    ],
    [
      'placement',
      'Investissez dans notre livret crypto à 12 % garanti.',
      'INVESTISSEMENT_FRAUDULEUX',
    ],
    [
      'petites annonces',
      'Bonjour, je vous ai payé via Leboncoin, cliquez pour recevoir.',
      'ARNAQUE_PETITES_ANNONCES',
    ],
    ['CPF', 'Vos droits CPF expirent : appelez vite ce numéro.', 'FRAUDE_CPF_AIDES'],
    ['support', 'Alerte Microsoft : votre ordinateur est infecté.', 'FAUX_SUPPORT_TECHNIQUE'],
  ])('reconnaît le scénario %s', async (_label, content, category) => {
    const verdict = await analyze(content);
    expect(verdict.category).toBe(category);
  });

  it('répond INDETERMINE sur un contenu très court', async () => {
    const verdict = await analyze('ok merci');
    expect(verdict.verdict).toBe('INDETERMINE');
  });

  it('est déterministe : même contenu, même verdict', async () => {
    const content = 'Un message quelconque qui ne correspond à aucune règle du tout.';
    const [first, second] = await Promise.all([analyze(content), analyze(content)]);
    expect(first).toEqual(second);
  });

  it('fait tourner les 4 verdicts pour tester tous les états de l’UI', async () => {
    const seen = new Set<string>();
    for (let i = 0; i < 64; i += 1) {
      const verdict = await analyze(
        `Message de test numéro ${String(i)} sans aucun mot-clé particulier ici.`,
      );
      seen.add(verdict.verdict);
    }
    expect(seen).toEqual(new Set(['ARNAQUE_PROBABLE', 'SUSPECT', 'PLUTOT_SUR', 'INDETERMINE']));
  });

  it('URL sur domaine officiel → PLUTOT_SUR', async () => {
    const verdict = await provider.analyze({
      kind: 'url',
      content: 'https://www.ameli.fr/assure',
      urlSignals: signals({ isOfficialDomain: true }),
    });
    expect(verdict.verdict).toBe('PLUTOT_SUR');
  });

  it('URL sur domaine très récent → ARNAQUE_PROBABLE', async () => {
    const verdict = await provider.analyze({
      kind: 'url',
      content: 'https://site-tout-neuf.example/',
      urlSignals: signals({ domainAgeDays: 3 }),
    });
    expect(verdict.verdict).toBe('ARNAQUE_PROBABLE');
    expect(verdict.category).toBe('FAUX_SITE_ECOMMERCE');
  });

  it('URL sans HTTPS → SUSPECT', async () => {
    const verdict = await provider.analyze({
      kind: 'url',
      content: 'http://site-quelconque.example/',
      urlSignals: signals({ https: false }),
    });
    expect(verdict.verdict).toBe('SUSPECT');
  });

  it('image : verdict déterministe et conforme au schéma', async () => {
    const input = {
      kind: 'image',
      image: { mediaType: 'image/png', base64: 'aGVsbG8gd29ybGQ=' },
    } as const;
    const [first, second] = await Promise.all([provider.analyze(input), provider.analyze(input)]);
    expect(first).toEqual(second);
    expect(aiVerdictSchema.safeParse(first).success).toBe(true);
  });

  it('produit toujours des verdicts conformes au schéma du modèle', async () => {
    const samples = [
      'Votre colis est en attente de paiement.',
      'Bonjour, à quelle heure le rendez-vous demain ?',
      'x',
      'Investissez maintenant dans la crypto.',
      'Un message parfaitement neutre et assez long pour être analysé.',
    ];
    for (const sample of samples) {
      const verdict = await analyze(sample);
      expect(aiVerdictSchema.safeParse(verdict).success).toBe(true);
    }
  });
});
