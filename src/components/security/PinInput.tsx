/**
 * SureBank PIN Input Component
 * 
 * Professional PIN input component with customizable length,
 * secure display, haptic feedback, and accessibility features.
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  View, 
  Text, 
  Pressable,
  Vibration,
  Animated,
  ViewStyle,
  AccessibilityRole,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import clsx from 'clsx';

export interface PinInputProps {
  // Configuration
  length?: 4 | 6;
  value?: string;
  
  // Callbacks
  onChangeText?: (pin: string) => void;
  onComplete?: (pin: string) => void;
  
  // State
  loading?: boolean;
  error?: boolean;
  disabled?: boolean;
  
  // Display options
  secureTextEntry?: boolean;
  showValue?: boolean;
  
  // Validation
  errorMessage?: string;
  
  // Styling
  containerStyle?: ViewStyle;
  dotSize?: number;
  spacing?: number;
  
  // Accessibility
  accessibilityLabel?: string;
  accessibilityHint?: string;
  testID?: string;
}

export function PinInput({
  length = 6,
  value = '',
  onChangeText,
  onComplete,
  loading = false,
  error = false,
  disabled = false,
  secureTextEntry = true,
  showValue = false,
  errorMessage,
  containerStyle,
  dotSize = 16,
  spacing = 12,
  accessibilityLabel = 'PIN Input',
  accessibilityHint = 'Enter your PIN',
  testID,
}: PinInputProps) {
  const [pin, setPin] = useState(value);
  const [focusedIndex, setFocusedIndex] = useState<number | null>(null);
  const shakeAnimation = useRef(new Animated.Value(0)).current;
  const scaleAnimations = useRef(
    Array.from({ length }, () => new Animated.Value(1))
  ).current;

  // Update internal state when value prop changes
  useEffect(() => {
    setPin(value);
  }, [value]);

  // Handle PIN completion
  useEffect(() => {
    if (pin.length === length && onComplete) {
      onComplete(pin);
      // Haptic feedback for completion
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
  }, [pin, length, onComplete]);

  // Shake animation for errors
  const shake = useCallback(() => {
    Animated.sequence([
      Animated.timing(shakeAnimation, {
        toValue: 10,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(shakeAnimation, {
        toValue: -10,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(shakeAnimation, {
        toValue: 10,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(shakeAnimation, {
        toValue: 0,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();

    // Haptic feedback for error
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
  }, [shakeAnimation]);

  // Scale animation for input feedback
  const animateDot = useCallback((index: number) => {
    Animated.sequence([
      Animated.timing(scaleAnimations[index], {
        toValue: 1.2,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnimations[index], {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();
  }, [scaleAnimations]);

  // Trigger shake animation when error prop changes
  useEffect(() => {
    if (error) {
      shake();
    }
  }, [error, shake]);

  // Handle digit input
  const handleDigitPress = useCallback((digit: string) => {
    if (disabled || loading || pin.length >= length) return;

    const newPin = pin + digit;
    setPin(newPin);
    onChangeText?.(newPin);
    
    // Animate the dot that was just filled
    animateDot(pin.length);
    
    // Light haptic feedback
    Haptics.selectionAsync();
    
    setFocusedIndex(pin.length);
  }, [pin, disabled, loading, length, onChangeText, animateDot]);

  // Handle backspace
  const handleBackspace = useCallback(() => {
    if (disabled || loading || pin.length === 0) return;

    const newPin = pin.slice(0, -1);
    setPin(newPin);
    onChangeText?.(newPin);
    
    // Light haptic feedback
    Haptics.selectionAsync();
    
    setFocusedIndex(newPin.length - 1);
  }, [pin, disabled, loading, onChangeText]);

  // Clear all input
  const handleClear = useCallback(() => {
    if (disabled || loading) return;
    
    setPin('');
    onChangeText?.('');
    setFocusedIndex(null);
    
    // Medium haptic feedback
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  }, [disabled, loading, onChangeText]);

  // Render individual PIN dot/digit
  const renderDot = (index: number) => {
    const isFilled = index < pin.length;
    const isFocused = index === focusedIndex;
    const isError = error;
    
    return (
      <Animated.View
        key={index}
        style={[
          {
            transform: [
              { scale: scaleAnimations[index] },
              { translateX: shakeAnimation },
            ],
          },
        ]}
      >
        <View
          className={clsx(
            'items-center justify-center rounded-full border-2',
            isFilled ? (
              isError ? 'bg-red-100 border-red-500' : 'bg-primary-100 border-primary-500'
            ) : (
              isFocused ? 'bg-gray-50 border-primary-300' : 'bg-white border-gray-300'
            ),
            loading && 'opacity-50'
          )}
          style={{
            width: dotSize,
            height: dotSize,
          }}
        >
          {isFilled && (
            <>
              {secureTextEntry && !showValue ? (
                <View 
                  className={clsx(
                    'rounded-full',
                    isError ? 'bg-red-500' : 'bg-primary-600'
                  )}
                  style={{
                    width: dotSize * 0.3,
                    height: dotSize * 0.3,
                  }}
                />
              ) : (
                <Text 
                  className={clsx(
                    'font-semibold',
                    isError ? 'text-red-600' : 'text-primary-600'
                  )}
                  style={{ fontSize: dotSize * 0.6 }}
                >
                  {pin[index]}
                </Text>
              )}
            </>
          )}
          
          {loading && index === pin.length && (
            <View className="absolute">
              <Ionicons 
                name="ellipsis-horizontal" 
                size={dotSize * 0.4} 
                color="#6b7280" 
              />
            </View>
          )}
        </View>
      </Animated.View>
    );
  };

  // Render number pad button
  const renderNumberButton = (number: string) => (
    <Pressable
      key={number}
      onPress={() => handleDigitPress(number)}
      disabled={disabled || loading}
      className={clsx(
        'w-20 h-20 rounded-full items-center justify-center',
        'bg-white border-2 border-gray-200',
        'active:bg-primary-50 active:border-primary-300',
        (disabled || loading) && 'opacity-50'
      )}
      style={{
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
      }}
      android_ripple={{ color: '#e0f2fe' }}
      accessibilityRole="button"
      accessibilityLabel={`Digit ${number}`}
    >
      <Text className="text-3xl font-bold text-gray-900">
        {number}
      </Text>
    </Pressable>
  );

  return (
    <View style={containerStyle} testID={testID}>
      {/* PIN Display */}
      <View
        className="flex-row justify-center items-center mb-12"
        style={{ gap: spacing }}
        accessibilityRole="none"
        accessibilityLabel={accessibilityLabel}
        accessibilityHint={accessibilityHint}
        accessibilityValue={{
          text: `${pin.length} of ${length} digits entered`
        }}
      >
        {Array.from({ length }, (_, index) => renderDot(index))}
      </View>

      {/* Error Message */}
      {errorMessage && (
        <View className="flex-row items-center justify-center mb-8 px-6">
          <View className="bg-red-50 border border-red-200 rounded-lg px-4 py-3 flex-row items-center">
            <Ionicons name="alert-circle" size={18} color="#dc2626" />
            <Text className="text-red-600 font-medium ml-2 flex-1">
              {errorMessage}
            </Text>
          </View>
        </View>
      )}

      {/* Number Pad */}
      <View className="items-center">
        {/* Numbers 1-9 */}
        <View className="flex-row flex-wrap justify-center" style={{ gap: 16, maxWidth: 280 }}>
          {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map(renderNumberButton)}
        </View>

        {/* Bottom row: Clear, 0, Backspace */}
        <View className="flex-row items-center justify-center mt-4" style={{ gap: 16 }}>
          {/* Clear button */}
          <Pressable
            onPress={handleClear}
            disabled={disabled || loading || pin.length === 0}
            className={clsx(
              'w-20 h-20 rounded-full items-center justify-center',
              'bg-white border-2 border-gray-200',
              'active:bg-red-50 active:border-red-300',
              (disabled || loading || pin.length === 0) && 'opacity-30'
            )}
            style={{
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.05,
              shadowRadius: 4,
              elevation: 2,
            }}
            android_ripple={{ color: '#fee2e2' }}
            accessibilityRole="button"
            accessibilityLabel="Clear PIN"
          >
            <Text className="text-sm font-semibold text-red-600">
              Clear
            </Text>
          </Pressable>

          {/* 0 button */}
          {renderNumberButton('0')}

          {/* Backspace button */}
          <Pressable
            onPress={handleBackspace}
            disabled={disabled || loading || pin.length === 0}
            className={clsx(
              'w-20 h-20 rounded-full items-center justify-center',
              'bg-white border-2 border-gray-200',
              'active:bg-gray-50 active:border-gray-300',
              (disabled || loading || pin.length === 0) && 'opacity-30'
            )}
            style={{
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.05,
              shadowRadius: 4,
              elevation: 2,
            }}
            android_ripple={{ color: '#f3f4f6' }}
            accessibilityRole="button"
            accessibilityLabel="Delete last digit"
          >
            <Ionicons
              name="backspace-outline"
              size={28}
              color={(disabled || loading || pin.length === 0) ? '#9ca3af' : '#374151'}
            />
          </Pressable>
        </View>
      </View>
    </View>
  );
}

export default PinInput;