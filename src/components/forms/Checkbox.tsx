/**
 * SureBank Checkbox Component
 * 
 * Professional checkbox component with custom styling,
 * validation support, and accessibility features.
 */

import React from 'react';
import { 
  TouchableOpacity, 
  View, 
  Text, 
  ViewStyle,
  TextStyle,
  AccessibilityRole,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { cva, type VariantProps } from 'class-variance-authority';
import clsx from 'clsx';

// Checkbox variants using class-variance-authority
const checkboxVariants = cva(
  // Base styles
  'w-5 h-5 border-2 rounded items-center justify-center',
  {
    variants: {
      variant: {
        default: 'border-gray-300',
        error: 'border-red-500',
        success: 'border-green-500',
      },
      checked: {
        true: '',
        false: 'bg-white',
      },
      disabled: {
        true: 'opacity-50',
        false: 'opacity-100',
      },
    },
    compoundVariants: [
      // Checked states for different variants
      {
        variant: 'default',
        checked: true,
        className: 'bg-primary-600 border-primary-600',
      },
      {
        variant: 'error',
        checked: true,
        className: 'bg-red-600 border-red-600',
      },
      {
        variant: 'success',
        checked: true,
        className: 'bg-green-600 border-green-600',
      },
    ],
    defaultVariants: {
      variant: 'default',
      checked: false,
      disabled: false,
    },
  }
);

export interface CheckboxProps extends VariantProps<typeof checkboxVariants> {
  // Content
  label?: string;
  description?: string;
  
  // State
  checked?: boolean;
  disabled?: boolean;
  required?: boolean;
  
  // Validation
  errorText?: string;
  
  // Callbacks
  onValueChange?: (checked: boolean) => void;
  
  // Styling
  containerStyle?: ViewStyle;
  checkboxStyle?: ViewStyle;
  labelStyle?: TextStyle;
  
  // Accessibility
  testID?: string;
  accessibilityLabel?: string;
  accessibilityHint?: string;
}

export function Checkbox({
  // Content
  label,
  description,
  
  // State
  checked = false,
  disabled = false,
  required = false,
  
  // Validation
  errorText,
  
  // Callbacks
  onValueChange,
  
  // Variants
  variant,
  
  // Styling
  containerStyle,
  checkboxStyle,
  labelStyle,
  
  // Accessibility
  testID,
  accessibilityLabel,
  accessibilityHint,
}: CheckboxProps) {
  const currentVariant = errorText ? 'error' : variant;

  const handlePress = () => {
    if (!disabled && onValueChange) {
      onValueChange(!checked);
    }
  };

  const checkboxAccessibilityLabel = accessibilityLabel || label || 'Checkbox';

  return (
    <View style={containerStyle} testID={testID}>
      <TouchableOpacity
        onPress={handlePress}
        disabled={disabled}
        className="flex-row items-start"
        accessibilityRole="checkbox"
        accessibilityState={{ checked, disabled }}
        accessibilityLabel={checkboxAccessibilityLabel}
        accessibilityHint={accessibilityHint || description}
      >
        {/* Checkbox */}
        <View 
          className={clsx(
            checkboxVariants({ 
              variant: currentVariant, 
              checked, 
              disabled 
            })
          )}
          style={checkboxStyle}
        >
          {checked && (
            <Ionicons 
              name="checkmark" 
              size={14} 
              color="white" 
            />
          )}
        </View>

        {/* Label and Description */}
        {(label || description) && (
          <View className="flex-1 ml-3">
            {label && (
              <Text 
                className={clsx(
                  'text-gray-700 font-body-md',
                  disabled && 'text-gray-400'
                )}
                style={labelStyle}
              >
                {label}
                {required && <Text className="text-red-500 ml-1">*</Text>}
              </Text>
            )}
            {description && (
              <Text 
                className={clsx(
                  'text-gray-500 font-body-sm mt-1',
                  disabled && 'text-gray-300'
                )}
              >
                {description}
              </Text>
            )}
          </View>
        )}
      </TouchableOpacity>

      {/* Error Text */}
      {errorText && (
        <View className="flex-row items-center mt-1 ml-8">
          <Ionicons name="alert-circle-outline" size={14} color="#dc2626" />
          <Text className="text-red-600 font-body-sm ml-1">
            {errorText}
          </Text>
        </View>
      )}
    </View>
  );
}

export default Checkbox;