import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe, toHaveNoViolations } from 'jest-axe';
import { Menu, MenuItem } from '../Menu';

expect.extend(toHaveNoViolations);

// Mock menu items
const mockItems: MenuItem[] = [
  {
    id: 'item1',
    label: 'Item 1',
    onClick: jest.fn(),
    icon: <span data-testid="item1-icon">📄</span>,
    shortcut: 'Ctrl+1',
  },
  {
    id: 'item2',
    label: 'Item 2',
    onClick: jest.fn(),
    icon: <span data-testid="item2-icon">📊</span>,
  },
  {
    id: 'separator1',
    label: '',
    separator: true,
  },
  {
    id: 'item3',
    label: 'Destructive Item',
    onClick: jest.fn(),
    destructive: true,
  },
  {
    id: 'item4',
    label: 'Disabled Item',
    onClick: jest.fn(),
    disabled: true,
  },
  {
    id: 'submenu',
    label: 'Submenu',
    submenu: [
      {
        id: 'sub1',
        label: 'Sub Item 1',
        onClick: jest.fn(),
      },
      {
        id: 'sub2',
        label: 'Sub Item 2',
        onClick: jest.fn(),
      },
    ],
  },
  {
    id: 'custom',
    label: '',
    content: <div data-testid="custom-content">Custom Content</div>,
  },
];

const MockTrigger = () => <button data-testid="menu-trigger">Open Menu</button>;

describe('Menu', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Basic Rendering', () => {
    it('renders trigger element', () => {
      render(
        <Menu items={mockItems} trigger={<MockTrigger />} data-testid="menu" />
      );

      expect(screen.getByTestId('menu-trigger')).toBeInTheDocument();
    });

    it('does not render menu initially when not controlled', () => {
      render(<Menu items={mockItems} trigger={<MockTrigger />} />);

      expect(screen.queryByRole('menu')).not.toBeInTheDocument();
    });

    it('renders menu when open prop is true', () => {
      render(<Menu items={mockItems} trigger={<MockTrigger />} open={true} />);

      expect(screen.getByRole('menu')).toBeInTheDocument();
      expect(screen.getByText('Item 1')).toBeInTheDocument();
      expect(screen.getByText('Item 2')).toBeInTheDocument();
    });

    it('renders menu items with icons and shortcuts', () => {
      render(<Menu items={mockItems} trigger={<MockTrigger />} open={true} />);

      expect(screen.getByTestId('item1-icon')).toBeInTheDocument();
      expect(screen.getByTestId('item2-icon')).toBeInTheDocument();
      expect(screen.getByText('Ctrl+1')).toBeInTheDocument();
    });

    it('renders separator items', () => {
      render(<Menu items={mockItems} trigger={<MockTrigger />} open={true} />);

      const separator = screen.getByRole('separator');
      expect(separator).toBeInTheDocument();
      expect(separator).toHaveAttribute('aria-orientation', 'horizontal');
    });

    it('renders custom content items', () => {
      render(<Menu items={mockItems} trigger={<MockTrigger />} open={true} />);

      expect(screen.getByTestId('custom-content')).toBeInTheDocument();
    });
  });

  describe('Menu Opening and Closing', () => {
    it('opens menu when trigger is clicked', async () => {
      const user = userEvent.setup();

      render(<Menu items={mockItems} trigger={<MockTrigger />} />);

      const trigger = screen.getByTestId('menu-trigger');
      await user.click(trigger);

      expect(screen.getByRole('menu')).toBeInTheDocument();
    });

    it('closes menu when clicking outside', async () => {
      const user = userEvent.setup();

      render(
        <div>
          <Menu items={mockItems} trigger={<MockTrigger />} />
          <div data-testid="outside">Outside content</div>
        </div>
      );

      const trigger = screen.getByTestId('menu-trigger');
      const outside = screen.getByTestId('outside');

      // Open menu
      await user.click(trigger);
      expect(screen.getByRole('menu')).toBeInTheDocument();

      // Click outside
      await user.click(outside);
      await waitFor(() => {
        expect(screen.queryByRole('menu')).not.toBeInTheDocument();
      });
    });

    it('closes menu when Escape key is pressed', async () => {
      const user = userEvent.setup();

      render(<Menu items={mockItems} trigger={<MockTrigger />} />);

      const trigger = screen.getByTestId('menu-trigger');

      // Open menu
      await user.click(trigger);
      expect(screen.getByRole('menu')).toBeInTheDocument();

      // Press Escape
      await user.keyboard('{Escape}');
      await waitFor(() => {
        expect(screen.queryByRole('menu')).not.toBeInTheDocument();
      });
    });

    it('calls onOpenChange when menu state changes', async () => {
      const user = userEvent.setup();
      const mockOnOpenChange = jest.fn();

      render(
        <Menu
          items={mockItems}
          trigger={<MockTrigger />}
          onOpenChange={mockOnOpenChange}
        />
      );

      const trigger = screen.getByTestId('menu-trigger');

      // Open menu
      await user.click(trigger);
      expect(mockOnOpenChange).toHaveBeenCalledWith(true);

      // Close menu
      await user.click(trigger);
      expect(mockOnOpenChange).toHaveBeenCalledWith(false);
    });
  });

  describe('Menu Item Interactions', () => {
    it('calls item onClick when menu item is clicked', async () => {
      const user = userEvent.setup();
      const item1 = mockItems[0];

      render(<Menu items={mockItems} trigger={<MockTrigger />} open={true} />);

      const menuItem = screen.getByText('Item 1');
      await user.click(menuItem);

      expect(item1.onClick).toHaveBeenCalled();
    });

    it('closes menu after item click when closeOnItemClick is true', async () => {
      const user = userEvent.setup();
      const mockOnOpenChange = jest.fn();

      render(
        <Menu
          items={mockItems}
          trigger={<MockTrigger />}
          closeOnItemClick={true}
          onOpenChange={mockOnOpenChange}
        />
      );

      // Open menu first
      const trigger = screen.getByTestId('menu-trigger');
      await user.click(trigger);

      const menuItem = screen.getByText('Item 1');
      await user.click(menuItem);

      // Should call onOpenChange with false to close menu
      expect(mockOnOpenChange).toHaveBeenCalledWith(false);
    });

    it('does not close menu after item click when closeOnItemClick is false', async () => {
      const user = userEvent.setup();

      render(
        <Menu
          items={mockItems}
          trigger={<MockTrigger />}
          closeOnItemClick={false}
          open={true}
        />
      );

      const menuItem = screen.getByText('Item 1');
      await user.click(menuItem);

      expect(screen.getByRole('menu')).toBeInTheDocument();
    });

    it('handles keyboard activation with Enter key', async () => {
      const user = userEvent.setup();
      const item1 = mockItems[0];

      render(<Menu items={mockItems} trigger={<MockTrigger />} open={true} />);

      const menuItem = screen
        .getByText('Item 1')
        .closest('[role="menuitem"]') as HTMLElement;
      menuItem.focus();
      await user.keyboard('{Enter}');

      expect(item1.onClick).toHaveBeenCalled();
    });

    it('handles keyboard activation with Space key', async () => {
      const user = userEvent.setup();
      const item1 = mockItems[0];

      render(<Menu items={mockItems} trigger={<MockTrigger />} open={true} />);

      const menuItem = screen
        .getByText('Item 1')
        .closest('[role="menuitem"]') as HTMLElement;
      menuItem.focus();
      await user.keyboard(' ');

      expect(item1.onClick).toHaveBeenCalled();
    });
  });

  describe('Disabled Items', () => {
    it('applies disabled styling to disabled items', () => {
      render(<Menu items={mockItems} trigger={<MockTrigger />} open={true} />);

      const disabledItem = screen
        .getByText('Disabled Item')
        .closest('[role="menuitem"]');
      expect(disabledItem).toHaveAttribute('aria-disabled', 'true');
      expect(disabledItem).toHaveAttribute('tabindex', '-1');
      expect(disabledItem).toHaveClass('text-gray-400', 'cursor-not-allowed');
    });

    it('prevents click events on disabled items', async () => {
      const user = userEvent.setup();
      const disabledItem = mockItems.find(item => item.disabled)!;

      render(<Menu items={mockItems} trigger={<MockTrigger />} open={true} />);

      const menuItem = screen.getByText('Disabled Item');
      await user.click(menuItem);

      expect(disabledItem.onClick).not.toHaveBeenCalled();
    });

    it('prevents keyboard events on disabled items', async () => {
      const user = userEvent.setup();
      const disabledItem = mockItems.find(item => item.disabled)!;

      render(<Menu items={mockItems} trigger={<MockTrigger />} open={true} />);

      const menuItem = screen.getByText('Disabled Item');
      menuItem.focus();
      await user.keyboard('{Enter}');

      expect(disabledItem.onClick).not.toHaveBeenCalled();
    });
  });

  describe('Destructive Items', () => {
    it('applies destructive styling to destructive items', () => {
      render(<Menu items={mockItems} trigger={<MockTrigger />} open={true} />);

      const destructiveItem = screen
        .getByText('Destructive Item')
        .closest('[role="menuitem"]');
      expect(destructiveItem).toHaveClass('text-red-600', 'hover:text-red-700');
    });
  });

  describe('Submenu Functionality', () => {
    it('shows submenu indicator for items with submenu', () => {
      render(<Menu items={mockItems} trigger={<MockTrigger />} open={true} />);

      const submenuItem = screen
        .getByText('Submenu')
        .closest('[role="menuitem"]');
      expect(submenuItem).toHaveAttribute('aria-haspopup', 'menu');

      // Should have arrow icon
      const arrow = submenuItem?.querySelector('svg');
      expect(arrow).toBeInTheDocument();
    });

    it('opens submenu when submenu item is clicked', async () => {
      const user = userEvent.setup();

      render(<Menu items={mockItems} trigger={<MockTrigger />} open={true} />);

      const submenuItem = screen.getByText('Submenu');
      await user.click(submenuItem);

      expect(screen.getByText('Sub Item 1')).toBeInTheDocument();
      expect(screen.getByText('Sub Item 2')).toBeInTheDocument();
    });

    it('opens submenu with right arrow key', async () => {
      const user = userEvent.setup();

      render(<Menu items={mockItems} trigger={<MockTrigger />} open={true} />);

      const submenuItem = screen
        .getByText('Submenu')
        .closest('[role="menuitem"]') as HTMLElement;
      submenuItem.focus();
      await user.keyboard('{ArrowRight}');

      await waitFor(() => {
        expect(screen.getByText('Sub Item 1')).toBeInTheDocument();
      });
    });

    it('closes submenu with left arrow key', async () => {
      const user = userEvent.setup();

      render(<Menu items={mockItems} trigger={<MockTrigger />} open={true} />);

      const submenuItem = screen.getByText('Submenu');

      // Open submenu
      await user.click(submenuItem);
      expect(screen.getByText('Sub Item 1')).toBeInTheDocument();

      // Close with left arrow
      submenuItem.focus();
      await user.keyboard('{ArrowLeft}');

      await waitFor(() => {
        expect(screen.queryByText('Sub Item 1')).not.toBeInTheDocument();
      });
    });

    it('calls submenu item onClick when clicked', async () => {
      const user = userEvent.setup();
      const submenuItems = mockItems.find(
        item => item.id === 'submenu'
      )!.submenu!;
      const subItem1 = submenuItems[0];

      render(<Menu items={mockItems} trigger={<MockTrigger />} open={true} />);

      // Open submenu
      const submenuItem = screen.getByText('Submenu');
      await user.click(submenuItem);

      // Click sub item
      const subMenuItem = screen.getByText('Sub Item 1');
      await user.click(subMenuItem);

      expect(subItem1.onClick).toHaveBeenCalled();
    });
  });

  describe('Keyboard Navigation', () => {
    it('opens menu with Enter key on trigger', async () => {
      const user = userEvent.setup();

      render(<Menu items={mockItems} trigger={<MockTrigger />} />);

      const trigger = screen.getByTestId('menu-trigger');
      trigger.focus();
      await user.keyboard('{Enter}');

      expect(screen.getByRole('menu')).toBeInTheDocument();
    });

    it('opens menu with Space key on trigger', async () => {
      const user = userEvent.setup();

      render(<Menu items={mockItems} trigger={<MockTrigger />} />);

      const trigger = screen.getByTestId('menu-trigger');
      trigger.focus();
      await user.keyboard(' ');

      expect(screen.getByRole('menu')).toBeInTheDocument();
    });

    it('opens menu with ArrowDown key on trigger and focuses first item', async () => {
      const user = userEvent.setup();

      render(<Menu items={mockItems} trigger={<MockTrigger />} />);

      const trigger = screen.getByTestId('menu-trigger');
      trigger.focus();
      await user.keyboard('{ArrowDown}');

      expect(screen.getByRole('menu')).toBeInTheDocument();

      await waitFor(() => {
        const firstItem = screen
          .getByText('Item 1')
          .closest('[role="menuitem"]');
        expect(firstItem).toHaveFocus();
      });
    });

    it('opens menu with ArrowUp key on trigger and focuses last item', async () => {
      const user = userEvent.setup();

      render(<Menu items={mockItems} trigger={<MockTrigger />} />);

      const trigger = screen.getByTestId('menu-trigger');
      trigger.focus();
      await user.keyboard('{ArrowUp}');

      expect(screen.getByRole('menu')).toBeInTheDocument();

      await waitFor(() => {
        const lastItem = screen
          .getByText('Submenu')
          .closest('[role="menuitem"]');
        expect(lastItem).toHaveFocus();
      });
    });

    it('navigates menu items with arrow keys', async () => {
      const user = userEvent.setup();

      render(<Menu items={mockItems} trigger={<MockTrigger />} open={true} />);

      const item1 = screen
        .getByText('Item 1')
        .closest('[role="menuitem"]') as HTMLElement;
      item1.focus();

      // Arrow down should move to next item
      await user.keyboard('{ArrowDown}');
      const item2 = screen.getByText('Item 2').closest('[role="menuitem"]');
      expect(item2).toHaveFocus();

      // Arrow up should move to previous item
      await user.keyboard('{ArrowUp}');
      expect(item1).toHaveFocus();
    });

    it('navigates to first item with Home key', async () => {
      const user = userEvent.setup();

      render(<Menu items={mockItems} trigger={<MockTrigger />} open={true} />);

      const item2 = screen
        .getByText('Item 2')
        .closest('[role="menuitem"]') as HTMLElement;
      item2.focus();

      await user.keyboard('{Home}');
      const item1 = screen.getByText('Item 1').closest('[role="menuitem"]');
      expect(item1).toHaveFocus();
    });

    it('navigates to last item with End key', async () => {
      const user = userEvent.setup();

      render(<Menu items={mockItems} trigger={<MockTrigger />} open={true} />);

      const item1 = screen
        .getByText('Item 1')
        .closest('[role="menuitem"]') as HTMLElement;
      item1.focus();

      await user.keyboard('{End}');
      const submenuItem = screen
        .getByText('Submenu')
        .closest('[role="menuitem"]');
      expect(submenuItem).toHaveFocus();
    });

    it('skips disabled items during keyboard navigation', async () => {
      const user = userEvent.setup();

      render(<Menu items={mockItems} trigger={<MockTrigger />} open={true} />);

      const destructiveItem = screen
        .getByText('Destructive Item')
        .closest('[role="menuitem"]') as HTMLElement;
      destructiveItem.focus();

      // Arrow down should skip disabled item and go to submenu
      await user.keyboard('{ArrowDown}');
      const submenuItem = screen
        .getByText('Submenu')
        .closest('[role="menuitem"]');
      expect(submenuItem).toHaveFocus();
    });
  });

  describe('Menu Placement', () => {
    it('applies correct placement classes', () => {
      render(
        <Menu
          items={mockItems}
          trigger={<MockTrigger />}
          placement="bottom-end"
          open={true}
        />
      );

      const menu = screen.getByRole('menu');
      expect(menu).toHaveClass('top-full', 'right-0', 'mt-1');
    });

    it('applies custom width when provided', () => {
      render(
        <Menu
          items={mockItems}
          trigger={<MockTrigger />}
          width={300}
          open={true}
        />
      );

      const menu = screen.getByRole('menu');
      expect(menu).toHaveStyle({ width: '300px' });
    });
  });

  describe('Menu Sizes', () => {
    it('applies small size classes', () => {
      render(
        <Menu
          items={mockItems}
          trigger={<MockTrigger />}
          size="sm"
          open={true}
        />
      );

      const menuItem = screen.getByText('Item 1').closest('[role="menuitem"]');
      expect(menuItem).toHaveClass('px-6', 'py-4', 'text-sm');
    });

    it('applies large size classes', () => {
      render(
        <Menu
          items={mockItems}
          trigger={<MockTrigger />}
          size="lg"
          open={true}
        />
      );

      const menuItem = screen.getByText('Item 1').closest('[role="menuitem"]');
      expect(menuItem).toHaveClass('px-10', 'py-6', 'text-base');
    });
  });

  describe('Accessibility', () => {
    it('has proper ARIA attributes', () => {
      render(<Menu items={mockItems} trigger={<MockTrigger />} open={true} />);

      const triggerContainer = screen.getByTestId('menu-trigger').parentElement;
      expect(triggerContainer).toHaveAttribute('aria-haspopup', 'menu');
      expect(triggerContainer).toHaveAttribute('aria-expanded', 'true');

      const menu = screen.getByRole('menu');
      expect(menu).toHaveAttribute('aria-orientation', 'vertical');

      const menuItems = screen.getAllByRole('menuitem');
      expect(menuItems.length).toBeGreaterThan(0);
    });

    it('manages focus correctly', async () => {
      const user = userEvent.setup();

      render(<Menu items={mockItems} trigger={<MockTrigger />} />);

      const trigger = screen.getByTestId('menu-trigger');

      // Focus should return to trigger when menu closes
      await user.click(trigger);
      await user.keyboard('{Escape}');

      await waitFor(() => {
        expect(trigger).toHaveFocus();
      });
    });

    it('should not have accessibility violations', async () => {
      const simpleItems: MenuItem[] = [
        { id: 'item1', label: 'Item 1', onClick: jest.fn() },
        { id: 'item2', label: 'Item 2', onClick: jest.fn() },
      ];

      const { container } = render(
        <Menu
          items={simpleItems}
          trigger={<span>Open Menu</span>}
          open={true}
        />
      );

      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });
  });

  describe('Edge Cases', () => {
    it('handles empty items array', () => {
      render(<Menu items={[]} trigger={<MockTrigger />} open={true} />);

      expect(screen.getByRole('menu')).toBeInTheDocument();
    });

    it('handles items without onClick handlers', async () => {
      const user = userEvent.setup();
      const itemsWithoutHandlers: MenuItem[] = [
        { id: 'test', label: 'Test Item' },
      ];

      render(
        <Menu
          items={itemsWithoutHandlers}
          trigger={<MockTrigger />}
          open={true}
        />
      );

      const menuItem = screen.getByText('Test Item');

      // Should not throw error when clicked
      await user.click(menuItem);
      expect(menuItem).toBeInTheDocument();
    });

    it('handles controlled open state', async () => {
      const user = userEvent.setup();
      const mockOnOpenChange = jest.fn();

      const { rerender } = render(
        <Menu
          items={mockItems}
          trigger={<MockTrigger />}
          open={false}
          onOpenChange={mockOnOpenChange}
        />
      );

      expect(screen.queryByRole('menu')).not.toBeInTheDocument();

      // Clicking trigger should call onOpenChange but not open menu
      const trigger = screen.getByTestId('menu-trigger');
      await user.click(trigger);
      expect(mockOnOpenChange).toHaveBeenCalledWith(true);
      expect(screen.queryByRole('menu')).not.toBeInTheDocument();

      // Rerender with open=true
      rerender(
        <Menu
          items={mockItems}
          trigger={<MockTrigger />}
          open={true}
          onOpenChange={mockOnOpenChange}
        />
      );

      expect(screen.getByRole('menu')).toBeInTheDocument();
    });
  });
});
