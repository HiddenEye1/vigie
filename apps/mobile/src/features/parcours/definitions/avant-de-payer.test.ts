import { avantDePayer } from './avant-de-payer';
import type { ParcoursAnswers } from '../types';

/** Chemin serein de référence : je paie moi-même, moyen connu, sans pression. */
const SAFE: ParcoursAnswers = {
  qui: 'moi',
  moyen: 'connu',
  deplacer: 'non',
  remboursement: 'non',
  urgence: 'non',
  secret: 'non',
  'nouveau-numero': 'non',
};

describe('parcours « Avant de payer »', () => {
  it('expose un id, un titre et des questions', () => {
    expect(avantDePayer.id).toBe('avant-de-payer');
    expect(avantDePayer.title.length).toBeGreaterThan(0);
    expect(avantDePayer.questions.length).toBeGreaterThanOrEqual(5);
  });

  it('chaque question a des options aux identifiants uniques', () => {
    for (const question of avantDePayer.questions) {
      const ids = question.options.map((option) => option.id);
      expect(new Set(ids).size).toBe(ids.length);
      expect(ids.length).toBeGreaterThanOrEqual(2);
    }
  });

  describe('DANGER', () => {
    it('paiement par coupon PCS/carte cadeau (décisif), sans autre signal', () => {
      expect(avantDePayer.evaluate({ ...SAFE, moyen: 'coupon' }).level).toBe('DANGER');
    });

    it('faux conseiller : déplacer son argent sur un autre compte (décisif)', () => {
      expect(avantDePayer.evaluate({ ...SAFE, deplacer: 'oui' }).level).toBe('DANGER');
    });

    it('proche depuis un nouveau numéro', () => {
      expect(
        avantDePayer.evaluate({ ...SAFE, qui: 'proche', 'nouveau-numero': 'oui' }).level,
      ).toBe('DANGER');
    });

    it('urgence + virement vers un compte inconnu', () => {
      expect(
        avantDePayer.evaluate({ ...SAFE, moyen: 'virement-inconnu', urgence: 'oui' }).level,
      ).toBe('DANGER');
    });

    it('« payez puis vous serez remboursé » à un inconnu', () => {
      expect(avantDePayer.evaluate({ ...SAFE, qui: 'inconnu', remboursement: 'oui' }).level).toBe(
        'DANGER',
      );
    });

    it('crypto demandé par un inconnu', () => {
      expect(avantDePayer.evaluate({ ...SAFE, qui: 'inconnu', moyen: 'crypto' }).level).toBe(
        'DANGER',
      );
    });
  });

  describe('PRUDENCE', () => {
    it('acompte à un inconnu, seul', () => {
      expect(avantDePayer.evaluate({ ...SAFE, qui: 'inconnu-acompte' }).level).toBe('PRUDENCE');
    });

    it('un vendeur inconnu, sans autre signal', () => {
      expect(avantDePayer.evaluate({ ...SAFE, qui: 'inconnu' }).level).toBe('PRUDENCE');
    });
  });

  describe('OK et faux positifs', () => {
    it('paiement serein : je paie moi-même sur un site connu', () => {
      expect(avantDePayer.evaluate(SAFE).level).toBe('OK');
    });

    it('ne surclasse pas un proche connu qu’on rembourse normalement', () => {
      expect(avantDePayer.evaluate({ ...SAFE, qui: 'proche', moyen: 'connu' }).level).toBe('OK');
    });

    it('ne surclasse pas un achat habituel par carte sur un service connu', () => {
      expect(avantDePayer.evaluate({ ...SAFE, qui: 'moi', moyen: 'connu' }).level).toBe('OK');
    });
  });

  it('donne toujours un titre, une action à éviter et une action recommandée', () => {
    for (const moyen of ['coupon', 'connu'] as const) {
      const outcome = avantDePayer.evaluate({ ...SAFE, moyen });
      expect(outcome.title.length).toBeGreaterThan(0);
      expect(outcome.doNot.length).toBeGreaterThan(0);
      expect(outcome.doInstead.length).toBeGreaterThan(0);
    }
  });
});
