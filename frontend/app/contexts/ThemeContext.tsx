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
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    surface: string;
    text: string;
    textSecondary: string;
    border: string;
    shadow: string;
  };
  spacing: {
    xs: string;
    sm: string;
    md: string;
    lg: string;
    xl: string;
  };
  borderRadius: {
    sm: string;
    md: string;
    lg: string;
    xl: string;
  };
  shadows: {
    sm: string;
    md: string;
    lg: string;
    xl: string;
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
    primary: '#00B5FF', // skyline
    secondary: '#9327FF', // violet
    accent: '#E3006D', // berry
    background: '#ffffff',
    surface: '#f8fafc',
    text: '#1e293b',
    textSecondary: '#64748b',
    border: '#e2e8f0',
    shadow: 'rgba(0, 0, 0, 0.1)',
  },
  spacing: {
    xs: '0.5rem',
    sm: '1rem',
    md: '1.5rem',
    lg: '2rem',
    xl: '3rem',
  },
  borderRadius: {
    sm: '0.25rem',
    md: '0.375rem',
    lg: '0.5rem',
    xl: '0.75rem',
  },
  shadows: {
    sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
    md: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
    lg: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
    xl: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
  },
};

const darkTokens: DesignTokens = {
  colors: {
    primary: '#00C8FF', // aqua
    secondary: '#9327FF', // violet
    accent: '#FB006D', // coral
    background: '#0f172a',
    surface: '#1e293b',
    text: '#f1f5f9',
    textSecondary: '#94a3b8',
    border: '#334155',
    shadow: 'rgba(0, 0, 0, 0.3)',
  },
  spacing: {
    xs: '0.5rem',
    sm: '1rem',
    md: '1.5rem',
    lg: '2rem',
    xl: '3rem',
  },
  borderRadius: {
    sm: '0.25rem',
    md: '0.375rem',
    lg: '0.5rem',
    xl: '0.75rem',
  },
  shadows: {
    sm: '0 1px 2px 0 rgb(0 0 0 / 0.3)',
    md: '0 4px 6px -1px rgb(0 0 0 / 0.3), 0 2px 4px -2px rgb(0 0 0 / 0.3)',
    lg: '0 10px 15px -3px rgb(0 0 0 / 0.3), 0 4px 6px -4px rgb(0 0 0 / 0.3)',
    xl: '0 20px 25px -5px rgb(0 0 0 / 0.3), 0 8px 10px -6px rgb(0 0 0 / 0.3)',
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
      Object.entries(tokens.colors).forEach(([key, value]) => {
        root.style.setProperty(`--color-${key}`, value);
      });

      Object.entries(tokens.spacing).forEach(([key, value]) => {
        root.style.setProperty(`--spacing-${key}`, value);
      });

      Object.entries(tokens.borderRadius).forEach(([key, value]) => {
        root.style.setProperty(`--border-radius-${key}`, value);
      });

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
