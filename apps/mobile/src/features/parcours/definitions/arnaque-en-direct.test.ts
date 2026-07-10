import { arnaqueEnDirect } from './arnaque-en-direct';

describe('parcours d’urgence « Arnaque en direct »', () => {
  it('est un parcours de type urgence, avec id et titre', () => {
    expect(arnaqueEnDirect.kind).toBe('emergency');
    expect(arnaqueEnDirect.id).toBe('arnaque-en-direct');
    expect(arnaqueEnDirect.title.length).toBeGreaterThan(0);
  });

  it('affiche des consignes immédiates non vides', () => {
    expect(arnaqueEnDirect.immediateSteps.length).toBeGreaterThanOrEqual(5);
    for (const step of arnaqueEnDirect.immediateSteps) {
      expect(step.length).toBeGreaterThan(0);
    }
  });

  it('propose des situations aux identifiants uniques', () => {
    const ids = arnaqueEnDirect.situations.map((situation) => situation.id);
    expect(new Set(ids).size).toBe(ids.length);
    expect(ids.length).toBeGreaterThanOrEqual(5);
  });

  it('couvre les situations clés', () => {
    const ids = arnaqueEnDirect.situations.map((situation) => situation.id);
    for (const expected of [
      'au-telephone',
      'donne-code',
      'envoye-argent',
      'clique-lien',
      'installe-app',
      'donne-banque',
      'je-ne-sais-pas',
    ]) {
      expect(ids).toContain(expected);
    }
  });

  it('chaque situation a un titre et des actions prioritaires non vides', () => {
    for (const situation of arnaqueEnDirect.situations) {
      expect(situation.heading.length).toBeGreaterThan(0);
      expect(situation.actions.length).toBeGreaterThanOrEqual(3);
      for (const action of situation.actions) {
        expect(action.length).toBeGreaterThan(0);
      }
    }
  });
});
