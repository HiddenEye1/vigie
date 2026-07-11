import type { PostProcessRule } from './types.js';

/**
 * §4.2 — Un verdict trop peu sûr ne doit pas être affirmé : sous 0.5 de
 * confiance, on le dégrade en INDETERMINE plutôt que de risquer un faux
 * « plutôt sûr » ou une « arnaque probable » mal étayée.
 *
 * Doit s'exécuter AVANT le garde-fou anti-injection : si l'ordre était inversé,
 * un verdict remonté à SUSPECT par l'anti-injection puis vu comme peu sûr
 * serait re-dégradé en INDETERMINE, ce qui contredirait le garde-fou.
 */
export const confidenceDegradationRule: PostProcessRule = {
  name: 'confidence-degradation',
  apply(current) {
    if (current.confidence >= 0.5 || current.verdict === 'INDETERMINE') {
      return null;
    }
    return {
      patch: { verdict: 'INDETERMINE' },
      reason: `confiance ${current.confidence.toFixed(2)} < 0.5 : verdict dégradé en INDETERMINE`,
    };
  },
};
