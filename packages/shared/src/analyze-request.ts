import { z } from 'zod';

/** Types d'entrée acceptés par POST /v1/analyze (§6). */
export const ANALYZE_KINDS = ['text', 'image', 'url'] as const;
export const analyzeKindSchema = z.enum(ANALYZE_KINDS);
export type AnalyzeKind = z.infer<typeof analyzeKindSchema>;

/** UUID anonyme généré à l'installation de l'app — seul identifiant (§9). */
export const deviceIdSchema = z.uuid();

/** Longueur maximale d'un texte soumis à l'analyse. */
export const ANALYZE_CONTENT_MAX_LENGTH = 10_000;

/** Requête d'analyse d'un texte collé (F1). */
export const analyzeTextRequestSchema = z.object({
  kind: z.literal('text'),
  content: z.string().trim().min(1).max(ANALYZE_CONTENT_MAX_LENGTH),
  device_id: deviceIdSchema,
});
export type AnalyzeTextRequest = z.infer<typeof analyzeTextRequestSchema>;
