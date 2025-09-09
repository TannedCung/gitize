import React, { forwardRef, useId } from 'react';
import { BaseComponentProps } from './types';
import { cn } from './utils';

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
 * Get variant-specific classes for the toggle
 */
const getVariantClasses = (
  variant: 'primary' | 'success' | 'warning' | 'error',
  checked: boolean
) => {
  const variants = {
    primary: {
      track: checked
        ? 'bg-primary-500 dark:bg-primary-600'
        : 'bg-gray-200 dark:bg-gray-700',
      trackHover: checked
        ? 'hover:bg-primary-600 dark:hover:bg-primary-700'
        : 'hover:bg-gray-300 dark:hover:bg-gray-600',
      focusRing: 'focus:ring-primary-500 dark:focus:ring-primary-600',
    },
    success: {
      track: checked
        ? 'bg-success-500 dark:bg-success-600'
        : 'bg-gray-200 dark:bg-gray-700',
      trackHover: checked
        ? 'hover:bg-success-600 dark:hover:bg-success-700'
        : 'hover:bg-gray-300 dark:hover:bg-gray-600',
      focusRing: 'focus:ring-success-500 dark:focus:ring-success-600',
    },
    warning: {
      track: checked
        ? 'bg-warning-500 dark:bg-warning-600'
        : 'bg-gray-200 dark:bg-gray-700',
      trackHover: checked
        ? 'hover:bg-warning-600 dark:hover:bg-warning-700'
        : 'hover:bg-gray-300 dark:hover:bg-gray-600',
      focusRing: 'focus:ring-warning-500 dark:focus:ring-warning-600',
    },
    error: {
      track: checked
        ? 'bg-error-500 dark:bg-error-600'
        : 'bg-gray-200 dark:bg-gray-700',
      trackHover: checked
        ? 'hover:bg-error-600 dark:hover:bg-error-700'
        : 'hover:bg-gray-300 dark:hover:bg-gray-600',
      focusRing: 'focus:ring-error-500 dark:focus:ring-error-600',
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

    // Track styles
    const trackClasses = cn(
      // Base styles
      'relative inline-flex flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent',
      'transition-all duration-300 ease-in-out',
      'focus:outline-none focus:ring-2 focus:ring-offset-2',

      // Size classes
      sizeClasses.track,

      // Variant classes
      variantClasses.track,
      variantClasses.trackHover,
      variantClasses.focusRing,

      // State classes
      {
        'opacity-50 cursor-not-allowed': disabled,
        'cursor-pointer': !disabled,
      }
    );

    // Thumb styles
    const thumbClasses = cn(
      // Base styles
      'pointer-events-none inline-block rounded-full bg-white shadow-lg ring-0',
      'transition-all duration-300 ease-in-out transform',

      // Size classes
      sizeClasses.thumb,

      // Position classes
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
