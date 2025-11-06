import { Request, Response, NextFunction } from 'express';
import { logger } from './logger';

/**
 * Custom error class for application errors
 */
export class AppError extends Error {
  public readonly statusCode: number;
  public readonly isOperational: boolean;
  public readonly errors?: unknown[];

  constructor(
    message: string,
    statusCode: number = 500,
    isOperational: boolean = true,
    errors?: unknown[]
  ) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    this.errors = errors;

    // Maintains proper stack trace for where our error was thrown
    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Error response interface matching API contract
 */
interface ErrorResponse {
  error: {
    code: string;
    message: string;
    details?: unknown;
  };
  timestamp: string;
  path: string;
  requestId?: string;
}

/**
 * Convert HTTP status code to error code
 */
const getErrorCode = (statusCode: number): string => {
  const errorCodes: Record<number, string> = {
    400: 'BAD_REQUEST',
    401: 'UNAUTHORIZED',
    403: 'FORBIDDEN',
    404: 'NOT_FOUND',
    409: 'CONFLICT',
    422: 'VALIDATION_ERROR',
    429: 'RATE_LIMIT_EXCEEDED',
    500: 'INTERNAL_SERVER_ERROR',
    502: 'BAD_GATEWAY',
    503: 'SERVICE_UNAVAILABLE',
  };

  return errorCodes[statusCode] || 'INTERNAL_SERVER_ERROR';
};

/**
 * Global error handler middleware
 * Formats errors according to API contract and logs them
 */
export const errorHandler = (
  err: Error | AppError,
  req: Request,
  res: Response,
  _next: NextFunction
): void => {
  // Default to 500 server error
  let statusCode = 500;
  let message = 'An unexpected error occurred';
  let details: unknown = undefined;

  // If it's our custom AppError
  if (err instanceof AppError) {
    statusCode = err.statusCode;
    message = err.message;
    details = err.errors;
  } else if (err.name === 'ValidationError') {
    // Validation errors
    statusCode = 422;
    message = 'Validation failed';
    details = err.message;
  } else if (err.name === 'UnauthorizedError') {
    // JWT authentication errors
    statusCode = 401;
    message = 'Authentication failed';
  } else if (err.name === 'CastError') {
    // Invalid ID format
    statusCode = 400;
    message = 'Invalid ID format';
  }

  // Log the error
  if (statusCode >= 500) {
    logger.error('Server error:', {
      error: err.message,
      stack: err.stack,
      statusCode,
      path: req.path,
      method: req.method,
      requestId: req.headers['x-request-id'],
    });
  } else {
    logger.warn('Client error:', {
      error: err.message,
      statusCode,
      path: req.path,
      method: req.method,
      requestId: req.headers['x-request-id'],
    });
  }

  // Construct error response
  const errorResponse: ErrorResponse = {
    error: {
      code: getErrorCode(statusCode),
      message: process.env.NODE_ENV === 'production' && statusCode >= 500
        ? 'An unexpected error occurred'
        : message,
      details: details,
    },
    timestamp: new Date().toISOString(),
    path: req.path,
    requestId: req.headers['x-request-id'] as string,
  };

  // Send error response
  res.status(statusCode).json(errorResponse);
};

/**
 * 404 Not Found handler
 */
export const notFoundHandler = (
  req: Request,
  _res: Response,
  next: NextFunction
): void => {
  const error = new AppError(`Route ${req.originalUrl} not found`, 404);
  next(error);
};

/**
 * Async route handler wrapper to catch errors
 */
export const asyncHandler = (
  fn: (req: Request, res: Response, next: NextFunction) => Promise<unknown>
) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};
