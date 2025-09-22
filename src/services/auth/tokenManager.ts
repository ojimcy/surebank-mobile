/**
 * SureBank JWT Token Manager
 * 
 * Handles JWT token lifecycle including storage, validation,
 * automatic refresh, and expiry management for secure authentication.
 */

import { jwtDecode } from 'jwt-decode';
import apiClient, { ApiNetworkError, apiUtils } from '@/services/api/client';
import { storage, STORAGE_KEYS } from '@/services/storage/index';
import { TokenResponse } from '@/services/api/types';

// JWT token payload interface
interface JwtPayload {
  sub: string; // User ID
  iat: number; // Issued at
  exp: number; // Expires at
  aud: string; // Audience
  iss: string; // Issuer
  type: 'access' | 'refresh';
  [key: string]: any;
}

// Token validation result
interface TokenValidation {
  isValid: boolean;
  isExpired: boolean;
  expiresAt?: Date;
  payload?: JwtPayload;
  error?: string;
}

// Token refresh result
interface TokenRefreshResult {
  success: boolean;
  tokens?: TokenResponse;
  error?: string;
  requiresLogin?: boolean;
}

// Token manager events
type TokenManagerEvent = 'tokenRefreshed' | 'tokenExpired' | 'refreshFailed' | 'loginRequired';
type TokenManagerEventHandler = (data?: any) => void;

export class TokenManager {
  private refreshPromise: Promise<TokenRefreshResult> | null = null;
  private eventHandlers: Map<TokenManagerEvent, Set<TokenManagerEventHandler>> = new Map();
  private refreshBuffer = 5 * 60 * 1000; // 5 minutes buffer before expiry

  constructor() {
    // Initialize event handler sets
    this.eventHandlers.set('tokenRefreshed', new Set());
    this.eventHandlers.set('tokenExpired', new Set());
    this.eventHandlers.set('refreshFailed', new Set());
    this.eventHandlers.set('loginRequired', new Set());
  }

  /**
   * Subscribe to token manager events
   */
  on(event: TokenManagerEvent, handler: TokenManagerEventHandler): void {
    const handlers = this.eventHandlers.get(event);
    if (handlers) {
      handlers.add(handler);
    }
  }

  /**
   * Unsubscribe from token manager events
   */
  off(event: TokenManagerEvent, handler: TokenManagerEventHandler): void {
    const handlers = this.eventHandlers.get(event);
    if (handlers) {
      handlers.delete(handler);
    }
  }

  /**
   * Emit token manager event
   */
  private emit(event: TokenManagerEvent, data?: any): void {
    const handlers = this.eventHandlers.get(event);
    if (handlers) {
      handlers.forEach(handler => {
        try {
          handler(data);
        } catch (error) {
          console.error(`Error in token manager event handler for ${event}:`, error);
        }
      });
    }
  }

  /**
   * Validate a JWT token
   */
  validateToken(token: string): TokenValidation {
    try {
      if (!token || typeof token !== 'string') {
        return {
          isValid: false,
          isExpired: false,
          error: 'Invalid token format',
        };
      }

      // Decode JWT without verification (we trust our API)
      const payload = jwtDecode<JwtPayload>(token);
      const now = Math.floor(Date.now() / 1000);
      const expiresAt = new Date(payload.exp * 1000);
      const isExpired = payload.exp <= now;

      return {
        isValid: !isExpired,
        isExpired,
        expiresAt,
        payload,
      };
    } catch (error) {
      return {
        isValid: false,
        isExpired: false,
        error: `Token decode failed: ${error}`,
      };
    }
  }

  /**
   * Check if token needs refresh (within refresh buffer time)
   */
  needsRefresh(token: string): boolean {
    const validation = this.validateToken(token);
    if (!validation.isValid || !validation.expiresAt) {
      return true;
    }

    const now = Date.now();
    const timeUntilExpiry = validation.expiresAt.getTime() - now;

    return timeUntilExpiry <= this.refreshBuffer;
  }

  /**
   * Get stored tokens with validation
   */
  async getTokens(): Promise<{
    accessToken: string | null;
    refreshToken: string | null;
    isAccessTokenValid: boolean;
    needsRefresh: boolean;
  }> {
    try {
      const [accessTokenResult, refreshTokenResult] = await storage.multiGet([
        STORAGE_KEYS.AUTH_TOKEN,
        STORAGE_KEYS.REFRESH_TOKEN,
      ]);

      const accessToken = accessTokenResult[1];
      const refreshToken = refreshTokenResult[1];

      if (!accessToken) {
        return {
          accessToken: null,
          refreshToken: null,
          isAccessTokenValid: false,
          needsRefresh: false,
        };
      }

      const validation = this.validateToken(accessToken);
      const needsRefresh = this.needsRefresh(accessToken);

      return {
        accessToken,
        refreshToken,
        isAccessTokenValid: validation.isValid,
        needsRefresh,
      };
    } catch (error) {
      console.error('Failed to get stored tokens:', error);
      return {
        accessToken: null,
        refreshToken: null,
        isAccessTokenValid: false,
        needsRefresh: false,
      };
    }
  }

  /**
   * Store new tokens securely
   */
  async storeTokens(tokens: TokenResponse): Promise<void> {
    try {
      await storage.multiSet([
        [STORAGE_KEYS.AUTH_TOKEN, tokens.access.token],
        [STORAGE_KEYS.REFRESH_TOKEN, tokens.refresh.token],
      ]);

      // Update last login timestamp
      await storage.setItem(STORAGE_KEYS.LAST_LOGIN, new Date().toISOString());

      console.log('Tokens stored successfully');
    } catch (error) {
      console.error('Failed to store tokens:', error);
      throw new Error('Token storage failed');
    }
  }

  /**
   * Refresh access token using refresh token
   */
  async refreshTokens(): Promise<TokenRefreshResult> {
    // If refresh is already in progress, return the existing promise
    if (this.refreshPromise) {
      return this.refreshPromise;
    }

    this.refreshPromise = this.performTokenRefresh();

    try {
      const result = await this.refreshPromise;
      return result;
    } finally {
      this.refreshPromise = null;
    }
  }

  /**
   * Internal token refresh implementation
   */
  private async performTokenRefresh(): Promise<TokenRefreshResult> {
    try {
      const refreshToken = await storage.getItem(STORAGE_KEYS.REFRESH_TOKEN);

      if (!refreshToken) {
        this.emit('loginRequired');
        return {
          success: false,
          error: 'No refresh token available',
          requiresLogin: true,
        };
      }

      // Validate refresh token
      const refreshValidation = this.validateToken(refreshToken);
      if (!refreshValidation.isValid) {
        console.log('Refresh token expired or invalid');
        await this.clearTokens();
        this.emit('loginRequired');
        return {
          success: false,
          error: 'Refresh token expired',
          requiresLogin: true,
        };
      }

      // Make refresh request
      console.log('[TokenManager] Attempting to refresh token...');

      // Try different payload formats that the API might expect
      let response;
      try {
        // First try with refresh_token (common format)
        response = await apiClient.post<TokenResponse>('/auth/refresh', {
          refresh_token: refreshToken,
        });
      } catch (firstError: any) {
        // Check if it's a 401 which means refresh token is invalid
        if (firstError?.response?.status === 401) {
          console.log('[TokenManager] Refresh token is invalid (401)');
          throw firstError;
        }

        console.log('[TokenManager] First format failed, trying refreshToken format...');
        // If that fails for other reasons, try with refreshToken
        response = await apiClient.post<TokenResponse>('/auth/refresh', {
          refreshToken: refreshToken,
        });
      }

      const newTokens = response.data;
      console.log('Token refresh response received');

      // Store new tokens
      await this.storeTokens(newTokens);

      // Emit success event
      this.emit('tokenRefreshed', newTokens);

      console.log('Tokens refreshed successfully');
      return {
        success: true,
        tokens: newTokens,
      };

    } catch (error) {
      console.error('Token refresh failed:', error);

      // Log more details about the error
      if (error instanceof ApiNetworkError) {
        console.error('API Error Details:', {
          status: error.status,
          code: error.code,
          message: error.message,
          response: error.response,
        });

        switch (error.status) {
          case 401:
          case 403:
            // Refresh token invalid or expired
            console.log('Refresh token is invalid or expired, clearing tokens');
            await this.clearTokens();
            this.emit('loginRequired');
            return {
              success: false,
              error: 'Authentication expired',
              requiresLogin: true,
            };

          case 429:
            // Rate limited
            console.warn('Rate limited during token refresh');
            this.emit('refreshFailed', { retryAfter: error.response?.retryAfter });
            return {
              success: false,
              error: 'Too many refresh attempts',
            };

          default:
            // Network or server error
            console.error(`Network/server error during refresh: ${error.status}`);
            this.emit('refreshFailed', { error });
            return {
              success: false,
              error: `Network error during token refresh (${error.status})`,
            };
        }
      }

      // Log raw error for debugging
      console.error('Unknown error during token refresh:', {
        name: (error as any)?.name,
        message: (error as any)?.message,
        stack: (error as any)?.stack,
      });

      this.emit('refreshFailed', { error });
      return {
        success: false,
        error: 'Token refresh failed',
      };
    }
  }

  /**
   * Get valid access token (with automatic refresh if needed)
   */
  async getValidAccessToken(): Promise<string | null> {
    try {
      const { accessToken, isAccessTokenValid, needsRefresh } = await this.getTokens();

      if (!accessToken) {
        return null;
      }

      if (isAccessTokenValid && !needsRefresh) {
        return accessToken;
      }

      // Token needs refresh
      console.log('[TokenManager] Token needs refresh, attempting to refresh...');
      const refreshResult = await this.refreshTokens();

      if (refreshResult.success && refreshResult.tokens) {
        return refreshResult.tokens.access.token;
      }

      // Refresh failed - don't immediately clear tokens, let the error propagate
      console.log('[TokenManager] Token refresh failed, returning null');
      return null;

    } catch (error) {
      console.error('[TokenManager] Failed to get valid access token:', error);
      // Don't clear tokens here, let the caller handle the error
      return null;
    }
  }

  /**
   * Clear all stored tokens
   */
  async clearTokens(): Promise<void> {
    try {
      await storage.multiRemove([
        STORAGE_KEYS.AUTH_TOKEN,
        STORAGE_KEYS.REFRESH_TOKEN,
        STORAGE_KEYS.CSRF_TOKEN,
        STORAGE_KEYS.CSRF_SECRET,
      ]);

      console.log('All tokens cleared');
    } catch (error) {
      console.error('Failed to clear tokens:', error);
      throw new Error('Token cleanup failed');
    }
  }

  /**
   * Check if user has valid authentication
   */
  async isAuthenticated(): Promise<boolean> {
    const { accessToken, refreshToken } = await this.getTokens();

    if (!accessToken && !refreshToken) {
      return false;
    }

    // If we have an access token, check if it's valid or can be refreshed
    if (accessToken) {
      const validation = this.validateToken(accessToken);
      if (validation.isValid) {
        return true;
      }
    }

    // Try to refresh tokens
    if (refreshToken) {
      const refreshValidation = this.validateToken(refreshToken);
      if (refreshValidation.isValid) {
        // Don't actually refresh here, just confirm we can
        return true;
      }
    }

    return false;
  }

  /**
   * Get token expiry information
   */
  async getTokenInfo(): Promise<{
    accessTokenExpiry: Date | null;
    refreshTokenExpiry: Date | null;
    isAccessTokenValid: boolean;
    isRefreshTokenValid: boolean;
    timeUntilExpiry: number | null;
  }> {
    const { accessToken, refreshToken } = await this.getTokens();

    const accessValidation = accessToken ? this.validateToken(accessToken) : null;
    const refreshValidation = refreshToken ? this.validateToken(refreshToken) : null;

    const timeUntilExpiry = accessValidation?.expiresAt
      ? accessValidation.expiresAt.getTime() - Date.now()
      : null;

    return {
      accessTokenExpiry: accessValidation?.expiresAt || null,
      refreshTokenExpiry: refreshValidation?.expiresAt || null,
      isAccessTokenValid: accessValidation?.isValid || false,
      isRefreshTokenValid: refreshValidation?.isValid || false,
      timeUntilExpiry,
    };
  }

  /**
   * Set refresh buffer time (time before expiry to trigger refresh)
   */
  setRefreshBuffer(bufferMs: number): void {
    this.refreshBuffer = Math.max(0, bufferMs);
  }

  /**
   * Get current refresh buffer time
   */
  getRefreshBuffer(): number {
    return this.refreshBuffer;
  }
}

// Create and export singleton instance
const tokenManager = new TokenManager();
export default tokenManager;