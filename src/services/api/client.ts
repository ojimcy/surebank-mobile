/**
 * SureBank API Client
 * 
 * Axios-based HTTP client with automatic token management,
 * request/response interceptors, and error handling.
 * Ported from Capacitor app with React Native optimizations.
 */

import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse, AxiosError } from 'axios';
import NetInfo from '@react-native-community/netinfo';
import { storage, STORAGE_KEYS } from '@/services/storage/index';
import tokenManager from '@/services/auth/tokenManager';
import { ApiConfig, ApiErrorResponse, NetworkError } from './types';

// API configuration
const API_CONFIG: ApiConfig = {
  baseURL: process.env.EXPO_PUBLIC_API_BASE_URL || 'https://a5shket0i1.execute-api.us-east-1.amazonaws.com/v1',
  timeout: 30000, // 30 seconds
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
};

// Custom error class for network operations
export class ApiNetworkError extends Error implements NetworkError {
  public code: string;
  public status?: number;
  public response?: any;
  public isRetriable: boolean;

  constructor(
    message: string,
    code: string,
    status?: number,
    response?: any,
    isRetriable: boolean = false
  ) {
    super(message);
    this.name = 'ApiNetworkError';
    this.code = code;
    this.status = status;
    this.response = response;
    this.isRetriable = isRetriable;
  }
}

// Create separate axios instance for CSRF token fetching (to avoid infinite loops)
const tokenFetcher = axios.create({
  baseURL: API_CONFIG.baseURL,
  timeout: API_CONFIG.timeout,
  headers: API_CONFIG.headers,
});

// Main API client instance
const apiClient: AxiosInstance = axios.create(API_CONFIG);

// Network connectivity state
let isConnected = true;

// Initialize network state monitoring
NetInfo.addEventListener(state => {
  isConnected = state.isConnected ?? false;
});

// Request interceptor for adding authentication and CSRF tokens
apiClient.interceptors.request.use(
  async (config) => {
    // Check network connectivity
    if (!isConnected) {
      throw new ApiNetworkError(
        'No internet connection',
        'NETWORK_UNAVAILABLE',
        undefined,
        undefined,
        true
      );
    }

    try {
      // Get valid authentication token (with automatic refresh)
      const authToken = await tokenManager.getValidAccessToken();
      if (authToken) {
        config.headers.Authorization = `Bearer ${authToken}`;
      }

      // For protected methods, ensure we have CSRF tokens
      const protectedMethods = ['POST', 'PUT', 'PATCH', 'DELETE'];
      if (protectedMethods.includes(config.method?.toUpperCase() || '')) {
        let csrfToken = await storage.getItem(STORAGE_KEYS.CSRF_TOKEN);
        let csrfSecret = await storage.getItem(STORAGE_KEYS.CSRF_SECRET);

        // If we don't have CSRF tokens, fetch them
        if (!csrfToken || !csrfSecret) {
          try {
            const tokenResponse = await tokenFetcher.get('/users/me', {
              headers: {
                Authorization: authToken ? `Bearer ${authToken}` : undefined
              }
            });

            csrfToken = tokenResponse.headers['x-csrf-token'];
            csrfSecret = tokenResponse.headers['x-csrf-secret'];

            // Store CSRF tokens if received
            if (csrfToken && csrfSecret) {
              await storage.setItem(STORAGE_KEYS.CSRF_TOKEN, csrfToken);
              await storage.setItem(STORAGE_KEYS.CSRF_SECRET, csrfSecret);
            }
          } catch (error) {
            console.warn('Failed to fetch CSRF tokens:', error);
            // Continue without CSRF tokens - API might not require them
          }
        }

        // Add CSRF headers if available
        if (csrfToken && csrfSecret) {
          config.headers['X-CSRF-Token'] = csrfToken;
          config.headers['X-CSRF-Secret'] = csrfSecret;
        }
      }

      return config;
    } catch (error) {
      console.error('Request interceptor error:', error);
      return config; // Continue with request even if token retrieval fails
    }
  },
  (error) => {
    return Promise.reject(new ApiNetworkError(
      'Request configuration failed',
      'REQUEST_CONFIG_ERROR',
      undefined,
      error,
      false
    ));
  }
);

// Response interceptor for handling tokens and errors
apiClient.interceptors.response.use(
  async (response: AxiosResponse) => {
    try {
      // Extract and store CSRF tokens from response headers
      const csrfToken = response.headers['x-csrf-token'];
      const csrfSecret = response.headers['x-csrf-secret'];

      if (csrfToken) {
        await storage.setItem(STORAGE_KEYS.CSRF_TOKEN, csrfToken);
      }
      if (csrfSecret) {
        await storage.setItem(STORAGE_KEYS.CSRF_SECRET, csrfSecret);
      }

      return response;
    } catch (error) {
      console.warn('Failed to store CSRF tokens from response:', error);
      return response; // Continue even if token storage fails
    }
  },
  async (error: AxiosError) => {
    const originalRequest = error.config as any;

    // Handle 401 Unauthorized errors
    if (error.response?.status === 401 && originalRequest && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        // Let the token manager handle 401 errors
        await tokenManager.clearTokens();

        // Emit token expired event for auth context to handle
        console.log('Authentication expired - tokens cleared');

      } catch (storageError) {
        console.error('Failed to clear tokens on 401:', storageError);
      }

      return Promise.reject(new ApiNetworkError(
        'Authentication expired',
        'AUTH_EXPIRED',
        401,
        error.response?.data,
        false
      ));
    }

    // Handle different types of errors
    if (error.code === 'ECONNABORTED' || error.message.includes('timeout')) {
      return Promise.reject(new ApiNetworkError(
        'Request timeout',
        'TIMEOUT',
        error.response?.status,
        error.response?.data,
        true
      ));
    }

    if (error.code === 'NETWORK_ERROR' || !error.response) {
      return Promise.reject(new ApiNetworkError(
        'Network error - please check your connection',
        'NETWORK_ERROR',
        undefined,
        undefined,
        true
      ));
    }

    // Handle server errors (5xx)
    if (error.response?.status >= 500) {
      return Promise.reject(new ApiNetworkError(
        'Server error - please try again later',
        'SERVER_ERROR',
        error.response.status,
        error.response.data,
        true
      ));
    }

    // Handle client errors (4xx)
    if (error.response?.status >= 400 && error.response?.status < 500) {
      const errorMessage = (error.response.data as any)?.message ||
        (error.response.data as any)?.error?.message ||
        'Request failed';

      return Promise.reject(new ApiNetworkError(
        errorMessage,
        'CLIENT_ERROR',
        error.response.status,
        error.response.data,
        false
      ));
    }

    // Generic error fallback
    return Promise.reject(new ApiNetworkError(
      error.message || 'An unexpected error occurred',
      'UNKNOWN_ERROR',
      error.response?.status,
      error.response?.data,
      false
    ));
  }
);

// API client utility functions
export const apiUtils = {
  /**
   * Check if the API client is configured properly
   */
  isConfigured: (): boolean => {
    return !!API_CONFIG.baseURL;
  },

  /**
   * Get current network status
   */
  isOnline: (): boolean => {
    return isConnected;
  },

  /**
   * Update API base URL (useful for environment switching)
   */
  updateBaseURL: (newBaseURL: string): void => {
    apiClient.defaults.baseURL = newBaseURL;
    tokenFetcher.defaults.baseURL = newBaseURL;
  },

  /**
   * Add custom header to all requests
   */
  setHeader: (name: string, value: string): void => {
    apiClient.defaults.headers.common[name] = value;
  },

  /**
   * Remove custom header
   */
  removeHeader: (name: string): void => {
    delete apiClient.defaults.headers.common[name];
  },

  /**
   * Get current API configuration
   */
  getConfig: (): ApiConfig => {
    return {
      baseURL: apiClient.defaults.baseURL || API_CONFIG.baseURL,
      timeout: apiClient.defaults.timeout || API_CONFIG.timeout,
      headers: { ...apiClient.defaults.headers.common } as Record<string, string>,
    };
  },

  /**
   * Create request with retry logic
   */
  requestWithRetry: async <T>(
    requestFn: () => Promise<AxiosResponse<T>>,
    maxRetries: number = 3,
    delay: number = 1000
  ): Promise<AxiosResponse<T>> => {
    let lastError: Error;

    for (let i = 0; i <= maxRetries; i++) {
      try {
        return await requestFn();
      } catch (error) {
        lastError = error as Error;

        // Don't retry on client errors (4xx) except 408, 429
        if (error instanceof ApiNetworkError) {
          if (!error.isRetriable ||
            (error.status && error.status >= 400 && error.status < 500 &&
              error.status !== 408 && error.status !== 429)) {
            throw error;
          }
        }

        // Wait before retrying (exponential backoff)
        if (i < maxRetries) {
          await new Promise(resolve => setTimeout(resolve, delay * Math.pow(2, i)));
        }
      }
    }

    throw lastError!;
  },
};

// Export the configured API client
export { apiClient as default };
export { API_CONFIG };