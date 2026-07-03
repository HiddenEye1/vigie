import { randomUUID } from 'node:crypto';

import { getConnInfo } from '@hono/node-server/conninfo';
import type { AnalyzeResponse } from '@vigie/shared';
import { analyzeTextRequestSchema } from '@vigie/shared';
import { Hono } from 'hono';
import type { Context } from 'hono';
import { cors } from 'hono/cors';
import { secureHeaders } from 'hono/secure-headers';
import { z } from 'zod';

import type { AIProvider } from './ai/provider.js';
import { finalizeVerdict } from './ai/post-process.js';
import type { AppConfig } from './config.js';
import { API_MESSAGES } from './messages.js';
import type { RateLimiter } from './middleware/rate-limiter.js';

export interface AppDeps {
  readonly config: AppConfig;
  readonly provider: AIProvider;
  readonly rateLimiter: RateLimiter;
}

const kindOnlySchema = z.object({ kind: z.enum(['image', 'url']) });

function errorBody(code: string, message: string): { error: { code: string; message: string } } {
  return { error: { code, message } };
}

function clientIp(c: Context, trustProxy: boolean): string {
  if (trustProxy) {
    const forwarded = c.req.header('x-forwarded-for');
    const first = forwarded?.split(',')[0]?.trim();
    if (first) {
      return first;
    }
  }
  try {
    return getConnInfo(c).remote.address ?? 'unknown';
  } catch {
    // app.request() dans les tests n'a pas de socket sous-jacente.
    return 'unknown';
  }
}

export function createApp({ config, provider, rateLimiter }: AppDeps): Hono {
  const app = new Hono();

  app.use(secureHeaders());
  app.use(cors({ origin: config.CORS_ORIGIN }));

  app.get('/v1/health', (c) => c.json({ status: 'ok', service: 'vigie-api' }));

  app.post('/v1/analyze', async (c) => {
    let body: unknown;
    try {
      body = await c.req.json();
    } catch {
      return c.json(errorBody('INVALID_JSON', API_MESSAGES.invalidRequest), 400);
    }

    const parsed = analyzeTextRequestSchema.safeParse(body);
    if (!parsed.success) {
      // kind image/url : contrat prévu (§6) mais livré en Phase 2 → message dédié.
      if (kindOnlySchema.safeParse(body).success) {
        return c.json(errorBody('KIND_NOT_AVAILABLE', API_MESSAGES.kindNotAvailableYet), 400);
      }
      return c.json(errorBody('INVALID_REQUEST', API_MESSAGES.invalidRequest), 400);
    }

    const { content, device_id: deviceId, kind } = parsed.data;

    const ip = clientIp(c, config.TRUST_PROXY);
    if (!rateLimiter.consume([`device:${deviceId}`, `ip:${ip}`])) {
      return c.json(errorBody('RATE_LIMITED', API_MESSAGES.rateLimited), 429);
    }

    const requestId = randomUUID();
    const startedAt = Date.now();

    let verdict;
    try {
      verdict = await provider.analyze({ kind, content });
    } catch {
      return c.json(errorBody('AI_UNAVAILABLE', API_MESSAGES.aiUnavailable), 503);
    }

    const finalVerdict = finalizeVerdict(verdict, { kind, content });
    const latencyMs = Date.now() - startedAt;

    // Journal sans aucun contenu utilisateur (§9) : identifiants techniques uniquement.
    console.log(
      JSON.stringify({
        request_id: requestId,
        kind,
        verdict: finalVerdict.verdict,
        category: finalVerdict.category,
        latency_ms: latencyMs,
      }),
    );

    const response: AnalyzeResponse = {
      verdict: finalVerdict.verdict,
      confidence: finalVerdict.confidence,
      category: finalVerdict.category,
      summary: finalVerdict.summary,
      reasons: [...finalVerdict.reasons],
      actions: [...finalVerdict.actions],
      url_analysis: null,
      request_id: requestId,
    };
    return c.json(response, 200);
  });

  app.notFound((c) => c.json(errorBody('NOT_FOUND', API_MESSAGES.notFound), 404));

  app.onError((error, c) => {
    console.error(JSON.stringify({ error: error.name, message: error.message }));
    return c.json(errorBody('INTERNAL_ERROR', API_MESSAGES.aiUnavailable), 500);
  });

  return app;
}
