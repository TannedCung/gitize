'use client';

import React from 'react';
import { useInfiniteQuery, useQuery } from '@tanstack/react-query';
import {
  repositoryApi,
  TrendingQuery,
  SearchQuery,
  TrendingResponse,
  SearchResponse,
} from '../lib/api';
import { Repository } from '../components/ui/RepositoryCard';

// Chrome storage utilities
const CACHE_KEYS = {
  TRENDING: 'trending_repositories',
  SEARCH: 'search_repositories',
  LAST_FETCH: 'last_fetch_timestamp',
} as const;

const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours in milliseconds

interface CachedTrendingData {
  data: TrendingResponse;
  timestamp: number;
  queryParams: TrendingQuery;
}

interface CachedSearchData {
  data: SearchResponse;
  timestamp: number;
  queryParams: SearchQuery;
}

// Check if we're in a Chrome extension environment
const isExtensionEnvironment = (): boolean => {
  return (
    typeof window !== 'undefined' &&
    typeof window.chrome !== 'undefined' &&
    typeof window.chrome.storage !== 'undefined'
  );
};

// Chrome storage helpers
const chromeStorage = {
  async get<T>(key: string): Promise<T | null> {
    if (!isExtensionEnvironment()) return null;

    try {
      const result = await chrome.storage.local.get(key);
      return result[key] || null;
    } catch (error) {
      console.warn('Chrome storage get error:', error);
      return null;
    }
  },

  async set(key: string, value: any): Promise<void> {
    if (!isExtensionEnvironment()) return;

    try {
      await chrome.storage.local.set({ [key]: value });
    } catch (error) {
      console.warn('Chrome storage set error:', error);
    }
  },

  async remove(key: string): Promise<void> {
    if (!isExtensionEnvironment()) return;

    try {
      await chrome.storage.local.remove(key);
    } catch (error) {
      console.warn('Chrome storage remove error:', error);
    }
  },
};

// Cache management utilities
const cacheUtils = {
  async getCachedTrending(
    queryParams: TrendingQuery
  ): Promise<TrendingResponse | null> {
    const cached = await chromeStorage.get<CachedTrendingData[]>(
      CACHE_KEYS.TRENDING
    );
    if (!cached) return null;

    // Find matching cached data
    const match = cached.find(
      item => JSON.stringify(item.queryParams) === JSON.stringify(queryParams)
    );

    if (!match) return null;

    // Check if cache is still valid
    const isValid = Date.now() - match.timestamp < CACHE_DURATION;
    if (!isValid) {
      // Remove expired cache
      const filtered = cached.filter(
        item => JSON.stringify(item.queryParams) !== JSON.stringify(queryParams)
      );
      await chromeStorage.set(CACHE_KEYS.TRENDING, filtered);
      return null;
    }

    return match.data;
  },

  async setCachedTrending(
    queryParams: TrendingQuery,
    data: TrendingResponse
  ): Promise<void> {
    const cached =
      (await chromeStorage.get<CachedTrendingData[]>(CACHE_KEYS.TRENDING)) ||
      [];

    // Remove existing cache for same params
    const filtered = cached.filter(
      item => JSON.stringify(item.queryParams) !== JSON.stringify(queryParams)
    );

    // Add new cache entry
    const newEntry: CachedTrendingData = {
      data,
      timestamp: Date.now(),
      queryParams,
    };

    // Keep only last 10 cache entries to manage storage
    const updated = [newEntry, ...filtered].slice(0, 10);
    await chromeStorage.set(CACHE_KEYS.TRENDING, updated);
  },

  async getCachedSearch(
    queryParams: SearchQuery
  ): Promise<SearchResponse | null> {
    const cached = await chromeStorage.get<CachedSearchData[]>(
      CACHE_KEYS.SEARCH
    );
    if (!cached) return null;

    // Find matching cached data
    const match = cached.find(
      item => JSON.stringify(item.queryParams) === JSON.stringify(queryParams)
    );

    if (!match) return null;

    // Check if cache is still valid
    const isValid = Date.now() - match.timestamp < CACHE_DURATION;
    if (!isValid) {
      // Remove expired cache
      const filtered = cached.filter(
        item => JSON.stringify(item.queryParams) !== JSON.stringify(queryParams)
      );
      await chromeStorage.set(CACHE_KEYS.SEARCH, filtered);
      return null;
    }

    return match.data;
  },

  async setCachedSearch(
    queryParams: SearchQuery,
    data: SearchResponse
  ): Promise<void> {
    const cached =
      (await chromeStorage.get<CachedSearchData[]>(CACHE_KEYS.SEARCH)) || [];

    // Remove existing cache for same params
    const filtered = cached.filter(
      item => JSON.stringify(item.queryParams) !== JSON.stringify(queryParams)
    );

    // Add new cache entry
    const newEntry: CachedSearchData = {
      data,
      timestamp: Date.now(),
      queryParams,
    };

    // Keep only last 10 cache entries to manage storage
    const updated = [newEntry, ...filtered].slice(0, 10);
    await chromeStorage.set(CACHE_KEYS.SEARCH, updated);
  },
};

export interface UseRepositoriesOptions extends TrendingQuery {
  enabled?: boolean;
}

export interface UseSearchOptions extends SearchQuery {
  enabled?: boolean;
}

export function useTrendingRepositories(options: UseRepositoriesOptions = {}) {
  const { enabled = true, ...queryParams } = options;

  return useInfiniteQuery({
    queryKey: ['repositories', 'trending', queryParams],
    queryFn: async ({ pageParam = 0 }) => {
      const requestParams = {
        ...queryParams,
        offset: pageParam,
        limit: queryParams.limit || 20,
      };

      try {
        // Try to fetch from API first
        const data = await repositoryApi.getTrendingRepositories(requestParams);

        // Cache the data if we're in extension environment and this is the first page
        if (pageParam === 0 && isExtensionEnvironment()) {
          await cacheUtils.setCachedTrending(queryParams, data);
          await chromeStorage.set(CACHE_KEYS.LAST_FETCH, Date.now());
        }

        return data;
      } catch (error) {
        // If API fails and we're in extension environment, try cache
        if (isExtensionEnvironment() && pageParam === 0) {
          const cachedData = await cacheUtils.getCachedTrending(queryParams);
          if (cachedData) {
            console.info('Using cached trending data due to network error');
            return cachedData;
          }
        }

        // Re-throw error if no cache available
        throw error;
      }
    },
    getNextPageParam: lastPage => {
      if (lastPage.has_more) {
        return lastPage.offset + lastPage.limit;
      }
      return undefined;
    },
    initialPageParam: 0,
    enabled,
    // Add retry configuration for better offline handling
    retry: (failureCount, _error) => {
      // Don't retry if we're offline and have cache
      if (!navigator.onLine && isExtensionEnvironment()) {
        return false;
      }
      return failureCount < 3;
    },
    // Set stale time to reduce unnecessary requests
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

export function useSearchRepositories(options: UseSearchOptions) {
  const { enabled = true, ...queryParams } = options;

  return useInfiniteQuery({
    queryKey: ['repositories', 'search', queryParams],
    queryFn: async ({ pageParam = 0 }) => {
      const requestParams = {
        ...queryParams,
        offset: pageParam,
        limit: queryParams.limit || 20,
      };

      try {
        // Try to fetch from API first
        const data = await repositoryApi.searchRepositories(requestParams);

        // Cache the data if we're in extension environment and this is the first page
        if (pageParam === 0 && isExtensionEnvironment()) {
          await cacheUtils.setCachedSearch(queryParams, data);
          await chromeStorage.set(CACHE_KEYS.LAST_FETCH, Date.now());
        }

        return data;
      } catch (error) {
        // If API fails and we're in extension environment, try cache
        if (isExtensionEnvironment() && pageParam === 0) {
          const cachedData = await cacheUtils.getCachedSearch(queryParams);
          if (cachedData) {
            console.info('Using cached search data due to network error');
            return cachedData;
          }
        }

        // Re-throw error if no cache available
        throw error;
      }
    },
    getNextPageParam: lastPage => {
      if (lastPage.has_more) {
        return lastPage.offset + lastPage.limit;
      }
      return undefined;
    },
    initialPageParam: 0,
    enabled: enabled && !!queryParams.q,
    // Add retry configuration for better offline handling
    retry: (failureCount, _error) => {
      // Don't retry if we're offline and have cache
      if (!navigator.onLine && isExtensionEnvironment()) {
        return false;
      }
      return failureCount < 3;
    },
    // Set stale time to reduce unnecessary requests
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

export function useRepository(id: number) {
  return useQuery({
    queryKey: ['repository', id],
    queryFn: async () => {
      // This would be implemented when we have a single repository endpoint
      throw new Error('Single repository endpoint not implemented yet');
    },
    enabled: false, // Disable until endpoint is available
  });
}

// Helper hook to get all repositories from infinite query
export function useAllRepositories(
  infiniteQuery:
    | ReturnType<typeof useTrendingRepositories>
    | ReturnType<typeof useSearchRepositories>
): Repository[] {
  return infiniteQuery.data?.pages.flatMap(page => page.repositories) || [];
}

// Hook to check cache status and offline capabilities
export function useCacheStatus() {
  const [isOffline, setIsOffline] = React.useState(!navigator.onLine);
  const [hasCachedData, setHasCachedData] = React.useState(false);

  React.useEffect(() => {
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  React.useEffect(() => {
    const checkCachedData = async () => {
      if (!isExtensionEnvironment()) return;

      const trendingCache = await chromeStorage.get<CachedTrendingData[]>(
        CACHE_KEYS.TRENDING
      );
      const searchCache = await chromeStorage.get<CachedSearchData[]>(
        CACHE_KEYS.SEARCH
      );

      setHasCachedData(!!(trendingCache?.length || searchCache?.length));
    };

    checkCachedData();
  }, []);

  return {
    isOffline,
    hasCachedData,
    isExtensionEnvironment: isExtensionEnvironment(),
  };
}

// Hook to clear cache (useful for debugging or user preference)
export function useClearCache() {
  const clearCache = React.useCallback(async () => {
    if (!isExtensionEnvironment()) return;

    try {
      await chromeStorage.remove(CACHE_KEYS.TRENDING);
      await chromeStorage.remove(CACHE_KEYS.SEARCH);
      await chromeStorage.remove(CACHE_KEYS.LAST_FETCH);
      console.info('Cache cleared successfully');
    } catch (error) {
      console.error('Error clearing cache:', error);
    }
  }, []);

  return { clearCache };
}
