/**
 * SureBank Login Form Component
 * 
 * Professional login form with validation, error handling,
 * and integration with authentication services.
 */

import React, { useRef } from 'react';
import { View, Text, TextInput } from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import {
  Form,
  FormField,
  PrimaryButton,
  GhostButton,
  Checkbox
} from '@/components/forms';
import { useLoginMutation } from '@/hooks/auth';
import { useActivityTracking } from '@/components/security/ActivityTracker';
import { LoginFormData } from '@/services/api/types';

// Login form validation schema
const loginSchema = yup.object().shape({
  identifier: yup
    .string()
    .required('Email or phone number is required')
    .test('email-or-phone', 'Please enter a valid email or phone number', (value) => {
      if (!value) return false;
      
      // Check if it's a valid email
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (emailRegex.test(value)) return true;
      
      // Check if it's a valid phone number (basic validation)
      const phoneRegex = /^\+?[\d\s-()]+$/;
      if (phoneRegex.test(value) && value.replace(/\D/g, '').length >= 10) return true;
      
      return false;
    }),
  password: yup
    .string()
    .required('Password is required')
    .min(8, 'Password must be at least 8 characters'),
  rememberMe: yup.boolean().default(false),
});

interface LoginFormProps {
  onSuccess?: () => void;
  onForgotPassword?: () => void;
  onSwitchToRegister?: () => void;
}

export default function LoginForm({
  onSuccess,
  onForgotPassword,
  onSwitchToRegister,
}: LoginFormProps) {
  const { trackFormSubmission } = useActivityTracking();
  const loginMutation = useLoginMutation();

  // Refs for keyboard navigation
  const passwordRef = useRef<TextInput>(null);

  const {
    control,
    handleSubmit,
    formState: { isSubmitting },
    watch,
  } = useForm<LoginFormData>({
    resolver: yupResolver(loginSchema),
    defaultValues: {
      identifier: '',
      password: '',
      rememberMe: false,
    },
  });

  const watchIdentifier = watch('identifier');

  // Determine if identifier looks like email or phone
  const getIdentifierType = (value: string) => {
    if (!value) return 'email';
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(value) ? 'email' : 'phone';
  };

  const identifierType = getIdentifierType(watchIdentifier);

  const onSubmit = async (data: LoginFormData) => {
    try {
      trackFormSubmission();

      await loginMutation.mutateAsync({
        identifier: data.identifier.trim(),
        password: data.password,
      });

      onSuccess?.();
    } catch (error) {
      // Error handling is managed by the mutation
      // Additional error handling can be added here if needed
      console.error('Login error:', error);
    }
  };

  const handleForgotPasswordPress = () => {
    onForgotPassword?.();
  };

  const handleSwitchToRegisterPress = () => {
    onSwitchToRegister?.();
  };

  return (
    <Form scrollable keyboardAvoiding>
      <View className="px-6 space-y-6">
        {/* Welcome Message */}
        <View className="mb-4">
          <Text className="text-2xl font-bold text-gray-900 mb-2">
            Welcome back
          </Text>
          <Text className="text-gray-600">
            Sign in to your SureBank account to continue
          </Text>
        </View>

        {/* Error Display */}
        {loginMutation.error && (
          <View className="bg-red-50 border border-red-200 rounded-lg p-4">
            <View className="flex-row items-center">
              <Text className="text-red-800 font-medium flex-1">
                {loginMutation.error.message}
              </Text>
            </View>
          </View>
        )}

        {/* Form Fields */}
        <View className="space-y-4">
          <FormField
            control={control}
            name="identifier"
            label="Email or Phone Number"
            placeholder={identifierType === 'email' ? 'Enter your email' : 'Enter your phone number'}
            leftIcon={identifierType === 'email' ? 'mail-outline' : 'call-outline'}
            keyboardType={identifierType === 'email' ? 'email-address' : 'phone-pad'}
            autoCapitalize="none"
            autoCorrect={false}
            textContentType={identifierType === 'email' ? 'emailAddress' : 'telephoneNumber'}
            accessibilityLabel="Email or phone number"
            accessibilityHint="Enter your email address or phone number"
            returnKeyType="next"
            onSubmitEditing={() => passwordRef.current?.focus()}
          />

          <FormField
            control={control}
            name="password"
            label="Password"
            placeholder="Enter your password"
            leftIcon="lock-closed-outline"
            secureTextEntry
            autoCapitalize="none"
            textContentType="password"
            accessibilityLabel="Password"
            accessibilityHint="Enter your account password"
            returnKeyType="done"
            onSubmitEditing={handleSubmit(onSubmit)}
            ref={passwordRef}
          />

          {/* Remember Me & Forgot Password Row */}
          <View className="flex-row items-center justify-between">
            <Controller
              control={control}
              name="rememberMe"
              render={({ field: { value, onChange } }) => (
                <Checkbox
                  label="Remember me"
                  checked={value}
                  onValueChange={onChange}
                  accessibilityLabel="Remember me"
                  accessibilityHint="Keep me signed in on this device"
                />
              )}
            />

            <GhostButton
              title="Forgot Password?"
              onPress={handleForgotPasswordPress}
              size="sm"
              accessibilityLabel="Forgot password"
              accessibilityHint="Reset your password"
            />
          </View>
        </View>

        {/* Submit Button */}
        <View className="pt-4">
          <PrimaryButton
            title="Sign In"
            onPress={handleSubmit(onSubmit)}
            loading={loginMutation.isPending}
            disabled={isSubmitting}
            size="lg"
            fullWidth
            leftIcon="log-in-outline"
            accessibilityLabel="Sign in"
            accessibilityHint="Sign in to your account"
          />
        </View>

        {/* Switch to Register */}
        <View className="items-center pt-6">
          <Text className="text-gray-600 mb-2">
            Don&apos;t have an account?
          </Text>
          <GhostButton
            title="Create Account"
            onPress={handleSwitchToRegisterPress}
            size="md"
            accessibilityLabel="Create account"
            accessibilityHint="Switch to account creation"
          />
        </View>
      </View>
    </Form>
  );
}