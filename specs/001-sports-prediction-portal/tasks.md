# Implementation Tasks: Sports Prediction Portal

**Feature Branch**: `001-sports-prediction-portal`  
**Generated**: 2025-11-04  
**Status**: Ready for Implementation

---

## Overview

This document provides granular, executable implementation tasks organized by user story priority. Each phase represents an independently testable increment that delivers user value.

**MVP Scope**: Phase 3 (User Story 1 - P1) + Phase 4 (User Story 2 - P1)  
**Total Tasks**: 89  
**Parallel Opportunities**: 47 parallelizable tasks marked with [P]

---

## Dependencies & Execution Order

### User Story Completion Order

```
Phase 1: Setup (blocking for all stories)
    ↓
Phase 2: Foundational (blocking for all stories)
    ↓
Phase 3: User Story 1 (P1) ← MVP Core
    ↓
Phase 4: User Story 2 (P1) ← MVP Complete
    ↓
Phase 5: User Story 3 (P2) ← Trust Building
    ↓
Phase 6: User Story 4 (P3) ← Convenience Feature
    ↓
Phase 7: Polish & Cross-Cutting
```

### Parallel Execution Opportunities

**Phase 3 (US1) - After database setup**:
- Frontend components (T028-T034) can run in parallel
- Backend repositories (T019-T022) can run in parallel
- Backend services (T024-T026) require repositories first

**Phase 4 (US2) - After US1 complete**:
- Additional frontend components (T043-T050) can run in parallel
- Worker jobs (T052-T054) can run in parallel after queue setup

**Phase 5 (US3) - After US2 complete**:
- Past events components (T062-T064) can run in parallel with backend changes

---

## Phase 1: Setup & Project Initialization

**Goal**: Initialize project structure, install dependencies, configure tooling

**Blocking**: Must complete before any other phase

### Tasks

- [X] T001 Initialize server project in `server/` with package.json (Node 18+, TypeScript 5.0+)
- [X] T002 Install server dependencies: express@4+, @prisma/client, bullmq, redis, ioredis, winston, morgan, express-rate-limit, cors, dotenv
- [X] T003 Install server dev dependencies: @types/node, @types/express, @types/cors, typescript, ts-node, nodemon, jest, @types/jest, supertest, @types/supertest, eslint, prettier
- [X] T004 Create server TypeScript config in `server/tsconfig.json` with strict mode enabled
- [X] T005 Initialize client project in `client/` with create-next-app (Next.js 14+, TypeScript, Tailwind CSS, App Router)
- [X] T006 Install client dependencies: lucide-react, recharts, @radix-ui/react-*, class-variance-authority, clsx, tailwind-merge
- [X] T007 Install client dev dependencies: @types/react, @types/node, eslint, prettier, jest, @testing-library/react, @testing-library/jest-dom, @playwright/test
- [X] T008 Initialize shadcn/ui in `client/` with components.json configuration
- [X] T009 Create server environment template in `server/.env.example` with all required variables per quickstart.md
- [X] T010 Create client environment template in `client/.env.local.example` with API_URL and feature flags
- [X] T011 Create docker-compose.yml in project root for PostgreSQL 14+ and Redis 6+ services
- [X] T012 Create server ESLint config in `server/.eslintrc.json` with TypeScript and Node.js rules
- [X] T013 Create client ESLint config in `client/.eslintrc.json` with Next.js and React rules
- [X] T014 Create Prettier config in project root `.prettierrc` with consistent formatting rules
- [X] T015 Create server Jest config in `server/jest.config.js` for unit and integration tests

**Verification**: Run `npm install` in both client/ and server/ successfully, docker-compose up starts databases

---

## Phase 2: Foundational Infrastructure

**Goal**: Set up database, core middleware, shared utilities that all user stories depend on

**Blocking**: Must complete before implementing any user story

**Independent Test**: Database migrations run successfully, health endpoint returns 200, rate limiting works

### Tasks

- [X] T016 Create Prisma schema in `server/prisma/schema.prisma` with all 7 entities (Sport, Team, Player, Event, Prediction, Injury, HeadToHead) per data-model.md
- [X] T017 Create Prisma seed script in `server/prisma/seed.ts` to populate 4 initial sports (Football, Basketball, Cricket, Tennis)
- [X] T018 Run initial Prisma migration `npx prisma migrate dev --name init` to create database schema
- [X] T019 [P] Create Sport repository in `server/src/repositories/sport.repository.ts` with findAll, findByName methods
- [X] T020 [P] Create Team repository in `server/src/repositories/team.repository.ts` with findById, findBySport, create, update methods
- [X] T021 [P] Create Player repository in `server/src/repositories/player.repository.ts` with findByTeam, findById, create, update methods
- [X] T022 [P] Create Injury repository in `server/src/repositories/injury.repository.ts` with findActiveByTeam, create, update methods
- [X] T023 Create Prisma client singleton in `server/src/lib/prisma.ts` with connection pooling configuration
- [X] T024 Create cache service in `server/src/services/cache.service.ts` using ioredis with get, set, delete, clear methods
- [X] T025 Create logger middleware in `server/src/middleware/logger.ts` using Winston and Morgan for HTTP request logging
- [X] T026 Create error handler middleware in `server/src/middleware/error-handler.ts` with structured error responses per API contract
- [X] T027 Create rate limiter middleware in `server/src/middleware/rate-limiter.ts` using express-rate-limit (100 req/min per IP)
- [X] T028 Create health check controller in `server/src/controllers/health.controller.ts` checking database, Redis, external API connectivity
- [X] T029 Create health check route in `server/src/routes/health.routes.ts` mapping GET /api/health to controller
- [X] T030 Create Express app initialization in `server/src/index.ts` with middleware registration (CORS, logger, rate limiter, error handler)
- [X] T031 Create server start script in `server/package.json` with nodemon for development
- [X] T032 Create BullMQ queue configuration in `server/src/workers/queues/event-queue.ts` with Redis connection
- [X] T033 Create worker process entry in `server/src/workers/index.ts` to register all job processors
- [X] T034 Create worker start script in `server/package.json` separate from API server
- [X] T035 Create base layout in `client/app/layout.tsx` with Tailwind CSS global styles and metadata
- [X] T036 Install shadcn/ui button component with `npx shadcn-ui@latest add button`
- [X] T037 Install shadcn/ui card component with `npx shadcn-ui@latest add card`
- [X] T038 Install shadcn/ui input component with `npx shadcn-ui@latest add input`
- [X] T039 Install shadcn/ui select component with `npx shadcn-ui@latest add select`
- [X] T040 Create TypeScript types for Event entity in `client/types/events.ts` matching API contract EventSummary schema
- [X] T041 Create API client utility in `client/services/events-api.ts` with fetch wrapper and error handling

**Verification**: 
- `npm run dev` in server/ starts successfully on port 3001
- `curl http://localhost:3001/api/health` returns healthy status with service checks
- Rate limiting returns 429 after 100 requests in 1 minute
- `npm run worker:dev` in server/ starts successfully
- `npm run dev` in client/ starts successfully on port 3000

---

## Phase 3: User Story 1 - Browse Upcoming Sports Events (P1)

**User Story**: A sports enthusiast visits the portal to discover upcoming sporting events they're interested in. They can browse a comprehensive list of upcoming events, filter by sport type, search by team or event name, and view basic event information like date, time, teams/participants, and AI-generated predictions.

**Why P1**: Core value proposition - users come to find and explore upcoming events with predictions. This is the MVP that delivers immediate value.

**Independent Test**: 
1. Visit http://localhost:3000
2. Click "Upcoming Events" link
3. Apply sport filter (e.g., "Football")
4. Search for team name (e.g., "Manchester")
5. Verify relevant events displayed with predictions
6. Test on mobile viewport (< 640px) for responsive layout

**Depends On**: Phase 2 (Foundational Infrastructure)

### Backend Tasks

- [X] T042 Create Event repository in `server/src/repositories/event.repository.ts` with findUpcoming, findById, findByFilters, countByFilters methods
- [X] T043 Create Prediction repository in `server/src/repositories/prediction.repository.ts` with findLatestByEvent, create methods
- [X] T044 Create Event service in `server/src/services/event.service.ts` with listUpcoming method implementing caching (1hr TTL)
- [X] T045 Create Events controller in `server/src/controllers/events.controller.ts` with listEvents handler implementing pagination (20/page)
- [X] T046 Create Events routes in `server/src/routes/events.routes.ts` mapping GET /api/events with query params (sport, date_from, date_to, league, page, per_page)
- [X] T047 Add input validation middleware in `server/src/middleware/validator.ts` for events query parameters per API contract
- [X] T048 Register events routes in `server/src/index.ts` with /api prefix

### Frontend Tasks

- [X] T049 [P] [US1] Create Header component in `client/components/features/header/Header.tsx` with logo, search box, navigation links (Upcoming, Past Events)
- [X] T050 [P] [US1] Create SportFilter component in `client/components/features/event-filters/SportFilter.tsx` with select dropdown for 4 sports
- [X] T051 [P] [US1] Create SearchBox component in `client/components/features/event-filters/SearchBox.tsx` with input and search icon
- [X] T052 [P] [US1] Create EventCard component in `client/components/features/event-card/EventCard.tsx` displaying date, time, teams, sport, prediction summary
- [X] T053 [P] [US1] Create PredictionSummary component in `client/components/features/prediction-display/PredictionSummary.tsx` showing probability distribution bar
- [X] T054 [P] [US1] Create Pagination component in `client/components/ui/Pagination.tsx` with prev/next buttons and page numbers
- [X] T055 [P] [US1] Create LoadingState component in `client/components/ui/LoadingState.tsx` with skeleton cards for loading UX
- [X] T056 [P] [US1] Create EmptyState component in `client/components/ui/EmptyState.tsx` for "No events found" message
- [X] T057 [US1] Create home page in `client/app/page.tsx` with Header, search box, and links to Upcoming/Past Events
- [X] T058 [US1] Create upcoming events page in `client/app/events/upcoming/page.tsx` fetching from GET /api/events with server component
- [X] T059 [US1] Implement sport filter functionality in upcoming events page with URL query params
- [X] T060 [US1] Implement search functionality in upcoming events page with debounced API calls
- [X] T061 [US1] Implement pagination in upcoming events page with page query param
- [X] T062 [US1] Add mobile-responsive styles to all US1 components using Tailwind breakpoints (sm, md, lg)
- [X] T063 [US1] Add touch-friendly styling to interactive elements (min 44x44px touch targets)

### Integration Tasks

- [X] T064 [US1] Test complete flow: Home → Upcoming Events → Apply Filter → Search → Pagination works end-to-end
- [X] T065 [US1] Verify cache headers present in API response (Cache-Control: public, max-age=3600)
- [X] T066 [US1] Verify rate limiting headers present (X-RateLimit-Limit, X-RateLimit-Remaining, X-RateLimit-Reset)
- [X] T067 [US1] Test responsive layout on mobile (< 640px), tablet (640-1024px), desktop (> 1024px) viewports
- [X] T068 [US1] Verify empty state displays when no events match filters
- [X] T069 [US1] Verify loading state displays during API fetch

**Completion Criteria**:
- ✅ User can browse upcoming events sorted by date
- ✅ User can filter by sport type (Football, Basketball, Cricket, Tennis)
- ✅ User can search by team name
- ✅ Event cards display date, time, teams, sport, prediction summary
- ✅ Pagination works with 20 events per page
- ✅ Layout is responsive on mobile devices
- ✅ API responses include caching headers (1hr TTL)
- ✅ Rate limiting enforced (100 req/min per IP)

---

## Phase 4: User Story 2 - View Detailed Event Predictions (P1)

**User Story**: A user wants in-depth information about a specific event to make informed decisions. They can view comprehensive event details including AI predictions, head-to-head statistics, team rosters, injury reports, venue information, and visual representations (like field formations for team sports).

**Why P1**: This is the differentiator - users need detailed AI predictions and statistics to trust the platform. This delivers the unique value of AI-assisted predictions and must be part of MVP.

**Independent Test**:
1. Navigate to upcoming events page
2. Click on any event card
3. Verify event detail page loads with all sections:
   - Event header (teams, date, venue)
   - AI prediction with probability distribution and key factors
   - Head-to-head statistics
   - Team rosters
   - Injury reports
   - Field/court visualization (for football)
4. Test on mobile viewport for responsive layout

**Depends On**: Phase 3 (User Story 1 - Browse Events)

### Backend Tasks

- [X] T070 Create HeadToHead repository in `server/src/repositories/head-to-head.repository.ts` with findByTeams, create, update methods
- [X] T071 Extend Event service in `server/src/services/event.service.ts` with getEventDetail method implementing caching (15min TTL)
- [X] T072 Extend Events controller in `server/src/controllers/events.controller.ts` with getEventById handler
- [X] T073 Add route GET /api/events/:id in `server/src/routes/events.routes.ts` mapping to getEventById controller
- [X] T074 Add input validation for UUID parameter in `server/src/middleware/validator.ts`
- [X] T075 Create Prediction service in `server/src/services/prediction.service.ts` with getLatestPrediction method

### Worker Tasks (Background Jobs)

- [X] T076 [P] Create fetch-events job in `server/src/workers/jobs/fetch-events.job.ts` calling TheSportsDB API and storing events (daily schedule)
- [X] T077 [P] Create generate-predictions job in `server/src/workers/jobs/generate-predictions.job.ts` calling OpenAI GPT-4 API and storing predictions (twice daily schedule)
- [X] T078 [P] Create update-results job in `server/src/workers/jobs/update-results.job.ts` fetching completed event results and updating accuracy
- [X] T079 Register all jobs in worker queue `server/src/workers/queues/event-queue.ts` with cron schedules
- [X] T080 Implement team snapshot generation in generate-predictions job (homeTeamSnapshot, awayTeamSnapshot JSON fields)
- [X] T081 Add retry logic with exponential backoff for failed jobs in all job handlers
- [X] T082 Add job execution logging in all job handlers using Winston

### Frontend Tasks

- [X] T083 [P] [US2] Create EventHeader component in `client/components/features/event-detail/EventHeader.tsx` with teams, date, venue, sport badge
- [X] T084 [P] [US2] Create PredictionDetail component in `client/components/features/prediction-display/PredictionDetail.tsx` with Recharts probability chart and key factors list
- [X] T085 [P] [US2] Create HeadToHeadSection component in `client/components/features/head-to-head/HeadToHeadSection.tsx` with win/loss/draw stats and last 5 results
- [X] T086 [P] [US2] Create TeamRoster component in `client/components/features/team-roster/TeamRoster.tsx` displaying players with positions and jersey numbers
- [X] T087 [P] [US2] Create InjuryReport component in `client/components/features/injury-report/InjuryReport.tsx` with injury type, severity, expected return date
- [X] T088 [P] [US2] Create FieldVisualization component in `client/components/features/field-visualization/FieldVisualization.tsx` using custom SVG for football field with formations
- [X] T089 [P] [US2] Create CourtVisualization component in `client/components/features/field-visualization/CourtVisualization.tsx` using custom SVG for basketball court
- [X] T090 [US2] Create event detail page in `client/app/events/[id]/page.tsx` fetching from GET /api/events/:id with server component
- [X] T091 [US2] Implement conditional rendering in event detail page based on sport type (team vs individual sports)
- [X] T092 [US2] Add loading and error states to event detail page with appropriate fallbacks
- [X] T093 [US2] Add mobile-responsive layouts to all US2 components with collapsible sections on mobile
- [X] T094 [US2] Add accessibility attributes (ARIA labels) to all interactive components per WCAG 2.1 AA

### Integration Tasks

- [X] T095 [US2] Test complete flow: Upcoming Events → Click Event Card → Detail Page loads with all sections
- [X] T096 [US2] Verify cache headers present (Cache-Control: public, max-age=900) for event details
- [X] T097 [US2] Verify team snapshots (homeTeamSnapshot, awayTeamSnapshot) used for roster/injury display
- [X] T098 [US2] Test field visualization renders correctly for football events
- [X] T099 [US2] Test court visualization renders correctly for basketball events
- [X] T100 [US2] Verify responsive layout works on all breakpoints
- [X] T101 [US2] Verify 404 error displays for non-existent event IDs
- [X] T102 [US2] Test keyboard navigation works for all interactive elements
- [X] T103 [US2] Run Lighthouse accessibility audit to verify WCAG 2.1 AA compliance
- [X] T104 [US2] Verify worker jobs execute successfully: fetch events daily, generate predictions twice daily

**Completion Criteria**:
- ✅ Event detail page displays comprehensive information
- ✅ AI prediction shows probability distribution with Recharts visualization
- ✅ Head-to-head statistics display for team sports
- ✅ Team rosters display with player information from snapshots
- ✅ Injury reports display active injuries
- ✅ Field/court visualizations render for appropriate sports
- ✅ Layout adapts to individual sports (tennis) vs team sports
- ✅ Mobile responsive with all content readable
- ✅ WCAG 2.1 Level AA accessibility compliance
- ✅ API cache headers set correctly (15min TTL)
- ✅ Worker jobs run on schedule and generate snapshots

---

## Phase 5: User Story 3 - Review Past Event Results (P2)

**User Story**: A user wants to assess the accuracy of AI predictions by reviewing past events. They can browse past events with actual results, see how accurate the AI predictions were, and filter/search similar to upcoming events.

**Why P2**: Builds trust in AI predictions by showing transparency and historical accuracy. Portal can function without it initially as an MVP.

**Independent Test**:
1. Navigate to home page
2. Click "Past Events" link
3. Verify past events displayed in reverse chronological order
4. Verify each event card shows actual result and prediction accuracy indicator
5. Click on a past event to view details with accuracy analysis
6. Apply filters and search similar to upcoming events

**Depends On**: Phase 4 (User Story 2 - Event Details)

### Backend Tasks

- [X] T105 Extend Event repository `server/src/repositories/event.repository.ts` with findPast method filtering by status='completed'
- [X] T106 Extend Event service `server/src/services/event.service.ts` with listPastEvents method implementing caching (1hr TTL)
- [X] T107 Extend Events controller `server/src/controllers/events.controller.ts` with listPastEvents handler
- [X] T108 Add query parameter `status` to GET /api/events route allowing filter by 'upcoming' or 'completed'
- [X] T109 Update update-results worker job `server/src/workers/jobs/update-results.job.ts` to set isAccurate flag on predictions after event completion

### Frontend Tasks

- [X] T110 [P] [US3] Create AccuracyBadge component in `client/components/features/prediction-display/AccuracyBadge.tsx` showing correct/incorrect with visual indicator
- [X] T111 [P] [US3] Create PastEventCard component in `client/components/features/event-card/PastEventCard.tsx` extending EventCard with actual result and accuracy
- [X] T112 [P] [US3] Create AccuracyAnalysis component in `client/components/features/prediction-display/AccuracyAnalysis.tsx` comparing prediction vs actual result
- [X] T113 [US3] Create past events page in `client/app/events/past/page.tsx` fetching from GET /api/events?status=completed
- [X] T114 [US3] Reuse filter and search components from US1 in past events page
- [X] T115 [US3] Update event detail page `client/app/events/[id]/page.tsx` to conditionally render accuracy analysis for completed events
- [X] T116 [US3] Add mobile-responsive styles to US3 components

### Integration Tasks

- [ ] T117 [US3] Test complete flow: Home → Past Events → Apply Filters → View Details with accuracy
- [ ] T118 [US3] Verify accuracy badge displays correctly (green checkmark for correct, red X for incorrect)
- [ ] T119 [US3] Verify past event details show actual result alongside original prediction
- [ ] T120 [US3] Verify update-results worker sets isAccurate flag within 2 hours of event completion
- [ ] T121 [US3] Test responsive layout on all viewports

**Completion Criteria**:
- ✅ Past events page displays completed events in reverse chronological order
- ✅ Past event cards show actual result and prediction accuracy indicator
- ✅ Filters and search work identically to upcoming events
- ✅ Past event details show accuracy analysis
- ✅ Worker updates prediction accuracy within 2 hours of event completion
- ✅ Mobile responsive layout

---

## Phase 6: User Story 4 - Quick Event Search (P3)

**User Story**: A user knows what they're looking for and wants to find it quickly. They can use the search box on the home page to immediately find events by team name, player name, or event name across both upcoming and past events.

**Why P3**: Convenience feature that improves UX but is not essential. Same results achievable by navigating to event listings and using filters.

**Independent Test**:
1. On home page, type team name (e.g., "Liverpool") in search box
2. Verify autocomplete suggestions appear as typing
3. Press enter or click search
4. Verify results from both upcoming and past events displayed
5. Click a result to navigate to event detail page

**Depends On**: Phase 5 (User Story 3 - Past Events)

### Backend Tasks

- [X] T122 Extend Event repository with fullTextSearch method using PostgreSQL full-text search on event name, team names, participant names
- [X] T123 Create search service in `server/src/services/search.service.ts` with searchEvents method implementing caching (5min TTL)
- [X] T124 Create search controller in `server/src/controllers/search.controller.ts` with searchHandler
- [X] T125 Create search routes in `server/src/routes/search.routes.ts` mapping GET /api/search?q=query
- [X] T126 Add query parameter validation for search (minimum 3 characters) in validator middleware

### Frontend Tasks

- [X] T127 [P] [US4] Create SearchAutocomplete component in `client/components/features/search/SearchAutocomplete.tsx` with debounced API calls
- [X] T128 [P] [US4] Create SearchResults component in `client/components/features/search/SearchResults.tsx` displaying mixed upcoming/past events
- [X] T129 [US4] Update Header SearchBox component to use SearchAutocomplete with live suggestions
- [X] T130 [US4] Create search results page in `client/app/search/page.tsx` fetching from GET /api/search?q=query
- [X] T131 [US4] Add keyboard navigation (arrow keys, enter) to autocomplete suggestions
- [X] T132 [US4] Add mobile-responsive styles to search components

### Integration Tasks

- [ ] T133 [US4] Test autocomplete suggestions appear after 3 characters typed
- [ ] T134 [US4] Test search results include both upcoming and past events
- [ ] T135 [US4] Test clicking search result navigates to correct event detail page
- [ ] T136 [US4] Test keyboard navigation works in autocomplete
- [ ] T137 [US4] Test debouncing prevents excessive API calls during typing
- [ ] T138 [US4] Test responsive layout on mobile

**Completion Criteria**:
- ✅ Search box on home page provides autocomplete suggestions
- ✅ Suggestions appear after typing 3+ characters
- ✅ Search results include both upcoming and past events
- ✅ Clicking result navigates to event detail page
- ✅ Keyboard navigation works (arrow keys, enter)
- ✅ Debouncing prevents excessive API calls
- ✅ Mobile responsive

---

## Phase 7: Polish & Cross-Cutting Concerns

**Goal**: Final polish, performance optimization, error handling, logging, monitoring

**Depends On**: All user story phases complete

### Tasks

- [X] T139 [P] Add comprehensive error logging in all API endpoints using Winston
- [X] T140 [P] Add performance monitoring middleware in `server/src/middleware/performance.ts` tracking response times
- [X] T141 [P] Create database indexes for frequently queried fields per data-model.md
- [X] T142 [P] Optimize Prisma queries with selective includes (avoid n+1 queries)
- [X] T143 [P] Add Redis connection error handling with graceful degradation (serve stale cache)
- [X] T144 [P] Add OpenAI API error handling with retry logic in prediction worker
- [X] T145 [P] Add TheSportsDB API error handling with retry logic in fetch-events worker
- [X] T146 [P] Create custom 404 page in `client/app/not-found.tsx` with link back to home
- [X] T147 [P] Create custom error page in `client/app/error.tsx` with error boundary
- [X] T148 [P] Add loading skeletons to all async pages using Suspense boundaries
- [X] T149 [P] Optimize images with Next.js Image component for team logos
- [X] T150 [P] Add meta tags and Open Graph tags for SEO in all pages
- [X] T151 [P] Add sitemap generation in `client/app/sitemap.ts`
- [X] T152 [P] Add robots.txt in `client/app/robots.ts`
- [X] T153 Add favicon and app icons in `client/app/icon.tsx`
- [ ] T154 Run Lighthouse performance audit and optimize for 90+ score
- [ ] T155 Run Lighthouse accessibility audit and fix any issues for 100 score
- [ ] T156 Run security audit with `npm audit` and fix vulnerabilities
- [X] T157 Add CSP headers in Next.js config for security
- [ ] T158 Add analytics tracking (Google Analytics or Plausible) if requested
- [ ] T159 Create production environment files (.env.production) for both client and server
- [ ] T160 Create deployment documentation in `docs/DEPLOYMENT.md`
- [ ] T161 Create API documentation using Swagger UI served at /api/docs
- [ ] T162 Add health check monitoring alerts configuration
- [ ] T163 Create backup strategy documentation for PostgreSQL database
- [ ] T164 Final end-to-end test of all user stories in production-like environment

**Completion Criteria**:
- ✅ All errors logged appropriately
- ✅ Performance monitoring in place
- ✅ Database queries optimized (no n+1 queries)
- ✅ Error handling graceful throughout
- ✅ Custom error pages for 404 and 500
- ✅ Loading states for all async operations
- ✅ Images optimized
- ✅ SEO meta tags present
- ✅ Lighthouse performance 90+
- ✅ Lighthouse accessibility 100
- ✅ Security audit clean
- ✅ Production environment configured
- ✅ Documentation complete

---

## Implementation Strategy

### MVP-First Approach

**Recommended MVP Scope** (Phases 1-4):
1. Phase 1: Setup
2. Phase 2: Foundational Infrastructure
3. Phase 3: User Story 1 (Browse Upcoming Events)
4. Phase 4: User Story 2 (View Event Details)

**Total MVP Tasks**: 104 tasks  
**Estimated MVP Timeline**: 3-4 weeks for full-time developer

**MVP Delivers**:
- ✅ Core value proposition (browse upcoming events with AI predictions)
- ✅ Differentiator (detailed event information and predictions)
- ✅ Complete backend infrastructure (API, database, workers)
- ✅ Responsive, accessible frontend
- ✅ Background workers generating predictions
- ✅ Caching and rate limiting

### Incremental Delivery

**After MVP** (Phases 5-7):
- Phase 5: Past events and accuracy tracking (1 week)
- Phase 6: Quick search (3 days)
- Phase 7: Polish and optimization (1 week)

### Parallel Development Opportunities

**Backend Team** can work on:
- T019-T022: Repositories (parallel)
- T042-T048: Event API endpoints
- T076-T082: Worker jobs (parallel)

**Frontend Team** can work on:
- T049-T056: US1 components (parallel after API ready)
- T083-T089: US2 components (parallel after API ready)

**DevOps/Infrastructure** can work on:
- T001-T015: Setup (parallel with backend initial work)
- T139-T152: Polish tasks (parallel during final phase)

---

## Task Execution Checklist

- [ ] All 164 tasks documented with clear file paths
- [ ] User stories mapped to implementation phases
- [ ] Dependencies identified (blocking vs parallel)
- [ ] Independent test criteria defined per user story
- [ ] Parallel execution opportunities marked with [P]
- [ ] Story labels [US1], [US2], [US3], [US4] assigned
- [ ] MVP scope clearly defined (Phases 1-4)
- [ ] Format validation: All tasks follow `- [ ] TXXX [P?] [Story?] Description with path` format

---

## Notes

- **Testing Philosophy**: This plan focuses on integration testing through independent test criteria per user story. Unit tests can be added as needed during implementation but are not mandatory for MVP.
- **Constitution Compliance**: All tasks designed to follow Sporaclet Constitution v1.2.0 principles (separation of concerns, modular architecture, clean code, etc.)
- **Hybrid Data Model**: Tasks include implementation of hybrid approach (normalized tables + JSON snapshots) per clarification decision
- **Worker Jobs**: Background jobs isolated in workers/ directory with separate process, following background jobs principle
- **Mobile-First**: All UI tasks include mobile-responsive requirements per constitution

---

**Ready to start implementation!** 🚀

Begin with Phase 1 (Setup) tasks T001-T015 to establish project foundation.
