import { and, eq, gt, sql } from 'drizzle-orm';
import type { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { drizzle } from 'drizzle-orm/node-postgres';
import { migrate } from 'drizzle-orm/node-postgres/migrator';
import pg from 'pg';

import type { Repositories } from './repositories.js';
import { DatabaseUnavailableError } from './repositories.js';
import { events, telemetry, urlCache, waitlist } from './schema.js';

/** Durée de validité d'une entrée du cache d'âge de domaine. */
const URL_CACHE_TTL_MS = 24 * 60 * 60 * 1000;

export interface Database {
  readonly db: NodePgDatabase;
  readonly pool: pg.Pool;
  close(): Promise<void>;
}

/** Ouvre le pool, vérifie la connexion et applique les migrations SQL. */
export async function connectDatabase(
  databaseUrl: string,
  migrationsFolder: string,
): Promise<Database> {
  const pool = new pg.Pool({ connectionString: databaseUrl, max: 10 });
  const db = drizzle(pool);
  try {
    await pool.query('select 1');
    await migrate(db, { migrationsFolder });
  } catch (error) {
    await pool.end().catch(() => undefined);
    throw new DatabaseUnavailableError(error);
  }
  return { db, pool, close: () => pool.end() };
}

/** Dépôts Postgres (Drizzle). */
export function createDrizzleRepositories(db: NodePgDatabase): Repositories {
  return {
    waitlist: {
      async add(email, deviceId): Promise<void> {
        await db
          .insert(waitlist)
          .values({ email, deviceId })
          .onConflictDoNothing({ target: waitlist.email });
      },
    },
    telemetry: {
      async record(row): Promise<void> {
        await db.insert(telemetry).values({
          requestId: row.requestId,
          deviceId: row.deviceId,
          kind: row.kind,
          verdict: row.verdict,
          category: row.category,
          latencyMs: row.latencyMs,
        });
      },
    },
    events: {
      async add(name, deviceId): Promise<void> {
        await db.insert(events).values({ name, deviceId });
      },
    },
    domainAgeCache: {
      async get(domain): Promise<number | null | undefined> {
        const freshAfter = new Date(Date.now() - URL_CACHE_TTL_MS);
        const rows = await db
          .select({ age: urlCache.domainAgeDays })
          .from(urlCache)
          .where(and(eq(urlCache.domain, domain), gt(urlCache.checkedAt, freshAfter)))
          .limit(1);
        return rows.length > 0 ? (rows[0]?.age ?? null) : undefined;
      },
      async set(domain, ageDays): Promise<void> {
        await db
          .insert(urlCache)
          .values({ domain, domainAgeDays: ageDays })
          .onConflictDoUpdate({
            target: urlCache.domain,
            set: { domainAgeDays: ageDays, checkedAt: sql`now()` },
          });
      },
    },
  };
}
