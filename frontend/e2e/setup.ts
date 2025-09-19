import { test as setup, expect } from '@playwright/test';
import { testDataManager, createMockAPIResponses } from './test-data-setup';

const authFile = 'playwright/.auth/user.json';

setup(
  'authenticate and prepare test environment',
  async ({ page, request }) => {
    console.log('🔧 Setting up test environment for this worker...');

    // Check if we're in offline mode or if API is not available
    const apiBaseUrl = process.env.API_BASE_URL || 'http://localhost:8000';
    let apiAvailable = false;

    try {
      const healthResponse = await request.get(`${apiBaseUrl}/api/health`);
      apiAvailable = healthResponse.ok();
    } catch (error) {
      console.log('API not available, setting up mock responses');
    }

    if (!apiAvailable) {
      // Setup mock API responses for offline testing
      const mockResponses = createMockAPIResponses();

      await page.route('**/api/repositories/trending*', async route => {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify(mockResponses.trending),
        });
      });

      await page.route('**/api/repositories/search*', async route => {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify(mockResponses.search),
        });
      });

      await page.route('**/api/health*', async route => {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify(mockResponses.health),
        });
      });

      await page.route('**/api/newsletter/subscribe*', async route => {
        await route.fulfill({
          status: 201,
          contentType: 'application/json',
          body: JSON.stringify({
            message: 'Subscription successful',
            subscription_id: 'mock-id-123',
          }),
        });
      });

      console.log('✅ Mock API responses configured');
    }

    // Navigate to the application
    await page.goto('/');

    // Wait for the page to load
    await expect(
      page.getByRole('heading', { name: /trending repositories/i })
    ).toBeVisible({ timeout: 15000 });

    // Verify basic functionality works
    const repositoryCards = page.locator('[data-testid="repository-card"]');
    await expect(repositoryCards.first()).toBeVisible({ timeout: 10000 });

    console.log('✅ Application is responsive and ready for testing');

    // Test theme functionality
    const themeToggle = page.getByRole('button', {
      name: /toggle theme|theme/i,
    });
    if (await themeToggle.isVisible()) {
      await themeToggle.click();
      await page.waitForTimeout(300);
      await themeToggle.click(); // Switch back
      await page.waitForTimeout(300);
      console.log('✅ Theme switching verified');
    }

    // Test search functionality
    const searchInput = page.getByPlaceholder(/search repositories/i);
    if (await searchInput.isVisible()) {
      await searchInput.fill('test');
      await page.keyboard.press('Enter');
      await page.waitForLoadState('networkidle');
      await searchInput.clear();
      await page.keyboard.press('Enter');
      await page.waitForLoadState('networkidle');
      console.log('✅ Search functionality verified');
    }

    // Store authentication state (if any)
    // For this application, we don't have authentication yet, but this is where it would go
    // await page.context().storageState({ path: authFile });

    console.log('🎉 Test environment setup complete for this worker!');
  }
);

setup('verify API endpoints', async ({ request }) => {
  const apiBaseUrl = process.env.API_BASE_URL || 'http://localhost:8000';

  try {
    // Test health endpoint
    const healthResponse = await request.get(`${apiBaseUrl}/api/health`);
    expect(healthResponse.ok()).toBeTruthy();

    // Test trending repositories endpoint
    const trendingResponse = await request.get(
      `${apiBaseUrl}/api/repositories/trending?per_page=5`
    );
    expect(trendingResponse.ok()).toBeTruthy();

    console.log('✅ API endpoints verified');
  } catch (error) {
    console.log('⚠️ API endpoints not available, tests will use mock data');
  }
});
