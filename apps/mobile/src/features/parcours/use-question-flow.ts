import { useState } from 'react';

import type { ParcoursAnswers, ParcoursQuestion } from './types';

export interface QuestionFlow {
  readonly answers: ParcoursAnswers;
  readonly index: number;
  readonly total: number;
  readonly finished: boolean;
  /** Question courante, ou undefined si terminé. */
  readonly current: ParcoursQuestion | undefined;
  readonly answer: (optionId: string) => void;
  /** Revenir à la question précédente (undefined sur la première). */
  readonly back: (() => void) | undefined;
  readonly restart: () => void;
}

/**
 * Boucle de questions partagée par les parcours (questionnaire et orientation) :
 * pose les questions une à une, mémorise les réponses en LOCAL, gère le retour
 * en arrière et le recommencement. Aucune donnée n'est envoyée.
 */
export function useQuestionFlow(questions: readonly ParcoursQuestion[]): QuestionFlow {
  const [answers, setAnswers] = useState<ParcoursAnswers>({});
  const [index, setIndex] = useState(0);
  const [finished, setFinished] = useState(false);

  const answer = (optionId: string): void => {
    const question = questions[index];
    if (question === undefined) {
      return;
    }
    setAnswers((previous) => ({ ...previous, [question.id]: optionId }));
    if (index + 1 >= questions.length) {
      setFinished(true);
    } else {
      setIndex(index + 1);
    }
  };

  const restart = (): void => {
    setAnswers({});
    setIndex(0);
    setFinished(false);
  };

  return {
    answers,
    index,
    total: questions.length,
    finished,
    current: questions[index],
    answer,
    back: index > 0 ? () => { setIndex(index - 1); } : undefined,
    restart,
  };
}
