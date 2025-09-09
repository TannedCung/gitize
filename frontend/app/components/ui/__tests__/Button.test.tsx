import React from 'react';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Button, ButtonProps } from '../Button';
import {
  renderWithProviders,
  testAccessibility,
  testBothThemes,
  testComponentVariants,
  commonTestScenarios,
  createMockFunctions,
} from '../test-utils';

// Mock functions for testing
const mockFunctions = createMockFunctions();

describe('Button Component', () => {
  // Reset mocks before each test
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Basic Rendering', () => {
    it('renders without crashing', async () => {
      await commonTestScenarios.rendersWithoutCrashing(Button, {
        children: 'Test Button',
      });
    });

    it('renders with correct text content', () => {
      renderWithProviders(<Button>Click me</Button>);
      expect(
        screen.getByRole('button', { name: 'Click me' })
      ).toBeInTheDocument();
    });

    it('renders with custom aria-label', () => {
      renderWithProviders(<Button aria-label="Custom label">Button</Button>);
      expect(
        screen.getByRole('button', { name: 'Custom label' })
      ).toBeInTheDocument();
    });

    it('renders with data-testid', () => {
      renderWithProviders(<Button data-testid="test-button">Button</Button>);
      expect(screen.getByTestId('test-button')).toBeInTheDocument();
    });
  });

  describe('Variants', () => {
    const variants: Array<{
      variant: ButtonProps['variant'];
      expectedClass: string;
    }> = [
      { variant: 'primary', expectedClass: 'bg-accent-blue-500' },
      { variant: 'secondary', expectedClass: 'bg-neutral-100' },
      { variant: 'outline', expectedClass: 'bg-transparent' },
      { variant: 'ghost', expectedClass: 'bg-transparent' },
      { variant: 'danger', expectedClass: 'bg-accent-red-500' },
    ];

    variants.forEach(({ variant, expectedClass }) => {
      it(`renders ${variant} variant correctly`, () => {
        renderWithProviders(<Button variant={variant}>Test Button</Button>);
        const button = screen.getByRole('button');
        expect(button).toHaveClass(expectedClass);
      });
    });

    it('defaults to primary variant when no variant is specified', () => {
      renderWithProviders(<Button>Default Button</Button>);
      const button = screen.getByRole('button');
      expect(button).toHaveClass('bg-accent-blue-500');
    });
  });

  describe('Sizes', () => {
    const sizes: Array<{ size: ButtonProps['size']; expectedClass: string }> = [
      { size: 'sm', expectedClass: 'px-3 py-1.5 text-sm font-normal' },
      { size: 'md', expectedClass: 'px-4 py-2 text-sm font-medium' },
      { size: 'lg', expectedClass: 'px-6 py-3 text-base font-semibold' },
    ];

    sizes.forEach(({ size, expectedClass }) => {
      it(`renders ${size} size correctly`, () => {
        renderWithProviders(<Button size={size}>Test Button</Button>);
        const button = screen.getByRole('button');
        expect(button).toHaveClass(expectedClass);
      });
    });

    it('defaults to medium size when no size is specified', () => {
      renderWithProviders(<Button>Default Button</Button>);
      const button = screen.getByRole('button');
      expect(button).toHaveClass('px-4 py-2 text-sm font-medium');
    });
  });

  describe('States', () => {
    it('handles disabled state correctly', async () => {
      await commonTestScenarios.handlesDisabledState(Button, {
        children: 'Disabled Button',
      });
    });

    it('handles loading state correctly', async () => {
      await commonTestScenarios.handlesLoadingState(Button, {
        children: 'Loading Button',
      });
    });

    it('shows loading spinner when loading', () => {
      renderWithProviders(<Button loading>Loading Button</Button>);
      const button = screen.getByRole('button');
      const spinner = button.querySelector('svg');
      expect(spinner).toBeInTheDocument();
      expect(spinner).toHaveClass('animate-spin');
    });

    it('disables button when loading', () => {
      renderWithProviders(<Button loading>Loading Button</Button>);
      const button = screen.getByRole('button');
      expect(button).toBeDisabled();
      expect(button).toHaveAttribute('aria-disabled', 'true');
    });

    it('applies full width class when fullWidth is true', () => {
      renderWithProviders(<Button fullWidth>Full Width Button</Button>);
      const button = screen.getByRole('button');
      expect(button).toHaveClass('w-full');
    });
  });

  describe('Icons', () => {
    const TestIcon = () => <span data-testid="test-icon">Icon</span>;

    it('renders left icon correctly', () => {
      renderWithProviders(
        <Button leftIcon={<TestIcon />}>Button with Left Icon</Button>
      );
      expect(screen.getByTestId('test-icon')).toBeInTheDocument();
    });

    it('renders right icon correctly', () => {
      renderWithProviders(
        <Button rightIcon={<TestIcon />}>Button with Right Icon</Button>
      );
      expect(screen.getByTestId('test-icon')).toBeInTheDocument();
    });

    it('renders both left and right icons', () => {
      renderWithProviders(
        <Button
          leftIcon={<span data-testid="left-icon">Left</span>}
          rightIcon={<span data-testid="right-icon">Right</span>}
        >
          Button with Both Icons
        </Button>
      );
      expect(screen.getByTestId('left-icon')).toBeInTheDocument();
      expect(screen.getByTestId('right-icon')).toBeInTheDocument();
    });

    it('hides right icon when loading', () => {
      renderWithProviders(
        <Button loading rightIcon={<TestIcon />}>
          Loading Button
        </Button>
      );
      expect(screen.queryByTestId('test-icon')).not.toBeInTheDocument();
    });

    it('shows loading spinner instead of left icon when loading', () => {
      renderWithProviders(
        <Button loading leftIcon={<TestIcon />}>
          Loading Button
        </Button>
      );
      expect(screen.queryByTestId('test-icon')).not.toBeInTheDocument();
      const spinner = screen.getByRole('button').querySelector('svg');
      expect(spinner).toBeInTheDocument();
    });
  });

  describe('Interactions', () => {
    it('calls onClick when clicked', async () => {
      const user = userEvent.setup();
      renderWithProviders(
        <Button onClick={mockFunctions.onClick}>Clickable Button</Button>
      );

      const button = screen.getByRole('button');
      await user.click(button);

      expect(mockFunctions.onClick).toHaveBeenCalledTimes(1);
    });

    it('does not call onClick when disabled', async () => {
      const user = userEvent.setup();
      renderWithProviders(
        <Button disabled onClick={mockFunctions.onClick}>
          Disabled Button
        </Button>
      );

      const button = screen.getByRole('button');
      await user.click(button);

      expect(mockFunctions.onClick).not.toHaveBeenCalled();
    });

    it('does not call onClick when loading', async () => {
      const user = userEvent.setup();
      renderWithProviders(
        <Button loading onClick={mockFunctions.onClick}>
          Loading Button
        </Button>
      );

      const button = screen.getByRole('button');
      await user.click(button);

      expect(mockFunctions.onClick).not.toHaveBeenCalled();
    });

    it('handles Enter key press', async () => {
      const user = userEvent.setup();
      renderWithProviders(
        <Button onClick={mockFunctions.onClick}>Keyboard Button</Button>
      );

      const button = screen.getByRole('button');
      button.focus();
      await user.keyboard('{Enter}');

      expect(mockFunctions.onClick).toHaveBeenCalledTimes(1);
    });

    it('handles Space key press', async () => {
      const user = userEvent.setup();
      renderWithProviders(
        <Button onClick={mockFunctions.onClick}>Keyboard Button</Button>
      );

      const button = screen.getByRole('button');
      button.focus();
      await user.keyboard(' ');

      expect(mockFunctions.onClick).toHaveBeenCalledTimes(1);
    });

    it('calls onKeyDown when provided', async () => {
      const user = userEvent.setup();
      renderWithProviders(
        <Button onKeyDown={mockFunctions.onKeyDown}>Keyboard Button</Button>
      );

      const button = screen.getByRole('button');
      button.focus();
      await user.keyboard('{Tab}');

      expect(mockFunctions.onKeyDown).toHaveBeenCalledTimes(1);
    });

    it('does not handle keyboard events when disabled', async () => {
      const user = userEvent.setup();
      renderWithProviders(
        <Button
          disabled
          onClick={mockFunctions.onClick}
          onKeyDown={mockFunctions.onKeyDown}
        >
          Disabled Button
        </Button>
      );

      const button = screen.getByRole('button');
      button.focus();
      await user.keyboard('{Enter}');
      await user.keyboard(' ');

      expect(mockFunctions.onClick).not.toHaveBeenCalled();
      expect(mockFunctions.onKeyDown).not.toHaveBeenCalled();
    });
  });

  describe('Button Types', () => {
    it('defaults to button type', () => {
      renderWithProviders(<Button>Default Type</Button>);
      const button = screen.getByRole('button');
      expect(button).toHaveAttribute('type', 'button');
    });

    it('renders submit type correctly', () => {
      renderWithProviders(<Button type="submit">Submit Button</Button>);
      const button = screen.getByRole('button');
      expect(button).toHaveAttribute('type', 'submit');
    });

    it('renders reset type correctly', () => {
      renderWithProviders(<Button type="reset">Reset Button</Button>);
      const button = screen.getByRole('button');
      expect(button).toHaveAttribute('type', 'reset');
    });
  });

  describe('Custom Styling', () => {
    it('applies custom className', () => {
      renderWithProviders(
        <Button className="custom-class">Custom Button</Button>
      );
      const button = screen.getByRole('button');
      expect(button).toHaveClass('custom-class');
    });

    it('merges custom className with default classes', () => {
      renderWithProviders(
        <Button className="custom-class">Custom Button</Button>
      );
      const button = screen.getByRole('button');
      expect(button).toHaveClass('custom-class');
      expect(button).toHaveClass('bg-accent-blue-500'); // Default primary variant class
    });
  });

  describe('Accessibility', () => {
    it('passes accessibility tests', async () => {
      const { container } = renderWithProviders(
        <Button>Accessible Button</Button>
      );
      await testAccessibility(container);
    });

    it('passes accessibility tests in both themes', async () => {
      await testBothThemes(<Button>Theme Button</Button>);
    });

    it('has proper ARIA attributes when disabled', () => {
      renderWithProviders(<Button disabled>Disabled Button</Button>);
      const button = screen.getByRole('button');
      expect(button).toHaveAttribute('aria-disabled', 'true');
    });

    it('has proper ARIA attributes when loading', () => {
      renderWithProviders(<Button loading>Loading Button</Button>);
      const button = screen.getByRole('button');
      expect(button).toHaveAttribute('aria-disabled', 'true');
    });

    it('maintains focus ring for keyboard navigation', () => {
      renderWithProviders(<Button>Focus Button</Button>);
      const button = screen.getByRole('button');
      expect(button).toHaveClass('focus:outline-none');
      expect(button).toHaveClass('focus:ring-1'); // Minimal focus ring for flat design
    });

    it('has proper focus ring colors for different variants', () => {
      const variants: Array<{
        variant: ButtonProps['variant'];
        focusClass: string;
      }> = [
        { variant: 'primary', focusClass: 'focus:ring-accent-blue-500' },
        { variant: 'secondary', focusClass: 'focus:ring-neutral-500' },
        { variant: 'outline', focusClass: 'focus:ring-neutral-500' },
        { variant: 'ghost', focusClass: 'focus:ring-neutral-500' },
        { variant: 'danger', focusClass: 'focus:ring-accent-red-500' },
      ];

      variants.forEach(({ variant, focusClass }) => {
        const { unmount } = renderWithProviders(
          <Button variant={variant}>Focus Button</Button>
        );
        const button = screen.getByRole('button');
        expect(button).toHaveClass(focusClass);
        unmount();
      });
    });
  });

  describe('Component Variants Testing', () => {
    it('tests all variant combinations', async () => {
      const baseProps: ButtonProps = {
        children: 'Test Button',
      };

      const variants = [
        { variant: 'primary' as const },
        { variant: 'secondary' as const },
        { variant: 'outline' as const },
        { variant: 'ghost' as const },
        { variant: 'danger' as const },
        { size: 'sm' as const },
        { size: 'md' as const },
        { size: 'lg' as const },
        { disabled: true },
        { loading: true },
        { fullWidth: true },
      ];

      await testComponentVariants(Button, baseProps, variants);
    });
  });

  describe('Forward Ref', () => {
    it('forwards ref correctly', () => {
      const ref = React.createRef<HTMLButtonElement>();
      renderWithProviders(<Button ref={ref}>Ref Button</Button>);

      expect(ref.current).toBeInstanceOf(HTMLButtonElement);
      expect(ref.current?.textContent).toBe('Ref Button');
    });
  });

  describe('Loading Spinner', () => {
    it('renders loading spinner with correct size for small button', () => {
      renderWithProviders(
        <Button size="sm" loading>
          Small Loading
        </Button>
      );
      const spinner = screen.getByRole('button').querySelector('svg');
      expect(spinner).toHaveClass('w-3 h-3');
    });

    it('renders loading spinner with correct size for medium button', () => {
      renderWithProviders(
        <Button size="md" loading>
          Medium Loading
        </Button>
      );
      const spinner = screen.getByRole('button').querySelector('svg');
      expect(spinner).toHaveClass('w-4 h-4');
    });

    it('renders loading spinner with correct size for large button', () => {
      renderWithProviders(
        <Button size="lg" loading>
          Large Loading
        </Button>
      );
      const spinner = screen.getByRole('button').querySelector('svg');
      expect(spinner).toHaveClass('w-5 h-5');
    });
  });
});
