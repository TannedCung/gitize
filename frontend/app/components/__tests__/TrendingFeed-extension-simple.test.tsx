import React from 'react';
import { render, screen } from '@testing-library/react';
import { TrendingFeed } from '../TrendingFeed';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// Mock the API hooks
jest.mock('../../hooks/useRepositories', () => ({
  useTrendingRepositories: () => ({
    data: {
      pages: [
        {
          repositories: [
            {
              id: 1,
              name: 'test-repo',
              description: 'A test repository',
              html_url: 'https://github.com/test/test-repo',
              stargazers_count: 100,
              forks_count: 50,
              language: 'JavaScript',
              updated_at: '2023-01-01T00:00:00Z',
            },
          ],
          has_more: false,
          total: 1,
          limit: 20,
          offset: 0,
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
    data: { pages: [] },
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
      description: 'A test repository',
      html_url: 'https://github.com/test/test-repo',
      stargazers_count: 100,
      forks_count: 50,
      language: 'JavaScript',
      updated_at: '2023-01-01T00:00:00Z',
    },
  ],
}));

const createTestQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

describe('TrendingFeed Extension Mode', () => {
  it('renders in popup mode with limited items', () => {
    const queryClient = createTestQueryClient();
    const mockOnRepositoryClick = jest.fn();

    render(
      <QueryClientProvider client={queryClient}>
        <TrendingFeed
          extensionMode="popup"
          maxItems={10}
          onRepositoryClick={mockOnRepositoryClick}
        />
      </QueryClientProvider>
    );

    // Should show compact header for popup mode
    expect(screen.getByText('Trending')).toBeInTheDocument();
    expect(screen.getByText('test-repo')).toBeInTheDocument();

    // Should not show full page elements in popup mode
    expect(
      screen.queryByText('Discover the most popular GitHub repositories')
    ).not.toBeInTheDocument();
  });

  it('renders in newtab mode with full layout', () => {
    const queryClient = createTestQueryClient();
    const mockOnRepositoryClick = jest.fn();

    render(
      <QueryClientProvider client={queryClient}>
        <TrendingFeed
          extensionMode="newtab"
          onRepositoryClick={mockOnRepositoryClick}
        />
      </QueryClientProvider>
    );

    // Should show full header for newtab mode
    expect(screen.getByText('Trending Repositories')).toBeInTheDocument();
    expect(
      screen.getByText(
        'Discover the most popular GitHub repositories with AI-powered summaries'
      )
    ).toBeInTheDocument();
    expect(screen.getByText('test-repo')).toBeInTheDocument();
  });

  it('handles repository clicks in extension mode', () => {
    const queryClient = createTestQueryClient();
    const mockOnRepositoryClick = jest.fn();

    render(
      <QueryClientProvider client={queryClient}>
        <TrendingFeed
          extensionMode="popup"
          onRepositoryClick={mockOnRepositoryClick}
        />
      </QueryClientProvider>
    );

    // The repository card should be rendered
    expect(screen.getByText('test-repo')).toBeInTheDocument();
  });
});
