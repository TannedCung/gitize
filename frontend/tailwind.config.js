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
        // AppFlowy Brand Colors
        brand: {
          skyline: '#00B5FF',
          aqua: '#00C8FF',
          violet: '#9327FF',
          amethyst: '#8427E0',
          berry: '#E3006D',
          coral: '#FB006D',
          golden: '#F7931E',
          amber: '#FFBD00',
          lemon: '#FFCE00',
        },
        // Semantic color scales based on AppFlowy brand
        primary: {
          50: '#e6f7ff',
          100: '#b3ebff',
          200: '#80dfff',
          300: '#4dd3ff',
          400: '#1ac7ff',
          500: '#00B5FF', // skyline
          600: '#0099d9',
          700: '#007db3',
          800: '#00618c',
          900: '#004566',
        },
        secondary: {
          50: '#f0e6ff',
          100: '#d1b3ff',
          200: '#b380ff',
          300: '#944dff',
          400: '#751aff',
          500: '#9327FF', // violet
          600: '#7a1fd9',
          700: '#6117b3',
          800: '#480f8c',
          900: '#2f0766',
        },
        accent: {
          50: '#ffe6f5',
          100: '#ffb3e6',
          200: '#ff80d6',
          300: '#ff4dc7',
          400: '#ff1ab7',
          500: '#E3006D', // berry
          600: '#c0005a',
          700: '#9d0047',
          800: '#7a0034',
          900: '#570021',
        },
        success: {
          50: '#f0f9ff',
          100: '#e0f2fe',
          200: '#bae6fd',
          300: '#7dd3fc',
          400: '#38bdf8',
          500: '#0ea5e9',
          600: '#0284c7',
          700: '#0369a1',
          800: '#075985',
          900: '#0c4a6e',
        },
        warning: {
          50: '#fffbeb',
          100: '#fef3c7',
          200: '#fde68a',
          300: '#fcd34d',
          400: '#fbbf24',
          500: '#FFBD00', // amber
          600: '#d97706',
          700: '#b45309',
          800: '#92400e',
          900: '#78350f',
        },
        error: {
          50: '#fef2f2',
          100: '#fee2e2',
          200: '#fecaca',
          300: '#fca5a5',
          400: '#f87171',
          500: '#ef4444',
          600: '#dc2626',
          700: '#b91c1c',
          800: '#991b1b',
          900: '#7f1d1d',
        },
        info: {
          50: '#e6f7ff',
          100: '#b3ebff',
          200: '#80dfff',
          300: '#4dd3ff',
          400: '#1ac7ff',
          500: '#00C8FF', // aqua
          600: '#00a6d9',
          700: '#0084b3',
          800: '#00628c',
          900: '#004066',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'Menlo', 'Monaco', 'monospace'],
      },
      fontSize: {
        xs: ['0.75rem', { lineHeight: '1rem' }],
        sm: ['0.875rem', { lineHeight: '1.25rem' }],
        base: ['1rem', { lineHeight: '1.5rem' }],
        lg: ['1.125rem', { lineHeight: '1.75rem' }],
        xl: ['1.25rem', { lineHeight: '1.75rem' }],
        '2xl': ['1.5rem', { lineHeight: '2rem' }],
        '3xl': ['1.875rem', { lineHeight: '2.25rem' }],
        '4xl': ['2.25rem', { lineHeight: '2.5rem' }],
        '5xl': ['3rem', { lineHeight: '1' }],
        '6xl': ['3.75rem', { lineHeight: '1' }],
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
      spacing: {
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
      },
      borderRadius: {
        none: '0',
        sm: '0.125rem', // 2px
        DEFAULT: '0.25rem', // 4px
        md: '0.375rem', // 6px
        lg: '0.5rem', // 8px
        xl: '0.75rem', // 12px
        '2xl': '1rem', // 16px
        '3xl': '1.5rem', // 24px
        full: '9999px',
      },
      boxShadow: {
        xs: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
        sm: '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
        DEFAULT:
          '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
        md: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
        lg: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
        xl: '0 25px 50px -12px rgb(0 0 0 / 0.25)',
        '2xl': '0 25px 50px -12px rgb(0 0 0 / 0.25)',
        inner: 'inset 0 2px 4px 0 rgb(0 0 0 / 0.05)',
        none: 'none',
        // AppFlowy specific shadows
        'appflowy-sm': '0 2px 4px 0 rgb(0 181 255 / 0.1)',
        'appflowy-md': '0 4px 12px 0 rgb(0 181 255 / 0.15)',
        'appflowy-lg': '0 8px 24px 0 rgb(0 181 255 / 0.2)',
        'appflowy-xl': '0 16px 48px 0 rgb(0 181 255 / 0.25)',
      },
      animation: {
        'fade-in': 'fadeIn 0.2s ease-in-out',
        'fade-out': 'fadeOut 0.2s ease-in-out',
        'slide-in': 'slideIn 0.3s ease-out',
        'slide-out': 'slideOut 0.3s ease-out',
        'scale-in': 'scaleIn 0.2s ease-out',
        'scale-out': 'scaleOut 0.2s ease-out',
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
          '0%': { transform: 'translateY(-10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        slideOut: {
          '0%': { transform: 'translateY(0)', opacity: '1' },
          '100%': { transform: 'translateY(-10px)', opacity: '0' },
        },
        scaleIn: {
          '0%': { transform: 'scale(0.95)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        scaleOut: {
          '0%': { transform: 'scale(1)', opacity: '1' },
          '100%': { transform: 'scale(0.95)', opacity: '0' },
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
    // Custom scrollbar plugin
    function ({ addUtilities, theme }) {
      const scrollbarUtilities = {
        // Base scrollbar styles
        '.scrollbar': {
          'scrollbar-width': 'thin',
          'scrollbar-color': `${theme('colors.gray.400')} transparent`,
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
        // Webkit scrollbar styles for light mode
        '.scrollbar::-webkit-scrollbar': {
          width: '8px',
          height: '8px',
        },
        '.scrollbar::-webkit-scrollbar-track': {
          background: 'transparent',
          'border-radius': theme('borderRadius.lg'),
        },
        '.scrollbar::-webkit-scrollbar-thumb': {
          background: theme('colors.gray.300'),
          'border-radius': theme('borderRadius.lg'),
          border: '2px solid transparent',
          'background-clip': 'padding-box',
          transition: 'background-color 0.2s ease-in-out',
        },
        '.scrollbar::-webkit-scrollbar-thumb:hover': {
          background: theme('colors.gray.400'),
        },
        '.scrollbar::-webkit-scrollbar-thumb:active': {
          background: theme('colors.gray.500'),
        },
        '.scrollbar::-webkit-scrollbar-corner': {
          background: 'transparent',
        },
        // Dark mode scrollbar styles
        '.dark .scrollbar': {
          'scrollbar-color': `${theme('colors.gray.600')} transparent`,
        },
        '.dark .scrollbar::-webkit-scrollbar-thumb': {
          background: theme('colors.gray.600'),
        },
        '.dark .scrollbar::-webkit-scrollbar-thumb:hover': {
          background: theme('colors.gray.500'),
        },
        '.dark .scrollbar::-webkit-scrollbar-thumb:active': {
          background: theme('colors.gray.400'),
        },
        // AppFlowy branded scrollbar
        '.scrollbar-brand::-webkit-scrollbar-thumb': {
          background: theme('colors.brand.skyline'),
          opacity: '0.6',
        },
        '.scrollbar-brand::-webkit-scrollbar-thumb:hover': {
          background: theme('colors.brand.skyline'),
          opacity: '0.8',
        },
        '.scrollbar-brand::-webkit-scrollbar-thumb:active': {
          background: theme('colors.brand.skyline'),
          opacity: '1',
        },
        '.dark .scrollbar-brand::-webkit-scrollbar-thumb': {
          background: theme('colors.brand.aqua'),
          opacity: '0.6',
        },
        '.dark .scrollbar-brand::-webkit-scrollbar-thumb:hover': {
          background: theme('colors.brand.aqua'),
          opacity: '0.8',
        },
        '.dark .scrollbar-brand::-webkit-scrollbar-thumb:active': {
          background: theme('colors.brand.aqua'),
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
        // Scrollbar variants
        '.scrollbar-thin::-webkit-scrollbar': {
          width: '6px',
          height: '6px',
        },
        '.scrollbar-thick::-webkit-scrollbar': {
          width: '12px',
          height: '12px',
        },
      };

      addUtilities(scrollbarUtilities);
    },
  ],
};
