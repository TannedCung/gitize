import React, { forwardRef } from 'react';
import {
  InteractiveComponentProps,
  ComponentSize,
  ComponentVariant,
} from './types';
import { cn } from './utils';

/**
 * Button component props extending the base interactive component props
 */
export interface ButtonProps extends InteractiveComponentProps {
  /** Button variant style */
  variant?: ComponentVariant;
  /** Button size */
  size?: Exclude<ComponentSize, 'xs' | 'xl'>;
  /** Button type for form submission */
  type?: 'button' | 'submit' | 'reset';
  /** Whether the button should take full width */
  fullWidth?: boolean;
  /** Icon to display before the text */
  leftIcon?: React.ReactNode;
  /** Icon to display after the text */
  rightIcon?: React.ReactNode;
}

/**
 * Loading spinner component for button loading state
 */
const LoadingSpinner: React.FC<{ size: 'sm' | 'md' | 'lg' }> = ({ size }) => {
  const sizeClasses = {
    sm: 'w-3 h-3',
    md: 'w-4 h-4',
    lg: 'w-5 h-5',
  };

  return (
    <svg
      className={cn('animate-spin', sizeClasses[size])}
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      />
      <path
        className="opacity-75"
        fill="currentColor"
        d="m4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
      />
    </svg>
  );
};

/**
 * Get variant-specific classes for the button
 */
const getVariantClasses = (variant: ComponentVariant): string => {
  const variants = {
    primary: cn(
      'bg-primary-500 text-white border-primary-500',
      'hover:bg-primary-600 hover:border-primary-600',
      'active:bg-primary-700 active:border-primary-700',
      'dark:bg-primary-600 dark:border-primary-600',
      'dark:hover:bg-primary-700 dark:hover:border-primary-700',
      'dark:active:bg-primary-800 dark:active:border-primary-800'
    ),
    secondary: cn(
      'bg-gray-100 text-gray-900 border-gray-200',
      'hover:bg-gray-200 hover:border-gray-300',
      'active:bg-gray-300 active:border-gray-400',
      'dark:bg-gray-700 dark:text-gray-100 dark:border-gray-600',
      'dark:hover:bg-gray-600 dark:hover:border-gray-500',
      'dark:active:bg-gray-500 dark:active:border-gray-400'
    ),
    outline: cn(
      'bg-transparent text-gray-700 border-gray-300',
      'hover:bg-gray-50 hover:border-gray-400',
      'active:bg-gray-100 active:border-gray-500',
      'dark:text-gray-300 dark:border-gray-600',
      'dark:hover:bg-gray-800 dark:hover:border-gray-500',
      'dark:active:bg-gray-700 dark:active:border-gray-400'
    ),
    ghost: cn(
      'bg-transparent text-gray-700 border-transparent',
      'hover:bg-gray-100 hover:text-gray-900',
      'active:bg-gray-200',
      'dark:text-gray-300',
      'dark:hover:bg-gray-800 dark:hover:text-gray-100',
      'dark:active:bg-gray-700'
    ),
    danger: cn(
      'bg-error-500 text-white border-error-500',
      'hover:bg-error-600 hover:border-error-600',
      'active:bg-error-700 active:border-error-700',
      'dark:bg-error-600 dark:border-error-600',
      'dark:hover:bg-error-700 dark:hover:border-error-700',
      'dark:active:bg-error-800 dark:active:border-error-800'
    ),
  };

  return variants[variant];
};

/**
 * Get size-specific classes for the button
 */
const getSizeClasses = (size: 'sm' | 'md' | 'lg'): string => {
  const sizes = {
    sm: 'px-3 py-1.5 text-sm font-medium',
    md: 'px-4 py-2 text-sm font-medium',
    lg: 'px-6 py-3 text-base font-medium',
  };

  return sizes[size];
};

/**
 * Get focus ring classes based on variant
 */
const getFocusRingClasses = (variant: ComponentVariant): string => {
  const focusRings = {
    primary: 'focus:ring-primary-500',
    secondary: 'focus:ring-gray-500',
    outline: 'focus:ring-gray-500',
    ghost: 'focus:ring-gray-500',
    danger: 'focus:ring-error-500',
  };

  return cn(
    'focus:outline-none focus:ring-2 focus:ring-offset-2',
    'dark:focus:ring-offset-gray-900',
    focusRings[variant]
  );
};

/**
 * AppFlowy Button Component
 *
 * A comprehensive button component that supports multiple variants, sizes, and states.
 * Includes proper accessibility features, keyboard navigation, and loading states.
 */
export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      children,
      variant = 'primary',
      size = 'md',
      type = 'button',
      disabled = false,
      loading = false,
      fullWidth = false,
      leftIcon,
      rightIcon,
      className,
      onClick,
      onKeyDown,
      'data-testid': testId,
      'aria-label': ariaLabel,
      ...rest
    },
    ref
  ) => {
    const isDisabled = disabled || loading;

    const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
      if (isDisabled) {
        event.preventDefault();
        return;
      }
      onClick?.(event);
    };

    const handleKeyDown = (event: React.KeyboardEvent<HTMLButtonElement>) => {
      if (isDisabled) {
        event.preventDefault();
        return;
      }

      // Handle Enter and Space key activation
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        onClick?.(event as any);
      }

      onKeyDown?.(event);
    };

    const baseClasses = cn(
      // Base styles
      'inline-flex items-center justify-center',
      'border rounded-lg font-medium',
      'transition-all duration-200 ease-in-out',
      'select-none touch-manipulation',

      // Size classes
      getSizeClasses(size),

      // Variant classes
      getVariantClasses(variant),

      // Focus ring classes
      getFocusRingClasses(variant),

      // State classes
      {
        'w-full': fullWidth,
        'opacity-50 cursor-not-allowed': isDisabled,
        'cursor-wait': loading,
        'transform active:scale-95': !isDisabled,
      }
    );

    return (
      <button
        ref={ref}
        type={type}
        disabled={isDisabled}
        onClick={handleClick}
        onKeyDown={handleKeyDown}
        className={cn(baseClasses, className)}
        aria-disabled={isDisabled}
        aria-label={ariaLabel}
        data-testid={testId}
        {...rest}
      >
        {/* Left icon or loading spinner */}
        {loading ? (
          <LoadingSpinner size={size} />
        ) : leftIcon ? (
          <span className={cn('flex-shrink-0', children && 'mr-2')}>
            {leftIcon}
          </span>
        ) : null}

        {/* Button content */}
        {children && <span className={cn(loading && 'ml-2')}>{children}</span>}

        {/* Right icon */}
        {rightIcon && !loading && (
          <span className={cn('flex-shrink-0', children && 'ml-2')}>
            {rightIcon}
          </span>
        )}
      </button>
    );
  }
);

Button.displayName = 'Button';

export default Button;
