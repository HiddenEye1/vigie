import type { AnalyzeResponse } from '@vigie/shared';
import { analyzeResponseSchema, apiErrorSchema } from '@vigie/shared';
import Constants from 'expo-constants';

/** Catégories d'échec réseau, pour adapter l'écran d'erreur. */
export type ApiFailureKind =
  'network' | 'rate_limited' | 'service_unavailable' | 'invalid_request' | 'unknown';

/** Messages de repli (l'API renvoie déjà ses messages en français : prioritaires). */
const FALLBACK_MESSAGES: Record<ApiFailureKind, string> = {
  network: 'Connexion impossible. Vérifiez votre accès à Internet, puis réessayez.',
  rate_limited:
    'Vous avez atteint le nombre maximal de vérifications pour le moment. Merci de réessayer un peu plus tard.',
  service_unavailable:
    'Le service d’analyse est momentanément indisponible. Merci de réessayer dans quelques instants.',
  invalid_request:
    'Votre demande n’a pas pu être traitée. Vérifiez le contenu envoyé, puis réessayez.',
  unknown: 'Une erreur inattendue est survenue. Merci de réessayer.',
};

/** Échec d'appel API : `userMessage` est toujours affichable tel quel. */
export class ApiFailure extends Error {
  constructor(
    readonly kind: ApiFailureKind,
    readonly userMessage: string,
  ) {
    super(userMessage);
    this.name = 'ApiFailure';
  }
}

/** Erreur prête à afficher : message + nature (pour l'icône/titre de l'ErrorView). */
export interface ApiErrorInfo {
  readonly message: string;
  readonly kind: ApiFailureKind;
}

/**
 * Normalise n'importe quelle erreur en `ApiErrorInfo`. Conserve les messages
 * actuels : le message utilisateur d'une `ApiFailure`, sinon le repli générique.
 */
export function toApiError(error: unknown): ApiErrorInfo {
  if (error instanceof ApiFailure) {
    return { message: error.userMessage, kind: error.kind };
  }
  return { message: FALLBACK_MESSAGES.unknown, kind: 'unknown' };
}

/**
 * URL de base de l'API :
 * 1. EXPO_PUBLIC_API_URL si définie (apps/mobile/.env) ;
 * 2. en dev, l'IP de la machine qui sert le bundler (le téléphone en Expo Go
 *    ne peut pas joindre « localhost ») ;
 * 3. localhost en dernier recours.
 */
export function apiBaseUrl(): string {
  // Le typage Expo de process.env est `any` : on le referme immédiatement.
  const env = process.env as Record<string, string | undefined>;
  const fromEnv = env.EXPO_PUBLIC_API_URL;
  if (fromEnv) {
    return fromEnv.replace(/\/+$/, '');
  }
  const hostUri = Constants.expoConfig?.hostUri;
  const host = hostUri?.split(':')[0];
  if (host) {
    return `http://${host}:3000`;
  }
  return 'http://localhost:3000';
}

const TIMEOUT_MS = 30_000;

/** Image compressée prête à l'envoi (flux F2). */
export interface ImageUpload {
  readonly uri: string;
  readonly mimeType: string;
}

/** Analyse d'un texte collé (F1). */
export function analyzeText(
  content: string,
  deviceId: string,
  fetchFn: typeof fetch = fetch,
): Promise<AnalyzeResponse> {
  return postAnalyze(
    {
      body: JSON.stringify({ kind: 'text', content, device_id: deviceId }),
      headers: { 'content-type': 'application/json' },
    },
    fetchFn,
  );
}

/** Analyse d'un lien (F3). */
export function analyzeUrl(
  content: string,
  deviceId: string,
  fetchFn: typeof fetch = fetch,
): Promise<AnalyzeResponse> {
  return postAnalyze(
    {
      body: JSON.stringify({ kind: 'url', content, device_id: deviceId }),
      headers: { 'content-type': 'application/json' },
    },
    fetchFn,
  );
}

/** Analyse d'une capture d'écran (F2) — envoi multipart, jamais stockée (§8.1). */
export function analyzeImage(
  image: ImageUpload,
  deviceId: string,
  fetchFn: typeof fetch = fetch,
): Promise<AnalyzeResponse> {
  const form = new FormData();
  form.append('kind', 'image');
  form.append('device_id', deviceId);
  // Objet fichier React Native { uri, name, type } — typé Blob côté DOM.
  form.append('image', {
    uri: image.uri,
    name: 'capture.jpg',
    type: image.mimeType,
  } as unknown as Blob);
  return postAnalyze({ body: form }, fetchFn);
}

async function postAnalyze(
  init: { body: BodyInit; headers?: Record<string, string> },
  fetchFn: typeof fetch,
): Promise<AnalyzeResponse> {
  const response = await requestOrNetworkFailure(
    `${apiBaseUrl()}/v1/analyze`,
    { method: 'POST', ...init },
    fetchFn,
  );
  if (!response.ok) {
    throw await failureFromResponse(response);
  }
  const body: unknown = await response.json().catch(() => null);
  const parsed = analyzeResponseSchema.safeParse(body);
  if (!parsed.success) {
    // La réponse serveur ne respecte pas le contrat : on n'affiche jamais
    // un verdict douteux.
    throw new ApiFailure('unknown', FALLBACK_MESSAGES.unknown);
  }
  return parsed.data;
}

/** Inscription à la waitlist « Bouclier famille » (F8). */
export async function joinWaitlist(
  email: string,
  deviceId: string,
  fetchFn: typeof fetch = fetch,
): Promise<void> {
  const response = await requestOrNetworkFailure(
    `${apiBaseUrl()}/v1/waitlist`,
    {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ email, device_id: deviceId }),
    },
    fetchFn,
  );
  if (!response.ok) {
    throw await failureFromResponse(response);
  }
}

/**
 * Événement produit anonyme (§12) — best-effort : un échec ne doit jamais
 * perturber l'utilisateur, il est silencieusement ignoré.
 */
export async function sendShareEvent(
  deviceId: string,
  fetchFn: typeof fetch = fetch,
): Promise<void> {
  try {
    await fetchFn(`${apiBaseUrl()}/v1/event`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ name: 'share_verdict', device_id: deviceId }),
    });
  } catch {
    // silencieux volontairement
  }
}

async function requestOrNetworkFailure(
  url: string,
  init: RequestInit,
  fetchFn: typeof fetch,
): Promise<Response> {
  const controller = new AbortController();
  const timer = setTimeout(() => {
    controller.abort();
  }, TIMEOUT_MS);
  try {
    return await fetchFn(url, { ...init, signal: controller.signal });
  } catch {
    throw new ApiFailure('network', FALLBACK_MESSAGES.network);
  } finally {
    clearTimeout(timer);
  }
}

async function failureFromResponse(response: Response): Promise<ApiFailure> {
  const kind: ApiFailureKind =
    response.status === 429
      ? 'rate_limited'
      : response.status === 503
        ? 'service_unavailable'
        : response.status === 400 || response.status === 413
          ? 'invalid_request'
          : 'unknown';

  const body: unknown = await response.json().catch(() => null);
  const parsed = apiErrorSchema.safeParse(body);
  const message = parsed.success ? parsed.data.error.message : FALLBACK_MESSAGES[kind];
  return new ApiFailure(kind, message);
}
