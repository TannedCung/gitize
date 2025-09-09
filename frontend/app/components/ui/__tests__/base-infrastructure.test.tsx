import React from 'react';
import { render, screen } from '@testing-library/react';
import {
  BaseComponentProps,
  InteractiveComponentProps,
  cn,
  createVariantClasses,
  createFocusRing,
  createTransition,
  renderWithProviders,
  testAccessibility,
  testBothThemes,
  commonTestScenarios,
  createMockFunctions,
} from '../index';

// Test component that uses BaseComponentProps
const TestBaseComponent: React.FC<BaseComponentProps> = ({
  className,
  children,
  'data-testid': dataTestId,
  'aria-label': ariaLabel,
}) => (
  <div
    className={cn('base-component', className)}
    data-testid={dataTestId}
    aria-label={ariaLabel}
  >
    {children}
  </div>
);

// Test component that uses InteractiveComponentProps
const TestInteractiveComponent: React.FC<InteractiveComponentProps> = ({
  className,
  children,
  disabled,
  loading,
  onClick,
  onKeyDown,
  'data-testid': dataTestId,
  'aria-label': ariaLabel,
}) => (
  <button
    className={cn(
      'interactive-component',
      createVariantClasses('button', 'primary', 'md'),
      createFocusRing('primary'),
      createTransition(['colors']),
      className
    )}
    disabled={disabled || loading}
    onClick={onClick}
    onKeyDown={onKeyDown}
    data-testid={dataTestId}
    aria-label={ariaLabel}
    aria-disabled={disabled || loading}
  >
    {loading ? 'Loading...' : children}
  </button>
);

describe('Base Component Infrastructure', () => {
  describe('TypeScript Interfaces', () => {
    it('should accept BaseComponentProps correctly', () => {
      const props: BaseComponentProps = {
        className: 'test-class',
        children: 'Test content',
        'data-testid': 'test-component',
        'aria-label': 'Test label',
      };

      render(<TestBaseComponent {...props} />);

      const element = screen.getByTestId('test-component');
      expect(element).toBeInTheDocument();
      expect(element).toHaveClass('test-class');
      expect(element).toHaveAttribute('aria-label', 'Test label');
      expect(element).toHaveTextContent('Test content');
    });

    it('should accept InteractiveComponentProps correctly', () => {
      const mockFunctions = createMockFunctions();
      const props: InteractiveComponentProps = {
        className: 'interactive-class',
        children: 'Click me',
        disabled: false,
        loading: false,
        onClick: mockFunctions.onClick,
        onKeyDown: mockFunctions.onKeyDown,
        'data-testid': 'interactive-component',
        'aria-label': 'Interactive button',
      };

      render(<TestInteractiveComponent {...props} />);

      const element = screen.getByTestId('interactive-component');
      expect(element).toBeInTheDocument();
      expect(element).toHaveClass('interactive-class');
      expect(element).toHaveAttribute('aria-label', 'Interactive button');
      expect(element).not.toBeDisabled();
    });
  });

  describe('Utility Functions', () => {
    describe('cn (className merging)', () => {
      it('should merge classes correctly', () => {
        const result = cn('base-class', 'additional-class', {
          'conditional-class': true,
        });
        expect(result).toContain('base-class');
        expect(result).toContain('additional-class');
        expect(result).toContain('conditional-class');
      });

      it('should handle conditional classes', () => {
        const result = cn('base-class', {
          'conditional-true': true,
          'conditional-false': false,
        });
        expect(result).toContain('conditional-true');
        expect(result).not.toContain('conditional-false');
      });
    });

    describe('createVariantClasses', () => {
      it('should create button variant classes', () => {
        const result = createVariantClasses('button', 'primary', 'md');
        expect(result).toContain('bg-blue-600');
        expect(result).toContain('px-4');
        expect(result).toContain('py-2');
      });

      it('should create alert variant classes', () => {
        const result = createVariantClasses('alert', 'danger');
        expect(result).toContain('bg-red-50');
        expect(result).toContain('text-red-800');
      });
    });

    describe('createFocusRing', () => {
      it('should create focus ring classes', () => {
        const result = createFocusRing('primary');
        expect(result).toContain('focus:outline-none');
        expect(result).toContain('focus:ring-2');
        expect(result).toContain('focus:ring-blue-500');
      });

      it('should create danger focus ring classes', () => {
        const result = createFocusRing('danger');
        expect(result).toContain('focus:ring-red-500');
      });
    });

    describe('createTransition', () => {
      it('should create transition classes', () => {
        const result = createTransition(['colors']);
        expect(result).toContain('transition-colors');
        expect(result).toContain('duration-200');
        expect(result).toContain('ease-in-out');
      });
    });
  });

  describe('Testing Utilities', () => {
    describe('renderWithProviders', () => {
      it('should render component with light theme', () => {
        const { container } = renderWithProviders(
          <TestBaseComponent data-testid="theme-test">
            Theme Test
          </TestBaseComponent>,
          { theme: 'light' }
        );

        expect(container.firstChild).not.toHaveClass('dark');
        expect(screen.getByTestId('theme-test')).toBeInTheDocument();
      });

      it('should render component with dark theme', () => {
        const { container } = renderWithProviders(
          <TestBaseComponent data-testid="theme-test">
            Theme Test
          </TestBaseComponent>,
          { theme: 'dark' }
        );

        expect(container.firstChild).toHaveClass('dark');
        expect(screen.getByTestId('theme-test')).toBeInTheDocument();
      });
    });

    describe('testAccessibility', () => {
      it('should pass accessibility tests for basic component', async () => {
        const { container } = renderWithProviders(
          <TestBaseComponent aria-label="Accessible component">
            Accessible content
          </TestBaseComponent>
        );

        await testAccessibility(container);
      });

      it('should pass accessibility tests for interactive component', async () => {
        const { container } = renderWithProviders(
          <TestInteractiveComponent aria-label="Accessible button">
            Click me
          </TestInteractiveComponent>
        );

        await testAccessibility(container);
      });
    });

    describe('testBothThemes', () => {
      it('should test component in both themes', async () => {
        await testBothThemes(
          <TestBaseComponent aria-label="Theme test">
            Theme content
          </TestBaseComponent>
        );
      });
    });

    describe('commonTestScenarios', () => {
      it('should test component renders without crashing', async () => {
        await commonTestScenarios.rendersWithoutCrashing(TestBaseComponent, {
          children: 'Test content',
          'aria-label': 'Test component',
        });
      });

      it('should test disabled state handling', async () => {
        await commonTestScenarios.handlesDisabledState(
          TestInteractiveComponent,
          { children: 'Test button', 'aria-label': 'Test button' }
        );
      });

      it('should test loading state handling', async () => {
        await commonTestScenarios.handlesLoadingState(
          TestInteractiveComponent,
          { children: 'Test button', 'aria-label': 'Test button' }
        );
      });
    });

    describe('createMockFunctions', () => {
      it('should create mock functions', () => {
        const mocks = createMockFunctions();

        expect(mocks.onClick).toBeDefined();
        expect(mocks.onKeyDown).toBeDefined();
        expect(mocks.onChange).toBeDefined();
        expect(mocks.onFocus).toBeDefined();
        expect(mocks.onBlur).toBeDefined();
        expect(mocks.onSubmit).toBeDefined();

        expect(jest.isMockFunction(mocks.onClick)).toBe(true);
      });
    });
  });

  describe('Component State Handling', () => {
    it('should handle disabled state correctly', () => {
      render(
        <TestInteractiveComponent
          disabled={true}
          data-testid="disabled-component"
          aria-label="Disabled button"
        >
          Disabled Button
        </TestInteractiveComponent>
      );

      const element = screen.getByTestId('disabled-component');
      expect(element).toBeDisabled();
      expect(element).toHaveAttribute('aria-disabled', 'true');
    });

    it('should handle loading state correctly', () => {
      render(
        <TestInteractiveComponent
          loading={true}
          data-testid="loading-component"
          aria-label="Loading button"
        >
          Click me
        </TestInteractiveComponent>
      );

      const element = screen.getByTestId('loading-component');
      expect(element).toBeDisabled();
      expect(element).toHaveAttribute('aria-disabled', 'true');
      expect(element).toHaveTextContent('Loading...');
    });
  });
});
