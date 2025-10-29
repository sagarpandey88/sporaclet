# Sporaclet — Sports Prediction Platform

Overview
--------
Sporaclet is a full‑stack sports prediction platform with a Next.js frontend , Express.js backend and Postgres as database. The project  provides users with predictions of  sports events using AI. It displays holistic information about the reason for the prediction.

Goals
-----
- Provide a smooth UX for creating and submitting predictions.
- Maintain reliable backend APIs and persistent storage.
- Offer an extendable architecture so new sports, leagues, and scoring rules can be added easily.

Key Features (MVP)
------------------
- Home Page : List of featured events displaying predictions and option to view all events
- All Events: Displays all events in togglable grid and list format with options to filter and search across events.

-Event Details : Displays the event information , location , weather , prediction stats , Dream team , Statistics , History 

-Header and Footer : Header has a  logo , Links to Home , Events , Predictions , Dark and Light mode toggle.
Footer has links and social media logos


Architecture
------------
- Monorepo with two workspaces: client (React/Next.js) and server (Node.js/Express).
- PostgreSQL for relational storage of users, games, predictions, and results.
- RESTful JSON APIs between client and server (option to add GraphQL later).
- Server-side scoring service to evaluate predictions when results are posted.

Tech Stack
----------
- Frontend: React (Next.js recommended), TypeScript (required), CSS framework (Tailwind/Chakra/Material).
- Backend: Node.js with Express or Fastify, TypeScript required.
- Database: PostgreSQL.
- Dev tooling: concurrently for local orchestration, scripts in package.json.
- Testing: Jest / React Testing Library for client, Jest / Supertest for server.

Repository layout
-----------------
- /client — frontend application (Next.js).
- /server — backend API and worker logic.
- Root package.json orchestrates dev/build/start across workspaces.

Development setup
-----------------
Prerequisites:
- Node.js (LTS)
- npm or Yarn
- PostgreSQL (local or remote)

Quickstart (local)
1. Install dependencies:
   - npm run install
2. Configure environment:
   - Create .env files in server and client as needed. Example keys:
     - SERVER_DATABASE_URL=postgres://user:pass@localhost:5432/dbname
    - NEXT_PUBLIC_API_URL=http://localhost:3001/api
3. Run dev environment:
   - npm run dev
4. Build for production:
   - npm run build
5. Start production (after build):
   - npm run start

API surface (high level)
------------------------

### Events Endpoints
- **GET /api/events** — Get all events with optional filtering
  - Query params: `sport_type`, `league`, `tournament`, `status`, `limit`, `offset`
  - Returns: Paginated list of events with embedded predictions
  
- **GET /api/events/search?q={query}** — Search events by team name, venue, league, or tournament
  - Query params: `q` (required), `limit`, `offset`
  - Returns: Matching events with pagination
  
- **GET /api/events/sport/:sportType** — Get events filtered by sport type
  - Params: `sportType` (Football, Basketball, Cricket, Tennis, etc.)
  - Query params: `limit`, `offset`
  - Returns: Events for specified sport with pagination
  
- **GET /api/events/:id** — Get single event with full details including predictions and Dream XI
  - Params: `id` (event ID)
  - Returns: Complete event object with predictions, weather, historical data, and Dream XI

- **POST /api/events** — Create new event (admin)
  - Required fields: `sportType`, `eventDate`, `venue`, `teamsInvolved`
  - Returns: Created event object

### Predictions Endpoints
- **GET /api/predictions** — Get all predictions with optional filtering
  - Query params: `confidence_min`, `event_id`, `limit`, `offset`
  - Returns: Paginated predictions with embedded event data

- **GET /api/predictions/event/:eventId** — Get all predictions for a specific event
  - Params: `eventId`
  - Returns: Array of predictions for the event

- **POST /api/predictions** — Create new prediction
  - Required fields: `eventId`, `predictionDetails`, `confidenceScore`, `factorsConsidered`
  - Returns: Created prediction object

- **PATCH /api/predictions/:id** — Update prediction outcome and accuracy
  - Params: `id` (prediction ID)
  - Body: `outcome`, `accuracy`
  - Returns: Updated prediction object

### Scheduler Endpoints (AI Prediction Service)
- **GET /api/scheduler/status** — Get current scheduler status
- **POST /api/scheduler/trigger** — Manually trigger scheduler run
- **GET /api/scheduler/config** — Get scheduler configuration
- **GET /api/scheduler/stats** — Get scheduler statistics
- **GET /api/scheduler/health** — Scheduler health check

### Utility Endpoints
- **GET /health** — API health check with system status
- **GET /api** — API documentation and available endpoints

Data model (core entities)
--------------------------

### Events Table
```sql
events (
  id VARCHAR PRIMARY KEY,
  sport_type VARCHAR NOT NULL,  -- 'Football', 'Cricket', 'Basketball', etc.
  event_date TIMESTAMP NOT NULL,
  venue VARCHAR NOT NULL,
  teams_involved JSONB NOT NULL,  -- { home: {...}, away: {...} } or { player1: {...}, player2: {...} }
  weather_conditions JSONB,  -- { temperature, humidity, windSpeed, condition }
  historical_data JSONB,  -- { headToHead, lastMeeting }
  league VARCHAR,
  tournament VARCHAR,
  status VARCHAR DEFAULT 'upcoming',  -- 'upcoming', 'live', 'completed', 'cancelled'
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
)
```

### Predictions Table
```sql
predictions (
  id VARCHAR PRIMARY KEY,
  event_id VARCHAR REFERENCES events(id),
  prediction_details JSONB NOT NULL,  -- { winner, score, spread, totalPoints, etc. }
  confidence_score DECIMAL(5,2) NOT NULL,  -- 0.00 to 100.00
  factors_considered JSONB,  -- { homeAdvantage, currentForm, weather, etc. }
  outcome VARCHAR,  -- 'correct', 'incorrect', null (pending)
  accuracy DECIMAL(5,2),  -- Actual accuracy after event completion
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
)
```

### Teams/Players Structure (JSONB in teams_involved)
For team sports (Football, Basketball, etc.):
```json
{
  "home": {
    "name": "Team Name",
    "logo": "URL",
    "form": "WWDWL"
  },
  "away": {
    "name": "Team Name",
    "logo": "URL",
    "form": "LWWWD"
  }
}
```

For individual sports (Tennis, etc.):
```json
{
  "player1": {
    "name": "Player Name",
    "ranking": 1,
    "country": "Country"
  },
  "player2": {
    "name": "Player Name",
    "ranking": 2,
    "country": "Country"
  }
}
```

### Dream XI Structure (Generated for Football, Basketball, Baseball, American Football)
```json
{
  "formation": "4-3-3",
  "players": [
    {
      "position": "GK",
      "name": "Player Name",
      "team": "Team Name",
      "fantasyPoints": 8.5,
      "recentForm": "WWWDW",
      "keyStats": { "cleanSheets": 12, "saves": 89, "rating": 7.8 },
      "reason": "Justification for selection"
    }
  ],
  "substitutes": [...],
  "totalFantasyValue": 92.1,
  "averageRating": 7.9
}
```

### Prediction Details Structure (Sport-specific)
Football:
```json
{
  "winner": "Team Name",
  "score": "2-1",
  "goals": { "over2_5": true, "btts": true }
}
```

Basketball:
```json
{
  "winner": "Team Name",
  "totalPoints": 225,
  "spread": "Team -4.5"
}
```

Cricket (to be implemented):
```json
{
  "winner": "Team Name",
  "totalRuns": 320,
  "wickets": 8,
  "margin": "runs" | "wickets"
}
```

Testing
-------
- Unit tests for scoring logic and server routes.
- Integration tests for API endpoints.
- E2E (optional) for critical flows in the client.

Deployment
----------
- Frontend: deploy static frontend to Cloudflare Pages (or Cloudflare Workers + Pages). Configure NEXT_PUBLIC_API_URL to point at your backend endpoint.
- Backend: host API on Azure (App Service, Azure Container Instances, or Azure Functions depending on architecture). Use Azure Database for PostgreSQL for production.
- Use environment variables / Azure Key Vault and Cloudflare secrets for storing secrets.
- Containerization (Docker) is optional: build images for backend and push to Azure Container Registry if using container hosting.

Roadmap / Next milestones
-------------------------
1. Finish authentication and basic prediction flow (MVP).
2. Implement scoring engine and leaderboard.
3. Admin UI for game/result management.
4. Add notifications and social features.
5. Improve analytics and historical comparisons.

Contributing
------------
- Use the monorepo scripts defined in root package.json.
- Follow code style and add tests for new features.
- Open issues and PRs with clear descriptions and screenshots if applicable.

License & attribution
---------------------
MIT — see root package.json for details.