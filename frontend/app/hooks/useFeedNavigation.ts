'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

export interface NavigationEvent {
  type: 'wheel' | 'touch' | 'keyboard' | 'programmatic';
  direction: 'up' | 'down';
  velocity?: number;
  deltaY?: number;
  targetIndex?: number;
  timestamp: number;
  preventDefault: boolean;
}

export interface UseFeedNavigationOptions {
  totalSlides: number;
  onNavigate: (_index: number) => void;
  enableKeyboard?: boolean;
  enableTouch?: boolean;
  enableWheel?: boolean;
  scrollThreshold?: number;
  debounceMs?: number;
  touchThreshold?: number;
  velocityThreshold?: number;
}

export interface FeedNavigationState {
  currentIndex: number;
  isTransitioning: boolean;
  scrollDirection: 'up' | 'down' | null;
  touchStartY: number;
  scrollVelocity: number;
  lastInteraction: Date;
  isUserScrolling: boolean;
}

export function useFeedNavigation({
  totalSlides,
  onNavigate,
  enableKeyboard = true,
  enableTouch = true,
  enableWheel = true,
  scrollThreshold = 50,
  debounceMs = 150,
  touchThreshold = 50,
  velocityThreshold = 0.5,
}: UseFeedNavigationOptions) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [scrollDirection, setScrollDirection] = useState<'up' | 'down' | null>(
    null
  );
  const [touchStartY, setTouchStartY] = useState(0);
  const [scrollVelocity, setScrollVelocity] = useState(0);
  const [lastInteraction, setLastInteraction] = useState(new Date());
  const [isUserScrolling, setIsUserScrolling] = useState(false);

  // Refs for debouncing and state management
  const debounceTimeoutRef = useRef<NodeJS.Timeout>();
  const lastScrollTimeRef = useRef<number>(0);
  const accumulatedDeltaRef = useRef<number>(0);
  const touchStartTimeRef = useRef<number>(0);
  const lastTouchYRef = useRef<number>(0);
  const velocityHistoryRef = useRef<number[]>([]);

  // Navigation state object
  const navigationState: FeedNavigationState = {
    currentIndex,
    isTransitioning,
    scrollDirection,
    touchStartY,
    scrollVelocity,
    lastInteraction,
    isUserScrolling,
  };

  // Bounds checking utility
  const isValidIndex = useCallback(
    (_index: number): boolean => {
      return _index >= 0 && _index < totalSlides;
    },
    [totalSlides]
  );

  // Navigate to specific index with bounds checking
  const navigateToIndex = useCallback(
    (index: number) => {
      if (!isValidIndex(index) || isTransitioning || index === currentIndex) {
        return;
      }

      setIsTransitioning(true);
      setCurrentIndex(index);
      setLastInteraction(new Date());
      onNavigate(index);

      // Reset transition state after animation completes
      setTimeout(() => {
        setIsTransitioning(false);
      }, 400); // Match CSS transition duration
    },
    [currentIndex, isTransitioning, isValidIndex, onNavigate]
  );

  // Navigate to next slide
  const navigateNext = useCallback(() => {
    const nextIndex = Math.min(currentIndex + 1, totalSlides - 1);
    if (nextIndex !== currentIndex) {
      setScrollDirection('down');
      navigateToIndex(nextIndex);
    }
  }, [currentIndex, totalSlides, navigateToIndex]);

  // Navigate to previous slide
  const navigatePrevious = useCallback(() => {
    const prevIndex = Math.max(currentIndex - 1, 0);
    if (prevIndex !== currentIndex) {
      setScrollDirection('up');
      navigateToIndex(prevIndex);
    }
  }, [currentIndex, navigateToIndex]);

  // Debounced navigation handler
  const debouncedNavigate = useCallback(
    (direction: 'up' | 'down') => {
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }

      debounceTimeoutRef.current = setTimeout(() => {
        if (direction === 'down') {
          navigateNext();
        } else {
          navigatePrevious();
        }
      }, debounceMs);
    },
    [navigateNext, navigatePrevious, debounceMs]
  );

  // Calculate velocity from delta history
  const calculateVelocity = useCallback((deltaY: number): number => {
    const now = Date.now();
    const timeDelta = now - lastScrollTimeRef.current;

    if (timeDelta === 0) return 0;

    const velocity = Math.abs(deltaY) / timeDelta;

    // Keep velocity history for smoothing
    velocityHistoryRef.current.push(velocity);
    if (velocityHistoryRef.current.length > 5) {
      velocityHistoryRef.current.shift();
    }

    // Return average velocity
    const avgVelocity =
      velocityHistoryRef.current.reduce((sum, v) => sum + v, 0) /
      velocityHistoryRef.current.length;
    setScrollVelocity(avgVelocity);

    return avgVelocity;
  }, []);

  // Wheel event handler with threshold detection
  const handleWheel = useCallback(
    (event: WheelEvent) => {
      if (!enableWheel || isTransitioning) return;

      event.preventDefault();
      setIsUserScrolling(true);

      const now = Date.now();
      const deltaY = event.deltaY;
      const velocity = calculateVelocity(deltaY);

      // Accumulate delta for threshold detection
      accumulatedDeltaRef.current += deltaY;
      lastScrollTimeRef.current = now;

      // Check if we've crossed the threshold
      if (
        Math.abs(accumulatedDeltaRef.current) >= scrollThreshold ||
        velocity > velocityThreshold
      ) {
        const direction = accumulatedDeltaRef.current > 0 ? 'down' : 'up';

        // Reset accumulated delta
        accumulatedDeltaRef.current = 0;

        // Trigger debounced navigation
        debouncedNavigate(direction);
      }

      // Reset user scrolling state after a delay
      setTimeout(() => {
        setIsUserScrolling(false);
      }, 200);
    },
    [
      enableWheel,
      isTransitioning,
      scrollThreshold,
      velocityThreshold,
      calculateVelocity,
      debouncedNavigate,
    ]
  );

  // Touch start handler
  const handleTouchStart = useCallback(
    (event: TouchEvent) => {
      if (!enableTouch || isTransitioning) return;

      const touch = event.touches[0];
      setTouchStartY(touch.clientY);
      lastTouchYRef.current = touch.clientY;
      touchStartTimeRef.current = Date.now();
      setIsUserScrolling(true);
    },
    [enableTouch, isTransitioning]
  );

  // Touch move handler with threshold detection
  const handleTouchMove = useCallback(
    (event: TouchEvent) => {
      if (!enableTouch || isTransitioning || touchStartY === 0) return;

      event.preventDefault();

      const touch = event.touches[0];
      const currentY = touch.clientY;
      const deltaY = touchStartY - currentY;
      const now = Date.now();

      // Calculate touch velocity
      const timeDelta = now - touchStartTimeRef.current;
      const touchVelocity = timeDelta > 0 ? Math.abs(deltaY) / timeDelta : 0;

      lastTouchYRef.current = currentY;
      setScrollVelocity(touchVelocity);

      // Check if we've crossed the threshold
      if (
        Math.abs(deltaY) >= touchThreshold ||
        touchVelocity > velocityThreshold
      ) {
        const direction = deltaY > 0 ? 'down' : 'up';

        // Reset touch state
        setTouchStartY(0);

        // Trigger debounced navigation
        debouncedNavigate(direction);
      }
    },
    [
      enableTouch,
      isTransitioning,
      touchStartY,
      touchThreshold,
      velocityThreshold,
      debouncedNavigate,
    ]
  );

  // Touch end handler
  const handleTouchEnd = useCallback(
    (_event: TouchEvent) => {
      if (!enableTouch) return;

      setTouchStartY(0);
      setIsUserScrolling(false);
      touchStartTimeRef.current = 0;
      lastTouchYRef.current = 0;
    },
    [enableTouch]
  );

  // Keyboard navigation handler
  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (!enableKeyboard || isTransitioning) return;

      let handled = false;
      let direction: 'up' | 'down' | null = null;

      switch (event.key) {
        case 'ArrowUp':
        case 'PageUp':
          direction = 'up';
          handled = true;
          break;
        case 'ArrowDown':
        case 'PageDown':
        case ' ': // Space key
          direction = 'down';
          handled = true;
          break;
        case 'Home':
          navigateToIndex(0);
          handled = true;
          break;
        case 'End':
          navigateToIndex(totalSlides - 1);
          handled = true;
          break;
      }

      if (handled) {
        event.preventDefault();
        event.stopPropagation();

        if (direction) {
          // Immediate navigation for keyboard (no debouncing)
          if (direction === 'down') {
            navigateNext();
          } else {
            navigatePrevious();
          }
        }
      }
    },
    [
      enableKeyboard,
      isTransitioning,
      navigateNext,
      navigatePrevious,
      navigateToIndex,
      totalSlides,
    ]
  );

  // Set up event listeners
  useEffect(() => {
    if (enableWheel) {
      document.addEventListener('wheel', handleWheel, { passive: false });
    }

    if (enableTouch) {
      document.addEventListener('touchstart', handleTouchStart, {
        passive: false,
      });
      document.addEventListener('touchmove', handleTouchMove, {
        passive: false,
      });
      document.addEventListener('touchend', handleTouchEnd, { passive: false });
    }

    if (enableKeyboard) {
      document.addEventListener('keydown', handleKeyDown);
    }

    return () => {
      if (enableWheel) {
        document.removeEventListener('wheel', handleWheel);
      }

      if (enableTouch) {
        document.removeEventListener('touchstart', handleTouchStart);
        document.removeEventListener('touchmove', handleTouchMove);
        document.removeEventListener('touchend', handleTouchEnd);
      }

      if (enableKeyboard) {
        document.removeEventListener('keydown', handleKeyDown);
      }

      // Clean up timeout
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }
    };
  }, [
    enableWheel,
    enableTouch,
    enableKeyboard,
    handleWheel,
    handleTouchStart,
    handleTouchMove,
    handleTouchEnd,
    handleKeyDown,
  ]);

  // Update current index when totalSlides changes
  useEffect(() => {
    if (currentIndex >= totalSlides && totalSlides > 0) {
      navigateToIndex(totalSlides - 1);
    }
  }, [totalSlides, currentIndex, navigateToIndex]);

  return {
    // State
    navigationState,
    currentIndex,
    isTransitioning,
    scrollDirection,
    scrollVelocity,
    isUserScrolling,

    // Actions
    navigateToIndex,
    navigateNext,
    navigatePrevious,

    // Utilities
    isValidIndex,
  };
}
