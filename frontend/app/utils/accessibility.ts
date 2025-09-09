/**
 * Accessibility utility functions for testing and validation
 */

export interface AccessibilityCheckResult {
  passed: boolean;
  message: string;
  element?: Element;
}

/**
 * Check if an element has proper ARIA labels
 */
export function checkAriaLabels(element: Element): AccessibilityCheckResult {
  const interactiveElements = element.querySelectorAll(
    'button, a, input, select, textarea, [role="button"], [role="link"]'
  );

  for (let i = 0; i < interactiveElements.length; i++) {
    const el = interactiveElements[i];
    const hasAriaLabel = el.hasAttribute('aria-label');
    const hasAriaLabelledBy = el.hasAttribute('aria-labelledby');
    const hasTitle = el.hasAttribute('title');
    const hasTextContent = el.textContent?.trim();

    if (!hasAriaLabel && !hasAriaLabelledBy && !hasTitle && !hasTextContent) {
      return {
        passed: false,
        message: `Interactive element missing accessible name: ${el.tagName}`,
        element: el,
      };
    }
  }

  return {
    passed: true,
    message: 'All interactive elements have accessible names',
  };
}

/**
 * Check if headings are properly structured
 */
export function checkHeadingStructure(
  element: Element
): AccessibilityCheckResult {
  const headings = Array.from(
    element.querySelectorAll('h1, h2, h3, h4, h5, h6')
  );

  if (headings.length === 0) {
    return {
      passed: true,
      message: 'No headings found',
    };
  }

  let previousLevel = 0;

  for (let i = 0; i < headings.length; i++) {
    const heading = headings[i];
    const currentLevel = parseInt(heading.tagName.charAt(1));

    if (previousLevel > 0 && currentLevel > previousLevel + 1) {
      return {
        passed: false,
        message: `Heading level skipped: ${heading.tagName} after h${previousLevel}`,
        element: heading,
      };
    }

    previousLevel = currentLevel;
  }

  return {
    passed: true,
    message: 'Heading structure is valid',
  };
}

/**
 * Check color contrast ratios (simplified check)
 */
export function checkColorContrast(element: Element): AccessibilityCheckResult {
  const textElements = element.querySelectorAll(
    'p, span, div, a, button, label'
  );

  for (let i = 0; i < textElements.length; i++) {
    const el = textElements[i];
    const styles = window.getComputedStyle(el);
    const color = styles.color;
    const backgroundColor = styles.backgroundColor;

    // This is a simplified check - in a real implementation,
    // you'd calculate the actual contrast ratio
    if (color === backgroundColor) {
      return {
        passed: false,
        message: 'Text color matches background color',
        element: el,
      };
    }
  }

  return {
    passed: true,
    message: 'Basic color contrast check passed',
  };
}

/**
 * Check for keyboard accessibility
 */
export function checkKeyboardAccessibility(
  element: Element
): AccessibilityCheckResult {
  const interactiveElements = element.querySelectorAll(
    'button, a, input, select, textarea, [role="button"], [role="link"], [tabindex]'
  );

  for (let i = 0; i < interactiveElements.length; i++) {
    const el = interactiveElements[i];
    const tabIndex = el.getAttribute('tabindex');

    if (tabIndex === '-1' && !el.hasAttribute('aria-hidden')) {
      return {
        passed: false,
        message: 'Interactive element is not keyboard accessible',
        element: el,
      };
    }
  }

  return {
    passed: true,
    message: 'All interactive elements are keyboard accessible',
  };
}

/**
 * Run all accessibility checks
 */
export function runAccessibilityChecks(
  element: Element
): AccessibilityCheckResult[] {
  return [
    checkAriaLabels(element),
    checkHeadingStructure(element),
    checkColorContrast(element),
    checkKeyboardAccessibility(element),
  ];
}

/**
 * Get accessibility summary
 */
export function getAccessibilitySummary(results: AccessibilityCheckResult[]): {
  passed: number;
  failed: number;
  total: number;
  issues: AccessibilityCheckResult[];
} {
  const passed = results.filter(r => r.passed).length;
  const failed = results.filter(r => !r.passed).length;
  const issues = results.filter(r => !r.passed);

  return {
    passed,
    failed,
    total: results.length,
    issues,
  };
}
