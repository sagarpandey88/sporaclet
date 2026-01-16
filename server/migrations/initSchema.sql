
 DROP TABLE IF EXISTS "public"."predictions" CASCADE;
 DROP TABLE IF EXISTS "public"."events" CASCADE;
 DROP TABLE IF EXISTS "public"."_prisma_migrations" CASCADE;
 DROP TYPE IF EXISTS "public"."ConfidenceLevel";
    DROP TYPE IF EXISTS "public"."EventStatus";
    DROP TYPE IF EXISTS "public"."InjurySeverity";
    DROP TYPE IF EXISTS "public"."InjuryStatus";
    DROP TYPE IF EXISTS "public"."WinnerType";


-- Custom enum types
CREATE TYPE "ConfidenceLevel" AS ENUM ('low', 'medium', 'high');
CREATE TYPE "EventStatus" AS ENUM ('upcoming', 'live', 'completed', 'postponed', 'cancelled');
CREATE TYPE "InjurySeverity" AS ENUM ('minor', 'moderate', 'major', 'season_ending');
CREATE TYPE "InjuryStatus" AS ENUM ('active', 'recovered', 'day_to_day');
CREATE TYPE "WinnerType" AS ENUM ('home', 'away', 'draw');

-- Extensions
CREATE EXTENSION IF NOT EXISTS plpgsql;
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- Schemas
--CREATE SCHEMA public;

-- Tables
CREATE TABLE "public"."events" (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    "externalId" character varying(255) NOT NULL,
    "eventName" character varying(255) NOT NULL,
    date timestamp without time zone NOT NULL,
    status "EventStatus" DEFAULT 'upcoming'::"EventStatus" NOT NULL,
    venue character varying(255),
    league character varying(255),
    season character varying(50),
    winner "WinnerType",
    description text,
    sport character varying(255) NOT NULL,
    "homeTeam" jsonb,
    "awayTeam" jsonb,
    "homeTeamPlayers" jsonb,
    "awayTeamPlayers" jsonb,
    injuries jsonb,
    "headToHead" jsonb,
    "homeTeamSnapshot" jsonb,
    "awayTeamSnapshot" jsonb,
    "isDeleted" boolean DEFAULT false NOT NULL,
    "createdAt" timestamp without time zone DEFAULT now() NOT NULL,
    "updatedAt" timestamp without time zone DEFAULT now() NOT NULL,
    CONSTRAINT events_pkey PRIMARY KEY (id),
    CONSTRAINT events_externalId_key UNIQUE ("externalId")
);

CREATE TABLE "public"."predictions" (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    "eventId" uuid NOT NULL,
    probabilities jsonb NOT NULL,
    "predictedWinner" "WinnerType" NOT NULL,
    confidence "ConfidenceLevel" NOT NULL,
    "keyFactors" jsonb NOT NULL,
    "modelVersion" character varying(50) NOT NULL,
    "generatedAt" timestamp without time zone DEFAULT now() NOT NULL,
    "isAccurate" boolean,
    "accuracyNote" text,
    "createdAt" timestamp without time zone DEFAULT now() NOT NULL,
    "updatedAt" timestamp without time zone DEFAULT now() NOT NULL,
    CONSTRAINT predictions_eventId_fkey FOREIGN KEY ("eventId") REFERENCES events(id) ON DELETE CASCADE,
    CONSTRAINT predictions_pkey PRIMARY KEY (id),
    CONSTRAINT predictions_eventId_key UNIQUE ("eventId")
);

-- Indexes
CREATE UNIQUE INDEX events_pkey_key ON public.events USING btree (id);
CREATE UNIQUE INDEX "events_externalId_key" ON public.events USING btree ("externalId");
CREATE UNIQUE INDEX predictions_pkey_key ON public.predictions USING btree (id);
CREATE UNIQUE INDEX "predictions_eventId_key" ON public.predictions USING btree ("eventId");
CREATE INDEX "events_externalId_idx" ON public.events USING btree ("externalId");
CREATE INDEX events_status_idx ON public.events USING btree (status);
CREATE INDEX events_date_status_idx ON public.events USING btree (date, status);
CREATE INDEX events_status_date_idx ON public.events USING btree (status, date);
CREATE INDEX "events_eventName_idx" ON public.events USING btree ("eventName");
CREATE INDEX events_league_idx ON public.events USING btree (league);
CREATE INDEX events_sport_idx ON public.events USING gin (sport gin_trgm_ops);
CREATE INDEX "predictions_eventId_idx" ON public.predictions USING btree ("eventId");
CREATE INDEX "predictions_generatedAt_idx" ON public.predictions USING btree ("generatedAt");
CREATE INDEX "predictions_isAccurate_idx" ON public.predictions USING btree ("isAccurate");

-- Grants
GRANT USAGE, CREATE ON SCHEMA public TO sporaclet;
GRANT USAGE, CREATE ON SCHEMA public TO PUBLIC;

-- Ownership
ALTER TABLE "public"."events" OWNER TO sporaclet;
ALTER TABLE "public"."predictions" OWNER TO sporaclet;
ALTER SCHEMA public OWNER TO sporaclet;