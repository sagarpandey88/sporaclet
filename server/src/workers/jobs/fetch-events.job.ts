/**
 * Fetch Events Job
 * 
 * Background job that fetches upcoming sporting events from TheSportsDB API
 * and stores them in the database.
 * 
 * Schedule: Daily at 2:00 AM
 * Retry: 3 attempts with exponential backoff
 */

import { Job } from 'bullmq';
import { PrismaClient } from '@prisma/client';
import { logger } from '../../middleware/logger';

const prisma = new PrismaClient();

interface FetchEventsJobData {
  sportSlug?: string;
  dateFrom?: string;
  dateTo?: string;
}

/**
 * Fetch events from TheSportsDB API
 * Note: This is a placeholder implementation. In production, you would:
 * 1. Call the actual TheSportsDB API
 * 2. Parse the response
 * 3. Transform data to match our schema
 * 4. Handle pagination if needed
 */
async function fetchEventsFromAPI(
  sportSlug?: string,
  dateFrom?: string,
  dateTo?: string
): Promise<any[]> {
  // TODO: Implement actual API call to TheSportsDB
  // Example: https://www.thesportsdb.com/api/v1/json/{API_KEY}/eventsseason.php?id=4328&s=2024-2025
  
  logger.info('Fetching events from TheSportsDB API', {
    sportSlug,
    dateFrom,
    dateTo,
  });

  // Placeholder: Return empty array
  // In production, this would make HTTP requests to external API
  return [];
}

/**
 * Process fetch-events job
 */
export async function processFetchEventsJob(job: Job<FetchEventsJobData>): Promise<void> {
  const startTime = Date.now();
  const { sportSlug, dateFrom, dateTo } = job.data;

  logger.info('Starting fetch-events job', {
    jobId: job.id,
    sportSlug,
    dateFrom,
    dateTo,
  });

  try {
    // Update job progress
    await job.updateProgress(10);

    // Fetch events from external API
    const events = await fetchEventsFromAPI(sportSlug, dateFrom, dateTo);
    await job.updateProgress(50);

    logger.info(`Fetched ${events.length} events from API`, {
      jobId: job.id,
    });

    // Store events in database
    let createdCount = 0;
    let updatedCount = 0;

    for (const eventData of events) {
      try {
        // Check if event already exists
        const existing = await prisma.event.findFirst({
          where: {
            externalId: eventData.externalId,
          },
        });

        if (existing) {
          // Update existing event
          await prisma.event.update({
            where: { id: existing.id },
            data: {
              name: eventData.name,
              scheduledAt: new Date(eventData.scheduledAt),
              venue: eventData.venue,
              status: eventData.status,
              // Update other fields as needed
            },
          });
          updatedCount++;
        } else {
          // Create new event
          await prisma.event.create({
            data: {
              externalId: eventData.externalId,
              name: eventData.name,
              scheduledAt: new Date(eventData.scheduledAt),
              venue: eventData.venue,
              status: eventData.status || 'upcoming',
              sportId: eventData.sportId,
              league: eventData.league,
              homeTeamId: eventData.homeTeamId,
              awayTeamId: eventData.awayTeamId,
              // Add other fields as needed
            },
          });
          createdCount++;
        }
      } catch (error) {
        logger.error('Error processing event', {
          error,
          eventData,
        });
        // Continue processing other events
      }
    }

    await job.updateProgress(100);

    const duration = Date.now() - startTime;

    logger.info('Fetch-events job completed successfully', {
      jobId: job.id,
      duration: `${duration}ms`,
      totalFetched: events.length,
      created: createdCount,
      updated: updatedCount,
    });

  } catch (error) {
    const duration = Date.now() - startTime;
    
    logger.error('Fetch-events job failed', {
      jobId: job.id,
      duration: `${duration}ms`,
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
    });

    throw error; // Re-throw to trigger retry
  }
}

/**
 * Job configuration
 */
export const fetchEventsJobConfig = {
  name: 'fetch-events',
  processor: processFetchEventsJob,
  options: {
    attempts: 3,
    backoff: {
      type: 'exponential' as const,
      delay: 5000, // Start with 5 seconds
    },
    removeOnComplete: {
      age: 7 * 24 * 60 * 60, // Keep completed jobs for 7 days
      count: 100, // Keep last 100 completed jobs
    },
    removeOnFail: {
      age: 30 * 24 * 60 * 60, // Keep failed jobs for 30 days
    },
  },
};
