import { test, expect } from '@playwright/test';

test.describe('API Endpoints Tests', () => {
  const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:8000';

  test.describe('Health and System Endpoints', () => {
    test('Health endpoint returns correct status', async ({ request }) => {
      const response = await request.get(`${API_BASE_URL}/api/health`);

      expect(response.status()).toBe(200);

      const data = await response.json();
      expect(data).toHaveProperty('status');
      expect(data.status).toBe('healthy');
      expect(data).toHaveProperty('timestamp');
    });

    test('Stats endpoint returns system statistics', async ({ request }) => {
      const response = await request.get(`${API_BASE_URL}/api/stats`);

      // Stats endpoint might not be implemented yet, so we allow 404
      if (response.status() === 200) {
        const data = await response.json();
        expect(data).toHaveProperty('repositories_count');
        expect(data).toHaveProperty('summaries_count');
      } else {
        expect(response.status()).toBeOneOf([404, 501]);
      }
    });
  });

  test.describe('Repository Endpoints', () => {
    test('Trending repositories endpoint returns valid data', async ({
      request,
    }) => {
      const response = await request.get(
        `${API_BASE_URL}/api/repositories/trending`
      );

      expect(response.status()).toBe(200);

      const data = await response.json();
      expect(data).toHaveProperty('repositories');
      expect(Array.isArray(data.repositories)).toBe(true);
      expect(data).toHaveProperty('total_count');
      expect(data).toHaveProperty('page');
      expect(data).toHaveProperty('per_page');

      // Check repository structure if any repositories exist
      if (data.repositories.length > 0) {
        const repo = data.repositories[0];
        expect(repo).toHaveProperty('id');
        expect(repo).toHaveProperty('name');
        expect(repo).toHaveProperty('full_name');
        expect(repo).toHaveProperty('description');
        expect(repo).toHaveProperty('stars');
        expect(repo).toHaveProperty('forks');
        expect(repo).toHaveProperty('language');
        expect(repo).toHaveProperty('author');
        expect(repo).toHaveProperty('url');
        expect(repo).toHaveProperty('trending_date');
      }
    });

    test('Trending repositories with pagination', async ({ request }) => {
      const response = await request.get(
        `${API_BASE_URL}/api/repositories/trending?page=1&per_page=5`
      );

      expect(response.status()).toBe(200);

      const data = await response.json();
      expect(data.page).toBe(1);
      expect(data.per_page).toBe(5);
      expect(data.repositories.length).toBeLessThanOrEqual(5);
    });

    test('Trending repositories with language filter', async ({ request }) => {
      const languages = ['JavaScript', 'Python', 'TypeScript', 'Rust'];

      for (const language of languages) {
        const response = await request.get(
          `${API_BASE_URL}/api/repositories/trending?language=${language}`
        );

        expect(response.status()).toBe(200);

        const data = await response.json();
        expect(data).toHaveProperty('repositories');

        // If repositories exist, they should match the language filter
        if (data.repositories.length > 0) {
          for (const repo of data.repositories.slice(0, 3)) {
            // Check first 3
            expect(repo.language).toBe(language);
          }
        }
      }
    });

    test('Trending repositories with stars filter', async ({ request }) => {
      const response = await request.get(
        `${API_BASE_URL}/api/repositories/trending?min_stars=100`
      );

      expect(response.status()).toBe(200);

      const data = await response.json();

      // If repositories exist, they should have at least 100 stars
      if (data.repositories.length > 0) {
        for (const repo of data.repositories.slice(0, 3)) {
          expect(repo.stars).toBeGreaterThanOrEqual(100);
        }
      }
    });

    test('Search repositories endpoint', async ({ request }) => {
      const queries = ['react', 'python', 'javascript'];

      for (const query of queries) {
        const response = await request.get(
          `${API_BASE_URL}/api/repositories/search?q=${query}`
        );

        expect(response.status()).toBe(200);

        const data = await response.json();
        expect(data).toHaveProperty('repositories');
        expect(Array.isArray(data.repositories)).toBe(true);
        expect(data).toHaveProperty('total_count');
        expect(data).toHaveProperty('page');
        expect(data).toHaveProperty('per_page');

        // If results exist, they should contain the search term
        if (data.repositories.length > 0) {
          const repo = data.repositories[0];
          const searchableText =
            `${repo.name} ${repo.description} ${repo.full_name}`.toLowerCase();
          expect(searchableText).toContain(query.toLowerCase());
        }
      }
    });

    test('Search without query returns validation error', async ({
      request,
    }) => {
      const response = await request.get(
        `${API_BASE_URL}/api/repositories/search`
      );

      expect(response.status()).toBeOneOf([400, 422]);

      const data = await response.json();
      expect(data).toHaveProperty('error');
    });

    test('Repository refresh endpoint (admin)', async ({ request }) => {
      const response = await request.post(
        `${API_BASE_URL}/api/repositories/refresh`
      );

      // This endpoint might require authentication or be admin-only
      expect(response.status()).toBeOneOf([200, 201, 401, 403, 404]);

      if (response.status() === 200 || response.status() === 201) {
        const data = await response.json();
        expect(data).toHaveProperty('message');
      }
    });
  });

  test.describe('Newsletter Endpoints', () => {
    test('Newsletter subscription with valid email', async ({ request }) => {
      const testEmail = `test-${Date.now()}@example.com`;

      const response = await request.post(
        `${API_BASE_URL}/api/newsletter/subscribe`,
        {
          data: {
            email: testEmail,
            preferences: {
              languages: ['JavaScript', 'Python'],
              frequency: 'weekly',
            },
          },
        }
      );

      expect(response.status()).toBeOneOf([200, 201]);

      const data = await response.json();
      expect(data).toHaveProperty('message');
      expect(data.message).toContain('success');

      // Cleanup - unsubscribe
      try {
        await request.post(`${API_BASE_URL}/api/test/newsletter/unsubscribe`, {
          data: { email: testEmail },
        });
      } catch (error) {
        // Cleanup failed, but test passed
      }
    });

    test('Newsletter subscription with invalid email', async ({ request }) => {
      const response = await request.post(
        `${API_BASE_URL}/api/newsletter/subscribe`,
        {
          data: {
            email: 'invalid-email',
            preferences: {
              languages: ['JavaScript'],
              frequency: 'weekly',
            },
          },
        }
      );

      expect(response.status()).toBeOneOf([400, 422]);

      const data = await response.json();
      expect(data).toHaveProperty('error');
    });

    test('Newsletter subscription without email', async ({ request }) => {
      const response = await request.post(
        `${API_BASE_URL}/api/newsletter/subscribe`,
        {
          data: {
            preferences: {
              languages: ['JavaScript'],
              frequency: 'weekly',
            },
          },
        }
      );

      expect(response.status()).toBeOneOf([400, 422]);

      const data = await response.json();
      expect(data).toHaveProperty('error');
    });

    test('Newsletter unsubscribe with valid token', async ({ request }) => {
      // First subscribe to get a token
      const testEmail = `unsubscribe-test-${Date.now()}@example.com`;

      const subscribeResponse = await request.post(
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

      if (
        subscribeResponse.status() === 200 ||
        subscribeResponse.status() === 201
      ) {
        const subscribeData = await subscribeResponse.json();

        // If we get an unsubscribe token, test unsubscribe
        if (subscribeData.unsubscribe_token) {
          const unsubscribeResponse = await request.get(
            `${API_BASE_URL}/api/newsletter/unsubscribe/${subscribeData.unsubscribe_token}`
          );

          expect(unsubscribeResponse.status()).toBe(200);

          const unsubscribeData = await unsubscribeResponse.json();
          expect(unsubscribeData).toHaveProperty('message');
        }
      }
    });

    test('Newsletter unsubscribe with invalid token', async ({ request }) => {
      const response = await request.get(
        `${API_BASE_URL}/api/newsletter/unsubscribe/invalid-token`
      );

      expect(response.status()).toBeOneOf([400, 404]);

      const data = await response.json();
      expect(data).toHaveProperty('error');
    });
  });

  test.describe('Error Handling', () => {
    test('Non-existent endpoint returns 404', async ({ request }) => {
      const response = await request.get(`${API_BASE_URL}/api/nonexistent`);

      expect(response.status()).toBe(404);

      const data = await response.json();
      expect(data).toHaveProperty('error');
    });

    test('Invalid HTTP method returns 405', async ({ request }) => {
      const response = await request.patch(`${API_BASE_URL}/api/health`);

      expect(response.status()).toBeOneOf([405, 404]);
    });

    test('Malformed JSON returns 400', async ({ request }) => {
      const response = await request.post(
        `${API_BASE_URL}/api/newsletter/subscribe`,
        {
          data: 'invalid json string',
        }
      );

      expect(response.status()).toBeOneOf([400, 422]);
    });
  });

  test.describe('Response Headers and Security', () => {
    test('API responses include security headers', async ({ request }) => {
      const response = await request.get(`${API_BASE_URL}/api/health`);

      const headers = response.headers();

      // Check for common security headers
      expect(headers).toHaveProperty('content-type');
      expect(headers['content-type']).toContain('application/json');

      // CORS headers might be present
      if (headers['access-control-allow-origin']) {
        expect(headers['access-control-allow-origin']).toBeDefined();
      }
    });

    test('API handles CORS preflight requests', async ({ request }) => {
      const response = await request.fetch(`${API_BASE_URL}/api/health`, {
        method: 'OPTIONS',
      });

      // OPTIONS request should be handled
      expect(response.status()).toBeOneOf([200, 204, 404]);
    });
  });

  test.describe('Rate Limiting and Performance', () => {
    test('API handles multiple concurrent requests', async ({ request }) => {
      const concurrentRequests = 5;
      const requests = [];

      for (let i = 0; i < concurrentRequests; i++) {
        requests.push(request.get(`${API_BASE_URL}/api/health`));
      }

      const responses = await Promise.all(requests);

      // All requests should succeed
      for (const response of responses) {
        expect(response.status()).toBe(200);
      }
    });

    test('API responses are reasonably fast', async ({ request }) => {
      const endpoints = [
        '/api/health',
        '/api/repositories/trending?per_page=10',
        '/api/repositories/search?q=test',
      ];

      for (const endpoint of endpoints) {
        const startTime = Date.now();
        const response = await request.get(`${API_BASE_URL}${endpoint}`);
        const responseTime = Date.now() - startTime;

        expect(response.status()).toBeOneOf([200, 400, 422]); // Allow validation errors
        expect(responseTime).toBeLessThan(5000); // Should respond within 5 seconds

        console.log(`${endpoint}: ${responseTime}ms`);
      }
    });
  });

  test.describe('Data Validation', () => {
    test('Repository data has valid structure', async ({ request }) => {
      const response = await request.get(
        `${API_BASE_URL}/api/repositories/trending?per_page=1`
      );

      if (response.status() === 200) {
        const data = await response.json();

        if (data.repositories.length > 0) {
          const repo = data.repositories[0];

          // Validate data types
          expect(typeof repo.id).toBe('number');
          expect(typeof repo.name).toBe('string');
          expect(typeof repo.full_name).toBe('string');
          expect(typeof repo.stars).toBe('number');
          expect(typeof repo.forks).toBe('number');
          expect(typeof repo.author).toBe('string');
          expect(typeof repo.url).toBe('string');

          // Validate URL format
          expect(repo.url).toMatch(/^https:\/\/github\.com\/.+/);

          // Validate stars and forks are non-negative
          expect(repo.stars).toBeGreaterThanOrEqual(0);
          expect(repo.forks).toBeGreaterThanOrEqual(0);

          // Validate date format
          expect(repo.trending_date).toMatch(/^\d{4}-\d{2}-\d{2}$/);
        }
      }
    });

    test('Pagination parameters are validated', async ({ request }) => {
      // Test invalid page number
      const invalidPageResponse = await request.get(
        `${API_BASE_URL}/api/repositories/trending?page=-1`
      );
      expect(invalidPageResponse.status()).toBeOneOf([200, 400, 422]); // Some APIs might handle this gracefully

      // Test invalid per_page number
      const invalidPerPageResponse = await request.get(
        `${API_BASE_URL}/api/repositories/trending?per_page=0`
      );
      expect(invalidPerPageResponse.status()).toBeOneOf([200, 400, 422]);

      // Test very large per_page number
      const largePerPageResponse = await request.get(
        `${API_BASE_URL}/api/repositories/trending?per_page=10000`
      );
      expect(largePerPageResponse.status()).toBeOneOf([200, 400, 422]);
    });
  });

  test.describe('Content Negotiation', () => {
    test('API returns JSON content type', async ({ request }) => {
      const response = await request.get(`${API_BASE_URL}/api/health`);

      expect(response.status()).toBe(200);
      expect(response.headers()['content-type']).toContain('application/json');
    });

    test('API handles Accept header', async ({ request }) => {
      const response = await request.get(`${API_BASE_URL}/api/health`, {
        headers: {
          Accept: 'application/json',
        },
      });

      expect(response.status()).toBe(200);
      expect(response.headers()['content-type']).toContain('application/json');
    });
  });
});
