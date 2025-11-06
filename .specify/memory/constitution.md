<!--
Sync Impact Report:
- Version change: 1.2.0 → 1.2.1
- Modified principles: None
- Added sections: None
- Removed sections: None
- Clarifications:
  * Technology Stack - Frontend: Specified Tailwind CSS, shadcn/ui, and Lucide React (removed alternatives)
- Templates requiring updates:
  ✅ All templates already aligned
- Follow-up TODOs: None
-->

# Sporaclet Constitution

## Core Principles

### I. Separation of Concerns (NON-NEGOTIABLE)

The codebase MUST maintain clear boundaries between presentation, business logic, and data access layers.

**Rules:**
- Frontend (`client/`) handles ONLY UI/UX and presentation logic
- Backend (`server/`) handles ONLY business logic, data access, and API endpoints
- No database queries in frontend code
- No UI rendering logic in backend code
- API contracts define the interface between frontend and backend

**Rationale:** Separation of concerns ensures maintainability, testability, and enables independent scaling of frontend and backend services. It allows teams to work in parallel and reduces coupling between layers.

### II. Modular Architecture

Every feature MUST be implemented as a self-contained, independently testable module.

**Rules:**
- Frontend: Components organized by feature/domain, not by type
- Backend: Services, controllers, and repositories organized by business domain
- Each module has clear inputs, outputs, and dependencies
- Modules MUST NOT directly access internal implementation details of other modules
- Shared utilities and helpers placed in dedicated common/shared directories

**Rationale:** Modular architecture promotes code reusability, simplifies testing, and makes the codebase easier to understand and maintain. It enables incremental development and reduces merge conflicts.

### III. Clean Code Principles (NON-NEGOTIABLE)

All code MUST follow clean code principles to ensure readability and maintainability.

**Rules:**
- Meaningful and descriptive variable/function/class names (no abbreviations unless industry-standard)
- Functions MUST do one thing and do it well (Single Responsibility Principle)
- Maximum function length: 50 lines (excluding comments/whitespace)
- Maximum file length: 300 lines (excluding comments/whitespace)
- DRY principle: No code duplication; extract reusable logic into functions/utilities
- Comments explain "why", not "what" (code should be self-documenting)
- No magic numbers or strings; use named constants

**Rationale:** Clean code reduces cognitive load, makes bugs easier to spot, and accelerates onboarding of new developers. It serves as living documentation.

### IV. Next.js Best Practices

Frontend code MUST follow Next.js conventions and leverage SSR capabilities appropriately.

**Rules:**
- Use App Router (Next.js 13+) with file-based routing
- Server Components by default; Client Components only when interactivity required
- Data fetching on server side using async/await in Server Components
- API routes used sparingly; prefer direct backend API calls from Server Components
- Static generation (SSG) for content that doesn't change often
- Dynamic rendering (SSR) for personalized or frequently updated content
- Image optimization using next/image component
- Environment variables properly configured (.env.local for development)

**Rationale:** Following Next.js best practices ensures optimal performance, SEO, and user experience while leveraging the framework's built-in optimizations.

### V. Express.js Best Practices

Backend code MUST follow Express.js conventions and RESTful API design principles.

**Rules:**
- RESTful API design: proper HTTP methods (GET, POST, PUT, PATCH, DELETE)
- Middleware for cross-cutting concerns (authentication, logging, error handling)
- Route handlers MUST be thin; business logic in service layer
- Async/await for all asynchronous operations (no callback hell)
- Centralized error handling middleware
- Input validation using middleware (e.g., express-validator or Joi)
- CORS properly configured for security
- Environment variables managed via .env files

**Rationale:** Express.js best practices ensure secure, maintainable, and performant backend services with clear separation between routing, business logic, and data access.

### VI. Database & Data Integrity

PostgreSQL database operations MUST follow best practices for data integrity and performance.

**Rules:**
- Use migrations for all schema changes (versioned and reversible)
- Proper indexing on frequently queried columns
- Transactions for operations that modify multiple tables
- Parameterized queries to prevent SQL injection (use query builders or ORMs)
- Connection pooling configured appropriately
- Foreign key constraints enforced at database level
- Soft deletes for user-generated content (retain audit trail)
- Database queries encapsulated in repository/data access layer

**Rationale:** Database best practices ensure data integrity, security, and performance while preventing common vulnerabilities and maintaining a clear audit trail.

### VII. Background Jobs & Workers

Background jobs MUST be isolated from the main API request/response cycle and properly managed for reliability.

**Rules:**
- Workers located in `server/src/workers/` directory, separate from API controllers
- Use job queue system (e.g., Bull, BullMQ with Redis, or pg-boss with PostgreSQL)
- Each worker handles a single, well-defined job type (Single Responsibility)
- Jobs MUST be idempotent (safe to retry without side effects)
- Proper error handling and retry logic (exponential backoff)
- Job status tracking and monitoring (queued, processing, completed, failed)
- Workers run as separate processes from the main API server
- Dead letter queue for failed jobs that exceed retry limits
- Scheduled jobs (cron-like) managed through the same queue system
- Logging for all job executions (start, completion, failures)

**Use Cases for Workers:**
- Data aggregation and statistics calculation
- Scheduled data fetching from external sports APIs
- Email/notification sending
- Report generation
- Database cleanup and maintenance tasks

**Rationale:** Background workers prevent long-running tasks from blocking API responses, ensure reliability through retry mechanisms, and enable horizontal scaling of compute-intensive operations like AI predictions. This is critical for a prediction portal where model training and data processing shouldn't impact user-facing API performance.

### VIII. Test-First Development

Tests MUST be written before implementation for all new features and bug fixes.

**Rules:**
- Unit tests for business logic and utilities (minimum 80% coverage)
- Integration tests for API endpoints (test request/response cycle)
- Component tests for frontend components (user interactions)
- End-to-end tests for critical user journeys
- Tests MUST fail before implementation begins (Red-Green-Refactor)
- All tests MUST pass before merging to main branch
- Mock external dependencies in unit tests

**Rationale:** Test-first development catches bugs early, serves as living documentation, and gives confidence when refactoring. It enforces thinking about design before implementation.

### IX. Rich User Interface & User Experience (NON-NEGOTIABLE)

The application MUST provide an engaging, intuitive, and visually appealing user interface to attract and retain users.

**Rules:**
- Modern, clean, and professional design aesthetic aligned with sports/prediction domain
- Consistent design system with reusable UI components (buttons, cards, forms, modals)
- Use **shadcn/ui** components for consistent, accessible UI primitives
- Use **Lucide React** icons for consistent iconography throughout the app
- Apply **Tailwind CSS** utility classes for styling (avoid custom CSS unless necessary)
- Smooth animations and transitions for user interactions (micro-interactions)
- Loading states and skeletons to provide feedback during data fetching
- Clear visual hierarchy with proper typography, spacing, and color contrast
- Interactive data visualizations for predictions and statistics (charts, graphs)
- Accessibility standards (WCAG 2.1 Level AA minimum): keyboard navigation, ARIA labels, proper contrast
- User feedback mechanisms: success/error messages, toasts, confirmations
- Optimistic UI updates where appropriate to enhance perceived performance
- Empty states with helpful guidance when no data is available

**Rationale:** A rich, intuitive UI is critical for user engagement and retention in a competitive sports prediction market. Users form first impressions within seconds, and a polished interface builds trust and encourages continued use.

### X. Mobile-First & Responsive Design (NON-NEGOTIABLE)

The application MUST be fully functional and optimized for all device sizes, with mobile devices as the primary target.

**Rules:**
- Mobile-first approach: Design and develop for mobile screens first, then scale up
- Responsive breakpoints: Mobile (<640px), Tablet (640-1024px), Desktop (>1024px)
- Touch-friendly interfaces: minimum 44x44px touch targets, appropriate spacing
- Flexible layouts using CSS Grid and Flexbox (no fixed widths)
- Responsive typography: fluid font sizing that scales with viewport
- Responsive images: use next/image with appropriate sizes and srcset
- Test on real devices or browser dev tools for all major breakpoints
- Navigation optimized for mobile (hamburger menus, bottom navigation where appropriate)
- Performance optimized for mobile networks (lazy loading, code splitting)
- No horizontal scrolling on any screen size
- Gestures support for mobile (swipe, pinch-to-zoom where appropriate)

**Rationale:** Mobile devices account for the majority of web traffic, especially for sports content consumed on-the-go. A mobile-first approach ensures the best experience for the largest segment of users and prevents desktop-centric designs that fail on mobile.

## Technology Stack & Architecture

**Frontend (client/):**
- Framework: Next.js (v14+) with App Router
- Language: TypeScript (strict mode enabled)
- Styling: **Tailwind CSS** (utility-first CSS framework)
- UI Components: **shadcn/ui** (accessible, customizable components built on Radix UI)
- Icons: **Lucide React** (beautiful, consistent icon library)
- Animations: Framer Motion or CSS animations
- Charts/Visualizations: Recharts, Chart.js, or D3.js
- State Management: React Context API or Zustand (for complex state)
- HTTP Client: fetch API or axios
- Testing: Jest, React Testing Library, Playwright (E2E)

**Backend (server/):**
- Framework: Express.js (v4+)
- Language: Node.js (v18+) with TypeScript
- Database ORM: Prisma or TypeORM
- Job Queue: Bull/BullMQ (Redis-backed) or pg-boss (PostgreSQL-backed)
- Validation: Zod or Joi
- Authentication: JWT or session-based
- Testing: Jest, Supertest
- Logging: Winston or Pino

**Database:**
- PostgreSQL (v14+)
- Redis (optional, for job queue if using Bull/BullMQ)
- Migration tool: Prisma Migrate or Knex.js

**Development Tools:**
- Linting: ESLint with recommended rules
- Formatting: Prettier
- Pre-commit hooks: Husky + lint-staged
- Version control: Git with conventional commits

## Development Standards

### Code Organization

**Frontend Structure (client/):**
```
client/
├── app/                    # Next.js App Router pages
│   ├── (routes)/          # Route groups
│   └── api/               # API routes (minimal use)
├── components/            # Reusable UI components
│   ├── features/         # Feature-specific components
│   └── ui/               # shadcn/ui components (button, card, dialog, etc.)
├── lib/                   # Utilities and helpers (including shadcn utils)
├── services/             # API client services
├── types/                # TypeScript type definitions
└── tests/                # Test files
```

**Backend Structure (server/):**
```
server/
├── src/
│   ├── controllers/      # Route handlers (thin)
│   ├── services/         # Business logic
│   ├── repositories/     # Data access layer
│   ├── models/           # Data models/entities
│   ├── middleware/       # Express middleware
│   ├── routes/           # API route definitions
│   ├── workers/          # Background job processors
│   │   ├── jobs/        # Individual job handlers
│   │   └── queues/      # Queue configurations
│   ├── utils/            # Utility functions
│   └── types/            # TypeScript type definitions
├── tests/                # Test files
└── prisma/               # Database schema and migrations
```
```
server/
├── src/
│   ├── controllers/      # Route handlers
│   ├── services/         # Business logic
│   ├── repositories/     # Data access layer
│   ├── models/           # Data models/entities
│   ├── middleware/       # Express middleware
│   ├── routes/           # API route definitions
│   ├── utils/            # Utility functions
│   └── types/            # TypeScript type definitions
├── tests/                # Test files
└── prisma/               # Database schema and migrations
```

### Error Handling

- Backend MUST return consistent error responses with status codes and messages
- Frontend MUST gracefully handle API errors with user-friendly messages
- All async operations MUST have try-catch blocks
- Errors MUST be logged with appropriate context

### Security Requirements

- All user inputs MUST be validated and sanitized
- Authentication required for protected routes
- Authorization checks for resource access
- HTTPS in production
- Security headers configured (helmet.js)
- Rate limiting on API endpoints
- Secrets stored in environment variables, never committed to repository

### Performance Standards

- Frontend: First Contentful Paint < 1.5s, Largest Contentful Paint < 2.5s
- Backend: API response time < 200ms (P95) for non-AI endpoints
- Database queries optimized (use EXPLAIN ANALYZE)
- Caching strategy for frequently accessed data
- Code splitting and lazy loading for frontend

### Documentation Requirements

- README.md with setup instructions in both client/ and server/
- API documentation (OpenAPI/Swagger) for all endpoints
- Component documentation using JSDoc/TSDoc
- Architecture decision records (ADRs) for significant decisions

## Governance

This constitution supersedes all other development practices and guidelines. All code contributions MUST comply with these principles.

**Amendment Process:**
1. Proposed changes documented with rationale and impact analysis
2. Review and approval from tech lead or project maintainers
3. Version number updated following semantic versioning
4. Migration plan created for existing code if breaking changes introduced
5. All templates and documentation updated to reflect changes

**Compliance Verification:**
- All pull requests MUST include constitution compliance check
- Code reviews MUST verify adherence to clean code and architecture principles
- Automated linting and testing enforces code standards
- Quarterly constitution review to assess effectiveness and needed updates

**Version Control:**
- MAJOR: Breaking changes to architecture or removal of core principles
- MINOR: Addition of new principles or significant expansions
- PATCH: Clarifications, refinements, and minor updates

**Version**: 1.2.1 | **Ratified**: 2025-11-04 | **Last Amended**: 2025-11-04
