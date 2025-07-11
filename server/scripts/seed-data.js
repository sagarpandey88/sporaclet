const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: false//process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

const seedData = async () => {
  const client = await pool.connect();
  
  try {
    console.log('Seeding database with sample data...');
    
    // Sample events data
    const events = [
      {
        id: '1',
        sport_type: 'Football',
        event_date: new Date('2025-01-20T15:30:00Z'),
        venue: 'Wembley Stadium',
        teams_involved: {
          home: { name: 'Arsenal FC', logo: '/api/placeholder/40/40', form: 'WWDWL' },
          away: { name: 'Chelsea FC', logo: '/api/placeholder/40/40', form: 'LWWWD' }
        },
        weather_conditions: {
          temperature: 12,
          humidity: 78,
          windSpeed: 15,
          condition: 'Partly Cloudy'
        },
        historical_data: {
          headToHead: { home: 45, away: 32, draws: 23 },
          lastMeeting: { date: '2024-10-15', result: 'Arsenal 2-1 Chelsea' }
        },
        league: 'Premier League',
        tournament: null,
        status: 'upcoming'
      },
      {
        id: '2',
        sport_type: 'Basketball',
        event_date: new Date('2025-01-21T20:00:00Z'),
        venue: 'Madison Square Garden',
        teams_involved: {
          home: { name: 'New York Knicks', logo: '/api/placeholder/40/40', form: 'WLWWL' },
          away: { name: 'Boston Celtics', logo: '/api/placeholder/40/40', form: 'WWWLW' }
        },
        weather_conditions: null,
        historical_data: {
          headToHead: { home: 38, away: 42, draws: 0 },
          lastMeeting: { date: '2024-12-10', result: 'Celtics 118-112 Knicks' }
        },
        league: 'NBA',
        tournament: null,
        status: 'upcoming'
      },
      {
        id: '3',
        sport_type: 'Tennis',
        event_date: new Date('2025-01-22T10:00:00Z'),
        venue: 'Rod Laver Arena',
        teams_involved: {
          player1: { name: 'Novak Djokovic', ranking: 1, country: 'Serbia' },
          player2: { name: 'Carlos Alcaraz', ranking: 2, country: 'Spain' }
        },
        weather_conditions: {
          temperature: 28,
          humidity: 45,
          windSpeed: 8,
          condition: 'Sunny'
        },
        historical_data: {
          headToHead: { player1: 3, player2: 2 },
          lastMeeting: { date: '2024-11-20', result: 'Djokovic def. Alcaraz 6-4, 7-6' }
        },
        league: null,
        tournament: 'Australian Open',
        status: 'upcoming'
      },
      {
        id: '4',
        sport_type: 'Football',
        event_date: new Date('2025-01-23T18:00:00Z'),
        venue: 'Old Trafford',
        teams_involved: {
          home: { name: 'Manchester United', logo: '/api/placeholder/40/40', form: 'WLWDW' },
          away: { name: 'Liverpool FC', logo: '/api/placeholder/40/40', form: 'WWWWL' }
        },
        weather_conditions: {
          temperature: 8,
          humidity: 85,
          windSpeed: 20,
          condition: 'Rainy'
        },
        historical_data: {
          headToHead: { home: 81, away: 69, draws: 58 },
          lastMeeting: { date: '2024-09-01', result: 'Liverpool 3-0 Manchester United' }
        },
        league: 'Premier League',
        tournament: null,
        status: 'upcoming'
      },
      {
        id: '5',
        sport_type: 'Basketball',
        event_date: new Date('2025-01-24T21:30:00Z'),
        venue: 'Staples Center',
        teams_involved: {
          home: { name: 'Los Angeles Lakers', logo: '/api/placeholder/40/40', form: 'WWLWW' },
          away: { name: 'Golden State Warriors', logo: '/api/placeholder/40/40', form: 'LWWWW' }
        },
        weather_conditions: null,
        historical_data: {
          headToHead: { home: 257, away: 170, draws: 0 },
          lastMeeting: { date: '2024-12-25', result: 'Lakers 115-113 Warriors' }
        },
        league: 'NBA',
        tournament: null,
        status: 'upcoming'
      }
    ];
    
    // Insert events
    for (const event of events) {
      await client.query(`
        INSERT INTO events (id, sport_type, event_date, venue, teams_involved, weather_conditions, historical_data, league, tournament, status)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
        ON CONFLICT (id) DO NOTHING
      `, [
        event.id,
        event.sport_type,
        event.event_date,
        event.venue,
        JSON.stringify(event.teams_involved),
        event.weather_conditions ? JSON.stringify(event.weather_conditions) : null,
        event.historical_data ? JSON.stringify(event.historical_data) : null,
        event.league,
        event.tournament,
        event.status
      ]);
    }
    
    console.log('✓ Events seeded');
    
    // Sample predictions data
    const predictions = [
      {
        id: 'p1',
        event_id: '1',
        prediction_details: {
          winner: 'Arsenal FC',
          score: '2-1',
          goals: { over2_5: true, btts: true }
        },
        confidence_score: 78.5,
        factors_considered: {
          homeAdvantage: 15,
          currentForm: 25,
          headToHead: 20,
          playerInjuries: -5,
          weather: 3
        }
      },
      {
        id: 'p2',
        event_id: '2',
        prediction_details: {
          winner: 'Boston Celtics',
          totalPoints: 225,
          spread: 'Celtics -4.5'
        },
        confidence_score: 82.3,
        factors_considered: {
          awayForm: 30,
          headToHead: 15,
          playerStats: 25,
          restDays: 10,
          venue: -8
        }
      },
      {
        id: 'p3',
        event_id: '3',
        prediction_details: {
          winner: 'Novak Djokovic',
          sets: '3-1',
          totalGames: 'Over 38.5'
        },
        confidence_score: 71.8,
        factors_considered: {
          experience: 25,
          currentForm: 20,
          surface: 15,
          headToHead: 10,
          weather: 5
        }
      },
      {
        id: 'p4',
        event_id: '4',
        prediction_details: {
          winner: 'Liverpool FC',
          score: '1-2',
          goals: { over2_5: false, btts: true }
        },
        confidence_score: 85.2,
        factors_considered: {
          currentForm: 35,
          headToHead: 20,
          awayRecord: 15,
          playerInjuries: 10,
          weather: -5
        }
      },
      {
        id: 'p5',
        event_id: '5',
        prediction_details: {
          winner: 'Golden State Warriors',
          totalPoints: 238,
          spread: 'Warriors -2.5'
        },
        confidence_score: 76.9,
        factors_considered: {
          currentForm: 28,
          playerStats: 22,
          headToHead: 12,
          homeAdvantage: -8,
          restDays: 6
        }
      }
    ];
    
    // Insert predictions
    for (const prediction of predictions) {
      await client.query(`
        INSERT INTO predictions (id, event_id, prediction_details, confidence_score, factors_considered)
        VALUES ($1, $2, $3, $4, $5)
        ON CONFLICT (id) DO NOTHING
      `, [
        prediction.id,
        prediction.event_id,
        JSON.stringify(prediction.prediction_details),
        prediction.confidence_score,
        JSON.stringify(prediction.factors_considered)
      ]);
    }
    
    console.log('✓ Predictions seeded');
    
    // Verify data
    const eventCount = await client.query('SELECT COUNT(*) FROM events');
    const predictionCount = await client.query('SELECT COUNT(*) FROM predictions');
    
    console.log(`\n📊 Database seeded successfully!`);
    console.log(`   Events: ${eventCount.rows[0].count}`);
    console.log(`   Predictions: ${predictionCount.rows[0].count}`);
    
  } catch (error) {
    console.error('Error seeding data:', error);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
};

// Run the data seeding
seedData();