import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { TrendingFeed } from '../TrendingFeed';

// Mock the hooks
jest.mock('../../hooks/useRepositories', () => ({
  useTrendingRepositories: jest.fn(),
  useSearchRepositories: jest.fn(),
  useAllRepositories: jest.fn(),
}));

// Mock the LazyRepositoryCard component
jest.mock('../ui/LazyRepositoryCard', () => ({
  LazyRepositoryCard: ({
    repository,
    compact,
    extensionMode,
    onRepositoryClick,
  }: any) => (
    <div
      data-testid={`repository-${repository.id}`}
      data-compact={compact}
      data-extension-mode={extensionMode}
      onClick={() => onRepositoryClick?.(repository)}
    >
      <h3>{repository.name}</h3>
      <p>{repository.description}</p>
    </div>
  ),
}));

// Mock other UI components
jest.mock('../ui', () => ({
  Loading: ({ text }: { text: string }) => (
    <div data-testid="loading">{text}</div>
  ),
  RepositoryCardSkeleton: () => <div data-testid="skeleton" />,
  Button: ({ children, onClick, ...props }: any) => (
    <button onClick={onClick} {...props}>
      {children}
    </button>
  ),
  Alert: ({ children, title }: any) => (
    <div data-testid="alert">
      <h4>{title}</h4>
      {children}
    </div>
  ),
}));

jest.mock('../ui/FilterPanel', () => ({
  FilterPanel: ({ filters, onFiltersChange }: any) => (
    <div data-testid="filter-panel">Filter Panel</div>
  ),
}));

jest.mock('../ui/SearchBar', () => ({
  SearchBar: ({ onSearch, placeholder }: any) => (
    <input
      data-testid="search-bar"
      placeholder={placeholder}
      onChange={e => onSearch(e.target.value)}
    />
  ),
}));

const mockRepositories = [
  {
    id: 1,
    name: 'test-repo-1',
    description: 'Test repository 1',
    stars: 100,
    language: 'JavaScript',
  },
  {
    id: 2,
    name: 'test-repo-2',
    description: 'Test repository 2',
    stars: 200,
    language: 'TypeScript',
  },
  {
    id: 3,
    name: 'test-repo-3',
    description: 'Test repository 3',
    stars: 300,
    language: 'Python',
  },
];

const createTestQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });

const renderWithQueryClient = (component: React.ReactElement) => {
  const queryClient = createTestQueryClient();
  return render(
    <QueryClientProvider client={queryClient}>{component}</QueryClientProvider>
  );
};

describe('TrendingFeed Extension Mode', () => {
  const mockUseTrendingRepositories =
    require('../../hooks/useRepositories').useTrendingRepositories;
  const mockUseSearchRepositories =
    require('../../hooks/useRepositories').useSearchRepositories;
  const mockUseAllRepositories =
    require('../../hooks/useRepositories').useAllRepositories;

  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks();

    // Default mock implementations
    mockUseTrendingRepositories.mockReturnValue({
      data: { pages: [{ repositories: mockRepositories }] },
      isLoading: false,
      error: null,
      hasNextPage: false,
      isFetchingNextPage: false,
      fetchNextPage: jest.fn(),
      refetch: jest.fn(),
    });

    mockUseSearchRepositories.mockReturnValue({
      data: { pages: [{ repositories: [] }] },
      isLoading: false,
      error: null,
      hasNextPage: false,
      isFetchingNextPage: false,
      fetchNextPage: jest.fn(),
      refetch: jest.fn(),
    });

    mockUseAllRepositories.mockReturnValue(mockRepositories);
  });

  describe('Popup Mode', () => {
    it('renders in popup mode with compact layout', () => {
      renderWithQueryClient(<TrendingFeed extensionMode="popup" />);

      // Should show compact header
      expect(screen.getByText('Trending')).toBeInTheDocument();

      // Should show repositories with compact mode
      const repoElements = screen.getAllByTestId(/repository-/);
      expect(repoElements).toHaveLength(3);

      repoElements.forEach(element => {
        expect(element).toHaveAttribute('data-compact', 'true');
        expect(element).toHaveAttribute('data-extension-mode', 'true');
      });
    });

    it('limits repositories to maxItems in popup mode', () => {
      renderWithQueryClient(
        <TrendingFeed extensionMode="popup" maxItems={2} />
      );

      const repoElements = screen.getAllByTestId(/repository-/);
      expect(repoElements).toHaveLength(2);
    });

    it('defaults to 10 items in popup mode when no maxItems specified', () => {
      // Create more repositories to test the default limit
      const manyRepositories = Array.from({ length: 15 }, (_, i) => ({
        id: i + 1,
        name: `repo-${i + 1}`,
        description: `Repository ${i + 1}`,
        stars: 100 + i,
        language: 'JavaScript',
      }));

      mockUseAllRepositories.mockReturnValue(manyRepositories);

      renderWithQueryClient(<TrendingFeed extensionMode="popup" />);

      const repoElements = screen.getAllByTestId(/repository-/);
      expect(repoElements).toHaveLength(10);
    });

    it('shows compact search placeholder in popup mode', () => {
      renderWithQueryClient(<TrendingFeed extensionMode="popup" />);

      const searchBar = screen.getByTestId('search-bar');
      expect(searchBar).toHaveAttribute(
        'placeholder',
        'Search repositories...'
      );
    });

    it('does not show filter panel in popup mode', () => {
      renderWithQueryClient(<TrendingFeed extensionMode="popup" />);

      expect(screen.queryByTestId('filter-panel')).not.toBeInTheDocument();
    });

    it('calls onRepositoryClick when repository is clicked in popup mode', async () => {
      const mockOnRepositoryClick = jest.fn();
      const user = userEvent.setup();

      renderWithQueryClient(
        <TrendingFeed
          extensionMode="popup"
          onRepositoryClick={mockOnRepositoryClick}
        />
      );

      const firstRepo = screen.getByTestId('repository-1');
      await user.click(firstRepo);

      expect(mockOnRepositoryClick).toHaveBeenCalledWith(mockRepositories[0]);
    });
  });

  describe('New Tab Mode', () => {
    it('renders in newtab mode with full layout', () => {
      renderWithQueryClient(<TrendingFeed extensionMode="newtab" />);

      // Should show full header
      expect(screen.getByText('Trending Repositories')).toBeInTheDocument();

      // Should show repositories without compact mode
      const repoElements = screen.getAllByTestId(/repository-/);
      expect(repoElements).toHaveLength(3);

      repoElements.forEach(element => {
        expect(element).toHaveAttribute('data-compact', 'false');
        expect(element).toHaveAttribute('data-extension-mode', 'false');
      });
    });

    it('shows filter panel in newtab mode', () => {
      renderWithQueryClient(<TrendingFeed extensionMode="newtab" />);

      expect(screen.getByTestId('filter-panel')).toBeInTheDocument();
    });

    it('shows full search placeholder in newtab mode', () => {
      renderWithQueryClient(<TrendingFeed extensionMode="newtab" />);

      const searchBar = screen.getByTestId('search-bar');
      expect(searchBar).toHaveAttribute(
        'placeholder',
        'Search repositories by name, description, or topic...'
      );
    });
  });

  describe('Web Mode (Default)', () => {
    it('renders in web mode with full layout by default', () => {
      renderWithQueryClient(<TrendingFeed />);

      // Should show full header
      expect(screen.getByText('Trending Repositories')).toBeInTheDocument();

      // Should show filter panel
      expect(screen.getByTestId('filter-panel')).toBeInTheDocument();

      // Should show repositories without compact mode
      const repoElements = screen.getAllByTestId(/repository-/);
      repoElements.forEach(element => {
        expect(element).toHaveAttribute('data-compact', 'false');
        expect(element).toHaveAttribute('data-extension-mode', 'false');
      });
    });
  });

  describe('Extension-specific Features', () => {
    it('shows "View more in dashboard" link when maxItems is set and more items available', () => {
      const manyRepositories = Array.from({ length: 15 }, (_, i) => ({
        id: i + 1,
        name: `repo-${i + 1}`,
        description: `Repository ${i + 1}`,
        stars: 100 + i,
        language: 'JavaScript',
      }));

      mockUseAllRepositories.mockReturnValue(manyRepositories);

      renderWithQueryClient(
        <TrendingFeed extensionMode="popup" maxItems={5} />
      );

      expect(screen.getByText('View more in dashboard')).toBeInTheDocument();
    });

    it('calls onRepositoryClick with view_more action when "View more" is clicked', async () => {
      const mockOnRepositoryClick = jest.fn();
      const user = userEvent.setup();

      const manyRepositories = Array.from({ length: 15 }, (_, i) => ({
        id: i + 1,
        name: `repo-${i + 1}`,
        description: `Repository ${i + 1}`,
        stars: 100 + i,
        language: 'JavaScript',
      }));

      mockUseAllRepositories.mockReturnValue(manyRepositories);

      renderWithQueryClient(
        <TrendingFeed
          extensionMode="popup"
          maxItems={5}
          onRepositoryClick={mockOnRepositoryClick}
        />
      );

      const viewMoreButton = screen.getByText('View more in dashboard');
      await user.click(viewMoreButton);

      expect(mockOnRepositoryClick).toHaveBeenCalledWith({
        action: 'view_more',
      });
    });

    it('handles loading state correctly in extension modes', () => {
      mockUseTrendingRepositories.mockReturnValue({
        data: null,
        isLoading: true,
        error: null,
        hasNextPage: false,
        isFetchingNextPage: false,
        fetchNextPage: jest.fn(),
        refetch: jest.fn(),
      });

      mockUseAllRepositories.mockReturnValue([]);

      renderWithQueryClient(<TrendingFeed extensionMode="popup" />);

      expect(screen.getAllByTestId('skeleton')).toHaveLength(5);
    });

    it('handles error state correctly in extension modes', () => {
      const mockError = new Error('Failed to fetch repositories');

      mockUseTrendingRepositories.mockReturnValue({
        data: null,
        isLoading: false,
        error: mockError,
        hasNextPage: false,
        isFetchingNextPage: false,
        fetchNextPage: jest.fn(),
        refetch: jest.fn(),
      });

      mockUseAllRepositories.mockReturnValue([]);

      renderWithQueryClient(<TrendingFeed extensionMode="popup" />);

      expect(screen.getByTestId('alert')).toBeInTheDocument();
      expect(screen.getByText('Something went wrong')).toBeInTheDocument();
    });
  });
});
