import { ANALYZE_CONTENT_MAX_LENGTH } from '@vigie/shared';

import { composeEmailForAnalysis } from './email';

describe('composeEmailForAnalysis', () => {
  it('compose « De » / « Objet » / contenu dans l’ordre', () => {
    const { text, truncated } = composeEmailForAnalysis({
      from: 'service@banque.fr',
      subject: 'Compte suspendu',
      body: 'Cliquez ici pour éviter la suspension.',
    });
    expect(text).toBe(
      'De : service@banque.fr\nObjet : Compte suspendu\n\nCliquez ici pour éviter la suspension.',
    );
    expect(truncated).toBe(false);
  });

  it('n’inclut que les champs fournis (corps seul)', () => {
    const { text } = composeEmailForAnalysis({ body: 'Un message sans en-tête.' });
    expect(text).toBe('Un message sans en-tête.');
  });

  it('omet un champ vide ou composé d’espaces', () => {
    const { text } = composeEmailForAnalysis({ from: '   ', subject: 'Objet', body: 'Corps' });
    expect(text).toBe('Objet : Objet\n\nCorps');
    expect(text).not.toContain('De :');
  });

  it('nettoie les espaces autour de chaque champ', () => {
    const { text } = composeEmailForAnalysis({
      from: '  a@b.fr  ',
      subject: '  Sujet ',
      body: '  Corps  ',
    });
    expect(text).toBe('De : a@b.fr\nObjet : Sujet\n\nCorps');
  });

  it('tronque au-delà de la limite et lève truncated', () => {
    const long = 'a'.repeat(ANALYZE_CONTENT_MAX_LENGTH + 500);
    const { text, truncated } = composeEmailForAnalysis({ body: long });
    expect(text).toHaveLength(ANALYZE_CONTENT_MAX_LENGTH);
    expect(truncated).toBe(true);
  });

  it('ne tronque pas un mail dans la limite', () => {
    const { truncated } = composeEmailForAnalysis({ body: 'court' });
    expect(truncated).toBe(false);
  });
});
