import { Queue, QueueOptions } from 'bullmq';
import Redis from 'ioredis';

// Redis connection configuration
const redisConnection = new Redis({
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT || '6379'),
  password: process.env.REDIS_PASSWORD || undefined,
  maxRetriesPerRequest: null, // Required for BullMQ
});

// Queue options
const queueOptions: QueueOptions = {
  connection: redisConnection,
  defaultJobOptions: {
    attempts: 3,
    backoff: {
      type: 'exponential',
      delay: 1000,
    },
    removeOnComplete: {
      count: 100, // Keep last 100 completed jobs
      age: 24 * 3600, // Keep jobs for 24 hours
    },
    removeOnFail: {
      count: 500, // Keep last 500 failed jobs
      age: 7 * 24 * 3600, // Keep failed jobs for 7 days
    },
  },
};

/**
 * Event Queue
 * Handles background jobs for event processing, prediction generation, etc.
 */
export const eventQueue = new Queue('events', queueOptions);

/**
 * Event types/job names
 */
export const EVENT_JOBS = {
  FETCH_UPCOMING: 'fetch-upcoming-events',
  UPDATE_EVENT: 'update-event',
  GENERATE_PREDICTION: 'generate-prediction',
  UPDATE_SCORES: 'update-event-scores',
  SYNC_TEAMS: 'sync-teams',
  SYNC_PLAYERS: 'sync-players',
  UPDATE_INJURIES: 'update-injuries',
} as const;

/**
 * Add a job to the event queue
 */
export const addEventJob = async (
  jobName: string,
  data: unknown,
  options?: {
    delay?: number;
    priority?: number;
    repeat?: {
      pattern?: string;
      every?: number;
    };
  }
): Promise<void> => {
  try {
    await eventQueue.add(jobName, data, options);
    console.log(`✅ Added job ${jobName} to queue`);
  } catch (error) {
    console.error(`❌ Failed to add job ${jobName}:`, error);
    throw error;
  }
};

/**
 * Get queue statistics
 */
export const getQueueStats = async (): Promise<{
  waiting: number;
  active: number;
  completed: number;
  failed: number;
}> => {
  const [waiting, active, completed, failed] = await Promise.all([
    eventQueue.getWaitingCount(),
    eventQueue.getActiveCount(),
    eventQueue.getCompletedCount(),
    eventQueue.getFailedCount(),
  ]);

  return { waiting, active, completed, failed };
};

/**
 * Close queue connections
 */
export const closeQueues = async (): Promise<void> => {
  await eventQueue.close();
  await redisConnection.quit();
};
