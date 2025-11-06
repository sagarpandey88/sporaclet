import { Router } from 'express';
import { listEvents, searchEvents, getEventById } from '../controllers/events.controller';
import { validateEventsQuery, validateUuidParam } from '../middleware/validator';

const router = Router();

/**
 * GET /api/events/search
 * Search events by team name or event name
 */
router.get('/search', searchEvents);

/**
 * GET /api/events/:id
 * Get event details by ID
 */
router.get('/:id', validateUuidParam, getEventById);

/**
 * GET /api/events
 * List upcoming events with filters and pagination
 */
router.get('/', validateEventsQuery, listEvents);

export default router;
