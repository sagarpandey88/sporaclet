/**
 * PostgreSQL Database Connection
 * Simple connection pool using node-postgres (pg) library
 */

import { Pool, PoolClient, QueryResult, QueryResultRow } from 'pg';
import { logger } from '../middleware/logger';

// Validate DATABASE_URL is provided
if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL environment variable is not defined');
}

// Create connection pool
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: 20, // Maximum number of clients in the pool
  idleTimeoutMillis: 30000, // Close idle clients after 30 seconds
  connectionTimeoutMillis: 2000, // Return an error after 2 seconds if connection could not be established
});

// Handle pool errors
pool.on('error', (err) => {
  logger.error('Unexpected error on idle PostgreSQL client', { error: err });
});

// Log successful connection
pool.on('connect', () => {
  logger.info('New PostgreSQL client connected to pool');
});

/**
 * Execute a query with parameters
 */
export async function query<T extends QueryResultRow = any>(
  text: string,
  params?: any[]
): Promise<QueryResult<T>> {
  const start = Date.now();
  try {
    const result = await pool.query<T>(text, params);
    const duration = Date.now() - start;
    logger.debug('Executed query', { text, duration, rows: result.rowCount });
    return result;
  } catch (error) {
    logger.error('Query error', { text, error });
    throw error;
  }
}

/**
 * Get a client from the pool for transactions
 */
export async function getClient(): Promise<PoolClient> {
  return await pool.connect();
}

/**
 * Close the connection pool
 */
export async function disconnect(): Promise<void> {
  await pool.end();
  logger.info('PostgreSQL connection pool closed');
}

/**
 * Test database connectivity
 */
export async function testConnection(): Promise<boolean> {
  try {
    const result = await query('SELECT NOW()');
    return result.rows.length > 0;
  } catch (error) {
    logger.error('Database connection test failed', { error });
    return false;
  }
}

export default {
  query,
  getClient,
  disconnect,
  testConnection,
  pool,
};
