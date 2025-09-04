'use client';

import React from 'react';
import {
  CodeBracketIcon,
  EyeIcon,
  ExclamationTriangleIcon,
} from '@heroicons/react/24/outline';
import { StarIcon as StarIconSolid } from '@heroicons/react/24/solid';

export interface Repository {
  id: number;
  github_id: number;
  name: string;
  full_name: string;
  description?: string;
  stars: number;
  forks: number;
  language?: string;
  author: string;
  url: string;
  trending_date: string;
  summary?: string;
}

export interface SummaryState {
  isLoading?: boolean;
  error?: string;
}

interface RepositoryCardProps {
  repository: Repository;
  showSummary?: boolean;
  summaryState?: SummaryState;
}

export function RepositoryCard({
  repository,
  showSummary = true,
  summaryState,
}: RepositoryCardProps) {
  const [summaryExpanded, setSummaryExpanded] = React.useState(false);

  const formatNumber = (num: number): string => {
    if (num >= 1000000) {
      return `${(num / 1000000).toFixed(1)}M`;
    }
    if (num >= 1000) {
      return `${(num / 1000).toFixed(1)}k`;
    }
    return num.toString();
  };

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const getLanguageColor = (language?: string): string => {
    const colors: Record<string, string> = {
      JavaScript: '#f1e05a',
      TypeScript: '#2b7489',
      Python: '#3572A5',
      Java: '#b07219',
      'C++': '#f34b7d',
      C: '#555555',
      'C#': '#239120',
      PHP: '#4F5D95',
      Ruby: '#701516',
      Go: '#00ADD8',
      Rust: '#dea584',
      Swift: '#ffac45',
      Kotlin: '#F18E33',
      Dart: '#00B4AB',
      HTML: '#e34c26',
      CSS: '#1572B6',
      Shell: '#89e051',
      Vue: '#2c3e50',
      React: '#61dafb',
    };
    return colors[language || ''] || '#6b7280';
  };

  const shouldTruncateSummary = (text: string): boolean => {
    return text.length > 200;
  };

  const getTruncatedSummary = (text: string): string => {
    return text.length > 200 ? `${text.substring(0, 200)}...` : text;
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 hover:shadow-md transition-shadow">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1 min-w-0">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white truncate">
            <a
              href={repository.url}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
            >
              {repository.name}
            </a>
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 truncate">
            by {repository.author}
          </p>
        </div>
        <div className="flex items-center space-x-4 ml-4">
          <div className="flex items-center space-x-1 text-sm text-gray-600 dark:text-gray-400">
            <StarIconSolid className="h-4 w-4 text-yellow-400" />
            <span>{formatNumber(repository.stars)}</span>
          </div>
          <div className="flex items-center space-x-1 text-sm text-gray-600 dark:text-gray-400">
            <CodeBracketIcon className="h-4 w-4" />
            <span>{formatNumber(repository.forks)}</span>
          </div>
        </div>
      </div>

      {/* Description */}
      {repository.description && (
        <p className="text-gray-700 dark:text-gray-300 text-sm mb-4 line-clamp-2">
          {repository.description}
        </p>
      )}

      {/* AI Summary */}
      {showSummary && (
        <div className="mb-4">
          {/* Summary Loading State */}
          {summaryState?.isLoading && (
            <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-md border border-blue-200 dark:border-blue-800">
              <div className="flex items-center space-x-2 mb-2">
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-blue-600 border-t-transparent" />
                <span className="text-sm font-medium text-blue-900 dark:text-blue-100">
                  Generating AI Summary...
                </span>
              </div>
              <div className="space-y-2">
                <div className="h-3 bg-blue-200 dark:bg-blue-800 rounded animate-pulse"></div>
                <div className="h-3 bg-blue-200 dark:bg-blue-800 rounded animate-pulse w-3/4"></div>
                <div className="h-3 bg-blue-200 dark:bg-blue-800 rounded animate-pulse w-1/2"></div>
              </div>
            </div>
          )}

          {/* Summary Error State */}
          {summaryState?.error && !summaryState.isLoading && (
            <div className="p-3 bg-red-50 dark:bg-red-900/20 rounded-md border border-red-200 dark:border-red-800">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-2">
                  <ExclamationTriangleIcon className="h-4 w-4 text-red-600 dark:text-red-400" />
                  <span className="text-sm font-medium text-red-900 dark:text-red-100">
                    Summary Generation Failed
                  </span>
                </div>
              </div>
              <p className="text-sm text-red-800 dark:text-red-200 mb-3">
                {summaryState.error}
              </p>
            </div>
          )}

          {/* Summary Content */}
          {repository.summary &&
            !summaryState?.isLoading &&
            !summaryState?.error && (
              <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-md border border-blue-200 dark:border-blue-800">
                <div className="flex items-center space-x-2 mb-2">
                  <EyeIcon className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                  <span className="text-sm font-medium text-blue-900 dark:text-blue-100">
                    AI Summary
                  </span>
                </div>
                <p className="text-sm text-blue-800 dark:text-blue-200">
                  {summaryExpanded || !shouldTruncateSummary(repository.summary)
                    ? repository.summary
                    : getTruncatedSummary(repository.summary)}
                </p>
                {shouldTruncateSummary(repository.summary) && (
                  <button
                    onClick={() => setSummaryExpanded(!summaryExpanded)}
                    className="text-xs text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-200 mt-1 font-medium"
                  >
                    {summaryExpanded ? 'Show less' : 'Show more'}
                  </button>
                )}
              </div>
            )}

          {/* No Summary Available */}
          {!repository.summary &&
            !summaryState?.isLoading &&
            !summaryState?.error && (
              <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-md border border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    <EyeIcon className="h-4 w-4 text-gray-400" />
                    <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                      AI Summary
                    </span>
                  </div>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                  No AI summary available for this repository yet.
                </p>
              </div>
            )}
        </div>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between text-sm">
        <div className="flex items-center space-x-4">
          {repository.language && (
            <div className="flex items-center space-x-1">
              <div
                className="w-3 h-3 rounded-full"
                style={{
                  backgroundColor: getLanguageColor(repository.language),
                }}
              />
              <span className="text-gray-600 dark:text-gray-400">
                {repository.language}
              </span>
            </div>
          )}
        </div>
        <span className="text-gray-500 dark:text-gray-500">
          Trending {formatDate(repository.trending_date)}
        </span>
      </div>
    </div>
  );
}
