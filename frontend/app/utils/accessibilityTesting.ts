/**
 * Comprehensive accessibility testing utilities
 */

import React from 'react';
import { axe } from 'jest-axe';

// Define types since we're using jest-axe instead of axe-core directly
export interface AxeViolation {
  id: string;
  impact?: 'minor' | 'moderate' | 'serious' | 'critical';
  description: string;
  help: string;
  helpUrl: string;
  tags: string[];
  nodes: Array<{
    html: string;
    failureSummary?: string;
  }>;
}

export interface AxeResults {
  violations: AxeViolation[];
  incomplete: AxeViolation[];
  passes: AxeViolation[];
}

export interface AccessibilityTestResult {
  passed: boolean;
  violations: AxeViolation[];
  incomplete: AxeViolation[];
  passes: AxeViolation[];
  summary: {
    violationCount: number;
    incompleteCount: number;
    passCount: number;
    criticalViolations: number;
    seriousViolations: number;
    moderateViolations: number;
    minorViolations: number;
  };
}

export interface AccessibilityTestOptions {
  /** Axe rules to include */
  rules?: Record<string, { enabled: boolean }>;
  /** Tags to include in testing */
  tags?: string[];
  /** Elements to exclude from testing */
  exclude?: string[];
  /** Elements to include in testing */
  include?: string[];
  /** Whether to test for WCAG 2.1 AA compliance */
  wcag21aa?: boolean;
  /** Whether to test for WCAG 2.1 AAA compliance */
  wcag21aaa?: boolean;
}

/**
 * Run comprehensive accessibility tests on an element
 */
export async function runAccessibilityTests(
  element: Element,
  options: AccessibilityTestOptions = {}
): Promise<AccessibilityTestResult> {
  const {
    rules,
    // eslint-disable-next-line no-unused-vars
    tags: _tags = ['wcag2a', 'wcag2aa', 'wcag21aa'],
    exclude,
    include,
    // eslint-disable-next-line no-unused-vars
    wcag21aa: _wcag21aa = true,
    // eslint-disable-next-line no-unused-vars
    wcag21aaa: _wcag21aaa = false,
  } = options;

  try {
    // Use jest-axe which has a simpler API
    const results = await axe(element, {
      rules: rules || {},
      ...(include && { include }),
      ...(exclude && { exclude }),
    });

    // Categorize violations by impact
    const criticalViolations = results.violations.filter(
      v => v.impact === 'critical'
    ).length;
    const seriousViolations = results.violations.filter(
      v => v.impact === 'serious'
    ).length;
    const moderateViolations = results.violations.filter(
      v => v.impact === 'moderate'
    ).length;
    const minorViolations = results.violations.filter(
      v => v.impact === 'minor'
    ).length;

    return {
      passed: results.violations.length === 0,
      violations: results.violations,
      incomplete: results.incomplete || [],
      passes: results.passes || [],
      summary: {
        violationCount: results.violations.length,
        incompleteCount: results.incomplete?.length || 0,
        passCount: results.passes?.length || 0,
        criticalViolations,
        seriousViolations,
        moderateViolations,
        minorViolations,
      },
    };
  } catch (error) {
    console.error('Accessibility testing failed:', error);
    throw new Error(`Accessibility testing failed: ${error}`);
  }
}

/**
 * Test color contrast ratios
 */
export async function testColorContrast(
  element: Element
): Promise<AccessibilityTestResult> {
  return runAccessibilityTests(element, {
    rules: {
      'color-contrast': { enabled: true },
      'color-contrast-enhanced': { enabled: true },
    },
    tags: ['wcag2aa', 'wcag21aa'],
  });
}

/**
 * Test keyboard accessibility
 */
export async function testKeyboardAccessibility(
  element: Element
): Promise<AccessibilityTestResult> {
  return runAccessibilityTests(element, {
    rules: {
      keyboard: { enabled: true },
      'focus-order-semantics': { enabled: true },
      'focusable-content': { enabled: true },
      tabindex: { enabled: true },
    },
    tags: ['wcag2a', 'wcag2aa'],
  });
}

/**
 * Test ARIA implementation
 */
export async function testAriaImplementation(
  element: Element
): Promise<AccessibilityTestResult> {
  return runAccessibilityTests(element, {
    rules: {
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
    },
    tags: ['wcag2a', 'wcag2aa'],
  });
}

/**
 * Test form accessibility
 */
export async function testFormAccessibility(
  element: Element
): Promise<AccessibilityTestResult> {
  return runAccessibilityTests(element, {
    rules: {
      'form-field-multiple-labels': { enabled: true },
      label: { enabled: true },
      'label-content-name-mismatch': { enabled: true },
      'label-title-only': { enabled: true },
      'input-button-name': { enabled: true },
      'input-image-alt': { enabled: true },
    },
    tags: ['wcag2a', 'wcag2aa'],
  });
}

/**
 * Test heading structure
 */
export async function testHeadingStructure(
  element: Element
): Promise<AccessibilityTestResult> {
  return runAccessibilityTests(element, {
    rules: {
      'heading-order': { enabled: true },
      'empty-heading': { enabled: true },
      'p-as-heading': { enabled: true },
    },
    tags: ['wcag2a', 'wcag2aa'],
  });
}

/**
 * Test image accessibility
 */
export async function testImageAccessibility(
  element: Element
): Promise<AccessibilityTestResult> {
  return runAccessibilityTests(element, {
    rules: {
      'image-alt': { enabled: true },
      'image-redundant-alt': { enabled: true },
      'object-alt': { enabled: true },
      'svg-img-alt': { enabled: true },
    },
    tags: ['wcag2a', 'wcag2aa'],
  });
}

/**
 * Test link accessibility
 */
export async function testLinkAccessibility(
  element: Element
): Promise<AccessibilityTestResult> {
  return runAccessibilityTests(element, {
    rules: {
      'link-in-text-block': { enabled: true },
      'link-name': { enabled: true },
      'identical-links-same-purpose': { enabled: true },
    },
    tags: ['wcag2a', 'wcag2aa'],
  });
}

/**
 * Generate accessibility report
 */
export function generateAccessibilityReport(
  results: AccessibilityTestResult
): string {
  const { summary, violations, incomplete } = results;

  let report = '# Accessibility Test Report\n\n';

  // Summary
  report += '## Summary\n';
  report += `- **Status**: ${results.passed ? '✅ PASSED' : '❌ FAILED'}\n`;
  report += `- **Total Violations**: ${summary.violationCount}\n`;
  report += `- **Critical**: ${summary.criticalViolations}\n`;
  report += `- **Serious**: ${summary.seriousViolations}\n`;
  report += `- **Moderate**: ${summary.moderateViolations}\n`;
  report += `- **Minor**: ${summary.minorViolations}\n`;
  report += `- **Incomplete Tests**: ${summary.incompleteCount}\n`;
  report += `- **Passed Tests**: ${summary.passCount}\n\n`;

  // Violations
  if (violations.length > 0) {
    report += '## Violations\n\n';
    violations.forEach((violation, index) => {
      report += `### ${index + 1}. ${violation.description}\n`;
      report += `- **Impact**: ${violation.impact}\n`;
      report += `- **Help**: ${violation.help}\n`;
      report += `- **Help URL**: ${violation.helpUrl}\n`;
      report += `- **Tags**: ${violation.tags.join(', ')}\n`;

      if (violation.nodes.length > 0) {
        report += '- **Affected Elements**:\n';
        violation.nodes.forEach(node => {
          report += `  - \`${node.html}\`\n`;
          if (node.failureSummary) {
            report += `    - ${node.failureSummary}\n`;
          }
        });
      }
      report += '\n';
    });
  }

  // Incomplete tests
  if (incomplete.length > 0) {
    report += '## Incomplete Tests\n\n';
    incomplete.forEach((item, index) => {
      report += `### ${index + 1}. ${item.description}\n`;
      report += `- **Help**: ${item.help}\n`;
      report += `- **Help URL**: ${item.helpUrl}\n\n`;
    });
  }

  return report;
}

/**
 * Custom accessibility matchers for Jest
 */
export const accessibilityMatchers = {
  /**
   * Check if element has no accessibility violations
   */
  async toBeAccessible(element: Element, options?: AccessibilityTestOptions) {
    const results = await runAccessibilityTests(element, options);

    return {
      pass: results.passed,
      message: () => {
        if (results.passed) {
          return 'Expected element to have accessibility violations, but none were found';
        } else {
          const report = generateAccessibilityReport(results);
          return `Expected element to be accessible, but found violations:\n${report}`;
        }
      },
    };
  },

  /**
   * Check if element has proper color contrast
   */
  async toHaveProperColorContrast(element: Element) {
    const results = await testColorContrast(element);

    return {
      pass: results.passed,
      message: () => {
        if (results.passed) {
          return 'Expected element to have color contrast violations, but none were found';
        } else {
          return `Expected element to have proper color contrast, but found ${results.summary.violationCount} violations`;
        }
      },
    };
  },

  /**
   * Check if element is keyboard accessible
   */
  async toBeKeyboardAccessible(element: Element) {
    const results = await testKeyboardAccessibility(element);

    return {
      pass: results.passed,
      message: () => {
        if (results.passed) {
          return 'Expected element to have keyboard accessibility violations, but none were found';
        } else {
          return `Expected element to be keyboard accessible, but found ${results.summary.violationCount} violations`;
        }
      },
    };
  },

  /**
   * Check if element has proper ARIA implementation
   */
  async toHaveProperAria(element: Element) {
    const results = await testAriaImplementation(element);

    return {
      pass: results.passed,
      message: () => {
        if (results.passed) {
          return 'Expected element to have ARIA violations, but none were found';
        } else {
          return `Expected element to have proper ARIA implementation, but found ${results.summary.violationCount} violations`;
        }
      },
    };
  },
};

/**
 * Batch accessibility testing for multiple elements
 */
export async function batchAccessibilityTest(
  elements: Element[],
  options?: AccessibilityTestOptions
): Promise<AccessibilityTestResult[]> {
  const results = await Promise.all(
    elements.map(element => runAccessibilityTests(element, options))
  );

  return results;
}

/**
 * Accessibility testing for component variants
 */
export async function testComponentVariantsAccessibility<
  T extends Record<string, any>,
>(
  Component: React.ComponentType<T>,
  baseProps: T,
  variants: Array<Partial<T>>,
  // eslint-disable-next-line no-unused-vars
  renderFn: (_component: React.ReactElement) => Element
): Promise<AccessibilityTestResult[]> {
  const results: AccessibilityTestResult[] = [];

  for (const variant of variants) {
    const props = { ...baseProps, ...variant };
    const element = renderFn(React.createElement(Component, props));
    const result = await runAccessibilityTests(element);
    results.push(result);
  }

  return results;
}
/**
 * Import flat design accessibility utilities
 */
import {
  auditFlatDesignAccessibility,
  generateFlatDesignAccessibilityReport,
  FlatDesignAccessibilityResult,
} from './flatDesignAccessibility';

/**
 * Test flat design accessibility compliance
 */
export async function testFlatDesignAccessibility(
  element: Element
): Promise<FlatDesignAccessibilityResult> {
  return auditFlatDesignAccessibility(element);
}

/**
 * Test WCAG 2.1 AA compliance specifically for flat design
 */
export async function testWCAG21AAFlatDesign(
  element: Element
): Promise<AccessibilityTestResult> {
  const flatDesignResult = await testFlatDesignAccessibility(element);
  const axeResult = await runAccessibilityTests(element, {
    tags: ['wcag21aa'],
    wcag21aa: true,
  });

  // Combine results
  const combinedViolations = [
    ...axeResult.violations,
    ...(!flatDesignResult.passed
      ? [
          {
            id: 'flat-design-compliance',
            impact: 'serious' as const,
            description: 'Flat design accessibility compliance issues',
            help: 'Ensure flat design meets WCAG 2.1 AA standards',
            helpUrl: 'https://www.w3.org/WAI/WCAG21/Understanding/',
            tags: ['wcag21aa', 'flat-design'],
            nodes: [
              {
                html: element.outerHTML.substring(0, 100) + '...',
                failureSummary:
                  generateFlatDesignAccessibilityReport(flatDesignResult),
              },
            ],
          },
        ]
      : []),
  ];

  return {
    passed: axeResult.passed && flatDesignResult.passed,
    violations: combinedViolations,
    incomplete: axeResult.incomplete,
    passes: axeResult.passes,
    summary: {
      ...axeResult.summary,
      violationCount: combinedViolations.length,
    },
  };
}

/**
 * Enhanced accessibility tests including flat design compliance
 */
export const enhancedAccessibilityTests = {
  colorContrast: (container: HTMLElement) => testColorContrast(container),
  keyboard: (container: HTMLElement) => testKeyboardAccessibility(container),
  aria: (container: HTMLElement) => testAriaImplementation(container),
  forms: (container: HTMLElement) => testFormAccessibility(container),
  headings: (container: HTMLElement) => testHeadingStructure(container),
  images: (container: HTMLElement) => testImageAccessibility(container),
  links: (container: HTMLElement) => testLinkAccessibility(container),
  flatDesign: (container: HTMLElement) =>
    testFlatDesignAccessibility(container),
  wcag21aaFlatDesign: (container: HTMLElement) =>
    testWCAG21AAFlatDesign(container),
};

/**
 * Comprehensive flat design accessibility audit
 */
export async function runComprehensiveFlatDesignAudit(
  element: Element
): Promise<{
  axeResults: AccessibilityTestResult;
  flatDesignResults: FlatDesignAccessibilityResult;
  combinedReport: string;
  passed: boolean;
}> {
  const axeResults = await runAccessibilityTests(element, {
    tags: ['wcag21aa'],
    wcag21aa: true,
  });

  const flatDesignResults = await testFlatDesignAccessibility(element);

  const passed = axeResults.passed && flatDesignResults.passed;

  let combinedReport = '# Comprehensive Flat Design Accessibility Audit\n\n';

  // Overall status
  combinedReport += `## Overall Status: ${passed ? '✅ PASSED' : '❌ FAILED'}\n\n`;

  // Axe results summary
  combinedReport += '## Standard WCAG 2.1 AA Compliance\n';
  combinedReport += `- **Status**: ${axeResults.passed ? '✅ PASSED' : '❌ FAILED'}\n`;
  combinedReport += `- **Violations**: ${axeResults.summary.violationCount}\n`;
  combinedReport += `- **Passes**: ${axeResults.summary.passCount}\n\n`;

  // Flat design results
  combinedReport += generateFlatDesignAccessibilityReport(flatDesignResults);

  // Recommendations
  combinedReport += '## Implementation Recommendations\n\n';
  combinedReport += '### For Flat Design Accessibility:\n';
  combinedReport +=
    '1. **Color Contrast**: Use neutral grays with sufficient contrast ratios\n';
  combinedReport +=
    '2. **Focus Indicators**: Implement minimal but visible focus rings\n';
  combinedReport +=
    '3. **Typography Hierarchy**: Rely on font size and weight for content organization\n';
  combinedReport +=
    '4. **Semantic Structure**: Maintain proper HTML semantics despite minimal styling\n';
  combinedReport +=
    '5. **Whitespace**: Use generous spacing for content organization\n\n';

  if (axeResults.violations.length > 0) {
    combinedReport += '### Standard WCAG Violations to Address:\n';
    axeResults.violations.forEach((violation, index) => {
      combinedReport += `${index + 1}. **${violation.description}**\n`;
      combinedReport += `   - Impact: ${violation.impact}\n`;
      combinedReport += `   - Help: ${violation.help}\n\n`;
    });
  }

  return {
    axeResults,
    flatDesignResults,
    combinedReport,
    passed,
  };
}
