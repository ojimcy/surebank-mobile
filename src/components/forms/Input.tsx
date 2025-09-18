/**
 * Clean Input Component - No external hooks or complex dependencies
 */

import React, { forwardRef, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TextInputProps,
  TouchableOpacity,
  ViewStyle,
  TextStyle,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export interface InputProps extends TextInputProps {
  label?: string;
  placeholder?: string;
  helperText?: string;
  errorText?: string;
  leftIcon?: keyof typeof Ionicons.glyphMap;
  rightIcon?: keyof typeof Ionicons.glyphMap;
  onRightIconPress?: () => void;
  containerStyle?: ViewStyle;
  inputStyle?: TextStyle;
  disabled?: boolean;
}

export const Input = forwardRef<TextInput, InputProps>(function Input(
  {
    label,
    placeholder,
    helperText,
    errorText,
    leftIcon,
    rightIcon,
    onRightIconPress,
    containerStyle,
    inputStyle,
    disabled = false,
    onFocus,
    onBlur,
    ...textInputProps
  },
  ref
) {
  const [isFocused, setIsFocused] = useState(false);

  const handleFocus = (e: any) => {
    setIsFocused(true);
    onFocus?.(e);
  };

  const handleBlur = (e: any) => {
    setIsFocused(false);
    onBlur?.(e);
  };

  const borderColor = errorText
    ? '#ef4444'
    : isFocused
      ? '#0066A1'
      : '#d1d5db';

  const iconColor = errorText
    ? '#ef4444'
    : isFocused
      ? '#0066A1'
      : '#6b7280';

  return (
    <View style={containerStyle}>
      {label && (
        <Text
          style={{
            color: '#374151',
            fontSize: 14,
            fontWeight: '500',
            marginBottom: 4,
          }}
        >
          {label}
        </Text>
      )}

      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          borderWidth: 1,
          borderColor,
          borderRadius: 8,
          paddingHorizontal: 12,
          paddingVertical: 10,
          backgroundColor: disabled ? '#f3f4f6' : '#ffffff',
        }}
      >
        {leftIcon && (
          <View style={{ marginRight: 8 }}>
            <Ionicons name={leftIcon} size={20} color={iconColor} />
          </View>
        )}

        <TextInput
          ref={ref}
          style={[
            {
              flex: 1,
              fontSize: 16,
              color: '#111827',
              padding: 0,
            },
            inputStyle,
          ]}
          placeholder={placeholder}
          placeholderTextColor="#64748b"
          editable={!disabled}
          onFocus={handleFocus}
          onBlur={handleBlur}
          {...textInputProps}
        />

        {rightIcon && (
          <TouchableOpacity
            onPress={onRightIconPress}
            disabled={!onRightIconPress}
            style={{ marginLeft: 8 }}
          >
            <Ionicons name={rightIcon} size={20} color={iconColor} />
          </TouchableOpacity>
        )}
      </View>

      {(helperText || errorText) && (
        <Text
          style={{
            color: errorText ? '#ef4444' : '#6b7280',
            fontSize: 12,
            marginTop: 4,
          }}
        >
          {errorText || helperText}
        </Text>
      )}
    </View>
  );
});

export default Input;