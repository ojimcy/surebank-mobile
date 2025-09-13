/**
 * SureBank Security Components
 * 
 * PIN input, biometric authentication, session management,
 * and comprehensive security-related components
 */

export { default as PinInput } from './PinInput';
export type { PinInputProps } from './PinInput';

export { default as BiometricPrompt } from './BiometricPrompt';
export type { BiometricPromptProps } from './BiometricPrompt';

export { default as PinLockScreen } from './PinLockScreen';
export type { PinLockScreenProps } from './PinLockScreen';

export { default as PinAuthGuard } from './PinAuthGuard';

export { default as SecurityProvider } from './SecurityProvider';

export { 
  default as ActivityTracker,
  withActivityTracking,
  useActivityTracking,
} from './ActivityTracker';

// Services
export { default as pinVerificationService } from '@/services/security/PinVerificationService';
export { default as PinVerificationModal } from './PinVerificationModal';

// Hooks  
export { default as usePinVerification } from '@/hooks/usePinVerification';

export { default as sessionManager } from '@/services/security/SessionManager';
export { default as useSession } from '@/hooks/useSession';