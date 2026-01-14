import * as cron from 'node-cron';
import dotenv from 'dotenv';
import executeFetchEventsJob from './jobs/fetch-events.job';
import executeGeneratePredictionsJob from './jobs/generate-predictions.job';
import executeUpdateResultsJob from './jobs/update-results.job';
import { logger } from '../middleware/logger';

// Load environment variables
dotenv.config();

// Store active cron jobs for graceful shutdown
const cronJobs: cron.ScheduledTask[] = [];

/**
 * Wrapper to run jobs with error handling
 */
async function runJobWithErrorHandling(
  jobName: string,
  jobFn: () => Promise<void>
): Promise<void> {
  logger.info(`Starting cron job: ${jobName}`);
  
  try {
    await jobFn();
    logger.info(`Cron job completed: ${jobName}`);
  } catch (error) {
    logger.error(`Cron job failed: ${jobName}`, {
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
    });
  }
}

/**
 * Setup cron-based recurring jobs
 */
function setupCronJobs(): void {
  try {
    // Fetch events: Daily at 2:00 AM
    const fetchEventsSchedule = process.env.WORKER_FETCH_EVENTS_SCHEDULE || '0 2 * * *';
    const fetchEventsJob = cron.schedule(fetchEventsSchedule, () => {
      void runJobWithErrorHandling('fetch-events', () => executeFetchEventsJob());
    });
    cronJobs.push(fetchEventsJob);
    logger.info(`Scheduled cron job: fetch-events (${fetchEventsSchedule})`);
    // eslint-disable-next-line no-console
    console.log(`✅ Scheduled: fetch-events (${fetchEventsSchedule})`);

    // Generate predictions: Twice daily at 6:00 AM and 6:00 PM
    const generatePredictionsSchedule = process.env.WORKER_GENERATE_PREDICTIONS_SCHEDULE || '0 6,18 * * *';
    const generatePredictionsJob = cron.schedule(generatePredictionsSchedule, () => {
      void runJobWithErrorHandling('generate-predictions', () => executeGeneratePredictionsJob());
    });
    cronJobs.push(generatePredictionsJob);
    logger.info(`Scheduled cron job: generate-predictions (${generatePredictionsSchedule})`);
    // eslint-disable-next-line no-console
    console.log(`✅ Scheduled: generate-predictions (${generatePredictionsSchedule})`);

    // Update results: Every hour
    const updateResultsSchedule = process.env.WORKER_UPDATE_RESULTS_SCHEDULE || '0 * * * *';
    const updateResultsJob = cron.schedule(updateResultsSchedule, () => {
      void runJobWithErrorHandling('update-results', () => executeUpdateResultsJob());
    });
    cronJobs.push(updateResultsJob);
    logger.info(`Scheduled cron job: update-results (${updateResultsSchedule})`);
    // eslint-disable-next-line no-console
    console.log(`✅ Scheduled: update-results (${updateResultsSchedule})`);

    logger.info('All cron jobs scheduled successfully');
    // eslint-disable-next-line no-console
    console.log('✅ All cron jobs scheduled successfully');
  } catch (error) {
    logger.error('Failed to setup cron jobs', {
      error: error instanceof Error ? error.message : String(error),
    });
    // eslint-disable-next-line no-console
    console.error('❌ Failed to setup cron jobs:', error);
    process.exit(1);
  }
}

// Graceful shutdown
const gracefulShutdown = (): void => {
  // eslint-disable-next-line no-console
  console.log('🛑 Shutting down worker...');
  
  try {
    // Stop all cron jobs
    cronJobs.forEach((job) => job.stop());
    logger.info('All cron jobs stopped');
    // eslint-disable-next-line no-console
    console.log('✅ Worker shut down gracefully');
    process.exit(0);
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('❌ Error during worker shutdown:', error);
    process.exit(1);
  }
};

process.on('SIGTERM', gracefulShutdown);
process.on('SIGINT', gracefulShutdown);

// Start the cron scheduler
// eslint-disable-next-line no-console
console.log('🔧 Starting cron-based worker...');
setupCronJobs();
// eslint-disable-next-line no-console
console.log('🚀 Cron worker is ready and running');
