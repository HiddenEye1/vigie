import type { AnalyzeResponse } from '@vigie/shared';

import { buildAdviceMessage, buildContactUrl, detectChannel, firstName } from './trusted-contact';

const SCAM: AnalyzeResponse = {
  verdict: 'ARNAQUE_PROBABLE',
  confidence: 0.93,
  category: 'PHISHING_COLIS',
  summary: 'C’est la fausse notification de colis classique.',
  reasons: ['Frais réclamés par SMS.'],
  actions: ['Ne cliquez pas.'],
  url_analysis: null,
  request_id: 'e58ed763-928c-4155-bee9-fdbaaadc15f3',
};

describe('detectChannel', () => {
  it.each(['marie@exemple.fr', 'MARIE@Exemple.FR'])('reconnaît un e-mail : %s', (value) => {
    expect(detectChannel(value)).toBe('email');
  });

  it.each(['0612345678', '+33 6 12 34 56 78', '06.12.34.56.78'])(
    'reconnaît un numéro : %s',
    (value) => {
      expect(detectChannel(value)).toBe('phone');
    },
  );

  it.each(['', '   ', 'marie', 'pas-un-email@', '123'])('rejette : %s', (value) => {
    expect(detectChannel(value)).toBeNull();
  });
});

describe('firstName', () => {
  it('extrait le prénom', () => {
    expect(firstName('Marie Dupont')).toBe('Marie');
    expect(firstName('  Léa  ')).toBe('Léa');
  });
});

describe('buildAdviceMessage', () => {
  it('contient le verdict, le résumé, la catégorie et la question', () => {
    const message = buildAdviceMessage(SCAM);
    expect(message).toContain('Arnaque très probable');
    expect(message).toContain('C’est la fausse notification de colis classique.');
    expect(message).toContain('Faux avis de colis');
    expect(message).toContain('Qu’en penses-tu ?');
  });

  it('n’inclut JAMAIS le contenu original, les raisons, les actions ni la confiance', () => {
    const message = buildAdviceMessage(SCAM);
    expect(message).not.toContain('Frais réclamés par SMS.');
    expect(message).not.toContain('Ne cliquez pas.');
    expect(message).not.toMatch(/0[.,]93|93\s?%/);
  });

  it('omet la catégorie quand elle vaut AUCUNE', () => {
    const message = buildAdviceMessage({ ...SCAM, category: 'AUCUNE' });
    expect(message).not.toContain('Type d’arnaque possible');
  });
});

describe('buildContactUrl', () => {
  it('compose un SMS pré-adressé, séparateur ? sur Android', () => {
    const url = buildContactUrl({ channel: 'phone', value: '06 12 34 56 78' }, 'Bonjour', 'android');
    expect(url).toBe(`sms:0612345678?body=${encodeURIComponent('Bonjour')}`);
  });

  it('compose un SMS pré-adressé, séparateur & sur iOS', () => {
    const url = buildContactUrl({ channel: 'phone', value: '0612345678' }, 'Bonjour', 'ios');
    expect(url).toBe(`sms:0612345678&body=${encodeURIComponent('Bonjour')}`);
  });

  it('compose un e-mail pré-adressé avec objet et corps', () => {
    const url = buildContactUrl({ channel: 'email', value: 'marie@exemple.fr' }, 'Bonjour', 'ios');
    expect(url).toContain('mailto:marie@exemple.fr?subject=');
    expect(url).toContain(`body=${encodeURIComponent('Bonjour')}`);
  });
});
