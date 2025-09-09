'use client';

import React, { forwardRef, useMemo, useRef, useEffect } from 'react';
import { BaseComponentProps } from './types';
import { cn } from './utils';

/**
 * List item data interface
 */
export interface ListItem {
  id: string | number;
  [key: string]: any;
}

/**
 * Sort configuration for list
 */
export interface ListSortConfig {
  key: string;
  direction: 'asc' | 'desc';
}

/**
 * Filter configuration for list
 */
export interface ListFilterConfig {
  key: string;
  value: any;
  operator?:
    | 'equals'
    | 'contains'
    | 'startsWith'
    | 'endsWith'
    | 'gt'
    | 'lt'
    | 'gte'
    | 'lte';
}

/**
 * List component props
 */
export interface ListProps extends BaseComponentProps {
  /** Array of data items to display */
  items: ListItem[];
  /** Custom render function for list items */
  renderItem: (
    _item: ListItem,
    _index: number,
    _isSelected: boolean,
    _isFocused: boolean
  ) => React.ReactNode;
  /** Whether items are selectable */
  selectable?: boolean;
  /** Selection mode */
  selectionMode?: 'single' | 'multiple';
  /** Selected item IDs */
  selectedIds?: Set<string | number>;
  /** Selection change handler */
  onSelectionChange?: (_selectedIds: Set<string | number>) => void;
  /** Sort configuration */
  sortConfig?: ListSortConfig;
  /** Sort change handler */
  onSortChange?: (_sortConfig: ListSortConfig) => void;
  /** Filter configuration */
  filters?: ListFilterConfig[];
  /** Filter change handler */
  onFilterChange?: (_filters: ListFilterConfig[]) => void;
  /** Loading state */
  loading?: boolean;
  /** Empty state message */
  emptyMessage?: string;
  /** Custom item click handler */
  onItemClick?: (_item: ListItem, _index: number) => void;
  /** Custom item double click handler */
  onItemDoubleClick?: (_item: ListItem, _index: number) => void;
  /** Custom item class name function */
  getItemClassName?: (
    _item: ListItem,
    _index: number,
    _isSelected: boolean
  ) => string;
  /** Whether to enable keyboard navigation */
  keyboardNavigation?: boolean;
  /** Whether to enable virtual scrolling for large lists */
  virtualized?: boolean;
  /** Item height for virtualized lists */
  itemHeight?: number;
  /** Container height for virtualized lists */
  height?: number;
  /** Spacing between items */
  spacing?: 'none' | 'sm' | 'md' | 'lg';
  /** Whether to show dividers between items */
  showDividers?: boolean;
  /** Whether to enable drag and drop */
  draggable?: boolean;
  /** Drag and drop handler */
  onItemsReorder?: (_items: ListItem[]) => void;
}

/**
 * List component with selection, keyboard navigation, sorting, and filtering
 */
export const List = forwardRef<HTMLDivElement, ListProps>(
  (
    {
      items,
      renderItem,
      selectable = false,
      selectionMode = 'multiple',
      selectedIds = new Set(),
      onSelectionChange,
      sortConfig,
      onSortChange,
      filters = [],
      onFilterChange,
      loading = false,
      emptyMessage = 'No items available',
      onItemClick,
      onItemDoubleClick,
      getItemClassName,
      keyboardNavigation = true,
      virtualized = false,
      itemHeight = 48,
      height = 400,
      spacing = 'sm',
      showDividers = false,
      draggable = false,
      onItemsReorder,
      className,
      'data-testid': dataTestId,
      ...props
    },
    ref
  ) => {
    const listRef = useRef<HTMLDivElement>(null);
    const focusedIndexRef = useRef<number>(-1);

    // Filter and sort items
    const processedItems = useMemo(() => {
      let result = [...items];

      // Apply filters
      if (filters.length > 0) {
        result = result.filter(item => {
          return filters.every(filter => {
            const value = item[filter.key];
            const filterValue = filter.value;
            const operator = filter.operator || 'equals';

            if (value == null || filterValue == null) return false;

            switch (operator) {
              case 'equals':
                return value === filterValue;
              case 'contains':
                return String(value)
                  .toLowerCase()
                  .includes(String(filterValue).toLowerCase());
              case 'startsWith':
                return String(value)
                  .toLowerCase()
                  .startsWith(String(filterValue).toLowerCase());
              case 'endsWith':
                return String(value)
                  .toLowerCase()
                  .endsWith(String(filterValue).toLowerCase());
              case 'gt':
                return Number(value) > Number(filterValue);
              case 'lt':
                return Number(value) < Number(filterValue);
              case 'gte':
                return Number(value) >= Number(filterValue);
              case 'lte':
                return Number(value) <= Number(filterValue);
              default:
                return true;
            }
          });
        });
      }

      // Apply sorting
      if (sortConfig) {
        result.sort((a, b) => {
          const aValue = a[sortConfig.key];
          const bValue = b[sortConfig.key];

          if (aValue == null && bValue == null) return 0;
          if (aValue == null) return 1;
          if (bValue == null) return -1;

          let comparison = 0;
          if (typeof aValue === 'string' && typeof bValue === 'string') {
            comparison = aValue.localeCompare(bValue);
          } else if (typeof aValue === 'number' && typeof bValue === 'number') {
            comparison = aValue - bValue;
          } else {
            comparison = String(aValue).localeCompare(String(bValue));
          }

          return sortConfig.direction === 'desc' ? -comparison : comparison;
        });
      }

      return result;
    }, [items, filters, sortConfig]);

    // Spacing classes
    const spacingClasses = {
      none: 'space-y-0',
      sm: 'space-y-1',
      md: 'space-y-2',
      lg: 'space-y-4',
    };

    // Handle selection
    const handleSelectItem = (
      itemId: string | number,
      index: number,
      event?: React.MouseEvent
    ) => {
      if (!onSelectionChange) return;

      let newSelection = new Set(selectedIds);

      if (selectionMode === 'single') {
        newSelection = selectedIds.has(itemId) ? new Set() : new Set([itemId]);
      } else {
        // Multiple selection mode
        if (event?.ctrlKey || event?.metaKey) {
          // Toggle selection with Ctrl/Cmd
          if (newSelection.has(itemId)) {
            newSelection.delete(itemId);
          } else {
            newSelection.add(itemId);
          }
        } else if (event?.shiftKey && focusedIndexRef.current >= 0) {
          // Range selection with Shift
          newSelection.clear(); // Clear existing selection for range
          const start = Math.min(focusedIndexRef.current, index);
          const end = Math.max(focusedIndexRef.current, index);

          for (let i = start; i <= end; i++) {
            if (processedItems[i]) {
              newSelection.add(processedItems[i].id);
            }
          }
        } else {
          // Single selection (replace current selection)
          newSelection = new Set([itemId]);
        }
      }

      focusedIndexRef.current = index;
      onSelectionChange(newSelection);
    };

    // Handle keyboard navigation
    const handleKeyDown = (
      event: React.KeyboardEvent,
      item: ListItem,
      index: number
    ) => {
      if (!keyboardNavigation) return;

      switch (event.key) {
        case 'Enter':
        case ' ':
          event.preventDefault();
          if (selectable) {
            handleSelectItem(item.id, index);
          }
          if (onItemClick) {
            onItemClick(item, index);
          }
          break;
        case 'ArrowUp':
          event.preventDefault();
          if (index > 0) {
            const prevItem = listRef.current?.children[
              index - 1
            ] as HTMLElement;
            prevItem?.focus();
            focusedIndexRef.current = index - 1;
          }
          break;
        case 'ArrowDown':
          event.preventDefault();
          if (index < processedItems.length - 1) {
            const nextItem = listRef.current?.children[
              index + 1
            ] as HTMLElement;
            nextItem?.focus();
            focusedIndexRef.current = index + 1;
          }
          break;
        case 'Home':
          event.preventDefault();
          if (processedItems.length > 0) {
            const firstItem = listRef.current?.children[0] as HTMLElement;
            firstItem?.focus();
            focusedIndexRef.current = 0;
          }
          break;
        case 'End':
          event.preventDefault();
          if (processedItems.length > 0) {
            const lastItem = listRef.current?.children[
              processedItems.length - 1
            ] as HTMLElement;
            lastItem?.focus();
            focusedIndexRef.current = processedItems.length - 1;
          }
          break;
        case 'a':
          if (event.ctrlKey || event.metaKey) {
            event.preventDefault();
            if (
              selectable &&
              selectionMode === 'multiple' &&
              onSelectionChange
            ) {
              onSelectionChange(new Set(processedItems.map(item => item.id)));
            }
          }
          break;
        case 'Escape':
          event.preventDefault();
          if (selectable && onSelectionChange) {
            onSelectionChange(new Set());
          }
          break;
      }
    };

    // Handle drag and drop
    const handleDragStart = (
      event: React.DragEvent,
      item: ListItem,
      index: number
    ) => {
      if (!draggable) return;

      event.dataTransfer.setData('text/plain', JSON.stringify({ item, index }));
      event.dataTransfer.effectAllowed = 'move';
    };

    const handleDragOver = (event: React.DragEvent) => {
      if (!draggable) return;

      event.preventDefault();
      event.dataTransfer.dropEffect = 'move';
    };

    const handleDrop = (event: React.DragEvent, targetIndex: number) => {
      if (!draggable || !onItemsReorder) return;

      event.preventDefault();

      try {
        const dragData = JSON.parse(event.dataTransfer.getData('text/plain'));
        const sourceIndex = dragData.index;

        if (sourceIndex === targetIndex) return;

        const newItems = [...processedItems];
        const [movedItem] = newItems.splice(sourceIndex, 1);
        newItems.splice(targetIndex, 0, movedItem);

        onItemsReorder(newItems);
      } catch (error) {
        console.error('Error handling drop:', error);
      }
    };

    // Reset focused index when items change
    useEffect(() => {
      focusedIndexRef.current = -1;
    }, [processedItems]);

    if (loading) {
      return (
        <div
          ref={ref}
          className={cn('animate-pulse space-y-2', className)}
          data-testid={dataTestId}
          {...props}
        >
          {Array.from({ length: 5 }).map((_, index) => (
            <div
              key={index}
              className="h-12 bg-gray-200 rounded dark:bg-gray-700"
            />
          ))}
        </div>
      );
    }

    if (processedItems.length === 0) {
      return (
        <div
          ref={ref}
          className={cn(
            'flex items-center justify-center py-12 text-gray-500 dark:text-gray-400',
            className
          )}
          data-testid={dataTestId}
          {...props}
        >
          <p>{emptyMessage}</p>
        </div>
      );
    }

    const containerStyle = virtualized
      ? { height: `${height}px`, overflowY: 'auto' as const }
      : {};

    return (
      <div
        ref={ref}
        className={cn('w-full', className)}
        data-testid={dataTestId}
        {...props}
      >
        <div
          ref={listRef}
          className={cn(
            'focus:outline-none',
            !virtualized && spacingClasses[spacing]
          )}
          style={containerStyle}
          role="listbox"
          aria-multiselectable={selectionMode === 'multiple'}
          aria-label="List of items"
          tabIndex={keyboardNavigation ? 0 : -1}
        >
          {processedItems.map((item, index) => {
            const isSelected = selectedIds.has(item.id);
            const isFocused = focusedIndexRef.current === index;

            return (
              <div
                key={item.id}
                className={cn(
                  'relative focus:outline-none',
                  keyboardNavigation &&
                    'focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 dark:focus:ring-offset-gray-900',
                  selectable && 'cursor-pointer',
                  isSelected && 'bg-primary-50 dark:bg-primary-900/20',
                  showDividers &&
                    index < processedItems.length - 1 &&
                    'border-b border-gray-200 dark:border-gray-700',
                  getItemClassName?.(item, index, isSelected),
                  virtualized && 'mb-1'
                )}
                style={virtualized ? { height: `${itemHeight}px` } : {}}
                role="option"
                aria-selected={isSelected}
                tabIndex={keyboardNavigation ? 0 : -1}
                draggable={draggable}
                onClick={e => {
                  if (selectable) {
                    handleSelectItem(item.id, index, e);
                  }
                  onItemClick?.(item, index);
                }}
                onDoubleClick={() => onItemDoubleClick?.(item, index)}
                onKeyDown={e => handleKeyDown(e, item, index)}
                onDragStart={e => handleDragStart(e, item, index)}
                onDragOver={handleDragOver}
                onDrop={e => handleDrop(e, index)}
              >
                {renderItem(item, index, isSelected, isFocused)}
              </div>
            );
          })}
        </div>
      </div>
    );
  }
);

List.displayName = 'List';
