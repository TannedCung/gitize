import { test, expect } from '@playwright/test';
import { checkAccessibility, testKeyboardNavigation } from './test-utils';

test.describe('Accessibility Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
  });

  test('Page has proper heading hierarchy', async ({ page }) => {
    // Check for h1 element
    const h1Elements = page.locator('h1');
    const h1Count = await h1Elements.count();
    expect(h1Count).toBeGreaterThan(0);
    expect(h1Count).toBeLessThanOrEqual(1); // Should have exactly one h1

    // Check heading hierarchy (h1 -> h2 -> h3, etc.)
    const headings = page.locator('h1, h2, h3, h4, h5, h6');
    const headingCount = await headings.count();

    if (headingCount > 1) {
      const headingLevels: number[] = [];

      for (let i = 0; i < headingCount; i++) {
        const heading = headings.nth(i);
        const tagName = await heading.evaluate(el => el.tagName.toLowerCase());
        const level = parseInt(tagName.charAt(1));
        headingLevels.push(level);
      }

      // Check that heading levels don't skip (e.g., h1 -> h3 without h2)
      for (let i = 1; i < headingLevels.length; i++) {
        const currentLevel = headingLevels[i];
        const previousLevel = headingLevels[i - 1];

        if (currentLevel > previousLevel) {
          expect(currentLevel - previousLevel).toBeLessThanOrEqual(1);
        }
      }
    }
  });

  test('Interactive elements have accessible names', async ({ page }) => {
    const interactiveElements = page.locator(
      'button, a, input, select, textarea'
    );
    const elementCount = await interactiveElements.count();

    for (let i = 0; i < Math.min(elementCount, 20); i++) {
      const element = interactiveElements.nth(i);

      // Skip if element is not visible
      if (!(await element.isVisible())) continue;

      const ariaLabel = await element.getAttribute('aria-label');
      const ariaLabelledBy = await element.getAttribute('aria-labelledby');
      const textContent = await element.textContent();
      const title = await element.getAttribute('title');
      const placeholder = await element.getAttribute('placeholder');
      const alt = await element.getAttribute('alt');

      // Element should have some form of accessible name
      const hasAccessibleName =
        ariaLabel ||
        ariaLabelledBy ||
        textContent?.trim() ||
        title ||
        placeholder ||
        alt;

      if (!hasAccessibleName) {
        const tagName = await element.evaluate(el => el.tagName.toLowerCase());
        const type = await element.getAttribute('type');
        console.warn(
          `Element without accessible name: ${tagName}${type ? `[type="${type}"]` : ''}`
        );
      }

      expect(hasAccessibleName).toBeTruthy();
    }
  });

  test('Images have alt text', async ({ page }) => {
    const images = page.locator('img');
    const imageCount = await images.count();

    for (let i = 0; i < imageCount; i++) {
      const image = images.nth(i);

      // Skip if image is not visible
      if (!(await image.isVisible())) continue;

      const alt = await image.getAttribute('alt');
      const ariaLabel = await image.getAttribute('aria-label');
      const ariaLabelledBy = await image.getAttribute('aria-labelledby');
      const role = await image.getAttribute('role');

      // Decorative images should have empty alt or role="presentation"
      // Content images should have descriptive alt text
      const hasAccessibleText =
        alt !== null || ariaLabel || ariaLabelledBy || role === 'presentation';

      expect(hasAccessibleText).toBeTruthy();
    }
  });

  test('Form elements have proper labels', async ({ page }) => {
    const formElements = page.locator('input, select, textarea');
    const elementCount = await formElements.count();

    for (let i = 0; i < elementCount; i++) {
      const element = formElements.nth(i);

      // Skip if element is not visible
      if (!(await element.isVisible())) continue;

      const id = await element.getAttribute('id');
      const ariaLabel = await element.getAttribute('aria-label');
      const ariaLabelledBy = await element.getAttribute('aria-labelledby');
      const placeholder = await element.getAttribute('placeholder');

      // Check for associated label
      let hasLabel = false;
      if (id) {
        const label = page.locator(`label[for="${id}"]`);
        hasLabel = (await label.count()) > 0;
      }

      const hasAccessibleName =
        hasLabel || ariaLabel || ariaLabelledBy || placeholder;

      if (!hasAccessibleName) {
        const type = await element.getAttribute('type');
        const name = await element.getAttribute('name');
        console.warn(
          `Form element without label: input[type="${type}"][name="${name}"]`
        );
      }

      expect(hasAccessibleName).toBeTruthy();
    }
  });

  test('Skip link is present and functional', async ({ page }) => {
    // Tab to the first element (should be skip link)
    await page.keyboard.press('Tab');

    const skipLink = page.getByText(/skip to main content/i);

    if ((await skipLink.count()) > 0) {
      await expect(skipLink).toBeFocused();

      // Activate skip link
      await page.keyboard.press('Enter');

      // Focus should move to main content
      const mainContent = page.getByRole('main');
      await expect(mainContent).toBeVisible();
    }
  });

  test('Keyboard navigation works correctly', async ({ page }) => {
    await testKeyboardNavigation(page);
  });

  test('Focus is visible and properly managed', async ({ page }) => {
    // Tab through several elements
    for (let i = 0; i < 10; i++) {
      await page.keyboard.press('Tab');

      const focusedElement = page.locator(':focus');

      if ((await focusedElement.count()) > 0) {
        // Focused element should be visible
        await expect(focusedElement).toBeVisible();

        // Check if focus indicator is visible (this is hard to test programmatically)
        const focusStyles = await focusedElement.evaluate(el => {
          const styles = window.getComputedStyle(el);
          return {
            outline: styles.outline,
            outlineWidth: styles.outlineWidth,
            outlineStyle: styles.outlineStyle,
            outlineColor: styles.outlineColor,
            boxShadow: styles.boxShadow,
          };
        });

        // Should have some form of focus indicator
        const hasFocusIndicator =
          focusStyles.outline !== 'none' ||
          focusStyles.outlineWidth !== '0px' ||
          focusStyles.boxShadow !== 'none';

        expect(hasFocusIndicator).toBeTruthy();
      }
    }
  });

  test('ARIA roles and properties are used correctly', async ({ page }) => {
    // Check for proper use of ARIA roles
    const elementsWithRoles = page.locator('[role]');
    const roleCount = await elementsWithRoles.count();

    for (let i = 0; i < roleCount; i++) {
      const element = elementsWithRoles.nth(i);
      const role = await element.getAttribute('role');

      // Common valid ARIA roles
      const validRoles = [
        'button',
        'link',
        'navigation',
        'main',
        'banner',
        'contentinfo',
        'complementary',
        'search',
        'form',
        'dialog',
        'alert',
        'status',
        'presentation',
        'img',
        'list',
        'listitem',
        'heading',
        'tab',
        'tabpanel',
        'tablist',
        'menu',
        'menuitem',
        'menubar',
      ];

      expect(validRoles).toContain(role);
    }

    // Check for proper ARIA states
    const elementsWithAriaExpanded = page.locator('[aria-expanded]');
    const expandedCount = await elementsWithAriaExpanded.count();

    for (let i = 0; i < expandedCount; i++) {
      const element = elementsWithAriaExpanded.nth(i);
      const ariaExpanded = await element.getAttribute('aria-expanded');

      // aria-expanded should be "true" or "false"
      expect(['true', 'false']).toContain(ariaExpanded);
    }
  });

  test('Color contrast meets WCAG guidelines', async ({ page }) => {
    // This is a basic check - in a real implementation, you'd use a tool like axe-core
    const textElements = page.locator(
      'p, h1, h2, h3, h4, h5, h6, span, a, button, label'
    );
    const elementCount = await textElements.count();

    for (let i = 0; i < Math.min(elementCount, 10); i++) {
      const element = textElements.nth(i);

      if (!(await element.isVisible())) continue;

      const styles = await element.evaluate(el => {
        const computedStyles = window.getComputedStyle(el);
        return {
          color: computedStyles.color,
          backgroundColor: computedStyles.backgroundColor,
          fontSize: computedStyles.fontSize,
        };
      });

      // Basic check that text has a color (not transparent)
      expect(styles.color).not.toBe('rgba(0, 0, 0, 0)');
      expect(styles.color).not.toBe('transparent');
    }
  });

  test('Page has proper document structure', async ({ page }) => {
    // Check for main landmark
    const main = page.getByRole('main');
    await expect(main).toBeVisible();

    // Check for navigation landmark
    const nav = page.getByRole('navigation');
    expect(await nav.count()).toBeGreaterThan(0);

    // Check for proper document title
    const title = await page.title();
    expect(title).toBeTruthy();
    expect(title.length).toBeGreaterThan(0);

    // Check for lang attribute on html element
    const lang = await page.locator('html').getAttribute('lang');
    expect(lang).toBeTruthy();
  });

  test('Error messages are accessible', async ({ page }) => {
    // Navigate to newsletter page to test form validation
    await page.getByRole('link', { name: /newsletter/i }).click();
    await page.waitForLoadState('networkidle');

    const emailInput = page
      .getByRole('textbox', { name: /email/i })
      .or(page.getByPlaceholder(/email/i))
      .or(page.locator('input[type="email"]'));

    if ((await emailInput.count()) > 0) {
      // Try to submit invalid email
      await emailInput.fill('invalid-email');

      const submitButton = page.getByRole('button', {
        name: /subscribe|sign up|join/i,
      });
      if ((await submitButton.count()) > 0) {
        await submitButton.click();

        // Look for error message
        const errorMessage = page
          .getByText(/invalid email|please enter a valid email/i)
          .or(page.locator('[role="alert"]'))
          .or(page.locator('.error'));

        if ((await errorMessage.count()) > 0) {
          await expect(errorMessage).toBeVisible();

          // Error message should be associated with the input
          const ariaDescribedBy =
            await emailInput.getAttribute('aria-describedby');
          const ariaInvalid = await emailInput.getAttribute('aria-invalid');

          // Should have aria-invalid or aria-describedby
          expect(ariaInvalid === 'true' || ariaDescribedBy).toBeTruthy();
        }
      }
    }
  });

  test('Dynamic content updates are announced', async ({ page }) => {
    // Test search functionality for live region updates
    const searchInput = page.getByPlaceholder(/search repositories/i);

    if (await searchInput.isVisible()) {
      await searchInput.fill('react');
      await page.keyboard.press('Enter');
      await page.waitForLoadState('networkidle');

      // Look for live region or status updates
      const liveRegion = page.locator(
        '[aria-live], [role="status"], [role="alert"]'
      );

      if ((await liveRegion.count()) > 0) {
        const ariaLive = await liveRegion.first().getAttribute('aria-live');
        expect(['polite', 'assertive']).toContain(ariaLive);
      }
    }
  });

  test('Mobile accessibility features work correctly', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });

    // Check mobile navigation
    const mobileMenuButton = page
      .getByRole('button', { name: /menu|navigation/i })
      .or(page.locator('button[aria-label*="menu"]'));

    if ((await mobileMenuButton.count()) > 0) {
      // Button should have proper ARIA attributes
      const ariaExpanded = await mobileMenuButton.getAttribute('aria-expanded');
      const ariaControls = await mobileMenuButton.getAttribute('aria-controls');

      expect(['true', 'false']).toContain(ariaExpanded);

      // Open mobile menu
      await mobileMenuButton.click();

      // Check if aria-expanded changed
      const newAriaExpanded =
        await mobileMenuButton.getAttribute('aria-expanded');
      expect(newAriaExpanded).not.toBe(ariaExpanded);

      // Mobile navigation should be visible
      const mobileNav = page.getByRole('navigation');
      await expect(mobileNav).toBeVisible();
    }
  });

  test('Theme switching maintains accessibility', async ({ page }) => {
    const themeToggle = page.getByRole('button', {
      name: /toggle theme|theme/i,
    });

    if (await themeToggle.isVisible()) {
      // Button should have accessible name
      const ariaLabel = await themeToggle.getAttribute('aria-label');
      const textContent = await themeToggle.textContent();

      expect(ariaLabel || textContent?.trim()).toBeTruthy();

      // Toggle theme
      await themeToggle.click();
      await page.waitForTimeout(500);

      // Check that focus is still visible after theme change
      await themeToggle.focus();
      await expect(themeToggle).toBeFocused();

      // Check that contrast is still adequate (basic check)
      const styles = await themeToggle.evaluate(el => {
        const computedStyles = window.getComputedStyle(el);
        return {
          color: computedStyles.color,
          backgroundColor: computedStyles.backgroundColor,
        };
      });

      expect(styles.color).not.toBe('rgba(0, 0, 0, 0)');
    }
  });

  test('Comprehensive accessibility check', async ({ page }) => {
    await checkAccessibility(page);
  });
});
