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

export interface Sport {
  id: string;
  name: string;
  displayName: string;
  hasTeams: boolean;
  playerPositions: unknown; // JSON
  visualizationType: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Team {
  id: string;
  externalId: string;
  name: string;
  shortName: string;
  sportId: string;
  country: string;
  league: string;
  founded?: number | null;
  logoUrl?: string | null;
  venue?: string | null;
  venueCapacity?: number | null;
  description?: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface Player {
  id: string;
  externalId: string;
  firstName: string;
  lastName: string;
  displayName: string;
  teamId?: string | null;
  sportId: string;
  position: string;
  jerseyNumber?: number | null;
  birthDate?: Date | null;
  nationality?: string | null;
  height?: number | null;
  weight?: number | null;
  photoUrl?: string | null;
  statistics?: unknown | null; // JSON
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Event {
  id: string;
  externalId: string;
  sportId: string;
  homeTeamId?: string | null;
  awayTeamId?: string | null;
  participant1Name?: string | null;
  participant2Name?: string | null;
  eventName: string;
  venue?: string | null;
  date: Date;
  status: EventStatus;
  league?: string | null;
  season?: string | null;
  round?: string | null;
  homeScore?: number | null;
  awayScore?: number | null;
  winner?: WinnerType | null;
  attendance?: number | null;
  description?: string | null;
  homeTeamSnapshot?: unknown | null; // JSON
  awayTeamSnapshot?: unknown | null; // JSON
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

export interface Injury {
  id: string;
  playerId: string;
  injuryType: string;
  severity: InjurySeverity;
  occurredDate: Date;
  expectedReturnDate?: Date | null;
  status: InjuryStatus;
  notes?: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface HeadToHead {
  id: string;
  team1Id: string;
  team2Id: string;
  totalMatches: number;
  team1Wins: number;
  team2Wins: number;
  draws: number;
  lastFiveResults: unknown; // JSON
  averageGoalsTeam1: number;
  averageGoalsTeam2: number;
  lastUpdated: Date;
  createdAt: Date;
  updatedAt: Date;
}

// Type helpers for Prisma-like behavior
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
    homeTeam?: {
      name?: {
        contains?: string;
        mode?: QueryMode;
      };
      shortName?: {
        contains?: string;
        mode?: QueryMode;
      };
      OR?: Array<{
        name?: { contains?: string; mode?: QueryMode };
        shortName?: { contains?: string; mode?: QueryMode };
      }>;
    };
    awayTeam?: {
      name?: {
        contains?: string;
        mode?: QueryMode;
      };
      shortName?: {
        contains?: string;
        mode?: QueryMode;
      };
      OR?: Array<{
        name?: { contains?: string; mode?: QueryMode };
        shortName?: { contains?: string; mode?: QueryMode };
      }>;
    };
    participant1Name?: {
      contains?: string;
      mode?: QueryMode;
    };
    participant2Name?: {
      contains?: string;
      mode?: QueryMode;
    };
    venue?: {
      contains?: string;
      mode?: QueryMode;
    };
    OR?: EventWhereInput[];
  }
  
  export interface TeamCreateInput {
    id?: string;
    externalId: string;
    name: string;
    shortName: string;
    sportId: string;
    country: string;
    league: string;
    founded?: number | null;
    logoUrl?: string | null;
    venue?: string | null;
    venueCapacity?: number | null;
    description?: string | null;
  }
  
  export interface TeamUpdateInput {
    externalId?: string;
    name?: string;
    shortName?: string;
    sportId?: string;
    country?: string;
    league?: string;
    founded?: number | null;
    logoUrl?: string | null;
    venue?: string | null;
    venueCapacity?: number | null;
    description?: string | null;
  }
}
