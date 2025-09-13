/**
 * SureBank PIN Guard
 * 
 * Navigation guard that enforces PIN authentication for secure screens.
 * Shows PIN lock screen when app is locked.
 */

import React, { ReactNode } from 'react';
import { usePinSecurity } from '@/contexts/PinSecurityContext';
import { PinLockScreen } from '@/components/security';

interface PinGuardProps {
  children: ReactNode;
  requirePin?: boolean;
  title?: string;
  subtitle?: string;
}

export function PinGuard({ 
  children, 
  requirePin = true,
  title = 'Enter PIN',
  subtitle = 'Please enter your PIN to continue'
}: PinGuardProps) {
  const { isLocked, isPinSet, unlock } = usePinSecurity();

  // If PIN is not required or not set, show children
  if (!requirePin || !isPinSet) {
    return <>{children}</>;
  }

  // If locked, show PIN screen
  if (isLocked) {
    return (
      <PinLockScreen
        title={title}
        subtitle={subtitle}
        onSuccess={unlock}
        allowBiometric={true}
      />
    );
  }

  // Show children if unlocked
  return <>{children}</>;
}

export default PinGuard;