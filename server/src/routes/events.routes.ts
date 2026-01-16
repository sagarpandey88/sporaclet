import { Router } from 'express';
import { listEvents, listPastEvents, searchEvents, getEventById } from '../controllers/events.controller';
import { validateEventsQuery, validateUuidParam } from '../middleware/validator';

const router = Router();

/**
 * @openapi
 * /api/events:
 *   get:
 *     summary: List upcoming events
 *     description: Retrieve a paginated list of upcoming sports events with optional filters
 *     tags: [Events]
 *     parameters:
 *       - in: query
 *         name: sport
 *         schema:
 *           type: string
 *         description: Filter by sport (e.g., Soccer, Basketball)
 *       - in: query
 *         name: q
 *         schema:
 *           type: string
 *           minLength: 1
 *         description: Search query (matches event name, teams, venue, league)
 *       - in: query
 *         name: sport
 *         schema:
 *           type: string
 *         description: Filter by sport (e.g., Soccer, Basketball)
 *       - in: query
 *         name: league
 *         schema:
 *           type: string
 *         description: Filter by league (e.g., Premier League, NBA)
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *           maximum: 100
 *         description: Number of items per page
 *
 *         description: Successful response
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/PaginatedEvents'
 *       400:
 *         description: Invalid query parameters
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/', validateEventsQuery, listEvents);

/**
 * @openapi
 * /api/events/past:
 *   get:
 *     summary: List past events
 *     description: Retrieve a paginated list of completed sports events with prediction accuracy
 *     tags: [Events]
 *     parameters:
 *       - in: query
 *         name: sport
 *         schema:
 *           type: string
 *         description: Filter by sport
 *       - in: query
 *         name: league
 *         schema:
 *           type: string
 *         description: Filter by league
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *           maximum: 100
 *         description: Number of items per page
 *     responses:
 *       200:
 *         description: Successful response
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/PaginatedEvents'
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/past', validateEventsQuery, listPastEvents);

/**
 * @openapi
 * /api/events/search:
 *   get:
 *     summary: Search events
 *     description: Full-text search across events, teams, and venues
 *     tags: [Events]
 *     parameters:
 *       - in: query
 *         name: q
 *         required: true
 *         schema:
 *           type: string
 *           minLength: 3
 *         description: Search query (minimum 3 characters)
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *         description: Number of items per page
 *     responses:
 *       200:
 *         description: Successful response
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SearchResults'
 *       400:
 *         description: Invalid search query
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/search', searchEvents);

/**
 * @openapi
 * /api/events/{id}:
 *   get:
 *     summary: Get event details
 *     description: Retrieve detailed information about a specific event
 *     tags: [Events]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Event ID
 *     responses:
 *       200:
 *         description: Successful response
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/EventDetail'
 *       404:
 *         description: Event not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/:id', validateUuidParam, getEventById);

export default router;
