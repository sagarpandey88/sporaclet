/**
 * Database Migration Runner
 * Runs SQL migration files in order
 */

import fs from 'fs';
import path from 'path';
import db from '../lib/db';
import { logger } from '../middleware/logger';

const MIGRATIONS_DIR = path.join(__dirname, '../../migrations');

interface Migration {
  filename: string;
  sql: string;
}

/**
 * Get all migration files sorted by name
 */
function getMigrationFiles(): Migration[] {
  const files = fs.readdirSync(MIGRATIONS_DIR)
    .filter(f => f.endsWith('.sql'))
    .sort();
  
  return files.map(filename => ({
    filename,
    sql: fs.readFileSync(path.join(MIGRATIONS_DIR, filename), 'utf-8'),
  }));
}

/**
 * Create migrations tracking table if it doesn't exist
 */
async function createMigrationsTable(): Promise<void> {
  await db.query(`
    CREATE TABLE IF NOT EXISTS _migrations (
      id SERIAL PRIMARY KEY,
      filename VARCHAR(255) UNIQUE NOT NULL,
      executed_at TIMESTAMP NOT NULL DEFAULT NOW()
    )
  `);
}

/**
 * Get list of already executed migrations
 */
async function getExecutedMigrations(): Promise<Set<string>> {
  const result = await db.query<{ filename: string }>(`
    SELECT filename FROM _migrations ORDER BY id
  `);
  return new Set(result.rows.map(r => r.filename));
}

/**
 * Run all pending migrations
 */
export async function runMigrations(): Promise<void> {
  try {
    logger.info('Starting database migrations...');
    
    // Create migrations table
    await createMigrationsTable();
    
    // Get executed migrations
    const executed = await getExecutedMigrations();
    
    // Get all migration files
    const migrations = getMigrationFiles();
    
    // Filter pending migrations
    const pending = migrations.filter(m => !executed.has(m.filename));
    
    if (pending.length === 0) {
      logger.info('No pending migrations');
      return;
    }
    
    logger.info(`Found ${pending.length} pending migrations`);
    
    // Execute each pending migration
    for (const migration of pending) {
      logger.info(`Running migration: ${migration.filename}`);
      
      const client = await db.getClient();
      try {
        await client.query('BEGIN');
        await client.query(migration.sql);
        await client.query(
          'INSERT INTO _migrations (filename) VALUES ($1)',
          [migration.filename]
        );
        await client.query('COMMIT');
        logger.info(`Migration completed: ${migration.filename}`);
      } catch (error) {
        await client.query('ROLLBACK');
        logger.error(`Migration failed: ${migration.filename}`, { error });
        throw error;
      } finally {
        client.release();
      }
    }
    
    logger.info('All migrations completed successfully');
  } catch (error) {
    logger.error('Migration error', { error });
    throw error;
  }
}

// Run migrations if this file is executed directly
if (require.main === module) {
  runMigrations()
    .then(() => {
      logger.info('✅ Migrations completed');
      process.exit(0);
    })
    .catch((error) => {
      logger.error('❌ Migrations failed', { error });
      process.exit(1);
    });
}
