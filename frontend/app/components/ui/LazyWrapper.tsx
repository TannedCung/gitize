'use client';

import React, { Suspense } from 'react';
import { Spinner } from './Loading';

interface LazyWrapperProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  className?: string;
}

/**
 * Wrapper component for lazy-loaded components with loading fallback
 */
export function LazyWrapper({
  children,
  fallback,
  className,
}: LazyWrapperProps) {
  const defaultFallback = (
    <div className={`flex items-center justify-center p-4 ${className || ''}`}>
      <Spinner size="md" color="primary" />
    </div>
  );

  return <Suspense fallback={fallback || defaultFallback}>{children}</Suspense>;
}

/**
 * Higher-order component for wrapping lazy components
 */
export function withLazyWrapper<P extends object>(
  Component: React.ComponentType<P>,
  fallback?: React.ReactNode
) {
  const WrappedComponent = (props: P) => (
    <LazyWrapper fallback={fallback}>
      <Component {...props} />
    </LazyWrapper>
  );

  WrappedComponent.displayName = `withLazyWrapper(${Component.displayName || Component.name})`;

  return WrappedComponent;
}
