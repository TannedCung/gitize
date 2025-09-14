import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe, toHaveNoViolations } from 'jest-axe';
import { TabBar, TabItem } from '../TabBar';

expect.extend(toHaveNoViolations);

// Mock tab items
const mockTabs: TabItem[] = [
  {
    id: 'tab1',
    label: 'Tab 1',
    active: true,
    icon: <span data-testid="tab1-icon">📄</span>,
    content: <div data-testid="tab1-content">Content for Tab 1</div>,
  },
  {
    id: 'tab2',
    label: 'Tab 2',
    icon: <span data-testid="tab2-icon">📊</span>,
    badge: <span data-testid="tab2-badge">5</span>,
    content: <div data-testid="tab2-content">Content for Tab 2</div>,
  },
  {
    id: 'tab3',
    label: 'Tab 3',
    content: <div data-testid="tab3-content">Content for Tab 3</div>,
  },
  {
    id: 'tab4',
    label: 'Disabled Tab',
    disabled: true,
    content: <div data-testid="tab4-content">Content for Tab 4</div>,
  },
];

describe('TabBar', () => {
  const mockOnTabChange = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Basic Rendering', () => {
    it('renders tab bar with tabs', () => {
      render(
        <TabBar
          tabs={mockTabs}
          onTabChange={mockOnTabChange}
          data-testid="tab-bar"
        />
      );

      expect(screen.getByTestId('tab-bar')).toBeInTheDocument();
      expect(screen.getByText('Tab 1')).toBeInTheDocument();
      expect(screen.getByText('Tab 2')).toBeInTheDocument();
      expect(screen.getByText('Tab 3')).toBeInTheDocument();
      expect(screen.getByText('Disabled Tab')).toBeInTheDocument();
    });

    it('renders icons and badges correctly', () => {
      render(<TabBar tabs={mockTabs} onTabChange={mockOnTabChange} />);

      expect(screen.getByTestId('tab1-icon')).toBeInTheDocument();
      expect(screen.getByTestId('tab2-icon')).toBeInTheDocument();
      expect(screen.getByTestId('tab2-badge')).toBeInTheDocument();
    });

    it('renders tab content when showContent is true', () => {
      render(
        <TabBar
          tabs={mockTabs}
          showContent={true}
          onTabChange={mockOnTabChange}
        />
      );

      expect(screen.getByTestId('tab1-content')).toBeInTheDocument();
      expect(screen.queryByTestId('tab2-content')).not.toBeInTheDocument();
    });

    it('does not render tab content when showContent is false', () => {
      render(
        <TabBar
          tabs={mockTabs}
          showContent={false}
          onTabChange={mockOnTabChange}
        />
      );

      expect(screen.queryByTestId('tab1-content')).not.toBeInTheDocument();
    });
  });

  describe('Tab Variants', () => {
    it('renders default variant correctly', () => {
      render(
        <TabBar
          tabs={mockTabs}
          variant="default"
          onTabChange={mockOnTabChange}
        />
      );

      const tabList = screen.getByRole('tablist');
      expect(tabList).toHaveClass('flex', 'space-x-8');

      const activeTab = screen.getByText('Tab 1').closest('button');
      expect(activeTab).toHaveClass('text-gray-900', 'font-semibold');
    });

    it('renders pills variant correctly', () => {
      render(
        <TabBar tabs={mockTabs} variant="pills" onTabChange={mockOnTabChange} />
      );

      const tabList = screen.getByRole('tablist');
      expect(tabList).toHaveClass('bg-gray-50/50', 'p-3', 'space-x-2');

      const activeTab = screen.getByText('Tab 1').closest('button');
      expect(activeTab).toHaveClass(
        'bg-gray-50',
        'text-gray-900',
        'font-semibold'
      );
    });

    it('renders underline variant correctly', () => {
      render(
        <TabBar
          tabs={mockTabs}
          variant="underline"
          onTabChange={mockOnTabChange}
        />
      );

      const tabList = screen.getByRole('tablist');
      expect(tabList).toHaveClass('flex', 'space-x-8');

      const activeTab = screen.getByText('Tab 1').closest('button');
      expect(activeTab).toHaveClass('text-gray-900', 'font-semibold');
    });
  });

  describe('Tab Sizes', () => {
    it('renders small size correctly', () => {
      render(
        <TabBar tabs={mockTabs} size="sm" onTabChange={mockOnTabChange} />
      );

      const tab = screen.getByText('Tab 1').closest('button');
      expect(tab).toHaveClass('px-6', 'py-4', 'text-sm');
    });

    it('renders medium size correctly', () => {
      render(
        <TabBar tabs={mockTabs} size="md" onTabChange={mockOnTabChange} />
      );

      const tab = screen.getByText('Tab 1').closest('button');
      expect(tab).toHaveClass('px-8', 'py-5', 'text-sm');
    });

    it('renders large size correctly', () => {
      render(
        <TabBar tabs={mockTabs} size="lg" onTabChange={mockOnTabChange} />
      );

      const tab = screen.getByText('Tab 1').closest('button');
      expect(tab).toHaveClass('px-10', 'py-6', 'text-base');
    });
  });

  describe('Active States', () => {
    it('applies active styling to active tab', () => {
      render(<TabBar tabs={mockTabs} onTabChange={mockOnTabChange} />);

      const activeTab = screen.getByText('Tab 1').closest('button');
      expect(activeTab).toHaveAttribute('aria-selected', 'true');
      expect(activeTab).toHaveAttribute('tabindex', '0');
    });

    it('does not apply active styling to inactive tabs', () => {
      render(<TabBar tabs={mockTabs} onTabChange={mockOnTabChange} />);

      const inactiveTab = screen.getByText('Tab 2').closest('button');
      expect(inactiveTab).toHaveAttribute('aria-selected', 'false');
      expect(inactiveTab).toHaveAttribute('tabindex', '-1');
    });

    it('uses defaultActiveTab when no tab is marked active', () => {
      const tabsWithoutActive = mockTabs.map(tab => ({
        ...tab,
        active: false,
      }));

      render(
        <TabBar
          tabs={tabsWithoutActive}
          defaultActiveTab="tab2"
          showContent={true}
          onTabChange={mockOnTabChange}
        />
      );

      expect(screen.getByTestId('tab2-content')).toBeInTheDocument();
    });

    it('uses controlled activeTab prop', () => {
      render(
        <TabBar
          tabs={mockTabs}
          activeTab="tab3"
          showContent={true}
          onTabChange={mockOnTabChange}
        />
      );

      expect(screen.getByTestId('tab3-content')).toBeInTheDocument();
    });
  });

  describe('Disabled States', () => {
    it('applies disabled styling and attributes to disabled tabs', () => {
      render(<TabBar tabs={mockTabs} onTabChange={mockOnTabChange} />);

      const disabledTab = screen.getByText('Disabled Tab').closest('button');
      expect(disabledTab).toHaveAttribute('aria-disabled', 'true');
      expect(disabledTab).toHaveAttribute('disabled');
      expect(disabledTab).toHaveClass('cursor-not-allowed', 'opacity-50');
    });

    it('prevents click events on disabled tabs', async () => {
      const user = userEvent.setup();

      render(<TabBar tabs={mockTabs} onTabChange={mockOnTabChange} />);

      const disabledTab = screen.getByText('Disabled Tab').closest('button');
      await user.click(disabledTab!);

      expect(mockOnTabChange).not.toHaveBeenCalled();
    });
  });

  describe('Interaction Handling', () => {
    it('calls onTabChange when tab is clicked', async () => {
      const user = userEvent.setup();

      render(<TabBar tabs={mockTabs} onTabChange={mockOnTabChange} />);

      const tab2 = screen.getByText('Tab 2');
      await user.click(tab2);

      expect(mockOnTabChange).toHaveBeenCalledWith(
        expect.objectContaining({
          id: 'tab2',
          label: 'Tab 2',
        })
      );
    });

    it('updates content when tab is changed', async () => {
      const user = userEvent.setup();

      render(
        <TabBar
          tabs={mockTabs}
          showContent={true}
          onTabChange={mockOnTabChange}
        />
      );

      // Initially shows tab1 content
      expect(screen.getByTestId('tab1-content')).toBeInTheDocument();
      expect(screen.queryByTestId('tab2-content')).not.toBeInTheDocument();

      // Click tab2
      const tab2 = screen.getByText('Tab 2');
      await user.click(tab2);

      // Should now show tab2 content
      expect(screen.queryByTestId('tab1-content')).not.toBeInTheDocument();
      expect(screen.getByTestId('tab2-content')).toBeInTheDocument();
    });

    it('handles keyboard navigation with Enter key', async () => {
      const user = userEvent.setup();

      render(<TabBar tabs={mockTabs} onTabChange={mockOnTabChange} />);

      const tab2Button = screen.getByText('Tab 2').closest('button');
      if (tab2Button) {
        tab2Button.focus();
        await user.keyboard('{Enter}');

        expect(mockOnTabChange).toHaveBeenCalledWith(
          expect.objectContaining({
            id: 'tab2',
            label: 'Tab 2',
          })
        );
      }
    });

    it('handles keyboard navigation with Space key', async () => {
      const user = userEvent.setup();

      render(<TabBar tabs={mockTabs} onTabChange={mockOnTabChange} />);

      const tab2Button = screen.getByText('Tab 2').closest('button');
      if (tab2Button) {
        tab2Button.focus();
        await user.keyboard(' ');

        expect(mockOnTabChange).toHaveBeenCalledWith(
          expect.objectContaining({
            id: 'tab2',
            label: 'Tab 2',
          })
        );
      }
    });
  });

  describe('Keyboard Navigation', () => {
    it('navigates tabs with arrow keys', async () => {
      const user = userEvent.setup();

      render(
        <TabBar
          tabs={mockTabs}
          showContent={true}
          onTabChange={mockOnTabChange}
        />
      );

      const tab1Button = screen.getByText('Tab 1').closest('button');
      if (tab1Button) {
        tab1Button.focus();

        // Arrow right should move to next tab
        await user.keyboard('{ArrowRight}');
        expect(mockOnTabChange).toHaveBeenCalledWith(
          expect.objectContaining({ id: 'tab2' })
        );
      }

      // Arrow left should move to previous tab
      await user.keyboard('{ArrowLeft}');
      expect(mockOnTabChange).toHaveBeenCalledWith(
        expect.objectContaining({ id: 'tab1' })
      );
    });

    it('wraps around when navigating with arrow keys', async () => {
      const user = userEvent.setup();

      render(<TabBar tabs={mockTabs} onTabChange={mockOnTabChange} />);

      const tab1Button = screen.getByText('Tab 1').closest('button');
      if (tab1Button) {
        tab1Button.focus();

        // Arrow left from first tab should go to last enabled tab
        await user.keyboard('{ArrowLeft}');
        expect(mockOnTabChange).toHaveBeenCalledWith(
          expect.objectContaining({ id: 'tab3' })
        );
      }
    });

    it('skips disabled tabs during keyboard navigation', async () => {
      const user = userEvent.setup();

      render(
        <TabBar
          tabs={mockTabs}
          activeTab="tab3"
          onTabChange={mockOnTabChange}
        />
      );

      const tab3Button = screen.getByText('Tab 3').closest('button');
      if (tab3Button) {
        tab3Button.focus();

        // Arrow right from tab3 should skip disabled tab4 and wrap to tab1
        await user.keyboard('{ArrowRight}');
        expect(mockOnTabChange).toHaveBeenCalledWith(
          expect.objectContaining({ id: 'tab1' })
        );
      }
    });

    it('navigates to first tab with Home key', async () => {
      const user = userEvent.setup();

      render(
        <TabBar
          tabs={mockTabs}
          activeTab="tab3"
          onTabChange={mockOnTabChange}
        />
      );

      const tab3Button = screen.getByText('Tab 3').closest('button');
      if (tab3Button) {
        tab3Button.focus();

        await user.keyboard('{Home}');
        expect(mockOnTabChange).toHaveBeenCalledWith(
          expect.objectContaining({ id: 'tab1' })
        );
      }
    });

    it('navigates to last enabled tab with End key', async () => {
      const user = userEvent.setup();

      render(<TabBar tabs={mockTabs} onTabChange={mockOnTabChange} />);

      const tab1Button = screen.getByText('Tab 1').closest('button');
      if (tab1Button) {
        tab1Button.focus();

        await user.keyboard('{End}');
        expect(mockOnTabChange).toHaveBeenCalledWith(
          expect.objectContaining({ id: 'tab3' })
        );
      }
    });
  });

  describe('Full Width', () => {
    it('applies full width styling when fullWidth is true', () => {
      render(
        <TabBar
          tabs={mockTabs}
          fullWidth={true}
          onTabChange={mockOnTabChange}
        />
      );

      const tabs = screen.getAllByRole('tab');
      tabs.forEach(tab => {
        expect(tab).toHaveClass('flex-1');
      });
    });

    it('does not apply full width styling when fullWidth is false', () => {
      render(
        <TabBar
          tabs={mockTabs}
          fullWidth={false}
          onTabChange={mockOnTabChange}
        />
      );

      const tabs = screen.getAllByRole('tab');
      tabs.forEach(tab => {
        expect(tab).not.toHaveClass('flex-1');
      });
    });
  });

  describe('Scrollable', () => {
    it('applies scrollable styling when scrollable is true', () => {
      render(
        <TabBar
          tabs={mockTabs}
          scrollable={true}
          onTabChange={mockOnTabChange}
        />
      );

      const tabList = screen.getByRole('tablist');
      expect(tabList).toHaveClass('overflow-x-auto');
    });
  });

  describe('Custom Props', () => {
    it('accepts custom className', () => {
      render(
        <TabBar
          tabs={mockTabs}
          className="custom-tab-class"
          onTabChange={mockOnTabChange}
          data-testid="tab-bar"
        />
      );

      expect(screen.getByTestId('tab-bar')).toHaveClass('custom-tab-class');
    });

    it('accepts custom aria-label', () => {
      render(
        <TabBar
          tabs={mockTabs}
          aria-label="Custom tab navigation"
          onTabChange={mockOnTabChange}
        />
      );

      expect(
        screen.getByLabelText('Custom tab navigation')
      ).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('has proper ARIA attributes', () => {
      render(
        <TabBar
          tabs={mockTabs}
          showContent={true}
          onTabChange={mockOnTabChange}
        />
      );

      const tabList = screen.getByRole('tablist');
      expect(tabList).toHaveAttribute('aria-label', 'Tab navigation');

      const tabs = screen.getAllByRole('tab');
      tabs.forEach((tab, index) => {
        const tabId = mockTabs[index].id;
        expect(tab).toHaveAttribute('id', `tab-${tabId}`);
        expect(tab).toHaveAttribute('aria-controls', `tabpanel-${tabId}`);
      });

      const tabPanel = screen.getByRole('tabpanel');
      expect(tabPanel).toHaveAttribute('id', 'tabpanel-tab1');
      expect(tabPanel).toHaveAttribute('aria-labelledby', 'tab-tab1');
    });

    it('has proper focus management', async () => {
      const user = userEvent.setup();

      render(<TabBar tabs={mockTabs} onTabChange={mockOnTabChange} />);

      const tab1Button = screen.getByText('Tab 1').closest('button');
      const tab2Button = screen.getByText('Tab 2').closest('button');

      // Only active tab should be focusable initially
      expect(tab1Button).toHaveAttribute('tabindex', '0');
      expect(tab2Button).toHaveAttribute('tabindex', '-1');

      // After clicking tab2, it should become focusable
      if (tab2Button) {
        await user.click(tab2Button);
        expect(tab1Button).toHaveAttribute('tabindex', '-1');
        expect(tab2Button).toHaveAttribute('tabindex', '0');
      }
    });

    it('should not have accessibility violations', async () => {
      const { container } = render(
        <TabBar
          tabs={mockTabs}
          showContent={true}
          onTabChange={mockOnTabChange}
        />
      );

      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });
  });

  describe('Edge Cases', () => {
    it('handles empty tabs array', () => {
      render(<TabBar tabs={[]} onTabChange={mockOnTabChange} />);

      expect(screen.getByRole('tablist')).toBeInTheDocument();
    });

    it('handles tabs without content', () => {
      const tabsWithoutContent = mockTabs.map(tab => ({
        ...tab,
        content: undefined,
      }));

      render(
        <TabBar
          tabs={tabsWithoutContent}
          showContent={true}
          onTabChange={mockOnTabChange}
        />
      );

      expect(screen.queryByRole('tabpanel')).not.toBeInTheDocument();
    });

    it('handles all tabs being disabled', () => {
      const allDisabledTabs = mockTabs.map(tab => ({ ...tab, disabled: true }));

      render(<TabBar tabs={allDisabledTabs} onTabChange={mockOnTabChange} />);

      const tabs = screen.getAllByRole('tab');
      tabs.forEach(tab => {
        expect(tab).toHaveAttribute('disabled');
      });
    });
  });
});
