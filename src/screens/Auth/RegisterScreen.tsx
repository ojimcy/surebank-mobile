/**
 * SureBank Register Screen
 *
 * Professional registration screen with validation, terms acceptance,
 * and API integration.
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
  Linking,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { useAuth } from '@/contexts/AuthContext';
import { Input, PrimaryButton, GhostButton } from '@/components/forms';
import { useActivityTracking } from '@/components/security/ActivityTracker';
import { RegisterFormData } from '@/services/api/types';
import type { AuthScreenProps } from '@/navigation/types';

// Registration form validation schema
const registerSchema = yup.object().shape({
  firstName: yup
    .string()
    .required('First name is required')
    .min(2, 'First name must be at least 2 characters')
    .max(50, 'First name must not exceed 50 characters')
    .matches(/^[a-zA-Z\s'-]+$/, 'First name contains invalid characters'),

  lastName: yup
    .string()
    .required('Last name is required')
    .min(2, 'Last name must be at least 2 characters')
    .max(50, 'Last name must not exceed 50 characters')
    .matches(/^[a-zA-Z\s'-]+$/, 'Last name contains invalid characters'),

  email: yup
    .string()
    .email('Please enter a valid email address')
    .required('Email address is required')
    .lowercase(),

  phoneNumber: yup
    .string()
    .matches(/^\+?[\d\s-()]+$/, 'Please enter a valid phone number')
    .test('phone-length', 'Phone number must be at least 10 digits', (value) => {
      if (!value) return true; // Optional field
      const digits = value.replace(/\D/g, '');
      return digits.length >= 10;
    }),

  password: yup
    .string()
    .required('Password is required')
    .min(8, 'Password must be at least 8 characters')
    .matches(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
      'Password must contain at least one uppercase letter, one lowercase letter, and one number'
    ),

  confirmPassword: yup
    .string()
    .required('Please confirm your password')
    .oneOf([yup.ref('password')], 'Passwords do not match'),

  address: yup
    .string()
    .max(200, 'Address must not exceed 200 characters'),

  agreeToTerms: yup
    .boolean()
    .oneOf([true], 'You must agree to the Terms of Service and Privacy Policy'),
});

export default function RegisterScreen({ navigation }: AuthScreenProps<'Register'>) {
  const { register, isLoading, error, clearError } = useAuth();
  const { trackFormSubmission } = useActivityTracking();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { isSubmitting },
  } = useForm<RegisterFormData>({
    resolver: yupResolver(registerSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      phoneNumber: '',
      password: '',
      confirmPassword: '',
      address: '',
      agreeToTerms: false,
    },
  });


  const onSubmit = async (data: RegisterFormData) => {
    try {
      trackFormSubmission();
      clearError();

      const registerData = {
        firstName: data.firstName.trim(),
        lastName: data.lastName.trim(),
        email: data.email.trim().toLowerCase(),
        phoneNumber: data.phoneNumber?.trim() || undefined,
        password: data.password,
        address: data.address?.trim() || undefined,
      };

      const result = await register(registerData);

      // Navigate to verification screen
      navigation.navigate('Verification', { identifier: result.identifier });
    } catch (error: any) {
      console.error('Registration error:', error);
    }
  };

  const handleLogin = () => {
    navigation.navigate('Login');
  };

  const handleBackPress = () => {
    navigation.goBack();
  };

  const handleTermsPress = async () => {
    try {
      await Linking.openURL('https://surebank.com/terms');
    } catch (error) {
      console.error('Error opening terms:', error);
    }
  };

  const handlePrivacyPress = async () => {
    try {
      await Linking.openURL('https://surebank.com/privacy');
    } catch (error) {
      console.error('Error opening privacy policy:', error);
    }
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
          showsVerticalScrollIndicator={false}
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

            <View className="items-center">
              <View className="w-10 h-10 bg-primary-600 rounded-xl items-center justify-center">
                <Ionicons name="person-add" size={20} color="white" />
              </View>
            </View>

            <View className="w-10" />
          </View>

          <View className="flex-1 px-6">
            {/* Welcome Message */}
            <View className="mb-8">
              <Text className="text-3xl font-bold text-gray-900 mb-3">
                Create your account
              </Text>
              <Text className="text-gray-600 text-lg">
                Join SureBank and start your secure banking journey
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
              {/* Name Fields */}
              <View className="flex-row space-x-3">
                <View className="flex-1">
                  <Controller
                    control={control}
                    name="firstName"
                    render={({ field: { onChange, onBlur, value }, fieldState: { error } }) => (
                      <Input
                        label="First Name"
                        placeholder="John"
                        leftIcon="person-outline"
                        value={value}
                        onChangeText={onChange}
                        onBlur={onBlur}
                        autoCapitalize="words"
                        textContentType="givenName"
                        errorText={error?.message}
                        accessibilityLabel="First name"
                        accessibilityHint="Enter your first name"
                      />
                    )}
                  />
                </View>
                <View className="flex-1">
                  <Controller
                    control={control}
                    name="lastName"
                    render={({ field: { onChange, onBlur, value }, fieldState: { error } }) => (
                      <Input
                        label="Last Name"
                        placeholder="Doe"
                        leftIcon="person-outline"
                        value={value}
                        onChangeText={onChange}
                        onBlur={onBlur}
                        autoCapitalize="words"
                        textContentType="familyName"
                        errorText={error?.message}
                        accessibilityLabel="Last name"
                        accessibilityHint="Enter your last name"
                      />
                    )}
                  />
                </View>
              </View>

              {/* Email */}
              <Controller
                control={control}
                name="email"
                render={({ field: { onChange, onBlur, value }, fieldState: { error } }) => (
                  <Input
                    label="Email Address"
                    placeholder="john.doe@example.com"
                    leftIcon="mail-outline"
                    value={value}
                    onChangeText={onChange}
                    onBlur={onBlur}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    autoCorrect={false}
                    textContentType="emailAddress"
                    errorText={error?.message}
                    accessibilityLabel="Email address"
                    accessibilityHint="Enter your email address"
                  />
                )}
              />

              {/* Phone Number (Optional) */}
              <Controller
                control={control}
                name="phoneNumber"
                render={({ field: { onChange, onBlur, value }, fieldState: { error } }) => (
                  <Input
                    label="Phone Number (Optional)"
                    placeholder="+1 (555) 123-4567"
                    leftIcon="call-outline"
                    value={value || ''}
                    onChangeText={onChange}
                    onBlur={onBlur}
                    keyboardType="phone-pad"
                    textContentType="telephoneNumber"
                    errorText={error?.message}
                    accessibilityLabel="Phone number"
                    accessibilityHint="Enter your phone number (optional)"
                  />
                )}
              />

              {/* Address (Optional) */}
              <Controller
                control={control}
                name="address"
                render={({ field: { onChange, onBlur, value }, fieldState: { error } }) => (
                  <Input
                    label="Address (Optional)"
                    placeholder="123 Main St, City, State"
                    leftIcon="location-outline"
                    value={value || ''}
                    onChangeText={onChange}
                    onBlur={onBlur}
                    multiline
                    numberOfLines={2}
                    textContentType="fullStreetAddress"
                    errorText={error?.message}
                    accessibilityLabel="Address"
                    accessibilityHint="Enter your address (optional)"
                  />
                )}
              />

              {/* Password */}
              <Controller
                control={control}
                name="password"
                render={({ field: { onChange, onBlur, value }, fieldState: { error } }) => (
                  <Input
                    label="Password"
                    placeholder="Enter a secure password"
                    leftIcon="lock-closed-outline"
                    rightIcon={showPassword ? 'eye-off-outline' : 'eye-outline'}
                    onRightIconPress={() => setShowPassword(!showPassword)}
                    value={value}
                    onChangeText={onChange}
                    onBlur={onBlur}
                    secureTextEntry={!showPassword}
                    textContentType="newPassword"
                    errorText={error?.message}
                    helperText="Must contain uppercase, lowercase, and number"
                    accessibilityLabel="Password"
                    accessibilityHint="Enter a secure password with at least 8 characters"
                  />
                )}
              />

              {/* Confirm Password */}
              <Controller
                control={control}
                name="confirmPassword"
                render={({ field: { onChange, onBlur, value }, fieldState: { error } }) => (
                  <Input
                    label="Confirm Password"
                    placeholder="Re-enter your password"
                    leftIcon="lock-closed-outline"
                    rightIcon={showConfirmPassword ? 'eye-off-outline' : 'eye-outline'}
                    onRightIconPress={() => setShowConfirmPassword(!showConfirmPassword)}
                    value={value}
                    onChangeText={onChange}
                    onBlur={onBlur}
                    secureTextEntry={!showConfirmPassword}
                    textContentType="newPassword"
                    errorText={error?.message}
                    accessibilityLabel="Confirm password"
                    accessibilityHint="Re-enter your password to confirm"
                  />
                )}
              />

              {/* Terms and Conditions */}
              <Controller
                control={control}
                name="agreeToTerms"
                render={({ field: { value, onChange }, fieldState: { error } }) => (
                  <View>
                    <Pressable
                      onPress={() => onChange(!value)}
                      className="flex-row items-start"
                      accessibilityRole="checkbox"
                      accessibilityState={{ checked: value }}
                    >
                      <View className={`w-5 h-5 border-2 rounded mr-3 mt-1 items-center justify-center ${
                        value ? 'bg-primary-600 border-primary-600' : 'border-gray-300 bg-white'
                      }`}>
                        {value && (
                          <Ionicons name="checkmark" size={14} color="white" />
                        )}
                      </View>
                      <View className="flex-1">
                        <Text className="text-gray-700 text-base leading-6">
                          I agree to the{' '}
                          <Text
                            className="text-primary-600 font-medium"
                            onPress={handleTermsPress}
                          >
                            Terms of Service
                          </Text>
                          {' '}and{' '}
                          <Text
                            className="text-primary-600 font-medium"
                            onPress={handlePrivacyPress}
                          >
                            Privacy Policy
                          </Text>
                        </Text>
                      </View>
                    </Pressable>
                    {error && (
                      <Text className="text-red-600 text-sm mt-2 ml-8">{error.message}</Text>
                    )}
                  </View>
                )}
              />
            </View>

            {/* Submit Button */}
            <View className="mt-8">
              <PrimaryButton
                title="Create Account"
                onPress={handleSubmit(onSubmit)}
                loading={isLoading || isSubmitting}
                disabled={isSubmitting}
                size="lg"
                fullWidth
                leftIcon="person-add-outline"
                accessibilityLabel="Create account"
                accessibilityHint="Create your SureBank account"
              />
            </View>

            {/* Switch to Login */}
            <View className="items-center mt-8 mb-6">
              <Text className="text-gray-600 mb-3 text-base">
                Already have an account?
              </Text>
              <GhostButton
                title="Sign In"
                onPress={handleLogin}
                size="md"
                accessibilityLabel="Sign in"
                accessibilityHint="Switch to sign in form"
              />
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}