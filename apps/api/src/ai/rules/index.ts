import type { VerdictExtras } from '@vigie/shared';

import type { AIVerdict, AnalyzeInput } from '../provider.js';
import { categoryCoherenceRule } from './category-coherence.rule.js';
import { confidenceDegradationRule } from './confidence-degradation.rule.js';
import { extendedFieldsRule } from './extended-fields.rule.js';
import { injectionGuardRule } from './injection-guard.rule.js';
import type { PostProcessRule } from './types.js';
import { urlSignalsRule } from './url-signals.rule.js';

export type { PostProcessRule, RuleContext, RuleOutcome } from './types.js';

/**
 * Chaîne de règles de post-traitement, appliquées DANS L'ORDRE. L'ordre est
 * significatif :
 *  1. confidence-degradation — dégrade en INDETERMINE si peu sûr ;
 *  2. injection-guard — remonte à SUSPECT si injection (jamais rétrogradé
 *     ensuite car il n'y a plus de règle de dégradation après lui) ;
 *  3. category-coherence — relève un verdict trop rassurant pour une catégorie
 *     dangereuse (filet défensif) ;
 *  4. url-signals — relève selon les signaux techniques du lien (filet
 *     défensif) ;
 *  5. extended-fields — dérive les champs étendus du verdict FINAL (donc en
 *     dernier, pour rester cohérent avec les relèvements ci-dessus).
 *
 * Ajouter un détecteur (signaux de fraude de contenu…) revient à insérer une
 * règle dans cette liste, avant extended-fields, sans toucher à l'orchestrateur.
 */
export const POST_PROCESS_RULES: readonly PostProcessRule[] = [
  confidenceDegradationRule,
  injectionGuardRule,
  categoryCoherenceRule,
  urlSignalsRule,
  extendedFieldsRule,
];

/** Trace d'une règle déclenchée — usage interne (debug/logs), jamais exposée au client. */
export interface RuleTrace {
  readonly name: string;
  readonly reason: string;
}

export interface PostProcessResult {
  readonly verdict: AIVerdict & VerdictExtras;
  readonly trace: readonly RuleTrace[];
}

/**
 * Applique la chaîne de règles au verdict brut et renvoie le verdict final
 * enrichi ainsi que la trace des règles déclenchées.
 *
 * La trace est destinée aux logs internes : {@link finalizeVerdict} ne la
 * propage pas dans la réponse HTTP.
 */
export function runPostProcessRules(
  raw: AIVerdict,
  input: AnalyzeInput,
  rules: readonly PostProcessRule[] = POST_PROCESS_RULES,
): PostProcessResult {
  const context = { input, original: raw } as const;
  let current: AIVerdict = raw;
  const trace: RuleTrace[] = [];

  for (const rule of rules) {
    const outcome = rule.apply(current, context);
    if (outcome !== null) {
      current = { ...current, ...outcome.patch };
      trace.push({ name: rule.name, reason: outcome.reason });
    }
  }

  // La règle extended-fields garantit les quatre champs du format étendu.
  return { verdict: current as AIVerdict & VerdictExtras, trace };
}
