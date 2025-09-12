/**
 * SureBank Animation System
 * 
 * Professional micro-interactions and animations for financial interfaces.
 * Focused on smooth, subtle animations that enhance UX without being distracting.
 */

// Animation timing functions (easing curves)
export const easings = {
  // Standard material design curves
  standard: 'cubic-bezier(0.4, 0.0, 0.2, 1)',
  decelerate: 'cubic-bezier(0.0, 0.0, 0.2, 1)',
  accelerate: 'cubic-bezier(0.4, 0.0, 1, 1)',
  sharp: 'cubic-bezier(0.4, 0.0, 0.6, 1)',
  
  // Custom professional curves
  smooth: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)',
  gentle: 'cubic-bezier(0.25, 0.1, 0.25, 1)',
  bounce: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
  
  // Ease variants
  easeIn: 'cubic-bezier(0.4, 0, 1, 1)',
  easeOut: 'cubic-bezier(0, 0, 0.2, 1)',
  easeInOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
} as const;

// Animation durations (in milliseconds)
export const durations = {
  instant: 0,
  fast: 150,
  normal: 250,
  slow: 350,
  slower: 500,
  slowest: 750,
} as const;

// Animation delays
export const delays = {
  none: 0,
  short: 75,
  medium: 150,
  long: 300,
} as const;

// Common animation presets
export const animations = {
  // Fade animations
  fadeIn: {
    keyframes: {
      '0%': { opacity: 0 },
      '100%': { opacity: 1 },
    },
    duration: durations.normal,
    easing: easings.easeOut,
  },
  
  fadeOut: {
    keyframes: {
      '0%': { opacity: 1 },
      '100%': { opacity: 0 },
    },
    duration: durations.fast,
    easing: easings.easeIn,
  },
  
  // Slide animations
  slideInUp: {
    keyframes: {
      '0%': { transform: 'translateY(10px)', opacity: 0 },
      '100%': { transform: 'translateY(0)', opacity: 1 },
    },
    duration: durations.normal,
    easing: easings.easeOut,
  },
  
  slideInDown: {
    keyframes: {
      '0%': { transform: 'translateY(-10px)', opacity: 0 },
      '100%': { transform: 'translateY(0)', opacity: 1 },
    },
    duration: durations.normal,
    easing: easings.easeOut,
  },
  
  slideInLeft: {
    keyframes: {
      '0%': { transform: 'translateX(-10px)', opacity: 0 },
      '100%': { transform: 'translateX(0)', opacity: 1 },
    },
    duration: durations.normal,
    easing: easings.easeOut,
  },
  
  slideInRight: {
    keyframes: {
      '0%': { transform: 'translateX(10px)', opacity: 0 },
      '100%': { transform: 'translateX(0)', opacity: 1 },
    },
    duration: durations.normal,
    easing: easings.easeOut,
  },
  
  // Scale animations
  scaleIn: {
    keyframes: {
      '0%': { transform: 'scale(0.95)', opacity: 0 },
      '100%': { transform: 'scale(1)', opacity: 1 },
    },
    duration: durations.fast,
    easing: easings.easeOut,
  },
  
  scaleOut: {
    keyframes: {
      '0%': { transform: 'scale(1)', opacity: 1 },
      '100%': { transform: 'scale(0.95)', opacity: 0 },
    },
    duration: durations.fast,
    easing: easings.easeIn,
  },
  
  // Bounce animation for success states
  bounceIn: {
    keyframes: {
      '0%': { transform: 'scale(0.3)', opacity: 0 },
      '50%': { transform: 'scale(1.05)', opacity: 1 },
      '70%': { transform: 'scale(0.9)' },
      '100%': { transform: 'scale(1)' },
    },
    duration: durations.slow,
    easing: easings.easeOut,
  },
  
  // Pulse animation for loading states
  pulse: {
    keyframes: {
      '0%, 100%': { opacity: 1 },
      '50%': { opacity: 0.5 },
    },
    duration: durations.slower,
    easing: easings.easeInOut,
  },
  
  // Gentle pulse for subtle emphasis
  pulseSoft: {
    keyframes: {
      '0%, 100%': { opacity: 1 },
      '50%': { opacity: 0.8 },
    },
    duration: durations.slower,
    easing: easings.gentle,
  },
  
  // Spin animation for loading spinners
  spin: {
    keyframes: {
      '0%': { transform: 'rotate(0deg)' },
      '100%': { transform: 'rotate(360deg)' },
    },
    duration: 1000,
    easing: 'linear',
  },
  
  // Shake animation for errors
  shake: {
    keyframes: {
      '0%, 100%': { transform: 'translateX(0)' },
      '10%, 30%, 50%, 70%, 90%': { transform: 'translateX(-2px)' },
      '20%, 40%, 60%, 80%': { transform: 'translateX(2px)' },
    },
    duration: durations.slow,
    easing: easings.easeInOut,
  },
  
  // Wiggle animation for attention
  wiggle: {
    keyframes: {
      '0%, 100%': { transform: 'rotate(0deg)' },
      '25%': { transform: 'rotate(-1deg)' },
      '75%': { transform: 'rotate(1deg)' },
    },
    duration: durations.normal,
    easing: easings.easeInOut,
  },
} as const;

// Financial-specific animations
export const financialAnimations = {
  // Number counter animation
  countUp: {
    keyframes: {
      '0%': { transform: 'translateY(20px)', opacity: 0 },
      '100%': { transform: 'translateY(0)', opacity: 1 },
    },
    duration: durations.slow,
    easing: easings.easeOut,
  },
  
  // Balance reveal animation
  balanceReveal: {
    keyframes: {
      '0%': { 
        transform: 'scale(0.8)', 
        opacity: 0,
        filter: 'blur(4px)',
      },
      '100%': { 
        transform: 'scale(1)', 
        opacity: 1,
        filter: 'blur(0px)',
      },
    },
    duration: durations.slow,
    easing: easings.gentle,
  },
  
  // Success money animation
  moneySuccess: {
    keyframes: {
      '0%': { transform: 'scale(1)' },
      '50%': { transform: 'scale(1.1)' },
      '100%': { transform: 'scale(1)' },
    },
    duration: durations.normal,
    easing: easings.bounce,
  },
  
  // Loading dots for payment processing
  loadingDots: {
    keyframes: {
      '0%, 20%': { transform: 'scale(1)', opacity: 1 },
      '50%': { transform: 'scale(1.2)', opacity: 0.7 },
      '100%': { transform: 'scale(1)', opacity: 1 },
    },
    duration: durations.slower,
    easing: easings.easeInOut,
  },
} as const;

// Transition presets for common component states
export const transitions = {
  // Button state transitions
  button: {
    all: `all ${durations.fast}ms ${easings.easeOut}`,
    background: `background-color ${durations.fast}ms ${easings.easeOut}`,
    transform: `transform ${durations.fast}ms ${easings.easeOut}`,
    shadow: `box-shadow ${durations.fast}ms ${easings.easeOut}`,
  },
  
  // Card hover transitions
  card: {
    all: `all ${durations.normal}ms ${easings.smooth}`,
    elevation: `box-shadow ${durations.normal}ms ${easings.smooth}`,
    transform: `transform ${durations.normal}ms ${easings.smooth}`,
  },
  
  // Input focus transitions
  input: {
    all: `all ${durations.fast}ms ${easings.easeOut}`,
    border: `border-color ${durations.fast}ms ${easings.easeOut}`,
    outline: `outline ${durations.fast}ms ${easings.easeOut}`,
  },
  
  // Modal and overlay transitions
  modal: {
    backdrop: `opacity ${durations.normal}ms ${easings.easeOut}`,
    content: `all ${durations.normal}ms ${easings.easeOut}`,
  },
  
  // Navigation transitions
  navigation: {
    slide: `transform ${durations.normal}ms ${easings.standard}`,
    fade: `opacity ${durations.fast}ms ${easings.easeOut}`,
  },
} as const;

// Animation utility functions
export const animationUtils = {
  /**
   * Create a custom animation with duration and easing
   */
  createAnimation: (
    keyframes: Record<string, Record<string, string | number>>,
    duration: number = durations.normal,
    easing: string = easings.easeOut
  ) => ({
    keyframes,
    duration,
    easing,
  }),
  
  /**
   * Create a staggered animation delay
   */
  stagger: (index: number, baseDelay: number = delays.short): number => {
    return baseDelay * index;
  },
  
  /**
   * Get animation duration in CSS format
   */
  getDuration: (duration: keyof typeof durations): string => {
    return `${durations[duration]}ms`;
  },
  
  /**
   * Create a CSS transition string
   */
  transition: (
    property: string | string[],
    duration: keyof typeof durations = 'normal',
    easing: keyof typeof easings = 'easeOut'
  ): string => {
    const props = Array.isArray(property) ? property : [property];
    return props
      .map(prop => `${prop} ${durations[duration]}ms ${easings[easing]}`)
      .join(', ');
  },
  
  /**
   * Create a CSS keyframe animation string
   */
  keyframe: (
    name: keyof typeof animations,
    duration?: keyof typeof durations,
    easing?: keyof typeof easings,
    delay?: keyof typeof delays,
    iterationCount: number | 'infinite' = 1
  ): string => {
    const animation = animations[name];
    const animationDuration = duration ? durations[duration] : animation.duration;
    const animationEasing = easing ? easings[easing] : animation.easing;
    const animationDelay = delay ? delays[delay] : 0;
    
    return `${name} ${animationDuration}ms ${animationEasing} ${animationDelay}ms ${iterationCount}`;
  },
};

// React Native Reanimated 3 compatible configurations
export const reanimatedConfigs = {
  spring: {
    damping: 20,
    stiffness: 300,
    mass: 1,
  },
  
  timing: {
    duration: durations.normal,
    easing: 'ease-out',
  },
  
  gentle: {
    damping: 25,
    stiffness: 200,
    mass: 1,
  },
  
  bounce: {
    damping: 10,
    stiffness: 400,
    mass: 1,
  },
} as const;

export default {
  easings,
  durations,
  delays,
  animations,
  financialAnimations,
  transitions,
  reanimatedConfigs,
  utils: animationUtils,
};