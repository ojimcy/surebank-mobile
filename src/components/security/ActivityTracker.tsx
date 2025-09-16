/**
 * SureBank Activity Tracker Component
 * 
 * Higher-order component that wraps the app to track user activity
 * and trigger auto-lock functionality when needed.
 */

import React, { useEffect, ReactNode } from 'react';
import { View, ViewStyle } from 'react-native';
import { useActivityMonitor } from '@/services/security/ActivityMonitor';

interface ActivityTrackerProps {
  children: ReactNode;
  style?: ViewStyle;
  debugMode?: boolean;
}

/**
 * Activity tracker component that monitors user interactions
 */
export function ActivityTracker({
  children,
  style,
  debugMode = false
}: ActivityTrackerProps) {
  const { getPanHandlers, recordActivity } = useActivityMonitor({
    debugMode,
    inactivityTimeout: 5 * 60 * 1000, // Default 5 minutes
  });

  // Record activity on component mount (navigation event)
  useEffect(() => {
    recordActivity('navigation');
  }, [recordActivity]);

  return (
    <View
      style={[{ flex: 1 }, style]}
      {...getPanHandlers()}
      onTouchStart={() => recordActivity('touch')}
      onTouchMove={() => recordActivity('gesture')}
    >
      {children}
    </View>
  );
}

/**
 * Higher-order component for wrapping screens with activity tracking
 */
export function withActivityTracking<P extends object>(
  WrappedComponent: React.ComponentType<P>,
  options?: {
    debugMode?: boolean;
    trackNavigation?: boolean;
  }
) {
  const TrackedComponent = (props: P) => {
    const { recordActivity } = useActivityMonitor({
      debugMode: options?.debugMode,
    });

    // Track navigation if enabled
    useEffect(() => {
      if (options?.trackNavigation !== false) {
        recordActivity('navigation');
      }
    }, [recordActivity]);

    return (
      <ActivityTracker debugMode={options?.debugMode}>
        <WrappedComponent {...props} />
      </ActivityTracker>
    );
  };

  // Set display name for debugging
  TrackedComponent.displayName = `withActivityTracking(${WrappedComponent.displayName || WrappedComponent.name})`;

  return TrackedComponent;
}

/**
 * Hook to manually record activity events
 */
export function useActivityTracking() {
  const { recordActivity, getTimeSinceLastActivity, isInactive, resetActivity } = useActivityMonitor();

  const trackFormSubmission = () => recordActivity('api_call');
  const trackKeyboardInput = () => recordActivity('keyboard');
  const trackUserAction = () => recordActivity('touch');
  const trackNavigation = () => recordActivity('navigation');

  return {
    trackFormSubmission,
    trackKeyboardInput,
    trackUserAction,
    trackNavigation,
    getTimeSinceLastActivity,
    isInactive,
    resetActivity,
    recordActivity,
  };
}

export default ActivityTracker;