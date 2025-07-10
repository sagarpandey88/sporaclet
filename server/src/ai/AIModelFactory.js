const OpenAIModel = require('./models/OpenAIModel');
const AnthropicModel = require('./models/AnthropicModel');

/**
 * Factory class for creating AI model instances
 * Supports dependency injection and easy model switching
 */
class AIModelFactory {
  constructor() {
    this.models = new Map();
    this.defaultProvider = 'openai';
  }

  /**
   * Register an AI model implementation
   * @param {string} provider - Provider name (openai, anthropic, etc.)
   * @param {Class} modelClass - Model class constructor
   */
  registerModel(provider, modelClass) {
    this.models.set(provider.toLowerCase(), modelClass);
  }

  /**
   * Create an AI model instance
   * @param {string} provider - AI provider name
   * @param {Object} config - Model configuration
   * @returns {AIModelInterface} AI model instance
   */
  createModel(provider = null, config = {}) {
    const providerName = (provider || process.env.AI_MODEL_PROVIDER || this.defaultProvider).toLowerCase();
    
    if (!this.models.has(providerName)) {
      throw new Error(`Unsupported AI provider: ${providerName}. Available providers: ${Array.from(this.models.keys()).join(', ')}`);
    }

    const ModelClass = this.models.get(providerName);
    
    // Merge environment config with provided config
    const modelConfig = this.getProviderConfig(providerName, config);
    
    return new ModelClass(modelConfig);
  }

  /**
   * Get configuration for a specific provider
   * @param {string} provider - Provider name
   * @param {Object} overrides - Configuration overrides
   * @returns {Object} Complete configuration
   */
  getProviderConfig(provider, overrides = {}) {
    const baseConfig = {
      temperature: parseFloat(process.env.AI_TEMPERATURE) || 0.7,
      maxTokens: parseInt(process.env.AI_MAX_TOKENS) || 1000,
      timeout: 30000,
      ...overrides
    };

    switch (provider) {
      case 'openai':
        return {
          ...baseConfig,
          apiKey: process.env.OPENAI_API_KEY,
          modelName: process.env.AI_MODEL_NAME || 'gpt-3.5-turbo'
        };
      
      case 'anthropic':
        return {
          ...baseConfig,
          apiKey: process.env.ANTHROPIC_API_KEY,
          modelName: process.env.AI_MODEL_NAME || 'claude-3-sonnet-20240229'
        };
      
      default:
        throw new Error(`No configuration available for provider: ${provider}`);
    }
  }

  /**
   * Get list of available providers
   * @returns {Array} List of registered providers
   */
  getAvailableProviders() {
    return Array.from(this.models.keys());
  }

  /**
   * Check if a provider is available and properly configured
   * @param {string} provider - Provider name
   * @returns {boolean} True if provider is available
   */
  isProviderAvailable(provider) {
    try {
      const config = this.getProviderConfig(provider);
      return config.apiKey && config.apiKey.length > 0;
    } catch (error) {
      return false;
    }
  }

  /**
   * Set default provider
   * @param {string} provider - Provider name
   */
  setDefaultProvider(provider) {
    if (!this.models.has(provider.toLowerCase())) {
      throw new Error(`Cannot set default provider to unsupported provider: ${provider}`);
    }
    this.defaultProvider = provider.toLowerCase();
  }
}

// Create singleton instance and register default models
const factory = new AIModelFactory();
factory.registerModel('openai', OpenAIModel);
factory.registerModel('anthropic', AnthropicModel);

module.exports = factory;