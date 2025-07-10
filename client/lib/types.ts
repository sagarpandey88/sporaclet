export interface Event {
  id: string;
  sportType: string;
  eventDate: Date;
  venue: string;
  teamsInvolved: any;
  weatherConditions?: any;
  historicalData?: any;
  league?: string;
  tournament?: string;
  status: string;
  createdAt: Date;
  updatedAt: Date;
  predictions?: Prediction[];
  dreamXI?: DreamXI;
}

export interface Prediction {
  id: string;
  eventId: string;
  predictionDetails: any;
  confidenceScore: number;
  factorsConsidered: any;
  outcome?: string;
  accuracy?: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface DreamXI {
  formation: string;
  players: DreamXIPlayer[];
  substitutes: DreamXIPlayer[];
  totalFantasyValue: number;
  averageRating: number;
  note?: string;
}

export interface DreamXIPlayer {
  position: string;
  name: string;
  team: string;
  fantasyPoints: number;
  recentForm?: string;
  keyStats?: any;
  reason: string;
}

export interface EventFilters {
  sportType?: string;
  dateFrom?: Date;
  dateTo?: Date;
  league?: string;
  tournament?: string;
  venue?: string;
}

export interface PaginationParams {
  page: number;
  limit: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}