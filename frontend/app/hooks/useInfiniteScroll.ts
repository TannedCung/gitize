'use client';

import { useCallback, useEffect, useRef } from 'react';

export interface UseInfiniteScrollOptions {
  threshold?: number; // How many items before end to trigger loading
  enabled?: boolean; // Whether infinite scroll is enabled
  hasMore?: boolean; // Whether there are more items to load
  isLoading?: boolean; // Whether currently loading
  onLoadMore?: () => void; // Callback to load more items
}

export interface InfiniteScrollState {
  shouldLoadMore: (_currentIndex: number, _totalItems: number) => boolean;
  triggerLoadMore: (_currentIndex: number, _totalItems: number) => void;
  reset: () => void;
}

/**
 * Hook for managing infinite scroll behavior in vertical feed
 * Detects when user approaches end of content and triggers loading
 */
export function useInfiniteScroll({
  threshold = 3,
  enabled = true,
  hasMore = true,
  isLoading = false,
  onLoadMore,
}: UseInfiniteScrollOptions): InfiniteScrollState {
  const loadingTriggeredRef = useRef(false);
  const lastLoadIndexRef = useRef(-1);

  // Reset loading state when new data arrives
  useEffect(() => {
    if (!isLoading) {
      loadingTriggeredRef.current = false;
    }
  }, [isLoading]);

  // Check if we should load more based on current position
  const shouldLoadMore = useCallback(
    (currentIndex: number, totalItems: number): boolean => {
      if (!enabled || !hasMore || isLoading || !onLoadMore) {
        return false;
      }

      // Don't trigger if we've already triggered for this position
      if (
        loadingTriggeredRef.current ||
        lastLoadIndexRef.current >= currentIndex
      ) {
        return false;
      }

      // Calculate remaining items
      const remainingItems = totalItems - currentIndex - 1;

      // Trigger when within threshold of end
      return remainingItems <= threshold;
    },
    [enabled, hasMore, isLoading, onLoadMore, threshold]
  );

  // Trigger loading more items
  const triggerLoadMore = useCallback(
    (currentIndex: number, totalItems: number) => {
      if (shouldLoadMore(currentIndex, totalItems)) {
        loadingTriggeredRef.current = true;
        lastLoadIndexRef.current = currentIndex;

        if (onLoadMore) {
          onLoadMore();
        }
      }
    },
    [shouldLoadMore, onLoadMore]
  );

  // Reset infinite scroll state
  const reset = useCallback(() => {
    loadingTriggeredRef.current = false;
    lastLoadIndexRef.current = -1;
  }, []);

  return {
    shouldLoadMore,
    triggerLoadMore,
    reset,
  };
}

/**
 * Hook for managing smooth loading states during infinite scroll
 * Provides loading indicators and prevents navigation interruption
 */
export function useInfiniteScrollUI() {
  const loadingStartTimeRef = useRef<number | null>(null);

  const startLoading = useCallback(() => {
    loadingStartTimeRef.current = Date.now();
  }, []);

  const getLoadingDuration = useCallback((): number => {
    if (!loadingStartTimeRef.current) return 0;
    return Date.now() - loadingStartTimeRef.current;
  }, []);

  const shouldShowLoadingIndicator = useCallback(
    (isLoading: boolean, minDisplayTime = 500): boolean => {
      if (!isLoading) {
        loadingStartTimeRef.current = null;
        return false;
      }

      if (!loadingStartTimeRef.current) {
        startLoading();
        return true;
      }

      // Show loading for at least minDisplayTime to prevent flashing
      return getLoadingDuration() < minDisplayTime;
    },
    [startLoading, getLoadingDuration]
  );

  return {
    startLoading,
    getLoadingDuration,
    shouldShowLoadingIndicator,
  };
}

/**
 * Hook for managing infinite scroll performance
 * Tracks metrics and optimizes loading behavior
 */
export function useInfiniteScrollPerformance() {
  const loadTimesRef = useRef<number[]>([]);
  const lastLoadStartRef = useRef<number | null>(null);

  const startLoadTimer = useCallback(() => {
    lastLoadStartRef.current = Date.now();
  }, []);

  const endLoadTimer = useCallback(() => {
    if (lastLoadStartRef.current) {
      const loadTime = Date.now() - lastLoadStartRef.current;
      loadTimesRef.current.push(loadTime);

      // Keep only last 10 load times for average calculation
      if (loadTimesRef.current.length > 10) {
        loadTimesRef.current.shift();
      }

      lastLoadStartRef.current = null;
      return loadTime;
    }
    return 0;
  }, []);

  const getAverageLoadTime = useCallback((): number => {
    if (loadTimesRef.current.length === 0) return 0;

    const sum = loadTimesRef.current.reduce((acc, time) => acc + time, 0);
    return sum / loadTimesRef.current.length;
  }, []);

  const getOptimalThreshold = useCallback((): number => {
    const avgLoadTime = getAverageLoadTime();

    // Adjust threshold based on load performance
    if (avgLoadTime > 2000) return 5; // Slow loading - load earlier
    if (avgLoadTime > 1000) return 4; // Medium loading
    return 3; // Fast loading - default threshold
  }, [getAverageLoadTime]);

  const reset = useCallback(() => {
    loadTimesRef.current = [];
    lastLoadStartRef.current = null;
  }, []);

  return {
    startLoadTimer,
    endLoadTimer,
    getAverageLoadTime,
    getOptimalThreshold,
    reset,
  };
}
