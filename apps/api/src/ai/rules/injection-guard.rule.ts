import { detectInjectionSignals } from '../../security/injection-guard.js';
import type { AnalyzeInput } from '../provider.js';
import type { PostProcessRule } from './types.js';

const INJECTION_REASON =
  'Ce message contient des instructions destinées à tromper les outils d’analyse automatique : c’est en soi un signal d’arnaque.';

/**
 * §7 point 9 — Garde-fou anti-injection, indépendant du fournisseur d'IA.
 * Si le contenu analysé contient des instructions adressées à l'outil d'analyse,
 * le verdict ne peut jamais rester PLUTOT_SUR ni INDETERMINE : il est remonté à
 * SUSPECT au minimum, avec une raison explicite. Un verdict déjà alarmant
 * (SUSPECT, ARNAQUE_PROBABLE) n'est jamais rétrogradé.
 */
export const injectionGuardRule: PostProcessRule = {
  name: 'injection-guard',
  apply(current, { input }) {
    const downgradable = current.verdict === 'PLUTOT_SUR' || current.verdict === 'INDETERMINE';
    if (!downgradable) {
      return null;
    }
    const signals = detectInjectionSignals(textualContent(input));
    if (signals.length === 0) {
      return null;
    }
    return {
      patch: {
        verdict: 'SUSPECT',
        category: current.category === 'AUCUNE' ? 'AUTRE' : current.category,
        reasons: [...current.reasons, INJECTION_REASON],
      },
      reason: `injection détectée (${signals.join(', ')}) : verdict remonté à SUSPECT`,
    };
  },
};

/**
 * Texte contrôlable par un attaquant, à passer au détecteur d'injection.
 * Pour une URL, le titre et la description extraits de la page sont aussi
 * des données hostiles potentielles. Pour une image, le texte n'est connu
 * que du modèle vision (règle 9 du prompt système).
 */
function textualContent(input: AnalyzeInput): string {
  switch (input.kind) {
    case 'text':
      return input.content;
    case 'url':
      return [
        input.content,
        input.urlSignals.pageTitle ?? '',
        input.urlSignals.metaDescription ?? '',
      ].join('\n');
    case 'image':
      return '';
  }
}
