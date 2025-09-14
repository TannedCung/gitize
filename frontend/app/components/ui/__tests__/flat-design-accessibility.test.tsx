import React from 'react';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {
  renderWithProviders,
  testComprehensiveFlatDesignAccessibility,
  accessibilityTests,
  testBothThemes,
} from '../test-utils';
import { Button } from '../Button';
import { TextField } from '../TextField';
import { Checkbox } from '../Checkbox';
import { Toggle } from '../Toggle';
import { Alert } from '../Alert';
import { NavigationBar } from '../NavigationBar';
import { Modal } from '../Modal';

describe('Flat Design Accessibility Compliance', () => {
  describe('WCAG 2.1 AA Color Contrast', () => {
    it('Button components meet color contrast requirements', async () => {
      const variants: Array<{ variant: any; name: string }> = [
        { variant: 'primary', name: 'Primary Button' },
        { variant: 'secondary', name: 'Secondary Button' },
        { variant: 'outline', name: 'Outline Button' },
        { variant: 'ghost', name: 'Ghost Button' },
        { variant: 'danger', name: 'Danger Button' },
      ];

      for (const { variant, name } of variants) {
        const { container, unmount } = renderWithProviders(
          <Button variant={variant}>{name}</Button>
        );

        const results = await accessibilityTests.colorContrast(container);
        expect(results.passed).toBe(true);

        // Test in both themes
        unmount();
        const { container: darkContainer, unmount: darkUnmount } =
          renderWithProviders(<Button variant={variant}>{name}</Button>, {
            theme: 'dark',
          });

        const darkResults =
          await accessibilityTests.colorContrast(darkContainer);
        expect(darkResults.passed).toBe(true);

        darkUnmount();
      }
    });

    it('TextField components meet color contrast requirements', async () => {
      const { container } = renderWithProviders(
        <div>
          <TextField label="Normal Field" value="" onChange={() => {}} />
          <TextField
            label="Error Field"
            value=""
            onChange={() => {}}
            error="This field has an error"
          />
          <TextField
            label="Disabled Field"
            value=""
            onChange={() => {}}
            disabled
          />
        </div>
      );

      const results = await accessibilityTests.colorContrast(container);
      expect(results.passed).toBe(true);
    });

    it('Navigation components meet color contrast requirements', async () => {
      const { container } = renderWithProviders(
        <NavigationBar
          title="Test Navigation"
          items={[
            { label: 'Home', href: '/', active: true },
            { label: 'About', href: '/about' },
            { label: 'Contact', href: '/contact' },
          ]}
        />
      );

      const results = await accessibilityTests.colorContrast(container);
      expect(results.passed).toBe(true);
    });

    it('Alert components meet color contrast requirements', async () => {
      const variants: Array<{ variant: any; title: string }> = [
        { variant: 'info', title: 'Info Alert' },
        { variant: 'success', title: 'Success Alert' },
        { variant: 'warning', title: 'Warning Alert' },
        { variant: 'error', title: 'Error Alert' },
      ];

      for (const { variant, title } of variants) {
        const { container, unmount } = renderWithProviders(
          <Alert
            variant={variant}
            title={title}
            message="This is a test alert message"
          />
        );

        const results = await accessibilityTests.colorContrast(container);
        expect(results.passed).toBe(true);

        unmount();
      }
    });
  });

  describe('Focus Indicators for Flat Design', () => {
    it('Button components have proper focus indicators', async () => {
      const user = userEvent.setup();
      const { container } = renderWithProviders(
        <div>
          <Button variant="primary">Primary Button</Button>
          <Button variant="secondary">Secondary Button</Button>
          <Button variant="outline">Outline Button</Button>
        </div>
      );

      // Test keyboard navigation and focus indicators
      const buttons = screen.getAllByRole('button');

      for (const button of buttons) {
        // Focus the button
        button.focus();

        // Check that focus is visible (should have focus classes or styles)
        expect(button).toHaveClass(/focus:/);

        // Test keyboard interaction
        await user.keyboard('{Enter}');

        // Button should still be focusable after interaction
        expect(document.activeElement).toBe(button);
      }

      // Test flat design focus compliance
      const results = await accessibilityTests.flatDesign(container);
      expect(results.checks.focusIndicators.passed).toBe(true);
    });

    it('TextField components have proper focus indicators', async () => {
      const user = userEvent.setup();
      const { container } = renderWithProviders(
        <div>
          <TextField label="Text Field 1" value="" onChange={() => {}} />
          <TextField label="Text Field 2" value="" onChange={() => {}} />
        </div>
      );

      const inputs = screen.getAllByRole('textbox');

      for (const input of inputs) {
        // Focus the input
        await user.click(input);

        // Check focus indicator
        expect(input).toHaveClass(/focus:/);

        // Type in the input
        await user.type(input, 'test');

        // Input should maintain focus
        expect(document.activeElement).toBe(input);
      }

      const results = await accessibilityTests.flatDesign(container);
      expect(results.checks.focusIndicators.passed).toBe(true);
    });

    it('Interactive components maintain focus visibility in both themes', async () => {
      await testBothThemes(
        <div>
          <Button>Test Button</Button>
          <TextField label="Test Field" value="" onChange={() => {}} />
          <Checkbox checked={false} onChange={() => {}} label="Test Checkbox" />
        </div>,
        async (container, theme) => {
          const results = await accessibilityTests.flatDesign(container);
          expect(results.checks.focusIndicators.passed).toBe(true);
        }
      );
    });
  });

  describe('Semantic Structure and Typography Hierarchy', () => {
    it('maintains proper heading hierarchy without visual styling', async () => {
      const { container } = renderWithProviders(
        <div>
          <h1>Main Heading</h1>
          <h2>Section Heading</h2>
          <h3>Subsection Heading</h3>
          <p>Body text content</p>
          <h2>Another Section</h2>
          <h3>Another Subsection</h3>
        </div>
      );

      const results = await accessibilityTests.headings(container);
      expect(results.passed).toBe(true);

      const flatDesignResults = await accessibilityTests.flatDesign(container);
      expect(flatDesignResults.checks.typographyHierarchy.passed).toBe(true);
    });

    it('uses semantic HTML structure for content organization', async () => {
      const { container } = renderWithProviders(
        <main>
          <header>
            <h1>Page Title</h1>
            <NavigationBar
              title="Navigation"
              items={[{ label: 'Home', href: '/' }]}
            />
          </header>
          <section>
            <h2>Content Section</h2>
            <p>This is content organized with semantic HTML.</p>
          </section>
          <aside>
            <h3>Sidebar Content</h3>
            <p>Additional information.</p>
          </aside>
          <footer>
            <p>Footer content</p>
          </footer>
        </main>
      );

      const results = await accessibilityTests.flatDesign(container);
      expect(results.checks.semanticStructure.passed).toBe(true);
    });

    it('typography provides clear content hierarchy', async () => {
      const { container } = renderWithProviders(
        <article>
          <h1 className="text-4xl font-bold">Article Title</h1>
          <h2 className="text-2xl font-semibold">Section Heading</h2>
          <p className="text-base leading-relaxed">
            Body text with proper line height and spacing for readability.
          </p>
          <h3 className="text-xl font-medium">Subsection</h3>
          <p className="text-base leading-relaxed">More body text content.</p>
        </article>
      );

      const results = await accessibilityTests.flatDesign(container);
      expect(results.checks.typographyHierarchy.passed).toBe(true);
    });
  });

  describe('Whitespace and Layout Organization', () => {
    it('uses adequate whitespace for content organization', async () => {
      const { container } = renderWithProviders(
        <div className="space-y-8">
          <section className="p-6">
            <h2 className="mb-4">Section 1</h2>
            <p className="mb-4">Content with proper spacing.</p>
          </section>
          <section className="p-6">
            <h2 className="mb-4">Section 2</h2>
            <p className="mb-4">More content with proper spacing.</p>
          </section>
        </div>
      );

      const results = await accessibilityTests.flatDesign(container);
      expect(results.checks.whitespaceOrganization.passed).toBe(true);
    });

    it('list components use whitespace for organization', async () => {
      const { container } = renderWithProviders(
        <div>
          <ul className="space-y-2">
            <li className="py-2">List item 1</li>
            <li className="py-2">List item 2</li>
            <li className="py-2">List item 3</li>
          </ul>
          <ol className="space-y-2 mt-6">
            <li className="py-2">Ordered item 1</li>
            <li className="py-2">Ordered item 2</li>
            <li className="py-2">Ordered item 3</li>
          </ol>
        </div>
      );

      const results = await accessibilityTests.flatDesign(container);
      expect(results.checks.whitespaceOrganization.passed).toBe(true);
    });
  });

  describe('Minimal Styling Compliance', () => {
    it('components follow flat design principles', async () => {
      const { container } = renderWithProviders(
        <div>
          <Button variant="primary">Flat Button</Button>
          <Button variant="secondary">Another Flat Button</Button>
          <TextField label="Flat Input" value="" onChange={() => {}} />
          <Checkbox checked={false} onChange={() => {}} label="Flat Checkbox" />
        </div>
      );

      const results = await accessibilityTests.flatDesign(container);
      expect(results.checks.minimalStyling.passed).toBe(true);
    });

    it('avoids shadows and gradients in interactive elements', async () => {
      const { container } = renderWithProviders(
        <div>
          <Button>No Shadow Button</Button>
          <div className="bg-neutral-100 p-4">
            <p>Flat background without gradients</p>
          </div>
        </div>
      );

      // Check that elements don't have box shadows or gradients
      const button = screen.getByRole('button');
      const styles = window.getComputedStyle(button);

      // Should not have box shadow (except for focus states)
      expect(styles.boxShadow).toBe('none');

      // Should not have gradient backgrounds
      expect(styles.background).not.toContain('gradient');

      const results = await accessibilityTests.flatDesign(container);
      expect(results.checks.minimalStyling.passed).toBe(true);
    });
  });

  describe('Modal and Dialog Accessibility', () => {
    it('modal maintains accessibility with flat design', async () => {
      const user = userEvent.setup();
      const { container } = renderWithProviders(
        <div>
          <Button data-testid="open-modal">Open Modal</Button>
          <Modal isOpen={true} onClose={() => {}} title="Test Modal">
            <div>
              <p>Modal content with flat design</p>
              <Button>Modal Button</Button>
            </div>
          </Modal>
        </div>
      );

      // Check modal accessibility
      const modal = screen.getByRole('dialog');
      expect(modal).toHaveAttribute('aria-labelledby');
      expect(modal).toHaveAttribute('aria-modal', 'true');

      // Check focus management
      const modalButton = screen.getByRole('button', { name: 'Modal Button' });
      expect(document.activeElement).toBe(modalButton);

      // Test flat design compliance
      const results = await accessibilityTests.flatDesign(container);
      expect(results.passed).toBe(true);
    });
  });

  describe('Comprehensive Flat Design Accessibility Audit', () => {
    it('complex form passes comprehensive flat design accessibility audit', async () => {
      const ComplexForm = () => (
        <main>
          <h1>Registration Form</h1>
          <form>
            <TextField
              label="Full Name"
              value=""
              onChange={() => {}}
              required
            />
            <TextField
              label="Email"
              type="email"
              value=""
              onChange={() => {}}
              required
            />
            <Checkbox
              checked={false}
              onChange={() => {}}
              label="Subscribe to newsletter"
            />
            <Toggle
              checked={false}
              onChange={() => {}}
              label="Enable notifications"
            />
            <div className="flex gap-4 mt-6">
              <Button type="submit" variant="primary">
                Submit
              </Button>
              <Button type="button" variant="secondary">
                Cancel
              </Button>
            </div>
          </form>
        </main>
      );

      const { container } = renderWithProviders(<ComplexForm />);

      const results = await testComprehensiveFlatDesignAccessibility(container);

      expect(results.passed).toBe(true);
      expect(results.axeResults.passed).toBe(true);
      expect(results.flatDesignResults.passed).toBe(true);

      // Verify specific flat design checks
      expect(results.flatDesignResults.checks.colorContrast.passed).toBe(true);
      expect(results.flatDesignResults.checks.focusIndicators.passed).toBe(
        true
      );
      expect(results.flatDesignResults.checks.semanticStructure.passed).toBe(
        true
      );
      expect(results.flatDesignResults.checks.typographyHierarchy.passed).toBe(
        true
      );
      expect(results.flatDesignResults.checks.minimalStyling.passed).toBe(true);
      expect(
        results.flatDesignResults.checks.whitespaceOrganization.passed
      ).toBe(true);
    });

    it('generates comprehensive accessibility report', async () => {
      const { container } = renderWithProviders(
        <div>
          <h1>Test Page</h1>
          <Button>Test Button</Button>
          <TextField label="Test Field" value="" onChange={() => {}} />
        </div>
      );

      const results = await testComprehensiveFlatDesignAccessibility(container);

      expect(results.report).toContain(
        'Comprehensive Flat Design Accessibility Audit'
      );
      expect(results.report).toContain('Overall Status:');
      expect(results.report).toContain('Standard WCAG 2.1 AA Compliance');
      expect(results.report).toContain('Implementation Recommendations');
    });

    it('passes accessibility tests in both light and dark themes', async () => {
      const TestComponent = () => (
        <div>
          <h1>Theme Test</h1>
          <Button variant="primary">Primary Button</Button>
          <Button variant="secondary">Secondary Button</Button>
          <TextField label="Test Input" value="" onChange={() => {}} />
          <Alert variant="info" title="Info" message="Test message" />
        </div>
      );

      await testBothThemes(<TestComponent />, async (container, theme) => {
        const results =
          await testComprehensiveFlatDesignAccessibility(container);

        expect(results.passed).toBe(true);
        expect(results.flatDesignResults.checks.colorContrast.passed).toBe(
          true
        );
        expect(results.flatDesignResults.checks.focusIndicators.passed).toBe(
          true
        );
      });
    });
  });
});
