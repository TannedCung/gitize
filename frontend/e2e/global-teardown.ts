import { testDataManager } from './test-data-setup';

async function globalTeardown() {
  console.log('🧹 Starting global test teardown...');

  try {
    // Clean up test data
    await testDataManager.cleanup();

    console.log('✅ Test data cleanup complete');

    // Reset database to clean state for next run
    await testDataManager.resetDatabase();

    console.log('✅ Database reset complete');
  } catch (error) {
    console.error('❌ Global teardown failed:', error);
    // Don't throw error to avoid failing the test run
  }

  console.log('🎉 Global test teardown complete!');
}

export default globalTeardown;
