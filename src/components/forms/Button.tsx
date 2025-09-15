/**
 * SureBank Professional Button Component
 * 
 * Reusable button component with multiple variants,
 * loading states, and accessibility features.
 */

import React, { ReactNode } from 'react';
import { 
  TouchableOpacity, 
  TouchableOpacityProps, 
  Text, 
  View,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { cva, type VariantProps } from 'class-variance-authority';
import clsx from 'clsx';

// Button variants using class-variance-authority
const buttonVariants = cva(
  // Base styles
  'flex-row items-center justify-center rounded-lg border transition-colors',
  {
    variants: {
      variant: {
        primary: 'bg-primary-600 border-primary-600 active:bg-primary-700',
        secondary: 'bg-white border-gray-300 active:bg-gray-50',
        outline: 'bg-transparent border-primary-600 active:bg-primary-50',
        ghost: 'bg-transparent border-transparent active:bg-gray-100',
        destructive: 'bg-red-600 border-red-600 active:bg-red-700',
        success: 'bg-green-600 border-green-600 active:bg-green-700',
      },
      size: {
        sm: 'px-3 py-2',
        md: 'px-4 py-3',
        lg: 'px-6 py-4',
        xl: 'px-8 py-5',
      },
      fullWidth: {
        true: 'w-full',
        false: 'w-auto',
      },
      disabled: {
        true: 'opacity-50',
        false: 'opacity-100',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'md',
      fullWidth: false,
      disabled: false,
    },
  }
);

const textVariants = cva(
  // Base text styles
  'font-semibold text-center',
  {
    variants: {
      variant: {
        primary: 'text-white',
        secondary: 'text-gray-700',
        outline: 'text-primary-600',
        ghost: 'text-gray-700',
        destructive: 'text-white',
        success: 'text-white',
      },
      size: {
        sm: 'text-sm',
        md: 'text-base',
        lg: 'text-lg',
        xl: 'text-xl',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'md',
    },
  }
);

export interface ButtonProps extends Omit<TouchableOpacityProps, 'style'>, VariantProps<typeof buttonVariants> {
  // Content
  children?: ReactNode;
  title?: string;
  
  // Icons
  leftIcon?: keyof typeof Ionicons.glyphMap;
  rightIcon?: keyof typeof Ionicons.glyphMap;
  iconSize?: number;
  
  // State
  loading?: boolean;
  disabled?: boolean;
  
  // Styling
  className?: string;
  
  // Accessibility
  accessibilityLabel?: string;
  accessibilityHint?: string;
}

export function Button({
  // Content
  children,
  title,
  
  // Icons
  leftIcon,
  rightIcon,
  iconSize = 20,
  
  // State
  loading = false,
  disabled = false,
  
  // Variants
  variant,
  size,
  fullWidth,
  
  // Styling
  className,
  
  // Accessibility
  accessibilityLabel,
  accessibilityHint,
  
  // TouchableOpacity props
  onPress,
  testID,
  ...touchableProps
}: ButtonProps) {
  const isDisabled = disabled || loading;
  
  // Get icon color based on variant
  const getIconColor = () => {
    switch (variant) {
      case 'primary':
      case 'destructive':
      case 'success':
        return '#ffffff';
      case 'secondary':
      case 'ghost':
        return '#374151';
      case 'outline':
        return '#0066A1';
      default:
        return '#ffffff';
    }
  };

  const iconColor = getIconColor();
  const buttonAccessibilityLabel = accessibilityLabel || title || 'Button';

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={isDisabled}
      testID={testID}
      className={clsx(
        buttonVariants({ 
          variant, 
          size, 
          fullWidth, 
          disabled: isDisabled 
        }),
        className
      )}
      accessibilityRole="button"
      accessibilityLabel={buttonAccessibilityLabel}
      accessibilityHint={accessibilityHint}
      accessibilityState={{ disabled: isDisabled }}
      {...touchableProps}
    >
      {/* Loading Indicator */}
      {loading && (
        <View className="mr-2">
          <ActivityIndicator 
            size="small" 
            color={iconColor}
          />
        </View>
      )}

      {/* Left Icon */}
      {leftIcon && !loading && (
        <View className="mr-2">
          <Ionicons 
            name={leftIcon} 
            size={iconSize} 
            color={iconColor} 
          />
        </View>
      )}

      {/* Button Text/Content */}
      {title && (
        <Text 
          className={textVariants({ variant, size })}
          numberOfLines={1}
        >
          {title}
        </Text>
      )}
      
      {children && !title && children}

      {/* Right Icon */}
      {rightIcon && !loading && (
        <View className="ml-2">
          <Ionicons 
            name={rightIcon} 
            size={iconSize} 
            color={iconColor} 
          />
        </View>
      )}
    </TouchableOpacity>
  );
}

// Specialized button variants as separate components
export function PrimaryButton(props: Omit<ButtonProps, 'variant'>) {
  return <Button variant="primary" {...props} />;
}

export function SecondaryButton(props: Omit<ButtonProps, 'variant'>) {
  return <Button variant="secondary" {...props} />;
}

export function OutlineButton(props: Omit<ButtonProps, 'variant'>) {
  return <Button variant="outline" {...props} />;
}

export function GhostButton(props: Omit<ButtonProps, 'variant'>) {
  return <Button variant="ghost" {...props} />;
}

export function DestructiveButton(props: Omit<ButtonProps, 'variant'>) {
  return <Button variant="destructive" {...props} />;
}

export function SuccessButton(props: Omit<ButtonProps, 'variant'>) {
  return <Button variant="success" {...props} />;
}

export default Button;