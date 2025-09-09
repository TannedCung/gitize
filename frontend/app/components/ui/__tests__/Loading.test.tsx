import React from 'react';
import { render, screen } from '@testing-library/react';
import { axe, toHaveNoViolations } from 'jest-axe';
import {
  Spinner,
  Progress,
  Skeleton,
  SkeletonText,
  SkeletonAvatar,
  SkeletonButton,
  RepositoryCardSkeleton,
  Loading,
} from '../Loading';

expect.extend(toHaveNoViolations);

describe('Spinner Component', () => {
  it('renders with default props', () => {
    render(<Spinner />);
    const spinner = screen.getByRole('status');
    expect(spinner).toBeInTheDocument();
    expect(spinner).toHaveAttribute('aria-label', 'Loading');
  });

  it('renders with custom text', () => {
    render(<Spinner text="Loading data..." />);
    expect(screen.getByText('Loading data...')).toBeInTheDocument();
  });

  it('applies correct size classes', () => {
    const { rerender } = render(<Spinner size="sm" data-testid="spinner" />);
    let container = screen.getByTestId('spinner').firstChild
      ?.firstChild as HTMLElement;
    expect(container).toHaveClass('h-4', 'w-4');

    rerender(<Spinner size="lg" data-testid="spinner" />);
    container = screen.getByTestId('spinner').firstChild
      ?.firstChild as HTMLElement;
    expect(container).toHaveClass('h-8', 'w-8');

    rerender(<Spinner size="xl" data-testid="spinner" />);
    container = screen.getByTestId('spinner').firstChild
      ?.firstChild as HTMLElement;
    expect(container).toHaveClass('h-12', 'w-12');
  });

  it('applies correct color classes', () => {
    const { rerender } = render(<Spinner color="primary" />);
    let spinner = screen.getByRole('status');
    expect(spinner).toHaveClass('border-primary-200', 'border-t-primary-500');

    rerender(<Spinner color="error" />);
    spinner = screen.getByRole('status');
    expect(spinner).toHaveClass('border-error-200', 'border-t-error-500');

    rerender(<Spinner color="success" />);
    spinner = screen.getByRole('status');
    expect(spinner).toHaveClass('border-success-200', 'border-t-success-500');
  });

  it('applies correct speed classes', () => {
    const { rerender } = render(<Spinner speed="slow" />);
    let spinner = screen.getByRole('status');
    expect(spinner).toHaveClass('[animation-duration:2s]');

    rerender(<Spinner speed="fast" />);
    spinner = screen.getByRole('status');
    expect(spinner).toHaveClass('[animation-duration:0.5s]');

    rerender(<Spinner speed="normal" />);
    spinner = screen.getByRole('status');
    expect(spinner).toHaveClass('animate-spin');
  });

  it('accepts custom className', () => {
    render(<Spinner className="custom-class" data-testid="spinner" />);
    expect(screen.getByTestId('spinner')).toHaveClass('custom-class');
  });

  it('passes accessibility audit', async () => {
    const { container } = render(<Spinner text="Loading content" />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});

describe('Progress Component', () => {
  it('renders with default props', () => {
    render(<Progress />);
    const progress = screen.getByRole('progressbar');
    expect(progress).toBeInTheDocument();
    expect(progress).toHaveAttribute('aria-valuenow', '0');
    expect(progress).toHaveAttribute('aria-valuemin', '0');
    expect(progress).toHaveAttribute('aria-valuemax', '100');
  });

  it('renders with custom value', () => {
    render(<Progress value={50} />);
    const progress = screen.getByRole('progressbar');
    expect(progress).toHaveAttribute('aria-valuenow', '50');
  });

  it('displays percentage when showValue is true', () => {
    render(<Progress value={75} showValue />);
    expect(screen.getByText('75%')).toBeInTheDocument();
  });

  it('displays custom label', () => {
    render(<Progress label="Upload Progress" value={30} />);
    expect(screen.getByText('Upload Progress')).toBeInTheDocument();
  });

  it('handles indeterminate state', () => {
    render(<Progress indeterminate />);
    const progress = screen.getByRole('progressbar');
    expect(progress).not.toHaveAttribute('aria-valuenow');
  });

  it('clamps values within range', () => {
    const { rerender } = render(<Progress value={150} max={100} />);
    let progress = screen.getByRole('progressbar');
    expect(progress).toHaveAttribute('aria-valuenow', '100');

    rerender(<Progress value={-10} max={100} />);
    progress = screen.getByRole('progressbar');
    expect(progress).toHaveAttribute('aria-valuenow', '0');
  });

  it('applies correct size classes', () => {
    const { rerender } = render(<Progress size="sm" data-testid="progress" />);
    let progressBar = screen
      .getByTestId('progress')
      .querySelector('[role="progressbar"]');
    expect(progressBar).toHaveClass('h-1');

    rerender(<Progress size="lg" data-testid="progress" />);
    progressBar = screen
      .getByTestId('progress')
      .querySelector('[role="progressbar"]');
    expect(progressBar).toHaveClass('h-3');
  });

  it('applies correct color classes', () => {
    render(<Progress color="success" value={50} data-testid="progress" />);
    const progressBar = screen
      .getByTestId('progress')
      .querySelector('[role="progressbar"]');
    expect(progressBar).toHaveClass('bg-success-100');
  });

  it('passes accessibility audit', async () => {
    const { container } = render(
      <Progress value={60} label="File upload" showValue />
    );
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});

describe('Skeleton Component', () => {
  it('renders with default props', () => {
    render(<Skeleton data-testid="skeleton" />);
    const skeleton = screen.getByTestId('skeleton');
    expect(skeleton).toBeInTheDocument();
    expect(skeleton).toHaveClass(
      'bg-gray-200',
      'dark:bg-gray-700',
      'animate-pulse',
      'rounded-md'
    );
  });

  it('applies custom dimensions', () => {
    render(<Skeleton width="200px" height="50px" data-testid="skeleton" />);
    const skeleton = screen.getByTestId('skeleton');
    expect(skeleton).toHaveStyle({ width: '200px', height: '50px' });
  });

  it('renders different variants', () => {
    const { rerender } = render(
      <Skeleton variant="text" data-testid="skeleton" />
    );
    let skeleton = screen.getByTestId('skeleton');
    expect(skeleton).toHaveClass('rounded');

    rerender(<Skeleton variant="circular" data-testid="skeleton" />);
    skeleton = screen.getByTestId('skeleton');
    expect(skeleton).toHaveClass('rounded-full');

    rerender(<Skeleton variant="rectangular" data-testid="skeleton" />);
    skeleton = screen.getByTestId('skeleton');
    expect(skeleton).toHaveClass('rounded-md');
  });

  it('renders multiple lines for text variant', () => {
    render(<Skeleton variant="text" lines={3} data-testid="skeleton" />);
    const container = screen.getByTestId('skeleton');
    const lines = container.querySelectorAll('div');
    expect(lines).toHaveLength(3);
  });

  it('applies different animations', () => {
    const { rerender } = render(
      <Skeleton animation="pulse" data-testid="skeleton" />
    );
    let skeleton = screen.getByTestId('skeleton');
    expect(skeleton).toHaveClass('animate-pulse');

    rerender(<Skeleton animation="wave" data-testid="skeleton" />);
    skeleton = screen.getByTestId('skeleton');
    expect(skeleton).toHaveClass('animate-pulse', '[animation-duration:1.5s]');

    rerender(<Skeleton animation="none" data-testid="skeleton" />);
    skeleton = screen.getByTestId('skeleton');
    expect(skeleton).not.toHaveClass('animate-pulse');
  });
});

describe('SkeletonText Component', () => {
  it('renders multiple lines', () => {
    render(<SkeletonText lines={4} data-testid="skeleton-text" />);
    const container = screen.getByTestId('skeleton-text');
    const lines = container.querySelectorAll('div');
    expect(lines).toHaveLength(4);
  });

  it('makes last line shorter', () => {
    render(<SkeletonText lines={2} data-testid="skeleton-text" />);
    const container = screen.getByTestId('skeleton-text');
    const lines = container.querySelectorAll('div');
    expect(lines[1]).toHaveStyle({ width: '75%' });
  });
});

describe('SkeletonAvatar Component', () => {
  it('renders with correct size', () => {
    const { rerender } = render(
      <SkeletonAvatar size="sm" data-testid="skeleton-avatar" />
    );
    let avatar = screen.getByTestId('skeleton-avatar');
    expect(avatar).toHaveStyle({ width: '2rem', height: '2rem' });

    rerender(<SkeletonAvatar size="xl" data-testid="skeleton-avatar" />);
    avatar = screen.getByTestId('skeleton-avatar');
    expect(avatar).toHaveStyle({ width: '4rem', height: '4rem' });
  });

  it('is circular', () => {
    render(<SkeletonAvatar data-testid="skeleton-avatar" />);
    const avatar = screen.getByTestId('skeleton-avatar');
    expect(avatar).toHaveClass('rounded-full');
  });
});

describe('SkeletonButton Component', () => {
  it('renders with correct size', () => {
    const { rerender } = render(
      <SkeletonButton size="sm" data-testid="skeleton-button" />
    );
    let button = screen.getByTestId('skeleton-button');
    expect(button).toHaveStyle({ width: '5rem', height: '2rem' });

    rerender(<SkeletonButton size="lg" data-testid="skeleton-button" />);
    button = screen.getByTestId('skeleton-button');
    expect(button).toHaveStyle({ width: '8rem', height: '3rem' });
  });
});

describe('RepositoryCardSkeleton Component', () => {
  it('renders all skeleton elements', () => {
    render(<RepositoryCardSkeleton data-testid="repo-skeleton" />);
    const container = screen.getByTestId('repo-skeleton');
    expect(container).toBeInTheDocument();
    expect(container).toHaveClass(
      'bg-white',
      'dark:bg-gray-800',
      'rounded-lg',
      'border'
    );
  });

  it('accepts custom className', () => {
    render(
      <RepositoryCardSkeleton
        className="custom-class"
        data-testid="repo-skeleton"
      />
    );
    expect(screen.getByTestId('repo-skeleton')).toHaveClass('custom-class');
  });
});

describe('Loading Component (Legacy)', () => {
  it('renders and maps props correctly', () => {
    render(<Loading size="lg" text="Loading..." />);
    expect(screen.getByText('Loading...')).toBeInTheDocument();
    const spinner = screen.getByRole('status');
    expect(spinner).toHaveClass('h-8', 'w-8');
  });

  it('maintains backward compatibility', () => {
    render(<Loading className="legacy-class" />);
    const container = screen.getByRole('status').closest('.legacy-class');
    expect(container).toBeInTheDocument();
  });
});

describe('Animation and Performance', () => {
  it('applies spin animation to spinner', () => {
    render(<Spinner />);
    const spinner = screen.getByRole('status');
    expect(spinner).toHaveClass('animate-spin');
  });

  it('applies pulse animation to skeleton', () => {
    render(<Skeleton data-testid="skeleton" />);
    const skeleton = screen.getByTestId('skeleton');
    expect(skeleton).toHaveClass('animate-pulse');
  });

  it('handles indeterminate progress animation', () => {
    render(<Progress indeterminate data-testid="progress" />);
    const progressBar = screen
      .getByTestId('progress')
      .querySelector('[role="progressbar"] > div');
    expect(progressBar).toHaveClass('animate-progress-indeterminate');
  });
});

describe('Accessibility', () => {
  it('provides proper ARIA labels for spinner', () => {
    render(<Spinner aria-label="Loading user data" />);
    const spinner = screen.getByRole('status');
    expect(spinner).toHaveAttribute('aria-label', 'Loading user data');
  });

  it('provides proper ARIA attributes for progress', () => {
    render(<Progress value={50} max={200} aria-label="Upload progress" />);
    const progress = screen.getByRole('progressbar');
    expect(progress).toHaveAttribute('aria-valuenow', '50');
    expect(progress).toHaveAttribute('aria-valuemax', '200');
    expect(progress).toHaveAttribute('aria-label', 'Upload progress');
  });

  it('handles indeterminate progress accessibility', () => {
    render(<Progress indeterminate label="Processing" />);
    const progress = screen.getByRole('progressbar');
    expect(progress).not.toHaveAttribute('aria-valuenow');
    expect(progress).toHaveAttribute('aria-label', 'Processing');
  });
});
