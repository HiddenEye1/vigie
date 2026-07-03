import type { AnalyzeKind, VerdictLevel, ScamCategory } from '@vigie/shared';

import type { DomainAgeCache } from '../url/url-analyzer.js';

/** Ligne de télémétrie anonyme (§9.3) — jamais de contenu utilisateur. */
export interface TelemetryRow {
  readonly requestId: string;
  readonly deviceId: string;
  readonly kind: AnalyzeKind;
  readonly verdict: VerdictLevel;
  readonly category: ScamCategory;
  readonly latencyMs: number;
}

export interface WaitlistRepository {
  /** Ajout idempotent (dédoublonnage silencieux sur l'e-mail normalisé). */
  add(email: string, deviceId: string): Promise<void>;
}

export interface TelemetryRepository {
  record(row: TelemetryRow): Promise<void>;
}

export interface EventRepository {
  add(name: string, deviceId: string): Promise<void>;
}

export interface Repositories {
  readonly waitlist: WaitlistRepository;
  readonly telemetry: TelemetryRepository;
  readonly events: EventRepository;
  readonly domainAgeCache: DomainAgeCache;
}

/** Levée quand la base est requise mais indisponible → HTTP 503. */
export class DatabaseUnavailableError extends Error {
  constructor(cause?: unknown) {
    super('Base de données indisponible.');
    this.name = 'DatabaseUnavailableError';
    this.cause = cause;
  }
}

/**
 * Dépôts « dégradés » quand aucune base n'est joignable (dev sans Postgres) :
 * l'analyse fonctionne (télémétrie silencieusement ignorée), la waitlist et
 * les événements répondent 503 avec un message clair.
 */
export function createUnavailableRepositories(): Repositories {
  return {
    waitlist: {
      add: () => Promise.reject(new DatabaseUnavailableError()),
    },
    telemetry: {
      record: () => Promise.resolve(),
    },
    events: {
      add: () => Promise.reject(new DatabaseUnavailableError()),
    },
    domainAgeCache: {
      get: () => Promise.resolve(undefined),
      set: () => Promise.resolve(),
    },
  };
}

/** Dépôts en mémoire pour les tests. */
export interface MemoryRepositories extends Repositories {
  readonly state: {
    waitlist: Map<string, { deviceId: string }>;
    telemetry: TelemetryRow[];
    events: { name: string; deviceId: string }[];
    domainAges: Map<string, number | null>;
  };
}

export function createMemoryRepositories(): MemoryRepositories {
  const state: MemoryRepositories['state'] = {
    waitlist: new Map(),
    telemetry: [],
    events: [],
    domainAges: new Map(),
  };
  return {
    state,
    waitlist: {
      add: (email, deviceId) => {
        if (!state.waitlist.has(email)) {
          state.waitlist.set(email, { deviceId });
        }
        return Promise.resolve();
      },
    },
    telemetry: {
      record: (row) => {
        state.telemetry.push(row);
        return Promise.resolve();
      },
    },
    events: {
      add: (name, deviceId) => {
        state.events.push({ name, deviceId });
        return Promise.resolve();
      },
    },
    domainAgeCache: {
      get: (domain) => Promise.resolve(state.domainAges.get(domain)),
      set: (domain, ageDays) => {
        state.domainAges.set(domain, ageDays);
        return Promise.resolve();
      },
    },
  };
}
