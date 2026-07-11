import { describe, expect, it } from 'vitest';

import { extendedFieldsRule } from './extended-fields.rule.js';
import { makeInput, makeVerdict } from './test-helpers.js';

const input = makeInput('peu importe');

describe('extendedFieldsRule', () => {
  it('complète les quatre champs étendus manquants', () => {
    const original = makeVerdict({ verdict: 'ARNAQUE_PROBABLE', confidence: 0.95 });
    const outcome = extendedFieldsRule.apply(original, { input, original });
    expect(outcome?.patch.risk_level).toBe('CRITICAL');
    expect(outcome?.patch.score).toBeGreaterThanOrEqual(75);
    expect((outcome?.patch.senior_summary ?? '').length).toBeGreaterThan(0);
    expect((outcome?.patch.do_not ?? '').length).toBeGreaterThan(0);
  });

  it('respecte un champ déjà fourni quand le verdict n’a pas changé', () => {
    const original = makeVerdict({ verdict: 'SUSPECT', confidence: 0.7, score: 42 });
    const outcome = extendedFieldsRule.apply(original, { input, original });
    expect(outcome?.patch.score).toBe(42);
  });

  it('RECALCULE tout quand le verdict a changé depuis le verdict d’origine', () => {
    // Le fournisseur avait dit PLUTOT_SUR + risque faible ; un garde-fou a
    // depuis basculé le verdict à SUSPECT : « risque faible » mentirait.
    const original = makeVerdict({
      verdict: 'PLUTOT_SUR',
      risk_level: 'LOW',
      score: 5,
      senior_summary: 'Rien d’inquiétant.',
      do_not: 'Rien de particulier.',
    });
    const current = makeVerdict({ ...original, verdict: 'SUSPECT' });
    const outcome = extendedFieldsRule.apply(current, { input, original });
    expect(outcome?.patch.risk_level).toBe('MEDIUM');
    expect(outcome?.patch.score).not.toBe(5);
    expect(outcome?.patch.senior_summary).not.toBe('Rien d’inquiétant.');
    expect(outcome?.patch.do_not).not.toBe('Rien de particulier.');
  });
});
