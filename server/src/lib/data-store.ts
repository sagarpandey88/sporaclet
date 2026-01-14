/**
 * Simple in-memory data store to replace Prisma
 * This provides a simplified data layer without external database dependencies
 */

import {
  Sport,
  Team,
  Player,
  Event,
  Prediction,
  Injury,
  HeadToHead,
  EventStatus,
  WinnerType,
  ConfidenceLevel,
} from '../types/models';

// In-memory data stores
const sports: Map<string, Sport> = new Map();
const teams: Map<string, Team> = new Map();
const players: Map<string, Player> = new Map();
const events: Map<string, Event> = new Map();
const predictions: Map<string, Prediction> = new Map();
const injuries: Map<string, Injury> = new Map();
const headToHeads: Map<string, HeadToHead> = new Map();

// Helper function to generate UUID-like IDs
function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
}

// Initialize with some sample data
function initializeSampleData() {
  // Sample Sports
  const football: Sport = {
    id: 'sport-1',
    name: 'football',
    displayName: 'Football',
    hasTeams: true,
    playerPositions: ['GK', 'DF', 'MF', 'FW'],
    visualizationType: 'field',
    createdAt: new Date(),
    updatedAt: new Date(),
  };
  sports.set(football.id, football);

  const basketball: Sport = {
    id: 'sport-2',
    name: 'basketball',
    displayName: 'Basketball',
    hasTeams: true,
    playerPositions: ['PG', 'SG', 'SF', 'PF', 'C'],
    visualizationType: 'court',
    createdAt: new Date(),
    updatedAt: new Date(),
  };
  sports.set(basketball.id, basketball);

  // Sample Teams
  const team1: Team = {
    id: 'team-1',
    externalId: 'ext-team-1',
    name: 'Manchester United',
    shortName: 'Man Utd',
    sportId: football.id,
    country: 'England',
    league: 'Premier League',
    founded: 1878,
    logoUrl: 'https://example.com/logos/manutd.png',
    venue: 'Old Trafford',
    venueCapacity: 74879,
    description: 'Manchester United Football Club',
    createdAt: new Date(),
    updatedAt: new Date(),
  };
  teams.set(team1.id, team1);

  const team2: Team = {
    id: 'team-2',
    externalId: 'ext-team-2',
    name: 'Liverpool FC',
    shortName: 'Liverpool',
    sportId: football.id,
    country: 'England',
    league: 'Premier League',
    founded: 1892,
    logoUrl: 'https://example.com/logos/liverpool.png',
    venue: 'Anfield',
    venueCapacity: 53394,
    description: 'Liverpool Football Club',
    createdAt: new Date(),
    updatedAt: new Date(),
  };
  teams.set(team2.id, team2);

  // Sample Events
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);

  const event1: Event = {
    id: 'event-1',
    externalId: 'ext-event-1',
    sportId: football.id,
    homeTeamId: team1.id,
    awayTeamId: team2.id,
    participant1Name: null,
    participant2Name: null,
    eventName: 'Manchester United vs Liverpool FC',
    venue: 'Old Trafford',
    date: tomorrow,
    status: EventStatus.upcoming,
    league: 'Premier League',
    season: '2023-24',
    round: '15',
    homeScore: null,
    awayScore: null,
    winner: null,
    attendance: null,
    description: 'Premier League Match',
    homeTeamSnapshot: null,
    awayTeamSnapshot: null,
    snapshotGeneratedAt: null,
    isDeleted: false,
    createdAt: new Date(),
    updatedAt: new Date(),
  };
  events.set(event1.id, event1);

  // Sample Prediction
  const prediction1: Prediction = {
    id: 'pred-1',
    eventId: event1.id,
    probabilities: { home: 0.45, away: 0.35, draw: 0.20 },
    predictedWinner: WinnerType.home,
    confidence: ConfidenceLevel.medium,
    keyFactors: ['Home advantage', 'Recent form', 'Head-to-head record'],
    modelVersion: '1.0.0',
    generatedAt: new Date(),
    isAccurate: null,
    accuracyNote: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  };
  predictions.set(prediction1.id, prediction1);

  // Sample Head-to-Head
  const h2h: HeadToHead = {
    id: 'h2h-1',
    team1Id: team1.id,
    team2Id: team2.id,
    totalMatches: 5,
    team1Wins: 2,
    team2Wins: 2,
    draws: 1,
    lastFiveResults: ['W', 'L', 'D', 'W', 'L'],
    averageGoalsTeam1: 1.6,
    averageGoalsTeam2: 1.8,
    lastUpdated: new Date(),
    createdAt: new Date(),
    updatedAt: new Date(),
  };
  headToHeads.set(h2h.id, h2h);
}

// Initialize data on module load
initializeSampleData();

/**
 * DataStore class - simplified database abstraction
 */
class DataStore {
  // Sport operations
  sport = {
    findMany: async (options?: { orderBy?: { displayName?: 'asc' | 'desc' } }) => {
      let result = Array.from(sports.values());
      if (options?.orderBy?.displayName === 'asc') {
        result.sort((a, b) => a.displayName.localeCompare(b.displayName));
      }
      return result;
    },
    findUnique: async (options: { where: { id?: string; name?: string } }) => {
      if (options.where.id) {
        return sports.get(options.where.id) || null;
      }
      if (options.where.name) {
        return Array.from(sports.values()).find((s) => s.name === options.where.name) || null;
      }
      return null;
    },
  };

  // Team operations
  team = {
    findUnique: async (options: { where: { id?: string; externalId?: string }; include?: unknown }) => {
      let team: Team | undefined;
      if (options.where.id) {
        team = teams.get(options.where.id);
      } else if (options.where.externalId) {
        team = Array.from(teams.values()).find((t) => t.externalId === options.where.externalId);
      }
      return team || null;
    },
    findMany: async (options: { where?: { sportId?: string; league?: string }; orderBy?: { name?: 'asc' | 'desc' } }) => {
      let result = Array.from(teams.values());
      if (options.where?.sportId) {
        result = result.filter((t) => t.sportId === options.where!.sportId);
      }
      if (options.where?.league) {
        result = result.filter((t) => t.league === options.where!.league);
      }
      if (options.orderBy?.name === 'asc') {
        result.sort((a, b) => a.name.localeCompare(b.name));
      }
      return result;
    },
    create: async (options: { data: Partial<Team> }) => {
      const team: Team = {
        id: options.data.id || generateId(),
        externalId: options.data.externalId!,
        name: options.data.name!,
        shortName: options.data.shortName!,
        sportId: options.data.sportId!,
        country: options.data.country!,
        league: options.data.league!,
        founded: options.data.founded || null,
        logoUrl: options.data.logoUrl || null,
        venue: options.data.venue || null,
        venueCapacity: options.data.venueCapacity || null,
        description: options.data.description || null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      teams.set(team.id, team);
      return team;
    },
    update: async (options: { where: { id: string }; data: Partial<Team> }) => {
      const team = teams.get(options.where.id);
      if (!team) throw new Error('Team not found');
      const updated = { ...team, ...options.data, updatedAt: new Date() };
      teams.set(options.where.id, updated);
      return updated;
    },
  };

  // Event operations
  event = {
    findMany: async (options: {
      where?: {
        status?: EventStatus;
        isDeleted?: boolean;
        date?: { gte?: Date; lte?: Date };
        sport?: { name?: string };
        league?: { contains?: string; mode?: string };
        eventName?: { contains?: string; mode?: string };
        homeTeam?: unknown;
        awayTeam?: unknown;
        participant1Name?: { contains?: string; mode?: string };
        participant2Name?: { contains?: string; mode?: string };
        venue?: { contains?: string; mode?: string };
        OR?: unknown[];
      };
      include?: unknown;
      orderBy?: { date?: 'asc' | 'desc' };
      take?: number;
      skip?: number;
    }) => {
      let result = Array.from(events.values());

      // Apply filters
      if (options.where) {
        if (options.where.status) {
          result = result.filter((e) => e.status === options.where!.status);
        }
        if (options.where.isDeleted !== undefined) {
          result = result.filter((e) => e.isDeleted === options.where!.isDeleted);
        }
        if (options.where.date?.gte) {
          result = result.filter((e) => e.date >= options.where!.date!.gte!);
        }
        if (options.where.date?.lte) {
          result = result.filter((e) => e.date <= options.where!.date!.lte!);
        }
        if (options.where.sport?.name) {
          result = result.filter((e) => {
            const sport = sports.get(e.sportId);
            return sport?.name === options.where!.sport!.name;
          });
        }
        if (options.where.league?.contains) {
          const searchTerm = options.where.league.contains.toLowerCase();
          result = result.filter((e) => e.league?.toLowerCase().includes(searchTerm));
        }
        if (options.where.eventName?.contains) {
          const searchTerm = options.where.eventName.contains.toLowerCase();
          result = result.filter((e) => e.eventName.toLowerCase().includes(searchTerm));
        }
        if (options.where.participant1Name?.contains) {
          const searchTerm = options.where.participant1Name.contains.toLowerCase();
          result = result.filter((e) => e.participant1Name?.toLowerCase().includes(searchTerm));
        }
        if (options.where.participant2Name?.contains) {
          const searchTerm = options.where.participant2Name.contains.toLowerCase();
          result = result.filter((e) => e.participant2Name?.toLowerCase().includes(searchTerm));
        }
        if (options.where.venue?.contains) {
          const searchTerm = options.where.venue.contains.toLowerCase();
          result = result.filter((e) => e.venue?.toLowerCase().includes(searchTerm));
        }
      }

      // Apply ordering
      if (options.orderBy?.date === 'asc') {
        result.sort((a, b) => a.date.getTime() - b.date.getTime());
      } else if (options.orderBy?.date === 'desc') {
        result.sort((a, b) => b.date.getTime() - a.date.getTime());
      }

      // Apply pagination
      if (options.skip) {
        result = result.slice(options.skip);
      }
      if (options.take) {
        result = result.slice(0, options.take);
      }

      // Include related data if needed
      if (options.include) {
        return result.map((event) => {
          const sport = sports.get(event.sportId);
          const homeTeam = event.homeTeamId ? teams.get(event.homeTeamId) : null;
          const awayTeam = event.awayTeamId ? teams.get(event.awayTeamId) : null;
          const eventPredictions = Array.from(predictions.values())
            .filter((p) => p.eventId === event.id)
            .sort((a, b) => b.generatedAt.getTime() - a.generatedAt.getTime())
            .slice(0, 1);

          return {
            ...event,
            sport: sport ? { id: sport.id, name: sport.name, displayName: sport.displayName } : null,
            homeTeam: homeTeam ? { id: homeTeam.id, name: homeTeam.name, shortName: homeTeam.shortName, logoUrl: homeTeam.logoUrl } : null,
            awayTeam: awayTeam ? { id: awayTeam.id, name: awayTeam.name, shortName: awayTeam.shortName, logoUrl: awayTeam.logoUrl } : null,
            predictions: eventPredictions,
          };
        });
      }

      return result;
    },
    findUnique: async (options: { where: { id: string }; include?: unknown }) => {
      const event = events.get(options.where.id);
      if (!event) return null;

      if (options.include) {
        const sport = sports.get(event.sportId);
        const homeTeam = event.homeTeamId ? teams.get(event.homeTeamId) : null;
        const awayTeam = event.awayTeamId ? teams.get(event.awayTeamId) : null;
        const eventPredictions = Array.from(predictions.values())
          .filter((p) => p.eventId === event.id)
          .sort((a, b) => b.generatedAt.getTime() - a.generatedAt.getTime())
          .slice(0, 1);

        return {
          ...event,
          sport: sport ? { id: sport.id, name: sport.name, displayName: sport.displayName } : null,
          homeTeam: homeTeam ? { id: homeTeam.id, name: homeTeam.name, shortName: homeTeam.shortName, logoUrl: homeTeam.logoUrl } : null,
          awayTeam: awayTeam ? { id: awayTeam.id, name: awayTeam.name, shortName: awayTeam.shortName, logoUrl: awayTeam.logoUrl } : null,
          predictions: eventPredictions,
        };
      }

      return event;
    },
    count: async (options: { where?: unknown }) => {
      const result = await dataStore.event.findMany({ where: options.where as any });
      return result.length;
    },
  };

  // Prediction operations
  prediction = {
    findFirst: async (options: { where: { eventId: string }; orderBy?: { generatedAt?: 'desc' } }) => {
      const result = Array.from(predictions.values()).filter((p) => p.eventId === options.where.eventId);
      if (options.orderBy?.generatedAt === 'desc') {
        result.sort((a, b) => b.generatedAt.getTime() - a.generatedAt.getTime());
      }
      return result[0] || null;
    },
    create: async (options: { data: Partial<Prediction> }) => {
      const prediction: Prediction = {
        id: generateId(),
        eventId: options.data.eventId!,
        probabilities: options.data.probabilities!,
        predictedWinner: options.data.predictedWinner!,
        confidence: options.data.confidence!,
        keyFactors: options.data.keyFactors!,
        modelVersion: options.data.modelVersion!,
        generatedAt: new Date(),
        isAccurate: null,
        accuracyNote: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      predictions.set(prediction.id, prediction);
      return prediction;
    },
    update: async (options: { where: { id: string }; data: Partial<Prediction> }) => {
      const prediction = predictions.get(options.where.id);
      if (!prediction) throw new Error('Prediction not found');
      const updated = { ...prediction, ...options.data, updatedAt: new Date() };
      predictions.set(options.where.id, updated);
      return updated;
    },
    count: async (options?: { where?: { isAccurate?: boolean | null } }) => {
      let result = Array.from(predictions.values());
      if (options?.where) {
        if (options.where.isAccurate !== undefined) {
          result = result.filter((p) => p.isAccurate === options.where!.isAccurate);
        }
      }
      return result.length;
    },
  };

  // HeadToHead operations
  headToHead = {
    findFirst: async (options: { where: { team1Id: string; team2Id: string } }) => {
      return (
        Array.from(headToHeads.values()).find(
          (h) =>
            (h.team1Id === options.where.team1Id && h.team2Id === options.where.team2Id) ||
            (h.team1Id === options.where.team2Id && h.team2Id === options.where.team1Id)
        ) || null
      );
    },
  };

  // Player operations
  player = {
    findMany: async (options: { where?: { teamId?: string; sportId?: string }; orderBy?: { displayName?: 'asc' } }) => {
      let result = Array.from(players.values());
      if (options.where?.teamId) {
        result = result.filter((p) => p.teamId === options.where!.teamId);
      }
      if (options.where?.sportId) {
        result = result.filter((p) => p.sportId === options.where!.sportId);
      }
      if (options.orderBy?.displayName === 'asc') {
        result.sort((a, b) => a.displayName.localeCompare(b.displayName));
      }
      return result;
    },
  };

  // Injury operations
  injury = {
    findMany: async (options: { where?: { playerId?: string; status?: string } }) => {
      let result = Array.from(injuries.values());
      if (options.where?.playerId) {
        result = result.filter((i) => i.playerId === options.where!.playerId);
      }
      if (options.where?.status) {
        result = result.filter((i) => i.status === options.where!.status);
      }
      return result;
    },
  };

  // Disconnect method for graceful shutdown
  async $disconnect() {
    // No-op for in-memory store
    return Promise.resolve();
  }
}

const dataStore = new DataStore();
export default dataStore;
