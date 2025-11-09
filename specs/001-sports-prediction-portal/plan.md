# Implementation Plan: Sports Prediction Portal

**Branch**: `001-sports-prediction-portal` | **Date**: 2025-11-04 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/001-sports-prediction-portal/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/commands/plan.md` for the execution workflow.

## Summary

AI-assisted sports prediction portal enabling users to browse upcoming and past sporting events with AI-generated probability distribution predictions. The system features a Next.js SSR frontend with responsive design, Express.js backend with RESTful APIs, PostgreSQL database, and background workers for event fetching, prediction generation, and accuracy tracking. Core value: Transparent AI predictions with historical accuracy validation to build user trust.

## Technical Context

**Language/Version**: TypeScript 5.0+, Node.js 18+  
**Primary Dependencies**: Next.js 14+ (App Router), Express.js 4+, Prisma ORM, Bull/BullMQ (job queue), Redis  
**Storage**: PostgreSQL 14+ (events, predictions, teams, players, injuries, statistics)  
**Testing**: Jest (unit), React Testing Library (components), Supertest (API), Playwright (E2E)  
**Target Platform**: Web (SSR), Linux server for backend  
**Project Type**: Web application (client/ + server/)  
**Performance Goals**: <2s event listing load (95th percentile), <3s event detail load (95th percentile), 100 req/min rate limit per IP  
**Constraints**: WCAG 2.1 Level AA accessibility, mobile-first responsive design, 1hr cache for listings, 15min cache for details  
**Scale/Scope**: Supports 4 major sports initially (Football, Basketball, Cricket, Tennis), ~1000 events/month, public access (no auth)

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

**Checklist** (based on Sporaclet Constitution v1.2.0):

- [ ] **Separation of Concerns**: Frontend (client/) and backend (server/) boundaries clear
- [ ] **Modular Architecture**: Features organized by domain, not by type
- [ ] **Clean Code**: Functions < 50 lines, files < 300 lines, meaningful names, no duplication
- [ ] **Next.js Best Practices**: App Router, Server Components by default, proper data fetching
- [ ] **Express.js Best Practices**: RESTful design, middleware for cross-cutting concerns, thin controllers
- [ ] **Database Integrity**: Migrations planned, transactions where needed, parameterized queries
- [ ] **Background Jobs**: Long-running tasks isolated in workers/, job queue system, idempotent jobs
- [ ] **Test-First**: Test scenarios defined before implementation, coverage targets identified
- [ ] **Rich UI/UX**: Modern design, smooth animations, loading states, accessibility (WCAG 2.1 AA)
- [ ] **Mobile-First & Responsive**: Mobile-first approach, responsive breakpoints, touch-friendly (44x44px targets)

**Violations requiring justification**: None - all principles can be followed

## Project Structure

### Documentation (this feature)

```text
specs/001-sports-prediction-portal/
├── plan.md              # This file (/speckit.plan command output)
├── spec.md              # Feature specification
├── research.md          # Phase 0 output (/speckit.plan command)
├── data-model.md        # Phase 1 output (/speckit.plan command)
├── quickstart.md        # Phase 1 output (/speckit.plan command)
├── contracts/           # Phase 1 output (/speckit.plan command)
│   └── api.yaml        # OpenAPI specification
└── tasks.md             # Phase 2 output (/speckit.tasks command - NOT created by /speckit.plan)
```

### Source Code (repository root)

```text
client/                          # Next.js frontend with SSR
├── app/                         # Next.js App Router
│   ├── page.tsx                # Home page
│   ├── layout.tsx              # Root layout
│   ├── events/                 # Event listing routes
│   │   ├── upcoming/          
│   │   │   └── page.tsx       # Upcoming events page
│   │   ├── past/
│   │   │   └── page.tsx       # Past events page
│   │   └── [id]/
│   │       └── page.tsx       # Event detail page
│   └── search/
│       └── page.tsx            # Search results page
├── components/
│   ├── features/               # Feature-specific components
│   │   ├── event-card/        # Event card component
│   │   ├── event-filters/     # Filter components
│   │   ├── prediction-display/ # Prediction visualization
│   │   ├── head-to-head/      # H2H statistics
│   │   ├── team-roster/       # Team roster display
│   │   ├── injury-report/     # Injury list
│   │   └── field-visualization/ # Sport-specific field diagrams
│   └── ui/                     # shadcn/ui components
│       ├── button.tsx
│       ├── card.tsx
│       ├── input.tsx
│       ├── select.tsx
│       └── ...
├── lib/                        # Utilities and helpers
│   └── utils.ts               # shadcn utils
├── services/                   # API client services
│   └── events-api.ts          # Event API client
├── types/                      # TypeScript definitions
│   └── events.ts              # Event-related types
└── tests/                      # Frontend tests
    ├── components/
    └── integration/

server/                          # Express.js backend
├── src/
│   ├── controllers/            # Route handlers (thin)
│   │   ├── events.controller.ts
│   │   └── health.controller.ts
│   ├── services/               # Business logic
│   │   ├── event.service.ts
│   │   ├── prediction.service.ts
│   │   └── cache.service.ts
│   ├── repositories/           # Data access layer
│   │   ├── event.repository.ts
│   │   ├── prediction.repository.ts
│   │   ├── team.repository.ts
│   │   └── player.repository.ts
│   ├── models/                 # Data models/entities (Prisma)
│   ├── middleware/             # Express middleware
│   │   ├── error-handler.ts
│   │   ├── rate-limiter.ts
│   │   ├── validator.ts
│   │   └── logger.ts
│   ├── routes/                 # API route definitions
│   │   ├── events.routes.ts
│   │   └── health.routes.ts
│   ├── workers/                # Background job processors
│   │   ├── jobs/              # Individual job handlers
│   │   │   ├── fetch-events.job.ts
│   │   │   ├── generate-predictions.job.ts
│   │   │   └── update-results.job.ts
│   │   ├── queues/            # Queue configurations
│   │   │   └── event-queue.ts
│   │   └── index.ts           # Worker process entry
│   ├── utils/                  # Utility functions
│   │   ├── date-helpers.ts
│   │   └── constants.ts
│   └── types/                  # TypeScript definitions
│       └── index.ts
├── tests/
│   ├── unit/                   # Unit tests
│   │   ├── services/
│   │   └── repositories/
│   └── integration/            # API integration tests
│       └── events.test.ts
└── prisma/                     # Database schema and migrations
    ├── schema.prisma
    └── migrations/
```

**Structure Decision**: Web application structure (Option 2) selected as this is a full-stack web portal with Next.js frontend and Express.js backend. Frontend organized by feature (event cards, predictions, visualizations) following modular architecture principle. Backend follows layered architecture (controllers → services → repositories) with clear separation of concerns. Workers isolated in dedicated directory for background job processing.

## Phase 0: Research & Technology Selection

See [research.md](./research.md) for detailed research findings covering:
- Sports data sources (TheSportsDB API)
- AI/ML models (OpenAI GPT-4 with prompt engineering)
- Job queue system (BullMQ + Redis)
- Frontend visualization (Recharts + custom SVG)
- Caching strategy (Redis with 1hr/15min TTLs)
- Rate limiting (express-rate-limit, 100 req/min)
- Database design (Prisma ORM with UUID IDs, composite indexes)
- Authentication (deferred to post-MVP)
- Monitoring/logging (Winston + Morgan)
- Testing strategy (Jest + React Testing Library + Supertest + Playwright, 80% coverage target)

**Status**: ✅ Complete

---

## Phase 1: Design & Contracts

### Data Model

See [data-model.md](./data-model.md) for complete database schema.

**Key Entities**:
- **Sport**: Sport types with metadata (4 initial: football, basketball, cricket, tennis)
- **Team**: Teams with roster information
- **Player**: Individual athletes with positions and statistics
- **Event**: Sporting events (matches/games) with status tracking
- **Prediction**: AI-generated predictions with probability distributions
- **Injury**: Player injuries affecting predictions
- **HeadToHead**: Historical matchup statistics between teams

**Technology**: Prisma ORM with PostgreSQL 14+, UUID primary keys, composite indexes for query optimization

### API Contracts

See [contracts/api.yaml](./contracts/api.yaml) for OpenAPI 3.0 specification.

**Endpoints**:
- `GET /api/events` - List upcoming events (paginated, filterable)
- `GET /api/events/:id` - Get event details with prediction
- `GET /api/health` - Health check with service status

**Features**:
- Rate limiting: 100 req/min per IP
- Caching: 1hr (listings) / 15min (details)
- Pagination: 20 items/page (default), 50 max
- Error handling: Structured error responses with codes

### Developer Onboarding

See [quickstart.md](./quickstart.md) for complete setup guide.

**Key Setup Steps**:
1. Install prerequisites (Node.js 18+, PostgreSQL 14+, Redis 6+)
2. Configure environment variables
3. Run database migrations
4. Seed initial data
5. Start services (backend, workers, frontend)

**Development Workflow**:
- Feature branching with Git
- Database migrations with Prisma
- Testing with Jest/RTL/Supertest/Playwright
- API testing with cURL/Postman

**Status**: ✅ Complete

---

## Phase 2: Implementation Tasks

**Note**: Implementation tasks are generated separately using the `/speckit.tasks` command.
This creates `tasks.md` with granular, testable implementation tasks based on this plan.

See [tasks.md](./tasks.md) once generated (not created by `/speckit.plan`).

---

## Summary

Implementation plan complete with:

✅ **Phase 0 - Research**: Technology decisions documented with rationale  
✅ **Phase 1 - Design**: Database schema, API contracts, quickstart guide  
⏳ **Phase 2 - Tasks**: Run `/speckit.tasks` to generate implementation tasks

**Constitution Compliance**: All 10 principles addressed in design phase
- Separation of Concerns: Client/server boundaries clear
- Modular Architecture: Feature-based organization
- Clean Code: Standards defined in constitution
- Next.js Best Practices: App Router, Server Components, proper data fetching
- Express.js Best Practices: RESTful API, middleware, layered architecture
- Database Integrity: Prisma migrations, transactions planned
- Background Jobs: BullMQ workers isolated in workers/ directory
- Test-First Development: Test strategy defined (80% coverage target)
- Rich UI/UX: shadcn/ui, Lucide React, Recharts, responsive design
- Mobile-First: Touch targets, responsive breakpoints

**Next Steps**:
1. Run `/speckit.tasks` to generate granular implementation tasks
2. Review and prioritize tasks based on user story priorities (P1 → P2 → P3)
3. Begin implementation following test-first approach
4. Track progress using task completion checklist

**Agent Context**: Updated with current technology stack (TypeScript 5.0+, Next.js 14+, Express.js 4+, Prisma ORM, BullMQ, Redis, PostgreSQL 14+)

