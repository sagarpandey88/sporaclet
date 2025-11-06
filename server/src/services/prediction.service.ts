import predictionRepository from '../repositories/prediction.repository';

/**
 * Prediction Service
 * Business logic for prediction operations
 */
class PredictionService {
  /**
   * Get the latest prediction for an event
   */
  async getLatestPrediction(eventId: string) {
    const prediction = await predictionRepository.findLatestByEvent(eventId);

    if (!prediction) {
      return null;
    }

    return {
      id: prediction.id,
      eventId: prediction.eventId,
      probabilities: prediction.probabilities,
      predictedWinner: prediction.predictedWinner,
      confidence: prediction.confidence,
      keyFactors: prediction.keyFactors,
      modelVersion: prediction.modelVersion,
      generatedAt: prediction.generatedAt.toISOString(),
      isAccurate: prediction.isAccurate,
      accuracyNote: prediction.accuracyNote,
    };
  }

  /**
   * Get prediction accuracy statistics
   */
  async getAccuracyStats() {
    const stats = await predictionRepository.getAccuracyStats();
    
    const accuracyRate = stats.total > 0 
      ? (stats.accurate / (stats.accurate + stats.inaccurate)) * 100 
      : 0;

    return {
      ...stats,
      accuracyRate: Math.round(accuracyRate * 10) / 10, // Round to 1 decimal
    };
  }
}

export default new PredictionService();
