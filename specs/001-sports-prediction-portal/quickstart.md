# Quickstart Guide: Sports Prediction Portal

**Feature**: Sports Prediction Portal  
**Last Updated**: 2025-11-04

## Overview

This guide will help you set up the Sports Prediction Portal development environment and get the application running locally.

---

## Prerequisites

### Required Software

- **Node.js**: 18.x or higher ([Download](https://nodejs.org/))
- **npm**: 9.x or higher (comes with Node.js)
- **PostgreSQL**: 14.x or higher ([Download](https://www.postgresql.org/download/))
- **Redis**: 6.x or higher ([Download](https://redis.io/download))
- **Git**: Latest version ([Download](https://git-scm.com/downloads))

### Recommended Tools

- **Docker** (optional): For running PostgreSQL and Redis in containers
- **Postman** or **Insomnia**: For API testing
- **VS Code**: With recommended extensions (see below)

### VS Code Extensions

```bash
# Install recommended extensions
code --install-extension dbaeumer.vscode-eslint
code --install-extension esbenp.prettier-vscode
code --install-extension Prisma.prisma
code --install-extension bradlc.vscode-tailwindcss
```

---

## Initial Setup

### 1. Clone Repository

```bash
git clone <repository-url>
cd sporaclet
```

### 2. Install Dependencies

```bash
# Install client dependencies
cd client
npm install

# Install server dependencies
cd ../server
npm install
```

### 3. Set Up Database

#### Option A: Using Docker (Recommended)

```bash
# Create docker-compose.yml in project root
docker-compose up -d postgres redis
```

**docker-compose.yml**:
```yaml
version: '3.8'

services:
  postgres:
    image: postgres:14-alpine
    container_name: sporaclet-db
    environment:
      POSTGRES_USER: sporaclet
      POSTGRES_PASSWORD: dev_password
      POSTGRES_DB: sporaclet_dev
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U sporaclet"]
      interval: 10s
      timeout: 5s
      retries: 5

  redis:
    image: redis:7-alpine
    container_name: sporaclet-redis
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]
      interval: 10s
      timeout: 3s
      retries: 5

volumes:
  postgres_data:
  redis_data:
```

#### Option B: Local Installation

**PostgreSQL**:
```bash
# macOS (using Homebrew)
brew install postgresql@14
brew services start postgresql@14

# Ubuntu/Debian
sudo apt-get install postgresql-14
sudo systemctl start postgresql

# Create database
createdb sporaclet_dev
```

**Redis**:
```bash
# macOS (using Homebrew)
brew install redis
brew services start redis

# Ubuntu/Debian
sudo apt-get install redis-server
sudo systemctl start redis
```

### 4. Configure Environment Variables

#### Server Environment (.env)

Create `server/.env`:

```env
# Server Configuration
NODE_ENV=development
PORT=3001
HOST=localhost

# Database
DATABASE_URL="postgresql://sporaclet:dev_password@localhost:5432/sporaclet_dev"

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=

# Cache TTLs (seconds)
CACHE_TTL_EVENTS_LIST=3600      # 1 hour
CACHE_TTL_EVENT_DETAIL=900      # 15 minutes

# Rate Limiting
RATE_LIMIT_WINDOW_MS=60000      # 1 minute
RATE_LIMIT_MAX_REQUESTS=100     # 100 requests per minute

# External APIs
SPORTS_API_BASE_URL=https://www.thesportsdb.com/api/v1/json
SPORTS_API_KEY=1                # Free tier key

# OpenAI (for AI predictions)
OPENAI_API_KEY=your_openai_api_key_here
OPENAI_MODEL=gpt-4

# Worker Configuration
WORKER_FETCH_EVENTS_SCHEDULE="0 0 * * *"       # Daily at midnight
WORKER_GENERATE_PREDICTIONS_SCHEDULE="0 6 * * *"  # Daily at 6 AM
WORKER_UPDATE_RESULTS_SCHEDULE="0 */6 * * *"   # Every 6 hours

# Logging
LOG_LEVEL=debug
LOG_FORMAT=dev

# CORS
CORS_ORIGIN=http://localhost:3000

# Health Check
HEALTH_CHECK_TIMEOUT_MS=5000
```

#### Client Environment (.env.local)

Create `client/.env.local`:

```env
# API Configuration
NEXT_PUBLIC_API_URL=http://localhost:3001/api

# Application
NEXT_PUBLIC_APP_NAME="Sports Prediction Portal"
NEXT_PUBLIC_APP_VERSION=1.0.0

# Feature Flags
NEXT_PUBLIC_ENABLE_SEARCH=true
NEXT_PUBLIC_ENABLE_FILTERS=true

# Analytics (optional)
NEXT_PUBLIC_GA_TRACKING_ID=

# Environment
NEXT_PUBLIC_ENV=development
```

### 5. Initialize Database

```bash
cd server

# Generate Prisma client
npx prisma generate

# Run migrations
npx prisma migrate dev --name init

# Seed initial data
npx prisma db seed
```

**Verify Database Setup**:
```bash
# Open Prisma Studio to view database
npx prisma studio
```

### 6. Verify Services

```bash
# Check PostgreSQL connection
psql -h localhost -U sporaclet -d sporaclet_dev -c "SELECT version();"

# Check Redis connection
redis-cli ping
# Expected output: PONG
```

---

## Running the Application

### Development Mode

#### Terminal 1: Start Backend Server

```bash
cd server
npm run dev
```

Expected output:
```
Server running on http://localhost:3001
Database connected
Redis connected
Worker queues initialized
```

#### Terminal 2: Start Background Workers

```bash
cd server
npm run worker:dev
```

Expected output:
```
Worker started
Queue: fetchEventsQueue - Ready
Queue: generatePredictionsQueue - Ready
Queue: updateResultsQueue - Ready
```

#### Terminal 3: Start Frontend

```bash
cd client
npm run dev
```

Expected output:
```
Ready started server on 0.0.0.0:3000, url: http://localhost:3000
```

### Access the Application

- **Frontend**: http://localhost:3000
- **API**: http://localhost:3001/api
- **API Health**: http://localhost:3001/api/health
- **Prisma Studio**: http://localhost:5555 (after running `npx prisma studio`)

---

## Development Workflow

### 1. Feature Development

```bash
# Create feature branch
git checkout -b feature/your-feature-name

# Make changes...

# Run linting
cd client && npm run lint
cd ../server && npm run lint

# Run tests
cd client && npm test
cd ../server && npm test

# Commit changes
git add .
git commit -m "feat: your feature description"
```

### 2. Database Changes

```bash
# Modify schema in prisma/schema.prisma

# Create and apply migration
npx prisma migrate dev --name your_migration_name

# Regenerate Prisma client
npx prisma generate
```

### 3. Testing API Endpoints

**Using cURL**:
```bash
# List events
curl http://localhost:3001/api/events

# Get event details
curl http://localhost:3001/api/events/{event-id}

# Health check
curl http://localhost:3001/api/health
```

**Using Postman**:
Import the OpenAPI spec from `specs/001-sports-prediction-portal/contracts/api.yaml`

### 4. Running Tests

```bash
# Client tests
cd client
npm test                    # Run all tests
npm test -- --watch        # Watch mode
npm test -- --coverage     # With coverage

# Server tests
cd server
npm test                    # Run all tests
npm test -- --watch        # Watch mode
npm test -- --coverage     # With coverage

# E2E tests (both services must be running)
cd client
npm run test:e2e
```

### 5. Background Job Testing

```bash
# Trigger job manually via Redis
redis-cli LPUSH bull:fetchEventsQueue:waiting "{\"data\":{}}"

# View job status in Bull Dashboard (if configured)
# or check logs in terminal running worker
```

---

## Common Tasks

### Reset Database

```bash
cd server

# Reset and reseed database
npx prisma migrate reset

# Or manually
npx prisma db push --force-reset
npx prisma db seed
```

### Clear Redis Cache

```bash
# Clear all cache
redis-cli FLUSHDB

# Clear specific pattern
redis-cli --scan --pattern "cache:*" | xargs redis-cli DEL
```

### View Logs

```bash
# Server logs (if using Winston file transport)
tail -f server/logs/combined.log
tail -f server/logs/error.log

# Worker logs
tail -f server/logs/worker.log
```

### Database Backups

```bash
# Backup database
pg_dump -U sporaclet sporaclet_dev > backup.sql

# Restore database
psql -U sporaclet sporaclet_dev < backup.sql
```

---

## Project Structure

```
sporaclet/
├── client/                    # Next.js frontend
│   ├── src/
│   │   ├── app/              # App Router pages
│   │   ├── components/       # React components
│   │   ├── lib/              # Utilities and helpers
│   │   └── styles/           # Global styles
│   ├── public/               # Static assets
│   ├── package.json
│   └── next.config.js
│
├── server/                    # Express.js backend
│   ├── src/
│   │   ├── controllers/      # Route controllers
│   │   ├── services/         # Business logic
│   │   ├── repositories/     # Data access layer
│   │   ├── middleware/       # Express middleware
│   │   ├── workers/          # Background jobs
│   │   │   ├── jobs/         # Job definitions
│   │   │   └── queues/       # Queue configurations
│   │   ├── utils/            # Utilities
│   │   └── index.ts          # Server entry point
│   ├── prisma/
│   │   ├── schema.prisma     # Database schema
│   │   ├── migrations/       # Migration files
│   │   └── seed.ts           # Seed script
│   ├── tests/                # Test files
│   ├── package.json
│   └── tsconfig.json
│
├── specs/                     # Feature specifications
├── .specify/                  # SpecKit configuration
├── docker-compose.yml
└── README.md
```

---

## Troubleshooting

### Port Already in Use

```bash
# Find process using port
lsof -i :3000  # Frontend
lsof -i :3001  # Backend

# Kill process
kill -9 <PID>
```

### Database Connection Errors

```bash
# Check PostgreSQL is running
pg_isready -h localhost -p 5432

# Check connection string in .env
# Verify username, password, database name

# Restart PostgreSQL
# macOS: brew services restart postgresql@14
# Ubuntu: sudo systemctl restart postgresql
```

### Redis Connection Errors

```bash
# Check Redis is running
redis-cli ping

# Check Redis configuration in .env
# Verify host and port

# Restart Redis
# macOS: brew services restart redis
# Ubuntu: sudo systemctl restart redis
```

### Prisma Client Errors

```bash
# Regenerate Prisma client
npx prisma generate

# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

### Worker Not Processing Jobs

```bash
# Check Redis connection
# Verify queue names in worker configuration
# Check worker logs for errors

# View Bull queues
redis-cli KEYS "bull:*"

# View pending jobs
redis-cli LRANGE bull:fetchEventsQueue:waiting 0 -1
```

### OpenAI API Errors

```bash
# Verify API key in .env
# Check API quota: https://platform.openai.com/usage
# Review error logs for specific error codes
```

---

## Additional Resources

### Documentation

- [Next.js Docs](https://nextjs.org/docs)
- [Express.js Docs](https://expressjs.com/)
- [Prisma Docs](https://www.prisma.io/docs)
- [BullMQ Docs](https://docs.bullmq.io/)
- [Tailwind CSS Docs](https://tailwindcss.com/docs)
- [shadcn/ui Docs](https://ui.shadcn.com/)

### Internal Docs

- [Constitution](./.specify/memory/constitution.md)
- [Feature Spec](./specs/001-sports-prediction-portal/spec.md)
- [Data Model](./specs/001-sports-prediction-portal/data-model.md)
- [API Contracts](./specs/001-sports-prediction-portal/contracts/api.yaml)

### Development Commands Cheat Sheet

```bash
# Client
npm run dev           # Start dev server
npm run build         # Production build
npm run start         # Start production server
npm run lint          # Run ESLint
npm run test          # Run tests

# Server
npm run dev           # Start dev server (nodemon)
npm run build         # Compile TypeScript
npm run start         # Start production server
npm run worker:dev    # Start worker in dev mode
npm run worker:start  # Start worker in production
npm run lint          # Run ESLint
npm run test          # Run tests

# Database
npx prisma studio          # Open Prisma Studio
npx prisma migrate dev     # Create and apply migration
npx prisma migrate reset   # Reset database
npx prisma generate        # Generate Prisma client
npx prisma db seed         # Run seed script
```

---

## Getting Help

1. **Check Constitution**: Review [.specify/memory/constitution.md](./.specify/memory/constitution.md) for project principles
2. **Check Specs**: Review feature specification for requirements
3. **Check Logs**: Review application logs for errors
4. **GitHub Issues**: Search existing issues or create a new one
5. **Team Chat**: Ask in development channel

---

## Next Steps

After completing this quickstart:

1. ✅ Familiarize yourself with the codebase structure
2. ✅ Review the constitution and feature specification
3. ✅ Run the test suite to ensure everything works
4. ✅ Try creating a simple feature branch
5. ✅ Review open issues and pick a task

Happy coding! 🚀
