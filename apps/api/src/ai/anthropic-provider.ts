import Anthropic from '@anthropic-ai/sdk';

import type { AIProvider, AIVerdict, AnalyzeInput } from './provider.js';
import { AIUnavailableError } from './provider.js';
import {
  buildUserMessage,
  describeUrlSignals,
  IMAGE_USER_MESSAGE,
  RETRY_NUDGE,
  SYSTEM_PROMPT,
} from './system-prompt.js';
import { INDETERMINE_FALLBACK, parseAIVerdict } from './verdict-schema.js';

/** Signature minimale injectable pour les tests (l'appel SDK est mocké). */
export type CreateMessageFn = (
  params: Anthropic.MessageCreateParamsNonStreaming,
) => Promise<Anthropic.Message>;

export interface AnthropicProviderOptions {
  readonly apiKey: string;
  readonly model: string;
  /** Injection pour les tests ; par défaut, le client officiel @anthropic-ai/sdk. */
  readonly createMessage?: CreateMessageFn;
}

/**
 * Fournisseur réel : appelle le modèle via l'API Anthropic (backend uniquement).
 * Sortie JSON stricte validée par Zod ; 1 retry en cas de JSON invalide,
 * sinon repli INDETERMINE (§7).
 */
export class AnthropicProvider implements AIProvider {
  private readonly model: string;
  private readonly createMessage: CreateMessageFn;

  constructor(options: AnthropicProviderOptions) {
    this.model = options.model;
    if (options.createMessage) {
      this.createMessage = options.createMessage;
    } else {
      const client = new Anthropic({ apiKey: options.apiKey });
      this.createMessage = (params) => client.messages.create(params);
    }
  }

  async analyze(input: AnalyzeInput): Promise<AIVerdict> {
    const messages: Anthropic.MessageParam[] = [
      { role: 'user', content: buildInitialContent(input) },
    ];

    for (let attempt = 0; attempt < 2; attempt += 1) {
      let response: Anthropic.Message;
      try {
        response = await this.createMessage({
          model: this.model,
          max_tokens: 1024,
          // Température basse : une app anti-arnaque doit être constante et
          // rigoureuse, pas créative. Le même message doit donner le même
          // verdict d'un appel à l'autre (reproductibilité > diversité).
          temperature: 0.2,
          system: SYSTEM_PROMPT,
          messages,
        });
      } catch (error) {
        throw new AIUnavailableError(error);
      }

      const text = response.content
        .filter((block): block is Anthropic.TextBlock => block.type === 'text')
        .map((block) => block.text)
        .join('');

      const verdict = parseAIVerdict(text);
      if (verdict) {
        return verdict;
      }
      messages.push({ role: 'user', content: RETRY_NUDGE });
    }

    return INDETERMINE_FALLBACK;
  }
}

/**
 * Construit le contenu du premier message selon le type d'entrée.
 * L'image est transmise en bloc vision, traitée en mémoire uniquement (§8.1).
 */
function buildInitialContent(input: AnalyzeInput): string | Anthropic.ContentBlockParam[] {
  switch (input.kind) {
    case 'text':
      return buildUserMessage('text', input.content);
    case 'url':
      return buildUserMessage('url', input.content, describeUrlSignals(input.urlSignals));
    case 'image':
      return [
        {
          type: 'image',
          source: {
            type: 'base64',
            media_type: input.image.mediaType,
            data: input.image.base64,
          },
        },
        { type: 'text', text: IMAGE_USER_MESSAGE },
      ];
  }
}
