import React, { forwardRef, useId } from 'react';
import { BaseComponentProps } from './types';
import { cn } from './utils';
// Removed unused import: createCompleteInteractionStates

/**
 * Toggle component props
 */
export interface ToggleProps extends Omit<BaseComponentProps, 'children'> {
  /** Whether the toggle is checked/enabled */
  checked?: boolean;
  /** Whether the toggle is disabled */
  disabled?: boolean;
  /** Whether the toggle is required */
  required?: boolean;
  /** The name attribute for form submission */
  name?: string;
  /** The value attribute for form submission */
  value?: string;
  /** Label text for the toggle */
  label?: string;
  /** Helper text displayed below the toggle */
  helperText?: string;
  /** Error message to display */
  error?: string;
  /** Size variant of the toggle */
  size?: 'sm' | 'md' | 'lg';
  /** Color variant of the toggle */
  variant?: 'primary' | 'success' | 'warning' | 'error';
  /** Change event handler */
  // eslint-disable-next-line no-unused-vars
  onChange?: (
    _checked: boolean,
    _event: React.MouseEvent<HTMLButtonElement>
  ) => void;
  /** Focus event handler */
  // eslint-disable-next-line no-unused-vars
  onFocus?: (event: React.FocusEvent<HTMLButtonElement>) => void;
  /** Blur event handler */
  // eslint-disable-next-line no-unused-vars
  onBlur?: (event: React.FocusEvent<HTMLButtonElement>) => void;
}

/**
 * Get size-specific classes for the toggle
 */
const getSizeClasses = (size: 'sm' | 'md' | 'lg') => {
  const sizes = {
    sm: {
      track: 'w-8 h-4',
      thumb: 'w-3 h-3',
      thumbTranslate: 'translate-x-4',
      label: 'text-sm',
      helper: 'text-xs',
    },
    md: {
      track: 'w-11 h-6',
      thumb: 'w-5 h-5',
      thumbTranslate: 'translate-x-5',
      label: 'text-sm',
      helper: 'text-sm',
    },
    lg: {
      track: 'w-14 h-7',
      thumb: 'w-6 h-6',
      thumbTranslate: 'translate-x-7',
      label: 'text-base',
      helper: 'text-sm',
    },
  };

  return sizes[size];
};

/**
 * Get variant-specific classes for the toggle - flat design with subtle interaction feedback
 */
const getVariantClasses = (
  variant: 'primary' | 'success' | 'warning' | 'error',
  checked: boolean
) => {
  const variants = {
    primary: {
      track: checked
        ? 'bg-neutral-900 dark:bg-neutral-100'
        : 'bg-neutral-200 dark:bg-neutral-700',
      trackHover: checked
        ? 'hover:bg-neutral-800 dark:hover:bg-neutral-200'
        : 'hover:bg-neutral-300 dark:hover:bg-neutral-600',
      focusRing: 'focus:ring-neutral-400 dark:focus:ring-neutral-500',
    },
    success: {
      track: checked
        ? 'bg-accent-green-600 dark:bg-accent-green-500'
        : 'bg-neutral-200 dark:bg-neutral-700',
      trackHover: checked
        ? 'hover:bg-accent-green-700 dark:hover:bg-accent-green-400'
        : 'hover:bg-neutral-300 dark:hover:bg-neutral-600',
      focusRing: 'focus:ring-accent-green-400 dark:focus:ring-accent-green-500',
    },
    warning: {
      track: checked
        ? 'bg-accent-amber-500 dark:bg-accent-amber-400'
        : 'bg-neutral-200 dark:bg-neutral-700',
      trackHover: checked
        ? 'hover:bg-accent-amber-600 dark:hover:bg-accent-amber-300'
        : 'hover:bg-neutral-300 dark:hover:bg-neutral-600',
      focusRing: 'focus:ring-accent-amber-400 dark:focus:ring-accent-amber-500',
    },
    error: {
      track: checked
        ? 'bg-accent-red-500 dark:bg-accent-red-400'
        : 'bg-neutral-200 dark:bg-neutral-700',
      trackHover: checked
        ? 'hover:bg-accent-red-600 dark:hover:bg-accent-red-300'
        : 'hover:bg-neutral-300 dark:hover:bg-neutral-600',
      focusRing: 'focus:ring-accent-red-400 dark:focus:ring-accent-red-500',
    },
  };

  return variants[variant];
};

/**
 * AppFlowy Toggle/Switch Component
 *
 * A comprehensive toggle switch component with smooth animations,
 * proper accessibility features, and consistent styling with the AppFlowy design system.
 */
export const Toggle = forwardRef<HTMLButtonElement, ToggleProps>(
  (
    {
      checked = false,
      disabled = false,
      required = false,
      name,
      value,
      label,
      helperText,
      error,
      size = 'md',
      variant = 'primary',
      className,
      onChange,
      onFocus,
      onBlur,
      'data-testid': testId,
      'aria-label': ariaLabel,
      ...rest
    },
    ref
  ) => {
    const id = useId();
    const helperId = helperText ? `${id}-helper` : undefined;
    const errorId = error ? `${id}-error` : undefined;
    const describedBy =
      [helperId, errorId].filter(Boolean).join(' ') || undefined;

    const sizeClasses = getSizeClasses(size);
    const variantClasses = getVariantClasses(variant, checked);
    const hasError = Boolean(error);

    const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
      if (disabled) return;
      const newChecked = !checked;
      onChange?.(newChecked, event);
    };

    const handleKeyDown = (event: React.KeyboardEvent<HTMLButtonElement>) => {
      if (disabled) return;

      // Handle Space and Enter keys to toggle
      if (event.key === ' ' || event.key === 'Enter') {
        event.preventDefault();
        const newChecked = !checked;
        onChange?.(newChecked, event as any);
      }
    };

    // Track styles - flat design with subtle interaction feedback
    const trackClasses = cn(
      // Base styles - flat rounded rectangle with no shadows
      'relative inline-flex flex-shrink-0 cursor-pointer rounded-full',
      'transition-all duration-300 ease-in-out',
      'focus:outline-none focus:ring-1 focus:ring-offset-1',
      'dark:focus:ring-offset-neutral-900',

      // Size classes
      sizeClasses.track,

      // Variant classes with enhanced interaction feedback
      variantClasses.track,
      variantClasses.trackHover,
      variantClasses.focusRing,

      // Enhanced focus visibility for keyboard navigation
      'focus-visible:ring-2',

      // State classes with consistent styling
      {
        'opacity-50 cursor-not-allowed': disabled,
        'cursor-pointer': !disabled,
      }
    );

    // Thumb styles - flat circle with no shadows and subtle interaction feedback
    const thumbClasses = cn(
      // Base styles - flat white circle with no shadow
      'pointer-events-none inline-block rounded-full bg-neutral-white ring-0',
      'transition-all duration-300 ease-in-out transform',

      // Size classes
      sizeClasses.thumb,

      // Position classes with smooth animation
      {
        [sizeClasses.thumbTranslate]: checked,
        'translate-x-0': !checked,
      }
    );

    // Label styles
    const labelClasses = cn(
      'font-medium text-gray-900 dark:text-gray-100',
      sizeClasses.label,
      {
        'cursor-pointer': !disabled,
        'opacity-50': disabled,
      }
    );

    // Helper text styles
    const helperClasses = cn(
      'mt-1 text-gray-600 dark:text-gray-400',
      sizeClasses.helper,
      {
        'opacity-50': disabled,
      }
    );

    // Error text styles
    const errorClasses = cn(
      'mt-1 text-error-600 dark:text-error-400',
      sizeClasses.helper
    );

    return (
      <div className={cn('flex flex-col', className)}>
        <div className="flex items-center">
          <button
            ref={ref}
            type="button"
            className={trackClasses}
            onKeyDown={handleKeyDown}
            onFocus={onFocus}
            onBlur={onBlur}
            disabled={disabled}
            role="switch"
            aria-checked={checked}
            aria-describedby={describedBy}
            aria-label={ariaLabel || label}
            aria-invalid={hasError}
            onClick={handleClick}
            data-testid={testId}
            {...rest}
          >
            {/* Hidden input for form submission */}
            {name && (
              <input
                type="hidden"
                name={name}
                value={checked ? value || 'on' : ''}
              />
            )}

            <span className={thumbClasses} />
          </button>

          {label && (
            <span
              className={cn(labelClasses, 'ml-3 select-none')}
              onClick={handleClick}
            >
              {label}
              {required && (
                <span className="ml-1 text-error-500" aria-label="required">
                  *
                </span>
              )}
            </span>
          )}
        </div>

        {helperText && !error && (
          <p id={helperId} className={helperClasses}>
            {helperText}
          </p>
        )}

        {error && (
          <p id={errorId} className={errorClasses} role="alert">
            {error}
          </p>
        )}
      </div>
    );
  }
);

Toggle.displayName = 'Toggle';

export default Toggle;
