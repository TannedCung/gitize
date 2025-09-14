'use client';

import React, { forwardRef, useState } from 'react';
import { BaseComponentProps } from './types';
import { cn } from './utils';

/**
 * Alert variant types for different message types
 */
export type AlertVariant = 'success' | 'warning' | 'error' | 'info';

/**
 * Alert component props
 */
export interface AlertProps extends BaseComponentProps {
  /** Alert variant determining the visual style and semantic meaning */
  variant?: AlertVariant;
  /** Alert title/heading */
  title?: string;
  /** Whether the alert can be dismissed by the user */
  dismissible?: boolean;
  /** Callback function called when alert is dismissed */
  onDismiss?: () => void;
  /** Icon to display alongside the alert content */
  icon?: React.ReactNode;
  /** Whether to show default variant icon */
  showIcon?: boolean;
}

/**
 * Default icons for each alert variant
 */
const DefaultIcons = {
  success: (
    <svg
      className="w-5 h-5"
      fill="currentColor"
      viewBox="0 0 20 20"
      aria-hidden="true"
    >
      <path
        fillRule="evenodd"
        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.236 4.53L7.53 10.53a.75.75 0 00-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z"
        clipRule="evenodd"
      />
    </svg>
  ),
  warning: (
    <svg
      className="w-5 h-5"
      fill="currentColor"
      viewBox="0 0 20 20"
      aria-hidden="true"
    >
      <path
        fillRule="evenodd"
        d="M8.485 2.495c.673-1.167 2.357-1.167 3.03 0l6.28 10.875c.673 1.167-.17 2.625-1.516 2.625H3.72c-1.347 0-2.189-1.458-1.515-2.625L8.485 2.495zM10 5a.75.75 0 01.75.75v3.5a.75.75 0 01-1.5 0v-3.5A.75.75 0 0110 5zm0 9a1 1 0 100-2 1 1 0 000 2z"
        clipRule="evenodd"
      />
    </svg>
  ),
  error: (
    <svg
      className="w-5 h-5"
      fill="currentColor"
      viewBox="0 0 20 20"
      aria-hidden="true"
    >
      <path
        fillRule="evenodd"
        d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z"
        clipRule="evenodd"
      />
    </svg>
  ),
  info: (
    <svg
      className="w-5 h-5"
      fill="currentColor"
      viewBox="0 0 20 20"
      aria-hidden="true"
    >
      <path
        fillRule="evenodd"
        d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a.75.75 0 000 1.5h.253a.25.25 0 01.244.304l-.459 2.066A1.75 1.75 0 0010.747 15H11a.75.75 0 000-1.5h-.253a.25.25 0 01-.244-.304l.459-2.066A1.75 1.75 0 009.253 9H9z"
        clipRule="evenodd"
      />
    </svg>
  ),
};

/**
 * Close icon for dismissible alerts
 */
const CloseIcon = (
  <svg
    className="w-4 h-4"
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
    aria-hidden="true"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M6 18L18 6M6 6l12 12"
    />
  </svg>
);

/**
 * Get variant-specific classes for styling
 */
const getVariantClasses = (variant: AlertVariant): string => {
  const variants = {
    success: cn(
      'bg-green-50 text-green-800',
      'dark:bg-green-900/10 dark:text-green-200'
    ),
    warning: cn(
      'bg-amber-50 text-amber-800',
      'dark:bg-amber-900/10 dark:text-amber-200'
    ),
    error: cn('bg-red-50 text-red-800', 'dark:bg-red-900/10 dark:text-red-200'),
    info: cn(
      'bg-blue-50 text-blue-800',
      'dark:bg-blue-900/10 dark:text-blue-200'
    ),
  };

  return variants[variant];
};

/**
 * Get variant-specific icon color classes
 */
const getIconClasses = (variant: AlertVariant): string => {
  const iconColors = {
    success: 'text-green-600 dark:text-green-400',
    warning: 'text-amber-600 dark:text-amber-400',
    error: 'text-red-600 dark:text-red-400',
    info: 'text-blue-600 dark:text-blue-400',
  };

  return iconColors[variant];
};

/**
 * Get variant-specific close button classes
 */
const getCloseButtonClasses = (variant: AlertVariant): string => {
  const closeButtonColors = {
    success: cn(
      'text-green-600 hover:text-green-800 hover:bg-green-100',
      'dark:text-green-400 dark:hover:text-green-200 dark:hover:bg-green-800/20'
    ),
    warning: cn(
      'text-amber-600 hover:text-amber-800 hover:bg-amber-100',
      'dark:text-amber-400 dark:hover:text-amber-200 dark:hover:bg-amber-800/20'
    ),
    error: cn(
      'text-red-600 hover:text-red-800 hover:bg-red-100',
      'dark:text-red-400 dark:hover:text-red-200 dark:hover:bg-red-800/20'
    ),
    info: cn(
      'text-blue-600 hover:text-blue-800 hover:bg-blue-100',
      'dark:text-blue-400 dark:hover:text-blue-200 dark:hover:bg-blue-800/20'
    ),
  };

  return closeButtonColors[variant];
};

/**
 * AppFlowy Alert Component
 *
 * A versatile alert component for displaying important messages to users.
 * Supports multiple variants (success, warning, error, info) with proper
 * accessibility features and optional dismiss functionality.
 */
export const Alert = forwardRef<HTMLDivElement, AlertProps>(
  (
    {
      children,
      variant = 'info',
      title,
      dismissible = false,
      onDismiss,
      icon,
      showIcon = true,
      className,
      'data-testid': testId,
      'aria-label': ariaLabel,
      ...rest
    },
    ref
  ) => {
    const [isVisible, setIsVisible] = useState(true);

    const handleDismiss = () => {
      setIsVisible(false);
      onDismiss?.();
    };

    const handleKeyDown = (event: React.KeyboardEvent<HTMLButtonElement>) => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        handleDismiss();
      }
    };

    if (!isVisible) {
      return null;
    }

    const displayIcon = icon || (showIcon ? DefaultIcons[variant] : null);

    return (
      <div
        ref={ref}
        role="alert"
        aria-live="polite"
        aria-label={ariaLabel}
        data-testid={testId}
        className={cn(
          // Base styles - flat design with no borders
          'relative rounded-lg p-4',
          'transition-all duration-200 ease-in-out',

          // Variant styles
          getVariantClasses(variant),

          className
        )}
        {...rest}
      >
        <div className="flex items-start">
          {/* Icon */}
          {displayIcon && (
            <div className={cn('flex-shrink-0 mr-3', getIconClasses(variant))}>
              {displayIcon}
            </div>
          )}

          {/* Content */}
          <div className="flex-1 min-w-0">
            {title && <h3 className="text-sm font-medium mb-1">{title}</h3>}
            {children && <div className="text-sm">{children}</div>}
          </div>

          {/* Dismiss button */}
          {dismissible && (
            <div className="flex-shrink-0 ml-3">
              <button
                type="button"
                onClick={handleDismiss}
                onKeyDown={handleKeyDown}
                className={cn(
                  'inline-flex rounded-md p-1.5',
                  'transition-colors duration-200',
                  'focus:outline-none focus:ring-2 focus:ring-offset-2',
                  'focus:ring-offset-transparent focus:ring-current',
                  getCloseButtonClasses(variant)
                )}
                aria-label="Dismiss alert"
                data-testid={testId ? `${testId}-dismiss` : 'alert-dismiss'}
              >
                {CloseIcon}
              </button>
            </div>
          )}
        </div>
      </div>
    );
  }
);

Alert.displayName = 'Alert';

export default Alert;
