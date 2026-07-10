import { describe, expect, it } from 'vitest';

import { confidenceDegradationRule } from './confidence-degradation.rule.js';
import { makeInput, makeVerdict } from './test-helpers.js';

const context = { input: makeInput('peu importe'), original: makeVerdict() };

describe('confidenceDegradationRule', () => {
  it('dégrade en INDETERMINE quand la confiance est < 0.5', () => {
    const outcome = confidenceDegradationRule.apply(
      makeVerdict({ verdict: 'ARNAQUE_PROBABLE', confidence: 0.4 }),
      context,
    );
    expect(outcome?.patch.verdict).toBe('INDETERMINE');
  });

  it('ne fait rien quand la confiance est >= 0.5', () => {
    const outcome = confidenceDegradationRule.apply(
      makeVerdict({ verdict: 'SUSPECT', confidence: 0.5 }),
      context,
    );
    expect(outcome).toBeNull();
  });

  it('ne fait rien quand le verdict est déjà INDETERMINE', () => {
    const outcome = confidenceDegradationRule.apply(
      makeVerdict({ verdict: 'INDETERMINE', confidence: 0.2 }),
      context,
    );
    expect(outcome).toBeNull();
  });
});
