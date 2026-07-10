import { arnaqueEnDirect } from './definitions/arnaque-en-direct';
import { avantDePayer } from './definitions/avant-de-payer';
import { donnerUnCode } from './definitions/donner-un-code';
import type { ParcoursDefinition } from './types';

/**
 * Catalogue des parcours proactifs. Ajouter un parcours (« Avant de cliquer »…)
 * revient à créer sa définition et à l'inscrire ici.
 */
export const PARCOURS: readonly ParcoursDefinition[] = [
  donnerUnCode,
  avantDePayer,
  arnaqueEnDirect,
];

export function getParcours(id: string): ParcoursDefinition | undefined {
  return PARCOURS.find((parcours) => parcours.id === id);
}

/** Parcours annoncés mais pas encore disponibles (affichés en « bientôt »). */
export const UPCOMING_PARCOURS = [
  'Avant de cliquer',
  'Je ne sais pas si je peux faire confiance',
] as const;
