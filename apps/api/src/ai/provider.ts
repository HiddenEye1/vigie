import type { ImageMimeType, ScamCategory, VerdictLevel } from '@vigie/shared';

import type { UrlSignals } from '../url/url-analyzer.js';

/** Image transmise au modèle vision — jamais écrite sur disque, jamais stockée (§8.1). */
export interface ImagePayload {
  readonly mediaType: ImageMimeType;
  readonly base64: string;
}

/** Entrée d'analyse normalisée : texte collé, URL (avec signaux §8.3) ou capture d'écran. */
export type AnalyzeInput =
  | { readonly kind: 'text'; readonly content: string }
  | { readonly kind: 'url'; readonly content: string; readonly urlSignals: UrlSignals }
  | { readonly kind: 'image'; readonly image: ImagePayload };

/** Verdict brut produit par un fournisseur d'IA, avant post-traitement serveur. */
export interface AIVerdict {
  readonly verdict: VerdictLevel;
  readonly confidence: number;
  readonly category: ScamCategory;
  readonly summary: string;
  readonly reasons: readonly string[];
  readonly actions: readonly string[];
}

/**
 * Abstraction du moteur d'analyse IA. Deux implémentations :
 * - MockProvider (MOCK_AI=true) : verdicts réalistes sans appel réseau ;
 * - AnthropicProvider (MOCK_AI=false) : appel au modèle via l'API Anthropic.
 * Permet de brancher un autre fournisseur sans toucher au reste du code.
 */
export interface AIProvider {
  analyze(input: AnalyzeInput): Promise<AIVerdict>;
}

/** Levée quand le fournisseur d'IA est injoignable ou en erreur → HTTP 503. */
export class AIUnavailableError extends Error {
  constructor(cause?: unknown) {
    super('Le fournisseur d’analyse IA est indisponible.');
    this.name = 'AIUnavailableError';
    this.cause = cause;
  }
}
