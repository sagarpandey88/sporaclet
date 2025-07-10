const { ChatOpenAI } = require('@langchain/openai');
const AIModelInterface = require('../interfaces/AIModelInterface');

/**
 * OpenAI model implementation using Langchain
 * Supports GPT-3.5-turbo, GPT-4, and other OpenAI models
 */
class OpenAIModel extends AIModelInterface {
  constructor(config = {}) {
    super({
      ...config,
      provider: 'openai',
      modelName: config.modelName || 'gpt-3.5-turbo'
    });

    if (!config.apiKey) {
      throw new Error('OpenAI API key is required');
    }

    // Initialize Langchain OpenAI model
    this.model = new ChatOpenAI({
      openAIApiKey: config.apiKey,
      modelName: this.modelName,
      temperature: config.temperature || 0.7,
      maxTokens: config.maxTokens || 1000,
      timeout: config.timeout || 30000
    });
  }

  /**
   * Generate sports prediction using OpenAI model
   * @param {Object} inputData - Sports event data
   * @param {Object} options - Additional options
   * @returns {Promise<Object>} Prediction result
   */
  async generatePrediction(inputData, options = {}) {
    const startTime = Date.now();
    
    try {
      // Validate input data
      this.validateInput(inputData);

      // Format prompt for the AI model
      const prompt = this.formatPrompt(inputData);
      
      // Generate prediction using Langchain
      const response = await this.model.invoke([
        {
          role: 'system',
          content: 'You are an expert sports analyst with deep knowledge of statistics, team performance, and predictive modeling.'
        },
        {
          role: 'user',
          content: prompt
        }
      ]);

      const processingTime = Date.now() - startTime;
      const tokensUsed = this.estimateTokens(prompt + response.content);

      // Parse AI response
      let predictionData;
      try {
        // Try to extract JSON from response
        const jsonMatch = response.content.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          predictionData = JSON.parse(jsonMatch[0]);
        } else {
          throw new Error('No JSON found in response');
        }
      } catch (parseError) {
        // Fallback: create structured response from text
        predictionData = this.parseTextResponse(response.content);
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
      
      throw new Error(`OpenAI prediction failed: ${error.message}`, {
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
   * Parse text response when JSON parsing fails
   * @param {string} text - AI response text
   * @returns {Object} Structured prediction data
   */
  parseTextResponse(text) {
    // Extract confidence score
    const confidenceMatch = text.match(/confidence[:\s]*(\d+)/i);
    const confidenceScore = confidenceMatch ? parseInt(confidenceMatch[1]) : 50;

    // Extract winner/prediction
    const winnerMatch = text.match(/winner[:\s]*([^\n]+)/i) || 
                       text.match(/predict[:\s]*([^\n]+)/i);
    const winner = winnerMatch ? winnerMatch[1].trim() : 'Unknown';

    return {
      prediction: {
        winner,
        outcome: text.substring(0, 200) + '...'
      },
      confidenceScore,
      reasoning: text,
      keyFactors: ['AI analysis', 'Statistical modeling']
    };
  }

  /**
   * Validate prediction structure
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
    
    if (!prediction.reasoning) {
      throw new Error('Reasoning is required');
    }
  }

  /**
   * Get OpenAI-specific capabilities
   * @returns {Array} List of capabilities
   */
  getCapabilities() {
    const baseCapabilities = super.getCapabilities();
    return [
      ...baseCapabilities,
      'multi_sport_analysis',
      'contextual_reasoning',
      'statistical_analysis',
      'weather_impact_analysis'
    ];
  }
}

module.exports = OpenAIModel;