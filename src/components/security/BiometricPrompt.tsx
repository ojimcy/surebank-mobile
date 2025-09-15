/**
 * SureBank Biometric Authentication Component
 * 
 * Professional biometric authentication prompt with fallback options,
 * error handling, and accessibility features.
 */

import React, { useState, useCallback, useEffect } from 'react';
import { 
  View, 
  Text, 
  Modal,
  Pressable,
  Alert,
  ViewStyle,
  AccessibilityRole,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as LocalAuthentication from 'expo-local-authentication';
import * as Haptics from 'expo-haptics';
import clsx from 'clsx';
import { usePinSecurity } from '@/contexts/PinSecurityContext';

export interface BiometricPromptProps {
  // Visibility
  visible?: boolean;
  
  // Configuration
  title?: string;
  subtitle?: string;
  description?: string;
  cancelLabel?: string;
  fallbackLabel?: string;
  
  // Callbacks
  onSuccess?: () => void;
  onCancel?: () => void;
  onError?: (error: string) => void;
  onFallback?: () => void;
  
  // Options
  allowDeviceFallback?: boolean;
  disableDeviceFallback?: boolean;
  requireConfirmation?: boolean;
  
  // Styling
  containerStyle?: ViewStyle;
  
  // Accessibility
  testID?: string;
}

export function BiometricPrompt({
  visible = false,
  title = 'Authenticate',
  subtitle = 'Use your biometric to continue',
  description = 'Place your finger on the sensor or look at the front camera to authenticate',
  cancelLabel = 'Cancel',
  fallbackLabel = 'Use PIN',
  onSuccess,
  onCancel,
  onError,
  onFallback,
  allowDeviceFallback = true,
  disableDeviceFallback = false,
  requireConfirmation = true,
  containerStyle,
  testID,
}: BiometricPromptProps) {
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const pinSecurity = usePinSecurity();

  // Check biometric availability
  const [biometricType, setBiometricType] = useState<string>('biometric');
  
  useEffect(() => {
    const checkBiometricType = async () => {
      try {
        const types = await LocalAuthentication.supportedAuthenticationTypesAsync();
        if (types.includes(LocalAuthentication.AuthenticationType.FACIAL_RECOGNITION)) {
          setBiometricType('Face ID');
        } else if (types.includes(LocalAuthentication.AuthenticationType.FINGERPRINT)) {
          setBiometricType('Touch ID');
        } else {
          setBiometricType('biometric');
        }
      } catch (error) {
        console.error('Failed to check biometric type:', error);
        setBiometricType('biometric');
      }
    };

    if (visible) {
      checkBiometricType();
    }
  }, [visible]);

  // Get appropriate icon based on biometric type
  const getBiometricIcon = () => {
    if (biometricType === 'Face ID') {
      return 'scan-outline';
    } else if (biometricType === 'Touch ID') {
      return 'finger-print-outline';
    }
    return 'shield-checkmark-outline';
  };

  // Handle biometric authentication
  const handleBiometricAuth = useCallback(async () => {
    try {
      setIsAuthenticating(true);
      setAuthError(null);

      // Check if biometric is available
      const isAvailable = await LocalAuthentication.hasHardwareAsync();
      const isEnrolled = await LocalAuthentication.isEnrolledAsync();

      if (!isAvailable || !isEnrolled) {
        setAuthError('Biometric authentication is not available');
        onError?.('Biometric authentication is not available');
        return;
      }

      // Perform biometric authentication
      const result = await LocalAuthentication.authenticateAsync({
        promptMessage: title,
        cancelLabel: cancelLabel,
        fallbackLabel: disableDeviceFallback ? undefined : fallbackLabel,
        disableDeviceFallback: disableDeviceFallback,
        requireConfirmation: requireConfirmation,
      });

      if (result.success) {
        // Success haptic feedback
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        onSuccess?.();
      } else if (result.error === 'user_cancel') {
        // User cancelled
        onCancel?.();
      } else if (result.error === 'user_fallback') {
        // User chose fallback (PIN)
        onFallback?.();
      } else {
        // Authentication failed
        const errorMessage = result.error === 'authentication_failed' 
          ? 'Authentication failed. Please try again.'
          : 'Biometric authentication failed';
        
        setAuthError(errorMessage);
        onError?.(errorMessage);
        
        // Error haptic feedback
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      }
    } catch (error) {
      const errorMessage = 'An error occurred during authentication';
      setAuthError(errorMessage);
      onError?.(errorMessage);
      
      // Error haptic feedback
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    } finally {
      setIsAuthenticating(false);
    }
  }, [
    title, 
    subtitle, 
    cancelLabel, 
    fallbackLabel, 
    disableDeviceFallback, 
    requireConfirmation,
    onSuccess, 
    onCancel, 
    onError, 
    onFallback
  ]);

  // Auto-start authentication when modal opens
  useEffect(() => {
    if (visible && !isAuthenticating && !authError) {
      // Small delay to ensure modal is fully visible
      const timer = setTimeout(() => {
        handleBiometricAuth();
      }, 300);

      return () => clearTimeout(timer);
    }
  }, [visible, isAuthenticating, authError, handleBiometricAuth]);

  // Handle modal close
  const handleClose = useCallback(() => {
    setAuthError(null);
    onCancel?.();
  }, [onCancel]);

  // Handle retry
  const handleRetry = useCallback(() => {
    setAuthError(null);
    handleBiometricAuth();
  }, [handleBiometricAuth]);

  if (!visible) return null;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      statusBarTranslucent
      onRequestClose={handleClose}
      testID={testID}
    >
      <View className="flex-1 bg-black/50 justify-center items-center px-6">
        <View 
          className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-lg"
          style={containerStyle}
        >
          {/* Header */}
          <View className="items-center mb-6">
            {/* Icon */}
            <View 
              className={clsx(
                'w-16 h-16 rounded-full items-center justify-center mb-4',
                authError ? 'bg-red-100' : 'bg-primary-100'
              )}
            >
              <Ionicons 
                name={authError ? 'alert-circle-outline' : getBiometricIcon()} 
                size={32} 
                color={authError ? '#dc2626' : '#0066A1'} 
              />
            </View>

            {/* Title */}
            <Text className="text-xl font-semibold text-gray-900 text-center mb-2">
              {authError ? 'Authentication Failed' : title}
            </Text>

            {/* Subtitle */}
            <Text className="text-gray-600 text-center">
              {authError ? authError : subtitle}
            </Text>
          </View>

          {/* Description (when no error) */}
          {!authError && description && (
            <Text className="text-gray-500 text-center text-sm mb-6">
              {description.replace('biometric', biometricType)}
            </Text>
          )}

          {/* Loading State */}
          {isAuthenticating && !authError && (
            <View className="items-center mb-6">
              <View className="flex-row items-center">
                <Ionicons name="ellipsis-horizontal" size={24} color="#6b7280" />
                <Text className="text-gray-500 ml-2">Authenticating...</Text>
              </View>
            </View>
          )}

          {/* Action Buttons */}
          <View className="space-y-3">
            {authError ? (
              // Error state buttons
              <>
                <Pressable
                  onPress={handleRetry}
                  className="bg-primary-600 active:bg-primary-700 py-3 px-6 rounded-lg items-center"
                  accessibilityRole="button"
                  accessibilityLabel="Retry authentication"
                >
                  <Text className="text-white font-semibold">
                    Try Again
                  </Text>
                </Pressable>

                {!disableDeviceFallback && (
                  <Pressable
                    onPress={onFallback}
                    className="bg-gray-100 active:bg-gray-200 py-3 px-6 rounded-lg items-center"
                    accessibilityRole="button"
                    accessibilityLabel="Use PIN instead"
                  >
                    <Text className="text-gray-700 font-semibold">
                      {fallbackLabel}
                    </Text>
                  </Pressable>
                )}

                <Pressable
                  onPress={handleClose}
                  className="py-3 px-6 items-center"
                  accessibilityRole="button"
                  accessibilityLabel="Cancel authentication"
                >
                  <Text className="text-gray-500 font-medium">
                    {cancelLabel}
                  </Text>
                </Pressable>
              </>
            ) : (
              // Normal state buttons
              <>
                {!disableDeviceFallback && (
                  <Pressable
                    onPress={onFallback}
                    disabled={isAuthenticating}
                    className={clsx(
                      'bg-gray-100 active:bg-gray-200 py-3 px-6 rounded-lg items-center',
                      isAuthenticating && 'opacity-50'
                    )}
                    accessibilityRole="button"
                    accessibilityLabel="Use PIN instead"
                  >
                    <Text className="text-gray-700 font-semibold">
                      {fallbackLabel}
                    </Text>
                  </Pressable>
                )}

                <Pressable
                  onPress={handleClose}
                  disabled={isAuthenticating}
                  className={clsx(
                    'py-3 px-6 items-center',
                    isAuthenticating && 'opacity-50'
                  )}
                  accessibilityRole="button"
                  accessibilityLabel="Cancel authentication"
                >
                  <Text className="text-gray-500 font-medium">
                    {cancelLabel}
                  </Text>
                </Pressable>
              </>
            )}
          </View>
        </View>
      </View>
    </Modal>
  );
}

export default BiometricPrompt;