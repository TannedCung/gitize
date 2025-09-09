'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useTheme } from '../contexts/ThemeContext';

/**
 * Optimized theme hook with performance enhancements
 */
export function useOptimizedTheme() {
  const { theme, setTheme, resolvedTheme, designTokens, isTransitioning } =
    useTheme();
  const [isReady, setIsReady] = useState(false);
  const transitionTimeoutRef = useRef<NodeJS.Timeout>();
  const rafRef = useRef<number>();

  // Debounced theme switching to prevent rapid changes
  const debouncedSetTheme = useCallback(
    (newTheme: 'light' | 'dark' | 'system') => {
      if (transitionTimeoutRef.current) {
        clearTimeout(transitionTimeoutRef.current);
      }

      transitionTimeoutRef.current = setTimeout(() => {
        setTheme(newTheme);
      }, 50); // 50ms debounce
    },
    [setTheme]
  );

  // Optimized theme toggle with animation frame scheduling
  const toggleTheme = useCallback(() => {
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current);
    }

    rafRef.current = requestAnimationFrame(() => {
      const newTheme = resolvedTheme === 'light' ? 'dark' : 'light';
      debouncedSetTheme(newTheme);
    });
  }, [resolvedTheme, debouncedSetTheme]);

  // Preload theme assets
  useEffect(() => {
    const preloadThemeAssets = () => {
      // Preload critical CSS for both themes
      const link = document.createElement('link');
      link.rel = 'preload';
      link.as = 'style';
      link.href = '/themes/critical.css';
      document.head.appendChild(link);

      setIsReady(true);
    };

    if (typeof window !== 'undefined') {
      if (document.readyState === 'complete') {
        preloadThemeAssets();
      } else {
        window.addEventListener('load', preloadThemeAssets);
        return () => window.removeEventListener('load', preloadThemeAssets);
      }
    }
  }, []);

  // Cleanup timeouts and animation frames
  useEffect(() => {
    return () => {
      if (transitionTimeoutRef.current) {
        clearTimeout(transitionTimeoutRef.current);
      }
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
      }
    };
  }, []);

  return {
    theme,
    setTheme: debouncedSetTheme,
    toggleTheme,
    resolvedTheme,
    designTokens,
    isTransitioning,
    isReady,
  };
}

/**
 * Hook for components that need to react to theme changes efficiently
 */
export function useThemeAware() {
  const { resolvedTheme, designTokens } = useTheme();
  const [cachedTokens, setCachedTokens] = useState(designTokens);
  const previousTheme = useRef(resolvedTheme);

  // Only update cached tokens when theme actually changes
  useEffect(() => {
    if (previousTheme.current !== resolvedTheme) {
      setCachedTokens(designTokens);
      previousTheme.current = resolvedTheme;
    }
  }, [resolvedTheme, designTokens]);

  return {
    theme: resolvedTheme,
    tokens: cachedTokens,
    isDark: resolvedTheme === 'dark',
    isLight: resolvedTheme === 'light',
  };
}

/**
 * Hook for optimized CSS-in-JS theme values
 */
export function useThemeCSS() {
  const { designTokens, resolvedTheme } = useTheme();
  const cssVarsRef = useRef<Record<string, string>>({});

  // Memoize CSS variables to prevent unnecessary recalculations
  useEffect(() => {
    const newCssVars: Record<string, string> = {};

    // Convert design tokens to CSS variables
    Object.entries(designTokens.colors).forEach(([key, value]) => {
      newCssVars[`--color-${key}`] = value;
    });

    Object.entries(designTokens.spacing).forEach(([key, value]) => {
      newCssVars[`--spacing-${key}`] = value;
    });

    Object.entries(designTokens.borderRadius).forEach(([key, value]) => {
      newCssVars[`--border-radius-${key}`] = value;
    });

    Object.entries(designTokens.shadows).forEach(([key, value]) => {
      newCssVars[`--shadow-${key}`] = value;
    });

    cssVarsRef.current = newCssVars;
  }, [designTokens]);

  return {
    cssVars: cssVarsRef.current,
    theme: resolvedTheme,
    tokens: designTokens,
  };
}
