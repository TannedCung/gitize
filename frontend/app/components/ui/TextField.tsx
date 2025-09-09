'use client';

import React, { forwardRef, useState, useId } from 'react';
import { BaseComponentProps, ComponentSize } from './types';
import { cn } from './utils';

/**
 * TextField validation states
 */
export type TextFieldState = 'default' | 'error' | 'success' | 'disabled';

/**
 * TextField input types
 */
export type TextFieldType =
  | 'text'
  | 'email'
  | 'password'
  | 'search'
  | 'tel'
  | 'url'
  | 'number';

/**
 * TextField component props
 */
export interface TextFieldProps extends Omit<BaseComponentProps, 'children'> {
  /** Input label text */
  label?: string;
  /** Input placeholder text */
  placeholder?: string;
  /** Input value */
  value?: string;
  /** Default value for uncontrolled component */
  defaultValue?: string;
  /** Input type */
  type?: TextFieldType;
  /** Input size variant */
  size?: Exclude<ComponentSize, 'xs' | 'xl'>;
  /** Validation state */
  state?: TextFieldState;
  /** Error message to display */
  error?: string;
  /** Helper text to display below input */
  helperText?: string;
  /** Whether the input is required */
  required?: boolean;
  /** Whether the input is disabled */
  disabled?: boolean;
  /** Whether the input is read-only */
  readOnly?: boolean;
  /** Whether to show character count */
  showCharCount?: boolean;
  /** Maximum character length */
  maxLength?: number;
  /** Icon to display at the start of input */
  startIcon?: React.ReactNode;
  /** Icon to display at the end of input */
  endIcon?: React.ReactNode;
  /** Input change handler */
  onChange?: (_event: React.ChangeEvent<HTMLInputElement>) => void;
  /** Input focus handler */
  onFocus?: (_event: React.FocusEvent<HTMLInputElement>) => void;
  /** Input blur handler */
  onBlur?: (_event: React.FocusEvent<HTMLInputElement>) => void;
  /** Key down handler */
  onKeyDown?: (_event: React.KeyboardEvent<HTMLInputElement>) => void;
}

/**
 * Get state-specific classes for the input container
 */
const getStateClasses = (state: TextFieldState): string => {
  const stateClasses = {
    default: cn(
      'border-gray-300 text-gray-900',
      'focus-within:border-primary-500 focus-within:ring-1 focus-within:ring-primary-500',
      'dark:border-gray-600 dark:text-gray-100',
      'dark:focus-within:border-primary-400 dark:focus-within:ring-primary-400'
    ),
    success: cn(
      'border-success-500 text-gray-900',
      'focus-within:border-success-600 focus-within:ring-1 focus-within:ring-success-500',
      'dark:border-success-400 dark:text-gray-100',
      'dark:focus-within:border-success-300 dark:focus-within:ring-success-400'
    ),
    error: cn(
      'border-error-500 text-gray-900',
      'focus-within:border-error-600 focus-within:ring-1 focus-within:ring-error-500',
      'dark:border-error-400 dark:text-gray-100',
      'dark:focus-within:border-error-300 dark:focus-within:ring-error-400'
    ),
    disabled: cn(
      'border-gray-200 bg-gray-50 text-gray-500 cursor-not-allowed',
      'dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400'
    ),
  };

  return stateClasses[state];
};

/**
 * Get size-specific classes for the input container
 */
const getSizeClasses = (size: 'sm' | 'md' | 'lg'): string => {
  const sizeClasses = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-3 py-2 text-sm',
    lg: 'px-4 py-3 text-base',
  };

  return sizeClasses[size];
};

/**
 * Get icon size classes based on input size
 */
const getIconSizeClasses = (size: 'sm' | 'md' | 'lg'): string => {
  const iconSizes = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6',
  };

  return iconSizes[size];
};

/**
 * AppFlowy TextField Component
 *
 * A comprehensive text input component with validation states, icons, and accessibility features.
 * Supports multiple sizes, validation states, and proper ARIA attributes for form accessibility.
 */
export const TextField = forwardRef<HTMLInputElement, TextFieldProps>(
  (
    {
      label,
      placeholder,
      value,
      defaultValue,
      type = 'text',
      size = 'md',
      state = 'default',
      error,
      helperText,
      required = false,
      disabled = false,
      readOnly = false,
      showCharCount = false,
      maxLength,
      startIcon,
      endIcon,
      className,
      onChange,
      onFocus,
      onBlur,
      onKeyDown,
      'data-testid': testId,
      'aria-label': ariaLabel,
      ...rest
    },
    ref
  ) => {
    const [isFocused, setIsFocused] = useState(false);
    const inputId = useId();
    const helperTextId = useId();
    const errorId = useId();

    // Determine the actual state based on props
    const actualState = disabled ? 'disabled' : error ? 'error' : state;

    // Character count for controlled inputs
    const currentLength = value?.length || 0;
    const showCount = showCharCount && maxLength && value !== undefined;

    // Create describedBy string for accessibility
    const describedBy =
      [error && errorId, helperText && helperTextId]
        .filter(Boolean)
        .join(' ') || undefined;

    const handleFocus = (event: React.FocusEvent<HTMLInputElement>) => {
      setIsFocused(true);
      onFocus?.(event);
    };

    const handleBlur = (event: React.FocusEvent<HTMLInputElement>) => {
      setIsFocused(false);
      onBlur?.(event);
    };

    const inputClasses = cn(
      // Base styles
      'w-full bg-transparent border-0 outline-none',
      'placeholder:text-gray-400 dark:placeholder:text-gray-500',

      // Size-specific padding is handled by container
      getSizeClasses(size)
        .split(' ')
        .filter(cls => cls.startsWith('text-')),

      // Disabled state
      {
        'cursor-not-allowed': disabled,
        'cursor-default': readOnly,
      }
    );

    const containerClasses = cn(
      // Base container styles
      'relative flex items-center border rounded-lg',
      'transition-all duration-200 ease-in-out',
      'bg-white dark:bg-gray-900',

      // Size classes
      getSizeClasses(size),

      // State classes
      getStateClasses(actualState),

      // Focus state
      {
        'ring-2 ring-offset-2 dark:ring-offset-gray-900':
          isFocused && actualState !== 'disabled',
      },

      className
    );

    const labelClasses = cn('block text-sm font-medium mb-1.5', {
      'text-gray-700 dark:text-gray-300': actualState === 'default',
      'text-success-700 dark:text-success-300': actualState === 'success',
      'text-error-700 dark:text-error-300': actualState === 'error',
      'text-gray-500 dark:text-gray-400': actualState === 'disabled',
    });

    const helperTextClasses = cn('mt-1.5 text-xs', {
      'text-gray-600 dark:text-gray-400':
        actualState === 'default' || actualState === 'success',
      'text-error-600 dark:text-error-400': actualState === 'error',
      'text-gray-500 dark:text-gray-500': actualState === 'disabled',
    });

    const iconClasses = cn(
      'flex-shrink-0 text-gray-400 dark:text-gray-500',
      getIconSizeClasses(size),
      {
        'text-success-500 dark:text-success-400': actualState === 'success',
        'text-error-500 dark:text-error-400': actualState === 'error',
        'text-gray-300 dark:text-gray-600': actualState === 'disabled',
      }
    );

    return (
      <div className="w-full">
        {/* Label */}
        {label && (
          <label htmlFor={inputId} className={labelClasses}>
            {label}
            {required && (
              <span
                className="ml-1 text-error-500 dark:text-error-400"
                aria-label="required"
              >
                *
              </span>
            )}
          </label>
        )}

        {/* Input Container */}
        <div className={containerClasses}>
          {/* Start Icon */}
          {startIcon && (
            <div className={cn(iconClasses, 'mr-3')}>{startIcon}</div>
          )}

          {/* Input */}
          <input
            ref={ref}
            id={inputId}
            type={type}
            value={value}
            defaultValue={defaultValue}
            placeholder={placeholder}
            disabled={disabled}
            readOnly={readOnly}
            required={required}
            maxLength={maxLength}
            className={inputClasses}
            onChange={onChange}
            onFocus={handleFocus}
            onBlur={handleBlur}
            onKeyDown={onKeyDown}
            data-testid={testId}
            aria-required={required}
            aria-invalid={actualState === 'error'}
            aria-describedby={describedBy}
            aria-label={ariaLabel}
            {...rest}
          />

          {/* End Icon */}
          {endIcon && <div className={cn(iconClasses, 'ml-3')}>{endIcon}</div>}
        </div>

        {/* Helper Text and Character Count */}
        <div className="flex justify-between items-start mt-1.5">
          <div className="flex-1">
            {/* Error Message */}
            {error && (
              <p id={errorId} className={helperTextClasses} role="alert">
                {error}
              </p>
            )}

            {/* Helper Text */}
            {helperText && !error && (
              <p id={helperTextId} className={helperTextClasses}>
                {helperText}
              </p>
            )}
          </div>

          {/* Character Count */}
          {showCount && (
            <span
              className={cn('text-xs ml-2 flex-shrink-0', {
                'text-gray-500 dark:text-gray-400':
                  currentLength < maxLength! * 0.8,
                'text-warning-600 dark:text-warning-400':
                  currentLength >= maxLength! * 0.8 &&
                  currentLength < maxLength!,
                'text-error-600 dark:text-error-400':
                  currentLength >= maxLength!,
              })}
            >
              {currentLength}/{maxLength}
            </span>
          )}
        </div>
      </div>
    );
  }
);

TextField.displayName = 'TextField';

export default TextField;
