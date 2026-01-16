/**
 * Event Types
 * Matching API contract EventSummary and EventDetail schemas
 */

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

/**
 * Event Summary - List view
 */
export interface EventSummary {
  id: string;
  externalId: string;
  eventName: string;
  sport: string;
  homeTeam?: {
    id: string;
    name: string;
    shortName: string;
    logoUrl?: string;
  };
  awayTeam?: {
    id: string;
    name: string;
    shortName: string;
    logoUrl?: string;
  };
  participant1Name?: string;
  participant2Name?: string;
  date: string; // ISO 8601
  venue?: string;
  status: EventStatus;
  league?: string;
  // Fields for past/completed events
  winner?: WinnerType;
  prediction?: PredictionSummary;
}

/**
 * Prediction Summary
 */
export interface PredictionSummary {
  id: string;
  predictedWinner: WinnerType;
  confidence: ConfidenceLevel;
  probabilities: {
    home?: number;
    away?: number;
    draw?: number;
  };
  generatedAt: string; // ISO 8601
  // Fields for accuracy display on past events
  isAccurate?: boolean;
  accuracyNote?: string;
}

/**
 * Event Detail - Detail view
 */
export interface EventDetail extends EventSummary {
  description?: string;
  season?: string;
  round?: string;
  winner?: WinnerType;
  prediction?: PredictionDetail;
  headToHead?: HeadToHead;
  homeTeamSnapshot?: TeamSnapshot;
  awayTeamSnapshot?: TeamSnapshot;
}

/**
 * Prediction Detail
 */
export interface PredictionDetail extends PredictionSummary {
  keyFactors: string[];
  modelVersion: string;
  isAccurate?: boolean;
  accuracyNote?: string;
}

/**
 * Head-to-Head Statistics
 */
export interface HeadToHead {
  totalMatches: number;
  team1Wins: number;
  team2Wins: number;
  draws: number;
  lastFiveResults: Array<{
    date: string;
    team1Score: number;
    team2Score: number;
    winner: WinnerType;
  }>;
  averageGoalsTeam1: number;
  averageGoalsTeam2: number;
}

/**
 * Team Snapshot
 */
export interface TeamSnapshot {
  players: PlayerSummary[];
  injuries: InjurySummary[];
}

/**
 * Player Summary
 */
export interface PlayerSummary {
  id: string;
  displayName: string;
  position: string;
  jerseyNumber?: number;
  photoUrl?: string;
  isActive: boolean;
}

/**
 * Injury Summary
 */
export interface InjurySummary {
  id: string;
  player: {
    id: string;
    displayName: string;
  };
  injuryType: string;
  severity: 'minor' | 'moderate' | 'major' | 'season_ending';
  status: 'active' | 'recovered' | 'day_to_day';
  occurredDate: string;
  expectedReturnDate?: string;
}

/**
 * Pagination Response
 */
export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    perPage: number;
    total: number;
    totalPages: number;
  };
}

/**
 * API Error Response
 */
export interface ApiError {
  error: {
    code: string;
    message: string;
    details?: unknown;
  };
  timestamp: string;
  path: string;
  requestId?: string;
}
