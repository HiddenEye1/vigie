-- Vigie — schéma initial (Phase 2).
-- La base ne stocke QUE : waitlist, télémétrie anonyme, cache d'URL (§5, §9).
-- Migration écrite à la main : drizzle-kit a été écarté (dépendance esbuild vulnérable).

CREATE TABLE IF NOT EXISTS "waitlist" (
	"email" text PRIMARY KEY NOT NULL,
	"device_id" uuid NOT NULL,
	"consent_at" timestamp with time zone DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS "telemetry" (
	"request_id" uuid PRIMARY KEY NOT NULL,
	"device_id" uuid NOT NULL,
	"kind" text NOT NULL,
	"verdict" text NOT NULL,
	"category" text NOT NULL,
	"latency_ms" integer NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS "events" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
	"device_id" uuid NOT NULL,
	"name" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS "url_cache" (
	"domain" text PRIMARY KEY NOT NULL,
	"domain_age_days" integer,
	"checked_at" timestamp with time zone DEFAULT now() NOT NULL
);
