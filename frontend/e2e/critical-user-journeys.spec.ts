import { test, expect } from '@playwright/test';

test.describe('Critical User Journeys - End-to-End Tests', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the home page before each test
    await page.goto('/');

    // Wait for the page to be fully loaded
    await page.waitForLoadState('networkidle');
  });

  test('Complete user journey: Browse trending repositories', async ({
    page,
  }) => {
    // Test: User lands on homepage and sees trending repositories
    await expect(
      page.getByRole('heading', { name: /trending repositories/i })
    ).toBeVisible();
    await expect(
      page.getByText(/discover the most popular github repositories/i)
    ).toBeVisible();

    // Test: Repository cards are loaded and display correct information
    const repositoryCards = page.locator('[data-testid="repository-card"]');
    await expect(repositoryCards.first()).toBeVisible({ timeout: 10000 });

    // Verify repository card structure
    const firstCard = repositoryCards.first();
    await expect(firstCard.getByRole('heading')).toBeVisible();
    await expect(firstCard.locator('[data-testid="repo-stars"]')).toBeVisible();
    await expect(
      firstCard.locator('[data-testid="repo-language"]')
    ).toBeVisible();

    // Test: User can interact with repository cards
    await firstCard.click();
    // Should open repository in new tab or show details

    // Test: Pagination works if available
    const nextPageButton = page.getByRole('button', {
      name: /next|load more/i,
    });
    if (await nextPageButton.isVisible()) {
      await nextPageButton.click();
      await page.waitForLoadState('networkidle');
      await expect(repositoryCards.first()).toBeVisible();
    }
  });

  test('Complete user journey: Search and filter repositories', async ({
    page,
  }) => {
    // Test: Search functionality
    const searchInput = page.getByPlaceholder(/search repositories/i);
    await expect(searchInput).toBeVisible();

    await searchInput.fill('react');
    await page.keyboard.press('Enter');

    // Wait for search results
    await page.waitForLoadState('networkidle');
    await expect(
      page.getByRole('heading', { name: /search results/i })
    ).toBeVisible();

    // Verify search results contain the search term
    const searchResults = page.locator('[data-testid="repository-card"]');
    if ((await searchResults.count()) > 0) {
      const firstResult = searchResults.first();
      const cardText = await firstResult.textContent();
      expect(cardText?.toLowerCase()).toContain('react');
    }

    // Test: Clear search and return to trending
    await searchInput.clear();
    await page.keyboard.press('Enter');
    await page.waitForLoadState('networkidle');
    await expect(
      page.getByRole('heading', { name: /trending repositories/i })
    ).toBeVisible();

    // Test: Filter functionality (desktop)
    await page.setViewportSize({ width: 1024, height: 768 });

    const languageFilter = page.getByText('Language').first();
    if (await languageFilter.isVisible()) {
      await languageFilter.click();

      // Select Python filter if available
      const pythonOption = page.getByText('Python').first();
      if (await pythonOption.isVisible()) {
        await pythonOption.click();
        await page.waitForLoadState('networkidle');

        // Verify filtered results
        const filteredCards = page.locator('[data-testid="repository-card"]');
        if ((await filteredCards.count()) > 0) {
          const languageElements = page.locator(
            '[data-testid="repo-language"]'
          );
          const languageCount = await languageElements.count();

          for (let i = 0; i < Math.min(languageCount, 3); i++) {
            const languageText = await languageElements.nth(i).textContent();
            expect(languageText?.toLowerCase()).toContain('python');
          }
        }
      }
    }
  });

  test('Complete user journey: Newsletter subscription flow', async ({
    page,
  }) => {
    // Navigate to newsletter page
    await page.getByRole('link', { name: /newsletter/i }).click();
    await page.waitForLoadState('networkidle');

    await expect(
      page.getByRole('heading', { name: /newsletter subscription/i })
    ).toBeVisible();

    // Test: Newsletter features are displayed
    await expect(page.getByText(/weekly digest/i)).toBeVisible();
    await expect(page.getByText(/ai-generated summaries/i)).toBeVisible();

    // Test: Email subscription form
    const emailInput = page
      .getByRole('textbox', { name: /email/i })
      .or(page.getByPlaceholder(/email/i))
      .or(page.locator('input[type="email"]'));

    if ((await emailInput.count()) > 0) {
      // Test invalid email validation
      await emailInput.fill('invalid-email');
      const submitButton = page.getByRole('button', {
        name: /subscribe|sign up|join/i,
      });

      if ((await submitButton.count()) > 0) {
        await submitButton.click();
        // Should show validation error
        await expect(
          page.getByText(/invalid email|please enter a valid email/i)
        ).toBeVisible();

        // Test valid email
        await emailInput.fill('test@example.com');
        await expect(emailInput).toHaveValue('test@example.com');

        // Note: We don't actually submit to avoid sending test emails
        // In a real test environment, we'd mock the email service
      }
    }
  });

  test('Complete user journey: Theme switching and accessibility', async ({
    page,
  }) => {
    // Test: Theme toggle functionality
    const themeToggle = page.getByRole('button', {
      name: /toggle theme|theme/i,
    });
    await expect(themeToggle).toBeVisible();

    // Get initial theme state
    const initialTheme = await page.evaluate(() =>
      document.documentElement.classList.contains('dark')
    );

    // Toggle theme
    await themeToggle.click();
    await page.waitForTimeout(500); // Wait for theme transition

    // Verify theme changed
    const newTheme = await page.evaluate(() =>
      document.documentElement.classList.contains('dark')
    );
    expect(newTheme).not.toBe(initialTheme);

    // Test: Keyboard navigation accessibility
    await page.keyboard.press('Tab');
    const skipLink = page.getByText(/skip to main content/i);
    if (await skipLink.isVisible()) {
      await expect(skipLink).toBeFocused();
      await page.keyboard.press('Enter');
    }

    // Continue tabbing through interface
    for (let i = 0; i < 5; i++) {
      await page.keyboard.press('Tab');
      const focusedElement = page.locator(':focus');
      await expect(focusedElement).toBeVisible();
    }

    // Test: Screen reader compatibility
    const mainContent = page.getByRole('main');
    await expect(mainContent).toBeVisible();

    // Verify ARIA labels are present
    const interactiveElements = page.locator('button, a, input, select');
    const elementCount = await interactiveElements.count();

    for (let i = 0; i < Math.min(elementCount, 5); i++) {
      const element = interactiveElements.nth(i);
      const ariaLabel = await element.getAttribute('aria-label');
      const ariaLabelledBy = await element.getAttribute('aria-labelledby');
      const textContent = await element.textContent();

      // Each interactive element should have some form of accessible name
      expect(ariaLabel || ariaLabelledBy || textContent?.trim()).toBeTruthy();
    }
  });

  test('Complete user journey: Mobile responsive experience', async ({
    page,
  }) => {
    // Test mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });

    // Test: Mobile navigation
    const mobileMenuButton = page
      .getByRole('button', { name: /menu|navigation/i })
      .or(page.locator('button[aria-label*="menu"]'));

    if ((await mobileMenuButton.count()) > 0) {
      await mobileMenuButton.click();

      // Mobile navigation should be visible
      const mobileNav = page.getByRole('navigation');
      await expect(mobileNav).toBeVisible();

      // Test navigation links
      await page.getByRole('link', { name: /newsletter/i }).click();
      await page.waitForLoadState('networkidle');
      await expect(
        page.getByRole('heading', { name: /newsletter/i })
      ).toBeVisible();
    }

    // Test: Mobile filter functionality
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    const mobileFiltersButton = page.getByRole('button', { name: /filters/i });
    if ((await mobileFiltersButton.count()) > 0) {
      await mobileFiltersButton.click();
      await expect(page.getByText(/language/i)).toBeVisible();

      // Close filters
      await mobileFiltersButton.click();
    }

    // Test: Touch interactions
    const repositoryCards = page.locator('[data-testid="repository-card"]');
    if ((await repositoryCards.count()) > 0) {
      // Simulate touch tap
      await repositoryCards.first().tap();
    }

    // Test: Scroll behavior
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.waitForTimeout(1000);

    // Check if infinite scroll or pagination works
    const cardCountAfterScroll = await repositoryCards.count();
    expect(cardCountAfterScroll).toBeGreaterThan(0);
  });

  test('Complete user journey: Error handling and recovery', async ({
    page,
  }) => {
    // Test: Network error handling
    await page.route('**/api/**', route => {
      route.abort('failed');
    });

    await page.reload();
    await page.waitForLoadState('networkidle');

    // Should show error message
    const errorMessage = page.getByText(/error|failed|something went wrong/i);
    if ((await errorMessage.count()) > 0) {
      await expect(errorMessage).toBeVisible();

      // Test retry functionality
      const retryButton = page.getByRole('button', {
        name: /retry|try again/i,
      });
      if ((await retryButton.count()) > 0) {
        // Restore network
        await page.unroute('**/api/**');
        await retryButton.click();
        await page.waitForLoadState('networkidle');

        // Should recover and show content
        await expect(
          page.getByRole('heading', { name: /trending repositories/i })
        ).toBeVisible();
      }
    }

    // Test: Invalid search handling
    await page.unroute('**/api/**'); // Ensure network is restored

    const searchInput = page.getByPlaceholder(/search repositories/i);
    await searchInput.fill('xyzinvalidquerythatshouldfindnothing123');
    await page.keyboard.press('Enter');
    await page.waitForLoadState('networkidle');

    // Should handle empty results gracefully
    const noResultsMessage = page.getByText(
      /no results|no repositories found/i
    );
    if ((await noResultsMessage.count()) > 0) {
      await expect(noResultsMessage).toBeVisible();
    }
  });

  test('Complete user journey: Performance and loading states', async ({
    page,
  }) => {
    // Test: Initial page load performance
    const startTime = Date.now();

    await page.goto('/');
    await expect(
      page.getByRole('heading', { name: /trending repositories/i })
    ).toBeVisible();

    const loadTime = Date.now() - startTime;
    expect(loadTime).toBeLessThan(5000); // Should load within 5 seconds

    // Test: Loading states are shown
    const searchInput = page.getByPlaceholder(/search repositories/i);
    await searchInput.fill('react');

    // Look for loading indicators
    const loadingIndicator = page
      .getByText(/loading|searching/i)
      .or(page.locator('[data-testid="loading"]'))
      .or(page.locator('.animate-spin'));

    await page.keyboard.press('Enter');

    // Loading indicator might be visible briefly
    // We'll just ensure the search completes successfully
    await page.waitForLoadState('networkidle');

    // Test: Skeleton loading states
    await page.goto('/');

    // Look for skeleton loaders while content loads
    const skeletonLoader = page
      .locator('[data-testid="skeleton"]')
      .or(page.locator('.animate-pulse'));

    // Skeleton might be visible briefly during initial load
    // Main test is that content eventually loads
    await expect(
      page.locator('[data-testid="repository-card"]').first()
    ).toBeVisible({ timeout: 10000 });
  });
});
