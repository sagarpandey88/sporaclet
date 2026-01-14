/**
 * Update Results Job
 * 
 * Background job that fetches completed event results from TheSportsDB API
 * and updates event records with actual scores and outcomes. Also updates
 * prediction accuracy flags.
 * 
 * Schedule: Every hour
 */

import dataStore from '../../lib/data-store';
import { WinnerType } from '../../types/models';
import { logger } from '../../middleware/logger';

// Using in-memory data store instead of Prisma

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
    home: number;
    away: number;
    draw: number;
  },
  actualWinner: WinnerType
): boolean {
  const maxProb = Math.max(
    prediction.home,
    prediction.away,
    prediction.draw
  );

  if (
    actualWinner === WinnerType.home &&
    prediction.home === maxProb
  ) {
    return true;
  }

  if (
    actualWinner === WinnerType.away &&
    prediction.away === maxProb
  ) {
    return true;
  }

  if (
    actualWinner === WinnerType.draw &&
    prediction.draw === maxProb
  ) {
    return true;
  }

  return false;
}

/**
 * Process update-results job
 */
export async function processUpdateResultsJob(
  data: UpdateResultsJobData = {}
): Promise<void> {
  const startTime = Date.now();
  const { eventId } = data;

  logger.info('Starting update-results job', {
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

    logger.info(`Found ${events.length} events to check for results`);

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
          
          // Parse probabilities from JSON
          const probabilities = prediction.probabilities as any;
          const home = probabilities?.home || 0;
          const away = probabilities?.away || 0;
          const draw = probabilities?.draw || 0;
          
          const isAccurate = isPredictionAccurate(
            { home, away, draw },
            winner
          );

          // Generate accuracy note
          let accuracyNote: string | undefined;
          if (isAccurate) {
            accuracyNote = `Correctly predicted ${winner} win`;
          } else {
            // Find the predicted winner based on highest probability
            const maxProb = Math.max(home, away, draw);
            let predictedWinner: string;
            
            if (home === maxProb) {
              predictedWinner = 'home';
            } else if (away === maxProb) {
              predictedWinner = 'away';
            } else {
              predictedWinner = 'draw';
            }
            
            accuracyNote = `Predicted ${predictedWinner} win, but actual result was ${winner}`;
          }

          await prisma.prediction.update({
            where: { id: prediction.id },
            data: {
              isAccurate,
              accuracyNote,
            },
          });

          accuracyUpdated++;

          logger.info('Updated prediction accuracy', {
            eventId: event.id,
            predictionId: prediction.id,
            isAccurate,
            accuracyNote,
            winner,
          });
        }

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
      duration: `${duration}ms`,
      totalProcessed: events.length,
      eventsUpdated: updatedCount,
      accuracyUpdated,
    });

  } catch (error) {
    const duration = Date.now() - startTime;

    logger.error('Update-results job failed', {
      duration: `${duration}ms`,
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
    });

    throw error;
  }
}
