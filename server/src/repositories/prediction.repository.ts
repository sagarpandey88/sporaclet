import db from '../lib/db';
import { Prediction, WinnerType, ConfidenceLevel } from '../types/models';

/**
 * Prediction Repository
 * Handles all database operations for predictions
 */
class PredictionRepository {
  /**
   * Find latest prediction for an event
   */
  async findLatestByEvent(eventId: string): Promise<Prediction | null> {
    const result = await db.query<Prediction>(
      `SELECT * FROM predictions 
       WHERE "eventId" = $1 
       ORDER BY "generatedAt" DESC 
       LIMIT 1`,
      [eventId]
    );
    return result.rows[0] || null;
  }

  /**
   * Create a new prediction
   */
  async create(data: {
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
   * Update prediction accuracy after event completion
   */
  async updateAccuracy(
    id: string,
    isAccurate: boolean,
    accuracyNote?: string
  ): Promise<Prediction> {
    const result = await db.query<Prediction>(
      `UPDATE predictions 
       SET "isAccurate" = $1, "accuracyNote" = $2, "updatedAt" = NOW()
       WHERE id = $3
       RETURNING *`,
      [isAccurate, accuracyNote || null, id]
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
