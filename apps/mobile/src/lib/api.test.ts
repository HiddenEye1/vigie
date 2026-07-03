import {
  analyzeImage,
  analyzeText,
  analyzeUrl,
  ApiFailure,
  joinWaitlist,
  sendShareEvent,
} from './api';

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

describe('analyzeUrl', () => {
  it('envoie kind=url et parse la réponse', async () => {
    const fetchMock = jest.fn(() => Promise.resolve(jsonResponse(VALID_RESPONSE)));
    const result = await analyzeUrl('https://site.example/', DEVICE_ID, fetchMock as typeof fetch);
    expect(result.verdict).toBe('ARNAQUE_PROBABLE');
    const [, init] = fetchMock.mock.calls[0] as unknown as [string, RequestInit];
    expect(JSON.parse(init.body as string)).toEqual({
      kind: 'url',
      content: 'https://site.example/',
      device_id: DEVICE_ID,
    });
  });
});

describe('analyzeImage', () => {
  it('envoie un multipart avec kind, device_id et le fichier', async () => {
    const fetchMock = jest.fn(() => Promise.resolve(jsonResponse(VALID_RESPONSE)));
    await analyzeImage(
      { uri: 'file:///tmp/capture.jpg', mimeType: 'image/jpeg' },
      DEVICE_ID,
      fetchMock as typeof fetch,
    );
    const [url, init] = fetchMock.mock.calls[0] as unknown as [string, RequestInit];
    expect(url).toContain('/v1/analyze');
    const form = init.body as FormData;
    expect(form.get('kind')).toBe('image');
    expect(form.get('device_id')).toBe(DEVICE_ID);
    expect(form.get('image')).toBeTruthy();
  });

  it('413 → invalid_request avec message affichable', async () => {
    const failure = await analyzeImage(
      { uri: 'file:///tmp/capture.jpg', mimeType: 'image/jpeg' },
      DEVICE_ID,
      fetchReturning(
        jsonResponse({ error: { code: 'IMAGE_TOO_LARGE', message: 'Image trop lourde.' } }, 413),
      ),
    ).catch((e: unknown) => e);
    expect((failure as ApiFailure).kind).toBe('invalid_request');
    expect((failure as ApiFailure).userMessage).toBe('Image trop lourde.');
  });
});

describe('joinWaitlist', () => {
  it('réussit sur 201', async () => {
    await expect(
      joinWaitlist('a@exemple.fr', DEVICE_ID, fetchReturning(jsonResponse({ status: 'ok' }, 201))),
    ).resolves.toBeUndefined();
  });

  it('propage le message serveur en cas d’erreur', async () => {
    const failure = await joinWaitlist(
      'a@exemple.fr',
      DEVICE_ID,
      fetchReturning(
        jsonResponse(
          { error: { code: 'SERVICE_UNAVAILABLE', message: 'Service indisponible.' } },
          503,
        ),
      ),
    ).catch((e: unknown) => e);
    expect((failure as ApiFailure).kind).toBe('service_unavailable');
  });
});

describe('sendShareEvent', () => {
  it('n’échoue jamais, même sans réseau (best-effort §12)', async () => {
    const failingFetch = jest.fn(() =>
      Promise.reject(new Error('ECONNREFUSED')),
    ) as unknown as typeof fetch;
    await expect(sendShareEvent(DEVICE_ID, failingFetch)).resolves.toBeUndefined();
  });

  it('envoie le bon événement', async () => {
    const fetchMock = jest.fn(() => Promise.resolve(new Response(null, { status: 204 })));
    await sendShareEvent(DEVICE_ID, fetchMock as typeof fetch);
    const [url, init] = fetchMock.mock.calls[0] as unknown as [string, RequestInit];
    expect(url).toContain('/v1/event');
    expect(JSON.parse(init.body as string)).toEqual({
      name: 'share_verdict',
      device_id: DEVICE_ID,
    });
  });
});
