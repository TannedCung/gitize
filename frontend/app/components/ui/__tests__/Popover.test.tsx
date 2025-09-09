import React, { useState } from 'react';
import {
  render,
  screen,
  fireEvent,
  waitFor,
  act,
} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe, toHaveNoViolations } from 'jest-axe';
import { Popover } from '../Popover';

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

// Test component for controlled mode
const ControlledPopover: React.FC<{ initialOpen?: boolean }> = ({
  initialOpen = false,
}) => {
  const [open, setOpen] = useState(initialOpen);

  return (
    <Popover
      content={<div>Controlled content</div>}
      open={open}
      onOpenChange={setOpen}
    >
      <button>Controlled Trigger</button>
    </Popover>
  );
};

describe('Popover', () => {
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
        <Popover content="Test popover">
          <button>Trigger</button>
        </Popover>
      );

      expect(
        screen.getByRole('button', { name: 'Trigger' })
      ).toBeInTheDocument();
    });

    it('shows popover on click by default', async () => {
      render(
        <Popover content="Test popover">
          <button>Trigger</button>
        </Popover>
      );

      const trigger = screen.getByRole('button');

      // Click trigger
      fireEvent.click(trigger);

      await waitFor(() => {
        expect(screen.getByRole('dialog')).toBeInTheDocument();
        expect(screen.getByText('Test popover')).toBeInTheDocument();
      });
    });

    it('hides popover on second click', async () => {
      render(
        <Popover content="Test popover">
          <button>Trigger</button>
        </Popover>
      );

      const trigger = screen.getByRole('button');

      // Show popover
      fireEvent.click(trigger);
      await waitFor(() => {
        expect(screen.getByRole('dialog')).toBeInTheDocument();
      });

      // Hide popover
      fireEvent.click(trigger);
      await waitFor(() => {
        expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
      });
    });

    it('shows popover on hover when trigger is hover', async () => {
      render(
        <Popover content="Test popover" trigger="hover" showDelay={0}>
          <button>Trigger</button>
        </Popover>
      );

      const trigger = screen.getByRole('button');

      // Hover over trigger
      fireEvent.mouseEnter(trigger);
      act(() => {
        jest.advanceTimersByTime(0);
      });

      await waitFor(() => {
        expect(screen.getByRole('dialog')).toBeInTheDocument();
      });
    });

    it('shows popover on focus when trigger is focus', async () => {
      render(
        <Popover content="Test popover" trigger="focus" showDelay={0}>
          <button>Trigger</button>
        </Popover>
      );

      const trigger = screen.getByRole('button');

      // Focus trigger
      fireEvent.focus(trigger);
      act(() => {
        jest.advanceTimersByTime(0);
      });

      await waitFor(() => {
        expect(screen.getByRole('dialog')).toBeInTheDocument();
      });
    });
  });

  describe('Controlled Mode', () => {
    it('works in controlled mode', async () => {
      render(<ControlledPopover />);

      const trigger = screen.getByRole('button');

      // Initially closed
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();

      // Click to open
      fireEvent.click(trigger);
      await waitFor(() => {
        expect(screen.getByRole('dialog')).toBeInTheDocument();
      });
    });

    it('starts open when initialOpen is true', async () => {
      render(<ControlledPopover initialOpen />);

      await waitFor(() => {
        expect(screen.getByRole('dialog')).toBeInTheDocument();
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

    it('positions popover at bottom by default', async () => {
      render(
        <Popover content="Test popover">
          <button>Trigger</button>
        </Popover>
      );

      const trigger = screen.getByRole('button');
      fireEvent.click(trigger);

      await waitFor(() => {
        const popover = screen.getByRole('dialog');
        expect(popover).toBeInTheDocument();
        expect(popover).toHaveStyle({ position: 'absolute' });
      });
    });

    it('positions popover at top when specified', async () => {
      render(
        <Popover content="Test popover" position="top">
          <button>Trigger</button>
        </Popover>
      );

      const trigger = screen.getByRole('button');
      fireEvent.click(trigger);

      await waitFor(() => {
        const popover = screen.getByRole('dialog');
        expect(popover).toBeInTheDocument();
      });
    });

    it('positions popover at left when specified', async () => {
      render(
        <Popover content="Test popover" position="left">
          <button>Trigger</button>
        </Popover>
      );

      const trigger = screen.getByRole('button');
      fireEvent.click(trigger);

      await waitFor(() => {
        const popover = screen.getByRole('dialog');
        expect(popover).toBeInTheDocument();
      });
    });

    it('positions popover at right when specified', async () => {
      render(
        <Popover content="Test popover" position="right">
          <button>Trigger</button>
        </Popover>
      );

      const trigger = screen.getByRole('button');
      fireEvent.click(trigger);

      await waitFor(() => {
        const popover = screen.getByRole('dialog');
        expect(popover).toBeInTheDocument();
      });
    });
  });

  describe('Click Outside Behavior', () => {
    it('closes popover when clicking outside by default', async () => {
      render(
        <div>
          <Popover content="Test popover">
            <button>Trigger</button>
          </Popover>
          <div data-testid="outside">Outside element</div>
        </div>
      );

      const trigger = screen.getByRole('button');
      const outside = screen.getByTestId('outside');

      // Open popover
      fireEvent.click(trigger);
      await waitFor(() => {
        expect(screen.getByRole('dialog')).toBeInTheDocument();
      });

      // Click outside
      fireEvent.mouseDown(outside);
      await waitFor(() => {
        expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
      });
    });

    it('does not close when closeOnClickOutside is false', async () => {
      render(
        <div>
          <Popover content="Test popover" closeOnClickOutside={false}>
            <button>Trigger</button>
          </Popover>
          <div data-testid="outside">Outside element</div>
        </div>
      );

      const trigger = screen.getByRole('button');
      const outside = screen.getByTestId('outside');

      // Open popover
      fireEvent.click(trigger);
      await waitFor(() => {
        expect(screen.getByRole('dialog')).toBeInTheDocument();
      });

      // Click outside
      fireEvent.mouseDown(outside);

      // Should still be open
      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 100));
      });
      expect(screen.getByRole('dialog')).toBeInTheDocument();
    });
  });

  describe('Keyboard Interaction', () => {
    it('closes popover on Escape key by default', async () => {
      const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });

      render(
        <Popover content="Test popover">
          <button>Trigger</button>
        </Popover>
      );

      const trigger = screen.getByRole('button');

      // Open popover
      await user.click(trigger);
      await waitFor(() => {
        expect(screen.getByRole('dialog')).toBeInTheDocument();
      });

      // Press Escape
      await user.keyboard('{Escape}');

      await waitFor(() => {
        expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
      });
    });

    it('does not close on Escape when closeOnEscape is false', async () => {
      const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });

      render(
        <Popover content="Test popover" closeOnEscape={false}>
          <button>Trigger</button>
        </Popover>
      );

      const trigger = screen.getByRole('button');

      // Open popover
      await user.click(trigger);
      await waitFor(() => {
        expect(screen.getByRole('dialog')).toBeInTheDocument();
      });

      // Press Escape
      await user.keyboard('{Escape}');

      // Should still be open
      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 100));
      });
      expect(screen.getByRole('dialog')).toBeInTheDocument();
    });

    it('manages focus within popover content', async () => {
      const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });

      render(
        <Popover
          content={
            <div>
              <button data-testid="first-button">First</button>
              <button data-testid="second-button">Second</button>
            </div>
          }
        >
          <button>Trigger</button>
        </Popover>
      );

      const trigger = screen.getByRole('button', { name: 'Trigger' });

      // Open popover
      await user.click(trigger);
      await waitFor(() => {
        expect(screen.getByRole('dialog')).toBeInTheDocument();
      });

      // First focusable element should be focused
      const firstButton = screen.getByTestId('first-button');
      expect(firstButton).toHaveFocus();

      // Tab to next element
      await user.keyboard('{Tab}');
      const secondButton = screen.getByTestId('second-button');
      expect(secondButton).toHaveFocus();

      // Tab should wrap to first element
      await user.keyboard('{Tab}');
      expect(firstButton).toHaveFocus();
    });
  });

  describe('Arrow Display', () => {
    it('shows arrow by default', async () => {
      render(
        <Popover content="Test popover">
          <button>Trigger</button>
        </Popover>
      );

      const trigger = screen.getByRole('button');
      fireEvent.click(trigger);

      await waitFor(() => {
        const popover = screen.getByRole('dialog');
        expect(popover).toBeInTheDocument();
        // Check for arrow element
        const arrow = popover.querySelector('div[class*="rotate-45"]');
        expect(arrow).toBeInTheDocument();
      });
    });

    it('hides arrow when showArrow is false', async () => {
      render(
        <Popover content="Test popover" showArrow={false}>
          <button>Trigger</button>
        </Popover>
      );

      const trigger = screen.getByRole('button');
      fireEvent.click(trigger);

      await waitFor(() => {
        const popover = screen.getByRole('dialog');
        expect(popover).toBeInTheDocument();
        // Check that arrow element is not present
        const arrow = popover.querySelector('div[class*="rotate-45"]');
        expect(arrow).not.toBeInTheDocument();
      });
    });
  });

  describe('Disabled State', () => {
    it('does not show popover when disabled', async () => {
      render(
        <Popover content="Test popover" disabled>
          <button>Trigger</button>
        </Popover>
      );

      const trigger = screen.getByRole('button');
      fireEvent.click(trigger);

      // Wait a bit to ensure popover doesn't appear
      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 100));
      });

      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });
  });

  describe('Hover Trigger Behavior', () => {
    it('keeps popover open when hovering over content', async () => {
      render(
        <Popover
          content="Test popover"
          trigger="hover"
          showDelay={0}
          hideDelay={100}
        >
          <button>Trigger</button>
        </Popover>
      );

      const trigger = screen.getByRole('button');

      // Hover over trigger
      fireEvent.mouseEnter(trigger);
      act(() => {
        jest.advanceTimersByTime(0);
      });

      await waitFor(() => {
        expect(screen.getByRole('dialog')).toBeInTheDocument();
      });

      // Move mouse to popover content
      const popover = screen.getByRole('dialog');
      fireEvent.mouseEnter(popover);

      // Leave trigger
      fireEvent.mouseLeave(trigger);

      // Should still be open because mouse is over popover
      act(() => {
        jest.advanceTimersByTime(50);
      });
      expect(screen.getByRole('dialog')).toBeInTheDocument();
    });
  });

  describe('Delay Configuration', () => {
    it('respects custom show delay for hover trigger', async () => {
      render(
        <Popover content="Test popover" trigger="hover" showDelay={200}>
          <button>Trigger</button>
        </Popover>
      );

      const trigger = screen.getByRole('button');
      fireEvent.mouseEnter(trigger);

      // Should not be visible before delay
      act(() => {
        jest.advanceTimersByTime(100);
      });
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();

      // Should be visible after delay
      act(() => {
        jest.advanceTimersByTime(100);
      });

      await waitFor(() => {
        expect(screen.getByRole('dialog')).toBeInTheDocument();
      });
    });

    it('respects custom hide delay for hover trigger', async () => {
      render(
        <Popover
          content="Test popover"
          trigger="hover"
          showDelay={0}
          hideDelay={200}
        >
          <button>Trigger</button>
        </Popover>
      );

      const trigger = screen.getByRole('button');

      // Show popover
      fireEvent.mouseEnter(trigger);
      act(() => {
        jest.advanceTimersByTime(0);
      });

      await waitFor(() => {
        expect(screen.getByRole('dialog')).toBeInTheDocument();
      });

      // Start hiding
      fireEvent.mouseLeave(trigger);

      // Should still be visible before hide delay
      act(() => {
        jest.advanceTimersByTime(100);
      });
      expect(screen.getByRole('dialog')).toBeInTheDocument();

      // Should be hidden after delay
      act(() => {
        jest.advanceTimersByTime(100);
      });

      await waitFor(() => {
        expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
      });
    });
  });

  describe('Accessibility', () => {
    it('has proper ARIA attributes', async () => {
      render(
        <Popover content="Test popover" data-testid="popover-trigger">
          <button>Trigger</button>
        </Popover>
      );

      const trigger = screen.getByRole('button');
      const triggerWrapper = screen.getByTestId('popover-trigger');

      // Check initial ARIA attributes
      expect(triggerWrapper).toHaveAttribute('aria-expanded', 'false');
      expect(triggerWrapper).toHaveAttribute('aria-haspopup', 'dialog');

      // Open popover
      fireEvent.click(trigger);

      await waitFor(() => {
        expect(screen.getByRole('dialog')).toBeInTheDocument();
        expect(triggerWrapper).toHaveAttribute('aria-expanded', 'true');
      });
    });

    it('passes accessibility tests', async () => {
      const { container } = render(
        <Popover content="Test popover">
          <button>Trigger</button>
        </Popover>
      );

      const trigger = screen.getByRole('button');
      fireEvent.click(trigger);

      await waitFor(() => {
        expect(screen.getByRole('dialog')).toBeInTheDocument();
      });

      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });
  });

  describe('Content Types', () => {
    it('renders string content', async () => {
      render(
        <Popover content="String content">
          <button>Trigger</button>
        </Popover>
      );

      const trigger = screen.getByRole('button');
      fireEvent.click(trigger);

      await waitFor(() => {
        expect(screen.getByText('String content')).toBeInTheDocument();
      });
    });

    it('renders JSX content', async () => {
      render(
        <Popover content={<div data-testid="jsx-content">JSX Content</div>}>
          <button>Trigger</button>
        </Popover>
      );

      const trigger = screen.getByRole('button');
      fireEvent.click(trigger);

      await waitFor(() => {
        expect(screen.getByTestId('jsx-content')).toBeInTheDocument();
      });
    });
  });

  describe('Custom Styling', () => {
    it('applies custom className to trigger', () => {
      render(
        <Popover content="Test popover" className="custom-trigger">
          <button>Trigger</button>
        </Popover>
      );

      const trigger = screen.getByRole('button').parentElement;
      expect(trigger).toHaveClass('custom-trigger');
    });

    it('applies custom contentClassName to popover', async () => {
      render(
        <Popover content="Test popover" contentClassName="custom-popover">
          <button>Trigger</button>
        </Popover>
      );

      const trigger = screen.getByRole('button');
      fireEvent.click(trigger);

      await waitFor(() => {
        const popover = screen.getByRole('dialog');
        expect(popover).toHaveClass('custom-popover');
      });
    });

    it('applies custom offset', async () => {
      render(
        <Popover content="Test popover" offset={20}>
          <button>Trigger</button>
        </Popover>
      );

      const trigger = screen.getByRole('button');
      fireEvent.click(trigger);

      await waitFor(() => {
        const popover = screen.getByRole('dialog');
        expect(popover).toBeInTheDocument();
        // The offset affects positioning, which is handled by the positioning hook
      });
    });
  });
});
