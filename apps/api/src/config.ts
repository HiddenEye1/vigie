import { z } from 'zod';

const booleanEnv = z.enum(['true', 'false']).transform((value) => value === 'true');

const envSchema = z.object({
  PORT: z.coerce.number().int().positive().default(3000),
  /**
   * true (défaut en dev) : /v1/analyze n'appelle jamais l'API Anthropic et
   * répond via MockProvider. false : AnthropicProvider (clé API obligatoire).
   */
  MOCK_AI: booleanEnv.default(true),
  ANTHROPIC_API_KEY: z.string().optional(),
  ANTHROPIC_MODEL: z.string().min(1).default('claude-sonnet-4-6'),
  RATE_LIMIT_PER_HOUR: z.coerce.number().int().positive().default(10),
  RATE_LIMIT_PER_DAY: z.coerce.number().int().positive().default(30),
  CORS_ORIGIN: z.string().min(1).default('http://localhost:8081'),
  /** true uniquement derrière un proxy de confiance (Fly.io/Railway) : lit X-Forwarded-For. */
  TRUST_PROXY: booleanEnv.default(false),
  /** Optionnelle en dev : sans base, l'analyse fonctionne, waitlist/événements → 503. */
  DATABASE_URL: z.string().optional(),
  /** Dossier des migrations SQL, relatif au répertoire de lancement. */
  MIGRATIONS_DIR: z.string().min(1).default('migrations'),
});

export type AppConfig = z.infer<typeof envSchema>;

export function loadConfig(env: Record<string, string | undefined> = process.env): AppConfig {
  const config = envSchema.parse(env);
  if (!config.MOCK_AI && !config.ANTHROPIC_API_KEY) {
    throw new Error(
      'MOCK_AI=false exige ANTHROPIC_API_KEY dans les variables d’environnement (voir .env.example).',
    );
  }
  return config;
}
