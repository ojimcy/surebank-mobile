/**
 * SureBank Professional Input Component
 * 
 * Reusable input component with validation, theming,
 * and accessibility features for professional forms.
 */

import React, { forwardRef, useState, useCallback } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  TextInputProps, 
  TouchableOpacity,
  ViewStyle,
  TextStyle,
  AccessibilityRole,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { cva, type VariantProps } from 'class-variance-authority';
import clsx from 'clsx';

// Input variants using class-variance-authority
const inputVariants = cva(
  // Base styles
  'flex-row items-center border rounded-lg px-4 py-3 bg-white',
  {
    variants: {
      variant: {
        default: 'border-gray-200 focus:border-primary-500',
        error: 'border-red-500 bg-red-50',
        success: 'border-green-500 bg-green-50',
        disabled: 'border-gray-100 bg-gray-50',
      },
      size: {
        sm: 'px-3 py-2',
        md: 'px-4 py-3',
        lg: 'px-5 py-4',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'md',
    },
  }
);

const textVariants = cva(
  // Base text styles
  'flex-1 text-gray-900 font-body-md',
  {
    variants: {
      size: {
        sm: 'text-sm',
        md: 'text-base',
        lg: 'text-lg',
      },
      disabled: {
        true: 'text-gray-400',
        false: 'text-gray-900',
      },
    },
    defaultVariants: {
      size: 'md',
      disabled: false,
    },
  }
);

export interface InputProps extends Omit<TextInputProps, 'style'>, VariantProps<typeof inputVariants> {
  // Visual props
  label?: string;
  placeholder?: string;
  helperText?: string;
  errorText?: string;
  successText?: string;
  
  // Icon props
  leftIcon?: keyof typeof Ionicons.glyphMap;
  rightIcon?: keyof typeof Ionicons.glyphMap;
  onRightIconPress?: () => void;
  
  // State props
  loading?: boolean;
  required?: boolean;
  disabled?: boolean;
  
  // Styling
  containerStyle?: ViewStyle;
  inputStyle?: TextStyle;
  labelStyle?: TextStyle;
  
  // Accessibility
  testID?: string;
  accessibilityLabel?: string;
  accessibilityHint?: string;
}

export const Input = forwardRef<TextInput, InputProps>(({
  // Content props
  label,
  placeholder,
  helperText,
  errorText,
  successText,
  
  // Icon props
  leftIcon,
  rightIcon,
  onRightIconPress,
  
  // State props
  loading = false,
  required = false,
  disabled = false,
  
  // Variants
  variant,
  size,
  
  // Styling
  containerStyle,
  inputStyle,
  labelStyle,
  
  // Accessibility
  testID,
  accessibilityLabel,
  accessibilityHint,
  
  // TextInput props
  value,
  onChangeText,
  onFocus,
  onBlur,
  secureTextEntry,
  ...textInputProps
}, ref) => {
  const [isFocused, setIsFocused] = useState(false);
  const [isSecureVisible, setIsSecureVisible] = useState(false);

  // Determine the current variant based on state
  const currentVariant = errorText ? 'error' : 
                        successText ? 'success' : 
                        disabled ? 'disabled' : variant;

  // Handle focus events
  const handleFocus = useCallback((e: any) => {
    setIsFocused(true);
    onFocus?.(e);
  }, [onFocus]);

  const handleBlur = useCallback((e: any) => {
    setIsFocused(false);
    onBlur?.(e);
  }, [onBlur]);

  // Toggle secure text visibility
  const toggleSecureText = useCallback(() => {
    setIsSecureVisible(!isSecureVisible);
  }, [isSecureVisible]);

  // Auto-handle secure text entry icon
  const actualRightIcon = secureTextEntry 
    ? (isSecureVisible ? 'eye-off-outline' : 'eye-outline') 
    : rightIcon;
  
  const actualOnRightIconPress = secureTextEntry 
    ? toggleSecureText 
    : onRightIconPress;

  const inputAccessibilityLabel = accessibilityLabel || label;
  const inputAccessibilityHint = accessibilityHint || helperText || errorText;

  return (
    <View style={containerStyle} testID={testID}>
      {/* Label */}
      {label && (
        <Text 
          className={clsx(
            'text-gray-700 font-body-sm mb-1',
            required && 'after:content-["*"] after:text-red-500 after:ml-1'
          )}
          style={labelStyle}
        >
          {label}
          {required && <Text className="text-red-500 ml-1">*</Text>}
        </Text>
      )}

      {/* Input Container */}
      <View 
        className={clsx(
          inputVariants({ variant: currentVariant, size }),
          isFocused && 'ring-2 ring-primary-200',
          loading && 'opacity-70'
        )}
      >
        {/* Left Icon */}
        {leftIcon && (
          <View className="mr-3">
            <Ionicons 
              name={leftIcon} 
              size={20} 
              color={currentVariant === 'error' ? '#ef4444' : 
                     currentVariant === 'success' ? '#10b981' : 
                     isFocused ? '#0066A1' : '#6b7280'} 
            />
          </View>
        )}

        {/* Text Input */}
        <TextInput
          ref={ref}
          value={value}
          onChangeText={onChangeText}
          onFocus={handleFocus}
          onBlur={handleBlur}
          placeholder={placeholder}
          placeholderTextColor="#9ca3af"
          secureTextEntry={secureTextEntry && !isSecureVisible}
          editable={!disabled && !loading}
          className={textVariants({ size, disabled: disabled || loading })}
          style={inputStyle}
          
          // Accessibility
          accessibilityLabel={inputAccessibilityLabel}
          accessibilityHint={inputAccessibilityHint}
          accessibilityRole="text" as AccessibilityRole
          accessible={true}
          
          {...textInputProps}
        />

        {/* Loading Indicator */}
        {loading && (
          <View className="ml-3">
            <Ionicons name="refresh" size={20} color="#6b7280" />
          </View>
        )}

        {/* Right Icon */}
        {actualRightIcon && !loading && (
          <TouchableOpacity 
            onPress={actualOnRightIconPress}
            className="ml-3"
            disabled={!actualOnRightIconPress}
            accessibilityRole="button"
            accessibilityLabel={secureTextEntry 
              ? (isSecureVisible ? 'Hide password' : 'Show password')
              : 'Input action'
            }
          >
            <Ionicons 
              name={actualRightIcon} 
              size={20} 
              color={currentVariant === 'error' ? '#ef4444' : 
                     currentVariant === 'success' ? '#10b981' : 
                     isFocused ? '#0066A1' : '#6b7280'} 
            />
          </TouchableOpacity>
        )}
      </View>

      {/* Helper/Error/Success Text */}
      {(errorText || successText || helperText) && (
        <View className="mt-1">
          {errorText && (
            <Text className="text-red-600 font-body-sm flex-row items-center">
              <Ionicons name="alert-circle-outline" size={14} color="#dc2626" />
              <Text className="ml-1">{errorText}</Text>
            </Text>
          )}
          {successText && !errorText && (
            <Text className="text-green-600 font-body-sm flex-row items-center">
              <Ionicons name="checkmark-circle-outline" size={14} color="#16a34a" />
              <Text className="ml-1">{successText}</Text>
            </Text>
          )}
          {helperText && !errorText && !successText && (
            <Text className="text-gray-500 font-body-sm">
              {helperText}
            </Text>
          )}
        </View>
      )}
    </View>
  );
});

Input.displayName = 'Input';

export default Input;