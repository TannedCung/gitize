'use client';

import { useEffect, useRef, useCallback, RefObject } from 'react';

export interface FocusableElement extends HTMLElement {
  focus(): void;
}

/**
 * Hook for managing focus within a container element
 */
export function useFocusManagement(
  containerRef: RefObject<HTMLElement>,
  options: {
    /** Whether focus management is active */
    isActive?: boolean;
    /** Whether to trap focus within the container */
    trapFocus?: boolean;
    /** Whether to restore focus when deactivated */
    restoreFocus?: boolean;
    /** Initial element to focus */
    initialFocus?: RefObject<FocusableElement> | 'first' | 'last';
    /** Elements to exclude from focus management */
    excludeSelector?: string;
  } = {}
) {
  const {
    isActive = true,
    trapFocus = false,
    restoreFocus = true,
    initialFocus = 'first',
    excludeSelector = '[aria-hidden="true"], [tabindex="-1"]:not([data-focusable])',
  } = options;

  const previousActiveElement = useRef<Element | null>(null);
  const _focusableElements = useRef<FocusableElement[]>([]);

  /**
   * Get all focusable elements within the container
   */
  const getFocusableElements = useCallback((): FocusableElement[] => {
    if (!containerRef.current) return [];

    const selector = [
      'button:not([disabled])',
      '[href]',
      'input:not([disabled])',
      'select:not([disabled])',
      'textarea:not([disabled])',
      '[tabindex]:not([tabindex="-1"])',
      '[contenteditable="true"]',
      '[data-focusable]',
    ].join(', ');

    const elements = Array.from(
      containerRef.current.querySelectorAll<FocusableElement>(selector)
    );

    // Filter out excluded elements
    return elements.filter(element => {
      if (excludeSelector && element.matches(excludeSelector)) {
        return false;
      }

      // Check if element is visible and not hidden
      const style = window.getComputedStyle(element);
      return (
        style.display !== 'none' &&
        style.visibility !== 'hidden' &&
        element.offsetParent !== null
      );
    });
  }, [containerRef, excludeSelector]);

  /**
   * Focus the first focusable element
   */
  const focusFirst = useCallback(() => {
    const elements = getFocusableElements();
    if (elements.length > 0) {
      elements[0].focus();
      return true;
    }
    return false;
  }, [getFocusableElements]);

  /**
   * Focus the last focusable element
   */
  const focusLast = useCallback(() => {
    const elements = getFocusableElements();
    if (elements.length > 0) {
      elements[elements.length - 1].focus();
      return true;
    }
    return false;
  }, [getFocusableElements]);

  /**
   * Focus the next focusable element
   */
  const focusNext = useCallback(() => {
    const elements = getFocusableElements();
    const currentIndex = elements.indexOf(
      document.activeElement as FocusableElement
    );

    if (currentIndex === -1) {
      return focusFirst();
    }

    const nextIndex = (currentIndex + 1) % elements.length;
    elements[nextIndex].focus();
    return true;
  }, [getFocusableElements, focusFirst]);

  /**
   * Focus the previous focusable element
   */
  const focusPrevious = useCallback(() => {
    const elements = getFocusableElements();
    const currentIndex = elements.indexOf(
      document.activeElement as FocusableElement
    );

    if (currentIndex === -1) {
      return focusLast();
    }

    const previousIndex =
      currentIndex === 0 ? elements.length - 1 : currentIndex - 1;
    elements[previousIndex].focus();
    return true;
  }, [getFocusableElements, focusLast]);

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

    // Store the previously active element for restoration
    if (restoreFocus) {
      previousActiveElement.current = document.activeElement;
    }

    // Set initial focus
    if (typeof initialFocus === 'object' && initialFocus.current) {
      initialFocus.current.focus();
    } else if (initialFocus === 'first') {
      focusFirst();
    } else if (initialFocus === 'last') {
      focusLast();
    }
  }, [
    isActive,
    containerRef,
    restoreFocus,
    initialFocus,
    focusFirst,
    focusLast,
  ]);

  /**
   * Restore focus to previously active element
   */
  const restorePreviousFocus = useCallback(() => {
    if (restoreFocus && previousActiveElement.current) {
      (previousActiveElement.current as FocusableElement).focus?.();
      previousActiveElement.current = null;
    }
  }, [restoreFocus]);

  // Set up focus management when active
  useEffect(() => {
    if (!isActive || !containerRef.current) return;

    const container = containerRef.current;

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

      // Restore focus when deactivating
      if (!isActive) {
        restorePreviousFocus();
      }
    };
  }, [
    isActive,
    containerRef,
    trapFocus,
    handleTabKey,
    setInitialFocus,
    restorePreviousFocus,
  ]);

  // Restore focus when component unmounts or becomes inactive
  useEffect(() => {
    return () => {
      if (!isActive) {
        restorePreviousFocus();
      }
    };
  }, [isActive, restorePreviousFocus]);

  return {
    focusFirst,
    focusLast,
    focusNext,
    focusPrevious,
    getFocusableElements,
    setInitialFocus,
    restorePreviousFocus,
  };
}

/**
 * Hook for managing focus within a roving tabindex pattern
 */
export function useRovingTabIndex(
  containerRef: RefObject<HTMLElement>,
  options: {
    /** Whether roving tabindex is active */
    isActive?: boolean;
    /** Orientation of the roving tabindex */
    orientation?: 'horizontal' | 'vertical' | 'both';
    /** Whether to loop when reaching the end */
    loop?: boolean;
  } = {}
) {
  const { isActive = true, orientation = 'both', loop = true } = options;

  const currentIndex = useRef(0);

  /**
   * Get all roving tabindex elements
   */
  const getRovingElements = useCallback((): FocusableElement[] => {
    if (!containerRef.current) return [];

    return Array.from(
      containerRef.current.querySelectorAll<FocusableElement>(
        '[data-roving-tabindex]'
      )
    ).filter(element => {
      const style = window.getComputedStyle(element);
      return (
        style.display !== 'none' &&
        style.visibility !== 'hidden' &&
        element.offsetParent !== null
      );
    });
  }, [containerRef]);

  /**
   * Update tabindex attributes
   */
  const updateTabIndexes = useCallback(
    (activeIndex: number) => {
      const elements = getRovingElements();
      elements.forEach((element, index) => {
        element.setAttribute('tabindex', index === activeIndex ? '0' : '-1');
      });
      currentIndex.current = activeIndex;
    },
    [getRovingElements]
  );

  /**
   * Move focus to specific index
   */
  const focusIndex = useCallback(
    (index: number) => {
      const elements = getRovingElements();
      if (index >= 0 && index < elements.length) {
        updateTabIndexes(index);
        elements[index].focus();
      }
    },
    [getRovingElements, updateTabIndexes]
  );

  /**
   * Move focus in a direction
   */
  const moveFocus = useCallback(
    (direction: 'next' | 'previous') => {
      const elements = getRovingElements();
      if (elements.length === 0) return;

      let newIndex = currentIndex.current;

      if (direction === 'next') {
        newIndex =
          loop && newIndex === elements.length - 1
            ? 0
            : Math.min(newIndex + 1, elements.length - 1);
      } else {
        newIndex =
          loop && newIndex === 0
            ? elements.length - 1
            : Math.max(newIndex - 1, 0);
      }

      focusIndex(newIndex);
    },
    [getRovingElements, loop, focusIndex]
  );

  /**
   * Handle keyboard navigation
   */
  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (!isActive) return;

      const { key } = event;
      let handled = false;

      switch (key) {
        case 'ArrowRight':
          if (orientation === 'horizontal' || orientation === 'both') {
            moveFocus('next');
            handled = true;
          }
          break;
        case 'ArrowLeft':
          if (orientation === 'horizontal' || orientation === 'both') {
            moveFocus('previous');
            handled = true;
          }
          break;
        case 'ArrowDown':
          if (orientation === 'vertical' || orientation === 'both') {
            moveFocus('next');
            handled = true;
          }
          break;
        case 'ArrowUp':
          if (orientation === 'vertical' || orientation === 'both') {
            moveFocus('previous');
            handled = true;
          }
          break;
        case 'Home':
          focusIndex(0);
          handled = true;
          break;
        case 'End':
          const elements = getRovingElements();
          focusIndex(elements.length - 1);
          handled = true;
          break;
      }

      if (handled) {
        event.preventDefault();
      }
    },
    [isActive, orientation, moveFocus, focusIndex, getRovingElements]
  );

  // Set up roving tabindex
  useEffect(() => {
    if (!isActive || !containerRef.current) return;

    const container = containerRef.current;

    // Initialize tabindex attributes
    updateTabIndexes(0);

    // Add keyboard event listener
    container.addEventListener('keydown', handleKeyDown);

    return () => {
      container.removeEventListener('keydown', handleKeyDown);
    };
  }, [isActive, containerRef, updateTabIndexes, handleKeyDown]);

  return {
    focusIndex,
    moveFocus,
    getRovingElements,
    currentIndex: currentIndex.current,
  };
}
