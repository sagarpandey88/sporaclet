const PredictionScheduler = require('./PredictionScheduler');
const { testConnection } = require('../config/database');
const logger = require('../utils/logger');

/**
 * Scheduler entry point
 * Handles initialization, startup, and graceful shutdown
 */

let scheduler = null;

/**
 * Initialize and start the scheduler
 */
async function startScheduler() {
  try {
    logger.info('🚀 Starting Sports Prediction Scheduler');
    
    // Test database connection
    const dbConnected = await testConnection();
    if (!dbConnected) {
      throw new Error('Database connection failed');
    }

    // Create and start scheduler
    scheduler = new PredictionScheduler();
    await scheduler.start();

    logger.info('✅ Scheduler started successfully');
    
    // Log initial status
    const status = scheduler.getStatus();
    logger.info('📊 Scheduler Status', status);

  } catch (error) {
    logger.error('❌ Failed to start scheduler', {
      error: error.message,
      stack: error.stack
    });
    process.exit(1);
  }
}

/**
 * Graceful shutdown handler
 */
async function shutdown(signal) {
  logger.info(`🛑 Received ${signal}, shutting down gracefully`);
  
  if (scheduler) {
    scheduler.stop();
    logger.info('✅ Scheduler stopped');
  }
  
  // Close database connections
  try {
    const { sequelize } = require('../config/database');
    await sequelize.close();
    logger.info('✅ Database connections closed');
  } catch (error) {
    logger.error('❌ Error closing database connections', { error: error.message });
  }
  
  logger.info('👋 Scheduler shutdown complete');
  process.exit(0);
}

/**
 * Setup process event handlers
 */
function setupEventHandlers() {
  // Graceful shutdown on SIGTERM and SIGINT
  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT', () => shutdown('SIGINT'));

  // Handle uncaught exceptions
  process.on('uncaughtException', (error) => {
    logger.error('💥 Uncaught Exception', {
      error: error.message,
      stack: error.stack
    });
    
    // Attempt graceful shutdown
    if (scheduler) {
      scheduler.stop();
    }
    process.exit(1);
  });

  // Handle unhandled promise rejections
  process.on('unhandledRejection', (reason, promise) => {
    logger.error('💥 Unhandled Rejection', {
      reason: reason?.message || reason,
      promise: promise.toString()
    });
    
    // Attempt graceful shutdown
    if (scheduler) {
      scheduler.stop();
    }
    process.exit(1);
  });

  // Log process warnings
  process.on('warning', (warning) => {
    logger.warn('⚠️ Process Warning', {
      name: warning.name,
      message: warning.message,
      stack: warning.stack
    });
  });
}

/**
 * Main execution
 */
async function main() {
  // Setup event handlers first
  setupEventHandlers();
  
  // Load environment variables
  require('dotenv').config();
  
  // Start scheduler
  await startScheduler();
  
  // Keep process alive
  logger.info('🔄 Scheduler is running... Press Ctrl+C to stop');
}

// Export for testing and external usage
module.exports = {
  startScheduler,
  shutdown,
  getScheduler: () => scheduler
};

// Run if this file is executed directly
if (require.main === module) {
  main().catch((error) => {
    logger.error('💥 Fatal error during startup', {
      error: error.message,
      stack: error.stack
    });
    process.exit(1);
  });
}