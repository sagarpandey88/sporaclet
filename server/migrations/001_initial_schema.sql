-- Migration: Initial Schema
-- Description: Create all tables and enums for the sports prediction platform
-- Date: 2026-01-14

-- Create ENUMS
CREATE TYPE "EventStatus" AS ENUM ('upcoming', 'live', 'completed', 'postponed', 'cancelled');
CREATE TYPE "WinnerType" AS ENUM ('home', 'away', 'draw');
CREATE TYPE "ConfidenceLevel" AS ENUM ('low', 'medium', 'high');
CREATE TYPE "InjurySeverity" AS ENUM ('minor', 'moderate', 'major', 'season_ending');
CREATE TYPE "InjuryStatus" AS ENUM ('active', 'recovered', 'day_to_day');

-- Create TABLES

-- Sports table
CREATE TABLE "sports" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "name" VARCHAR(255) UNIQUE NOT NULL,
    "displayName" VARCHAR(255) NOT NULL,
    "hasTeams" BOOLEAN NOT NULL DEFAULT true,
    "playerPositions" JSONB NOT NULL,
    "visualizationType" VARCHAR(50) NOT NULL,
    "createdAt" TIMESTAMP NOT NULL DEFAULT NOW(),
    "updatedAt" TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Teams table
CREATE TABLE "teams" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "externalId" VARCHAR(255) UNIQUE NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "shortName" VARCHAR(100) NOT NULL,
    "sportId" UUID NOT NULL REFERENCES "sports"("id"),
    "country" VARCHAR(100) NOT NULL,
    "league" VARCHAR(255) NOT NULL,
    "founded" INT,
    "logoUrl" TEXT,
    "venue" VARCHAR(255),
    "venueCapacity" INT,
    "description" TEXT,
    "createdAt" TIMESTAMP NOT NULL DEFAULT NOW(),
    "updatedAt" TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX "teams_externalId_idx" ON "teams"("externalId");
CREATE INDEX "teams_sportId_name_idx" ON "teams"("sportId", "name");
CREATE INDEX "teams_league_idx" ON "teams"("league");

-- Players table
CREATE TABLE "players" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "externalId" VARCHAR(255) UNIQUE NOT NULL,
    "firstName" VARCHAR(255) NOT NULL,
    "lastName" VARCHAR(255) NOT NULL,
    "displayName" VARCHAR(255) NOT NULL,
    "teamId" UUID REFERENCES "teams"("id"),
    "sportId" UUID NOT NULL REFERENCES "sports"("id"),
    "position" VARCHAR(50) NOT NULL,
    "jerseyNumber" INT,
    "birthDate" DATE,
    "nationality" VARCHAR(100),
    "height" INT,
    "weight" INT,
    "photoUrl" TEXT,
    "statistics" JSONB,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP NOT NULL DEFAULT NOW(),
    "updatedAt" TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX "players_externalId_idx" ON "players"("externalId");
CREATE INDEX "players_teamId_idx" ON "players"("teamId");
CREATE INDEX "players_sportId_idx" ON "players"("sportId");
CREATE INDEX "players_displayName_idx" ON "players"("displayName");

-- Events table
CREATE TABLE "events" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "externalId" VARCHAR(255) UNIQUE NOT NULL,
    "sportId" UUID NOT NULL REFERENCES "sports"("id"),
    "homeTeamId" UUID REFERENCES "teams"("id"),
    "awayTeamId" UUID REFERENCES "teams"("id"),
    "participant1Name" VARCHAR(255),
    "participant2Name" VARCHAR(255),
    "eventName" VARCHAR(255) NOT NULL,
    "venue" VARCHAR(255),
    "date" TIMESTAMP NOT NULL,
    "status" "EventStatus" NOT NULL DEFAULT 'upcoming',
    "league" VARCHAR(255),
    "season" VARCHAR(50),
    "round" VARCHAR(50),
    "homeScore" INT,
    "awayScore" INT,
    "winner" "WinnerType",
    "attendance" INT,
    "description" TEXT,
    "homeTeamSnapshot" JSONB,
    "awayTeamSnapshot" JSONB,
    "snapshotGeneratedAt" TIMESTAMP,
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP NOT NULL DEFAULT NOW(),
    "updatedAt" TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX "events_externalId_idx" ON "events"("externalId");
CREATE INDEX "events_sportId_status_idx" ON "events"("sportId", "status");
CREATE INDEX "events_date_status_idx" ON "events"("date", "status");
CREATE INDEX "events_homeTeamId_awayTeamId_idx" ON "events"("homeTeamId", "awayTeamId");
CREATE INDEX "events_status_date_idx" ON "events"("status", "date");
CREATE INDEX "events_eventName_idx" ON "events"("eventName");
CREATE INDEX "events_league_idx" ON "events"("league");

-- Predictions table
CREATE TABLE "predictions" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "eventId" UUID NOT NULL REFERENCES "events"("id"),
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

CREATE INDEX "predictions_eventId_idx" ON "predictions"("eventId");
CREATE INDEX "predictions_generatedAt_idx" ON "predictions"("generatedAt");
CREATE INDEX "predictions_isAccurate_idx" ON "predictions"("isAccurate");

-- Injuries table
CREATE TABLE "injuries" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "playerId" UUID NOT NULL REFERENCES "players"("id"),
    "injuryType" VARCHAR(255) NOT NULL,
    "severity" "InjurySeverity" NOT NULL,
    "occurredDate" TIMESTAMP NOT NULL,
    "expectedReturnDate" TIMESTAMP,
    "status" "InjuryStatus" NOT NULL DEFAULT 'active',
    "notes" TEXT,
    "createdAt" TIMESTAMP NOT NULL DEFAULT NOW(),
    "updatedAt" TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX "injuries_playerId_status_idx" ON "injuries"("playerId", "status");
CREATE INDEX "injuries_status_expectedReturnDate_idx" ON "injuries"("status", "expectedReturnDate");

-- Head-to-Head table
CREATE TABLE "head_to_head" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "team1Id" UUID NOT NULL REFERENCES "teams"("id"),
    "team2Id" UUID NOT NULL REFERENCES "teams"("id"),
    "totalMatches" INT NOT NULL DEFAULT 0,
    "team1Wins" INT NOT NULL DEFAULT 0,
    "team2Wins" INT NOT NULL DEFAULT 0,
    "draws" INT NOT NULL DEFAULT 0,
    "lastFiveResults" JSONB NOT NULL,
    "averageGoalsTeam1" FLOAT NOT NULL DEFAULT 0,
    "averageGoalsTeam2" FLOAT NOT NULL DEFAULT 0,
    "lastUpdated" TIMESTAMP NOT NULL DEFAULT NOW(),
    "createdAt" TIMESTAMP NOT NULL DEFAULT NOW(),
    "updatedAt" TIMESTAMP NOT NULL DEFAULT NOW(),
    CONSTRAINT "head_to_head_team1Id_team2Id_key" UNIQUE ("team1Id", "team2Id")
);

CREATE INDEX "head_to_head_team1Id_team2Id_idx" ON "head_to_head"("team1Id", "team2Id");

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW."updatedAt" = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add triggers for updated_at
CREATE TRIGGER update_sports_updated_at BEFORE UPDATE ON "sports" FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_teams_updated_at BEFORE UPDATE ON "teams" FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_players_updated_at BEFORE UPDATE ON "players" FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_events_updated_at BEFORE UPDATE ON "events" FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_predictions_updated_at BEFORE UPDATE ON "predictions" FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_injuries_updated_at BEFORE UPDATE ON "injuries" FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_head_to_head_updated_at BEFORE UPDATE ON "head_to_head" FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
