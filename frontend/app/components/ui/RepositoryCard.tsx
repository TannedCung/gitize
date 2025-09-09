'use client';

import React from 'react';
import { CodeBracketIcon, EyeIcon } from '@heroicons/react/24/outline';
import { StarIcon as StarIconSolid } from '@heroicons/react/24/solid';
import { BaseComponentProps } from './types';
import { cn } from './utils';
import { Button } from './Button';
import { Alert } from './Alert';
import { Spinner } from './Loading';

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

interface RepositoryCardProps extends BaseComponentProps {
  repository: Repository;
  showSummary?: boolean;
  summaryState?: SummaryState;
}

export function RepositoryCard({
  repository,
  showSummary = true,
  summaryState,
  className,
  ...props
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
    <article
      className={cn(
        'bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700',
        'p-4 sm:p-6 hover:shadow-appflowy-md transition-all duration-200 ease-in-out',
        'touch-manipulation hover:border-primary-300 dark:hover:border-primary-600',
        className
      )}
      data-testid={`repository-card-${repository.id}`}
      {...props}
    >
      {/* Header */}
      <header className="flex flex-col sm:flex-row sm:items-start sm:justify-between mb-4 space-y-2 sm:space-y-0">
        <div className="flex-1 min-w-0">
          <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white">
            <a
              href={repository.url}
              target="_blank"
              rel="noopener noreferrer"
              className={cn(
                'hover:text-primary-600 dark:hover:text-primary-400',
                'transition-colors duration-200 break-words rounded-md',
                'focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2',
                'dark:focus:ring-offset-gray-800'
              )}
              aria-label={`Visit ${repository.name} repository on GitHub`}
            >
              {repository.name}
            </a>
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 break-words mt-1">
            by {repository.author}
          </p>
        </div>
        <div className="flex items-center space-x-3 sm:space-x-4 sm:ml-4 flex-shrink-0">
          <div className="flex items-center space-x-1.5 text-sm text-gray-600 dark:text-gray-400">
            <StarIconSolid
              className="h-4 w-4 text-warning-500 flex-shrink-0"
              aria-hidden="true"
            />
            <span
              className="font-medium"
              aria-label={`${repository.stars} stars`}
            >
              {formatNumber(repository.stars)}
            </span>
          </div>
          <div className="flex items-center space-x-1.5 text-sm text-gray-600 dark:text-gray-400">
            <CodeBracketIcon
              className="h-4 w-4 flex-shrink-0"
              aria-hidden="true"
            />
            <span
              className="font-medium"
              aria-label={`${repository.forks} forks`}
            >
              {formatNumber(repository.forks)}
            </span>
          </div>
        </div>
      </header>

      {/* Description */}
      {repository.description && (
        <p
          className="text-gray-700 dark:text-gray-300 text-sm mb-4 line-clamp-2 leading-relaxed"
          aria-label="Repository description"
        >
          {repository.description}
        </p>
      )}

      {/* AI Summary */}
      {showSummary && (
        <div className="mb-4">
          {/* Summary Loading State */}
          {summaryState?.isLoading && (
            <Alert
              variant="info"
              title="Generating AI Summary..."
              className="mb-0"
            >
              <div className="flex items-center space-x-3 mt-2">
                <Spinner size="sm" color="info" />
                <div className="flex-1 space-y-2">
                  <div className="h-2 bg-info-200 dark:bg-info-800 rounded animate-pulse"></div>
                  <div className="h-2 bg-info-200 dark:bg-info-800 rounded animate-pulse w-3/4"></div>
                  <div className="h-2 bg-info-200 dark:bg-info-800 rounded animate-pulse w-1/2"></div>
                </div>
              </div>
            </Alert>
          )}

          {/* Summary Error State */}
          {summaryState?.error && !summaryState.isLoading && (
            <Alert
              variant="error"
              title="Summary Generation Failed"
              className="mb-0"
              data-testid={`summary-error-${repository.id}`}
            >
              {summaryState.error}
            </Alert>
          )}

          {/* Summary Content */}
          {repository.summary &&
            !summaryState?.isLoading &&
            !summaryState?.error && (
              <Alert
                variant="info"
                title="AI Summary"
                icon={<EyeIcon className="h-5 w-5" />}
                className="mb-0"
                data-testid={`summary-content-${repository.id}`}
              >
                <div role="region" aria-labelledby={`summary-${repository.id}`}>
                  <p
                    className="text-sm leading-relaxed"
                    aria-describedby={`summary-${repository.id}`}
                  >
                    {summaryExpanded ||
                    !shouldTruncateSummary(repository.summary)
                      ? repository.summary
                      : getTruncatedSummary(repository.summary)}
                  </p>
                  {shouldTruncateSummary(repository.summary) && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setSummaryExpanded(!summaryExpanded)}
                      className="mt-2 p-0 h-auto text-xs font-medium text-info-600 dark:text-info-400 hover:text-info-800 dark:hover:text-info-200"
                      aria-expanded={summaryExpanded}
                      aria-controls={`summary-content-${repository.id}`}
                      aria-label={
                        summaryExpanded
                          ? 'Show less of the AI summary'
                          : 'Show more of the AI summary'
                      }
                    >
                      {summaryExpanded ? 'Show less' : 'Show more'}
                    </Button>
                  )}
                </div>
              </Alert>
            )}

          {/* No Summary Available */}
          {!repository.summary &&
            !summaryState?.isLoading &&
            !summaryState?.error && (
              <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                <div className="flex items-center space-x-2 mb-2">
                  <EyeIcon className="h-4 w-4 text-gray-400" />
                  <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    AI Summary
                  </span>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  No AI summary available for this repository yet.
                </p>
              </div>
            )}
        </div>
      )}

      {/* Footer */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between text-sm space-y-2 sm:space-y-0 pt-2 border-t border-gray-100 dark:border-gray-700">
        <div className="flex items-center space-x-4">
          {repository.language && (
            <div className="flex items-center space-x-2">
              <div
                className="w-3 h-3 rounded-full flex-shrink-0 ring-1 ring-gray-200 dark:ring-gray-600"
                style={{
                  backgroundColor: getLanguageColor(repository.language),
                }}
                aria-hidden="true"
              />
              <span className="text-gray-600 dark:text-gray-400 font-medium">
                {repository.language}
              </span>
            </div>
          )}
        </div>
        <span className="text-gray-500 dark:text-gray-500 text-xs sm:text-sm font-medium">
          Trending {formatDate(repository.trending_date)}
        </span>
      </div>
    </article>
  );
}
