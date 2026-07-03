import { detectInjectionSignals } from '../security/injection-guard.js';
import type { AIVerdict, AnalyzeInput } from './provider.js';

const INJECTION_REASON =
  'Ce message contient des instructions destinées à tromper les outils d’analyse automatique : c’est en soi un signal d’arnaque.';

/**
 * Post-traitement serveur du verdict, appliqué quel que soit le fournisseur d'IA :
 * 1. confidence < 0.5 → verdict dégradé en INDETERMINE (§4.2) ;
 * 2. injection de prompt détectée dans le contenu → le verdict ne peut jamais
 *    être PLUTOT_SUR ni INDETERMINE : il est remonté à SUSPECT au minimum,
 *    avec une raison explicite (§7 point 9, testé indépendamment du provider).
 */
export function finalizeVerdict(raw: AIVerdict, input: AnalyzeInput): AIVerdict {
  let result = raw;

  if (result.confidence < 0.5 && result.verdict !== 'INDETERMINE') {
    result = { ...result, verdict: 'INDETERMINE' };
  }

  const injectionSignals = detectInjectionSignals(input.content);
  if (
    injectionSignals.length > 0 &&
    (result.verdict === 'PLUTOT_SUR' || result.verdict === 'INDETERMINE')
  ) {
    result = {
      ...result,
      verdict: 'SUSPECT',
      category: result.category === 'AUCUNE' ? 'AUTRE' : result.category,
      reasons: [...result.reasons, INJECTION_REASON],
    };
  }

  return result;
}
