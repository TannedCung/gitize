'use client';

import React, { useState, useRef, useEffect } from 'react';
import { RepositoryCard, Repository, SummaryState } from './RepositoryCard';
import { RepositoryCardSkeleton } from './Loading';
import { BaseComponentProps } from './types';
// import { cn } from './utils';

interface LazyRepositoryCardProps extends BaseComponentProps {
  repository: Repository;
  showSummary?: boolean;
  summaryState?: SummaryState;
}

export function LazyRepositoryCard({
  repository,
  showSummary = true,
  summaryState,
  className,
  'data-testid': dataTestId,
  ...props
}: LazyRepositoryCardProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [hasBeenVisible, setHasBeenVisible] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const currentRef = cardRef.current;
    if (!currentRef) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasBeenVisible) {
          setIsVisible(true);
          setHasBeenVisible(true);
          // Once visible, we don't need to observe anymore
          observer.unobserve(currentRef);
        }
      },
      {
        threshold: 0.1,
        rootMargin: '50px 0px', // Start loading 50px before the card comes into view
      }
    );

    observer.observe(currentRef);

    return () => {
      observer.unobserve(currentRef);
    };
  }, [hasBeenVisible]);

  if (!isVisible && !hasBeenVisible) {
    // Render a skeleton placeholder to prevent layout shift
    return (
      <div ref={cardRef}>
        <RepositoryCardSkeleton
          className={className}
          data-testid={
            dataTestId ? `${dataTestId}-skeleton` : 'repository-card-skeleton'
          }
          {...props}
        />
      </div>
    );
  }

  return (
    <div ref={cardRef}>
      <RepositoryCard
        repository={repository}
        showSummary={showSummary}
        summaryState={summaryState}
        className={className}
        data-testid={dataTestId}
        {...props}
      />
    </div>
  );
}
