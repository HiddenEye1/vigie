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

/** Requête d'analyse d'une URL (F3) — http(s) uniquement, le reste est refusé. */
export const analyzeUrlRequestSchema = z.object({
  kind: z.literal('url'),
  content: z
    .string()
    .trim()
    .min(1)
    .max(2_048)
    // N'ajoute https:// que si AUCUN schéma n'est présent (ftp:// etc. doivent échouer, pas être réécrits).
    .transform((value) => (/^[a-z][a-z0-9+.-]*:/i.test(value) ? value : `https://${value}`))
    .pipe(z.url({ protocol: /^https?$/ })),
  device_id: deviceIdSchema,
});
export type AnalyzeUrlRequest = z.infer<typeof analyzeUrlRequestSchema>;

/** Contraintes d'image (F2) : jpeg/png/webp, 8 Mo max (§6). */
export const IMAGE_MAX_BYTES = 8 * 1024 * 1024;
export const IMAGE_ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp'] as const;
export type ImageMimeType = (typeof IMAGE_ALLOWED_MIME_TYPES)[number];

/** Inscription à la waitlist « Bouclier famille » (F8) — validation e-mail stricte. */
export const waitlistRequestSchema = z.object({
  email: z.string().trim().toLowerCase().pipe(z.email()).pipe(z.string().max(254)),
  device_id: deviceIdSchema,
});
export type WaitlistRequest = z.infer<typeof waitlistRequestSchema>;

/** Événements produit comptés côté backend (§12). */
export const EVENT_NAMES = ['share_verdict'] as const;
export const eventRequestSchema = z.object({
  name: z.enum(EVENT_NAMES),
  device_id: deviceIdSchema,
});
export type EventRequest = z.infer<typeof eventRequestSchema>;
