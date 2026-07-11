import { donnerUnCode } from './donner-un-code';
import type { ParcoursAnswers } from '../types';

/** Chemin serein de référence : je saisis le code moi-même, sans pression. */
const SAFE: ParcoursAnswers = {
  qui: 'site-moi',
  comment: 'saisir-moi',
  urgence: 'non',
  secret: 'non',
  direct: 'non',
};

describe('parcours « Avant de donner un code »', () => {
  it('expose un id, un titre et des questions', () => {
    expect(donnerUnCode.id).toBe('donner-un-code');
    expect(donnerUnCode.title.length).toBeGreaterThan(0);
    expect(donnerUnCode.questions.length).toBeGreaterThanOrEqual(3);
  });

  it('chaque question a des options aux identifiants uniques', () => {
    for (const question of donnerUnCode.questions) {
      const ids = question.options.map((option) => option.id);
      expect(new Set(ids).size).toBe(ids.length);
      expect(ids.length).toBeGreaterThanOrEqual(2);
    }
  });

  it('DANGER dès qu’on demande de dicter le code (décisif), sans autre signal', () => {
    expect(donnerUnCode.evaluate({ ...SAFE, comment: 'dicter' }).level).toBe('DANGER');
  });

  it('DANGER dès qu’on demande de transférer le code', () => {
    expect(donnerUnCode.evaluate({ ...SAFE, comment: 'transferer' }).level).toBe('DANGER');
  });

  it('DANGER par cumul : banque + urgence', () => {
    expect(donnerUnCode.evaluate({ ...SAFE, qui: 'banque', urgence: 'oui' }).level).toBe('DANGER');
  });

  it('PRUDENCE pour un seul signal moyen (un proche qui demande)', () => {
    expect(donnerUnCode.evaluate({ ...SAFE, qui: 'proche' }).level).toBe('PRUDENCE');
  });

  it('OK sur le chemin serein : je saisis moi-même, sans pression', () => {
    expect(donnerUnCode.evaluate(SAFE).level).toBe('OK');
  });

  it('donne toujours un titre, une action à éviter et une action recommandée', () => {
    for (const comment of ['dicter', 'saisir-moi'] as const) {
      const outcome = donnerUnCode.evaluate({ ...SAFE, comment });
      expect(outcome.title.length).toBeGreaterThan(0);
      expect(outcome.doNot.length).toBeGreaterThan(0);
      expect(outcome.doInstead.length).toBeGreaterThan(0);
    }
  });
});
