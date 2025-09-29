'use client';

import React, { useState } from 'react';
import { StarIcon as StarIconSolid } from '@heroicons/react/24/solid';
import { CodeBracketIcon, EyeIcon } from '@heroicons/react/24/outline';
import { BaseComponentProps } from './types';
import { SummaryState } from './RepositoryCard';
import { VerticalFeedRepository } from '../../hooks/useVerticalFeedData';
import { cn } from './utils';
import { Button } from './Button';
import { Alert } from './Alert';
import { Spinner } from './Loading';

export interface RepositorySlideProps extends BaseComponentProps {
  repository: VerticalFeedRepository;
  isActive: boolean;
  isVisible: boolean;
  slideIndex: number;
  extensionMode?: 'popup' | 'newtab' | 'web';
  onAction?: (_action: string) => void;
  showSummary?: boolean;
  summaryState?: SummaryState;
}

export function RepositorySlide({
  repository,
  isActive,
  isVisible,
  slideIndex,
  extensionMode = 'web',
  onAction,
  showSummary = true,
  summaryState,
  className,
  ...props
}: RepositorySlideProps) {
  const [summaryExpanded, setSummaryExpanded] = useState(false);

  // Format numbers for display
  const formatNumber = (num: number): string => {
    if (num >= 1000000) {
      return `${(num / 1000000).toFixed(1)}M`;
    }
    if (num >= 1000) {
      return `${(num / 1000).toFixed(1)}k`;
    }
    return num.toString();
  };

  // Format date for display
  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  // Get language color
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

  // Handle action clicks
  const handleAction = (action: string) => {
    if (onAction) {
      onAction(action);
    }
  };

  // Handle visit GitHub
  const handleVisitGitHub = () => {
    window.open(repository.url, '_blank', 'noopener,noreferrer');
    handleAction('visit-github');
  };

  // Handle save repository
  const handleSaveRepository = () => {
    // This will be implemented when save functionality is added
    handleAction('save-repository');
  };

  // Handle share repository
  const handleShareRepository = () => {
    if (navigator.share) {
      navigator.share({
        title: repository.name,
        text:
          repository.description ||
          `Check out ${repository.name} by ${repository.author}`,
        url: repository.url,
      });
    } else {
      // Fallback to clipboard
      navigator.clipboard.writeText(repository.url);
    }
    handleAction('share-repository');
  };

  // Determine if summary should be truncated (using same logic as RepositoryCard)
  const shouldTruncateSummary = (text: string): boolean => {
    return text.length > 200;
  };

  // Get truncated summary (using same logic as RepositoryCard)
  const getTruncatedSummary = (text: string): string => {
    return text.length > 200 ? `${text.substring(0, 200)}...` : text;
  };

  // Get responsive classes based on extension mode - matches RepositoryCard patterns
  const getResponsiveClasses = () => {
    if (extensionMode === 'popup') {
      return {
        container: 'px-4 py-6',
        header: 'mb-4',
        title: 'text-xl sm:text-2xl',
        author: 'text-sm',
        stats: 'text-sm space-x-4',
        description: 'text-sm mb-4 line-clamp-3',
        summary: 'mb-4',
        actions: 'space-x-2',
        metadata: 'text-xs',
      };
    }

    if (extensionMode === 'newtab') {
      return {
        container: 'px-6 sm:px-8 py-6 sm:py-8',
        header: 'mb-6 sm:mb-8',
        title: 'text-2xl sm:text-3xl lg:text-4xl',
        author: 'text-base sm:text-lg',
        stats: 'text-base space-x-4 sm:space-x-6',
        description: 'text-base sm:text-lg mb-6 sm:mb-8 line-clamp-4',
        summary: 'mb-6 sm:mb-8',
        actions: 'space-x-3 sm:space-x-4',
        metadata: 'text-sm',
      };
    }

    // Web mode - full immersive experience
    return {
      container: 'px-6 sm:px-8 lg:px-12 py-8 sm:py-12',
      header: 'mb-8 sm:mb-12',
      title: 'text-3xl sm:text-4xl lg:text-5xl',
      author: 'text-lg sm:text-xl',
      stats: 'text-base sm:text-lg space-x-6 sm:space-x-8',
      description: 'text-lg sm:text-xl mb-8 sm:mb-12 line-clamp-5',
      summary: 'mb-8 sm:mb-12',
      actions: 'space-x-4 sm:space-x-6',
      metadata: 'text-sm sm:text-base',
    };
  };

  const responsive = getResponsiveClasses();

  return (
    <article
      className={cn(
        // Full viewport layout
        'w-full h-full',
        // Flex layout for content positioning
        'flex flex-col justify-center',
        // Clean background - flat design with no shadows
        'bg-neutral-white dark:bg-neutral-900',
        // Smooth transitions for interaction feedback
        'transition-opacity duration-300 ease-in-out',
        // Touch-friendly interaction
        'touch-manipulation',
        // Optimize for non-visible slides
        !isVisible && 'opacity-0 pointer-events-none',
        isVisible && 'opacity-100',
        className
      )}
      data-testid={`repository-slide-${repository.id}`}
      data-slide-index={slideIndex}
      data-active={isActive}
      data-visible={isVisible}
      data-extension-mode={extensionMode}
      role="article"
      aria-label={`Repository ${repository.name} by ${repository.author}`}
      aria-hidden={!isVisible}
      {...props}
    >
      <div className={cn('w-full max-w-4xl mx-auto', responsive.container)}>
        {/* Header - Repository name, author, and stats */}
        <header className={cn('text-center', responsive.header)}>
          {/* Repository name - Primary typography with link */}
          <h1
            className={cn(
              'font-bold text-neutral-900 dark:text-neutral-white leading-tight mb-3 sm:mb-4',
              responsive.title
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
                'focus:outline-none focus:ring-2 focus:ring-accent-blue-500 focus:ring-offset-2',
                'dark:focus:ring-offset-neutral-900 rounded-sm'
              )}
              aria-label={`Visit ${repository.name} repository on GitHub`}
              onClick={e => {
                if (extensionMode !== 'web') {
                  e.stopPropagation();
                }
                handleAction('visit-github-header');
              }}
            >
              {repository.name}
            </a>
          </h1>

          {/* Author - Secondary typography */}
          <p
            className={cn(
              'text-neutral-600 dark:text-neutral-400 font-medium mb-6 sm:mb-8 break-words',
              responsive.author
            )}
          >
            by {repository.author}
          </p>

          {/* Stats - Horizontal layout with icons and proper accessibility - matches RepositoryCard */}
          <div
            className={cn(
              'flex justify-center items-center flex-wrap',
              responsive.stats
            )}
          >
            {/* Stars */}
            <div className="flex items-center space-x-2 text-neutral-600 dark:text-neutral-400">
              <StarIconSolid
                className={cn(
                  'text-accent-amber-500 flex-shrink-0',
                  extensionMode === 'popup'
                    ? 'h-4 w-4'
                    : 'h-5 w-5 sm:h-6 sm:w-6'
                )}
                aria-hidden="true"
              />
              <span
                className="font-medium text-neutral-900 dark:text-neutral-white"
                aria-label={`${repository.stars} stars`}
              >
                {formatNumber(repository.stars)}
              </span>
            </div>

            {/* Forks */}
            <div className="flex items-center space-x-2 text-neutral-600 dark:text-neutral-400">
              <CodeBracketIcon
                className={cn(
                  'flex-shrink-0',
                  extensionMode === 'popup'
                    ? 'h-4 w-4'
                    : 'h-5 w-5 sm:h-6 sm:w-6'
                )}
                aria-hidden="true"
              />
              <span
                className="font-medium text-neutral-700 dark:text-neutral-300"
                aria-label={`${repository.forks} forks`}
              >
                {formatNumber(repository.forks)}
              </span>
            </div>

            {/* Language - matches RepositoryCard styling */}
            {repository.language && (
              <div className="flex items-center space-x-2">
                <div
                  className={cn(
                    'flex-shrink-0 rounded-full',
                    extensionMode === 'popup'
                      ? 'w-3 h-3'
                      : 'w-4 h-4 sm:w-5 sm:h-5'
                  )}
                  style={{
                    backgroundColor: getLanguageColor(repository.language),
                  }}
                  aria-hidden="true"
                />
                <span className="font-medium text-neutral-700 dark:text-neutral-300">
                  {repository.language}
                </span>
              </div>
            )}
          </div>
        </header>

        {/* Description - Enhanced typography with conditional spacing - matches RepositoryCard */}
        {repository.description && (
          <div className="text-center">
            <p
              className={cn(
                'text-neutral-700 dark:text-neutral-300 leading-relaxed max-w-3xl mx-auto',
                responsive.description
              )}
              aria-label="Repository description"
            >
              {repository.description}
            </p>
          </div>
        )}

        {/* AI Summary - Comprehensive content with loading/error states */}
        {showSummary && (
          <div
            className={cn('text-center max-w-4xl mx-auto', responsive.summary)}
          >
            {/* Summary Loading State */}
            {summaryState?.isLoading && (
              <Alert
                variant="info"
                title="Generating AI Summary..."
                className="mb-0 text-left"
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
                className="mb-0 text-left"
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
                  className="mb-0 text-left"
                  data-testid={`summary-content-${repository.id}`}
                >
                  <div
                    role="region"
                    aria-labelledby={`summary-${repository.id}`}
                  >
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
                  <div className="flex items-center justify-center space-x-3 mb-4">
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

        {/* Actions - Bottom center with consistent styling - matches design system */}
        <div
          className={cn('flex justify-center flex-wrap', responsive.actions)}
        >
          <Button
            onClick={handleVisitGitHub}
            size={extensionMode === 'popup' ? 'sm' : 'md'}
            className={cn(
              'bg-accent-blue-600 hover:bg-accent-blue-700 text-white font-medium',
              'transition-colors duration-200 touch-manipulation',
              'focus:outline-none focus:ring-2 focus:ring-accent-blue-500 focus:ring-offset-2',
              'dark:focus:ring-offset-neutral-900'
            )}
            aria-label={`Visit ${repository.name} on GitHub`}
          >
            View on GitHub
          </Button>

          <Button
            variant="outline"
            size={extensionMode === 'popup' ? 'sm' : 'md'}
            onClick={handleSaveRepository}
            className={cn(
              'border-neutral-300 dark:border-neutral-600 text-neutral-700 dark:text-neutral-300',
              'hover:bg-neutral-50 dark:hover:bg-neutral-800 font-medium',
              'transition-colors duration-200 touch-manipulation',
              'focus:outline-none focus:ring-2 focus:ring-neutral-500 focus:ring-offset-2',
              'dark:focus:ring-offset-neutral-900'
            )}
            aria-label={`Save ${repository.name} for later`}
          >
            Save
          </Button>

          <Button
            variant="ghost"
            size={extensionMode === 'popup' ? 'sm' : 'md'}
            onClick={handleShareRepository}
            className={cn(
              'text-neutral-600 dark:text-neutral-400 hover:text-neutral-800 dark:hover:text-neutral-200',
              'font-medium transition-colors duration-200 touch-manipulation',
              'focus:outline-none focus:ring-2 focus:ring-neutral-500 focus:ring-offset-2',
              'dark:focus:ring-offset-neutral-900'
            )}
            aria-label={`Share ${repository.name}`}
          >
            Share
          </Button>
        </div>

        {/* Metadata - Typography-based separation with conditional spacing */}
        <footer
          className={cn(
            'text-center',
            extensionMode === 'popup' ? 'mt-4' : 'mt-8 sm:mt-12'
          )}
        >
          <p
            className={cn(
              'text-neutral-500 dark:text-neutral-500 font-medium',
              responsive.metadata
            )}
          >
            Trending {formatDate(repository.trending_date)}
          </p>
        </footer>
      </div>
    </article>
  );
}
