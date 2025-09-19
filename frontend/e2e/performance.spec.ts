import { test, expect } from '@playwright/test';

test.describe('Performance Tests', () => {
  test('Page load performance metrics', async ({ page }) => {
    // Start performance measurement
    const startTime = Date.now();

    await page.goto('/');

    // Wait for main content to be visible
    await expect(
      page.getByRole('heading', { name: /trending repositories/i })
    ).toBeVisible();

    const loadTime = Date.now() - startTime;

    // Performance assertions
    expect(loadTime).toBeLessThan(5000); // Page should load within 5 seconds

    // Measure Core Web Vitals
    const webVitals = await page.evaluate(() => {
      return new Promise(resolve => {
        const vitals: any = {};

        // Largest Contentful Paint (LCP)
        new PerformanceObserver(list => {
          const entries = list.getEntries();
          const lastEntry = entries[entries.length - 1];
          vitals.lcp = lastEntry.startTime;
        }).observe({ entryTypes: ['largest-contentful-paint'] });

        // First Input Delay (FID) - simulated
        vitals.fid = 0; // Will be measured on actual user interaction

        // Cumulative Layout Shift (CLS)
        let clsValue = 0;
        new PerformanceObserver(list => {
          for (const entry of list.getEntries()) {
            if (!(entry as any).hadRecentInput) {
              clsValue += (entry as any).value;
            }
          }
          vitals.cls = clsValue;
        }).observe({ entryTypes: ['layout-shift'] });

        // First Contentful Paint (FCP)
        new PerformanceObserver(list => {
          const entries = list.getEntries();
          vitals.fcp = entries[0].startTime;
        }).observe({ entryTypes: ['paint'] });

        // Time to Interactive (TTI) - approximated
        setTimeout(() => {
          vitals.tti = performance.now();
          resolve(vitals);
        }, 1000);
      });
    });

    console.log('Web Vitals:', webVitals);

    // Assert Core Web Vitals thresholds
    expect((webVitals as any).lcp).toBeLessThan(2500); // LCP should be < 2.5s
    expect((webVitals as any).fcp).toBeLessThan(1800); // FCP should be < 1.8s
    expect((webVitals as any).cls).toBeLessThan(0.1); // CLS should be < 0.1
  });

  test('API response time performance', async ({ page }) => {
    // Measure API response times
    const apiTimes: { [key: string]: number } = {};
    const requestStartTimes: { [key: string]: number } = {};

    page.on('request', request => {
      if (request.url().includes('/api/')) {
        requestStartTimes[request.url()] = Date.now();
      }
    });

    page.on('response', response => {
      if (response.url().includes('/api/')) {
        const startTime = requestStartTimes[response.url()];
        if (startTime) {
          apiTimes[response.url()] = Date.now() - startTime;
        }
      }
    });

    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Check API response times
    for (const [url, time] of Object.entries(apiTimes)) {
      console.log(`API ${url}: ${time}ms`);
      expect(time).toBeLessThan(2000); // API calls should complete within 2 seconds
    }
  });

  test('Search performance', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    const searchInput = page.getByPlaceholder(/search repositories/i);

    // Measure search response time
    const searchStartTime = Date.now();

    await searchInput.fill('react');
    await page.keyboard.press('Enter');

    // Wait for search results or no results message
    await Promise.race([
      page.waitForSelector('[data-testid="repository-card"]', {
        timeout: 5000,
      }),
      page.waitForSelector('[data-testid="no-results"]', { timeout: 5000 }),
      page.waitForTimeout(5000),
    ]);

    const searchTime = Date.now() - searchStartTime;

    console.log(`Search completed in: ${searchTime}ms`);
    expect(searchTime).toBeLessThan(3000); // Search should complete within 3 seconds
  });

  test('Filter performance', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Desktop view for filters
    await page.setViewportSize({ width: 1024, height: 768 });

    const languageFilter = page.getByText('Language').first();

    if (await languageFilter.isVisible()) {
      const filterStartTime = Date.now();

      await languageFilter.click();

      // Select a language filter
      const pythonOption = page.getByText('Python').first();
      if (await pythonOption.isVisible()) {
        await pythonOption.click();

        // Wait for filtered results
        await page.waitForLoadState('networkidle');

        const filterTime = Date.now() - filterStartTime;

        console.log(`Filter applied in: ${filterTime}ms`);
        expect(filterTime).toBeLessThan(2000); // Filter should apply within 2 seconds
      }
    }
  });

  test('Theme switching performance', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    const themeToggle = page.getByRole('button', {
      name: /toggle theme|theme/i,
    });

    const switchStartTime = Date.now();
    await themeToggle.click();

    // Wait for theme transition to complete
    await page.waitForTimeout(500);

    const switchTime = Date.now() - switchStartTime;

    console.log(`Theme switch completed in: ${switchTime}ms`);
    expect(switchTime).toBeLessThan(1000); // Theme switch should be instant
  });

  test('Memory usage during navigation', async ({ page }) => {
    // Navigate through different pages and measure memory
    const pages = ['/', '/newsletter', '/search', '/demo'];

    for (const pagePath of pages) {
      await page.goto(pagePath);
      await page.waitForLoadState('networkidle');

      // Get memory usage
      const memoryUsage = await page.evaluate(() => {
        return (performance as any).memory
          ? {
              usedJSHeapSize: (performance as any).memory.usedJSHeapSize,
              totalJSHeapSize: (performance as any).memory.totalJSHeapSize,
              jsHeapSizeLimit: (performance as any).memory.jsHeapSizeLimit,
            }
          : null;
      });

      if (memoryUsage) {
        console.log(`Memory usage on ${pagePath}:`, memoryUsage);

        // Memory usage should not exceed reasonable limits
        expect(memoryUsage.usedJSHeapSize).toBeLessThan(50 * 1024 * 1024); // < 50MB
      }
    }
  });

  test('Bundle size and resource loading', async ({ page }) => {
    const resourceSizes: { [key: string]: number } = {};

    page.on('response', response => {
      const contentLength = response.headers()['content-length'];
      if (contentLength) {
        resourceSizes[response.url()] = parseInt(contentLength);
      }
    });

    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Check JavaScript bundle sizes
    const jsResources = Object.entries(resourceSizes).filter(
      ([url]) => url.includes('.js') && !url.includes('node_modules')
    );

    for (const [url, size] of jsResources) {
      console.log(`JS Bundle ${url}: ${(size / 1024).toFixed(2)}KB`);
      expect(size).toBeLessThan(1024 * 1024); // JS bundles should be < 1MB each
    }

    // Check CSS bundle sizes
    const cssResources = Object.entries(resourceSizes).filter(([url]) =>
      url.includes('.css')
    );

    for (const [url, size] of cssResources) {
      console.log(`CSS Bundle ${url}: ${(size / 1024).toFixed(2)}KB`);
      expect(size).toBeLessThan(500 * 1024); // CSS bundles should be < 500KB each
    }
  });

  test('Infinite scroll performance', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Get initial repository count
    const initialCount = await page
      .locator('[data-testid="repository-card"]')
      .count();

    if (initialCount > 0) {
      // Scroll to bottom to trigger infinite scroll
      const scrollStartTime = Date.now();

      await page.evaluate(() => {
        window.scrollTo(0, document.body.scrollHeight);
      });

      // Wait for new content to load
      await page.waitForTimeout(2000);

      const scrollTime = Date.now() - scrollStartTime;

      // Check if more content was loaded
      const newCount = await page
        .locator('[data-testid="repository-card"]')
        .count();

      console.log(`Scroll loading completed in: ${scrollTime}ms`);
      console.log(`Loaded ${newCount - initialCount} additional items`);

      expect(scrollTime).toBeLessThan(3000); // Scroll loading should complete within 3 seconds
    }
  });

  test('Image loading performance', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Check for images (avatars, logos, etc.)
    const images = page.locator('img');
    const imageCount = await images.count();

    if (imageCount > 0) {
      // Measure image loading times
      const imageLoadTimes: number[] = [];

      for (let i = 0; i < Math.min(imageCount, 5); i++) {
        const image = images.nth(i);
        const startTime = Date.now();

        await image.waitFor({ state: 'visible' });

        const loadTime = Date.now() - startTime;
        imageLoadTimes.push(loadTime);
      }

      const averageLoadTime =
        imageLoadTimes.reduce((a, b) => a + b, 0) / imageLoadTimes.length;

      console.log(`Average image load time: ${averageLoadTime}ms`);
      expect(averageLoadTime).toBeLessThan(1000); // Images should load within 1 second on average
    }
  });

  test('Concurrent user simulation', async ({ browser }) => {
    // Simulate multiple concurrent users
    const contexts = await Promise.all([
      browser.newContext(),
      browser.newContext(),
      browser.newContext(),
    ]);

    const pages = await Promise.all(contexts.map(context => context.newPage()));

    const startTime = Date.now();

    // All users navigate to the site simultaneously
    await Promise.all(pages.map(page => page.goto('/')));

    // Wait for all pages to load
    await Promise.all(
      pages.map(page =>
        expect(
          page.getByRole('heading', { name: /trending repositories/i })
        ).toBeVisible()
      )
    );

    const concurrentLoadTime = Date.now() - startTime;

    console.log(`Concurrent load time for 3 users: ${concurrentLoadTime}ms`);
    expect(concurrentLoadTime).toBeLessThan(8000); // Should handle concurrent users within 8 seconds

    // Clean up
    await Promise.all(contexts.map(context => context.close()));
  });

  test('Network throttling performance', async ({ page }) => {
    // Simulate slow 3G network
    await page.route('**/*', async route => {
      // Add artificial delay to simulate slow network
      await new Promise(resolve => setTimeout(resolve, 100));
      route.continue();
    });

    const startTime = Date.now();

    await page.goto('/');
    await expect(
      page.getByRole('heading', { name: /trending repositories/i })
    ).toBeVisible();

    const throttledLoadTime = Date.now() - startTime;

    console.log(`Load time with network throttling: ${throttledLoadTime}ms`);
    expect(throttledLoadTime).toBeLessThan(10000); // Should still load within 10 seconds on slow network
  });
});
