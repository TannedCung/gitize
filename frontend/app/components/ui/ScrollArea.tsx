'use client';

import React, { forwardRef } from 'react';
import { cn } from './utils';

export interface ScrollAreaProps extends React.HTMLAttributes<HTMLDivElement> {
  /**
   * Scrollbar variant
   * @default 'default'
   */
  variant?: 'default' | 'brand' | 'thin' | 'thick' | 'none';
  /**
   * Enable smooth scrolling behavior
   * @default true
   */
  smooth?: boolean;
  /**
   * Enable touch scrolling optimization for mobile
   * @default true
   */
  touchOptimized?: boolean;
  /**
   * Maximum height of the scroll area
   */
  maxHeight?: string | number;
  /**
   * Maximum width of the scroll area
   */
  maxWidth?: string | number;
}

const ScrollArea = forwardRef<HTMLDivElement, ScrollAreaProps>(
  (
    {
      className,
      variant = 'default',
      smooth = true,
      touchOptimized = true,
      maxHeight,
      maxWidth,
      style,
      children,
      ...props
    },
    ref
  ) => {
    const scrollbarClasses = {
      default: 'scrollbar',
      brand: 'scrollbar scrollbar-brand',
      thin: 'scrollbar scrollbar-thin',
      thick: 'scrollbar scrollbar-thick',
      none: 'scrollbar-none',
    };

    const computedStyle = {
      ...style,
      ...(maxHeight && {
        maxHeight: typeof maxHeight === 'number' ? `${maxHeight}px` : maxHeight,
      }),
      ...(maxWidth && {
        maxWidth: typeof maxWidth === 'number' ? `${maxWidth}px` : maxWidth,
      }),
    };

    return (
      <div
        ref={ref}
        className={cn(
          'overflow-auto',
          scrollbarClasses[variant],
          smooth && 'scroll-smooth',
          touchOptimized && 'scroll-touch',
          className
        )}
        style={computedStyle}
        {...props}
      >
        {children}
      </div>
    );
  }
);

ScrollArea.displayName = 'ScrollArea';

export { ScrollArea };
