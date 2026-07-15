/**
 * Domaine « Check-up sécurité ».
 *
 * Un bilan de protection local et rassurant, utile même sans doute préalable.
 * Point d'entrée unique : le reste de l'app importe depuis `@/features/checkup`,
 * jamais depuis les fichiers internes.
 *
 * Principe : tout est local, rien n'est envoyé, aucun pourcentage ni score
 * affiché. Le seul item vérifiable (« proche ») lit le Bouclier famille.
 */

// État local
export { useCheckup } from './checkup.store';

// Définitions & dérivation pure
export {
  CHECKUP_ITEMS,
  CHECKUP_LEVELS,
} from './checkup.items';
export type {
  CheckupItemDef,
  CheckupItemId,
  CheckupItemProche,
  CheckupItemSource,
  CheckupLevel,
  CheckupLevelInfo,
  CheckupMode,
  CheckupState,
} from './checkup.items';
export { deriveCheckup, deriveItemState, levelFor } from './checkup.derive';
export type { CheckupInput, CheckupItemView, CheckupResult } from './checkup.derive';
export { checkupReminderState, CHECKUP_REMINDER_DAYS } from './checkup.reminder';
export type { CheckupReminderState } from './checkup.reminder';
export { buildMoneyReminderMessage } from './checkup.messages';

// Composants
export { CheckupCard } from './checkup-card';
export { CheckupSummary } from './checkup-summary';
export { CheckupIntro } from './checkup-intro';
export { CheckupHomeCard } from './checkup-home-card';
