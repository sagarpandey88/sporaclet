/**
 * Update Results Job
 * 
 * Background job that fetches completed event results from TheSportsDB API
 * and updates event records with actual scores and outcomes. Also updates
 * prediction accuracy flags.
 * 
 * Schedule: Every hour
 * Retry: 3 attempts with exponential backoff
 */

import { Job } from 'bullmq';
import { PrismaClient, WinnerType } from '@prisma/client';
import { logger } from '../../middleware/logger';

const prisma = new PrismaClient();

interface UpdateResultsJobData {
  eventId?: string;
}

/**
 * Fetch event result from TheSportsDB API
 * Note: This is a placeholder implementation
 */
async function fetchEventResult(externalId: string): Promise<{
  homeScore: number;
  awayScore: number;
  status: string;
} | null> {
  // TODO: Implement actual API call to TheSportsDB
  logger.info('Fetching event result from API', { externalId });
  
  // Placeholder: Return null (no result available yet)
  return null;
}

/**
 * Determine winner based on scores
 */
function determineWinner(homeScore: number, awayScore: number): WinnerType {
  if (homeScore > awayScore) {
    return WinnerType.home;
  } else if (awayScore > homeScore) {
    return WinnerType.away;
  } else {
    return WinnerType.draw;
  }
}

/**
 * Check if prediction was accurate
 */
function isPredictionAccurate(
  prediction: {
    homeWinProbability: number;
    awayWinProbability: number;
    drawProbability: number;
  },
  actualWinner: WinnerType
): boolean {
  const maxProb = Math.max(
    prediction.homeWinProbability,
    prediction.awayWinProbability,
    prediction.drawProbability
  );

  if (
    actualWinner === WinnerType.home &&
    prediction.homeWinProbability === maxProb
  ) {
    return true;
  }

  if (
    actualWinner === WinnerType.away &&
    prediction.awayWinProbability === maxProb
  ) {
    return true;
  }

  if (
    actualWinner === WinnerType.draw &&
    prediction.drawProbability === maxProb
  ) {
    return true;
  }

  return false;
}

/**
 * Process update-results job
 */
export async function processUpdateResultsJob(
  job: Job<UpdateResultsJobData>
): Promise<void> {
  const startTime = Date.now();
  const { eventId } = job.data;

  logger.info('Starting update-results job', {
    jobId: job.id,
    eventId,
  });

  try {
    // Get events that might have completed
    const where: any = {
      status: {
        in: ['upcoming', 'live'],
      },
      date: {
        lte: new Date(), // Events that should have started
      },
    };

    if (eventId) {
      where.id = eventId;
    }

    const events = await prisma.event.findMany({
      where,
      include: {
        predictions: {
          orderBy: { createdAt: 'desc' },
          take: 1,
        },
      },
    });

    await job.updateProgress(10);

    logger.info(`Found ${events.length} events to check for results`, {
      jobId: job.id,
    });

    let updatedCount = 0;
    let accuracyUpdated = 0;

    for (let i = 0; i < events.length; i++) {
      const event = events[i];

      try {
        // Fetch result from external API
        const result = await fetchEventResult(event.externalId);

        if (!result) {
          // No result available yet
          continue;
        }

        // Update event with actual result
        const winner = determineWinner(result.homeScore, result.awayScore);

        await prisma.event.update({
          where: { id: event.id },
          data: {
            homeScore: result.homeScore,
            awayScore: result.awayScore,
            winner,
            status: 'completed',
          },
        });

        updatedCount++;

        // Update prediction accuracy if prediction exists
        if (event.predictions.length > 0) {
          const prediction = event.predictions[0];
          const isAccurate = isPredictionAccurate(prediction, winner);

          await prisma.prediction.update({
            where: { id: prediction.id },
            data: {
              isAccurate,
            },
          });

          accuracyUpdated++;

          logger.info('Updated prediction accuracy', {
            eventId: event.id,
            predictionId: prediction.id,
            isAccurate,
            winner,
          });
        }

        // Update progress
        const progress = Math.min(10 + (90 * (i + 1)) / events.length, 100);
        await job.updateProgress(progress);

      } catch (error) {
        logger.error('Error updating result for event', {
          eventId: event.id,
          error: error instanceof Error ? error.message : String(error),
        });
        // Continue processing other events
      }
    }

    const duration = Date.now() - startTime;

    logger.info('Update-results job completed successfully', {
      jobId: job.id,
      duration: `${duration}ms`,
      totalProcessed: events.length,
      eventsUpdated: updatedCount,
      accuracyUpdated,
    });

  } catch (error) {
    const duration = Date.now() - startTime;

    logger.error('Update-results job failed', {
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
export const updateResultsJobConfig = {
  name: 'update-results',
  processor: processUpdateResultsJob,
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
