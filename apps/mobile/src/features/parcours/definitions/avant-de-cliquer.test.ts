import { avantDeCliquer } from './avant-de-cliquer';
import type { ParcoursAnswers } from '../types';

/** Chemin serein de référence : je vais moi-même sur le site, juste consulter. */
const SAFE: ParcoursAnswers = {
  qui: 'moi',
  demande: 'lecture',
  telecharger: 'non',
  appel: 'non',
  urgence: 'non',
  'lien-bizarre': 'non',
  qr: 'non',
};

describe('parcours « Avant de cliquer »', () => {
  it('expose un id, un titre, des questions et un bouton d’analyse du lien', () => {
    expect(avantDeCliquer.id).toBe('avant-de-cliquer');
    expect(avantDeCliquer.title.length).toBeGreaterThan(0);
    expect(avantDeCliquer.questions.length).toBeGreaterThanOrEqual(5);
    expect(avantDeCliquer.analyze.route).toBe('/verifier-lien');
  });

  it('chaque question a des options aux identifiants uniques', () => {
    for (const question of avantDeCliquer.questions) {
      const ids = question.options.map((option) => option.id);
      expect(new Set(ids).size).toBe(ids.length);
      expect(ids.length).toBeGreaterThanOrEqual(2);
    }
  });

  describe('DANGER', () => {
    it('lien qui demande un code reçu par SMS (décisif)', () => {
      expect(avantDeCliquer.evaluate({ ...SAFE, demande: 'code' }).level).toBe('DANGER');
    });

    it('installer une application demandée par un conseiller/support (décisif)', () => {
      expect(avantDeCliquer.evaluate({ ...SAFE, telecharger: 'oui-conseiller' }).level).toBe(
        'DANGER',
      );
    });

    it('lien « de la banque/administration » + urgence', () => {
      expect(avantDeCliquer.evaluate({ ...SAFE, qui: 'organisme', urgence: 'oui' }).level).toBe(
        'DANGER',
      );
    });

    it('proche depuis un nouveau numéro + connexion', () => {
      expect(
        avantDeCliquer.evaluate({ ...SAFE, qui: 'proche-nouveau', demande: 'connexion' }).level,
      ).toBe('DANGER');
    });

    it('guidé au téléphone + installation d’application', () => {
      expect(avantDeCliquer.evaluate({ ...SAFE, appel: 'oui', telecharger: 'oui' }).level).toBe(
        'DANGER',
      );
    });
  });

  describe('PRUDENCE', () => {
    it('lien raccourci seul (pas panique)', () => {
      expect(avantDeCliquer.evaluate({ ...SAFE, 'lien-bizarre': 'oui' }).level).toBe('PRUDENCE');
    });

    it('lien d’un expéditeur inconnu, seul', () => {
      expect(avantDeCliquer.evaluate({ ...SAFE, qui: 'inconnu' }).level).toBe('PRUDENCE');
    });

    it('QR code trouvé + paiement reste prudent, pas critique', () => {
      expect(avantDeCliquer.evaluate({ ...SAFE, qr: 'oui', demande: 'paiement' }).level).toBe(
        'PRUDENCE',
      );
    });
  });

  describe('OK et faux positifs', () => {
    it('je vais moi-même sur le site, juste consulter', () => {
      expect(avantDeCliquer.evaluate(SAFE).level).toBe('OK');
    });

    it('un lien d’un proche habituel, juste pour lire', () => {
      expect(avantDeCliquer.evaluate({ ...SAFE, qui: 'proche' }).level).toBe('OK');
    });

    it('un QR code seul, sans paiement ni connexion', () => {
      expect(avantDeCliquer.evaluate({ ...SAFE, qr: 'oui' }).level).toBe('OK');
    });
  });

  it('donne toujours un titre, une action à éviter et une action recommandée', () => {
    for (const demande of ['code', 'lecture'] as const) {
      const outcome = avantDeCliquer.evaluate({ ...SAFE, demande });
      expect(outcome.title.length).toBeGreaterThan(0);
      expect(outcome.doNot.length).toBeGreaterThan(0);
      expect(outcome.doInstead.length).toBeGreaterThan(0);
    }
  });
});
