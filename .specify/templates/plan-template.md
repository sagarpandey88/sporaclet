# Implementation Plan: [FEATURE]

**Branch**: `[###-feature-name]` | **Date**: [DATE] | **Spec**: [link]
**Input**: Feature specification from `/specs/[###-feature-name]/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/commands/plan.md` for the execution workflow.

## Summary

[Extract from feature spec: primary requirement + technical approach from research]

## Technical Context

<!--
  ACTION REQUIRED: Replace the content in this section with the technical details
  for the project. The structure here is presented in advisory capacity to guide
  the iteration process.
-->

**Language/Version**: [e.g., Python 3.11, Swift 5.9, Rust 1.75 or NEEDS CLARIFICATION]  
**Primary Dependencies**: [e.g., FastAPI, UIKit, LLVM or NEEDS CLARIFICATION]  
**Storage**: [if applicable, e.g., PostgreSQL, CoreData, files or N/A]  
**Testing**: [e.g., pytest, XCTest, cargo test or NEEDS CLARIFICATION]  
**Target Platform**: [e.g., Linux server, iOS 15+, WASM or NEEDS CLARIFICATION]
**Project Type**: [single/web/mobile - determines source structure]  
**Performance Goals**: [domain-specific, e.g., 1000 req/s, 10k lines/sec, 60 fps or NEEDS CLARIFICATION]  
**Constraints**: [domain-specific, e.g., <200ms p95, <100MB memory, offline-capable or NEEDS CLARIFICATION]  
**Scale/Scope**: [domain-specific, e.g., 10k users, 1M LOC, 50 screens or NEEDS CLARIFICATION]

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

**Violations requiring justification**: [List any principles that cannot be followed with rationale]

## Project Structure

### Documentation (this feature)

```text
specs/[###-feature]/
├── plan.md              # This file (/speckit.plan command output)
├── research.md          # Phase 0 output (/speckit.plan command)
├── data-model.md        # Phase 1 output (/speckit.plan command)
├── quickstart.md        # Phase 1 output (/speckit.plan command)
├── contracts/           # Phase 1 output (/speckit.plan command)
└── tasks.md             # Phase 2 output (/speckit.tasks command - NOT created by /speckit.plan)
```

### Source Code (repository root)
<!--
  ACTION REQUIRED: Replace the placeholder tree below with the concrete layout
  for this feature. Delete unused options and expand the chosen structure with
  real paths. The delivered plan must not include Option labels.
  
  Sporaclet uses Option 2 (Web application) with client/ and server/ structure.
-->

```text
# [REMOVE IF UNUSED] Option 1: Single project (DEFAULT)
src/
├── models/
├── services/
├── cli/
└── lib/

tests/
├── contract/
├── integration/
└── unit/

# [DEFAULT FOR SPORACLET] Option 2: Web application (Next.js + Express.js)
client/                          # Next.js frontend with SSR
├── app/                         # Next.js App Router
│   ├── (routes)/               # Route groups
│   └── api/                    # API routes (minimal use)
├── components/
│   ├── features/               # Feature-specific components
│   └── ui/                     # Generic UI components
├── lib/                        # Utilities and helpers
├── services/                   # API client services
├── types/                      # TypeScript definitions
└── tests/                      # Frontend tests

server/                          # Express.js backend
├── src/
│   ├── controllers/            # Route handlers (thin)
│   ├── services/               # Business logic
│   ├── repositories/           # Data access layer
│   ├── models/                 # Data models/entities
│   ├── middleware/             # Express middleware
│   ├── routes/                 # API route definitions
│   ├── workers/                # Background job processors
│   │   ├── jobs/              # Individual job handlers
│   │   └── queues/            # Queue configurations
│   ├── utils/                  # Utility functions
│   └── types/                  # TypeScript definitions
├── tests/
│   ├── unit/                   # Unit tests
│   └── integration/            # API integration tests
└── prisma/                     # Database schema and migrations

# [REMOVE IF UNUSED] Option 3: Mobile + API (when "iOS/Android" detected)
api/
└── [same as backend above]

ios/ or android/
└── [platform-specific structure: feature modules, UI flows, platform tests]
```

**Structure Decision**: [Document the selected structure and reference the real
directories captured above]

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| [e.g., 4th project] | [current need] | [why 3 projects insufficient] |
| [e.g., Repository pattern] | [specific problem] | [why direct DB access insufficient] |
