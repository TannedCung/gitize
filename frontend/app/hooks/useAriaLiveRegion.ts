'use client';

import { useEffect, useRef, useCallback } from 'react';

export type LiveRegionPoliteness = 'polite' | 'assertive' | 'off';

export interface LiveRegionOptions {
  /** The politeness level of the live region */
  politeness?: LiveRegionPoliteness;
  /** Whether to clear the message after announcing */
  clearAfterAnnounce?: boolean;
  /** Delay before clearing the message (in ms) */
  clearDelay?: number;
  /** Whether to deduplicate consecutive identical messages */
  deduplicate?: boolean;
}

/**
 * Hook for managing ARIA live regions for dynamic content updates
 */
export function useAriaLiveRegion(options: LiveRegionOptions = {}) {
  const {
    politeness = 'polite',
    clearAfterAnnounce = true,
    clearDelay = 1000,
    deduplicate = true,
  } = options;

  const liveRegionRef = useRef<HTMLDivElement | null>(null);
  const lastMessage = useRef<string>('');
  const clearTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  /**
   * Create or get the live region element
   */
  const getLiveRegion = useCallback(() => {
    if (!liveRegionRef.current) {
      // Create live region if it doesn't exist
      const liveRegion = document.createElement('div');
      liveRegion.setAttribute('aria-live', politeness);
      liveRegion.setAttribute('aria-atomic', 'true');
      liveRegion.setAttribute('role', 'status');
      liveRegion.style.position = 'absolute';
      liveRegion.style.left = '-10000px';
      liveRegion.style.width = '1px';
      liveRegion.style.height = '1px';
      liveRegion.style.overflow = 'hidden';
      liveRegion.style.clip = 'rect(0, 0, 0, 0)';
      liveRegion.style.whiteSpace = 'nowrap';

      document.body.appendChild(liveRegion);
      liveRegionRef.current = liveRegion;
    }

    return liveRegionRef.current;
  }, [politeness]);

  /**
   * Announce a message to screen readers
   */
  const announce = useCallback(
    (message: string) => {
      if (!message.trim()) return;

      // Skip if message is the same as the last one and deduplication is enabled
      if (deduplicate && message === lastMessage.current) {
        return;
      }

      const liveRegion = getLiveRegion();

      // Clear any existing timeout
      if (clearTimeoutRef.current) {
        clearTimeout(clearTimeoutRef.current);
        clearTimeoutRef.current = null;
      }

      // Update the live region content
      liveRegion.textContent = message;
      lastMessage.current = message;

      // Clear the message after the specified delay
      if (clearAfterAnnounce) {
        clearTimeoutRef.current = setTimeout(() => {
          if (liveRegionRef.current) {
            liveRegionRef.current.textContent = '';
          }
          lastMessage.current = '';
        }, clearDelay);
      }
    },
    [deduplicate, getLiveRegion, clearAfterAnnounce, clearDelay]
  );

  /**
   * Clear the live region content
   */
  const clear = useCallback(() => {
    if (liveRegionRef.current) {
      liveRegionRef.current.textContent = '';
    }
    lastMessage.current = '';

    if (clearTimeoutRef.current) {
      clearTimeout(clearTimeoutRef.current);
      clearTimeoutRef.current = null;
    }
  }, []);

  /**
   * Update the politeness level of the live region
   */
  const setPoliteness = useCallback((newPoliteness: LiveRegionPoliteness) => {
    if (liveRegionRef.current) {
      liveRegionRef.current.setAttribute('aria-live', newPoliteness);
    }
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (clearTimeoutRef.current) {
        clearTimeout(clearTimeoutRef.current);
      }

      if (liveRegionRef.current) {
        document.body.removeChild(liveRegionRef.current);
        liveRegionRef.current = null;
      }
    };
  }, []);

  return {
    announce,
    clear,
    setPoliteness,
  };
}

/**
 * Hook for managing multiple live regions with different politeness levels
 */
export function useMultipleAriaLiveRegions() {
  const politeRegion = useAriaLiveRegion({ politeness: 'polite' });
  const assertiveRegion = useAriaLiveRegion({ politeness: 'assertive' });

  /**
   * Announce a polite message (non-interrupting)
   */
  const announcePolite = useCallback(
    (message: string) => {
      politeRegion.announce(message);
    },
    [politeRegion]
  );

  /**
   * Announce an assertive message (interrupting)
   */
  const announceAssertive = useCallback(
    (message: string) => {
      assertiveRegion.announce(message);
    },
    [assertiveRegion]
  );

  /**
   * Clear all live regions
   */
  const clearAll = useCallback(() => {
    politeRegion.clear();
    assertiveRegion.clear();
  }, [politeRegion, assertiveRegion]);

  return {
    announcePolite,
    announceAssertive,
    clearAll,
    polite: politeRegion,
    assertive: assertiveRegion,
  };
}

/**
 * Hook for announcing form validation messages
 */
export function useFormAnnouncements() {
  const liveRegion = useAriaLiveRegion({
    politeness: 'assertive',
    clearAfterAnnounce: true,
    clearDelay: 5000,
  });

  /**
   * Announce form validation errors
   */
  const announceError = useCallback(
    (fieldName: string, errorMessage: string) => {
      liveRegion.announce(`${fieldName}: ${errorMessage}`);
    },
    [liveRegion]
  );

  /**
   * Announce successful form submission
   */
  const announceSuccess = useCallback(
    (message: string = 'Form submitted successfully') => {
      liveRegion.announce(message);
    },
    [liveRegion]
  );

  /**
   * Announce form loading state
   */
  const announceLoading = useCallback(
    (message: string = 'Form is being submitted') => {
      liveRegion.announce(message);
    },
    [liveRegion]
  );

  return {
    announceError,
    announceSuccess,
    announceLoading,
    clear: liveRegion.clear,
  };
}

/**
 * Hook for announcing navigation changes
 */
export function useNavigationAnnouncements() {
  const liveRegion = useAriaLiveRegion({
    politeness: 'polite',
    clearAfterAnnounce: true,
    clearDelay: 2000,
  });

  /**
   * Announce page navigation
   */
  const announcePageChange = useCallback(
    (pageName: string) => {
      liveRegion.announce(`Navigated to ${pageName}`);
    },
    [liveRegion]
  );

  /**
   * Announce route changes
   */
  const announceRouteChange = useCallback(
    (routeName: string) => {
      liveRegion.announce(`Current page: ${routeName}`);
    },
    [liveRegion]
  );

  /**
   * Announce loading states during navigation
   */
  const announceNavigationLoading = useCallback(
    (message: string = 'Loading page') => {
      liveRegion.announce(message);
    },
    [liveRegion]
  );

  return {
    announcePageChange,
    announceRouteChange,
    announceNavigationLoading,
    clear: liveRegion.clear,
  };
}

/**
 * Hook for announcing data updates
 */
export function useDataAnnouncements() {
  const liveRegion = useAriaLiveRegion({
    politeness: 'polite',
    clearAfterAnnounce: true,
    clearDelay: 3000,
  });

  /**
   * Announce data loading
   */
  const announceLoading = useCallback(
    (message: string = 'Loading data') => {
      liveRegion.announce(message);
    },
    [liveRegion]
  );

  /**
   * Announce data loaded
   */
  const announceLoaded = useCallback(
    (count?: number, itemType: string = 'items') => {
      const message =
        count !== undefined
          ? `Loaded ${count} ${itemType}`
          : `Data loaded successfully`;
      liveRegion.announce(message);
    },
    [liveRegion]
  );

  /**
   * Announce data error
   */
  const announceError = useCallback(
    (message: string = 'Failed to load data') => {
      liveRegion.announce(message);
    },
    [liveRegion]
  );

  /**
   * Announce data updates
   */
  const announceUpdate = useCallback(
    (message: string) => {
      liveRegion.announce(message);
    },
    [liveRegion]
  );

  return {
    announceLoading,
    announceLoaded,
    announceError,
    announceUpdate,
    clear: liveRegion.clear,
  };
}
