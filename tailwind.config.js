/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./App.{js,jsx,ts,tsx}", "./src/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        // Primary: Deep Navy Blue - Main Brand Color
        primary: {
          50: '#e6e9f0',   // Very light navy for backgrounds
          100: '#c7cfdf',  // Light navy for subtle backgrounds
          200: '#a3b1ca',  // Soft navy for disabled states
          300: '#7f92b5',  // Medium light navy
          400: '#5c74a0',  // Medium navy
          500: '#1a2c4f',  // Main deep navy blue (from screenshots)
          600: '#162642',  // Darker navy for hover states
          700: '#122035',  // Deep navy for active states
          800: '#0e1a29',  // Very deep navy
          900: '#0a141d',  // Darkest navy
          DEFAULT: '#1a2c4f',
          foreground: '#ffffff',
        },

        // Secondary: Vibrant Yellow/Gold - Accent Color
        secondary: {
          50: '#fffef7',   // Very light yellow
          100: '#fffce8',  // Light yellow backgrounds
          200: '#fff7c7',  // Soft yellow
          300: '#ffeb99',  // Medium light yellow
          400: '#ffd652',  // Medium yellow
          500: '#f5d523',  // Main vibrant yellow (from screenshots)
          600: '#e5c31f',  // Darker yellow
          700: '#c9a61a',  // Deep yellow
          800: '#a68817',  // Very dark yellow
          900: '#896f15',  // Darkest yellow
          DEFAULT: '#f5d523',
          foreground: '#1a2c4f',
        },

        // Success: Bright Green - Confirmed & Active
        success: {
          50: '#f0fdf4',   // Very light green
          100: '#dcfce7',  // Light green backgrounds
          200: '#bbf7d0',  // Soft green
          300: '#86efac',  // Medium light green
          400: '#4ade80',  // Medium green
          500: '#22c55e',  // Main success green
          600: '#16a34a',  // Darker green for buttons
          700: '#15803d',  // Deep green
          800: '#166534',  // Very deep green
          900: '#14532d',  // Darkest green
          DEFAULT: '#22c55e',
          foreground: '#ffffff',
        },

        // Warning: Orange - Alerts & Attention
        warning: {
          50: '#fff7ed',   // Very light orange
          100: '#ffedd5',  // Light orange backgrounds
          200: '#fed7aa',  // Soft orange
          300: '#fdba74',  // Medium light orange
          400: '#fb923c',  // Medium orange
          500: '#f97316',  // Main warning orange
          600: '#ea580c',  // Darker orange
          700: '#c2410c',  // Deep orange
          800: '#9a3412',  // Very deep orange
          900: '#7c2d12',  // Darkest orange
          DEFAULT: '#f97316',
          foreground: '#ffffff',
        },

        // Error/Danger: Professional Red - Alerts & Losses
        error: {
          50: '#fef2f2',   // Very light red
          100: '#fee2e2',  // Light red backgrounds
          200: '#fecaca',  // Soft red
          300: '#fca5a5',  // Medium light red
          400: '#f87171',  // Medium red
          500: '#dc2626',  // Main error red
          600: '#b91c1c',  // Darker red
          700: '#991b1b',  // Deep red
          800: '#7f1d1d',  // Very deep red
          900: '#450a0a',  // Darkest red
          DEFAULT: '#dc2626',
          foreground: '#ffffff',
        },

        // Alias for consistency with shadcn/ui
        destructive: {
          DEFAULT: '#dc2626',
          foreground: '#ffffff',
        },

        // Professional Grays - Clean & Modern
        gray: {
          50: '#f8fafc',   // Background light
          100: '#f1f5f9',  // Card backgrounds light
          200: '#e2e8f0',  // Borders light
          300: '#cbd5e1',  // Subtle borders
          400: '#94a3b8',  // Placeholder text
          500: '#64748b',  // Secondary text
          600: '#475569',  // Body text
          700: '#334155',  // Heading text
          800: '#1e293b',  // Dark text
          900: '#0f172a',  // Primary text
        },

        // Semantic Colors - Dark Theme First
        background: {
          DEFAULT: '#0f1721',      // Main dark background (deep navy)
          dark: '#0f1721',         // Dark mode background
          secondary: '#1a2c4f',    // Secondary background (card backgrounds)
          tertiary: '#243449',     // Tertiary background (elevated cards)
        },
        foreground: {
          DEFAULT: '#ffffff',      // Primary text
          dark: '#ffffff',         // Dark mode text
          muted: '#94a3b8',       // Muted text
          subtle: '#64748b',      // Subtle text
        },
        card: {
          DEFAULT: '#1a2c4f',      // Card backgrounds (navy)
          dark: '#1a2c4f',         // Dark mode cards
          foreground: '#ffffff',   // Card text
          'foreground-dark': '#ffffff', // Dark mode card text
          elevated: '#243449',     // Elevated cards
        },
        muted: {
          DEFAULT: '#243449',      // Muted backgrounds
          dark: '#243449',         // Dark mode muted backgrounds
          foreground: '#94a3b8',   // Muted text
          'foreground-dark': '#94a3b8', // Dark mode muted text
        },
        border: {
          DEFAULT: '#2a3f5f',      // Borders (subtle navy)
          dark: '#2a3f5f',         // Dark mode borders
          subtle: '#1f3048',       // Subtle borders
        },
        input: {
          DEFAULT: '#1a2c4f',      // Input backgrounds
          dark: '#1a2c4f',         // Dark mode inputs
          border: '#2a3f5f',       // Input borders
        },
        ring: {
          DEFAULT: '#f5d523',      // Focus ring color (yellow accent)
        },

        // Accent: Bright Yellow - Primary Actions & Premium
        accent: {
          50: '#fffef7',
          100: '#fffce8',
          200: '#fff7c7',
          300: '#ffeb99',
          400: '#ffd652',
          500: '#f5d523',  // Bright yellow accent
          600: '#e5c31f',
          700: '#c9a61a',
          800: '#a68817',
          900: '#896f15',
          DEFAULT: '#f5d523',
          foreground: '#1a2c4f',
        },
      },

      // Dark theme shadows with glow effects
      boxShadow: {
        'soft': '0 1px 3px 0 rgba(0, 0, 0, 0.3), 0 1px 2px 0 rgba(0, 0, 0, 0.2)',
        'card': '0 4px 6px -1px rgba(0, 0, 0, 0.3), 0 2px 4px -1px rgba(0, 0, 0, 0.2)',
        'floating': '0 10px 15px -3px rgba(0, 0, 0, 0.3), 0 4px 6px -2px rgba(0, 0, 0, 0.2)',
        'glow-primary': '0 0 20px rgba(26, 44, 79, 0.3)',
        'glow-accent': '0 0 20px rgba(245, 213, 35, 0.3)',
        'glow-success': '0 0 20px rgba(34, 197, 94, 0.3)',
        'glow-warning': '0 0 20px rgba(249, 115, 22, 0.3)',
        'glow-error': '0 0 20px rgba(220, 38, 38, 0.3)',
      },

      // Dark theme gradients
      backgroundImage: {
        'gradient-primary': 'linear-gradient(135deg, #1a2c4f 0%, #243449 100%)',
        'gradient-accent': 'linear-gradient(135deg, #f5d523 0%, #ffd652 100%)',
        'gradient-success': 'linear-gradient(135deg, #22c55e 0%, #4ade80 100%)',
        'gradient-warning': 'linear-gradient(135deg, #f97316 0%, #fb923c 100%)',
        'gradient-subtle': 'linear-gradient(135deg, #1a2c4f 0%, #0f1721 100%)',
        'gradient-card': 'linear-gradient(135deg, rgba(245,213,35,0.1) 0%, rgba(245,213,35,0.05) 100%)',
        'gradient-dark': 'linear-gradient(180deg, #0f1721 0%, #1a2c4f 100%)',
      },

      // Typography system
      fontFamily: {
        'sans': [
          'SF Pro Display', 
          '-apple-system', 
          'BlinkMacSystemFont',
          'Segoe UI', 
          'Roboto',
          'Helvetica Neue', 
          'Arial', 
          'sans-serif'
        ],
        'mono': [
          'SF Mono',
          'Monaco',
          'Cascadia Code',
          'Roboto Mono',
          'Consolas',
          'monospace'
        ],
      },

      // Enhanced spacing system (4px base)
      spacing: {
        '18': '4.5rem',   // 72px
        '88': '22rem',    // 352px
        '92': '23rem',    // 368px
        '100': '25rem',   // 400px
        '104': '26rem',   // 416px
        '112': '28rem',   // 448px
        '128': '32rem',   // 512px
      },

      // Smooth animations
      animation: {
        'fade-in': 'fadeIn 0.3s ease-in-out',
        'fade-out': 'fadeOut 0.3s ease-in-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'slide-down': 'slideDown 0.3s ease-out',
        'scale-in': 'scaleIn 0.2s ease-out',
        'spin': 'spin 1s linear infinite',
        'pulse-soft': 'pulseSoft 2s ease-in-out infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        fadeOut: {
          '0%': { opacity: '1' },
          '100%': { opacity: '0' },
        },
        slideUp: {
          '0%': { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        slideDown: {
          '0%': { transform: 'translateY(-10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        scaleIn: {
          '0%': { transform: 'scale(0.95)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        pulseSoft: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.8' },
        },
      },

      // Border radius system
      borderRadius: {
        'xl': '0.75rem',    // 12px
        '2xl': '1rem',      // 16px
        '3xl': '1.5rem',    // 24px
      },
    },
  },
  plugins: [],
  darkMode: 'class',
};