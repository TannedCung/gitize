/**
 * Test data setup and teardown utilities for E2E tests
 */

export interface TestRepository {
  id?: number;
  github_id: number;
  name: string;
  full_name: string;
  description: string;
  stars: number;
  forks: number;
  language: string;
  author: string;
  url: string;
  trending_date: string;
}

export interface TestNewsletterSubscription {
  email: string;
  preferences?: {
    languages: string[];
    frequency: 'daily' | 'weekly';
  };
}

export class TestDataManager {
  private apiBaseUrl: string;
  private createdRepositories: number[] = [];
  private createdSubscriptions: string[] = [];

  constructor(apiBaseUrl: string = 'http://localhost:8000') {
    this.apiBaseUrl = apiBaseUrl;
  }

  /**
   * Create test repositories for testing
   */
  async createTestRepositories(count: number = 10): Promise<TestRepository[]> {
    const repositories: TestRepository[] = [];
    const languages = [
      'JavaScript',
      'Python',
      'TypeScript',
      'Rust',
      'Go',
      'Java',
      'C++',
    ];

    for (let i = 0; i < count; i++) {
      const timestamp = Date.now() + i;
      const language = languages[i % languages.length];

      const repo: TestRepository = {
        github_id: timestamp,
        name: `test-repo-${i + 1}`,
        full_name: `testuser${i + 1}/test-repo-${i + 1}`,
        description: `Test repository ${i + 1} for E2E testing. This is a ${language} project.`,
        stars: Math.floor(Math.random() * 10000) + 100,
        forks: Math.floor(Math.random() * 1000) + 10,
        language: language,
        author: `testuser${i + 1}`,
        url: `https://github.com/testuser${i + 1}/test-repo-${i + 1}`,
        trending_date: new Date().toISOString().split('T')[0],
      };

      try {
        const response = await fetch(
          `${this.apiBaseUrl}/api/test/repositories`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(repo),
          }
        );

        if (response.ok) {
          const created = await response.json();
          repo.id = created.id;
          repositories.push(repo);
          this.createdRepositories.push(created.id);
        }
      } catch (error) {
        console.warn(`Failed to create test repository ${i + 1}:`, error);
        // Continue with other repositories
      }
    }

    return repositories;
  }

  /**
   * Create test newsletter subscriptions
   */
  async createTestSubscriptions(
    count: number = 5
  ): Promise<TestNewsletterSubscription[]> {
    const subscriptions: TestNewsletterSubscription[] = [];
    const languages = ['JavaScript', 'Python', 'TypeScript', 'Rust', 'Go'];

    for (let i = 0; i < count; i++) {
      const subscription: TestNewsletterSubscription = {
        email: `test${i + 1}@example.com`,
        preferences: {
          languages: [languages[i % languages.length]],
          frequency: i % 2 === 0 ? 'weekly' : 'daily',
        },
      };

      try {
        const response = await fetch(
          `${this.apiBaseUrl}/api/test/newsletter/subscribe`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(subscription),
          }
        );

        if (response.ok) {
          subscriptions.push(subscription);
          this.createdSubscriptions.push(subscription.email);
        }
      } catch (error) {
        console.warn(`Failed to create test subscription ${i + 1}:`, error);
      }
    }

    return subscriptions;
  }

  /**
   * Create test summaries for repositories
   */
  async createTestSummaries(repositories: TestRepository[]): Promise<void> {
    const summaries = [
      'A modern web framework built with performance and developer experience in mind.',
      'Machine learning library with comprehensive tools for data analysis and modeling.',
      'Command-line interface tool for managing development workflows efficiently.',
      'Database migration tool with support for multiple database engines.',
      'Real-time communication library with WebSocket and HTTP/2 support.',
      'Static site generator with built-in optimization and modern web standards.',
      'Container orchestration platform for scalable application deployment.',
      'Authentication service with OAuth2 and JWT token support.',
      'API gateway with rate limiting, caching, and monitoring capabilities.',
      'Testing framework with comprehensive assertion library and mocking support.',
    ];

    for (let i = 0; i < repositories.length; i++) {
      const repo = repositories[i];
      if (!repo.id) continue;

      const summary = {
        repository_id: repo.id,
        content: summaries[i % summaries.length],
      };

      try {
        await fetch(`${this.apiBaseUrl}/api/test/summaries`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(summary),
        });
      } catch (error) {
        console.warn(
          `Failed to create summary for repository ${repo.id}:`,
          error
        );
      }
    }
  }

  /**
   * Create trending history data
   */
  async createTrendingHistory(repositories: TestRepository[]): Promise<void> {
    for (const repo of repositories) {
      if (!repo.id) continue;

      // Create history entries for the past 7 days
      for (let days = 7; days >= 0; days--) {
        const date = new Date();
        date.setDate(date.getDate() - days);

        const historyEntry = {
          repository_id: repo.id,
          stars: repo.stars - days * 10, // Simulate star growth
          forks: repo.forks - days * 2, // Simulate fork growth
          recorded_at: date.toISOString(),
        };

        try {
          await fetch(`${this.apiBaseUrl}/api/test/trending-history`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(historyEntry),
          });
        } catch (error) {
          console.warn(
            `Failed to create trending history for repository ${repo.id}:`,
            error
          );
        }
      }
    }
  }

  /**
   * Setup complete test environment
   */
  async setupTestEnvironment(): Promise<{
    repositories: TestRepository[];
    subscriptions: TestNewsletterSubscription[];
  }> {
    console.log('Setting up test environment...');

    // Create test repositories
    const repositories = await this.createTestRepositories(15);
    console.log(`Created ${repositories.length} test repositories`);

    // Create test summaries
    await this.createTestSummaries(repositories);
    console.log('Created test summaries');

    // Create trending history
    await this.createTrendingHistory(repositories);
    console.log('Created trending history');

    // Create test subscriptions
    const subscriptions = await this.createTestSubscriptions(5);
    console.log(`Created ${subscriptions.length} test subscriptions`);

    console.log('Test environment setup complete');

    return { repositories, subscriptions };
  }

  /**
   * Clean up test data
   */
  async cleanup(): Promise<void> {
    console.log('Cleaning up test data...');

    // Clean up repositories
    for (const repoId of this.createdRepositories) {
      try {
        await fetch(`${this.apiBaseUrl}/api/test/repositories/${repoId}`, {
          method: 'DELETE',
        });
      } catch (error) {
        console.warn(`Failed to delete repository ${repoId}:`, error);
      }
    }

    // Clean up subscriptions
    for (const email of this.createdSubscriptions) {
      try {
        await fetch(`${this.apiBaseUrl}/api/test/newsletter/unsubscribe`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ email }),
        });
      } catch (error) {
        console.warn(`Failed to delete subscription ${email}:`, error);
      }
    }

    // Clear tracking arrays
    this.createdRepositories = [];
    this.createdSubscriptions = [];

    console.log('Test data cleanup complete');
  }

  /**
   * Wait for API to be ready
   */
  async waitForAPI(timeout: number = 30000): Promise<boolean> {
    const startTime = Date.now();

    while (Date.now() - startTime < timeout) {
      try {
        const response = await fetch(`${this.apiBaseUrl}/api/health`);
        if (response.ok) {
          return true;
        }
      } catch (error) {
        // API not ready yet
      }

      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    return false;
  }

  /**
   * Reset database to clean state
   */
  async resetDatabase(): Promise<void> {
    try {
      await fetch(`${this.apiBaseUrl}/api/test/reset`, {
        method: 'POST',
      });
      console.log('Database reset complete');
    } catch (error) {
      console.warn('Failed to reset database:', error);
    }
  }

  /**
   * Seed database with minimal required data
   */
  async seedMinimalData(): Promise<void> {
    try {
      await fetch(`${this.apiBaseUrl}/api/test/seed`, {
        method: 'POST',
      });
      console.log('Minimal data seeding complete');
    } catch (error) {
      console.warn('Failed to seed minimal data:', error);
    }
  }
}

/**
 * Global test data manager instance
 */
export const testDataManager = new TestDataManager();

/**
 * Utility function to create mock API responses for offline testing
 */
export function createMockAPIResponses() {
  return {
    trending: {
      repositories: [
        {
          id: 1,
          name: 'awesome-project',
          full_name: 'developer/awesome-project',
          description: 'An awesome project that does amazing things',
          stars: 1250,
          forks: 89,
          language: 'JavaScript',
          author: 'developer',
          url: 'https://github.com/developer/awesome-project',
          trending_date: new Date().toISOString().split('T')[0],
        },
        {
          id: 2,
          name: 'cool-library',
          full_name: 'coder/cool-library',
          description: 'A cool library for building modern applications',
          stars: 2100,
          forks: 156,
          language: 'Python',
          author: 'coder',
          url: 'https://github.com/coder/cool-library',
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
          name: 'search-result',
          full_name: 'searcher/search-result',
          description: 'A project that matches your search query',
          stars: 890,
          forks: 45,
          language: 'TypeScript',
          author: 'searcher',
          url: 'https://github.com/searcher/search-result',
          trending_date: new Date().toISOString().split('T')[0],
        },
      ],
      total_count: 1,
      page: 1,
      per_page: 10,
    },
    health: {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      version: '1.0.0',
    },
  };
}
