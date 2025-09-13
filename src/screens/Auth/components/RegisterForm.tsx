/**
 * SureBank Register Form Component
 * 
 * Professional registration form with validation, terms acceptance,
 * and integration with authentication services.
 */

import React from 'react';
import { View, Text, Linking } from 'react-native';
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
import { useRegisterMutation } from '@/hooks/auth';
import { useActivityTracking } from '@/components/security/ActivityTracker';
import { RegisterFormData } from '@/services/api/types';

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

interface RegisterFormProps {
  onSuccess?: (identifier: string) => void;
  onSwitchToLogin?: () => void;
}

export default function RegisterForm({
  onSuccess,
  onSwitchToLogin,
}: RegisterFormProps) {
  const { trackFormSubmission } = useActivityTracking();
  const registerMutation = useRegisterMutation();

  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
    watch,
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

  const watchEmail = watch('email');

  const onSubmit = async (data: RegisterFormData) => {
    try {
      trackFormSubmission();

      const registerData = {
        firstName: data.firstName.trim(),
        lastName: data.lastName.trim(),
        email: data.email.trim().toLowerCase(),
        phoneNumber: data.phoneNumber?.trim() || undefined,
        password: data.password,
        address: data.address?.trim() || undefined,
      };

      const result = await registerMutation.mutateAsync(registerData);
      
      // Pass the identifier (email) to the parent for verification navigation
      onSuccess?.(result.identifier);
    } catch (error: any) {
      console.error('Registration error:', error);
    }
  };

  const handleSwitchToLoginPress = () => {
    onSwitchToLogin?.();
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
    <Form scrollable keyboardAvoiding>
      <View className="px-6 space-y-6">
        {/* Welcome Message */}
        <View className="mb-4">
          <Text className="text-2xl font-bold text-gray-900 mb-2">
            Create your account
          </Text>
          <Text className="text-gray-600">
            Join SureBank and start your secure banking journey
          </Text>
        </View>

        {/* Error Display */}
        {registerMutation.error && (
          <View className="bg-red-50 border border-red-200 rounded-lg p-4">
            <View className="flex-row items-center">
              <Text className="text-red-800 font-medium flex-1">
                {registerMutation.error.message}
              </Text>
            </View>
          </View>
        )}

        {/* Form Fields */}
        <View className="space-y-4">
          {/* Name Fields */}
          <View className="flex-row space-x-3">
            <View className="flex-1">
              <FormField
                control={control}
                name="firstName"
                label="First Name"
                placeholder="John"
                leftIcon="person-outline"
                autoCapitalize="words"
                textContentType="givenName"
                accessibilityLabel="First name"
                accessibilityHint="Enter your first name"
              />
            </View>
            <View className="flex-1">
              <FormField
                control={control}
                name="lastName"
                label="Last Name"
                placeholder="Doe"
                leftIcon="person-outline"
                autoCapitalize="words"
                textContentType="familyName"
                accessibilityLabel="Last name"
                accessibilityHint="Enter your last name"
              />
            </View>
          </View>

          {/* Email */}
          <FormField
            control={control}
            name="email"
            label="Email Address"
            placeholder="john.doe@example.com"
            leftIcon="mail-outline"
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
            textContentType="emailAddress"
            accessibilityLabel="Email address"
            accessibilityHint="Enter your email address"
          />

          {/* Phone Number (Optional) */}
          <FormField
            control={control}
            name="phoneNumber"
            label="Phone Number (Optional)"
            placeholder="+1 (555) 123-4567"
            leftIcon="call-outline"
            keyboardType="phone-pad"
            textContentType="telephoneNumber"
            accessibilityLabel="Phone number"
            accessibilityHint="Enter your phone number (optional)"
          />

          {/* Address (Optional) */}
          <FormField
            control={control}
            name="address"
            label="Address (Optional)"
            placeholder="123 Main St, City, State"
            leftIcon="location-outline"
            multiline
            numberOfLines={2}
            textContentType="fullStreetAddress"
            accessibilityLabel="Address"
            accessibilityHint="Enter your address (optional)"
          />

          {/* Password */}
          <FormField
            control={control}
            name="password"
            label="Password"
            placeholder="Enter a secure password"
            leftIcon="lock-closed-outline"
            secureTextEntry
            textContentType="newPassword"
            accessibilityLabel="Password"
            accessibilityHint="Enter a secure password with at least 8 characters"
            helperText="Must contain uppercase, lowercase, and number"
          />

          {/* Confirm Password */}
          <FormField
            control={control}
            name="confirmPassword"
            label="Confirm Password"
            placeholder="Re-enter your password"
            leftIcon="lock-closed-outline"
            secureTextEntry
            textContentType="newPassword"
            accessibilityLabel="Confirm password"
            accessibilityHint="Re-enter your password to confirm"
          />

          {/* Terms and Conditions */}
          <Controller
            control={control}
            name="agreeToTerms"
            render={({ field: { value, onChange }, fieldState: { error } }) => (
              <Checkbox
                label={
                  <Text className="text-gray-700 font-body-md">
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
                }
                checked={value}
                onValueChange={onChange}
                required
                errorText={error?.message}
                accessibilityLabel="Agree to terms and privacy policy"
                accessibilityHint="You must agree to continue"
              />
            )}
          />
        </View>

        {/* Submit Button */}
        <View className="pt-4">
          <PrimaryButton
            title="Create Account"
            onPress={handleSubmit(onSubmit)}
            loading={registerMutation.isPending}
            disabled={isSubmitting}
            size="lg"
            fullWidth
            leftIcon="person-add-outline"
            accessibilityLabel="Create account"
            accessibilityHint="Create your SureBank account"
          />
        </View>

        {/* Switch to Login */}
        <View className="items-center pt-6">
          <Text className="text-gray-600 mb-2">
            Already have an account?
          </Text>
          <GhostButton
            title="Sign In"
            onPress={handleSwitchToLoginPress}
            size="md"
            accessibilityLabel="Sign in"
            accessibilityHint="Switch to sign in form"
          />
        </View>
      </View>
    </Form>
  );
}