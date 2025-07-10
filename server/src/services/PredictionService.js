const AIPrediction = require('../models/AIPrediction');
const AIModelFactory = require('../ai/AIModelFactory');
const SportsDataService = require('./SportsDataService');
const logger = require('../utils/logger');

/**
 * Service for generating and managing AI predictions
 * Orchestrates data fetching, AI model interaction, and result storage
 */
class PredictionService {
  constructor() {
    this.sportsDataService = new SportsDataService();
    this.aiModelFactory = AIModelFactory;
  }

  /**
   * Generate predictions for upcoming events
   * @param {Object} options - Generation options
   * @returns {Promise<Array>} Generated predictions
   */
  async generatePredictions(options = {}) {
    const {
      sport = 'all',
      limit = 10,
      aiProvider = null,
      modelName = null
    } = options;

    logger.info('Starting prediction generation', { sport, limit, aiProvider });

    try {
      // Fetch upcoming events
      const events = await this.sportsDataService.getUpcomingEvents({
        sport,
        limit,
        days: 7
      });

      logger.info(`Fetched ${events.length} upcoming events`);

      if (events.length === 0) {
        logger.warn('No upcoming events found');
        return [];
      }

      // Create AI model instance
      const aiModel = this.aiModelFactory.createModel(aiProvider, {
        modelName
      });

      logger.info('AI model created', aiModel.getModelInfo());

      // Generate predictions for each event
      const predictions = [];
      for (const event of events) {
        try {
          const prediction = await this.generateSinglePrediction(event, aiModel);
          predictions.push(prediction);
          
          // Add delay between requests to respect rate limits
          await this.delay(1000);
        } catch (error) {
          logger.error('Failed to generate prediction for event', {
            eventId: event.id,
            error: error.message
          });
          
          // Store failed prediction
          await this.storePrediction(event, null, aiModel, error.message);
        }
      }

      logger.info(`Generated ${predictions.length} predictions successfully`);
      return predictions;

    } catch (error) {
      logger.error('Prediction generation failed', { error: error.message });
      throw error;
    }
  }

  /**
   * Generate prediction for a single event
   * @param {Object} event - Event data
   * @param {AIModelInterface} aiModel - AI model instance
   * @returns {Promise<Object>} Generated prediction
   */
  async generateSinglePrediction(event, aiModel) {
    logger.info('Generating prediction for event', { eventId: event.id, sport: event.sportType });

    try {
      // Enrich event data with additional information
      const enrichedData = await this.enrichEventData(event);

      // Generate prediction using AI model
      const predictionResult = await aiModel.generatePrediction(enrichedData);

      // Store prediction in database
      const storedPrediction = await this.storePrediction(
        event,
        predictionResult,
        aiModel
      );

      logger.info('Prediction generated and stored', {
        predictionId: storedPrediction.id,
        confidence: predictionResult.confidenceScore
      });

      return storedPrediction;

    } catch (error) {
      logger.error('Single prediction generation failed', {
        eventId: event.id,
        error: error.message
      });
      throw error;
    }
  }

  /**
   * Enrich event data with additional context
   * @param {Object} event - Base event data
   * @returns {Promise<Object>} Enriched event data
   */
  async enrichEventData(event) {
    const enrichedData = { ...event };

    try {
      // Add weather data for outdoor sports
      const outdoorSports = ['Football', 'Baseball', 'Tennis', 'American Football'];
      if (outdoorSports.includes(event.sportType) && event.venue) {
        enrichedData.weatherConditions = await this.sportsDataService.getWeatherData(
          event.venue,
          event.eventDate
        );
      }

      // Add team statistics
      if (event.teams) {
        if (event.teams.home) {
          enrichedData.homeTeamStats = await this.sportsDataService.getTeamStats(
            event.teams.home.name,
            event.sportType
          );
        }
        if (event.teams.away) {
          enrichedData.awayTeamStats = await this.sportsDataService.getTeamStats(
            event.teams.away.name,
            event.sportType
          );
        }
        if (event.teams.player1) {
          enrichedData.player1Stats = await this.sportsDataService.getTeamStats(
            event.teams.player1.name,
            event.sportType
          );
        }
        if (event.teams.player2) {
          enrichedData.player2Stats = await this.sportsDataService.getTeamStats(
            event.teams.player2.name,
            event.sportType
          );
        }
      }

      // Add historical data (mock for now)
      enrichedData.historicalData = this.generateMockHistoricalData(event);

    } catch (error) {
      logger.warn('Failed to enrich event data', {
        eventId: event.id,
        error: error.message
      });
    }

    return enrichedData;
  }

  /**
   * Store prediction in database
   * @param {Object} event - Event data
   * @param {Object} predictionResult - AI prediction result
   * @param {AIModelInterface} aiModel - AI model used
   * @param {string} errorMessage - Error message if prediction failed
   * @returns {Promise<Object>} Stored prediction record
   */
  async storePrediction(event, predictionResult, aiModel, errorMessage = null) {
    try {
      const predictionData = {
        eventId: event.id,
        sportType: event.sportType,
        eventDate: event.eventDate,
        teams: event.teams,
        aiModel: aiModel.modelName,
        aiProvider: aiModel.provider,
        status: errorMessage ? 'failed' : 'completed',
        errorMessage
      };

      if (predictionResult) {
        predictionData.prediction = predictionResult.prediction;
        predictionData.confidenceScore = predictionResult.confidenceScore;
        predictionData.reasoning = predictionResult.reasoning;
        predictionData.inputData = {
          event,
          keyFactors: predictionResult.keyFactors
        };
        predictionData.processingTime = predictionResult.metadata?.processingTime;
        predictionData.tokensUsed = predictionResult.metadata?.tokensUsed;
      }

      const storedPrediction = await AIPrediction.create(predictionData);
      
      logger.info('Prediction stored in database', {
        predictionId: storedPrediction.id,
        status: storedPrediction.status
      });

      return storedPrediction;

    } catch (error) {
      logger.error('Failed to store prediction', {
        eventId: event.id,
        error: error.message
      });
      throw error;
    }
  }

  /**
   * Generate mock historical data
   * @param {Object} event - Event data
   * @returns {Object} Mock historical data
   */
  generateMockHistoricalData(event) {
    if (event.sportType === 'Tennis') {
      return {
        headToHead: {
          player1: Math.floor(Math.random() * 10) + 1,
          player2: Math.floor(Math.random() * 10) + 1
        },
        lastMeeting: {
          date: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString(),
          result: 'Player 1 def. Player 2 6-4, 7-6'
        }
      };
    } else {
      return {
        headToHead: {
          home: Math.floor(Math.random() * 20) + 5,
          away: Math.floor(Math.random() * 20) + 5,
          draws: Math.floor(Math.random() * 10)
        },
        lastMeeting: {
          date: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(),
          result: 'Home 2-1 Away'
        }
      };
    }
  }

  /**
   * Utility function to add delay
   * @param {number} ms - Milliseconds to delay
   * @returns {Promise} Promise that resolves after delay
   */
  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Get prediction statistics
   * @returns {Promise<Object>} Prediction statistics
   */
  async getPredictionStats() {
    try {
      const stats = await AIPrediction.findAll({
        attributes: [
          'aiProvider',
          'aiModel',
          'status',
          [AIPrediction.sequelize.fn('COUNT', '*'), 'count'],
          [AIPrediction.sequelize.fn('AVG', AIPrediction.sequelize.col('confidence_score')), 'avgConfidence'],
          [AIPrediction.sequelize.fn('AVG', AIPrediction.sequelize.col('processing_time_ms')), 'avgProcessingTime']
        ],
        group: ['aiProvider', 'aiModel', 'status'],
        raw: true
      });

      return stats;
    } catch (error) {
      logger.error('Failed to get prediction stats', { error: error.message });
      throw error;
    }
  }
}

module.exports = PredictionService;