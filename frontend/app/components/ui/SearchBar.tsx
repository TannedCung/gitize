'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { MagnifyingGlassIcon, XMarkIcon } from '@heroicons/react/24/outline';

interface SearchBarProps {
  // eslint-disable-next-line no-unused-vars
  onSearch: (query: string) => void;
  placeholder?: string;
  debounceMs?: number;
  className?: string;
  initialValue?: string;
}

export function SearchBar({
  onSearch,
  placeholder = 'Search repositories...',
  debounceMs = 300,
  className = '',
  initialValue = '',
}: SearchBarProps) {
  const [query, setQuery] = useState(initialValue);
  const [isSearching, setIsSearching] = useState(false);

  // Debounced search function
  const debouncedSearch = useMemo(() => {
    return debounce((searchQuery: string) => {
      setIsSearching(false);
      onSearch(searchQuery);
    }, debounceMs);
  }, [onSearch, debounceMs]);

  useEffect(() => {
    if (query !== initialValue) {
      setIsSearching(true);
      debouncedSearch(query);
    }
  }, [query, debouncedSearch, initialValue]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setQuery(e.target.value);
  };

  const handleClear = () => {
    setQuery('');
    setIsSearching(false);
    onSearch('');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSearching(false);
    onSearch(query);
  };

  return (
    <form
      onSubmit={handleSubmit}
      className={`relative ${className}`}
      role="search"
    >
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <MagnifyingGlassIcon
            className="h-5 w-5 text-gray-400"
            aria-hidden="true"
          />
        </div>

        <input
          type="text"
          value={query}
          onChange={handleInputChange}
          placeholder={placeholder}
          className="w-full pl-10 pr-10 py-3 sm:py-4 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors text-base touch-manipulation"
          aria-label="Search repositories"
          aria-describedby={query ? 'search-status' : undefined}
        />

        {query && (
          <div className="absolute inset-y-0 right-0 flex items-center">
            {isSearching && (
              <div className="mr-3" role="status" aria-label="Searching">
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-primary-500 border-t-transparent"></div>
                <span className="sr-only">Searching...</span>
              </div>
            )}
            <button
              type="button"
              onClick={handleClear}
              className="mr-3 p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-1 rounded"
              aria-label="Clear search"
            >
              <XMarkIcon className="h-4 w-4" aria-hidden="true" />
            </button>
          </div>
        )}
      </div>

      {/* Search suggestions or recent searches could go here */}
      {query && (
        <div
          className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg shadow-lg z-10 max-h-60 overflow-y-auto"
          role="status"
          id="search-status"
          aria-live="polite"
        >
          <div className="p-3 text-sm text-gray-600 dark:text-gray-400">
            Press Enter to search for &quot;{query}&quot;
          </div>
        </div>
      )}
    </form>
  );
}

// Debounce utility function
// eslint-disable-next-line no-unused-vars
function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
  // eslint-disable-next-line no-unused-vars
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;

  return (...funcArgs: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...funcArgs), wait);
  };
}
