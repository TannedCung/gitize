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
 * Get variant-specific classes for the button - Flat, borderless design
 */
const getVariantClasses = (variant: ComponentVariant): string => {
  const variants = {
    primary: cn(
      // Flat default state - no borders, minimal visual weight
      'bg-accent-blue-500 text-neutral-white border-none',
      // Subtle hover state - light background change only
      'hover:bg-accent-blue-600',
      // Minimal active state
      'active:bg-accent-blue-700',
      // Dark mode flat styling
      'dark:bg-accent-blue-600',
      'dark:hover:bg-accent-blue-700',
      'dark:active:bg-accent-blue-800'
    ),
    secondary: cn(
      // Flat default state - no borders or visual weight
      'bg-neutral-100 text-neutral-900 border-none',
      // Subtle hover state - light gray background only
      'hover:bg-neutral-200',
      // Minimal active state
      'active:bg-neutral-300',
      // Dark mode flat styling
      'dark:bg-neutral-700 dark:text-neutral-100',
      'dark:hover:bg-neutral-600',
      'dark:active:bg-neutral-500'
    ),
    outline: cn(
      // Flat transparent default - borderless
      'bg-transparent text-neutral-700 border-none',
      // Subtle hover state - light background appears
      'hover:bg-neutral-50',
      // Minimal active state
      'active:bg-neutral-100',
      // Dark mode flat styling
      'dark:text-neutral-300',
      'dark:hover:bg-neutral-800',
      'dark:active:bg-neutral-700'
    ),
    ghost: cn(
      // Completely flat and borderless - typography weight only
      'bg-transparent text-neutral-700 border-none',
      // Subtle hover state - minimal background
      'hover:bg-neutral-100 hover:text-neutral-900',
      // Minimal active state
      'active:bg-neutral-200',
      // Dark mode flat styling
      'dark:text-neutral-300',
      'dark:hover:bg-neutral-800 dark:hover:text-neutral-100',
      'dark:active:bg-neutral-700'
    ),
    danger: cn(
      // Flat error state - no borders
      'bg-accent-red-500 text-neutral-white border-none',
      // Subtle hover state
      'hover:bg-accent-red-600',
      // Minimal active state
      'active:bg-accent-red-700',
      // Dark mode flat styling
      'dark:bg-accent-red-600',
      'dark:hover:bg-accent-red-700',
      'dark:active:bg-accent-red-800'
    ),
  };

  return variants[variant];
};

/**
 * Get size-specific classes for the button - Typography weight instead of heavy styling
 */
const getSizeClasses = (size: 'sm' | 'md' | 'lg'): string => {
  const sizes = {
    // Small: minimal padding, lighter font weight
    sm: 'px-3 py-1.5 text-sm font-normal',
    // Medium: balanced padding, medium font weight
    md: 'px-4 py-2 text-sm font-medium',
    // Large: generous padding, stronger font weight for hierarchy
    lg: 'px-6 py-3 text-base font-semibold',
  };

  return sizes[size];
};

/**
 * Get minimal focus ring classes for accessibility compliance - Flat design
 */
const getFocusRingClasses = (variant: ComponentVariant): string => {
  const focusRings = {
    primary: 'focus:ring-accent-blue-500',
    secondary: 'focus:ring-neutral-500',
    outline: 'focus:ring-neutral-500',
    ghost: 'focus:ring-neutral-500',
    danger: 'focus:ring-accent-red-500',
  };

  return cn(
    // Minimal focus states for accessibility - no heavy styling
    'focus:outline-none focus:ring-1 focus:ring-offset-1',
    // Subtle focus ring offset for flat design
    'dark:focus:ring-offset-neutral-900',
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
      // Base styles - flat, borderless design
      'inline-flex items-center justify-center',
      'border-none rounded-md', // Minimal border radius for flat design
      'transition-colors duration-200 ease-in-out', // Only color transitions, no transform
      'select-none touch-manipulation',

      // Size classes
      getSizeClasses(size),

      // Variant classes
      getVariantClasses(variant),

      // Focus ring classes
      getFocusRingClasses(variant),

      // State classes - minimal visual changes
      {
        'w-full': fullWidth,
        'opacity-50 cursor-not-allowed': isDisabled,
        'cursor-wait': loading,
        // Removed active:scale-95 for flat design - no 3D effects
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
