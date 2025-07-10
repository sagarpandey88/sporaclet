const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  pagination?: {
    limit: number;
    offset: number;
    total: number;
  };
}

interface EventFilters {
  sport_type?: string;
  league?: string;
  tournament?: string;
  status?: string;
  limit?: number;
  offset?: number;
}

interface PredictionFilters {
  confidence_min?: number;
  event_id?: string;
  limit?: number;
  offset?: number;
}

class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string = API_BASE_URL) {
    this.baseUrl = baseUrl;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    try {
      const url = `${this.baseUrl}${endpoint}`;
      const response = await fetch(url, {
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
        ...options,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || `HTTP error! status: ${response.status}`);
      }

      return data;
    } catch (error) {
      console.error(`API request failed for ${endpoint}:`, error);
      throw error;
    }
  }

  // Events API methods
  async getEvents(filters: EventFilters = {}): Promise<ApiResponse<any[]>> {
    const queryParams = new URLSearchParams();
    
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        queryParams.append(key, value.toString());
      }
    });

    const queryString = queryParams.toString();
    const endpoint = `/events${queryString ? `?${queryString}` : ''}`;
    
    return this.request<any[]>(endpoint);
  }

  async getEventById(id: string): Promise<ApiResponse<any>> {
    return this.request<any>(`/events/${id}`);
  }

  async searchEvents(query: string, pagination: { limit?: number; offset?: number } = {}): Promise<ApiResponse<any[]>> {
    const queryParams = new URLSearchParams({ q: query });
    
    if (pagination.limit) queryParams.append('limit', pagination.limit.toString());
    if (pagination.offset) queryParams.append('offset', pagination.offset.toString());

    return this.request<any[]>(`/events/search?${queryParams.toString()}`);
  }

  async getEventsBySport(sportType: string, pagination: { limit?: number; offset?: number } = {}): Promise<ApiResponse<any[]>> {
    const queryParams = new URLSearchParams();
    
    if (pagination.limit) queryParams.append('limit', pagination.limit.toString());
    if (pagination.offset) queryParams.append('offset', pagination.offset.toString());

    const queryString = queryParams.toString();
    const endpoint = `/events/sport/${sportType}${queryString ? `?${queryString}` : ''}`;
    
    return this.request<any[]>(endpoint);
  }

  async createEvent(eventData: any): Promise<ApiResponse<any>> {
    return this.request<any>('/events', {
      method: 'POST',
      body: JSON.stringify(eventData),
    });
  }

  // Predictions API methods
  async getPredictions(filters: PredictionFilters = {}): Promise<ApiResponse<any[]>> {
    const queryParams = new URLSearchParams();
    
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        queryParams.append(key, value.toString());
      }
    });

    const queryString = queryParams.toString();
    const endpoint = `/predictions${queryString ? `?${queryString}` : ''}`;
    
    return this.request<any[]>(endpoint);
  }

  async getPredictionsByEventId(eventId: string): Promise<ApiResponse<any[]>> {
    return this.request<any[]>(`/predictions/event/${eventId}`);
  }

  async createPrediction(predictionData: any): Promise<ApiResponse<any>> {
    return this.request<any>('/predictions', {
      method: 'POST',
      body: JSON.stringify(predictionData),
    });
  }

  async updatePrediction(id: string, updateData: { outcome: string; accuracy?: number }): Promise<ApiResponse<any>> {
    return this.request<any>(`/predictions/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(updateData),
    });
  }

  // Utility methods
  async getHealthStatus(): Promise<ApiResponse<any>> {
    return this.request<any>('/health');
  }

  async getApiInfo(): Promise<ApiResponse<any>> {
    return this.request<any>('/');
  }
}

// Create singleton instance
export const apiClient = new ApiClient();

// Export individual methods for convenience
export const {
  getEvents,
  getEventById,
  searchEvents,
  getEventsBySport,
  createEvent,
  getPredictions,
  getPredictionsByEventId,
  createPrediction,
  updatePrediction,
  getHealthStatus,
  getApiInfo,
} = apiClient;

// Export types
export type { ApiResponse, EventFilters, PredictionFilters };