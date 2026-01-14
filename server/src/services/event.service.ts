import eventRepository from '../repositories/event.repository';
import headToHeadRepository from '../repositories/head-to-head.repository';
import cacheService from './cache.service';
import { EventStatus } from '../types/models';
import { AppError } from '../middleware/error-handler';

/**
 * Event Service
 * Business logic for event operations
 */
class EventService {
  private readonly CACHE_TTL = 3600; // 1 hour in seconds
  private readonly DETAIL_CACHE_TTL = 900; // 15 minutes in seconds
  private readonly CACHE_PREFIX = 'events:';

  /**
   * List upcoming events with pagination and filters
   */
  async listUpcoming(params: {
    sport?: string;
    dateFrom?: string;
    dateTo?: string;
    league?: string;
    page?: number;
    perPage?: number;
  }) {
    const page = params.page || 1;
    const perPage = Math.min(params.perPage || 20, 100); // Max 100 per page
    const offset = (page - 1) * perPage;

    // Create cache key from params
    const cacheKey = `${this.CACHE_PREFIX}list:${JSON.stringify(params)}`;

    // Try to get from cache
    const cached = await cacheService.get<{
      data: unknown[];
      pagination: unknown;
    }>(cacheKey);

    if (cached) {
      return cached;
    }

    // Parse date filters
    const dateFrom = params.dateFrom ? new Date(params.dateFrom) : new Date();
    const dateTo = params.dateTo ? new Date(params.dateTo) : undefined;

    // Fetch from database
    const [events, total] = await Promise.all([
      eventRepository.findUpcoming({
        sport: params.sport,
        dateFrom,
        dateTo,
        league: params.league,
        limit: perPage,
        offset,
      }),
      eventRepository.countByFilters({
        sport: params.sport,
        dateFrom,
        dateTo,
        league: params.league,
      }),
    ]);

    // Transform to API response format
    const data = events.map((event) => ({
      id: event.id,
      externalId: event.externalId,
      eventName: event.eventName,
      sport: {
        id: event.sport.id,
        name: event.sport.name,
        displayName: event.sport.displayName,
      },
      ...(event.homeTeam && {
        homeTeam: {
          id: event.homeTeam.id,
          name: event.homeTeam.name,
          shortName: event.homeTeam.shortName,
          logoUrl: event.homeTeam.logoUrl,
        },
      }),
      ...(event.awayTeam && {
        awayTeam: {
          id: event.awayTeam.id,
          name: event.awayTeam.name,
          shortName: event.awayTeam.shortName,
          logoUrl: event.awayTeam.logoUrl,
        },
      }),
      ...(event.participant1Name && { participant1Name: event.participant1Name }),
      ...(event.participant2Name && { participant2Name: event.participant2Name }),
      date: event.date.toISOString(),
      venue: event.venue,
      status: event.status as EventStatus,
      league: event.league,
      ...(event.predictions.length > 0 && {
        prediction: {
          id: event.predictions[0].id,
          predictedWinner: event.predictions[0].predictedWinner,
          confidence: event.predictions[0].confidence,
          probabilities: event.predictions[0].probabilities,
          generatedAt: event.predictions[0].generatedAt.toISOString(),
        },
      }),
    }));

    const response = {
      data,
      pagination: {
        page,
        perPage,
        total,
        totalPages: Math.ceil(total / perPage),
      },
    };

    // Cache the response
    await cacheService.set(cacheKey, response, this.CACHE_TTL);

    return response;
  }

  /**
   * List past/completed events with pagination and filters
   */
  async listPastEvents(params: {
    sport?: string;
    dateFrom?: string;
    dateTo?: string;
    league?: string;
    page?: number;
    perPage?: number;
  }) {
    const page = params.page || 1;
    const perPage = Math.min(params.perPage || 20, 100); // Max 100 per page
    const offset = (page - 1) * perPage;

    // Create cache key from params
    const cacheKey = `${this.CACHE_PREFIX}past:${JSON.stringify(params)}`;

    // Try to get from cache
    const cached = await cacheService.get<{
      data: unknown[];
      pagination: unknown;
    }>(cacheKey);

    if (cached) {
      return cached;
    }

    // Parse date filters (for past events, dateTo defaults to now, dateFrom is optional)
    const dateTo = params.dateTo ? new Date(params.dateTo) : new Date();
    const dateFrom = params.dateFrom ? new Date(params.dateFrom) : undefined;

    // Fetch from database
    const [events, total] = await Promise.all([
      eventRepository.findPast({
        sport: params.sport,
        dateFrom,
        dateTo,
        league: params.league,
        limit: perPage,
        offset,
      }),
      eventRepository.countPast({
        sport: params.sport,
        dateFrom,
        dateTo,
        league: params.league,
      }),
    ]);

    // Transform to API response format
    const data = events.map((event) => ({
      id: event.id,
      externalId: event.externalId,
      eventName: event.eventName,
      sport: {
        id: event.sport.id,
        name: event.sport.name,
        displayName: event.sport.displayName,
      },
      ...(event.homeTeam && {
        homeTeam: {
          id: event.homeTeam.id,
          name: event.homeTeam.name,
          shortName: event.homeTeam.shortName,
          logoUrl: event.homeTeam.logoUrl,
        },
      }),
      ...(event.awayTeam && {
        awayTeam: {
          id: event.awayTeam.id,
          name: event.awayTeam.name,
          shortName: event.awayTeam.shortName,
          logoUrl: event.awayTeam.logoUrl,
        },
      }),
      ...(event.participant1Name && { participant1Name: event.participant1Name }),
      ...(event.participant2Name && { participant2Name: event.participant2Name }),
      date: event.date.toISOString(),
      venue: event.venue,
      status: event.status as EventStatus,
      league: event.league,
      homeScore: event.homeScore,
      awayScore: event.awayScore,
      winner: event.winner,
      ...(event.predictions.length > 0 && {
        prediction: {
          id: event.predictions[0].id,
          predictedWinner: event.predictions[0].predictedWinner,
          confidence: event.predictions[0].confidence,
          probabilities: event.predictions[0].probabilities,
          isAccurate: event.predictions[0].isAccurate,
          accuracyNote: event.predictions[0].accuracyNote,
          generatedAt: event.predictions[0].generatedAt.toISOString(),
        },
      }),
    }));

    const totalPages = Math.ceil(total / perPage);

    const result = {
      data,
      pagination: {
        page,
        perPage,
        total,
        totalPages,
      },
    };

    // Cache the response (1 hour TTL)
    await cacheService.set(cacheKey, result, this.CACHE_TTL);

    return result;
  }

  /**
   * Search events by query string
   */
  async searchEvents(params: {
    query: string;
    sport?: string;
    page?: number;
    perPage?: number;
  }) {
    const page = params.page || 1;
    const perPage = Math.min(params.perPage || 20, 100);
    const offset = (page - 1) * perPage;

    // Fetch from database
    const events = await eventRepository.findByFilters({
      query: params.query,
      sport: params.sport,
      limit: perPage,
      offset,
    });

    // Transform to API response format
    const data = events.map((event) => ({
      id: event.id,
      externalId: event.externalId,
      eventName: event.eventName,
      sport: {
        id: event.sport.id,
        name: event.sport.name,
        displayName: event.sport.displayName,
      },
      ...(event.homeTeam && {
        homeTeam: {
          id: event.homeTeam.id,
          name: event.homeTeam.name,
          shortName: event.homeTeam.shortName,
          logoUrl: event.homeTeam.logoUrl,
        },
      }),
      ...(event.awayTeam && {
        awayTeam: {
          id: event.awayTeam.id,
          name: event.awayTeam.name,
          shortName: event.awayTeam.shortName,
          logoUrl: event.awayTeam.logoUrl,
        },
      }),
      ...(event.participant1Name && { participant1Name: event.participant1Name }),
      ...(event.participant2Name && { participant2Name: event.participant2Name }),
      date: event.date.toISOString(),
      venue: event.venue,
      status: event.status as EventStatus,
      league: event.league,
      ...(event.predictions.length > 0 && {
        prediction: {
          id: event.predictions[0].id,
          predictedWinner: event.predictions[0].predictedWinner,
          confidence: event.predictions[0].confidence,
          probabilities: event.predictions[0].probabilities,
          generatedAt: event.predictions[0].generatedAt.toISOString(),
        },
      }),
    }));

    return {
      data,
      pagination: {
        page,
        perPage,
        total: data.length,
        totalPages: Math.ceil(data.length / perPage),
      },
    };
  }

  /**
   * Get detailed event information by ID
   */
  async getEventDetail(eventId: string) {
    // Create cache key
    const cacheKey = `${this.CACHE_PREFIX}detail:${eventId}`;

    // Try to get from cache
    const cached = await cacheService.get<unknown>(cacheKey);

    if (cached) {
      return cached;
    }

    // Fetch from database
    const event = await eventRepository.findById(eventId);

    if (!event) {
      throw new AppError('Event not found', 404);
    }

    // Fetch head-to-head data if team sport
    let headToHead = null;
    if (event.homeTeamId && event.awayTeamId) {
      const h2h = await headToHeadRepository.findByTeams(
        event.homeTeamId,
        event.awayTeamId
      );

      if (h2h) {
        headToHead = {
          totalMatches: h2h.totalMatches,
          team1Wins: h2h.team1Wins,
          team2Wins: h2h.team2Wins,
          draws: h2h.draws,
          lastFiveResults: h2h.lastFiveResults,
          averageGoalsTeam1: h2h.averageGoalsTeam1,
          averageGoalsTeam2: h2h.averageGoalsTeam2,
          lastUpdated: h2h.lastUpdated.toISOString(),
        };
      }
    }

    // Transform to API response format
    const response = {
      id: event.id,
      externalId: event.externalId,
      eventName: event.eventName,
      sport: {
        id: event.sport.id,
        name: event.sport.name,
        displayName: event.sport.displayName,
      },
      ...(event.homeTeam && {
        homeTeam: {
          id: event.homeTeam.id,
          name: event.homeTeam.name,
          shortName: event.homeTeam.shortName,
          logoUrl: event.homeTeam.logoUrl,
        },
      }),
      ...(event.awayTeam && {
        awayTeam: {
          id: event.awayTeam.id,
          name: event.awayTeam.name,
          shortName: event.awayTeam.shortName,
          logoUrl: event.awayTeam.logoUrl,
        },
      }),
      ...(event.participant1Name && { participant1Name: event.participant1Name }),
      ...(event.participant2Name && { participant2Name: event.participant2Name }),
      date: event.date.toISOString(),
      venue: event.venue,
      status: event.status as EventStatus,
      league: event.league,
      season: event.season,
      round: event.round,
      description: event.description,
      homeScore: event.homeScore,
      awayScore: event.awayScore,
      winner: event.winner,
      attendance: event.attendance,
      homeTeamSnapshot: event.homeTeamSnapshot,
      awayTeamSnapshot: event.awayTeamSnapshot,
      snapshotGeneratedAt: event.snapshotGeneratedAt?.toISOString(),
      ...(event.predictions.length > 0 && {
        prediction: {
          id: event.predictions[0].id,
          predictedWinner: event.predictions[0].predictedWinner,
          confidence: event.predictions[0].confidence,
          probabilities: event.predictions[0].probabilities,
          keyFactors: event.predictions[0].keyFactors,
          modelVersion: event.predictions[0].modelVersion,
          generatedAt: event.predictions[0].generatedAt.toISOString(),
          isAccurate: event.predictions[0].isAccurate,
          accuracyNote: event.predictions[0].accuracyNote,
        },
      }),
      ...(headToHead && { headToHead }),
    };

    // Cache the response
    await cacheService.set(cacheKey, response, this.DETAIL_CACHE_TTL);

    return response;
  }
}

export default new EventService();
