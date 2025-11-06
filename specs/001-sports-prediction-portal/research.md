# Research: Sports Prediction Portal

**Feature**: Sports Prediction Portal  
**Phase**: 0 - Research & Technology Selection  
**Date**: 2025-11-04

## Overview

Research findings for implementing an AI-assisted sports prediction portal with Next.js frontend, Express.js backend, and background workers for AI prediction generation.

---

## 1. Sports Data Sources

### Decision: TheSportsDB API + Sports Data IO

**Rationale**:
- **TheSportsDB**: Free tier available, comprehensive coverage of major sports (Football, Basketball, Cricket, Tennis), includes team rosters, player info, historical match data, and injury reports
- **Sports Data IO**: Premium option for real-time data and more detailed statistics if budget allows
- Both provide RESTful APIs with JSON responses, easy to integrate with Express.js backend

**Alternatives Considered**:
- **API-FOOTBALL**: Excellent for football but limited to one sport, requires separate APIs for other sports
- **ESPN API**: Unofficial/undocumented, not reliable for production
- **Custom web scraping**: High maintenance, legal concerns, unreliable

**Implementation Approach**:
- Use TheSportsDB for MVP (free tier: 2 requests/second limit)
- Worker job fetches new events daily, respecting rate limits
- Cache responses to minimize API calls
- Store fetched data in PostgreSQL for offline access

**API Endpoints Needed**:
- `/eventsday.php`: Get events by date
- `/eventsnextleague.php`: Get upcoming events for a league
- `/eventspastleague.php`: Get past events
- `/lookupteam.php`: Get team details and roster
- `/lookupplayer.php`: Get player details

---

## 2. AI/ML Model for Predictions

### Decision: OpenAI GPT-4 API + Historical Data Analysis

**Rationale**:
- **OpenAI GPT-4**: Can analyze historical data, team statistics, injuries, and recent form to generate probability distributions
- Prompt engineering approach: Pass structured data (H2H stats, rosters, injuries) and request probability distribution output
- No need to train custom ML model for MVP (reduces complexity and time-to-market)
- Can explain predictions (key influencing factors) in natural language

**Alternatives Considered**:
- **Custom ML Model (scikit-learn/TensorFlow)**: More accurate long-term but requires significant training data, expertise, and time
- **Statistical Models (ELO rating)**: Simpler but less sophisticated, doesn't consider injuries/form
- **AWS SageMaker**: Overkill for MVP, high cost

**Implementation Approach**:
```typescript
// Worker job: Generate prediction
const prompt = `
Analyze this sports event and provide win probability distribution:
- Sport: ${sport}
- Team A: ${teamA} (Recent form: ${formA}, Injuries: ${injuriesA})
- Team B: ${teamB} (Recent form: ${formB}, Injuries: ${injuriesB})
- Head-to-head: ${h2hStats}
- Venue: ${venue}

Output format:
{
  "probabilities": {
    "teamA": 0.65,
    "teamB": 0.35
  },
  "confidence": "medium",
  "key_factors": ["Team A home advantage", "Team B missing key player"]
}
`;
```

- Run prediction generation twice daily for upcoming events
- Store predictions with timestamp for accuracy tracking
- Fallback: If API unavailable, display "Prediction pending"

---

## 3. Job Queue System

### Decision: BullMQ + Redis

**Rationale**:
- **BullMQ**: Modern, TypeScript-friendly, reliable job queue for Node.js
- **Redis**: Required by BullMQ, also useful for caching event data (1hr/15min TTLs)
- Built-in features: Retry logic, exponential backoff, job scheduling (cron), monitoring dashboard
- Handles three worker jobs: fetch-events, generate-predictions, update-results

**Alternatives Considered**:
- **pg-boss**: Uses PostgreSQL instead of Redis, reduces infrastructure but less performant for high-frequency jobs
- **Agenda**: MongoDB-based, not compatible with our PostgreSQL stack
- **node-cron + in-memory**: No persistence, jobs lost on crash

**Implementation Approach**:
```typescript
// server/src/workers/queues/event-queue.ts
import { Queue, Worker } from 'bullmq';

export const eventQueue = new Queue('events', {
  connection: { host: 'localhost', port: 6379 }
});

// Schedule jobs
await eventQueue.add('fetch-events', {}, {
  repeat: { pattern: '0 2 * * *' } // Daily at 2 AM
});

await eventQueue.add('generate-predictions', {}, {
  repeat: { pattern: '0 6,18 * * *' } // Twice daily at 6 AM and 6 PM
});
```

**Job Configurations**:
- **fetch-events**: Daily at 2 AM, 3 retries with exponential backoff (1min, 5min, 15min)
- **generate-predictions**: Twice daily (6 AM, 6 PM), 2 retries
- **update-results**: Runs 2 hours after event scheduled end time, 5 retries

---

## 4. Frontend Data Visualization

### Decision: Recharts + Custom SVG for Field Diagrams

**Rationale**:
- **Recharts**: React-friendly, responsive charts for displaying probability distributions, H2H statistics, player stats
- **Custom SVG components**: For sport-specific field/court visualizations with player positions
- Both integrate well with Next.js and support SSR

**Alternatives Considered**:
- **Chart.js**: Not React-native, requires wrapper
- **D3.js**: Powerful but complex, overkill for simple bar charts
- **Victory**: Good alternative but less popular/documented than Recharts

**Implementation Approach**:

```tsx
// Probability distribution chart
import { BarChart, Bar, XAxis, YAxis, Tooltip } from 'recharts';

const PredictionChart = ({ prediction }) => {
  const data = [
    { team: 'Team A', probability: prediction.teamA * 100 },
    { team: 'Team B', probability: prediction.teamB * 100 }
  ];
  
  return (
    <BarChart width={400} height={300} data={data}>
      <XAxis dataKey="team" />
      <YAxis />
      <Tooltip />
      <Bar dataKey="probability" fill="#3b82f6" />
    </BarChart>
  );
};

// Football field visualization (custom SVG)
const FootballField = ({ teamA, teamB, formation }) => {
  return (
    <svg viewBox="0 0 800 600" className="w-full">
      {/* Field background */}
      <rect fill="#2d5016" width="800" height="600" />
      {/* Field lines */}
      <line x1="400" y1="0" x2="400" y2="600" stroke="white" />
      {/* Player positions mapped from formation data */}
      {formation.teamA.map((player, idx) => (
        <g key={idx}>
          <circle cx={player.x} cy={player.y} r="15" fill="#ef4444" />
          <text x={player.x} y={player.y+5} textAnchor="middle" fill="white" fontSize="12">
            {player.number}
          </text>
        </g>
      ))}
    </svg>
  );
};
```

---

## 5. Caching Strategy

### Decision: Redis for API caching + Next.js built-in caching

**Rationale**:
- **Redis**: Backend API response caching (event listings: 1hr, event details: 15min)
- **Next.js**: Automatic Server Component caching + `revalidate` option for SSR pages
- Reduces database queries and external API calls significantly

**Implementation Approach**:

```typescript
// Backend: Redis caching service
class CacheService {
  async getCached<T>(key: string, ttl: number, fetchFn: () => Promise<T>): Promise<T> {
    const cached = await redis.get(key);
    if (cached) return JSON.parse(cached);
    
    const data = await fetchFn();
    await redis.setex(key, ttl, JSON.stringify(data));
    return data;
  }
}

// Usage in event service
async listEvents(filters) {
  return await cacheService.getCached(
    `events:${JSON.stringify(filters)}`,
    3600, // 1 hour
    () => this.eventRepository.find(filters)
  );
}

// Frontend: Next.js revalidation
export const revalidate = 900; // 15 minutes

async function EventDetailPage({ params }) {
  const event = await fetch(`/api/events/${params.id}`);
  return <EventDetail event={event} />;
}
```

---

## 6. Rate Limiting Implementation

### Decision: express-rate-limit middleware

**Rationale**:
- Simple, battle-tested middleware for Express.js
- IP-based rate limiting (100 req/min per spec)
- Flexible configuration per route if needed
- Returns standard 429 (Too Many Requests) status

**Implementation Approach**:

```typescript
// server/src/middleware/rate-limiter.ts
import rateLimit from 'express-rate-limit';

export const apiLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 100, // 100 requests per minute
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true, // Return rate limit info in headers
  legacyHeaders: false,
});

// Apply to all API routes
app.use('/api/', apiLimiter);
```

---

## 7. Database Schema Design

### Decision: Prisma ORM with PostgreSQL

**Rationale**:
- **Prisma**: TypeScript-first ORM, excellent DX, type-safe queries, automatic migrations
- Generates TypeScript types from schema (type safety across stack)
- Supports complex relations (events ↔ teams ↔ players ↔ injuries)
- Built-in connection pooling

**Alternatives Considered**:
- **TypeORM**: More mature but less intuitive, decorator-based approach
- **Knex.js**: Query builder, not full ORM, more manual work
- **Raw SQL**: No type safety, prone to errors

**Key Design Decisions**:
- Use UUID for all IDs (better for distributed systems, no sequential enumeration)
- Soft deletes for events (keep historical data)
- Composite indexes on frequently queried columns (sport + status, date range)
- JSON column for prediction probability distribution (flexible for multi-participant events)
- Audit timestamps (createdAt, updatedAt) on all tables

---

## 8. Authentication & Authorization (Out of MVP Scope)

### Decision: Deferred to post-MVP

**Rationale**:
- Spec explicitly states public access for MVP
- Reduces initial complexity
- Can add later with JWT or NextAuth.js without major refactoring

**Future Approach** (when needed):
- **NextAuth.js**: Popular choice for Next.js apps, supports multiple providers
- **JWT tokens**: For API authentication
- **Role-based access**: Admin dashboard for managing predictions

---

## 9. Monitoring & Logging

### Decision: Winston (logging) + Morgan (HTTP logs)

**Rationale**:
- **Winston**: Flexible, supports multiple transports (console, file, external services)
- **Morgan**: Standard HTTP request logging for Express
- Both integrate seamlessly with Node.js/Express

**Implementation Approach**:

```typescript
// server/src/middleware/logger.ts
import winston from 'winston';

export const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' })
  ]
});

// HTTP request logging
app.use(morgan('combined', { stream: { write: (msg) => logger.info(msg.trim()) } }));
```

---

## 10. Testing Strategy

### Decision: Jest + React Testing Library + Supertest + Playwright

**Rationale**:
- **Jest**: Standard for TypeScript/Node.js testing, great mocking capabilities
- **React Testing Library**: User-centric component testing, aligns with accessibility focus
- **Supertest**: API integration testing for Express routes
- **Playwright**: E2E testing across browsers, better than Cypress for SSR apps

**Coverage Targets**:
- Unit tests: 80% minimum (services, repositories, utilities)
- Integration tests: All API endpoints
- Component tests: All user-facing components
- E2E tests: Critical user journeys (P1, P2 user stories)

**Test Structure**:
```
client/tests/
├── components/
│   ├── event-card.test.tsx
│   └── prediction-display.test.tsx
└── integration/
    └── event-flow.spec.ts (Playwright)

server/tests/
├── unit/
│   ├── services/
│   │   └── event.service.test.ts
│   └── repositories/
│       └── event.repository.test.ts
└── integration/
    └── events.test.ts (Supertest)
```

---

## Summary of Technology Stack

**Frontend**:
- Next.js 14+ (App Router, SSR)
- TypeScript 5.0+
- Tailwind CSS
- shadcn/ui components
- Lucide React (icons)
- Recharts (charts)
- Jest + React Testing Library

**Backend**:
- Node.js 18+
- Express.js 4+
- TypeScript 5.0+
- Prisma ORM
- PostgreSQL 14+
- Redis (caching + job queue)
- BullMQ (job queue)
- Winston (logging)
- Jest + Supertest

**External Services**:
- TheSportsDB API (sports data)
- OpenAI GPT-4 API (predictions)

**Infrastructure**:
- PostgreSQL database
- Redis server
- Node.js server (API)
- Node.js worker process (background jobs)
- CDN for static assets (logos, images)

---

## Risk Assessment

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| TheSportsDB API rate limits | Medium | Medium | Implement aggressive caching, fallback to cached data |
| OpenAI API costs | Medium | High | Set monthly budget limit, implement request throttling, cache predictions |
| Worker job failures | Medium | Medium | Retry logic with exponential backoff, dead letter queue, monitoring |
| Database performance | Low | High | Proper indexing, connection pooling, query optimization |
| Mobile performance | Low | Medium | Code splitting, lazy loading, optimized images, SSR |

---

## Next Steps

Phase 1:
1. Create detailed data model (data-model.md)
2. Define API contracts (contracts/api.yaml)
3. Write quickstart guide (quickstart.md)
