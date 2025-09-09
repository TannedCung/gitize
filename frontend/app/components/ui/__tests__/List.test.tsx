import React from 'react';
import { screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { List, ListProps, ListItem } from '../List';
import {
  renderWithProviders,
  testAccessibility,
  testBothThemes,
  createMockFunctions,
} from '../test-utils';

// Mock data
const mockItems: ListItem[] = [
  {
    id: 1,
    name: 'John Doe',
    email: 'john@example.com',
    age: 30,
    role: 'Developer',
  },
  {
    id: 2,
    name: 'Jane Smith',
    email: 'jane@example.com',
    age: 25,
    role: 'Designer',
  },
  {
    id: 3,
    name: 'Bob Johnson',
    email: 'bob@example.com',
    age: 35,
    role: 'Manager',
  },
  {
    id: 4,
    name: 'Alice Brown',
    email: 'alice@example.com',
    age: 28,
    role: 'Developer',
  },
];

const mockRenderItem = (
  item: ListItem,
  index: number,
  isSelected: boolean,
  isFocused: boolean
) => (
  <div
    className={`p-3 ${isSelected ? 'bg-blue-100' : ''} ${isFocused ? 'ring-2' : ''}`}
  >
    <div className="font-medium">{item.name}</div>
    <div className="text-sm text-gray-600">{item.email}</div>
    <div className="text-xs text-gray-500">
      {item.role} • Age: {item.age}
    </div>
  </div>
);

const defaultProps: ListProps = {
  items: mockItems,
  renderItem: mockRenderItem,
};

describe('List Component', () => {
  const _mockFunctions = createMockFunctions();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Basic Rendering', () => {
    it('renders without crashing', async () => {
      const { container } = renderWithProviders(<List {...defaultProps} />);
      expect(container.firstChild).toBeInTheDocument();
      await testAccessibility(container);
    });

    it('renders items correctly', () => {
      renderWithProviders(<List {...defaultProps} />);

      expect(screen.getByText('John Doe')).toBeInTheDocument();
      expect(screen.getByText('jane@example.com')).toBeInTheDocument();
      expect(screen.getByText('Manager • Age: 35')).toBeInTheDocument();
      expect(screen.getByText('Alice Brown')).toBeInTheDocument();
    });

    it('displays empty message when no items', () => {
      renderWithProviders(<List {...defaultProps} items={[]} />);
      expect(screen.getByText('No items available')).toBeInTheDocument();
    });

    it('displays custom empty message', () => {
      renderWithProviders(
        <List
          {...defaultProps}
          items={[]}
          emptyMessage="Custom empty message"
        />
      );
      expect(screen.getByText('Custom empty message')).toBeInTheDocument();
    });

    it('displays loading state', () => {
      renderWithProviders(<List {...defaultProps} loading={true} />);
      expect(screen.queryByText('John Doe')).not.toBeInTheDocument();
    });
  });

  describe('Selection', () => {
    it('handles single selection mode', async () => {
      const user = userEvent.setup();
      const onSelectionChange = jest.fn();

      renderWithProviders(
        <List
          {...defaultProps}
          selectable={true}
          selectionMode="single"
          onSelectionChange={onSelectionChange}
        />
      );

      const firstItem = screen
        .getByText('John Doe')
        .closest('[role="option"]') as HTMLElement;
      await user.click(firstItem);

      expect(onSelectionChange).toHaveBeenCalledWith(new Set([1]));
    });

    it('handles multiple selection mode', async () => {
      const user = userEvent.setup();
      const onSelectionChange = jest.fn();

      const { rerender } = renderWithProviders(
        <List
          {...defaultProps}
          selectable={true}
          selectionMode="multiple"
          onSelectionChange={onSelectionChange}
        />
      );

      const firstItem = screen
        .getByText('John Doe')
        .closest('[role="option"]') as HTMLElement;
      const secondItem = screen
        .getByText('Jane Smith')
        .closest('[role="option"]') as HTMLElement;

      await user.click(firstItem);
      expect(onSelectionChange).toHaveBeenCalledWith(new Set([1]));

      // Rerender with the first item selected to simulate state update
      rerender(
        <List
          {...defaultProps}
          selectable={true}
          selectionMode="multiple"
          selectedIds={new Set([1])}
          onSelectionChange={onSelectionChange}
        />
      );

      // Ctrl+click for multiple selection
      await user.click(secondItem, { ctrlKey: true });
      // Check that the function was called with the second item added
      const calls = onSelectionChange.mock.calls;
      const lastCall = calls[calls.length - 1][0];
      expect(lastCall.has(2)).toBe(true); // Should have the second item
    });

    it('handles range selection with Shift+click', async () => {
      const user = userEvent.setup();
      const onSelectionChange = jest.fn();

      const { rerender } = renderWithProviders(
        <List
          {...defaultProps}
          selectable={true}
          selectionMode="multiple"
          onSelectionChange={onSelectionChange}
        />
      );

      const firstItem = screen
        .getByText('John Doe')
        .closest('[role="option"]') as HTMLElement;
      const thirdItem = screen
        .getByText('Bob Johnson')
        .closest('[role="option"]') as HTMLElement;

      await user.click(firstItem);
      expect(onSelectionChange).toHaveBeenCalledWith(new Set([1]));

      // Rerender with the first item selected to simulate state update
      rerender(
        <List
          {...defaultProps}
          selectable={true}
          selectionMode="multiple"
          selectedIds={new Set([1])}
          onSelectionChange={onSelectionChange}
        />
      );

      await user.click(thirdItem, { shiftKey: true });

      // Check that the function was called with the range selection
      const calls = onSelectionChange.mock.calls;
      const lastCall = calls[calls.length - 1][0];
      expect(lastCall.has(3)).toBe(true); // Should have the third item
    });

    it('shows selected items correctly', () => {
      renderWithProviders(
        <List
          {...defaultProps}
          selectable={true}
          selectedIds={new Set([1, 3])}
        />
      );

      const firstItem = screen.getByText('John Doe').closest('[role="option"]');
      const thirdItem = screen
        .getByText('Bob Johnson')
        .closest('[role="option"]');

      expect(firstItem).toHaveAttribute('aria-selected', 'true');
      expect(thirdItem).toHaveAttribute('aria-selected', 'true');
    });

    it('toggles selection in single mode', async () => {
      const user = userEvent.setup();
      const onSelectionChange = jest.fn();

      renderWithProviders(
        <List
          {...defaultProps}
          selectable={true}
          selectionMode="single"
          selectedIds={new Set([1])}
          onSelectionChange={onSelectionChange}
        />
      );

      const firstItem = screen
        .getByText('John Doe')
        .closest('[role="option"]') as HTMLElement;
      await user.click(firstItem);

      expect(onSelectionChange).toHaveBeenCalledWith(new Set());
    });
  });

  describe('Sorting', () => {
    it('sorts items correctly', () => {
      const sortConfig = { key: 'name', direction: 'asc' as const };

      renderWithProviders(<List {...defaultProps} sortConfig={sortConfig} />);

      const items = screen.getAllByRole('option');
      expect(items[0]).toHaveTextContent('Alice Brown');
      expect(items[1]).toHaveTextContent('Bob Johnson');
      expect(items[2]).toHaveTextContent('Jane Smith');
      expect(items[3]).toHaveTextContent('John Doe');
    });

    it('sorts items in descending order', () => {
      const sortConfig = { key: 'age', direction: 'desc' as const };

      renderWithProviders(<List {...defaultProps} sortConfig={sortConfig} />);

      const items = screen.getAllByRole('option');
      expect(items[0]).toHaveTextContent('Bob Johnson'); // age 35
      expect(items[1]).toHaveTextContent('John Doe'); // age 30
      expect(items[2]).toHaveTextContent('Alice Brown'); // age 28
      expect(items[3]).toHaveTextContent('Jane Smith'); // age 25
    });
  });

  describe('Filtering', () => {
    it('filters items correctly', () => {
      const filters = [{ key: 'role', value: 'Developer' }];

      renderWithProviders(<List {...defaultProps} filters={filters} />);

      expect(screen.getByText('John Doe')).toBeInTheDocument();
      expect(screen.getByText('Alice Brown')).toBeInTheDocument();
      expect(screen.queryByText('Jane Smith')).not.toBeInTheDocument();
      expect(screen.queryByText('Bob Johnson')).not.toBeInTheDocument();
    });

    it('handles multiple filters', () => {
      const filters = [
        { key: 'role', value: 'Developer' },
        { key: 'age', value: 30, operator: 'gte' as const },
      ];

      renderWithProviders(<List {...defaultProps} filters={filters} />);

      expect(screen.getByText('John Doe')).toBeInTheDocument();
      expect(screen.queryByText('Alice Brown')).not.toBeInTheDocument();
    });

    it('handles contains filter operator', () => {
      const filters = [
        { key: 'name', value: 'john', operator: 'contains' as const },
      ];

      renderWithProviders(<List {...defaultProps} filters={filters} />);

      expect(screen.getByText('John Doe')).toBeInTheDocument();
      expect(screen.getByText('Bob Johnson')).toBeInTheDocument();
      expect(screen.queryByText('Jane Smith')).not.toBeInTheDocument();
    });
  });

  describe('Keyboard Navigation', () => {
    it('handles basic keyboard navigation', async () => {
      const user = userEvent.setup();
      const onItemClick = jest.fn();

      renderWithProviders(
        <List
          {...defaultProps}
          onItemClick={onItemClick}
          keyboardNavigation={true}
        />
      );

      const firstItem = screen
        .getByText('John Doe')
        .closest('[role="option"]') as HTMLElement;
      firstItem.focus();

      await user.keyboard('{Enter}');
      expect(onItemClick).toHaveBeenCalledWith(mockItems[0], 0);
    });

    it('handles arrow key navigation', async () => {
      const user = userEvent.setup();

      renderWithProviders(<List {...defaultProps} keyboardNavigation={true} />);

      const firstItem = screen
        .getByText('John Doe')
        .closest('[role="option"]') as HTMLElement;
      firstItem.focus();

      await user.keyboard('{ArrowDown}');

      const secondItem = screen
        .getByText('Jane Smith')
        .closest('[role="option"]') as HTMLElement;
      expect(document.activeElement).toBe(secondItem);
    });

    it('handles Home and End keys', async () => {
      const user = userEvent.setup();

      renderWithProviders(<List {...defaultProps} keyboardNavigation={true} />);

      const secondItem = screen
        .getByText('Jane Smith')
        .closest('[role="option"]') as HTMLElement;
      secondItem.focus();

      await user.keyboard('{Home}');

      const firstItem = screen
        .getByText('John Doe')
        .closest('[role="option"]') as HTMLElement;
      expect(document.activeElement).toBe(firstItem);

      await user.keyboard('{End}');

      const lastItem = screen
        .getByText('Alice Brown')
        .closest('[role="option"]') as HTMLElement;
      expect(document.activeElement).toBe(lastItem);
    });

    it('handles Ctrl+A for select all', async () => {
      const user = userEvent.setup();
      const onSelectionChange = jest.fn();

      renderWithProviders(
        <List
          {...defaultProps}
          selectable={true}
          selectionMode="multiple"
          onSelectionChange={onSelectionChange}
          keyboardNavigation={true}
        />
      );

      const firstItem = screen
        .getByText('John Doe')
        .closest('[role="option"]') as HTMLElement;
      firstItem.focus();

      await user.keyboard('{Control>}a{/Control}');
      expect(onSelectionChange).toHaveBeenCalledWith(new Set([1, 2, 3, 4]));
    });

    it('handles Escape to clear selection', async () => {
      const user = userEvent.setup();
      const onSelectionChange = jest.fn();

      renderWithProviders(
        <List
          {...defaultProps}
          selectable={true}
          selectedIds={new Set([1, 2])}
          onSelectionChange={onSelectionChange}
          keyboardNavigation={true}
        />
      );

      const firstItem = screen
        .getByText('John Doe')
        .closest('[role="option"]') as HTMLElement;
      firstItem.focus();

      await user.keyboard('{Escape}');
      expect(onSelectionChange).toHaveBeenCalledWith(new Set());
    });

    it('handles selection with keyboard', async () => {
      const user = userEvent.setup();
      const onSelectionChange = jest.fn();

      renderWithProviders(
        <List
          {...defaultProps}
          selectable={true}
          onSelectionChange={onSelectionChange}
          keyboardNavigation={true}
        />
      );

      const firstItem = screen
        .getByText('John Doe')
        .closest('[role="option"]') as HTMLElement;
      firstItem.focus();

      await user.keyboard(' ');
      expect(onSelectionChange).toHaveBeenCalledWith(new Set([1]));
    });
  });

  describe('Drag and Drop', () => {
    it('handles drag start', () => {
      const onItemsReorder = jest.fn();

      renderWithProviders(
        <List
          {...defaultProps}
          draggable={true}
          onItemsReorder={onItemsReorder}
        />
      );

      const firstItem = screen
        .getByText('John Doe')
        .closest('[role="option"]') as HTMLElement;
      expect(firstItem).toHaveAttribute('draggable', 'true');
    });

    it('handles drag and drop reordering', () => {
      const onItemsReorder = jest.fn();

      renderWithProviders(
        <List
          {...defaultProps}
          draggable={true}
          onItemsReorder={onItemsReorder}
        />
      );

      const firstItem = screen
        .getByText('John Doe')
        .closest('[role="option"]') as HTMLElement;
      const secondItem = screen
        .getByText('Jane Smith')
        .closest('[role="option"]') as HTMLElement;

      // Simulate drag start
      fireEvent.dragStart(firstItem, {
        dataTransfer: {
          setData: jest.fn(),
          effectAllowed: 'move',
        },
      });

      // Simulate drop
      fireEvent.drop(secondItem, {
        dataTransfer: {
          getData: jest
            .fn()
            .mockReturnValue(JSON.stringify({ item: mockItems[0], index: 0 })),
        },
      });

      expect(onItemsReorder).toHaveBeenCalled();
    });
  });

  describe('Event Handlers', () => {
    it('calls onItemClick when item is clicked', async () => {
      const user = userEvent.setup();
      const onItemClick = jest.fn();

      renderWithProviders(<List {...defaultProps} onItemClick={onItemClick} />);

      const firstItem = screen
        .getByText('John Doe')
        .closest('[role="option"]') as HTMLElement;
      await user.click(firstItem);

      expect(onItemClick).toHaveBeenCalledWith(mockItems[0], 0);
    });

    it('calls onItemDoubleClick when item is double clicked', async () => {
      const user = userEvent.setup();
      const onItemDoubleClick = jest.fn();

      renderWithProviders(
        <List {...defaultProps} onItemDoubleClick={onItemDoubleClick} />
      );

      const firstItem = screen
        .getByText('John Doe')
        .closest('[role="option"]') as HTMLElement;
      await user.dblClick(firstItem);

      expect(onItemDoubleClick).toHaveBeenCalledWith(mockItems[0], 0);
    });
  });

  describe('Custom Styling', () => {
    it('applies custom item class names', () => {
      const getItemClassName = (
        item: ListItem,
        _index: number,
        _isSelected: boolean
      ) => (item.role === 'Manager' ? 'manager-item' : '');

      renderWithProviders(
        <List {...defaultProps} getItemClassName={getItemClassName} />
      );

      const managerItem = screen
        .getByText('Bob Johnson')
        .closest('[role="option"]');
      expect(managerItem).toHaveClass('manager-item');
    });

    it('applies different spacing options', () => {
      const { rerender } = renderWithProviders(
        <List {...defaultProps} spacing="lg" />
      );

      expect(screen.getByRole('listbox')).toHaveClass('space-y-4');

      rerender(<List {...defaultProps} spacing="sm" />);

      expect(screen.getByRole('listbox')).toHaveClass('space-y-1');
    });

    it('shows dividers when enabled', () => {
      renderWithProviders(<List {...defaultProps} showDividers={true} />);

      const items = screen.getAllByRole('option');
      // Check that items except the last one have border-b class
      expect(items[0]).toHaveClass('border-b');
      expect(items[1]).toHaveClass('border-b');
      expect(items[2]).toHaveClass('border-b');
      expect(items[3]).not.toHaveClass('border-b'); // Last item shouldn't have border
    });
  });

  describe('Virtualization', () => {
    it('applies virtualization styles when enabled', () => {
      renderWithProviders(
        <List
          {...defaultProps}
          virtualized={true}
          height={400}
          itemHeight={48}
        />
      );

      const listContainer = screen.getByRole('listbox');
      expect(listContainer).toHaveStyle({ height: '400px', overflowY: 'auto' });

      const items = screen.getAllByRole('option');
      items.forEach(item => {
        expect(item).toHaveStyle({ height: '48px' });
      });
    });
  });

  describe('Accessibility', () => {
    it('has proper ARIA attributes', () => {
      renderWithProviders(<List {...defaultProps} />);

      expect(screen.getByRole('listbox')).toBeInTheDocument();
      expect(screen.getAllByRole('option')).toHaveLength(mockItems.length);
    });

    it('has proper ARIA attributes for selectable list', () => {
      renderWithProviders(
        <List {...defaultProps} selectable={true} selectionMode="multiple" />
      );

      const listbox = screen.getByRole('listbox');
      expect(listbox).toHaveAttribute('aria-multiselectable', 'true');
    });

    it('passes accessibility tests in both themes', async () => {
      await testBothThemes(<List {...defaultProps} />);
    });
  });
});
