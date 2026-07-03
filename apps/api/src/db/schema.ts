import { integer, pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core';

/**
 * La base ne sert QUE la waitlist, la télémétrie anonyme et le cache d'URL (§5).
 * Aucun contenu analysé n'est jamais stocké (§9).
 */

/** Waitlist « Bouclier famille » (F8) — e-mail normalisé + date de consentement (§9.4). */
export const waitlist = pgTable('waitlist', {
  email: text('email').primaryKey(),
  deviceId: uuid('device_id').notNull(),
  consentAt: timestamp('consent_at', { withTimezone: true }).notNull().defaultNow(),
});

/** Télémétrie minimale (§9.3) : strictement ces colonnes, rien d'autre. */
export const telemetry = pgTable('telemetry', {
  requestId: uuid('request_id').primaryKey(),
  deviceId: uuid('device_id').notNull(),
  kind: text('kind').notNull(),
  verdict: text('verdict').notNull(),
  category: text('category').notNull(),
  latencyMs: integer('latency_ms').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
});

/** Événements produit comptés côté backend (§12). */
export const events = pgTable('events', {
  id: integer('id').primaryKey().generatedAlwaysAsIdentity(),
  deviceId: uuid('device_id').notNull(),
  name: text('name').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
});

/** Cache de l'âge des domaines (RDAP est lent et limité en débit). */
export const urlCache = pgTable('url_cache', {
  domain: text('domain').primaryKey(),
  domainAgeDays: integer('domain_age_days'),
  checkedAt: timestamp('checked_at', { withTimezone: true }).notNull().defaultNow(),
});
