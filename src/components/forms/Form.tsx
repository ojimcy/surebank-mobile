/**
 * SureBank Form Container Component
 * 
 * Professional form container with validation support,
 * error handling, and consistent spacing.
 */

import React, { ReactNode } from 'react';
import { 
  View, 
  Text,
  ScrollView, 
  KeyboardAvoidingView, 
  Platform,
  ViewStyle,
} from 'react-native';
import clsx from 'clsx';
import { useActivityTracking } from '@/components/security/ActivityTracker';

export interface FormProps {
  // Content
  children: ReactNode;
  
  // Behavior
  scrollable?: boolean;
  keyboardAvoiding?: boolean;
  
  // Styling
  style?: ViewStyle;
  contentContainerStyle?: ViewStyle;
  
  // Accessibility
  testID?: string;
}

export function Form({
  children,
  scrollable = true,
  keyboardAvoiding = true,
  style,
  contentContainerStyle,
  testID,
}: FormProps) {
  const { trackFormSubmission } = useActivityTracking();

  const formContent = (
    <View 
      className="flex-1 p-4 space-y-4" 
      style={contentContainerStyle}
      testID={testID}
    >
      {children}
    </View>
  );

  // Handle keyboard avoiding
  const wrappedContent = keyboardAvoiding ? (
    <KeyboardAvoidingView
      className="flex-1"
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 100 : 0}
    >
      {formContent}
    </KeyboardAvoidingView>
  ) : formContent;

  // Handle scrollable forms
  if (scrollable) {
    return (
      <ScrollView
        style={[{ flex: 1 }, style]}
        contentContainerStyle={{ flexGrow: 1 }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {wrappedContent}
      </ScrollView>
    );
  }

  return (
    <View style={[{ flex: 1 }, style]}>
      {wrappedContent}
    </View>
  );
}

/**
 * Form section component for grouping related fields
 */
export interface FormSectionProps {
  children: ReactNode;
  title?: string;
  description?: string;
  style?: ViewStyle;
}

export function FormSection({
  children,
  title,
  description,
  style,
}: FormSectionProps) {
  return (
    <View className="mb-6" style={style}>
      {title && (
        <Text className="text-gray-900 font-semibold text-lg mb-1">
          {title}
        </Text>
      )}
      {description && (
        <Text className="text-gray-600 font-body-sm mb-4">
          {description}
        </Text>
      )}
      <View className="space-y-4">
        {children}
      </View>
    </View>
  );
}

/**
 * Form actions container (typically for buttons)
 */
export interface FormActionsProps {
  children: ReactNode;
  style?: ViewStyle;
  sticky?: boolean;
}

export function FormActions({
  children,
  style,
  sticky = false,
}: FormActionsProps) {
  return (
    <View 
      className={clsx(
        'p-4 space-y-3',
        sticky && 'border-t border-gray-200 bg-white'
      )}
      style={style}
    >
      {children}
    </View>
  );
}

export default Form;