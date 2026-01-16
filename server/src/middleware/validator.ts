import { Request, Response, NextFunction } from 'express';
import { AppError } from './error-handler';

/**
 * Validate events query parameters
 */
export const validateEventsQuery = (
  req: Request,
  _res: Response,
  next: NextFunction
): void => {
  const { sport, date_from, date_to, page, per_page, q } = req.query;

  // Validate sport
  if (sport && typeof sport !== 'string') {
    throw new AppError('Invalid sport parameter', 400);
  }

  const validSports = ['football', 'basketball', 'cricket', 'tennis'];
  if (sport && !validSports.includes(sport as string)) {
    throw new AppError(
      `Invalid sport. Must be one of: ${validSports.join(', ')}`,
      400
    );
  }

  // Validate date_from
  if (date_from && typeof date_from === 'string') {
    const date = new Date(date_from);
    if (isNaN(date.getTime())) {
      throw new AppError('Invalid date_from parameter. Use ISO 8601 format', 400);
    }
  }

  // Validate date_to
  if (date_to && typeof date_to === 'string') {
    const date = new Date(date_to);
    if (isNaN(date.getTime())) {
      throw new AppError('Invalid date_to parameter. Use ISO 8601 format', 400);
    }
  }

  // Validate page
  if (page) {
    const pageNum = parseInt(page as string);
    if (isNaN(pageNum) || pageNum < 1) {
      throw new AppError('Invalid page parameter. Must be a positive integer', 400);
    }
  }

  // Validate per_page
  if (per_page) {
    const perPageNum = parseInt(per_page as string);
    if (isNaN(perPageNum) || perPageNum < 1 || perPageNum > 100) {
      throw new AppError(
        'Invalid per_page parameter. Must be between 1 and 100',
        400
      );
    }
  }

  // Validate search query (optional)
  if (q && typeof q !== 'string') {
    throw new AppError('Invalid q parameter. Must be a string', 400);
  }

  next();
};

/**
 * Validate UUID parameter
 */
export const validateUuidParam = (
  req: Request,
  _res: Response,
  next: NextFunction
): void => {
  const { id } = req.params;

  const uuidRegex =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

  if (!uuidRegex.test(id)) {
    throw new AppError('Invalid ID format. Must be a valid UUID', 400);
  }

  next();
};
