import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import {
  useTrendingRepositories,
  useSearchRepositories,
  useCacheStatus,
  useClearCache,
} from '../useRepositories';
import { repositoryApi } from '../../lib/api';

// Mock Chrome APIs
const mockChromeStorage = {
  storage: {
    local: {
      get: jest.fn(),
      set: jest.fn(),
      remove: jest.fn(),
    },
  },
};

// Mock repository API
jest.mock('../../lib/api', () => ({
  repositoryApi: {
    getTrendingRepositories: jest.fn(),
    searchRepositories: jest.fn(),
  },
}));

const mockRepositoryApi = repositoryApi as jest.Mocked<typeof repositoryApi>;

// Mock navigator.onLine
Object.defineProperty(navigator, 'onLine', {
  writable: true,
  value: true,
});

describe('useRepositories Chrome Storage', () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: {
          retry: false,
        },
      },
    });

    // Setup Chrome mock properly
    (global as any).chrome = mockChromeStorage;

    // Add chrome property to existing window object
    (global as any).window.chrome = mockChromeStorage;

    // Set up default mock responses
    mockChromeStorage.storage.local.get.mockResolvedValue({});
    mockChromeStorage.storage.local.set.mockResolvedValue(undefined);
    mockChromeStorage.storage.local.remove.mockResolvedValue(undefined);

    jest.clearAllMocks();
  });

  afterEach(() => {
    delete (global as any).chrome;
    delete (global as any).window.chrome;
  });

  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );

  describe('useTrendingRepositories with Chrome storage', () => {
    it('should cache data when API call succeeds', async () => {
      const mockResponse = {
        repositories: [
          {
            id: 1,
            github_id: 123,
            name: 'test-repo',
            full_name: 'user/test-repo',
            description: 'Test repository',
            stars: 100,
            forks: 50,
            language: 'TypeScript',
            author: 'user',
            url: 'https://github.com/user/test-repo',
            trending_date: '2023-01-01',
          },
        ],
        has_more: false,
        total: 1,
        limit: 20,
        offset: 0,
      };

      mockRepositoryApi.getTrendingRepositories.mockResolvedValue(mockResponse);
      mockChromeStorage.storage.local.get.mockResolvedValue({});
      mockChromeStorage.storage.local.set.mockResolvedValue(undefined);

      const { result } = renderHook(() => useTrendingRepositories(), {
        wrapper,
      });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(mockRepositoryApi.getTrendingRepositories).toHaveBeenCalledWith({
        offset: 0,
        limit: 20,
      });

      expect(mockChromeStorage.storage.local.set).toHaveBeenCalledWith({
        trending_repositories: [
          {
            data: mockResponse,
            timestamp: expect.any(Number),
            queryParams: {},
          },
        ],
      });
    });

    it('should use cached data when API fails', async () => {
      const cachedResponse = {
        repositories: [
          {
            id: 1,
            github_id: 123,
            name: 'cached-repo',
            full_name: 'user/cached-repo',
            description: 'Cached repository',
            stars: 200,
            forks: 100,
            language: 'JavaScript',
            author: 'user',
            url: 'https://github.com/user/cached-repo',
            trending_date: '2023-01-01',
          },
        ],
        has_more: false,
        total: 1,
        limit: 20,
        offset: 0,
      };

      const cachedData = [
        {
          data: cachedResponse,
          timestamp: Date.now(),
          queryParams: {},
        },
      ];

      mockRepositoryApi.getTrendingRepositories.mockRejectedValue(
        new Error('Network error')
      );
      mockChromeStorage.storage.local.get.mockResolvedValue({
        trending_repositories: cachedData,
      });

      const { result } = renderHook(() => useTrendingRepositories(), {
        wrapper,
      });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(result.current.data?.pages[0]).toEqual(cachedResponse);
    });

    it('should not retry when offline and cache is available', async () => {
      Object.defineProperty(navigator, 'onLine', {
        writable: true,
        value: false,
      });

      const cachedResponse = {
        repositories: [
          {
            id: 1,
            github_id: 123,
            name: 'cached-repo',
            full_name: 'user/cached-repo',
            description: 'Cached repository',
            stars: 200,
            forks: 100,
            language: 'JavaScript',
            author: 'user',
            url: 'https://github.com/user/cached-repo',
            trending_date: '2023-01-01',
          },
        ],
        has_more: false,
        total: 1,
        limit: 20,
        offset: 0,
      };

      const cachedData = [
        {
          data: cachedResponse,
          timestamp: Date.now(),
          queryParams: {},
        },
      ];

      mockRepositoryApi.getTrendingRepositories.mockRejectedValue(
        new Error('Network error')
      );
      mockChromeStorage.storage.local.get.mockResolvedValue({
        trending_repositories: cachedData,
      });

      const { result } = renderHook(() => useTrendingRepositories(), {
        wrapper,
      });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      // Should not retry when offline
      expect(mockRepositoryApi.getTrendingRepositories).toHaveBeenCalledTimes(
        1
      );
    });

    it('should remove expired cache entries', async () => {
      const expiredTimestamp = Date.now() - 25 * 60 * 60 * 1000; // 25 hours ago
      const expiredCachedData = [
        {
          data: {
            repositories: [],
            has_more: false,
            total: 0,
            limit: 20,
            offset: 0,
          },
          timestamp: expiredTimestamp,
          queryParams: {},
        },
      ];

      mockRepositoryApi.getTrendingRepositories.mockRejectedValue(
        new Error('Network error')
      );
      mockChromeStorage.storage.local.get.mockResolvedValue({
        trending_repositories: expiredCachedData,
      });

      const { result } = renderHook(() => useTrendingRepositories(), {
        wrapper,
      });

      await waitFor(() => {
        expect(result.current.isError).toBe(true);
      });

      // Should remove expired cache
      expect(mockChromeStorage.storage.local.set).toHaveBeenCalledWith({
        trending_repositories: [],
      });
    });
  });

  describe('useSearchRepositories with Chrome storage', () => {
    it('should cache search data when API call succeeds', async () => {
      const mockResponse = {
        repositories: [
          {
            id: 1,
            github_id: 123,
            name: 'search-repo',
            full_name: 'user/search-repo',
            description: 'Search result repository',
            stars: 150,
            forks: 75,
            language: 'Python',
            author: 'user',
            url: 'https://github.com/user/search-repo',
            trending_date: '2023-01-01',
          },
        ],
        has_more: false,
        total: 1,
        limit: 20,
        offset: 0,
      };

      const searchQuery = { q: 'test query' };

      mockRepositoryApi.searchRepositories.mockResolvedValue(mockResponse);
      mockChromeStorage.storage.local.get.mockResolvedValue({});
      mockChromeStorage.storage.local.set.mockResolvedValue(undefined);

      const { result } = renderHook(() => useSearchRepositories(searchQuery), {
        wrapper,
      });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(mockRepositoryApi.searchRepositories).toHaveBeenCalledWith({
        q: 'test query',
        offset: 0,
        limit: 20,
      });

      expect(mockChromeStorage.storage.local.set).toHaveBeenCalledWith({
        search_repositories: [
          {
            data: mockResponse,
            timestamp: expect.any(Number),
            queryParams: searchQuery,
          },
        ],
      });
    });

    it('should use cached search data when API fails', async () => {
      const cachedResponse = {
        repositories: [
          {
            id: 1,
            github_id: 123,
            name: 'cached-search-repo',
            full_name: 'user/cached-search-repo',
            description: 'Cached search repository',
            stars: 300,
            forks: 150,
            language: 'Go',
            author: 'user',
            url: 'https://github.com/user/cached-search-repo',
            trending_date: '2023-01-01',
          },
        ],
        has_more: false,
        total: 1,
        limit: 20,
        offset: 0,
      };

      const searchQuery = { q: 'test query' };
      const cachedData = [
        {
          data: cachedResponse,
          timestamp: Date.now(),
          queryParams: searchQuery,
        },
      ];

      mockRepositoryApi.searchRepositories.mockRejectedValue(
        new Error('Network error')
      );
      mockChromeStorage.storage.local.get.mockResolvedValue({
        search_repositories: cachedData,
      });

      const { result } = renderHook(() => useSearchRepositories(searchQuery), {
        wrapper,
      });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(result.current.data?.pages[0]).toEqual(cachedResponse);
    });

    it('should not enable search without query', () => {
      const { result } = renderHook(() => useSearchRepositories({ q: '' }), {
        wrapper,
      });

      expect(result.current.fetchStatus).toBe('idle');
    });
  });

  describe('useCacheStatus', () => {
    it('should detect extension environment', () => {
      const { result } = renderHook(() => useCacheStatus());

      expect(result.current.isExtensionEnvironment).toBe(true);
    });

    it('should detect offline status', () => {
      Object.defineProperty(navigator, 'onLine', {
        writable: true,
        value: false,
      });

      const { result } = renderHook(() => useCacheStatus());

      expect(result.current.isOffline).toBe(true);
    });

    it('should detect cached data availability', async () => {
      const cachedData = [
        {
          data: {
            repositories: [],
            has_more: false,
            total: 0,
            limit: 20,
            offset: 0,
          },
          timestamp: Date.now(),
          queryParams: {},
        },
      ];

      mockChromeStorage.storage.local.get.mockResolvedValue({
        trending_repositories: cachedData,
      });

      const { result } = renderHook(() => useCacheStatus());

      await waitFor(() => {
        expect(result.current.hasCachedData).toBe(true);
      });
    });
  });

  describe('useClearCache', () => {
    it('should clear all cache data', async () => {
      const { result } = renderHook(() => useClearCache());

      await result.current.clearCache();

      expect(mockChromeStorage.storage.local.remove).toHaveBeenCalledWith(
        'trending_repositories'
      );
      expect(mockChromeStorage.storage.local.remove).toHaveBeenCalledWith(
        'search_repositories'
      );
      expect(mockChromeStorage.storage.local.remove).toHaveBeenCalledWith(
        'last_fetch_timestamp'
      );
    });
  });

  describe('Chrome storage error handling', () => {
    it('should handle storage get errors gracefully', async () => {
      mockChromeStorage.storage.local.get.mockRejectedValue(
        new Error('Storage error')
      );
      mockRepositoryApi.getTrendingRepositories.mockRejectedValue(
        new Error('Network error')
      );

      const { result } = renderHook(() => useTrendingRepositories(), {
        wrapper,
      });

      await waitFor(() => {
        expect(result.current.isError).toBe(true);
      });

      // Should not crash and should handle the error
      expect(result.current.error).toBeInstanceOf(Error);
    });

    it('should handle storage set errors gracefully', async () => {
      const mockResponse = {
        repositories: [],
        has_more: false,
        total: 0,
        limit: 20,
        offset: 0,
      };

      mockRepositoryApi.getTrendingRepositories.mockResolvedValue(mockResponse);
      mockChromeStorage.storage.local.get.mockResolvedValue({});
      mockChromeStorage.storage.local.set.mockRejectedValue(
        new Error('Storage error')
      );

      const { result } = renderHook(() => useTrendingRepositories(), {
        wrapper,
      });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      // Should still succeed even if caching fails
      expect(result.current.data?.pages[0]).toEqual(mockResponse);
    });
  });

  describe('Non-extension environment', () => {
    beforeEach(() => {
      delete (global as any).chrome;
      delete (global as any).window.chrome;
    });

    it('should work without Chrome storage in non-extension environment', async () => {
      const mockResponse = {
        repositories: [],
        has_more: false,
        total: 0,
        limit: 20,
        offset: 0,
      };

      mockRepositoryApi.getTrendingRepositories.mockResolvedValue(mockResponse);

      const { result } = renderHook(() => useTrendingRepositories(), {
        wrapper,
      });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(result.current.data?.pages[0]).toEqual(mockResponse);
    });

    it('should detect non-extension environment', () => {
      const { result } = renderHook(() => useCacheStatus());

      expect(result.current.isExtensionEnvironment).toBe(false);
    });
  });
});
