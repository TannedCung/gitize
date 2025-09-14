import React, { forwardRef, useMemo } from 'react';
import { BaseComponentProps } from './types';
import { cn } from './utils';

/**
 * Grid item data interface
 */
export interface GridItem {
  id: string | number;
  [key: string]: any;
}

/**
 * Grid column configuration
 */
export interface GridColumn {
  /** Unique identifier for the column */
  key: string;
  /** Display label for the column */
  label: string;
  /** Width configuration (auto, fixed px, fr units, or percentage) */
  width?: string | number;
  /** Minimum width for responsive behavior */
  minWidth?: string | number;
  /** Whether column can be sorted */
  sortable?: boolean;
  /** Custom render function for cell content */
  render?: (_value: any, _item: GridItem, _index: number) => React.ReactNode;
  /** CSS classes for the column */
  className?: string;
}

/**
 * Sort configuration
 */
export interface SortConfig {
  key: string;
  direction: 'asc' | 'desc';
}

/**
 * Filter configuration
 */
export interface FilterConfig {
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
 * Grid component props
 */
export interface GridProps extends BaseComponentProps {
  /** Array of data items to display */
  data: GridItem[];
  /** Column configuration */
  columns: GridColumn[];
  /** Number of columns for responsive grid (overrides column config) */
  cols?: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12;
  /** Gap between grid items */
  gap?: 'none' | 'sm' | 'md' | 'lg' | 'xl';
  /** Whether to show column headers */
  showHeaders?: boolean;
  /** Whether rows are selectable */
  selectable?: boolean;
  /** Selected item IDs */
  selectedIds?: Set<string | number>;
  /** Selection change handler */
  onSelectionChange?: (_selectedIds: Set<string | number>) => void;
  /** Sort configuration */
  sortConfig?: SortConfig;
  /** Sort change handler */
  onSortChange?: (_sortConfig: SortConfig) => void;
  /** Filter configuration */
  filters?: FilterConfig[];
  /** Filter change handler */
  onFilterChange?: (_filters: FilterConfig[]) => void;
  /** Loading state */
  loading?: boolean;
  /** Empty state message */
  emptyMessage?: string;
  /** Custom row click handler */
  onRowClick?: (_item: GridItem, _index: number) => void;
  /** Custom row class name function */
  getRowClassName?: (_item: GridItem, _index: number) => string;
  /** Whether to enable keyboard navigation */
  keyboardNavigation?: boolean;
}

/**
 * Responsive Grid component with sorting, filtering, and selection capabilities
 */
export const Grid = forwardRef<HTMLDivElement, GridProps>(
  (
    {
      data,
      columns,
      cols,
      gap = 'md',
      showHeaders = true,
      selectable = false,
      selectedIds = new Set(),
      onSelectionChange,
      sortConfig,
      onSortChange,
      filters = [],
      onFilterChange,
      loading = false,
      emptyMessage = 'No data available',
      onRowClick,
      getRowClassName,
      keyboardNavigation = true,
      className,
      'data-testid': dataTestId,
      ...props
    },
    ref
  ) => {
    // Filter and sort data
    const processedData = useMemo(() => {
      let result = [...data];

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
    }, [data, filters, sortConfig]);

    // Gap classes - increased for spacious, airy design
    const gapClasses = {
      none: 'gap-0',
      sm: 'gap-4', // Increased from gap-2 to gap-4 (16px)
      md: 'gap-8', // Increased from gap-4 to gap-8 (32px)
      lg: 'gap-12', // Increased from gap-6 to gap-12 (48px)
      xl: 'gap-16', // Increased from gap-8 to gap-16 (64px)
    };

    // Handle selection
    const handleSelectAll = () => {
      if (!onSelectionChange) return;

      const allSelected = processedData.every(item => selectedIds.has(item.id));
      if (allSelected) {
        onSelectionChange(new Set());
      } else {
        onSelectionChange(new Set(processedData.map(item => item.id)));
      }
    };

    const handleSelectItem = (itemId: string | number) => {
      if (!onSelectionChange) return;

      const newSelection = new Set(selectedIds);
      if (newSelection.has(itemId)) {
        newSelection.delete(itemId);
      } else {
        newSelection.add(itemId);
      }
      onSelectionChange(newSelection);
    };

    // Handle sorting
    const handleSort = (columnKey: string) => {
      if (!onSortChange) return;

      const newDirection =
        sortConfig?.key === columnKey && sortConfig.direction === 'asc'
          ? 'desc'
          : 'asc';
      onSortChange({ key: columnKey, direction: newDirection });
    };

    // Handle keyboard navigation
    const handleKeyDown = (
      event: React.KeyboardEvent,
      item: GridItem,
      index: number
    ) => {
      if (!keyboardNavigation) return;

      switch (event.key) {
        case 'Enter':
        case ' ':
          event.preventDefault();
          if (selectable) {
            handleSelectItem(item.id);
          }
          if (onRowClick) {
            onRowClick(item, index);
          }
          break;
        case 'ArrowUp':
          event.preventDefault();
          if (index > 0) {
            const prevRow = event.currentTarget.parentElement
              ?.previousElementSibling as HTMLElement;
            prevRow?.focus();
          }
          break;
        case 'ArrowDown':
          event.preventDefault();
          if (index < processedData.length - 1) {
            const nextRow = event.currentTarget.parentElement
              ?.nextElementSibling as HTMLElement;
            nextRow?.focus();
          }
          break;
      }
    };

    // Generate grid template columns
    const gridTemplateColumns = useMemo(() => {
      if (cols) {
        return `repeat(${cols}, minmax(0, 1fr))`;
      }

      return columns
        .map(col => {
          if (col.width) {
            if (typeof col.width === 'number') {
              return `${col.width}px`;
            }
            return col.width;
          }
          return 'minmax(0, 1fr)';
        })
        .join(' ');
    }, [cols, columns]);

    if (loading) {
      return (
        <div
          ref={ref}
          className={cn('animate-pulse space-y-8', className)}
          data-testid={dataTestId}
          {...props}
        >
          {showHeaders && (
            <div className="grid gap-4" style={{ gridTemplateColumns }}>
              {columns.map((_, index) => (
                <div
                  key={index}
                  className="h-8 bg-neutral-200 rounded dark:bg-neutral-700"
                />
              ))}
            </div>
          )}
          {Array.from({ length: 5 }).map((_, index) => (
            <div
              key={index}
              className="grid gap-4"
              style={{ gridTemplateColumns }}
            >
              {columns.map((_, colIndex) => (
                <div
                  key={colIndex}
                  className="h-12 bg-neutral-200 rounded dark:bg-neutral-700"
                />
              ))}
            </div>
          ))}
        </div>
      );
    }

    if (processedData.length === 0) {
      return (
        <div
          ref={ref}
          className={cn(
            'flex items-center justify-center py-24 text-neutral-500 dark:text-neutral-400',
            className
          )}
          data-testid={dataTestId}
          {...props}
        >
          <p>{emptyMessage}</p>
        </div>
      );
    }

    return (
      <div
        ref={ref}
        className={cn('w-full', className)}
        data-testid={dataTestId}
        role="grid"
        {...props}
      >
        {/* Headers */}
        {showHeaders && (
          <div
            className={cn(
              'grid border-b border-neutral-200 dark:border-neutral-700 pb-6 mb-8',
              gapClasses[gap]
            )}
            style={{ gridTemplateColumns }}
            role="row"
          >
            {selectable && (
              <div className="flex items-center" role="columnheader">
                <input
                  type="checkbox"
                  checked={
                    processedData.length > 0 &&
                    processedData.every(item => selectedIds.has(item.id))
                  }
                  onChange={handleSelectAll}
                  className="rounded border-gray-300 text-primary-600 focus:ring-primary-500 dark:border-gray-600 dark:bg-gray-700"
                  aria-label="Select all items"
                />
              </div>
            )}
            {columns.map(column => (
              <div
                key={column.key}
                className={cn(
                  'flex items-center font-medium text-gray-900 dark:text-gray-100',
                  column.sortable &&
                    'cursor-pointer hover:text-primary-600 dark:hover:text-primary-400',
                  column.className
                )}
                onClick={
                  column.sortable ? () => handleSort(column.key) : undefined
                }
                role="columnheader"
                tabIndex={column.sortable ? 0 : -1}
                onKeyDown={e => {
                  if (column.sortable && (e.key === 'Enter' || e.key === ' ')) {
                    e.preventDefault();
                    handleSort(column.key);
                  }
                }}
              >
                <span>{column.label}</span>
                {column.sortable && sortConfig?.key === column.key && (
                  <span className="ml-1 text-primary-600 dark:text-primary-400">
                    {sortConfig.direction === 'asc' ? '↑' : '↓'}
                  </span>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Data rows */}
        <div className={cn('space-y-6')}>
          {processedData.map((item, index) => (
            <div
              key={item.id}
              className={cn(
                'grid items-center py-6 px-6 rounded-lg border border-transparent hover:border-neutral-200 hover:bg-neutral-50 dark:hover:border-neutral-700 dark:hover:bg-neutral-800/50 transition-colors',
                selectedIds.has(item.id) &&
                  'bg-accent-blue-50 border-accent-blue-200 dark:bg-accent-blue-900/20 dark:border-accent-blue-800',
                keyboardNavigation &&
                  'focus-within:ring-2 focus-within:ring-accent-blue-500 focus-within:ring-offset-2 dark:focus-within:ring-offset-neutral-900',
                getRowClassName?.(item, index),
                gapClasses[gap]
              )}
              style={{ gridTemplateColumns }}
              role="row"
              tabIndex={keyboardNavigation ? 0 : -1}
              onClick={() => onRowClick?.(item, index)}
              onKeyDown={e => handleKeyDown(e, item, index)}
            >
              {selectable && (
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    checked={selectedIds.has(item.id)}
                    onChange={() => handleSelectItem(item.id)}
                    className="rounded border-gray-300 text-primary-600 focus:ring-primary-500 dark:border-gray-600 dark:bg-gray-700"
                    aria-label={`Select item ${item.id}`}
                  />
                </div>
              )}
              {columns.map(column => (
                <div
                  key={column.key}
                  className={cn(
                    'text-neutral-900 dark:text-neutral-100 leading-relaxed',
                    column.className
                  )}
                  role="gridcell"
                >
                  {column.render
                    ? column.render(item[column.key], item, index)
                    : item[column.key]}
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    );
  }
);

Grid.displayName = 'Grid';
