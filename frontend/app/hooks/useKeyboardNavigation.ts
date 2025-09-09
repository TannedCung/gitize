'use client';

import { useEffect, useCallback, useRef, RefObject } from 'react';

interface UseKeyboardNavigationOptions {
  onEscape?: () => void;
  onEnter?: () => void;
  onSpace?: () => void;
  onArrowUp?: () => void;
  onArrowDown?: () => void;
  onArrowLeft?: () => void;
  onArrowRight?: () => void;
  onHome?: () => void;
  onEnd?: () => void;
  onPageUp?: () => void;
  onPageDown?: () => void;
  onTab?: (_event: KeyboardEvent) => void;
  enabled?: boolean;
  preventDefault?: boolean;
  stopPropagation?: boolean;
}

export function useKeyboardNavigation({
  onEscape,
  onEnter,
  onSpace,
  onArrowUp,
  onArrowDown,
  onArrowLeft,
  onArrowRight,
  onHome,
  onEnd,
  onPageUp,
  onPageDown,
  onTab,
  enabled = true,
  preventDefault = true,
  stopPropagation = false,
}: UseKeyboardNavigationOptions) {
  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (!enabled) return;

      let handled = false;

      switch (event.key) {
        case 'Escape':
          onEscape?.();
          handled = true;
          break;
        case 'Enter':
          onEnter?.();
          handled = true;
          break;
        case ' ':
          onSpace?.();
          handled = true;
          break;
        case 'ArrowUp':
          onArrowUp?.();
          handled = true;
          break;
        case 'ArrowDown':
          onArrowDown?.();
          handled = true;
          break;
        case 'ArrowLeft':
          onArrowLeft?.();
          handled = true;
          break;
        case 'ArrowRight':
          onArrowRight?.();
          handled = true;
          break;
        case 'Home':
          onHome?.();
          handled = true;
          break;
        case 'End':
          onEnd?.();
          handled = true;
          break;
        case 'PageUp':
          onPageUp?.();
          handled = true;
          break;
        case 'PageDown':
          onPageDown?.();
          handled = true;
          break;
        case 'Tab':
          onTab?.(event);
          // Don't mark as handled for Tab to allow default behavior
          break;
      }

      if (handled) {
        if (preventDefault) {
          event.preventDefault();
        }
        if (stopPropagation) {
          event.stopPropagation();
        }
      }
    },
    [
      enabled,
      onEscape,
      onEnter,
      onSpace,
      onArrowUp,
      onArrowDown,
      onArrowLeft,
      onArrowRight,
      onHome,
      onEnd,
      onPageUp,
      onPageDown,
      onTab,
      preventDefault,
      stopPropagation,
    ]
  );

  useEffect(() => {
    if (enabled) {
      document.addEventListener('keydown', handleKeyDown);
      return () => {
        document.removeEventListener('keydown', handleKeyDown);
      };
    }
  }, [handleKeyDown, enabled]);
}

export function useFocusTrap(
  containerRef: React.RefObject<HTMLElement>,
  isActive: boolean
) {
  useEffect(() => {
    if (!isActive || !containerRef.current) return;

    const container = containerRef.current;
    const focusableElements = container.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    const firstElement = focusableElements[0] as HTMLElement;
    const lastElement = focusableElements[
      focusableElements.length - 1
    ] as HTMLElement;

    const handleTabKey = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return;

      if (e.shiftKey) {
        if (document.activeElement === firstElement) {
          lastElement?.focus();
          e.preventDefault();
        }
      } else {
        if (document.activeElement === lastElement) {
          firstElement?.focus();
          e.preventDefault();
        }
      }
    };

    container.addEventListener('keydown', handleTabKey);
    firstElement?.focus();

    return () => {
      container.removeEventListener('keydown', handleTabKey);
    };
  }, [containerRef, isActive]);
}

/**
 * Hook for managing keyboard navigation in lists and grids
 */
export function useListNavigation(
  containerRef: RefObject<HTMLElement>,
  options: {
    /** Orientation of the list */
    orientation?: 'horizontal' | 'vertical' | 'both';
    /** Whether to wrap around when reaching the end */
    wrap?: boolean;
    /** Selector for navigable items */
    itemSelector?: string;
    /** Whether navigation is enabled */
    enabled?: boolean;
    /** Callback when selection changes */
    onSelectionChange?: (_index: number) => void;
  } = {}
) {
  const {
    orientation = 'vertical',
    wrap = true,
    itemSelector = '[role="option"], [role="menuitem"], [role="tab"], [data-navigable]',
    enabled = true,
    onSelectionChange,
  } = options;

  const currentIndex = useRef(0);

  const getNavigableItems = useCallback(() => {
    if (!containerRef.current) return [];
    return Array.from(
      containerRef.current.querySelectorAll<HTMLElement>(itemSelector)
    ).filter(item => {
      const style = window.getComputedStyle(item);
      return (
        style.display !== 'none' &&
        style.visibility !== 'hidden' &&
        !item.hasAttribute('disabled') &&
        item.getAttribute('aria-disabled') !== 'true'
      );
    });
  }, [containerRef, itemSelector]);

  const focusItem = useCallback(
    (index: number) => {
      const items = getNavigableItems();
      if (index >= 0 && index < items.length) {
        items[index].focus();
        currentIndex.current = index;
        onSelectionChange?.(index);
      }
    },
    [getNavigableItems, onSelectionChange]
  );

  const moveSelection = useCallback(
    (direction: 'next' | 'previous' | 'first' | 'last') => {
      const items = getNavigableItems();
      if (items.length === 0) return;

      let newIndex = currentIndex.current;

      switch (direction) {
        case 'next':
          newIndex =
            wrap && newIndex === items.length - 1
              ? 0
              : Math.min(newIndex + 1, items.length - 1);
          break;
        case 'previous':
          newIndex =
            wrap && newIndex === 0
              ? items.length - 1
              : Math.max(newIndex - 1, 0);
          break;
        case 'first':
          newIndex = 0;
          break;
        case 'last':
          newIndex = items.length - 1;
          break;
      }

      focusItem(newIndex);
    },
    [getNavigableItems, wrap, focusItem]
  );

  useKeyboardNavigation({
    enabled,
    onArrowUp:
      orientation === 'vertical' || orientation === 'both'
        ? () => moveSelection('previous')
        : undefined,
    onArrowDown:
      orientation === 'vertical' || orientation === 'both'
        ? () => moveSelection('next')
        : undefined,
    onArrowLeft:
      orientation === 'horizontal' || orientation === 'both'
        ? () => moveSelection('previous')
        : undefined,
    onArrowRight:
      orientation === 'horizontal' || orientation === 'both'
        ? () => moveSelection('next')
        : undefined,
    onHome: () => moveSelection('first'),
    onEnd: () => moveSelection('last'),
  });

  return {
    focusItem,
    moveSelection,
    getNavigableItems,
    currentIndex: currentIndex.current,
  };
}

/**
 * Hook for managing keyboard shortcuts
 */
export function useKeyboardShortcuts(
  shortcuts: Record<string, () => void>,
  options: {
    /** Whether shortcuts are enabled */
    enabled?: boolean;
    /** Whether to prevent default behavior */
    preventDefault?: boolean;
    /** Target element for event listener */
    target?: RefObject<HTMLElement> | 'document' | 'window';
  } = {}
) {
  const {
    enabled = true,
    preventDefault = true,
    target = 'document',
  } = options;

  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (!enabled) return;

      // Build shortcut key from event
      const parts: string[] = [];
      if (event.ctrlKey) parts.push('ctrl');
      if (event.altKey) parts.push('alt');
      if (event.shiftKey) parts.push('shift');
      if (event.metaKey) parts.push('meta');

      // Add the main key
      const key = event.key.toLowerCase();
      if (!['control', 'alt', 'shift', 'meta'].includes(key)) {
        parts.push(key);
      }

      const shortcutKey = parts.join('+');
      const handler = shortcuts[shortcutKey];

      if (handler) {
        if (preventDefault) {
          event.preventDefault();
        }
        handler();
      }
    },
    [enabled, shortcuts, preventDefault]
  );

  useEffect(() => {
    if (!enabled) return;

    let targetElement: HTMLElement | Document | Window;

    if (target === 'document') {
      targetElement = document;
    } else if (target === 'window') {
      targetElement = window;
    } else if (target && 'current' in target && target.current) {
      targetElement = target.current;
    } else {
      return;
    }

    targetElement.addEventListener('keydown', handleKeyDown as EventListener);

    return () => {
      targetElement.removeEventListener(
        'keydown',
        handleKeyDown as EventListener
      );
    };
  }, [handleKeyDown, enabled, target]);
}

/**
 * Hook for managing modal keyboard behavior
 */
export function useModalKeyboard(
  isOpen: boolean,
  onClose: () => void,
  containerRef: RefObject<HTMLElement>
) {
  // Focus trap
  useFocusTrap(containerRef, isOpen);

  // Escape key handling
  useKeyboardNavigation({
    enabled: isOpen,
    onEscape: onClose,
  });

  // Prevent background scrolling
  useEffect(() => {
    if (isOpen) {
      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';

      return () => {
        document.body.style.overflow = originalOverflow;
      };
    }
  }, [isOpen]);
}
