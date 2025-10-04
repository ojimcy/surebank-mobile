/**
 * SureBank Verification Screen
 * 
 * OTP verification screen for email/phone verification
 * with resend functionality and professional UI.
 */

import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StatusBar,
  Pressable,
  Alert,
  TextInput,
  Keyboard,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AuthStackParamList } from '@/navigation/types';
import { PrimaryButton, OutlineButton } from '@/components/forms';
import { useVerifyAccountMutation, useResendVerificationMutation } from '@/hooks/auth';
import { withActivityTracking, useActivityTracking } from '@/components/security/ActivityTracker';
import clsx from 'clsx';

type Props = NativeStackScreenProps<AuthStackParamList, 'Verification'>;

const OTP_LENGTH = 6;
const RESEND_COOLDOWN = 60; // seconds

function VerificationScreen({ navigation, route }: Props) {
  const { identifier } = route.params;
  const [otp, setOtp] = useState<string[]>(Array(OTP_LENGTH).fill(''));
  const [activeIndex, setActiveIndex] = useState(0);
  const [resendCooldown, setResendCooldown] = useState(0);
  const [isKeyboardVisible, setIsKeyboardVisible] = useState(false);
  
  const inputRefs = useRef<(TextInput | null)[]>(Array(OTP_LENGTH).fill(null));
  const cooldownTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  
  const { trackFormSubmission } = useActivityTracking();
  const verifyMutation = useVerifyAccountMutation();
  const resendMutation = useResendVerificationMutation();

  // Handle keyboard visibility
  useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener('keyboardDidShow', () => {
      setIsKeyboardVisible(true);
    });
    const keyboardDidHideListener = Keyboard.addListener('keyboardDidHide', () => {
      setIsKeyboardVisible(false);
    });

    return () => {
      keyboardDidShowListener?.remove();
      keyboardDidHideListener?.remove();
    };
  }, []);

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (cooldownTimer.current) {
        clearInterval(cooldownTimer.current);
      }
    };
  }, []);

  // Start cooldown timer
  const startCooldown = () => {
    setResendCooldown(RESEND_COOLDOWN);
    cooldownTimer.current = setInterval(() => {
      setResendCooldown((prev) => {
        if (prev <= 1) {
          if (cooldownTimer.current) {
            clearInterval(cooldownTimer.current);
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  // Focus first empty input on mount
  useEffect(() => {
    const timer = setTimeout(() => {
      inputRefs.current[0]?.focus();
    }, 500);
    
    return () => clearTimeout(timer);
  }, []);

  // Auto-submit when OTP is complete
  useEffect(() => {
    const otpString = otp.join('');
    if (otpString.length === OTP_LENGTH && !verifyMutation.isPending) {
      handleVerify(otpString);
    }
  }, [otp, verifyMutation.isPending]);

  const handleBackPress = () => {
    navigation.goBack();
  };

  const handleOtpChange = (index: number, value: string) => {
    // Only allow numeric input
    const numericValue = value.replace(/[^0-9]/g, '');
    
    if (numericValue.length <= 1) {
      const newOtp = [...otp];
      newOtp[index] = numericValue;
      setOtp(newOtp);

      // Move to next input if value is entered
      if (numericValue && index < OTP_LENGTH - 1) {
        setActiveIndex(index + 1);
        inputRefs.current[index + 1]?.focus();
      }
    } else if (numericValue.length > 1) {
      // Handle paste operation
      const pastedDigits = numericValue.slice(0, OTP_LENGTH);
      const newOtp = [...otp];
      
      for (let i = 0; i < pastedDigits.length && (index + i) < OTP_LENGTH; i++) {
        newOtp[index + i] = pastedDigits[i];
      }
      
      setOtp(newOtp);
      
      // Focus the next empty input or the last input
      const nextIndex = Math.min(index + pastedDigits.length, OTP_LENGTH - 1);
      setActiveIndex(nextIndex);
      inputRefs.current[nextIndex]?.focus();
    }
  };

  const handleKeyPress = (index: number, key: string) => {
    if (key === 'Backspace') {
      if (otp[index]) {
        // Clear current input
        const newOtp = [...otp];
        newOtp[index] = '';
        setOtp(newOtp);
      } else if (index > 0) {
        // Move to previous input and clear it
        const newOtp = [...otp];
        newOtp[index - 1] = '';
        setOtp(newOtp);
        setActiveIndex(index - 1);
        inputRefs.current[index - 1]?.focus();
      }
    }
  };

  const handleVerify = async (otpCode: string) => {
    try {
      trackFormSubmission();

      const result = await verifyMutation.mutateAsync({
        code: otpCode,
        email: identifier,
      });

      // Show success and navigate to PIN setup
      Alert.alert(
        'Account Verified!',
        'Your account has been successfully verified.',
        [
          {
            text: 'Continue',
            onPress: () => navigation.navigate('PINSetup'),
          },
        ]
      );
    } catch (error) {
      // Clear OTP on error
      setOtp(Array(OTP_LENGTH).fill(''));
      setActiveIndex(0);
      inputRefs.current[0]?.focus();
    }
  };

  const handleResendCode = async () => {
    if (resendCooldown > 0) return;

    try {
      await resendMutation.mutateAsync(identifier);
      
      Alert.alert(
        'Code Sent',
        'A new verification code has been sent to your email.',
        [{ text: 'OK' }]
      );
      
      startCooldown();
      
      // Clear current OTP
      setOtp(Array(OTP_LENGTH).fill(''));
      setActiveIndex(0);
      inputRefs.current[0]?.focus();
    } catch (error) {
      // Error is handled by the mutation
    }
  };

  const handleClearOtp = () => {
    setOtp(Array(OTP_LENGTH).fill(''));
    setActiveIndex(0);
    inputRefs.current[0]?.focus();
  };

  const otpString = otp.join('');
  const isComplete = otpString.length === OTP_LENGTH;
  const canResend = resendCooldown === 0 && !resendMutation.isPending;

  return (
    <SafeAreaView className="flex-1 bg-white">
      <StatusBar barStyle="dark-content" backgroundColor="white" />
      
      <View className="flex-1">
        {/* Header */}
        <View className="flex-row items-center justify-between px-6 py-4">
          <Pressable
            onPress={handleBackPress}
            className="w-10 h-10 items-center justify-center rounded-full active:bg-gray-100"
            accessibilityRole="button"
            accessibilityLabel="Go back"
          >
            <Ionicons name="arrow-back" size={24} color="#374151" />
          </Pressable>
          
          <Text className="text-lg font-semibold text-gray-900">
            Verification
          </Text>
          
          <View className="w-10" />
        </View>

        <View className="flex-1 px-6 py-8">
          {/* Icon and Title */}
          <View className="items-center mb-8">
            <View className="w-20 h-20 bg-primary-100 rounded-full items-center justify-center mb-6">
              <Ionicons name="mail-outline" size={40} color="#0066A1" />
            </View>
            
            <Text className="text-2xl font-bold text-gray-900 text-center mb-4">
              Enter verification code
            </Text>
            
            <Text className="text-gray-600 text-center leading-6">
              We've sent a 6-digit code to{'\n'}
              <Text className="font-semibold text-gray-900">{identifier}</Text>
            </Text>
          </View>

          {/* Error Display */}
          {verifyMutation.error && (
            <View className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
              <Text className="text-red-800 font-medium text-center">
                {verifyMutation.error.message}
              </Text>
            </View>
          )}

          {/* OTP Input */}
          <View className="mb-8">
            <View className="flex-row justify-center items-center space-x-3 mb-4">
              {otp.map((digit, index) => (
                <View key={index} className="relative">
                  <TextInput
                    ref={(ref) => { inputRefs.current[index] = ref; }}
                    value={digit}
                    onChangeText={(value) => handleOtpChange(index, value)}
                    onKeyPress={({ nativeEvent }) => handleKeyPress(index, nativeEvent.key)}
                    onFocus={() => setActiveIndex(index)}
                    maxLength={1}
                    keyboardType="numeric"
                    textContentType="oneTimeCode"
                    className={clsx(
                      'w-12 h-14 border-2 rounded-lg text-center text-xl font-semibold',
                      digit ? (
                        verifyMutation.error 
                          ? 'border-red-500 bg-red-50 text-red-700'
                          : 'border-primary-500 bg-primary-50 text-primary-700'
                      ) : (
                        activeIndex === index 
                          ? 'border-primary-300 bg-white text-gray-900'
                          : 'border-gray-300 bg-white text-gray-900'
                      )
                    )}
                    accessibilityLabel={`Digit ${index + 1} of ${OTP_LENGTH}`}
                    accessibilityHint="Enter verification code digit"
                  />
                  
                  {/* Loading indicator for active input */}
                  {verifyMutation.isPending && activeIndex === index && digit && (
                    <View className="absolute inset-0 items-center justify-center">
                      <View className="w-6 h-6 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
                    </View>
                  )}
                </View>
              ))}
            </View>

            {/* Actions */}
            <View className="flex-row justify-center space-x-6">
              <Pressable
                onPress={handleClearOtp}
                disabled={otpString.length === 0}
                className={clsx(
                  'flex-row items-center py-2 px-3 rounded-lg',
                  otpString.length === 0 ? 'opacity-30' : 'active:bg-gray-100'
                )}
                accessibilityRole="button"
                accessibilityLabel="Clear verification code"
              >
                <Ionicons name="backspace-outline" size={20} color="#6b7280" />
                <Text className="text-gray-600 font-medium ml-1">Clear</Text>
              </Pressable>
            </View>
          </View>

          {/* Resend Section */}
          <View className="items-center mb-8">
            <Text className="text-gray-600 mb-4">
              Didn't receive the code?
            </Text>
            
            <OutlineButton
              title={
                resendCooldown > 0 
                  ? `Resend in ${resendCooldown}s` 
                  : 'Resend Code'
              }
              onPress={handleResendCode}
              disabled={!canResend}
              loading={resendMutation.isPending}
              leftIcon="refresh-outline"
              size="md"
              accessibilityLabel="Resend verification code"
              accessibilityHint={
                canResend 
                  ? "Send a new verification code" 
                  : `Wait ${resendCooldown} seconds to resend`
              }
            />
          </View>

          {/* Manual Verify Button (for accessibility/backup) */}
          {!isKeyboardVisible && (
            <View className="mt-auto">
              <PrimaryButton
                title="Verify Code"
                onPress={() => handleVerify(otpString)}
                loading={verifyMutation.isPending}
                disabled={!isComplete}
                size="lg"
                fullWidth
                leftIcon="checkmark-circle-outline"
                accessibilityLabel="Verify code"
                accessibilityHint="Verify the entered code"
              />
            </View>
          )}
        </View>
      </View>
    </SafeAreaView>
  );
}

export default withActivityTracking(VerificationScreen);