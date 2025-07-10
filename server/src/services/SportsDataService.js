const axios = require('axios');

/**
 * Service for fetching sports data from external APIs
 * Provides mock data when external APIs are not available
 */
class SportsDataService {
  constructor() {
    this.apiKey = process.env.SPORTS_API_KEY;
    this.weatherApiKey = process.env.WEATHER_API_KEY;
    this.baseUrl = 'https://api.sportsdata.io/v3';
  }

  /**
   * Fetch upcoming sports events
   * @param {Object} options - Fetch options
   * @returns {Promise<Array>} List of upcoming events
   */
  async getUpcomingEvents(options = {}) {
    const { sport = 'all', limit = 10, days = 7 } = options;

    try {
      // If API key is available, fetch from external API
      if (this.apiKey) {
        return await this.fetchFromExternalAPI(sport, limit, days);
      } else {
        // Return mock data for development
        return this.getMockUpcomingEvents(sport, limit);
      }
    } catch (error) {
      console.warn('Failed to fetch from external API, using mock data:', error.message);
      return this.getMockUpcomingEvents(sport, limit);
    }
  }

  /**
   * Fetch weather data for a venue
   * @param {string} venue - Venue name or coordinates
   * @param {Date} date - Event date
   * @returns {Promise<Object>} Weather data
   */
  async getWeatherData(venue, date) {
    try {
      if (this.weatherApiKey && venue) {
        const response = await axios.get(`https://api.openweathermap.org/data/2.5/forecast`, {
          params: {
            q: venue,
            appid: this.weatherApiKey,
            units: 'metric'
          },
          timeout: 5000
        });

        // Find forecast closest to event date
        const targetTime = new Date(date).getTime();
        const forecast = response.data.list.find(item => {
          const forecastTime = new Date(item.dt * 1000).getTime();
          return Math.abs(forecastTime - targetTime) < 3 * 60 * 60 * 1000; // Within 3 hours
        });

        if (forecast) {
          return {
            temperature: Math.round(forecast.main.temp),
            humidity: forecast.main.humidity,
            windSpeed: Math.round(forecast.wind.speed * 3.6), // Convert m/s to km/h
            condition: forecast.weather[0].description
          };
        }
      }
    } catch (error) {
      console.warn('Failed to fetch weather data:', error.message);
    }

    // Return mock weather data
    return this.getMockWeatherData();
  }

  /**
   * Fetch team/player statistics
   * @param {string} teamId - Team or player ID
   * @param {string} sport - Sport type
   * @returns {Promise<Object>} Team/player statistics
   */
  async getTeamStats(teamId, sport) {
    try {
      if (this.apiKey) {
        // Implement external API call based on sport
        return await this.fetchTeamStatsFromAPI(teamId, sport);
      }
    } catch (error) {
      console.warn('Failed to fetch team stats:', error.message);
    }

    // Return mock stats
    return this.getMockTeamStats(teamId, sport);
  }

  /**
   * Fetch from external sports API (implementation depends on chosen API)
   * @param {string} sport - Sport type
   * @param {number} limit - Number of events to fetch
   * @param {number} days - Days ahead to fetch
   * @returns {Promise<Array>} Events data
   */
  async fetchFromExternalAPI(sport, limit, days) {
    // This is a placeholder - implement based on your chosen sports API
    // Examples: ESPN API, SportsData.io, The Sports DB, etc.
    
    const endDate = new Date();
    endDate.setDate(endDate.getDate() + days);

    const response = await axios.get(`${this.baseUrl}/nfl/scores/json/Games/2024`, {
      headers: {
        'Ocp-Apim-Subscription-Key': this.apiKey
      },
      timeout: 10000
    });

    // Transform API response to our format
    return response.data.slice(0, limit).map(game => ({
      id: game.GameID?.toString(),
      sportType: this.mapSportType(game.Sport || 'Football'),
      eventDate: new Date(game.DateTime),
      venue: game.StadiumDetails?.Name || 'TBD',
      teams: {
        home: {
          name: game.HomeTeam,
          score: game.HomeScore
        },
        away: {
          name: game.AwayTeam,
          score: game.AwayScore
        }
      },
      league: game.Season?.toString(),
      status: game.Status === 'Final' ? 'completed' : 'upcoming'
    }));
  }

  /**
   * Get mock upcoming events for development/testing
   * @param {string} sport - Sport type filter
   * @param {number} limit - Number of events
   * @returns {Array} Mock events data
   */
  getMockUpcomingEvents(sport, limit) {
    const mockEvents = [
      {
        id: `mock_${Date.now()}_1`,
        sportType: 'Football',
        eventDate: new Date(Date.now() + 24 * 60 * 60 * 1000), // Tomorrow
        venue: 'Emirates Stadium',
        teams: {
          home: { name: 'Arsenal FC', form: 'WWDWL' },
          away: { name: 'Manchester City', form: 'WWWWL' }
        },
        league: 'Premier League',
        status: 'upcoming'
      },
      {
        id: `mock_${Date.now()}_2`,
        sportType: 'Basketball',
        eventDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // Day after tomorrow
        venue: 'Madison Square Garden',
        teams: {
          home: { name: 'New York Knicks', form: 'WLWWL' },
          away: { name: 'Boston Celtics', form: 'WWWLW' }
        },
        league: 'NBA',
        status: 'upcoming'
      },
      {
        id: `mock_${Date.now()}_3`,
        sportType: 'Tennis',
        eventDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
        venue: 'Centre Court, Wimbledon',
        teams: {
          player1: { name: 'Novak Djokovic', ranking: 1 },
          player2: { name: 'Carlos Alcaraz', ranking: 2 }
        },
        tournament: 'Wimbledon',
        status: 'upcoming'
      }
    ];

    let filteredEvents = mockEvents;
    if (sport !== 'all') {
      filteredEvents = mockEvents.filter(event => 
        event.sportType.toLowerCase() === sport.toLowerCase()
      );
    }

    return filteredEvents.slice(0, limit);
  }

  /**
   * Get mock weather data
   * @returns {Object} Mock weather data
   */
  getMockWeatherData() {
    const conditions = ['Clear', 'Partly Cloudy', 'Cloudy', 'Light Rain', 'Sunny'];
    return {
      temperature: Math.floor(Math.random() * 25) + 5, // 5-30°C
      humidity: Math.floor(Math.random() * 40) + 40, // 40-80%
      windSpeed: Math.floor(Math.random() * 20) + 5, // 5-25 km/h
      condition: conditions[Math.floor(Math.random() * conditions.length)]
    };
  }

  /**
   * Get mock team statistics
   * @param {string} teamId - Team ID
   * @param {string} sport - Sport type
   * @returns {Object} Mock team stats
   */
  getMockTeamStats(teamId, sport) {
    return {
      teamId,
      sport,
      wins: Math.floor(Math.random() * 20) + 5,
      losses: Math.floor(Math.random() * 15) + 2,
      draws: Math.floor(Math.random() * 8),
      goalsFor: Math.floor(Math.random() * 50) + 20,
      goalsAgainst: Math.floor(Math.random() * 30) + 10,
      form: ['W', 'W', 'L', 'D', 'W'].slice(0, 5),
      lastUpdated: new Date()
    };
  }

  /**
   * Map external API sport names to our format
   * @param {string} apiSport - Sport name from API
   * @returns {string} Standardized sport name
   */
  mapSportType(apiSport) {
    const mapping = {
      'NFL': 'American Football',
      'NBA': 'Basketball',
      'MLB': 'Baseball',
      'NHL': 'Hockey',
      'Soccer': 'Football',
      'Tennis': 'Tennis'
    };
    
    return mapping[apiSport] || apiSport;
  }
}

module.exports = SportsDataService;