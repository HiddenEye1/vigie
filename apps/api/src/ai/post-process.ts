import type { VerdictExtras } from '@vigie/shared';
import { deriveVerdictExtras } from '@vigie/shared';

import { detectInjectionSignals } from '../security/injection-guard.js';
import type { AIVerdict, AnalyzeInput } from './provider.js';

const INJECTION_REASON =
  'Ce message contient des instructions destinées à tromper les outils d’analyse automatique : c’est en soi un signal d’arnaque.';

/**
 * Post-traitement serveur du verdict, appliqué quel que soit le fournisseur d'IA :
 * 1. confidence < 0.5 → verdict dégradé en INDETERMINE (§4.2) ;
 * 2. injection de prompt détectée dans le contenu → le verdict ne peut jamais
 *    être PLUTOT_SUR ni INDETERMINE : il est remonté à SUSPECT au minimum,
 *    avec une raison explicite (§7 point 9, testé indépendamment du provider) ;
 * 3. format étendu (risk_level, score, senior_summary, do_not) : complété à
 *    partir du verdict FINAL si le fournisseur ne l'a pas fourni, pour que le
 *    contrat soit toujours cohérent et complet.
 */
export function finalizeVerdict(raw: AIVerdict, input: AnalyzeInput): AIVerdict & VerdictExtras {
  let result = raw;

  if (result.confidence < 0.5 && result.verdict !== 'INDETERMINE') {
    result = { ...result, verdict: 'INDETERMINE' };
  }

  const injectionSignals = detectInjectionSignals(textualContent(input));
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

  // Dérivé APRÈS les ajustements ci-dessus, donc cohérent avec le verdict final.
  const extras = deriveVerdictExtras(result.verdict, result.confidence);
  return {
    ...result,
    risk_level: result.risk_level ?? extras.risk_level,
    score: result.score ?? extras.score,
    senior_summary: result.senior_summary ?? extras.senior_summary,
    do_not: result.do_not ?? extras.do_not,
  };
}

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
