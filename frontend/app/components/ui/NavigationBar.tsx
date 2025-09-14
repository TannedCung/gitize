'use client';

import React, { forwardRef, useState, useRef, useEffect } from 'react';
import { BaseComponentProps } from './types';
import { cn } from './utils';

/**
 * Navigation item interface
 */
export interface NavigationItem {
  /** Unique identifier for the navigation item */
  id: string;
  /** Display label for the navigation item */
  label: string;
  /** URL or path for navigation */
  href?: string;
  /** Click handler for custom navigation logic */
  onClick?: () => void;
  /** Whether the item is currently active */
  active?: boolean;
  /** Whether the item is disabled */
  disabled?: boolean;
  /** Icon to display before the label */
  icon?: React.ReactNode;
  /** Badge or notification indicator */
  badge?: React.ReactNode;
}

/**
 * Navigation Bar component props
 */
export interface NavigationBarProps extends BaseComponentProps {
  /** Array of navigation items */
  items: NavigationItem[];
  /** Whether the navigation should be responsive (mobile-friendly) */
  responsive?: boolean;
  /** Brand logo or title */
  brand?: React.ReactNode;
  /** Additional actions to display on the right side */
  actions?: React.ReactNode;
  /** Callback when navigation item is selected */
  onItemSelect?: (_item: NavigationItem) => void;
  /** Whether to show mobile menu toggle */
  showMobileToggle?: boolean;
  /** Custom mobile menu toggle icon */
  mobileToggleIcon?: React.ReactNode;
}

/**
 * Default mobile menu toggle icon
 */
const DefaultMobileToggleIcon: React.FC<{ isOpen: boolean }> = ({ isOpen }) => (
  <svg
    className={cn(
      'w-6 h-6 transition-transform duration-200',
      isOpen && 'rotate-90'
    )}
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
    aria-hidden="true"
  >
    {isOpen ? (
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M6 18L18 6M6 6l12 12"
      />
    ) : (
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M4 6h16M4 12h16M4 18h16"
      />
    )}
  </svg>
);

/**
 * Navigation item component
 */
const NavigationItem: React.FC<{
  item: NavigationItem;
  onSelect: (_item: NavigationItem) => void;
  isMobile?: boolean;
}> = ({ item, onSelect, isMobile = false }) => {
  const handleClick = (event: React.MouseEvent) => {
    if (item.disabled) {
      event.preventDefault();
      return;
    }

    if (item.onClick) {
      event.preventDefault();
      item.onClick();
    }

    onSelect(item);
  };

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (item.disabled) return;

    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      if (item.onClick) {
        item.onClick();
      }
      onSelect(item);
    }
  };

  const baseClasses = cn(
    'flex items-center px-6 py-4 text-sm font-medium transition-colors duration-200',
    'focus:outline-none focus:ring-1 focus:ring-gray-300 dark:focus:ring-gray-600',
    {
      // Active state - typography weight for hierarchy (flat design principle)
      'text-gray-900 font-semibold dark:text-gray-100': item.active,
      // Default state - clean text with minimal hover feedback
      'text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100':
        !item.active && !item.disabled,
      // Disabled state
      'text-gray-400 cursor-not-allowed dark:text-gray-600': item.disabled,
      // Mobile specific styles
      'w-full justify-start': isMobile,
    }
  );

  const Element = item.href ? 'a' : 'button';

  return (
    <Element
      href={item.href}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      disabled={item.disabled}
      className={baseClasses}
      aria-current={item.active ? 'page' : undefined}
      aria-disabled={item.disabled}
      tabIndex={item.disabled ? -1 : 0}
    >
      {item.icon && (
        <span className={cn('flex-shrink-0', item.label && 'mr-2')}>
          {item.icon}
        </span>
      )}

      {item.label && <span className="truncate">{item.label}</span>}

      {item.badge && (
        <span className={cn('flex-shrink-0', item.label && 'ml-2')}>
          {item.badge}
        </span>
      )}
    </Element>
  );
};

/**
 * AppFlowy Navigation Bar Component
 *
 * A responsive navigation bar component with support for brand logo, navigation items,
 * and additional actions. Includes proper accessibility features and keyboard navigation.
 */
export const NavigationBar = forwardRef<HTMLElement, NavigationBarProps>(
  (
    {
      items,
      responsive = true,
      brand,
      actions,
      onItemSelect,
      showMobileToggle = true,
      mobileToggleIcon,
      className,
      children,
      'data-testid': testId,
      'aria-label': ariaLabel = 'Main navigation',
      ...rest
    },
    ref
  ) => {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const mobileMenuRef = useRef<HTMLDivElement>(null);

    // Handle mobile menu toggle
    const toggleMobileMenu = () => {
      setIsMobileMenuOpen(!isMobileMenuOpen);
    };

    // Handle item selection
    const handleItemSelect = (item: NavigationItem) => {
      onItemSelect?.(item);
      // Close mobile menu when item is selected
      if (isMobileMenuOpen) {
        setIsMobileMenuOpen(false);
      }
    };

    // Close mobile menu when clicking outside
    useEffect(() => {
      const handleClickOutside = (event: MouseEvent) => {
        if (
          isMobileMenuOpen &&
          mobileMenuRef.current &&
          !mobileMenuRef.current.contains(event.target as Node)
        ) {
          setIsMobileMenuOpen(false);
        }
      };

      document.addEventListener('mousedown', handleClickOutside);
      return () =>
        document.removeEventListener('mousedown', handleClickOutside);
    }, [isMobileMenuOpen]);

    // Handle escape key to close mobile menu
    useEffect(() => {
      const handleEscapeKey = (event: KeyboardEvent) => {
        if (event.key === 'Escape' && isMobileMenuOpen) {
          setIsMobileMenuOpen(false);
        }
      };

      document.addEventListener('keydown', handleEscapeKey);
      return () => document.removeEventListener('keydown', handleEscapeKey);
    }, [isMobileMenuOpen]);

    return (
      <nav
        ref={ref}
        className={cn('bg-white dark:bg-gray-900', className)}
        aria-label={ariaLabel}
        data-testid={testId}
        {...rest}
      >
        <div className="max-w-7xl mx-auto px-8 sm:px-12 lg:px-16">
          <div className="flex justify-between h-24">
            {/* Brand and desktop navigation */}
            <div className="flex">
              {/* Brand */}
              {brand && (
                <div className="flex-shrink-0 flex items-center">{brand}</div>
              )}

              {/* Desktop navigation - generous spacing for airy feel */}
              {responsive && (
                <div className="hidden md:ml-12 md:flex md:space-x-12">
                  {items.map(item => (
                    <NavigationItem
                      key={item.id}
                      item={item}
                      onSelect={handleItemSelect}
                    />
                  ))}
                </div>
              )}

              {/* Non-responsive navigation - generous spacing */}
              {!responsive && (
                <div className="ml-12 flex space-x-12">
                  {items.map(item => (
                    <NavigationItem
                      key={item.id}
                      item={item}
                      onSelect={handleItemSelect}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* Actions and mobile menu button */}
            <div className="flex items-center">
              {/* Actions */}
              {actions && (
                <div className="hidden md:flex md:items-center md:space-x-2">
                  {actions}
                </div>
              )}

              {/* Mobile menu button */}
              {responsive && showMobileToggle && (
                <div className="md:hidden">
                  <button
                    type="button"
                    onClick={toggleMobileMenu}
                    className={cn(
                      'inline-flex items-center justify-center p-4',
                      'text-gray-600 hover:text-gray-900',
                      'dark:text-gray-400 dark:hover:text-gray-100',
                      'focus:outline-none focus:ring-1 focus:ring-gray-300 dark:focus:ring-gray-600'
                    )}
                    aria-expanded={isMobileMenuOpen}
                    aria-controls="mobile-menu"
                    aria-label="Toggle navigation menu"
                  >
                    {mobileToggleIcon || (
                      <DefaultMobileToggleIcon isOpen={isMobileMenuOpen} />
                    )}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Mobile menu */}
        {responsive && (
          <div
            ref={mobileMenuRef}
            id="mobile-menu"
            className={cn(
              'md:hidden transition-all duration-300 ease-in-out overflow-hidden',
              {
                'max-h-96 opacity-100': isMobileMenuOpen,
                'max-h-0 opacity-0': !isMobileMenuOpen,
              }
            )}
            aria-hidden={!isMobileMenuOpen}
          >
            <div className="px-8 pt-8 pb-12 space-y-4 bg-white dark:bg-gray-900">
              {items.map(item => (
                <NavigationItem
                  key={item.id}
                  item={item}
                  onSelect={handleItemSelect}
                  isMobile
                />
              ))}

              {/* Mobile actions - generous spacing */}
              {actions && (
                <div className="pt-12">
                  <div className="space-y-6">{actions}</div>
                </div>
              )}
            </div>
          </div>
        )}

        {children}
      </nav>
    );
  }
);

NavigationBar.displayName = 'NavigationBar';

export default NavigationBar;
