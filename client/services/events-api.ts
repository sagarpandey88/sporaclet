import { EventSummary, EventDetail, PaginatedResponse, ApiError } from '@/types/events';

/**
 * API configuration
 */
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

/**
 * Custom error class for API errors
 */
export class ApiClientError extends Error {
  constructor(
    message: string,
    public statusCode: number,
    public code: string,
    public details?: unknown
  ) {
    super(message);
    this.name = 'ApiClientError';
  }
}

/**
 * Fetch wrapper with error handling
 */
async function fetchWithErrorHandling<T>(
  url: string,
  options?: RequestInit
): Promise<T> {
  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
    });

    // Handle non-OK responses
    if (!response.ok) {
      const errorData: ApiError = await response.json();
      throw new ApiClientError(
        errorData.error.message,
        response.status,
        errorData.error.code,
        errorData.error.details
      );
    }

    return await response.json();
  } catch (error) {
    // Re-throw ApiClientError as-is
    if (error instanceof ApiClientError) {
      throw error;
    }

    // Handle network errors
    if (error instanceof TypeError) {
      throw new ApiClientError(
        'Network error: Unable to connect to API',
        0,
        'NETWORK_ERROR'
      );
    }

    // Handle other errors
    throw new ApiClientError(
      error instanceof Error ? error.message : 'An unexpected error occurred',
      500,
      'UNKNOWN_ERROR'
    );
  }
}

/**
 * Build query string from object
 */
function buildQueryString(params: Record<string, string | number | boolean | undefined>): string {
  const searchParams = new URLSearchParams();
  
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      searchParams.append(key, String(value));
    }
  });

  const queryString = searchParams.toString();
  return queryString ? `?${queryString}` : '';
}

/**
 * Events API Client
 */
export const eventsApi = {
  /**
   * Get list of upcoming events
   */
  async getUpcomingEvents(params?: {
    sport?: string;
    dateFrom?: string;
    dateTo?: string;
    league?: string;
    page?: number;
    perPage?: number;
  }): Promise<PaginatedResponse<EventSummary>> {
    const queryString = buildQueryString(params || {});
    const url = `${API_BASE_URL}/events${queryString}`;
    return fetchWithErrorHandling<PaginatedResponse<EventSummary>>(url);
  },

  /**
   * Get event by ID
   */
  async getEventById(eventId: string): Promise<EventDetail> {
    const url = `${API_BASE_URL}/events/${eventId}`;
    return fetchWithErrorHandling<EventDetail>(url);
  },

  /**
   * Search events
   */
  async searchEvents(query: string, params?: {
    sport?: string;
    page?: number;
    perPage?: number;
  }): Promise<PaginatedResponse<EventSummary>> {
    const queryString = buildQueryString({ q: query, ...params });
    const url = `${API_BASE_URL}/events/search${queryString}`;
    return fetchWithErrorHandling<PaginatedResponse<EventSummary>>(url);
  },
};

/**
 * Health API Client
 */
export const healthApi = {
  /**
   * Check API health status
   */
  async checkHealth(): Promise<{
    status: 'healthy' | 'unhealthy';
    timestamp: string;
    uptime: number;
    services: {
      database: { status: 'up' | 'down'; responseTime?: number };
      cache: { status: 'up' | 'down'; responseTime?: number };
      externalApi: { status: 'up' | 'down'; responseTime?: number };
    };
  }> {
    const url = `${API_BASE_URL}/health`;
    return fetchWithErrorHandling(url);
  },
};
