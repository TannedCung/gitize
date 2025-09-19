'use client';

import React, {
  forwardRef,
  useRef,
  useEffect,
  useState,
  useCallback,
} from 'react';
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
 * Get size-specific classes for tabs - generous spacing for flat design
 */
const getSizeClasses = (size: 'sm' | 'md' | 'lg'): string => {
  const sizes = {
    sm: 'px-6 py-4 text-sm',
    md: 'px-8 py-5 text-sm',
    lg: 'px-10 py-6 text-base',
  };
  return sizes[size];
};

/**
 * Get variant-specific classes for tabs - flat, borderless design with typography hierarchy
 */
const getVariantClasses = (
  variant: 'default' | 'pills' | 'underline',
  isActive: boolean
): string => {
  const variants = {
    default: {
      base: '',
      // Active state uses typography weight for hierarchy (flat design principle)
      active: 'text-gray-900 font-semibold dark:text-gray-100',
      // Inactive state with minimal hover feedback
      inactive:
        'text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100',
    },
    pills: {
      base: '',
      // Flat pills without heavy styling
      active:
        'bg-gray-50 text-gray-900 font-semibold dark:bg-gray-900/50 dark:text-gray-100',
      inactive:
        'text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100',
    },
    underline: {
      base: 'relative',
      // Minimal underline for active state
      active:
        'text-gray-900 font-semibold dark:text-gray-100 after:absolute after:bottom-0 after:left-0 after:right-0 after:h-px after:bg-gray-900 dark:after:bg-gray-100',
      inactive:
        'text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100',
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
    'inline-flex items-center justify-center font-medium transition-colors duration-200',
    'focus:outline-none focus:ring-1 focus:ring-gray-300 dark:focus:ring-gray-600',
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
    const handleTabSelect = useCallback(
      (tab: TabItem) => {
        if (!isControlled) {
          setInternalActiveTab(tab.id);
        }
        onTabChange?.(tab);
      },
      [isControlled, onTabChange]
    );

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
    }, [processedTabs, activeTabId, handleTabSelect]);

    const tabListClasses = cn('flex', {
      // Flat pills without heavy background styling
      'bg-gray-50/50 dark:bg-gray-900/25 p-3': variant === 'pills',
      'overflow-x-auto': scrollable,
      'w-full': fullWidth,
      // Add generous spacing between tabs
      'space-x-8': variant !== 'pills',
      'space-x-2': variant === 'pills',
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

        {/* Tab Content - generous spacing for airy layout */}
        {showContent && activeTab?.content && (
          <div
            role="tabpanel"
            id={`tabpanel-${activeTab.id}`}
            aria-labelledby={`tab-${activeTab.id}`}
            className="mt-12"
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
