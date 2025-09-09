import React, { forwardRef } from 'react';
// import NextLink from 'next/link';
import { BaseComponentProps, ComponentVariant } from './types';
import { cn } from './utils';

/**
 * Link component props extending the base component props
 */
export interface LinkProps extends BaseComponentProps {
  /** Link destination URL */
  href: string;
  /** Link variant style */
  variant?: ComponentVariant;
  /** Whether the link opens in a new tab/window */
  external?: boolean;
  /** Whether the link is disabled */
  disabled?: boolean;
  /** Whether to show an external link icon */
  showExternalIcon?: boolean;
  /** Custom click handler */
  onClick?: (_event: React.MouseEvent<HTMLAnchorElement>) => void;
  /** Custom key down handler */
  onKeyDown?: (_event: React.KeyboardEvent<HTMLAnchorElement>) => void;
}

/**
 * External link icon component
 */
const ExternalLinkIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg
    className={cn('inline-block', className)}
    width="12"
    height="12"
    viewBox="0 0 12 12"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    aria-hidden="true"
  >
    <path
      d="M3.5 3C3.22386 3 3 3.22386 3 3.5C3 3.77614 3.22386 4 3.5 4H7.29289L3.14645 8.14645C2.95118 8.34171 2.95118 8.65829 3.14645 8.85355C3.34171 9.04882 3.65829 9.04882 3.85355 8.85355L8 4.70711V8.5C8 8.77614 8.22386 9 8.5 9C8.77614 9 9 8.77614 9 8.5V3.5C9 3.22386 8.77614 3 8.5 3H3.5Z"
      fill="currentColor"
    />
  </svg>
);

/**
 * Get variant-specific classes for the link
 */
const getVariantClasses = (variant: ComponentVariant): string => {
  const variants = {
    primary: cn(
      'text-primary-600 decoration-primary-600',
      'hover:text-primary-700 hover:decoration-primary-700',
      'active:text-primary-800 active:decoration-primary-800',
      'dark:text-primary-400 dark:decoration-primary-400',
      'dark:hover:text-primary-300 dark:hover:decoration-primary-300',
      'dark:active:text-primary-200 dark:active:decoration-primary-200'
    ),
    secondary: cn(
      'text-gray-600 decoration-gray-600',
      'hover:text-gray-700 hover:decoration-gray-700',
      'active:text-gray-800 active:decoration-gray-800',
      'dark:text-gray-400 dark:decoration-gray-400',
      'dark:hover:text-gray-300 dark:hover:decoration-gray-300',
      'dark:active:text-gray-200 dark:active:decoration-gray-200'
    ),
    outline: cn(
      'text-gray-700 decoration-gray-700',
      'hover:text-gray-800 hover:decoration-gray-800',
      'active:text-gray-900 active:decoration-gray-900',
      'dark:text-gray-300 dark:decoration-gray-300',
      'dark:hover:text-gray-200 dark:hover:decoration-gray-200',
      'dark:active:text-gray-100 dark:active:decoration-gray-100'
    ),
    ghost: cn(
      'text-gray-500 decoration-gray-500',
      'hover:text-gray-600 hover:decoration-gray-600',
      'active:text-gray-700 active:decoration-gray-700',
      'dark:text-gray-500 dark:decoration-gray-500',
      'dark:hover:text-gray-400 dark:hover:decoration-gray-400',
      'dark:active:text-gray-300 dark:active:decoration-gray-300'
    ),
    danger: cn(
      'text-error-600 decoration-error-600',
      'hover:text-error-700 hover:decoration-error-700',
      'active:text-error-800 active:decoration-error-800',
      'dark:text-error-400 dark:decoration-error-400',
      'dark:hover:text-error-300 dark:hover:decoration-error-300',
      'dark:active:text-error-200 dark:active:decoration-error-200'
    ),
  };

  return variants[variant];
};

/**
 * Get focus ring classes based on variant
 */
const getFocusRingClasses = (variant: ComponentVariant): string => {
  const focusRings = {
    primary: 'focus:ring-primary-500',
    secondary: 'focus:ring-gray-500',
    outline: 'focus:ring-gray-500',
    ghost: 'focus:ring-gray-500',
    danger: 'focus:ring-error-500',
  };

  return cn(
    'focus:outline-none focus:ring-2 focus:ring-offset-2 rounded-sm',
    'dark:focus:ring-offset-gray-900',
    focusRings[variant]
  );
};

/**
 * AppFlowy Link Component
 *
 * A comprehensive link component that supports multiple variants, external links,
 * and proper accessibility features including ARIA attributes and keyboard navigation.
 */
export const Link = forwardRef<HTMLAnchorElement, LinkProps>(
  (
    {
      children,
      href,
      variant = 'primary',
      external = false,
      disabled = false,
      showExternalIcon = true,
      className,
      onClick,
      onKeyDown,
      'data-testid': testId,
      'aria-label': ariaLabel,
      ...rest
    },
    ref
  ) => {
    // Determine if link is external based on href or explicit prop
    const isExternal =
      external ||
      (href.startsWith('http') &&
        (typeof window === 'undefined' ||
          !href.includes(window.location.hostname)));

    const handleClick = (event: React.MouseEvent<HTMLAnchorElement>) => {
      if (disabled) {
        event.preventDefault();
        return;
      }
      onClick?.(event);
    };

    const handleKeyDown = (event: React.KeyboardEvent<HTMLAnchorElement>) => {
      if (disabled) {
        event.preventDefault();
        return;
      }

      // Handle Enter key activation
      if (event.key === 'Enter') {
        event.preventDefault();
        if (!disabled) {
          event.currentTarget.click();
        }
      }

      onKeyDown?.(event);
    };

    const baseClasses = cn(
      // Base styles
      'inline-flex items-center gap-1',
      'font-medium underline decoration-1 underline-offset-2',
      'transition-all duration-200 ease-in-out',
      'select-none touch-manipulation',

      // Variant classes
      getVariantClasses(variant),

      // Focus ring classes
      getFocusRingClasses(variant),

      // State classes
      {
        'opacity-50 cursor-not-allowed pointer-events-none': disabled,
        'cursor-pointer': !disabled,
      }
    );

    // Security attributes for external links
    const securityProps = isExternal
      ? {
          target: '_blank',
          rel: 'noopener noreferrer',
        }
      : {};

    // Accessibility attributes
    const accessibilityProps = {
      'aria-disabled': disabled,
      'aria-label':
        ariaLabel ||
        (isExternal ? `${children} (opens in new tab)` : undefined),
      tabIndex: disabled ? -1 : 0,
      role: disabled ? 'link' : undefined,
    };

    const linkContent = (
      <>
        {children}
        {isExternal && showExternalIcon && (
          <ExternalLinkIcon className="ml-1 flex-shrink-0" />
        )}
      </>
    );

    // For external links or when disabled, use regular anchor tag
    if (isExternal || disabled || href.startsWith('#')) {
      return (
        <a
          ref={ref}
          href={disabled ? undefined : href}
          onClick={handleClick}
          onKeyDown={handleKeyDown}
          className={cn(baseClasses, className)}
          data-testid={testId}
          {...securityProps}
          {...accessibilityProps}
          {...rest}
        >
          {linkContent}
        </a>
      );
    }

    // For internal links, use regular anchor tag (Next.js Link will be handled at a higher level)
    return (
      <a
        ref={ref}
        href={href}
        onClick={handleClick}
        onKeyDown={handleKeyDown}
        className={cn(baseClasses, className)}
        data-testid={testId}
        {...accessibilityProps}
        {...rest}
      >
        {linkContent}
      </a>
    );
  }
);

Link.displayName = 'Link';

export default Link;
