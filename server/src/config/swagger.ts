import swaggerJsdoc from 'swagger-jsdoc';

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Sporaclet API',
      version: '1.0.0',
      description: 'Sports Prediction Portal API Documentation',
      contact: {
        name: 'Sporaclet Team',
        url: 'https://github.com/yourusername/sporaclet',
      },
      license: {
        name: 'MIT',
        url: 'https://opensource.org/licenses/MIT',
      },
    },
    servers: [
      {
        url: 'http://localhost:3001',
        description: 'Development server',
      },
      {
        url: 'https://api.your-domain.com',
        description: 'Production server',
      },
    ],
    components: {
      schemas: {
        Sport: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            name: { type: 'string', example: 'Soccer' },
            icon: { type: 'string', example: '⚽' },
            enabled: { type: 'boolean' },
          },
        },
        Team: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            name: { type: 'string', example: 'Manchester United' },
            logo: { type: 'string', nullable: true },
            sport: { type: 'string', example: 'Soccer' },
          },
        },
        Player: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            name: { type: 'string', example: 'Marcus Rashford' },
            position: { type: 'string', example: 'Forward' },
            jerseyNumber: { type: 'integer', example: 10 },
            status: { type: 'string', enum: ['active', 'injured', 'suspended'] },
          },
        },
        Injury: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            playerId: { type: 'string' },
            player: { $ref: '#/components/schemas/Player' },
            type: { type: 'string', example: 'Hamstring' },
            severity: { type: 'string', enum: ['minor', 'moderate', 'major'] },
            status: { type: 'string', enum: ['active', 'recovering', 'resolved'] },
            startDate: { type: 'string', format: 'date-time' },
            estimatedReturn: { type: 'string', format: 'date-time', nullable: true },
          },
        },
        PredictionSummary: {
          type: 'object',
          properties: {
            confidence: { type: 'number', example: 0.75 },
            predictedWinner: { type: 'string', example: 'home' },
            predictedScore: { type: 'string', example: '2-1', nullable: true },
            isAccurate: { type: 'boolean', nullable: true },
            accuracyNote: { type: 'string', nullable: true },
          },
        },
        EventSummary: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            sport: { type: 'string', example: 'Soccer' },
            league: { type: 'string', example: 'Premier League' },
            eventName: { type: 'string', example: 'Manchester United vs Liverpool' },
            homeTeam: { type: 'string', example: 'Manchester United' },
            awayTeam: { type: 'string', example: 'Liverpool' },
            venue: { type: 'string', example: 'Old Trafford' },
            eventDate: { type: 'string', format: 'date-time' },
            status: { type: 'string', enum: ['upcoming', 'in_progress', 'completed', 'postponed', 'cancelled'] },
            
            winner: { type: 'string', nullable: true },
            prediction: { $ref: '#/components/schemas/PredictionSummary' },
          },
        },
        EventDetail: {
          allOf: [
            { $ref: '#/components/schemas/EventSummary' },
            {
              type: 'object',
              properties: {
                homeTeamId: { type: 'string' },
                awayTeamId: { type: 'string' },
                homeTeamLogo: { type: 'string', nullable: true },
                awayTeamLogo: { type: 'string', nullable: true },
                weather: { type: 'string', nullable: true },
                predictedLineup: { type: 'object', nullable: true },
                injuries: {
                  type: 'array',
                  items: { $ref: '#/components/schemas/Injury' },
                },
                headToHead: {
                  type: 'object',
                  properties: {
                    totalMatches: { type: 'integer' },
                    homeWins: { type: 'integer' },
                    awayWins: { type: 'integer' },
                    draws: { type: 'integer' },
                    recentMatches: {
                      type: 'array',
                      items: { type: 'object' },
                    },
                  },
                },
                prediction: {
                  type: 'object',
                  properties: {
                    confidence: { type: 'number' },
                    predictedWinner: { type: 'string' },
                    predictedScore: { type: 'string', nullable: true },
                    reasoning: { type: 'string' },
                    keyFactors: { type: 'array', items: { type: 'string' } },
                    isAccurate: { type: 'boolean', nullable: true },
                    accuracyNote: { type: 'string', nullable: true },
                  },
                },
              },
            },
          ],
        },
        PaginatedEvents: {
          type: 'object',
          properties: {
            data: {
              type: 'array',
              items: { $ref: '#/components/schemas/EventSummary' },
            },
            total: { type: 'integer' },
            page: { type: 'integer' },
            limit: { type: 'integer' },
            totalPages: { type: 'integer' },
          },
        },
        SearchResults: {
          type: 'object',
          properties: {
            data: {
              type: 'array',
              items: { $ref: '#/components/schemas/EventSummary' },
            },
            total: { type: 'integer' },
            page: { type: 'integer' },
            limit: { type: 'integer' },
            totalPages: { type: 'integer' },
          },
        },
        Error: {
          type: 'object',
          properties: {
            error: { type: 'string', example: 'Internal server error' },
            details: { type: 'string', nullable: true },
          },
        },
        HealthCheck: {
          type: 'object',
          properties: {
            status: { type: 'string', example: 'ok' },
            timestamp: { type: 'string', format: 'date-time' },
            uptime: { type: 'number' },
            database: { type: 'string', enum: ['connected', 'disconnected'] },
            redis: { type: 'string', enum: ['connected', 'disconnected'] },
          },
        },
      },
    },
  },
  apis: ['./src/routes/*.ts', './src/controllers/*.ts'],
};

export const swaggerSpec = swaggerJsdoc(options);
