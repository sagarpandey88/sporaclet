# Background Workers Documentation

## Overview

Sporaclet uses **node-cron** for scheduling background jobs that handle event fetching, prediction generation, and result updates. The workers run as a separate Node.js process independent from the API server.

## Architecture

- **Scheduler**: node-cron (simple, lightweight cron-based scheduler)
- **Jobs**: Three main background jobs
- **Execution**: Runs in-process, no external dependencies needed

## Jobs

### 1. Fetch Events Job
- **Schedule**: Daily at 2:00 AM (configurable via `WORKER_FETCH_EVENTS_SCHEDULE`)
- **Default Cron**: `0 2 * * *`
- **Purpose**: Fetches upcoming sporting events from TheSportsDB API and stores them in the database
- **File**: `src/workers/jobs/fetch-events.job.ts`

### 2. Generate Predictions Job
- **Schedule**: Twice daily at 6:00 AM and 6:00 PM (configurable via `WORKER_GENERATE_PREDICTIONS_SCHEDULE`)
- **Default Cron**: `0 6,18 * * *`
- **Purpose**: Generates AI-powered predictions for upcoming events
- **File**: `src/workers/jobs/generate-predictions.job.ts`

### 3. Update Results Job
- **Schedule**: Every hour (configurable via `WORKER_UPDATE_RESULTS_SCHEDULE`)
- **Default Cron**: `0 * * * *`
- **Purpose**: Fetches completed event results and updates prediction accuracy
- **File**: `src/workers/jobs/update-results.job.ts`

## Running Workers

### Development

```bash
cd server
npm run worker:dev
```

This command uses nodemon to watch for file changes and automatically restart the worker.

### Production

```bash
cd server
npm run build
npm run worker
```

Or using the built JavaScript:

```bash
node dist/workers/index.js
```

## Configuration

Configure worker schedules in your `.env` file:

```env
# Cron schedule format: minute hour day month weekday
WORKER_FETCH_EVENTS_SCHEDULE="0 2 * * *"           # Daily at 2:00 AM
WORKER_GENERATE_PREDICTIONS_SCHEDULE="0 6,18 * * *" # Twice daily at 6 AM and 6 PM
WORKER_UPDATE_RESULTS_SCHEDULE="0 * * * *"         # Every hour
```

### Cron Format

```
┌───────────── minute (0 - 59)
│ ┌───────────── hour (0 - 23)
│ │ ┌───────────── day of the month (1 - 31)
│ │ │ ┌───────────── month (1 - 12)
│ │ │ │ ┌───────────── day of the week (0 - 6) (Sunday to Saturday)
│ │ │ │ │
│ │ │ │ │
* * * * *
```

### Examples

- `0 2 * * *` - Daily at 2:00 AM
- `0 6,18 * * *` - Twice daily at 6:00 AM and 6:00 PM
- `0 * * * *` - Every hour at minute 0
- `*/15 * * * *` - Every 15 minutes
- `0 0 * * 0` - Weekly on Sunday at midnight

## Deployment

### Docker

The workers should run as a separate container alongside the API server:

```yaml
services:
  worker:
    build: ./server
    command: npm run worker
    environment:
      - DATABASE_URL=${DATABASE_URL}
      - WORKER_FETCH_EVENTS_SCHEDULE=0 2 * * *
      - WORKER_GENERATE_PREDICTIONS_SCHEDULE=0 6,18 * * *
      - WORKER_UPDATE_RESULTS_SCHEDULE=0 * * * *
    depends_on:
      - postgres
```

### Process Manager

For production deployments without Docker, use a process manager like PM2:

```bash
# Install PM2
npm install -g pm2

# Start worker
pm2 start dist/workers/index.js --name sporaclet-worker

# Save configuration
pm2 save

# Setup to start on system boot
pm2 startup
```

## Monitoring

Workers log their activity using Winston logger. Check logs for:

- Job scheduling confirmation
- Job start/completion messages
- Any errors during job execution

Example log output:

```
🔧 Starting cron-based worker...
✅ Scheduled: fetch-events (0 2 * * *)
✅ Scheduled: generate-predictions (0 6,18 * * *)
✅ Scheduled: update-results (0 * * * *)
🚀 Cron worker is ready and running
```

## Graceful Shutdown

The worker handles SIGTERM and SIGINT signals for graceful shutdown:

```bash
# Ctrl+C or
kill -SIGTERM <pid>
```

This will:
1. Stop all scheduled cron jobs
2. Wait for current job executions to complete
3. Exit cleanly

## Error Handling

- Each job has built-in error handling and logging
- Failed jobs are logged but don't crash the worker
- Jobs run independently - one failure doesn't affect others

## Migration from BullMQ

The workers were previously implemented using BullMQ (Redis-based queue). The migration to node-cron provides:

- **Simplicity**: No external Redis dependency for job queuing
- **Lightweight**: Runs directly in Node.js process
- **Easy Configuration**: Simple cron expressions instead of complex queue configurations
- **Reduced Infrastructure**: One less service to manage and monitor

Note: Redis is still used for application caching but not for job queuing.
