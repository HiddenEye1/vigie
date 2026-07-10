/**
 * Domaine « Parcours proactifs ».
 *
 * L'idée centrale de Vigie : protéger AVANT l'erreur, même quand la personne ne
 * sait pas encore qu'elle devrait se méfier. Chaque parcours est un
 * questionnaire local (aucune donnée envoyée) qui crée un réflexe.
 *
 * Point d'entrée unique : le reste de l'app importe depuis `@/features/parcours`.
 */

export { PARCOURS, UPCOMING_PARCOURS, getParcours } from './registry';
export { ParcoursRunner } from './parcours-runner';
export { EmergencyRunner } from './emergency-runner';
export type {
  ParcoursDefinition,
  QuestionnaireParcours,
  EmergencyParcours,
  EmergencySituation,
  ParcoursLevel,
  ParcoursOutcome,
  ParcoursQuestion,
  ParcoursOption,
} from './types';
