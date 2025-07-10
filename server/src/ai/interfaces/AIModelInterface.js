/**
 * Abstract base class for AI model implementations
 * Defines the contract that all AI models must follow
 */
class AIModelInterface {
  constructor(config = {}) {
    if (this.constructor === AIModelInterface) {
      throw new Error('AIModelInterface is abstract and cannot be instantiated directly');
    }
    this.config = config;
    this.modelName = config.modelName || 'unknown';
    this.provider = config.provider || 'unknown';
  }

  /**
   * Generate a sports prediction based on input data
   * @param {Object} inputData - Sports event data for prediction
   * @param {Object} options - Additional options for prediction generation
   * @returns {Promise<Object>} Prediction result with confidence score and reasoning
   */
  async generatePrediction(inputData, options = {}) {
    throw new Error('generatePrediction method must be implemented by subclass');
  }

  /**
   * Validate input data format
   * @param {Object} inputData - Input data to validate
   * @returns {boolean} True if valid, throws error if invalid
   */
  validateInput(inputData) {
    if (!inputData) {
      throw new Error('Input data is required');
    }
    
    if (!inputData.sportType) {
      throw new Error('Sport type is required');
    }
    
    if (!inputData.teams) {
      throw new Error('Teams information is required');
    }
    
    if (!inputData.eventDate) {
      throw new Error('Event date is required');
    }
    
    return true;
  }

  /**
   * Get model information
   * @returns {Object} Model metadata
   */
  getModelInfo() {
    return {
      name: this.modelName,
      provider: this.provider,
      version: this.config.version || '1.0.0',
      capabilities: this.getCapabilities()
    };
  }

  /**
   * Get model capabilities
   * @returns {Array} List of supported features
   */
  getCapabilities() {
    return ['sports_prediction', 'confidence_scoring', 'reasoning'];
  }

  /**
   * Calculate token usage estimate
   * @param {string} text - Text to estimate tokens for
   * @returns {number} Estimated token count
   */
  estimateTokens(text) {
    // Rough estimation: 1 token ≈ 4 characters
    return Math.ceil(text.length / 4);
  }

  /**
   * Format prediction prompt
   * @param {Object} inputData - Sports event data
   * @returns {string} Formatted prompt for AI model
   */
  formatPrompt(inputData) {
    const { sportType, teams, eventDate, venue, historicalData, weatherConditions } = inputData;
    
    let prompt = `You are an expert sports analyst. Analyze the following ${sportType} match and provide a detailed prediction.

Event Details:
- Sport: ${sportType}
- Date: ${eventDate}
- Venue: ${venue || 'TBD'}
- Teams/Players: ${JSON.stringify(teams)}`;

    if (historicalData) {
      prompt += `\n- Historical Data: ${JSON.stringify(historicalData)}`;
    }

    if (weatherConditions) {
      prompt += `\n- Weather: ${JSON.stringify(weatherConditions)}`;
    }

    prompt += `

Please provide your prediction in the following JSON format:
{
  "prediction": {
    "winner": "team/player name",
    "score": "predicted score if applicable",
    "outcome": "detailed outcome prediction"
  },
  "confidenceScore": 85,
  "reasoning": "Detailed explanation of your analysis and reasoning",
  "keyFactors": ["factor1", "factor2", "factor3"]
}

Focus on:
1. Team/player form and recent performance
2. Head-to-head records
3. Venue advantages
4. Weather impact (if applicable)
5. Injuries or key player availability
6. Statistical analysis

Provide a confidence score between 0-100 and detailed reasoning for your prediction.`;

    return prompt;
  }
}

module.exports = AIModelInterface;