/**
 * SureBank Session Hook
 * 
 * React hook for session management with auto-logout,
 * session warnings, and activity tracking.
 */

import { useEffect, useState, useCallback } from 'react';
import { Alert } from 'react-native';
import sessionManager, { SessionEvent } from '@/services/security/SessionManager';
import { useAuth } from '@/contexts/AuthContext';
import { usePinSecurity } from '@/contexts/PinSecurityContext';
import { useActivityTracking } from '@/components/security/ActivityTracker';

interface SessionState {
  isActive: boolean;
  sessionId: string | null;
  timeUntilExpiry: number | null;
  timeUntilInactivityExpiry: number | null;
  showWarning: boolean;
  warningTimeRemaining: number;
  warningReason: 'inactivity' | 'session_timeout' | null;
}

export function useSession() {
  const { isAuthenticated, logout } = useAuth();
  const { updateActivity } = usePinSecurity();
  const { recordActivity } = useActivityTracking();
  
  const [sessionState, setSessionState] = useState<SessionState>({
    isActive: false,
    sessionId: null,
    timeUntilExpiry: null,
    timeUntilInactivityExpiry: null,
    showWarning: false,
    warningTimeRemaining: 0,
    warningReason: null,
  });

  // Update session state from manager
  const updateSessionState = useCallback(() => {
    const info = sessionManager.getSessionInfo();
    
    setSessionState(prev => ({
      ...prev,
      isActive: !!info,
      sessionId: info?.sessionId || null,
      timeUntilExpiry: info?.timeUntilSessionExpiry || null,
      timeUntilInactivityExpiry: info?.timeUntilInactivityExpiry || null,
    }));
  }, []);

  // Handle session events
  const handleSessionEvent = useCallback(async (event: SessionEvent, data?: any) => {
    console.log('Session event:', event, data);

    switch (event) {
      case 'session_started':
        updateSessionState();
        break;

      case 'session_extended':
        updateSessionState();
        break;

      case 'session_warning':
        setSessionState(prev => ({
          ...prev,
          showWarning: true,
          warningTimeRemaining: data.timeRemaining || 0,
          warningReason: data.reason || null,
        }));
        
        // Show warning alert
        showSessionWarning(data.reason, data.timeRemaining);
        break;

      case 'session_expired':
      case 'session_terminated':
        setSessionState({
          isActive: false,
          sessionId: null,
          timeUntilExpiry: null,
          timeUntilInactivityExpiry: null,
          showWarning: false,
          warningTimeRemaining: 0,
          warningReason: null,
        });

        // Log out user if session expired (not user logout)
        if (data?.reason !== 'user_logout') {
          await logout();
          
          Alert.alert(
            'Session Expired',
            getSessionExpiredMessage(data?.reason),
            [{ text: 'OK' }]
          );
        }
        break;

      case 'concurrent_session_detected':
        Alert.alert(
          'Another Session Detected',
          'Your account is being used on another device. For security, this session will be terminated.',
          [
            { 
              text: 'OK', 
              onPress: async () => {
                await logout();
              }
            }
          ]
        );
        break;
    }
  }, [updateSessionState, logout]);

  // Show session warning dialog
  const showSessionWarning = useCallback((reason: string, timeRemaining: number) => {
    const minutes = Math.ceil(timeRemaining / 60000);
    const message = reason === 'inactivity' 
      ? `Your session will expire in ${minutes} minute${minutes !== 1 ? 's' : ''} due to inactivity.`
      : `Your session will expire in ${minutes} minute${minutes !== 1 ? 's' : ''}.`;

    Alert.alert(
      'Session Warning',
      message,
      [
        {
          text: 'Stay Active',
          onPress: () => {
            recordActivity('user_action');
            updateActivity();
            setSessionState(prev => ({ ...prev, showWarning: false }));
          }
        },
        {
          text: 'Logout Now',
          style: 'destructive',
          onPress: async () => {
            await sessionManager.endSession('user_logout');
            await logout();
          }
        }
      ]
    );
  }, [recordActivity, updateActivity, logout]);

  // Get session expired message
  const getSessionExpiredMessage = (reason: string) => {
    switch (reason) {
      case 'inactivity_timeout':
        return 'Your session has expired due to inactivity. Please sign in again.';
      case 'session_timeout':
        return 'Your session has expired for security reasons. Please sign in again.';
      case 'invalid_session':
        return 'Your session is no longer valid. Please sign in again.';
      default:
        return 'Your session has expired. Please sign in again.';
    }
  };

  // Start session when user authenticates
  useEffect(() => {
    if (isAuthenticated && !sessionState.isActive) {
      sessionManager.startSession();
    } else if (!isAuthenticated && sessionState.isActive) {
      sessionManager.endSession('user_logout');
    }
  }, [isAuthenticated, sessionState.isActive]);

  // Subscribe to session events
  useEffect(() => {
    const unsubscribe = sessionManager.on('session_started', handleSessionEvent);
    const unsubscribeExtended = sessionManager.on('session_extended', handleSessionEvent);
    const unsubscribeWarning = sessionManager.on('session_warning', handleSessionEvent);
    const unsubscribeExpired = sessionManager.on('session_expired', handleSessionEvent);
    const unsubscribeTerminated = sessionManager.on('session_terminated', handleSessionEvent);
    const unsubscribeConcurrent = sessionManager.on('concurrent_session_detected', handleSessionEvent);

    return () => {
      unsubscribe();
      unsubscribeExtended();
      unsubscribeWarning();
      unsubscribeExpired();
      unsubscribeTerminated();
      unsubscribeConcurrent();
    };
  }, [handleSessionEvent]);

  // Restore session on app start
  useEffect(() => {
    if (isAuthenticated) {
      sessionManager.restoreSession().then(restored => {
        if (restored) {
          updateSessionState();
        }
      });
    }
  }, [isAuthenticated, updateSessionState]);

  // Update activity on user interactions
  const trackActivity = useCallback(() => {
    if (sessionState.isActive) {
      sessionManager.updateActivity();
      recordActivity('user_action');
      updateActivity();
    }
  }, [sessionState.isActive, recordActivity, updateActivity]);

  // Extend session
  const extendSession = useCallback(() => {
    if (sessionState.isActive) {
      trackActivity();
      setSessionState(prev => ({ ...prev, showWarning: false }));
    }
  }, [sessionState.isActive, trackActivity]);

  // Manual logout
  const manualLogout = useCallback(async () => {
    await sessionManager.endSession('user_logout');
    await logout();
  }, [logout]);

  return {
    // State
    session: sessionState,
    
    // Actions
    trackActivity,
    extendSession,
    logout: manualLogout,
    
    // Session info
    getSessionInfo: sessionManager.getSessionInfo.bind(sessionManager),
    isSessionValid: sessionManager.isSessionValid.bind(sessionManager),
  };
}

export default useSession;