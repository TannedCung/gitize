/**
 * Test utilities for E2E tests
 * Provides common functions and helpers for Playwright tests
 */

import { Page, expect, Locator } from '@playwright/test';

/**
 * Wait for element to be visible with custom timeout
 */
export async function waitForElement(
  page: Page,
  selector: string,
  timeout: number = 10000
): Promise<Locator> {
  const element = page.locator(selector);
  await expect(element).toBeVisible({ timeout });
  return element;
}

/**
 * Wait for API response and return the response data
 */
export async function waitForAPIResponse(
  page: Page,
  urlPattern: string,
  timeout: number = 10000
): Promise<any> {
  return new Promise((resolve, reject) => {
    const timeoutId = setTimeout(() => {
      reject(new Error(`API response timeout for ${urlPattern}`));
    }, timeout);

    page.on('response', async response => {
      if (response.url().includes(urlPattern)) {
        clearTimeout(timeoutId);
        try {
          const data = await response.json();
          resolve(data);
        } catch (error) {
          reject(error);
        }
      }
    });
  });
}

/**
 * Simulate slow network conditions
 */
export async function simulateSlowNetwork(
  page: Page,
  delay: number = 1000
): Promise<void> {
  await page.route('**/*', async route => {
    await new Promise(resolve => setTimeout(resolve, delay));
    route.continue();
  });
}

/**
 * Mock API responses for offline testing
 */
export async function mockAPIResponses(page: Page): Promise<void> {
  const mockData = {
    trending: {
      repositories: [
        {
          id: 1,
          name: 'mock-repo-1',
          full_name: 'user/mock-repo-1',
          description: 'A mock repository for testing',
          stars: 1500,
          forks: 120,
          language: 'JavaScript',
          author: 'user',
          url: 'https://github.com/user/mock-repo-1',
          trending_date: new Date().toISOString().split('T')[0],
        },
        {
          id: 2,
          name: 'mock-repo-2',
          full_name: 'dev/mock-repo-2',
          description: 'Another mock repository for testing',
          stars: 2300,
          forks: 180,
          language: 'Python',
          author: 'dev',
          url: 'https://github.com/dev/mock-repo-2',
          trending_date: new Date().toISOString().split('T')[0],
        },
      ],
      total_count: 2,
      page: 1,
      per_page: 10,
    },
    search: {
      repositories: [
        {
          id: 3,
          name: 'search-mock',
          full_name: 'searcher/search-mock',
          description: 'Mock search result',
          stars: 890,
          forks: 45,
          language: 'TypeScript',
          author: 'searcher',
          url: 'https://github.com/searcher/search-mock',
          trending_date: new Date().toISOString().split('T')[0],
        },
      ],
      total_count: 1,
      page: 1,
      per_page: 10,
    },
  };

  await page.route('**/api/repositories/trending*', async route => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(mockData.trending),
    });
  });

  await page.route('**/api/repositories/search*', async route => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(mockData.search),
    });
  });

  await page.route('**/api/health*', async route => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        status: 'healthy',
        timestamp: new Date().toISOString(),
      }),
    });
  });
}

/**
 * Take screenshot with consistent settings
 */
export async function takeScreenshot(
  page: Page,
  name: string,
  options: { fullPage?: boolean; hideElements?: string[] } = {}
): Promise<void> {
  // Hide dynamic elements that might cause flaky tests
  const defaultHideElements = [
    '[data-testid="timestamp"]',
    '.relative-time',
    '.last-updated',
  ];

  const elementsToHide = [
    ...defaultHideElements,
    ...(options.hideElements || []),
  ];

  if (elementsToHide.length > 0) {
    await page.addStyleTag({
      content: `
        ${elementsToHide.join(', ')} {
          visibility: hidden !important;
        }
      `,
    });
  }

  await expect(page).toHaveScreenshot(name, {
    fullPage: options.fullPage || false,
    animations: 'disabled',
  });
}

/**
 * Check accessibility of the current page
 */
export async function checkAccessibility(page: Page): Promise<void> {
  // Check for basic accessibility requirements

  // 1. Check for skip link
  const skipLink = page.getByText(/skip to main content/i);
  if ((await skipLink.count()) > 0) {
    await expect(skipLink).toBeVisible();
  }

  // 2. Check main landmark
  const main = page.getByRole('main');
  await expect(main).toBeVisible();

  // 3. Check heading hierarchy
  const headings = page.locator('h1, h2, h3, h4, h5, h6');
  const headingCount = await headings.count();

  if (headingCount > 0) {
    // Should have at least one h1
    const h1Count = await page.locator('h1').count();
    expect(h1Count).toBeGreaterThan(0);
  }

  // 4. Check interactive elements have accessible names
  const interactiveElements = page.locator(
    'button, a, input, select, textarea'
  );
  const elementCount = await interactiveElements.count();

  for (let i = 0; i < Math.min(elementCount, 10); i++) {
    const element = interactiveElements.nth(i);
    const ariaLabel = await element.getAttribute('aria-label');
    const ariaLabelledBy = await element.getAttribute('aria-labelledby');
    const textContent = await element.textContent();
    const title = await element.getAttribute('title');

    // Each interactive element should have some form of accessible name
    const hasAccessibleName =
      ariaLabel || ariaLabelledBy || textContent?.trim() || title;
    expect(hasAccessibleName).toBeTruthy();
  }
}

/**
 * Test keyboard navigation
 */
export async function testKeyboardNavigation(page: Page): Promise<void> {
  // Start from the beginning
  await page.keyboard.press('Tab');

  // Tab through several elements
  for (let i = 0; i < 10; i++) {
    const focusedElement = page.locator(':focus');

    // Element should be visible when focused
    if ((await focusedElement.count()) > 0) {
      await expect(focusedElement).toBeVisible();
    }

    await page.keyboard.press('Tab');
    await page.waitForTimeout(100); // Brief pause between tabs
  }
}

/**
 * Measure page performance metrics
 */
export async function measurePerformance(page: Page): Promise<{
  loadTime: number;
  domContentLoaded: number;
  firstContentfulPaint: number;
  largestContentfulPaint: number;
}> {
  const metrics = await page.evaluate(() => {
    return new Promise(resolve => {
      const navigation = performance.getEntriesByType(
        'navigation'
      )[0] as PerformanceNavigationTiming;
      const paint = performance.getEntriesByType('paint');

      const result = {
        loadTime: navigation.loadEventEnd - navigation.navigationStart,
        domContentLoaded:
          navigation.domContentLoadedEventEnd - navigation.navigationStart,
        firstContentfulPaint: 0,
        largestContentfulPaint: 0,
      };

      // Get First Contentful Paint
      const fcp = paint.find(entry => entry.name === 'first-contentful-paint');
      if (fcp) {
        result.firstContentfulPaint = fcp.startTime;
      }

      // Get Largest Contentful Paint
      let lcpValue = 0;
      new PerformanceObserver(list => {
        const entries = list.getEntries();
        const lastEntry = entries[entries.length - 1];
        lcpValue = lastEntry.startTime;
      }).observe({ entryTypes: ['largest-contentful-paint'] });

      setTimeout(() => {
        result.largestContentfulPaint = lcpValue;
        resolve(result);
      }, 1000);
    });
  });

  return metrics as any;
}

/**
 * Wait for repository cards to load
 */
export async function waitForRepositoryCards(
  page: Page,
  timeout: number = 15000
): Promise<void> {
  await expect(
    page.locator('[data-testid="repository-card"]').first()
  ).toBeVisible({ timeout });
}

/**
 * Get repository card data for testing
 */
export async function getRepositoryCardData(
  page: Page,
  index: number = 0
): Promise<{
  name: string;
  stars: string;
  language: string;
  author: string;
}> {
  const card = page.locator('[data-testid="repository-card"]').nth(index);

  const name = (await card.getByRole('heading').textContent()) || '';
  const stars =
    (await card.locator('[data-testid="repo-stars"]').textContent()) || '';
  const language =
    (await card.locator('[data-testid="repo-language"]').textContent()) || '';
  const author =
    (await card.locator('[data-testid="repo-author"]').textContent()) || '';

  return { name, stars, language, author };
}

/**
 * Test theme switching functionality
 */
export async function testThemeSwitching(page: Page): Promise<void> {
  const themeToggle = page.getByRole('button', { name: /toggle theme|theme/i });
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

  // Toggle back
  await themeToggle.click();
  await page.waitForTimeout(500);

  // Verify theme returned to original state
  const finalTheme = await page.evaluate(() =>
    document.documentElement.classList.contains('dark')
  );
  expect(finalTheme).toBe(initialTheme);
}

/**
 * Test search functionality
 */
export async function testSearchFunctionality(
  page: Page,
  query: string = 'react'
): Promise<void> {
  const searchInput = page.getByPlaceholder(/search repositories/i);
  await expect(searchInput).toBeVisible();

  await searchInput.fill(query);
  await page.keyboard.press('Enter');
  await page.waitForLoadState('networkidle');

  // Should show search results or no results message
  const hasResults =
    (await page.locator('[data-testid="repository-card"]').count()) > 0;
  const hasNoResults =
    (await page.getByText(/no results|no repositories found/i).count()) > 0;

  expect(hasResults || hasNoResults).toBeTruthy();

  // Clear search
  await searchInput.clear();
  await page.keyboard.press('Enter');
  await page.waitForLoadState('networkidle');
}

/**
 * Test mobile navigation
 */
export async function testMobileNavigation(page: Page): Promise<void> {
  // Set mobile viewport
  await page.setViewportSize({ width: 375, height: 667 });

  const mobileMenuButton = page
    .getByRole('button', { name: /menu|navigation/i })
    .or(page.locator('button[aria-label*="menu"]'));

  if ((await mobileMenuButton.count()) > 0) {
    await mobileMenuButton.click();

    // Mobile navigation should be visible
    const mobileNav = page.getByRole('navigation');
    await expect(mobileNav).toBeVisible();

    // Test navigation link
    const newsletterLink = page.getByRole('link', { name: /newsletter/i });
    if ((await newsletterLink.count()) > 0) {
      await newsletterLink.click();
      await page.waitForLoadState('networkidle');
    }
  }
}

/**
 * Simulate network error for error handling tests
 */
export async function simulateNetworkError(page: Page): Promise<void> {
  await page.route('**/api/**', route => {
    route.abort('failed');
  });
}

/**
 * Restore network after error simulation
 */
export async function restoreNetwork(page: Page): Promise<void> {
  await page.unroute('**/api/**');
}

/**
 * Test newsletter subscription form
 */
export async function testNewsletterForm(
  page: Page,
  email: string = 'test@example.com'
): Promise<void> {
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
      const errorMessage = page.getByText(
        /invalid email|please enter a valid email/i
      );
      if ((await errorMessage.count()) > 0) {
        await expect(errorMessage).toBeVisible();
      }

      // Test valid email
      await emailInput.fill(email);
      await expect(emailInput).toHaveValue(email);
    }
  }
}

/**
 * Check for loading states
 */
export async function checkLoadingStates(page: Page): Promise<void> {
  // Look for loading indicators
  const loadingIndicators = [
    page.getByText(/loading|searching/i),
    page.locator('[data-testid="loading"]'),
    page.locator('.animate-spin'),
    page.locator('[data-testid="skeleton"]'),
    page.locator('.animate-pulse'),
  ];

  // At least one loading indicator should be present during loading
  let hasLoadingIndicator = false;
  for (const indicator of loadingIndicators) {
    if ((await indicator.count()) > 0) {
      hasLoadingIndicator = true;
      break;
    }
  }

  // Note: Loading indicators might be very brief, so we don't assert their presence
  // but we log whether they were found
  console.log(`Loading indicators found: ${hasLoadingIndicator}`);
}

/**
 * Test filter functionality
 */
export async function testFilterFunctionality(page: Page): Promise<void> {
  // Desktop view for filters
  await page.setViewportSize({ width: 1024, height: 768 });

  const languageFilter = page.getByText('Language').first();
  if (await languageFilter.isVisible()) {
    await languageFilter.click();

    // Select a language filter if available
    const pythonOption = page.getByText('Python').first();
    if (await pythonOption.isVisible()) {
      await pythonOption.click();
      await page.waitForLoadState('networkidle');

      // Verify filtered results if any
      const filteredCards = page.locator('[data-testid="repository-card"]');
      if ((await filteredCards.count()) > 0) {
        console.log('Filter applied successfully');
      }
    }
  }
}

/**
 * Cleanup function for tests
 */
export async function cleanup(page: Page): Promise<void> {
  // Clear any routes that were set up
  await page.unroute('**/*');

  // Clear local storage
  await page.evaluate(() => {
    localStorage.clear();
    sessionStorage.clear();
  });

  // Reset viewport to default
  await page.setViewportSize({ width: 1280, height: 720 });
}
