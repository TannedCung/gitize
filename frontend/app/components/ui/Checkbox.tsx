import React, { forwardRef, useId } from 'react';
import { BaseComponentProps } from './types';
import { cn } from './utils';
// Removed unused import: createCompleteInteractionStates

/**
 * Checkbox component props
 */
export interface CheckboxProps extends Omit<BaseComponentProps, 'children'> {
  /** Whether the checkbox is checked */
  checked?: boolean;
  /** Whether the checkbox is in an indeterminate state */
  indeterminate?: boolean;
  /** Whether the checkbox is disabled */
  disabled?: boolean;
  /** Whether the checkbox is required */
  required?: boolean;
  /** The name attribute for form submission */
  name?: string;
  /** The value attribute for form submission */
  value?: string;
  /** Label text for the checkbox */
  label?: string;
  /** Helper text displayed below the checkbox */
  helperText?: string;
  /** Error message to display */
  error?: string;
  /** Size variant of the checkbox */
  size?: 'sm' | 'md' | 'lg';
  /** Change event handler */
  // eslint-disable-next-line no-unused-vars
  onChange?: (
    _checked: boolean,
    _event: React.ChangeEvent<HTMLInputElement>
  ) => void;
  /** Focus event handler */
  // eslint-disable-next-line no-unused-vars
  onFocus?: (_event: React.FocusEvent<HTMLInputElement>) => void;
  /** Blur event handler */
  // eslint-disable-next-line no-unused-vars
  onBlur?: (_event: React.FocusEvent<HTMLInputElement>) => void;
}

/**
 * Checkmark icon component
 */
const CheckmarkIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg
    className={className}
    viewBox="0 0 16 16"
    fill="currentColor"
    xmlns="http://www.w3.org/2000/svg"
    aria-hidden="true"
  >
    <path
      fillRule="evenodd"
      d="M12.416 3.376a.75.75 0 0 1 .208 1.04l-5 7.5a.75.75 0 0 1-1.154.114l-3-3a.75.75 0 0 1 1.06-1.06l2.353 2.353 4.493-6.74a.75.75 0 0 1 1.04-.207Z"
      clipRule="evenodd"
    />
  </svg>
);

/**
 * Indeterminate icon component
 */
const IndeterminateIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg
    className={className}
    viewBox="0 0 16 16"
    fill="currentColor"
    xmlns="http://www.w3.org/2000/svg"
    aria-hidden="true"
  >
    <path
      fillRule="evenodd"
      d="M4 8a.75.75 0 0 1 .75-.75h6.5a.75.75 0 0 1 0 1.5h-6.5A.75.75 0 0 1 4 8Z"
      clipRule="evenodd"
    />
  </svg>
);

/**
 * Get size-specific classes for the checkbox
 */
const getSizeClasses = (size: 'sm' | 'md' | 'lg') => {
  const sizes = {
    sm: {
      checkbox: 'w-4 h-4',
      icon: 'w-3 h-3',
      label: 'text-sm',
      helper: 'text-xs',
    },
    md: {
      checkbox: 'w-5 h-5',
      icon: 'w-4 h-4',
      label: 'text-sm',
      helper: 'text-sm',
    },
    lg: {
      checkbox: 'w-6 h-6',
      icon: 'w-5 h-5',
      label: 'text-base',
      helper: 'text-sm',
    },
  };

  return sizes[size];
};

/**
 * AppFlowy Checkbox Component
 *
 * A comprehensive checkbox component with support for indeterminate state,
 * proper accessibility features, and consistent styling with the AppFlowy design system.
 */
export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(
  (
    {
      checked = false,
      indeterminate = false,
      disabled = false,
      required = false,
      name,
      value,
      label,
      helperText,
      error,
      size = 'md',
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
    const hasError = Boolean(error);

    // Use a ref to manage the indeterminate state
    const inputRef = React.useRef<HTMLInputElement>(null);

    // Combine refs
    const combinedRef = React.useCallback(
      (node: HTMLInputElement | null) => {
        // Update our internal ref
        (inputRef as React.MutableRefObject<HTMLInputElement | null>).current =
          node;

        // Update the forwarded ref
        if (typeof ref === 'function') {
          ref(node);
        } else if (ref) {
          (ref as React.MutableRefObject<HTMLInputElement | null>).current =
            node;
        }
      },
      [ref]
    );

    // Set indeterminate state on the DOM element
    React.useEffect(() => {
      if (inputRef.current) {
        inputRef.current.indeterminate = indeterminate;
      }
    }, [indeterminate]);

    const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
      if (disabled) return;
      onChange?.(event.target.checked, event);
    };

    // Base checkbox styles - flat design with subtle interaction feedback
    const checkboxClasses = cn(
      // Base styles - flat square with no shadows or 3D effects
      'relative flex-shrink-0 transition-all duration-200 ease-in-out',
      'focus:outline-none',

      // Size classes
      sizeClasses.checkbox,

      // State-based styles with enhanced interaction feedback
      {
        // Default state - flat with subtle border
        'border border-neutral-200 bg-white dark:border-neutral-700 dark:bg-neutral-900':
          !checked && !indeterminate && !hasError,

        // Checked/indeterminate state - flat with minimal accent
        'border border-neutral-900 bg-neutral-900 dark:border-neutral-100 dark:bg-neutral-100':
          (checked || indeterminate) && !hasError,

        // Error state - flat with minimal red accent
        'border border-accent-red-200 bg-white dark:border-accent-red-700 dark:bg-neutral-900':
          !checked && !indeterminate && hasError,
        'border border-accent-red-500 bg-accent-red-500 dark:border-accent-red-400 dark:bg-accent-red-400':
          (checked || indeterminate) && hasError,

        // Enhanced hover states - subtle background changes only
        'hover:bg-neutral-50 hover:border-neutral-300 dark:hover:bg-neutral-800 dark:hover:border-neutral-600':
          !disabled && !checked && !indeterminate && !hasError,
        'hover:bg-neutral-800 hover:border-neutral-800 dark:hover:bg-neutral-200 dark:hover:border-neutral-200':
          !disabled && (checked || indeterminate) && !hasError,
        'hover:bg-accent-red-50 hover:border-accent-red-300 dark:hover:bg-accent-red-900/20 dark:hover:border-accent-red-600':
          !disabled && !checked && !indeterminate && hasError,
        'hover:bg-accent-red-600 hover:border-accent-red-600 dark:hover:bg-accent-red-300 dark:hover:border-accent-red-300':
          !disabled && (checked || indeterminate) && hasError,

        // Disabled state with consistent opacity
        'opacity-50 cursor-not-allowed': disabled,
        'cursor-pointer': !disabled,

        // Enhanced focus ring - minimal outline with better visibility
        'focus:ring-1 focus:ring-neutral-400 focus:ring-offset-1 dark:focus:ring-neutral-500 dark:focus:ring-offset-neutral-900':
          !hasError,
        'focus:ring-1 focus:ring-accent-red-400 focus:ring-offset-1 dark:focus:ring-accent-red-500 dark:focus:ring-offset-neutral-900':
          hasError,
        // Enhanced focus visibility for keyboard navigation
        'focus-visible:ring-2': true,
      }
    );

    // Icon styles - minimal checkmark with enhanced contrast
    const iconClasses = cn(
      'absolute inset-0 flex items-center justify-center transition-opacity duration-200',
      sizeClasses.icon,
      {
        'opacity-100 text-neutral-white dark:text-neutral-900':
          (checked || indeterminate) && !hasError,
        'opacity-100 text-neutral-white':
          (checked || indeterminate) && hasError,
        'opacity-0': !checked && !indeterminate,
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
        <div className="flex items-start">
          <div className="relative flex items-center">
            <input
              ref={combinedRef}
              id={id}
              type="checkbox"
              name={name}
              value={value}
              checked={checked}
              disabled={disabled}
              required={required}
              onChange={handleChange}
              onFocus={onFocus}
              onBlur={onBlur}
              className="sr-only"
              aria-describedby={describedBy}
              aria-label={ariaLabel || label}
              aria-invalid={hasError}
              aria-required={required}
              data-testid={testId}
              {...rest}
            />

            <div className={checkboxClasses}>
              <div className={iconClasses}>
                {indeterminate ? (
                  <IndeterminateIcon className="w-full h-full" />
                ) : (
                  <CheckmarkIcon className="w-full h-full" />
                )}
              </div>
            </div>
          </div>

          {label && (
            <label
              htmlFor={id}
              className={cn(labelClasses, 'ml-3 select-none')}
            >
              {label}
              {required && (
                <span className="ml-1 text-error-500" aria-label="required">
                  *
                </span>
              )}
            </label>
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

Checkbox.displayName = 'Checkbox';

export default Checkbox;
