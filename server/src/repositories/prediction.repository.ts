import prisma from '../lib/prisma';
import { Prediction, WinnerType, ConfidenceLevel } from '@prisma/client';

/**
 * Prediction Repository
 * Handles all database operations for predictions
 */
class PredictionRepository {
  /**
   * Find latest prediction for an event
   */
  async findLatestByEvent(eventId: string): Promise<Prediction | null> {
    return prisma.prediction.findFirst({
      where: {
        eventId,
      },
      orderBy: {
        generatedAt: 'desc',
      },
    });
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
    return prisma.prediction.create({
      data: {
        eventId: data.eventId,
        probabilities: data.probabilities,
        predictedWinner: data.predictedWinner,
        confidence: data.confidence,
        keyFactors: data.keyFactors,
        modelVersion: data.modelVersion,
      },
    });
  }

  /**
   * Update prediction accuracy after event completion
   */
  async updateAccuracy(
    id: string,
    isAccurate: boolean,
    accuracyNote?: string
  ): Promise<Prediction> {
    return prisma.prediction.update({
      where: { id },
      data: {
        isAccurate,
        accuracyNote,
      },
    });
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
    const [total, accurate, inaccurate, pending] = await Promise.all([
      prisma.prediction.count(),
      prisma.prediction.count({ where: { isAccurate: true } }),
      prisma.prediction.count({ where: { isAccurate: false } }),
      prisma.prediction.count({ where: { isAccurate: null } }),
    ]);

    return { total, accurate, inaccurate, pending };
  }
}

export default new PredictionRepository();
