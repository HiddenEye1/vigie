import { z } from 'zod';

/** Niveaux de risque du verdict (§4.2 du cahier des charges). */
export const VERDICT_LEVELS = ['ARNAQUE_PROBABLE', 'SUSPECT', 'PLUTOT_SUR', 'INDETERMINE'] as const;

export const verdictLevelSchema = z.enum(VERDICT_LEVELS);
export type VerdictLevel = z.infer<typeof verdictLevelSchema>;

/** Catégories d'arnaque (§6 du cahier des charges). */
export const SCAM_CATEGORIES = [
  'FAUX_CONSEILLER_BANCAIRE',
  'PHISHING_COLIS',
  'PHISHING_ADMINISTRATION',
  'ARNAQUE_PETITES_ANNONCES',
  'ARNAQUE_SENTIMENTALE',
  'FAUX_SUPPORT_TECHNIQUE',
  'INVESTISSEMENT_FRAUDULEUX',
  'FAUX_SITE_ECOMMERCE',
  'CHANTAGE_SEXTORSION',
  'ARNAQUE_EMPLOI',
  'FRAUDE_CPF_AIDES',
  'SMISHING_AUTRE',
  'AUTRE',
  'AUCUNE',
] as const;

export const scamCategorySchema = z.enum(SCAM_CATEGORIES);
export type ScamCategory = z.infer<typeof scamCategorySchema>;

/** Résultat de l'analyse technique d'URL (§8.3) — null tant que kind !== "url". */
export const urlAnalysisSchema = z.object({
  final_url: z.string().min(1),
  domain_age_days: z.number().int().nonnegative().nullable(),
  https: z.boolean(),
  redirects: z.number().int().nonnegative(),
});
export type UrlAnalysis = z.infer<typeof urlAnalysisSchema>;

/** Réponse 200 de POST /v1/analyze — contrat §6. */
export const analyzeResponseSchema = z.object({
  verdict: verdictLevelSchema,
  confidence: z.number().min(0).max(1),
  category: scamCategorySchema,
  summary: z.string().min(1),
  reasons: z.array(z.string().min(1)).min(1).max(6),
  actions: z.array(z.string().min(1)).min(1).max(6),
  url_analysis: urlAnalysisSchema.nullable(),
  request_id: z.uuid(),
});
export type AnalyzeResponse = z.infer<typeof analyzeResponseSchema>;

/** Format d'erreur commun de l'API : le message est affichable tel quel dans l'UI. */
export const apiErrorSchema = z.object({
  error: z.object({
    code: z.string().min(1),
    message: z.string().min(1),
  }),
});
export type ApiError = z.infer<typeof apiErrorSchema>;
