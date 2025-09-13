/**
 * SureBank Session Manager
 * 
 * Manages user session security with auto-logout, session timeout,
 * and concurrent session handling.
 */

import { AppState, AppStateStatus } from 'react-native';
import { storage, STORAGE_KEYS } from '@/services/storage';
import tokenManager from '@/services/auth/tokenManager';

// Session configuration
interface SessionConfig {
  maxInactiveTime: number; // milliseconds
  maxSessionTime: number; // milliseconds
  warningBeforeLogout: number; // milliseconds
  enableConcurrentSessionCheck: boolean;
}

// Default session configuration
const DEFAULT_CONFIG: SessionConfig = {
  maxInactiveTime: 15 * 60 * 1000, // 15 minutes
  maxSessionTime: 24 * 60 * 60 * 1000, // 24 hours
  warningBeforeLogout: 2 * 60 * 1000, // 2 minutes warning
  enableConcurrentSessionCheck: true,
};

// Session event types
export type SessionEvent = 
  | 'session_started'
  | 'session_extended'
  | 'session_warning'
  | 'session_expired'
  | 'concurrent_session_detected'
  | 'session_terminated';

// Session listener callback
export type SessionListener = (event: SessionEvent, data?: any) => void;

export class SessionManager {
  private config: SessionConfig;
  private sessionStartTime: Date | null = null;
  private lastActivityTime: Date = new Date();
  private inactivityTimer: ReturnType<typeof setTimeout> | null = null;
  private sessionTimer: ReturnType<typeof setTimeout> | null = null;
  private warningTimer: ReturnType<typeof setTimeout> | null = null;
  private appStateSubscription: any = null;
  private isActive = false;
  private sessionId: string | null = null;
  
  private listeners: Set<SessionListener> = new Set();

  constructor(config?: Partial<SessionConfig>) {
    this.config = { ...DEFAULT_CONFIG, ...config };
    this.setupAppStateListener();
  }

  /**
   * Start a new session
   */
  async startSession(userId?: string): Promise<void> {
    try {
      this.sessionStartTime = new Date();
      this.lastActivityTime = new Date();
      this.sessionId = this.generateSessionId();
      this.isActive = true;

      // Store session data
      await storage.multiSet([
        [STORAGE_KEYS.SESSION_START_TIME, this.sessionStartTime.toISOString()],
        [STORAGE_KEYS.SESSION_ID, this.sessionId],
        [STORAGE_KEYS.LAST_ACTIVITY, this.lastActivityTime.toISOString()],
      ]);

      this.startTimers();
      this.emit('session_started', { sessionId: this.sessionId, userId });

      console.log('Session started:', this.sessionId);
    } catch (error) {
      console.error('Failed to start session:', error);
      throw new Error('Session initialization failed');
    }
  }

  /**
   * End the current session
   */
  async endSession(reason = 'user_logout'): Promise<void> {
    try {
      this.stopTimers();
      this.isActive = false;

      const sessionId = this.sessionId;
      this.sessionId = null;
      this.sessionStartTime = null;

      // Clear session data
      await storage.multiRemove([
        STORAGE_KEYS.SESSION_START_TIME,
        STORAGE_KEYS.SESSION_ID,
        STORAGE_KEYS.LAST_ACTIVITY,
      ]);

      // Clear tokens if session expired
      if (reason !== 'user_logout') {
        await tokenManager.clearTokens();
      }

      this.emit('session_terminated', { sessionId, reason });

      console.log('Session ended:', sessionId, 'Reason:', reason);
    } catch (error) {
      console.error('Failed to end session:', error);
    }
  }

  /**
   * Update activity timestamp
   */
  async updateActivity(): Promise<void> {
    if (!this.isActive) return;

    try {
      this.lastActivityTime = new Date();
      await storage.setItem(STORAGE_KEYS.LAST_ACTIVITY, this.lastActivityTime.toISOString());

      // Reset inactivity timer
      this.resetInactivityTimer();
      this.emit('session_extended');
    } catch (error) {
      console.error('Failed to update activity:', error);
    }
  }

  /**
   * Check if session is valid
   */
  async isSessionValid(): Promise<boolean> {
    if (!this.isActive || !this.sessionStartTime) {
      return false;
    }

    try {
      const now = Date.now();
      const sessionDuration = now - this.sessionStartTime.getTime();
      const inactiveDuration = now - this.lastActivityTime.getTime();

      // Check session timeout
      if (sessionDuration > this.config.maxSessionTime) {
        await this.endSession('session_timeout');
        return false;
      }

      // Check inactivity timeout
      if (inactiveDuration > this.config.maxInactiveTime) {
        await this.endSession('inactivity_timeout');
        return false;
      }

      return true;
    } catch (error) {
      console.error('Failed to validate session:', error);
      return false;
    }
  }

  /**
   * Get session information
   */
  getSessionInfo() {
    if (!this.isActive || !this.sessionStartTime) {
      return null;
    }

    const now = Date.now();
    const sessionDuration = now - this.sessionStartTime.getTime();
    const inactiveDuration = now - this.lastActivityTime.getTime();
    const timeUntilSessionExpiry = this.config.maxSessionTime - sessionDuration;
    const timeUntilInactivityExpiry = this.config.maxInactiveTime - inactiveDuration;

    return {
      sessionId: this.sessionId,
      startTime: this.sessionStartTime,
      lastActivity: this.lastActivityTime,
      sessionDuration,
      inactiveDuration,
      timeUntilSessionExpiry: Math.max(0, timeUntilSessionExpiry),
      timeUntilInactivityExpiry: Math.max(0, timeUntilInactivityExpiry),
      isActive: this.isActive,
    };
  }

  /**
   * Restore session from storage
   */
  async restoreSession(): Promise<boolean> {
    try {
      const [sessionStartResult, sessionIdResult, lastActivityResult] = 
        await storage.multiGet([
          STORAGE_KEYS.SESSION_START_TIME,
          STORAGE_KEYS.SESSION_ID,
          STORAGE_KEYS.LAST_ACTIVITY,
        ]);

      const sessionStartTime = sessionStartResult[1];
      const sessionId = sessionIdResult[1];
      const lastActivity = lastActivityResult[1];

      if (!sessionStartTime || !sessionId || !lastActivity) {
        return false;
      }

      this.sessionStartTime = new Date(sessionStartTime);
      this.sessionId = sessionId;
      this.lastActivityTime = new Date(lastActivity);
      this.isActive = true;

      // Validate restored session
      const isValid = await this.isSessionValid();
      
      if (isValid) {
        this.startTimers();
        console.log('Session restored:', sessionId);
        return true;
      } else {
        await this.endSession('invalid_session');
        return false;
      }
    } catch (error) {
      console.error('Failed to restore session:', error);
      return false;
    }
  }

  /**
   * Subscribe to session events
   */
  on(event: SessionEvent, handler: SessionListener): () => void {
    this.listeners.add(handler);
    return () => this.listeners.delete(handler);
  }

  /**
   * Update session configuration
   */
  updateConfig(newConfig: Partial<SessionConfig>): void {
    this.config = { ...this.config, ...newConfig };
    
    if (this.isActive) {
      this.resetTimers();
    }
  }

  // Private methods

  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private emit(event: SessionEvent, data?: any): void {
    this.listeners.forEach(listener => {
      try {
        listener(event, data);
      } catch (error) {
        console.error(`Error in session event handler for ${event}:`, error);
      }
    });
  }

  private startTimers(): void {
    this.resetInactivityTimer();
    this.resetSessionTimer();
  }

  private stopTimers(): void {
    if (this.inactivityTimer) {
      clearTimeout(this.inactivityTimer);
      this.inactivityTimer = null;
    }

    if (this.sessionTimer) {
      clearTimeout(this.sessionTimer);
      this.sessionTimer = null;
    }

    if (this.warningTimer) {
      clearTimeout(this.warningTimer);
      this.warningTimer = null;
    }
  }

  private resetTimers(): void {
    this.stopTimers();
    this.startTimers();
  }

  private resetInactivityTimer(): void {
    if (this.inactivityTimer) {
      clearTimeout(this.inactivityTimer);
    }

    if (this.warningTimer) {
      clearTimeout(this.warningTimer);
    }

    // Set warning timer
    const warningDelay = this.config.maxInactiveTime - this.config.warningBeforeLogout;
    if (warningDelay > 0) {
      this.warningTimer = setTimeout(() => {
        this.emit('session_warning', {
          timeRemaining: this.config.warningBeforeLogout,
          reason: 'inactivity',
        });
      }, warningDelay);
    }

    // Set inactivity timer
    this.inactivityTimer = setTimeout(async () => {
      await this.endSession('inactivity_timeout');
    }, this.config.maxInactiveTime);
  }

  private async resetSessionTimer(): Promise<void> {
    if (this.sessionTimer) {
      clearTimeout(this.sessionTimer);
    }

    if (!this.sessionStartTime) return;

    const sessionDuration = Date.now() - this.sessionStartTime.getTime();
    const remainingTime = this.config.maxSessionTime - sessionDuration;

    if (remainingTime > 0) {
      // Set warning timer for session expiry
      const warningDelay = remainingTime - this.config.warningBeforeLogout;
      if (warningDelay > 0) {
        setTimeout(() => {
          this.emit('session_warning', {
            timeRemaining: this.config.warningBeforeLogout,
            reason: 'session_timeout',
          });
        }, warningDelay);
      }

      // Set session timer
      this.sessionTimer = setTimeout(async () => {
        await this.endSession('session_timeout');
      }, remainingTime);
    } else {
      // Session already expired
      await this.endSession('session_timeout');
    }
  }

  private setupAppStateListener(): void {
    this.appStateSubscription = AppState.addEventListener('change', this.handleAppStateChange.bind(this));
  }

  private handleAppStateChange(nextAppState: AppStateStatus): void {
    if (nextAppState === 'active' && this.isActive) {
      // App came to foreground - update activity
      this.updateActivity();
    } else if (nextAppState !== 'active' && this.isActive) {
      // App went to background - record activity
      this.updateActivity();
    }
  }

  /**
   * Cleanup resources
   */
  destroy(): void {
    this.stopTimers();
    
    if (this.appStateSubscription) {
      this.appStateSubscription.remove();
      this.appStateSubscription = null;
    }

    this.listeners.clear();
    this.isActive = false;
  }
}

// Add session storage keys
declare module '@/services/storage' {
  interface StorageKeys {
    SESSION_START_TIME: 'session_start_time';
    SESSION_ID: 'session_id';
    LAST_ACTIVITY: 'last_activity';
  }
}

// Extend storage keys
Object.assign(STORAGE_KEYS, {
  SESSION_START_TIME: 'session_start_time',
  SESSION_ID: 'session_id', 
  LAST_ACTIVITY: 'last_activity',
});

// Create singleton instance
const sessionManager = new SessionManager();

export default sessionManager;