import rateLimit from 'express-rate-limit';
import { Request, Response } from 'express';

/**
 * Rate limiter configuration for API endpoints
 * Limit: 100 requests per minute per IP address
 */
export const apiLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 100, // Limit each IP to 100 requests per windowMs
  message: {
    error: {
      code: 'RATE_LIMIT_EXCEEDED',
      message: 'Too many requests from this IP, please try again later',
    },
    timestamp: new Date().toISOString(),
  },
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  // Custom key generator to support both IPv4 and IPv6
  keyGenerator: (req: Request): string => {
    return req.ip || req.socket.remoteAddress || 'unknown';
  },
  // Custom handler to format error response
  handler: (req: Request, res: Response): void => {
    res.status(429).json({
      error: {
        code: 'RATE_LIMIT_EXCEEDED',
        message: 'Too many requests from this IP, please try again later',
      },
      timestamp: new Date().toISOString(),
      path: req.path,
      requestId: req.headers['x-request-id'] as string,
    });
  },
  // Skip rate limiting for health checks
  skip: (req: Request): boolean => {
    return req.path === '/api/health';
  },
});

/**
 * Stricter rate limiter for authentication endpoints
 * Limit: 5 requests per minute per IP address
 */
export const authLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 5, // Limit each IP to 5 requests per windowMs
  message: {
    error: {
      code: 'RATE_LIMIT_EXCEEDED',
      message: 'Too many authentication attempts, please try again later',
    },
    timestamp: new Date().toISOString(),
  },
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req: Request): string => {
    return req.ip || req.socket.remoteAddress || 'unknown';
  },
  handler: (req: Request, res: Response): void => {
    res.status(429).json({
      error: {
        code: 'RATE_LIMIT_EXCEEDED',
        message: 'Too many authentication attempts, please try again later',
      },
      timestamp: new Date().toISOString(),
      path: req.path,
      requestId: req.headers['x-request-id'] as string,
    });
  },
});
