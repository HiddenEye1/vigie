import {
  MOCK_ROTATION,
  MOCK_URL_NO_HTTPS,
  MOCK_URL_OFFICIAL,
  MOCK_URL_YOUNG_DOMAIN,
} from './mock-fixtures.js';
import { MOCK_SCENARIOS } from './mock-scenarios.js';
import type { AIProvider, AIVerdict, AnalyzeInput } from './provider.js';

/** Sous ce nombre de caractères, le mock répond INDETERMINE (contenu trop court). */
const SHORT_CONTENT_THRESHOLD = 15;

/** En dessous de cet âge (jours), un domaine est considéré « jetable » par le mock. */
const YOUNG_DOMAIN_DAYS = 30;

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
    switch (input.kind) {
      case 'text':
        return this.analyzeText(input.content);
      case 'url':
        return this.analyzeUrl(input.content, input.urlSignals);
      case 'image':
        // Pas d'OCR côté mock : rotation déterministe sur la taille de l'image.
        return rotationVerdict(input.image.base64);
    }
  }

  private analyzeText(rawContent: string): AIVerdict {
    const content = rawContent.trim();
    if (content.length < SHORT_CONTENT_THRESHOLD) {
      return MOCK_ROTATION[3]; // INDETERMINE
    }
    for (const scenario of MOCK_SCENARIOS) {
      if (scenario.pattern.test(content)) {
        return scenario.verdict;
      }
    }
    return rotationVerdict(content);
  }

  private analyzeUrl(
    url: string,
    signals: { https: boolean; domainAgeDays: number | null; isOfficialDomain: boolean },
  ): AIVerdict {
    if (signals.isOfficialDomain) {
      return MOCK_URL_OFFICIAL;
    }
    if (signals.domainAgeDays !== null && signals.domainAgeDays < YOUNG_DOMAIN_DAYS) {
      return MOCK_URL_YOUNG_DOMAIN;
    }
    if (!signals.https) {
      return MOCK_URL_NO_HTTPS;
    }
    for (const scenario of MOCK_SCENARIOS) {
      if (scenario.pattern.test(url)) {
        return scenario.verdict;
      }
    }
    return rotationVerdict(url);
  }
}

/** Rotation déterministe : même contenu → même verdict, 4 états atteignables. */
function rotationVerdict(seed: string): AIVerdict {
  let hash = 0;
  for (let i = 0; i < seed.length; i += 1) {
    hash = (hash * 31 + seed.charCodeAt(i)) >>> 0;
  }
  const index = (hash % MOCK_ROTATION.length) as 0 | 1 | 2 | 3;
  return MOCK_ROTATION[index];
}
