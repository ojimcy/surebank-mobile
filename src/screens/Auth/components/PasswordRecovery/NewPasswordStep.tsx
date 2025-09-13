/**
 * Password Recovery - New Password Step
 * 
 * Third step where user creates a new password.
 */

import React from 'react';
import { View, Text } from 'react-native';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { Ionicons } from '@expo/vector-icons';
import * as yup from 'yup';
import { Form, FormField, PrimaryButton } from '@/components/forms';
import { useNewPasswordMutation } from '@/hooks/auth';
import { useActivityTracking } from '@/components/security/ActivityTracker';

const newPasswordSchema = yup.object().shape({
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
});

interface FormData {
  password: string;
  confirmPassword: string;
}

interface NewPasswordStepProps {
  email: string;
  resetCode: string;
  onSuccess: () => void;
}

export default function NewPasswordStep({ email, resetCode, onSuccess }: NewPasswordStepProps) {
  const { trackFormSubmission } = useActivityTracking();
  const newPasswordMutation = useNewPasswordMutation();

  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: yupResolver(newPasswordSchema),
    defaultValues: {
      password: '',
      confirmPassword: '',
    },
  });

  const handlePasswordSubmit = async (data: FormData) => {
    try {
      trackFormSubmission();

      await newPasswordMutation.mutateAsync({
        email,
        code: resetCode,
        password: data.password,
      });

      onSuccess();
    } catch (error) {
      console.error('Password reset error:', error);
    }
  };

  return (
    <Form>
      <View className="px-6 space-y-6">
        {/* Header */}
        <View className="items-center mb-8">
          <View className="w-20 h-20 bg-primary-100 rounded-full items-center justify-center mb-6">
            <Ionicons name="lock-closed-outline" size={40} color="#0066A1" />
          </View>
          
          <Text className="text-2xl font-bold text-gray-900 text-center mb-4">
            Create new password
          </Text>
          
          <Text className="text-gray-600 text-center leading-6">
            Choose a strong password to secure your SureBank account.
          </Text>
        </View>

        {/* Error Display */}
        {newPasswordMutation.error && (
          <View className="bg-red-50 border border-red-200 rounded-lg p-4">
            <Text className="text-red-800 font-medium">
              {newPasswordMutation.error.message}
            </Text>
          </View>
        )}

        {/* Password Requirements */}
        <View className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <Text className="text-blue-800 font-medium mb-2">
            Password Requirements:
          </Text>
          <View className="space-y-1">
            <Text className="text-blue-700 text-sm">• At least 8 characters long</Text>
            <Text className="text-blue-700 text-sm">• One uppercase letter</Text>
            <Text className="text-blue-700 text-sm">• One lowercase letter</Text>
            <Text className="text-blue-700 text-sm">• One number</Text>
          </View>
        </View>

        {/* Form Fields */}
        <View className="space-y-4">
          <FormField
            control={control}
            name="password"
            label="New Password"
            placeholder="Enter your new password"
            leftIcon="lock-closed-outline"
            secureTextEntry
            textContentType="newPassword"
            accessibilityLabel="New password"
            accessibilityHint="Enter a secure password following the requirements above"
          />

          <FormField
            control={control}
            name="confirmPassword"
            label="Confirm Password"
            placeholder="Re-enter your new password"
            leftIcon="lock-closed-outline"
            secureTextEntry
            textContentType="newPassword"
            accessibilityLabel="Confirm password"
            accessibilityHint="Re-enter your password to confirm it matches"
          />
        </View>

        {/* Submit Button */}
        <PrimaryButton
          title="Reset Password"
          onPress={handleSubmit(handlePasswordSubmit)}
          loading={newPasswordMutation.isPending}
          disabled={isSubmitting}
          size="lg"
          fullWidth
          leftIcon="checkmark-circle-outline"
          accessibilityLabel="Reset password"
          accessibilityHint="Set your new password"
        />
      </View>
    </Form>
  );
}