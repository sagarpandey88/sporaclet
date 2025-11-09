# Data Model: Sports Prediction Portal

**Feature**: Sports Prediction Portal  
**Phase**: 1 - Design  
**Date**: 2025-11-04

## Overview

Data model for the sports prediction portal, defining entities, relationships, and database schema using Prisma ORM with PostgreSQL.

---

## Entity Relationship Diagram

```
┌─────────────┐
│   Sport     │
└──────┬──────┘
       │ 1:N
       ↓
┌─────────────┐       N:M        ┌─────────────┐
│    Event    │◄─────────────────►│    Team     │
└──────┬──────┘                   └──────┬──────┘
       │ 1:N                             │ 1:N
       ↓                                 ↓
┌─────────────┐                   ┌─────────────┐
│ Prediction  │                   │   Player    │
└─────────────┘                   └──────┬──────┘
                                         │ 1:N
                                         ↓
                                  ┌─────────────┐
                                  │   Injury    │
                                  └─────────────┘

┌─────────────┐
│ Head-to-Head│  (links 2 teams)
└─────────────┘
```

---

## Entities

### 1. Sport

Represents a sport type with specific attributes.

**Attributes**:
- `id`: UUID (Primary Key)
- `name`: String (unique) - e.g., "Football", "Basketball", "Cricket", "Tennis"
- `displayName`: String - User-friendly display name
- `hasTeams`: Boolean - true for team sports, false for individual
- `playerPositions`: JSON - Array of valid position names for this sport
- `visualizationType`: String - Type of visualization (field, court, etc.)
- `createdAt`: DateTime
- `updatedAt`: DateTime

**Relationships**:
- Events (1:N): A sport has many events

**Indexes**:
- `name` (unique)

**Validation Rules**:
- `name` must be alphanumeric
- `playerPositions` must be valid JSON array

---

### 2. Team

Represents a sports team with roster and metadata.

**Attributes**:
- `id`: UUID (Primary Key)
- `externalId`: String (unique) - ID from external API (TheSportsDB)
- `name`: String - Full team name
- `shortName`: String - Abbreviated name
- `sportId`: UUID (Foreign Key → Sport)
- `country`: String
- `league`: String
- `founded`: Integer - Year founded
- `logoUrl`: String - URL to team logo
- `venue`: String - Home venue name
- `venueCapacity`: Integer
- `description`: Text - Team description
- `createdAt`: DateTime
- `updatedAt`: DateTime

**Relationships**:
- Sport (N:1): A team belongs to a sport
- Players (1:N): A team has many players
- HomeEvents (1:N): Events where this team is home
- AwayEvents (1:N): Events where this team is away
- HeadToHeadAsTeam1 (1:N): H2H records as team 1
- HeadToHeadAsTeam2 (1:N): H2H records as team 2

**Indexes**:
- `externalId` (unique)
- `sportId, name` (composite)
- `league`

**Validation Rules**:
- `name` required, max 100 characters
- `logoUrl` must be valid URL
- `founded` must be 1800-2100

---

### 3. Player

Represents an individual athlete.

**Attributes**:
- `id`: UUID (Primary Key)
- `externalId`: String (unique) - ID from external API
- `firstName`: String
- `lastName`: String
- `displayName`: String - Full display name
- `teamId`: UUID (Foreign Key → Team, nullable)
- `sportId`: UUID (Foreign Key → Sport)
- `position`: String - Player position
- `jerseyNumber`: Integer
- `birthDate`: Date
- `nationality`: String
- `height`: Integer - in centimeters
- `weight`: Integer - in kilograms
- `photoUrl`: String
- `statistics`: JSON - Career statistics (sport-specific)
- `isActive`: Boolean - Currently active player
- `createdAt`: DateTime
- `updatedAt`: DateTime

**Relationships**:
- Team (N:1): A player belongs to a team (nullable for free agents)
- Sport (N:1): A player belongs to a sport
- Injuries (1:N): A player can have multiple injuries

**Indexes**:
- `externalId` (unique)
- `teamId`
- `sportId`
- `displayName`

**Validation Rules**:
- `displayName` required
- `position` must be valid for the sport
- `jerseyNumber` range: 0-99
- `birthDate` must be in past

---

### 4. Event

Represents a sporting event (match, game).

**Attributes**:
- `id`: UUID (Primary Key)
- `externalId`: String (unique) - ID from external API
- `sportId`: UUID (Foreign Key → Sport)
- `homeTeamId`: UUID (Foreign Key → Team, nullable)
- `awayTeamId`: UUID (Foreign Key → Team, nullable)
- `participant1Name`: String - For individual sports
- `participant2Name`: String - For individual sports
- `eventName`: String - Full event name
- `venue`: String - Location name
- `date`: DateTime - Event start date/time
- `status`: Enum - 'upcoming', 'live', 'completed', 'postponed', 'cancelled'
- `league`: String - League/tournament name
- `season`: String - Season identifier
- `round`: String - Round/week number
- `homeScore`: Integer (nullable) - Final score for home/participant1
- `awayScore`: Integer (nullable) - Final score for away/participant2
- `winner`: Enum (nullable) - 'home', 'away', 'draw'
- `attendance`: Integer (nullable)
- `description`: Text
- `homeTeamSnapshot`: JSON (nullable) - Denormalized snapshot of home team roster and injuries for fast UI reads
- `awayTeamSnapshot`: JSON (nullable) - Denormalized snapshot of away team roster and injuries for fast UI reads
- `snapshotGeneratedAt`: DateTime (nullable) - When snapshots were last generated by worker
- `isDeleted`: Boolean (default: false) - Soft delete flag
- `createdAt`: DateTime
- `updatedAt`: DateTime

**Relationships**:
- Sport (N:1): An event belongs to a sport
- HomeTeam (N:1): Home team reference (nullable)
- AwayTeam (N:1): Away team reference (nullable)
- Predictions (1:N): An event can have multiple predictions (historical)

**Indexes**:
- `externalId` (unique)
- `sportId, status` (composite)
- `date, status` (composite)
- `homeTeamId, awayTeamId` (composite)
- `status, date` (composite, for filtering)

**Validation Rules**:
- For team sports: `homeTeamId` and `awayTeamId` required
- For individual sports: `participant1Name` and `participant2Name` required
- `date` must be in valid range (past 5 years to future 1 year)
- `status` transitions: upcoming → live → completed/postponed/cancelled
- `homeTeamSnapshot` and `awayTeamSnapshot` structure: `{ "players": [...], "injuries": [...] }`

**Business Logic**:
- Snapshots are generated/updated by the prediction worker job (twice daily)
- UI reads from snapshots for performance (no joins required)
- AI prediction analysis queries normalized Player/Injury tables for accuracy
- Snapshots include: player roster with positions, current active injuries with details

---

### 5. Prediction

Represents an AI-generated prediction for an event.

**Attributes**:
- `id`: UUID (Primary Key)
- `eventId`: UUID (Foreign Key → Event)
- `probabilities`: JSON - Probability distribution (e.g., `{"home": 0.65, "away": 0.35}`)
- `predictedWinner`: Enum - 'home', 'away', 'draw'
- `confidence`: Enum - 'low', 'medium', 'high'
- `keyFactors`: JSON - Array of strings describing influencing factors
- `modelVersion`: String - AI model version used
- `generatedAt`: DateTime - When prediction was generated
- `isAccurate`: Boolean (nullable) - Set after event completes
- `accuracyNote`: String (nullable) - Explanation of accuracy
- `createdAt`: DateTime
- `updatedAt`: DateTime

**Relationships**:
- Event (N:1): A prediction belongs to an event

**Indexes**:
- `eventId` (can have multiple predictions per event for history)
- `generatedAt`
- `isAccurate`

**Validation Rules**:
- `probabilities` must be valid JSON with keys matching event participants
- Probabilities must sum to ~1.0 (allowing 0.01 tolerance)
- `predictedWinner` must match highest probability in distribution
- `keyFactors` must be array of strings

**Business Logic**:
- Only the most recent prediction per event is shown to users
- Historical predictions kept for accuracy tracking
- `isAccurate` set by worker job after event completion

---

### 6. Injury

Represents a player injury with status.

**Attributes**:
- `id`: UUID (Primary Key)
- `playerId`: UUID (Foreign Key → Player)
- `injuryType`: String - Type/description of injury
- `severity`: Enum - 'minor', 'moderate', 'major', 'season-ending'
- `occurredDate`: Date - When injury occurred
- `expectedReturnDate`: Date (nullable) - Expected return date
- `status`: Enum - 'active', 'recovered', 'day-to-day'
- `notes`: Text (nullable) - Additional notes
- `createdAt`: DateTime
- `updatedAt`: DateTime

**Relationships**:
- Player (N:1): An injury belongs to a player

**Indexes**:
- `playerId, status` (composite)
- `status, expectedReturnDate` (composite)

**Validation Rules**:
- `occurredDate` must be in past
- `expectedReturnDate` must be after `occurredDate`
- `severity` and `status` must be valid enum values

---

### 7. HeadToHead

Represents historical matchup data between two teams.

**Attributes**:
- `id`: UUID (Primary Key)
- `team1Id`: UUID (Foreign Key → Team)
- `team2Id`: UUID (Foreign Key → Team)
- `totalMatches`: Integer - Total matches played
- `team1Wins`: Integer
- `team2Wins`: Integer
- `draws`: Integer
- `lastFiveResults`: JSON - Array of last 5 match results
- `averageGoalsTeam1`: Float
- `averageGoalsTeam2`: Float
- `lastUpdated`: DateTime - When stats were last updated
- `createdAt`: DateTime
- `updatedAt`: DateTime

**Relationships**:
- Team1 (N:1): First team in matchup
- Team2 (N:1): Second team in matchup

**Indexes**:
- `team1Id, team2Id` (composite, unique)

**Validation Rules**:
- `team1Id` must be less than `team2Id` (consistent ordering)
- `totalMatches` = `team1Wins` + `team2Wins` + `draws`
- `lastFiveResults` must be valid JSON array

**Business Logic**:
- Record is bidirectional (querying either team order returns same record)
- Updated by worker job after each match completion

---

## Prisma Schema

```prisma
// prisma/schema.prisma

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

enum EventStatus {
  upcoming
  live
  completed
  postponed
  cancelled
}

enum WinnerType {
  home
  away
  draw
}

enum ConfidenceLevel {
  low
  medium
  high
}

enum InjurySeverity {
  minor
  moderate
  major
  season_ending
}

enum InjuryStatus {
  active
  recovered
  day_to_day
}

model Sport {
  id                 String   @id @default(uuid())
  name               String   @unique
  displayName        String
  hasTeams           Boolean  @default(true)
  playerPositions    Json     // Array of position names
  visualizationType  String   // "field", "court", "track", etc.
  createdAt          DateTime @default(now())
  updatedAt          DateTime @updatedAt
  
  // Relations
  teams              Team[]
  players            Player[]
  events             Event[]
  
  @@map("sports")
}

model Team {
  id             String   @id @default(uuid())
  externalId     String   @unique
  name           String
  shortName      String
  sportId        String
  country        String
  league         String
  founded        Int?
  logoUrl        String?
  venue          String?
  venueCapacity  Int?
  description    String?
  createdAt      DateTime @default(now())
  updatedAt      DateTime @updatedAt
  
  // Relations
  sport          Sport    @relation(fields: [sportId], references: [id])
  players        Player[]
  homeEvents     Event[]  @relation("HomeTeam")
  awayEvents     Event[]  @relation("AwayTeam")
  h2hAsTeam1     HeadToHead[] @relation("Team1")
  h2hAsTeam2     HeadToHead[] @relation("Team2")
  
  @@index([externalId])
  @@index([sportId, name])
  @@index([league])
  @@map("teams")
}

model Player {
  id             String   @id @default(uuid())
  externalId     String   @unique
  firstName      String
  lastName       String
  displayName    String
  teamId         String?
  sportId        String
  position       String
  jerseyNumber   Int?
  birthDate      DateTime?
  nationality    String?
  height         Int?     // centimeters
  weight         Int?     // kilograms
  photoUrl       String?
  statistics     Json?    // Sport-specific stats
  isActive       Boolean  @default(true)
  createdAt      DateTime @default(now())
  updatedAt      DateTime @updatedAt
  
  // Relations
  team           Team?    @relation(fields: [teamId], references: [id])
  sport          Sport    @relation(fields: [sportId], references: [id])
  injuries       Injury[]
  
  @@index([externalId])
  @@index([teamId])
  @@index([sportId])
  @@index([displayName])
  @@map("players")
}

model Event {
  id                String      @id @default(uuid())
  externalId        String      @unique
  sportId           String
  homeTeamId        String?
  awayTeamId        String?
  participant1Name  String?     // For individual sports
  participant2Name  String?     // For individual sports
  eventName         String
  venue             String?
  date              DateTime
  status            EventStatus @default(upcoming)
  league            String?
  season            String?
  round             String?
  homeScore         Int?
  awayScore         Int?
  winner            WinnerType?
  attendance        Int?
  description       String?
  homeTeamSnapshot  Json?       // Denormalized: { players: [...], injuries: [...] }
  awayTeamSnapshot  Json?       // Denormalized: { players: [...], injuries: [...] }
  snapshotGeneratedAt DateTime? // When snapshots were last updated
  isDeleted         Boolean     @default(false)
  createdAt         DateTime    @default(now())
  updatedAt         DateTime    @updatedAt
  
  // Relations
  sport             Sport       @relation(fields: [sportId], references: [id])
  homeTeam          Team?       @relation("HomeTeam", fields: [homeTeamId], references: [id])
  awayTeam          Team?       @relation("AwayTeam", fields: [awayTeamId], references: [id])
  predictions       Prediction[]
  
  @@index([externalId])
  @@index([sportId, status])
  @@index([date, status])
  @@index([homeTeamId, awayTeamId])
  @@index([status, date])
  @@map("events")
}

model Prediction {
  id              String          @id @default(uuid())
  eventId         String
  probabilities   Json            // {"home": 0.65, "away": 0.35}
  predictedWinner WinnerType
  confidence      ConfidenceLevel
  keyFactors      Json            // Array of strings
  modelVersion    String
  generatedAt     DateTime        @default(now())
  isAccurate      Boolean?
  accuracyNote    String?
  createdAt       DateTime        @default(now())
  updatedAt       DateTime        @updatedAt
  
  // Relations
  event           Event           @relation(fields: [eventId], references: [id])
  
  @@index([eventId])
  @@index([generatedAt])
  @@index([isAccurate])
  @@map("predictions")
}

model Injury {
  id                 String        @id @default(uuid())
  playerId           String
  injuryType         String
  severity           InjurySeverity
  occurredDate       DateTime
  expectedReturnDate DateTime?
  status             InjuryStatus  @default(active)
  notes              String?
  createdAt          DateTime      @default(now())
  updatedAt          DateTime      @updatedAt
  
  // Relations
  player             Player        @relation(fields: [playerId], references: [id])
  
  @@index([playerId, status])
  @@index([status, expectedReturnDate])
  @@map("injuries")
}

model HeadToHead {
  id                 String   @id @default(uuid())
  team1Id            String
  team2Id            String
  totalMatches       Int      @default(0)
  team1Wins          Int      @default(0)
  team2Wins          Int      @default(0)
  draws              Int      @default(0)
  lastFiveResults    Json     // Array of last 5 results
  averageGoalsTeam1  Float    @default(0)
  averageGoalsTeam2  Float    @default(0)
  lastUpdated        DateTime @default(now())
  createdAt          DateTime @default(now())
  updatedAt          DateTime @updatedAt
  
  // Relations
  team1              Team     @relation("Team1", fields: [team1Id], references: [id])
  team2              Team     @relation("Team2", fields: [team2Id], references: [id])
  
  @@unique([team1Id, team2Id])
  @@index([team1Id, team2Id])
  @@map("head_to_head")
}
```

---

## Migration Strategy

### Initial Migration

```bash
# Create initial migration
npx prisma migrate dev --name init

# Generate Prisma Client
npx prisma generate
```

### Seed Data

Create seed script for initial sports:

```typescript
// prisma/seed.ts
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // Seed sports
  await prisma.sport.createMany({
    data: [
      {
        name: 'football',
        displayName: 'Football',
        hasTeams: true,
        playerPositions: ['GK', 'DEF', 'MID', 'FWD'],
        visualizationType: 'field'
      },
      {
        name: 'basketball',
        displayName: 'Basketball',
        hasTeams: true,
        playerPositions: ['PG', 'SG', 'SF', 'PF', 'C'],
        visualizationType: 'court'
      },
      {
        name: 'cricket',
        displayName: 'Cricket',
        hasTeams: true,
        playerPositions: ['Batsman', 'Bowler', 'All-rounder', 'Wicket-keeper'],
        visualizationType: 'field'
      },
      {
        name: 'tennis',
        displayName: 'Tennis',
        hasTeams: false,
        playerPositions: [],
        visualizationType: 'court'
      }
    ]
  });
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
```

---

## Query Patterns

### Common Queries

```typescript
// Get event detail with hybrid approach - UI reads from snapshots
const eventDetail = await prisma.event.findUnique({
  where: { id: eventId },
  include: {
    sport: true,
    predictions: {
      orderBy: { generatedAt: 'desc' },
      take: 1
    }
  }
});

// homeTeamSnapshot and awayTeamSnapshot contain all roster/injury data
// No need to join Player/Injury tables for UI display

// AI prediction worker queries normalized tables for accuracy
const homeTeamInjuries = await prisma.injury.findMany({
  where: {
    player: { teamId: homeTeamId },
    status: 'active'
  },
  include: {
    player: {
      select: { displayName: true, position: true }
    }
  }
});

// Worker then updates snapshots
await prisma.event.update({
  where: { id: eventId },
  data: {
    homeTeamSnapshot: {
      players: homePlayers.map(p => ({
        id: p.id,
        name: p.displayName,
        position: p.position,
        jerseyNumber: p.jerseyNumber
      })),
      injuries: homeTeamInjuries.map(i => ({
        playerName: i.player.displayName,
        injuryType: i.injuryType,
        severity: i.severity,
        expectedReturn: i.expectedReturnDate
      }))
    },
    snapshotGeneratedAt: new Date()
  }
});
```

---

## Data Integrity Rules

1. **Event Validation**: Ensure either team IDs (team sports) or participant names (individual sports) are provided
2. **Prediction Probability Sum**: Probabilities must sum to approximately 1.0
3. **H2H Consistency**: `totalMatches = team1Wins + team2Wins + draws`
4. **Soft Deletes**: Never hard delete events (use `isDeleted` flag)
5. **Audit Trail**: All tables have `createdAt` and `updatedAt`
6. **Foreign Key Constraints**: Cascade deletes appropriately (e.g., deleting team doesn't delete events)

---

## Performance Considerations

1. **Indexes**: Applied on frequently queried columns (status, date, team IDs)
2. **Connection Pooling**: Prisma handles automatically (configure in DATABASE_URL)
3. **Pagination**: Always use `take` and `skip` for large result sets
4. **Selective Includes**: Only include relations when needed
5. **Caching**: Event listings and details cached at application layer (Redis)

---

## Next Steps

1. Generate Prisma Client types
2. Create repository layer abstractions
3. Define API contracts based on this data model
