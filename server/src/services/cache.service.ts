import Redis from 'ioredis';
import { logger } from '../middleware/logger';

class CacheService {
  private client: Redis;
  private isConnected: boolean = false;

  constructor() {
    this.client = new Redis({
      host: process.env.REDIS_HOST || 'localhost',
      port: parseInt(process.env.REDIS_PORT || '6379'),
      password: process.env.REDIS_PASSWORD || undefined,
      retryStrategy: (times: number) => {
        const delay = Math.min(times * 50, 2000);
        logger.warn(`Redis retry attempt ${times}, waiting ${delay}ms`);
        return delay;
      },
      maxRetriesPerRequest: 3,
    });

    this.client.on('connect', () => {
      this.isConnected = true;
      logger.info('✅ Redis connected successfully');
    });

    this.client.on('error', (error: Error) => {
      logger.error('❌ Redis connection error:', {
        error: error.message,
        stack: error.stack,
      });
      this.isConnected = false;
    });

    this.client.on('reconnecting', () => {
      logger.warn('⚠️  Redis reconnecting...');
    });
  }

  /**
   * Get value from cache with graceful degradation
   */
  async get<T>(key: string): Promise<T | null> {
    if (!this.isConnected) {
      logger.warn('Redis not connected, skipping cache read');
      return null;
    }

    try {
      const value = await this.client.get(key);
      if (!value) return null;
      return JSON.parse(value) as T;
    } catch (error) {
      logger.error(`Cache get error for key ${key}:`, {
        error: error instanceof Error ? error.message : String(error),
      });
      // Return null to gracefully degrade (serve from database)
      return null;
    }
  }

  /**
   * Set value in cache with TTL and error handling
   */
  async set(key: string, value: unknown, ttlSeconds?: number): Promise<void> {
    if (!this.isConnected) {
      logger.warn('Redis not connected, skipping cache write');
      return;
    }

    try {
      const stringValue = JSON.stringify(value);
      if (ttlSeconds) {
        await this.client.setex(key, ttlSeconds, stringValue);
      } else {
        await this.client.set(key, stringValue);
      }
    } catch (error) {
      logger.error(`Cache set error for key ${key}:`, {
        error: error instanceof Error ? error.message : String(error),
      });
      // Don't throw - gracefully degrade
    }
  }

  /**
   * Delete value from cache
   */
  async delete(key: string): Promise<void> {
    if (!this.isConnected) {
      return;
    }

    try {
      await this.client.del(key);
    } catch (error) {
      logger.error(`Cache delete error for key ${key}:`, {
        error: error instanceof Error ? error.message : String(error),
      });
    }
  }

  /**
   * Clear all cache (use with caution)
   */
  async clear(): Promise<void> {
    if (!this.isConnected) {
      logger.warn('Redis not connected, cannot clear cache');
      return;
    }

    try {
      await this.client.flushdb();
      logger.info('Cache cleared successfully');
    } catch (error) {
      logger.error('Cache clear error:', {
        error: error instanceof Error ? error.message : String(error),
      });
    }
  }

  /**
   * Check if key exists
   */
  async exists(key: string): Promise<boolean> {
    if (!this.isConnected) {
      return false;
    }

    try {
      const result = await this.client.exists(key);
      return result === 1;
    } catch (error) {
      logger.error(`Cache exists error for key ${key}:`, {
        error: error instanceof Error ? error.message : String(error),
      });
      return false;
    }
  }

  /**
   * Get Redis client health status
   */
  getHealth(): { connected: boolean } {
    return { connected: this.isConnected };
  }

  /**
   * Close Redis connection
   */
  async disconnect(): Promise<void> {
    await this.client.quit();
  }
}

export default new CacheService();
