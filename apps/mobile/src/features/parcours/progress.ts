/**
 * Fraction de progression d'un parcours, bornée à [0, 1]. Logique pure, testée
 * indépendamment du rendu.
 */
export function progressFraction(current: number, total: number): number {
  if (total <= 0) {
    return 0;
  }
  return Math.min(Math.max(current / total, 0), 1);
}
