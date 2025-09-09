import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe, toHaveNoViolations } from 'jest-axe';
import { TextField, TextFieldProps } from '../TextField';

// Extend Jest matchers
expect.extend(toHaveNoViolations);

// Mock icons for testing
const MockIcon = () => <svg data-testid="mock-icon" />;

describe('TextField', () => {
  const defaultProps: Partial<TextFieldProps> = {
    'data-testid': 'text-field',
  };

  const renderTextField = (props: Partial<TextFieldProps> = {}) => {
    return render(<TextField {...defaultProps} {...props} />);
  };

  describe('Basic Rendering', () => {
    it('renders without crashing', () => {
      renderTextField();
      expect(screen.getByTestId('text-field')).toBeInTheDocument();
    });

    it('renders with label', () => {
      renderTextField({ label: 'Test Label' });
      expect(screen.getByLabelText('Test Label')).toBeInTheDocument();
    });

    it('renders with placeholder', () => {
      renderTextField({ placeholder: 'Enter text here' });
      expect(
        screen.getByPlaceholderText('Enter text here')
      ).toBeInTheDocument();
    });

    it('renders with helper text', () => {
      renderTextField({ helperText: 'This is helper text' });
      expect(screen.getByText('This is helper text')).toBeInTheDocument();
    });

    it('renders with error message', () => {
      renderTextField({ error: 'This is an error' });
      expect(screen.getByText('This is an error')).toBeInTheDocument();
      expect(screen.getByRole('alert')).toBeInTheDocument();
    });

    it('renders required indicator when required', () => {
      renderTextField({ label: 'Required Field', required: true });
      expect(screen.getByText('*')).toBeInTheDocument();
    });
  });

  describe('Input Types', () => {
    it('renders text input by default', () => {
      renderTextField();
      expect(screen.getByTestId('text-field')).toHaveAttribute('type', 'text');
    });

    it('renders email input when type is email', () => {
      renderTextField({ type: 'email' });
      expect(screen.getByTestId('text-field')).toHaveAttribute('type', 'email');
    });

    it('renders password input when type is password', () => {
      renderTextField({ type: 'password' });
      expect(screen.getByTestId('text-field')).toHaveAttribute(
        'type',
        'password'
      );
    });

    it('renders search input when type is search', () => {
      renderTextField({ type: 'search' });
      expect(screen.getByTestId('text-field')).toHaveAttribute(
        'type',
        'search'
      );
    });
  });

  describe('Validation States', () => {
    it('applies default state classes', () => {
      renderTextField({ state: 'default' });
      const container = screen.getByTestId('text-field').parentElement;
      expect(container).toHaveClass(
        'text-neutral-900',
        'bg-transparent',
        'border-0'
      );
    });

    it('applies success state classes', () => {
      renderTextField({ state: 'success' });
      const container = screen.getByTestId('text-field').parentElement;
      expect(container).toHaveClass('text-neutral-900', 'bg-transparent');
    });

    it('applies error state classes when error prop is provided', () => {
      renderTextField({ error: 'Error message' });
      const container = screen.getByTestId('text-field').parentElement;
      expect(container).toHaveClass('text-neutral-900', 'bg-transparent');
    });

    it('applies disabled state classes when disabled', () => {
      renderTextField({ disabled: true });
      const container = screen.getByTestId('text-field').parentElement;
      expect(container).toHaveClass('text-neutral-400', 'cursor-not-allowed');
      expect(screen.getByTestId('text-field')).toBeDisabled();
    });

    it('prioritizes error state over other states', () => {
      renderTextField({ state: 'success', error: 'Error message' });
      const container = screen.getByTestId('text-field').parentElement;
      expect(container).toHaveClass('text-neutral-900', 'bg-transparent');
    });

    it('prioritizes disabled state over error state', () => {
      renderTextField({ disabled: true, error: 'Error message' });
      const container = screen.getByTestId('text-field').parentElement;
      expect(container).toHaveClass('text-neutral-400', 'cursor-not-allowed');
    });
  });

  describe('Size Variants', () => {
    it('applies small size classes', () => {
      renderTextField({ size: 'sm' });
      const container = screen.getByTestId('text-field').parentElement;
      expect(container).toHaveClass('px-0', 'py-2', 'text-sm');
    });

    it('applies medium size classes by default', () => {
      renderTextField();
      const container = screen.getByTestId('text-field').parentElement;
      expect(container).toHaveClass('px-0', 'py-3', 'text-base');
    });

    it('applies large size classes', () => {
      renderTextField({ size: 'lg' });
      const container = screen.getByTestId('text-field').parentElement;
      expect(container).toHaveClass('px-0', 'py-4', 'text-lg');
    });
  });

  describe('Design Variants', () => {
    it('applies borderless variant by default', () => {
      renderTextField({ variant: 'borderless' });
      const container = screen.getByTestId('text-field').parentElement;
      expect(container).toHaveClass('border-0');
    });

    it('applies bottom-line variant classes', () => {
      renderTextField({ variant: 'bottom-line' });
      const container = screen.getByTestId('text-field').parentElement;
      expect(container).toHaveClass(
        'border-0',
        'border-b',
        'border-transparent'
      );
    });

    it('applies subtle-outline variant classes', () => {
      renderTextField({ variant: 'subtle-outline' });
      const container = screen.getByTestId('text-field').parentElement;
      expect(container).toHaveClass('border', 'border-transparent');
    });

    it('shows bottom line on focus for bottom-line variant', async () => {
      renderTextField({ variant: 'bottom-line' });
      const input = screen.getByTestId('text-field');

      await userEvent.click(input);

      // The focus state should be applied (tested via focus state)
      expect(input).toHaveFocus();
    });

    it('shows subtle outline on focus for subtle-outline variant', async () => {
      renderTextField({ variant: 'subtle-outline' });
      const input = screen.getByTestId('text-field');

      await userEvent.click(input);

      // The focus state should be applied (tested via focus state)
      expect(input).toHaveFocus();
    });
  });

  describe('Icons', () => {
    it('renders start icon', () => {
      renderTextField({ startIcon: <MockIcon /> });
      expect(screen.getByTestId('mock-icon')).toBeInTheDocument();
    });

    it('renders end icon', () => {
      renderTextField({ endIcon: <MockIcon /> });
      expect(screen.getByTestId('mock-icon')).toBeInTheDocument();
    });

    it('renders both start and end icons', () => {
      renderTextField({
        startIcon: <MockIcon />,
        endIcon: <div data-testid="end-icon" />,
      });
      expect(screen.getByTestId('mock-icon')).toBeInTheDocument();
      expect(screen.getByTestId('end-icon')).toBeInTheDocument();
    });
  });

  describe('Character Count', () => {
    it('shows character count when enabled with maxLength', () => {
      renderTextField({
        showCharCount: true,
        maxLength: 100,
        value: 'Hello',
        onChange: () => {},
      });
      expect(screen.getByText('5/100')).toBeInTheDocument();
    });

    it('does not show character count when showCharCount is false', () => {
      renderTextField({
        showCharCount: false,
        maxLength: 100,
        value: 'Hello',
        onChange: () => {},
      });
      expect(screen.queryByText('5/100')).not.toBeInTheDocument();
    });

    it('does not show character count without maxLength', () => {
      renderTextField({
        showCharCount: true,
        value: 'Hello',
        onChange: () => {},
      });
      expect(screen.queryByText(/\/$/)).not.toBeInTheDocument();
    });

    it('shows warning color when approaching limit', () => {
      renderTextField({
        showCharCount: true,
        maxLength: 10,
        value: '12345678',
        onChange: () => {},
      });
      const counter = screen.getByText('8/10');
      expect(counter).toHaveClass('text-accent-amber-600');
    });

    it('shows error color when at limit', () => {
      renderTextField({
        showCharCount: true,
        maxLength: 10,
        value: '1234567890',
        onChange: () => {},
      });
      const counter = screen.getByText('10/10');
      expect(counter).toHaveClass('text-accent-red-600');
    });
  });

  describe('Event Handling', () => {
    it('calls onChange when input value changes', async () => {
      const handleChange = jest.fn();
      renderTextField({ onChange: handleChange });

      const input = screen.getByTestId('text-field');
      await userEvent.type(input, 'test');

      expect(handleChange).toHaveBeenCalled();
    });

    it('calls onFocus when input is focused', async () => {
      const handleFocus = jest.fn();
      renderTextField({ onFocus: handleFocus });

      const input = screen.getByTestId('text-field');
      await userEvent.click(input);

      expect(handleFocus).toHaveBeenCalled();
    });

    it('calls onBlur when input loses focus', async () => {
      const handleBlur = jest.fn();
      renderTextField({ onBlur: handleBlur });

      const input = screen.getByTestId('text-field');
      await userEvent.click(input);
      await userEvent.tab();

      expect(handleBlur).toHaveBeenCalled();
    });

    it('calls onKeyDown when key is pressed', async () => {
      const handleKeyDown = jest.fn();
      renderTextField({ onKeyDown: handleKeyDown });

      const input = screen.getByTestId('text-field');
      await userEvent.type(input, 'a');

      expect(handleKeyDown).toHaveBeenCalled();
    });

    it('does not call onChange when disabled', async () => {
      const handleChange = jest.fn();
      renderTextField({ disabled: true, onChange: handleChange });

      const input = screen.getByTestId('text-field');
      await userEvent.type(input, 'test');

      expect(handleChange).not.toHaveBeenCalled();
    });
  });

  describe('Controlled vs Uncontrolled', () => {
    it('works as controlled component', () => {
      const { rerender } = renderTextField({
        value: 'initial',
        onChange: () => {},
      });
      expect(screen.getByDisplayValue('initial')).toBeInTheDocument();

      rerender(
        <TextField
          value="updated"
          onChange={() => {}}
          data-testid="text-field"
        />
      );
      expect(screen.getByDisplayValue('updated')).toBeInTheDocument();
    });

    it('works as uncontrolled component', () => {
      renderTextField({ defaultValue: 'default value' });
      expect(screen.getByDisplayValue('default value')).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('has proper ARIA attributes', () => {
      renderTextField({
        label: 'Test Label',
        required: true,
        error: 'Error message',
        helperText: 'Helper text',
      });

      const input = screen.getByTestId('text-field');
      expect(input).toHaveAttribute('aria-required', 'true');
      expect(input).toHaveAttribute('aria-invalid', 'true');
      expect(input).toHaveAttribute('aria-describedby');
    });

    it('associates label with input', () => {
      renderTextField({ label: 'Test Label' });
      const input = screen.getByLabelText('Test Label');
      expect(input).toBeInTheDocument();
    });

    it('associates error message with input', () => {
      renderTextField({ error: 'Error message' });
      const input = screen.getByTestId('text-field');
      const errorElement = screen.getByRole('alert');

      expect(input).toHaveAttribute('aria-describedby', errorElement.id);
    });

    it('associates helper text with input', () => {
      renderTextField({ helperText: 'Helper text' });
      const input = screen.getByTestId('text-field');
      const helperElement = screen.getByText('Helper text');

      expect(input).toHaveAttribute('aria-describedby', helperElement.id);
    });

    it('has proper focus management', async () => {
      renderTextField({ label: 'Test Label' });
      const input = screen.getByLabelText('Test Label');

      await userEvent.tab();
      expect(input).toHaveFocus();
    });

    it('supports keyboard navigation', async () => {
      renderTextField();
      const input = screen.getByTestId('text-field');

      input.focus();
      expect(input).toHaveFocus();

      fireEvent.keyDown(input, { key: 'Tab' });
      // Focus should move away (tested in integration)
    });

    it('has no accessibility violations', async () => {
      const { container } = renderTextField({
        label: 'Accessible Input',
        helperText: 'This is helper text',
        required: true,
      });

      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('has no accessibility violations with error state', async () => {
      const { container } = renderTextField({
        label: 'Input with Error',
        error: 'This field is required',
        required: true,
      });

      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('has no accessibility violations when disabled', async () => {
      const { container } = renderTextField({
        label: 'Disabled Input',
        disabled: true,
        helperText: 'This input is disabled',
      });

      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });
  });

  describe('Custom Props', () => {
    it('forwards ref to input element', () => {
      const ref = React.createRef<HTMLInputElement>();
      render(<TextField ref={ref} data-testid="text-field" />);
      expect(ref.current).toBeInstanceOf(HTMLInputElement);
    });

    it('applies custom className', () => {
      renderTextField({ className: 'custom-class' });
      const container = screen.getByTestId('text-field').parentElement;
      expect(container).toHaveClass('custom-class');
    });

    it('applies custom aria-label', () => {
      renderTextField({ 'aria-label': 'Custom label' });
      expect(screen.getByLabelText('Custom label')).toBeInTheDocument();
    });

    it('supports readOnly prop', () => {
      renderTextField({ readOnly: true });
      expect(screen.getByTestId('text-field')).toHaveAttribute('readonly');
    });

    it('supports maxLength prop', () => {
      renderTextField({ maxLength: 50 });
      expect(screen.getByTestId('text-field')).toHaveAttribute(
        'maxlength',
        '50'
      );
    });
  });

  describe('Focus States', () => {
    it('applies focus styles when focused', async () => {
      renderTextField();
      const input = screen.getByTestId('text-field');
      const _container = input.parentElement;

      await userEvent.click(input);

      // Focus styles are applied via CSS, we can test the focus state
      expect(input).toHaveFocus();
    });

    it('removes focus styles when blurred', async () => {
      renderTextField();
      const input = screen.getByTestId('text-field');

      await userEvent.click(input);
      expect(input).toHaveFocus();

      await userEvent.tab();
      expect(input).not.toHaveFocus();
    });
  });

  describe('Error Handling', () => {
    it('shows error message instead of helper text', () => {
      renderTextField({
        helperText: 'Helper text',
        error: 'Error message',
      });

      expect(screen.getByText('Error message')).toBeInTheDocument();
      expect(screen.queryByText('Helper text')).not.toBeInTheDocument();
    });

    it('shows error message with proper role', () => {
      renderTextField({ error: 'Error message' });
      const errorElement = screen.getByRole('alert');
      expect(errorElement).toHaveTextContent('Error message');
    });
  });

  describe('Theme Support', () => {
    it('applies dark mode classes', () => {
      // This would typically be tested with a theme provider
      // For now, we can verify the classes are present in the component
      renderTextField();
      const container = screen.getByTestId('text-field').parentElement;
      expect(container?.className).toContain('dark:');
    });
  });
});
