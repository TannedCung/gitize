import React from 'react';
import { screen } from '@testing-library/react';
import { renderWithProviders } from '../test-utils';
import { auditFlatDesignAccessibility } from '../../../utils/flatDesignAccessibility';

describe('Basic Flat Design Accessibility', () => {
  describe('Color Contrast Validation', () => {
    it('validates color contrast for simple text elements', async () => {
      const { container } = renderWithProviders(
        <div>
          <h1 className="text-neutral-900 dark:text-neutral-100">
            Main Heading
          </h1>
          <p className="text-neutral-700 dark:text-neutral-300">
            Body text content
          </p>
          <button className="bg-accent-blue-500 text-white px-4 py-2">
            Action Button
          </button>
        </div>
      );

      const results = await auditFlatDesignAccessibility(container);

      // Should pass color contrast check
      expect(results.checks.colorContrast.passed).toBe(true);
    });

    it('detects poor color contrast', async () => {
      const { container } = renderWithProviders(
        <div>
          <p style={{ color: '#ccc', backgroundColor: '#ddd' }}>
            Poor contrast text
          </p>
        </div>
      );

      const results = await auditFlatDesignAccessibility(container);

      // Should fail color contrast check
      expect(results.checks.colorContrast.passed).toBe(false);
      expect(results.checks.colorContrast.message).toContain('contrast');
    });
  });

  describe('Focus Indicators', () => {
    it('validates focus indicators for interactive elements', async () => {
      const { container } = renderWithProviders(
        <div>
          <button className="focus:ring-1 focus:ring-accent-blue-500 px-4 py-2">
            Focusable Button
          </button>
          <a
            href="#"
            className="focus:outline-none focus:ring-1 focus:ring-accent-blue-500"
          >
            Focusable Link
          </a>
        </div>
      );

      const results = await auditFlatDesignAccessibility(container);

      // Should pass focus indicator check
      expect(results.checks.focusIndicators.passed).toBe(true);
    });

    it('detects missing focus indicators', async () => {
      const { container } = renderWithProviders(
        <div>
          <button style={{ outline: 'none' }}>
            Button without focus indicator
          </button>
        </div>
      );

      const results = await auditFlatDesignAccessibility(container);

      // Should fail focus indicator check
      expect(results.checks.focusIndicators.passed).toBe(false);
    });
  });

  describe('Semantic Structure', () => {
    it('validates proper heading hierarchy', async () => {
      const { container } = renderWithProviders(
        <div>
          <h1>Main Title</h1>
          <h2>Section Title</h2>
          <h3>Subsection Title</h3>
          <p>Content</p>
        </div>
      );

      const results = await auditFlatDesignAccessibility(container);

      // Should pass semantic structure check
      expect(results.checks.semanticStructure.passed).toBe(true);
    });

    it('detects missing H1 heading', async () => {
      const { container } = renderWithProviders(
        <div>
          <h2>Section Title</h2>
          <h3>Subsection Title</h3>
          <p>Content without main heading</p>
        </div>
      );

      const results = await auditFlatDesignAccessibility(container);

      // Should fail semantic structure check
      expect(results.checks.semanticStructure.passed).toBe(false);
      expect(results.checks.semanticStructure.message).toContain('H1');
    });
  });

  describe('Typography Hierarchy', () => {
    it('validates typography sizes and line heights', async () => {
      const { container } = renderWithProviders(
        <div>
          <h1 className="text-4xl leading-tight">Large Heading</h1>
          <h2 className="text-2xl leading-snug">Medium Heading</h2>
          <p className="text-base leading-relaxed">
            Body text with good line height
          </p>
        </div>
      );

      const results = await auditFlatDesignAccessibility(container);

      // Should pass typography hierarchy check
      expect(results.checks.typographyHierarchy.passed).toBe(true);
    });
  });

  describe('Minimal Styling Compliance', () => {
    it('validates flat design principles', async () => {
      const { container } = renderWithProviders(
        <div>
          <button className="bg-accent-blue-500 text-white px-4 py-2 rounded-sm">
            Flat Button
          </button>
          <div className="bg-neutral-100 p-4">Flat Container</div>
        </div>
      );

      const results = await auditFlatDesignAccessibility(container);

      // Should pass minimal styling check
      expect(results.checks.minimalStyling.passed).toBe(true);
    });

    it('detects non-flat styling', async () => {
      const { container } = renderWithProviders(
        <div>
          <button
            style={{
              boxShadow: '0 4px 8px rgba(0,0,0,0.3)',
              background: 'linear-gradient(to bottom, #fff, #ccc)',
            }}
          >
            Non-flat Button
          </button>
        </div>
      );

      const results = await auditFlatDesignAccessibility(container);

      // Should fail minimal styling check
      expect(results.checks.minimalStyling.passed).toBe(false);
    });
  });

  describe('Whitespace Organization', () => {
    it('validates adequate spacing', async () => {
      const { container } = renderWithProviders(
        <div>
          <section className="p-6 mb-8">
            <h2 className="mb-4">Section Title</h2>
            <p className="mb-4">Content with proper spacing</p>
          </section>
          <section className="p-6">
            <h2 className="mb-4">Another Section</h2>
            <p>More content</p>
          </section>
        </div>
      );

      const results = await auditFlatDesignAccessibility(container);

      // Should pass whitespace organization check
      expect(results.checks.whitespaceOrganization.passed).toBe(true);
    });
  });

  describe('Comprehensive Audit', () => {
    it('generates complete accessibility report', async () => {
      const { container } = renderWithProviders(
        <main>
          <h1 className="text-4xl font-bold text-neutral-900 dark:text-neutral-100 mb-6">
            Accessible Page
          </h1>
          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-neutral-800 dark:text-neutral-200 mb-4">
              Content Section
            </h2>
            <p className="text-base leading-relaxed text-neutral-700 dark:text-neutral-300 mb-4">
              This is accessible content with proper typography and spacing.
            </p>
            <button className="bg-accent-blue-500 hover:bg-accent-blue-600 text-white px-6 py-3 rounded-sm focus:outline-none focus:ring-1 focus:ring-accent-blue-500 focus:ring-offset-1">
              Accessible Button
            </button>
          </section>
        </main>
      );

      const results = await auditFlatDesignAccessibility(container);

      // Should pass all checks
      expect(results.passed).toBe(true);
      expect(results.summary.failedChecks).toBe(0);
      expect(results.summary.passedChecks).toBe(6);

      // Verify individual checks
      expect(results.checks.colorContrast.passed).toBe(true);
      expect(results.checks.focusIndicators.passed).toBe(true);
      expect(results.checks.semanticStructure.passed).toBe(true);
      expect(results.checks.typographyHierarchy.passed).toBe(true);
      expect(results.checks.minimalStyling.passed).toBe(true);
      expect(results.checks.whitespaceOrganization.passed).toBe(true);
    });

    it('provides detailed failure information', async () => {
      const { container } = renderWithProviders(
        <div>
          {/* Missing H1 */}
          <h2>Section without main heading</h2>
          {/* Poor contrast */}
          <p style={{ color: '#ccc', backgroundColor: '#ddd' }}>
            Poor contrast text
          </p>
          {/* Missing focus indicator */}
          <button style={{ outline: 'none' }}>Button without focus</button>
        </div>
      );

      const results = await auditFlatDesignAccessibility(container);

      // Should fail overall
      expect(results.passed).toBe(false);
      expect(results.summary.failedChecks).toBeGreaterThan(0);

      // Should have critical issues
      expect(results.summary.criticalIssues.length).toBeGreaterThan(0);
    });
  });
});
