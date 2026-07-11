import type { AnalyzeResponse } from '@vigie/shared';

import {
  buildAdviceMessage,
  buildContactUrl,
  buildHelpMessage,
  detectChannel,
  firstName,
} from './messages';

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
  it('salue le proche par son prénom, pose une question claire et signe', () => {
    const message = buildAdviceMessage(SCAM, 'Marie');
    expect(message).toContain('Bonjour Marie,');
    expect(message).toContain('Qu’en penses-tu ?');
    expect(message).toContain('— Envoyé avec Vigie');
  });

  it('inclut le résumé de Vigie et la catégorie quand elle est connue', () => {
    const message = buildAdviceMessage(SCAM, 'Marie');
    expect(message).toContain('C’est la fausse notification de colis classique.');
    expect(message).toContain('Faux avis de colis');
  });

  it('omet la catégorie quand elle vaut AUCUNE', () => {
    const message = buildAdviceMessage({ ...SCAM, category: 'AUCUNE' }, 'Marie');
    expect(message).not.toContain('Type possible');
  });

  it('adapte le ton au niveau de verdict, sans jamais paniquer', () => {
    const danger = buildAdviceMessage(SCAM, 'Marie');
    expect(danger).toContain('je crois que c’est une arnaque');

    const sur = buildAdviceMessage({ ...SCAM, verdict: 'PLUTOT_SUR' }, 'Marie');
    expect(sur).toContain('Il a l’air normal');
    expect(sur).not.toContain('je crois que c’est une arnaque');
  });

  it('parle d’« un lien » quand l’analyse porte sur une URL, d’« un message » sinon', () => {
    const withUrl = buildAdviceMessage(
      {
        ...SCAM,
        url_analysis: {
          final_url: 'https://exemple.fr',
          domain_age_days: 10,
          https: true,
          redirects: 0,
        },
      },
      'Marie',
    );
    expect(withUrl).toContain('un lien');
    expect(buildAdviceMessage(SCAM, 'Marie')).toContain('un message');
  });

  it('n’inclut JAMAIS le contenu original, les raisons, les actions ni la confiance', () => {
    const message = buildAdviceMessage(SCAM, 'Marie');
    expect(message).not.toContain('Frais réclamés par SMS.');
    expect(message).not.toContain('Ne cliquez pas.');
    expect(message).not.toMatch(/0[.,]93|93\s?%/);
  });
});

describe('buildHelpMessage', () => {
  it('salue par prénom et demande de l’aide sans prétendre à un verdict', () => {
    const message = buildHelpMessage('Marie');
    expect(message).toContain('Bonjour Marie,');
    expect(message).toContain('me dire ce que tu en penses ?');
    expect(message).toContain('— Envoyé avec Vigie');
    expect(message).not.toContain('Vigie pense que');
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
