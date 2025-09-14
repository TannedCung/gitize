'use client';

import React, { forwardRef, useState, useId } from 'react';
import { BaseComponentProps, ComponentSize } from './types';
import { cn } from './utils';
// Removed unused imports: createFocusState, createHoverState

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
 * TextField design variants for flat minimalist design
 */
export type TextFieldVariant = 'borderless' | 'bottom-line' | 'subtle-outline';

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
  /** Design variant for flat minimalist styling */
  variant?: TextFieldVariant;
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
 * Get variant-specific classes for flat minimalist design with subtle interaction feedback
 */
const getVariantClasses = (
  variant: TextFieldVariant,
  state: TextFieldState,
  isFocused: boolean
): string => {
  const baseClasses =
    'text-neutral-900 dark:text-neutral-100 bg-transparent transition-colors duration-200 ease-in-out';

  if (state === 'disabled') {
    return cn(
      baseClasses,
      'text-neutral-400 dark:text-neutral-600 cursor-not-allowed opacity-50',
      variant === 'subtle-outline' &&
        'border border-neutral-200 dark:border-neutral-700'
    );
  }

  const variantClasses = {
    borderless: cn(
      baseClasses,
      'border-0',
      // Subtle hover state for borderless inputs
      'hover:bg-neutral-50/25 dark:hover:bg-neutral-900/25'
      // Focus state - no visual change for pure borderless, handled by focus ring
    ),
    'bottom-line': cn(
      baseClasses,
      'border-0 border-b transition-all duration-200 ease-in-out',
      // Default state - transparent bottom border
      'border-transparent',
      // Hover state - subtle border hint
      'hover:border-neutral-200 dark:hover:border-neutral-700',
      // Focus state - show bottom line with accent color
      isFocused && 'border-accent-blue-500 dark:border-accent-blue-400',
      // Error state - minimal red accent
      state === 'error' && 'border-accent-red-500 dark:border-accent-red-400',
      // Success state - minimal green accent
      state === 'success' &&
        'border-accent-green-500 dark:border-accent-green-400'
    ),
    'subtle-outline': cn(
      baseClasses,
      'border border-transparent transition-all duration-200 ease-in-out',
      // Hover state - subtle border appearance
      'hover:border-neutral-200 dark:hover:border-neutral-700',
      // Focus state - subtle outline with accent color
      isFocused && 'border-accent-blue-300 dark:border-accent-blue-600',
      // Error state - minimal red outline
      state === 'error' && 'border-accent-red-300 dark:border-accent-red-600',
      // Success state - minimal green outline
      state === 'success' &&
        'border-accent-green-300 dark:border-accent-green-600'
    ),
  };

  return variantClasses[variant];
};

/**
 * Get size-specific classes for generous spacing in flat design
 */
const getSizeClasses = (size: 'sm' | 'md' | 'lg'): string => {
  const sizeClasses = {
    // Generous padding for airy, spacious feel
    sm: 'px-0 py-2 text-sm',
    md: 'px-0 py-3 text-base',
    lg: 'px-0 py-4 text-lg',
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
      variant = 'borderless',
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
      // Base styles for flat design with subtle interaction feedback
      'w-full bg-transparent outline-none',
      'placeholder:text-neutral-400 dark:placeholder:text-neutral-500',
      'transition-colors duration-200 ease-in-out',

      // Size-specific text sizing
      getSizeClasses(size)
        .split(' ')
        .filter(cls => cls.startsWith('text-')),

      // State-based styling with minimal visual changes
      {
        'cursor-not-allowed': disabled,
        'cursor-default': readOnly,
      }
    );

    const containerClasses = cn(
      // Base container styles for flat design - no background, no rounded corners
      'relative flex items-center',
      'transition-all duration-200 ease-in-out',

      // Size classes for generous spacing
      getSizeClasses(size),

      // Variant-specific styling
      getVariantClasses(variant, actualState, isFocused),

      // Icon spacing adjustments
      {
        'pl-8': startIcon && variant !== 'borderless',
        'pr-8': endIcon && variant !== 'borderless',
        'pl-6': startIcon && variant === 'borderless',
        'pr-6': endIcon && variant === 'borderless',
      },

      className
    );

    const labelClasses = cn(
      // Typography-first hierarchy with generous spacing
      'block text-sm font-medium mb-3',
      'transition-colors duration-200 ease-in-out',
      {
        'text-neutral-700 dark:text-neutral-300': actualState === 'default',
        'text-accent-green-700 dark:text-accent-green-300':
          actualState === 'success',
        'text-accent-red-700 dark:text-accent-red-300': actualState === 'error',
        'text-neutral-400 dark:text-neutral-500': actualState === 'disabled',
      }
    );

    const helperTextClasses = cn(
      // Generous spacing and minimal styling for flat design
      'mt-2 text-xs leading-relaxed',
      'transition-colors duration-200 ease-in-out',
      {
        'text-neutral-600 dark:text-neutral-400':
          actualState === 'default' || actualState === 'success',
        'text-accent-red-600 dark:text-accent-red-400': actualState === 'error',
        'text-neutral-400 dark:text-neutral-500': actualState === 'disabled',
      }
    );

    const iconClasses = cn(
      'flex-shrink-0 transition-colors duration-200 ease-in-out',
      'text-neutral-400 dark:text-neutral-500',
      getIconSizeClasses(size),
      {
        'text-accent-green-500 dark:text-accent-green-400':
          actualState === 'success',
        'text-accent-red-500 dark:text-accent-red-400': actualState === 'error',
        'text-neutral-300 dark:text-neutral-600': actualState === 'disabled',
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
            <div className={cn(iconClasses, 'mr-2')}>{startIcon}</div>
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
            className={cn(
              inputClasses,
              // Enhanced focus state for accessibility with flat design
              'focus:outline-none focus:ring-1 focus:ring-accent-blue-500 focus:ring-offset-0 rounded-sm',
              'dark:focus:ring-accent-blue-400'
            )}
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
          {endIcon && <div className={cn(iconClasses, 'ml-2')}>{endIcon}</div>}
        </div>

        {/* Helper Text and Character Count */}
        <div className="flex justify-between items-start mt-2">
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
              className={cn(
                'text-xs ml-3 flex-shrink-0 transition-colors duration-200',
                {
                  'text-neutral-500 dark:text-neutral-400':
                    currentLength < maxLength! * 0.8,
                  'text-accent-amber-600 dark:text-accent-amber-400':
                    currentLength >= maxLength! * 0.8 &&
                    currentLength < maxLength!,
                  'text-accent-red-600 dark:text-accent-red-400':
                    currentLength >= maxLength!,
                }
              )}
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
