/**
 * SureBank Login Screen
 *
 * Professional login screen with form validation,
 * error handling, and API integration.
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StatusBar,
  SafeAreaView,
  Pressable,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { useAuth } from '@/contexts/AuthContext';
import { Input, PrimaryButton, GhostButton, Checkbox } from '@/components/forms';
import { useActivityTracking } from '@/components/security/ActivityTracker';
import { LoginFormData } from '@/services/api/types';
import type { AuthScreenProps } from '@/navigation/types';

console.log('LoginScreen rendered');


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

export default function LoginScreen({ navigation }: AuthScreenProps<'Login'>) {
  console.log('[LoginScreen] Rendering Login Screen');
  const { login, isLoading, error, clearError } = useAuth();
  const { trackFormSubmission } = useActivityTracking();
  const [showPassword, setShowPassword] = useState(false);

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
      clearError();

      await login({
        identifier: data.identifier.trim(),
        password: data.password,
      });

      // Navigation will be handled automatically by auth context
    } catch (error: any) {
      // Error handling is managed by the auth context
      console.error('Login error:', error);
    }
  };

  const handleForgotPassword = () => {
    navigation.navigate('ForgotPassword');
  };

  const handleRegister = () => {
    navigation.navigate('Register');
  };

  const handleBackPress = () => {
    navigation.goBack();
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <StatusBar barStyle="dark-content" backgroundColor="white" />

      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          className="flex-1"
          contentContainerStyle={{ flexGrow: 1 }}
          keyboardShouldPersistTaps="handled"
        >
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

            <View className="w-10" />
          </View>

          <View className="flex-1 px-6 py-2">
            {/* Welcome Message */}
            <View className="mb-6">
              <Text className="text-3xl font-bold text-gray-900 mb-2">
                Welcome back
              </Text>
              <Text className="text-gray-600 text-base">
                Sign in to your SureBank account to continue
              </Text>
            </View>

            {/* Error Display */}
            {error && (
              <View className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                <View className="flex-row items-center">
                  <Ionicons name="alert-circle" size={20} color="#dc2626" />
                  <Text className="text-red-800 font-medium flex-1 ml-2">
                    {error}
                  </Text>
                </View>
              </View>
            )}

            {/* Form Fields */}
            <View className="space-y-6">
              <Controller
                control={control}
                name="identifier"
                render={({ field: { onChange, onBlur, value }, fieldState: { error } }) => (
                  <Input
                    label="Email or Phone Number"
                    placeholder={identifierType === 'email' ? 'Enter your email' : 'Enter your phone number'}
                    leftIcon={identifierType === 'email' ? 'mail-outline' : 'call-outline'}
                    value={value}
                    onChangeText={onChange}
                    onBlur={onBlur}
                    keyboardType={identifierType === 'email' ? 'email-address' : 'phone-pad'}
                    autoCapitalize="none"
                    autoCorrect={false}
                    textContentType={identifierType === 'email' ? 'emailAddress' : 'telephoneNumber'}
                    errorText={error?.message}
                    accessibilityLabel="Email or phone number"
                    accessibilityHint="Enter your email address or phone number"
                  />
                )}
              />

              <Controller
                control={control}
                name="password"
                render={({ field: { onChange, onBlur, value }, fieldState: { error } }) => (
                  <Input
                    label="Password"
                    placeholder="Enter your password"
                    leftIcon="lock-closed-outline"
                    rightIcon={showPassword ? 'eye-off-outline' : 'eye-outline'}
                    onRightIconPress={() => setShowPassword(!showPassword)}
                    value={value}
                    onChangeText={onChange}
                    onBlur={onBlur}
                    secureTextEntry={!showPassword}
                    textContentType="password"
                    errorText={error?.message}
                    accessibilityLabel="Password"
                    accessibilityHint="Enter your account password"
                  />
                )}
              />

              {/* Remember Me & Forgot Password Row */}
              <View className="flex-row items-center justify-between">
                <View />

                <GhostButton
                  title="Forgot Password?"
                  onPress={handleForgotPassword}
                  size="sm"
                  accessibilityLabel="Forgot password"
                  accessibilityHint="Reset your password"
                />
              </View>
            </View>

            {/* Privacy Policy Agreement */}
            <View className="mt-6">
              <Controller
                control={control}
                name="rememberMe"
                render={({ field: { value, onChange } }) => (
                  <View className="flex-row items-start">
                    <Checkbox
                      checked={value}
                      onValueChange={onChange}
                      accessibilityLabel="Accept privacy policy"
                      accessibilityHint="Accept terms and privacy policy"
                    />
                    <View className="flex-1 ml-2">
                      <Text className="text-sm text-gray-600 leading-5">
                        I accept the{' '}
                        <Text className="text-primary-600 font-medium">Terms of Service</Text>
                        {' '}and{' '}
                        <Text className="text-primary-600 font-medium">Privacy Policy</Text>
                      </Text>
                    </View>
                  </View>
                )}
              />
            </View>

            {/* Submit Button */}
            <View className="mt-6">
              <PrimaryButton
                title="Sign In"
                onPress={handleSubmit(onSubmit)}
                loading={isLoading || isSubmitting}
                disabled={isSubmitting}
                size="lg"
                fullWidth
                leftIcon="log-in-outline"
                accessibilityLabel="Sign in"
                accessibilityHint="Sign in to your account"
              />
            </View>

            {/* Switch to Register */}
            <View className="items-center mt-8 mb-6">
              <Text className="text-gray-600 mb-3 text-base">
                Don't have an account?
              </Text>
              <GhostButton
                title="Create Account"
                onPress={handleRegister}
                size="md"
                accessibilityLabel="Create account"
                accessibilityHint="Switch to account creation"
              />
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}