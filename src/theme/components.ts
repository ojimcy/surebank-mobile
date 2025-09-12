/**
 * SureBank Component Styling System
 * 
 * Pre-defined component styles using class-variance-authority (cva)
 * for consistent and maintainable styling across the application.
 */

import { cva, type VariantProps } from 'class-variance-authority';

// Button component variants
export const buttonVariants = cva(
  // Base styles - common to all buttons
  [
    'inline-flex items-center justify-center rounded-lg font-semibold',
    'transition-all duration-200 ease-in-out',
    'disabled:opacity-50 disabled:pointer-events-none',
    'focus:outline-none focus:ring-2 focus:ring-offset-2',
  ],
  {
    variants: {
      variant: {
        // Primary - SureBank blue, main action
        primary: [
          'bg-primary text-white shadow-sm',
          'hover:bg-primary-600 focus:ring-primary',
          'active:bg-primary-700 active:shadow-none',
        ],
        // Secondary - Light blue, secondary actions
        secondary: [
          'bg-secondary-100 text-secondary-700 border border-secondary-200',
          'hover:bg-secondary-200 hover:border-secondary-300 focus:ring-secondary',
          'active:bg-secondary-300 active:shadow-none',
        ],
        // Outline - Transparent with border, tertiary actions
        outline: [
          'bg-transparent border border-gray-300 text-gray-700',
          'hover:bg-gray-50 hover:border-gray-400 focus:ring-primary',
          'active:bg-gray-100 active:shadow-none',
        ],
        // Ghost - No background, minimal emphasis
        ghost: [
          'bg-transparent text-gray-600',
          'hover:bg-gray-100 hover:text-gray-800 focus:ring-gray-200',
          'active:bg-gray-200',
        ],
        // Success - Green, positive actions
        success: [
          'bg-success text-white shadow-sm',
          'hover:bg-success-600 focus:ring-success',
          'active:bg-success-700 active:shadow-none',
        ],
        // Warning - Gold, caution actions
        warning: [
          'bg-warning text-white shadow-sm',
          'hover:bg-warning-600 focus:ring-warning',
          'active:bg-warning-700 active:shadow-none',
        ],
        // Destructive - Red, dangerous actions
        destructive: [
          'bg-error text-white shadow-sm',
          'hover:bg-error-600 focus:ring-error',
          'active:bg-error-700 active:shadow-none',
        ],
      },
      size: {
        sm: 'h-9 px-3 text-sm',
        md: 'h-11 px-4 text-sm',
        lg: 'h-12 px-6 text-base',
        xl: 'h-14 px-8 text-lg',
        icon: 'h-11 w-11 p-0',
      },
      fullWidth: {
        true: 'w-full',
        false: 'w-auto',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'md',
      fullWidth: false,
    },
  }
);

// Card component variants
export const cardVariants = cva(
  [
    'rounded-xl border bg-card',
    'shadow-card transition-shadow duration-200',
  ],
  {
    variants: {
      variant: {
        default: 'border-gray-200',
        elevated: 'border-gray-100 shadow-floating',
        outlined: 'border-gray-300 shadow-none',
        filled: 'bg-gray-50 border-gray-200',
      },
      padding: {
        none: 'p-0',
        sm: 'p-3',
        md: 'p-4',
        lg: 'p-6',
        xl: 'p-8',
      },
      hoverable: {
        true: 'hover:shadow-floating hover:scale-[1.01] cursor-pointer',
        false: '',
      },
    },
    defaultVariants: {
      variant: 'default',
      padding: 'md',
      hoverable: false,
    },
  }
);

// Input component variants
export const inputVariants = cva(
  [
    'flex w-full rounded-lg border bg-input px-3 py-2.5',
    'text-sm text-gray-900 placeholder:text-gray-400',
    'transition-colors duration-200',
    'focus:outline-none focus:ring-2 focus:ring-offset-1',
    'disabled:cursor-not-allowed disabled:opacity-50',
  ],
  {
    variants: {
      variant: {
        default: [
          'border-gray-200 focus:border-primary focus:ring-primary',
        ],
        error: [
          'border-error focus:border-error focus:ring-error',
        ],
        success: [
          'border-success focus:border-success focus:ring-success',
        ],
      },
      size: {
        sm: 'h-9 px-2.5 py-1.5 text-sm',
        md: 'h-11 px-3 py-2.5 text-sm',
        lg: 'h-12 px-4 py-3 text-base',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'md',
    },
  }
);

// Badge component variants
export const badgeVariants = cva(
  [
    'inline-flex items-center px-2.5 py-0.5 rounded-full',
    'text-xs font-medium transition-colors',
  ],
  {
    variants: {
      variant: {
        default: 'bg-gray-100 text-gray-800',
        primary: 'bg-primary-100 text-primary-800',
        secondary: 'bg-secondary-100 text-secondary-800',
        success: 'bg-success-100 text-success-800',
        warning: 'bg-warning-100 text-warning-800',
        error: 'bg-error-100 text-error-800',
        outline: 'border border-gray-200 text-gray-600',
      },
      size: {
        sm: 'px-2 py-0.5 text-xs',
        md: 'px-2.5 py-0.5 text-xs',
        lg: 'px-3 py-1 text-sm',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'md',
    },
  }
);

// Alert component variants
export const alertVariants = cva(
  [
    'relative rounded-lg border p-4',
    'flex items-start space-x-3',
  ],
  {
    variants: {
      variant: {
        default: [
          'bg-gray-50 border-gray-200 text-gray-800',
          '[&>svg]:text-gray-600',
        ],
        success: [
          'bg-success-50 border-success-200 text-success-800',
          '[&>svg]:text-success-600',
        ],
        warning: [
          'bg-warning-50 border-warning-200 text-warning-800',
          '[&>svg]:text-warning-600',
        ],
        error: [
          'bg-error-50 border-error-200 text-error-800',
          '[&>svg]:text-error-600',
        ],
        info: [
          'bg-primary-50 border-primary-200 text-primary-800',
          '[&>svg]:text-primary-600',
        ],
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
);

// Financial value component variants
export const financialValueVariants = cva(
  [
    'font-mono font-semibold tabular-nums',
    'transition-colors duration-200',
  ],
  {
    variants: {
      variant: {
        neutral: 'text-gray-900',
        positive: 'text-success',
        negative: 'text-error',
        pending: 'text-warning',
      },
      size: {
        sm: 'text-sm',
        md: 'text-base',
        lg: 'text-lg',
        xl: 'text-xl',
        '2xl': 'text-2xl',
        '3xl': 'text-3xl',
      },
      emphasis: {
        low: 'font-medium',
        medium: 'font-semibold',
        high: 'font-bold',
      },
    },
    defaultVariants: {
      variant: 'neutral',
      size: 'md',
      emphasis: 'medium',
    },
  }
);

// Status indicator variants
export const statusVariants = cva(
  [
    'inline-flex items-center px-2 py-1 rounded-full text-xs font-medium',
  ],
  {
    variants: {
      status: {
        active: 'bg-success-100 text-success-800',
        inactive: 'bg-gray-100 text-gray-800',
        pending: 'bg-warning-100 text-warning-800',
        suspended: 'bg-error-100 text-error-800',
        completed: 'bg-primary-100 text-primary-800',
      },
    },
    defaultVariants: {
      status: 'active',
    },
  }
);

// Loading spinner variants
export const spinnerVariants = cva(
  [
    'animate-spin rounded-full border-2 border-current border-t-transparent',
  ],
  {
    variants: {
      size: {
        sm: 'h-4 w-4',
        md: 'h-6 w-6',
        lg: 'h-8 w-8',
        xl: 'h-12 w-12',
      },
      variant: {
        primary: 'text-primary',
        secondary: 'text-secondary',
        white: 'text-white',
        gray: 'text-gray-400',
      },
    },
    defaultVariants: {
      size: 'md',
      variant: 'primary',
    },
  }
);

// Skeleton loading variants
export const skeletonVariants = cva(
  [
    'animate-pulse rounded bg-gray-200',
  ],
  {
    variants: {
      variant: {
        text: 'h-4',
        heading: 'h-6',
        button: 'h-11',
        card: 'h-32',
        avatar: 'h-12 w-12 rounded-full',
      },
    },
    defaultVariants: {
      variant: 'text',
    },
  }
);

// Export all variant types for TypeScript
export type ButtonVariants = VariantProps<typeof buttonVariants>;
export type CardVariants = VariantProps<typeof cardVariants>;
export type InputVariants = VariantProps<typeof inputVariants>;
export type BadgeVariants = VariantProps<typeof badgeVariants>;
export type AlertVariants = VariantProps<typeof alertVariants>;
export type FinancialValueVariants = VariantProps<typeof financialValueVariants>;
export type StatusVariants = VariantProps<typeof statusVariants>;
export type SpinnerVariants = VariantProps<typeof spinnerVariants>;
export type SkeletonVariants = VariantProps<typeof skeletonVariants>;

// Component style collections
export const componentStyles = {
  button: buttonVariants,
  card: cardVariants,
  input: inputVariants,
  badge: badgeVariants,
  alert: alertVariants,
  financialValue: financialValueVariants,
  status: statusVariants,
  spinner: spinnerVariants,
  skeleton: skeletonVariants,
} as const;

export default componentStyles;