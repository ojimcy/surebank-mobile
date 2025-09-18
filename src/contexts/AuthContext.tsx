/**
 * SureBank Authentication Context
 * 
 * Provides centralized authentication state management with
 * user state, token management, and session handling.
 */

import React, { createContext, useContext, useEffect, useReducer, useCallback, ReactNode } from 'react';
import tokenManager from '@/services/auth/tokenManager';
import authService, { AuthenticationError } from '@/services/api/auth';
import { storage, STORAGE_KEYS } from '@/services/storage/index';
import { User, AuthState, LoginPayload, RegisterPayload } from '@/services/api/types';

interface AuthContextValue extends AuthState {
  // Authentication actions
  login: (payload: LoginPayload) => Promise<void>;
  register: (payload: RegisterPayload) => Promise<{ success: boolean; identifier: string; message?: string }>;
  logout: () => Promise<void>;
  
  // User management
  refreshUser: () => Promise<void>;
  clearError: () => void;
  
  // Authentication status
  checkAuthStatus: () => Promise<void>;
  
  // Error state
  error: string | null;
  errorCode: string | null;
}

// Authentication state
interface AuthStateExtended extends AuthState {
  error: string | null;
  errorCode: string | null;
}

// Action types for auth state management
type AuthAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_USER'; payload: User | null }
  | { type: 'SET_AUTHENTICATED'; payload: boolean }
  | { type: 'SET_TOKENS'; payload: AuthState['tokens'] }
  | { type: 'SET_LAST_LOGIN'; payload: string | null }
  | { type: 'SET_REMEMBER_ME'; payload: boolean }
  | { type: 'SET_ERROR'; payload: { message: string; code: string } }
  | { type: 'CLEAR_ERROR' }
  | { type: 'RESET_AUTH' };

// Initial authentication state
const initialState: AuthStateExtended = {
  user: null,
  isAuthenticated: false,
  isLoading: true,
  tokens: null,
  lastLogin: null,
  rememberMe: false,
  error: null,
  errorCode: null,
};

// Authentication state reducer
function authReducer(state: AuthStateExtended, action: AuthAction): AuthStateExtended {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
      
    case 'SET_USER':
      return { 
        ...state, 
        user: action.payload,
        isAuthenticated: !!action.payload,
        error: null,
        errorCode: null,
      };
      
    case 'SET_AUTHENTICATED':
      return { ...state, isAuthenticated: action.payload };
      
    case 'SET_TOKENS':
      return { ...state, tokens: action.payload };
      
    case 'SET_LAST_LOGIN':
      return { ...state, lastLogin: action.payload };
      
    case 'SET_REMEMBER_ME':
      return { ...state, rememberMe: action.payload };
      
    case 'SET_ERROR':
      return { 
        ...state, 
        error: action.payload.message,
        errorCode: action.payload.code,
        isLoading: false,
      };
      
    case 'CLEAR_ERROR':
      return { ...state, error: null, errorCode: null };
      
    case 'RESET_AUTH':
      return { 
        ...initialState, 
        isLoading: false,
        rememberMe: state.rememberMe, // Preserve remember me setting
      };
      
    default:
      return state;
  }
}

// Create the authentication context
const AuthContext = createContext<AuthContextValue | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // Clear error helper
  const clearError = useCallback(() => {
    dispatch({ type: 'CLEAR_ERROR' });
  }, []);

  // Set error helper
  const setError = useCallback((error: unknown) => {
    if (error instanceof AuthenticationError) {
      dispatch({ 
        type: 'SET_ERROR', 
        payload: { message: error.message, code: error.code } 
      });
    } else if (error instanceof Error) {
      dispatch({ 
        type: 'SET_ERROR', 
        payload: { message: error.message, code: 'UNKNOWN_ERROR' } 
      });
    } else {
      dispatch({ 
        type: 'SET_ERROR', 
        payload: { message: 'An unexpected error occurred', code: 'UNKNOWN_ERROR' } 
      });
    }
  }, []);

  // Load stored authentication data on app start
  const loadStoredAuthData = useCallback(async () => {
    console.log('[AuthContext] Loading stored auth data...');

    // Set a timeout to prevent infinite loading
    const timeoutId = setTimeout(() => {
      console.warn('[AuthContext] Auth initialization timed out, resetting auth state');
      dispatch({ type: 'RESET_AUTH' });
    }, 5000); // 5 second timeout

    try {
      dispatch({ type: 'SET_LOADING', payload: true });

      // Check if user has valid authentication
      const isAuth = await tokenManager.isAuthenticated();

      if (!isAuth) {
        console.log('[AuthContext] No valid authentication found');
        dispatch({ type: 'RESET_AUTH' });
        clearTimeout(timeoutId);
        return;
      }

      // Get stored tokens
      const tokens = await authService.getTokens();
      dispatch({ type: 'SET_TOKENS', payload: tokens });

      // Get user info if we have valid tokens
      if (tokens) {
        try {
          const user = await authService.getCurrentUser();
          dispatch({ type: 'SET_USER', payload: user });

          // Load last login and remember me settings
          const [lastLoginResult, rememberMeResult] = await storage.multiGet([
            STORAGE_KEYS.LAST_LOGIN,
            STORAGE_KEYS.REMEMBER_ME,
          ]);

          dispatch({ type: 'SET_LAST_LOGIN', payload: lastLoginResult[1] });
          dispatch({ type: 'SET_REMEMBER_ME', payload: rememberMeResult[1] === 'true' });

        } catch (userError) {
          console.error('Failed to get user info on startup:', userError);
          // Clear tokens if user fetch fails
          await tokenManager.clearTokens();
          dispatch({ type: 'RESET_AUTH' });
        }
      }
    } catch (error) {
      console.error('[AuthContext] Failed to load stored auth data:', error);
      dispatch({ type: 'RESET_AUTH' });
    } finally {
      console.log('[AuthContext] Auth initialization complete');
      clearTimeout(timeoutId);
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, []);

  // Check authentication status
  const checkAuthStatus = useCallback(async () => {
    try {
      const isAuth = await tokenManager.isAuthenticated();
      dispatch({ type: 'SET_AUTHENTICATED', payload: isAuth });
      
      if (!isAuth && state.user) {
        // Clear user data if not authenticated
        dispatch({ type: 'RESET_AUTH' });
      }
    } catch (error) {
      console.error('Failed to check auth status:', error);
      dispatch({ type: 'SET_AUTHENTICATED', payload: false });
    }
  }, [state.user]);

  // Login function
  const login = useCallback(async (payload: LoginPayload) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      clearError();

      const user = await authService.login(payload);
      
      // Get updated tokens after login
      const tokens = await authService.getTokens();
      
      // Update state
      dispatch({ type: 'SET_USER', payload: user });
      dispatch({ type: 'SET_TOKENS', payload: tokens });
      dispatch({ type: 'SET_LAST_LOGIN', payload: new Date().toISOString() });

      // Store remember me preference
      await storage.setItem(STORAGE_KEYS.REMEMBER_ME, 'true');
      dispatch({ type: 'SET_REMEMBER_ME', payload: true });

    } catch (error) {
      setError(error);
      throw error; // Re-throw for UI handling
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, [clearError, setError]);

  // Register function
  const register = useCallback(async (payload: RegisterPayload) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      clearError();

      const result = await authService.register(payload);
      return result;

    } catch (error) {
      setError(error);
      throw error; // Re-throw for UI handling
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, [clearError, setError]);

  // Refresh user data
  const refreshUser = useCallback(async () => {
    try {
      const user = await authService.getCurrentUser();
      dispatch({ type: 'SET_USER', payload: user });
    } catch (error) {
      console.error('Failed to refresh user data:', error);
      setError(error);
      
      // If refresh fails due to auth, clear everything
      if (error instanceof AuthenticationError && error.type === 'TOKEN_EXPIRED') {
        await logout();
      }
    }
  }, [setError]);

  // Logout function
  const logout = useCallback(async () => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      
      // Clear server session and local storage
      await authService.logout();
      
      // Reset authentication state
      dispatch({ type: 'RESET_AUTH' });
      
    } catch (error) {
      console.error('Logout error:', error);
      // Even if server logout fails, clear local state
      dispatch({ type: 'RESET_AUTH' });
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, []);

  // Set up token manager event listeners
  useEffect(() => {
    const handleTokenRefreshed = async () => {
      console.log('Tokens refreshed - updating context state');
      const tokens = await authService.getTokens();
      dispatch({ type: 'SET_TOKENS', payload: tokens });
    };

    const handleTokenExpired = () => {
      console.log('Tokens expired - clearing auth state');
      dispatch({ type: 'RESET_AUTH' });
    };

    const handleLoginRequired = () => {
      console.log('Login required - clearing auth state');
      dispatch({ type: 'RESET_AUTH' });
    };

    const handleRefreshFailed = (error: any) => {
      console.error('Token refresh failed:', error);
      setError(new AuthenticationError(
        'Session expired. Please log in again.',
        'TOKEN_EXPIRED',
        'REFRESH_FAILED'
      ));
    };

    // Subscribe to token manager events
    tokenManager.on('tokenRefreshed', handleTokenRefreshed);
    tokenManager.on('tokenExpired', handleTokenExpired);
    tokenManager.on('loginRequired', handleLoginRequired);
    tokenManager.on('refreshFailed', handleRefreshFailed);

    // Cleanup event listeners
    return () => {
      tokenManager.off('tokenRefreshed', handleTokenRefreshed);
      tokenManager.off('tokenExpired', handleTokenExpired);
      tokenManager.off('loginRequired', handleLoginRequired);
      tokenManager.off('refreshFailed', handleRefreshFailed);
    };
  }, [setError]);

  // Load stored data on mount
  useEffect(() => {
    loadStoredAuthData();
  }, [loadStoredAuthData]);

  // Context value
  const contextValue: AuthContextValue = {
    // State
    user: state.user,
    isAuthenticated: state.isAuthenticated,
    isLoading: state.isLoading,
    tokens: state.tokens,
    lastLogin: state.lastLogin,
    rememberMe: state.rememberMe,
    error: state.error,
    errorCode: state.errorCode,

    // Actions
    login,
    register,
    logout,
    refreshUser,
    clearError,
    checkAuthStatus,
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
}

// Custom hook to use the auth context
export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  
  return context;
}

// Hook to check if user is authenticated (returns boolean)
export function useIsAuthenticated(): boolean {
  const { isAuthenticated } = useAuth();
  return isAuthenticated;
}

// Hook to get current user (returns user or null)
export function useCurrentUser(): User | null {
  const { user } = useAuth();
  return user;
}

// Hook for authentication actions only
export function useAuthActions() {
  const { login, register, logout, refreshUser, clearError, checkAuthStatus } = useAuth();
  return { login, register, logout, refreshUser, clearError, checkAuthStatus };
}

export default AuthContext;