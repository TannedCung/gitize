/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      screens: {
        xs: '475px',
      },
      colors: {
        // Flat Minimalist Color Palette - Neutral grays, whites, and soft accents
        neutral: {
          white: '#FFFFFF',
          50: '#FAFAFA',
          100: '#F5F5F5',
          200: '#E5E5E5',
          300: '#D4D4D4',
          400: '#A3A3A3',
          500: '#737373',
          600: '#525252',
          700: '#404040',
          800: '#262626',
          900: '#171717',
          black: '#000000',
        },
        // Soft accent colors for minimal visual impact
        accent: {
          blue: {
            50: '#EFF6FF',
            100: '#DBEAFE',
            200: '#BFDBFE',
            300: '#93C5FD',
            400: '#60A5FA',
            500: '#3B82F6', // Primary blue
            600: '#2563EB',
            700: '#1D4ED8',
            800: '#1E40AF',
            900: '#1E3A8A',
          },
          green: {
            50: '#ECFDF5',
            100: '#D1FAE5',
            200: '#A7F3D0',
            300: '#6EE7B7',
            400: '#34D399',
            500: '#059669', // Primary green - better contrast
            600: '#059669',
            700: '#047857',
            800: '#065F46',
            900: '#064E3B',
          },
          red: {
            50: '#FEF2F2',
            100: '#FEE2E2',
            200: '#FECACA',
            300: '#FCA5A5',
            400: '#F87171',
            500: '#EF4444', // Primary red for errors
            600: '#DC2626',
            700: '#B91C1C',
            800: '#991B1B',
            900: '#7F1D1D',
          },
          amber: {
            50: '#FFFBEB',
            100: '#FEF3C7',
            200: '#FDE68A',
            300: '#FCD34D',
            400: '#FBBF24',
            500: '#F59E0B', // Primary amber for warnings
            600: '#D97706',
            700: '#B45309',
            800: '#92400E',
            900: '#78350F',
          },
        },
      },
      // Typography-first hierarchy with clean font stack
      fontFamily: {
        sans: [
          'Inter',
          'system-ui',
          '-apple-system',
          'BlinkMacSystemFont',
          'Segoe UI',
          'Roboto',
          'sans-serif',
        ],
        mono: [
          'JetBrains Mono',
          'SF Mono',
          'Monaco',
          'Inconsolata',
          'Roboto Mono',
          'monospace',
        ],
      },
      fontSize: {
        // Optimized typography scale for content hierarchy
        xs: ['0.75rem', { lineHeight: '1.125rem', letterSpacing: '0.025em' }],
        sm: ['0.875rem', { lineHeight: '1.375rem', letterSpacing: '0.016em' }],
        base: ['1rem', { lineHeight: '1.625rem', letterSpacing: '0' }],
        lg: ['1.125rem', { lineHeight: '1.75rem', letterSpacing: '-0.016em' }],
        xl: ['1.25rem', { lineHeight: '1.875rem', letterSpacing: '-0.025em' }],
        '2xl': [
          '1.5rem',
          { lineHeight: '2.125rem', letterSpacing: '-0.025em' },
        ],
        '3xl': [
          '1.875rem',
          { lineHeight: '2.375rem', letterSpacing: '-0.025em' },
        ],
        '4xl': [
          '2.25rem',
          { lineHeight: '2.75rem', letterSpacing: '-0.025em' },
        ],
        '5xl': ['3rem', { lineHeight: '3.5rem', letterSpacing: '-0.025em' }],
        '6xl': [
          '3.75rem',
          { lineHeight: '4.25rem', letterSpacing: '-0.025em' },
        ],
        '7xl': ['4.5rem', { lineHeight: '5rem', letterSpacing: '-0.025em' }],
        '8xl': ['6rem', { lineHeight: '6.5rem', letterSpacing: '-0.025em' }],
        '9xl': ['8rem', { lineHeight: '8.5rem', letterSpacing: '-0.025em' }],
      },
      fontWeight: {
        thin: '100',
        extralight: '200',
        light: '300',
        normal: '400',
        medium: '500',
        semibold: '600',
        bold: '700',
        extrabold: '800',
        black: '900',
      },
      // Expanded spacing scale for generous, airy layouts
      spacing: {
        0: '0',
        px: '1px',
        0.5: '0.125rem', // 2px
        1: '0.25rem', // 4px
        1.5: '0.375rem', // 6px
        2: '0.5rem', // 8px
        2.5: '0.625rem', // 10px
        3: '0.75rem', // 12px
        3.5: '0.875rem', // 14px
        4: '1rem', // 16px
        5: '1.25rem', // 20px
        6: '1.5rem', // 24px
        7: '1.75rem', // 28px
        8: '2rem', // 32px
        9: '2.25rem', // 36px
        10: '2.5rem', // 40px
        11: '2.75rem', // 44px
        12: '3rem', // 48px
        14: '3.5rem', // 56px
        16: '4rem', // 64px
        18: '4.5rem', // 72px
        20: '5rem', // 80px
        22: '5.5rem', // 88px
        24: '6rem', // 96px
        28: '7rem', // 112px
        32: '8rem', // 128px
        36: '9rem', // 144px
        40: '10rem', // 160px
        44: '11rem', // 176px
        48: '12rem', // 192px
        52: '13rem', // 208px
        56: '14rem', // 224px
        60: '15rem', // 240px
        64: '16rem', // 256px
        72: '18rem', // 288px
        80: '20rem', // 320px
        96: '24rem', // 384px
        // Additional generous spacing for airy layouts
        104: '26rem', // 416px
        112: '28rem', // 448px
        120: '30rem', // 480px
        128: '32rem', // 512px
        144: '36rem', // 576px
        160: '40rem', // 640px
        176: '44rem', // 704px
        192: '48rem', // 768px
        208: '52rem', // 832px
        224: '56rem', // 896px
        240: '60rem', // 960px
        256: '64rem', // 1024px
      },
      // Minimal border utilities for flat design
      borderRadius: {
        none: '0',
        sm: '0.125rem', // 2px - minimal rounding
        DEFAULT: '0.25rem', // 4px - subtle rounding
        md: '0.375rem', // 6px - moderate rounding
        lg: '0.5rem', // 8px - larger rounding
        xl: '0.75rem', // 12px - extra large rounding
        '2xl': '1rem', // 16px - very large rounding
        '3xl': '1.5rem', // 24px - maximum rounding
        full: '9999px', // circular
      },
      borderWidth: {
        DEFAULT: '1px',
        0: '0',
        2: '2px',
        4: '4px',
        8: '8px',
      },
      // Minimal border colors for flat design
      borderColor: {
        DEFAULT: '#E5E5E5', // neutral-200 - subtle default border
        none: 'transparent',
        subtle: '#E5E5E5', // neutral-200 - barely visible
        focus: '#3B82F6', // accent-blue-500 - focus state only
        error: '#EF4444', // accent-red-500 - error state
        success: '#10B981', // accent-green-500 - success state
        warning: '#F59E0B', // accent-amber-500 - warning state
      },
      // Flat design - no shadows (removed all shadow utilities)
      boxShadow: {
        none: 'none', // Only 'none' shadow for flat design
      },
      // Minimal animations for flat design - no scale or shadow effects
      animation: {
        'fade-in': 'fadeIn 0.2s ease-in-out',
        'fade-out': 'fadeOut 0.2s ease-in-out',
        'slide-in': 'slideIn 0.3s ease-out',
        'slide-out': 'slideOut 0.3s ease-out',
        'scale-in': 'scaleIn 0.2s ease-out',
        'progress-indeterminate':
          'progressIndeterminate 2s ease-in-out infinite',
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
        slideIn: {
          '0%': { transform: 'translateY(-8px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        slideOut: {
          '0%': { transform: 'translateY(0)', opacity: '1' },
          '100%': { transform: 'translateY(-8px)', opacity: '0' },
        },
        scaleIn: {
          '0%': { opacity: '0', transform: 'scale(0.95)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        progressIndeterminate: {
          '0%': { transform: 'translateX(-100%)', width: '100%' },
          '50%': { transform: 'translateX(0%)', width: '100%' },
          '100%': { transform: 'translateX(100%)', width: '100%' },
        },
      },
    },
  },
  plugins: [
    // Minimal scrollbar plugin for flat design
    function ({ addUtilities, theme }) {
      const scrollbarUtilities = {
        // Base scrollbar styles - minimal and flat
        '.scrollbar': {
          'scrollbar-width': 'thin',
          'scrollbar-color': `${theme('colors.neutral.300')} transparent`,
        },
        '.scrollbar-thin': {
          'scrollbar-width': 'thin',
        },
        '.scrollbar-none': {
          'scrollbar-width': 'none',
          '-ms-overflow-style': 'none',
          '&::-webkit-scrollbar': {
            display: 'none',
          },
        },
        // Webkit scrollbar styles for light mode - flat design
        '.scrollbar::-webkit-scrollbar': {
          width: '6px',
          height: '6px',
        },
        '.scrollbar::-webkit-scrollbar-track': {
          background: 'transparent',
        },
        '.scrollbar::-webkit-scrollbar-thumb': {
          background: theme('colors.neutral.300'),
          'border-radius': '0', // Flat design - no rounded corners
          transition: 'background-color 0.2s ease-in-out',
        },
        '.scrollbar::-webkit-scrollbar-thumb:hover': {
          background: theme('colors.neutral.400'),
        },
        '.scrollbar::-webkit-scrollbar-thumb:active': {
          background: theme('colors.neutral.500'),
        },
        '.scrollbar::-webkit-scrollbar-corner': {
          background: 'transparent',
        },
        // Dark mode scrollbar styles
        '.dark .scrollbar': {
          'scrollbar-color': `${theme('colors.neutral.600')} transparent`,
        },
        '.dark .scrollbar::-webkit-scrollbar-thumb': {
          background: theme('colors.neutral.600'),
        },
        '.dark .scrollbar::-webkit-scrollbar-thumb:hover': {
          background: theme('colors.neutral.500'),
        },
        '.dark .scrollbar::-webkit-scrollbar-thumb:active': {
          background: theme('colors.neutral.400'),
        },
        // Minimal accent scrollbar
        '.scrollbar-accent::-webkit-scrollbar-thumb': {
          background: theme('colors.accent.blue.500'),
          opacity: '0.6',
        },
        '.scrollbar-accent::-webkit-scrollbar-thumb:hover': {
          background: theme('colors.accent.blue.500'),
          opacity: '0.8',
        },
        '.scrollbar-accent::-webkit-scrollbar-thumb:active': {
          background: theme('colors.accent.blue.500'),
          opacity: '1',
        },
        '.dark .scrollbar-accent::-webkit-scrollbar-thumb': {
          background: theme('colors.accent.blue.400'),
          opacity: '0.6',
        },
        '.dark .scrollbar-accent::-webkit-scrollbar-thumb:hover': {
          background: theme('colors.accent.blue.400'),
          opacity: '0.8',
        },
        '.dark .scrollbar-accent::-webkit-scrollbar-thumb:active': {
          background: theme('colors.accent.blue.400'),
          opacity: '1',
        },
        // Smooth scrolling
        '.scroll-smooth': {
          'scroll-behavior': 'smooth',
        },
        // Touch scrolling for mobile
        '.scroll-touch': {
          '-webkit-overflow-scrolling': 'touch',
          'overscroll-behavior': 'contain',
        },
      };

      addUtilities(scrollbarUtilities);
    },
  ],
};
