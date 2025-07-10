const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

/**
 * AI Prediction Model
 * Stores AI-generated predictions with metadata about the AI model used
 */
const AIPrediction = sequelize.define('AIPrediction', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  
  // Event Information
  eventId: {
    type: DataTypes.STRING,
    allowNull: true,
    field: 'event_id'
  },
  
  sportType: {
    type: DataTypes.STRING,
    allowNull: false,
    field: 'sport_type'
  },
  
  eventDate: {
    type: DataTypes.DATE,
    allowNull: false,
    field: 'event_date'
  },
  
  teams: {
    type: DataTypes.JSONB,
    allowNull: false,
    comment: 'Team/player information'
  },
  
  // AI Model Information
  aiModel: {
    type: DataTypes.STRING,
    allowNull: false,
    field: 'ai_model',
    comment: 'AI model used (e.g., gpt-3.5-turbo, gpt-4, claude-3)'
  },
  
  aiProvider: {
    type: DataTypes.STRING,
    allowNull: false,
    field: 'ai_provider',
    comment: 'AI provider (openai, anthropic, etc.)'
  },
  
  // Prediction Data
  prediction: {
    type: DataTypes.JSONB,
    allowNull: false,
    comment: 'AI-generated prediction details'
  },
  
  confidenceScore: {
    type: DataTypes.DECIMAL(5, 2),
    allowNull: false,
    field: 'confidence_score',
    validate: {
      min: 0,
      max: 100
    }
  },
  
  reasoning: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: 'AI reasoning for the prediction'
  },
  
  // Input Data
  inputData: {
    type: DataTypes.JSONB,
    allowNull: false,
    field: 'input_data',
    comment: 'Data provided to AI model for prediction'
  },
  
  // Processing Metadata
  processingTime: {
    type: DataTypes.INTEGER,
    allowNull: true,
    field: 'processing_time_ms',
    comment: 'Time taken to generate prediction in milliseconds'
  },
  
  tokensUsed: {
    type: DataTypes.INTEGER,
    allowNull: true,
    field: 'tokens_used',
    comment: 'Number of tokens consumed by AI model'
  },
  
  // Validation and Results
  actualOutcome: {
    type: DataTypes.JSONB,
    allowNull: true,
    field: 'actual_outcome',
    comment: 'Actual event outcome for accuracy calculation'
  },
  
  accuracy: {
    type: DataTypes.DECIMAL(5, 2),
    allowNull: true,
    validate: {
      min: 0,
      max: 100
    },
    comment: 'Prediction accuracy percentage'
  },
  
  status: {
    type: DataTypes.ENUM('pending', 'completed', 'failed', 'validated'),
    defaultValue: 'pending'
  },
  
  errorMessage: {
    type: DataTypes.TEXT,
    allowNull: true,
    field: 'error_message'
  }
}, {
  tableName: 'ai_predictions',
  timestamps: true,
  underscored: true,
  indexes: [
    {
      fields: ['sport_type']
    },
    {
      fields: ['event_date']
    },
    {
      fields: ['ai_model']
    },
    {
      fields: ['confidence_score']
    },
    {
      fields: ['status']
    },
    {
      fields: ['created_at']
    }
  ]
});

module.exports = AIPrediction;