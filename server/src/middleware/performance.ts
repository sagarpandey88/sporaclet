import { Request, Response, NextFunction } from 'express';
import { logger } from './logger';

/**
 * Performance monitoring middleware
 * Tracks response times and logs slow requests
 */

const SLOW_REQUEST_THRESHOLD_MS = 1000; // 1 second

export const performanceMonitor = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const startTime = Date.now();

  // Capture the original end function
  const originalEnd = res.end;

  // Override res.end to measure performance
  res.end = function (this: Response, ...args: any[]): any {
    const duration = Date.now() - startTime;
    const statusCode = res.statusCode;

    // Log request metrics
    const logData = {
      method: req.method,
      path: req.path,
      statusCode,
      duration: `${duration}ms`,
      requestId: req.headers['x-request-id'],
      userAgent: req.get('user-agent'),
      ip: req.ip,
    };

    // Log slow requests as warnings
    if (duration > SLOW_REQUEST_THRESHOLD_MS) {
      logger.warn('Slow request detected', {
        ...logData,
        threshold: `${SLOW_REQUEST_THRESHOLD_MS}ms`,
      });
    }

    // Log error status codes
    if (statusCode >= 400) {
      logger.warn('Request completed with error', logData);
    }

    // Restore original end and call it
    return originalEnd.apply(this, args as any);
  };

  next();
};

/**
 * Memory usage monitoring (called periodically)
 */
export const logMemoryUsage = (): void => {
  const memUsage = process.memoryUsage();
  
  logger.info('Memory usage', {
    rss: `${Math.round(memUsage.rss / 1024 / 1024)}MB`, // Resident Set Size
    heapTotal: `${Math.round(memUsage.heapTotal / 1024 / 1024)}MB`,
    heapUsed: `${Math.round(memUsage.heapUsed / 1024 / 1024)}MB`,
    external: `${Math.round(memUsage.external / 1024 / 1024)}MB`,
  });
};

/**
 * Setup periodic memory monitoring
 */
export const setupMemoryMonitoring = (intervalMs: number = 60000): NodeJS.Timer => {
  return setInterval(logMemoryUsage, intervalMs);
};
