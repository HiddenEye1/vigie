import type { VerdictExtras } from '@vigie/shared';

import type { AIVerdict, AnalyzeInput } from '../provider.js';

/**
 * Contexte immuable partagé par toutes les règles de post-traitement.
 * `original` est le verdict brut du fournisseur, avant toute règle : il permet
 * à une règle de savoir si une règle précédente a déjà modifié le verdict
 * (comparaison `current.verdict !== original.verdict`), sans état mutable
 * partagé entre les règles.
 */
export interface RuleContext {
  readonly input: AnalyzeInput;
  readonly original: AIVerdict;
}

/**
 * Résultat du déclenchement d'une règle : les champs à fusionner sur le verdict
 * courant, plus une raison lisible réservée aux logs internes (jamais renvoyée
 * au client).
 */
export interface RuleOutcome {
  readonly patch: Partial<AIVerdict & VerdictExtras>;
  readonly reason: string;
}

/**
 * Une règle de post-traitement serveur. Elle reçoit le verdict courant (déjà
 * transformé par les règles précédentes) et le contexte, puis :
 * - renvoie un {@link RuleOutcome} si elle s'applique ;
 * - renvoie `null` si elle n'a rien à changer.
 *
 * Une règle ne mute jamais son entrée : l'orchestrateur applique le patch.
 */
export interface PostProcessRule {
  readonly name: string;
  apply(current: AIVerdict, context: RuleContext): RuleOutcome | null;
}
