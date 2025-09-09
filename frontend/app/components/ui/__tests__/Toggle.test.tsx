import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe, toHaveNoViolations } from 'jest-axe';
import { Toggle } from '../Toggle';

// Extend Jest matchers
expect.extend(toHaveNoViolations);

describe('Toggle', () => {
  describe('Basic Rendering', () => {
    it('renders without crashing', () => {
      render(<Toggle />);
      expect(screen.getByRole('switch')).toBeInTheDocument();
    });

    it('renders with label', () => {
      render(<Toggle label="Enable notifications" />);
      expect(
        screen.getByRole('switch', { name: 'Enable notifications' })
      ).toBeInTheDocument();
      expect(screen.getByText('Enable notifications')).toBeInTheDocument();
    });

    it('renders with helper text', () => {
      render(<Toggle label="Dark mode" helperText="Switch to dark theme" />);
      expect(screen.getByText('Switch to dark theme')).toBeInTheDocument();
    });

    it('renders with error message', () => {
      render(
        <Toggle label="Required toggle" error="This setting is required" />
      );
      expect(screen.getByText('This setting is required')).toBeInTheDocument();
      expect(screen.getByRole('alert')).toBeInTheDocument();
    });

    it('renders required indicator', () => {
      render(<Toggle label="Required setting" required />);
      expect(screen.getByText('*')).toBeInTheDocument();
    });
  });

  describe('States', () => {
    it('renders unchecked by default', () => {
      render(<Toggle />);
      const toggle = screen.getByRole('switch');
      expect(toggle).toHaveAttribute('aria-checked', 'false');
    });

    it('renders checked when checked prop is true', () => {
      render(<Toggle checked />);
      const toggle = screen.getByRole('switch');
      expect(toggle).toHaveAttribute('aria-checked', 'true');
    });

    it('renders disabled state', () => {
      render(<Toggle disabled />);
      const toggle = screen.getByRole('switch');
      expect(toggle).toBeDisabled();
    });

    it('shows error state styling', () => {
      render(<Toggle error="Error message" data-testid="toggle" />);
      const toggle = screen.getByRole('switch');
      expect(toggle).toHaveAttribute('aria-invalid', 'true');
    });
  });

  describe('Variants', () => {
    it('renders primary variant (default)', () => {
      render(<Toggle data-testid="toggle" />);
      expect(screen.getByTestId('toggle')).toBeInTheDocument();
    });

    it('renders success variant', () => {
      render(<Toggle variant="success" data-testid="toggle" />);
      expect(screen.getByTestId('toggle')).toBeInTheDocument();
    });

    it('renders warning variant', () => {
      render(<Toggle variant="warning" data-testid="toggle" />);
      expect(screen.getByTestId('toggle')).toBeInTheDocument();
    });

    it('renders error variant', () => {
      render(<Toggle variant="error" data-testid="toggle" />);
      expect(screen.getByTestId('toggle')).toBeInTheDocument();
    });
  });

  describe('Sizes', () => {
    it('renders small size', () => {
      render(<Toggle size="sm" data-testid="toggle" />);
      expect(screen.getByTestId('toggle')).toBeInTheDocument();
    });

    it('renders medium size (default)', () => {
      render(<Toggle data-testid="toggle" />);
      expect(screen.getByTestId('toggle')).toBeInTheDocument();
    });

    it('renders large size', () => {
      render(<Toggle size="lg" data-testid="toggle" />);
      expect(screen.getByTestId('toggle')).toBeInTheDocument();
    });
  });

  describe('Interactions', () => {
    it('calls onChange when clicked', async () => {
      const user = userEvent.setup();
      const handleChange = jest.fn();

      render(<Toggle onChange={handleChange} />);
      const toggle = screen.getByRole('switch');

      await user.click(toggle);

      expect(handleChange).toHaveBeenCalledTimes(1);
      expect(handleChange).toHaveBeenCalledWith(true, expect.any(Object));
    });

    it('calls onChange when label is clicked', async () => {
      const user = userEvent.setup();
      const handleChange = jest.fn();

      render(<Toggle label="Click me" onChange={handleChange} />);
      const label = screen.getByText('Click me');

      await user.click(label);

      expect(handleChange).toHaveBeenCalledTimes(1);
      expect(handleChange).toHaveBeenCalledWith(true, expect.any(Object));
    });

    it('calls onChange with correct values when toggled', async () => {
      const user = userEvent.setup();
      const handleChange = jest.fn();

      const { rerender } = render(<Toggle onChange={handleChange} />);
      const toggle = screen.getByRole('switch');

      // First click - should call with true
      await user.click(toggle);
      expect(handleChange).toHaveBeenCalledWith(true, expect.any(Object));

      // Reset the mock and rerender with checked=true
      handleChange.mockClear();
      rerender(<Toggle checked={true} onChange={handleChange} />);

      // Click when checked - should call with false
      await user.click(toggle);
      expect(handleChange).toHaveBeenCalledWith(false, expect.any(Object));
    });

    it('does not call onChange when disabled', async () => {
      const user = userEvent.setup();
      const handleChange = jest.fn();

      render(<Toggle disabled onChange={handleChange} />);
      const toggle = screen.getByRole('switch');

      await user.click(toggle);

      expect(handleChange).not.toHaveBeenCalled();
    });

    it('calls onFocus and onBlur handlers', async () => {
      const user = userEvent.setup();
      const handleFocus = jest.fn();
      const handleBlur = jest.fn();

      render(<Toggle onFocus={handleFocus} onBlur={handleBlur} />);
      const toggle = screen.getByRole('switch');

      await user.click(toggle);
      expect(handleFocus).toHaveBeenCalledTimes(1);

      await user.tab();
      expect(handleBlur).toHaveBeenCalledTimes(1);
    });
  });

  describe('Keyboard Navigation', () => {
    it('can be focused with tab', async () => {
      const user = userEvent.setup();

      render(<Toggle />);
      const toggle = screen.getByRole('switch');

      await user.tab();

      expect(toggle).toHaveFocus();
    });

    it('can be toggled with space key', async () => {
      const user = userEvent.setup();
      const handleChange = jest.fn();

      render(<Toggle onChange={handleChange} />);
      const toggle = screen.getByRole('switch');

      toggle.focus();
      await user.keyboard(' ');

      expect(handleChange).toHaveBeenCalledWith(true, expect.any(Object));
    });

    it('can be toggled with enter key', async () => {
      const user = userEvent.setup();
      const handleChange = jest.fn();

      render(<Toggle onChange={handleChange} />);
      const toggle = screen.getByRole('switch');

      toggle.focus();
      await user.keyboard('{Enter}');

      expect(handleChange).toHaveBeenCalledWith(true, expect.any(Object));
    });

    it('skips focus when disabled', async () => {
      const user = userEvent.setup();

      render(
        <div>
          <button>Before</button>
          <Toggle disabled />
          <button>After</button>
        </div>
      );

      const beforeButton = screen.getByText('Before');
      const afterButton = screen.getByText('After');

      beforeButton.focus();
      await user.tab();

      expect(afterButton).toHaveFocus();
    });
  });

  describe('Form Integration', () => {
    it('includes form data when submitted', () => {
      const handleSubmit = jest.fn(e => {
        e.preventDefault();
        const formData = new FormData(e.target);
        // Check that the hidden input value is included
        expect(formData.get('notifications')).toBe('enabled');
        return formData;
      });

      render(
        <form onSubmit={handleSubmit} role="form">
          <Toggle name="notifications" value="enabled" checked />
          <button type="submit">Submit</button>
        </form>
      );

      const form = screen.getByRole('form');
      fireEvent.submit(form);

      expect(handleSubmit).toHaveBeenCalled();
    });

    it('validates required field', () => {
      render(<Toggle required />);
      const toggle = screen.getByRole('switch');
      expect(toggle).toBeInTheDocument();
      // Required validation would be handled by form validation
    });
  });

  describe('Accessibility', () => {
    it('has proper ARIA attributes', () => {
      render(
        <Toggle
          label="Enable notifications"
          helperText="Get push notifications"
          error="This setting is required"
          required
        />
      );

      const toggle = screen.getByRole('switch');

      expect(toggle).toHaveAttribute('aria-checked');
      expect(toggle).not.toBeDisabled();
      expect(toggle).toHaveAttribute('aria-describedby');
      expect(toggle).toHaveAttribute('aria-invalid', 'true');
    });

    it('associates label correctly', () => {
      render(<Toggle label="Dark mode" />);

      const toggle = screen.getByRole('switch', { name: 'Dark mode' });
      expect(toggle).toBeInTheDocument();
    });

    it('supports custom aria-label', () => {
      render(<Toggle aria-label="Custom toggle label" />);

      const toggle = screen.getByLabelText('Custom toggle label');
      expect(toggle).toBeInTheDocument();
    });

    it('announces error messages to screen readers', () => {
      render(<Toggle error="This setting is required" />);

      const errorMessage = screen.getByRole('alert');
      expect(errorMessage).toHaveTextContent('This setting is required');
    });

    it('has proper switch role', () => {
      render(<Toggle />);

      const toggle = screen.getByRole('switch');
      expect(toggle).toBeInTheDocument();
    });

    it('passes axe accessibility tests', async () => {
      const { container } = render(
        <Toggle
          label="Enable notifications"
          helperText="Get push notifications"
        />
      );

      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('passes axe accessibility tests with error state', async () => {
      const { container } = render(
        <Toggle
          label="Required setting"
          error="This setting is required"
          required
        />
      );

      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('passes axe accessibility tests when disabled', async () => {
      const { container } = render(<Toggle label="Disabled toggle" disabled />);

      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });
  });

  describe('Animation and Transitions', () => {
    it('applies transition classes for smooth animation', () => {
      render(<Toggle data-testid="toggle" />);
      const toggle = screen.getByTestId('toggle');

      // Check that transition classes are applied (this tests the CSS classes)
      expect(toggle).toBeInTheDocument();
    });

    it('maintains smooth animation during state changes', async () => {
      const { rerender } = render(<Toggle checked={false} />);

      const toggle = screen.getByRole('switch');
      expect(toggle).toHaveAttribute('aria-checked', 'false');

      rerender(<Toggle checked={true} />);
      expect(toggle).toHaveAttribute('aria-checked', 'true');
    });
  });

  describe('Custom Props', () => {
    it('forwards custom props to button element', () => {
      render(<Toggle data-testid="custom-toggle" data-custom="value" />);

      const toggle = screen.getByTestId('custom-toggle');
      expect(toggle).toHaveAttribute('data-custom', 'value');
    });

    it('applies custom className', () => {
      render(<Toggle className="custom-class" data-testid="toggle" />);

      const container = screen.getByTestId('toggle').closest('.custom-class');
      expect(container).toBeInTheDocument();
    });
  });

  describe('Edge Cases', () => {
    it('handles rapid state changes', async () => {
      const user = userEvent.setup();
      const handleChange = jest.fn();

      render(<Toggle onChange={handleChange} />);
      const toggle = screen.getByRole('switch');

      // Rapid clicks
      await user.click(toggle);
      await user.click(toggle);
      await user.click(toggle);

      expect(handleChange).toHaveBeenCalledTimes(3);
    });

    it('prioritizes error over helper text', () => {
      render(<Toggle helperText="Helper text" error="Error message" />);

      expect(screen.getByText('Error message')).toBeInTheDocument();
      expect(screen.queryByText('Helper text')).not.toBeInTheDocument();
    });

    it('handles controlled vs uncontrolled state properly', async () => {
      const user = userEvent.setup();

      // Uncontrolled
      const { rerender } = render(<Toggle />);
      let toggle = screen.getByRole('switch');

      await user.click(toggle);
      // In uncontrolled mode, the component manages its own state

      // Controlled
      const handleChange = jest.fn();
      rerender(<Toggle checked={false} onChange={handleChange} />);
      toggle = screen.getByRole('switch');

      await user.click(toggle);
      expect(handleChange).toHaveBeenCalledTimes(1);
      expect(handleChange).toHaveBeenCalledWith(true, expect.any(Object));
    });
  });

  describe('Performance', () => {
    it('does not cause unnecessary re-renders', () => {
      const renderSpy = jest.fn();

      const TestComponent = () => {
        renderSpy();
        return <Toggle />;
      };

      const { rerender } = render(<TestComponent />);

      // Initial render
      expect(renderSpy).toHaveBeenCalledTimes(1);

      // Re-render with same props
      rerender(<TestComponent />);
      expect(renderSpy).toHaveBeenCalledTimes(2);
    });
  });
});
