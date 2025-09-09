'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  useTrendingRepositories,
  useSearchRepositories,
  useAllRepositories,
} from '../hooks/useRepositories';
import { LazyRepositoryCard } from './ui/LazyRepositoryCard';
import { FilterPanel, FilterOptions } from './ui/FilterPanel';
import { SearchBar } from './ui/SearchBar';
import { Loading, RepositoryCardSkeleton, Button, Alert } from './ui';
import { ChevronDownIcon } from '@heroicons/react/24/outline';

interface TrendingFeedProps {
  className?: string;
}

export function TrendingFeed({ className = '' }: TrendingFeedProps) {
  const [filters, setFilters] = useState<FilterOptions>({});
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchMode, setIsSearchMode] = useState(false);
  const [showMobileFilters, setShowMobileFilters] = useState(false);

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
        <div className="max-w-2xl mx-auto">
          <Alert variant="error" title="Something went wrong">
            <p className="mb-4">
              {activeQuery.error instanceof Error
                ? activeQuery.error.message
                : 'Failed to load repositories'}
            </p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => activeQuery.refetch()}
            >
              Try again
            </Button>
          </Alert>
        </div>
      </div>
    );
  }

  return (
    <div className={`${className}`} role="main">
      {/* Header */}
      <header className="mb-8 lg:mb-12">
        <div className="text-center mb-8 lg:mb-10">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white mb-4 lg:mb-6 px-4">
            {isSearchMode ? 'Search Results' : 'Trending Repositories'}
          </h1>
          <p className="text-lg sm:text-xl lg:text-2xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto px-4 leading-relaxed">
            {isSearchMode
              ? `Found ${repositories.length} repositories matching "${searchQuery}"`
              : 'Discover the most popular GitHub repositories with AI-powered summaries'}
          </p>
        </div>

        {/* Search Bar */}
        <div className="max-w-2xl mx-auto mb-8 lg:mb-10 px-4">
          <SearchBar
            onSearch={handleSearch}
            initialValue={searchQuery}
            placeholder="Search repositories by name, description, or topic..."
          />
        </div>
      </header>

      <div className="flex flex-col lg:flex-row gap-6 lg:gap-10">
        {/* Mobile Filter Toggle */}
        <div className="lg:hidden">
          <Button
            variant="outline"
            onClick={() => setShowMobileFilters(!showMobileFilters)}
            className="w-full justify-between"
            aria-expanded={showMobileFilters}
            aria-controls="mobile-filters"
            aria-label={
              showMobileFilters
                ? 'Hide filters and options'
                : 'Show filters and options'
            }
          >
            <span>Filters & Options</span>
            <ChevronDownIcon
              className={`h-4 w-4 transition-transform ${showMobileFilters ? 'rotate-180' : ''}`}
              aria-hidden="true"
            />
          </Button>
        </div>

        {/* Sidebar with Filters */}
        <aside
          className={`lg:w-80 flex-shrink-0 ${showMobileFilters ? 'block' : 'hidden lg:block'}`}
          id="mobile-filters"
          aria-label="Repository filters and options"
        >
          <div className="lg:sticky lg:top-6 space-y-6">
            <FilterPanel
              filters={filters}
              onFiltersChange={handleFiltersChange}
            />

            {/* Results Summary */}
            {!activeQuery.isLoading && (
              <div
                className="p-6 bg-gray-50 dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700"
                role="status"
                aria-live="polite"
              >
                <p className="text-sm text-gray-600 dark:text-gray-400 font-medium">
                  {isSearchMode ? (
                    <>
                      <span className="text-primary-600 dark:text-primary-400">
                        {repositories.length}
                      </span>{' '}
                      repositories found
                      {searchQuery && (
                        <>
                          {' '}
                          for &quot;
                          <span className="text-gray-900 dark:text-white">
                            {searchQuery}
                          </span>
                          &quot;
                        </>
                      )}
                    </>
                  ) : (
                    <>
                      <span className="text-primary-600 dark:text-primary-400">
                        {repositories.length}
                      </span>{' '}
                      trending repositories
                    </>
                  )}
                </p>
                {activeQuery.hasNextPage && (
                  <p className="text-xs text-gray-500 dark:text-gray-500 mt-2">
                    Scroll down to load more
                  </p>
                )}
              </div>
            )}
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 min-w-0">
          {/* Loading State */}
          {activeQuery.isLoading && repositories.length === 0 && (
            <div
              className="space-y-6"
              role="status"
              aria-label="Loading repositories"
            >
              <span className="sr-only">Loading repositories...</span>
              {Array.from({ length: 5 }).map((_, index) => (
                <RepositoryCardSkeleton key={index} />
              ))}
            </div>
          )}

          {/* Empty State */}
          {!activeQuery.isLoading && repositories.length === 0 && (
            <div className="text-center py-16" role="status">
              <div
                className="text-gray-400 dark:text-gray-600 mb-6"
                aria-hidden="true"
              >
                <svg
                  className="mx-auto h-16 w-16"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
              </div>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
                {isSearchMode
                  ? 'No repositories found'
                  : 'No trending repositories'}
              </h2>
              <p className="text-gray-600 dark:text-gray-400 text-lg">
                {isSearchMode
                  ? 'Try adjusting your search query or filters'
                  : 'Check back later for trending repositories'}
              </p>
            </div>
          )}

          {/* Repository List */}
          {repositories.length > 0 && (
            <section aria-label="Repository list">
              <div className="space-y-6 sm:space-y-8">
                {repositories.map((repository, index) => (
                  <LazyRepositoryCard
                    key={`${repository.id}-${index}`}
                    repository={repository}
                    showSummary={true}
                  />
                ))}

                {/* Load More Sentinel */}
                <div
                  id="load-more-sentinel"
                  className="h-4"
                  aria-hidden="true"
                />

                {/* Loading More Indicator */}
                {activeQuery.isFetchingNextPage && (
                  <div className="py-12" role="status" aria-live="polite">
                    <Loading text="Loading more repositories..." />
                  </div>
                )}

                {/* End of Results */}
                {!activeQuery.hasNextPage &&
                  !activeQuery.isFetchingNextPage &&
                  repositories.length > 0 && (
                    <div className="text-center py-12" role="status">
                      <p className="text-gray-500 dark:text-gray-500 text-lg">
                        You&apos;ve reached the end of the results
                      </p>
                    </div>
                  )}
              </div>
            </section>
          )}
        </main>
      </div>
    </div>
  );
}
