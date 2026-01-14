import eventRepository from '../repositories/event.repository';
import cacheService from './cache.service';
import { EventStatus } from '../types/models';

/**
 * Search Service
 * Business logic for search operations
 */
class SearchService {
  private readonly CACHE_TTL = 300; // 5 minutes in seconds
  private readonly CACHE_PREFIX = 'search:';
  private readonly MIN_QUERY_LENGTH = 3;

  /**
   * Search events across all statuses (upcoming and past)
   */
  async searchEvents(params: {
    query: string;
    sport?: string;
    page?: number;
    perPage?: number;
  }) {
    // Validate query length
    if (params.query.length < this.MIN_QUERY_LENGTH) {
      return {
        data: [],
        pagination: {
          page: 1,
          perPage: params.perPage || 20,
          total: 0,
          totalPages: 0,
        },
        message: `Query must be at least ${this.MIN_QUERY_LENGTH} characters`,
      };
    }

    const page = params.page || 1;
    const perPage = Math.min(params.perPage || 20, 100); // Max 100 per page
    const offset = (page - 1) * perPage;

    // Create cache key from params
    const cacheKey = `${this.CACHE_PREFIX}${JSON.stringify(params)}`;

    // Try to get from cache
    const cached = await cacheService.get<{
      data: unknown[];
      pagination: unknown;
    }>(cacheKey);

    if (cached) {
      return cached;
    }

    // Fetch from database
    const [events, total] = await Promise.all([
      eventRepository.fullTextSearch({
        query: params.query,
        sport: params.sport,
        limit: perPage,
        offset,
      }),
      eventRepository.countSearchResults({
        query: params.query,
        sport: params.sport,
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

    // Cache the response (5 minutes TTL)
    await cacheService.set(cacheKey, result, this.CACHE_TTL);

    return result;
  }

  /**
   * Get autocomplete suggestions for search
   * Returns limited results without pagination for quick suggestions
   */
  async getAutocompleteSuggestions(params: {
    query: string;
    sport?: string;
    limit?: number;
  }) {
    // Validate query length
    if (params.query.length < this.MIN_QUERY_LENGTH) {
      return {
        suggestions: [],
        message: `Query must be at least ${this.MIN_QUERY_LENGTH} characters`,
      };
    }

    const limit = Math.min(params.limit || 10, 20); // Max 20 suggestions

    // Create cache key from params
    const cacheKey = `${this.CACHE_PREFIX}autocomplete:${JSON.stringify(params)}`;

    // Try to get from cache
    const cached = await cacheService.get<{ suggestions: unknown[] }>(cacheKey);

    if (cached) {
      return cached;
    }

    // Fetch from database
    const events = await eventRepository.fullTextSearch({
      query: params.query,
      sport: params.sport,
      limit,
      offset: 0,
    });

    // Transform to simplified suggestion format
    const suggestions = events.map((event) => ({
      id: event.id,
      eventName: event.eventName,
      date: event.date.toISOString(),
      sport: event.sport.displayName,
      teams: event.homeTeam && event.awayTeam
        ? `${event.homeTeam.shortName} vs ${event.awayTeam.shortName}`
        : `${event.participant1Name} vs ${event.participant2Name}`,
      status: event.status as EventStatus,
    }));

    const result = { suggestions };

    // Cache the response (5 minutes TTL)
    await cacheService.set(cacheKey, result, this.CACHE_TTL);

    return result;
  }
}

export default new SearchService();
