import { Request, Response } from 'express';
import eventService from '../services/event.service';
import { asyncHandler, AppError } from '../middleware/error-handler';

/**
 * List upcoming events with pagination and filters
 * GET /api/events
 */
export const listEvents = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const { sport, date_from, date_to, league, page, per_page, q } = req.query;

    const result = await eventService.listUpcoming({
      sport: sport as string | undefined,
      dateFrom: date_from as string | undefined,
      dateTo: date_to as string | undefined,
      league: league as string | undefined,
      page: page ? parseInt(page as string) : undefined,
      perPage: per_page ? parseInt(per_page as string) : undefined,
      query: q as string | undefined,
    });

    // Set cache headers
    res.setHeader('Cache-Control', 'public, max-age=3600');

    // Extract pagination safely
    const pagination = result.pagination as { page: number; perPage: number; total: number; totalPages: number };

    // Transform response to match frontend contract (use `data`)
    res.status(200).json({
      data: result.data,
      pagination: {
        page: pagination.page,
        per_page: pagination.perPage,
        total: pagination.total,
        total_pages: pagination.totalPages,
      },
    });
  }
);

/**
 * List past/completed events with pagination and filters
 * GET /api/events/past
 */
export const listPastEvents = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const { sport, date_from, date_to, league, page, per_page } = req.query;

    const result = await eventService.listPastEvents({
      sport: sport as string | undefined,
      dateFrom: date_from as string | undefined,
      dateTo: date_to as string | undefined,
      league: league as string | undefined,
      page: page ? parseInt(page as string) : undefined,
      perPage: per_page ? parseInt(per_page as string) : undefined,
    });

    // Set cache headers (1 hour)
    res.setHeader('Cache-Control', 'public, max-age=3600');

    // Extract pagination safely
    const pagination = result.pagination as { page: number; perPage: number; total: number; totalPages: number };

    // Transform response to match frontend contract (use `data`)
    res.status(200).json({
      data: result.data,
      pagination: {
        page: pagination.page,
        per_page: pagination.perPage,
        total: pagination.total,
        total_pages: pagination.totalPages,
      },
    });
  }
);

/**
 * Search events by query string
 * GET /api/events/search
 */
export const searchEvents = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const { q, sport, page, per_page } = req.query;

    if (!q || typeof q !== 'string') {
      throw new AppError('Query parameter "q" is required', 400);
    }

    const result = await eventService.searchEvents({
      query: q,
      sport: sport as string | undefined,
      page: page ? parseInt(page as string) : undefined,
      perPage: per_page ? parseInt(per_page as string) : undefined,
    });

    // Extract pagination safely
    const pagination = result.pagination as { page: number; perPage: number; total: number; totalPages: number };

    // Transform response to match frontend contract (use `data`)
    res.status(200).json({
      data: result.data,
      pagination: {
        page: pagination.page,
        per_page: pagination.perPage,
        total: pagination.total,
        total_pages: pagination.totalPages,
      },
    });
  }
);

/**
 * Get event by ID with full details
 * GET /api/events/:id
 */
export const getEventById = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;

    const result = await eventService.getEventDetail(id);

    // Set cache headers (15 minutes)
    res.setHeader('Cache-Control', 'public, max-age=900');

    res.status(200).json(result);
  }
);
