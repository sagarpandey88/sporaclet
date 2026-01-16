import db from '../lib/db';
import { Event, Prediction, EventStatus } from '../types/models';

/**
 * Event with relations type
 */
type EventWithPrediction = Event & {
  prediction?: Prediction | null;
};

/**
 * Event Repository
 * Handles all database operations for events
 */
class EventRepository {
  /**
   * Build WHERE clause for event filters
   */
  private buildWhereClause(filters: {
    sport?: string;
    dateFrom?: Date;
    dateTo?: Date;
    league?: string;
    status?: EventStatus;
    isDeleted?: boolean;
    query?: string;
  }): { where: string; params: any[] } {
    const conditions: string[] = [];
    const params: any[] = [];
    let paramCount = 1;

    if (filters.status) {
      conditions.push(`e.status = $${paramCount++}`);
      params.push(filters.status);
    }

    if (filters.isDeleted !== undefined) {
      conditions.push(`e."isDeleted" = $${paramCount++}`);
      params.push(filters.isDeleted);
    }

    if (filters.dateFrom) {
      conditions.push(`e.date >= $${paramCount++}`);
      params.push(filters.dateFrom);
    }

    if (filters.dateTo) {
      conditions.push(`e.date <= $${paramCount++}`);
      params.push(filters.dateTo);
    }

    if (filters.sport) {
        conditions.push(`e.sport = $${paramCount++}`);
      params.push(filters.sport);
    }

    if (filters.league) {
      conditions.push(`e.league ILIKE $${paramCount++}`);
      params.push(`%${filters.league}%`);
    }

    if (filters.query) {
      const searchPattern = `%${filters.query}%`;
      conditions.push(`(
        e."eventName" ILIKE $${paramCount} OR
        e."homeTeam"->>'name' ILIKE $${paramCount} OR
        e."awayTeam"->>'name' ILIKE $${paramCount} OR
        e.venue ILIKE $${paramCount} OR
        e.league ILIKE $${paramCount}
      )`);
      params.push(searchPattern);
      paramCount++;
    }

    const where = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
    return { where, params };
  }

  /**
   * Fetch events with predictions
   */
  private async fetchEventsWithPrediction(
    whereClause: string,
    params: any[],
    orderBy: string,
    limit?: number,
    offset?: number
  ): Promise<EventWithPrediction[]> {
    const limitClause = limit ? `LIMIT $${params.length + 1}` : '';
    const offsetClause = offset !== undefined ? `OFFSET $${params.length + (limit ? 2 : 1)}` : '';
    
    if (limit) params.push(limit);
    if (offset !== undefined) params.push(offset);

    const query = `
      SELECT 
        e.*,
        p.id as "prediction_id",
        p.probabilities as "prediction_probabilities",
        p."predictedWinner" as "prediction_predictedWinner",
        p.confidence as "prediction_confidence",
        p."keyFactors" as "prediction_keyFactors",
        p."modelVersion" as "prediction_modelVersion",
        p."generatedAt" as "prediction_generatedAt",
        p."isAccurate" as "prediction_isAccurate",
        p."accuracyNote" as "prediction_accuracyNote",
        p."createdAt" as "prediction_createdAt",
        p."updatedAt" as "prediction_updatedAt"
      FROM events e
      LEFT JOIN predictions p ON e.id = p."eventId"
      ${whereClause}
      ${orderBy}
      ${limitClause} ${offsetClause}
    `;

    const result = await db.query(query, params);

    return result.rows.map(row => {
      const event: EventWithPrediction = {
        id: row.id,
        externalId: row.externalId,
        eventName: row.eventName,
        date: row.date,
        status: row.status,
        venue: row.venue,
        league: row.league,
        season: row.season,
        winner: row.winner,
        description: row.description,
        sport: row.sport,
        homeTeam: row.homeTeam,
        awayTeam: row.awayTeam,
        homeTeamPlayers: row.homeTeamPlayers,
        awayTeamPlayers: row.awayTeamPlayers,
        injuries: row.injuries,
        headToHead: row.headToHead,
        homeTeamSnapshot: row.homeTeamSnapshot,
        awayTeamSnapshot: row.awayTeamSnapshot,
        isDeleted: row.isDeleted,
        createdAt: row.createdAt,
        updatedAt: row.updatedAt,
      };

      if (row.prediction_id) {
        event.prediction = {
          id: row.prediction_id,
          eventId: row.id,
          probabilities: row.prediction_probabilities,
          predictedWinner: row.prediction_predictedWinner,
          confidence: row.prediction_confidence,
          keyFactors: row.prediction_keyFactors,
          modelVersion: row.prediction_modelVersion,
          generatedAt: row.prediction_generatedAt,
          isAccurate: row.prediction_isAccurate,
          accuracyNote: row.prediction_accuracyNote,
          createdAt: row.prediction_createdAt,
          updatedAt: row.prediction_updatedAt,
        };
      }

      return event;
    });
  }

  /**
   * Find upcoming events with filters
   */
  async findUpcoming(filters: {
    sport?: string;
    dateFrom?: Date;
    dateTo?: Date;
    league?: string;
    query?: string;
    limit?: number;
    offset?: number;
  }): Promise<EventWithPrediction[]> {
    const { where, params } = this.buildWhereClause({
      status: EventStatus.upcoming,
      isDeleted: false,
      dateFrom: filters.dateFrom || new Date(),
      dateTo: filters.dateTo,
      sport: filters.sport,
      league: filters.league,
      query: filters.query,
    });

    console.log('Upcoming Events Where Clause:', where, 'Params:', params);

    return this.fetchEventsWithPrediction(
      where,
      params,
      'ORDER BY e.date ASC',
      filters.limit,
      filters.offset
    );
  }

  /**
   * Find past/completed events with filters
   */
  async findPast(filters: {
    sport?: string;
    dateFrom?: Date;
    dateTo?: Date;
    league?: string;
    query?: string;
    limit?: number;
    offset?: number;
  }): Promise<EventWithPrediction[]> {
    const { where, params } = this.buildWhereClause({
      status: EventStatus.completed,
      isDeleted: false,
      dateFrom: filters.dateFrom,
      dateTo: filters.dateTo || new Date(),
      sport: filters.sport,
      league: filters.league,
      query: filters.query,
    });

    return this.fetchEventsWithPrediction(
      where,
      params,
      'ORDER BY e.date DESC',
      filters.limit,
      filters.offset
    );
  }

  /**
   * Count events by filters
   */
  async countByFilters(filters: {
    sport?: string;
    dateFrom?: Date;
    dateTo?: Date;
    league?: string;
    query?: string;
  }): Promise<number> {
    const { where, params } = this.buildWhereClause({
      status: EventStatus.upcoming,
      isDeleted: false,
      dateFrom: filters.dateFrom || new Date(),
      dateTo: filters.dateTo,
      sport: filters.sport,
      league: filters.league,
      query: filters.query,
    });

    const query = `
      SELECT COUNT(*)::int as count
      FROM events e
      ${where}
    `;

    const result = await db.query<{ count: number }>(query, params);
    return result.rows[0].count;
  }

  /**
   * Count past/completed events with filters
   */
  async countPast(filters: {
    sport?: string;
    dateFrom?: Date;
    dateTo?: Date;
    league?: string;
    query?: string;
  }): Promise<number> {
    const { where, params } = this.buildWhereClause({
      status: EventStatus.completed,
      isDeleted: false,
      dateFrom: filters.dateFrom,
      dateTo: filters.dateTo || new Date(),
      sport: filters.sport,
      league: filters.league,
      query: filters.query,
    });

    const query = `
      SELECT COUNT(*)::int as count
      FROM events e
      ${where}
    `;

    const result = await db.query<{ count: number }>(query, params);
    return result.rows[0].count;
  }

  /**
   * Find event by ID
   */
  async findById(id: string): Promise<EventWithPrediction | null> {
    const events = await this.fetchEventsWithPrediction(
      'WHERE e.id = $1',
      [id],
      '',
      1
    );
    return events[0] || null;
  }

  /**
   * Search events by team name or other filters
   */
  async findByFilters(filters: {
    query?: string;
    sport?: string;
    limit?: number;
    offset?: number;
  }): Promise<EventWithPrediction[]> {
    const { where, params } = this.buildWhereClause({
      status: EventStatus.upcoming,
      isDeleted: false,
      dateFrom: new Date(),
      query: filters.query,
      sport: filters.sport,
    });

    return this.fetchEventsWithPrediction(
      where,
      params,
      'ORDER BY e.date ASC',
      filters.limit,
      filters.offset
    );
  }

  /**
   * Full-text search across events
   */
  async fullTextSearch(filters: {
    query: string;
    sport?: string;
    limit?: number;
    offset?: number;
  }): Promise<EventWithPrediction[]> {
    const { where, params } = this.buildWhereClause({
      isDeleted: false,
      query: filters.query,
      sport: filters.sport,
    });

    return this.fetchEventsWithPrediction(
      where,
      params,
      'ORDER BY e.date ASC',
      filters.limit,
      filters.offset
    );
  }

  /**
   * Count search results
   */
  async countSearchResults(filters: {
    query: string;
    sport?: string;
  }): Promise<number> {
    const { where, params } = this.buildWhereClause({
      isDeleted: false,
      query: filters.query,
      sport: filters.sport,
    });

    const query = `
      SELECT COUNT(*)::int as count
      FROM events e
      ${where}
    `;

    const result = await db.query<{ count: number }>(query, params);
    return result.rows[0].count;
  }
}

export default new EventRepository();
