/**
 * Rappel doux du Check-up sécurité — logique pure, testable.
 *
 * Aucun rappel système, aucune notification : cet état sert uniquement à
 * moduler, à l'ouverture de l'accueil, le ton de la carte Check-up. Jamais
 * culpabilisant — au pire une invitation à refaire le point.
 */

/** Au-delà de ce délai depuis le dernier bilan, on propose d'y revenir. */
export const CHECKUP_REMINDER_DAYS = 90;

const DAY_MS = 24 * 60 * 60 * 1000;

export type CheckupReminderState = 'never' | 'due' | 'recent';

/**
 * - `never` : le bilan n'a jamais été ouvert.
 * - `due` : dernier bilan il y a 90 jours ou plus.
 * - `recent` : dernier bilan il y a moins de 90 jours.
 */
export function checkupReminderState(
  lastReviewedAt: string | null,
  now: Date,
): CheckupReminderState {
  if (lastReviewedAt === null) {
    return 'never';
  }
  const elapsedDays = (now.getTime() - new Date(lastReviewedAt).getTime()) / DAY_MS;
  return elapsedDays >= CHECKUP_REMINDER_DAYS ? 'due' : 'recent';
}
