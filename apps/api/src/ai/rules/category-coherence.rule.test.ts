import { describe, expect, it } from 'vitest';

import { MOCK_SCENARIOS } from '../mock-scenarios.js';
import { categoryCoherenceRule } from './category-coherence.rule.js';
import { runPostProcessRules } from './index.js';
import type { RuleContext } from './types.js';
import { makeInput, makeVerdict } from './test-helpers.js';

const context: RuleContext = { input: makeInput('peu importe'), original: makeVerdict() };

describe('categoryCoherenceRule — relèvement défensif', () => {
  it('relève à ARNAQUE_PROBABLE un verdict rassurant sur une catégorie à fort risque', () => {
    const outcome = categoryCoherenceRule.apply(
      makeVerdict({ verdict: 'PLUTOT_SUR', confidence: 0.9, category: 'FAUX_CONSEILLER_BANCAIRE' }),
      context,
    );
    expect(outcome?.patch.verdict).toBe('ARNAQUE_PROBABLE');
    expect(outcome?.patch.reasons?.some((r) => r.includes('type d’arnaque connu'))).toBe(true);
  });

  it('relève au minimum à SUSPECT une autre catégorie d’arnaque', () => {
    const outcome = categoryCoherenceRule.apply(
      makeVerdict({ verdict: 'PLUTOT_SUR', confidence: 0.8, category: 'SMISHING_AUTRE' }),
      context,
    );
    expect(outcome?.patch.verdict).toBe('SUSPECT');
  });

  it('relève un INDETERMINE trop tiède sur une catégorie dangereuse', () => {
    const outcome = categoryCoherenceRule.apply(
      makeVerdict({ verdict: 'INDETERMINE', confidence: 0.7, category: 'PHISHING_COLIS' }),
      context,
    );
    expect(outcome?.patch.verdict).toBe('SUSPECT');
  });
});

describe('categoryCoherenceRule — ne surclasse pas', () => {
  it('ne fait rien quand le verdict est déjà au-dessus du plancher', () => {
    const outcome = categoryCoherenceRule.apply(
      makeVerdict({ verdict: 'ARNAQUE_PROBABLE', confidence: 0.9, category: 'PHISHING_COLIS' }),
      context,
    );
    expect(outcome).toBeNull();
  });

  it('ne touche jamais un message sans catégorie d’arnaque (AUCUNE)', () => {
    const outcome = categoryCoherenceRule.apply(
      makeVerdict({ verdict: 'PLUTOT_SUR', confidence: 0.85, category: 'AUCUNE' }),
      context,
    );
    expect(outcome).toBeNull();
  });

  it('ne touche pas la catégorie fourre-tout AUTRE', () => {
    const outcome = categoryCoherenceRule.apply(
      makeVerdict({ verdict: 'PLUTOT_SUR', confidence: 0.85, category: 'AUTRE' }),
      context,
    );
    expect(outcome).toBeNull();
  });

  it('plafonne à SUSPECT quand la confiance est faible (< 0.5)', () => {
    // Classification incertaine : on refuse « rassurant » mais on ne sur-affirme
    // pas « arnaque probable ».
    const outcome = categoryCoherenceRule.apply(
      makeVerdict({ verdict: 'INDETERMINE', confidence: 0.3, category: 'FAUX_CONSEILLER_BANCAIRE' }),
      context,
    );
    expect(outcome?.patch.verdict).toBe('SUSPECT');
  });

  it('laisse les scénarios du corpus mock inchangés (aucun n’est sous son plancher)', () => {
    for (const { id, verdict } of MOCK_SCENARIOS) {
      expect(categoryCoherenceRule.apply(verdict, context), id).toBeNull();
    }
  });
});

describe('categoryCoherenceRule — cohérence avec les champs étendus', () => {
  it('recalcule risk_level et score après un relèvement (via la chaîne complète)', () => {
    const { verdict } = runPostProcessRules(
      makeVerdict({
        verdict: 'PLUTOT_SUR',
        confidence: 0.9,
        category: 'FAUX_CONSEILLER_BANCAIRE',
        risk_level: 'LOW',
        score: 6,
      }),
      makeInput('Contenu quelconque sans injection.'),
    );
    expect(verdict.verdict).toBe('ARNAQUE_PROBABLE');
    expect(verdict.risk_level).toBe('CRITICAL');
    expect(verdict.score).toBeGreaterThanOrEqual(75);
  });
});
