'use client';

import React, {
  forwardRef,
  useState,
  useRef,
  useEffect,
  useCallback,
} from 'react';
import { BaseComponentProps, ComponentSize } from './types';
import { cn } from './utils';

/**
 * Menu item interface
 */
export interface MenuItem {
  /** Unique identifier for the menu item */
  id: string;
  /** Display label for the menu item */
  label: string;
  /** Click handler for the menu item */
  onClick?: () => void;
  /** Whether the item is disabled */
  disabled?: boolean;
  /** Icon to display before the label */
  icon?: React.ReactNode;
  /** Keyboard shortcut to display */
  shortcut?: string;
  /** Whether this item is a separator */
  separator?: boolean;
  /** Submenu items */
  submenu?: MenuItem[];
  /** Whether the item is destructive (danger style) */
  destructive?: boolean;
  /** Custom content to render instead of default item */
  content?: React.ReactNode;
}

/**
 * Menu component props
 */
export interface MenuProps extends BaseComponentProps {
  /** Array of menu items */
  items: MenuItem[];
  /** Trigger element that opens the menu */
  trigger: React.ReactNode;
  /** Size variant of the menu */
  size?: Exclude<ComponentSize, 'xs' | 'xl'>;
  /** Placement of the menu relative to trigger */
  placement?:
    | 'bottom-start'
    | 'bottom-end'
    | 'top-start'
    | 'top-end'
    | 'left'
    | 'right';
  /** Whether the menu is open (controlled) */
  open?: boolean;
  /** Callback when menu open state changes */
  onOpenChange?: (_open: boolean) => void;
  /** Whether to close menu on item click */
  closeOnItemClick?: boolean;
  /** Custom menu width */
  width?: string | number;
  /** Whether to show menu with portal (for better positioning) */
  portal?: boolean;
}

/**
 * Get placement classes for menu positioning
 */
const getPlacementClasses = (placement: MenuProps['placement']): string => {
  const placements = {
    'bottom-start': 'top-full left-0 mt-1',
    'bottom-end': 'top-full right-0 mt-1',
    'top-start': 'bottom-full left-0 mb-1',
    'top-end': 'bottom-full right-0 mb-1',
    left: 'right-full top-0 mr-1',
    right: 'left-full top-0 ml-1',
  };
  return placements[placement || 'bottom-start'];
};

/**
 * Get size classes for menu items
 */
const getSizeClasses = (size: 'sm' | 'md' | 'lg'): string => {
  const sizes = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-sm',
    lg: 'px-5 py-3 text-base',
  };
  return sizes[size];
};

/**
 * Individual Menu Item component
 */
const MenuItemComponent: React.FC<{
  item: MenuItem;
  size: 'sm' | 'md' | 'lg';
  onSelect: (_item: MenuItem) => void;
  onClose: () => void;
  closeOnItemClick: boolean;
}> = ({ item, size, onSelect, onClose, closeOnItemClick }) => {
  const [showSubmenu, setShowSubmenu] = useState(false);
  const itemRef = useRef<HTMLDivElement>(null);
  const submenuRef = useRef<HTMLDivElement>(null);

  // Handle item click
  const handleClick = (event: React.MouseEvent) => {
    if (item.disabled || item.separator) {
      event.preventDefault();
      return;
    }

    if (item.submenu && item.submenu.length > 0) {
      event.preventDefault();
      setShowSubmenu(!showSubmenu);
      return;
    }

    event.preventDefault();

    if (item.onClick) {
      item.onClick();
    }

    onSelect(item);

    if (closeOnItemClick) {
      onClose();
    }
  };

  // Handle keyboard navigation
  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (item.disabled || item.separator) return;

    switch (event.key) {
      case 'Enter':
      case ' ':
        event.preventDefault();
        if (item.submenu && item.submenu.length > 0) {
          setShowSubmenu(!showSubmenu);
        } else {
          if (item.onClick) {
            item.onClick();
          }
          onSelect(item);
          if (closeOnItemClick) {
            onClose();
          }
        }
        break;
      case 'ArrowRight':
        if (item.submenu && item.submenu.length > 0) {
          event.preventDefault();
          setShowSubmenu(true);
        }
        break;
      case 'ArrowLeft':
        if (showSubmenu) {
          event.preventDefault();
          setShowSubmenu(false);
        }
        break;
      case 'Escape':
        event.preventDefault();
        onClose();
        break;
    }
  };

  // Close submenu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        showSubmenu &&
        submenuRef.current &&
        !submenuRef.current.contains(event.target as Node) &&
        itemRef.current &&
        !itemRef.current.contains(event.target as Node)
      ) {
        setShowSubmenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showSubmenu]);

  // Separator item
  if (item.separator) {
    return (
      <div
        className="my-1 border-t border-gray-200 dark:border-gray-700"
        role="separator"
        aria-orientation="horizontal"
      />
    );
  }

  // Custom content item
  if (item.content) {
    return <div className={getSizeClasses(size)}>{item.content}</div>;
  }

  const itemClasses = cn(
    'flex items-center justify-between w-full text-left cursor-pointer transition-colors duration-150',
    'focus:outline-none focus:bg-gray-100 dark:focus:bg-gray-800',
    getSizeClasses(size),
    {
      'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800':
        !item.disabled && !item.destructive,
      'text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20':
        !item.disabled && item.destructive,
      'text-gray-400 cursor-not-allowed dark:text-gray-600': item.disabled,
    }
  );

  return (
    <div ref={itemRef} className="relative">
      <div
        role="menuitem"
        tabIndex={item.disabled ? -1 : 0}
        onClick={handleClick}
        onKeyDown={handleKeyDown}
        className={itemClasses}
        aria-disabled={item.disabled}
        aria-haspopup={
          item.submenu && item.submenu.length > 0 ? 'menu' : undefined
        }
        aria-expanded={
          item.submenu && item.submenu.length > 0 ? showSubmenu : undefined
        }
      >
        <div className="flex items-center flex-1 min-w-0">
          {item.icon && <span className="flex-shrink-0 mr-3">{item.icon}</span>}

          <span className="truncate">{item.label}</span>
        </div>

        <div className="flex items-center ml-3 space-x-2">
          {item.shortcut && (
            <span className="text-xs text-gray-400 dark:text-gray-500">
              {item.shortcut}
            </span>
          )}

          {item.submenu && item.submenu.length > 0 && (
            <svg
              className="w-4 h-4 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5l7 7-7 7"
              />
            </svg>
          )}
        </div>
      </div>

      {/* Submenu */}
      {item.submenu && item.submenu.length > 0 && showSubmenu && (
        <div
          ref={submenuRef}
          className={cn(
            'absolute left-full top-0 ml-1 z-50',
            'bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700',
            'rounded-lg shadow-lg min-w-48 py-1'
          )}
          role="menu"
          aria-orientation="vertical"
        >
          {item.submenu.map(subItem => (
            <MenuItemComponent
              key={subItem.id}
              item={subItem}
              size={size}
              onSelect={onSelect}
              onClose={onClose}
              closeOnItemClick={closeOnItemClick}
            />
          ))}
        </div>
      )}
    </div>
  );
};

/**
 * AppFlowy Menu/Dropdown Component
 *
 * A comprehensive menu component with support for submenus, keyboard navigation,
 * and proper accessibility features. Includes focus management and ARIA attributes.
 */
export const Menu = forwardRef<HTMLDivElement, MenuProps>(
  (
    {
      items,
      trigger,
      size = 'md',
      placement = 'bottom-start',
      open: controlledOpen,
      onOpenChange,
      closeOnItemClick = true,
      width,
      portal: _portal = false,
      className,
      children,
      'data-testid': testId,
      'aria-label': ariaLabel = 'Menu',
      ...rest
    },
    ref
  ) => {
    const [internalOpen, setInternalOpen] = useState(false);
    const triggerRef = useRef<HTMLDivElement>(null);
    const menuRef = useRef<HTMLDivElement>(null);
    const isControlled = controlledOpen !== undefined;
    const isOpen = isControlled ? controlledOpen : internalOpen;

    // Handle open state changes
    const handleOpenChange = useCallback(
      (newOpen: boolean) => {
        if (!isControlled) {
          setInternalOpen(newOpen);
        }
        onOpenChange?.(newOpen);
      },
      [isControlled, onOpenChange]
    );

    // Toggle menu
    const toggleMenu = () => {
      handleOpenChange(!isOpen);
    };

    // Close menu
    const closeMenu = () => {
      handleOpenChange(false);
    };

    // Handle item selection
    const handleItemSelect = (_item: MenuItem) => {
      // Item-specific logic is handled in MenuItemComponent
    };

    // Handle trigger click
    const handleTriggerClick = (event: React.MouseEvent) => {
      event.preventDefault();
      event.stopPropagation();
      toggleMenu();
    };

    // Handle trigger keyboard events
    const handleTriggerKeyDown = (event: React.KeyboardEvent) => {
      switch (event.key) {
        case 'Enter':
        case ' ':
        case 'ArrowDown':
          event.preventDefault();
          handleOpenChange(true);
          // Focus first menu item
          setTimeout(() => {
            const firstItem = menuRef.current?.querySelector(
              '[role="menuitem"]:not([aria-disabled="true"])'
            ) as HTMLElement;
            firstItem?.focus();
          }, 0);
          break;
        case 'ArrowUp':
          event.preventDefault();
          handleOpenChange(true);
          // Focus last menu item
          setTimeout(() => {
            const menuItems = menuRef.current?.querySelectorAll(
              '[role="menuitem"]:not([aria-disabled="true"])'
            );
            const lastItem = menuItems?.[menuItems.length - 1] as HTMLElement;
            lastItem?.focus();
          }, 0);
          break;
        case 'Escape':
          if (isOpen) {
            event.preventDefault();
            closeMenu();
          }
          break;
      }
    };

    // Handle menu keyboard navigation
    useEffect(() => {
      if (!isOpen) return;

      const handleKeyDown = (event: KeyboardEvent) => {
        if (!menuRef.current?.contains(event.target as Node)) return;

        const menuItems = Array.from(
          menuRef.current.querySelectorAll(
            '[role="menuitem"]:not([aria-disabled="true"])'
          )
        ) as HTMLElement[];

        const currentIndex = menuItems.findIndex(item => item === event.target);

        switch (event.key) {
          case 'ArrowDown':
            event.preventDefault();
            const nextIndex =
              currentIndex < menuItems.length - 1 ? currentIndex + 1 : 0;
            menuItems[nextIndex]?.focus();
            break;
          case 'ArrowUp':
            event.preventDefault();
            const prevIndex =
              currentIndex > 0 ? currentIndex - 1 : menuItems.length - 1;
            menuItems[prevIndex]?.focus();
            break;
          case 'Home':
            event.preventDefault();
            menuItems[0]?.focus();
            break;
          case 'End':
            event.preventDefault();
            menuItems[menuItems.length - 1]?.focus();
            break;
          case 'Escape':
            event.preventDefault();
            closeMenu();
            triggerRef.current?.focus();
            break;
        }
      };

      document.addEventListener('keydown', handleKeyDown);
      return () => document.removeEventListener('keydown', handleKeyDown);
    }, [isOpen]);

    // Close menu when clicking outside
    useEffect(() => {
      if (!isOpen) return;

      const handleClickOutside = (event: MouseEvent) => {
        if (
          triggerRef.current &&
          !triggerRef.current.contains(event.target as Node) &&
          menuRef.current &&
          !menuRef.current.contains(event.target as Node)
        ) {
          closeMenu();
        }
      };

      document.addEventListener('mousedown', handleClickOutside);
      return () =>
        document.removeEventListener('mousedown', handleClickOutside);
    }, [isOpen]);

    const menuClasses = cn(
      'absolute z-50 bg-white dark:bg-gray-900',
      'border border-gray-200 dark:border-gray-700',
      'rounded-lg shadow-lg py-1',
      'focus:outline-none',
      getPlacementClasses(placement),
      {
        'min-w-48': !width,
      }
    );

    const menuStyle = width
      ? { width: typeof width === 'number' ? `${width}px` : width }
      : {};

    return (
      <div
        ref={ref}
        className={cn('relative inline-block', className)}
        data-testid={testId}
        {...rest}
      >
        {/* Trigger */}
        <div
          ref={triggerRef}
          onClick={handleTriggerClick}
          onKeyDown={handleTriggerKeyDown}
          role="button"
          tabIndex={0}
          aria-haspopup="menu"
          aria-expanded={isOpen}
          aria-label={ariaLabel}
          className="focus:outline-none"
        >
          {trigger}
        </div>

        {/* Menu */}
        {isOpen && (
          <div
            ref={menuRef}
            className={menuClasses}
            style={menuStyle}
            role="menu"
            aria-orientation="vertical"
            aria-label={ariaLabel}
          >
            {items.map(item => (
              <MenuItemComponent
                key={item.id}
                item={item}
                size={size}
                onSelect={handleItemSelect}
                onClose={closeMenu}
                closeOnItemClick={closeOnItemClick}
              />
            ))}
          </div>
        )}

        {children}
      </div>
    );
  }
);

Menu.displayName = 'Menu';

export default Menu;
