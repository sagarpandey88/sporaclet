# Database Denormalization Changes

## Overview
This document describes the database schema denormalization implemented to simplify the data model by reducing the number of tables from 7 to just 2 (events and predictions).

## Changes Made

### 1. Database Schema Changes

#### New Migration: `002_denormalize_schema.sql`
- **Dropped tables**: sports, teams, players, injuries, head_to_head
- **Kept tables**: events, predictions
- **Key changes to events table**:
  - Removed foreign key references (sportId, homeTeamId, awayTeamId)
  - Added JSONB fields:
    - `sport` - Contains sport information (name, displayName, etc.)
    - `homeTeam` - Contains home team data (name, shortName, logoUrl, etc.)
    - `awayTeam` - Contains away team data
    - `participant1` - For individual sports participants
    - `participant2` - For individual sports participants
    - `homeTeamPlayers` - Array of player data for home team
    - `awayTeamPlayers` - Array of player data for away team
    - `injuries` - Array of injury data
    - `headToHead` - Head-to-head statistics between teams
  - Kept snapshot fields for historical accuracy

#### Changes to predictions table:
- Added UNIQUE constraint on `eventId` to enforce one-to-one relationship
- Added ON DELETE CASCADE to remove predictions when events are deleted

### 2. TypeScript Model Updates

#### New JSONB Data Types (`src/types/models.ts`):
- `SportData` - Embedded sport information
- `TeamData` - Embedded team information
- `ParticipantData` - Embedded participant information
- `PlayerData` - Embedded player information
- `InjuryData` - Embedded injury information
- `HeadToHeadData` - Embedded head-to-head statistics

#### Updated Event Interface:
- Changed from foreign key IDs to embedded JSONB objects
- All related data is now stored directly in the event record

#### Removed Interfaces:
- Sport, Team, Player, Injury, HeadToHead (data now embedded in Event)

### 3. Repository Updates

#### event.repository.ts
- Updated to query JSONB fields using PostgreSQL JSON operators (e.g., `sport->>'name'`)
- Simplified joins - no longer joins with sports, teams tables
- Returns events with embedded data directly from JSONB columns
- Changed return type from `EventWithRelations` to `EventWithPrediction`
- Now returns single prediction per event (one-to-one relationship)

#### prediction.repository.ts
- Added `upsert` method to enforce one prediction per event
- Changed `updateAccuracy` to use `eventId` instead of prediction `id`
- Added backward compatibility alias `findLatestByEvent` → `findByEvent`
- `create` method now uses `upsert` internally

#### Removed Repositories:
- sport.repository.ts
- team.repository.ts
- player.repository.ts
- injury.repository.ts
- head-to-head.repository.ts

### 4. Service Layer Updates

#### event.service.ts
- Removed dependency on `headToHeadRepository`
- Head-to-head data now accessed directly from event's JSONB field
- Updated response transformations to use embedded JSONB data
- Simplified data access - all event-related data in one query

#### search.service.ts
- Updated to work with JSONB fields
- Changed autocomplete suggestion logic to handle both team and participant sports

### 5. Controller Updates

#### events.controller.ts
- Updated response format to match API contract
- Transforms internal `{ data, pagination }` to `{ events, pagination }`
- Converts `perPage` to `per_page` and `totalPages` to `total_pages`

### 6. Package Updates
- Added `@types/node` and `@types/jest` dev dependencies

## Benefits of Denormalization

1. **Simplified Data Model**: Reduced from 7 tables to 2 tables
2. **Fewer Joins**: No complex multi-table joins needed
3. **One-to-One Relationship**: Enforced one prediction per event at database level
4. **Historical Accuracy**: Team snapshots preserve point-in-time data
5. **Flexible Schema**: JSONB allows for varying data structures per sport
6. **Better Performance**: Single query retrieves all event data
7. **Simpler Codebase**: Removed 5 repository files

## Migration Path

To apply the denormalization:

1. Backup existing database
2. Run migration: `npm run migrate` (applies `002_denormalize_schema.sql`)
3. Restart server

## Backward Compatibility

- Prediction repository maintains `findLatestByEvent` alias for compatibility
- Controller response format remains unchanged (events + pagination)
- API endpoints remain the same

## Testing Considerations

- Tests should verify JSONB data is properly stored and retrieved
- Verify one-to-one event-prediction relationship
- Test JSONB query performance for large datasets
- Validate JSON schema for embedded objects

## Future Considerations

1. Consider adding JSON schema validation for JSONB fields
2. May need indexes on specific JSONB fields if queries become slow
3. Consider archival strategy for old events with large JSONB payloads
4. Monitor JSONB storage size vs. normalized approach
