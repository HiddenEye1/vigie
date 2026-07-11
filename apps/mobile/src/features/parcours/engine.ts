import type { ParcoursAnswers, ParcoursQuestion } from './types';

export interface ScoreResult {
  /** Somme des poids des options choisies. */
  readonly score: number;
  /** Vrai si au moins une option décisive a été choisie. */
  readonly decisive: boolean;
}

/**
 * Moteur générique et pur, partagé par tous les parcours : additionne les poids
 * des réponses et signale toute réponse « décisive ». Chaque parcours transforme
 * ensuite ce score en verdict (voir les définitions).
 */
export function scoreAnswers(
  questions: readonly ParcoursQuestion[],
  answers: ParcoursAnswers,
): ScoreResult {
  let score = 0;
  let decisive = false;
  for (const question of questions) {
    const chosenId = answers[question.id];
    if (chosenId === undefined) {
      continue;
    }
    const option = question.options.find((candidate) => candidate.id === chosenId);
    if (option === undefined) {
      continue;
    }
    score += option.weight ?? 0;
    if (option.decisive === true) {
      decisive = true;
    }
  }
  return { score, decisive };
}

/** Vrai quand toutes les questions ont reçu une réponse. */
export function allAnswered(
  questions: readonly ParcoursQuestion[],
  answers: ParcoursAnswers,
): boolean {
  return questions.every((question) => answers[question.id] !== undefined);
}
