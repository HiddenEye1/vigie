import { riskLevelSchema, scamCategorySchema, verdictLevelSchema } from '@vigie/shared';
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

/**
 * Champs étendus (Phase 2) que le modèle PEUT désormais fournir directement.
 * Validation LENIENTE et indépendante de la base : chaque champ valide est
 * conservé, un champ absent OU invalide devient `undefined` (via `.catch`) —
 * jamais une raison de rejeter tout le verdict. Le post-traitement reste le
 * filet de sécurité : il dérive les champs manquants et les recalcule si un
 * garde-fou change le verdict final.
 */
const extendedFieldsSchema = z.object({
  risk_level: riskLevelSchema.optional().catch(undefined),
  score: z.number().int().min(0).max(100).optional().catch(undefined),
  senior_summary: z.string().trim().min(1).max(300).optional().catch(undefined),
  do_not: z.string().trim().min(1).max(200).optional().catch(undefined),
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
 *
 * La base est validée strictement (sinon retry / repli INDETERMINE). Les champs
 * étendus sont ensuite ajoutés au cas par cas : seuls ceux qui sont valides sont
 * conservés, ce qui évite de poser explicitement `undefined` (contrat
 * exactOptionalPropertyTypes) et laisse le post-traitement dériver le reste.
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
  const base = aiVerdictSchema.safeParse(candidate);
  if (!base.success) {
    return null;
  }
  const extras = extendedFieldsSchema.safeParse(candidate);
  const e = extras.success ? extras.data : {};
  return {
    ...base.data,
    ...(e.risk_level !== undefined ? { risk_level: e.risk_level } : {}),
    ...(e.score !== undefined ? { score: e.score } : {}),
    ...(e.senior_summary !== undefined ? { senior_summary: e.senior_summary } : {}),
    ...(e.do_not !== undefined ? { do_not: e.do_not } : {}),
  };
}
