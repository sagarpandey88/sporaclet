const express = require('express');
const router = express.Router();

/**
 * Predictions routes with dependency injection for data access layer
 * @param {DataAccessLayer} dataAccess - Data access layer implementation
 */
function createPredictionsRouter(dataAccess) {
  // Get all predictions
  router.get('/', async (req, res) => {
    try {
      const { confidence_min, event_id, limit = 50, offset = 0 } = req.query;
      
      const filters = {};
      if (confidence_min) filters.confidence_min = confidence_min;
      if (event_id) filters.event_id = event_id;
      
      const pagination = { limit: parseInt(limit), offset: parseInt(offset) };
      
      const predictions = await dataAccess.getAllPredictions(filters, pagination);
      
      res.json({
        success: true,
        data: predictions,
        pagination: {
          limit: parseInt(limit),
          offset: parseInt(offset),
          total: predictions.length
        }
      });
    } catch (error) {
      console.error('Error fetching predictions:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch predictions',
        message: error.message
      });
    }
  });

  // Get predictions by event ID
  router.get('/event/:eventId', async (req, res) => {
    try {
      const { eventId } = req.params;
      const predictions = await dataAccess.getPredictionsByEventId(eventId);
      
      res.json({
        success: true,
        data: predictions,
        eventId
      });
    } catch (error) {
      console.error('Error fetching predictions by event ID:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch predictions for event',
        message: error.message
      });
    }
  });

  // Create new prediction
  router.post('/', async (req, res) => {
    try {
      const predictionData = req.body;
      
      // Basic validation
      const requiredFields = ['eventId', 'predictionDetails', 'confidenceScore', 'factorsConsidered'];
      const missingFields = requiredFields.filter(field => !predictionData[field]);
      
      if (missingFields.length > 0) {
        return res.status(400).json({
          success: false,
          error: 'Missing required fields',
          missingFields
        });
      }
      
      // Validate confidence score
      if (predictionData.confidenceScore < 0 || predictionData.confidenceScore > 100) {
        return res.status(400).json({
          success: false,
          error: 'Confidence score must be between 0 and 100'
        });
      }
      
      const prediction = await dataAccess.createPrediction(predictionData);
      
      res.status(201).json({
        success: true,
        data: prediction,
        message: 'Prediction created successfully'
      });
    } catch (error) {
      console.error('Error creating prediction:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to create prediction',
        message: error.message
      });
    }
  });

  // Update prediction outcome
  router.patch('/:id', async (req, res) => {
    try {
      const { id } = req.params;
      const { outcome, accuracy } = req.body;
      
      if (!outcome) {
        return res.status(400).json({
          success: false,
          error: 'Outcome is required'
        });
      }
      
      if (accuracy !== undefined && (accuracy < 0 || accuracy > 100)) {
        return res.status(400).json({
          success: false,
          error: 'Accuracy must be between 0 and 100'
        });
      }
      
      const prediction = await dataAccess.updatePrediction(id, { outcome, accuracy });
      
      if (!prediction) {
        return res.status(404).json({
          success: false,
          error: 'Prediction not found'
        });
      }
      
      res.json({
        success: true,
        data: prediction,
        message: 'Prediction updated successfully'
      });
    } catch (error) {
      console.error('Error updating prediction:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to update prediction',
        message: error.message
      });
    }
  });

  return router;
}

module.exports = createPredictionsRouter;