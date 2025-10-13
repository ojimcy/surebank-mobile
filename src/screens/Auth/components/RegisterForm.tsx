/**
 * SureBank Register Form Component
 * 
 * Professional registration form with validation, terms acceptance,
 * and integration with authentication services.
 */

import React, { useRef } from 'react';
import { View, Text, Linking, TextInput } from 'react-native';
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

// Define the form data interface locally
interface RegisterFormData {
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber?: string;
  password: string;
  confirmPassword: string;
  address?: string;
  agreeToTerms: boolean;
}

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
    .test('phone-validation', 'Enter 11 digits (e.g., 08057172283) or 10 digits (e.g., 8057172283)', (value) => {
      if (!value || value === '') return true; // Optional field - allow empty
      const digits = value.replace(/\D/g, ''); // Remove all non-digits
      // Allow Nigerian phone numbers: 10 digits (without 0) or 11 digits (with 0)
      return digits.length === 10 || digits.length === 11;
    }),
  
  password: yup
    .string()
    .required('Password is required')
    .min(8, 'Password must be at least 8 characters'),
  
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

  // Refs for keyboard navigation
  const lastNameRef = useRef<TextInput>(null);
  const emailRef = useRef<TextInput>(null);
  const phoneRef = useRef<TextInput>(null);
  const addressRef = useRef<TextInput>(null);
  const passwordRef = useRef<TextInput>(null);
  const confirmPasswordRef = useRef<TextInput>(null);

  const {
    control,
    handleSubmit,
    formState: { isSubmitting },
  } = useForm<RegisterFormData>({
    resolver: yupResolver(registerSchema) as any,
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
              <FormField<RegisterFormData>
                control={control}
                name="firstName"
                label="First Name"
                placeholder="John"
                leftIcon="person-outline"
                autoCapitalize="words"
                textContentType="givenName"
                accessibilityLabel="First name"
                accessibilityHint="Enter your first name"
                returnKeyType="next"
                onSubmitEditing={() => lastNameRef.current?.focus()}
              />
            </View>
            <View className="flex-1">
              <FormField<RegisterFormData>
                control={control}
                name="lastName"
                label="Last Name"
                placeholder="Doe"
                leftIcon="person-outline"
                autoCapitalize="words"
                textContentType="familyName"
                accessibilityLabel="Last name"
                accessibilityHint="Enter your last name"
                returnKeyType="next"
                onSubmitEditing={() => emailRef.current?.focus()}
                ref={lastNameRef}
              />
            </View>
          </View>

          {/* Email */}
          <FormField<RegisterFormData>
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
            returnKeyType="next"
            onSubmitEditing={() => phoneRef.current?.focus()}
            ref={emailRef}
          />

          {/* Phone Number (Optional) */}
          <FormField<RegisterFormData>
            control={control}
            name="phoneNumber"
            label="Phone Number (Optional)"
            placeholder="+1 (555) 123-4567"
            leftIcon="call-outline"
            keyboardType="phone-pad"
            textContentType="telephoneNumber"
            accessibilityLabel="Phone number"
            accessibilityHint="Enter your phone number (optional)"
            returnKeyType="next"
            onSubmitEditing={() => addressRef.current?.focus()}
            ref={phoneRef}
          />

          {/* Address (Optional) */}
          <FormField<RegisterFormData>
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
            returnKeyType="next"
            onSubmitEditing={() => passwordRef.current?.focus()}
            ref={addressRef}
          />

          {/* Password */}
          <FormField<RegisterFormData>
            control={control}
            name="password"
            label="Password"
            placeholder="Enter a secure password"
            leftIcon="lock-closed-outline"
            secureTextEntry
            autoCapitalize="none"
            textContentType="newPassword"
            accessibilityLabel="Password"
            accessibilityHint="Enter a secure password with at least 8 characters"
            helperText="Must be at least 8 characters"
            returnKeyType="next"
            onSubmitEditing={() => confirmPasswordRef.current?.focus()}
            ref={passwordRef}
          />

          {/* Confirm Password */}
          <FormField<RegisterFormData>
            control={control}
            name="confirmPassword"
            label="Confirm Password"
            placeholder="Re-enter your password"
            leftIcon="lock-closed-outline"
            secureTextEntry
            autoCapitalize="none"
            textContentType="newPassword"
            accessibilityLabel="Confirm password"
            accessibilityHint="Re-enter your password to confirm"
            returnKeyType="done"
            onSubmitEditing={handleSubmit(onSubmit)}
            ref={confirmPasswordRef}
          />

          {/* Terms and Conditions */}
          <Controller
            control={control}
            name="agreeToTerms"
            render={({ field: { value, onChange }, fieldState: { error } }) => (
              <View>
                <Checkbox
                  label="I agree to the Terms of Service and Privacy Policy"
                  checked={value}
                  onValueChange={onChange}
                  required
                  errorText={error?.message}
                  accessibilityLabel="Agree to terms and privacy policy"
                  accessibilityHint="You must agree to continue"
                />
                <View className="flex-row mt-1 ml-7">
                  <Text
                    className="text-primary-600 text-sm underline"
                    onPress={handleTermsPress}
                  >
                    Terms of Service
                  </Text>
                  <Text className="text-gray-600 text-sm mx-1">and</Text>
                  <Text
                    className="text-primary-600 text-sm underline"
                    onPress={handlePrivacyPress}
                  >
                    Privacy Policy
                  </Text>
                </View>
              </View>
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