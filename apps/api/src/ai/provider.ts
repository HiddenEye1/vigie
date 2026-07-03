import type { ScamCategory, VerdictLevel } from '@vigie/shared';

/**
 * Entrée d'analyse normalisée. Phase 1 : texte uniquement.
 * (Phase 2 ajoutera l'image et l'URL avec son analyse technique §8.3.)
 */
export interface AnalyzeInput {
  readonly kind: 'text';
  readonly content: string;
}

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
