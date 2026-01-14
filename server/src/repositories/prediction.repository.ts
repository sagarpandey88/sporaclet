import db from '../lib/db';
import { Prediction, WinnerType, ConfidenceLevel } from '../types/models';

/**
 * Prediction Repository
 * Handles all database operations for predictions
 */
class PredictionRepository {
  /**
   * Find prediction for an event (one-to-one relationship)
   */
  async findByEvent(eventId: string): Promise<Prediction | null> {
    const result = await db.query<Prediction>(
      `SELECT * FROM predictions WHERE "eventId" = $1`,
      [eventId]
    );
    return result.rows[0] || null;
  }

  /**
   * Alias for backward compatibility
   */
  async findLatestByEvent(eventId: string): Promise<Prediction | null> {
    return this.findByEvent(eventId);
  }

  /**
   * Create or update a prediction (upsert - enforces one per event)
   */
  async upsert(data: {
    eventId: string;
    probabilities: Record<string, number>;
    predictedWinner: WinnerType;
    confidence: ConfidenceLevel;
    keyFactors: string[];
    modelVersion: string;
  }): Promise<Prediction> {
    const result = await db.query<Prediction>(
      `INSERT INTO predictions (
        "eventId", probabilities, "predictedWinner", confidence, 
        "keyFactors", "modelVersion"
      ) VALUES ($1, $2, $3, $4, $5, $6)
      ON CONFLICT ("eventId") 
      DO UPDATE SET
        probabilities = EXCLUDED.probabilities,
        "predictedWinner" = EXCLUDED."predictedWinner",
        confidence = EXCLUDED.confidence,
        "keyFactors" = EXCLUDED."keyFactors",
        "modelVersion" = EXCLUDED."modelVersion",
        "generatedAt" = NOW(),
        "updatedAt" = NOW()
      RETURNING *`,
      [
        data.eventId,
        JSON.stringify(data.probabilities),
        data.predictedWinner,
        data.confidence,
        JSON.stringify(data.keyFactors),
        data.modelVersion,
      ]
    );
    return result.rows[0];
  }

  /**
   * Create a new prediction (for backward compatibility - uses upsert)
   */
  async create(data: {
    eventId: string;
    probabilities: Record<string, number>;
    predictedWinner: WinnerType;
    confidence: ConfidenceLevel;
    keyFactors: string[];
    modelVersion: string;
  }): Promise<Prediction> {
    return this.upsert(data);
  }

  /**
   * Update prediction accuracy after event completion
   */
  async updateAccuracy(
    eventId: string,
    isAccurate: boolean,
    accuracyNote?: string
  ): Promise<Prediction> {
    const result = await db.query<Prediction>(
      `UPDATE predictions 
       SET "isAccurate" = $1, "accuracyNote" = $2, "updatedAt" = NOW()
       WHERE "eventId" = $3
       RETURNING *`,
      [isAccurate, accuracyNote || null, eventId]
    );
    return result.rows[0];
  }

  /**
   * Get prediction statistics
   */
  async getAccuracyStats(): Promise<{
    total: number;
    accurate: number;
    inaccurate: number;
    pending: number;
  }> {
    const result = await db.query<{
      total: string;
      accurate: string;
      inaccurate: string;
      pending: string;
    }>(`
      SELECT 
        COUNT(*)::int AS total,
        COUNT(*) FILTER (WHERE "isAccurate" = true)::int AS accurate,
        COUNT(*) FILTER (WHERE "isAccurate" = false)::int AS inaccurate,
        COUNT(*) FILTER (WHERE "isAccurate" IS NULL)::int AS pending
      FROM predictions
    `);

    return {
      total: parseInt(result.rows[0].total),
      accurate: parseInt(result.rows[0].accurate),
      inaccurate: parseInt(result.rows[0].inaccurate),
      pending: parseInt(result.rows[0].pending),
    };
  }
}

export default new PredictionRepository();
