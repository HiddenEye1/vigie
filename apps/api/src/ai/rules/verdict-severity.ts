import type { VerdictLevel } from '@vigie/shared';

/** Sévérité croissante d'un verdict, pour comparer sans jamais rétrograder. */
export const VERDICT_SEVERITY: Record<VerdictLevel, number> = {
  PLUTOT_SUR: 0,
  INDETERMINE: 1,
  SUSPECT: 2,
  ARNAQUE_PROBABLE: 3,
};

/** true si `current` est strictement moins sévère que `floor` (donc à relever). */
export function isBelow(current: VerdictLevel, floor: VerdictLevel): boolean {
  return VERDICT_SEVERITY[current] < VERDICT_SEVERITY[floor];
}
