/**
 * Password Recovery - Success Step
 * 
 * Final step showing successful password reset confirmation.
 */

import React, { useEffect } from 'react';
import { View, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { PrimaryButton } from '@/components/forms';

interface SuccessStepProps {
  onComplete: () => void;
}

export default function SuccessStep({ onComplete }: SuccessStepProps) {
  // Success haptic feedback
  useEffect(() => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  }, []);

  return (
    <View className="flex-1 px-6 py-8 justify-center">
      {/* Success Icon and Animation */}
      <View className="items-center mb-12">
        <View className="w-24 h-24 bg-green-100 rounded-full items-center justify-center mb-6">
          <Ionicons name="checkmark-circle" size={48} color="#10b981" />
        </View>
        
        <Text className="text-2xl font-bold text-gray-900 text-center mb-4">
          Password reset successful!
        </Text>
        
        <Text className="text-gray-600 text-center leading-6 max-w-sm">
          Your password has been successfully reset. You can now sign in with your new password.
        </Text>
      </View>

      {/* Success Points */}
      <View className="space-y-4 mb-12">
        <SuccessItem
          icon="shield-checkmark-outline"
          title="Account Secured"
          description="Your account is now protected with your new password"
        />
        
        <SuccessItem
          icon="key-outline"
          title="Access Restored"
          description="You can now sign in and access all your SureBank features"
        />
        
        <SuccessItem
          icon="lock-closed-outline"
          title="Stay Safe"
          description="Remember to keep your password secure and don't share it"
        />
      </View>

      {/* Continue Button */}
      <PrimaryButton
        title="Continue to Sign In"
        onPress={onComplete}
        size="lg"
        fullWidth
        leftIcon="log-in-outline"
        accessibilityLabel="Continue to sign in"
        accessibilityHint="Go to the sign in screen with your new password"
      />
    </View>
  );
}

// Success item component
interface SuccessItemProps {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  description: string;
}

function SuccessItem({ icon, title, description }: SuccessItemProps) {
  return (
    <View className="flex-row items-start">
      <View className="w-10 h-10 bg-green-100 rounded-lg items-center justify-center mr-4 flex-shrink-0">
        <Ionicons name={icon} size={20} color="#10b981" />
      </View>
      
      <View className="flex-1">
        <Text className="text-gray-900 font-semibold mb-1">
          {title}
        </Text>
        <Text className="text-gray-600 text-sm leading-5">
          {description}
        </Text>
      </View>
    </View>
  );
}