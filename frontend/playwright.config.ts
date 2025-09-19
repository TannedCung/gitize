import { defineConfig, devices } from '@playwright/test';

/**
 * @see https://playwright.dev/docs/test-configuration
 */
export default defineConfig({
  testDir: './e2e',
  /* Run tests in files in parallel */
  fullyParallel: true,
  /* Fail the build on CI if you accidentally left test.only in the source code. */
  forbidOnly: !!process.env.CI,
  /* Retry on CI only */
  retries: process.env.CI ? 2 : 0,
  /* Opt out of parallel tests on CI. */
  workers: process.env.CI ? 1 : undefined,
  /* Reporter to use. See https://playwright.dev/docs/test-reporters */
  reporter: [
    ['html'],
    ['json', { outputFile: 'test-results/results.json' }],
    ['junit', { outputFile: 'test-results/junit.xml' }],
    ['github'],
  ],
  /* Global timeout for each test */
  timeout: 60 * 1000,
  /* Expect timeout for assertions */
  expect: {
    timeout: 10 * 1000,
  },
  /* Shared settings for all the projects below. See https://playwright.dev/docs/api/class-testoptions. */
  use: {
    /* Base URL to use in actions like `await page.goto('/')`. */
    baseURL: process.env.FRONTEND_BASE_URL || 'http://localhost:3000',

    /* Collect trace when retrying the failed test. See https://playwright.dev/docs/trace-viewer */
    trace: 'on-first-retry',

    /* Take screenshot on failure */
    screenshot: 'only-on-failure',

    /* Record video on failure */
    video: 'retain-on-failure',

    /* Extra HTTP headers */
    extraHTTPHeaders: {
      'Accept-Language': 'en-US,en;q=0.9',
    },

    /* Ignore HTTPS errors */
    ignoreHTTPSErrors: true,

    /* API base URL for API tests */
    baseURL: process.env.API_BASE_URL || 'http://localhost:8000',
  },

  /* Global setup and teardown */
  globalSetup: require.resolve('./e2e/global-setup.ts'),
  globalTeardown: require.resolve('./e2e/global-teardown.ts'),

  /* Configure projects for major browsers */
  projects: [
    // Setup project
    {
      name: 'setup',
      testMatch: /.*\.setup\.ts/,
    },

    // Desktop browsers - Critical user journeys
    {
      name: 'chromium',
      testMatch: /critical-user-journeys\.spec\.ts|user-workflows\.spec\.ts/,
      use: { ...devices['Desktop Chrome'] },
      dependencies: ['setup'],
    },

    {
      name: 'firefox',
      testMatch: /critical-user-journeys\.spec\.ts/,
      use: { ...devices['Desktop Firefox'] },
      dependencies: ['setup'],
    },

    {
      name: 'webkit',
      testMatch: /critical-user-journeys\.spec\.ts/,
      use: { ...devices['Desktop Safari'] },
      dependencies: ['setup'],
    },

    // Mobile browsers
    {
      name: 'Mobile Chrome',
      testMatch: /critical-user-journeys\.spec\.ts|user-workflows\.spec\.ts/,
      use: { ...devices['Pixel 5'] },
      dependencies: ['setup'],
    },
    {
      name: 'Mobile Safari',
      testMatch: /critical-user-journeys\.spec\.ts/,
      use: { ...devices['iPhone 12'] },
      dependencies: ['setup'],
    },

    // API tests (browser-independent)
    {
      name: 'api',
      testMatch: /.*api.*\.spec\.ts/,
      use: {
        baseURL: process.env.API_BASE_URL || 'http://localhost:8000',
      },
      dependencies: ['setup'],
    },

    // Performance tests
    {
      name: 'performance',
      testMatch: /.*performance.*\.spec\.ts/,
      use: {
        ...devices['Desktop Chrome'],
        // Disable animations for consistent performance measurements
        reducedMotion: 'reduce',
      },
      dependencies: ['setup'],
    },

    // Visual regression tests
    {
      name: 'visual',
      testMatch: /.*visual.*\.spec\.ts/,
      use: {
        ...devices['Desktop Chrome'],
        // Consistent settings for visual tests
        viewport: { width: 1280, height: 720 },
        // Disable animations for consistent screenshots
        reducedMotion: 'reduce',
      },
      dependencies: ['setup'],
    },

    // Accessibility tests
    {
      name: 'accessibility',
      testMatch: /.*accessibility.*\.spec\.ts/,
      use: {
        ...devices['Desktop Chrome'],
        // Enable accessibility features
        forcedColors: 'none',
        reducedMotion: 'no-preference',
      },
      dependencies: ['setup'],
    },

    // Comprehensive test suite (all tests)
    {
      name: 'comprehensive',
      testMatch: /.*\.spec\.ts/,
      use: { ...devices['Desktop Chrome'] },
      dependencies: ['setup'],
    },
  ],

  /* Run your local dev server before starting the tests */
  webServer: process.env.CI
    ? undefined
    : [
        {
          command: 'npm run dev',
          url: 'http://localhost:3000',
          reuseExistingServer: !process.env.CI,
          timeout: 120 * 1000,
        },
        {
          command: 'cd ../backend && cargo run',
          url: 'http://localhost:8000/api/health',
          reuseExistingServer: !process.env.CI,
          timeout: 180 * 1000,
        },
      ],

  /* Output directory for test results */
  outputDir: 'test-results/',
});
