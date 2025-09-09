import React, { ReactElement } from 'react';
import { render, RenderOptions, RenderResult } from '@testing-library/react';
import { axe, toHaveNoViolations } from 'jest-axe';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import {
  runAccessibilityTests,
  testColorContrast,
  testKeyboardAccessibility,
  testAriaImplementation,
  testFormAccessibility,
  testHeadingStructure,
  testImageAccessibility,
  testLinkAccessibility,
  AccessibilityTestResult,
  AccessibilityTestOptions,
  accessibilityMatchers,
} from '../../utils/accessibilityTesting';

// Extend Jest matchers to include axe accessibility testing
expect.extend(toHaveNoViolations);
expect.extend(accessibilityMatchers);

/**
 * Custom render function that includes theme provider and other global providers
 */
interface CustomRenderOptions extends Omit<RenderOptions, 'wrapper'> {
  /** Initial theme mode for testing */
  theme?: 'light' | 'dark';
  /** Additional wrapper components */
  wrapper?: React.ComponentType<{ children: React.ReactNode }>;
}

/**
 * Enhanced render function with theme support
 */
export function renderWithProviders(
  ui: ReactElement,
  options: CustomRenderOptions = {}
): RenderResult {
  const { theme = 'light', wrapper, ...renderOptions } = options;

  // Create a wrapper that includes theme class
  const ThemeWrapper: React.FC<{ children: React.ReactNode }> = ({
    children,
  }) => {
    const WrapperComponent = wrapper || React.Fragment;
    return (
      <div className={theme === 'dark' ? 'dark' : ''}>
        <WrapperComponent>{children}</WrapperComponent>
      </div>
    );
  };

  return render(ui, {
    wrapper: ThemeWrapper,
    ...renderOptions,
  });
}

/**
 * Test accessibility of a rendered component
 */
export async function testAccessibility(container: HTMLElement): Promise<void> {
  const results = await axe(container);
  expect(results).toHaveNoViolations();
}

/**
 * Comprehensive accessibility testing
 */
export async function testComprehensiveAccessibility(
  container: HTMLElement,
  options?: AccessibilityTestOptions
): Promise<AccessibilityTestResult> {
  return await runAccessibilityTests(container, options);
}

/**
 * Test specific accessibility aspects
 */
export const accessibilityTests = {
  colorContrast: (container: HTMLElement) => testColorContrast(container),
  keyboard: (container: HTMLElement) => testKeyboardAccessibility(container),
  aria: (container: HTMLElement) => testAriaImplementation(container),
  forms: (container: HTMLElement) => testFormAccessibility(container),
  headings: (container: HTMLElement) => testHeadingStructure(container),
  images: (container: HTMLElement) => testImageAccessibility(container),
  links: (container: HTMLElement) => testLinkAccessibility(container),
};

/**
 * Test component in both light and dark themes
 */
export async function testBothThemes(
  component: ReactElement,
  testFn?: (
    _container: HTMLElement,
    _theme: 'light' | 'dark'
  ) => Promise<void> | void
): Promise<void> {
  // Test light theme
  const lightRender = renderWithProviders(component, { theme: 'light' });
  await testAccessibility(lightRender.container);
  if (testFn) {
    await testFn(lightRender.container, 'light');
  }
  lightRender.unmount();

  // Test dark theme
  const darkRender = renderWithProviders(component, { theme: 'dark' });
  await testAccessibility(darkRender.container);
  if (testFn) {
    await testFn(darkRender.container, 'dark');
  }
  darkRender.unmount();
}

/**
 * Test keyboard navigation for interactive components
 */
export async function testKeyboardNavigation(
  container: HTMLElement,
  expectedFocusableElements: number
): Promise<void> {
  const user = userEvent.setup();

  // Get all focusable elements
  const focusableElements = container.querySelectorAll(
    'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
  );

  expect(focusableElements).toHaveLength(expectedFocusableElements);

  // Test tab navigation
  for (let i = 0; i < focusableElements.length; i++) {
    await user.tab();
    expect(document.activeElement).toBe(focusableElements[i]);
  }
}

/**
 * Test component variants and states
 */
export async function testComponentVariants<T extends Record<string, any>>(
  Component: React.ComponentType<T>,
  baseProps: T,
  variants: Array<Partial<T>>
): Promise<void> {
  for (const variant of variants) {
    const props = { ...baseProps, ...variant };

    const { container, unmount } = renderWithProviders(
      <Component {...props} />,
      { theme: 'light' }
    );

    // Test accessibility for each variant
    await testAccessibility(container);

    // Verify component renders
    expect(container.firstChild).toBeInTheDocument();

    unmount();
  }
}

/**
 * Mock user interactions for testing
 */
export const mockUserInteractions = {
  /**
   * Simulate click interaction
   */
  async click(element: HTMLElement): Promise<void> {
    const user = userEvent.setup();
    await user.click(element);
  },

  /**
   * Simulate keyboard interaction
   */
  async keyboard(keys: string): Promise<void> {
    const user = userEvent.setup();
    await user.keyboard(keys);
  },

  /**
   * Simulate typing in an input
   */
  async type(element: HTMLElement, text: string): Promise<void> {
    const user = userEvent.setup();
    await user.type(element, text);
  },

  /**
   * Simulate hover interaction
   */
  async hover(element: HTMLElement): Promise<void> {
    const user = userEvent.setup();
    await user.hover(element);
  },

  /**
   * Simulate focus interaction
   */
  async focus(element: HTMLElement): Promise<void> {
    element.focus();
  },
};

/**
 * Common test scenarios for components
 */
export const commonTestScenarios = {
  /**
   * Test that component renders without crashing
   */
  async rendersWithoutCrashing<T extends Record<string, any>>(
    Component: React.ComponentType<T>,
    props: T
  ): Promise<void> {
    const { container, unmount } = renderWithProviders(
      <Component {...(props as any)} />
    );
    expect(container.firstChild).toBeInTheDocument();
    await testAccessibility(container);
    unmount();
  },

  /**
   * Test that component handles disabled state correctly
   */
  async handlesDisabledState<T extends { disabled?: boolean }>(
    Component: React.ComponentType<T>,
    props: T
  ): Promise<void> {
    const { container, getByRole, unmount } = renderWithProviders(
      <Component {...props} disabled={true} />
    );

    const element =
      getByRole('button') || (container.firstChild as HTMLElement);
    expect(element).toHaveAttribute('aria-disabled', 'true');
    await testAccessibility(container);
    unmount();
  },

  /**
   * Test that component handles loading state correctly
   */
  async handlesLoadingState<T extends { loading?: boolean }>(
    Component: React.ComponentType<T>,
    props: T
  ): Promise<void> {
    const { container, unmount } = renderWithProviders(
      <Component {...props} loading={true} />
    );

    await testAccessibility(container);
    unmount();
  },
};

/**
 * Utility to create mock functions for testing
 */
export const createMockFunctions = () => ({
  onClick: jest.fn(),
  onKeyDown: jest.fn(),
  onChange: jest.fn(),
  onFocus: jest.fn(),
  onBlur: jest.fn(),
  onSubmit: jest.fn(),
});
