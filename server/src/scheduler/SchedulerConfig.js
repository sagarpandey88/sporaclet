/**
 * Scheduler configuration management
 * Handles environment variables and default settings
 */
class SchedulerConfig {
  constructor() {
    this.config = this.loadConfig();
  }

  /**
   * Load configuration from environment variables
   * @returns {Object} Configuration object
   */
  loadConfig() {
    return {
      // Scheduler settings
      enabled: process.env.SCHEDULER_ENABLED === 'true',
      cronExpression: process.env.SCHEDULER_CRON || '0 6 * * *', // Daily at 6 AM
      timezone: process.env.SCHEDULER_TIMEZONE || 'UTC',
      
      // Task settings
      fetchSportsData: process.env.FETCH_SPORTS_DATA !== 'false',
      generatePredictions: process.env.GENERATE_PREDICTIONS !== 'false',
      
      // AI settings
      aiProvider: process.env.AI_MODEL_PROVIDER || 'openai',
      aiModel: process.env.AI_MODEL_NAME || 'gpt-3.5-turbo',
      
      // Data fetching settings
      sportsToProcess: this.parseSportsArray(process.env.SPORTS_TO_PROCESS) || ['all'],
      maxEventsPerRun: parseInt(process.env.MAX_EVENTS_PER_RUN) || 20,
      daysAhead: parseInt(process.env.DAYS_AHEAD) || 7,
      
      // Rate limiting
      requestDelay: parseInt(process.env.REQUEST_DELAY_MS) || 1000,
      maxConcurrentRequests: parseInt(process.env.MAX_CONCURRENT_REQUESTS) || 3,
      
      // Error handling
      maxRetries: parseInt(process.env.MAX_RETRIES) || 3,
      retryDelay: parseInt(process.env.RETRY_DELAY_MS) || 5000,
      
      // Cleanup settings
      cleanupOldPredictions: process.env.CLEANUP_OLD_PREDICTIONS !== 'false',
      retentionDays: parseInt(process.env.RETENTION_DAYS) || 90
    };
  }

  /**
   * Parse comma-separated sports array from environment variable
   * @param {string} sportsString - Comma-separated sports string
   * @returns {Array} Array of sports
   */
  parseSportsArray(sportsString) {
    if (!sportsString) return null;
    return sportsString.split(',').map(sport => sport.trim()).filter(Boolean);
  }

  /**
   * Get configuration value
   * @param {string} key - Configuration key
   * @returns {*} Configuration value
   */
  get(key) {
    return this.config[key];
  }

  /**
   * Set configuration value
   * @param {string} key - Configuration key
   * @param {*} value - Configuration value
   */
  set(key, value) {
    this.config[key] = value;
  }

  /**
   * Get all configuration
   * @returns {Object} Complete configuration
   */
  getAll() {
    return { ...this.config };
  }

  /**
   * Validate configuration
   * @returns {Object} Validation result
   */
  validate() {
    const errors = [];
    const warnings = [];

    // Check required settings
    if (!this.config.cronExpression) {
      errors.push('SCHEDULER_CRON is required');
    }

    // Validate cron expression format (basic check)
    if (this.config.cronExpression && !this.isValidCronExpression(this.config.cronExpression)) {
      errors.push('Invalid cron expression format');
    }

    // Check AI configuration
    if (this.config.generatePredictions) {
      if (!process.env.OPENAI_API_KEY && !process.env.ANTHROPIC_API_KEY) {
        errors.push('At least one AI API key is required (OPENAI_API_KEY or ANTHROPIC_API_KEY)');
      }
    }

    // Check numeric values
    if (this.config.maxEventsPerRun < 1 || this.config.maxEventsPerRun > 100) {
      warnings.push('MAX_EVENTS_PER_RUN should be between 1 and 100');
    }

    if (this.config.requestDelay < 100) {
      warnings.push('REQUEST_DELAY_MS should be at least 100ms to respect rate limits');
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  }

  /**
   * Basic cron expression validation
   * @param {string} cronExpression - Cron expression to validate
   * @returns {boolean} True if valid format
   */
  isValidCronExpression(cronExpression) {
    // Basic validation: should have 5 or 6 parts
    const parts = cronExpression.trim().split(/\s+/);
    return parts.length === 5 || parts.length === 6;
  }

  /**
   * Get human-readable schedule description
   * @returns {string} Schedule description
   */
  getScheduleDescription() {
    const cron = this.config.cronExpression;
    const timezone = this.config.timezone;
    
    // Basic cron to human readable conversion
    const cronDescriptions = {
      '0 6 * * *': 'Daily at 6:00 AM',
      '0 */6 * * *': 'Every 6 hours',
      '0 0 * * *': 'Daily at midnight',
      '0 12 * * *': 'Daily at noon',
      '0 0 * * 0': 'Weekly on Sunday at midnight'
    };

    const description = cronDescriptions[cron] || `Custom schedule: ${cron}`;
    return `${description} (${timezone})`;
  }
}

module.exports = SchedulerConfig;