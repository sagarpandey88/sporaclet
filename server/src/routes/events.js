const express = require('express');
const router = express.Router();

/**
 * Events routes with dependency injection for data access layer
 * @param {DataAccessLayer} dataAccess - Data access layer implementation
 */
function createEventsRouter(dataAccess) {
  // Get all events
  router.get('/', async (req, res) => {
    try {
      const { sport_type, league, tournament, status, limit = 50, offset = 0 } = req.query;
      
      const filters = {};
      if (sport_type) filters.sport_type = sport_type;
      if (league) filters.league = league;
      if (tournament) filters.tournament = tournament;
      if (status) filters.status = status;
      
      const pagination = { limit: parseInt(limit), offset: parseInt(offset) };
      
      const events = await dataAccess.getAllEvents(filters, pagination);
      
      res.json({
        success: true,
        data: events,
        pagination: {
          limit: parseInt(limit),
          offset: parseInt(offset),
          total: events.length
        }
      });
    } catch (error) {
      console.error('Error fetching events:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch events',
        message: error.message
      });
    }
  });

  // Search events
  router.get('/search', async (req, res) => {
    try {
      const { q: query, limit = 50, offset = 0 } = req.query;
      
      if (!query) {
        return res.status(400).json({
          success: false,
          error: 'Search query is required'
        });
      }
      
      const pagination = { limit: parseInt(limit), offset: parseInt(offset) };
      const events = await dataAccess.searchEvents(query, pagination);
      
      res.json({
        success: true,
        data: events,
        query,
        pagination: {
          limit: parseInt(limit),
          offset: parseInt(offset),
          total: events.length
        }
      });
    } catch (error) {
      console.error('Error searching events:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to search events',
        message: error.message
      });
    }
  });

  // Get events by sport
  router.get('/sport/:sportType', async (req, res) => {
    try {
      const { sportType } = req.params;
      const { limit = 50, offset = 0 } = req.query;
      
      const pagination = { limit: parseInt(limit), offset: parseInt(offset) };
      const events = await dataAccess.getEventsBySport(sportType, pagination);
      
      res.json({
        success: true,
        data: events,
        sportType,
        pagination: {
          limit: parseInt(limit),
          offset: parseInt(offset),
          total: events.length
        }
      });
    } catch (error) {
      console.error('Error fetching events by sport:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch events by sport',
        message: error.message
      });
    }
  });

  // Get single event by ID
  router.get('/:id', async (req, res) => {
    try {
      const { id } = req.params;
      const event = await dataAccess.getEventById(id);
      
      if (!event) {
        return res.status(404).json({
          success: false,
          error: 'Event not found'
        });
      }
      
      res.json({
        success: true,
        data: event
      });
    } catch (error) {
      console.error('Error fetching event:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch event',
        message: error.message
      });
    }
  });

  // Create new event
  router.post('/', async (req, res) => {
    try {
      const eventData = req.body;
      
      // Basic validation
      const requiredFields = ['sportType', 'eventDate', 'venue', 'teamsInvolved'];
      const missingFields = requiredFields.filter(field => !eventData[field]);
      
      if (missingFields.length > 0) {
        return res.status(400).json({
          success: false,
          error: 'Missing required fields',
          missingFields
        });
      }
      
      const event = await dataAccess.createEvent(eventData);
      
      res.status(201).json({
        success: true,
        data: event,
        message: 'Event created successfully'
      });
    } catch (error) {
      console.error('Error creating event:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to create event',
        message: error.message
      });
    }
  });

  return router;
}

module.exports = createEventsRouter;