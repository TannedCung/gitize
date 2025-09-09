import React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe, toHaveNoViolations } from 'jest-axe';
import {
  Toast,
  ToastContainer,
  useToast,
  ToastConfig,
  ToastProps,
  ToastPosition,
} from '../Toast';
import { AlertVariant } from '../Alert';

// Extend Jest matchers
expect.extend(toHaveNoViolations);

// Mock createPortal for testing
jest.mock('react-dom', () => ({
  ...jest.requireActual('react-dom'),
  createPortal: (node: React.ReactNode) => node,
}));

/**
 * Helper function to create a basic toast config
 */
const createToastConfig = (
  overrides: Partial<ToastConfig> = {}
): ToastConfig => ({
  id: 'test-toast-1',
  message: 'Test toast message',
  variant: 'info',
  duration: 5000,
  dismissible: true,
  showIcon: true,
  position: 'top-right',
  ...overrides,
});

/**
 * Helper function to render Toast with default props
 */
const renderToast = (props: Partial<ToastProps> = {}) => {
  const defaultProps: ToastProps = {
    toast: createToastConfig(),
    onDismiss: jest.fn(),
    ...props,
  };

  return render(<Toast {...defaultProps} />);
};

/**
 * Test component for useToast hook
 */
const TestToastHook: React.FC<{ onToastMethods?: (_methods: any) => void }> = ({
  onToastMethods,
}) => {
  const toastMethods = useToast();

  React.useEffect(() => {
    onToastMethods?.(toastMethods);
  }, [onToastMethods, toastMethods]);

  return (
    <div>
      <button onClick={() => toastMethods.success('Success message')}>
        Add Success Toast
      </button>
      <button onClick={() => toastMethods.error('Error message')}>
        Add Error Toast
      </button>
      <button onClick={() => toastMethods.warning('Warning message')}>
        Add Warning Toast
      </button>
      <button onClick={() => toastMethods.info('Info message')}>
        Add Info Toast
      </button>
      <button onClick={() => toastMethods.clearToasts()}>
        Clear All Toasts
      </button>
      <ToastContainer
        toasts={toastMethods.toasts}
        onDismiss={toastMethods.removeToast}
      />
    </div>
  );
};

describe('Toast Component', () => {
  beforeEach(() => {
    jest.clearAllTimers();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
  });

  describe('Rendering', () => {
    it('renders with default props', () => {
      renderToast();

      expect(screen.getByRole('alert')).toBeInTheDocument();
      expect(screen.getByText('Test toast message')).toBeInTheDocument();
    });

    it('renders with title', () => {
      const toast = createToastConfig({ title: 'Toast Title' });
      renderToast({ toast });

      expect(screen.getByText('Toast Title')).toBeInTheDocument();
      expect(screen.getByText('Test toast message')).toBeInTheDocument();
    });

    it('renders with custom icon', () => {
      const customIcon = <span data-testid="custom-icon">Custom Icon</span>;
      const toast = createToastConfig({ icon: customIcon });
      renderToast({ toast });

      expect(screen.getByTestId('custom-icon')).toBeInTheDocument();
    });

    it('renders without icon when showIcon is false', () => {
      const toast = createToastConfig({ showIcon: false });
      renderToast({ toast });

      expect(
        screen.getByRole('alert').querySelector('svg')
      ).not.toBeInTheDocument();
    });

    it('renders with action button', () => {
      const actionMock = jest.fn();
      const toast = createToastConfig({
        action: { label: 'Action Button', onClick: actionMock },
      });
      renderToast({ toast });

      const actionButton = screen.getByText('Action Button');
      expect(actionButton).toBeInTheDocument();

      fireEvent.click(actionButton);
      expect(actionMock).toHaveBeenCalledTimes(1);
    });
  });

  describe('Variants', () => {
    const variants: AlertVariant[] = ['success', 'warning', 'error', 'info'];

    variants.forEach(variant => {
      it(`renders ${variant} variant correctly`, () => {
        const toast = createToastConfig({ variant });
        renderToast({ toast });

        const toastElement = screen.getByRole('alert');
        expect(toastElement).toBeInTheDocument();
        expect(toastElement.className).toContain(variant);
      });
    });
  });

  describe('Dismissible Functionality', () => {
    it('shows dismiss button when dismissible is true', () => {
      const toast = createToastConfig({ dismissible: true });
      renderToast({ toast });

      expect(screen.getByLabelText('Dismiss notification')).toBeInTheDocument();
    });

    it('hides dismiss button when dismissible is false', () => {
      const toast = createToastConfig({ dismissible: false });
      renderToast({ toast });

      expect(
        screen.queryByLabelText('Dismiss notification')
      ).not.toBeInTheDocument();
    });

    it('calls onDismiss when dismiss button is clicked', async () => {
      const onDismiss = jest.fn();
      const toast = createToastConfig({ dismissible: true });
      renderToast({ toast, onDismiss });

      const dismissButton = screen.getByLabelText('Dismiss notification');
      await userEvent.click(dismissButton);

      // Wait for the exit animation
      act(() => {
        jest.advanceTimersByTime(200);
      });

      expect(onDismiss).toHaveBeenCalledWith('test-toast-1');
    });

    it('supports keyboard navigation for dismiss button', async () => {
      const onDismiss = jest.fn();
      const toast = createToastConfig({ dismissible: true });
      renderToast({ toast, onDismiss });

      const dismissButton = screen.getByLabelText('Dismiss notification');

      // Test Enter key
      fireEvent.keyDown(dismissButton, { key: 'Enter' });
      act(() => {
        jest.advanceTimersByTime(200);
      });
      expect(onDismiss).toHaveBeenCalledTimes(1);

      // Reset and test Space key
      onDismiss.mockClear();
      fireEvent.keyDown(dismissButton, { key: ' ' });
      act(() => {
        jest.advanceTimersByTime(200);
      });
      expect(onDismiss).toHaveBeenCalledTimes(1);
    });
  });

  describe('Auto-dismiss Functionality', () => {
    it('auto-dismisses after specified duration', () => {
      const onDismiss = jest.fn();
      const toast = createToastConfig({ duration: 3000 });
      renderToast({ toast, onDismiss });

      expect(onDismiss).not.toHaveBeenCalled();

      // Fast-forward time
      act(() => {
        jest.advanceTimersByTime(3200); // 3000ms + 200ms for animation
      });

      expect(onDismiss).toHaveBeenCalledWith('test-toast-1');
    });

    it('does not auto-dismiss when duration is 0', () => {
      const onDismiss = jest.fn();
      const toast = createToastConfig({ duration: 0 });
      renderToast({ toast, onDismiss });

      act(() => {
        jest.advanceTimersByTime(10000);
      });

      expect(onDismiss).not.toHaveBeenCalled();
    });

    it('shows progress bar when duration is set', () => {
      const toast = createToastConfig({ duration: 5000 });
      renderToast({ toast });

      const progressBar = screen
        .getByRole('alert')
        .querySelector('.absolute.bottom-0');
      expect(progressBar).toBeInTheDocument();
    });

    it('does not show progress bar when duration is 0', () => {
      const toast = createToastConfig({ duration: 0 });
      renderToast({ toast });

      const progressBar = screen
        .getByRole('alert')
        .querySelector('.absolute.bottom-0');
      expect(progressBar).not.toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('has proper ARIA attributes', () => {
      renderToast();

      const toast = screen.getByRole('alert');
      expect(toast).toHaveAttribute('aria-live', 'assertive');
    });

    it('has accessible dismiss button', () => {
      const toast = createToastConfig({ dismissible: true });
      renderToast({ toast });

      const dismissButton = screen.getByLabelText('Dismiss notification');
      expect(dismissButton).toHaveAttribute('type', 'button');
      expect(dismissButton).toHaveAttribute(
        'aria-label',
        'Dismiss notification'
      );
    });

    it('passes accessibility audit', async () => {
      const toast = createToastConfig({
        title: 'Test Title',
        dismissible: true,
        variant: 'success',
      });
      const { container } = renderToast({ toast });

      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });
  });
});

describe('ToastContainer Component', () => {
  it('renders multiple toasts', () => {
    const toasts = [
      createToastConfig({ id: 'toast-1', message: 'First toast' }),
      createToastConfig({ id: 'toast-2', message: 'Second toast' }),
    ];

    render(<ToastContainer toasts={toasts} onDismiss={jest.fn()} />);

    expect(screen.getByText('First toast')).toBeInTheDocument();
    expect(screen.getByText('Second toast')).toBeInTheDocument();
  });

  it('limits toasts to maxToasts', () => {
    const toasts = [
      createToastConfig({ id: 'toast-1', message: 'First toast' }),
      createToastConfig({ id: 'toast-2', message: 'Second toast' }),
      createToastConfig({ id: 'toast-3', message: 'Third toast' }),
    ];

    render(
      <ToastContainer toasts={toasts} onDismiss={jest.fn()} maxToasts={2} />
    );

    expect(screen.getByText('First toast')).toBeInTheDocument();
    expect(screen.getByText('Second toast')).toBeInTheDocument();
    expect(screen.queryByText('Third toast')).not.toBeInTheDocument();
  });

  it('applies correct position classes', () => {
    const positions: ToastPosition[] = [
      'top-left',
      'top-center',
      'top-right',
      'bottom-left',
      'bottom-center',
      'bottom-right',
    ];

    positions.forEach(position => {
      const { container } = render(
        <ToastContainer
          toasts={[createToastConfig()]}
          onDismiss={jest.fn()}
          position={position}
        />
      );

      const positionContainer = container.querySelector('.fixed.z-50');
      expect(positionContainer).toBeInTheDocument();

      // Check that position-specific classes are applied
      if (position.includes('top')) {
        expect(positionContainer).toHaveClass('top-4');
      }
      if (position.includes('bottom')) {
        expect(positionContainer).toHaveClass('bottom-4');
      }
      if (position.includes('left')) {
        expect(positionContainer).toHaveClass('left-4');
      }
      if (position.includes('right')) {
        expect(positionContainer).toHaveClass('right-4');
      }
      if (position.includes('center')) {
        expect(positionContainer).toHaveClass('left-1/2');
      }
    });
  });
});

describe('useToast Hook', () => {
  let toastMethods: any;

  beforeEach(() => {
    jest.clearAllTimers();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
  });

  it('provides toast management methods', () => {
    render(
      <TestToastHook
        onToastMethods={methods => {
          toastMethods = methods;
        }}
      />
    );

    expect(toastMethods).toHaveProperty('addToast');
    expect(toastMethods).toHaveProperty('removeToast');
    expect(toastMethods).toHaveProperty('clearToasts');
    expect(toastMethods).toHaveProperty('success');
    expect(toastMethods).toHaveProperty('error');
    expect(toastMethods).toHaveProperty('warning');
    expect(toastMethods).toHaveProperty('info');
  });

  it('adds toasts with convenience methods', async () => {
    render(<TestToastHook />);

    await userEvent.click(screen.getByText('Add Success Toast'));
    expect(screen.getByText('Success message')).toBeInTheDocument();

    await userEvent.click(screen.getByText('Add Error Toast'));
    expect(screen.getByText('Error message')).toBeInTheDocument();

    await userEvent.click(screen.getByText('Add Warning Toast'));
    expect(screen.getByText('Warning message')).toBeInTheDocument();

    await userEvent.click(screen.getByText('Add Info Toast'));
    expect(screen.getByText('Info message')).toBeInTheDocument();
  });

  it('clears all toasts', async () => {
    render(<TestToastHook />);

    // Add some toasts
    await userEvent.click(screen.getByText('Add Success Toast'));
    await userEvent.click(screen.getByText('Add Error Toast'));

    expect(screen.getByText('Success message')).toBeInTheDocument();
    expect(screen.getByText('Error message')).toBeInTheDocument();

    // Clear all toasts
    await userEvent.click(screen.getByText('Clear All Toasts'));

    expect(screen.queryByText('Success message')).not.toBeInTheDocument();
    expect(screen.queryByText('Error message')).not.toBeInTheDocument();
  });

  it('removes individual toasts', () => {
    render(
      <TestToastHook
        onToastMethods={methods => {
          toastMethods = methods;
        }}
      />
    );

    // Add a toast
    const toastId = toastMethods.addToast({ message: 'Test message' });
    expect(screen.getByText('Test message')).toBeInTheDocument();

    // Remove the toast
    act(() => {
      toastMethods.removeToast(toastId);
    });

    expect(screen.queryByText('Test message')).not.toBeInTheDocument();
  });

  it('generates unique IDs for toasts', () => {
    render(
      <TestToastHook
        onToastMethods={methods => {
          toastMethods = methods;
        }}
      />
    );

    const id1 = toastMethods.addToast({ message: 'Message 1' });
    const id2 = toastMethods.addToast({ message: 'Message 2' });

    expect(id1).not.toBe(id2);
    expect(typeof id1).toBe('string');
    expect(typeof id2).toBe('string');
  });

  it('applies default configuration to toasts', () => {
    render(
      <TestToastHook
        onToastMethods={methods => {
          toastMethods = methods;
        }}
      />
    );

    toastMethods.addToast({ message: 'Test message' });

    // Check that default values are applied
    expect(toastMethods.toasts[0]).toMatchObject({
      message: 'Test message',
      duration: 5000,
      dismissible: true,
      showIcon: true,
      position: 'top-right',
    });
  });
});
