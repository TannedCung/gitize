'use client';

import { useInfiniteQuery, useQuery } from '@tanstack/react-query';
import { repositoryApi, TrendingQuery, SearchQuery } from '../lib/api';
import { Repository } from '../components/ui/RepositoryCard';

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
      return repositoryApi.getTrendingRepositories({
        ...queryParams,
        offset: pageParam,
        limit: queryParams.limit || 20,
      });
    },
    getNextPageParam: lastPage => {
      if (lastPage.has_more) {
        return lastPage.offset + lastPage.limit;
      }
      return undefined;
    },
    initialPageParam: 0,
    enabled,
  });
}

export function useSearchRepositories(options: UseSearchOptions) {
  const { enabled = true, ...queryParams } = options;

  return useInfiniteQuery({
    queryKey: ['repositories', 'search', queryParams],
    queryFn: async ({ pageParam = 0 }) => {
      return repositoryApi.searchRepositories({
        ...queryParams,
        offset: pageParam,
        limit: queryParams.limit || 20,
      });
    },
    getNextPageParam: lastPage => {
      if (lastPage.has_more) {
        return lastPage.offset + lastPage.limit;
      }
      return undefined;
    },
    initialPageParam: 0,
    enabled: enabled && !!queryParams.q,
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
