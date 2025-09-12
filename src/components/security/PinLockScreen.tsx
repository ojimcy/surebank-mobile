/**
 * SureBank PIN Lock Screen Component
 * 
 * Full-screen PIN authentication with biometric fallback,
 * used for app unlock and secure operations.
 */

import React, { useState, useEffect, useCallback } from 'react';
import { 
  View, 
  Text, 
  StatusBar,
  SafeAreaView,
  Image,
  Pressable,
  Alert,
  ViewStyle,
  AccessibilityRole,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { usePinSecurity } from '@/contexts/PinSecurityContext';
import PinInput from './PinInput';
import BiometricPrompt from './BiometricPrompt';
import clsx from 'clsx';

export interface PinLockScreenProps {
  // Configuration
  title?: string;
  subtitle?: string;
  showLogo?: boolean;
  allowBiometric?: boolean;
  
  // Callbacks
  onSuccess?: () => void;
  onCancel?: () => void;
  
  // Styling
  style?: ViewStyle;
  backgroundColor?: string;
  
  // Accessibility
  testID?: string;
}

export function PinLockScreen({
  title = 'Enter PIN',
  subtitle = 'Please enter your PIN to continue',
  showLogo = true,
  allowBiometric = true,
  onSuccess,
  onCancel,
  style,
  backgroundColor = '#ffffff',
  testID,
}: PinLockScreenProps) {
  const [pin, setPin] = useState('');
  const [showBiometric, setShowBiometric] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [attemptCount, setAttemptCount] = useState(0);
  
  const pinSecurity = usePinSecurity();

  // Check if biometric should be shown on mount
  useEffect(() => {
    if (allowBiometric && 
        pinSecurity.biometricConfig.isAvailable && 
        pinSecurity.isBiometricEnabled) {
      // Small delay to let the screen render first
      const timer = setTimeout(() => {
        setShowBiometric(true);
      }, 500);
      
      return () => clearTimeout(timer);
    }
  }, [
    allowBiometric, 
    pinSecurity.biometricConfig.isAvailable, 
    pinSecurity.isBiometricEnabled
  ]);

  // Handle PIN input change
  const handlePinChange = useCallback((newPin: string) => {
    setPin(newPin);
    setErrorMessage('');
  }, []);

  // Handle PIN completion
  const handlePinComplete = useCallback(async (completedPin: string) => {
    if (isVerifying) return;

    try {
      setIsVerifying(true);
      setErrorMessage('');

      const isValid = await pinSecurity.verifyPin(completedPin);
      
      if (isValid) {
        onSuccess?.();
      } else {
        // Show error and clear PIN
        setPin('');
        setAttemptCount(prev => prev + 1);
        setErrorMessage(pinSecurity.error || 'Incorrect PIN');
      }
    } catch (error) {
      setPin('');
      setErrorMessage('PIN verification failed');
    } finally {
      setIsVerifying(false);
    }
  }, [isVerifying, pinSecurity, onSuccess]);

  // Handle biometric success
  const handleBiometricSuccess = useCallback(() => {
    setShowBiometric(false);
    onSuccess?.();
  }, [onSuccess]);

  // Handle biometric cancel/fallback
  const handleBiometricFallback = useCallback(() => {
    setShowBiometric(false);
  }, []);

  // Handle biometric error
  const handleBiometricError = useCallback((error: string) => {
    console.error('Biometric authentication error:', error);
    setShowBiometric(false);
  }, []);

  // Show biometric prompt
  const showBiometricPrompt = useCallback(() => {
    if (pinSecurity.biometricConfig.isAvailable && pinSecurity.isBiometricEnabled) {
      setShowBiometric(true);
    } else {
      Alert.alert(
        'Biometric Unavailable',
        'Biometric authentication is not available on this device or not set up.',
        [{ text: 'OK' }]
      );
    }
  }, [pinSecurity.biometricConfig.isAvailable, pinSecurity.isBiometricEnabled]);

  // Get lockout message
  const getLockoutMessage = () => {
    if (pinSecurity.lockoutUntil) {
      const timeRemaining = Math.ceil((pinSecurity.lockoutUntil.getTime() - Date.now()) / 1000);
      if (timeRemaining > 0) {
        return `Too many attempts. Try again in ${timeRemaining} seconds.`;
      }
    }
    return '';
  };

  const lockoutMessage = getLockoutMessage();
  const isLocked = !!lockoutMessage;

  return (
    <SafeAreaView 
      className="flex-1"
      style={[{ backgroundColor }, style]}
      testID={testID}
    >
      <StatusBar barStyle="dark-content" backgroundColor={backgroundColor} />
      
      <View className="flex-1 px-6 py-8">
        {/* Header */}
        <View className="items-center mb-8">
          {/* Logo */}
          {showLogo && (
            <View className="mb-6">
              <View className="w-16 h-16 bg-primary-600 rounded-2xl items-center justify-center">
                <Ionicons name="shield-checkmark" size={32} color="white" />
              </View>
            </View>
          )}

          {/* Title */}
          <Text className="text-2xl font-bold text-gray-900 text-center mb-2">
            {title}
          </Text>

          {/* Subtitle */}
          <Text className="text-gray-600 text-center">
            {lockoutMessage || subtitle}
          </Text>
        </View>

        {/* PIN Input */}
        <View className="flex-1 justify-center">
          <PinInput
            length={pinSecurity.pinLength}
            value={pin}
            onChangeText={handlePinChange}
            onComplete={handlePinComplete}
            loading={isVerifying}
            error={!!errorMessage || isLocked}
            errorMessage={errorMessage || lockoutMessage}
            disabled={isLocked}
            secureTextEntry
            accessibilityLabel="Enter your PIN"
            accessibilityHint="Use the number pad to enter your PIN"
          />
        </View>

        {/* Bottom Actions */}
        <View className="items-center space-y-4">
          {/* Biometric Button */}
          {allowBiometric && 
           pinSecurity.biometricConfig.isAvailable && 
           pinSecurity.isBiometricEnabled && 
           !isLocked && (
            <Pressable
              onPress={showBiometricPrompt}
              disabled={isVerifying}
              className={clsx(
                'flex-row items-center justify-center py-3 px-6 rounded-xl',
                'bg-gray-100 active:bg-gray-200',
                isVerifying && 'opacity-50'
              )}
              accessibilityRole="button" as AccessibilityRole
              accessibilityLabel="Use biometric authentication"
            >
              <Ionicons 
                name={
                  pinSecurity.biometricConfig.supportedTypes.includes('faceId') 
                    ? 'scan-outline' 
                    : 'finger-print-outline'
                } 
                size={20} 
                color="#374151" 
              />
              <Text className="text-gray-700 font-medium ml-2">
                Use {
                  pinSecurity.biometricConfig.supportedTypes.includes('faceId') 
                    ? 'Face ID' 
                    : 'Touch ID'
                }
              </Text>
            </Pressable>
          )}

          {/* Cancel Button */}
          {onCancel && (
            <Pressable
              onPress={onCancel}
              disabled={isVerifying}
              className={clsx(
                'py-3 px-6',
                isVerifying && 'opacity-50'
              )}
              accessibilityRole="button" as AccessibilityRole
              accessibilityLabel="Cancel PIN entry"
            >
              <Text className="text-gray-500 font-medium">
                Cancel
              </Text>
            </Pressable>
          )}

          {/* Attempt Counter */}
          {attemptCount > 0 && !isLocked && (
            <Text className="text-sm text-gray-500 text-center">
              {pinSecurity.maxAttempts - pinSecurity.failedAttempts} attempts remaining
            </Text>
          )}
        </View>
      </View>

      {/* Biometric Prompt */}
      <BiometricPrompt
        visible={showBiometric}
        title="Authenticate"
        subtitle={`Use ${
          pinSecurity.biometricConfig.supportedTypes.includes('faceId') 
            ? 'Face ID' 
            : 'Touch ID'
        } to unlock`}
        onSuccess={handleBiometricSuccess}
        onCancel={handleBiometricFallback}
        onFallback={handleBiometricFallback}
        onError={handleBiometricError}
        disableDeviceFallback={false}
        fallbackLabel="Use PIN"
      />
    </SafeAreaView>
  );
}

export default PinLockScreen;