'use client';

import React, {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  useCallback,
} from 'react';

import { RepositorySlide } from './RepositorySlide';
import { cn } from './utils';
import {
  useVerticalFeedData,
  VerticalFeedRepository,
  UseVerticalFeedDataOptions,
} from '../../hooks/useVerticalFeedData';
import {
  useInfiniteScroll,
  useInfiniteScrollUI,
  useInfiniteScrollPerformance,
} from '../../hooks/useInfiniteScroll';

// Feed State Interface
interface FeedState {
  currentIndex: number;
  repositories: VerticalFeedRepository[];
  isLoading: boolean;
  isLoadingMore: boolean;
  hasMore: boolean;
  isTransitioning: boolean;
  viewportHeight: number;
  viewportWidth: number;
  scrollDirection: 'up' | 'down' | null;
  previousIndex: number;
  error: string | null;
  totalCount: number;
}

// Feed Actions Interface
interface FeedActions {
  navigateToIndex: (_index: number) => void;
  navigateNext: () => void;
  navigatePrevious: () => void;
  loadMore: () => void;
  refresh: () => void;
  retry: () => void;
  updateViewportDimensions: () => void;
}

// Feed Context
interface FeedContextValue {
  state: FeedState;
  actions: FeedActions;
  infiniteScrollUI: ReturnType<typeof useInfiniteScrollUI>;
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
  dataOptions?: UseVerticalFeedDataOptions;
}

function FeedProvider({ children, dataOptions = {} }: FeedProviderProps) {
  // Use the data hook for repository management
  const feedData = useVerticalFeedData(dataOptions);

  // Infinite scroll management
  const infiniteScroll = useInfiniteScroll({
    threshold: dataOptions.preloadThreshold || 3,
    enabled: dataOptions.enablePreloading !== false,
    hasMore: feedData.hasMore,
    isLoading: feedData.isLoadingMore,
    onLoadMore: feedData.actions.loadMore,
  });

  // Infinite scroll UI management
  const infiniteScrollUI = useInfiniteScrollUI();

  // Performance tracking
  const infiniteScrollPerf = useInfiniteScrollPerformance();

  // Track loading performance
  useEffect(() => {
    if (feedData.isLoadingMore) {
      infiniteScrollPerf.startLoadTimer();
    } else {
      const loadTime = infiniteScrollPerf.endLoadTimer();
      if (loadTime > 0) {
        console.debug(`Loaded batch in ${loadTime}ms`);
      }
    }
  }, [feedData.isLoadingMore, infiniteScrollPerf]);

  const [localState, setLocalState] = useState({
    currentIndex: 0,
    isTransitioning: false,
    viewportHeight: typeof window !== 'undefined' ? window.innerHeight : 800,
    viewportWidth: typeof window !== 'undefined' ? window.innerWidth : 1200,
    scrollDirection: null as 'up' | 'down' | null,
    previousIndex: 0,
  });

  // Combine data state with local UI state
  const state: FeedState = {
    ...localState,
    repositories: feedData.repositories,
    isLoading: feedData.isLoading,
    isLoadingMore: feedData.isLoadingMore,
    hasMore: feedData.hasMore,
    error: feedData.error,
    totalCount: feedData.totalCount,
  };

  // Update viewport dimensions with debouncing
  const updateViewportDimensions = useCallback(() => {
    if (typeof window !== 'undefined') {
      setLocalState(prev => ({
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

  // Navigation functions
  const navigateToIndex = useCallback(
    (_index: number) => {
      if (
        _index < 0 ||
        _index >= state.repositories.length ||
        localState.isTransitioning
      ) {
        return;
      }

      const direction = _index > localState.currentIndex ? 'down' : 'up';

      setLocalState(prev => ({
        ...prev,
        isTransitioning: true,
        scrollDirection: direction,
        previousIndex: prev.currentIndex,
      }));

      // Use requestAnimationFrame for smooth transitions
      requestAnimationFrame(() => {
        setLocalState(prev => ({
          ...prev,
          currentIndex: _index,
        }));

        // Clear transition state after animation completes
        setTimeout(() => {
          setLocalState(prev => ({
            ...prev,
            isTransitioning: false,
            scrollDirection: null,
          }));
        }, 400); // Match CSS transition duration
      });

      // Trigger infinite loading when approaching end
      infiniteScroll.triggerLoadMore(_index, state.repositories.length);
    },
    [
      state.repositories.length,
      localState.currentIndex,
      localState.isTransitioning,
      infiniteScroll,
    ]
  );

  const navigateNext = useCallback(() => {
    const nextIndex = localState.currentIndex + 1;
    if (nextIndex < state.repositories.length) {
      navigateToIndex(nextIndex);
    }
  }, [localState.currentIndex, state.repositories.length, navigateToIndex]);

  const navigatePrevious = useCallback(() => {
    const prevIndex = localState.currentIndex - 1;
    if (prevIndex >= 0) {
      navigateToIndex(prevIndex);
    }
  }, [localState.currentIndex, navigateToIndex]);

  const actions: FeedActions = {
    navigateToIndex,
    navigateNext,
    navigatePrevious,
    loadMore: feedData.actions.loadMore,
    refresh: feedData.actions.refresh,
    retry: feedData.actions.retry,
    updateViewportDimensions,
  };

  const contextValue: FeedContextValue = {
    state,
    actions,
    infiniteScrollUI,
  };

  return (
    <FeedContext.Provider value={contextValue}>{children}</FeedContext.Provider>
  );
}

// Slide Container Component - handles positioning and transitions
interface SlideContainerProps {
  children: React.ReactNode;
  slideIndex: number;
  currentIndex: number;
  viewportHeight: number;
  isTransitioning: boolean;
  isVisible: boolean;
}

function SlideContainer({
  children,
  slideIndex,
  currentIndex,
  viewportHeight,
  isTransitioning,
  isVisible,
}: SlideContainerProps) {
  // Calculate transform offset based on current index
  const offset = (slideIndex - currentIndex) * viewportHeight;

  // Determine if slide should be rendered (for performance)
  const shouldRender = Math.abs(slideIndex - currentIndex) <= 2;

  if (!shouldRender) {
    return (
      <div
        className="absolute top-0 left-0 w-full h-full"
        style={{
          height: `${viewportHeight}px`,
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
        'bg-neutral-white dark:bg-neutral-900',
        // Optimize rendering for non-visible slides
        !isVisible && 'pointer-events-none'
      )}
      style={{
        height: `${viewportHeight}px`,
        transform: `translateY(${offset}px)`,
        willChange: isTransitioning ? 'transform' : 'auto',
      }}
      data-slide-index={slideIndex}
      data-active={slideIndex === currentIndex}
    >
      {children}
    </div>
  );
}

// Feed Viewport Component
interface FeedViewportProps {
  className?: string;
  extensionMode?: 'popup' | 'newtab' | 'web';
}

function FeedViewport({ className, extensionMode = 'web' }: FeedViewportProps) {
  const { state, actions, infiniteScrollUI } = useFeedContext();
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
          <SlideContainer
            key={`${repository.id}-${index}`}
            slideIndex={index}
            currentIndex={state.currentIndex}
            viewportHeight={state.viewportHeight}
            isTransitioning={state.isTransitioning}
            isVisible={isVisible}
          >
            <RepositorySlide
              repository={repository}
              isActive={isActive}
              isVisible={isVisible}
              slideIndex={index}
              extensionMode={extensionMode}
            />
          </SlideContainer>
        );
      })}

      {/* Loading indicator for initial load */}
      {state.isLoading && (
        <div
          className="absolute inset-0 flex items-center justify-center bg-neutral-white/80 dark:bg-neutral-900/80 z-50"
          role="status"
          aria-label="Loading repositories"
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

      {/* Loading more indicator with smooth transitions */}
      {infiniteScrollUI.shouldShowLoadingIndicator(
        state.isLoadingMore && !state.isLoading
      ) && (
        <div
          className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-neutral-white/90 dark:bg-neutral-900/90 px-4 py-2 rounded-full shadow-lg z-40 transition-opacity duration-300"
          role="status"
          aria-label="Loading more repositories"
        >
          <div className="flex items-center space-x-2">
            <div
              className="animate-spin rounded-full h-4 w-4 border-b-2 border-accent-blue-600"
              aria-hidden="true"
            />
            <p className="text-sm text-neutral-600 dark:text-neutral-400">
              Loading more...
            </p>
          </div>
        </div>
      )}

      {/* Progress indicator - shows current position and loading status */}
      {state.repositories.length > 0 && !state.isLoading && (
        <div
          className="absolute top-4 right-4 bg-neutral-white/90 dark:bg-neutral-900/90 px-3 py-1 rounded-full shadow-sm z-30 transition-opacity duration-300"
          role="status"
          aria-label={`Repository ${state.currentIndex + 1} of ${state.hasMore ? `${state.repositories.length}+` : state.repositories.length}`}
        >
          <p className="text-xs text-neutral-600 dark:text-neutral-400 font-medium">
            {state.currentIndex + 1} /{' '}
            {state.hasMore
              ? `${state.repositories.length}+`
              : state.repositories.length}
          </p>
        </div>
      )}

      {/* End of content indicator */}
      {!state.hasMore &&
        !state.isLoading &&
        !state.isLoadingMore &&
        state.repositories.length > 0 &&
        state.currentIndex === state.repositories.length - 1 && (
          <div
            className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-neutral-white/90 dark:bg-neutral-900/90 px-4 py-2 rounded-full shadow-lg z-40"
            role="status"
            aria-label="End of repositories"
          >
            <div className="flex items-center space-x-2">
              <div
                className="w-2 h-2 bg-neutral-400 rounded-full"
                aria-hidden="true"
              />
              <p className="text-sm text-neutral-600 dark:text-neutral-400">
                You've reached the end
              </p>
            </div>
          </div>
        )}

      {/* Error state */}
      {state.error && !state.isLoading && (
        <div
          className="absolute inset-0 flex items-center justify-center"
          role="alert"
          aria-label="Error loading repositories"
        >
          <div className="text-center max-w-md mx-auto px-4">
            <p className="text-xl text-red-600 dark:text-red-400 mb-4">
              Failed to load repositories
            </p>
            <p className="text-neutral-600 dark:text-neutral-400 mb-6">
              {state.error}
            </p>
            <button
              onClick={() => actions.retry()}
              className="px-6 py-2 bg-accent-blue-600 text-white rounded-lg hover:bg-accent-blue-700 transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
      )}

      {/* Empty state */}
      {!state.isLoading && !state.error && state.repositories.length === 0 && (
        <div
          className="absolute inset-0 flex items-center justify-center"
          role="status"
          aria-label="No repositories available"
        >
          <div className="text-center">
            <p className="text-xl text-neutral-600 dark:text-neutral-400 mb-4">
              No repositories found
            </p>
            <p className="text-neutral-500 dark:text-neutral-500 mb-6">
              Try refreshing or check back later
            </p>
            <button
              onClick={() => actions.refresh()}
              className="px-6 py-2 bg-accent-blue-600 text-white rounded-lg hover:bg-accent-blue-700 transition-colors"
            >
              Refresh
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// Main VerticalFeed Component
export interface VerticalFeedProps {
  className?: string;
  extensionMode?: 'popup' | 'newtab' | 'web';
  dataOptions?: UseVerticalFeedDataOptions;
}

export function VerticalFeed({
  className,
  extensionMode = 'web',
  dataOptions = {},
}: VerticalFeedProps) {
  return (
    <FeedProvider dataOptions={dataOptions}>
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
