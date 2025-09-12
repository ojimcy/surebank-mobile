/**
 * SureBank Authentication API
 * 
 * Authentication service methods ported from Capacitor app
 * with React Native optimizations and enhanced error handling.
 */

import apiClient, { ApiNetworkError, apiUtils } from './client';
import { storage, STORAGE_KEYS, storageUtils } from '@/services/storage';
import {
  LoginPayload,
  RegisterPayload,
  VerifyPayload,
  ResetPasswordPayload,
  VerifyResetCodePayload,
  NewPasswordPayload,
  LoginResponse,
  RegisterResponse,
  VerifyResponse,
  ResetPasswordResponse,
  User,
  TokenResponse,
  AuthError,
} from './types';

// Custom authentication error class
export class AuthenticationError extends Error implements AuthError {
  public type: AuthError['type'];
  public code: string;
  public retryAfter?: number;
  public details?: any;

  constructor(
    message: string,
    type: AuthError['type'] = 'UNKNOWN',
    code: string = 'AUTH_ERROR',
    retryAfter?: number,
    details?: any
  ) {
    super(message);
    this.name = 'AuthenticationError';
    this.type = type;
    this.code = code;
    this.retryAfter = retryAfter;
    this.details = details;
  }
}

// Authentication API service
export class AuthService {
  /**
   * Login with email/phone and password
   */
  async login(payload: LoginPayload): Promise<User> {
    try {
      const response = await apiUtils.requestWithRetry(
        () => apiClient.post<LoginResponse>('/auth/login', payload),
        2, // Max 2 retries for login
        1000 // 1 second delay
      );

      const { user, tokens } = response.data;

      // Store authentication tokens securely
      if (tokens.access.token) {
        await storage.multiSet([
          [STORAGE_KEYS.AUTH_TOKEN, tokens.access.token],
          [STORAGE_KEYS.REFRESH_TOKEN, tokens.refresh.token],
        ]);
      }

      // Store last login timestamp
      await storage.setItem(STORAGE_KEYS.LAST_LOGIN, new Date().toISOString());

      return user;
    } catch (error) {
      if (error instanceof ApiNetworkError) {
        // Map API errors to authentication errors
        switch (error.status) {
          case 401:
            throw new AuthenticationError(
              'Invalid email/phone or password',
              'INVALID_CREDENTIALS',
              'INVALID_LOGIN',
              undefined,
              error.response
            );
          case 423:
            throw new AuthenticationError(
              'Account temporarily locked due to multiple failed attempts',
              'ACCOUNT_LOCKED',
              'ACCOUNT_LOCKED',
              error.response?.lockoutUntil,
              error.response
            );
          case 429:
            throw new AuthenticationError(
              'Too many login attempts. Please try again later',
              'ACCOUNT_LOCKED',
              'RATE_LIMITED',
              error.response?.retryAfter || 300,
              error.response
            );
          default:
            if (!apiUtils.isOnline()) {
              throw new AuthenticationError(
                'Please check your internet connection and try again',
                'NETWORK_ERROR',
                'NO_CONNECTION'
              );
            }
            throw new AuthenticationError(
              error.message || 'Login failed. Please try again',
              'UNKNOWN',
              'LOGIN_FAILED',
              undefined,
              error.response
            );
        }
      }

      throw new AuthenticationError(
        'An unexpected error occurred during login',
        'UNKNOWN',
        'UNEXPECTED_ERROR',
        undefined,
        error
      );
    }
  }

  /**
   * Register a new user account
   */
  async register(payload: RegisterPayload): Promise<RegisterResponse> {
    try {
      const response = await apiUtils.requestWithRetry(
        () => apiClient.post<RegisterResponse>('/auth/register', payload),
        2,
        1000
      );

      return response.data;
    } catch (error) {
      if (error instanceof ApiNetworkError) {
        switch (error.status) {
          case 409:
            throw new AuthenticationError(
              'An account with this email or phone number already exists',
              'INVALID_CREDENTIALS',
              'ACCOUNT_EXISTS',
              undefined,
              error.response
            );
          case 422:
            throw new AuthenticationError(
              error.response?.message || 'Please check your information and try again',
              'INVALID_CREDENTIALS',
              'VALIDATION_ERROR',
              undefined,
              error.response
            );
          default:
            if (!apiUtils.isOnline()) {
              throw new AuthenticationError(
                'Please check your internet connection and try again',
                'NETWORK_ERROR',
                'NO_CONNECTION'
              );
            }
            throw new AuthenticationError(
              error.message || 'Registration failed. Please try again',
              'UNKNOWN',
              'REGISTRATION_FAILED',
              undefined,
              error.response
            );
        }
      }

      throw new AuthenticationError(
        'An unexpected error occurred during registration',
        'UNKNOWN',
        'UNEXPECTED_ERROR',
        undefined,
        error
      );
    }
  }

  /**
   * Verify account with OTP code
   */
  async verifyAccount(payload: VerifyPayload): Promise<User> {
    try {
      const response = await apiUtils.requestWithRetry(
        () => apiClient.post<VerifyResponse>('/auth/verify-email', { 
          otp: payload.code 
        }),
        2,
        1000
      );

      const { user, tokens } = response.data;

      // Store tokens if provided (for first-time verification)
      if (tokens?.access?.token) {
        await storage.multiSet([
          [STORAGE_KEYS.AUTH_TOKEN, tokens.access.token],
          [STORAGE_KEYS.REFRESH_TOKEN, tokens.refresh.token],
        ]);
      }

      return user;
    } catch (error) {
      if (error instanceof ApiNetworkError) {
        switch (error.status) {
          case 400:
          case 401:
            throw new AuthenticationError(
              'Invalid or expired verification code',
              'INVALID_CREDENTIALS',
              'INVALID_CODE',
              undefined,
              error.response
            );
          case 429:
            throw new AuthenticationError(
              'Too many verification attempts. Please try again later',
              'ACCOUNT_LOCKED',
              'RATE_LIMITED',
              error.response?.retryAfter || 300,
              error.response
            );
          default:
            if (!apiUtils.isOnline()) {
              throw new AuthenticationError(
                'Please check your internet connection and try again',
                'NETWORK_ERROR',
                'NO_CONNECTION'
              );
            }
            throw new AuthenticationError(
              error.message || 'Verification failed. Please try again',
              'UNKNOWN',
              'VERIFICATION_FAILED',
              undefined,
              error.response
            );
        }
      }

      throw new AuthenticationError(
        'An unexpected error occurred during verification',
        'UNKNOWN',
        'UNEXPECTED_ERROR',
        undefined,
        error
      );
    }
  }

  /**
   * Resend verification code
   */
  async resendVerification(identifier: string): Promise<{ success: boolean; message?: string }> {
    try {
      const response = await apiUtils.requestWithRetry(
        () => apiClient.post<{ success: boolean; message?: string }>(
          '/auth/send-verification-email',
          { email: identifier }
        ),
        2,
        1000
      );

      return response.data;
    } catch (error) {
      if (error instanceof ApiNetworkError) {
        if (error.status === 429) {
          throw new AuthenticationError(
            'Please wait before requesting another verification code',
            'ACCOUNT_LOCKED',
            'RATE_LIMITED',
            error.response?.retryAfter || 60
          );
        }
      }

      throw new AuthenticationError(
        'Failed to resend verification code. Please try again',
        'UNKNOWN',
        'RESEND_FAILED',
        undefined,
        error
      );
    }
  }

  /**
   * Get current authenticated user
   */
  async getCurrentUser(): Promise<User> {
    try {
      const response = await apiUtils.requestWithRetry(
        () => apiClient.get<User>('/users/me'),
        2,
        1000
      );

      return response.data;
    } catch (error) {
      if (error instanceof ApiNetworkError && error.status === 401) {
        // Token expired or invalid - clear stored tokens
        await storageUtils.clearAuthData();
        
        throw new AuthenticationError(
          'Session expired. Please log in again',
          'TOKEN_EXPIRED',
          'SESSION_EXPIRED'
        );
      }

      throw new AuthenticationError(
        'Failed to get user information',
        'UNKNOWN',
        'USER_FETCH_FAILED',
        undefined,
        error
      );
    }
  }

  /**
   * Request password reset
   */
  async requestPasswordReset(payload: ResetPasswordPayload): Promise<ResetPasswordResponse> {
    try {
      const response = await apiUtils.requestWithRetry(
        () => apiClient.post<ResetPasswordResponse>('/auth/forgot-password', payload),
        2,
        1000
      );

      return response.data;
    } catch (error) {
      if (error instanceof ApiNetworkError) {
        if (error.status === 404) {
          throw new AuthenticationError(
            'No account found with this email address',
            'INVALID_CREDENTIALS',
            'EMAIL_NOT_FOUND',
            undefined,
            error.response
          );
        }
        if (error.status === 429) {
          throw new AuthenticationError(
            'Too many password reset requests. Please try again later',
            'ACCOUNT_LOCKED',
            'RATE_LIMITED',
            error.response?.retryAfter || 900 // 15 minutes
          );
        }
      }

      throw new AuthenticationError(
        'Failed to request password reset. Please try again',
        'UNKNOWN',
        'PASSWORD_RESET_FAILED',
        undefined,
        error
      );
    }
  }

  /**
   * Verify password reset code
   */
  async verifyResetCode(payload: VerifyResetCodePayload): Promise<ResetPasswordResponse> {
    try {
      const response = await apiUtils.requestWithRetry(
        () => apiClient.post<ResetPasswordResponse>('/auth/verify-reset-code', payload),
        2,
        1000
      );

      return response.data;
    } catch (error) {
      if (error instanceof ApiNetworkError) {
        if (error.status === 400 || error.status === 401) {
          throw new AuthenticationError(
            'Invalid or expired reset code',
            'INVALID_CREDENTIALS',
            'INVALID_RESET_CODE'
          );
        }
      }

      throw new AuthenticationError(
        'Failed to verify reset code. Please try again',
        'UNKNOWN',
        'RESET_CODE_VERIFICATION_FAILED',
        undefined,
        error
      );
    }
  }

  /**
   * Reset password with new password and verified code
   */
  async resetPassword(payload: NewPasswordPayload): Promise<ResetPasswordResponse> {
    try {
      const response = await apiUtils.requestWithRetry(
        () => apiClient.post<ResetPasswordResponse>('/auth/reset-password', payload),
        2,
        1000
      );

      return response.data;
    } catch (error) {
      if (error instanceof ApiNetworkError) {
        if (error.status === 400 || error.status === 401) {
          throw new AuthenticationError(
            'Invalid or expired reset code',
            'INVALID_CREDENTIALS',
            'INVALID_RESET_CODE'
          );
        }
        if (error.status === 422) {
          throw new AuthenticationError(
            'Password does not meet security requirements',
            'INVALID_CREDENTIALS',
            'WEAK_PASSWORD',
            undefined,
            error.response
          );
        }
      }

      throw new AuthenticationError(
        'Failed to reset password. Please try again',
        'UNKNOWN',
        'PASSWORD_RESET_FAILED',
        undefined,
        error
      );
    }
  }

  /**
   * Logout and clear all authentication data
   */
  async logout(): Promise<void> {
    try {
      // Clear all authentication-related storage
      await storageUtils.clearAuthData();
      
      // Optionally notify the server (fire-and-forget)
      try {
        await apiClient.post('/auth/logout', {}, { timeout: 5000 });
      } catch (error) {
        // Ignore logout API errors - local cleanup is more important
        console.warn('Server logout failed (local cleanup successful):', error);
      }
    } catch (error) {
      console.error('Logout cleanup failed:', error);
      throw new AuthenticationError(
        'Failed to logout properly',
        'UNKNOWN',
        'LOGOUT_FAILED',
        undefined,
        error
      );
    }
  }

  /**
   * Check if user is authenticated (has valid token)
   */
  async isAuthenticated(): Promise<boolean> {
    try {
      const token = await storage.getItem(STORAGE_KEYS.AUTH_TOKEN);
      return !!token;
    } catch (error) {
      console.error('Failed to check authentication status:', error);
      return false;
    }
  }

  /**
   * Get stored authentication tokens
   */
  async getTokens(): Promise<TokenResponse | null> {
    try {
      const [accessToken, refreshToken] = await storage.multiGet([
        STORAGE_KEYS.AUTH_TOKEN,
        STORAGE_KEYS.REFRESH_TOKEN,
      ]);

      if (!accessToken[1] || !refreshToken[1]) {
        return null;
      }

      return {
        access: {
          token: accessToken[1],
          expires: '', // We don't store expiry info currently
        },
        refresh: {
          token: refreshToken[1],
          expires: '',
        },
      };
    } catch (error) {
      console.error('Failed to get stored tokens:', error);
      return null;
    }
  }
}

// Create and export singleton instance
const authService = new AuthService();
export default authService;