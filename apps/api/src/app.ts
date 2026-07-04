import { Buffer } from 'node:buffer';
import { randomUUID } from 'node:crypto';

import { getConnInfo } from '@hono/node-server/conninfo';
import type { AnalyzeResponse, UrlAnalysis } from '@vigie/shared';
import {
  analyzeTextRequestSchema,
  analyzeUrlRequestSchema,
  deviceIdSchema,
  eventRequestSchema,
  IMAGE_MAX_BYTES,
  waitlistRequestSchema,
} from '@vigie/shared';
import { Hono } from 'hono';
import type { Context } from 'hono';
import { bodyLimit } from 'hono/body-limit';
import { cors } from 'hono/cors';
import { secureHeaders } from 'hono/secure-headers';
import { z } from 'zod';

import { finalizeVerdict } from './ai/post-process.js';
import type { AIProvider, AnalyzeInput } from './ai/provider.js';
import type { AppConfig } from './config.js';
import { DatabaseUnavailableError } from './db/repositories.js';
import type { Repositories } from './db/repositories.js';
import { API_MESSAGES } from './messages.js';
import { PRIVACY_POLICY_HTML } from './privacy.js';
import type { RateLimiter } from './middleware/rate-limiter.js';
import { sniffImageMimeType } from './security/image-validation.js';
import { BlockedUrlError } from './security/ssrf.js';
import type { UrlAnalyzer, UrlSignals } from './url/url-analyzer.js';

export interface AppDeps {
  readonly config: AppConfig;
  readonly provider: AIProvider;
  readonly rateLimiter: RateLimiter;
  readonly repositories: Repositories;
  readonly urlAnalyzer: UrlAnalyzer;
}

const kindProbeSchema = z.object({ kind: z.enum(['text', 'image', 'url']) });

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

export function createApp({
  config,
  provider,
  rateLimiter,
  repositories,
  urlAnalyzer,
}: AppDeps): Hono {
  const app = new Hono();

  app.use(secureHeaders());
  app.use(cors({ origin: config.CORS_ORIGIN }));

  app.get('/v1/health', (c) =>
    c.json({
      status: 'ok',
      service: 'vigie-api',
      // Permet au script d'évaluation de savoir si les verdicts sont réels.
      ai_mode: config.MOCK_AI ? 'mock' : 'anthropic',
    }),
  );

  // Politique de confidentialité (§9.5) — page statique en français clair.
  app.get('/privacy', (c) => c.html(PRIVACY_POLICY_HTML));

  app.post(
    '/v1/analyze',
    bodyLimit({
      maxSize: IMAGE_MAX_BYTES + 1024 * 1024, // marge d'encodage multipart
      onError: (c) => c.json(errorBody('IMAGE_TOO_LARGE', API_MESSAGES.imageTooLarge), 413),
    }),
    async (c) => {
      const contentType = c.req.header('content-type') ?? '';
      if (contentType.includes('multipart/form-data')) {
        return handleImageAnalyze(c);
      }
      return handleJsonAnalyze(c);
    },
  );

  /** Analyse texte ou URL (corps JSON). */
  async function handleJsonAnalyze(c: Context): Promise<Response> {
    let body: unknown;
    try {
      body = await c.req.json();
    } catch {
      return c.json(errorBody('INVALID_JSON', API_MESSAGES.invalidRequest), 400);
    }

    const probe = kindProbeSchema.safeParse(body);
    if (!probe.success) {
      return c.json(errorBody('INVALID_REQUEST', API_MESSAGES.invalidRequest), 400);
    }

    if (probe.data.kind === 'text') {
      const parsed = analyzeTextRequestSchema.safeParse(body);
      if (!parsed.success) {
        return c.json(errorBody('INVALID_REQUEST', API_MESSAGES.invalidRequest), 400);
      }
      if (!consumeQuota(c, parsed.data.device_id)) {
        return c.json(errorBody('RATE_LIMITED', API_MESSAGES.rateLimited), 429);
      }
      return runAnalysis(c, parsed.data.device_id, {
        kind: 'text',
        content: parsed.data.content,
      });
    }

    if (probe.data.kind === 'url') {
      const parsed = analyzeUrlRequestSchema.safeParse(body);
      if (!parsed.success) {
        return c.json(errorBody('INVALID_REQUEST', API_MESSAGES.invalidRequest), 400);
      }
      if (!consumeQuota(c, parsed.data.device_id)) {
        return c.json(errorBody('RATE_LIMITED', API_MESSAGES.rateLimited), 429);
      }
      let urlSignals: UrlSignals;
      try {
        urlSignals = await urlAnalyzer.analyze(parsed.data.content);
      } catch (error) {
        if (error instanceof BlockedUrlError) {
          return c.json(errorBody('URL_BLOCKED', API_MESSAGES.urlBlocked), 400);
        }
        throw error;
      }
      return runAnalysis(c, parsed.data.device_id, {
        kind: 'url',
        content: parsed.data.content,
        urlSignals,
      });
    }

    // kind === 'image' en JSON : l'image doit passer par multipart/form-data.
    return c.json(errorBody('INVALID_REQUEST', API_MESSAGES.invalidRequest), 400);
  }

  /** Analyse d'une capture d'écran (multipart). L'image reste en mémoire (§8.1). */
  async function handleImageAnalyze(c: Context): Promise<Response> {
    let form: Record<string, string | File>;
    try {
      form = await c.req.parseBody();
    } catch {
      return c.json(errorBody('INVALID_REQUEST', API_MESSAGES.invalidRequest), 400);
    }

    const deviceId = deviceIdSchema.safeParse(form.device_id);
    const image = form.image;
    if (form.kind !== 'image' || !deviceId.success || !(image instanceof File)) {
      return c.json(errorBody('INVALID_REQUEST', API_MESSAGES.invalidRequest), 400);
    }
    if (image.size > IMAGE_MAX_BYTES) {
      return c.json(errorBody('IMAGE_TOO_LARGE', API_MESSAGES.imageTooLarge), 413);
    }

    const bytes = new Uint8Array(await image.arrayBuffer());
    const mediaType = sniffImageMimeType(bytes);
    if (!mediaType) {
      return c.json(errorBody('IMAGE_INVALID', API_MESSAGES.imageInvalid), 400);
    }

    if (!consumeQuota(c, deviceId.data)) {
      return c.json(errorBody('RATE_LIMITED', API_MESSAGES.rateLimited), 429);
    }

    return runAnalysis(c, deviceId.data, {
      kind: 'image',
      image: { mediaType, base64: Buffer.from(bytes).toString('base64') },
    });
  }

  function consumeQuota(c: Context, deviceId: string): boolean {
    const ip = clientIp(c, config.TRUST_PROXY);
    return rateLimiter.consume([`device:${deviceId}`, `ip:${ip}`]);
  }

  /** Tronc commun : appel provider, garde-fous, télémétrie, réponse §6. */
  async function runAnalysis(c: Context, deviceId: string, input: AnalyzeInput): Promise<Response> {
    const requestId = randomUUID();
    const startedAt = Date.now();

    let verdict;
    try {
      verdict = await provider.analyze(input);
    } catch {
      return c.json(errorBody('AI_UNAVAILABLE', API_MESSAGES.aiUnavailable), 503);
    }

    const finalVerdict = finalizeVerdict(verdict, input);
    const latencyMs = Date.now() - startedAt;

    // Journal sans aucun contenu utilisateur (§9) : identifiants techniques uniquement.
    console.log(
      JSON.stringify({
        request_id: requestId,
        kind: input.kind,
        verdict: finalVerdict.verdict,
        category: finalVerdict.category,
        latency_ms: latencyMs,
      }),
    );

    // Télémétrie best-effort : ne bloque ni ne fait échouer l'analyse.
    repositories.telemetry
      .record({
        requestId,
        deviceId,
        kind: input.kind,
        verdict: finalVerdict.verdict,
        category: finalVerdict.category,
        latencyMs,
      })
      .catch((error: unknown) => {
        console.error(JSON.stringify({ warn: 'telemetry_failed', error: (error as Error).name }));
      });

    const urlAnalysis: UrlAnalysis | null =
      input.kind === 'url'
        ? {
            final_url: input.urlSignals.finalUrl,
            domain_age_days: input.urlSignals.domainAgeDays,
            https: input.urlSignals.https,
            redirects: input.urlSignals.redirects,
          }
        : null;

    const response: AnalyzeResponse = {
      verdict: finalVerdict.verdict,
      confidence: finalVerdict.confidence,
      category: finalVerdict.category,
      summary: finalVerdict.summary,
      reasons: [...finalVerdict.reasons],
      actions: [...finalVerdict.actions],
      url_analysis: urlAnalysis,
      request_id: requestId,
    };
    return c.json(response, 200);
  }

  app.post('/v1/waitlist', async (c) => {
    let body: unknown;
    try {
      body = await c.req.json();
    } catch {
      return c.json(errorBody('INVALID_JSON', API_MESSAGES.invalidRequest), 400);
    }
    const parsed = waitlistRequestSchema.safeParse(body);
    if (!parsed.success) {
      return c.json(errorBody('INVALID_REQUEST', API_MESSAGES.invalidRequest), 400);
    }
    try {
      await repositories.waitlist.add(parsed.data.email, parsed.data.device_id);
    } catch (error) {
      if (error instanceof DatabaseUnavailableError) {
        return c.json(errorBody('SERVICE_UNAVAILABLE', API_MESSAGES.serviceUnavailable), 503);
      }
      throw error;
    }
    return c.json({ status: 'ok' }, 201);
  });

  app.post('/v1/event', async (c) => {
    let body: unknown;
    try {
      body = await c.req.json();
    } catch {
      return c.json(errorBody('INVALID_JSON', API_MESSAGES.invalidRequest), 400);
    }
    const parsed = eventRequestSchema.safeParse(body);
    if (!parsed.success) {
      return c.json(errorBody('INVALID_REQUEST', API_MESSAGES.invalidRequest), 400);
    }
    try {
      await repositories.events.add(parsed.data.name, parsed.data.device_id);
    } catch (error) {
      if (error instanceof DatabaseUnavailableError) {
        return c.json(errorBody('SERVICE_UNAVAILABLE', API_MESSAGES.serviceUnavailable), 503);
      }
      throw error;
    }
    return c.body(null, 204);
  });

  app.notFound((c) => c.json(errorBody('NOT_FOUND', API_MESSAGES.notFound), 404));

  app.onError((error, c) => {
    console.error(JSON.stringify({ error: error.name, message: error.message }));
    return c.json(errorBody('INTERNAL_ERROR', API_MESSAGES.serviceUnavailable), 500);
  });

  return app;
}
