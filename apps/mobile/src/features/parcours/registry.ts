import { arnaqueEnDirect } from './definitions/arnaque-en-direct';
import { avantDeCliquer } from './definitions/avant-de-cliquer';
import { avantDePayer } from './definitions/avant-de-payer';
import { donnerUnCode } from './definitions/donner-un-code';
import { faireConfiance } from './definitions/faire-confiance';
import type { ParcoursDefinition } from './types';

/**
 * Catalogue des parcours proactifs. Ajouter un parcours revient à créer sa
 * définition et à l'inscrire ici.
 */
export const PARCOURS: readonly ParcoursDefinition[] = [
  donnerUnCode,
  avantDePayer,
  avantDeCliquer,
  arnaqueEnDirect,
  faireConfiance,
];

export function getParcours(id: string): ParcoursDefinition | undefined {
  return PARCOURS.find((parcours) => parcours.id === id);
}

/** Parcours annoncés mais pas encore disponibles (affichés en « bientôt »). */
export const UPCOMING_PARCOURS: readonly string[] = [];
