import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe, toHaveNoViolations } from 'jest-axe';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ThemeProvider } from '../../contexts/ThemeContext';
import { AccessibilityProvider } from '../ui/AccessibilityProvider';
import { TrendingFeed } from '../TrendingFeed';
import { AppLayout } from '../layout/AppLayout';
import NewsletterPage from '../../newsletter/page';
import DemoPage from '../../demo/page';

// Mock Next.js router
jest.mock('next/navigation', () => ({
  usePathname: () => '/',
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    prefetch: jest.fn(),
  }),
}));

// Mock API calls
jest.mock('../../hooks/useRepositories', () => ({
  useTrendingRepositories: () => ({
    data: {
      pages: [
        {
          repositories: [
            {
              id: 1,
              name: 'test-repo',
              full_name: 'user/test-repo',
              description: 'A test repository',
              html_url: 'https://github.com/user/test-repo',
              stargazers_count: 100,
              forks_count: 20,
              language: 'TypeScript',
              created_at: '2024-01-01T00:00:00Z',
              updated_at: '2024-01-02T00:00:00Z',
              summary: 'This is a test repository for testing purposes.',
            },
          ],
        },
      ],
    },
    isLoading: false,
    error: null,
    hasNextPage: false,
    isFetchingNextPage: false,
    fetchNextPage: jest.fn(),
    refetch: jest.fn(),
  }),
  useSearchRepositories: () => ({
    data: null,
    isLoading: false,
    error: null,
    hasNextPage: false,
    isFetchingNextPage: false,
    fetchNextPage: jest.fn(),
    refetch: jest.fn(),
  }),
  useAllRepositories: () => [
    {
      id: 1,
      name: 'test-repo',
      full_name: 'user/test-repo',
      description: 'A test repository',
      html_url: 'https://github.com/user/test-repo',
      stargazers_count: 100,
      forks_count: 20,
      language: 'TypeScript',
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-02T00:00:00Z',
      summary: 'This is a test repository for testing purposes.',
    },
  ],
}));

// Test wrapper component
const TestWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });

  return (
    <QueryClientProvider client={queryClient}>
      <AccessibilityProvider>
        <ThemeProvider>{children}</ThemeProvider>
      </AccessibilityProvider>
    </QueryClientProvider>
  );
};

expect.extend(toHaveNoViolations);

describe('Application Integration Tests', () => {
  beforeEach(() => {
    // Reset any mocks
    jest.clearAllMocks();
  });

  describe('Complete User Workflows', () => {
    test('User can navigate through the main application flow', async () => {
      const user = userEvent.setup();

      render(
        <TestWrapper>
          <AppLayout>
            <TrendingFeed />
          </AppLayout>
        </TestWrapper>
      );

      // Check that the main page loads with trending repositories
      expect(screen.getByRole('main')).toBeInTheDocument();
      expect(screen.getByText('Trending Repositories')).toBeInTheDocument();

      // Check that repository cards are displayed
      await waitFor(() => {
        expect(screen.getByText('test-repo')).toBeInTheDocument();
      });

      // Test search functionality
      const searchInput = screen.getByPlaceholderText(/search repositories/i);
      await user.type(searchInput, 'react');

      // Verify search results update
      await waitFor(() => {
        expect(screen.getByText('Search Results')).toBeInTheDocument();
      });

      // Test filter functionality
      const filtersButton = screen.getByRole('button', {
        name: /filters & options/i,
      });
      await user.click(filtersButton);

      // Verify filters panel is visible
      expect(screen.getByText(/language/i)).toBeInTheDocument();
    });

    test('User can interact with theme toggle and navigation', async () => {
      const user = userEvent.setup();

      render(
        <TestWrapper>
          <AppLayout>
            <TrendingFeed />
          </AppLayout>
        </TestWrapper>
      );

      // Test theme toggle
      const themeToggle = screen.getByRole('button', { name: /toggle theme/i });
      await user.click(themeToggle);

      // Test navigation
      const navigationLinks = screen.getAllByRole('link');
      const homeLink = navigationLinks.find(
        link => link.textContent === 'Trending'
      );
      expect(homeLink).toBeInTheDocument();
    });

    test('Newsletter subscription workflow works correctly', async () => {
      const user = userEvent.setup();

      render(
        <TestWrapper>
          <NewsletterPage />
        </TestWrapper>
      );

      // Check newsletter page content
      expect(screen.getByText('Newsletter Subscription')).toBeInTheDocument();
      expect(screen.getByText(/stay up-to-date/i)).toBeInTheDocument();

      // Check features list
      expect(screen.getByText(/weekly digest/i)).toBeInTheDocument();
      expect(screen.getByText(/ai-generated summaries/i)).toBeInTheDocument();

      // Test email input (if newsletter signup component is rendered)
      const emailInputs = screen.queryAllByRole('textbox');
      if (emailInputs.length > 0) {
        const emailInput = emailInputs.find(
          input =>
            input.getAttribute('type') === 'email' ||
            input.getAttribute('placeholder')?.includes('email')
        );

        if (emailInput) {
          await user.type(emailInput, 'test@example.com');
          expect(emailInput).toHaveValue('test@example.com');
        }
      }
    });

    test('Component demo page showcases all design system components', async () => {
      render(
        <TestWrapper>
          <DemoPage />
        </TestWrapper>
      );

      // Check demo page header
      expect(screen.getByText('Component Demo')).toBeInTheDocument();
      expect(
        screen.getByText(/explore the appflowy design system/i)
      ).toBeInTheDocument();

      // Verify various component demos are present
      expect(screen.getByText(/button/i)).toBeInTheDocument();
      expect(screen.getByText(/text field/i)).toBeInTheDocument();
      expect(screen.getByText(/avatar/i)).toBeInTheDocument();
    });
  });

  describe('Accessibility Integration', () => {
    test('Main application flow has no accessibility violations', async () => {
      const { container } = render(
        <TestWrapper>
          <AppLayout>
            <TrendingFeed />
          </AppLayout>
        </TestWrapper>
      );

      await waitFor(async () => {
        const results = await axe(container);
        expect(results).toHaveNoViolations();
      });
    });

    test('Newsletter page has no accessibility violations', async () => {
      const { container } = render(
        <TestWrapper>
          <NewsletterPage />
        </TestWrapper>
      );

      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    test('Demo page has no accessibility violations', async () => {
      const { container } = render(
        <TestWrapper>
          <DemoPage />
        </TestWrapper>
      );

      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    test('Keyboard navigation works throughout the application', async () => {
      const user = userEvent.setup();

      render(
        <TestWrapper>
          <AppLayout>
            <TrendingFeed />
          </AppLayout>
        </TestWrapper>
      );

      // Test tab navigation
      await user.tab();
      expect(document.activeElement).toHaveAttribute('href', '#main-content');

      await user.tab();
      // Should focus on the logo link
      expect(document.activeElement).toHaveAttribute('href', '/');

      // Test escape key functionality
      const filtersButton = screen.queryByRole('button', {
        name: /filters & options/i,
      });
      if (filtersButton) {
        await user.click(filtersButton);
        await user.keyboard('{Escape}');
        // Mobile menu should close (implementation dependent)
      }
    });
  });

  describe('Responsive Design Integration', () => {
    test('Application layout adapts to different screen sizes', () => {
      // Test mobile layout
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 375,
      });

      render(
        <TestWrapper>
          <AppLayout>
            <TrendingFeed />
          </AppLayout>
        </TestWrapper>
      );

      // Mobile-specific elements should be present
      expect(
        screen.getByRole('button', { name: /filters & options/i })
      ).toBeInTheDocument();

      // Test desktop layout
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 1024,
      });

      // Re-render for desktop
      render(
        <TestWrapper>
          <AppLayout>
            <TrendingFeed />
          </AppLayout>
        </TestWrapper>
      );

      // Desktop navigation should be visible
      expect(
        screen.getByRole('navigation', { name: /main navigation/i })
      ).toBeInTheDocument();
    });
  });

  describe('Theme Integration', () => {
    test('Theme switching works across all components', async () => {
      const user = userEvent.setup();

      render(
        <TestWrapper>
          <AppLayout>
            <TrendingFeed />
          </AppLayout>
        </TestWrapper>
      );

      // Get the theme toggle button
      const themeToggle = screen.getByRole('button', { name: /toggle theme/i });

      // Test theme switching
      await user.click(themeToggle);

      // Verify theme classes are applied (implementation dependent)
      // This would need to be adjusted based on actual theme implementation
      expect(document.documentElement).toHaveClass('dark');

      await user.click(themeToggle);
      expect(document.documentElement).not.toHaveClass('dark');
    });
  });

  describe('Error Handling Integration', () => {
    test('Application handles API errors gracefully', async () => {
      // Mock API error
      jest
        .mocked(require('../../hooks/useRepositories').useTrendingRepositories)
        .mockReturnValue({
          data: null,
          isLoading: false,
          error: new Error('Failed to fetch repositories'),
          hasNextPage: false,
          isFetchingNextPage: false,
          fetchNextPage: jest.fn(),
          refetch: jest.fn(),
        });

      render(
        <TestWrapper>
          <TrendingFeed />
        </TestWrapper>
      );

      // Check error state is displayed
      expect(screen.getByText('Something went wrong')).toBeInTheDocument();
      expect(
        screen.getByText('Failed to fetch repositories')
      ).toBeInTheDocument();

      // Check retry button is present
      const retryButton = screen.getByRole('button', { name: /try again/i });
      expect(retryButton).toBeInTheDocument();
    });
  });

  describe('Performance Integration', () => {
    test('Components render within acceptable time limits', async () => {
      const startTime = performance.now();

      render(
        <TestWrapper>
          <AppLayout>
            <TrendingFeed />
          </AppLayout>
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByText('Trending Repositories')).toBeInTheDocument();
      });

      const endTime = performance.now();
      const renderTime = endTime - startTime;

      // Expect render time to be under 1000ms
      expect(renderTime).toBeLessThan(1000);
    });
  });
});
