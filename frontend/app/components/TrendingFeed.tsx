'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  useTrendingRepositories,
  useSearchRepositories,
  useAllRepositories,
} from '../hooks/useRepositories';
import { RepositoryCard } from './ui/RepositoryCard';
import { FilterPanel, FilterOptions } from './ui/FilterPanel';
import { SearchBar } from './ui/SearchBar';
import { Loading, RepositoryCardSkeleton } from './ui/Loading';
import { ExclamationTriangleIcon } from '@heroicons/react/24/outline';

interface TrendingFeedProps {
  className?: string;
}

export function TrendingFeed({ className = '' }: TrendingFeedProps) {
  const [filters, setFilters] = useState<FilterOptions>({});
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchMode, setIsSearchMode] = useState(false);

  // Convert FilterOptions to API query format
  const trendingQueryParams = {
    language: filters.language,
    min_stars: filters.minStars,
    max_stars: filters.maxStars,
    date_range: filters.dateRange,
  };

  const searchQueryParams = {
    q: searchQuery,
  };

  // Use trending or search query based on mode
  const trendingQuery = useTrendingRepositories({
    ...trendingQueryParams,
    enabled: !isSearchMode,
  });

  const searchQueryResult = useSearchRepositories({
    ...searchQueryParams,
    enabled: isSearchMode && searchQuery.length > 0,
  });

  // Get the active query and repositories
  const activeQuery = isSearchMode ? searchQueryResult : trendingQuery;
  const repositories = useAllRepositories(activeQuery);

  // Handle search
  const handleSearch = useCallback((query: string) => {
    setSearchQuery(query);
    setIsSearchMode(query.length > 0);
  }, []);

  // Handle filter changes
  const handleFiltersChange = useCallback((newFilters: FilterOptions) => {
    setFilters(newFilters);
    // If we're in search mode and filters change, we might want to stay in search mode
    // or switch back to trending - for now, let's stay in current mode
  }, []);

  // Infinite scroll handler
  const handleLoadMore = useCallback(() => {
    if (activeQuery.hasNextPage && !activeQuery.isFetchingNextPage) {
      activeQuery.fetchNextPage();
    }
  }, [activeQuery]);

  // Set up intersection observer for infinite scroll
  useEffect(() => {
    const observer = new IntersectionObserver(
      entries => {
        const target = entries[0];
        if (target.isIntersecting) {
          handleLoadMore();
        }
      },
      {
        threshold: 0.1,
        rootMargin: '100px',
      }
    );

    const sentinel = document.getElementById('load-more-sentinel');
    if (sentinel) {
      observer.observe(sentinel);
    }

    return () => {
      if (sentinel) {
        observer.unobserve(sentinel);
      }
    };
  }, [handleLoadMore]);

  // Error state
  if (activeQuery.error) {
    return (
      <div className={`${className}`}>
        <div className="text-center py-12">
          <ExclamationTriangleIcon className="mx-auto h-12 w-12 text-red-500 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            Something went wrong
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            {activeQuery.error instanceof Error
              ? activeQuery.error.message
              : 'Failed to load repositories'}
          </p>
          <button
            onClick={() => activeQuery.refetch()}
            className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
          >
            Try again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`${className}`}>
      {/* Header */}
      <div className="mb-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            {isSearchMode ? 'Search Results' : 'Trending Repositories'}
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            {isSearchMode
              ? `Found ${repositories.length} repositories matching "${searchQuery}"`
              : 'Discover the most popular GitHub repositories with AI-powered summaries'}
          </p>
        </div>

        {/* Search Bar */}
        <div className="max-w-2xl mx-auto mb-8">
          <SearchBar
            onSearch={handleSearch}
            initialValue={searchQuery}
            placeholder="Search repositories by name, description, or topic..."
          />
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Sidebar with Filters */}
        <div className="lg:w-80 flex-shrink-0">
          <div className="sticky top-4">
            <FilterPanel
              filters={filters}
              onFiltersChange={handleFiltersChange}
            />

            {/* Results Summary */}
            {!activeQuery.isLoading && (
              <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {isSearchMode ? (
                    <>
                      <span className="font-medium">{repositories.length}</span>{' '}
                      repositories found
                      {searchQuery && (
                        <>
                          {' '}
                          for &quot;
                          <span className="font-medium">{searchQuery}</span>
                          &quot;
                        </>
                      )}
                    </>
                  ) : (
                    <>
                      <span className="font-medium">{repositories.length}</span>{' '}
                      trending repositories
                    </>
                  )}
                </p>
                {activeQuery.hasNextPage && (
                  <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                    Scroll down to load more
                  </p>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 min-w-0">
          {/* Loading State */}
          {activeQuery.isLoading && repositories.length === 0 && (
            <div className="space-y-6">
              {Array.from({ length: 5 }).map((_, index) => (
                <RepositoryCardSkeleton key={index} />
              ))}
            </div>
          )}

          {/* Empty State */}
          {!activeQuery.isLoading && repositories.length === 0 && (
            <div className="text-center py-12">
              <div className="text-gray-400 dark:text-gray-600 mb-4">
                <svg
                  className="mx-auto h-12 w-12"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                {isSearchMode
                  ? 'No repositories found'
                  : 'No trending repositories'}
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                {isSearchMode
                  ? 'Try adjusting your search query or filters'
                  : 'Check back later for trending repositories'}
              </p>
            </div>
          )}

          {/* Repository List */}
          {repositories.length > 0 && (
            <div className="space-y-6">
              {repositories.map((repository, index) => (
                <RepositoryCard
                  key={`${repository.id}-${index}`}
                  repository={repository}
                  showSummary={true}
                />
              ))}

              {/* Load More Sentinel */}
              <div id="load-more-sentinel" className="h-4" />

              {/* Loading More Indicator */}
              {activeQuery.isFetchingNextPage && (
                <div className="py-8">
                  <Loading text="Loading more repositories..." />
                </div>
              )}

              {/* End of Results */}
              {!activeQuery.hasNextPage &&
                !activeQuery.isFetchingNextPage &&
                repositories.length > 0 && (
                  <div className="text-center py-8">
                    <p className="text-gray-500 dark:text-gray-500">
                      You&apos;ve reached the end of the results
                    </p>
                  </div>
                )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
