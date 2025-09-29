'use client';

import { useCallback, useEffect, useMemo } from 'react';
import {
  useTrendingRepositories,
  UseRepositoriesOptions,
} from './useRepositories';
import { Repository } from '../components/ui/RepositoryCard';

// Enhanced Repository interface for vertical feed
export interface VerticalFeedRepository extends Repository {
  slideIndex?: number;
  isPreloaded?: boolean;
  contentHeight?: number;
  hasLongDescription?: boolean;
  summaryExpanded?: boolean;
  viewDuration?: number;
  interactionCount?: number;
}

// Feed data state interface
export interface FeedDataState {
  repositories: VerticalFeedRepository[];
  isLoading: boolean;
  isLoadingMore: boolean;
  hasMore: boolean;
  error: string | null;
  totalCount: number;
  currentBatch: number;
}

// Feed data actions interface
export interface FeedDataActions {
  loadMore: () => void;
  refresh: () => void;
  retry: () => void;
  preloadNext: (_currentIndex: number) => void;
}

// Hook options interface
export interface UseVerticalFeedDataOptions extends UseRepositoriesOptions {
  preloadThreshold?: number; // How many slides ahead to trigger loading
  batchSize?: number; // Number of repositories to load per batch
  enablePreloading?: boolean; // Whether to preload content
}

/**
 * Custom hook for managing vertical feed data integration
 * Connects with existing repository hooks and provides infinite loading
 */
export function useVerticalFeedData(options: UseVerticalFeedDataOptions = {}) {
  const {
    preloadThreshold = 3,
    batchSize = 20,
    enablePreloading = true,
    enabled = true,
    ...repositoryOptions
  } = options;

  // Use existing trending repositories hook with infinite query
  const {
    data,
    isLoading,
    isFetchingNextPage,
    hasNextPage,
    fetchNextPage,
    error,
    refetch,
    isError,
  } = useTrendingRepositories({
    ...repositoryOptions,
    limit: batchSize,
    enabled,
  });

  // Transform repository data for vertical feed
  const transformedRepositories = useMemo((): VerticalFeedRepository[] => {
    if (!data?.pages) return [];

    return data.pages.flatMap((page, pageIndex) =>
      page.repositories.map((repo, repoIndex) => ({
        ...repo,
        slideIndex: pageIndex * batchSize + repoIndex,
        isPreloaded: false,
        hasLongDescription: (repo.description?.length || 0) > 200,
        summaryExpanded: false,
        viewDuration: 0,
        interactionCount: 0,
      }))
    );
  }, [data?.pages, batchSize]);

  // Calculate total count from all pages
  const totalCount = useMemo(() => {
    if (!data?.pages?.length) return 0;
    return data.pages[0]?.total || transformedRepositories.length;
  }, [data?.pages, transformedRepositories.length]);

  // Current batch number
  const currentBatch = useMemo(() => {
    return data?.pages?.length || 0;
  }, [data?.pages?.length]);

  // Error message handling
  const errorMessage = useMemo(() => {
    if (!isError || !error) return null;

    if (error instanceof Error) {
      return error.message;
    }

    return 'Failed to load repositories. Please try again.';
  }, [isError, error]);

  // Load more repositories
  const loadMore = useCallback(async () => {
    if (!hasNextPage || isFetchingNextPage) return;

    try {
      await fetchNextPage();
    } catch (err) {
      console.error('Failed to load more repositories:', err);
    }
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  // Refresh all data
  const refresh = useCallback(async () => {
    try {
      await refetch();
    } catch (err) {
      console.error('Failed to refresh repositories:', err);
    }
  }, [refetch]);

  // Retry on error
  const retry = useCallback(async () => {
    if (isError) {
      await refresh();
    }
  }, [isError, refresh]);

  // Preload next batch when approaching end
  const preloadNext = useCallback(
    (currentIndex: number) => {
      if (!enablePreloading || !hasNextPage || isFetchingNextPage) return;

      const remainingSlides = transformedRepositories.length - currentIndex - 1;

      // Trigger loading when within threshold of current batch end
      if (remainingSlides <= preloadThreshold) {
        loadMore();
      }
    },
    [
      enablePreloading,
      hasNextPage,
      isFetchingNextPage,
      transformedRepositories.length,
      preloadThreshold,
      loadMore,
    ]
  );

  // Auto-preload effect for initial load
  useEffect(() => {
    if (
      enablePreloading &&
      transformedRepositories.length === 0 &&
      !isLoading &&
      !isError &&
      enabled
    ) {
      // Initial load will be handled by the query itself
    }
  }, [
    enablePreloading,
    transformedRepositories.length,
    isLoading,
    isError,
    enabled,
  ]);

  // Feed data state
  const feedDataState: FeedDataState = {
    repositories: transformedRepositories,
    isLoading: isLoading && currentBatch === 0, // Only show loading for initial load
    isLoadingMore: isFetchingNextPage,
    hasMore: hasNextPage || false,
    error: errorMessage,
    totalCount,
    currentBatch,
  };

  // Feed data actions
  const feedDataActions: FeedDataActions = {
    loadMore,
    refresh,
    retry,
    preloadNext,
  };

  return {
    ...feedDataState,
    actions: feedDataActions,
  };
}

/**
 * Hook for managing repository interaction tracking
 * Tracks user interactions with repositories in the feed
 */
export function useRepositoryInteractions() {
  const trackView = useCallback(
    (repository: VerticalFeedRepository, duration: number) => {
      // Track repository view duration
      // This could be sent to analytics service
      console.debug(`Repository ${repository.name} viewed for ${duration}ms`);
    },
    []
  );

  const trackInteraction = useCallback(
    (repository: VerticalFeedRepository, action: string) => {
      // Track repository interactions (click, share, save, etc.)
      // This could be sent to analytics service
      console.debug(`Repository ${repository.name} interaction: ${action}`);
    },
    []
  );

  const trackError = useCallback(
    (repository: VerticalFeedRepository, error: string) => {
      // Track repository-related errors
      // This could be sent to error tracking service
      console.error(`Repository ${repository.name} error: ${error}`);
    },
    []
  );

  return {
    trackView,
    trackInteraction,
    trackError,
  };
}

/**
 * Hook for managing feed performance metrics
 * Tracks performance-related metrics for optimization
 */
export function useFeedPerformance() {
  const trackSlideTransition = useCallback(
    (fromIndex: number, toIndex: number, duration: number) => {
      // Track slide transition performance
      console.debug(
        `Slide transition ${fromIndex} -> ${toIndex} took ${duration}ms`
      );
    },
    []
  );

  const trackDataLoad = useCallback((batchSize: number, loadTime: number) => {
    // Track data loading performance
    console.debug(`Loaded ${batchSize} repositories in ${loadTime}ms`);
  }, []);

  const trackMemoryUsage = useCallback(() => {
    // Track memory usage if performance API is available
    if (
      typeof window !== 'undefined' &&
      'performance' in window &&
      'memory' in (window.performance as any)
    ) {
      const memory = (window.performance as any).memory;
      console.debug('Memory usage:', {
        used: Math.round(memory.usedJSHeapSize / 1048576),
        total: Math.round(memory.totalJSHeapSize / 1048576),
        limit: Math.round(memory.jsHeapSizeLimit / 1048576),
      });
    }
  }, []);

  return {
    trackSlideTransition,
    trackDataLoad,
    trackMemoryUsage,
  };
}
