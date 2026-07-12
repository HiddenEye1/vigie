import { checkupReminderState } from './checkup.reminder';

const DAY_MS = 24 * 60 * 60 * 1000;
const NOW = new Date('2026-07-12T10:00:00.000Z');

/** Date ISO située `days` jours avant NOW. */
function daysAgo(days: number): string {
  return new Date(NOW.getTime() - days * DAY_MS).toISOString();
}

describe('checkupReminderState', () => {
  it('renvoie « never » quand le bilan n’a jamais été ouvert', () => {
    expect(checkupReminderState(null, NOW)).toBe('never');
  });

  it('renvoie « recent » à 89 jours (juste sous le seuil)', () => {
    expect(checkupReminderState(daysAgo(89), NOW)).toBe('recent');
  });

  it('renvoie « due » à 90 jours pile', () => {
    expect(checkupReminderState(daysAgo(90), NOW)).toBe('due');
  });

  it('renvoie « due » au-delà de 90 jours', () => {
    expect(checkupReminderState(daysAgo(120), NOW)).toBe('due');
  });

  it('renvoie « recent » pour un bilan fait à l’instant', () => {
    expect(checkupReminderState(NOW.toISOString(), NOW)).toBe('recent');
  });
});
