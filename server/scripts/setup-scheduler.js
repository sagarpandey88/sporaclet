const { sequelize } = require('../src/config/database');
const AIPrediction = require('../src/models/AIPrediction');
const logger = require('../src/utils/logger');

/**
 * Setup script for the AI prediction scheduler
 * Creates database tables and performs initial configuration
 */

async function setupScheduler() {
  try {
    console.log('🚀 Setting up AI Prediction Scheduler...\n');

    // Test database connection
    console.log('1. Testing database connection...');
    await sequelize.authenticate();
    console.log('✅ Database connection successful\n');

    // Sync database models
    console.log('2. Creating database tables...');
    await sequelize.sync({ force: false });
    console.log('✅ Database tables created/updated\n');

    // Verify AI configuration
    console.log('3. Verifying AI configuration...');
    const aiConfig = {
      provider: process.env.AI_MODEL_PROVIDER || 'openai',
      model: process.env.AI_MODEL_NAME || 'gpt-3.5-turbo',
      hasOpenAIKey: !!process.env.OPENAI_API_KEY,
      hasAnthropicKey: !!process.env.ANTHROPIC_API_KEY
    };

    console.log('AI Configuration:');
    console.log(`  Provider: ${aiConfig.provider}`);
    console.log(`  Model: ${aiConfig.model}`);
    console.log(`  OpenAI Key: ${aiConfig.hasOpenAIKey ? '✅ Configured' : '❌ Missing'}`);
    console.log(`  Anthropic Key: ${aiConfig.hasAnthropicKey ? '✅ Configured' : '❌ Missing'}`);

    if (!aiConfig.hasOpenAIKey && !aiConfig.hasAnthropicKey) {
      console.log('⚠️  Warning: No AI API keys configured. Please set OPENAI_API_KEY or ANTHROPIC_API_KEY\n');
    } else {
      console.log('✅ AI configuration valid\n');
    }

    // Test AI model creation
    console.log('4. Testing AI model initialization...');
    try {
      const AIModelFactory = require('../src/ai/AIModelFactory');
      const model = AIModelFactory.createModel();
      const modelInfo = model.getModelInfo();
      console.log(`✅ AI model initialized: ${modelInfo.provider}/${modelInfo.name}\n`);
    } catch (error) {
      console.log(`❌ AI model initialization failed: ${error.message}\n`);
    }

    // Display scheduler configuration
    console.log('5. Scheduler configuration:');
    const schedulerConfig = {
      enabled: process.env.SCHEDULER_ENABLED === 'true',
      cron: process.env.SCHEDULER_CRON || '0 6 * * *',
      timezone: process.env.SCHEDULER_TIMEZONE || 'UTC',
      maxEvents: process.env.MAX_EVENTS_PER_RUN || 20,
      sports: process.env.SPORTS_TO_PROCESS || 'all'
    };

    Object.entries(schedulerConfig).forEach(([key, value]) => {
      console.log(`  ${key}: ${value}`);
    });
    console.log('');

    // Check existing predictions
    console.log('6. Checking existing predictions...');
    const predictionCount = await AIPrediction.count();
    console.log(`📊 Existing predictions in database: ${predictionCount}\n`);

    // Display next steps
    console.log('🎉 Setup completed successfully!\n');
    console.log('Next steps:');
    console.log('1. Start the main API server: npm run dev');
    console.log('2. Start the scheduler: npm run scheduler:start');
    console.log('3. Check scheduler status: GET /api/scheduler/status');
    console.log('4. Trigger manual run: POST /api/scheduler/trigger\n');

    console.log('Environment variables to configure:');
    console.log('- SCHEDULER_ENABLED=true');
    console.log('- SCHEDULER_CRON="0 6 * * *" (daily at 6 AM)');
    console.log('- AI_MODEL_PROVIDER=openai|anthropic');
    console.log('- OPENAI_API_KEY=your_openai_key');
    console.log('- ANTHROPIC_API_KEY=your_anthropic_key');

  } catch (error) {
    console.error('❌ Setup failed:', error.message);
    logger.error('Scheduler setup failed', {
      error: error.message,
      stack: error.stack
    });
    process.exit(1);
  } finally {
    await sequelize.close();
  }
}

// Run setup if this file is executed directly
if (require.main === module) {
  require('dotenv').config();
  setupScheduler();
}

module.exports = { setupScheduler };