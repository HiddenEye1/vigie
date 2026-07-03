import { analyzeResponseSchema, apiErrorSchema } from '@vigie/shared';
import { describe, expect, it } from 'vitest';

import type { AIProvider, AIVerdict } from './ai/provider.js';
import { AIUnavailableError } from './ai/provider.js';
import { createApp } from './app.js';
import { loadConfig } from './config.js';
import { API_MESSAGES } from './messages.js';
import { RateLimiter } from './middleware/rate-limiter.js';
import { INJECTION_SAMPLES } from './security/injection-guard.test.js';

const DEVICE_ID = 'e58ed763-928c-4155-bee9-fdbaaadc15f3';

const SAFE_VERDICT: AIVerdict = {
  verdict: 'PLUTOT_SUR',
  confidence: 0.9,
  category: 'AUCUNE',
  summary: 'Ce message ne présente aucun signal d’arnaque.',
  reasons: ['Aucun signal détecté.'],
  actions: ['Restez vigilant.'],
};

class StubProvider implements AIProvider {
  constructor(private readonly verdict: AIVerdict = SAFE_VERDICT) {}
  analyze(): Promise<AIVerdict> {
    return Promise.resolve(this.verdict);
  }
}

class FailingProvider implements AIProvider {
  analyze(): Promise<AIVerdict> {
    return Promise.reject(new AIUnavailableError());
  }
}

interface TestAppOptions {
  provider?: AIProvider;
  perHour?: number;
  perDay?: number;
}

function makeApp({
  provider = new StubProvider(),
  perHour = 100,
  perDay = 1000,
}: TestAppOptions = {}): ReturnType<typeof createApp> {
  const config = loadConfig({ MOCK_AI: 'true' });
  const rateLimiter = new RateLimiter({ perHour, perDay });
  return createApp({ config, provider, rateLimiter });
}

async function postAnalyze(app: ReturnType<typeof makeApp>, body: unknown): Promise<Response> {
  return app.request('/v1/analyze', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: typeof body === 'string' ? body : JSON.stringify(body),
  });
}

function textRequest(content: string, deviceId: string = DEVICE_ID): Record<string, unknown> {
  return { kind: 'text', content, device_id: deviceId };
}

describe('GET /v1/health', () => {
  it('répond 200', async () => {
    const res = await makeApp().request('/v1/health');
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ status: 'ok', service: 'vigie-api' });
  });
});

describe('POST /v1/analyze — cas nominal', () => {
  it('renvoie un verdict conforme au contrat §6', async () => {
    const res = await postAnalyze(makeApp(), textRequest('Bonjour, rendez-vous demain à 10h ?'));
    expect(res.status).toBe(200);

    const body: unknown = await res.json();
    const parsed = analyzeResponseSchema.parse(body);
    expect(parsed.verdict).toBe('PLUTOT_SUR');
    expect(parsed.url_analysis).toBeNull();
  });

  it('génère un request_id unique par appel', async () => {
    const app = makeApp();
    const first = analyzeResponseSchema.parse(
      await (await postAnalyze(app, textRequest('Premier message anodin.'))).json(),
    );
    const second = analyzeResponseSchema.parse(
      await (await postAnalyze(app, textRequest('Second message anodin.'))).json(),
    );
    expect(first.request_id).not.toBe(second.request_id);
  });

  it('dégrade le verdict en INDETERMINE quand confidence < 0.5 (§4.2)', async () => {
    const app = makeApp({
      provider: new StubProvider({ ...SAFE_VERDICT, verdict: 'SUSPECT', confidence: 0.35 }),
    });
    const res = await postAnalyze(app, textRequest('Message ambigu difficile à juger.'));
    const parsed = analyzeResponseSchema.parse(await res.json());
    expect(parsed.verdict).toBe('INDETERMINE');
  });
});

describe('POST /v1/analyze — entrées invalides (400)', () => {
  it.each([
    ['corps non JSON', '{pas du json'],
    ['contenu manquant', { kind: 'text', device_id: DEVICE_ID }],
    ['contenu vide', textRequest('   ')],
    ['contenu trop long', textRequest('a'.repeat(10_001))],
    ['device_id invalide', textRequest('Un message.', 'pas-un-uuid')],
    ['kind inconnu', { kind: 'audio', content: 'x', device_id: DEVICE_ID }],
  ])('rejette : %s', async (_label, body) => {
    const res = await postAnalyze(makeApp(), body);
    expect(res.status).toBe(400);
    const parsed = apiErrorSchema.parse(await res.json());
    expect(parsed.error.message.length).toBeGreaterThan(10);
  });

  it.each(['image', 'url'])('kind=%s → message « pas encore disponible »', async (kind) => {
    const res = await postAnalyze(makeApp(), {
      kind,
      content: 'https://exemple.fr',
      device_id: DEVICE_ID,
    });
    expect(res.status).toBe(400);
    const parsed = apiErrorSchema.parse(await res.json());
    expect(parsed.error.code).toBe('KIND_NOT_AVAILABLE');
    expect(parsed.error.message).toBe(API_MESSAGES.kindNotAvailableYet);
  });
});

describe('POST /v1/analyze — rate limiting (429)', () => {
  it('bloque au-delà de la limite horaire avec un message français', async () => {
    const app = makeApp({ perHour: 2, perDay: 10 });
    expect((await postAnalyze(app, textRequest('Message un.'))).status).toBe(200);
    expect((await postAnalyze(app, textRequest('Message deux.'))).status).toBe(200);

    const res = await postAnalyze(app, textRequest('Message trois.'));
    expect(res.status).toBe(429);
    const parsed = apiErrorSchema.parse(await res.json());
    expect(parsed.error.message).toBe(API_MESSAGES.rateLimited);
  });

  it('les requêtes invalides ne consomment pas le quota', async () => {
    const app = makeApp({ perHour: 1, perDay: 10 });
    await postAnalyze(app, textRequest('', DEVICE_ID)); // 400, non compté
    expect((await postAnalyze(app, textRequest('Message valide.'))).status).toBe(200);
  });
});

describe('POST /v1/analyze — IA indisponible (503)', () => {
  it('renvoie un message clair et réutilisable', async () => {
    const res = await postAnalyze(
      makeApp({ provider: new FailingProvider() }),
      textRequest('Un message.'),
    );
    expect(res.status).toBe(503);
    const parsed = apiErrorSchema.parse(await res.json());
    expect(parsed.error.message).toBe(API_MESSAGES.aiUnavailable);
  });
});

describe('POST /v1/analyze — suite anti-injection de bout en bout (§13)', () => {
  // Pire cas : le provider se laisse berner et répond PLUTOT_SUR avec une
  // confiance élevée. Le garde-fou serveur doit quand même corriger.
  it.each(INJECTION_SAMPLES.map((sample) => [sample.slice(0, 60), sample]))(
    'le verdict n’est jamais PLUTOT_SUR : « %s… »',
    async (_label, sample) => {
      const app = makeApp({ provider: new StubProvider(SAFE_VERDICT) });
      const res = await postAnalyze(app, textRequest(sample));
      expect(res.status).toBe(200);
      const parsed = analyzeResponseSchema.parse(await res.json());
      expect(parsed.verdict).not.toBe('PLUTOT_SUR');
    },
  );
});
