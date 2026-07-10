import { progressFraction } from './progress';

describe('progressFraction', () => {
  it('renvoie une fraction entre 0 et 1', () => {
    expect(progressFraction(1, 5)).toBeCloseTo(0.2);
    expect(progressFraction(5, 5)).toBe(1);
  });

  it('borne les valeurs hors limites', () => {
    expect(progressFraction(9, 5)).toBe(1);
    expect(progressFraction(-2, 5)).toBe(0);
  });

  it('évite la division par zéro', () => {
    expect(progressFraction(1, 0)).toBe(0);
  });
});
