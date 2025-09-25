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
import { RepositorySlide } from './RepositorySlide';
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
