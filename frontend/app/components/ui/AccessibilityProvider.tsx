'use client';

import React, { createContext, useContext, ReactNode } from 'react';
import {
  useMultipleAriaLiveRegions,
  useFormAnnouncements,
  useNavigationAnnouncements,
  useDataAnnouncements,
} from '../../hooks/useAriaLiveRegion';

interface AccessibilityContextType {
  // General announcements
  announcePolite: (_message: string) => void;
  announceAssertive: (_message: string) => void;
  clearAllAnnouncements: () => void;

  // Form-specific announcements
  announceFormError: (_fieldName: string, _errorMessage: string) => void;
  announceFormSuccess: (_message?: string) => void;
  announceFormLoading: (_message?: string) => void;
  clearFormAnnouncements: () => void;

  // Navigation announcements
  announcePageChange: (_pageName: string) => void;
  announceRouteChange: (_routeName: string) => void;
  announceNavigationLoading: (_message?: string) => void;
  clearNavigationAnnouncements: () => void;

  // Data announcements
  announceDataLoading: (_message?: string) => void;
  announceDataLoaded: (_count?: number, _itemType?: string) => void;
  announceDataError: (_message?: string) => void;
  announceDataUpdate: (_message: string) => void;
  clearDataAnnouncements: () => void;
}

const AccessibilityContext = createContext<AccessibilityContextType | null>(
  null
);

interface AccessibilityProviderProps {
  children: ReactNode;
}

/**
 * Provider component that manages ARIA live regions and accessibility announcements
 */
export function AccessibilityProvider({
  children,
}: AccessibilityProviderProps) {
  const liveRegions = useMultipleAriaLiveRegions();
  const formAnnouncements = useFormAnnouncements();
  const navigationAnnouncements = useNavigationAnnouncements();
  const dataAnnouncements = useDataAnnouncements();

  const contextValue: AccessibilityContextType = {
    // General announcements
    announcePolite: liveRegions.announcePolite,
    announceAssertive: liveRegions.announceAssertive,
    clearAllAnnouncements: liveRegions.clearAll,

    // Form announcements
    announceFormError: formAnnouncements.announceError,
    announceFormSuccess: formAnnouncements.announceSuccess,
    announceFormLoading: formAnnouncements.announceLoading,
    clearFormAnnouncements: formAnnouncements.clear,

    // Navigation announcements
    announcePageChange: navigationAnnouncements.announcePageChange,
    announceRouteChange: navigationAnnouncements.announceRouteChange,
    announceNavigationLoading:
      navigationAnnouncements.announceNavigationLoading,
    clearNavigationAnnouncements: navigationAnnouncements.clear,

    // Data announcements
    announceDataLoading: dataAnnouncements.announceLoading,
    announceDataLoaded: dataAnnouncements.announceLoaded,
    announceDataError: dataAnnouncements.announceError,
    announceDataUpdate: dataAnnouncements.announceUpdate,
    clearDataAnnouncements: dataAnnouncements.clear,
  };

  return (
    <AccessibilityContext.Provider value={contextValue}>
      {children}
    </AccessibilityContext.Provider>
  );
}

/**
 * Hook to access accessibility context
 */
export function useAccessibility(): AccessibilityContextType {
  const context = useContext(AccessibilityContext);

  if (!context) {
    throw new Error(
      'useAccessibility must be used within an AccessibilityProvider'
    );
  }

  return context;
}

/**
 * Hook for form accessibility features
 */
export function useFormAccessibility() {
  const {
    announceFormError,
    announceFormSuccess,
    announceFormLoading,
    clearFormAnnouncements,
  } = useAccessibility();

  return {
    announceError: announceFormError,
    announceSuccess: announceFormSuccess,
    announceLoading: announceFormLoading,
    clear: clearFormAnnouncements,
  };
}

/**
 * Hook for navigation accessibility features
 */
export function useNavigationAccessibility() {
  const {
    announcePageChange,
    announceRouteChange,
    announceNavigationLoading,
    clearNavigationAnnouncements,
  } = useAccessibility();

  return {
    announcePageChange,
    announceRouteChange,
    announceLoading: announceNavigationLoading,
    clear: clearNavigationAnnouncements,
  };
}

/**
 * Hook for data accessibility features
 */
export function useDataAccessibility() {
  const {
    announceDataLoading,
    announceDataLoaded,
    announceDataError,
    announceDataUpdate,
    clearDataAnnouncements,
  } = useAccessibility();

  return {
    announceLoading: announceDataLoading,
    announceLoaded: announceDataLoaded,
    announceError: announceDataError,
    announceUpdate: announceDataUpdate,
    clear: clearDataAnnouncements,
  };
}

/**
 * Higher-order component that provides accessibility context
 */
export function withAccessibility<P extends object>(
  Component: React.ComponentType<P>
): React.ComponentType<P> {
  const WrappedComponent = (props: P) => (
    <AccessibilityProvider>
      <Component {...props} />
    </AccessibilityProvider>
  );

  WrappedComponent.displayName = `withAccessibility(${Component.displayName || Component.name})`;

  return WrappedComponent;
}
