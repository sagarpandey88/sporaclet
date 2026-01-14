// Type definitions to replace Prisma-generated types

export enum EventStatus {
  upcoming = 'upcoming',
  live = 'live',
  completed = 'completed',
  postponed = 'postponed',
  cancelled = 'cancelled',
}

export enum WinnerType {
  home = 'home',
  away = 'away',
  draw = 'draw',
}

export enum ConfidenceLevel {
  low = 'low',
  medium = 'medium',
  high = 'high',
}

export enum InjurySeverity {
  minor = 'minor',
  moderate = 'moderate',
  major = 'major',
  season_ending = 'season_ending',
}

export enum InjuryStatus {
  active = 'active',
  recovered = 'recovered',
  day_to_day = 'day_to_day',
}

// Embedded types for JSONB fields
export interface SportData {
  id?: string;
  name: string;
  displayName: string;
  hasTeams?: boolean;
  playerPositions?: unknown;
  visualizationType?: string;
}

export interface TeamData {
  id?: string;
  externalId?: string;
  name: string;
  shortName: string;
  country?: string;
  league?: string;
  founded?: number;
  logoUrl?: string;
  venue?: string;
  venueCapacity?: number;
  description?: string;
}

export interface ParticipantData {
  id?: string;
  externalId?: string;
  name: string;
  displayName?: string;
  nationality?: string;
  photoUrl?: string;
  statistics?: unknown;
}

export interface PlayerData {
  id?: string;
  externalId?: string;
  firstName: string;
  lastName: string;
  displayName: string;
  position: string;
  jerseyNumber?: number;
  birthDate?: string;
  nationality?: string;
  height?: number;
  weight?: number;
  photoUrl?: string;
  statistics?: unknown;
  isActive?: boolean;
}

export interface InjuryData {
  id?: string;
  playerId: string;
  playerName: string;
  injuryType: string;
  severity: InjurySeverity;
  occurredDate: string;
  expectedReturnDate?: string;
  status: InjuryStatus;
  notes?: string;
}

export interface HeadToHeadData {
  totalMatches: number;
  team1Wins: number;
  team2Wins: number;
  draws: number;
  lastFiveResults: unknown;
  averageGoalsTeam1: number;
  averageGoalsTeam2: number;
  lastUpdated: string;
}

export interface Event {
  id: string;
  externalId: string;
  eventName: string;
  date: Date;
  status: EventStatus;
  venue?: string | null;
  league?: string | null;
  season?: string | null;
  round?: string | null;
  homeScore?: number | null;
  awayScore?: number | null;
  winner?: WinnerType | null;
  attendance?: number | null;
  description?: string | null;
  
  // Denormalized JSONB fields
  sport: SportData;
  homeTeam?: TeamData | null;
  awayTeam?: TeamData | null;
  participant1?: ParticipantData | null;
  participant2?: ParticipantData | null;
  homeTeamPlayers?: PlayerData[] | null;
  awayTeamPlayers?: PlayerData[] | null;
  injuries?: InjuryData[] | null;
  headToHead?: HeadToHeadData | null;
  
  homeTeamSnapshot?: unknown | null;
  awayTeamSnapshot?: unknown | null;
  snapshotGeneratedAt?: Date | null;
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Prediction {
  id: string;
  eventId: string;
  probabilities: unknown; // JSON
  predictedWinner: WinnerType;
  confidence: ConfidenceLevel;
  keyFactors: unknown; // JSON
  modelVersion: string;
  generatedAt: Date;
  isAccurate?: boolean | null;
  accuracyNote?: string | null;
  createdAt: Date;
  updatedAt: Date;
}

// Legacy interfaces removed - data now embedded in Event as JSONB

// Type helpers for query building
export namespace Prisma {
  export type QueryMode = 'default' | 'insensitive';
  
  export interface EventWhereInput {
    id?: string;
    externalId?: string;
    status?: EventStatus;
    isDeleted?: boolean;
    date?: {
      gte?: Date;
      lte?: Date;
    };
    sport?: {
      name?: string;
    };
    league?: {
      contains?: string;
      mode?: QueryMode;
    };
    eventName?: {
      contains?: string;
      mode?: QueryMode;
    };
    venue?: {
      contains?: string;
      mode?: QueryMode;
    };
    OR?: EventWhereInput[];
  }
}
