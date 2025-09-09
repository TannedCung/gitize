'use client';

import React, { forwardRef, useRef, useEffect, useState } from 'react';
import { BaseComponentProps, ComponentSize } from './types';
import { cn } from './utils';

/**
 * Tab item interface
 */
export interface TabItem {
  /** Unique identifier for the tab */
  id: string;
  /** Display label for the tab */
  label: string;
  /** Whether the tab is currently active */
  active?: boolean;
  /** Whether the tab is disabled */
  disabled?: boolean;
  /** Icon to display before the label */
  icon?: React.ReactNode;
  /** Badge or notification indicator */
  badge?: React.ReactNode;
  /** Content to display when tab is active */
  content?: React.ReactNode;
  /** Accessible description for screen readers */
  'aria-label'?: string;
}

/**
 * Tab Bar component props
 */
export interface TabBarProps extends BaseComponentProps {
  /** Array of tab items */
  tabs: TabItem[];
  /** Size variant of the tabs */
  size?: Exclude<ComponentSize, 'xs' | 'xl'>;
  /** Visual variant of the tabs */
  variant?: 'default' | 'pills' | 'underline';
  /** Whether tabs should take full width */
  fullWidth?: boolean;
  /** Whether to show tab content */
  showContent?: boolean;
  /** Callback when tab is selected */
  onTabChange?: (_tab: TabItem) => void;
  /** Default active tab ID */
  defaultActiveTab?: string;
  /** Controlled active tab ID */
  activeTab?: string;
  /** Whether tabs should be scrollable on overflow */
  scrollable?: boolean;
}

/**
 * Get size-specific classes for tabs
 */
const getSizeClasses = (size: 'sm' | 'md' | 'lg'): string => {
  const sizes = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-sm',
    lg: 'px-6 py-3 text-base',
  };
  return sizes[size];
};

/**
 * Get variant-specific classes for tabs
 */
const getVariantClasses = (
  variant: 'default' | 'pills' | 'underline',
  isActive: boolean
): string => {
  const variants = {
    default: {
      base: 'border-b-2 border-transparent',
      active: 'border-primary-500 text-primary-600 dark:text-primary-400',
      inactive:
        'text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300',
    },
    pills: {
      base: 'rounded-lg',
      active:
        'bg-primary-100 text-primary-700 dark:bg-primary-900/20 dark:text-primary-300',
      inactive:
        'text-gray-500 hover:text-gray-700 hover:bg-gray-100 dark:text-gray-400 dark:hover:text-gray-300 dark:hover:bg-gray-800',
    },
    underline: {
      base: 'border-b-2 border-transparent relative',
      active:
        'text-primary-600 dark:text-primary-400 after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-primary-500',
      inactive:
        'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300',
    },
  };

  const variantConfig = variants[variant];
  return cn(
    variantConfig.base,
    isActive ? variantConfig.active : variantConfig.inactive
  );
};

/**
 * Individual Tab component
 */
const Tab: React.FC<{
  tab: TabItem;
  size: 'sm' | 'md' | 'lg';
  variant: 'default' | 'pills' | 'underline';
  fullWidth: boolean;
  onSelect: (_tab: TabItem) => void;
}> = ({ tab, size, variant, fullWidth, onSelect }) => {
  const handleClick = (event: React.MouseEvent) => {
    if (tab.disabled) {
      event.preventDefault();
      return;
    }
    onSelect(tab);
  };

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (tab.disabled) return;

    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      onSelect(tab);
    }
  };

  const baseClasses = cn(
    'inline-flex items-center justify-center font-medium transition-all duration-200',
    'focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2',
    'dark:focus:ring-offset-gray-900',
    getSizeClasses(size),
    getVariantClasses(variant, tab.active || false),
    {
      'flex-1': fullWidth,
      'cursor-not-allowed opacity-50': tab.disabled,
      'cursor-pointer': !tab.disabled,
    }
  );

  return (
    <button
      type="button"
      role="tab"
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      disabled={tab.disabled}
      className={baseClasses}
      aria-selected={tab.active}
      aria-disabled={tab.disabled}
      aria-label={tab['aria-label'] || tab.label}
      tabIndex={tab.active ? 0 : -1}
      id={`tab-${tab.id}`}
      aria-controls={`tabpanel-${tab.id}`}
    >
      {tab.icon && (
        <span className={cn('flex-shrink-0', tab.label && 'mr-2')}>
          {tab.icon}
        </span>
      )}

      {tab.label && <span className="truncate">{tab.label}</span>}

      {tab.badge && (
        <span className={cn('flex-shrink-0', tab.label && 'ml-2')}>
          {tab.badge}
        </span>
      )}
    </button>
  );
};

/**
 * AppFlowy Tab Bar Component
 *
 * A comprehensive tab bar component with support for different variants, sizes,
 * and keyboard navigation. Includes proper accessibility features and ARIA attributes.
 */
export const TabBar = forwardRef<HTMLDivElement, TabBarProps>(
  (
    {
      tabs,
      size = 'md',
      variant = 'default',
      fullWidth = false,
      showContent = false,
      onTabChange,
      defaultActiveTab,
      activeTab: controlledActiveTab,
      scrollable = false,
      className,
      children,
      'data-testid': testId,
      'aria-label': ariaLabel = 'Tab navigation',
      ...rest
    },
    ref
  ) => {
    const [internalActiveTab, setInternalActiveTab] = useState<string>(() => {
      // Find the first active tab or use defaultActiveTab or first tab
      const activeTabFromProps = tabs.find(tab => tab.active)?.id;
      return activeTabFromProps || defaultActiveTab || tabs[0]?.id || '';
    });

    const tabListRef = useRef<HTMLDivElement>(null);
    const isControlled = controlledActiveTab !== undefined;
    const activeTabId = isControlled ? controlledActiveTab : internalActiveTab;

    // Update tabs with active state
    const processedTabs = tabs.map(tab => ({
      ...tab,
      active: tab.id === activeTabId,
    }));

    const activeTab = processedTabs.find(tab => tab.active);

    // Handle tab selection
    const handleTabSelect = (tab: TabItem) => {
      if (!isControlled) {
        setInternalActiveTab(tab.id);
      }
      onTabChange?.(tab);
    };

    // Handle keyboard navigation
    useEffect(() => {
      const handleKeyDown = (event: KeyboardEvent) => {
        if (!tabListRef.current?.contains(event.target as Node)) return;

        const enabledTabs = processedTabs.filter(tab => !tab.disabled);
        const currentIndex = enabledTabs.findIndex(
          tab => tab.id === activeTabId
        );

        let newIndex = currentIndex;

        switch (event.key) {
          case 'ArrowLeft':
            event.preventDefault();
            newIndex =
              currentIndex > 0 ? currentIndex - 1 : enabledTabs.length - 1;
            break;
          case 'ArrowRight':
            event.preventDefault();
            newIndex =
              currentIndex < enabledTabs.length - 1 ? currentIndex + 1 : 0;
            break;
          case 'Home':
            event.preventDefault();
            newIndex = 0;
            break;
          case 'End':
            event.preventDefault();
            newIndex = enabledTabs.length - 1;
            break;
          default:
            return;
        }

        const newTab = enabledTabs[newIndex];
        if (newTab) {
          handleTabSelect(newTab);
          // Focus the new tab
          const tabElement = tabListRef.current?.querySelector(
            `#tab-${newTab.id}`
          ) as HTMLElement;
          tabElement?.focus();
        }
      };

      document.addEventListener('keydown', handleKeyDown);
      return () => document.removeEventListener('keydown', handleKeyDown);
    }, [processedTabs, activeTabId]);

    const tabListClasses = cn('flex', {
      'border-b border-gray-200 dark:border-gray-700':
        variant === 'default' || variant === 'underline',
      'bg-gray-100 dark:bg-gray-800 rounded-lg p-1': variant === 'pills',
      'overflow-x-auto': scrollable,
      'w-full': fullWidth,
    });

    return (
      <div
        ref={ref}
        className={cn('w-full', className)}
        data-testid={testId}
        {...rest}
      >
        {/* Tab List */}
        <div
          ref={tabListRef}
          role="tablist"
          aria-label={ariaLabel}
          className={tabListClasses}
        >
          {processedTabs.map(tab => (
            <Tab
              key={tab.id}
              tab={tab}
              size={size}
              variant={variant}
              fullWidth={fullWidth}
              onSelect={handleTabSelect}
            />
          ))}
        </div>

        {/* Tab Content */}
        {showContent && activeTab?.content && (
          <div
            role="tabpanel"
            id={`tabpanel-${activeTab.id}`}
            aria-labelledby={`tab-${activeTab.id}`}
            className="mt-4"
            tabIndex={0}
          >
            {activeTab.content}
          </div>
        )}

        {children}
      </div>
    );
  }
);

TabBar.displayName = 'TabBar';

export default TabBar;
