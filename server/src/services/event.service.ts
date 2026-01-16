import eventRepository from '../repositories/event.repository';
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
    query?: string;
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
    // const cached = await cacheService.get<{
    //   data: unknown[];
    //   pagination: unknown;
    // }>(cacheKey);

    // if (cached) {
    //   return cached;
    // }

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
        query: params.query,
        limit: perPage,
        offset,
      }),
      eventRepository.countByFilters({
        sport: params.sport,
        dateFrom,
        dateTo,
        league: params.league,
        query: params.query,
      }),
    ]);

    // Transform to API response format
    const data = events.map((event) => ({
      id: event.id,
      externalId: event.externalId,
      eventName: event.eventName,
      sport: event.sport,
      ...(event.homeTeam && { homeTeam: event.homeTeam }),
      ...(event.awayTeam && { awayTeam: event.awayTeam }),
      date: event.date.toISOString(),
      venue: event.venue,
      status: event.status as EventStatus,
      league: event.league,
      ...(event.prediction && {
        prediction: {
          id: event.prediction.id,
          predictedWinner: event.prediction.predictedWinner,
          confidence: event.prediction.confidence,
          probabilities: event.prediction.probabilities,
          generatedAt: event.prediction.generatedAt.toISOString(),
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
      sport: event.sport,
      ...(event.homeTeam && { homeTeam: event.homeTeam }),
      ...(event.awayTeam && { awayTeam: event.awayTeam }),
      date: event.date.toISOString(),
      venue: event.venue,
      status: event.status as EventStatus,
      league: event.league,
      winner: event.winner,
      ...(event.prediction && {
        prediction: {
          id: event.prediction.id,
          predictedWinner: event.prediction.predictedWinner,
          confidence: event.prediction.confidence,
          probabilities: event.prediction.probabilities,
          isAccurate: event.prediction.isAccurate,
          accuracyNote: event.prediction.accuracyNote,
          generatedAt: event.prediction.generatedAt.toISOString(),
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
      sport: event.sport,
      ...(event.homeTeam && { homeTeam: event.homeTeam }),
      ...(event.awayTeam && { awayTeam: event.awayTeam }),
      date: event.date.toISOString(),
      venue: event.venue,
      status: event.status as EventStatus,
      league: event.league,
      ...(event.prediction && {
        prediction: {
          id: event.prediction.id,
          predictedWinner: event.prediction.predictedWinner,
          confidence: event.prediction.confidence,
          probabilities: event.prediction.probabilities,
          generatedAt: event.prediction.generatedAt.toISOString(),
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

    // Transform to API response format
    const response = {
      id: event.id,
      externalId: event.externalId,
      eventName: event.eventName,
      sport: event.sport,
      ...(event.homeTeam && { homeTeam: event.homeTeam }),
      ...(event.awayTeam && { awayTeam: event.awayTeam }),
      date: event.date.toISOString(),
      venue: event.venue,
      status: event.status as EventStatus,
      league: event.league,
      season: event.season,
      description: event.description,
      winner: event.winner,
      homeTeamSnapshot: event.homeTeamSnapshot,
      awayTeamSnapshot: event.awayTeamSnapshot,
      ...(event.homeTeamPlayers && { homeTeamPlayers: event.homeTeamPlayers }),
      ...(event.awayTeamPlayers && { awayTeamPlayers: event.awayTeamPlayers }),
      ...(event.injuries && { injuries: event.injuries }),
      ...(event.headToHead && { headToHead: event.headToHead }),
      ...(event.prediction && {
        prediction: {
          id: event.prediction.id,
          predictedWinner: event.prediction.predictedWinner,
          confidence: event.prediction.confidence,
          probabilities: event.prediction.probabilities,
          keyFactors: event.prediction.keyFactors,
          modelVersion: event.prediction.modelVersion,
          generatedAt: event.prediction.generatedAt.toISOString(),
          isAccurate: event.prediction.isAccurate,
          accuracyNote: event.prediction.accuracyNote,
        },
      }),
    };

    // Cache the response
    await cacheService.set(cacheKey, response, this.DETAIL_CACHE_TTL);

    return response;
  }
}

export default new EventService();
