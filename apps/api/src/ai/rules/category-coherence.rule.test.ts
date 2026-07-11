import { describe, expect, it } from 'vitest';

import { MOCK_SCENARIOS } from '../mock-scenarios.js';
import { categoryCoherenceRule } from './category-coherence.rule.js';
import { runPostProcessRules } from './index.js';
import type { RuleContext, RuleOutcome } from './types.js';
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

describe('categoryCoherenceRule — exception OTP isolé', () => {
  // Contenus RÉELS du corpus (fixtures/corpus.json).
  const otpSeul = 'Votre code de validation est 245 871. Il expire dans 10 minutes.';
  const demandeCode =
    "Bonjour, pour annuler l'opération frauduleuse, communiquez-nous le code reçu par SMS. C'est urgent, sinon le prélèvement partira.";

  function apply(content: string): RuleOutcome | null {
    return categoryCoherenceRule.apply(
      makeVerdict({ verdict: 'PLUTOT_SUR', confidence: 0.9, category: 'FAUX_CONSEILLER_BANCAIRE' }),
      { input: makeInput(content), original: makeVerdict() },
    );
  }

  it('plafonne à SUSPECT un OTP livré sans demande de transmission (ambigu-otp-seul)', () => {
    expect(apply(otpSeul)?.patch.verdict).toBe('SUSPECT');
  });

  it('conserve ARNAQUE_PROBABLE quand le code est explicitement demandé (danger-demande-code-sms)', () => {
    expect(apply(demandeCode)?.patch.verdict).toBe('ARNAQUE_PROBABLE');
  });

  it('conserve ARNAQUE_PROBABLE quand un OTP est accompagné d’un appel à agir', () => {
    const otpPlusAppel =
      'Votre code de validation est 245 871. Appelez le service anti-fraude pour confirmer, sinon votre compte sera bloqué.';
    expect(apply(otpPlusAppel)?.patch.verdict).toBe('ARNAQUE_PROBABLE');
  });
});

describe('chaîne complète — OTP isolé vs vraie demande de code', () => {
  const otpSeul = 'Votre code de validation est 245 871. Il expire dans 10 minutes.';
  const demandeCode =
    "Bonjour, pour annuler l'opération frauduleuse, communiquez-nous le code reçu par SMS. C'est urgent, sinon le prélèvement partira.";

  it('l’OTP isolé reste SUSPECT et un risque modéré, jamais ARNAQUE_PROBABLE / HIGH', () => {
    const { verdict } = runPostProcessRules(
      makeVerdict({
        verdict: 'SUSPECT',
        confidence: 0.6,
        category: 'FAUX_CONSEILLER_BANCAIRE',
        risk_level: 'MEDIUM',
        score: 50,
      }),
      makeInput(otpSeul),
    );
    expect(verdict.verdict).toBe('SUSPECT');
    expect(verdict.risk_level).not.toBe('HIGH');
    expect(verdict.risk_level).not.toBe('CRITICAL');
  });

  it('la vraie demande de code SMS reste ARNAQUE_PROBABLE et un risque élevé', () => {
    const { verdict } = runPostProcessRules(
      makeVerdict({
        verdict: 'SUSPECT',
        confidence: 0.7,
        category: 'FAUX_CONSEILLER_BANCAIRE',
        risk_level: 'MEDIUM',
        score: 55,
      }),
      makeInput(demandeCode),
    );
    expect(verdict.verdict).toBe('ARNAQUE_PROBABLE');
    expect(['HIGH', 'CRITICAL']).toContain(verdict.risk_level);
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
