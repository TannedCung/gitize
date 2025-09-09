/**
 * Accessibility testing setup and configuration tests
 */

import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe, configureAxe } from 'jest-axe';
import {
  renderWithProviders,
  testComprehensiveAccessibility,
  accessibilityTests,
} from '../test-utils';
import {
  AccessibilityProvider,
  useAccessibility,
} from '../AccessibilityProvider';

// Configure axe for comprehensive testing
beforeAll(() => {
  configureAxe({
    rules: {
      // Enable all WCAG 2.1 AA rules
      'color-contrast': { enabled: true },
      'color-contrast-enhanced': { enabled: true },
      'focus-order-semantics': { enabled: true },
      keyboard: { enabled: true },
      'aria-allowed-attr': { enabled: true },
      'aria-allowed-role': { enabled: true },
      'aria-hidden-body': { enabled: true },
      'aria-hidden-focus': { enabled: true },
      'aria-input-field-name': { enabled: true },
      'aria-label': { enabled: true },
      'aria-labelledby': { enabled: true },
      'aria-required-attr': { enabled: true },
      'aria-required-children': { enabled: true },
      'aria-required-parent': { enabled: true },
      'aria-roles': { enabled: true },
      'aria-valid-attr': { enabled: true },
      'aria-valid-attr-value': { enabled: true },
      'form-field-multiple-labels': { enabled: true },
      label: { enabled: true },
      'label-content-name-mismatch': { enabled: true },
      'label-title-only': { enabled: true },
      'input-button-name': { enabled: true },
      'input-image-alt': { enabled: true },
      'heading-order': { enabled: true },
      'empty-heading': { enabled: true },
      'p-as-heading': { enabled: true },
      'image-alt': { enabled: true },
      'image-redundant-alt': { enabled: true },
      'object-alt': { enabled: true },
      'svg-img-alt': { enabled: true },
      'link-in-text-block': { enabled: true },
      'link-name': { enabled: true },
      'identical-links-same-purpose': { enabled: true },
    },
    tags: ['wcag2a', 'wcag2aa', 'wcag21aa'],
  });
});

// Test component for accessibility provider
const TestAccessibilityComponent: React.FC = () => {
  const {
    announcePolite,
    announceAssertive,
    announceFormError,
    announceFormSuccess,
    announcePageChange,
    announceDataLoaded,
  } = useAccessibility();

  return (
    <div>
      <h1>Accessibility Test Component</h1>
      <button onClick={() => announcePolite('Polite announcement')}>
        Announce Polite
      </button>
      <button onClick={() => announceAssertive('Assertive announcement')}>
        Announce Assertive
      </button>
      <button onClick={() => announceFormError('email', 'Email is required')}>
        Announce Form Error
      </button>
      <button
        onClick={() => announceFormSuccess('Form submitted successfully')}
      >
        Announce Form Success
      </button>
      <button onClick={() => announcePageChange('Home Page')}>
        Announce Page Change
      </button>
      <button onClick={() => announceDataLoaded(5, 'items')}>
        Announce Data Loaded
      </button>
    </div>
  );
};

describe('Accessibility Setup and Configuration', () => {
  describe('Axe Configuration', () => {
    it('has proper axe configuration for comprehensive testing', async () => {
      const { container } = render(
        <div>
          <h1>Test Heading</h1>
          <button>Test Button</button>
          <input aria-label="Test Input" />
        </div>
      );

      const results = await axe(container);
      expect(results.violations).toHaveLength(0);
      expect(results.passes.length).toBeGreaterThan(0);
    });

    it('detects color contrast violations', async () => {
      const { container } = render(
        <div style={{ color: '#ccc', backgroundColor: '#ddd' }}>
          Low contrast text
        </div>
      );

      const results = await axe(container);
      const contrastViolations = results.violations.filter(
        v => v.id === 'color-contrast'
      );
      expect(contrastViolations.length).toBeGreaterThan(0);
    });

    it('detects missing ARIA labels', async () => {
      const { container } = render(
        <button>{/* Button with no accessible name */}</button>
      );

      const results = await axe(container);
      const labelViolations = results.violations.filter(
        v => v.id === 'button-name'
      );
      expect(labelViolations.length).toBeGreaterThan(0);
    });

    it('detects improper heading structure', async () => {
      const { container } = render(
        <div>
          <h1>Main Heading</h1>
          <h3>Skipped H2</h3> {/* This should cause a violation */}
        </div>
      );

      const results = await axe(container);
      const headingViolations = results.violations.filter(
        v => v.id === 'heading-order'
      );
      expect(headingViolations.length).toBeGreaterThan(0);
    });
  });

  describe('Accessibility Provider', () => {
    it('provides accessibility context correctly', () => {
      render(
        <AccessibilityProvider>
          <TestAccessibilityComponent />
        </AccessibilityProvider>
      );

      // All buttons should be rendered
      expect(screen.getByText('Announce Polite')).toBeInTheDocument();
      expect(screen.getByText('Announce Assertive')).toBeInTheDocument();
      expect(screen.getByText('Announce Form Error')).toBeInTheDocument();
      expect(screen.getByText('Announce Form Success')).toBeInTheDocument();
      expect(screen.getByText('Announce Page Change')).toBeInTheDocument();
      expect(screen.getByText('Announce Data Loaded')).toBeInTheDocument();
    });

    it('throws error when used outside provider', () => {
      // Mock console.error to avoid noise in test output
      const consoleSpy = jest
        .spyOn(console, 'error')
        .mockImplementation(() => {});

      expect(() => {
        render(<TestAccessibilityComponent />);
      }).toThrow(
        'useAccessibility must be used within an AccessibilityProvider'
      );

      consoleSpy.mockRestore();
    });

    it('handles announcements without errors', async () => {
      const user = userEvent.setup();

      render(
        <AccessibilityProvider>
          <TestAccessibilityComponent />
        </AccessibilityProvider>
      );

      // Test each announcement type
      await user.click(screen.getByText('Announce Polite'));
      await user.click(screen.getByText('Announce Assertive'));
      await user.click(screen.getByText('Announce Form Error'));
      await user.click(screen.getByText('Announce Form Success'));
      await user.click(screen.getByText('Announce Page Change'));
      await user.click(screen.getByText('Announce Data Loaded'));

      // No errors should be thrown
      expect(true).toBe(true);
    });
  });

  describe('Comprehensive Testing Utilities', () => {
    it('runs comprehensive accessibility tests', async () => {
      const { container } = renderWithProviders(
        <div>
          <h1>Test Page</h1>
          <button>Test Button</button>
          <input aria-label="Test Input" />
          <a href="#test">Test Link</a>
        </div>
      );

      const results = await testComprehensiveAccessibility(container);

      expect(results).toHaveProperty('passed');
      expect(results).toHaveProperty('violations');
      expect(results).toHaveProperty('summary');
      expect(results.summary).toHaveProperty('violationCount');
      expect(results.summary).toHaveProperty('passCount');
    });

    it('runs specific accessibility tests', async () => {
      const { container } = renderWithProviders(
        <form>
          <label htmlFor="test-input">Test Label</label>
          <input id="test-input" type="text" />
          <button type="submit">Submit</button>
        </form>
      );

      // Test each specific test function
      const colorResults = await accessibilityTests.colorContrast(container);
      const keyboardResults = await accessibilityTests.keyboard(container);
      const ariaResults = await accessibilityTests.aria(container);
      const formResults = await accessibilityTests.forms(container);

      expect(colorResults).toHaveProperty('passed');
      expect(keyboardResults).toHaveProperty('passed');
      expect(ariaResults).toHaveProperty('passed');
      expect(formResults).toHaveProperty('passed');
    });
  });

  describe('Theme Accessibility', () => {
    it('maintains accessibility in light theme', async () => {
      const { container } = renderWithProviders(
        <div>
          <h1>Light Theme Test</h1>
          <button>Test Button</button>
        </div>,
        { theme: 'light' }
      );

      const results = await testComprehensiveAccessibility(container);
      expect(results.passed).toBe(true);
    });

    it('maintains accessibility in dark theme', async () => {
      const { container } = renderWithProviders(
        <div>
          <h1>Dark Theme Test</h1>
          <button>Test Button</button>
        </div>,
        { theme: 'dark' }
      );

      const results = await testComprehensiveAccessibility(container);
      expect(results.passed).toBe(true);
    });
  });

  describe('Performance Impact', () => {
    it('accessibility testing completes within reasonable time', async () => {
      const startTime = Date.now();

      const { container } = renderWithProviders(
        <div>
          {/* Create a moderately complex DOM */}
          {Array.from({ length: 50 }, (_, i) => (
            <div key={i}>
              <h2>Section {i + 1}</h2>
              <p>Content for section {i + 1}</p>
              <button>Button {i + 1}</button>
              <input aria-label={`Input ${i + 1}`} />
            </div>
          ))}
        </div>
      );

      await testComprehensiveAccessibility(container);

      const endTime = Date.now();
      const duration = endTime - startTime;

      // Should complete within 5 seconds for reasonable DOM size
      expect(duration).toBeLessThan(5000);
    });
  });

  describe('Error Handling', () => {
    it('handles malformed DOM gracefully', async () => {
      const { container } = render(
        <div>
          {/* Intentionally problematic markup */}
          <div role="button" tabIndex={0}>
            <div role="button" tabIndex={0}>
              Nested interactive elements
            </div>
          </div>
        </div>
      );

      // Should not throw, but should detect violations
      const results = await testComprehensiveAccessibility(container);
      expect(results).toHaveProperty('violations');
      expect(results.violations.length).toBeGreaterThan(0);
    });

    it('handles empty containers', async () => {
      const { container } = render(<div></div>);

      const results = await testComprehensiveAccessibility(container);
      expect(results.passed).toBe(true);
      expect(results.violations).toHaveLength(0);
    });
  });
});
