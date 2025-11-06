# Sporaclet

AI-Assisted Sport Prediction Portal

## Overview

Sporaclet is a web-based sport prediction platform that leverages artificial intelligence to provide insights and predictions for various sporting events. The application features a modern Next.js frontend with server-side rendering (SSR) and a robust Express.js backend powered by PostgreSQL database.

## Architecture

- **Frontend**: Next.js 14+ with App Router, TypeScript, Server-Side Rendering
- **Backend**: Express.js with TypeScript, RESTful API design
- **Database**: PostgreSQL 14+ with Prisma/TypeORM
- **Structure**: Monorepo with `client/` and `server/` directories

## Project Structure

```
sporaclet/
├── client/                 # Next.js frontend
│   ├── app/               # App Router pages and layouts
│   ├── components/        # React components
│   ├── lib/              # Utilities and helpers
│   ├── services/         # API client services
│   └── types/            # TypeScript definitions
│
├── server/                # Express.js backend
│   ├── src/
│   │   ├── controllers/  # Route handlers
│   │   ├── services/     # Business logic
│   │   ├── repositories/ # Data access layer
│   │   ├── models/       # Data models
│   │   ├── middleware/   # Express middleware
│   │   ├── routes/       # API routes
│   │   └── utils/        # Utility functions
│   └── tests/            # Backend tests
│
└── .specify/              # Project specifications and templates
    ├── memory/            # Constitution and project memory
    └── templates/         # Specification templates
```

## Development Guidelines

This project follows strict development principles documented in our [Project Constitution](.specify/memory/constitution.md). Key principles include:

- **Separation of Concerns**: Clear boundaries between frontend, backend, and data layers
- **Modular Architecture**: Features organized by domain, independently testable
- **Clean Code**: Readable, maintainable code with meaningful names and single responsibility
- **Test-First Development**: Tests written before implementation (Red-Green-Refactor)
- **Framework Best Practices**: Following Next.js and Express.js conventions

For detailed development standards, architecture decisions, and code organization guidelines, please refer to the [Constitution](.specify/memory/constitution.md).

## Getting Started

### Prerequisites

- Node.js 18+
- PostgreSQL 14+
- npm or yarn

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd sporaclet

# Install frontend dependencies
cd client
npm install

# Install backend dependencies
cd ../server
npm install
```

### Configuration

Create `.env` files in both `client/` and `server/` directories:

**client/.env.local:**
```env
NEXT_PUBLIC_API_URL=http://localhost:3001
```

**server/.env:**
```env
DATABASE_URL=postgresql://user:password@localhost:5432/sporaclet
PORT=3001
JWT_SECRET=your-secret-key
```

### Running the Application

```bash
# Terminal 1: Start backend server
cd server
npm run dev

# Terminal 2: Start frontend
cd client
npm run dev
```

The frontend will be available at `http://localhost:3000` and the backend API at `http://localhost:3001`.

## Testing

```bash
# Run frontend tests
cd client
npm test

# Run backend tests
cd server
npm test
```

## Contributing

1. Review the [Project Constitution](.specify/memory/constitution.md)
2. Create a feature branch from `main`
3. Follow the specification workflow in `.specify/templates/`
4. Write tests first (TDD approach)
5. Ensure all tests pass and code follows clean code principles
6. Submit a pull request with constitution compliance verification

## License

[License information to be added]

## Documentation

- [Project Constitution](.specify/memory/constitution.md) - Core development principles
- [Specification Templates](.specify/templates/) - Feature specification workflow
- API Documentation - [To be added]

## Contact

[Contact information to be added]