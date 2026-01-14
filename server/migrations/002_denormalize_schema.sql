-- Migration: Denormalize Schema
-- Description: Reduce tables to just events and predictions with JSONB fields
-- Date: 2026-01-14

-- Drop existing tables and related constraints
DROP TABLE IF EXISTS "injuries" CASCADE;
DROP TABLE IF EXISTS "head_to_head" CASCADE;
DROP TABLE IF EXISTS "predictions" CASCADE;
DROP TABLE IF EXISTS "events" CASCADE;
DROP TABLE IF EXISTS "players" CASCADE;
DROP TABLE IF EXISTS "teams" CASCADE;
DROP TABLE IF EXISTS "sports" CASCADE;

-- Drop old triggers
DROP TRIGGER IF EXISTS update_sports_updated_at ON "sports";
DROP TRIGGER IF EXISTS update_teams_updated_at ON "teams";
DROP TRIGGER IF EXISTS update_players_updated_at ON "players";
DROP TRIGGER IF EXISTS update_events_updated_at ON "events";
DROP TRIGGER IF EXISTS update_predictions_updated_at ON "predictions";
DROP TRIGGER IF EXISTS update_injuries_updated_at ON "injuries";
DROP TRIGGER IF EXISTS update_head_to_head_updated_at ON "head_to_head";

-- Events table with denormalized data
CREATE TABLE "events" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "externalId" VARCHAR(255) UNIQUE NOT NULL,
    "eventName" VARCHAR(255) NOT NULL,
    "date" TIMESTAMP NOT NULL,
    "status" "EventStatus" NOT NULL DEFAULT 'upcoming',
    "venue" VARCHAR(255),
    "league" VARCHAR(255),
    "season" VARCHAR(50),
    "round" VARCHAR(50),
    "homeScore" INT,
    "awayScore" INT,
    "winner" "WinnerType",
    "attendance" INT,
    "description" TEXT,
    
    -- Denormalized sport data
    "sport" JSONB NOT NULL,
    
    -- Denormalized team/participant data
    "homeTeam" JSONB,
    "awayTeam" JSONB,
    "participant1" JSONB,
    "participant2" JSONB,
    
    -- Denormalized player data (for both teams if applicable)
    "homeTeamPlayers" JSONB,
    "awayTeamPlayers" JSONB,
    
    -- Denormalized injury data
    "injuries" JSONB,
    
    -- Denormalized head-to-head stats
    "headToHead" JSONB,
    
    -- Team snapshots (kept for historical accuracy)
    "homeTeamSnapshot" JSONB,
    "awayTeamSnapshot" JSONB,
    "snapshotGeneratedAt" TIMESTAMP,
    
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP NOT NULL DEFAULT NOW(),
    "updatedAt" TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Predictions table with one-to-one relationship to events
CREATE TABLE "predictions" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "eventId" UUID UNIQUE NOT NULL REFERENCES "events"("id") ON DELETE CASCADE,
    "probabilities" JSONB NOT NULL,
    "predictedWinner" "WinnerType" NOT NULL,
    "confidence" "ConfidenceLevel" NOT NULL,
    "keyFactors" JSONB NOT NULL,
    "modelVersion" VARCHAR(50) NOT NULL,
    "generatedAt" TIMESTAMP NOT NULL DEFAULT NOW(),
    "isAccurate" BOOLEAN,
    "accuracyNote" TEXT,
    "createdAt" TIMESTAMP NOT NULL DEFAULT NOW(),
    "updatedAt" TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Indexes for events
CREATE INDEX "events_externalId_idx" ON "events"("externalId");
CREATE INDEX "events_status_idx" ON "events"("status");
CREATE INDEX "events_date_status_idx" ON "events"("date", "status");
CREATE INDEX "events_status_date_idx" ON "events"("status", "date");
CREATE INDEX "events_eventName_idx" ON "events"("eventName");
CREATE INDEX "events_league_idx" ON "events"("league");
CREATE INDEX "events_sport_idx" ON "events" USING GIN ("sport");

-- Indexes for predictions
CREATE INDEX "predictions_eventId_idx" ON "predictions"("eventId");
CREATE INDEX "predictions_generatedAt_idx" ON "predictions"("generatedAt");
CREATE INDEX "predictions_isAccurate_idx" ON "predictions"("isAccurate");

-- Add triggers for updated_at
CREATE TRIGGER update_events_updated_at 
    BEFORE UPDATE ON "events" 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_predictions_updated_at 
    BEFORE UPDATE ON "predictions" 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();
