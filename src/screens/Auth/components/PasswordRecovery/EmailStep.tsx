/**
 * Password Recovery - Email Step
 * 
 * First step of password recovery where user enters their email address.
 */

import React from 'react';
import { View, Text } from 'react-native';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { Ionicons } from '@expo/vector-icons';
import * as yup from 'yup';
import { Form, FormField, PrimaryButton } from '@/components/forms';
import { usePasswordResetMutation } from '@/hooks/auth';
import { useActivityTracking } from '@/components/security/ActivityTracker';

const emailSchema = yup.object().shape({
  email: yup
    .string()
    .email('Please enter a valid email address')
    .required('Email address is required'),
});

interface FormData {
  email: string;
}

interface EmailStepProps {
  onSubmit: (email: string) => void;
}

export default function EmailStep({ onSubmit }: EmailStepProps) {
  const { trackFormSubmission } = useActivityTracking();
  const passwordResetMutation = usePasswordResetMutation();

  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: yupResolver(emailSchema),
    defaultValues: {
      email: '',
    },
  });

  const handleEmailSubmit = async (data: FormData) => {
    try {
      trackFormSubmission();

      await passwordResetMutation.mutateAsync({
        email: data.email.trim().toLowerCase(),
      });

      onSubmit(data.email.trim().toLowerCase());
    } catch (error) {
      // Error is handled by the mutation
      console.error('Password reset request error:', error);
    }
  };

  return (
    <Form>
      <View className="px-6 space-y-6">
        {/* Header */}
        <View className="items-center mb-8">
          <View className="w-20 h-20 bg-primary-100 rounded-full items-center justify-center mb-6">
            <Ionicons name="mail-outline" size={40} color="#0066A1" />
          </View>
          
          <Text className="text-2xl font-bold text-gray-900 text-center mb-4">
            Forgot your password?
          </Text>
          
          <Text className="text-gray-600 text-center leading-6">
            No worries! Enter your email address and we'll send you a reset code.
          </Text>
        </View>

        {/* Error Display */}
        {passwordResetMutation.error && (
          <View className="bg-red-50 border border-red-200 rounded-lg p-4">
            <Text className="text-red-800 font-medium">
              {passwordResetMutation.error.message}
            </Text>
          </View>
        )}

        {/* Email Input */}
        <FormField
          control={control}
          name="email"
          label="Email Address"
          placeholder="Enter your email address"
          leftIcon="mail-outline"
          keyboardType="email-address"
          autoCapitalize="none"
          autoCorrect={false}
          textContentType="emailAddress"
          accessibilityLabel="Email address"
          accessibilityHint="Enter the email address associated with your account"
        />

        {/* Submit Button */}
        <PrimaryButton
          title="Send Reset Code"
          onPress={handleSubmit(handleEmailSubmit)}
          loading={passwordResetMutation.isPending}
          disabled={isSubmitting}
          size="lg"
          fullWidth
          leftIcon="send-outline"
          accessibilityLabel="Send reset code"
          accessibilityHint="Send password reset code to your email"
        />

        {/* Help Text */}
        <View className="items-center pt-4">
          <Text className="text-sm text-gray-500 text-center leading-5">
            Remember your password? Go back to sign in.
          </Text>
        </View>
      </View>
    </Form>
  );
}