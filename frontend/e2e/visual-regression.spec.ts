import { test, expect } from '@playwright/test';

test.describe('Visual Regression Tests', () => {
  test.beforeEach(async ({ page }) => {
    // Set consistent viewport for visual tests
    await page.setViewportSize({ width: 1280, height: 720 });
    await page.goto('/');
    await page.waitForLoadState('networkidle');
  });

  test('Homepage visual consistency - Light theme', async ({ page }) => {
    // Ensure light theme is active
    const isDark = await page.evaluate(() =>
      document.documentElement.classList.contains('dark')
    );

    if (isDark) {
      const themeToggle = page.getByRole('button', {
        name: /toggle theme|theme/i,
      });
      await themeToggle.click();
      await page.waitForTimeout(500);
    }

    // Wait for content to load
    await expect(
      page.getByRole('heading', { name: /trending repositories/i })
    ).toBeVisible();
    await expect(
      page.locator('[data-testid="repository-card"]').first()
    ).toBeVisible({ timeout: 10000 });

    // Hide dynamic content that might cause flaky tests
    await page.addStyleTag({
      content: `
        [data-testid="timestamp"],
        .relative-time,
        .last-updated {
          visibility: hidden !important;
        }
      `,
    });

    await expect(page).toHaveScreenshot('homepage-light-theme.png', {
      fullPage: true,
      animations: 'disabled',
    });
  });

  test('Homepage visual consistency - Dark theme', async ({ page }) => {
    // Ensure dark theme is active
    const isDark = await page.evaluate(() =>
      document.documentElement.classList.contains('dark')
    );

    if (!isDark) {
      const themeToggle = page.getByRole('button', {
        name: /toggle theme|theme/i,
      });
      await themeToggle.click();
      await page.waitForTimeout(500);
    }

    await expect(
      page.getByRole('heading', { name: /trending repositories/i })
    ).toBeVisible();
    await expect(
      page.locator('[data-testid="repository-card"]').first()
    ).toBeVisible({ timeout: 10000 });

    // Hide dynamic content
    await page.addStyleTag({
      content: `
        [data-testid="timestamp"],
        .relative-time,
        .last-updated {
          visibility: hidden !important;
        }
      `,
    });

    await expect(page).toHaveScreenshot('homepage-dark-theme.png', {
      fullPage: true,
      animations: 'disabled',
    });
  });

  test('Newsletter page visual consistency', async ({ page }) => {
    await page.getByRole('link', { name: /newsletter/i }).click();
    await page.waitForLoadState('networkidle');

    await expect(
      page.getByRole('heading', { name: /newsletter subscription/i })
    ).toBeVisible();

    await expect(page).toHaveScreenshot('newsletter-page.png', {
      fullPage: true,
      animations: 'disabled',
    });
  });

  test('Search results visual consistency', async ({ page }) => {
    const searchInput = page.getByPlaceholder(/search repositories/i);
    await searchInput.fill('react');
    await page.keyboard.press('Enter');
    await page.waitForLoadState('networkidle');

    // Wait for search results or no results message
    await page.waitForTimeout(2000);

    // Hide dynamic content
    await page.addStyleTag({
      content: `
        [data-testid="timestamp"],
        .relative-time,
        .last-updated {
          visibility: hidden !important;
        }
      `,
    });

    await expect(page).toHaveScreenshot('search-results.png', {
      fullPage: true,
      animations: 'disabled',
    });
  });

  test('Mobile viewport visual consistency', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    await expect(
      page.getByRole('heading', { name: /trending repositories/i })
    ).toBeVisible();

    // Hide dynamic content
    await page.addStyleTag({
      content: `
        [data-testid="timestamp"],
        .relative-time,
        .last-updated {
          visibility: hidden !important;
        }
      `,
    });

    await expect(page).toHaveScreenshot('mobile-homepage.png', {
      fullPage: true,
      animations: 'disabled',
    });
  });

  test('Tablet viewport visual consistency', async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    await expect(
      page.getByRole('heading', { name: /trending repositories/i })
    ).toBeVisible();

    // Hide dynamic content
    await page.addStyleTag({
      content: `
        [data-testid="timestamp"],
        .relative-time,
        .last-updated {
          visibility: hidden !important;
        }
      `,
    });

    await expect(page).toHaveScreenshot('tablet-homepage.png', {
      fullPage: true,
      animations: 'disabled',
    });
  });

  test('Component demo page visual consistency', async ({ page }) => {
    await page.goto('/demo');
    await page.waitForLoadState('networkidle');

    await expect(
      page.getByRole('heading', { name: /component demo/i })
    ).toBeVisible();

    await expect(page).toHaveScreenshot('component-demo.png', {
      fullPage: true,
      animations: 'disabled',
    });
  });

  test('Filter panel visual consistency', async ({ page }) => {
    // Desktop view to ensure filters are visible
    await page.setViewportSize({ width: 1280, height: 720 });

    const languageFilter = page.getByText('Language').first();
    if (await languageFilter.isVisible()) {
      await languageFilter.click();
      await page.waitForTimeout(500);

      await expect(page).toHaveScreenshot('filter-panel-open.png', {
        animations: 'disabled',
      });
    }
  });

  test('Loading states visual consistency', async ({ page }) => {
    // Intercept API calls to simulate loading state
    await page.route('**/api/repositories/trending', async route => {
      // Delay the response to capture loading state
      await page.waitForTimeout(2000);
      route.continue();
    });

    await page.goto('/');

    // Capture loading state
    await expect(page).toHaveScreenshot('loading-state.png', {
      animations: 'disabled',
    });

    // Wait for content to load and capture final state
    await page.waitForLoadState('networkidle');
    await expect(
      page.locator('[data-testid="repository-card"]').first()
    ).toBeVisible({ timeout: 15000 });

    await expect(page).toHaveScreenshot('loaded-state.png', {
      animations: 'disabled',
    });
  });

  test('Error state visual consistency', async ({ page }) => {
    // Mock API failure
    await page.route('**/api/**', route => {
      route.abort('failed');
    });

    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Wait for error state to appear
    await page.waitForTimeout(3000);

    await expect(page).toHaveScreenshot('error-state.png', {
      fullPage: true,
      animations: 'disabled',
    });
  });

  test('Repository card hover states', async ({ page }) => {
    await expect(
      page.locator('[data-testid="repository-card"]').first()
    ).toBeVisible({ timeout: 10000 });

    const firstCard = page.locator('[data-testid="repository-card"]').first();

    // Capture normal state
    await expect(firstCard).toHaveScreenshot('repository-card-normal.png');

    // Capture hover state
    await firstCard.hover();
    await page.waitForTimeout(300);
    await expect(firstCard).toHaveScreenshot('repository-card-hover.png');
  });

  test('Theme transition visual consistency', async ({ page }) => {
    // Start with light theme
    const isDark = await page.evaluate(() =>
      document.documentElement.classList.contains('dark')
    );

    if (isDark) {
      const themeToggle = page.getByRole('button', {
        name: /toggle theme|theme/i,
      });
      await themeToggle.click();
      await page.waitForTimeout(500);
    }

    await expect(
      page.getByRole('heading', { name: /trending repositories/i })
    ).toBeVisible();

    // Capture before transition
    await expect(page).toHaveScreenshot('theme-before-transition.png', {
      animations: 'disabled',
    });

    // Toggle theme
    const themeToggle = page.getByRole('button', {
      name: /toggle theme|theme/i,
    });
    await themeToggle.click();

    // Capture after transition
    await page.waitForTimeout(500);
    await expect(page).toHaveScreenshot('theme-after-transition.png', {
      animations: 'disabled',
    });
  });
});
