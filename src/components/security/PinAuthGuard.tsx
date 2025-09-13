/**
 * SureBank PIN Authentication Guard
 * 
 * Component that enforces PIN authentication when the app is locked.
 * Handles biometric fallback, attempt limits, and lockout periods.
 */

import React, { useEffect, useState } from 'react';
import { View, Modal } from 'react-native';
import { usePinSecurity } from '@/contexts/PinSecurityContext';
import { useAuth } from '@/contexts/AuthContext';
import PinLockScreen from './PinLockScreen';
import { useActivityTracking } from './ActivityTracker';

interface PinAuthGuardProps {
  children: React.ReactNode;
}

export function PinAuthGuard({ children }: PinAuthGuardProps) {
  const { isLocked, isPinSet, unlock, error } = usePinSecurity();
  const { isAuthenticated } = useAuth();
  const { resetActivity } = useActivityTracking();
  const [showPinScreen, setShowPinScreen] = useState(false);

  // Monitor lock state and show PIN screen when needed
  useEffect(() => {
    const shouldShowPinScreen = isAuthenticated && isPinSet && isLocked;
    setShowPinScreen(shouldShowPinScreen);
  }, [isAuthenticated, isPinSet, isLocked]);

  const handlePinSuccess = () => {
    unlock();
    resetActivity();
    setShowPinScreen(false);
  };

  const handlePinCancel = () => {
    // For PIN unlock, we don't allow cancellation
    // User must provide correct PIN to continue
  };

  // If user is not authenticated or PIN is not set, show normal content
  if (!isAuthenticated || !isPinSet) {
    return <>{children}</>;
  }

  // Show PIN screen as overlay when locked
  return (
    <>
      {children}
      
      <Modal
        visible={showPinScreen}
        animationType="fade"
        presentationStyle="fullScreen"
        statusBarTranslucent
      >
        <PinLockScreen
          title="Enter PIN"
          subtitle="Please enter your PIN to continue"
          onSuccess={handlePinSuccess}
          onCancel={undefined} // No cancel option for app unlock
          allowBiometric={true}
          testID="pin-auth-guard-screen"
        />
      </Modal>
    </>
  );
}

export default PinAuthGuard;