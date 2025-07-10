const cron = require('node-cron');
const PredictionService = require('../services/PredictionService');
const SchedulerConfig = require('./SchedulerConfig');
const AIPrediction = require('../models/AIPrediction');
const logger = require('../utils/logger');

/**
 * Main scheduler class for automated prediction generation
 * Handles cron scheduling, task execution, and error recovery
 */
class PredictionScheduler {
  constructor() {
    this.config = new SchedulerConfig();
    this.predictionService = new PredictionService();
    this.isRunning = false;
    this.lastRun = null;
    this.nextRun = null;
    this.task = null;
    this.stats = {
      totalRuns: 0,
      successfulRuns: 0,
      failedRuns: 0,
      totalPredictions: 0,
      lastError: null
    };
  }

  /**
   * Start the scheduler
   * @returns {Promise<void>}
   */
  async start() {
    try {
      // Validate configuration
      const validation = this.config.validate();
      if (!validation.isValid) {
        throw new Error(`Configuration validation failed: ${validation.errors.join(', ')}`);
      }

      if (validation.warnings.length > 0) {
        logger.warn('Configuration warnings', { warnings: validation.warnings });
      }

      if (!this.config.get('enabled')) {
        logger.info('Scheduler is disabled via configuration');
        return;
      }

      // Initialize database models
      await this.initializeDatabase();

      // Create and start cron task
      this.task = cron.schedule(
        this.config.get('cronExpression'),
        () => this.executeTask(),
        {
          scheduled: false,
          timezone: this.config.get('timezone')
        }
      );

      this.task.start();
      this.updateNextRunTime();

      logger.logScheduler('info', 'Prediction scheduler started', {
        schedule: this.config.getScheduleDescription(),
        nextRun: this.nextRun,
        config: this.config.getAll()
      });

      // Run initial task if configured
      if (process.env.RUN_INITIAL_TASK === 'true') {
        logger.info('Running initial prediction task');
        setTimeout(() => this.executeTask(), 5000);
      }

    } catch (error) {
      logger.logScheduler('error', 'Failed to start scheduler', {
        error: error.message,
        stack: error.stack
      });
      throw error;
    }
  }

  /**
   * Stop the scheduler
   */
  stop() {
    if (this.task) {
      this.task.stop();
      this.task = null;
      logger.logScheduler('info', 'Prediction scheduler stopped');
    }
  }

  /**
   * Execute the main prediction task
   * @returns {Promise<void>}
   */
  async executeTask() {
    if (this.isRunning) {
      logger.logScheduler('warn', 'Task already running, skipping execution');
      return;
    }

    this.isRunning = true;
    this.lastRun = new Date();
    this.stats.totalRuns++;

    const taskId = `task_${Date.now()}`;
    
    logger.logScheduler('info', 'Starting scheduled prediction task', {
      taskId,
      runNumber: this.stats.totalRuns
    });

    try {
      const results = await this.runPredictionTasks();
      
      this.stats.successfulRuns++;
      this.stats.totalPredictions += results.totalPredictions;
      this.stats.lastError = null;

      logger.logScheduler('info', 'Scheduled task completed successfully', {
        taskId,
        duration: Date.now() - this.lastRun.getTime(),
        results
      });

    } catch (error) {
      this.stats.failedRuns++;
      this.stats.lastError = {
        message: error.message,
        timestamp: new Date(),
        taskId
      };

      logger.logScheduler('error', 'Scheduled task failed', {
        taskId,
        error: error.message,
        stack: error.stack
      });

      // Attempt recovery actions
      await this.handleTaskFailure(error, taskId);

    } finally {
      this.isRunning = false;
      this.updateNextRunTime();
    }
  }

  /**
   * Run all prediction-related tasks
   * @returns {Promise<Object>} Task results
   */
  async runPredictionTasks() {
    const results = {
      totalPredictions: 0,
      successfulPredictions: 0,
      failedPredictions: 0,
      sportsProcessed: [],
      cleanupResults: null
    };

    // Generate predictions for each sport
    const sportsToProcess = this.config.get('sportsToProcess');
    
    for (const sport of sportsToProcess) {
      try {
        logger.logScheduler('info', `Processing predictions for ${sport}`);
        
        const predictions = await this.predictionService.generatePredictions({
          sport,
          limit: this.config.get('maxEventsPerRun'),
          aiProvider: this.config.get('aiProvider'),
          modelName: this.config.get('aiModel')
        });

        results.totalPredictions += predictions.length;
        results.successfulPredictions += predictions.filter(p => p.status === 'completed').length;
        results.failedPredictions += predictions.filter(p => p.status === 'failed').length;
        results.sportsProcessed.push({
          sport,
          predictions: predictions.length,
          successful: predictions.filter(p => p.status === 'completed').length
        });

        // Add delay between sports to respect rate limits
        if (sportsToProcess.length > 1) {
          await this.delay(this.config.get('requestDelay'));
        }

      } catch (error) {
        logger.logScheduler('error', `Failed to process predictions for ${sport}`, {
          sport,
          error: error.message
        });
        results.sportsProcessed.push({
          sport,
          predictions: 0,
          successful: 0,
          error: error.message
        });
      }
    }

    // Cleanup old predictions if configured
    if (this.config.get('cleanupOldPredictions')) {
      try {
        results.cleanupResults = await this.cleanupOldPredictions();
      } catch (error) {
        logger.logScheduler('error', 'Cleanup task failed', { error: error.message });
      }
    }

    return results;
  }

  /**
   * Handle task failure and attempt recovery
   * @param {Error} error - The error that occurred
   * @param {string} taskId - Task identifier
   * @returns {Promise<void>}
   */
  async handleTaskFailure(error, taskId) {
    logger.logScheduler('info', 'Attempting task failure recovery', { taskId });

    try {
      // Check database connectivity
      await AIPrediction.findOne({ limit: 1 });
      logger.logScheduler('info', 'Database connectivity confirmed');

      // Check AI model availability
      const aiModel = require('../ai/AIModelFactory').createModel();
      const modelInfo = aiModel.getModelInfo();
      logger.logScheduler('info', 'AI model availability confirmed', { modelInfo });

      // Log system status
      const memoryUsage = process.memoryUsage();
      logger.logScheduler('info', 'System status', {
        memory: {
          rss: Math.round(memoryUsage.rss / 1024 / 1024) + 'MB',
          heapUsed: Math.round(memoryUsage.heapUsed / 1024 / 1024) + 'MB',
          heapTotal: Math.round(memoryUsage.heapTotal / 1024 / 1024) + 'MB'
        },
        uptime: Math.round(process.uptime()) + 's'
      });

    } catch (recoveryError) {
      logger.logScheduler('error', 'Recovery check failed', {
        taskId,
        recoveryError: recoveryError.message
      });
    }
  }

  /**
   * Clean up old predictions
   * @returns {Promise<Object>} Cleanup results
   */
  async cleanupOldPredictions() {
    const retentionDays = this.config.get('retentionDays');
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - retentionDays);

    logger.logScheduler('info', 'Starting prediction cleanup', {
      retentionDays,
      cutoffDate
    });

    try {
      const deletedCount = await AIPrediction.destroy({
        where: {
          createdAt: {
            [require('sequelize').Op.lt]: cutoffDate
          }
        }
      });

      logger.logScheduler('info', 'Prediction cleanup completed', {
        deletedCount,
        cutoffDate
      });

      return {
        deletedCount,
        cutoffDate,
        success: true
      };

    } catch (error) {
      logger.logScheduler('error', 'Prediction cleanup failed', {
        error: error.message
      });
      
      return {
        deletedCount: 0,
        error: error.message,
        success: false
      };
    }
  }

  /**
   * Initialize database models
   * @returns {Promise<void>}
   */
  async initializeDatabase() {
    try {
      await AIPrediction.sync();
      logger.logScheduler('info', 'Database models synchronized');
    } catch (error) {
      logger.logScheduler('error', 'Database initialization failed', {
        error: error.message
      });
      throw error;
    }
  }

  /**
   * Update next run time
   */
  updateNextRunTime() {
    if (this.task) {
      // Calculate next run time based on cron expression
      // This is a simplified calculation - for production, consider using a proper cron parser
      const now = new Date();
      const nextRun = new Date(now);
      nextRun.setDate(nextRun.getDate() + 1);
      nextRun.setHours(6, 0, 0, 0); // Assuming daily at 6 AM
      
      this.nextRun = nextRun;
    }
  }

  /**
   * Get scheduler status
   * @returns {Object} Current scheduler status
   */
  getStatus() {
    return {
      isRunning: this.isRunning,
      enabled: this.config.get('enabled'),
      lastRun: this.lastRun,
      nextRun: this.nextRun,
      schedule: this.config.getScheduleDescription(),
      stats: { ...this.stats },
      config: {
        aiProvider: this.config.get('aiProvider'),
        aiModel: this.config.get('aiModel'),
        maxEventsPerRun: this.config.get('maxEventsPerRun'),
        sportsToProcess: this.config.get('sportsToProcess')
      }
    };
  }

  /**
   * Manually trigger task execution
   * @returns {Promise<Object>} Task results
   */
  async triggerManualRun() {
    if (this.isRunning) {
      throw new Error('Task is already running');
    }

    logger.logScheduler('info', 'Manual task execution triggered');
    await this.executeTask();
    return this.getStatus();
  }

  /**
   * Utility function to add delay
   * @param {number} ms - Milliseconds to delay
   * @returns {Promise} Promise that resolves after delay
   */
  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

module.exports = PredictionScheduler;