/**
 * Password Recovery - Code Step
 * 
 * Second step where user enters the reset code sent to their email.
 */

import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TextInput, Pressable, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { OutlineButton } from '@/components/forms';
import { useVerifyResetCodeMutation, usePasswordResetMutation } from '@/hooks/auth';
import { useActivityTracking } from '@/components/security/ActivityTracker';
import clsx from 'clsx';

const CODE_LENGTH = 6;
const RESEND_COOLDOWN = 60;

interface CodeStepProps {
  email: string;
  onVerified: (code: string) => void;
  onResendEmail: () => void;
}

export default function CodeStep({ email, onVerified, onResendEmail }: CodeStepProps) {
  const [code, setCode] = useState<string[]>(Array(CODE_LENGTH).fill(''));
  const [activeIndex, setActiveIndex] = useState(0);
  const [resendCooldown, setResendCooldown] = useState(0);
  
  const inputRefs = useRef<(TextInput | null)[]>(Array(CODE_LENGTH).fill(null));
  const cooldownTimer = useRef<NodeJS.Timeout | null>(null);
  
  const { trackFormSubmission } = useActivityTracking();
  const verifyCodeMutation = useVerifyResetCodeMutation();
  const passwordResetMutation = usePasswordResetMutation();

  // Cleanup timer
  useEffect(() => {
    return () => {
      if (cooldownTimer.current) {
        clearInterval(cooldownTimer.current);
      }
    };
  }, []);

  // Auto-focus first input
  useEffect(() => {
    const timer = setTimeout(() => {
      inputRefs.current[0]?.focus();
    }, 500);
    
    return () => clearTimeout(timer);
  }, []);

  // Auto-submit when code is complete
  useEffect(() => {
    const codeString = code.join('');
    if (codeString.length === CODE_LENGTH && !verifyCodeMutation.isPending) {
      handleVerifyCode(codeString);
    }
  }, [code, verifyCodeMutation.isPending]);

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

  const handleCodeChange = (index: number, value: string) => {
    const numericValue = value.replace(/[^0-9]/g, '');
    
    if (numericValue.length <= 1) {
      const newCode = [...code];
      newCode[index] = numericValue;
      setCode(newCode);

      if (numericValue && index < CODE_LENGTH - 1) {
        setActiveIndex(index + 1);
        inputRefs.current[index + 1]?.focus();
      }
    } else if (numericValue.length > 1) {
      const pastedDigits = numericValue.slice(0, CODE_LENGTH);
      const newCode = [...code];
      
      for (let i = 0; i < pastedDigits.length && (index + i) < CODE_LENGTH; i++) {
        newCode[index + i] = pastedDigits[i];
      }
      
      setCode(newCode);
      
      const nextIndex = Math.min(index + pastedDigits.length, CODE_LENGTH - 1);
      setActiveIndex(nextIndex);
      inputRefs.current[nextIndex]?.focus();
    }
  };

  const handleKeyPress = (index: number, key: string) => {
    if (key === 'Backspace') {
      if (code[index]) {
        const newCode = [...code];
        newCode[index] = '';
        setCode(newCode);
      } else if (index > 0) {
        const newCode = [...code];
        newCode[index - 1] = '';
        setCode(newCode);
        setActiveIndex(index - 1);
        inputRefs.current[index - 1]?.focus();
      }
    }
  };

  const handleVerifyCode = async (resetCode: string) => {
    try {
      trackFormSubmission();

      await verifyCodeMutation.mutateAsync({
        code: resetCode,
        email,
      });

      onVerified(resetCode);
    } catch (error) {
      // Clear code on error
      setCode(Array(CODE_LENGTH).fill(''));
      setActiveIndex(0);
      inputRefs.current[0]?.focus();
    }
  };

  const handleResendCode = async () => {
    if (resendCooldown > 0) return;

    try {
      await passwordResetMutation.mutateAsync({ email });
      
      Alert.alert(
        'Code Sent',
        'A new reset code has been sent to your email.',
        [{ text: 'OK' }]
      );
      
      startCooldown();
      setCode(Array(CODE_LENGTH).fill(''));
      setActiveIndex(0);
      inputRefs.current[0]?.focus();
    } catch (error) {
      // Error handled by mutation
    }
  };

  const handleClearCode = () => {
    setCode(Array(CODE_LENGTH).fill(''));
    setActiveIndex(0);
    inputRefs.current[0]?.focus();
  };

  const codeString = code.join('');
  const canResend = resendCooldown === 0 && !passwordResetMutation.isPending;

  return (
    <View className="flex-1 px-6 py-8">
      {/* Header */}
      <View className="items-center mb-8">
        <View className="w-20 h-20 bg-primary-100 rounded-full items-center justify-center mb-6">
          <Ionicons name="key-outline" size={40} color="#0066A1" />
        </View>
        
        <Text className="text-2xl font-bold text-gray-900 text-center mb-4">
          Enter reset code
        </Text>
        
        <Text className="text-gray-600 text-center leading-6">
          We've sent a 6-digit code to{'\n'}
          <Text className="font-semibold text-gray-900">{email}</Text>
        </Text>
      </View>

      {/* Error Display */}
      {verifyCodeMutation.error && (
        <View className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <Text className="text-red-800 font-medium text-center">
            {verifyCodeMutation.error.message}
          </Text>
        </View>
      )}

      {/* Code Input */}
      <View className="mb-8">
        <View className="flex-row justify-center items-center space-x-3 mb-4">
          {code.map((digit, index) => (
            <TextInput
              key={index}
              ref={(ref) => (inputRefs.current[index] = ref)}
              value={digit}
              onChangeText={(value) => handleCodeChange(index, value)}
              onKeyPress={({ nativeEvent }) => handleKeyPress(index, nativeEvent.key)}
              onFocus={() => setActiveIndex(index)}
              maxLength={1}
              keyboardType="numeric"
              textContentType="oneTimeCode"
              className={clsx(
                'w-12 h-14 border-2 rounded-lg text-center text-xl font-semibold',
                digit ? (
                  verifyCodeMutation.error 
                    ? 'border-red-500 bg-red-50 text-red-700'
                    : 'border-primary-500 bg-primary-50 text-primary-700'
                ) : (
                  activeIndex === index 
                    ? 'border-primary-300 bg-white text-gray-900'
                    : 'border-gray-300 bg-white text-gray-900'
                )
              )}
              accessibilityLabel={`Reset code digit ${index + 1} of ${CODE_LENGTH}`}
            />
          ))}
        </View>

        {/* Clear Button */}
        <View className="flex-row justify-center">
          <Pressable
            onPress={handleClearCode}
            disabled={codeString.length === 0}
            className={clsx(
              'flex-row items-center py-2 px-3 rounded-lg',
              codeString.length === 0 ? 'opacity-30' : 'active:bg-gray-100'
            )}
            accessibilityRole="button"
            accessibilityLabel="Clear reset code"
          >
            <Ionicons name="backspace-outline" size={20} color="#6b7280" />
            <Text className="text-gray-600 font-medium ml-1">Clear</Text>
          </Pressable>
        </View>
      </View>

      {/* Resend Section */}
      <View className="items-center space-y-4">
        <Text className="text-gray-600">
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
          loading={passwordResetMutation.isPending}
          leftIcon="refresh-outline"
          size="md"
        />
        
        <Pressable onPress={onResendEmail}>
          <Text className="text-primary-600 font-medium">
            Use different email?
          </Text>
        </Pressable>
      </View>
    </View>
  );
}