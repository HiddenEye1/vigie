import { analyzeText, ApiFailure } from './api';

const DEVICE_ID = 'e58ed763-928c-4155-bee9-fdbaaadc15f3';

const VALID_RESPONSE = {
  verdict: 'ARNAQUE_PROBABLE',
  confidence: 0.9,
  category: 'PHISHING_COLIS',
  summary: 'Fausse notification de colis.',
  reasons: ['Frais réclamés par SMS.'],
  actions: ['Ne cliquez pas.', 'Transférez au 33700.'],
  url_analysis: null,
  request_id: '3c1f6f52-2f2e-4dd7-9e2f-6b6a8b9c0d1e',
};

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'content-type': 'application/json' },
  });
}

function fetchReturning(response: Response): typeof fetch {
  return jest.fn(() => Promise.resolve(response)) as typeof fetch;
}

describe('analyzeText', () => {
  it('parse une réponse valide', async () => {
    const result = await analyzeText(
      'Un message.',
      DEVICE_ID,
      fetchReturning(jsonResponse(VALID_RESPONSE)),
    );
    expect(result.verdict).toBe('ARNAQUE_PROBABLE');
    expect(result.request_id).toBe(VALID_RESPONSE.request_id);
  });

  it('429 → rate_limited avec le message serveur affichable', async () => {
    const serverMessage = 'Vous avez atteint le nombre maximal de vérifications pour le moment.';
    const failure = await analyzeText(
      'Un message.',
      DEVICE_ID,
      fetchReturning(
        jsonResponse({ error: { code: 'RATE_LIMITED', message: serverMessage } }, 429),
      ),
    ).catch((e: unknown) => e);
    expect(failure).toBeInstanceOf(ApiFailure);
    expect((failure as ApiFailure).kind).toBe('rate_limited');
    expect((failure as ApiFailure).userMessage).toBe(serverMessage);
  });

  it('503 → service_unavailable', async () => {
    const failure = await analyzeText(
      'Un message.',
      DEVICE_ID,
      fetchReturning(
        jsonResponse(
          { error: { code: 'AI_UNAVAILABLE', message: 'Service indisponible, réessayez.' } },
          503,
        ),
      ),
    ).catch((e: unknown) => e);
    expect((failure as ApiFailure).kind).toBe('service_unavailable');
  });

  it('400 → invalid_request', async () => {
    const failure = await analyzeText(
      'Un message.',
      DEVICE_ID,
      fetchReturning(
        jsonResponse({ error: { code: 'INVALID_REQUEST', message: 'Demande invalide.' } }, 400),
      ),
    ).catch((e: unknown) => e);
    expect((failure as ApiFailure).kind).toBe('invalid_request');
  });

  it('panne réseau → network avec message français', async () => {
    const failingFetch = jest.fn(() =>
      Promise.reject(new Error('ECONNREFUSED')),
    ) as unknown as typeof fetch;
    const failure = await analyzeText('Un message.', DEVICE_ID, failingFetch).catch(
      (e: unknown) => e,
    );
    expect((failure as ApiFailure).kind).toBe('network');
    expect((failure as ApiFailure).userMessage).toContain('Connexion impossible');
  });

  it('réponse 200 non conforme au contrat → unknown (jamais de verdict douteux)', async () => {
    const failure = await analyzeText(
      'Un message.',
      DEVICE_ID,
      fetchReturning(jsonResponse({ verdict: 'SUR_A_100%', confidence: 'haute' })),
    ).catch((e: unknown) => e);
    expect((failure as ApiFailure).kind).toBe('unknown');
  });

  it('erreur HTTP sans corps JSON → message de repli', async () => {
    const failure = await analyzeText(
      'Un message.',
      DEVICE_ID,
      fetchReturning(new Response('boom', { status: 500 })),
    ).catch((e: unknown) => e);
    expect(failure).toBeInstanceOf(ApiFailure);
    expect((failure as ApiFailure).userMessage.length).toBeGreaterThan(10);
  });

  it('envoie la requête au format §6', async () => {
    const fetchMock = jest.fn(() => Promise.resolve(jsonResponse(VALID_RESPONSE)));
    await analyzeText('Un message suspect.', DEVICE_ID, fetchMock as typeof fetch);
    const [url, init] = fetchMock.mock.calls[0] as unknown as [string, RequestInit];
    expect(url).toContain('/v1/analyze');
    expect(JSON.parse(init.body as string)).toEqual({
      kind: 'text',
      content: 'Un message suspect.',
      device_id: DEVICE_ID,
    });
  });
});
