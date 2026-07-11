import { faireConfiance } from './faire-confiance';
import type { OrientationAction, ParcoursAnswers } from '../types';

function actions(answers: ParcoursAnswers): readonly OrientationAction[] {
  return faireConfiance.evaluate(answers).actions;
}

describe('parcours d’orientation « Je ne sais pas si je peux faire confiance »', () => {
  it('est un parcours d’orientation, rassurant', () => {
    expect(faireConfiance.kind).toBe('orientation');
    expect(faireConfiance.id).toBe('faire-confiance');
    expect(faireConfiance.evaluate({}).title).toBe('Vous avez raison de vérifier.');
  });

  it('chaque question a des options aux identifiants uniques', () => {
    for (const question of faireConfiance.questions) {
      const ids = question.options.map((option) => option.id);
      expect(new Set(ids).size).toBe(ids.length);
    }
  });

  describe('aiguillage', () => {
    it('un code → « Avant de donner un code » en premier', () => {
      const result = actions({ situation: 'code', pression: 'non', action: 'code' });
      expect(result[0]?.target).toEqual({ kind: 'parcours', id: 'donner-un-code' });
    });

    it('un paiement → « Avant de payer » en premier', () => {
      const result = actions({ situation: 'payer', pression: 'non', action: 'payer' });
      expect(result[0]?.target).toEqual({ kind: 'parcours', id: 'avant-de-payer' });
    });

    it('un lien → « Avant de cliquer », avec l’analyse de lien', () => {
      const result = actions({ situation: 'lien', pression: 'non', action: 'cliquer' });
      expect(result[0]?.target).toEqual({ kind: 'parcours', id: 'avant-de-cliquer' });
      expect(result.some((a) => a.target.kind === 'analyze' && a.target.route === '/verifier-lien')).toBe(
        true,
      );
    });

    it('un message → « Analyser le message » en premier', () => {
      const result = actions({ situation: 'message', pression: 'non', action: 'rien' });
      expect(result[0]?.target).toEqual({ kind: 'analyze', route: '/verifier-texte' });
    });

    it('au téléphone et sous pression → « Arnaque en direct » en premier', () => {
      const result = actions({ situation: 'telephone', pression: 'urgent', action: 'code' });
      expect(result[0]?.target).toEqual({ kind: 'parcours', id: 'arnaque-en-direct' });
    });

    it('doute général → analyser le message et demander à un proche', () => {
      const result = actions({ situation: 'sais-pas', pression: 'non', action: 'rien' });
      expect(result[0]?.target).toEqual({ kind: 'analyze', route: '/verifier-texte' });
      expect(result.some((a) => a.target.kind === 'ask-contact')).toBe(true);
    });
  });

  it('propose toujours de demander à un proche, sans doublon d’action', () => {
    const result = actions({ situation: 'code', pression: 'urgent', action: 'payer' });
    expect(result.some((a) => a.target.kind === 'ask-contact')).toBe(true);
    const keys = result.map((a) => JSON.stringify(a.target));
    expect(new Set(keys).size).toBe(keys.length);
  });
});
