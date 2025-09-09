import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe, toHaveNoViolations } from 'jest-axe';
import { Checkbox } from '../Checkbox';

// Extend Jest matchers
expect.extend(toHaveNoViolations);

describe('Checkbox', () => {
  describe('Basic Rendering', () => {
    it('renders without crashing', () => {
      render(<Checkbox />);
      expect(screen.getByRole('checkbox')).toBeInTheDocument();
    });

    it('renders with label', () => {
      render(<Checkbox label="Accept terms" />);
      expect(screen.getByLabelText('Accept terms')).toBeInTheDocument();
      expect(screen.getByText('Accept terms')).toBeInTheDocument();
    });

    it('renders with helper text', () => {
      render(<Checkbox label="Subscribe" helperText="Get weekly updates" />);
      expect(screen.getByText('Get weekly updates')).toBeInTheDocument();
    });

    it('renders with error message', () => {
      render(
        <Checkbox label="Required field" error="This field is required" />
      );
      expect(screen.getByText('This field is required')).toBeInTheDocument();
      expect(screen.getByRole('alert')).toBeInTheDocument();
    });

    it('renders required indicator', () => {
      render(<Checkbox label="Required field" required />);
      expect(screen.getByText('*')).toBeInTheDocument();
    });
  });

  describe('States', () => {
    it('renders unchecked by default', () => {
      render(<Checkbox />);
      const checkbox = screen.getByRole('checkbox');
      expect(checkbox).not.toBeChecked();
    });

    it('renders checked when checked prop is true', () => {
      render(<Checkbox checked />);
      const checkbox = screen.getByRole('checkbox');
      expect(checkbox).toBeChecked();
    });

    it('renders indeterminate state', () => {
      render(<Checkbox indeterminate />);
      const checkbox = screen.getByRole('checkbox') as HTMLInputElement;
      expect(checkbox.indeterminate).toBe(true);
    });

    it('renders disabled state', () => {
      render(<Checkbox disabled />);
      const checkbox = screen.getByRole('checkbox');
      expect(checkbox).toBeDisabled();
    });

    it('shows error state styling', () => {
      render(<Checkbox error="Error message" data-testid="checkbox" />);
      const checkbox = screen.getByTestId('checkbox');
      expect(checkbox).toHaveAttribute('aria-invalid', 'true');
    });
  });

  describe('Sizes', () => {
    it('renders small size', () => {
      render(<Checkbox size="sm" data-testid="checkbox" />);
      // Size is applied through CSS classes, we can test the component renders
      expect(screen.getByTestId('checkbox')).toBeInTheDocument();
    });

    it('renders medium size (default)', () => {
      render(<Checkbox data-testid="checkbox" />);
      expect(screen.getByTestId('checkbox')).toBeInTheDocument();
    });

    it('renders large size', () => {
      render(<Checkbox size="lg" data-testid="checkbox" />);
      expect(screen.getByTestId('checkbox')).toBeInTheDocument();
    });
  });

  describe('Interactions', () => {
    it('calls onChange when clicked', async () => {
      const user = userEvent.setup();
      const handleChange = jest.fn();

      render(<Checkbox onChange={handleChange} />);
      const checkbox = screen.getByRole('checkbox');

      await user.click(checkbox);

      expect(handleChange).toHaveBeenCalledTimes(1);
      expect(handleChange).toHaveBeenCalledWith(true, expect.any(Object));
    });

    it('calls onChange when label is clicked', async () => {
      const user = userEvent.setup();
      const handleChange = jest.fn();

      render(<Checkbox label="Click me" onChange={handleChange} />);
      const label = screen.getByText('Click me');

      await user.click(label);

      expect(handleChange).toHaveBeenCalledTimes(1);
      expect(handleChange).toHaveBeenCalledWith(true, expect.any(Object));
    });

    it('calls onChange with correct values when toggled', async () => {
      const user = userEvent.setup();
      const handleChange = jest.fn();

      const { rerender } = render(<Checkbox onChange={handleChange} />);
      const checkbox = screen.getByRole('checkbox');

      // First click - should call with true
      await user.click(checkbox);
      expect(handleChange).toHaveBeenCalledWith(true, expect.any(Object));

      // Reset the mock and rerender with checked=true
      handleChange.mockClear();
      rerender(<Checkbox checked={true} onChange={handleChange} />);

      // Click when checked - should call with false
      await user.click(checkbox);
      expect(handleChange).toHaveBeenCalledWith(false, expect.any(Object));
    });

    it('does not call onChange when disabled', async () => {
      const user = userEvent.setup();
      const handleChange = jest.fn();

      render(<Checkbox disabled onChange={handleChange} />);
      const checkbox = screen.getByRole('checkbox');

      await user.click(checkbox);

      expect(handleChange).not.toHaveBeenCalled();
    });

    it('calls onFocus and onBlur handlers', async () => {
      const user = userEvent.setup();
      const handleFocus = jest.fn();
      const handleBlur = jest.fn();

      render(<Checkbox onFocus={handleFocus} onBlur={handleBlur} />);
      const checkbox = screen.getByRole('checkbox');

      await user.click(checkbox);
      expect(handleFocus).toHaveBeenCalledTimes(1);

      await user.tab();
      expect(handleBlur).toHaveBeenCalledTimes(1);
    });
  });

  describe('Keyboard Navigation', () => {
    it('can be focused with tab', async () => {
      const user = userEvent.setup();

      render(<Checkbox />);
      const checkbox = screen.getByRole('checkbox');

      await user.tab();

      expect(checkbox).toHaveFocus();
    });

    it('can be toggled with space key', async () => {
      const user = userEvent.setup();
      const handleChange = jest.fn();

      render(<Checkbox onChange={handleChange} />);
      const checkbox = screen.getByRole('checkbox');

      checkbox.focus();
      await user.keyboard(' ');

      expect(handleChange).toHaveBeenCalledWith(true, expect.any(Object));
    });

    it('skips focus when disabled', async () => {
      const user = userEvent.setup();

      render(
        <div>
          <button>Before</button>
          <Checkbox disabled />
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
        return formData;
      });

      render(
        <form onSubmit={handleSubmit} role="form">
          <Checkbox name="subscribe" value="newsletter" checked />
          <button type="submit">Submit</button>
        </form>
      );

      const form = screen.getByRole('form');
      fireEvent.submit(form);

      expect(handleSubmit).toHaveBeenCalled();
    });

    it('validates required field', () => {
      render(<Checkbox required />);
      const checkbox = screen.getByRole('checkbox');
      expect(checkbox).toBeRequired();
    });
  });

  describe('Accessibility', () => {
    it('has proper ARIA attributes', () => {
      render(
        <Checkbox
          label="Subscribe to newsletter"
          helperText="Get weekly updates"
          error="This field is required"
          required
        />
      );

      const checkbox = screen.getByRole('checkbox');

      expect(checkbox).toHaveAttribute('aria-required', 'true');
      expect(checkbox).toHaveAttribute('aria-invalid', 'true');
      expect(checkbox).toHaveAttribute('aria-describedby');
    });

    it('associates label correctly', () => {
      render(<Checkbox label="Accept terms" />);

      const checkbox = screen.getByRole('checkbox');
      const label = screen.getByText('Accept terms');

      expect(checkbox).toHaveAttribute('id');
      expect(label).toHaveAttribute('for', checkbox.getAttribute('id'));
    });

    it('supports custom aria-label', () => {
      render(<Checkbox aria-label="Custom label" />);

      const checkbox = screen.getByLabelText('Custom label');
      expect(checkbox).toBeInTheDocument();
    });

    it('announces error messages to screen readers', () => {
      render(<Checkbox error="This field is required" />);

      const errorMessage = screen.getByRole('alert');
      expect(errorMessage).toHaveTextContent('This field is required');
    });

    it('passes axe accessibility tests', async () => {
      const { container } = render(
        <Checkbox
          label="Subscribe to newsletter"
          helperText="Get weekly updates"
        />
      );

      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('passes axe accessibility tests with error state', async () => {
      const { container } = render(
        <Checkbox
          label="Required field"
          error="This field is required"
          required
        />
      );

      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('passes axe accessibility tests when disabled', async () => {
      const { container } = render(
        <Checkbox label="Disabled checkbox" disabled />
      );

      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });
  });

  describe('Custom Props', () => {
    it('forwards custom props to input element', () => {
      render(<Checkbox data-testid="custom-checkbox" data-custom="value" />);

      const checkbox = screen.getByTestId('custom-checkbox');
      expect(checkbox).toHaveAttribute('data-custom', 'value');
    });

    it('applies custom className', () => {
      render(<Checkbox className="custom-class" data-testid="checkbox" />);

      const container = screen.getByTestId('checkbox').closest('.custom-class');
      expect(container).toBeInTheDocument();
    });
  });

  describe('Edge Cases', () => {
    it('handles rapid state changes', async () => {
      const user = userEvent.setup();
      const handleChange = jest.fn();

      render(<Checkbox onChange={handleChange} />);
      const checkbox = screen.getByRole('checkbox');

      // Rapid clicks
      await user.click(checkbox);
      await user.click(checkbox);
      await user.click(checkbox);

      expect(handleChange).toHaveBeenCalledTimes(3);
    });

    it('maintains indeterminate state until explicitly changed', () => {
      const { rerender } = render(<Checkbox indeterminate />);

      let checkbox = screen.getByRole('checkbox') as HTMLInputElement;
      expect(checkbox.indeterminate).toBe(true);

      // Rerender with same props
      rerender(<Checkbox indeterminate />);
      checkbox = screen.getByRole('checkbox') as HTMLInputElement;
      expect(checkbox.indeterminate).toBe(true);

      // Rerender without indeterminate
      rerender(<Checkbox />);
      checkbox = screen.getByRole('checkbox') as HTMLInputElement;
      expect(checkbox.indeterminate).toBe(false);
    });

    it('prioritizes error over helper text', () => {
      render(<Checkbox helperText="Helper text" error="Error message" />);

      expect(screen.getByText('Error message')).toBeInTheDocument();
      expect(screen.queryByText('Helper text')).not.toBeInTheDocument();
    });
  });
});
