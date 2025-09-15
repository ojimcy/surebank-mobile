/**
 * SureBank PIN Security Context
 * 
 * Provides PIN-based security with biometric fallback, inactivity timeout,
 * and auto-lock functionality for enhanced app security.
 */

import React, { createContext, useContext, useEffect, useReducer, useCallback, useRef, ReactNode } from 'react';
import { AppState, AppStateStatus } from 'react-native';
import * as LocalAuthentication from 'expo-local-authentication';
import { storage, STORAGE_KEYS } from '@/services/storage/index';
import { BiometricConfig, PinConfig } from '@/services/api/types';

// PIN Security state interface
interface PinSecurityState {
  // PIN configuration
  isPinSet: boolean;
  isLocked: boolean;
  pinLength: 4 | 6;
  failedAttempts: number;
  maxAttempts: number;
  lockoutUntil: Date | null;
  
  // Biometric configuration
  biometricConfig: BiometricConfig;
  isBiometricEnabled: boolean;
  
  // Session and timeout
  lastActivity: Date;
  inactivityTimeout: number; // milliseconds
  isInBackground: boolean;
  backgroundTime: Date | null;
  
  // UI state
  isLoading: boolean;
  showPinPrompt: boolean;
  error: string | null;
}

interface PinSecurityContextValue extends PinSecurityState {
  // PIN management
  setupPin: (pin: string, enableBiometric?: boolean) => Promise<boolean>;
  verifyPin: (pin: string) => Promise<boolean>;
  removePin: () => Promise<boolean>;
  changePinLength: (length: 4 | 6) => Promise<boolean>;
  
  // Biometric management
  enableBiometric: () => Promise<boolean>;
  disableBiometric: () => Promise<boolean>;
  authenticateWithBiometric: () => Promise<boolean>;
  
  // Security actions
  lock: () => void;
  unlock: () => void;
  updateActivity: () => void;
  checkLockStatus: () => Promise<void>;
  
  // Settings
  setInactivityTimeout: (timeout: number) => Promise<void>;
  
  // Error handling
  clearError: () => void;
}

// Action types for PIN security state management
type PinSecurityAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_PIN_SETUP'; payload: boolean }
  | { type: 'SET_LOCKED'; payload: boolean }
  | { type: 'SET_PIN_LENGTH'; payload: 4 | 6 }
  | { type: 'SET_FAILED_ATTEMPTS'; payload: number }
  | { type: 'SET_LOCKOUT'; payload: Date | null }
  | { type: 'SET_BIOMETRIC_CONFIG'; payload: BiometricConfig }
  | { type: 'SET_BIOMETRIC_ENABLED'; payload: boolean }
  | { type: 'UPDATE_ACTIVITY' }
  | { type: 'SET_BACKGROUND_STATE'; payload: { isInBackground: boolean; backgroundTime: Date | null } }
  | { type: 'SET_INACTIVITY_TIMEOUT'; payload: number }
  | { type: 'SET_SHOW_PIN_PROMPT'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'CLEAR_ERROR' }
  | { type: 'RESET_ATTEMPTS' };

// Initial PIN security state
const initialState: PinSecurityState = {
  isPinSet: false,
  isLocked: false,
  pinLength: 6,
  failedAttempts: 0,
  maxAttempts: 3,
  lockoutUntil: null,
  biometricConfig: {
    isAvailable: false,
    isEnabled: false,
    supportedTypes: [],
  },
  isBiometricEnabled: false,
  lastActivity: new Date(),
  inactivityTimeout: 5 * 60 * 1000, // 5 minutes
  isInBackground: false,
  backgroundTime: null,
  isLoading: false,
  showPinPrompt: false,
  error: null,
};

// PIN security state reducer
function pinSecurityReducer(state: PinSecurityState, action: PinSecurityAction): PinSecurityState {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
      
    case 'SET_PIN_SETUP':
      return { ...state, isPinSet: action.payload };
      
    case 'SET_LOCKED':
      return { 
        ...state, 
        isLocked: action.payload,
        showPinPrompt: action.payload,
        error: null,
      };
      
    case 'SET_PIN_LENGTH':
      return { ...state, pinLength: action.payload };
      
    case 'SET_FAILED_ATTEMPTS':
      return { ...state, failedAttempts: action.payload };
      
    case 'SET_LOCKOUT':
      return { ...state, lockoutUntil: action.payload };
      
    case 'SET_BIOMETRIC_CONFIG':
      return { ...state, biometricConfig: action.payload };
      
    case 'SET_BIOMETRIC_ENABLED':
      return { ...state, isBiometricEnabled: action.payload };
      
    case 'UPDATE_ACTIVITY':
      return { ...state, lastActivity: new Date() };
      
    case 'SET_BACKGROUND_STATE':
      return { 
        ...state, 
        isInBackground: action.payload.isInBackground,
        backgroundTime: action.payload.backgroundTime,
      };
      
    case 'SET_INACTIVITY_TIMEOUT':
      return { ...state, inactivityTimeout: action.payload };
      
    case 'SET_SHOW_PIN_PROMPT':
      return { ...state, showPinPrompt: action.payload };
      
    case 'SET_ERROR':
      return { ...state, error: action.payload };
      
    case 'CLEAR_ERROR':
      return { ...state, error: null };
      
    case 'RESET_ATTEMPTS':
      return { 
        ...state, 
        failedAttempts: 0, 
        lockoutUntil: null,
        error: null,
      };
      
    default:
      return state;
  }
}

// Create the PIN security context
const PinSecurityContext = createContext<PinSecurityContextValue | undefined>(undefined);

interface PinSecurityProviderProps {
  children: ReactNode;
}

export function PinSecurityProvider({ children }: PinSecurityProviderProps) {
  const [state, dispatch] = useReducer(pinSecurityReducer, initialState);
  const inactivityTimer = useRef<NodeJS.Timeout | null>(null);
  const appStateRef = useRef<AppStateStatus>('active');

  // Helper functions
  const clearError = useCallback(() => {
    dispatch({ type: 'CLEAR_ERROR' });
  }, []);

  const setError = useCallback((message: string) => {
    dispatch({ type: 'SET_ERROR', payload: message });
  }, []);

  // Hash PIN for secure storage
  const hashPin = useCallback(async (pin: string): Promise<string> => {
    // Simple hash for demo - in production, use proper cryptographic hashing
    const encoder = new TextEncoder();
    const data = encoder.encode(pin);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  }, []);

  // Load PIN security configuration on startup
  const loadPinConfig = useCallback(async () => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });

      // Check if PIN is set
      const hasPin = await storage.getItem(STORAGE_KEYS.PIN_HASH);
      dispatch({ type: 'SET_PIN_SETUP', payload: !!hasPin });

      // Load PIN configuration
      const [pinLengthResult, biometricEnabledResult, timeoutResult, attemptsResult] = 
        await storage.multiGet([
          STORAGE_KEYS.PIN_LENGTH,
          STORAGE_KEYS.BIOMETRIC_ENABLED,
          STORAGE_KEYS.INACTIVITY_TIMEOUT,
          STORAGE_KEYS.FAILED_PIN_ATTEMPTS,
        ]);

      const pinLength = pinLengthResult[1] ? parseInt(pinLengthResult[1], 10) as (4 | 6) : 6;
      const isBiometricEnabled = biometricEnabledResult[1] === 'true';
      const timeout = timeoutResult[1] ? parseInt(timeoutResult[1], 10) : 5 * 60 * 1000;
      const failedAttempts = attemptsResult[1] ? parseInt(attemptsResult[1], 10) : 0;

      dispatch({ type: 'SET_PIN_LENGTH', payload: pinLength });
      dispatch({ type: 'SET_BIOMETRIC_ENABLED', payload: isBiometricEnabled });
      dispatch({ type: 'SET_INACTIVITY_TIMEOUT', payload: timeout });
      dispatch({ type: 'SET_FAILED_ATTEMPTS', payload: failedAttempts });

      // Check biometric availability
      const biometricAvailable = await LocalAuthentication.hasHardwareAsync();
      const biometricTypes = await LocalAuthentication.supportedAuthenticationTypesAsync();
      const biometricEnrolled = await LocalAuthentication.isEnrolledAsync();

      const supportedTypes: BiometricConfig['supportedTypes'] = [];
      if (biometricTypes.includes(LocalAuthentication.AuthenticationType.FINGERPRINT)) {
        supportedTypes.push('fingerprint');
      }
      if (biometricTypes.includes(LocalAuthentication.AuthenticationType.FACIAL_RECOGNITION)) {
        supportedTypes.push('faceId');
      }

      dispatch({
        type: 'SET_BIOMETRIC_CONFIG',
        payload: {
          isAvailable: biometricAvailable && biometricEnrolled,
          isEnabled: isBiometricEnabled && biometricAvailable && biometricEnrolled,
          supportedTypes,
        },
      });

      // Check if app should be locked (if PIN is set and we're coming from background)
      if (hasPin) {
        const lastBackgroundTime = await storage.getItem(STORAGE_KEYS.LAST_BACKGROUND_TIME);
        if (lastBackgroundTime) {
          const backgroundTime = new Date(lastBackgroundTime);
          const timeSinceBackground = Date.now() - backgroundTime.getTime();
          
          if (timeSinceBackground > timeout) {
            dispatch({ type: 'SET_LOCKED', payload: true });
          }
        }
      }

    } catch (error) {
      console.error('Failed to load PIN configuration:', error);
      setError('Failed to load security settings');
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, [setError]);

  // Setup PIN
  const setupPin = useCallback(async (pin: string, enableBiometric = false): Promise<boolean> => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      clearError();

      if (pin.length !== 4 && pin.length !== 6) {
        setError('PIN must be 4 or 6 digits');
        return false;
      }

      const hashedPin = await hashPin(pin);

      await storage.multiSet([
        [STORAGE_KEYS.PIN_HASH, hashedPin],
        [STORAGE_KEYS.PIN_LENGTH, pin.length.toString()],
        [STORAGE_KEYS.BIOMETRIC_ENABLED, enableBiometric.toString()],
      ]);

      dispatch({ type: 'SET_PIN_SETUP', payload: true });
      dispatch({ type: 'SET_PIN_LENGTH', payload: pin.length as (4 | 6) });
      dispatch({ type: 'SET_BIOMETRIC_ENABLED', payload: enableBiometric });
      dispatch({ type: 'RESET_ATTEMPTS' });

      return true;
    } catch (error) {
      console.error('Failed to setup PIN:', error);
      setError('Failed to setup PIN');
      return false;
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, [hashPin, clearError, setError]);

  // Verify PIN
  const verifyPin = useCallback(async (pin: string): Promise<boolean> => {
    try {
      clearError();

      // Check lockout
      if (state.lockoutUntil && new Date() < state.lockoutUntil) {
        const timeRemaining = Math.ceil((state.lockoutUntil.getTime() - Date.now()) / 1000);
        setError(`Too many failed attempts. Try again in ${timeRemaining} seconds.`);
        return false;
      }

      const storedHash = await storage.getItem(STORAGE_KEYS.PIN_HASH);
      if (!storedHash) {
        setError('No PIN configured');
        return false;
      }

      const enteredHash = await hashPin(pin);
      const isValid = storedHash === enteredHash;

      if (isValid) {
        dispatch({ type: 'RESET_ATTEMPTS' });
        dispatch({ type: 'SET_LOCKED', payload: false });
        dispatch({ type: 'UPDATE_ACTIVITY' });
        await storage.removeItem(STORAGE_KEYS.FAILED_PIN_ATTEMPTS);
        return true;
      } else {
        const newAttempts = state.failedAttempts + 1;
        dispatch({ type: 'SET_FAILED_ATTEMPTS', payload: newAttempts });
        await storage.setItem(STORAGE_KEYS.FAILED_PIN_ATTEMPTS, newAttempts.toString());

        if (newAttempts >= state.maxAttempts) {
          // Lock for 30 seconds after max attempts
          const lockoutTime = new Date(Date.now() + 30 * 1000);
          dispatch({ type: 'SET_LOCKOUT', payload: lockoutTime });
          setError('Too many failed attempts. Account locked for 30 seconds.');
        } else {
          setError(`Incorrect PIN. ${state.maxAttempts - newAttempts} attempts remaining.`);
        }
        return false;
      }
    } catch (error) {
      console.error('Failed to verify PIN:', error);
      setError('PIN verification failed');
      return false;
    }
  }, [hashPin, clearError, setError, state.lockoutUntil, state.failedAttempts, state.maxAttempts]);

  // Remove PIN
  const removePin = useCallback(async (): Promise<boolean> => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });

      await storage.multiRemove([
        STORAGE_KEYS.PIN_HASH,
        STORAGE_KEYS.PIN_LENGTH,
        STORAGE_KEYS.BIOMETRIC_ENABLED,
        STORAGE_KEYS.FAILED_PIN_ATTEMPTS,
      ]);

      dispatch({ type: 'SET_PIN_SETUP', payload: false });
      dispatch({ type: 'SET_LOCKED', payload: false });
      dispatch({ type: 'RESET_ATTEMPTS' });

      return true;
    } catch (error) {
      console.error('Failed to remove PIN:', error);
      setError('Failed to remove PIN');
      return false;
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, [setError]);

  // Change PIN length
  const changePinLength = useCallback(async (length: 4 | 6): Promise<boolean> => {
    try {
      await storage.setItem(STORAGE_KEYS.PIN_LENGTH, length.toString());
      dispatch({ type: 'SET_PIN_LENGTH', payload: length });
      return true;
    } catch (error) {
      console.error('Failed to change PIN length:', error);
      setError('Failed to update PIN length');
      return false;
    }
  }, [setError]);

  // Enable biometric authentication
  const enableBiometric = useCallback(async (): Promise<boolean> => {
    try {
      if (!state.biometricConfig.isAvailable) {
        setError('Biometric authentication is not available');
        return false;
      }

      await storage.setItem(STORAGE_KEYS.BIOMETRIC_ENABLED, 'true');
      dispatch({ type: 'SET_BIOMETRIC_ENABLED', payload: true });
      return true;
    } catch (error) {
      console.error('Failed to enable biometric:', error);
      setError('Failed to enable biometric authentication');
      return false;
    }
  }, [state.biometricConfig.isAvailable, setError]);

  // Disable biometric authentication
  const disableBiometric = useCallback(async (): Promise<boolean> => {
    try {
      await storage.setItem(STORAGE_KEYS.BIOMETRIC_ENABLED, 'false');
      dispatch({ type: 'SET_BIOMETRIC_ENABLED', payload: false });
      return true;
    } catch (error) {
      console.error('Failed to disable biometric:', error);
      setError('Failed to disable biometric authentication');
      return false;
    }
  }, [setError]);

  // Authenticate with biometric
  const authenticateWithBiometric = useCallback(async (): Promise<boolean> => {
    try {
      if (!state.biometricConfig.isAvailable || !state.isBiometricEnabled) {
        return false;
      }

      const result = await LocalAuthentication.authenticateAsync({
        promptMessage: 'Authenticate with biometrics',
        fallbackLabel: 'Use PIN',
        disableDeviceFallback: false,
      });

      if (result.success) {
        dispatch({ type: 'SET_LOCKED', payload: false });
        dispatch({ type: 'UPDATE_ACTIVITY' });
        dispatch({ type: 'RESET_ATTEMPTS' });
        return true;
      } else {
        setError('Biometric authentication failed');
        return false;
      }
    } catch (error) {
      console.error('Biometric authentication error:', error);
      setError('Biometric authentication error');
      return false;
    }
  }, [state.biometricConfig.isAvailable, state.isBiometricEnabled, setError]);

  // Lock the app
  const lock = useCallback(() => {
    if (state.isPinSet) {
      dispatch({ type: 'SET_LOCKED', payload: true });
    }
  }, [state.isPinSet]);

  // Unlock the app
  const unlock = useCallback(() => {
    dispatch({ type: 'SET_LOCKED', payload: false });
    dispatch({ type: 'UPDATE_ACTIVITY' });
  }, []);

  // Update activity timestamp
  const updateActivity = useCallback(() => {
    dispatch({ type: 'UPDATE_ACTIVITY' });
  }, []);

  // Check lock status based on inactivity
  const checkLockStatus = useCallback(async () => {
    if (!state.isPinSet || state.isLocked) return;

    const timeSinceActivity = Date.now() - state.lastActivity.getTime();
    
    if (timeSinceActivity >= state.inactivityTimeout) {
      dispatch({ type: 'SET_LOCKED', payload: true });
    }
  }, [state.isPinSet, state.isLocked, state.lastActivity, state.inactivityTimeout]);

  // Set inactivity timeout
  const setInactivityTimeout = useCallback(async (timeout: number): Promise<void> => {
    try {
      await storage.setItem(STORAGE_KEYS.INACTIVITY_TIMEOUT, timeout.toString());
      dispatch({ type: 'SET_INACTIVITY_TIMEOUT', payload: timeout });
    } catch (error) {
      console.error('Failed to set inactivity timeout:', error);
      setError('Failed to update timeout settings');
    }
  }, [setError]);

  // Setup inactivity timer
  useEffect(() => {
    const startInactivityTimer = () => {
      if (inactivityTimer.current) {
        clearInterval(inactivityTimer.current);
      }

      if (state.isPinSet && !state.isLocked) {
        inactivityTimer.current = setInterval(() => {
          checkLockStatus();
        }, 10000); // Check every 10 seconds
      }
    };

    startInactivityTimer();

    return () => {
      if (inactivityTimer.current) {
        clearInterval(inactivityTimer.current);
      }
    };
  }, [state.isPinSet, state.isLocked, checkLockStatus]);

  // Handle app state changes
  useEffect(() => {
    const handleAppStateChange = async (nextAppState: AppStateStatus) => {
      if (appStateRef.current === 'active' && nextAppState.match(/inactive|background/)) {
        // App going to background
        const backgroundTime = new Date();
        dispatch({ 
          type: 'SET_BACKGROUND_STATE', 
          payload: { isInBackground: true, backgroundTime } 
        });
        await storage.setItem(STORAGE_KEYS.LAST_BACKGROUND_TIME, backgroundTime.toISOString());
        
      } else if (appStateRef.current.match(/inactive|background/) && nextAppState === 'active') {
        // App coming to foreground
        dispatch({ 
          type: 'SET_BACKGROUND_STATE', 
          payload: { isInBackground: false, backgroundTime: null } 
        });
        
        // Check if app should be locked
        if (state.isPinSet && state.backgroundTime) {
          const timeSinceBackground = Date.now() - state.backgroundTime.getTime();
          if (timeSinceBackground >= state.inactivityTimeout) {
            dispatch({ type: 'SET_LOCKED', payload: true });
          }
        }
      }

      appStateRef.current = nextAppState;
    };

    const subscription = AppState.addEventListener('change', handleAppStateChange);
    return () => subscription?.remove();
  }, [state.isPinSet, state.backgroundTime, state.inactivityTimeout]);

  // Load configuration on mount
  useEffect(() => {
    loadPinConfig();
  }, [loadPinConfig]);

  // Context value
  const contextValue: PinSecurityContextValue = {
    // State
    ...state,

    // Actions
    setupPin,
    verifyPin,
    removePin,
    changePinLength,
    enableBiometric,
    disableBiometric,
    authenticateWithBiometric,
    lock,
    unlock,
    updateActivity,
    checkLockStatus,
    setInactivityTimeout,
    clearError,
  };

  return (
    <PinSecurityContext.Provider value={contextValue}>
      {children}
    </PinSecurityContext.Provider>
  );
}

// Custom hook to use the PIN security context
export function usePinSecurity(): PinSecurityContextValue {
  const context = useContext(PinSecurityContext);
  
  if (context === undefined) {
    throw new Error('usePinSecurity must be used within a PinSecurityProvider');
  }
  
  return context;
}

// Hook to check if app is locked
export function useIsLocked(): boolean {
  const { isLocked } = usePinSecurity();
  return isLocked;
}

// Hook for PIN security actions only
export function usePinActions() {
  const { 
    setupPin, 
    verifyPin, 
    removePin, 
    changePinLength,
    enableBiometric,
    disableBiometric,
    authenticateWithBiometric,
    lock,
    unlock,
    updateActivity,
    checkLockStatus,
    setInactivityTimeout,
    clearError,
  } = usePinSecurity();
  
  return { 
    setupPin, 
    verifyPin, 
    removePin, 
    changePinLength,
    enableBiometric,
    disableBiometric,
    authenticateWithBiometric,
    lock,
    unlock,
    updateActivity,
    checkLockStatus,
    setInactivityTimeout,
    clearError,
  };
}

export default PinSecurityContext;