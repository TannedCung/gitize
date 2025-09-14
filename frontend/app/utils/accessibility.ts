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
 * Convert RGB color to relative luminance
 */
function getRelativeLuminance(r: number, g: number, b: number): number {
  const [rs, gs, bs] = [r, g, b].map(c => {
    c = c / 255;
    return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
}

/**
 * Calculate contrast ratio between two colors
 */
function getContrastRatio(color1: string, color2: string): number {
  const parseColor = (color: string): [number, number, number] => {
    // Handle rgb() format
    const rgbMatch = color.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/);
    if (rgbMatch) {
      return [
        parseInt(rgbMatch[1]),
        parseInt(rgbMatch[2]),
        parseInt(rgbMatch[3]),
      ];
    }

    // Handle rgba() format
    const rgbaMatch = color.match(/rgba\((\d+),\s*(\d+),\s*(\d+),\s*[\d.]+\)/);
    if (rgbaMatch) {
      return [
        parseInt(rgbaMatch[1]),
        parseInt(rgbaMatch[2]),
        parseInt(rgbaMatch[3]),
      ];
    }

    // Handle hex format
    if (color.startsWith('#')) {
      const hex = color.slice(1);
      if (hex.length === 3) {
        return [
          parseInt(hex[0] + hex[0], 16),
          parseInt(hex[1] + hex[1], 16),
          parseInt(hex[2] + hex[2], 16),
        ];
      } else if (hex.length === 6) {
        return [
          parseInt(hex.slice(0, 2), 16),
          parseInt(hex.slice(2, 4), 16),
          parseInt(hex.slice(4, 6), 16),
        ];
      }
    }

    // Default to black if parsing fails
    return [0, 0, 0];
  };

  const [r1, g1, b1] = parseColor(color1);
  const [r2, g2, b2] = parseColor(color2);

  const lum1 = getRelativeLuminance(r1, g1, b1);
  const lum2 = getRelativeLuminance(r2, g2, b2);

  const brightest = Math.max(lum1, lum2);
  const darkest = Math.min(lum1, lum2);

  return (brightest + 0.05) / (darkest + 0.05);
}

/**
 * Check color contrast ratios for WCAG 2.1 AA compliance
 */
export function checkColorContrast(element: Element): AccessibilityCheckResult {
  const textElements = element.querySelectorAll(
    'p, span, div, a, button, label, h1, h2, h3, h4, h5, h6, input, textarea, select'
  );

  for (let i = 0; i < textElements.length; i++) {
    const el = textElements[i];
    const styles = window.getComputedStyle(el);
    const color = styles.color;
    const backgroundColor = styles.backgroundColor;

    // Skip elements with transparent backgrounds - check parent
    let bgColor = backgroundColor;
    let parentEl = el.parentElement;

    while (bgColor === 'rgba(0, 0, 0, 0)' || bgColor === 'transparent') {
      if (!parentEl) {
        bgColor = 'rgb(255, 255, 255)'; // Default to white
        break;
      }
      bgColor = window.getComputedStyle(parentEl).backgroundColor;
      parentEl = parentEl.parentElement;
    }

    // Calculate contrast ratio
    const contrastRatio = getContrastRatio(color, bgColor);

    // Check font size for different requirements
    const fontSize = parseFloat(styles.fontSize);
    const fontWeight = styles.fontWeight;
    const isLargeText =
      fontSize >= 18 ||
      (fontSize >= 14 &&
        (fontWeight === 'bold' || parseInt(fontWeight) >= 700));

    // WCAG 2.1 AA requirements
    const requiredRatio = isLargeText ? 3.0 : 4.5;

    if (contrastRatio < requiredRatio) {
      return {
        passed: false,
        message: `Insufficient color contrast: ${contrastRatio.toFixed(2)}:1 (required: ${requiredRatio}:1) for ${isLargeText ? 'large' : 'normal'} text`,
        element: el,
      };
    }
  }

  return {
    passed: true,
    message: 'All text meets WCAG 2.1 AA color contrast requirements',
  };
}

/**
 * Check focus indicators for flat design compliance
 */
export function checkFlatDesignFocusIndicators(
  element: Element
): AccessibilityCheckResult {
  const focusableElements = element.querySelectorAll(
    'button, a, input, select, textarea, [tabindex]:not([tabindex="-1"]), [role="button"], [role="link"]'
  );

  for (let i = 0; i < focusableElements.length; i++) {
    const el = focusableElements[i];
    const styles = window.getComputedStyle(el);

    // Check for focus outline styles that work with flat design
    const outlineStyle = styles.getPropertyValue('outline-style');
    const outlineWidth = styles.getPropertyValue('outline-width');
    const outlineColor = styles.getPropertyValue('outline-color');
    const boxShadow = styles.getPropertyValue('box-shadow');

    // For flat design, we need minimal but visible focus indicators
    const hasValidOutline = outlineStyle !== 'none' && outlineWidth !== '0px';
    const hasValidBoxShadow =
      boxShadow !== 'none' && !boxShadow.includes('0px 0px 0px');

    if (!hasValidOutline && !hasValidBoxShadow) {
      // Check if element has focus-visible styles (may not be active during testing)
      const classList = Array.from(el.classList);
      const hasFocusClasses = classList.some(
        cls => cls.includes('focus:') || cls.includes('focus-visible:')
      );

      if (!hasFocusClasses) {
        return {
          passed: false,
          message: `Interactive element lacks visible focus indicator: ${el.tagName}`,
          element: el,
        };
      }
    }

    // Check focus indicator contrast if present
    if (hasValidOutline && outlineColor !== 'transparent') {
      const parentBg = window.getComputedStyle(
        el.parentElement || document.body
      ).backgroundColor;
      const contrastRatio = getContrastRatio(outlineColor, parentBg);

      if (contrastRatio < 3.0) {
        return {
          passed: false,
          message: `Focus indicator has insufficient contrast: ${contrastRatio.toFixed(2)}:1 (required: 3.0:1)`,
          element: el,
        };
      }
    }
  }

  return {
    passed: true,
    message:
      'All interactive elements have appropriate focus indicators for flat design',
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
 * Check semantic structure for flat design accessibility
 */
export function checkSemanticStructure(
  element: Element
): AccessibilityCheckResult {
  // Check for proper landmark usage
  const _landmarks = element.querySelectorAll(
    'main, nav, aside, section, article, header, footer, [role="main"], [role="navigation"], [role="complementary"], [role="banner"], [role="contentinfo"]'
  );

  // Check for proper heading hierarchy without visual styling
  const headings = Array.from(
    element.querySelectorAll('h1, h2, h3, h4, h5, h6')
  );

  if (headings.length > 0) {
    // Ensure headings create logical hierarchy even without visual styling
    let hasH1 = false;
    for (const heading of headings) {
      if (heading.tagName === 'H1') {
        hasH1 = true;
        break;
      }
    }

    if (!hasH1 && headings.length > 0) {
      return {
        passed: false,
        message:
          'Page should have at least one H1 heading for proper semantic structure',
        element: headings[0],
      };
    }
  }

  // Check for proper list structure when using whitespace for organization
  const lists = element.querySelectorAll('ul, ol, dl');
  for (let i = 0; i < lists.length; i++) {
    const list = lists[i];
    const listItems = list.querySelectorAll('li, dt, dd');

    if (listItems.length === 0) {
      return {
        passed: false,
        message:
          'Empty list elements should be avoided or have proper ARIA labels',
        element: list,
      };
    }
  }

  return {
    passed: true,
    message: 'Semantic structure is appropriate for flat design accessibility',
  };
}

/**
 * Check typography-based hierarchy accessibility
 */
export function checkTypographyHierarchy(
  element: Element
): AccessibilityCheckResult {
  const headings = Array.from(
    element.querySelectorAll('h1, h2, h3, h4, h5, h6')
  );

  if (headings.length === 0) {
    return {
      passed: true,
      message: 'No headings found to check',
    };
  }

  // Check that headings have sufficient visual distinction through typography
  for (let i = 0; i < headings.length; i++) {
    const heading = headings[i];
    const styles = window.getComputedStyle(heading);
    const fontSize = parseFloat(styles.fontSize);
    const _fontWeight = styles.fontWeight;
    const lineHeight = parseFloat(styles.lineHeight);

    // Ensure headings are distinguishable through typography, not just visual styling
    const level = parseInt(heading.tagName.charAt(1));

    // Check if heading has appropriate typography for its level
    if (level === 1 && fontSize < 24) {
      return {
        passed: false,
        message:
          'H1 headings should have larger font size for proper hierarchy in flat design',
        element: heading,
      };
    }

    // Check for adequate line height for readability
    if (lineHeight < fontSize * 1.2) {
      return {
        passed: false,
        message:
          'Heading line height should be at least 1.2x font size for readability',
        element: heading,
      };
    }
  }

  return {
    passed: true,
    message: 'Typography hierarchy provides clear content organization',
  };
}

/**
 * Run all accessibility checks including flat design specific checks
 */
export function runAccessibilityChecks(
  element: Element
): AccessibilityCheckResult[] {
  return [
    checkAriaLabels(element),
    checkHeadingStructure(element),
    checkColorContrast(element),
    checkKeyboardAccessibility(element),
    checkFlatDesignFocusIndicators(element),
    checkSemanticStructure(element),
    checkTypographyHierarchy(element),
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
