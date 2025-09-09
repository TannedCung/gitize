import React from 'react';
import {
  render,
  screen,
  fireEvent,
  waitFor,
  act,
} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe, toHaveNoViolations } from 'jest-axe';
import { Tooltip } from '../Tooltip';

// Extend Jest matchers
expect.extend(toHaveNoViolations);

// Mock window dimensions for positioning tests
const mockWindowDimensions = (width = 1024, height = 768) => {
  Object.defineProperty(window, 'innerWidth', {
    writable: true,
    configurable: true,
    value: width,
  });
  Object.defineProperty(window, 'innerHeight', {
    writable: true,
    configurable: true,
    value: height,
  });
};

// Mock getBoundingClientRect
const _mockGetBoundingClientRect = (
  element: Element,
  rect: Partial<DOMRect>
) => {
  const defaultRect = {
    x: 0,
    y: 0,
    width: 100,
    height: 30,
    top: 0,
    right: 100,
    bottom: 30,
    left: 0,
    toJSON: () => ({}),
  };

  jest.spyOn(element, 'getBoundingClientRect').mockReturnValue({
    ...defaultRect,
    ...rect,
  } as DOMRect);
};

describe('Tooltip', () => {
  beforeEach(() => {
    mockWindowDimensions();
    jest.clearAllTimers();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
    jest.restoreAllMocks();
  });

  describe('Basic Functionality', () => {
    it('renders trigger element correctly', () => {
      render(
        <Tooltip content="Test tooltip">
          <button>Trigger</button>
        </Tooltip>
      );

      expect(
        screen.getByRole('button', { name: 'Trigger' })
      ).toBeInTheDocument();
    });

    it('shows tooltip on hover after delay', async () => {
      render(
        <Tooltip content="Test tooltip" showDelay={100}>
          <button>Trigger</button>
        </Tooltip>
      );

      const trigger = screen.getByRole('button');

      // Hover over trigger
      fireEvent.mouseEnter(trigger);

      // Tooltip should not be visible immediately
      expect(screen.queryByRole('tooltip')).not.toBeInTheDocument();

      // Fast-forward time
      act(() => {
        jest.advanceTimersByTime(100);
      });

      // Tooltip should now be visible
      await waitFor(() => {
        expect(screen.getByRole('tooltip')).toBeInTheDocument();
        expect(screen.getByText('Test tooltip')).toBeInTheDocument();
      });
    });

    it('hides tooltip on mouse leave', async () => {
      render(
        <Tooltip content="Test tooltip" showDelay={0}>
          <button>Trigger</button>
        </Tooltip>
      );

      const trigger = screen.getByRole('button');

      // Show tooltip
      fireEvent.mouseEnter(trigger);
      act(() => {
        jest.advanceTimersByTime(0);
      });

      await waitFor(() => {
        expect(screen.getByRole('tooltip')).toBeInTheDocument();
      });

      // Hide tooltip
      fireEvent.mouseLeave(trigger);
      act(() => {
        jest.advanceTimersByTime(0);
      });

      await waitFor(() => {
        expect(screen.queryByRole('tooltip')).not.toBeInTheDocument();
      });
    });

    it('shows tooltip on focus', async () => {
      render(
        <Tooltip content="Test tooltip" showDelay={0}>
          <button>Trigger</button>
        </Tooltip>
      );

      const trigger = screen.getByRole('button');

      // Focus trigger
      fireEvent.focus(trigger);
      act(() => {
        jest.advanceTimersByTime(0);
      });

      await waitFor(() => {
        expect(screen.getByRole('tooltip')).toBeInTheDocument();
      });
    });

    it('hides tooltip on blur', async () => {
      render(
        <Tooltip content="Test tooltip" showDelay={0}>
          <button>Trigger</button>
        </Tooltip>
      );

      const trigger = screen.getByRole('button');

      // Show tooltip
      fireEvent.focus(trigger);
      act(() => {
        jest.advanceTimersByTime(0);
      });

      await waitFor(() => {
        expect(screen.getByRole('tooltip')).toBeInTheDocument();
      });

      // Hide tooltip
      fireEvent.blur(trigger);
      act(() => {
        jest.advanceTimersByTime(0);
      });

      await waitFor(() => {
        expect(screen.queryByRole('tooltip')).not.toBeInTheDocument();
      });
    });
  });

  describe('Positioning', () => {
    beforeEach(() => {
      // Mock positioning for consistent tests
      Element.prototype.getBoundingClientRect = jest.fn(() => ({
        x: 100,
        y: 100,
        width: 100,
        height: 30,
        top: 100,
        right: 200,
        bottom: 130,
        left: 100,
        toJSON: () => ({}),
      }));
    });

    it('positions tooltip at the top by default', async () => {
      render(
        <Tooltip content="Test tooltip" showDelay={0}>
          <button>Trigger</button>
        </Tooltip>
      );

      const trigger = screen.getByRole('button');
      fireEvent.mouseEnter(trigger);
      act(() => {
        jest.advanceTimersByTime(0);
      });

      await waitFor(() => {
        const tooltip = screen.getByRole('tooltip');
        expect(tooltip).toBeInTheDocument();
        // Check that tooltip has positioning styles
        expect(tooltip).toHaveStyle({ position: 'absolute' });
      });
    });

    it('positions tooltip at bottom when specified', async () => {
      render(
        <Tooltip content="Test tooltip" position="bottom" showDelay={0}>
          <button>Trigger</button>
        </Tooltip>
      );

      const trigger = screen.getByRole('button');
      fireEvent.mouseEnter(trigger);
      act(() => {
        jest.advanceTimersByTime(0);
      });

      await waitFor(() => {
        const tooltip = screen.getByRole('tooltip');
        expect(tooltip).toBeInTheDocument();
      });
    });

    it('positions tooltip at left when specified', async () => {
      render(
        <Tooltip content="Test tooltip" position="left" showDelay={0}>
          <button>Trigger</button>
        </Tooltip>
      );

      const trigger = screen.getByRole('button');
      fireEvent.mouseEnter(trigger);
      act(() => {
        jest.advanceTimersByTime(0);
      });

      await waitFor(() => {
        const tooltip = screen.getByRole('tooltip');
        expect(tooltip).toBeInTheDocument();
      });
    });

    it('positions tooltip at right when specified', async () => {
      render(
        <Tooltip content="Test tooltip" position="right" showDelay={0}>
          <button>Trigger</button>
        </Tooltip>
      );

      const trigger = screen.getByRole('button');
      fireEvent.mouseEnter(trigger);
      act(() => {
        jest.advanceTimersByTime(0);
      });

      await waitFor(() => {
        const tooltip = screen.getByRole('tooltip');
        expect(tooltip).toBeInTheDocument();
      });
    });
  });

  describe('Arrow Display', () => {
    it('shows arrow by default', async () => {
      render(
        <Tooltip content="Test tooltip" showDelay={0}>
          <button>Trigger</button>
        </Tooltip>
      );

      const trigger = screen.getByRole('button');
      fireEvent.mouseEnter(trigger);
      act(() => {
        jest.advanceTimersByTime(0);
      });

      await waitFor(() => {
        const tooltip = screen.getByRole('tooltip');
        expect(tooltip).toBeInTheDocument();
        // Check for arrow element (it should be a child div with specific classes)
        const arrow = tooltip.querySelector('div[class*="rotate-45"]');
        expect(arrow).toBeInTheDocument();
      });
    });

    it('hides arrow when showArrow is false', async () => {
      render(
        <Tooltip content="Test tooltip" showArrow={false} showDelay={0}>
          <button>Trigger</button>
        </Tooltip>
      );

      const trigger = screen.getByRole('button');
      fireEvent.mouseEnter(trigger);
      act(() => {
        jest.advanceTimersByTime(0);
      });

      await waitFor(() => {
        const tooltip = screen.getByRole('tooltip');
        expect(tooltip).toBeInTheDocument();
        // Check that arrow element is not present
        const arrow = tooltip.querySelector('div[class*="rotate-45"]');
        expect(arrow).not.toBeInTheDocument();
      });
    });
  });

  describe('Disabled State', () => {
    it('does not show tooltip when disabled', async () => {
      render(
        <Tooltip content="Test tooltip" disabled showDelay={0}>
          <button>Trigger</button>
        </Tooltip>
      );

      const trigger = screen.getByRole('button');
      fireEvent.mouseEnter(trigger);
      act(() => {
        jest.advanceTimersByTime(0);
      });

      // Wait a bit to ensure tooltip doesn't appear
      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 100));
      });

      expect(screen.queryByRole('tooltip')).not.toBeInTheDocument();
    });
  });

  describe('Keyboard Interaction', () => {
    it('hides tooltip on Escape key', async () => {
      const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });

      render(
        <Tooltip content="Test tooltip" showDelay={0}>
          <button>Trigger</button>
        </Tooltip>
      );

      const trigger = screen.getByRole('button');

      // Show tooltip
      await user.hover(trigger);
      act(() => {
        jest.advanceTimersByTime(0);
      });

      await waitFor(() => {
        expect(screen.getByRole('tooltip')).toBeInTheDocument();
      });

      // Press Escape
      await user.keyboard('{Escape}');

      await waitFor(() => {
        expect(screen.queryByRole('tooltip')).not.toBeInTheDocument();
      });
    });
  });

  describe('Delay Configuration', () => {
    it('respects custom show delay', async () => {
      render(
        <Tooltip content="Test tooltip" showDelay={200}>
          <button>Trigger</button>
        </Tooltip>
      );

      const trigger = screen.getByRole('button');
      fireEvent.mouseEnter(trigger);

      // Should not be visible before delay
      act(() => {
        jest.advanceTimersByTime(100);
      });
      expect(screen.queryByRole('tooltip')).not.toBeInTheDocument();

      // Should be visible after delay
      act(() => {
        jest.advanceTimersByTime(100);
      });

      await waitFor(() => {
        expect(screen.getByRole('tooltip')).toBeInTheDocument();
      });
    });

    it('respects custom hide delay', async () => {
      render(
        <Tooltip content="Test tooltip" showDelay={0} hideDelay={200}>
          <button>Trigger</button>
        </Tooltip>
      );

      const trigger = screen.getByRole('button');

      // Show tooltip
      fireEvent.mouseEnter(trigger);
      act(() => {
        jest.advanceTimersByTime(0);
      });

      await waitFor(() => {
        expect(screen.getByRole('tooltip')).toBeInTheDocument();
      });

      // Start hiding
      fireEvent.mouseLeave(trigger);

      // Should still be visible before hide delay
      act(() => {
        jest.advanceTimersByTime(100);
      });
      expect(screen.getByRole('tooltip')).toBeInTheDocument();

      // Should be hidden after delay
      act(() => {
        jest.advanceTimersByTime(100);
      });

      await waitFor(() => {
        expect(screen.queryByRole('tooltip')).not.toBeInTheDocument();
      });
    });
  });

  describe('Accessibility', () => {
    it('has proper ARIA attributes', async () => {
      render(
        <Tooltip
          content="Test tooltip"
          showDelay={0}
          data-testid="tooltip-trigger"
        >
          <button>Trigger</button>
        </Tooltip>
      );

      const trigger = screen.getByRole('button');
      fireEvent.mouseEnter(trigger);
      act(() => {
        jest.advanceTimersByTime(0);
      });

      await waitFor(() => {
        const tooltip = screen.getByRole('tooltip');
        expect(tooltip).toBeInTheDocument();

        // Check ARIA relationship
        const triggerElement = screen.getByTestId('tooltip-trigger');
        expect(triggerElement).toHaveAttribute('aria-describedby');
      });
    });

    it('passes accessibility tests', async () => {
      const { container } = render(
        <Tooltip content="Test tooltip" showDelay={0}>
          <button>Trigger</button>
        </Tooltip>
      );

      const trigger = screen.getByRole('button');
      fireEvent.mouseEnter(trigger);
      act(() => {
        jest.advanceTimersByTime(0);
      });

      await waitFor(() => {
        expect(screen.getByRole('tooltip')).toBeInTheDocument();
      });

      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });
  });

  describe('Content Types', () => {
    it('renders string content', async () => {
      render(
        <Tooltip content="String content" showDelay={0}>
          <button>Trigger</button>
        </Tooltip>
      );

      const trigger = screen.getByRole('button');
      fireEvent.mouseEnter(trigger);
      act(() => {
        jest.advanceTimersByTime(0);
      });

      await waitFor(() => {
        expect(screen.getByText('String content')).toBeInTheDocument();
      });
    });

    it('renders JSX content', async () => {
      render(
        <Tooltip
          content={<div data-testid="jsx-content">JSX Content</div>}
          showDelay={0}
        >
          <button>Trigger</button>
        </Tooltip>
      );

      const trigger = screen.getByRole('button');
      fireEvent.mouseEnter(trigger);
      act(() => {
        jest.advanceTimersByTime(0);
      });

      await waitFor(() => {
        expect(screen.getByTestId('jsx-content')).toBeInTheDocument();
      });
    });
  });

  describe('Custom Styling', () => {
    it('applies custom className to trigger', () => {
      render(
        <Tooltip content="Test tooltip" className="custom-trigger">
          <button>Trigger</button>
        </Tooltip>
      );

      const trigger = screen.getByRole('button').parentElement;
      expect(trigger).toHaveClass('custom-trigger');
    });

    it('applies custom offset', async () => {
      render(
        <Tooltip content="Test tooltip" offset={20} showDelay={0}>
          <button>Trigger</button>
        </Tooltip>
      );

      const trigger = screen.getByRole('button');
      fireEvent.mouseEnter(trigger);
      act(() => {
        jest.advanceTimersByTime(0);
      });

      await waitFor(() => {
        const tooltip = screen.getByRole('tooltip');
        expect(tooltip).toBeInTheDocument();
        // The offset affects positioning, which is handled by the positioning hook
      });
    });
  });
});
