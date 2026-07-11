import { describe, expect, it } from 'vitest';

import {
  CORPUS_NATURES,
  type CorpusCase,
  evaluatePipeline,
  evaluateRulesOnly,
  loadCorpus,
  mockProvider,
} from './corpus.js';

const CORPUS = loadCorpus();
const provider = mockProvider();

function ofNature(nature: CorpusCase['nature']): CorpusCase[] {
  return CORPUS.filter((testCase) => testCase.nature === nature);
}

function byId(id: string): CorpusCase {
  const found = CORPUS.find((testCase) => testCase.id === id);
  if (!found) {
    throw new Error(`Cas de corpus introuvable : ${id}`);
  }
  return found;
}

describe('corpus d’évaluation — intégrité', () => {
  it('a des identifiants uniques', () => {
    const ids = CORPUS.map((testCase) => testCase.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('couvre les quatre natures', () => {
    for (const nature of CORPUS_NATURES) {
      expect(ofNature(nature).length).toBeGreaterThan(0);
    }
  });

  it('contient une base large de cas dangereux et des cas anti-faux-positifs', () => {
    expect(ofNature('danger').length).toBeGreaterThanOrEqual(12);
    const antiFp = CORPUS.filter((testCase) => testCase.tags.includes('anti-faux-positif'));
    expect(antiFp.length).toBeGreaterThanOrEqual(4);
  });
});

describe('cas DANGER — la pile protège (mock + post-traitement)', () => {
  it.each(ofNature('danger').map((testCase) => [testCase.id, testCase] as const))(
    '%s → verdict non rassurant, dans la plage attendue',
    async (_id, testCase) => {
      const final = await evaluatePipeline(provider, testCase);
      expect(final.verdict).not.toBe('PLUTOT_SUR');
      expect(final.risk_level).not.toBe('LOW');
      expect(testCase.expected_verdicts).toContain(final.verdict);
      expect(testCase.expected_risk).toContain(final.risk_level);
    },
  );
});

describe('anti-faux-positif — les règles n’escaladent pas un contenu légitime', () => {
  it.each(
    [...ofNature('legitime'), ...ofNature('prevention')].map(
      (testCase) => [testCase.id, testCase] as const,
    ),
  )('%s → reste PLUTOT_SUR / risque faible', (_id, testCase) => {
    const final = evaluateRulesOnly(testCase);
    expect(final.verdict).toBe('PLUTOT_SUR');
    expect(final.risk_level).toBe('LOW');
  });
});

describe('cas AMBIGUS — pas de sur-alerte', () => {
  it.each(ofNature('ambigu').map((testCase) => [testCase.id, testCase] as const))(
    '%s → jamais ARNAQUE_PROBABLE côté règles',
    (_id, testCase) => {
      const final = evaluateRulesOnly(testCase);
      expect(final.verdict).not.toBe('ARNAQUE_PROBABLE');
      expect(testCase.expected_verdicts).toContain(final.verdict);
    },
  );
});

describe('anti-faux-positif — cas emblématiques', () => {
  it('« ne communiquez jamais ce code » reste une prévention, pas une demande', () => {
    expect(evaluateRulesOnly(byId('prevention-ne-communiquez-jamais-code')).verdict).toBe(
      'PLUTOT_SUR',
    );
  });

  it('un proche qu’on rembourse normalement ne devient pas DANGER', () => {
    expect(evaluateRulesOnly(byId('legit-remboursement-proche')).verdict).toBe('PLUTOT_SUR');
  });

  it('un rappel de sécurité bancaire, sans lien ni code, n’est pas surclassé', () => {
    expect(evaluateRulesOnly(byId('prevention-banque-jamais-code')).verdict).toBe('PLUTOT_SUR');
  });

  it('un QR code de restaurant n’est pas automatiquement critique', () => {
    const final = evaluateRulesOnly(byId('legit-qr-restaurant'));
    expect(final.verdict).toBe('PLUTOT_SUR');
    expect(final.risk_level).toBe('LOW');
  });

  it('une page de connexion sur un domaine officiel n’est pas suspecte par défaut', () => {
    expect(evaluateRulesOnly(byId('legit-lien-officiel-login')).verdict).toBe('PLUTOT_SUR');
  });
});
