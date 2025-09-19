# End-to-End Test Suite

This directory contains comprehensive end-to-end tests for the GitHub Trending Summarizer application using Playwright.

## Test Structure

### Test Files

- **`critical-user-journeys.spec.ts`** - Core user workflows and critical functionality
- **`user-workflows.spec.ts`** - Complete user interaction scenarios
- **`visual-regression.spec.ts`** - Visual consistency and UI regression tests
- **`performance.spec.ts`** - Performance metrics and load time tests
- **`api-performance.spec.ts`** - API endpoint performance testing
- **`api-endpoints.spec.ts`** - Comprehensive API functionality tests
- **`accessibility.spec.ts`** - WCAG compliance and accessibility testing

### Support Files

- **`global-setup.ts`** - Global test environment setup
- **`global-teardown.ts`** - Global test cleanup
- **`setup.ts`** - Per-worker test setup
- **`test-data-setup.ts`** - Test data management utilities
- **`test-utils.ts`** - Common test helper functions
- **`test-config.ts`** - Test configuration and constants

## Running Tests

### Quick Start

```bash
# Run critical user journeys (recommended for development)
npm run test:e2e:critical

# Run all tests
npm run test:e2e:comprehensive

# Run with UI mode for debugging
npm run test:e2e:ui
```

### Test Suites

| Command                          | Description           | Use Case               |
| -------------------------------- | --------------------- | ---------------------- |
| `npm run test:e2e:critical`      | Core user journeys    | Development, CI        |
| `npm run test:e2e:api`           | API endpoint tests    | Backend validation     |
| `npm run test:e2e:performance`   | Performance tests     | Performance monitoring |
| `npm run test:e2e:visual`        | Visual regression     | UI consistency         |
| `npm run test:e2e:accessibility` | Accessibility tests   | WCAG compliance        |
| `npm run test:e2e:mobile`        | Mobile-specific tests | Mobile compatibility   |
| `npm run test:e2e:cross-browser` | Cross-browser tests   | Browser compatibility  |
| `npm run test:e2e:smoke`         | Quick smoke tests     | Fast validation        |

### Custom Test Runner

Use the custom test runner script for more control:

```bash
# Basic usage
./scripts/run-e2e-tests.sh [test-suite] [environment] [headless]

# Examples
./scripts/run-e2e-tests.sh critical development false
./scripts/run-e2e-tests.sh api ci true
./scripts/run-e2e-tests.sh performance staging true
```

## Test Configuration

### Environments

- **development** - Local development environment
- **ci** - Continuous integration environment
- **staging** - Staging environment testing
- **production** - Production environment testing

### Browser Projects

- **chromium** - Primary testing browser
- **firefox** - Cross-browser compatibility
- **webkit** - Safari compatibility
- **Mobile Chrome** - Mobile testing
- **Mobile Safari** - iOS compatibility

## Test Data Management

### Automated Test Data

The test suite automatically manages test data through:

1. **Global Setup** - Creates test environment and seeds data
2. **Test Isolation** - Each test runs with clean data
3. **Global Teardown** - Cleans up test data after completion

### Mock Data

For offline testing or when the backend is unavailable, tests use mock data:

```typescript
import { mockAPIResponses } from './test-utils';

// Setup mock responses
await mockAPIResponses(page);
```

### Custom Test Data

Create custom test data using the test data manager:

```typescript
import { testDataManager } from './test-data-setup';

// Create test repositories
const repositories = await testDataManager.createTestRepositories(10);

// Create test subscriptions
const subscriptions = await testDataManager.createTestSubscriptions(5);
```

## Writing Tests

### Test Structure

Follow this structure for new tests:

```typescript
import { test, expect } from '@playwright/test';
import { waitForRepositoryCards, testThemeSwitching } from './test-utils';

test.describe('Feature Name Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
  });

  test('should perform specific action', async ({ page }) => {
    // Arrange
    await waitForRepositoryCards(page);

    // Act
    await page.getByRole('button', { name: /action/i }).click();

    // Assert
    await expect(page.getByText(/expected result/i)).toBeVisible();
  });
});
```

### Best Practices

1. **Use semantic selectors** - Prefer `getByRole`, `getByText`, `getByLabel`
2. **Wait for stability** - Use `waitForLoadState('networkidle')` after navigation
3. **Test user behavior** - Focus on what users actually do
4. **Handle flaky elements** - Hide dynamic content in visual tests
5. **Use test utilities** - Leverage helper functions for common actions

### Accessibility Testing

Include accessibility checks in your tests:

```typescript
import { checkAccessibility, testKeyboardNavigation } from './test-utils';

test('feature is accessible', async ({ page }) => {
  await page.goto('/feature');

  // Check general accessibility
  await checkAccessibility(page);

  // Test keyboard navigation
  await testKeyboardNavigation(page);
});
```

### Performance Testing

Add performance assertions:

```typescript
test('feature loads quickly', async ({ page }) => {
  const startTime = Date.now();

  await page.goto('/feature');
  await expect(page.getByRole('heading')).toBeVisible();

  const loadTime = Date.now() - startTime;
  expect(loadTime).toBeLessThan(3000);
});
```

## Debugging Tests

### Visual Debugging

```bash
# Run with browser UI
npm run test:e2e:headed

# Run with Playwright UI
npm run test:e2e:ui

# Debug specific test
npx playwright test --debug critical-user-journeys.spec.ts
```

### Screenshots and Videos

Tests automatically capture:

- Screenshots on failure
- Videos on failure (in CI)
- Traces for debugging

Access these in the `test-results/` directory.

### Console Logs

View browser console logs:

```typescript
page.on('console', msg => console.log('Browser:', msg.text()));
page.on('pageerror', err => console.log('Page error:', err.message));
```

## CI/CD Integration

### GitHub Actions

```yaml
- name: Run E2E Tests
  run: |
    npm run test:e2e:critical
  env:
    TEST_ENV: ci
    API_BASE_URL: ${{ secrets.API_BASE_URL }}
    FRONTEND_BASE_URL: ${{ secrets.FRONTEND_BASE_URL }}
```

### Test Reports

Tests generate multiple report formats:

- HTML report (`playwright-report/index.html`)
- JSON results (`test-results/results.json`)
- JUnit XML (`test-results/junit.xml`)

## Troubleshooting

### Common Issues

1. **Tests timeout** - Increase timeout in `playwright.config.ts`
2. **Flaky visual tests** - Hide dynamic content with CSS
3. **API not available** - Tests will use mock data automatically
4. **Browser crashes** - Check system resources and reduce parallelism

### Environment Variables

| Variable            | Description         | Default                 |
| ------------------- | ------------------- | ----------------------- |
| `TEST_ENV`          | Test environment    | `development`           |
| `API_BASE_URL`      | Backend API URL     | `http://localhost:8000` |
| `FRONTEND_BASE_URL` | Frontend URL        | `http://localhost:3000` |
| `CI`                | CI environment flag | `false`                 |

### Getting Help

1. Check the [Playwright documentation](https://playwright.dev/)
2. Review test logs in `test-results/`
3. Use `--debug` flag for step-by-step debugging
4. Check browser console for JavaScript errors

## Contributing

When adding new tests:

1. Follow the existing test structure
2. Add appropriate test utilities for reusable functionality
3. Include accessibility and performance considerations
4. Update this documentation for new test suites
5. Ensure tests work in both online and offline modes

## Performance Thresholds

Current performance expectations:

- Page load: < 5 seconds
- API response: < 2 seconds
- Search response: < 3 seconds
- Theme switching: < 1 second
- Image loading: < 1 second

Update these thresholds in `test-config.ts` as the application evolves.
