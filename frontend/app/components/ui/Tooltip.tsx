'use client';

import React, { useState, useRef, useEffect, forwardRef } from 'react';
import { BaseComponentProps } from './types';
import { cn } from './utils';

/**
 * Tooltip positioning options
 */
export type TooltipPosition = 'top' | 'bottom' | 'left' | 'right';

/**
 * Tooltip component props
 */
export interface TooltipProps extends BaseComponentProps {
  /** Content to display in the tooltip */
  content: React.ReactNode;
  /** Position of the tooltip relative to the trigger */
  position?: TooltipPosition;
  /** Delay before showing tooltip (in milliseconds) */
  showDelay?: number;
  /** Delay before hiding tooltip (in milliseconds) */
  hideDelay?: number;
  /** Whether the tooltip is disabled */
  disabled?: boolean;
  /** Custom offset from the trigger element */
  offset?: number;
  /** Whether to show an arrow pointing to the trigger */
  showArrow?: boolean;
}

/**
 * Hook for managing tooltip positioning
 */
const useTooltipPosition = (
  triggerRef: React.RefObject<HTMLElement>,
  tooltipRef: React.RefObject<HTMLDivElement>,
  position: TooltipPosition,
  offset: number,
  isVisible: boolean
) => {
  const [calculatedPosition, setCalculatedPosition] = useState<{
    top: number;
    left: number;
    actualPosition: TooltipPosition;
  }>({ top: 0, left: 0, actualPosition: position });

  useEffect(() => {
    if (!isVisible || !triggerRef.current || !tooltipRef.current) return;

    const updatePosition = () => {
      const trigger = triggerRef.current;
      const tooltip = tooltipRef.current;

      if (!trigger || !tooltip) return;

      const triggerRect = trigger.getBoundingClientRect();
      const tooltipRect = tooltip.getBoundingClientRect();
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
          top = triggerRect.top - tooltipRect.height - offset;
          left = triggerRect.left + (triggerRect.width - tooltipRect.width) / 2;
          break;
        case 'bottom':
          top = triggerRect.bottom + offset;
          left = triggerRect.left + (triggerRect.width - tooltipRect.width) / 2;
          break;
        case 'left':
          top = triggerRect.top + (triggerRect.height - tooltipRect.height) / 2;
          left = triggerRect.left - tooltipRect.width - offset;
          break;
        case 'right':
          top = triggerRect.top + (triggerRect.height - tooltipRect.height) / 2;
          left = triggerRect.right + offset;
          break;
      }

      // Check if tooltip would be outside viewport and adjust
      if (
        top < 0 &&
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
        top + tooltipRect.height > viewport.height &&
        (position === 'bottom' || position === 'left' || position === 'right')
      ) {
        if (position === 'bottom') {
          top = triggerRect.top - tooltipRect.height - offset;
          actualPosition = 'top';
        } else {
          top = Math.min(viewport.height - tooltipRect.height - 8, top);
        }
      }

      if (
        left < 0 &&
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
        left + tooltipRect.width > viewport.width &&
        (position === 'right' || position === 'top' || position === 'bottom')
      ) {
        if (position === 'right') {
          left = triggerRect.left - tooltipRect.width - offset;
          actualPosition = 'left';
        } else {
          left = Math.min(viewport.width - tooltipRect.width - 8, left);
        }
      }

      setCalculatedPosition({ top, left, actualPosition });
    };

    updatePosition();
    window.addEventListener('scroll', updatePosition, true);
    window.addEventListener('resize', updatePosition);

    return () => {
      window.removeEventListener('scroll', updatePosition, true);
      window.removeEventListener('resize', updatePosition);
    };
  }, [isVisible, position, offset, triggerRef, tooltipRef]);

  return calculatedPosition;
};

/**
 * Get arrow classes based on position
 */
const getArrowClasses = (position: TooltipPosition): string => {
  const baseArrow =
    'absolute w-2 h-2 bg-gray-900 dark:bg-gray-100 transform rotate-45';

  switch (position) {
    case 'top':
      return cn(baseArrow, 'bottom-[-4px] left-1/2 -translate-x-1/2');
    case 'bottom':
      return cn(baseArrow, 'top-[-4px] left-1/2 -translate-x-1/2');
    case 'left':
      return cn(baseArrow, 'right-[-4px] top-1/2 -translate-y-1/2');
    case 'right':
      return cn(baseArrow, 'left-[-4px] top-1/2 -translate-y-1/2');
    default:
      return baseArrow;
  }
};

/**
 * Tooltip content component
 */
const TooltipContent = forwardRef<
  HTMLDivElement,
  {
    content: React.ReactNode;
    position: TooltipPosition;
    showArrow: boolean;
    style: React.CSSProperties;
    className?: string;
  }
>(({ content, position, showArrow, style, className }, ref) => (
  <div
    ref={ref}
    role="tooltip"
    className={cn(
      'absolute z-50 px-2 py-1 text-sm font-medium text-white bg-gray-900 rounded-md shadow-lg',
      'dark:text-gray-900 dark:bg-gray-100',
      'animate-fade-in',
      'max-w-xs break-words',
      className
    )}
    style={style}
  >
    {content}
    {showArrow && <div className={getArrowClasses(position)} />}
  </div>
));

TooltipContent.displayName = 'TooltipContent';

/**
 * AppFlowy Tooltip Component
 *
 * A tooltip component that displays contextual information on hover or focus.
 * Supports multiple positioning strategies and automatic viewport collision detection.
 */
export const Tooltip = forwardRef<HTMLDivElement, TooltipProps>(
  (
    {
      children,
      content,
      position = 'top',
      showDelay = 500,
      hideDelay = 0,
      disabled = false,
      offset = 8,
      showArrow = true,
      className,
      'data-testid': testId,
      'aria-label': _ariaLabel,
      ...rest
    },
    _ref
  ) => {
    const [isVisible, setIsVisible] = useState(false);
    const [isHovered, setIsHovered] = useState(false);
    const [isFocused, setIsFocused] = useState(false);
    const triggerRef = useRef<HTMLDivElement>(null);
    const tooltipRef = useRef<HTMLDivElement>(null);
    const showTimeoutRef = useRef<NodeJS.Timeout>();
    const hideTimeoutRef = useRef<NodeJS.Timeout>();

    const { top, left, actualPosition } = useTooltipPosition(
      triggerRef,
      tooltipRef,
      position,
      offset,
      isVisible
    );

    // Show tooltip logic
    const showTooltip = () => {
      if (disabled) return;

      if (hideTimeoutRef.current) {
        clearTimeout(hideTimeoutRef.current);
        hideTimeoutRef.current = undefined;
      }

      if (!isVisible) {
        showTimeoutRef.current = setTimeout(() => {
          setIsVisible(true);
        }, showDelay);
      }
    };

    // Hide tooltip logic
    const hideTooltip = () => {
      if (showTimeoutRef.current) {
        clearTimeout(showTimeoutRef.current);
        showTimeoutRef.current = undefined;
      }

      if (isVisible) {
        hideTimeoutRef.current = setTimeout(() => {
          setIsVisible(false);
        }, hideDelay);
      }
    };

    // Update visibility based on hover and focus states
    useEffect(() => {
      if (isHovered || isFocused) {
        showTooltip();
      } else {
        hideTooltip();
      }
    }, [isHovered, isFocused]);

    // Cleanup timeouts on unmount
    useEffect(() => {
      return () => {
        if (showTimeoutRef.current) clearTimeout(showTimeoutRef.current);
        if (hideTimeoutRef.current) clearTimeout(hideTimeoutRef.current);
      };
    }, []);

    // Event handlers
    const handleMouseEnter = () => setIsHovered(true);
    const handleMouseLeave = () => setIsHovered(false);
    const handleFocus = () => setIsFocused(true);
    const handleBlur = () => setIsFocused(false);

    // Keyboard event handler for accessibility
    const handleKeyDown = (event: React.KeyboardEvent) => {
      if (event.key === 'Escape' && isVisible) {
        setIsVisible(false);
        setIsFocused(false);
      }
    };

    return (
      <>
        <div
          ref={triggerRef}
          className={cn('inline-block', className)}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
          onFocus={handleFocus}
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
          aria-describedby={isVisible ? `tooltip-${testId}` : undefined}
          data-testid={testId}
          {...rest}
        >
          {children}
        </div>

        {isVisible && (
          <TooltipContent
            ref={tooltipRef}
            content={content}
            position={actualPosition}
            showArrow={showArrow}
            style={{
              top: `${top}px`,
              left: `${left}px`,
            }}
            className="pointer-events-none"
          />
        )}
      </>
    );
  }
);

Tooltip.displayName = 'Tooltip';

export default Tooltip;
