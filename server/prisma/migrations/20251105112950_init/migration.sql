-- CreateEnum
CREATE TYPE "EventStatus" AS ENUM ('upcoming', 'live', 'completed', 'postponed', 'cancelled');

-- CreateEnum
CREATE TYPE "WinnerType" AS ENUM ('home', 'away', 'draw');

-- CreateEnum
CREATE TYPE "ConfidenceLevel" AS ENUM ('low', 'medium', 'high');

-- CreateEnum
CREATE TYPE "InjurySeverity" AS ENUM ('minor', 'moderate', 'major', 'season_ending');

-- CreateEnum
CREATE TYPE "InjuryStatus" AS ENUM ('active', 'recovered', 'day_to_day');

-- CreateTable
CREATE TABLE "sports" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "displayName" TEXT NOT NULL,
    "hasTeams" BOOLEAN NOT NULL DEFAULT true,
    "playerPositions" JSONB NOT NULL,
    "visualizationType" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "sports_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "teams" (
    "id" TEXT NOT NULL,
    "externalId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "shortName" TEXT NOT NULL,
    "sportId" TEXT NOT NULL,
    "country" TEXT NOT NULL,
    "league" TEXT NOT NULL,
    "founded" INTEGER,
    "logoUrl" TEXT,
    "venue" TEXT,
    "venueCapacity" INTEGER,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "teams_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "players" (
    "id" TEXT NOT NULL,
    "externalId" TEXT NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "displayName" TEXT NOT NULL,
    "teamId" TEXT,
    "sportId" TEXT NOT NULL,
    "position" TEXT NOT NULL,
    "jerseyNumber" INTEGER,
    "birthDate" TIMESTAMP(3),
    "nationality" TEXT,
    "height" INTEGER,
    "weight" INTEGER,
    "photoUrl" TEXT,
    "statistics" JSONB,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "players_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "events" (
    "id" TEXT NOT NULL,
    "externalId" TEXT NOT NULL,
    "sportId" TEXT NOT NULL,
    "homeTeamId" TEXT,
    "awayTeamId" TEXT,
    "participant1Name" TEXT,
    "participant2Name" TEXT,
    "eventName" TEXT NOT NULL,
    "venue" TEXT,
    "date" TIMESTAMP(3) NOT NULL,
    "status" "EventStatus" NOT NULL DEFAULT 'upcoming',
    "league" TEXT,
    "season" TEXT,
    "round" TEXT,
    "homeScore" INTEGER,
    "awayScore" INTEGER,
    "winner" "WinnerType",
    "attendance" INTEGER,
    "description" TEXT,
    "homeTeamSnapshot" JSONB,
    "awayTeamSnapshot" JSONB,
    "snapshotGeneratedAt" TIMESTAMP(3),
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "events_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "predictions" (
    "id" TEXT NOT NULL,
    "eventId" TEXT NOT NULL,
    "probabilities" JSONB NOT NULL,
    "predictedWinner" "WinnerType" NOT NULL,
    "confidence" "ConfidenceLevel" NOT NULL,
    "keyFactors" JSONB NOT NULL,
    "modelVersion" TEXT NOT NULL,
    "generatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "isAccurate" BOOLEAN,
    "accuracyNote" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "predictions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "injuries" (
    "id" TEXT NOT NULL,
    "playerId" TEXT NOT NULL,
    "injuryType" TEXT NOT NULL,
    "severity" "InjurySeverity" NOT NULL,
    "occurredDate" TIMESTAMP(3) NOT NULL,
    "expectedReturnDate" TIMESTAMP(3),
    "status" "InjuryStatus" NOT NULL DEFAULT 'active',
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "injuries_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "head_to_head" (
    "id" TEXT NOT NULL,
    "team1Id" TEXT NOT NULL,
    "team2Id" TEXT NOT NULL,
    "totalMatches" INTEGER NOT NULL DEFAULT 0,
    "team1Wins" INTEGER NOT NULL DEFAULT 0,
    "team2Wins" INTEGER NOT NULL DEFAULT 0,
    "draws" INTEGER NOT NULL DEFAULT 0,
    "lastFiveResults" JSONB NOT NULL,
    "averageGoalsTeam1" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "averageGoalsTeam2" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "lastUpdated" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "head_to_head_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "sports_name_key" ON "sports"("name");

-- CreateIndex
CREATE UNIQUE INDEX "teams_externalId_key" ON "teams"("externalId");

-- CreateIndex
CREATE INDEX "teams_externalId_idx" ON "teams"("externalId");

-- CreateIndex
CREATE INDEX "teams_sportId_name_idx" ON "teams"("sportId", "name");

-- CreateIndex
CREATE INDEX "teams_league_idx" ON "teams"("league");

-- CreateIndex
CREATE UNIQUE INDEX "players_externalId_key" ON "players"("externalId");

-- CreateIndex
CREATE INDEX "players_externalId_idx" ON "players"("externalId");

-- CreateIndex
CREATE INDEX "players_teamId_idx" ON "players"("teamId");

-- CreateIndex
CREATE INDEX "players_sportId_idx" ON "players"("sportId");

-- CreateIndex
CREATE INDEX "players_displayName_idx" ON "players"("displayName");

-- CreateIndex
CREATE UNIQUE INDEX "events_externalId_key" ON "events"("externalId");

-- CreateIndex
CREATE INDEX "events_externalId_idx" ON "events"("externalId");

-- CreateIndex
CREATE INDEX "events_sportId_status_idx" ON "events"("sportId", "status");

-- CreateIndex
CREATE INDEX "events_date_status_idx" ON "events"("date", "status");

-- CreateIndex
CREATE INDEX "events_homeTeamId_awayTeamId_idx" ON "events"("homeTeamId", "awayTeamId");

-- CreateIndex
CREATE INDEX "events_status_date_idx" ON "events"("status", "date");

-- CreateIndex
CREATE INDEX "predictions_eventId_idx" ON "predictions"("eventId");

-- CreateIndex
CREATE INDEX "predictions_generatedAt_idx" ON "predictions"("generatedAt");

-- CreateIndex
CREATE INDEX "predictions_isAccurate_idx" ON "predictions"("isAccurate");

-- CreateIndex
CREATE INDEX "injuries_playerId_status_idx" ON "injuries"("playerId", "status");

-- CreateIndex
CREATE INDEX "injuries_status_expectedReturnDate_idx" ON "injuries"("status", "expectedReturnDate");

-- CreateIndex
CREATE INDEX "head_to_head_team1Id_team2Id_idx" ON "head_to_head"("team1Id", "team2Id");

-- CreateIndex
CREATE UNIQUE INDEX "head_to_head_team1Id_team2Id_key" ON "head_to_head"("team1Id", "team2Id");

-- AddForeignKey
ALTER TABLE "teams" ADD CONSTRAINT "teams_sportId_fkey" FOREIGN KEY ("sportId") REFERENCES "sports"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "players" ADD CONSTRAINT "players_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "teams"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "players" ADD CONSTRAINT "players_sportId_fkey" FOREIGN KEY ("sportId") REFERENCES "sports"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "events" ADD CONSTRAINT "events_sportId_fkey" FOREIGN KEY ("sportId") REFERENCES "sports"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "events" ADD CONSTRAINT "events_homeTeamId_fkey" FOREIGN KEY ("homeTeamId") REFERENCES "teams"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "events" ADD CONSTRAINT "events_awayTeamId_fkey" FOREIGN KEY ("awayTeamId") REFERENCES "teams"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "predictions" ADD CONSTRAINT "predictions_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "events"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "injuries" ADD CONSTRAINT "injuries_playerId_fkey" FOREIGN KEY ("playerId") REFERENCES "players"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "head_to_head" ADD CONSTRAINT "head_to_head_team1Id_fkey" FOREIGN KEY ("team1Id") REFERENCES "teams"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "head_to_head" ADD CONSTRAINT "head_to_head_team2Id_fkey" FOREIGN KEY ("team2Id") REFERENCES "teams"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
