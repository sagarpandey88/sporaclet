# Sports Prediction API

Express.js API for the Sports Prediction Platform using PostgreSQL on Azure.

## Setup

1. **Install Dependencies**
   ```bash
   cd api
   npm install
   ```

2. **Environment Configuration**
   ```bash
   cp .env.example .env
   # Edit .env with your Azure PostgreSQL connection details
   ```

3. **Database Setup**
   ```bash
   # Create database schema
   npm run db:schema
   
   # Seed with sample data
   npm run db:seed
   ```

4. **Start Development Server**
   ```bash
   npm run dev
   ```

## API Endpoints

### Events

- `GET /api/events` - Get all events
  - Query params: `sport_type`, `league`, `tournament`, `limit`, `offset`
- `GET /api/events/:id` - Get single event
- `POST /api/events` - Create new event

### Predictions

- `GET /api/predictions` - Get all predictions
  - Query params: `confidence_min`, `limit`, `offset`
- `POST /api/predictions` - Create new prediction
- `PATCH /api/predictions/:id` - Update prediction outcome

### Health Check

- `GET /health` - API health status

## Database Schema

### Events Table
- `id` - Primary key
- `sport_type` - Type of sport (Football, Basketball, Tennis, etc.)
- `event_date` - When the event takes place
- `venue` - Event location
- `teams_involved` - JSON object with team/player information
- `weather_conditions` - JSON object with weather data (optional)
- `historical_data` - JSON object with head-to-head records (optional)
- `league` - League name (optional)
- `tournament` - Tournament name (optional)
- `status` - Event status (upcoming, live, completed)
- `created_at` - Record creation timestamp
- `updated_at` - Record update timestamp

### Predictions Table
- `id` - Primary key
- `event_id` - Foreign key to events table
- `prediction_details` - JSON object with prediction specifics
- `confidence_score` - Prediction confidence (0-100)
- `factors_considered` - JSON object with analysis factors
- `outcome` - Actual result (optional)
- `accuracy` - Prediction accuracy percentage (optional)
- `created_at` - Record creation timestamp
- `updated_at` - Record update timestamp

## Example Requests

### Get Events
```bash
curl "http://localhost:3001/api/events?sport_type=Football&limit=10"
```

### Create Event
```bash
curl -X POST http://localhost:3001/api/events \
  -H "Content-Type: application/json" \
  -d '{
    "sportType": "Football",
    "eventDate": "2025-01-25T15:00:00Z",
    "venue": "Emirates Stadium",
    "teamsInvolved": {
      "home": {"name": "Arsenal FC"},
      "away": {"name": "Tottenham FC"}
    },
    "league": "Premier League"
  }'
```

### Create Prediction
```bash
curl -X POST http://localhost:3001/api/predictions \
  -H "Content-Type: application/json" \
  -d '{
    "eventId": "1",
    "predictionDetails": {
      "winner": "Arsenal FC",
      "score": "2-1"
    },
    "confidenceScore": 75.5,
    "factorsConsidered": {
      "homeAdvantage": 20,
      "currentForm": 30
    }
  }'
```

## Deployment

### Azure App Service
1. Create Azure App Service
2. Configure environment variables in Azure Portal
3. Deploy using GitHub Actions or Azure CLI

### Docker
```bash
# Build image
docker build -t sports-prediction-api .

# Run container
docker run -p 3001:3001 --env-file .env sports-prediction-api
```

## Environment Variables

Required environment variables:

- `DATABASE_URL` - PostgreSQL connection string
- `PORT` - Server port (default: 3001)
- `NODE_ENV` - Environment (development/production)

## Error Handling

The API includes comprehensive error handling:
- Input validation
- Database connection errors
- 404 for missing resources
- 500 for server errors
- Proper HTTP status codes

## Security Features

- CORS enabled for cross-origin requests
- Input sanitization
- SQL injection prevention via parameterized queries
- SSL/TLS for database connections