const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

const createSchema = async () => {
  const client = await pool.connect();
  
  try {
    console.log('Creating database schema...');
    
    // Create events table
    await client.query(`
      CREATE TABLE IF NOT EXISTS events (
        id VARCHAR(30) PRIMARY KEY DEFAULT 'evt_' || EXTRACT(EPOCH FROM NOW())::BIGINT || '_' || FLOOR(RANDOM() * 1000),
        sport_type VARCHAR(50) NOT NULL,
        event_date TIMESTAMP WITH TIME ZONE NOT NULL,
        venue VARCHAR(255) NOT NULL,
        teams_involved JSONB NOT NULL,
        weather_conditions JSONB,
        historical_data JSONB,
        league VARCHAR(100),
        tournament VARCHAR(100),
        status VARCHAR(20) DEFAULT 'upcoming',
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);
    
    console.log('✓ Events table created');
    
    // Create predictions table
    await client.query(`
      CREATE TABLE IF NOT EXISTS predictions (
        id VARCHAR(30) PRIMARY KEY DEFAULT 'pred_' || EXTRACT(EPOCH FROM NOW())::BIGINT || '_' || FLOOR(RANDOM() * 1000),
        event_id VARCHAR(30) NOT NULL REFERENCES events(id) ON DELETE CASCADE,
        prediction_details JSONB NOT NULL,
        confidence_score DECIMAL(5,2) NOT NULL CHECK (confidence_score >= 0 AND confidence_score <= 100),
        factors_considered JSONB NOT NULL,
        outcome VARCHAR(50),
        accuracy DECIMAL(5,2) CHECK (accuracy >= 0 AND accuracy <= 100),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);
    
    console.log('✓ Predictions table created');
    
    // Create indexes for better performance
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_events_sport_type ON events(sport_type);
    `);
    
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_events_event_date ON events(event_date);
    `);
    
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_events_league ON events(league);
    `);
    
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_events_status ON events(status);
    `);
    
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_predictions_event_id ON predictions(event_id);
    `);
    
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_predictions_confidence_score ON predictions(confidence_score);
    `);
    
    console.log('✓ Indexes created');
    
    // Create updated_at trigger function
    await client.query(`
      CREATE OR REPLACE FUNCTION update_updated_at_column()
      RETURNS TRIGGER AS $$
      BEGIN
        NEW.updated_at = CURRENT_TIMESTAMP;
        RETURN NEW;
      END;
      $$ language 'plpgsql';
    `);
    
    // Create triggers for updated_at
    await client.query(`
      DROP TRIGGER IF EXISTS update_events_updated_at ON events;
      CREATE TRIGGER update_events_updated_at
        BEFORE UPDATE ON events
        FOR EACH ROW
        EXECUTE FUNCTION update_updated_at_column();
    `);
    
    await client.query(`
      DROP TRIGGER IF EXISTS update_predictions_updated_at ON predictions;
      CREATE TRIGGER update_predictions_updated_at
        BEFORE UPDATE ON predictions
        FOR EACH ROW
        EXECUTE FUNCTION update_updated_at_column();
    `);
    
    console.log('✓ Triggers created');
    
    console.log('\n🎉 Database schema created successfully!');
    
  } catch (error) {
    console.error('Error creating schema:', error);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
};

// Run the schema creation
createSchema();