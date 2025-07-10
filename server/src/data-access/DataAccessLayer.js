/**
 * Abstract base class for data access operations
 * Defines the contract that all data access implementations must follow
 */
class DataAccessLayer {
  /**
   * Get all events with optional filtering
   * @param {Object} filters - Filter criteria
   * @param {Object} pagination - Pagination options
   * @returns {Promise<Array>} Array of events
   */
  async getAllEvents(filters = {}, pagination = {}) {
    throw new Error('getAllEvents method must be implemented');
  }

  /**
   * Get a single event by ID
   * @param {string} id - Event ID
   * @returns {Promise<Object|null>} Event object or null if not found
   */
  async getEventById(id) {
    throw new Error('getEventById method must be implemented');
  }

  /**
   * Search events by query string
   * @param {string} query - Search query
   * @param {Object} pagination - Pagination options
   * @returns {Promise<Array>} Array of matching events
   */
  async searchEvents(query, pagination = {}) {
    throw new Error('searchEvents method must be implemented');
  }

  /**
   * Get events by sport type
   * @param {string} sportType - Sport type to filter by
   * @param {Object} pagination - Pagination options
   * @returns {Promise<Array>} Array of events for the sport type
   */
  async getEventsBySport(sportType, pagination = {}) {
    throw new Error('getEventsBySport method must be implemented');
  }

  /**
   * Get all predictions with optional filtering
   * @param {Object} filters - Filter criteria
   * @param {Object} pagination - Pagination options
   * @returns {Promise<Array>} Array of predictions
   */
  async getAllPredictions(filters = {}, pagination = {}) {
    throw new Error('getAllPredictions method must be implemented');
  }

  /**
   * Get predictions by event ID
   * @param {string} eventId - Event ID
   * @returns {Promise<Array>} Array of predictions for the event
   */
  async getPredictionsByEventId(eventId) {
    throw new Error('getPredictionsByEventId method must be implemented');
  }

  /**
   * Create a new event
   * @param {Object} eventData - Event data
   * @returns {Promise<Object>} Created event
   */
  async createEvent(eventData) {
    throw new Error('createEvent method must be implemented');
  }

  /**
   * Create a new prediction
   * @param {Object} predictionData - Prediction data
   * @returns {Promise<Object>} Created prediction
   */
  async createPrediction(predictionData) {
    throw new Error('createPrediction method must be implemented');
  }

  /**
   * Update a prediction
   * @param {string} id - Prediction ID
   * @param {Object} updateData - Data to update
   * @returns {Promise<Object|null>} Updated prediction or null if not found
   */
  async updatePrediction(id, updateData) {
    throw new Error('updatePrediction method must be implemented');
  }
}

module.exports = DataAccessLayer;