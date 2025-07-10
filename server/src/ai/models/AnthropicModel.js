const { ChatAnthropic } = require('@langchain/anthropic');
const AIModelInterface = require('../interfaces/AIModelInterface');

/**
 * Anthropic Claude model implementation using Langchain
 * Supports Claude-3 Sonnet, Haiku, and Opus models
 */
class AnthropicModel extends AIModelInterface {
  constructor(config = {}) {
    super({
      ...config,
      provider: 'anthropic',
      modelName: config.modelName || 'claude-3-sonnet-20240229'
    });

    if (!config.apiKey) {
      throw new Error('Anthropic API key is required');
    }

    // Initialize Langchain Anthropic model
    this.model = new ChatAnthropic({
      anthropicApiKey: config.apiKey,
      modelName: this.modelName,
      temperature: config.temperature || 0.7,
      maxTokens: config.maxTokens || 1000,
      timeout: config.timeout || 30000
    });
  }

  /**
   * Generate sports prediction using Anthropic Claude
   * @param {Object} inputData - Sports event data
   * @param {Object} options - Additional options
   * @returns {Promise<Object>} Prediction result
   */
  async generatePrediction(inputData, options = {}) {
    const startTime = Date.now();
    
    try {
      // Validate input data
      this.validateInput(inputData);

      // Format prompt specifically for Claude
      const prompt = this.formatClaudePrompt(inputData);
      
      // Generate prediction using Langchain
      const response = await this.model.invoke([
        {
          role: 'user',
          content: prompt
        }
      ]);

      const processingTime = Date.now() - startTime;
      const tokensUsed = this.estimateTokens(prompt + response.content);

      // Parse Claude response
      let predictionData;
      try {
        // Claude often provides well-structured JSON responses
        const jsonMatch = response.content.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          predictionData = JSON.parse(jsonMatch[0]);
        } else {
          throw new Error('No JSON found in response');
        }
      } catch (parseError) {
        // Fallback: create structured response from text
        predictionData = this.parseClaudeResponse(response.content);
      }

      // Validate prediction structure
      this.validatePrediction(predictionData);

      return {
        prediction: predictionData.prediction,
        confidenceScore: predictionData.confidenceScore,
        reasoning: predictionData.reasoning,
        keyFactors: predictionData.keyFactors || [],
        metadata: {
          model: this.modelName,
          provider: this.provider,
          processingTime,
          tokensUsed,
          rawResponse: response.content
        }
      };

    } catch (error) {
      const processingTime = Date.now() - startTime;
      
      throw new Error(`Anthropic prediction failed: ${error.message}`, {
        cause: error,
        metadata: {
          model: this.modelName,
          provider: this.provider,
          processingTime,
          inputData
        }
      });
    }
  }

  /**
   * Format prompt specifically optimized for Claude
   * @param {Object} inputData - Sports event data
   * @returns {string} Claude-optimized prompt
   */
  formatClaudePrompt(inputData) {
    const { sportType, teams, eventDate, venue, historicalData, weatherConditions } = inputData;
    
    let prompt = `I need you to analyze a ${sportType} match and provide a detailed prediction. Please be thorough and analytical.

<event_details>
Sport: ${sportType}
Date: ${eventDate}
Venue: ${venue || 'TBD'}
Teams/Players: ${JSON.stringify(teams, null, 2)}`;

    if (historicalData) {
      prompt += `\nHistorical Data: ${JSON.stringify(historicalData, null, 2)}`;
    }

    if (weatherConditions) {
      prompt += `\nWeather Conditions: ${JSON.stringify(weatherConditions, null, 2)}`;
    }

    prompt += `
</event_details>

Please analyze this match considering:
1. Recent form and performance trends
2. Head-to-head historical records
3. Home/away advantages
4. Weather impact (if outdoor sport)
5. Key player availability and injuries
6. Statistical patterns and trends

Provide your analysis in this exact JSON format:

{
  "prediction": {
    "winner": "predicted winner name",
    "score": "predicted score (if applicable)",
    "outcome": "detailed outcome description"
  },
  "confidenceScore": 85,
  "reasoning": "Comprehensive explanation of your analysis, including key factors that influenced your prediction",
  "keyFactors": ["most important factor", "second factor", "third factor"]
}

Be precise with your confidence score (0-100) and provide detailed reasoning that demonstrates your analytical process.`;

    return prompt;
  }

  /**
   * Parse Claude response when JSON parsing fails
   * @param {string} text - Claude response text
   * @returns {Object} Structured prediction data
   */
  parseClaudeResponse(text) {
    // Claude typically provides more structured responses
    const lines = text.split('\n');
    
    // Extract confidence score
    const confidenceMatch = text.match(/confidence[:\s]*(\d+)/i);
    const confidenceScore = confidenceMatch ? parseInt(confidenceMatch[1]) : 60;

    // Extract winner
    const winnerMatch = text.match(/winner[:\s]*([^\n]+)/i) || 
                       text.match(/predict[:\s]*([^\n]+)/i);
    const winner = winnerMatch ? winnerMatch[1].trim() : 'Analysis provided';

    // Extract reasoning (usually more detailed in Claude responses)
    const reasoningStart = text.toLowerCase().indexOf('reasoning') || 
                          text.toLowerCase().indexOf('analysis');
    const reasoning = reasoningStart > -1 ? 
                     text.substring(reasoningStart, reasoningStart + 500) : 
                     text.substring(0, 300);

    return {
      prediction: {
        winner,
        outcome: reasoning.substring(0, 200) + '...'
      },
      confidenceScore,
      reasoning: reasoning,
      keyFactors: ['Statistical analysis', 'Form assessment', 'Historical patterns']
    };
  }

  /**
   * Validate prediction structure (same as OpenAI but with Claude-specific checks)
   * @param {Object} prediction - Prediction data to validate
   */
  validatePrediction(prediction) {
    if (!prediction.prediction) {
      throw new Error('Prediction object is required');
    }
    
    if (typeof prediction.confidenceScore !== 'number' || 
        prediction.confidenceScore < 0 || 
        prediction.confidenceScore > 100) {
      throw new Error('Confidence score must be a number between 0-100');
    }
    
    if (!prediction.reasoning || prediction.reasoning.length < 10) {
      throw new Error('Detailed reasoning is required');
    }
  }

  /**
   * Get Anthropic-specific capabilities
   * @returns {Array} List of capabilities
   */
  getCapabilities() {
    const baseCapabilities = super.getCapabilities();
    return [
      ...baseCapabilities,
      'detailed_reasoning',
      'multi_factor_analysis',
      'contextual_understanding',
      'nuanced_predictions',
      'ethical_analysis'
    ];
  }
}

module.exports = AnthropicModel;