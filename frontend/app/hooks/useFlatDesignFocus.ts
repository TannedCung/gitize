'use client';

import { useEffect, useRef, useCallback, RefObject } from 'react';

export interface FlatDesignFocusOptions {
  /** Whether focus management is active */
  isActive?: boolean;
  /** Focus ring style for flat design */
  focusRingStyle?: 'minimal' | 'subtle' | 'none';
  /** Focus ring color */
  focusRingColor?: 'blue' | 'neutral' | 'custom';
  /** Custom focus ring color */
  customFocusColor?: string;
  /** Whether to use high contrast mode */
  highContrast?: boolean;
}

/**
 * Hook for managing focus indicators in flat design components
 */
export function useFlatDesignFocus(
  elementRef: RefObject<HTMLElement>,
  options: FlatDesignFocusOptions = {}
) {
  const {
    isActive = true,
    focusRingStyle = 'minimal',
    focusRingColor = 'blue',
    customFocusColor,
    highContrast = false,
  } = options;

  const originalOutline = useRef<string>('');
  const originalBoxShadow = useRef<string>('');

  /**
   * Apply flat design focus styles
   */
  const applyFlatFocusStyles = useCallback(() => {
    if (!elementRef.current || !isActive) return;

    const element = elementRef.current;
    const computedStyles = window.getComputedStyle(element);

    // Store original styles
    originalOutline.current = computedStyles.outline;
    originalBoxShadow.current = computedStyles.boxShadow;

    // Apply flat design focus styles
    let focusStyles: Partial<CSSStyleDeclaration> = {};

    switch (focusRingStyle) {
      case 'minimal':
        focusStyles = {
          outline: 'none',
          boxShadow: getFlatFocusBoxShadow(
            focusRingColor,
            customFocusColor,
            highContrast
          ),
        };
        break;
      case 'subtle':
        focusStyles = {
          outline: `1px solid ${getFlatFocusColor(focusRingColor, customFocusColor, highContrast)}`,
          outlineOffset: '1px',
          boxShadow: 'none',
        };
        break;
      case 'none':
        // Only for custom implementations - not recommended for accessibility
        focusStyles = {
          outline: 'none',
          boxShadow: 'none',
        };
        break;
    }

    // Apply styles
    Object.assign(element.style, focusStyles);
  }, [
    elementRef,
    isActive,
    focusRingStyle,
    focusRingColor,
    customFocusColor,
    highContrast,
  ]);

  /**
   * Remove flat design focus styles
   */
  const removeFlatFocusStyles = useCallback(() => {
    if (!elementRef.current) return;

    const element = elementRef.current;

    // Restore original styles
    element.style.outline = originalOutline.current;
    element.style.boxShadow = originalBoxShadow.current;
  }, [elementRef]);

  /**
   * Handle focus events
   */
  const handleFocus = useCallback(() => {
    applyFlatFocusStyles();
  }, [applyFlatFocusStyles]);

  /**
   * Handle blur events
   */
  const handleBlur = useCallback(() => {
    removeFlatFocusStyles();
  }, [removeFlatFocusStyles]);

  // Set up event listeners
  useEffect(() => {
    if (!elementRef.current || !isActive) return;

    const element = elementRef.current;

    element.addEventListener('focus', handleFocus);
    element.addEventListener('blur', handleBlur);

    return () => {
      element.removeEventListener('focus', handleFocus);
      element.removeEventListener('blur', handleBlur);
      removeFlatFocusStyles();
    };
  }, [elementRef, isActive, handleFocus, handleBlur, removeFlatFocusStyles]);

  return {
    applyFlatFocusStyles,
    removeFlatFocusStyles,
  };
}

/**
 * Get flat design focus box shadow
 */
function getFlatFocusBoxShadow(
  color: string,
  customColor?: string,
  highContrast?: boolean
): string {
  const focusColor = getFlatFocusColor(color, customColor, highContrast);
  const opacity = highContrast ? '1' : '0.5';

  return `0 0 0 1px ${focusColor.replace(')', `, ${opacity})`).replace('rgb', 'rgba')}`;
}

/**
 * Get flat design focus color
 */
function getFlatFocusColor(
  color: string,
  customColor?: string,
  highContrast?: boolean
): string {
  if (customColor) {
    return customColor;
  }

  const colors = {
    blue: highContrast ? '#1D4ED8' : '#3B82F6',
    neutral: highContrast ? '#404040' : '#737373',
  };

  return colors[color as keyof typeof colors] || colors.blue;
}

/**
 * Hook for managing focus within flat design containers
 */
export function useFlatDesignFocusContainer(
  containerRef: RefObject<HTMLElement>,
  options: FlatDesignFocusOptions & {
    /** Whether to trap focus within container */
    trapFocus?: boolean;
    /** Whether to restore focus when container becomes inactive */
    restoreFocus?: boolean;
  } = {}
) {
  const {
    isActive = true,
    trapFocus = false,
    restoreFocus = true,
    ...focusOptions
  } = options;

  const previousActiveElement = useRef<Element | null>(null);
  const focusableElements = useRef<HTMLElement[]>([]);

  /**
   * Get all focusable elements within container
   */
  const getFocusableElements = useCallback((): HTMLElement[] => {
    if (!containerRef.current) return [];

    const selector = [
      'button:not([disabled])',
      '[href]',
      'input:not([disabled])',
      'select:not([disabled])',
      'textarea:not([disabled])',
      '[tabindex]:not([tabindex="-1"])',
      '[contenteditable="true"]',
    ].join(', ');

    const elements = Array.from(
      containerRef.current.querySelectorAll<HTMLElement>(selector)
    );

    return elements.filter(element => {
      const style = window.getComputedStyle(element);
      return (
        style.display !== 'none' &&
        style.visibility !== 'hidden' &&
        element.offsetParent !== null
      );
    });
  }, [containerRef]);

  /**
   * Apply flat design focus styles to all focusable elements
   */
  const applyContainerFocusStyles = useCallback(() => {
    if (!isActive) return;

    focusableElements.current = getFocusableElements();

    focusableElements.current.forEach(element => {
      // Apply flat design focus styles using CSS classes
      element.classList.add('flat-design-focus');

      // Set up individual element focus management
      const _elementOptions = { ...focusOptions, isActive: true };
      const _elementRef = { current: element };

      // This would ideally be handled by the useFlatDesignFocus hook
      // but we're applying it directly here for container management
      element.addEventListener('focus', () => {
        element.style.outline = 'none';
        element.style.boxShadow = getFlatFocusBoxShadow(
          focusOptions.focusRingColor || 'blue',
          focusOptions.customFocusColor,
          focusOptions.highContrast
        );
      });

      element.addEventListener('blur', () => {
        element.style.outline = '';
        element.style.boxShadow = '';
      });
    });
  }, [isActive, getFocusableElements, focusOptions]);

  /**
   * Handle tab key for focus trapping
   */
  const handleTabKey = useCallback(
    (event: KeyboardEvent) => {
      if (!trapFocus || !isActive || event.key !== 'Tab') return;

      const elements = getFocusableElements();
      if (elements.length === 0) {
        event.preventDefault();
        return;
      }

      const firstElement = elements[0];
      const lastElement = elements[elements.length - 1];
      const activeElement = document.activeElement;

      if (event.shiftKey) {
        // Shift + Tab (backward)
        if (activeElement === firstElement) {
          event.preventDefault();
          lastElement.focus();
        }
      } else {
        // Tab (forward)
        if (activeElement === lastElement) {
          event.preventDefault();
          firstElement.focus();
        }
      }
    },
    [trapFocus, isActive, getFocusableElements]
  );

  /**
   * Set initial focus
   */
  const setInitialFocus = useCallback(() => {
    if (!isActive || !containerRef.current) return;

    // Store previously active element
    if (restoreFocus) {
      previousActiveElement.current = document.activeElement;
    }

    // Focus first focusable element
    const elements = getFocusableElements();
    if (elements.length > 0) {
      elements[0].focus();
    }
  }, [isActive, containerRef, restoreFocus, getFocusableElements]);

  /**
   * Restore previous focus
   */
  const restorePreviousFocus = useCallback(() => {
    if (restoreFocus && previousActiveElement.current) {
      (previousActiveElement.current as HTMLElement).focus?.();
      previousActiveElement.current = null;
    }
  }, [restoreFocus]);

  // Set up container focus management
  useEffect(() => {
    if (!isActive || !containerRef.current) return;

    const container = containerRef.current;

    // Apply focus styles to all focusable elements
    applyContainerFocusStyles();

    // Set initial focus
    setInitialFocus();

    // Add event listeners for focus trapping
    if (trapFocus) {
      container.addEventListener('keydown', handleTabKey);
    }

    return () => {
      if (trapFocus) {
        container.removeEventListener('keydown', handleTabKey);
      }

      // Clean up focus styles
      focusableElements.current.forEach(element => {
        element.classList.remove('flat-design-focus');
        element.style.outline = '';
        element.style.boxShadow = '';
      });

      // Restore focus when deactivating
      if (!isActive) {
        restorePreviousFocus();
      }
    };
  }, [
    isActive,
    containerRef,
    trapFocus,
    applyContainerFocusStyles,
    setInitialFocus,
    handleTabKey,
    restorePreviousFocus,
  ]);

  return {
    getFocusableElements,
    setInitialFocus,
    restorePreviousFocus,
    applyContainerFocusStyles,
  };
}

/**
 * Hook for high contrast mode detection and flat design adaptation
 */
export function useHighContrastFlatDesign() {
  const isHighContrast = useRef(false);

  useEffect(() => {
    // Check for high contrast mode
    const checkHighContrast = () => {
      // Check for Windows high contrast mode
      const isWindowsHighContrast = window.matchMedia(
        '(prefers-contrast: high)'
      ).matches;

      // Check for forced colors mode
      const isForcedColors = window.matchMedia(
        '(forced-colors: active)'
      ).matches;

      isHighContrast.current = isWindowsHighContrast || isForcedColors;

      // Apply high contrast flat design styles
      if (isHighContrast.current) {
        document.documentElement.classList.add('high-contrast-flat-design');
      } else {
        document.documentElement.classList.remove('high-contrast-flat-design');
      }
    };

    // Initial check
    checkHighContrast();

    // Listen for changes
    const contrastQuery = window.matchMedia('(prefers-contrast: high)');
    const forcedColorsQuery = window.matchMedia('(forced-colors: active)');

    contrastQuery.addEventListener('change', checkHighContrast);
    forcedColorsQuery.addEventListener('change', checkHighContrast);

    return () => {
      contrastQuery.removeEventListener('change', checkHighContrast);
      forcedColorsQuery.removeEventListener('change', checkHighContrast);
    };
  }, []);

  return {
    isHighContrast: isHighContrast.current,
  };
}
