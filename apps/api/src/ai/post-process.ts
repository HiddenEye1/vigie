import type { VerdictExtras } from '@vigie/shared';

import type { AIVerdict, AnalyzeInput } from './provider.js';
import { runPostProcessRules } from './rules/index.js';

/**
 * Post-traitement serveur du verdict, appliqué quel que soit le fournisseur d'IA.
 * La logique vit désormais dans une chaîne de règles nommées et testables
 * indépendamment (voir `./rules/`). Cette fonction en est le point d'entrée
 * stable : elle applique les règles et ne renvoie que le verdict final, sans la
 * trace interne (jamais exposée au client).
 */
export function finalizeVerdict(raw: AIVerdict, input: AnalyzeInput): AIVerdict & VerdictExtras {
  return runPostProcessRules(raw, input).verdict;
}
