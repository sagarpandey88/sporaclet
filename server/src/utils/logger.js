const winston = require('winston');
const path = require('path');

/**
 * Centralized logging configuration using Winston
 * Supports different log levels and output formats
 */

// Define log levels
const logLevels = {
  error: 0,
  warn: 1,
  info: 2,
  http: 3,
  debug: 4
};

// Define colors for each log level
const logColors = {
  error: 'red',
  warn: 'yellow',
  info: 'green',
  http: 'magenta',
  debug: 'white'
};

// Add colors to winston
winston.addColors(logColors);

// Create log format
const logFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss:ms' }),
  winston.format.colorize({ all: true }),
  winston.format.printf(
    (info) => `${info.timestamp} ${info.level}: ${info.message}` +
    (info.splat !== undefined ? `${info.splat}` : " ") +
    (info.label ? `[${info.label}]` : " ") +
    (info.stack ? `\n${info.stack}` : " ")
  )
);

// Create file format (without colors)
const fileFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss:ms' }),
  winston.format.errors({ stack: true }),
  winston.format.json()
);

// Define transports
const transports = [
  // Console transport
  new winston.transports.Console({
    level: process.env.LOG_LEVEL || 'info',
    format: logFormat
  })
];

// Add file transport if log file is specified
if (process.env.LOG_FILE) {
  const logDir = path.dirname(process.env.LOG_FILE);
  
  // Ensure log directory exists
  const fs = require('fs');
  if (!fs.existsSync(logDir)) {
    fs.mkdirSync(logDir, { recursive: true });
  }

  transports.push(
    new winston.transports.File({
      filename: process.env.LOG_FILE,
      level: 'info',
      format: fileFormat,
      maxsize: 5242880, // 5MB
      maxFiles: 5
    })
  );

  // Separate error log file
  transports.push(
    new winston.transports.File({
      filename: process.env.LOG_FILE.replace('.log', '.error.log'),
      level: 'error',
      format: fileFormat,
      maxsize: 5242880, // 5MB
      maxFiles: 5
    })
  );
}

// Create logger instance
const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  levels: logLevels,
  format: fileFormat,
  transports,
  exitOnError: false
});

// Add custom methods for structured logging
logger.logPrediction = (level, message, data = {}) => {
  logger.log(level, message, {
    type: 'prediction',
    ...data
  });
};

logger.logScheduler = (level, message, data = {}) => {
  logger.log(level, message, {
    type: 'scheduler',
    ...data
  });
};

logger.logAI = (level, message, data = {}) => {
  logger.log(level, message, {
    type: 'ai',
    ...data
  });
};

logger.logDatabase = (level, message, data = {}) => {
  logger.log(level, message, {
    type: 'database',
    ...data
  });
};

// Handle uncaught exceptions and unhandled rejections
if (process.env.NODE_ENV === 'production') {
  logger.exceptions.handle(
    new winston.transports.File({ filename: 'logs/exceptions.log' })
  );

  logger.rejections.handle(
    new winston.transports.File({ filename: 'logs/rejections.log' })
  );
}

module.exports = logger;