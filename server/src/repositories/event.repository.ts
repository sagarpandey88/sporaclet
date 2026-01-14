import db from '../lib/db';
import { Event, Prediction, EventStatus } from '../types/models';

/**
 * Event with relations type
 */
type EventWithRelations = Event & {
  sport: {
    id: string;
    name: string;
    displayName: string;
  };
  homeTeam?: {
    id: string;
    name: string;
    shortName: string;
    logoUrl: string | null;
  } | null;
  awayTeam?: {
    id: string;
    name: string;
    shortName: string;
    logoUrl: string | null;
  } | null;
  predictions: Prediction[];
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
      conditions.push(`s.name = $${paramCount++}`);
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
        ht.name ILIKE $${paramCount} OR
        at.name ILIKE $${paramCount} OR
        e."participant1Name" ILIKE $${paramCount} OR
        e."participant2Name" ILIKE $${paramCount} OR
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
   * Fetch events with relations
   */
  private async fetchEventsWithRelations(
    whereClause: string,
    params: any[],
    orderBy: string,
    limit?: number,
    offset?: number
  ): Promise<EventWithRelations[]> {
    const limitClause = limit ? `LIMIT $${params.length + 1}` : '';
    const offsetClause = offset !== undefined ? `OFFSET $${params.length + (limit ? 2 : 1)}` : '';
    
    if (limit) params.push(limit);
    if (offset !== undefined) params.push(offset);

    const query = `
      SELECT 
        e.*,
        s.id as "sport_id", s.name as "sport_name", s."displayName" as "sport_displayName",
        ht.id as "homeTeam_id", ht.name as "homeTeam_name", ht."shortName" as "homeTeam_shortName", ht."logoUrl" as "homeTeam_logoUrl",
        at.id as "awayTeam_id", at.name as "awayTeam_name", at."shortName" as "awayTeam_shortName", at."logoUrl" as "awayTeam_logoUrl"
      FROM events e
      INNER JOIN sports s ON e."sportId" = s.id
      LEFT JOIN teams ht ON e."homeTeamId" = ht.id
      LEFT JOIN teams at ON e."awayTeamId" = at.id
      ${whereClause}
      ${orderBy}
      ${limitClause} ${offsetClause}
    `;

    const result = await db.query(query, params);
    
    // Fetch predictions for each event
    const eventIds = result.rows.map(r => r.id);
    const predictions: Map<string, Prediction[]> = new Map();
    
    if (eventIds.length > 0) {
      const predQuery = `
        SELECT * FROM predictions 
        WHERE "eventId" = ANY($1)
        ORDER BY "generatedAt" DESC
      `;
      const predResult = await db.query<Prediction>(predQuery, [eventIds]);
      
      for (const pred of predResult.rows) {
        if (!predictions.has(pred.eventId)) {
          predictions.set(pred.eventId, []);
        }
        predictions.get(pred.eventId)!.push(pred);
      }
    }

    return result.rows.map(row => ({
      id: row.id,
      externalId: row.externalId,
      sportId: row.sportId,
      homeTeamId: row.homeTeamId,
      awayTeamId: row.awayTeamId,
      participant1Name: row.participant1Name,
      participant2Name: row.participant2Name,
      eventName: row.eventName,
      venue: row.venue,
      date: row.date,
      status: row.status,
      league: row.league,
      season: row.season,
      round: row.round,
      homeScore: row.homeScore,
      awayScore: row.awayScore,
      winner: row.winner,
      attendance: row.attendance,
      description: row.description,
      homeTeamSnapshot: row.homeTeamSnapshot,
      awayTeamSnapshot: row.awayTeamSnapshot,
      snapshotGeneratedAt: row.snapshotGeneratedAt,
      isDeleted: row.isDeleted,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
      sport: {
        id: row.sport_id,
        name: row.sport_name,
        displayName: row.sport_displayName,
      },
      homeTeam: row.homeTeam_id ? {
        id: row.homeTeam_id,
        name: row.homeTeam_name,
        shortName: row.homeTeam_shortName,
        logoUrl: row.homeTeam_logoUrl,
      } : null,
      awayTeam: row.awayTeam_id ? {
        id: row.awayTeam_id,
        name: row.awayTeam_name,
        shortName: row.awayTeam_shortName,
        logoUrl: row.awayTeam_logoUrl,
      } : null,
      predictions: predictions.get(row.id)?.slice(0, 1) || [],
    }));
  }

  /**
   * Find upcoming events with filters
   */
  async findUpcoming(filters: {
    sport?: string;
    dateFrom?: Date;
    dateTo?: Date;
    league?: string;
    limit?: number;
    offset?: number;
  }): Promise<EventWithRelations[]> {
    const { where, params } = this.buildWhereClause({
      status: EventStatus.upcoming,
      isDeleted: false,
      dateFrom: filters.dateFrom || new Date(),
      dateTo: filters.dateTo,
      sport: filters.sport,
      league: filters.league,
    });

    return this.fetchEventsWithRelations(
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
    limit?: number;
    offset?: number;
  }): Promise<EventWithRelations[]> {
    const { where, params } = this.buildWhereClause({
      status: EventStatus.completed,
      isDeleted: false,
      dateFrom: filters.dateFrom,
      dateTo: filters.dateTo || new Date(),
      sport: filters.sport,
      league: filters.league,
    });

    return this.fetchEventsWithRelations(
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
  }): Promise<number> {
    const { where, params } = this.buildWhereClause({
      status: EventStatus.upcoming,
      isDeleted: false,
      dateFrom: filters.dateFrom || new Date(),
      dateTo: filters.dateTo,
      sport: filters.sport,
      league: filters.league,
    });

    const query = `
      SELECT COUNT(*)::int as count
      FROM events e
      INNER JOIN sports s ON e."sportId" = s.id
      LEFT JOIN teams ht ON e."homeTeamId" = ht.id
      LEFT JOIN teams at ON e."awayTeamId" = at.id
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
  }): Promise<number> {
    const { where, params } = this.buildWhereClause({
      status: EventStatus.completed,
      isDeleted: false,
      dateFrom: filters.dateFrom,
      dateTo: filters.dateTo || new Date(),
      sport: filters.sport,
      league: filters.league,
    });

    const query = `
      SELECT COUNT(*)::int as count
      FROM events e
      INNER JOIN sports s ON e."sportId" = s.id
      LEFT JOIN teams ht ON e."homeTeamId" = ht.id
      LEFT JOIN teams at ON e."awayTeamId" = at.id
      ${where}
    `;

    const result = await db.query<{ count: number }>(query, params);
    return result.rows[0].count;
  }

  /**
   * Find event by ID
   */
  async findById(id: string): Promise<EventWithRelations | null> {
    const events = await this.fetchEventsWithRelations(
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
  }): Promise<EventWithRelations[]> {
    const { where, params } = this.buildWhereClause({
      status: EventStatus.upcoming,
      isDeleted: false,
      dateFrom: new Date(),
      query: filters.query,
      sport: filters.sport,
    });

    return this.fetchEventsWithRelations(
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
  }): Promise<EventWithRelations[]> {
    const { where, params } = this.buildWhereClause({
      isDeleted: false,
      query: filters.query,
      sport: filters.sport,
    });

    return this.fetchEventsWithRelations(
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
      INNER JOIN sports s ON e."sportId" = s.id
      LEFT JOIN teams ht ON e."homeTeamId" = ht.id
      LEFT JOIN teams at ON e."awayTeamId" = at.id
      ${where}
    `;

    const result = await db.query<{ count: number }>(query, params);
    return result.rows[0].count;
  }
}

export default new EventRepository();
