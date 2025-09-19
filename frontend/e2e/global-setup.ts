import { chromium, FullConfig } from '@playwright/test';
import { testDataManager } from './test-data-setup';

async function globalSetup(config: FullConfig) {
  console.log('🚀 Starting global test setup...');

  const browser = await chromium.launch();
  const page = await browser.newPage();

  try {
    // Wait for API to be ready
    console.log('⏳ Waiting for API to be ready...');
    const apiReady = await testDataManager.waitForAPI(60000);

    if (!apiReady) {
      throw new Error('API is not ready after 60 seconds');
    }

    console.log('✅ API is ready');

    // Wait for frontend to be ready
    console.log('⏳ Waiting for frontend to be ready...');
    const frontendUrl =
      process.env.FRONTEND_BASE_URL || 'http://localhost:3000';

    let frontendReady = false;
    const maxAttempts = 30;

    for (let i = 0; i < maxAttempts; i++) {
      try {
        await page.goto(frontendUrl, { timeout: 5000 });
        await page.waitForSelector('body', { timeout: 5000 });
        frontendReady = true;
        break;
      } catch (error) {
        console.log(`Frontend not ready, attempt ${i + 1}/${maxAttempts}`);
        await page.waitForTimeout(2000);
      }
    }

    if (!frontendReady) {
      throw new Error('Frontend is not ready after 60 seconds');
    }

    console.log('✅ Frontend is ready');

    // Setup test environment
    console.log('🔧 Setting up test environment...');

    // Reset database to clean state
    await testDataManager.resetDatabase();

    // Seed with minimal required data
    await testDataManager.seedMinimalData();

    // Create comprehensive test data
    const testData = await testDataManager.setupTestEnvironment();

    console.log(
      `✅ Test environment ready with ${testData.repositories.length} repositories and ${testData.subscriptions.length} subscriptions`
    );

    // Store test data for use in tests
    process.env.TEST_DATA_READY = 'true';
  } catch (error) {
    console.error('❌ Global setup failed:', error);
    throw error;
  } finally {
    await browser.close();
  }

  console.log('🎉 Global test setup complete!');
}

export default globalSetup;
