const DataAccessLayer = require('./DataAccessLayer');

/**
 * Database data access implementation using PostgreSQL
 * Handles all database operations with proper error handling and connection management
 */
class EventsDataAccess extends DataAccessLayer {
  constructor(pool) {
    super();
    this.pool = pool;
  }

  async getAllEvents(filters = {}, pagination = {}) {
    try {
      let query = `
        SELECT e.*, 
               json_agg(
                 json_build_object(
                   'id', p.id,
                   'predictionDetails', p.prediction_details,
                   'confidenceScore', p.confidence_score,
                   'factorsConsidered', p.factors_considered,
                   'outcome', p.outcome,
                   'accuracy', p.accuracy,
                   'createdAt', p.created_at,
                   'updatedAt', p.updated_at
                 )
               ) FILTER (WHERE p.id IS NOT NULL) as predictions
        FROM events e
        LEFT JOIN predictions p ON e.id = p.event_id
        WHERE 1=1
      `;

      const params = [];
      let paramCount = 1;

      if (filters.sport_type) {
        query += ` AND e.sport_type = $${paramCount}`;
        params.push(filters.sport_type);
        paramCount++;
      }

      if (filters.league) {
        query += ` AND e.league = $${paramCount}`;
        params.push(filters.league);
        paramCount++;
      }

      if (filters.tournament) {
        query += ` AND e.tournament = $${paramCount}`;
        params.push(filters.tournament);
        paramCount++;
      }

      if (filters.status) {
        query += ` AND e.status = $${paramCount}`;
        params.push(filters.status);
        paramCount++;
      }

      query += `
        GROUP BY e.id
        ORDER BY e.event_date ASC
        LIMIT $${paramCount} OFFSET $${paramCount + 1}
      `;

      const limit = parseInt(pagination.limit) || 50;
      const offset = parseInt(pagination.offset) || 0;
      params.push(limit, offset);

      const result = await this.pool.query(query, params);

      return result.rows.map(this._transformEventRow);
    } catch (error) {
      throw new Error(`Failed to get events from database: ${error.message}`);
    }
  }

  async getEventById(id) {
    try {
      const query = `
        SELECT e.*, 
               json_agg(
                 json_build_object(
                   'id', p.id,
                   'predictionDetails', p.prediction_details,
                   'confidenceScore', p.confidence_score,
                   'factorsConsidered', p.factors_considered,
                   'outcome', p.outcome,
                   'accuracy', p.accuracy,
                   'createdAt', p.created_at,
                   'updatedAt', p.updated_at
                 )
               ) FILTER (WHERE p.id IS NOT NULL) as predictions
        FROM events e
        LEFT JOIN predictions p ON e.id = p.event_id
        WHERE e.id = $1
        GROUP BY e.id
      `;

      const result = await this.pool.query(query, [id]);

      if (result.rows.length === 0) {
        return null;
      }

      return this._transformEventRow(result.rows[0]);
    } catch (error) {
      throw new Error(
        `Failed to get event by ID from database: ${error.message}`
      );
    }
  }

  async searchEvents(query, pagination = {}) {
    try {
      const searchQuery = `
        SELECT e.*, 
               json_agg(
                 json_build_object(
                   'id', p.id,
                   'predictionDetails', p.prediction_details,
                   'confidenceScore', p.confidence_score,
                   'factorsConsidered', p.factors_considered,
                   'outcome', p.outcome,
                   'accuracy', p.accuracy,
                   'createdAt', p.created_at,
                   'updatedAt', p.updated_at
                 )
               ) FILTER (WHERE p.id IS NOT NULL) as predictions
        FROM events e
        LEFT JOIN predictions p ON e.id = p.event_id
        WHERE (
          e.teams_involved::text ILIKE $1 OR
          e.venue ILIKE $1 OR
          e.league ILIKE $1 OR
          e.tournament ILIKE $1
        )
        GROUP BY e.id
        ORDER BY e.event_date ASC
        LIMIT $2 OFFSET $3
      `;

      const searchTerm = `%${query}%`;
      const limit = parseInt(pagination.limit) || 50;
      const offset = parseInt(pagination.offset) || 0;

      const result = await this.pool.query(searchQuery, [
        searchTerm,
        limit,
        offset,
      ]);

      return result.rows.map(this._transformEventRow);
    } catch (error) {
      throw new Error(`Failed to search events in database: ${error.message}`);
    }
  }

  async getEventsBySport(sportType, pagination = {}) {
    try {
      return this.getAllEvents({ sport_type: sportType }, pagination);
    } catch (error) {
      throw new Error(
        `Failed to get events by sport from database: ${error.message}`
      );
    }
  }

  async getAllPredictions(filters = {}, pagination = {}) {
    try {
      let query = `
        SELECT p.*, e.sport_type, e.teams_involved, e.event_date, e.venue, e.league
        FROM predictions p
        JOIN events e ON p.event_id = e.id
        WHERE 1=1
      `;

      const params = [];
      let paramCount = 1;

      if (filters.confidence_min) {
        query += ` AND p.confidence_score >= $${paramCount}`;
        params.push(parseFloat(filters.confidence_min));
        paramCount++;
      }

      if (filters.event_id) {
        query += ` AND p.event_id = $${paramCount}`;
        params.push(filters.event_id);
        paramCount++;
      }

      query += `
        ORDER BY p.confidence_score DESC, p.created_at DESC
        LIMIT $${paramCount} OFFSET $${paramCount + 1}
      `;

      const limit = parseInt(pagination.limit) || 50;
      const offset = parseInt(pagination.offset) || 0;
      params.push(limit, offset);

      const result = await this.pool.query(query, params);

      return result.rows.map(this._transformPredictionRow);
    } catch (error) {
      throw new Error(
        `Failed to get predictions from database: ${error.message}`
      );
    }
  }

  async getPredictionsByEventId(eventId) {
    try {
      const query = `
        SELECT * FROM predictions
        WHERE event_id = $1
        ORDER BY created_at DESC
      `;

      const result = await this.pool.query(query, [eventId]);

      return result.rows.map((row) => ({
        id: row.id,
        eventId: row.event_id,
        predictionDetails: row.prediction_details,
        confidenceScore: row.confidence_score,
        factorsConsidered: row.factors_considered,
        outcome: row.outcome,
        accuracy: row.accuracy,
        createdAt: row.created_at,
        updatedAt: row.updated_at,
      }));
    } catch (error) {
      throw new Error(
        `Failed to get predictions by event ID from database: ${error.message}`
      );
    }
  }

  async createEvent(eventData) {
    try {
      const query = `
        INSERT INTO events (sport_type, event_date, venue, teams_involved, weather_conditions, historical_data, league, tournament, status)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
        RETURNING *
      `;

      const values = [
        eventData.sportType,
        eventData.eventDate,
        eventData.venue,
        JSON.stringify(eventData.teamsInvolved),
        eventData.weatherConditions
          ? JSON.stringify(eventData.weatherConditions)
          : null,
        eventData.historicalData
          ? JSON.stringify(eventData.historicalData)
          : null,
        eventData.league,
        eventData.tournament,
        eventData.status || 'upcoming',
      ];

      const result = await this.pool.query(query, values);

      return this._transformEventRow(result.rows[0]);
    } catch (error) {
      throw new Error(`Failed to create event in database: ${error.message}`);
    }
  }

  async createPrediction(predictionData) {
    try {
      const query = `
        INSERT INTO predictions (event_id, prediction_details, confidence_score, factors_considered)
        VALUES ($1, $2, $3, $4)
        RETURNING *
      `;

      const values = [
        predictionData.eventId,
        JSON.stringify(predictionData.predictionDetails),
        predictionData.confidenceScore,
        JSON.stringify(predictionData.factorsConsidered),
      ];

      const result = await this.pool.query(query, values);

      const row = result.rows[0];
      return {
        id: row.id,
        eventId: row.event_id,
        predictionDetails: row.prediction_details,
        confidenceScore: row.confidence_score,
        factorsConsidered: row.factors_considered,
        outcome: row.outcome,
        accuracy: row.accuracy,
        createdAt: row.created_at,
        updatedAt: row.updated_at,
      };
    } catch (error) {
      throw new Error(
        `Failed to create prediction in database: ${error.message}`
      );
    }
  }

  async updatePrediction(id, updateData) {
    try {
      const query = `
        UPDATE predictions 
        SET outcome = $1, accuracy = $2, updated_at = CURRENT_TIMESTAMP
        WHERE id = $3
        RETURNING *
      `;

      const result = await this.pool.query(query, [
        updateData.outcome,
        updateData.accuracy,
        id,
      ]);

      if (result.rows.length === 0) {
        return null;
      }

      const row = result.rows[0];
      return {
        id: row.id,
        eventId: row.event_id,
        predictionDetails: row.prediction_details,
        confidenceScore: row.confidence_score,
        factorsConsidered: row.factors_considered,
        outcome: row.outcome,
        accuracy: row.accuracy,
        createdAt: row.created_at,
        updatedAt: row.updated_at,
      };
    } catch (error) {
      throw new Error(
        `Failed to update prediction in database: ${error.message}`
      );
    }
  }

  _transformEventRow(row) {
    return {
      id: row.id,
      sportType: row.sport_type,
      eventDate: row.event_date,
      venue: row.venue,
      teamsInvolved: row.teams_involved,
      weatherConditions: row.weather_conditions,
      historicalData: row.historical_data,
      league: row.league,
      tournament: row.tournament,
      status: row.status,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
      predictions: row.predictions || [],
    };
  }

  _transformPredictionRow(row) {
    return {
      id: row.id,
      eventId: row.event_id,
      predictionDetails: row.prediction_details,
      confidenceScore: row.confidence_score,
      factorsConsidered: row.factors_considered,
      outcome: row.outcome,
      accuracy: row.accuracy,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
      event: {
        sportType: row.sport_type,
        teamsInvolved: row.teams_involved,
        eventDate: row.event_date,
        venue: row.venue,
        league: row.league,
      },
    };
  }
}

module.exports = EventsDataAccess;
