'use client';

import React, { forwardRef, useEffect, useRef, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { BaseComponentProps } from './types';
import { cn, createFocusRing } from './utils';

// Modal Root Component
export interface ModalProps extends BaseComponentProps {
  /** Whether the modal is open */
  open: boolean;
  /** Callback when modal should close */
  onClose: () => void;
  /** Whether clicking the overlay closes the modal */
  closeOnOverlayClick?: boolean;
  /** Whether pressing escape closes the modal */
  closeOnEscape?: boolean;
  /** Size variant of the modal */
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  /** Whether to show the modal */
  portal?: boolean;
}

export const Modal = forwardRef<HTMLDivElement, ModalProps>(
  (
    {
      className,
      children,
      open,
      onClose,
      closeOnOverlayClick = true,
      closeOnEscape = true,
      size = 'md',
      portal = true,
      ...props
    },
    ref
  ) => {
    const modalRef = useRef<HTMLDivElement>(null);
    const previousActiveElement = useRef<HTMLElement | null>(null);

    // Size classes for the modal
    const sizeClasses = {
      sm: 'max-w-sm',
      md: 'max-w-md',
      lg: 'max-w-lg',
      xl: 'max-w-xl',
      full: 'max-w-full mx-4',
    };

    // Focus management
    useEffect(() => {
      if (open) {
        // Store the currently focused element
        previousActiveElement.current = document.activeElement as HTMLElement;

        // Focus the modal
        setTimeout(() => {
          modalRef.current?.focus();
        }, 0);

        // Trap focus within modal
        const handleTabKey = (e: KeyboardEvent) => {
          if (e.key !== 'Tab') return;

          const modal = modalRef.current;
          if (!modal) return;

          const focusableElements = modal.querySelectorAll(
            'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"]):not([disabled])'
          );

          if (focusableElements.length === 0) return;

          const firstElement = focusableElements[0] as HTMLElement;
          const lastElement = focusableElements[
            focusableElements.length - 1
          ] as HTMLElement;

          if (e.shiftKey) {
            if (document.activeElement === firstElement) {
              lastElement?.focus();
              e.preventDefault();
            }
          } else {
            if (document.activeElement === lastElement) {
              firstElement?.focus();
              e.preventDefault();
            }
          }
        };

        document.addEventListener('keydown', handleTabKey);
        return () => document.removeEventListener('keydown', handleTabKey);
      } else {
        // Restore focus to previous element
        if (previousActiveElement.current) {
          previousActiveElement.current.focus();
          previousActiveElement.current = null;
        }
      }
    }, [open]);

    // Handle escape key
    useEffect(() => {
      if (!open || !closeOnEscape) return;

      const handleEscape = (e: KeyboardEvent) => {
        if (e.key === 'Escape') {
          onClose();
        }
      };

      document.addEventListener('keydown', handleEscape);
      return () => document.removeEventListener('keydown', handleEscape);
    }, [open, closeOnEscape, onClose]);

    // Prevent body scroll when modal is open
    useEffect(() => {
      if (open) {
        document.body.style.overflow = 'hidden';
        return () => {
          document.body.style.overflow = 'unset';
        };
      }
    }, [open]);

    const handleOverlayClick = useCallback(
      (e: React.MouseEvent) => {
        if (closeOnOverlayClick && e.target === e.currentTarget) {
          onClose();
        }
      },
      [closeOnOverlayClick, onClose]
    );

    if (!open) return null;

    const modalContent = (
      <div
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
        onClick={handleOverlayClick}
      >
        {/* Overlay */}
        <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />

        {/* Modal */}
        <div
          ref={ref || modalRef}
          className={cn(
            'relative w-full bg-white dark:bg-gray-800 rounded-lg shadow-xl',
            'border border-gray-200 dark:border-gray-700',
            sizeClasses[size],
            createFocusRing(),
            className
          )}
          role="dialog"
          aria-modal="true"
          aria-labelledby="modal-title"
          tabIndex={-1}
          {...props}
        >
          {children}
        </div>
      </div>
    );

    return portal ? createPortal(modalContent, document.body) : modalContent;
  }
);

Modal.displayName = 'Modal';

// Modal Header Component
export interface ModalHeaderProps extends BaseComponentProps {
  /** Whether to show a close button */
  showCloseButton?: boolean;
  /** Callback when close button is clicked */
  onClose?: () => void;
  /** Whether to show a divider below the header */
  divider?: boolean;
}

export const ModalHeader = forwardRef<HTMLDivElement, ModalHeaderProps>(
  (
    {
      className,
      children,
      showCloseButton = true,
      onClose,
      divider = true,
      ...props
    },
    ref
  ) => {
    return (
      <div
        ref={ref}
        className={cn(
          'flex items-center justify-between px-6 py-4',
          divider && 'border-b border-gray-200 dark:border-gray-700',
          className
        )}
        {...props}
      >
        <div className="flex-1">{children}</div>
        {showCloseButton && onClose && (
          <button
            onClick={onClose}
            className={cn(
              'ml-4 p-1 rounded-md text-gray-400 hover:text-gray-600 dark:hover:text-gray-300',
              'hover:bg-gray-100 dark:hover:bg-gray-700',
              createFocusRing()
            )}
            aria-label="Close modal"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        )}
      </div>
    );
  }
);

ModalHeader.displayName = 'ModalHeader';

// Modal Body Component
export interface ModalBodyProps extends BaseComponentProps {
  /** Padding variant for the body */
  padding?: 'none' | 'sm' | 'md' | 'lg';
  /** Whether the body should be scrollable */
  scrollable?: boolean;
}

export const ModalBody = forwardRef<HTMLDivElement, ModalBodyProps>(
  (
    { className, children, padding = 'md', scrollable = false, ...props },
    ref
  ) => {
    const paddingClasses = {
      none: '',
      sm: 'px-4 py-3',
      md: 'px-6 py-4',
      lg: 'px-8 py-6',
    };

    return (
      <div
        ref={ref}
        className={cn(
          paddingClasses[padding],
          scrollable && 'max-h-96 overflow-y-auto',
          className
        )}
        {...props}
      >
        {children}
      </div>
    );
  }
);

ModalBody.displayName = 'ModalBody';

// Modal Footer Component
export interface ModalFooterProps extends BaseComponentProps {
  /** Whether to show a divider above the footer */
  divider?: boolean;
  /** Alignment of footer content */
  align?: 'left' | 'center' | 'right' | 'between';
}

export const ModalFooter = forwardRef<HTMLDivElement, ModalFooterProps>(
  ({ className, children, divider = true, align = 'right', ...props }, ref) => {
    const alignClasses = {
      left: 'justify-start',
      center: 'justify-center',
      right: 'justify-end',
      between: 'justify-between',
    };

    return (
      <div
        ref={ref}
        className={cn(
          'flex items-center gap-3 px-6 py-4',
          alignClasses[align],
          divider && 'border-t border-gray-200 dark:border-gray-700',
          className
        )}
        {...props}
      >
        {children}
      </div>
    );
  }
);

ModalFooter.displayName = 'ModalFooter';

// Modal Title Component (helper for common header content)
export interface ModalTitleProps extends BaseComponentProps {
  /** HTML heading level */
  level?: 1 | 2 | 3 | 4 | 5 | 6;
}

export const ModalTitle = forwardRef<HTMLHeadingElement, ModalTitleProps>(
  ({ className, children, level = 2, ...props }, ref) => {
    const headingProps = {
      ref,
      id: 'modal-title',
      className: cn(
        'text-lg font-semibold text-gray-900 dark:text-gray-100',
        className
      ),
      ...props,
      children,
    };

    switch (level) {
      case 1:
        return <h1 {...headingProps} />;
      case 2:
        return <h2 {...headingProps} />;
      case 3:
        return <h3 {...headingProps} />;
      case 4:
        return <h4 {...headingProps} />;
      case 5:
        return <h5 {...headingProps} />;
      case 6:
        return <h6 {...headingProps} />;
      default:
        return <h2 {...headingProps} />;
    }
  }
);

ModalTitle.displayName = 'ModalTitle';
