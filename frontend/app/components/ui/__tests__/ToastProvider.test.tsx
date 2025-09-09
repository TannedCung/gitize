import React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ToastProvider, useToastContext } from '../ToastProvider';
import { ToastPosition } from '../Toast';

// Mock createPortal for testing
jest.mock('react-dom', () => ({
  ...jest.requireActual('react-dom'),
  createPortal: (node: React.ReactNode) => node,
}));

/**
 * Test component that uses the toast context
 */
const TestToastConsumer: React.FC = () => {
  const { success, error, warning, info, addToast, removeToast, clearToasts } =
    useToastContext();

  return (
    <div>
      <button onClick={() => success('Success message')}>Add Success</button>
      <button onClick={() => error('Error message')}>Add Error</button>
      <button onClick={() => warning('Warning message')}>Add Warning</button>
      <button onClick={() => info('Info message')}>Add Info</button>
      <button
        onClick={() => addToast({ message: 'Custom message', variant: 'info' })}
      >
        Add Custom
      </button>
      <button onClick={() => removeToast('test-id')}>Remove Toast</button>
      <button onClick={() => clearToasts()}>Clear All</button>
    </div>
  );
};

/**
 * Test component that tries to use toast context outside provider
 */
const TestToastConsumerOutsideProvider: React.FC = () => {
  try {
    useToastContext();
    return <div>Should not render</div>;
  } catch (error) {
    return <div>Error: {(error as Error).message}</div>;
  }
};

describe('ToastProvider', () => {
  beforeEach(() => {
    jest.clearAllTimers();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
  });

  describe('Provider Setup', () => {
    it('renders children correctly', () => {
      render(
        <ToastProvider>
          <div data-testid="child-content">Child Content</div>
        </ToastProvider>
      );

      expect(screen.getByTestId('child-content')).toBeInTheDocument();
    });

    it('provides toast context to children', () => {
      render(
        <ToastProvider>
          <TestToastConsumer />
        </ToastProvider>
      );

      expect(screen.getByText('Add Success')).toBeInTheDocument();
      expect(screen.getByText('Add Error')).toBeInTheDocument();
      expect(screen.getByText('Add Warning')).toBeInTheDocument();
      expect(screen.getByText('Add Info')).toBeInTheDocument();
    });

    it('accepts custom position prop', () => {
      const position: ToastPosition = 'bottom-left';

      render(
        <ToastProvider position={position}>
          <TestToastConsumer />
        </ToastProvider>
      );

      // Add a toast to trigger container rendering
      fireEvent.click(screen.getByText('Add Success'));

      // Check that the container has the correct position classes
      const container = document.querySelector('.fixed.z-50');
      expect(container).toHaveClass('bottom-4', 'left-4');
    });

    it('accepts custom maxToasts prop', async () => {
      render(
        <ToastProvider maxToasts={2}>
          <TestToastConsumer />
        </ToastProvider>
      );

      // Add 3 toasts
      await userEvent.click(screen.getByText('Add Success'));
      await userEvent.click(screen.getByText('Add Error'));
      await userEvent.click(screen.getByText('Add Warning'));

      // Only 2 should be visible
      expect(screen.getByText('Success message')).toBeInTheDocument();
      expect(screen.getByText('Error message')).toBeInTheDocument();
      expect(screen.queryByText('Warning message')).not.toBeInTheDocument();
    });
  });

  describe('Toast Context Methods', () => {
    it('provides success method', async () => {
      render(
        <ToastProvider>
          <TestToastConsumer />
        </ToastProvider>
      );

      await userEvent.click(screen.getByText('Add Success'));
      expect(screen.getByText('Success message')).toBeInTheDocument();

      // Check that it has success variant styling
      const toast = screen.getByRole('alert');
      expect(toast.className).toContain('success');
    });

    it('provides error method', async () => {
      render(
        <ToastProvider>
          <TestToastConsumer />
        </ToastProvider>
      );

      await userEvent.click(screen.getByText('Add Error'));
      expect(screen.getByText('Error message')).toBeInTheDocument();

      // Check that it has error variant styling
      const toast = screen.getByRole('alert');
      expect(toast.className).toContain('error');
    });

    it('provides warning method', async () => {
      render(
        <ToastProvider>
          <TestToastConsumer />
        </ToastProvider>
      );

      await userEvent.click(screen.getByText('Add Warning'));
      expect(screen.getByText('Warning message')).toBeInTheDocument();

      // Check that it has warning variant styling
      const toast = screen.getByRole('alert');
      expect(toast.className).toContain('warning');
    });

    it('provides info method', async () => {
      render(
        <ToastProvider>
          <TestToastConsumer />
        </ToastProvider>
      );

      await userEvent.click(screen.getByText('Add Info'));
      expect(screen.getByText('Info message')).toBeInTheDocument();

      // Check that it has info variant styling
      const toast = screen.getByRole('alert');
      expect(toast.className).toContain('info');
    });

    it('provides addToast method', async () => {
      render(
        <ToastProvider>
          <TestToastConsumer />
        </ToastProvider>
      );

      await userEvent.click(screen.getByText('Add Custom'));
      expect(screen.getByText('Custom message')).toBeInTheDocument();
    });

    it('provides clearToasts method', async () => {
      render(
        <ToastProvider>
          <TestToastConsumer />
        </ToastProvider>
      );

      // Add multiple toasts
      await userEvent.click(screen.getByText('Add Success'));
      await userEvent.click(screen.getByText('Add Error'));

      expect(screen.getByText('Success message')).toBeInTheDocument();
      expect(screen.getByText('Error message')).toBeInTheDocument();

      // Clear all toasts
      await userEvent.click(screen.getByText('Clear All'));

      expect(screen.queryByText('Success message')).not.toBeInTheDocument();
      expect(screen.queryByText('Error message')).not.toBeInTheDocument();
    });
  });

  describe('Toast Management', () => {
    it('auto-dismisses toasts after duration', async () => {
      render(
        <ToastProvider>
          <TestToastConsumer />
        </ToastProvider>
      );

      await userEvent.click(screen.getByText('Add Success'));
      expect(screen.getByText('Success message')).toBeInTheDocument();

      // Fast-forward time to trigger auto-dismiss
      act(() => {
        jest.advanceTimersByTime(5200); // Default duration + animation time
      });

      expect(screen.queryByText('Success message')).not.toBeInTheDocument();
    });

    it('allows manual dismissal of toasts', async () => {
      render(
        <ToastProvider>
          <TestToastConsumer />
        </ToastProvider>
      );

      await userEvent.click(screen.getByText('Add Success'));
      expect(screen.getByText('Success message')).toBeInTheDocument();

      // Click dismiss button
      const dismissButton = screen.getByLabelText('Dismiss notification');
      await userEvent.click(dismissButton);

      // Wait for animation
      act(() => {
        jest.advanceTimersByTime(200);
      });

      expect(screen.queryByText('Success message')).not.toBeInTheDocument();
    });

    it('handles multiple toasts correctly', async () => {
      render(
        <ToastProvider>
          <TestToastConsumer />
        </ToastProvider>
      );

      // Add multiple toasts
      await userEvent.click(screen.getByText('Add Success'));
      await userEvent.click(screen.getByText('Add Error'));
      await userEvent.click(screen.getByText('Add Warning'));

      expect(screen.getByText('Success message')).toBeInTheDocument();
      expect(screen.getByText('Error message')).toBeInTheDocument();
      expect(screen.getByText('Warning message')).toBeInTheDocument();

      // Dismiss one toast
      const dismissButtons = screen.getAllByLabelText('Dismiss notification');
      await userEvent.click(dismissButtons[0]);

      act(() => {
        jest.advanceTimersByTime(200);
      });

      // Check that only one toast was dismissed
      const remainingToasts = screen.getAllByRole('alert');
      expect(remainingToasts).toHaveLength(2);
    });
  });

  describe('Error Handling', () => {
    it('throws error when useToastContext is used outside provider', () => {
      render(<TestToastConsumerOutsideProvider />);

      expect(
        screen.getByText(
          'Error: useToastContext must be used within a ToastProvider'
        )
      ).toBeInTheDocument();
    });

    it('handles invalid toast configurations gracefully', async () => {
      const TestInvalidToast: React.FC = () => {
        const { addToast } = useToastContext();

        return (
          <button onClick={() => addToast({ message: '' } as any)}>
            Add Invalid Toast
          </button>
        );
      };

      render(
        <ToastProvider>
          <TestInvalidToast />
        </ToastProvider>
      );

      // Should not crash when adding invalid toast
      await userEvent.click(screen.getByText('Add Invalid Toast'));

      // Toast should still be created (with empty message)
      expect(screen.getByRole('alert')).toBeInTheDocument();
    });
  });

  describe('Integration', () => {
    it('integrates with ToastContainer correctly', async () => {
      render(
        <ToastProvider position="top-center" maxToasts={3}>
          <TestToastConsumer />
        </ToastProvider>
      );

      // Add a toast
      await userEvent.click(screen.getByText('Add Success'));

      // Check that ToastContainer is rendered with correct props
      const container = document.querySelector('.fixed.z-50');
      expect(container).toHaveClass('top-4', 'left-1/2');

      // Check that toast is rendered
      expect(screen.getByText('Success message')).toBeInTheDocument();
    });

    it('maintains toast state across re-renders', async () => {
      const TestRerender: React.FC<{ key: number }> = ({ key }) => (
        <ToastProvider key={key}>
          <TestToastConsumer />
        </ToastProvider>
      );

      const { rerender } = render(<TestRerender key={1} />);

      // Add a toast
      await userEvent.click(screen.getByText('Add Success'));
      expect(screen.getByText('Success message')).toBeInTheDocument();

      // Re-render with different key (new provider instance)
      rerender(<TestRerender key={2} />);

      // Toast should be gone (new provider instance)
      expect(screen.queryByText('Success message')).not.toBeInTheDocument();
    });
  });

  describe('Performance', () => {
    it('does not cause unnecessary re-renders', async () => {
      const renderSpy = jest.fn();

      const TestComponent: React.FC = () => {
        renderSpy();
        const { success } = useToastContext();

        return (
          <button onClick={() => success('Test message')}>Add Toast</button>
        );
      };

      render(
        <ToastProvider>
          <TestComponent />
        </ToastProvider>
      );

      expect(renderSpy).toHaveBeenCalledTimes(1);

      // Add a toast
      await userEvent.click(screen.getByText('Add Toast'));

      // Component should not re-render when toast is added
      expect(renderSpy).toHaveBeenCalledTimes(1);
    });
  });
});
