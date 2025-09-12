/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./App.{js,jsx,ts,tsx}", "./src/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        // Primary: SureBank Blue - Trust & Security
        primary: {
          50: '#eff6ff',   // Very light blue for backgrounds
          100: '#dbeafe',  // Light blue for subtle backgrounds
          200: '#bfdbfe',  // Soft blue for disabled states
          300: '#93c5fd',  // Medium light blue
          400: '#60a5fa',  // Medium blue
          500: '#0066A1',  // Main SureBank blue
          600: '#005580',  // Darker blue for hover states
          700: '#004466',  // Deep blue for active states
          800: '#003355',  // Very deep blue
          900: '#002244',  // Darkest blue
          DEFAULT: '#0066A1',
          foreground: '#ffffff',
        },

        // Secondary: Light Blue - Innovation & Tech
        secondary: {
          50: '#f0f9ff',   // Very light sky
          100: '#e0f2fe',  // Light sky backgrounds
          200: '#bae6fd',  // Soft sky
          300: '#7dd3fc',  // Medium sky
          400: '#38bdf8',  // Bright sky
          500: '#0ea5e9',  // Main secondary blue
          600: '#0284c7',  // Darker sky
          700: '#0369a1',  // Deep sky
          800: '#075985',  // Very dark sky
          900: '#0c4a6e',  // Darkest sky
          DEFAULT: '#0ea5e9',
          foreground: '#ffffff',
        },

        // Success: Professional Green - Growth & Profits
        success: {
          50: '#f0fdf4',   // Very light green
          100: '#dcfce7',  // Light green backgrounds
          200: '#bbf7d0',  // Soft green
          300: '#86efac',  // Medium light green
          400: '#4ade80',  // Medium green
          500: '#10b981',  // Main success green
          600: '#059669',  // Darker green for buttons
          700: '#047857',  // Deep green
          800: '#065f46',  // Very deep green
          900: '#064e3b',  // Darkest green
          DEFAULT: '#10b981',
          foreground: '#ffffff',
        },

        // Warning: Professional Gold - Pending & Premium
        warning: {
          50: '#fffbeb',   // Very light amber
          100: '#fef3c7',  // Light amber backgrounds
          200: '#fde68a',  // Soft amber
          300: '#fcd34d',  // Medium light amber
          400: '#fbbf24',  // Medium amber
          500: '#f59e0b',  // Main warning gold
          600: '#d97706',  // Darker amber
          700: '#b45309',  // Deep amber
          800: '#92400e',  // Very deep amber
          900: '#78350f',  // Darkest amber
          DEFAULT: '#f59e0b',
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

        // Semantic Colors - Light/Dark Mode Support
        background: {
          DEFAULT: '#ffffff',      // Light mode background
          dark: '#0f172a',        // Dark mode background
        },
        foreground: {
          DEFAULT: '#0f172a',     // Light mode text
          dark: '#f8fafc',        // Dark mode text
        },
        card: {
          DEFAULT: '#ffffff',     // Light mode cards
          dark: '#1e293b',       // Dark mode cards
          foreground: '#0f172a', // Light mode card text
          'foreground-dark': '#f8fafc', // Dark mode card text
        },
        muted: {
          DEFAULT: '#f1f5f9',     // Light mode muted backgrounds
          dark: '#334155',        // Dark mode muted backgrounds
          foreground: '#64748b',  // Light mode muted text
          'foreground-dark': '#94a3b8', // Dark mode muted text
        },
        border: {
          DEFAULT: '#e2e8f0',     // Light mode borders
          dark: '#334155',        // Dark mode borders
        },
        input: {
          DEFAULT: '#ffffff',     // Light mode inputs
          dark: '#1e293b',       // Dark mode inputs
        },
        ring: {
          DEFAULT: '#0066A1',     // Focus ring color
        },

        // Accent: Premium Gold - VIP Features
        accent: {
          50: '#fffbeb',
          100: '#fef3c7',
          200: '#fde68a',
          300: '#fcd34d',
          400: '#fbbf24',
          500: '#f59e0b',  // Premium gold
          600: '#d97706',
          700: '#b45309',
          800: '#92400e',
          900: '#78350f',
          DEFAULT: '#f59e0b',
          foreground: '#0f172a',
        },
      },

      // Professional shadows
      boxShadow: {
        'soft': '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
        'card': '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
        'floating': '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
        'glow-primary': '0 0 20px rgba(0, 102, 161, 0.15)',
        'glow-success': '0 0 20px rgba(16, 185, 129, 0.15)',
        'glow-warning': '0 0 20px rgba(245, 158, 11, 0.15)',
        'glow-error': '0 0 20px rgba(220, 38, 38, 0.15)',
      },

      // Professional gradients
      backgroundImage: {
        'gradient-primary': 'linear-gradient(135deg, #0066A1 0%, #0ea5e9 100%)',
        'gradient-success': 'linear-gradient(135deg, #10b981 0%, #34d399 100%)',
        'gradient-warning': 'linear-gradient(135deg, #f59e0b 0%, #fbbf24 100%)',
        'gradient-subtle': 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)',
        'gradient-card': 'linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 100%)',
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