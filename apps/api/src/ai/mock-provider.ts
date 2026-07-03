import { MOCK_ROTATION, MOCK_RULES } from './mock-fixtures.js';
import type { AIProvider, AIVerdict, AnalyzeInput } from './provider.js';

/** Sous ce nombre de caractères, le mock répond INDETERMINE (contenu trop court). */
const SHORT_CONTENT_THRESHOLD = 15;

export interface MockProviderOptions {
  /** Latence simulée pour tester l'écran d'attente de l'app (0 dans les tests). */
  readonly delayMs?: number;
}

/**
 * Fournisseur factice (MOCK_AI=true) : aucun appel réseau, verdicts réalistes
 * et déterministes. Règles documentées dans le README (§ Mode mock).
 */
export class MockProvider implements AIProvider {
  private readonly delayMs: number;

  constructor(options: MockProviderOptions = {}) {
    this.delayMs = options.delayMs ?? 600;
  }

  async analyze(input: AnalyzeInput): Promise<AIVerdict> {
    if (this.delayMs > 0) {
      await new Promise((resolve) => setTimeout(resolve, this.delayMs));
    }

    const content = input.content.trim();
    if (content.length < SHORT_CONTENT_THRESHOLD) {
      return MOCK_ROTATION[3]; // INDETERMINE
    }

    for (const rule of MOCK_RULES) {
      if (rule.pattern.test(content)) {
        return rule.verdict;
      }
    }

    // Rotation déterministe : même contenu → même verdict, et les 4 états
    // de l'UI sont atteignables en variant le texte soumis.
    let hash = 0;
    for (let i = 0; i < content.length; i += 1) {
      hash = (hash * 31 + content.charCodeAt(i)) >>> 0;
    }
    const index = (hash % MOCK_ROTATION.length) as 0 | 1 | 2 | 3;
    return MOCK_ROTATION[index];
  }
}
