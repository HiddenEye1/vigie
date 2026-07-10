import { describe, expect, it } from 'vitest';

import { deriveVerdictExtras, RISK_LEVEL_LABELS } from './verdict-extras.js';
import type { VerdictLevel } from './verdict.js';

describe('deriveVerdictExtras', () => {
  it('mappe chaque verdict vers un niveau de risque cohérent', () => {
    expect(deriveVerdictExtras('ARNAQUE_PROBABLE', 0.95).risk_level).toBe('CRITICAL');
    expect(deriveVerdictExtras('ARNAQUE_PROBABLE', 0.7).risk_level).toBe('HIGH');
    expect(deriveVerdictExtras('SUSPECT', 0.7).risk_level).toBe('MEDIUM');
    expect(deriveVerdictExtras('INDETERMINE', 0.3).risk_level).toBe('MEDIUM');
    expect(deriveVerdictExtras('PLUTOT_SUR', 0.9).risk_level).toBe('LOW');
  });

  it('produit un score borné 0–100, plus élevé pour les arnaques', () => {
    const scam = deriveVerdictExtras('ARNAQUE_PROBABLE', 0.95).score;
    const safe = deriveVerdictExtras('PLUTOT_SUR', 0.9).score;
    expect(scam).toBeGreaterThanOrEqual(75);
    expect(scam).toBeLessThanOrEqual(100);
    expect(safe).toBeLessThanOrEqual(25);
    expect(scam).toBeGreaterThan(safe);
  });

  it('fournit toujours une phrase senior et une action à éviter, non vides', () => {
    const levels: readonly VerdictLevel[] = [
      'ARNAQUE_PROBABLE',
      'SUSPECT',
      'PLUTOT_SUR',
      'INDETERMINE',
    ];
    for (const level of levels) {
      const extras = deriveVerdictExtras(level, 0.8);
      expect(extras.senior_summary.length).toBeGreaterThan(0);
      expect(extras.do_not.length).toBeGreaterThan(0);
    }
  });

  it('expose les libellés français des niveaux de risque', () => {
    expect(RISK_LEVEL_LABELS.LOW).toBe('faible');
    expect(RISK_LEVEL_LABELS.MEDIUM).toBe('moyen');
    expect(RISK_LEVEL_LABELS.HIGH).toBe('élevé');
    expect(RISK_LEVEL_LABELS.CRITICAL).toBe('critique');
  });
});
