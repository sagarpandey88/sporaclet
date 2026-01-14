import { Request, Response } from 'express';
import db from '../lib/db';
import cacheService from '../services/cache.service';
import { asyncHandler } from '../middleware/error-handler';

/**
 * Health check response interface
 */
interface HealthCheckResponse {
  status: 'healthy' | 'unhealthy';
  timestamp: string;
  uptime: number;
  services: {
    database: ServiceStatus;
    cache: ServiceStatus;
    externalApi: ServiceStatus;
  };
}

interface ServiceStatus {
  status: 'up' | 'down';
  responseTime?: number;
  error?: string;
}

/**
 * Check database connectivity
 */
const checkDatabase = async (): Promise<ServiceStatus> => {
  const start = Date.now();
  try {
    const result = await db.query('SELECT NOW()');
    if (result.rows.length > 0) {
      return {
        status: 'up',
        responseTime: Date.now() - start,
      };
    }
    return {
      status: 'down',
      error: 'No response from database',
    };
  } catch (error) {
    return {
      status: 'down',
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
};

/**
 * Check Redis cache connectivity
 */
const checkCache = async (): Promise<ServiceStatus> => {
  const start = Date.now();
  try {
    const testKey = 'health_check_test';
    await cacheService.set(testKey, 'ok', 10);
    const value = await cacheService.get<string>(testKey);
    await cacheService.delete(testKey);
    
    if (value === 'ok') {
      return {
        status: 'up',
        responseTime: Date.now() - start,
      };
    }
    return {
      status: 'down',
      error: 'Cache test failed',
    };
  } catch (error) {
    return {
      status: 'down',
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
};

/**
 * Check external API connectivity (placeholder)
 * This would check TheSportsDB or other external APIs
 */
const checkExternalApi = async (): Promise<ServiceStatus> => {
  const start = Date.now();
  try {
    // TODO: Implement actual external API health check
    // For now, just simulate a successful check
    const apiUrl = process.env.EXTERNAL_API_URL || 'https://www.thesportsdb.com/api/v1/json';
    
    // Simple check - just verify URL is configured
    if (!apiUrl) {
      return {
        status: 'down',
        error: 'External API URL not configured',
      };
    }

    return {
      status: 'up',
      responseTime: Date.now() - start,
    };
  } catch (error) {
    return {
      status: 'down',
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
};

/**
 * GET /api/health
 * Health check endpoint
 */
export const getHealth = asyncHandler(
  async (_req: Request, res: Response): Promise<void> => {
    // Run all health checks in parallel
    const [database, cache, externalApi] = await Promise.all([
      checkDatabase(),
      checkCache(),
      checkExternalApi(),
    ]);

    // Determine overall health status
    const isHealthy =
      database.status === 'up' &&
      cache.status === 'up' &&
      externalApi.status === 'up';

    const response: HealthCheckResponse = {
      status: isHealthy ? 'healthy' : 'unhealthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      services: {
        database,
        cache,
        externalApi,
      },
    };

    // Return 503 if any service is down, otherwise 200
    const statusCode = isHealthy ? 200 : 503;
    res.status(statusCode).json(response);
  }
);
