'use client';

import React from 'react';
import { BaseComponentProps, ComponentSize } from './types';
import { cn } from './utils';

/**
 * Color variants for spinner component
 */
export type SpinnerColor =
  | 'primary'
  | 'secondary'
  | 'accent'
  | 'success'
  | 'warning'
  | 'error'
  | 'info'
  | 'neutral';

/**
 * Props for the Spinner component
 */
export interface SpinnerProps extends BaseComponentProps {
  /** Size of the spinner */
  size?: ComponentSize;
  /** Color variant of the spinner */
  color?: SpinnerColor;
  /** Optional text to display below the spinner */
  text?: string;
  /** Speed of the animation */
  speed?: 'slow' | 'normal' | 'fast';
}

/**
 * Spinner component for loading states
 * Provides visual feedback during async operations
 */
export function Spinner({
  size = 'md',
  color = 'primary',
  className,
  text,
  speed = 'normal',
  'data-testid': dataTestId,
  'aria-label': ariaLabel,
  ...props
}: SpinnerProps) {
  const sizeClasses = {
    xs: 'h-3 w-3 border',
    sm: 'h-4 w-4 border',
    md: 'h-6 w-6 border-2',
    lg: 'h-8 w-8 border-2',
    xl: 'h-12 w-12 border-2',
  };

  const colorClasses = {
    primary:
      'border-primary-200 border-t-primary-500 dark:border-primary-800 dark:border-t-primary-400',
    secondary:
      'border-secondary-200 border-t-secondary-500 dark:border-secondary-800 dark:border-t-secondary-400',
    accent:
      'border-accent-200 border-t-accent-500 dark:border-accent-800 dark:border-t-accent-400',
    success:
      'border-success-200 border-t-success-500 dark:border-success-800 dark:border-t-success-400',
    warning:
      'border-warning-200 border-t-warning-500 dark:border-warning-800 dark:border-t-warning-400',
    error:
      'border-error-200 border-t-error-500 dark:border-error-800 dark:border-t-error-400',
    info: 'border-info-200 border-t-info-500 dark:border-info-800 dark:border-t-info-400',
    neutral:
      'border-gray-200 border-t-gray-500 dark:border-gray-700 dark:border-t-gray-400',
  };

  const speedClasses = {
    slow: 'animate-spin [animation-duration:2s]',
    normal: 'animate-spin',
    fast: 'animate-spin [animation-duration:0.5s]',
  };

  const textSizeClasses = {
    xs: 'text-xs',
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base',
    xl: 'text-lg',
  };

  return (
    <div
      className={cn('flex items-center justify-center', className)}
      data-testid={dataTestId}
      {...props}
    >
      <div className="flex flex-col items-center space-y-2">
        <div
          className={cn(
            'rounded-full',
            sizeClasses[size],
            colorClasses[color],
            speedClasses[speed]
          )}
          role="status"
          aria-label={ariaLabel || 'Loading'}
        />
        {text && (
          <p
            className={cn(
              'text-gray-600 dark:text-gray-400 font-medium',
              textSizeClasses[size]
            )}
          >
            {text}
          </p>
        )}
      </div>
    </div>
  );
}

/**
 * Legacy Loading component for backward compatibility
 * @deprecated Use Spinner component instead
 */
export function Loading({
  size = 'md',
  className = '',
  text,
}: {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  text?: string;
}) {
  const mappedSize: ComponentSize =
    size === 'sm' ? 'sm' : size === 'lg' ? 'lg' : 'md';
  return <Spinner size={mappedSize} className={className} text={text} />;
}

export function RepositoryCardSkeleton({
  className,
  ...props
}: BaseComponentProps) {
  return (
    <div
      className={cn(
        'bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6',
        className
      )}
      {...props}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1 min-w-0">
          <Skeleton width="75%" height="1.5rem" className="mb-2" />
          <Skeleton width="50%" height="1rem" />
        </div>
        <div className="flex items-center space-x-4 ml-4">
          <Skeleton width="3rem" height="1rem" />
          <Skeleton width="3rem" height="1rem" />
        </div>
      </div>

      {/* Description */}
      <div className="mb-4">
        <SkeletonText lines={2} />
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Skeleton width="4rem" height="1rem" />
        </div>
        <Skeleton width="6rem" height="1rem" />
      </div>
    </div>
  );
}

/**
 * Props for the Progress component
 */
export interface ProgressProps extends BaseComponentProps {
  /** Current progress value (0-100) */
  value?: number;
  /** Maximum value for progress calculation */
  max?: number;
  /** Size of the progress bar */
  size?: 'sm' | 'md' | 'lg';
  /** Color variant of the progress bar */
  color?: SpinnerColor;
  /** Whether to show the progress as indeterminate */
  indeterminate?: boolean;
  /** Whether to show the percentage text */
  showValue?: boolean;
  /** Custom label for the progress */
  label?: string;
}

/**
 * Progress Bar component for showing completion status
 * Supports both determinate and indeterminate states
 */
export function Progress({
  value = 0,
  max = 100,
  size = 'md',
  color = 'primary',
  indeterminate = false,
  showValue = false,
  label,
  className,
  'data-testid': dataTestId,
  'aria-label': ariaLabel,
  ...props
}: ProgressProps) {
  const normalizedValue = Math.min(Math.max(value, 0), max);
  const percentage = (normalizedValue / max) * 100;

  const sizeClasses = {
    sm: 'h-1',
    md: 'h-2',
    lg: 'h-3',
  };

  const colorClasses = {
    primary: 'bg-primary-500',
    secondary: 'bg-secondary-500',
    accent: 'bg-accent-500',
    success: 'bg-success-500',
    warning: 'bg-warning-500',
    error: 'bg-error-500',
    info: 'bg-info-500',
    neutral: 'bg-gray-500',
  };

  const backgroundClasses = {
    primary: 'bg-primary-100 dark:bg-primary-900',
    secondary: 'bg-secondary-100 dark:bg-secondary-900',
    accent: 'bg-accent-100 dark:bg-accent-900',
    success: 'bg-success-100 dark:bg-success-900',
    warning: 'bg-warning-100 dark:bg-warning-900',
    error: 'bg-error-100 dark:bg-error-900',
    info: 'bg-info-100 dark:bg-info-900',
    neutral: 'bg-gray-100 dark:bg-gray-800',
  };

  return (
    <div
      className={cn('w-full', className)}
      data-testid={dataTestId}
      {...props}
    >
      {(label || showValue) && (
        <div className="flex justify-between items-center mb-2">
          {label && (
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              {label}
            </span>
          )}
          {showValue && !indeterminate && (
            <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
              {Math.round(percentage)}%
            </span>
          )}
        </div>
      )}

      <div
        className={cn(
          'w-full rounded-full overflow-hidden',
          sizeClasses[size],
          backgroundClasses[color]
        )}
        role="progressbar"
        aria-valuenow={indeterminate ? undefined : normalizedValue}
        aria-valuemin={0}
        aria-valuemax={max}
        aria-label={ariaLabel || label || 'Progress'}
      >
        <div
          className={cn(
            'h-full rounded-full transition-all duration-300 ease-out',
            colorClasses[color],
            indeterminate && 'animate-progress-indeterminate'
          )}
          style={{
            width: indeterminate ? '100%' : `${percentage}%`,
          }}
        />
      </div>
    </div>
  );
} /**

 * Props for the Skeleton component
 */
export interface SkeletonProps extends BaseComponentProps {
  /** Width of the skeleton */
  width?: string | number;
  /** Height of the skeleton */
  height?: string | number;
  /** Shape of the skeleton */
  variant?: 'text' | 'rectangular' | 'circular';
  /** Animation type */
  animation?: 'pulse' | 'wave' | 'none';
  /** Number of lines for text variant */
  lines?: number;
}

/**
 * Skeleton component for loading placeholders
 * Provides visual feedback while content is loading
 */
export function Skeleton({
  width,
  height,
  variant = 'rectangular',
  animation = 'pulse',
  lines = 1,
  className,
  'data-testid': dataTestId,
  ...props
}: SkeletonProps) {
  const baseClasses = 'bg-gray-200 dark:bg-gray-700';

  const animationClasses = {
    pulse: 'animate-pulse',
    wave: 'animate-pulse [animation-duration:1.5s]',
    none: '',
  };

  const variantClasses = {
    text: 'rounded',
    rectangular: 'rounded-md',
    circular: 'rounded-full',
  };

  const defaultSizes = {
    text: { width: '100%', height: '1rem' },
    rectangular: { width: '100%', height: '2rem' },
    circular: { width: '2.5rem', height: '2.5rem' },
  };

  const skeletonWidth = width || defaultSizes[variant].width;
  const skeletonHeight = height || defaultSizes[variant].height;

  if (variant === 'text' && lines > 1) {
    return (
      <div
        className={cn('space-y-2', className)}
        data-testid={dataTestId}
        {...props}
      >
        {Array.from({ length: lines }).map((_, index) => (
          <div
            key={index}
            className={cn(
              baseClasses,
              animationClasses[animation],
              variantClasses[variant]
            )}
            style={{
              width: index === lines - 1 ? '75%' : skeletonWidth,
              height: skeletonHeight,
            }}
          />
        ))}
      </div>
    );
  }

  return (
    <div
      className={cn(
        baseClasses,
        animationClasses[animation],
        variantClasses[variant],
        className
      )}
      style={{
        width: skeletonWidth,
        height: skeletonHeight,
      }}
      data-testid={dataTestId}
      {...props}
    />
  );
}

/**
 * Predefined skeleton layouts for common use cases
 */
export function SkeletonText({
  lines = 3,
  className,
  ...props
}: Omit<SkeletonProps, 'variant'> & { lines?: number }) {
  return (
    <Skeleton variant="text" lines={lines} className={className} {...props} />
  );
}

export function SkeletonAvatar({
  size = 'md',
  className,
  ...props
}: Omit<SkeletonProps, 'variant'> & { size?: ComponentSize }) {
  const sizeMap = {
    xs: { width: '1.5rem', height: '1.5rem' },
    sm: { width: '2rem', height: '2rem' },
    md: { width: '2.5rem', height: '2.5rem' },
    lg: { width: '3rem', height: '3rem' },
    xl: { width: '4rem', height: '4rem' },
  };

  return (
    <Skeleton
      variant="circular"
      width={sizeMap[size].width}
      height={sizeMap[size].height}
      className={className}
      {...props}
    />
  );
}

export function SkeletonButton({
  size = 'md',
  className,
  ...props
}: Omit<SkeletonProps, 'variant'> & { size?: ComponentSize }) {
  const sizeMap = {
    xs: { width: '4rem', height: '1.5rem' },
    sm: { width: '5rem', height: '2rem' },
    md: { width: '6rem', height: '2.5rem' },
    lg: { width: '8rem', height: '3rem' },
    xl: { width: '10rem', height: '3.5rem' },
  };

  return (
    <Skeleton
      variant="rectangular"
      width={sizeMap[size].width}
      height={sizeMap[size].height}
      className={className}
      {...props}
    />
  );
}

/**
 * Enhanced Repository Card Skeleton with better structure
 */
