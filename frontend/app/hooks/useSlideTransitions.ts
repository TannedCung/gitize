'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

export interface SlideTransitionOptions {
  totalSlides: number;
  currentIndex: number;
  transitionDuration?: number;
  enablePerformanceMode?: boolean;
  enableReducedMotion?: boolean;
  preloadDistance?: number;
}

export interface SlideState {
  index: number;
  position: 'active' | 'next' | 'previous' | 'hidden';
  offset: string;
  isVisible: boolean;
  isPreloaded: boolean;
  zIndex: number;
}

export interface TransitionState {
  isTransitioning: boolean;
  direction: 'up' | 'down' | null;
  fromIndex: number;
  toIndex: number;
  progress: number;
}

export function useSlideTransitions({
  totalSlides,
  currentIndex,
  transitionDuration = 400,
  enablePerformanceMode = false,
  enableReducedMotion = false,
  preloadDistance = 2,
}: SlideTransitionOptions) {
  const [transitionState, setTransitionState] = useState<TransitionState>({
    isTransitioning: false,
    direction: null,
    fromIndex: 0,
    toIndex: 0,
    progress: 0,
  });

  const previousIndexRef = useRef(currentIndex);
  const transitionTimeoutRef = useRef<NodeJS.Timeout>();

  // Calculate slide states based on current index
  const calculateSlideStates = useCallback((): SlideState[] => {
    const slides: SlideState[] = [];

    for (let i = 0; i < totalSlides; i++) {
      const distance = i - currentIndex;
      let position: SlideState['position'];
      let offset: string;
      let zIndex: number;
      let isVisible: boolean;
      let isPreloaded: boolean;

      // Determine position relative to current slide
      if (distance === 0) {
        position = 'active';
        offset = '0vh';
        zIndex = 10;
        isVisible = true;
      } else if (distance === 1) {
        position = 'next';
        offset = '100vh';
        zIndex = 5;
        isVisible = false;
      } else if (distance === -1) {
        position = 'previous';
        offset = '-100vh';
        zIndex = 5;
        isVisible = false;
      } else {
        position = 'hidden';
        offset = distance > 0 ? '200vh' : '-200vh';
        zIndex = 1;
        isVisible = false;
      }

      // Determine if slide should be preloaded
      isPreloaded = Math.abs(distance) <= preloadDistance;

      slides.push({
        index: i,
        position,
        offset,
        isVisible,
        isPreloaded,
        zIndex,
      });
    }

    return slides;
  }, [currentIndex, totalSlides, preloadDistance]);

  const [slideStates, setSlideStates] =
    useState<SlideState[]>(calculateSlideStates);

  // Update slide states when current index changes
  useEffect(() => {
    const newSlideStates = calculateSlideStates();
    setSlideStates(newSlideStates);

    // Detect transition direction
    const direction = currentIndex > previousIndexRef.current ? 'down' : 'up';

    // Start transition
    if (currentIndex !== previousIndexRef.current) {
      setTransitionState({
        isTransitioning: true,
        direction,
        fromIndex: previousIndexRef.current,
        toIndex: currentIndex,
        progress: 0,
      });

      // Clear existing timeout
      if (transitionTimeoutRef.current) {
        clearTimeout(transitionTimeoutRef.current);
      }

      // End transition after duration
      const duration = enableReducedMotion ? 10 : transitionDuration;
      transitionTimeoutRef.current = setTimeout(() => {
        setTransitionState(prev => ({
          ...prev,
          isTransitioning: false,
          progress: 1,
        }));
      }, duration);
    }

    previousIndexRef.current = currentIndex;
  }, [
    currentIndex,
    calculateSlideStates,
    transitionDuration,
    enableReducedMotion,
  ]);

  // Get CSS classes for a specific slide
  const getSlideClasses = useCallback(
    (slideIndex: number): string => {
      const slide = slideStates.find(s => s.index === slideIndex);
      if (!slide) return '';

      const classes = ['repository-slide'];

      // Position classes
      classes.push(`slide-${slide.position}`);

      // Transition classes
      if (transitionState.isTransitioning) {
        classes.push('transitioning');
        if (transitionState.direction) {
          classes.push(`transitioning-${transitionState.direction}`);
        }
      }

      // Performance mode
      if (enablePerformanceMode) {
        classes.push('optimized');
      }

      // Loading states
      if (!slide.isPreloaded) {
        classes.push('loading');
      } else {
        classes.push('loaded');
      }

      // Snap behavior
      classes.push('snap-to-viewport');

      return classes.join(' ');
    },
    [slideStates, transitionState, enablePerformanceMode]
  );

  // Get CSS custom properties for a specific slide
  const getSlideStyles = useCallback(
    (slideIndex: number): React.CSSProperties => {
      const slide = slideStates.find(s => s.index === slideIndex);
      if (!slide) return {};

      const styles: React.CSSProperties & { [key: string]: any } = {
        '--slide-offset': slide.offset,
        zIndex: slide.zIndex,
      };

      // Performance optimizations
      if (enablePerformanceMode) {
        styles.transform = `translate3d(0, ${slide.offset}, 0)`;
        styles.willChange = 'transform';
      }

      // Reduced motion
      if (enableReducedMotion) {
        styles.transitionDuration = '0.01ms';
        styles.transitionTimingFunction = 'linear';
      }

      return styles;
    },
    [slideStates, enablePerformanceMode, enableReducedMotion]
  );

  // Get viewport classes
  const getViewportClasses = useCallback((): string => {
    const classes = ['vertical-feed-viewport'];

    if (transitionState.isTransitioning) {
      classes.push('feed-transitioning');
      if (transitionState.direction) {
        classes.push(`feed-transitioning-${transitionState.direction}`);
      }
    }

    if (enablePerformanceMode) {
      classes.push('feed-performance-mode');
    }

    return classes.join(' ');
  }, [transitionState, enablePerformanceMode]);

  // Get viewport styles
  const getViewportStyles = useCallback((): React.CSSProperties => {
    const styles: React.CSSProperties = {};

    if (enableReducedMotion) {
      styles.scrollBehavior = 'auto';
    }

    return styles;
  }, [enableReducedMotion]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (transitionTimeoutRef.current) {
        clearTimeout(transitionTimeoutRef.current);
      }
    };
  }, []);

  return {
    // State
    slideStates,
    transitionState,

    // Utilities
    getSlideClasses,
    getSlideStyles,
    getViewportClasses,
    getViewportStyles,

    // Helpers
    isSlideVisible: (slideIndex: number) => {
      const slide = slideStates.find(s => s.index === slideIndex);
      return slide?.isVisible ?? false;
    },

    isSlidePreloaded: (slideIndex: number) => {
      const slide = slideStates.find(s => s.index === slideIndex);
      return slide?.isPreloaded ?? false;
    },

    getSlidePosition: (slideIndex: number) => {
      const slide = slideStates.find(s => s.index === slideIndex);
      return slide?.position ?? 'hidden';
    },
  };
}
