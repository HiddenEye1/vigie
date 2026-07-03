import { serve } from '@hono/node-server';

// Charge le premier .env trouvé (local puis racine du monorepo), sans écraser
// les variables déjà définies. Aucun secret n'est jamais commité.
for (const envPath of ['.env', '../../.env']) {
  try {
    process.loadEnvFile(envPath);
    break;
  } catch {
    // fichier absent : on continue
  }
}

import { AnthropicProvider } from './ai/anthropic-provider.js';
import { MockProvider } from './ai/mock-provider.js';
import type { AIProvider } from './ai/provider.js';
import { createApp } from './app.js';
import { loadConfig } from './config.js';
import { connectDatabase, createDrizzleRepositories } from './db/client.js';
import type { Repositories } from './db/repositories.js';
import { createUnavailableRepositories } from './db/repositories.js';
import { RateLimiter } from './middleware/rate-limiter.js';
import { HttpUrlAnalyzer } from './url/url-analyzer.js';

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

let repositories: Repositories;
let databaseStatus: string;
if (config.DATABASE_URL) {
  try {
    const database = await connectDatabase(config.DATABASE_URL, config.MIGRATIONS_DIR);
    repositories = createDrizzleRepositories(database.db);
    databaseStatus = 'connectée (migrations appliquées)';
  } catch {
    repositories = createUnavailableRepositories();
    databaseStatus = 'INJOIGNABLE — analyse OK, waitlist/événements en 503';
  }
} else {
  repositories = createUnavailableRepositories();
  databaseStatus = 'non configurée (DATABASE_URL absente)';
}

const urlAnalyzer = new HttpUrlAnalyzer({ domainAgeCache: repositories.domainAgeCache });

const app = createApp({ config, provider, rateLimiter, repositories, urlAnalyzer });

serve({ fetch: app.fetch, port: config.PORT }, (info) => {
  console.log(
    [
      `Vigie API démarrée sur http://localhost:${String(info.port)}`,
      `mode IA : ${config.MOCK_AI ? 'MOCK (aucun appel Anthropic)' : `Anthropic (${config.ANTHROPIC_MODEL})`}`,
      `base de données : ${databaseStatus}`,
    ].join(' — '),
  );
});
