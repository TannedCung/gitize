'use client';

import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from 'react';

type Theme = 'light' | 'dark' | 'system';

interface DesignTokens {
  colors: {
    // Neutral color palette for flat minimalist design
    neutral: {
      white: string;
      50: string;
      100: string;
      200: string;
      300: string;
      400: string;
      500: string;
      600: string;
      700: string;
      800: string;
      900: string;
      black: string;
    };
    // Soft accent colors for minimal visual impact
    accent: {
      blue: string;
      green: string;
      red: string;
      amber: string;
    };
    // Semantic colors derived from neutral and accent palette
    background: string;
    surface: string;
    text: string;
    textSecondary: string;
    textMuted: string;
    border: string;
    borderSubtle: string;
    borderFocus: string;
  };
  spacing: {
    xs: string;
    sm: string;
    md: string;
    lg: string;
    xl: string;
    '2xl': string;
    '3xl': string;
  };
  borderRadius: {
    none: string;
    sm: string;
    md: string;
    lg: string;
    xl: string;
  };
  // Removed shadows for flat design - only 'none' available
  shadows: {
    none: string;
  };
}

interface ThemeContextType {
  theme: Theme;
  // eslint-disable-next-line no-unused-vars
  setTheme: (newTheme: Theme) => void;
  resolvedTheme: 'light' | 'dark';
  designTokens: DesignTokens;
  isTransitioning: boolean;
  systemPreference: 'light' | 'dark';
}

const lightTokens: DesignTokens = {
  colors: {
    // Neutral color palette - light mode
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
      blue: '#3B82F6',
      green: '#059669', // Darker green for better contrast
      red: '#EF4444',
      amber: '#F59E0B',
    },
    // Semantic colors for light mode
    background: '#FFFFFF',
    surface: '#FAFAFA',
    text: '#171717', // neutral-900
    textSecondary: '#525252', // neutral-600
    textMuted: '#A3A3A3', // neutral-400
    border: '#E5E5E5', // neutral-200
    borderSubtle: '#F5F5F5', // neutral-100
    borderFocus: '#3B82F6', // accent-blue
  },
  spacing: {
    xs: '0.5rem',
    sm: '1rem',
    md: '1.5rem',
    lg: '2rem',
    xl: '3rem',
    '2xl': '4rem',
    '3xl': '6rem',
  },
  borderRadius: {
    none: '0',
    sm: '0.125rem',
    md: '0.25rem',
    lg: '0.375rem',
    xl: '0.5rem',
  },
  // Flat design - no shadows
  shadows: {
    none: 'none',
  },
};

const darkTokens: DesignTokens = {
  colors: {
    // Neutral color palette - dark mode (inverted)
    neutral: {
      white: '#000000', // Inverted for dark mode
      50: '#171717',
      100: '#262626',
      200: '#404040',
      300: '#525252',
      400: '#737373',
      500: '#A3A3A3',
      600: '#D4D4D4',
      700: '#E5E5E5',
      800: '#F5F5F5',
      900: '#FAFAFA',
      black: '#FFFFFF', // Inverted for dark mode
    },
    // Soft accent colors - slightly brighter for dark mode
    accent: {
      blue: '#60A5FA', // Lighter blue for better contrast
      green: '#34D399', // Lighter green for better contrast
      red: '#F87171', // Lighter red for better contrast
      amber: '#FBBF24', // Lighter amber for better contrast
    },
    // Semantic colors for dark mode
    background: '#000000', // Pure black for flat dark mode
    surface: '#171717', // neutral-50 (inverted)
    text: '#FAFAFA', // neutral-900 (inverted)
    textSecondary: '#D4D4D4', // neutral-600 (inverted)
    textMuted: '#737373', // neutral-400 (same)
    border: '#404040', // neutral-200 (inverted)
    borderSubtle: '#262626', // neutral-100 (inverted)
    borderFocus: '#60A5FA', // accent-blue (lighter)
  },
  spacing: {
    xs: '0.5rem',
    sm: '1rem',
    md: '1.5rem',
    lg: '2rem',
    xl: '3rem',
    '2xl': '4rem',
    '3xl': '6rem',
  },
  borderRadius: {
    none: '0',
    sm: '0.125rem',
    md: '0.25rem',
    lg: '0.375rem',
    xl: '0.5rem',
  },
  // Flat design - no shadows
  shadows: {
    none: 'none',
  },
};

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<Theme>('system');
  const [resolvedTheme, setResolvedTheme] = useState<'light' | 'dark'>('light');
  const [systemPreference, setSystemPreference] = useState<'light' | 'dark'>(
    'light'
  );
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [designTokens, setDesignTokens] = useState<DesignTokens>(lightTokens);

  // Detect system preference
  const detectSystemPreference = useCallback(() => {
    if (typeof window !== 'undefined') {
      return window.matchMedia('(prefers-color-scheme: dark)').matches
        ? 'dark'
        : 'light';
    }
    return 'light';
  }, []);

  // Load theme from localStorage on mount
  useEffect(() => {
    const savedTheme = localStorage.getItem('appflowy-theme') as Theme;
    const detectedSystemPreference = detectSystemPreference();

    setSystemPreference(detectedSystemPreference);

    if (savedTheme && ['light', 'dark', 'system'].includes(savedTheme)) {
      setThemeState(savedTheme);
    } else {
      // Default to system preference if no saved theme
      setThemeState('system');
    }
  }, [detectSystemPreference]);

  // Update resolved theme and design tokens
  useEffect(() => {
    const updateResolvedTheme = () => {
      let newResolvedTheme: 'light' | 'dark';

      if (theme === 'system') {
        newResolvedTheme = systemPreference;
      } else {
        newResolvedTheme = theme;
      }

      if (newResolvedTheme !== resolvedTheme) {
        setIsTransitioning(true);
        setResolvedTheme(newResolvedTheme);
        setDesignTokens(newResolvedTheme === 'dark' ? darkTokens : lightTokens);

        // End transition after animation completes
        setTimeout(() => setIsTransitioning(false), 300);
      }
    };

    updateResolvedTheme();
  }, [theme, systemPreference, resolvedTheme]);

  // Listen for system theme changes
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

    const handleSystemThemeChange = (e: MediaQueryListEvent) => {
      const newSystemPreference = e.matches ? 'dark' : 'light';
      setSystemPreference(newSystemPreference);
    };

    mediaQuery.addEventListener('change', handleSystemThemeChange);
    return () =>
      mediaQuery.removeEventListener('change', handleSystemThemeChange);
  }, []);

  // Apply theme to document with smooth transitions
  useEffect(() => {
    const root = document.documentElement;

    // Add transition class for smooth theme switching
    root.classList.add('theme-transition');

    // Apply theme class
    if (resolvedTheme === 'dark') {
      root.classList.add('dark');
      root.classList.remove('light');
    } else {
      root.classList.add('light');
      root.classList.remove('dark');
    }

    // Set CSS custom properties for design tokens
    const setCustomProperties = (tokens: DesignTokens) => {
      // Set neutral color palette
      Object.entries(tokens.colors.neutral).forEach(([key, value]) => {
        root.style.setProperty(`--color-neutral-${key}`, value);
      });

      // Set accent colors
      Object.entries(tokens.colors.accent).forEach(([key, value]) => {
        root.style.setProperty(`--color-accent-${key}`, value);
      });

      // Set semantic colors
      const semanticColors = {
        background: tokens.colors.background,
        surface: tokens.colors.surface,
        text: tokens.colors.text,
        textSecondary: tokens.colors.textSecondary,
        textMuted: tokens.colors.textMuted,
        border: tokens.colors.border,
        borderSubtle: tokens.colors.borderSubtle,
        borderFocus: tokens.colors.borderFocus,
      };

      Object.entries(semanticColors).forEach(([key, value]) => {
        root.style.setProperty(`--color-${key}`, value);
      });

      // Set spacing tokens
      Object.entries(tokens.spacing).forEach(([key, value]) => {
        root.style.setProperty(`--spacing-${key}`, value);
      });

      // Set border radius tokens
      Object.entries(tokens.borderRadius).forEach(([key, value]) => {
        root.style.setProperty(`--border-radius-${key}`, value);
      });

      // Set shadow tokens (only 'none' for flat design)
      Object.entries(tokens.shadows).forEach(([key, value]) => {
        root.style.setProperty(`--shadow-${key}`, value);
      });
    };

    setCustomProperties(designTokens);

    // Dispatch custom event for theme change
    const themeChangeEvent = new CustomEvent('themeChange', {
      detail: { theme: resolvedTheme, tokens: designTokens },
    });
    window.dispatchEvent(themeChangeEvent);
  }, [resolvedTheme, designTokens]);

  const handleSetTheme = useCallback(
    (newTheme: Theme) => {
      setIsTransitioning(true);
      setThemeState(newTheme);

      // Persist theme preference
      try {
        localStorage.setItem('appflowy-theme', newTheme);
      } catch (error) {
        console.warn('Failed to save theme preference:', error);
      }

      // Analytics/tracking for theme changes (optional)
      if (typeof window !== 'undefined' && (window as any).gtag) {
        (window as any).gtag('event', 'theme_change', {
          theme: newTheme,
          previous_theme: theme,
        });
      }
    },
    [theme]
  );

  return (
    <ThemeContext.Provider
      value={{
        theme,
        setTheme: handleSetTheme,
        resolvedTheme,
        designTokens,
        isTransitioning,
        systemPreference,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
