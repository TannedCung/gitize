import React from 'react';
import { render, screen } from '@testing-library/react';
import { Loading, RepositoryCardSkeleton } from '../Loading';

describe('Loading', () => {
  it('renders loading spinner', () => {
    render(<Loading />);

    const spinner = document.querySelector('.animate-spin');
    expect(spinner).toBeInTheDocument();
    expect(spinner).toHaveClass('animate-spin');
  });

  it('renders with small size', () => {
    render(<Loading size="sm" />);

    const spinner = document.querySelector('.animate-spin');
    expect(spinner).toHaveClass('h-4', 'w-4');
  });

  it('renders with medium size by default', () => {
    render(<Loading />);

    const spinner = document.querySelector('.animate-spin');
    expect(spinner).toHaveClass('h-8', 'w-8');
  });

  it('renders with large size', () => {
    render(<Loading size="lg" />);

    const spinner = document.querySelector('.animate-spin');
    expect(spinner).toHaveClass('h-12', 'w-12');
  });

  it('renders with text when provided', () => {
    render(<Loading text="Loading repositories..." />);

    expect(screen.getByText('Loading repositories...')).toBeInTheDocument();
  });

  it('does not render text when not provided', () => {
    render(<Loading />);

    expect(screen.queryByText(/loading/i)).not.toBeInTheDocument();
  });

  it('applies custom className', () => {
    const { container } = render(<Loading className="custom-loading-class" />);

    expect(container.firstChild).toHaveClass('custom-loading-class');
  });
});

describe('RepositoryCardSkeleton', () => {
  it('renders skeleton structure', () => {
    const { container } = render(<RepositoryCardSkeleton />);

    // Check for the main container
    const skeleton = container.querySelector('.animate-pulse');
    expect(skeleton).toBeInTheDocument();
    expect(skeleton).toHaveClass('animate-pulse');

    // Check for skeleton elements
    const skeletonElements = container.querySelectorAll('.bg-gray-200');
    expect(skeletonElements.length).toBeGreaterThan(1);
  });

  it('has correct styling classes', () => {
    const { container } = render(<RepositoryCardSkeleton />);

    const mainDiv = container.firstChild;
    expect(mainDiv).toHaveClass(
      'bg-white',
      'dark:bg-gray-800',
      'rounded-lg',
      'border',
      'animate-pulse'
    );
  });
});
