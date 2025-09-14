'use client';

import React, { useState, useRef, useEffect, forwardRef } from 'react';
import { BaseComponentProps } from './types';
import { cn } from './utils';

/**
 * Popover positioning options
 */
export type PopoverPosition = 'top' | 'bottom' | 'left' | 'right';

/**
 * Popover trigger types
 */
export type PopoverTrigger = 'click' | 'hover' | 'focus';

/**
 * Popover component props
 */
export interface PopoverProps extends BaseComponentProps {
  /** Content to display in the popover */
  content: React.ReactNode;
  /** Position of the popover relative to the trigger */
  position?: PopoverPosition;
  /** How the popover is triggered */
  trigger?: PopoverTrigger;
  /** Whether the popover is open (controlled mode) */
  open?: boolean;
  /** Callback when popover open state changes */
  onOpenChange?: (_open: boolean) => void;
  /** Whether the popover is disabled */
  disabled?: boolean;
  /** Custom offset from the trigger element */
  offset?: number;
  /** Whether to show an arrow pointing to the trigger */
  showArrow?: boolean;
  /** Whether clicking outside should close the popover */
  closeOnClickOutside?: boolean;
  /** Whether pressing escape should close the popover */
  closeOnEscape?: boolean;
  /** Custom class for the popover content */
  contentClassName?: string;
  /** Delay before showing popover on hover (in milliseconds) */
  showDelay?: number;
  /** Delay before hiding popover on hover (in milliseconds) */
  hideDelay?: number;
}

/**
 * Hook for managing popover positioning
 */
const usePopoverPosition = (
  triggerRef: React.RefObject<HTMLElement>,
  popoverRef: React.RefObject<HTMLDivElement>,
  position: PopoverPosition,
  offset: number,
  isOpen: boolean
) => {
  const [calculatedPosition, setCalculatedPosition] = useState<{
    top: number;
    left: number;
    actualPosition: PopoverPosition;
  }>({ top: 0, left: 0, actualPosition: position });

  useEffect(() => {
    if (!isOpen || !triggerRef.current || !popoverRef.current) return;

    const updatePosition = () => {
      const trigger = triggerRef.current;
      const popover = popoverRef.current;

      if (!trigger || !popover) return;

      const triggerRect = trigger.getBoundingClientRect();
      const popoverRect = popover.getBoundingClientRect();
      const viewport = {
        width: window.innerWidth,
        height: window.innerHeight,
      };

      let top = 0;
      let left = 0;
      let actualPosition = position;

      // Calculate initial position
      switch (position) {
        case 'top':
          top = triggerRect.top - popoverRect.height - offset;
          left = triggerRect.left + (triggerRect.width - popoverRect.width) / 2;
          break;
        case 'bottom':
          top = triggerRect.bottom + offset;
          left = triggerRect.left + (triggerRect.width - popoverRect.width) / 2;
          break;
        case 'left':
          top = triggerRect.top + (triggerRect.height - popoverRect.height) / 2;
          left = triggerRect.left - popoverRect.width - offset;
          break;
        case 'right':
          top = triggerRect.top + (triggerRect.height - popoverRect.height) / 2;
          left = triggerRect.right + offset;
          break;
      }

      // Check if popover would be outside viewport and adjust
      if (
        top < 8 &&
        (position === 'top' || position === 'left' || position === 'right')
      ) {
        if (position === 'top') {
          top = triggerRect.bottom + offset;
          actualPosition = 'bottom';
        } else {
          top = Math.max(8, top);
        }
      }

      if (
        top + popoverRect.height > viewport.height - 8 &&
        (position === 'bottom' || position === 'left' || position === 'right')
      ) {
        if (position === 'bottom') {
          top = triggerRect.top - popoverRect.height - offset;
          actualPosition = 'top';
        } else {
          top = Math.min(viewport.height - popoverRect.height - 8, top);
        }
      }

      if (
        left < 8 &&
        (position === 'left' || position === 'top' || position === 'bottom')
      ) {
        if (position === 'left') {
          left = triggerRect.right + offset;
          actualPosition = 'right';
        } else {
          left = Math.max(8, left);
        }
      }

      if (
        left + popoverRect.width > viewport.width - 8 &&
        (position === 'right' || position === 'top' || position === 'bottom')
      ) {
        if (position === 'right') {
          left = triggerRect.left - popoverRect.width - offset;
          actualPosition = 'left';
        } else {
          left = Math.min(viewport.width - popoverRect.width - 8, left);
        }
      }

      setCalculatedPosition({ top, left, actualPosition });
    };

    // Use requestAnimationFrame to ensure DOM is updated
    const rafId = requestAnimationFrame(updatePosition);

    window.addEventListener('scroll', updatePosition, true);
    window.addEventListener('resize', updatePosition);

    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener('scroll', updatePosition, true);
      window.removeEventListener('resize', updatePosition);
    };
  }, [isOpen, position, offset, triggerRef, popoverRef]);

  return calculatedPosition;
};

/**
 * Hook for managing focus within the popover
 */
const useFocusManagement = (
  popoverRef: React.RefObject<HTMLDivElement>,
  isOpen: boolean,
  onClose: () => void
) => {
  const previousActiveElement = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (isOpen) {
      // Store the currently focused element
      previousActiveElement.current = document.activeElement as HTMLElement;

      // Focus the popover content
      const popover = popoverRef.current;
      if (popover) {
        // Try to focus the first focusable element, otherwise focus the popover itself
        const focusableElements = popover.querySelectorAll(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );

        if (focusableElements.length > 0) {
          (focusableElements[0] as HTMLElement).focus();
        } else {
          popover.focus();
        }
      }
    } else {
      // Restore focus to the previously focused element
      if (previousActiveElement.current) {
        previousActiveElement.current.focus();
        previousActiveElement.current = null;
      }
    }
  }, [isOpen, popoverRef]);

  // Handle keyboard navigation within popover
  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (!isOpen) return;

    if (event.key === 'Escape') {
      event.preventDefault();
      onClose();
      return;
    }

    if (event.key === 'Tab') {
      const popover = popoverRef.current;
      if (!popover) return;

      const focusableElements = Array.from(
        popover.querySelectorAll(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        )
      ) as HTMLElement[];

      if (focusableElements.length === 0) return;

      const firstElement = focusableElements[0];
      const lastElement = focusableElements[focusableElements.length - 1];

      if (event.shiftKey) {
        // Shift + Tab
        if (document.activeElement === firstElement) {
          event.preventDefault();
          lastElement.focus();
        }
      } else {
        // Tab
        if (document.activeElement === lastElement) {
          event.preventDefault();
          firstElement.focus();
        }
      }
    }
  };

  return { handleKeyDown };
};

/**
 * Get arrow classes based on position
 */
const getArrowClasses = (position: PopoverPosition): string => {
  const baseArrow =
    'absolute w-3 h-3 bg-white dark:bg-gray-800 transform rotate-45';

  switch (position) {
    case 'top':
      return cn(baseArrow, 'bottom-[-6px] left-1/2 -translate-x-1/2');
    case 'bottom':
      return cn(baseArrow, 'top-[-6px] left-1/2 -translate-x-1/2');
    case 'left':
      return cn(baseArrow, 'right-[-6px] top-1/2 -translate-y-1/2');
    case 'right':
      return cn(baseArrow, 'left-[-6px] top-1/2 -translate-y-1/2');
    default:
      return baseArrow;
  }
};

/**
 * Popover content component
 */
const PopoverContent = forwardRef<
  HTMLDivElement,
  {
    content: React.ReactNode;
    position: PopoverPosition;
    showArrow: boolean;
    style: React.CSSProperties;
    className?: string;
    onKeyDown: (_event: React.KeyboardEvent) => void;
    onMouseEnter?: () => void;
    onMouseLeave?: () => void;
  }
>(
  (
    {
      content,
      position,
      showArrow,
      style,
      className,
      onKeyDown,
      onMouseEnter,
      onMouseLeave,
    },
    ref
  ) => (
    <div
      ref={ref}
      role="dialog"
      aria-modal="false"
      tabIndex={-1}
      className={cn(
        'absolute z-50 bg-white rounded-lg',
        'dark:bg-gray-800',
        'animate-scale-in',
        'focus:outline-none',
        // Subtle border only when necessary for definition
        'border border-gray-100 dark:border-gray-700/50',
        className
      )}
      style={style}
      onKeyDown={onKeyDown}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      {content}
      {showArrow && <div className={getArrowClasses(position)} />}
    </div>
  )
);

PopoverContent.displayName = 'PopoverContent';

/**
 * AppFlowy Popover Component
 *
 * A popover component that displays rich content in a floating panel.
 * Supports multiple positioning strategies, focus management, and keyboard navigation.
 */
export const Popover = forwardRef<HTMLDivElement, PopoverProps>(
  (
    {
      children,
      content,
      position = 'bottom',
      trigger = 'click',
      open,
      onOpenChange,
      disabled = false,
      offset = 8,
      showArrow = true,
      closeOnClickOutside = true,
      closeOnEscape = true,
      contentClassName,
      showDelay = 0,
      hideDelay = 0,
      className,
      'data-testid': testId,
      'aria-label': _ariaLabel,
      ...rest
    },
    _ref
  ) => {
    const [internalOpen, setInternalOpen] = useState(false);
    const [_isHovered, setIsHovered] = useState(false);
    const triggerRef = useRef<HTMLDivElement>(null);
    const popoverRef = useRef<HTMLDivElement>(null);
    const showTimeoutRef = useRef<NodeJS.Timeout>();
    const hideTimeoutRef = useRef<NodeJS.Timeout>();

    // Use controlled or uncontrolled state
    const isOpen = open !== undefined ? open : internalOpen;
    const setIsOpen = useCallback(
      (newOpen: boolean) => {
        if (open === undefined) {
          setInternalOpen(newOpen);
        }
        onOpenChange?.(newOpen);
      },
      [open, onOpenChange]
    );

    const { top, left, actualPosition } = usePopoverPosition(
      triggerRef,
      popoverRef,
      position,
      offset,
      isOpen
    );

    const { handleKeyDown } = useFocusManagement(
      popoverRef,
      isOpen,
      () => closeOnEscape && setIsOpen(false)
    );

    // Show popover logic
    const showPopover = () => {
      if (disabled) return;

      if (hideTimeoutRef.current) {
        clearTimeout(hideTimeoutRef.current);
        hideTimeoutRef.current = undefined;
      }

      if (!isOpen) {
        showTimeoutRef.current = setTimeout(() => {
          setIsOpen(true);
        }, showDelay);
      }
    };

    // Hide popover logic
    const hidePopover = () => {
      if (showTimeoutRef.current) {
        clearTimeout(showTimeoutRef.current);
        showTimeoutRef.current = undefined;
      }

      if (isOpen) {
        hideTimeoutRef.current = setTimeout(() => {
          setIsOpen(false);
        }, hideDelay);
      }
    };

    // Click outside handler
    useEffect(() => {
      if (!isOpen || !closeOnClickOutside) return;

      const handleClickOutside = (event: MouseEvent) => {
        const target = event.target as Node;
        const triggerElement = triggerRef.current;
        const popoverElement = popoverRef.current;

        if (
          triggerElement &&
          popoverElement &&
          !triggerElement.contains(target) &&
          !popoverElement.contains(target)
        ) {
          setIsOpen(false);
        }
      };

      document.addEventListener('mousedown', handleClickOutside);
      return () =>
        document.removeEventListener('mousedown', handleClickOutside);
    }, [isOpen, closeOnClickOutside, setIsOpen]);

    // Cleanup timeouts on unmount
    useEffect(() => {
      return () => {
        if (showTimeoutRef.current) clearTimeout(showTimeoutRef.current);
        if (hideTimeoutRef.current) clearTimeout(hideTimeoutRef.current);
      };
    }, []);

    // Event handlers based on trigger type
    const getEventHandlers = () => {
      const handlers: any = {};

      if (trigger === 'click') {
        handlers.onClick = () => {
          if (disabled) return;
          setIsOpen(!isOpen);
        };
      }

      if (trigger === 'hover') {
        handlers.onMouseEnter = () => {
          setIsHovered(true);
          showPopover();
        };
        handlers.onMouseLeave = () => {
          setIsHovered(false);
          hidePopover();
        };
      }

      if (trigger === 'focus') {
        handlers.onFocus = () => showPopover();
        handlers.onBlur = () => hidePopover();
      }

      return handlers;
    };

    // Handle popover content hover for hover trigger
    const handlePopoverMouseEnter = () => {
      if (trigger === 'hover') {
        setIsHovered(true);
        if (hideTimeoutRef.current) {
          clearTimeout(hideTimeoutRef.current);
          hideTimeoutRef.current = undefined;
        }
      }
    };

    const handlePopoverMouseLeave = () => {
      if (trigger === 'hover') {
        setIsHovered(false);
        hidePopover();
      }
    };

    return (
      <>
        <div
          ref={triggerRef}
          className={cn('inline-block', className)}
          aria-expanded={isOpen}
          aria-haspopup="dialog"
          data-testid={testId}
          {...getEventHandlers()}
          {...rest}
        >
          {children}
        </div>

        {isOpen && (
          <PopoverContent
            ref={popoverRef}
            content={content}
            position={actualPosition}
            showArrow={showArrow}
            style={{
              top: `${top}px`,
              left: `${left}px`,
            }}
            className={contentClassName}
            onKeyDown={handleKeyDown}
            onMouseEnter={handlePopoverMouseEnter}
            onMouseLeave={handlePopoverMouseLeave}
          />
        )}
      </>
    );
  }
);

Popover.displayName = 'Popover';

export default Popover;
