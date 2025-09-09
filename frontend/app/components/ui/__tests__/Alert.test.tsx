import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe, toHaveNoViolations } from 'jest-axe';
import { Alert, AlertProps, AlertVariant } from '../Alert';

// Extend Jest matchers
expect.extend(toHaveNoViolations);

/**
 * Helper function to render Alert with default props
 */
const renderAlert = (props: Partial<AlertProps> = {}) => {
  const defaultProps: AlertProps = {
    children: 'Test alert message',
    ...props,
  };

  return render(<Alert {...defaultProps} />);
};

describe('Alert Component', () => {
  describe('Rendering', () => {
    it('renders with default props', () => {
      renderAlert();

      expect(screen.getByRole('alert')).toBeInTheDocument();
      expect(screen.getByText('Test alert message')).toBeInTheDocument();
    });

    it('renders with custom title', () => {
      renderAlert({ title: 'Alert Title' });

      expect(screen.getByText('Alert Title')).toBeInTheDocument();
      expect(screen.getByText('Test alert message')).toBeInTheDocument();
    });

    it('renders with custom className', () => {
      renderAlert({ className: 'custom-class' });

      expect(screen.getByRole('alert')).toHaveClass('custom-class');
    });

    it('renders with data-testid', () => {
      renderAlert({ 'data-testid': 'custom-alert' });

      expect(screen.getByTestId('custom-alert')).toBeInTheDocument();
    });

    it('renders with aria-label', () => {
      renderAlert({ 'aria-label': 'Custom alert label' });

      expect(screen.getByRole('alert')).toHaveAttribute(
        'aria-label',
        'Custom alert label'
      );
    });
  });

  describe('Variants', () => {
    const variants: AlertVariant[] = ['success', 'warning', 'error', 'info'];

    variants.forEach(variant => {
      it(`renders ${variant} variant correctly`, () => {
        renderAlert({ variant });

        const alert = screen.getByRole('alert');
        expect(alert).toBeInTheDocument();

        // Check that variant-specific classes are applied
        expect(alert.className).toContain(variant);
      });
    });

    it('defaults to info variant when no variant is specified', () => {
      renderAlert();

      const alert = screen.getByRole('alert');
      expect(alert.className).toContain('info');
    });
  });

  describe('Icons', () => {
    it('shows default icon by default', () => {
      renderAlert({ variant: 'success' });

      // Check that an SVG icon is present
      expect(
        screen.getByRole('alert').querySelector('svg')
      ).toBeInTheDocument();
    });

    it('hides icon when showIcon is false', () => {
      renderAlert({ variant: 'success', showIcon: false });

      // Check that no SVG icon is present
      expect(
        screen.getByRole('alert').querySelector('svg')
      ).not.toBeInTheDocument();
    });

    it('renders custom icon when provided', () => {
      const customIcon = <span data-testid="custom-icon">Custom Icon</span>;
      renderAlert({ icon: customIcon });

      expect(screen.getByTestId('custom-icon')).toBeInTheDocument();
    });

    it('prioritizes custom icon over default icon', () => {
      const customIcon = <span data-testid="custom-icon">Custom Icon</span>;
      renderAlert({ icon: customIcon, showIcon: true });

      expect(screen.getByTestId('custom-icon')).toBeInTheDocument();
      // Should not have the default SVG icon
      expect(screen.getByRole('alert').querySelectorAll('svg')).toHaveLength(0);
    });
  });

  describe('Dismissible Functionality', () => {
    it('does not show dismiss button by default', () => {
      renderAlert();

      expect(screen.queryByLabelText('Dismiss alert')).not.toBeInTheDocument();
    });

    it('shows dismiss button when dismissible is true', () => {
      renderAlert({ dismissible: true });

      expect(screen.getByLabelText('Dismiss alert')).toBeInTheDocument();
    });

    it('calls onDismiss when dismiss button is clicked', async () => {
      const onDismiss = jest.fn();
      renderAlert({ dismissible: true, onDismiss });

      const dismissButton = screen.getByLabelText('Dismiss alert');
      await userEvent.click(dismissButton);

      expect(onDismiss).toHaveBeenCalledTimes(1);
    });

    it('hides alert when dismissed', async () => {
      renderAlert({ dismissible: true });

      const dismissButton = screen.getByLabelText('Dismiss alert');
      await userEvent.click(dismissButton);

      await waitFor(() => {
        expect(screen.queryByRole('alert')).not.toBeInTheDocument();
      });
    });

    it('supports keyboard navigation for dismiss button', async () => {
      // Test Enter key
      const onDismissEnter = jest.fn();
      const { unmount: unmountEnter } = renderAlert({
        dismissible: true,
        onDismiss: onDismissEnter,
      });

      const dismissButtonEnter = screen.getByLabelText('Dismiss alert');
      fireEvent.keyDown(dismissButtonEnter, { key: 'Enter' });
      expect(onDismissEnter).toHaveBeenCalledTimes(1);

      unmountEnter();

      // Test Space key
      const onDismissSpace = jest.fn();
      renderAlert({ dismissible: true, onDismiss: onDismissSpace });

      const dismissButtonSpace = screen.getByLabelText('Dismiss alert');
      fireEvent.keyDown(dismissButtonSpace, { key: ' ' });
      expect(onDismissSpace).toHaveBeenCalledTimes(1);
    });

    it('does not dismiss on other key presses', async () => {
      const onDismiss = jest.fn();
      renderAlert({ dismissible: true, onDismiss });

      const dismissButton = screen.getByLabelText('Dismiss alert');

      fireEvent.keyDown(dismissButton, { key: 'Escape' });
      fireEvent.keyDown(dismissButton, { key: 'Tab' });

      expect(onDismiss).not.toHaveBeenCalled();
    });
  });

  describe('Accessibility', () => {
    it('has proper ARIA attributes', () => {
      renderAlert();

      const alert = screen.getByRole('alert');
      expect(alert).toHaveAttribute('aria-live', 'polite');
    });

    it('has accessible dismiss button', () => {
      renderAlert({ dismissible: true });

      const dismissButton = screen.getByLabelText('Dismiss alert');
      expect(dismissButton).toHaveAttribute('type', 'button');
      expect(dismissButton).toHaveAttribute('aria-label', 'Dismiss alert');
    });

    it('has proper focus management for dismiss button', () => {
      renderAlert({ dismissible: true });

      const dismissButton = screen.getByLabelText('Dismiss alert');
      expect(dismissButton).toHaveClass('focus:outline-none');
      expect(dismissButton).toHaveClass('focus:ring-2');
    });

    it('passes accessibility audit', async () => {
      const { container } = renderAlert({
        title: 'Test Title',
        dismissible: true,
        variant: 'success',
      });

      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('passes accessibility audit for all variants', async () => {
      const variants: AlertVariant[] = ['success', 'warning', 'error', 'info'];

      for (const variant of variants) {
        const { container } = renderAlert({ variant, dismissible: true });
        const results = await axe(container);
        expect(results).toHaveNoViolations();
      }
    });
  });

  describe('Content Handling', () => {
    it('renders string content', () => {
      renderAlert({ children: 'Simple string message' });

      expect(screen.getByText('Simple string message')).toBeInTheDocument();
    });

    it('renders JSX content', () => {
      const jsxContent = (
        <div>
          <p>Paragraph 1</p>
          <p>Paragraph 2</p>
        </div>
      );

      renderAlert({ children: jsxContent });

      expect(screen.getByText('Paragraph 1')).toBeInTheDocument();
      expect(screen.getByText('Paragraph 2')).toBeInTheDocument();
    });

    it('renders without content when children is undefined', () => {
      renderAlert({ children: undefined, title: 'Title Only' });

      expect(screen.getByText('Title Only')).toBeInTheDocument();
      expect(screen.getByRole('alert')).toBeInTheDocument();
    });
  });

  describe('Styling and Theme', () => {
    it('applies correct base classes', () => {
      renderAlert();

      const alert = screen.getByRole('alert');
      expect(alert).toHaveClass('relative', 'rounded-lg', 'border', 'p-4');
      expect(alert).toHaveClass(
        'transition-all',
        'duration-200',
        'ease-in-out'
      );
    });

    it('applies variant-specific styling classes', () => {
      renderAlert({ variant: 'success' });

      const alert = screen.getByRole('alert');
      expect(alert.className).toMatch(/success/);
    });

    it('merges custom className with default classes', () => {
      renderAlert({ className: 'custom-class' });

      const alert = screen.getByRole('alert');
      expect(alert).toHaveClass('custom-class');
      expect(alert).toHaveClass('relative', 'rounded-lg'); // Default classes should still be present
    });
  });

  describe('Edge Cases', () => {
    it('handles empty title gracefully', () => {
      renderAlert({ title: '' });

      expect(screen.getByRole('alert')).toBeInTheDocument();
      expect(screen.getByText('Test alert message')).toBeInTheDocument();
    });

    it('handles multiple dismiss calls gracefully', async () => {
      const onDismiss = jest.fn();
      renderAlert({ dismissible: true, onDismiss });

      const dismissButton = screen.getByLabelText('Dismiss alert');

      // Click multiple times rapidly
      await userEvent.click(dismissButton);
      await userEvent.click(dismissButton);
      await userEvent.click(dismissButton);

      // Should only call onDismiss once since component unmounts after first dismiss
      expect(onDismiss).toHaveBeenCalledTimes(1);
    });

    it('handles ref forwarding correctly', () => {
      const ref = React.createRef<HTMLDivElement>();
      render(<Alert ref={ref}>Test message</Alert>);

      expect(ref.current).toBeInstanceOf(HTMLDivElement);
      expect(ref.current).toHaveAttribute('role', 'alert');
    });
  });

  describe('Performance', () => {
    it('does not re-render unnecessarily', () => {
      const renderSpy = jest.fn();

      const TestAlert = (props: AlertProps) => {
        renderSpy();
        return <Alert {...props} />;
      };

      const { rerender } = render(<TestAlert>Test message</TestAlert>);

      expect(renderSpy).toHaveBeenCalledTimes(1);

      // Re-render with same props
      rerender(<TestAlert>Test message</TestAlert>);

      expect(renderSpy).toHaveBeenCalledTimes(2);
    });
  });
});
