import { describe, expect, it } from 'vitest';

import { analyzeTextRequestSchema } from './analyze-request.js';
import { analyzeResponseSchema } from './verdict.js';

const validResponse = {
  verdict: 'ARNAQUE_PROBABLE',
  confidence: 0.92,
  category: 'FAUX_CONSEILLER_BANCAIRE',
  summary: "C'est le scénario classique du faux conseiller bancaire.",
  reasons: ['Urgence artificielle', 'Demande de code confidentiel'],
  actions: ['Ne communiquez jamais vos codes', 'Appelez le numéro au dos de votre carte'],
  url_analysis: null,
  request_id: 'e58ed763-928c-4155-bee9-fdbaaadc15f3',
};

describe('analyzeResponseSchema', () => {
  it('accepte une réponse conforme', () => {
    expect(analyzeResponseSchema.safeParse(validResponse).success).toBe(true);
  });

  it('accepte une analyse URL renseignée', () => {
    const withUrl = {
      ...validResponse,
      url_analysis: {
        final_url: 'https://exemple.fr',
        domain_age_days: null,
        https: true,
        redirects: 2,
      },
    };
    expect(analyzeResponseSchema.safeParse(withUrl).success).toBe(true);
  });

  it.each([
    ['verdict inconnu', { ...validResponse, verdict: 'SUR_A_100_POURCENT' }],
    ['confidence hors bornes', { ...validResponse, confidence: 1.4 }],
    ['confidence négative', { ...validResponse, confidence: -0.1 }],
    ['catégorie inconnue', { ...validResponse, category: 'LOTERIE' }],
    ['summary vide', { ...validResponse, summary: '' }],
    ['reasons vide', { ...validResponse, reasons: [] }],
    ['trop de reasons', { ...validResponse, reasons: Array<string>(7).fill('x') }],
    ['request_id non uuid', { ...validResponse, request_id: 'abc' }],
    ['actions manquantes', { ...validResponse, actions: undefined }],
  ])('rejette : %s', (_label, payload) => {
    expect(analyzeResponseSchema.safeParse(payload).success).toBe(false);
  });

  it('rejette des objets aléatoires (fuzzing léger)', () => {
    const junk: unknown[] = [
      null,
      undefined,
      42,
      'verdict',
      [],
      {},
      { verdict: 'SUSPECT' },
      { ...validResponse, reasons: 'pas un tableau' },
      { ...validResponse, confidence: 'haute' },
      { ...validResponse, actions: [42] },
      new Date(),
      { verdict: null, confidence: null, category: null },
    ];
    for (const value of junk) {
      expect(analyzeResponseSchema.safeParse(value).success).toBe(false);
    }
  });
});

describe('analyzeTextRequestSchema', () => {
  const validRequest = {
    kind: 'text',
    content: 'Votre colis est en attente, cliquez ici.',
    device_id: 'e58ed763-928c-4155-bee9-fdbaaadc15f3',
  };

  it('accepte une requête texte valide', () => {
    expect(analyzeTextRequestSchema.safeParse(validRequest).success).toBe(true);
  });

  it.each([
    ['contenu vide', { ...validRequest, content: '   ' }],
    ['contenu trop long', { ...validRequest, content: 'a'.repeat(10_001) }],
    ['device_id invalide', { ...validRequest, device_id: '1234' }],
    ['kind inattendu', { ...validRequest, kind: 'audio' }],
  ])('rejette : %s', (_label, payload) => {
    expect(analyzeTextRequestSchema.safeParse(payload).success).toBe(false);
  });
});
