const express = require('express');
const router = express.Router();
const { getScheduler } = require('../scheduler');
const logger = require('../utils/logger');

/**
 * Scheduler management routes
 * Provides API endpoints for monitoring and controlling the scheduler
 */

/**
 * Get scheduler status
 */
router.get('/status', (req, res) => {
  try {
    const scheduler = getScheduler();
    
    if (!scheduler) {
      return res.status(503).json({
        success: false,
        error: 'Scheduler not initialized'
      });
    }

    const status = scheduler.getStatus();
    
    res.json({
      success: true,
      data: status
    });
  } catch (error) {
    logger.error('Failed to get scheduler status', { error: error.message });
    res.status(500).json({
      success: false,
      error: 'Failed to get scheduler status',
      message: error.message
    });
  }
});

/**
 * Trigger manual scheduler run
 */
router.post('/trigger', async (req, res) => {
  try {
    const scheduler = getScheduler();
    
    if (!scheduler) {
      return res.status(503).json({
        success: false,
        error: 'Scheduler not initialized'
      });
    }

    logger.info('Manual scheduler trigger requested', {
      userAgent: req.get('User-Agent'),
      ip: req.ip
    });

    const result = await scheduler.triggerManualRun();
    
    res.json({
      success: true,
      data: result,
      message: 'Manual scheduler run completed'
    });
  } catch (error) {
    logger.error('Failed to trigger manual run', { error: error.message });
    res.status(500).json({
      success: false,
      error: 'Failed to trigger manual run',
      message: error.message
    });
  }
});

/**
 * Get scheduler configuration
 */
router.get('/config', (req, res) => {
  try {
    const scheduler = getScheduler();
    
    if (!scheduler) {
      return res.status(503).json({
        success: false,
        error: 'Scheduler not initialized'
      });
    }

    const config = scheduler.config.getAll();
    
    // Remove sensitive information
    const safeConfig = {
      ...config,
      // Don't expose API keys or sensitive data
      aiProvider: config.aiProvider,
      aiModel: config.aiModel,
      enabled: config.enabled,
      cronExpression: config.cronExpression,
      timezone: config.timezone,
      maxEventsPerRun: config.maxEventsPerRun,
      sportsToProcess: config.sportsToProcess
    };
    
    res.json({
      success: true,
      data: safeConfig
    });
  } catch (error) {
    logger.error('Failed to get scheduler config', { error: error.message });
    res.status(500).json({
      success: false,
      error: 'Failed to get scheduler configuration',
      message: error.message
    });
  }
});

/**
 * Get scheduler statistics
 */
router.get('/stats', async (req, res) => {
  try {
    const scheduler = getScheduler();
    
    if (!scheduler) {
      return res.status(503).json({
        success: false,
        error: 'Scheduler not initialized'
      });
    }

    // Get basic scheduler stats
    const status = scheduler.getStatus();
    
    // Get prediction service stats
    const predictionStats = await scheduler.predictionService.getPredictionStats();
    
    res.json({
      success: true,
      data: {
        scheduler: status.stats,
        predictions: predictionStats,
        lastRun: status.lastRun,
        nextRun: status.nextRun
      }
    });
  } catch (error) {
    logger.error('Failed to get scheduler stats', { error: error.message });
    res.status(500).json({
      success: false,
      error: 'Failed to get scheduler statistics',
      message: error.message
    });
  }
});

/**
 * Health check endpoint
 */
router.get('/health', (req, res) => {
  try {
    const scheduler = getScheduler();
    
    const health = {
      scheduler: scheduler ? 'running' : 'not_initialized',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      memory: process.memoryUsage()
    };

    if (scheduler) {
      const status = scheduler.getStatus();
      health.lastRun = status.lastRun;
      health.isRunning = status.isRunning;
      health.enabled = status.enabled;
    }

    res.json({
      success: true,
      data: health
    });
  } catch (error) {
    logger.error('Scheduler health check failed', { error: error.message });
    res.status(500).json({
      success: false,
      error: 'Health check failed',
      message: error.message
    });
  }
});

module.exports = router;