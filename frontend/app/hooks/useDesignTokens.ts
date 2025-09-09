'use client';

import { useTheme } from '../contexts/ThemeContext';
import { useCallback, useEffect, useState } from 'react';

/**
 * Hook for accessing design tokens and theme utilities
 */
export function useDesignTokens() {
  const { designTokens, resolvedTheme, isTransitioning } = useTheme();
  const [cssVariables, setCssVariables] = useState<Record<string, string>>({});

  // Update CSS variables when design tokens change
  useEffect(() => {
    const variables: Record<string, string> = {};

    // Flatten design tokens into CSS variable format
    Object.entries(designTokens.colors).forEach(([key, value]) => {
      variables[`--color-${key}`] = value;
    });

    Object.entries(designTokens.spacing).forEach(([key, value]) => {
      variables[`--spacing-${key}`] = value;
    });

    Object.entries(designTokens.borderRadius).forEach(([key, value]) => {
      variables[`--border-radius-${key}`] = value;
    });

    Object.entries(designTokens.shadows).forEach(([key, value]) => {
      variables[`--shadow-${key}`] = value;
    });

    setCssVariables(variables);
  }, [designTokens]);

  // Get a specific token value
  const getToken = useCallback(
    (category: keyof typeof designTokens, key: string) => {
      return designTokens[category][
        key as keyof (typeof designTokens)[typeof category]
      ];
    },
    [designTokens]
  );

  // Get CSS variable name for a token
  const getCSSVariable = useCallback((category: string, key: string) => {
    return `var(--${category}-${key})`;
  }, []);

  // Generate inline styles with design tokens
  const getTokenStyles = useCallback(
    (styles: Record<string, string>) => {
      const tokenStyles: Record<string, string> = {};

      Object.entries(styles).forEach(([property, value]) => {
        // Replace token references with CSS variables
        if (value.startsWith('token:')) {
          const [category, key] = value.replace('token:', '').split('.');
          tokenStyles[property] = getCSSVariable(category, key);
        } else {
          tokenStyles[property] = value;
        }
      });

      return tokenStyles;
    },
    [getCSSVariable]
  );

  // Get theme-aware color with opacity
  const getColorWithOpacity = useCallback(
    (colorKey: keyof typeof designTokens.colors, opacity: number) => {
      const color = designTokens.colors[colorKey];

      // Convert hex to rgba
      if (color.startsWith('#')) {
        const hex = color.replace('#', '');
        const r = parseInt(hex.substr(0, 2), 16);
        const g = parseInt(hex.substr(2, 2), 16);
        const b = parseInt(hex.substr(4, 2), 16);
        return `rgba(${r}, ${g}, ${b}, ${opacity})`;
      }

      return color;
    },
    [designTokens.colors]
  );

  // Generate AppFlowy brand gradient
  const getBrandGradient = useCallback(
    (direction: string = '135deg') => {
      return `linear-gradient(${direction}, ${designTokens.colors.primary} 0%, ${designTokens.colors.secondary} 100%)`;
    },
    [designTokens.colors.primary, designTokens.colors.secondary]
  );

  // Get responsive spacing value
  const getResponsiveSpacing = useCallback(
    (base: keyof typeof designTokens.spacing, multiplier: number = 1) => {
      const baseValue = parseFloat(designTokens.spacing[base]);
      return `${baseValue * multiplier}rem`;
    },
    [designTokens.spacing]
  );

  return {
    // Design tokens
    tokens: designTokens,
    colors: designTokens.colors,
    spacing: designTokens.spacing,
    borderRadius: designTokens.borderRadius,
    shadows: designTokens.shadows,

    // Theme state
    theme: resolvedTheme,
    isTransitioning,

    // CSS variables
    cssVariables,

    // Utility functions
    getToken,
    getCSSVariable,
    getTokenStyles,
    getColorWithOpacity,
    getBrandGradient,
    getResponsiveSpacing,
  };
}

/**
 * Hook for theme-aware animations
 */
export function useThemeTransition() {
  const { isTransitioning, resolvedTheme } = useTheme();
  const [transitionClass, setTransitionClass] = useState('');

  useEffect(() => {
    if (isTransitioning) {
      setTransitionClass('theme-transitioning');

      const timer = setTimeout(() => {
        setTransitionClass('');
      }, 300);

      return () => clearTimeout(timer);
    }
  }, [isTransitioning]);

  return {
    isTransitioning,
    transitionClass,
    theme: resolvedTheme,
  };
}
