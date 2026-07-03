import { serve } from '@hono/node-server';

import { AnthropicProvider } from './ai/anthropic-provider.js';
import { MockProvider } from './ai/mock-provider.js';
import type { AIProvider } from './ai/provider.js';
import { createApp } from './app.js';
import { loadConfig } from './config.js';
import { RateLimiter } from './middleware/rate-limiter.js';

const config = loadConfig();

const provider: AIProvider = config.MOCK_AI
  ? new MockProvider()
  : new AnthropicProvider({
      // loadConfig garantit la présence de la clé quand MOCK_AI=false.
      apiKey: config.ANTHROPIC_API_KEY ?? '',
      model: config.ANTHROPIC_MODEL,
    });

const rateLimiter = new RateLimiter({
  perHour: config.RATE_LIMIT_PER_HOUR,
  perDay: config.RATE_LIMIT_PER_DAY,
});

const app = createApp({ config, provider, rateLimiter });

serve({ fetch: app.fetch, port: config.PORT }, (info) => {
  console.log(
    `Vigie API démarrée sur http://localhost:${String(info.port)} — mode IA : ${config.MOCK_AI ? 'MOCK (aucun appel Anthropic)' : `Anthropic (${config.ANTHROPIC_MODEL})`}`,
  );
});
