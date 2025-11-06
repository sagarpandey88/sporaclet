import { Worker, Job } from 'bullmq';
import dotenv from 'dotenv';
import { closeQueues } from './queues/event-queue';
import { 
  fetchEventsJobConfig,
  processFetchEventsJob 
} from './jobs/fetch-events.job';
import {
  generatePredictionsJobConfig,
  processGeneratePredictionsJob
} from './jobs/generate-predictions.job';
import {
  updateResultsJobConfig,
  processUpdateResultsJob
} from './jobs/update-results.job';
import { logger } from '../middleware/logger';

// Load environment variables
dotenv.config();

// Redis connection configuration for workers
const redisConnection = {
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT || '6379'),
  password: process.env.REDIS_PASSWORD || undefined,
  maxRetriesPerRequest: null,
};

/**
 * Process event jobs
 */
const processEventJob = async (job: Job): Promise<void> => {
  logger.info(`Processing job: ${job.name}`, {
    jobId: job.id,
    jobName: job.name,
  });
  
  try {
    switch (job.name) {
      case fetchEventsJobConfig.name:
        await processFetchEventsJob(job);
        break;

      case generatePredictionsJobConfig.name:
        await processGeneratePredictionsJob(job);
        break;

      case updateResultsJobConfig.name:
        await processUpdateResultsJob(job);
        break;

      default:
        logger.warn(`Unknown job type: ${job.name}`, {
          jobId: job.id,
          jobName: job.name,
        });
    }

    logger.info(`Job completed: ${job.name}`, {
      jobId: job.id,
    });
  } catch (error) {
    logger.error(`Job failed: ${job.name}`, {
      jobId: job.id,
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
    });
    throw error;
  }
};

/**
 * Create and start the event worker
 */
const eventWorker = new Worker('events', processEventJob, {
  connection: redisConnection,
  concurrency: parseInt(process.env.WORKER_CONCURRENCY || '5'),
  limiter: {
    max: 10, // Max 10 jobs
    duration: 1000, // per second
  },
});

// Worker event listeners
eventWorker.on('ready', () => {
  console.log('🚀 Event worker is ready');
});

eventWorker.on('active', (job: Job) => {
  console.log(`▶️  Job ${job.id} started`);
});

eventWorker.on('completed', (job: Job) => {
  console.log(`✅ Job ${job.id} completed`);
});

eventWorker.on('failed', (job: Job | undefined, error: Error) => {
  console.error(`❌ Job ${job?.id} failed:`, error.message);
});

eventWorker.on('error', (error: Error) => {
  console.error('❌ Worker error:', error);
});

/**
 * Setup recurring jobs with cron schedules
 */
async function setupRecurringJobs() {
  const { eventQueue } = await import('./queues/event-queue');
  
  try {
    // Fetch events: Daily at 2:00 AM
    await eventQueue.add(
      fetchEventsJobConfig.name,
      {},
      {
        repeat: {
          pattern: '0 2 * * *', // Cron: 2:00 AM every day
        },
        ...fetchEventsJobConfig.options,
      }
    );
    logger.info('Scheduled recurring job: fetch-events (daily at 2:00 AM)');

    // Generate predictions: Twice daily at 6:00 AM and 6:00 PM
    await eventQueue.add(
      generatePredictionsJobConfig.name,
      {},
      {
        repeat: {
          pattern: '0 6,18 * * *', // Cron: 6:00 AM and 6:00 PM every day
        },
        ...generatePredictionsJobConfig.options,
      }
    );
    logger.info('Scheduled recurring job: generate-predictions (twice daily at 6 AM and 6 PM)');

    // Update results: Every hour
    await eventQueue.add(
      updateResultsJobConfig.name,
      {},
      {
        repeat: {
          pattern: '0 * * * *', // Cron: Every hour at minute 0
        },
        ...updateResultsJobConfig.options,
      }
    );
    logger.info('Scheduled recurring job: update-results (hourly)');

    logger.info('All recurring jobs scheduled successfully');
  } catch (error) {
    logger.error('Failed to setup recurring jobs', {
      error: error instanceof Error ? error.message : String(error),
    });
  }
}

// Setup recurring jobs on worker start
setupRecurringJobs().catch((error) => {
  logger.error('Error during recurring jobs setup', { error });
});

// Graceful shutdown
const gracefulShutdown = async (): Promise<void> => {
  console.log('🛑 Shutting down worker...');
  
  try {
    await eventWorker.close();
    await closeQueues();
    console.log('✅ Worker shut down gracefully');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error during worker shutdown:', error);
    process.exit(1);
  }
};

process.on('SIGTERM', gracefulShutdown);
process.on('SIGINT', gracefulShutdown);

console.log('🔧 Event worker started');
console.log(`📊 Concurrency: ${process.env.WORKER_CONCURRENCY || 5}`);
console.log(`🔗 Redis: ${process.env.REDIS_HOST || 'localhost'}:${process.env.REDIS_PORT || 6379}`);
