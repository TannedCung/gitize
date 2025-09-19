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
  compact?: boolean;
  extensionMode?: boolean;
  onRepositoryClick?: (_repository: Repository) => void;
}

export function RepositoryCard({
  repository,
  showSummary = true,
  summaryState,
  compact = false,
  extensionMode = false,
  onRepositoryClick,
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

  const handleClick = () => {
    if (onRepositoryClick) {
      onRepositoryClick(repository);
    }
  };

  return (
    <article
      className={cn(
        // Flat design - no shadows, minimal borders, clean background
        'bg-neutral-white dark:bg-neutral-900',
        // Conditional padding based on compact mode
        compact ? 'p-4' : 'p-8 sm:p-12',
        // Subtle hover state with minimal visual change
        'hover:bg-neutral-50 dark:hover:bg-neutral-800/50',
        // Smooth transitions for interaction feedback
        'transition-colors duration-200 ease-in-out',
        // Touch-friendly interaction
        'touch-manipulation',
        // Add cursor pointer if clickable
        onRepositoryClick && 'cursor-pointer',
        className
      )}
      data-testid={`repository-card-${repository.id}`}
      onClick={extensionMode ? handleClick : undefined}
      {...props}
    >
      {/* Header - Typography-first hierarchy with conditional spacing */}
      <header
        className={cn(
          'flex flex-col sm:flex-row sm:items-start sm:justify-between space-y-4 sm:space-y-0',
          compact ? 'mb-3' : 'mb-8'
        )}
      >
        <div className="flex-1 min-w-0">
          {/* Repository name with clean typography hierarchy */}
          <h3
            className={cn(
              'font-semibold text-neutral-900 dark:text-neutral-white leading-tight',
              compact ? 'text-base sm:text-lg' : 'text-xl sm:text-2xl'
            )}
          >
            <a
              href={repository.url}
              target="_blank"
              rel="noopener noreferrer"
              className={cn(
                // Subtle hover state using color change only
                'hover:text-accent-blue-600 dark:hover:text-accent-blue-400',
                'transition-colors duration-200 break-words',
                // Minimal focus state for accessibility
                'focus:outline-none focus:ring-1 focus:ring-accent-blue-500 focus:ring-offset-2',
                'dark:focus:ring-offset-neutral-900 rounded-sm'
              )}
              aria-label={`Visit ${repository.name} repository on GitHub`}
              onClick={extensionMode ? e => e.stopPropagation() : undefined}
            >
              {repository.name}
            </a>
          </h3>
          {/* Author with subtle typography */}
          <p
            className={cn(
              'text-neutral-600 dark:text-neutral-400 break-words leading-relaxed',
              compact ? 'text-sm mt-1' : 'text-base mt-3'
            )}
          >
            by {repository.author}
          </p>
        </div>
        {/* Stats with conditional spacing and minimal visual weight */}
        <div
          className={cn(
            'flex items-center flex-shrink-0',
            compact ? 'space-x-4 sm:ml-4' : 'space-x-6 sm:space-x-8 sm:ml-8'
          )}
        >
          <div
            className={cn(
              'flex items-center space-x-2 text-neutral-600 dark:text-neutral-400',
              compact ? 'text-sm' : 'text-base'
            )}
          >
            <StarIconSolid
              className={cn(
                'text-accent-amber-500 flex-shrink-0',
                compact ? 'h-4 w-4' : 'h-5 w-5'
              )}
              aria-hidden="true"
            />
            <span
              className="font-medium"
              aria-label={`${repository.stars} stars`}
            >
              {formatNumber(repository.stars)}
            </span>
          </div>
          <div
            className={cn(
              'flex items-center space-x-2 text-neutral-600 dark:text-neutral-400',
              compact ? 'text-sm' : 'text-base'
            )}
          >
            <CodeBracketIcon
              className={cn('flex-shrink-0', compact ? 'h-4 w-4' : 'h-5 w-5')}
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

      {/* Description - Enhanced typography with conditional spacing */}
      {repository.description && (
        <p
          className={cn(
            'text-neutral-700 dark:text-neutral-300 leading-relaxed',
            compact ? 'text-sm mb-3 line-clamp-2' : 'text-lg mb-8 line-clamp-3'
          )}
          aria-label="Repository description"
        >
          {repository.description}
        </p>
      )}

      {/* AI Summary - Flat design with typography-based organization */}
      {showSummary && (
        <div className={compact ? 'mb-3' : 'mb-8'}>
          {/* Summary Loading State */}
          {summaryState?.isLoading && (
            <Alert
              variant="info"
              title="Generating AI Summary..."
              className="mb-0"
            >
              <div className="flex items-center space-x-4 mt-4">
                <Spinner size="sm" color="info" />
                <div className="flex-1 space-y-3">
                  <div className="h-3 bg-accent-blue-200 dark:bg-accent-blue-800 animate-pulse"></div>
                  <div className="h-3 bg-accent-blue-200 dark:bg-accent-blue-800 animate-pulse w-3/4"></div>
                  <div className="h-3 bg-accent-blue-200 dark:bg-accent-blue-800 animate-pulse w-1/2"></div>
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

          {/* Summary Content - Clean typography-based presentation */}
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
                    className="text-base leading-relaxed"
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
                      className="mt-4 p-0 h-auto text-sm font-medium text-accent-blue-600 dark:text-accent-blue-400 hover:text-accent-blue-800 dark:hover:text-accent-blue-200"
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

          {/* No Summary Available - Minimal flat design */}
          {!repository.summary &&
            !summaryState?.isLoading &&
            !summaryState?.error && (
              <div className="py-6">
                <div className="flex items-center space-x-3 mb-4">
                  <EyeIcon className="h-5 w-5 text-neutral-400" />
                  <span className="text-base font-medium text-neutral-600 dark:text-neutral-400">
                    AI Summary
                  </span>
                </div>
                <p className="text-base text-neutral-600 dark:text-neutral-400 leading-relaxed">
                  No AI summary available for this repository yet.
                </p>
              </div>
            )}
        </div>
      )}

      {/* Footer - Typography-based separation with conditional spacing */}
      <div
        className={cn(
          'flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0',
          compact ? 'text-sm pt-3' : 'text-base pt-8'
        )}
      >
        <div
          className={cn(
            'flex items-center',
            compact ? 'space-x-4' : 'space-x-6'
          )}
        >
          {repository.language && (
            <div
              className={cn(
                'flex items-center',
                compact ? 'space-x-2' : 'space-x-3'
              )}
            >
              <div
                className={cn('flex-shrink-0', compact ? 'w-3 h-3' : 'w-4 h-4')}
                style={{
                  backgroundColor: getLanguageColor(repository.language),
                }}
                aria-hidden="true"
              />
              <span className="text-neutral-600 dark:text-neutral-400 font-medium">
                {repository.language}
              </span>
            </div>
          )}
        </div>
        <span
          className={cn(
            'text-neutral-500 dark:text-neutral-500 font-medium',
            compact ? 'text-xs' : 'text-sm sm:text-base'
          )}
        >
          Trending {formatDate(repository.trending_date)}
        </span>
      </div>
    </article>
  );
}
