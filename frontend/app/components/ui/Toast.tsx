'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { BaseComponentProps } from './types';
import { cn } from './utils';
import { AlertVariant } from './Alert';

/**
 * Toast position options
 */
export type ToastPosition =
  | 'top-left'
  | 'top-center'
  | 'top-right'
  | 'bottom-left'
  | 'bottom-center'
  | 'bottom-right';

/**
 * Toast configuration interface
 */
export interface ToastConfig {
  /** Unique identifier for the toast */
  id: string;
  /** Toast variant determining visual style */
  variant?: AlertVariant;
  /** Toast title */
  title?: string;
  /** Toast message content */
  message: string;
  /** Auto-dismiss duration in milliseconds (0 = no auto-dismiss) */
  duration?: number;
  /** Whether the toast can be manually dismissed */
  dismissible?: boolean;
  /** Custom icon to display */
  icon?: React.ReactNode;
  /** Whether to show default variant icon */
  showIcon?: boolean;
  /** Toast position on screen */
  position?: ToastPosition;
  /** Custom action button */
  action?: {
    label: string;
    onClick: () => void;
  };
}

/**
 * Toast component props
 */
export interface ToastProps extends BaseComponentProps {
  /** Toast configuration */
  toast: ToastConfig;
  /** Callback when toast is dismissed */
  onDismiss: (_id: string) => void;
}

/**
 * Toast container props
 */
export interface ToastContainerProps {
  /** Array of active toasts */
  toasts: ToastConfig[];
  /** Callback when toast is dismissed */
  onDismiss: (_id: string) => void;
  /** Default position for toasts */
  position?: ToastPosition;
  /** Maximum number of toasts to show */
  maxToasts?: number;
}

/**
 * Default icons for each toast variant
 */
const ToastIcons = {
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
 * Close icon for dismissible toasts
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
 * Get variant-specific classes for toast styling
 */
const getToastVariantClasses = (variant: AlertVariant): string => {
  const variants = {
    success: cn(
      'bg-white border-success-200 text-success-800 shadow-lg',
      'dark:bg-gray-800 dark:border-success-700 dark:text-success-200'
    ),
    warning: cn(
      'bg-white border-warning-200 text-warning-800 shadow-lg',
      'dark:bg-gray-800 dark:border-warning-700 dark:text-warning-200'
    ),
    error: cn(
      'bg-white border-error-200 text-error-800 shadow-lg',
      'dark:bg-gray-800 dark:border-error-700 dark:text-error-200'
    ),
    info: cn(
      'bg-white border-info-200 text-info-800 shadow-lg',
      'dark:bg-gray-800 dark:border-info-700 dark:text-info-200'
    ),
  };

  return variants[variant];
};

/**
 * Get variant-specific icon color classes
 */
const getToastIconClasses = (variant: AlertVariant): string => {
  const iconColors = {
    success: 'text-success-500 dark:text-success-400',
    warning: 'text-warning-500 dark:text-warning-400',
    error: 'text-error-500 dark:text-error-400',
    info: 'text-info-500 dark:text-info-400',
  };

  return iconColors[variant];
};

/**
 * Get position-specific classes for toast container
 */
const getPositionClasses = (position: ToastPosition): string => {
  const positions = {
    'top-left': 'top-4 left-4',
    'top-center': 'top-4 left-1/2 transform -translate-x-1/2',
    'top-right': 'top-4 right-4',
    'bottom-left': 'bottom-4 left-4',
    'bottom-center': 'bottom-4 left-1/2 transform -translate-x-1/2',
    'bottom-right': 'bottom-4 right-4',
  };

  return positions[position];
};

/**
 * Individual Toast Component
 */
export const Toast: React.FC<ToastProps> = ({
  toast,
  onDismiss,
  className,
  'data-testid': testId,
  ...rest
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isExiting, setIsExiting] = useState(false);

  const {
    id,
    variant = 'info',
    title,
    message,
    duration = 5000,
    dismissible = true,
    icon,
    showIcon = true,
    action,
  } = toast;

  const handleDismiss = useCallback(() => {
    setIsExiting(true);
    setTimeout(() => {
      onDismiss(id);
    }, 200); // Match animation duration
  }, [id, onDismiss]);

  const handleKeyDown = (event: React.KeyboardEvent<HTMLButtonElement>) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      handleDismiss();
    }
  };

  // Auto-dismiss functionality
  useEffect(() => {
    if (duration > 0) {
      const timer = setTimeout(handleDismiss, duration);
      return () => clearTimeout(timer);
    }
  }, [duration, handleDismiss]);

  // Entry animation
  useEffect(() => {
    // Use requestAnimationFrame for better test compatibility
    const frame = requestAnimationFrame(() => setIsVisible(true));
    return () => cancelAnimationFrame(frame);
  }, []);

  const displayIcon = icon || (showIcon ? ToastIcons[variant] : null);

  return (
    <div
      role="alert"
      aria-live="assertive"
      data-testid={testId || `toast-${id}`}
      className={cn(
        // Base styles
        'relative w-full max-w-sm rounded-lg border p-4 mb-3',
        'transition-all duration-200 ease-in-out',
        'transform',

        // Animation states
        isVisible && !isExiting && 'translate-x-0 opacity-100',
        !isVisible && 'translate-x-full opacity-0',
        isExiting && 'translate-x-full opacity-0',

        // Variant styles
        getToastVariantClasses(variant),

        className
      )}
      {...rest}
    >
      <div className="flex items-start">
        {/* Icon */}
        {displayIcon && (
          <div
            className={cn(
              'flex-shrink-0 mr-3 mt-0.5',
              getToastIconClasses(variant)
            )}
          >
            {displayIcon}
          </div>
        )}

        {/* Content */}
        <div className="flex-1 min-w-0">
          {title && <h4 className="text-sm font-medium mb-1">{title}</h4>}
          <p className="text-sm">{message}</p>

          {/* Action button */}
          {action && (
            <div className="mt-3">
              <button
                type="button"
                onClick={action.onClick}
                className={cn(
                  'text-sm font-medium underline',
                  'hover:no-underline focus:outline-none focus:ring-2',
                  'focus:ring-offset-2 focus:ring-current rounded',
                  getToastIconClasses(variant)
                )}
              >
                {action.label}
              </button>
            </div>
          )}
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
                'text-gray-400 hover:text-gray-600',
                'dark:text-gray-500 dark:hover:text-gray-300',
                'transition-colors duration-200',
                'focus:outline-none focus:ring-2 focus:ring-offset-2',
                'focus:ring-offset-white focus:ring-gray-500',
                'dark:focus:ring-offset-gray-800'
              )}
              aria-label="Dismiss notification"
              data-testid={testId ? `${testId}-dismiss` : `toast-${id}-dismiss`}
            >
              {CloseIcon}
            </button>
          </div>
        )}
      </div>

      {/* Progress bar for auto-dismiss */}
      {duration > 0 && (
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-gray-200 dark:bg-gray-700 rounded-b-lg overflow-hidden">
          <div
            className={cn(
              'h-full transition-all ease-linear',
              getToastIconClasses(variant).replace('text-', 'bg-')
            )}
            style={{
              animation: `toast-progress ${duration}ms linear forwards`,
            }}
          />
        </div>
      )}
    </div>
  );
};

/**
 * Toast Container Component
 */
export const ToastContainer: React.FC<ToastContainerProps> = ({
  toasts,
  onDismiss,
  position = 'top-right',
  maxToasts = 5,
}) => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  const visibleToasts = toasts.slice(0, maxToasts);

  const containerElement = (
    <div
      className={cn(
        'fixed z-50 pointer-events-none',
        getPositionClasses(position)
      )}
      aria-live="polite"
      aria-label="Notifications"
    >
      <div className="flex flex-col space-y-2 pointer-events-auto">
        {visibleToasts.map(toast => (
          <Toast key={toast.id} toast={toast} onDismiss={onDismiss} />
        ))}
      </div>
    </div>
  );

  return createPortal(containerElement, document.body);
};

/**
 * Toast hook for managing toast notifications
 */
export const useToast = () => {
  const [toasts, setToasts] = useState<ToastConfig[]>([]);

  const addToast = useCallback((config: Omit<ToastConfig, 'id'>) => {
    const id = Math.random().toString(36).substr(2, 9);
    const toast: ToastConfig = {
      id,
      duration: 5000,
      dismissible: true,
      showIcon: true,
      position: 'top-right',
      ...config,
    };

    setToasts(prev => [...prev, toast]);
    return id;
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  }, []);

  const clearToasts = useCallback(() => {
    setToasts([]);
  }, []);

  // Convenience methods for different variants
  const success = useCallback(
    (message: string, options?: Partial<ToastConfig>) => {
      return addToast({ ...options, message, variant: 'success' });
    },
    [addToast]
  );

  const error = useCallback(
    (message: string, options?: Partial<ToastConfig>) => {
      return addToast({ ...options, message, variant: 'error' });
    },
    [addToast]
  );

  const warning = useCallback(
    (message: string, options?: Partial<ToastConfig>) => {
      return addToast({ ...options, message, variant: 'warning' });
    },
    [addToast]
  );

  const info = useCallback(
    (message: string, options?: Partial<ToastConfig>) => {
      return addToast({ ...options, message, variant: 'info' });
    },
    [addToast]
  );

  return {
    toasts,
    addToast,
    removeToast,
    clearToasts,
    success,
    error,
    warning,
    info,
  };
};

// Add CSS for progress bar animation
if (typeof document !== 'undefined') {
  const style = document.createElement('style');
  style.textContent = `
    @keyframes toast-progress {
      from { width: 100%; }
      to { width: 0%; }
    }
  `;
  document.head.appendChild(style);
}

export default Toast;
