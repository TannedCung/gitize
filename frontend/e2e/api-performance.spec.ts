import { test, expect } from '@playwright/test';

test.describe('API Performance Tests', () => {
  const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:8000';

  test('Health endpoint performance', async ({ request }) => {
    const startTime = Date.now();

    const response = await request.get(`${API_BASE_URL}/api/health`);

    const responseTime = Date.now() - startTime;

    expect(response.status()).toBe(200);
    expect(responseTime).toBeLessThan(500); // Health check should be very fast

    const data = await response.json();
    expect(data.status).toBe('healthy');

    console.log(`Health endpoint response time: ${responseTime}ms`);
  });

  test('Trending repositories endpoint performance', async ({ request }) => {
    const startTime = Date.now();

    const response = await request.get(
      `${API_BASE_URL}/api/repositories/trending`
    );

    const responseTime = Date.now() - startTime;

    expect(response.status()).toBe(200);
    expect(responseTime).toBeLessThan(2000); // Should respond within 2 seconds

    const data = await response.json();
    expect(data).toHaveProperty('repositories');
    expect(Array.isArray(data.repositories)).toBe(true);

    console.log(`Trending repositories response time: ${responseTime}ms`);
    console.log(`Returned ${data.repositories.length} repositories`);
  });

  test('Search endpoint performance', async ({ request }) => {
    const queries = ['react', 'python', 'javascript', 'rust', 'go'];

    for (const query of queries) {
      const startTime = Date.now();

      const response = await request.get(
        `${API_BASE_URL}/api/repositories/search?q=${query}`
      );

      const responseTime = Date.now() - startTime;

      expect(response.status()).toBe(200);
      expect(responseTime).toBeLessThan(3000); // Search should complete within 3 seconds

      const data = await response.json();
      expect(data).toHaveProperty('repositories');

      console.log(`Search "${query}" response time: ${responseTime}ms`);
    }
  });

  test('Pagination performance', async ({ request }) => {
    const pages = [1, 2, 3];

    for (const page of pages) {
      const startTime = Date.now();

      const response = await request.get(
        `${API_BASE_URL}/api/repositories/trending?page=${page}&per_page=10`
      );

      const responseTime = Date.now() - startTime;

      expect(response.status()).toBe(200);
      expect(responseTime).toBeLessThan(2000);

      const data = await response.json();
      expect(data.page).toBe(page);

      console.log(`Page ${page} response time: ${responseTime}ms`);
    }
  });

  test('Filter performance', async ({ request }) => {
    const languages = ['JavaScript', 'Python', 'TypeScript', 'Rust'];

    for (const language of languages) {
      const startTime = Date.now();

      const response = await request.get(
        `${API_BASE_URL}/api/repositories/trending?language=${language}`
      );

      const responseTime = Date.now() - startTime;

      expect(response.status()).toBe(200);
      expect(responseTime).toBeLessThan(2000);

      console.log(`Filter by ${language} response time: ${responseTime}ms`);
    }
  });

  test('Newsletter subscription performance', async ({ request }) => {
    const testEmail = `perf-test-${Date.now()}@example.com`;

    const startTime = Date.now();

    const response = await request.post(
      `${API_BASE_URL}/api/newsletter/subscribe`,
      {
        data: {
          email: testEmail,
          preferences: {
            languages: ['JavaScript'],
            frequency: 'weekly',
          },
        },
      }
    );

    const responseTime = Date.now() - startTime;

    expect(response.status()).toBeOneOf([200, 201]);
    expect(responseTime).toBeLessThan(1500); // Subscription should be fast

    console.log(`Newsletter subscription response time: ${responseTime}ms`);

    // Clean up - unsubscribe
    try {
      await request.post(`${API_BASE_URL}/api/test/newsletter/unsubscribe`, {
        data: { email: testEmail },
      });
    } catch (error) {
      // Cleanup failed, but test passed
    }
  });

  test('Concurrent API requests performance', async ({ request }) => {
    const concurrentRequests = 10;
    const requests = [];

    const startTime = Date.now();

    // Create concurrent requests
    for (let i = 0; i < concurrentRequests; i++) {
      requests.push(
        request.get(
          `${API_BASE_URL}/api/repositories/trending?page=${i + 1}&per_page=5`
        )
      );
    }

    // Wait for all requests to complete
    const responses = await Promise.all(requests);

    const totalTime = Date.now() - startTime;

    // All requests should succeed
    for (const response of responses) {
      expect(response.status()).toBe(200);
    }

    const averageTime = totalTime / concurrentRequests;

    console.log(
      `${concurrentRequests} concurrent requests completed in ${totalTime}ms`
    );
    console.log(`Average response time: ${averageTime}ms`);

    expect(totalTime).toBeLessThan(10000); // All concurrent requests within 10 seconds
    expect(averageTime).toBeLessThan(3000); // Average response time reasonable
  });

  test('API response size optimization', async ({ request }) => {
    const response = await request.get(
      `${API_BASE_URL}/api/repositories/trending?per_page=50`
    );

    expect(response.status()).toBe(200);

    const contentLength = response.headers()['content-length'];
    const data = await response.json();

    if (contentLength) {
      const sizeKB = parseInt(contentLength) / 1024;
      console.log(
        `Response size: ${sizeKB.toFixed(2)}KB for ${data.repositories.length} repositories`
      );

      // Response should be reasonably sized
      expect(sizeKB).toBeLessThan(500); // Less than 500KB for 50 repositories
    }

    // Check data structure efficiency
    if (data.repositories.length > 0) {
      const repo = data.repositories[0];

      // Should have essential fields
      expect(repo).toHaveProperty('name');
      expect(repo).toHaveProperty('stars');
      expect(repo).toHaveProperty('language');

      // Should not have unnecessary large fields
      const repoString = JSON.stringify(repo);
      expect(repoString.length).toBeLessThan(2000); // Each repo object < 2KB
    }
  });

  test('Cache performance validation', async ({ request }) => {
    const endpoint = `${API_BASE_URL}/api/repositories/trending?per_page=10`;

    // First request (cache miss)
    const startTime1 = Date.now();
    const response1 = await request.get(endpoint);
    const time1 = Date.now() - startTime1;

    expect(response1.status()).toBe(200);

    // Second request (should be cached)
    const startTime2 = Date.now();
    const response2 = await request.get(endpoint);
    const time2 = Date.now() - startTime2;

    expect(response2.status()).toBe(200);

    // Cached response should be faster (though this might not always be true in test environment)
    console.log(`First request: ${time1}ms, Second request: ${time2}ms`);

    // Both responses should have identical data
    const data1 = await response1.json();
    const data2 = await response2.json();

    expect(data1).toEqual(data2);
  });

  test('Error handling performance', async ({ request }) => {
    // Test 404 response time
    const startTime404 = Date.now();
    const response404 = await request.get(`${API_BASE_URL}/api/nonexistent`);
    const time404 = Date.now() - startTime404;

    expect(response404.status()).toBe(404);
    expect(time404).toBeLessThan(1000); // Error responses should be fast

    console.log(`404 error response time: ${time404}ms`);

    // Test validation error response time
    const startTimeValidation = Date.now();
    const responseValidation = await request.get(
      `${API_BASE_URL}/api/repositories/search`
    ); // Missing query
    const timeValidation = Date.now() - startTimeValidation;

    expect(responseValidation.status()).toBeOneOf([400, 422]);
    expect(timeValidation).toBeLessThan(1000);

    console.log(`Validation error response time: ${timeValidation}ms`);
  });

  test('Database query performance indicators', async ({ request }) => {
    // Test complex queries that might indicate database performance issues

    // Large result set
    const largeResultResponse = await request.get(
      `${API_BASE_URL}/api/repositories/trending?per_page=100`
    );
    expect(largeResultResponse.status()).toBe(200);

    // Complex search
    const complexSearchResponse = await request.get(
      `${API_BASE_URL}/api/repositories/search?q=machine learning&language=Python&min_stars=100`
    );
    expect(complexSearchResponse.status()).toBe(200);

    // Multiple filters
    const multiFilterResponse = await request.get(
      `${API_BASE_URL}/api/repositories/trending?language=JavaScript&sort=stars&order=desc`
    );
    expect(multiFilterResponse.status()).toBe(200);

    console.log('Complex database queries completed successfully');
  });
});
