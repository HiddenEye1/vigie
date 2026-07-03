import { scamCategorySchema, verdictLevelSchema } from '@vigie/shared';
import { z } from 'zod';

import type { AIVerdict } from './provider.js';

/**
 * Schéma strict de la réponse JSON attendue du modèle (§7).
 * Toute réponse non conforme déclenche un retry, puis le repli INDETERMINE.
 */
export const aiVerdictSchema = z.object({
  verdict: verdictLevelSchema,
  confidence: z.number().min(0).max(1),
  category: scamCategorySchema,
  summary: z.string().min(1).max(400),
  reasons: z.array(z.string().min(1).max(600)).min(1).max(6),
  actions: z.array(z.string().min(1).max(600)).min(1).max(6),
});

/** Repli imposé par le §7 quand le modèle ne produit pas de JSON valide après retry. */
export const INDETERMINE_FALLBACK: AIVerdict = {
  verdict: 'INDETERMINE',
  confidence: 0,
  category: 'AUCUNE',
  summary: 'Je n’ai pas réussi à analyser ce contenu.',
  reasons: ['L’analyse automatique n’a pas donné de résultat exploitable pour ce contenu.'],
  actions: [
    'Réessayez dans quelques instants.',
    'En cas de doute, ne cliquez sur aucun lien et contactez directement l’organisme concerné par ses canaux officiels.',
  ],
};

/**
 * Extrait et valide le JSON d'une réponse du modèle.
 * Tolère du texte autour de l'objet JSON (prose, balises de code).
 */
export function parseAIVerdict(text: string): AIVerdict | null {
  const start = text.indexOf('{');
  const end = text.lastIndexOf('}');
  if (start === -1 || end <= start) {
    return null;
  }
  let candidate: unknown;
  try {
    candidate = JSON.parse(text.slice(start, end + 1));
  } catch {
    return null;
  }
  const result = aiVerdictSchema.safeParse(candidate);
  return result.success ? result.data : null;
}
