import { Request, Response } from 'express';
import searchService from '../services/search.service';
import { asyncHandler, AppError } from '../middleware/error-handler';

/**
 * Search events by query string
 * GET /api/search?q=query&sport=football&page=1&per_page=20
 */
export const searchEvents = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const { q, sport, page, per_page } = req.query;

    if (!q || typeof q !== 'string') {
      throw new AppError('Query parameter "q" is required', 400);
    }

    if (q.length < 3) {
      res.status(400).json({
        error: 'Query must be at least 3 characters',
        data: [],
        pagination: {
          page: 1,
          perPage: 20,
          total: 0,
          totalPages: 0,
        },
      });
      return;
    }

    const result = await searchService.searchEvents({
      query: q,
      sport: sport as string | undefined,
      page: page ? parseInt(page as string) : undefined,
      perPage: per_page ? parseInt(per_page as string) : undefined,
    });

    // Set cache headers (5 minutes)
    res.setHeader('Cache-Control', 'public, max-age=300');

    res.status(200).json(result);
  }
);

/**
 * Get autocomplete suggestions
 * GET /api/search/autocomplete?q=query&sport=football&limit=10
 */
export const getAutocompleteSuggestions = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const { q, sport, limit } = req.query;

    if (!q || typeof q !== 'string') {
      throw new AppError('Query parameter "q" is required', 400);
    }

    if (q.length < 3) {
      res.status(200).json({
        suggestions: [],
        message: 'Query must be at least 3 characters',
      });
      return;
    }

    const result = await searchService.getAutocompleteSuggestions({
      query: q,
      sport: sport as string | undefined,
      limit: limit ? parseInt(limit as string) : undefined,
    });

    // Set cache headers (5 minutes)
    res.setHeader('Cache-Control', 'public, max-age=300');

    res.status(200).json(result);
  }
);
