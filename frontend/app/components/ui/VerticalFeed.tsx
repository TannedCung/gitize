'use client';

import React, {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  useCallback,
} from 'react';
import { Repository } from './RepositoryCard';
import { cn } from './utils';

// Feed State Interface
interface FeedState {
  currentIndex: number;
  repositories: Repository[];
  isLoading: boolean;
  hasMore: boolean;
  isTransitioning: boolean;
  viewportHeight: number;
  viewportWidth: number;
  scrollDirection: 'up' | 'down' | null;
  previousIndex: number;
}

// Feed Actions Interface
interface FeedActions {
  navigateToIndex: (_index: number) => void;
  navigateNext: () => void;
  navigatePrevious: () => void;
  setRepositories: (_repositories: Repository[]) => void;
  setLoading: (_loading: boolean) => void;
  setHasMore: (_hasMore: boolean) => void;
  updateViewportDimensions: () => void;
}

// Feed Context
interface FeedContextValue {
  state: FeedState;
  actions: FeedActions;
}

const FeedContext = createContext<FeedContextValue | null>(null);

// Custom hook to use feed context
export function useFeedContext() {
  const context = useContext(FeedContext);
  if (!context) {
    throw new Error('useFeedContext must be used within a FeedProvider');
  }
  return context;
}

// Feed Provider Component
interface FeedProviderProps {
  children: React.ReactNode;
  initialRepositories?: Repository[];
}

function FeedProvider({
  children,
  initialRepositories = [],
}: FeedProviderProps) {
  const [state, setState] = useState<FeedState>({
    currentIndex: 0,
    repositories: initialRepositories,
    isLoading: false,
    hasMore: true,
    isTransitioning: false,
    viewportHeight: typeof window !== 'undefined' ? window.innerHeight : 800,
    viewportWidth: typeof window !== 'undefined' ? window.innerWidth : 1200,
    scrollDirection: null,
    previousIndex: 0,
  });

  // Update viewport dimensions with debouncing
  const updateViewportDimensions = useCallback(() => {
    if (typeof window !== 'undefined') {
      setState(prev => ({
        ...prev,
        viewportHeight: window.innerHeight,
        viewportWidth: window.innerWidth,
      }));
    }
  }, []);

  useEffect(() => {
    let resizeTimeout: NodeJS.Timeout;

    const handleResize = () => {
      // Debounce resize events for better performance
      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(updateViewportDimensions, 100);
    };

    // Initial viewport setup
    updateViewportDimensions();

    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
      clearTimeout(resizeTimeout);
    };
  }, [updateViewportDimensions]);

  const actions: FeedActions = {
    navigateToIndex: useCallback(
      (_index: number) => {
        if (
          _index < 0 ||
          _index >= state.repositories.length ||
          state.isTransitioning
        ) {
          return;
        }

        const direction = _index > state.currentIndex ? 'down' : 'up';

        setState(prev => ({
          ...prev,
          isTransitioning: true,
          scrollDirection: direction,
          previousIndex: prev.currentIndex,
        }));

        // Use requestAnimationFrame for smooth transitions
        requestAnimationFrame(() => {
          setState(prev => ({
            ...prev,
            currentIndex: _index,
          }));

          // Clear transition state after animation completes
          setTimeout(() => {
            setState(prev => ({
              ...prev,
              isTransitioning: false,
              scrollDirection: null,
            }));
          }, 400); // Match CSS transition duration
        });
      },
      [state.repositories.length, state.currentIndex, state.isTransitioning]
    ),

    navigateNext: useCallback(() => {
      // Will be implemented in navigation task
    }, []),

    navigatePrevious: useCallback(() => {
      // Will be implemented in navigation task
    }, []),

    setRepositories: useCallback((_repositories: Repository[]) => {
      setState(prev => ({ ...prev, repositories: _repositories }));
    }, []),

    setLoading: useCallback((_loading: boolean) => {
      setState(prev => ({ ...prev, isLoading: _loading }));
    }, []),

    setHasMore: useCallback((_hasMore: boolean) => {
      setState(prev => ({ ...prev, hasMore: _hasMore }));
    }, []),

    updateViewportDimensions,
  };

  const contextValue: FeedContextValue = {
    state,
    actions,
  };

  return (
    <FeedContext.Provider value={contextValue}>{children}</FeedContext.Provider>
  );
}

// Repository Slide Component
interface RepositorySlideProps {
  repository: Repository;
  isActive: boolean;
  isVisible: boolean;
  slideIndex: number;
  className?: string;
  extensionMode?: 'popup' | 'newtab' | 'web';
}

function RepositorySlide({
  repository,
  isActive,
  isVisible,
  slideIndex,
  className,
  extensionMode = 'web',
}: RepositorySlideProps) {
  const { state } = useFeedContext();

  // Calculate transform offset based on current index
  const offset = (slideIndex - state.currentIndex) * state.viewportHeight;

  // Determine if slide should be rendered (for performance)
  const shouldRender = Math.abs(slideIndex - state.currentIndex) <= 2;

  if (!shouldRender) {
    return (
      <div
        className="absolute top-0 left-0 w-full h-full"
        style={{
          height: `${state.viewportHeight}px`,
          transform: `translateY(${offset}px)`,
        }}
        data-slide-index={slideIndex}
        data-active={false}
        aria-hidden="true"
      />
    );
  }

  return (
    <div
      className={cn(
        'absolute top-0 left-0 w-full',
        'transition-transform duration-400 ease-out',
        'flex items-center justify-center',
        'bg-neutral-white dark:bg-neutral-900',
        // Optimize rendering for non-visible slides
        !isVisible && 'pointer-events-none',
        className
      )}
      style={{
        height: `${state.viewportHeight}px`,
        transform: `translateY(${offset}px)`,
        willChange: state.isTransitioning ? 'transform' : 'auto',
      }}
      data-slide-index={slideIndex}
      data-active={isActive}
      data-visible={isVisible}
      data-extension-mode={extensionMode}
      role="article"
      aria-label={`Repository ${repository.name} by ${repository.author}`}
      aria-hidden={!isVisible}
    >
      <div className="w-full max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-neutral-white dark:bg-neutral-900 rounded-lg p-8">
          {/* Repository Header */}
          <div className="text-center mb-8">
            <h2 className="text-3xl sm:text-4xl font-bold text-neutral-900 dark:text-neutral-white mb-4">
              {repository.name}
            </h2>
            <p className="text-lg text-neutral-600 dark:text-neutral-400">
              by {repository.author}
            </p>
          </div>

          {/* Repository Stats */}
          <div className="flex justify-center space-x-8 mb-8">
            <div className="text-center">
              <div className="text-2xl font-bold text-accent-amber-500">
                {repository.stars.toLocaleString()}
              </div>
              <div className="text-sm text-neutral-600 dark:text-neutral-400">
                Stars
              </div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-neutral-700 dark:text-neutral-300">
                {repository.forks.toLocaleString()}
              </div>
              <div className="text-sm text-neutral-600 dark:text-neutral-400">
                Forks
              </div>
            </div>
            {repository.language && (
              <div className="text-center">
                <div className="text-2xl font-bold text-accent-blue-500">
                  {repository.language}
                </div>
                <div className="text-sm text-neutral-600 dark:text-neutral-400">
                  Language
                </div>
              </div>
            )}
          </div>

          {/* Repository Description */}
          {repository.description && (
            <div className="text-center mb-8">
              <p className="text-lg text-neutral-700 dark:text-neutral-300 leading-relaxed max-w-2xl mx-auto">
                {repository.description}
              </p>
            </div>
          )}

          {/* Repository Summary */}
          {repository.summary && (
            <div className="text-center mb-8">
              <h3 className="text-xl font-semibold text-neutral-900 dark:text-neutral-white mb-4">
                AI Summary
              </h3>
              <p className="text-base text-neutral-700 dark:text-neutral-300 leading-relaxed max-w-3xl mx-auto">
                {repository.summary}
              </p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex justify-center space-x-4">
            <a
              href={repository.url}
              target="_blank"
              rel="noopener noreferrer"
              className={cn(
                'px-6 py-3 bg-accent-blue-600 hover:bg-accent-blue-700',
                'text-white font-medium rounded-lg',
                'transition-colors duration-200',
                'focus:outline-none focus:ring-2 focus:ring-accent-blue-500 focus:ring-offset-2'
              )}
            >
              View on GitHub
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

// Feed Viewport Component
interface FeedViewportProps {
  className?: string;
  extensionMode?: 'popup' | 'newtab' | 'web';
}

function FeedViewport({ className, extensionMode = 'web' }: FeedViewportProps) {
  const { state } = useFeedContext();
  const viewportRef = useRef<HTMLDivElement>(null);

  // Optimize viewport for different modes
  const getViewportStyles = () => {
    const baseStyles = {
      height: `${state.viewportHeight}px`,
      width: '100%',
    };

    if (extensionMode === 'popup') {
      return {
        ...baseStyles,
        height: '600px', // Fixed height for popup mode
        maxHeight: '600px',
      };
    }

    return baseStyles;
  };

  return (
    <div
      ref={viewportRef}
      className={cn(
        'relative w-full overflow-hidden',
        'bg-neutral-white dark:bg-neutral-900',
        // Ensure proper stacking context for slides
        'isolate',
        className
      )}
      style={getViewportStyles()}
      data-testid="feed-viewport"
      data-extension-mode={extensionMode}
      role="main"
      aria-label="Repository feed"
      aria-live="polite"
      aria-atomic="false"
    >
      {state.repositories.map((repository, index) => {
        const isActive = index === state.currentIndex;
        const isVisible = Math.abs(index - state.currentIndex) <= 1;

        return (
          <RepositorySlide
            key={`${repository.id}-${index}`}
            repository={repository}
            isActive={isActive}
            isVisible={isVisible}
            slideIndex={index}
            extensionMode={extensionMode}
          />
        );
      })}

      {/* Loading indicator */}
      {state.isLoading && (
        <div
          className="absolute inset-0 flex items-center justify-center bg-neutral-white/80 dark:bg-neutral-900/80 z-50"
          role="status"
          aria-label="Loading more repositories"
        >
          <div className="text-center">
            <div
              className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent-blue-600 mx-auto mb-4"
              aria-hidden="true"
            />
            <p className="text-neutral-600 dark:text-neutral-400">
              Loading repositories...
            </p>
          </div>
        </div>
      )}

      {/* Empty state */}
      {!state.isLoading && state.repositories.length === 0 && (
        <div
          className="absolute inset-0 flex items-center justify-center"
          role="status"
          aria-label="No repositories available"
        >
          <div className="text-center">
            <p className="text-xl text-neutral-600 dark:text-neutral-400 mb-4">
              No repositories found
            </p>
            <p className="text-neutral-500 dark:text-neutral-500">
              Try refreshing or check back later
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

// Main VerticalFeed Component
export interface VerticalFeedProps {
  repositories?: Repository[];
  onLoadMore?: () => void;
  className?: string;
  extensionMode?: 'popup' | 'newtab' | 'web';
}

export function VerticalFeed({
  repositories = [],
  onLoadMore: _onLoadMore,
  className,
  extensionMode = 'web',
}: VerticalFeedProps) {
  return (
    <FeedProvider initialRepositories={repositories}>
      <div
        className={cn(
          'w-full h-screen',
          'bg-neutral-white dark:bg-neutral-900',
          className
        )}
        data-extension-mode={extensionMode}
        data-testid="vertical-feed"
      >
        <FeedViewport extensionMode={extensionMode} />
      </div>
    </FeedProvider>
  );
}

// useFeedContext is already exported above, no need to export again
