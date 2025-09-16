/**
 * SureBank Activity Monitor
 * 
 * Monitors user activity and app state to trigger auto-lock functionality
 * based on inactivity timeout and background state changes.
 */

import React from 'react';
import { AppState, AppStateStatus, PanResponder, GestureResponderEvent } from 'react-native';

// Activity event types
export type ActivityEvent = 
  | 'touch'
  | 'gesture'
  | 'navigation'
  | 'api_call'
  | 'keyboard'
  | 'background'
  | 'foreground';

// Activity listener callback
export type ActivityListener = (event: ActivityEvent, timestamp: Date) => void;

// Activity monitor configuration
interface ActivityMonitorConfig {
  inactivityTimeout: number; // milliseconds
  enableTouchTracking: boolean;
  enableAppStateTracking: boolean;
  enableNavigationTracking: boolean;
  enableApiTracking: boolean;
  debugMode: boolean;
}

// Default configuration
const DEFAULT_CONFIG: ActivityMonitorConfig = {
  inactivityTimeout: 5 * 60 * 1000, // 5 minutes
  enableTouchTracking: true,
  enableAppStateTracking: true,
  enableNavigationTracking: true,
  enableApiTracking: true,
  debugMode: false,
};

export class ActivityMonitor {
  private config: ActivityMonitorConfig;
  private listeners: Set<ActivityListener> = new Set();
  private lastActivity: Date = new Date();
  private inactivityTimer: NodeJS.Timeout | null = null;
  private appStateSubscription: any = null;
  private panResponder: any = null;
  private isActive: boolean = true;
  private isAppInForeground: boolean = true;

  constructor(config?: Partial<ActivityMonitorConfig>) {
    this.config = { ...DEFAULT_CONFIG, ...config };
    this.setupActivityTracking();
  }

  /**
   * Start monitoring user activity
   */
  start(): void {
    if (this.isActive) return;

    this.isActive = true;
    this.updateLastActivity('foreground');
    this.setupActivityTracking();
    this.startInactivityTimer();

    if (this.config.debugMode) {
      console.log('ActivityMonitor: Started monitoring');
    }
  }

  /**
   * Stop monitoring user activity
   */
  stop(): void {
    if (!this.isActive) return;

    this.isActive = false;
    this.cleanupTracking();

    if (this.config.debugMode) {
      console.log('ActivityMonitor: Stopped monitoring');
    }
  }

  /**
   * Update configuration
   */
  updateConfig(newConfig: Partial<ActivityMonitorConfig>): void {
    this.config = { ...this.config, ...newConfig };
    
    // Restart with new config if currently active
    if (this.isActive) {
      this.stop();
      this.start();
    }
  }

  /**
   * Subscribe to activity events
   */
  subscribe(listener: ActivityListener): () => void {
    this.listeners.add(listener);
    
    return () => {
      this.listeners.delete(listener);
    };
  }

  /**
   * Manually trigger activity update
   */
  recordActivity(event: ActivityEvent = 'touch'): void {
    if (!this.isActive) return;

    this.updateLastActivity(event);
  }

  /**
   * Get time since last activity
   */
  getTimeSinceLastActivity(): number {
    return Date.now() - this.lastActivity.getTime();
  }

  /**
   * Check if user has been inactive for too long
   */
  isInactive(): boolean {
    return this.getTimeSinceLastActivity() >= this.config.inactivityTimeout;
  }

  /**
   * Get last activity timestamp
   */
  getLastActivity(): Date {
    return this.lastActivity;
  }

  /**
   * Reset activity timer
   */
  resetActivity(): void {
    this.updateLastActivity('touch');
  }

  // Private methods

  private setupActivityTracking(): void {
    if (!this.isActive) return;

    // Setup touch tracking
    if (this.config.enableTouchTracking) {
      this.setupTouchTracking();
    }

    // Setup app state tracking
    if (this.config.enableAppStateTracking) {
      this.setupAppStateTracking();
    }
  }

  private setupTouchTracking(): void {
    // Create PanResponder to capture touch events globally
    this.panResponder = PanResponder.create({
      onStartShouldSetPanResponder: () => {
        this.recordActivity('touch');
        return false; // Don't consume the touch event
      },
      onMoveShouldSetPanResponder: () => {
        this.recordActivity('gesture');
        return false;
      },
      onPanResponderGrant: () => {
        this.recordActivity('touch');
      },
      onPanResponderMove: () => {
        this.recordActivity('gesture');
      },
    });

    if (this.config.debugMode) {
      console.log('ActivityMonitor: Touch tracking enabled');
    }
  }

  private setupAppStateTracking(): void {
    this.appStateSubscription = AppState.addEventListener(
      'change',
      this.handleAppStateChange.bind(this)
    );

    if (this.config.debugMode) {
      console.log('ActivityMonitor: App state tracking enabled');
    }
  }

  private handleAppStateChange(nextAppState: AppStateStatus): void {
    const isComingToForeground = !this.isAppInForeground && nextAppState === 'active';
    const isGoingToBackground = this.isAppInForeground && nextAppState !== 'active';

    this.isAppInForeground = nextAppState === 'active';

    if (isComingToForeground) {
      this.updateLastActivity('foreground');
      this.startInactivityTimer();
      
      if (this.config.debugMode) {
        console.log('ActivityMonitor: App came to foreground');
      }
    } else if (isGoingToBackground) {
      this.updateLastActivity('background');
      this.stopInactivityTimer();
      
      if (this.config.debugMode) {
        console.log('ActivityMonitor: App went to background');
      }
    }
  }

  private updateLastActivity(event: ActivityEvent): void {
    const timestamp = new Date();
    this.lastActivity = timestamp;

    // Notify listeners
    this.listeners.forEach(listener => {
      try {
        listener(event, timestamp);
      } catch (error) {
        console.error('ActivityMonitor: Error in activity listener:', error);
      }
    });

    // Reset inactivity timer
    if (this.isAppInForeground && event !== 'background') {
      this.startInactivityTimer();
    }

    if (this.config.debugMode && event !== 'background') {
      console.log(`ActivityMonitor: Activity recorded - ${event} at ${timestamp.toISOString()}`);
    }
  }

  private startInactivityTimer(): void {
    this.stopInactivityTimer();

    if (!this.isAppInForeground) return;

    this.inactivityTimer = setTimeout(() => {
      if (this.isActive && this.isAppInForeground) {
        this.handleInactivityTimeout();
      }
    }, this.config.inactivityTimeout);

    if (this.config.debugMode) {
      console.log(`ActivityMonitor: Inactivity timer started (${this.config.inactivityTimeout}ms)`);
    }
  }

  private stopInactivityTimer(): void {
    if (this.inactivityTimer) {
      clearTimeout(this.inactivityTimer);
      this.inactivityTimer = null;
    }
  }

  private handleInactivityTimeout(): void {
    if (this.config.debugMode) {
      console.log('ActivityMonitor: Inactivity timeout triggered');
    }

    // Trigger inactivity event
    this.updateLastActivity('background'); // This will notify listeners
  }

  private cleanupTracking(): void {
    // Stop inactivity timer
    this.stopInactivityTimer();

    // Remove app state listener
    if (this.appStateSubscription) {
      this.appStateSubscription.remove();
      this.appStateSubscription = null;
    }

    // Clear pan responder
    this.panResponder = null;

    if (this.config.debugMode) {
      console.log('ActivityMonitor: Cleanup completed');
    }
  }

  /**
   * Get pan responder handlers (for wrapping components)
   */
  getPanHandlers() {
    return this.panResponder?.panHandlers || {};
  }
}

// Singleton instance
let activityMonitorInstance: ActivityMonitor | null = null;

/**
 * Get singleton activity monitor instance
 */
export function getActivityMonitor(config?: Partial<ActivityMonitorConfig>): ActivityMonitor {
  if (!activityMonitorInstance) {
    activityMonitorInstance = new ActivityMonitor(config);
  } else if (config) {
    activityMonitorInstance.updateConfig(config);
  }
  
  return activityMonitorInstance;
}

/**
 * React hook for activity monitoring
 */
export function useActivityMonitor(config?: Partial<ActivityMonitorConfig>) {
  const monitor = getActivityMonitor(config);

  // Start monitoring on mount
  React.useEffect(() => {
    monitor.start();

    return () => {
      // Don't stop the monitor as it's a singleton
    };
  }, [monitor]);

  return {
    monitor,
    recordActivity: monitor.recordActivity.bind(monitor),
    getTimeSinceLastActivity: monitor.getTimeSinceLastActivity.bind(monitor),
    isInactive: monitor.isInactive.bind(monitor),
    getLastActivity: monitor.getLastActivity.bind(monitor),
    resetActivity: monitor.resetActivity.bind(monitor),
    getPanHandlers: monitor.getPanHandlers.bind(monitor),
  };
}

export default ActivityMonitor;