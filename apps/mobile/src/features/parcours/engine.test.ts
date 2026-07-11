import { allAnswered, scoreAnswers } from './engine';
import type { ParcoursQuestion } from './types';

const QUESTIONS: readonly ParcoursQuestion[] = [
  {
    id: 'a',
    title: 'A',
    options: [
      { id: 'x', label: 'X', weight: 2 },
      { id: 'y', label: 'Y', weight: 0 },
    ],
  },
  {
    id: 'b',
    title: 'B',
    options: [
      { id: 'd', label: 'D', weight: 0, decisive: true },
      { id: 'n', label: 'N', weight: 1 },
    ],
  },
];

describe('scoreAnswers', () => {
  it('additionne les poids des options choisies', () => {
    expect(scoreAnswers(QUESTIONS, { a: 'x', b: 'n' })).toEqual({ score: 3, decisive: false });
  });

  it('repère une option décisive', () => {
    expect(scoreAnswers(QUESTIONS, { a: 'y', b: 'd' }).decisive).toBe(true);
  });

  it('ignore une réponse inconnue ou manquante', () => {
    expect(scoreAnswers(QUESTIONS, { a: 'inconnue' })).toEqual({ score: 0, decisive: false });
  });
});

describe('allAnswered', () => {
  it('faux tant qu’une question n’a pas de réponse', () => {
    expect(allAnswered(QUESTIONS, { a: 'x' })).toBe(false);
  });

  it('vrai quand toutes les questions ont une réponse', () => {
    expect(allAnswered(QUESTIONS, { a: 'x', b: 'n' })).toBe(true);
  });
});
