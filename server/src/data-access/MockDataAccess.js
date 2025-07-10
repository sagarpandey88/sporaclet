const DataAccessLayer = require('./DataAccessLayer');

/**
 * Mock data access implementation using static data
 * Useful for development, testing, and when database is not available
 */
class MockDataAccess extends DataAccessLayer {
  constructor() {
    super();
    this.events = this._getMockEvents();
    this.predictions = this._getMockPredictions();
  }

  async getAllEvents(filters = {}, pagination = {}) {
    try {
      let filteredEvents = [...this.events];

      // Apply filters
      if (filters.sport_type) {
        filteredEvents = filteredEvents.filter(event => 
          event.sportType.toLowerCase() === filters.sport_type.toLowerCase()
        );
      }

      if (filters.league) {
        filteredEvents = filteredEvents.filter(event => 
          event.league === filters.league
        );
      }

      if (filters.tournament) {
        filteredEvents = filteredEvents.filter(event => 
          event.tournament === filters.tournament
        );
      }

      if (filters.status) {
        filteredEvents = filteredEvents.filter(event => 
          event.status === filters.status
        );
      }

      // Apply pagination
      const limit = parseInt(pagination.limit) || 50;
      const offset = parseInt(pagination.offset) || 0;
      
      const paginatedEvents = filteredEvents.slice(offset, offset + limit);

      // Add predictions to events
      return paginatedEvents.map(event => ({
        ...event,
        predictions: this.predictions.filter(p => p.eventId === event.id)
      }));
    } catch (error) {
      throw new Error(`Failed to get events: ${error.message}`);
    }
  }

  async getEventById(id) {
    try {
      const event = this.events.find(e => e.id === id);
      if (!event) {
        return null;
      }

      return {
        ...event,
        predictions: this.predictions.filter(p => p.eventId === id),
        dreamXI: this._getDreamXIForEvent(event)
      };
    } catch (error) {
      throw new Error(`Failed to get event by ID: ${error.message}`);
    }
  }

  async searchEvents(query, pagination = {}) {
    try {
      const searchTerm = query.toLowerCase();
      const filteredEvents = this.events.filter(event => {
        const teamsText = JSON.stringify(event.teamsInvolved).toLowerCase();
        const venueText = event.venue.toLowerCase();
        const leagueText = (event.league || '').toLowerCase();
        const tournamentText = (event.tournament || '').toLowerCase();
        
        return teamsText.includes(searchTerm) || 
               venueText.includes(searchTerm) ||
               leagueText.includes(searchTerm) ||
               tournamentText.includes(searchTerm);
      });

      const limit = parseInt(pagination.limit) || 50;
      const offset = parseInt(pagination.offset) || 0;
      
      return filteredEvents.slice(offset, offset + limit).map(event => ({
        ...event,
        predictions: this.predictions.filter(p => p.eventId === event.id)
      }));
    } catch (error) {
      throw new Error(`Failed to search events: ${error.message}`);
    }
  }

  async getEventsBySport(sportType, pagination = {}) {
    try {
      return this.getAllEvents({ sport_type: sportType }, pagination);
    } catch (error) {
      throw new Error(`Failed to get events by sport: ${error.message}`);
    }
  }

  async getAllPredictions(filters = {}, pagination = {}) {
    try {
      let filteredPredictions = [...this.predictions];

      if (filters.confidence_min) {
        const minConfidence = parseFloat(filters.confidence_min);
        filteredPredictions = filteredPredictions.filter(p => 
          p.confidenceScore >= minConfidence
        );
      }

      if (filters.event_id) {
        filteredPredictions = filteredPredictions.filter(p => 
          p.eventId === filters.event_id
        );
      }

      const limit = parseInt(pagination.limit) || 50;
      const offset = parseInt(pagination.offset) || 0;
      
      const paginatedPredictions = filteredPredictions.slice(offset, offset + limit);

      // Add event data to predictions
      return paginatedPredictions.map(prediction => {
        const event = this.events.find(e => e.id === prediction.eventId);
        return {
          ...prediction,
          event: event ? {
            sportType: event.sportType,
            teamsInvolved: event.teamsInvolved,
            eventDate: event.eventDate,
            venue: event.venue,
            league: event.league
          } : null
        };
      });
    } catch (error) {
      throw new Error(`Failed to get predictions: ${error.message}`);
    }
  }

  async getPredictionsByEventId(eventId) {
    try {
      return this.predictions.filter(p => p.eventId === eventId);
    } catch (error) {
      throw new Error(`Failed to get predictions by event ID: ${error.message}`);
    }
  }

  async createEvent(eventData) {
    try {
      const newEvent = {
        id: `evt_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
        ...eventData,
        createdAt: new Date(),
        updatedAt: new Date(),
        status: eventData.status || 'upcoming'
      };

      this.events.push(newEvent);
      return newEvent;
    } catch (error) {
      throw new Error(`Failed to create event: ${error.message}`);
    }
  }

  async createPrediction(predictionData) {
    try {
      const newPrediction = {
        id: `pred_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
        ...predictionData,
        createdAt: new Date(),
        updatedAt: new Date(),
        outcome: null,
        accuracy: null
      };

      this.predictions.push(newPrediction);
      return newPrediction;
    } catch (error) {
      throw new Error(`Failed to create prediction: ${error.message}`);
    }
  }

  async updatePrediction(id, updateData) {
    try {
      const predictionIndex = this.predictions.findIndex(p => p.id === id);
      if (predictionIndex === -1) {
        return null;
      }

      this.predictions[predictionIndex] = {
        ...this.predictions[predictionIndex],
        ...updateData,
        updatedAt: new Date()
      };

      return this.predictions[predictionIndex];
    } catch (error) {
      throw new Error(`Failed to update prediction: ${error.message}`);
    }
  }

  _getMockEvents() {
    return [
      {
        id: '1',
        sportType: 'Football',
        eventDate: new Date('2025-01-20T15:30:00Z'),
        venue: 'Wembley Stadium',
        teamsInvolved: {
          home: { name: 'Arsenal FC', logo: '/api/placeholder/40/40', form: 'WWDWL' },
          away: { name: 'Chelsea FC', logo: '/api/placeholder/40/40', form: 'LWWWD' }
        },
        weatherConditions: {
          temperature: 12,
          humidity: 78,
          windSpeed: 15,
          condition: 'Partly Cloudy'
        },
        historicalData: {
          headToHead: { home: 45, away: 32, draws: 23 },
          lastMeeting: { date: '2024-10-15', result: 'Arsenal 2-1 Chelsea' }
        },
        league: 'Premier League',
        tournament: null,
        status: 'upcoming',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: '2',
        sportType: 'Basketball',
        eventDate: new Date('2025-01-21T20:00:00Z'),
        venue: 'Madison Square Garden',
        teamsInvolved: {
          home: { name: 'New York Knicks', logo: '/api/placeholder/40/40', form: 'WLWWL' },
          away: { name: 'Boston Celtics', logo: '/api/placeholder/40/40', form: 'WWWLW' }
        },
        weatherConditions: null,
        historicalData: {
          headToHead: { home: 38, away: 42, draws: 0 },
          lastMeeting: { date: '2024-12-10', result: 'Celtics 118-112 Knicks' }
        },
        league: 'NBA',
        tournament: null,
        status: 'upcoming',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: '3',
        sportType: 'Tennis',
        eventDate: new Date('2025-01-22T10:00:00Z'),
        venue: 'Rod Laver Arena',
        teamsInvolved: {
          player1: { name: 'Novak Djokovic', ranking: 1, country: 'Serbia' },
          player2: { name: 'Carlos Alcaraz', ranking: 2, country: 'Spain' }
        },
        weatherConditions: {
          temperature: 28,
          humidity: 45,
          windSpeed: 8,
          condition: 'Sunny'
        },
        historicalData: {
          headToHead: { player1: 3, player2: 2 },
          lastMeeting: { date: '2024-11-20', result: 'Djokovic def. Alcaraz 6-4, 7-6' }
        },
        league: null,
        tournament: 'Australian Open',
        status: 'upcoming',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: '4',
        sportType: 'Football',
        eventDate: new Date('2025-01-23T18:00:00Z'),
        venue: 'Old Trafford',
        teamsInvolved: {
          home: { name: 'Manchester United', logo: '/api/placeholder/40/40', form: 'WLWDW' },
          away: { name: 'Liverpool FC', logo: '/api/placeholder/40/40', form: 'WWWWL' }
        },
        weatherConditions: {
          temperature: 8,
          humidity: 85,
          windSpeed: 20,
          condition: 'Rainy'
        },
        historicalData: {
          headToHead: { home: 81, away: 69, draws: 58 },
          lastMeeting: { date: '2024-09-01', result: 'Liverpool 3-0 Manchester United' }
        },
        league: 'Premier League',
        tournament: null,
        status: 'upcoming',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: '5',
        sportType: 'Basketball',
        eventDate: new Date('2025-01-24T21:30:00Z'),
        venue: 'Staples Center',
        teamsInvolved: {
          home: { name: 'Los Angeles Lakers', logo: '/api/placeholder/40/40', form: 'WWLWW' },
          away: { name: 'Golden State Warriors', logo: '/api/placeholder/40/40', form: 'LWWWW' }
        },
        weatherConditions: null,
        historicalData: {
          headToHead: { home: 257, away: 170, draws: 0 },
          lastMeeting: { date: '2024-12-25', result: 'Lakers 115-113 Warriors' }
        },
        league: 'NBA',
        tournament: null,
        status: 'upcoming',
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];
  }

  _getMockPredictions() {
    return [
      {
        id: 'p1',
        eventId: '1',
        predictionDetails: {
          winner: 'Arsenal FC',
          score: '2-1',
          goals: { over2_5: true, btts: true }
        },
        confidenceScore: 78.5,
        factorsConsidered: {
          homeAdvantage: 15,
          currentForm: 25,
          headToHead: 20,
          playerInjuries: -5,
          weather: 3
        },
        outcome: null,
        accuracy: null,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: 'p2',
        eventId: '2',
        predictionDetails: {
          winner: 'Boston Celtics',
          totalPoints: 225,
          spread: 'Celtics -4.5'
        },
        confidenceScore: 82.3,
        factorsConsidered: {
          awayForm: 30,
          headToHead: 15,
          playerStats: 25,
          restDays: 10,
          venue: -8
        },
        outcome: null,
        accuracy: null,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: 'p3',
        eventId: '3',
        predictionDetails: {
          winner: 'Novak Djokovic',
          sets: '3-1',
          totalGames: 'Over 38.5'
        },
        confidenceScore: 71.8,
        factorsConsidered: {
          experience: 25,
          currentForm: 20,
          surface: 15,
          headToHead: 10,
          weather: 5
        },
        outcome: null,
        accuracy: null,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: 'p4',
        eventId: '4',
        predictionDetails: {
          winner: 'Liverpool FC',
          score: '1-2',
          goals: { over2_5: false, btts: true }
        },
        confidenceScore: 85.2,
        factorsConsidered: {
          currentForm: 35,
          headToHead: 20,
          awayRecord: 15,
          playerInjuries: 10,
          weather: -5
        },
        outcome: null,
        accuracy: null,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: 'p5',
        eventId: '5',
        predictionDetails: {
          winner: 'Golden State Warriors',
          totalPoints: 238,
          spread: 'Warriors -2.5'
        },
        confidenceScore: 76.9,
        factorsConsidered: {
          currentForm: 28,
          playerStats: 22,
          headToHead: 12,
          homeAdvantage: -8,
          restDays: 6
        },
        outcome: null,
        accuracy: null,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];
  }

  _getDreamXIForEvent(event) {
    if (event.sportType === 'Football') {
      return {
        formation: '4-3-3',
        players: [
          {
            position: 'GK',
            name: 'David Raya',
            team: 'Arsenal FC',
            fantasyPoints: 8.5,
            recentForm: 'WWWDW',
            keyStats: { cleanSheets: 12, saves: 89, rating: 7.8 },
            reason: 'Superior shot-stopping ability and distribution. Leading clean sheet record this season.'
          },
          {
            position: 'RB',
            name: 'Reece James',
            team: 'Chelsea FC',
            fantasyPoints: 7.2,
            recentForm: 'WLWWD',
            keyStats: { assists: 8, crosses: 156, rating: 7.5 },
            reason: 'Exceptional attacking threat from right-back with consistent crossing ability.'
          }
        ],
        substitutes: [],
        totalFantasyValue: 92.1,
        averageRating: 7.9
      };
    }
    return null;
  }
}

module.exports = MockDataAccess;