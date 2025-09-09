import { test, expect } from '@playwright/test';

test.describe('Complete User Workflows', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the home page before each test
    await page.goto('/');
  });

  test('User can browse trending repositories and interact with the interface', async ({
    page,
  }) => {
    // Check that the main page loads correctly
    await expect(
      page.getByRole('heading', { name: 'Trending Repositories' })
    ).toBeVisible();
    await expect(
      page.getByText('Discover the most popular GitHub repositories')
    ).toBeVisible();

    // Check that the search bar is present and functional
    const searchInput = page.getByPlaceholder(
      'Search repositories by name, description, or topic...'
    );
    await expect(searchInput).toBeVisible();

    // Test search functionality
    await searchInput.fill('react');
    await expect(
      page.getByRole('heading', { name: 'Search Results' })
    ).toBeVisible();

    // Clear search to return to trending
    await searchInput.clear();
    await expect(
      page.getByRole('heading', { name: 'Trending Repositories' })
    ).toBeVisible();

    // Test mobile filter toggle (on smaller screens)
    await page.setViewportSize({ width: 768, height: 1024 });
    const filtersButton = page.getByRole('button', {
      name: /filters & options/i,
    });
    await expect(filtersButton).toBeVisible();

    await filtersButton.click();
    await expect(page.getByText('Language')).toBeVisible();

    // Close filters
    await filtersButton.click();
  });

  test('User can navigate between different pages', async ({ page }) => {
    // Test navigation to Newsletter page
    await page.getByRole('link', { name: 'Newsletter' }).click();
    await expect(
      page.getByRole('heading', { name: 'Newsletter Subscription' })
    ).toBeVisible();
    await expect(
      page.getByText('Stay up-to-date with the latest trending repositories')
    ).toBeVisible();

    // Check newsletter features are displayed
    await expect(
      page.getByText('Weekly digest of the top 5 trending repositories')
    ).toBeVisible();
    await expect(
      page.getByText('AI-generated summaries for quick understanding')
    ).toBeVisible();

    // Test navigation to Search page
    await page.getByRole('link', { name: 'Search' }).click();
    await expect(
      page.getByRole('heading', { name: 'Search Repositories' })
    ).toBeVisible();
    await expect(page.getByText('Coming Soon')).toBeVisible();

    // Return to home page
    await page.getByRole('link', { name: 'Trending' }).click();
    await expect(
      page.getByRole('heading', { name: 'Trending Repositories' })
    ).toBeVisible();
  });

  test('User can toggle between light and dark themes', async ({ page }) => {
    // Find and click the theme toggle button
    const themeToggle = page.getByRole('button', { name: /toggle theme/i });
    await expect(themeToggle).toBeVisible();

    // Get initial theme state
    const initialTheme = await page.evaluate(() =>
      document.documentElement.classList.contains('dark')
    );

    // Toggle theme
    await themeToggle.click();

    // Wait for theme transition
    await page.waitForTimeout(300);

    // Verify theme changed
    const newTheme = await page.evaluate(() =>
      document.documentElement.classList.contains('dark')
    );
    expect(newTheme).not.toBe(initialTheme);

    // Toggle back
    await themeToggle.click();
    await page.waitForTimeout(300);

    // Verify theme returned to original state
    const finalTheme = await page.evaluate(() =>
      document.documentElement.classList.contains('dark')
    );
    expect(finalTheme).toBe(initialTheme);
  });

  test('User can interact with repository cards and filters', async ({
    page,
  }) => {
    // Wait for repository cards to load
    await expect(
      page.locator('[data-testid="repository-card"]').first()
    ).toBeVisible({ timeout: 10000 });

    // Check that repository information is displayed
    const firstCard = page.locator('[data-testid="repository-card"]').first();
    await expect(firstCard.getByRole('heading')).toBeVisible();

    // Test filter interactions on desktop
    await page.setViewportSize({ width: 1024, height: 768 });

    // Check if language filter is available
    const languageFilter = page.getByText('Language').first();
    if (await languageFilter.isVisible()) {
      await languageFilter.click();

      // Select a language filter if options are available
      const filterOptions = page.locator(
        'select, [role="listbox"] option, [role="option"]'
      );
      const optionCount = await filterOptions.count();

      if (optionCount > 0) {
        await filterOptions.first().click();
        // Wait for results to update
        await page.waitForTimeout(1000);
      }
    }
  });

  test('Newsletter signup form works correctly', async ({ page }) => {
    // Navigate to newsletter page
    await page.getByRole('link', { name: 'Newsletter' }).click();

    // Look for email input field
    const emailInput = page
      .getByRole('textbox', { name: /email/i })
      .or(page.getByPlaceholder(/email/i))
      .or(page.locator('input[type="email"]'));

    // If email input exists, test the form
    if ((await emailInput.count()) > 0) {
      await emailInput.fill('test@example.com');
      await expect(emailInput).toHaveValue('test@example.com');

      // Look for submit button
      const submitButton = page.getByRole('button', {
        name: /subscribe|sign up|join/i,
      });
      if ((await submitButton.count()) > 0) {
        await expect(submitButton).toBeVisible();
        // Note: We don't actually submit to avoid sending test emails
      }
    }
  });

  test('Mobile navigation works correctly', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });

    // Check that mobile menu button is visible
    const mobileMenuButton = page
      .getByRole('button', { name: /open main menu/i })
      .or(page.locator('button[aria-label*="menu"]'));

    if ((await mobileMenuButton.count()) > 0) {
      await mobileMenuButton.click();

      // Check that mobile navigation is visible
      await expect(
        page.getByRole('navigation', { name: /mobile navigation/i })
      ).toBeVisible();

      // Test navigation link
      await page.getByRole('link', { name: 'Newsletter' }).click();
      await expect(
        page.getByRole('heading', { name: 'Newsletter Subscription' })
      ).toBeVisible();
    }
  });

  test('Application is accessible via keyboard navigation', async ({
    page,
  }) => {
    // Test skip link
    await page.keyboard.press('Tab');
    const skipLink = page.getByText('Skip to main content');
    await expect(skipLink).toBeFocused();

    // Activate skip link
    await page.keyboard.press('Enter');

    // Continue tabbing through the interface
    await page.keyboard.press('Tab');
    await page.keyboard.press('Tab');

    // Test that focus is visible and logical
    const focusedElement = page.locator(':focus');
    await expect(focusedElement).toBeVisible();

    // Test escape key functionality if applicable
    const searchInput = page.getByPlaceholder(
      'Search repositories by name, description, or topic...'
    );
    await searchInput.focus();
    await searchInput.fill('test search');
    await page.keyboard.press('Escape');
  });

  test('Error states are handled gracefully', async ({ page }) => {
    // Mock network failure to test error handling
    await page.route('**/api/**', route => {
      route.abort('failed');
    });

    // Reload page to trigger error
    await page.reload();

    // Check for error message
    const errorMessage = page.getByText(/something went wrong|error|failed/i);
    if ((await errorMessage.count()) > 0) {
      await expect(errorMessage).toBeVisible();

      // Check for retry button
      const retryButton = page.getByRole('button', {
        name: /try again|retry/i,
      });
      if ((await retryButton.count()) > 0) {
        await expect(retryButton).toBeVisible();
      }
    }
  });

  test('Application loads and renders within acceptable time', async ({
    page,
  }) => {
    const startTime = Date.now();

    await page.goto('/');

    // Wait for main content to be visible
    await expect(
      page.getByRole('heading', { name: 'Trending Repositories' })
    ).toBeVisible();

    const loadTime = Date.now() - startTime;

    // Expect page to load within 5 seconds
    expect(loadTime).toBeLessThan(5000);

    // Check that critical content is visible
    await expect(
      page.getByText('Discover the most popular GitHub repositories')
    ).toBeVisible();
  });

  test('Component demo page showcases design system', async ({ page }) => {
    // Navigate to demo page
    await page.goto('/demo');

    // Check demo page loads
    await expect(
      page.getByRole('heading', { name: 'Component Demo' })
    ).toBeVisible();
    await expect(
      page.getByText('Explore the AppFlowy design system')
    ).toBeVisible();

    // Check that various component sections are present
    await expect(page.getByText(/button/i)).toBeVisible();
    await expect(page.getByText(/text field/i)).toBeVisible();
    await expect(page.getByText(/avatar/i)).toBeVisible();

    // Test interactive components if present
    const buttons = page.getByRole('button');
    const buttonCount = await buttons.count();

    if (buttonCount > 0) {
      // Test clicking various buttons
      for (let i = 0; i < Math.min(buttonCount, 5); i++) {
        const button = buttons.nth(i);
        if ((await button.isVisible()) && (await button.isEnabled())) {
          await button.click();
          await page.waitForTimeout(100); // Brief pause between clicks
        }
      }
    }
  });
});

test.describe('Visual Regression Tests', () => {
  test('Home page visual consistency', async ({ page }) => {
    await page.goto('/');
    await expect(
      page.getByRole('heading', { name: 'Trending Repositories' })
    ).toBeVisible();

    // Take screenshot for visual comparison
    await expect(page).toHaveScreenshot('home-page.png');
  });

  test('Newsletter page visual consistency', async ({ page }) => {
    await page.goto('/newsletter');
    await expect(
      page.getByRole('heading', { name: 'Newsletter Subscription' })
    ).toBeVisible();

    await expect(page).toHaveScreenshot('newsletter-page.png');
  });

  test('Dark theme visual consistency', async ({ page }) => {
    await page.goto('/');

    // Switch to dark theme
    const themeToggle = page.getByRole('button', { name: /toggle theme/i });
    await themeToggle.click();
    await page.waitForTimeout(300);

    await expect(page).toHaveScreenshot('home-page-dark.png');
  });
});
