import { buildMoneyReminderMessage } from './checkup.messages';

describe('buildMoneyReminderMessage', () => {
  const message = buildMoneyReminderMessage();

  it('contient le réflexe clé « nouveau numéro »', () => {
    expect(message).toContain('nouveau numéro');
    expect(message).toContain('changé de numéro');
  });

  it('se termine par la signature Vigie', () => {
    expect(message.trimEnd().endsWith('— Envoyé avec Vigie')).toBe(true);
  });

  it('reste générique : aucun verdict, score, pourcentage ni donnée personnelle', () => {
    expect(message).not.toMatch(/%/);
    expect(message).not.toMatch(/score/i);
    expect(message).not.toMatch(/ARNAQUE|SUSPECT|INDETERMINE|verdict/i);
    // Pas de prénom ni de coordonnées injectés : le message est constant.
    expect(message).toBe(buildMoneyReminderMessage());
  });
});
