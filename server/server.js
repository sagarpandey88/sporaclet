const express = require('express');
const { Pool } = require('pg');
const cors = require('cors');
require('dotenv').config();

// Import data access layers
const MockDataAccess = require('./src/data-access/MockDataAccess');
const EventsDataAccess = require('./src/data-access/EventsDataAccess');

// Import route factories
const createEventsRouter = require('./src/routes/events');
const createPredictionsRouter = require('./src/routes/predictions');
const schedulerRouter = require('./src/routes/scheduler');

// Import utilities
const logger = require('./src/utils/logger');

const app = express();
const port = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Request logging middleware
app.use((req, res, next) => {
  logger.http(`${req.method} ${req.path}`, {
    ip: req.ip,
    userAgent: req.get('User-Agent'),
  });
  next();
});

// Initialize data access layer
let dataAccess;

// Try to initialize database connection, fallback to mock data
const initializeDataAccess = async () => {
  try {
    if (process.env.DATABASE_URL) {
      console.log('Attempting to connect to PostgreSQL database...');

      const pool = new Pool({
        connectionString: process.env.DATABASE_URL,
        ssl:
          process.env.NODE_ENV === 'production'
            ? { rejectUnauthorized: false }
            : false,
      });

      // Test database connection
      const client = await pool.connect();
      console.log('✓ Connected to PostgreSQL database');
      client.release();

      dataAccess = new EventsDataAccess(pool);
      console.log('✓ Using EventsDataAccess');
    } else {
      throw new Error('DATABASE_URL not configured');
    }
  } catch (error) {
    console.warn('⚠ Database connection failed, falling back to mock data');
    console.warn('Error:', error.message);
    dataAccess = new MockDataAccess();
    console.log('✓ Using MockDataAccess');
  }
};

// Initialize data access layer
initializeDataAccess()
  .then(() => {
    // Setup routes with dependency injection
    app.use('/api/events', createEventsRouter(dataAccess));
    app.use('/api/predictions', createPredictionsRouter(dataAccess));
    app.use('/api/scheduler', schedulerRouter);

    // Health check endpoint
    app.get('/health', (req, res) => {
      res.json({
        status: 'OK',
        timestamp: new Date().toISOString(),
        dataAccess: dataAccess.constructor.name,
        environment: process.env.NODE_ENV || 'development',
        scheduler: {
          enabled: process.env.SCHEDULER_ENABLED === 'true',
          provider: process.env.AI_MODEL_PROVIDER || 'openai',
        },
      });
    });

    // API info endpoint
    app.get('/api', (req, res) => {
      res.json({
        name: 'Sports Prediction API',
        version: '1.0.0',
        dataAccess: dataAccess.constructor.name,
        features: {
          aiPredictions: true,
          scheduler: process.env.SCHEDULER_ENABLED === 'true',
          aiProvider: process.env.AI_MODEL_PROVIDER || 'openai',
        },
        endpoints: {
          events: {
            'GET /api/events': 'Get all events with optional filtering',
            'GET /api/events/search': 'Search events by query',
            'GET /api/events/sport/:sportType': 'Get events by sport type',
            'GET /api/events/:id': 'Get single event by ID',
            'POST /api/events': 'Create new event',
          },
          predictions: {
            'GET /api/predictions':
              'Get all predictions with optional filtering',
            'GET /api/predictions/event/:eventId':
              'Get predictions for specific event',
            'POST /api/predictions': 'Create new prediction',
            'PATCH /api/predictions/:id': 'Update prediction outcome',
          },
          scheduler: {
            'GET /api/scheduler/status': 'Get scheduler status',
            'POST /api/scheduler/trigger': 'Trigger manual scheduler run',
            'GET /api/scheduler/config': 'Get scheduler configuration',
            'GET /api/scheduler/stats': 'Get scheduler statistics',
            'GET /api/scheduler/health': 'Scheduler health check',
          },
          utility: {
            'GET /health': 'API health check',
            'GET /api': 'API information',
          },
        },
      });
    });

    // Error handling middleware
    app.use((err, req, res, next) => {
      logger.error('Unhandled error', {
        error: err.message,
        stack: err.stack,
        path: req.path,
        method: req.method,
      });

      res.status(500).json({
        success: false,
        error: 'Internal server error',
        message:
          process.env.NODE_ENV === 'development'
            ? err.message
            : 'Something went wrong',
      });
    });

    // 404 handler
    app.use((req, res) => {
      res.status(404).json({
        success: false,
        error: 'Route not found',
        availableEndpoints: '/api',
      });
    });

    // Start server
    app.listen(port, () => {
      console.log(`\n🚀 Sports Prediction API running on port ${port}`);
      console.log(`📊 Data Access Layer: ${dataAccess.constructor.name}`);
      console.log(
        `🤖 AI Scheduler: ${
          process.env.SCHEDULER_ENABLED === 'true' ? 'Enabled' : 'Disabled'
        }`
      );
      console.log(`🌐 API Documentation: http://localhost:${port}/api`);
      console.log(`❤️  Health Check: http://localhost:${port}/health`);

      if (process.env.SCHEDULER_ENABLED === 'true') {
        console.log(
          `📅 Scheduler API: http://localhost:${port}/api/scheduler/status`
        );
      }
      console.log('');

      logger.info('Server started successfully', {
        port,
        dataAccess: dataAccess.constructor.name,
        schedulerEnabled: process.env.SCHEDULER_ENABLED === 'true',
      });
    });
  })
  .catch((error) => {
    console.error('Failed to initialize application:', error);
    logger.error('Application initialization failed', {
      error: error.message,
      stack: error.stack,
    });
    process.exit(1);
  });

module.exports = app;
