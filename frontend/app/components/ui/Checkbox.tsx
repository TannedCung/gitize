import React, { forwardRef, useId } from 'react';
import { BaseComponentProps } from './types';
import { cn } from './utils';

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

    // Base checkbox styles
    const checkboxClasses = cn(
      // Base styles
      'relative flex-shrink-0 rounded border-2 transition-all duration-200 ease-in-out',
      'focus:outline-none focus:ring-2 focus:ring-offset-2',

      // Size classes
      sizeClasses.checkbox,

      // State-based styles
      {
        // Default state
        'border-gray-300 bg-white dark:border-gray-600 dark:bg-gray-800':
          !checked && !indeterminate && !hasError,

        // Checked/indeterminate state
        'border-primary-500 bg-primary-500 dark:border-primary-600 dark:bg-primary-600':
          (checked || indeterminate) && !hasError,

        // Error state
        'border-error-500 bg-white dark:border-error-500 dark:bg-gray-800':
          !checked && !indeterminate && hasError,
        'border-error-500 bg-error-500 dark:border-error-600 dark:bg-error-600':
          (checked || indeterminate) && hasError,

        // Hover states
        'hover:border-gray-400 dark:hover:border-gray-500':
          !disabled && !checked && !indeterminate && !hasError,
        'hover:border-primary-600 hover:bg-primary-600 dark:hover:border-primary-700 dark:hover:bg-primary-700':
          !disabled && (checked || indeterminate) && !hasError,
        'hover:border-error-600 hover:bg-error-600 dark:hover:border-error-700 dark:hover:bg-error-700':
          !disabled && (checked || indeterminate) && hasError,

        // Disabled state
        'opacity-50 cursor-not-allowed': disabled,
        'cursor-pointer': !disabled,

        // Focus ring colors
        'focus:ring-primary-500 dark:focus:ring-primary-600': !hasError,
        'focus:ring-error-500 dark:focus:ring-error-600': hasError,
      }
    );

    // Icon styles
    const iconClasses = cn(
      'absolute inset-0 flex items-center justify-center text-white transition-opacity duration-200',
      sizeClasses.icon,
      {
        'opacity-100': checked || indeterminate,
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
