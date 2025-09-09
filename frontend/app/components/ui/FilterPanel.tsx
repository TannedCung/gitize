'use client';

import React from 'react';
import { ChevronDownIcon } from '@heroicons/react/24/outline';

export interface FilterOptions {
  language?: string;
  minStars?: number;
  maxStars?: number;
  dateRange?: 'today' | 'week' | 'month' | 'all';
}

interface FilterPanelProps {
  filters: FilterOptions;
  // eslint-disable-next-line no-unused-vars
  onFiltersChange: (filters: FilterOptions) => void;
  className?: string;
}

const POPULAR_LANGUAGES = [
  'All Languages',
  'JavaScript',
  'TypeScript',
  'Python',
  'Java',
  'C++',
  'C#',
  'PHP',
  'Ruby',
  'Go',
  'Rust',
  'Swift',
  'Kotlin',
  'Dart',
  'HTML',
  'CSS',
  'Shell',
];

const STAR_RANGES = [
  { label: 'Any stars', min: undefined, max: undefined },
  { label: '10+ stars', min: 10, max: undefined },
  { label: '100+ stars', min: 100, max: undefined },
  { label: '1k+ stars', min: 1000, max: undefined },
  { label: '10k+ stars', min: 10000, max: undefined },
  { label: '50k+ stars', min: 50000, max: undefined },
];

const DATE_RANGES = [
  { label: 'All time', value: 'all' as const },
  { label: 'Today', value: 'today' as const },
  { label: 'This week', value: 'week' as const },
  { label: 'This month', value: 'month' as const },
];

export function FilterPanel({
  filters,
  onFiltersChange,
  className = '',
}: FilterPanelProps) {
  const handleLanguageChange = (language: string) => {
    onFiltersChange({
      ...filters,
      language: language === 'All Languages' ? undefined : language,
    });
  };

  const handleStarRangeChange = (min?: number, max?: number) => {
    onFiltersChange({
      ...filters,
      minStars: min,
      maxStars: max,
    });
  };

  const handleDateRangeChange = (dateRange: FilterOptions['dateRange']) => {
    onFiltersChange({
      ...filters,
      dateRange,
    });
  };

  const getSelectedStarRange = () => {
    const range = STAR_RANGES.find(
      r => r.min === filters.minStars && r.max === filters.maxStars
    );
    return range?.label || 'Any stars';
  };

  const getSelectedDateRange = () => {
    const range = DATE_RANGES.find(r => r.value === filters.dateRange);
    return range?.label || 'All time';
  };

  return (
    <div
      className={`bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 ${className}`}
      role="region"
      aria-labelledby="filters-heading"
    >
      <h3
        id="filters-heading"
        className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white mb-4"
      >
        Filters
      </h3>

      <div className="space-y-4">
        {/* Language Filter */}
        <div>
          <label
            htmlFor="language-filter"
            className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
          >
            Language
          </label>
          <div className="relative">
            <select
              id="language-filter"
              value={filters.language || 'All Languages'}
              onChange={e => handleLanguageChange(e.target.value)}
              className="w-full appearance-none bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md px-3 py-3 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 touch-manipulation"
              aria-describedby="language-filter-desc"
            >
              {POPULAR_LANGUAGES.map(language => (
                <option key={language} value={language}>
                  {language}
                </option>
              ))}
            </select>
            <ChevronDownIcon
              className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none"
              aria-hidden="true"
            />
          </div>
          <p id="language-filter-desc" className="sr-only">
            Filter repositories by programming language
          </p>
        </div>

        {/* Stars Filter */}
        <div>
          <label
            htmlFor="stars-filter"
            className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
          >
            Stars
          </label>
          <div className="relative">
            <select
              id="stars-filter"
              value={getSelectedStarRange()}
              onChange={e => {
                const range = STAR_RANGES.find(r => r.label === e.target.value);
                if (range) {
                  handleStarRangeChange(range.min, range.max);
                }
              }}
              className="w-full appearance-none bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md px-3 py-3 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 touch-manipulation"
              aria-describedby="stars-filter-desc"
            >
              {STAR_RANGES.map(range => (
                <option key={range.label} value={range.label}>
                  {range.label}
                </option>
              ))}
            </select>
            <ChevronDownIcon
              className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none"
              aria-hidden="true"
            />
          </div>
          <p id="stars-filter-desc" className="sr-only">
            Filter repositories by minimum star count
          </p>
        </div>

        {/* Date Range Filter */}
        <div>
          <label
            htmlFor="date-filter"
            className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
          >
            Time Range
          </label>
          <div className="relative">
            <select
              id="date-filter"
              value={getSelectedDateRange()}
              onChange={e => {
                const range = DATE_RANGES.find(r => r.label === e.target.value);
                if (range) {
                  handleDateRangeChange(range.value);
                }
              }}
              className="w-full appearance-none bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md px-3 py-3 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 touch-manipulation"
              aria-describedby="date-filter-desc"
            >
              {DATE_RANGES.map(range => (
                <option key={range.value} value={range.label}>
                  {range.label}
                </option>
              ))}
            </select>
            <ChevronDownIcon
              className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none"
              aria-hidden="true"
            />
          </div>
          <p id="date-filter-desc" className="sr-only">
            Filter repositories by trending time period
          </p>
        </div>

        {/* Clear Filters */}
        <button
          onClick={() => onFiltersChange({})}
          className="w-full text-sm text-primary-600 dark:text-primary-400 hover:text-primary-800 dark:hover:text-primary-200 font-medium py-2 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 rounded touch-manipulation tap-target"
          aria-label="Clear all applied filters"
        >
          Clear all filters
        </button>
      </div>
    </div>
  );
}
