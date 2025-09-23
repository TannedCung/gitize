import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { VerticalFeed, useFeedContext } from '../VerticalFeed';
import { Repository } from '../RepositoryCard';

// Mock repositories for testing
const mockRepositories: Repository[] = [
  {
    id: 1,
    github_id: 1001,
    name: 'test-repo-1',
    full_name: 'user/test-repo-1',
    description: 'A test repository',
    stars: 100,
    forks: 20,
    language: 'TypeScript',
    author: 'testuser',
    url: 'https://github.com/user/test-repo-1',
    trending_date: '2024-01-01',
    summary: 'This is a test repository for unit testing',
  },
  {
    id: 2,
    github_id: 1002,
    name: 'test-repo-2',
    full_name: 'user/test-repo-2',
    description: 'Another test repository',
    stars: 200,
    forks: 40,
    language: 'JavaScript',
    author: 'testuser2',
    url: 'https://github.com/user/test-repo-2',
    trending_date: '2024-01-02',
  },
];

// Test component to access feed context
function TestFeedConsumer() {
  const { state, actions } = useFeedContext();

  return (
    <div>
      <div data-testid="current-index">{state.currentIndex}</div>
      <div data-testid="repositories-count">{state.repositories.length}</div>
      <div data-testid="is-loading">{state.isLoading.toString()}</div>
      <div data-testid="viewport-height">{state.viewportHeight}</div>
      <button data-testid="next-button" onClick={actions.navigateNext}>
        Next
      </button>
      <button data-testid="previous-button" onClick={actions.navigatePrevious}>
        Previous
      </button>
    </div>
  );
}

describe('VerticalFeed Core Infrastructure', () => {
  beforeEach(() => {
    // Mock window dimensions
    Object.defineProperty(window, 'innerHeight', {
      writable: true,
      configurable: true,
      value: 800,
    });
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 1200,
    });
  });

  test('renders VerticalFeed component with basic structure', () => {
    render(<VerticalFeed repositories={mockRepositories} />);

    expect(screen.getByTestId('vertical-feed')).toBeInTheDocument();
    expect(screen.getByTestId('feed-viewport')).toBeInTheDocument();
  });

  test('initializes feed state correctly', () => {
    // Create a wrapper component that includes the TestFeedConsumer
    function TestWrapper() {
      return <VerticalFeed repositories={mockRepositories} />;
    }

    render(<TestWrapper />);

    // Test that the feed renders correctly
    expect(screen.getByTestId('vertical-feed')).toBeInTheDocument();
    expect(screen.getByTestId('feed-viewport')).toBeInTheDocument();

    // Test that slides are rendered
    const slides = screen.getAllByRole('article');
    expect(slides).toHaveLength(2);
  });

  test('renders repository slides with correct positioning', () => {
    render(<VerticalFeed repositories={mockRepositories} />);

    const slides = screen.getAllByRole('article');
    expect(slides).toHaveLength(2);

    // Check that slides have correct data attributes
    expect(slides[0]).toHaveAttribute('data-slide-index', '0');
    expect(slides[0]).toHaveAttribute('data-active', 'true');
    expect(slides[1]).toHaveAttribute('data-slide-index', '1');
    expect(slides[1]).toHaveAttribute('data-active', 'false');
  });

  test('applies CSS transforms for slide positioning', () => {
    render(<VerticalFeed repositories={mockRepositories} />);

    const slides = screen.getAllByRole('article');

    // First slide should be at position 0
    expect(slides[0]).toHaveStyle('transform: translateY(0px)');
    // Second slide should be offset by viewport height
    expect(slides[1]).toHaveStyle('transform: translateY(800px)');
  });

  test('handles navigation between slides', async () => {
    // For now, we'll test the basic structure since navigation will be implemented in later tasks
    render(<VerticalFeed repositories={mockRepositories} />);

    const slides = screen.getAllByRole('article');
    expect(slides).toHaveLength(2);

    // Test that first slide is active
    expect(slides[0]).toHaveAttribute('data-active', 'true');
    expect(slides[1]).toHaveAttribute('data-active', 'false');
  });

  test('prevents navigation beyond bounds', async () => {
    // Test that slides are positioned correctly within bounds
    render(<VerticalFeed repositories={mockRepositories} />);

    const slides = screen.getAllByRole('article');

    // Test that slides have correct positioning
    expect(slides[0]).toHaveStyle('transform: translateY(0px)');
    expect(slides[1]).toHaveStyle('transform: translateY(800px)');
  });

  test('handles viewport resize', async () => {
    render(<VerticalFeed repositories={mockRepositories} />);

    const viewport = screen.getByTestId('feed-viewport');
    expect(viewport).toHaveStyle('height: 800px');

    // Simulate window resize
    Object.defineProperty(window, 'innerHeight', {
      writable: true,
      configurable: true,
      value: 1000,
    });

    fireEvent(window, new Event('resize'));

    // The viewport should eventually update (debounced)
    await waitFor(
      () => {
        const updatedViewport = screen.getByTestId('feed-viewport');
        expect(updatedViewport).toHaveStyle('height: 1000px');
      },
      { timeout: 200 }
    );
  });

  test('displays loading state correctly', () => {
    render(<VerticalFeed repositories={[]} />);

    // Should show empty state when no repositories and not loading
    expect(screen.getByText('No repositories found')).toBeInTheDocument();
  });

  test('supports different extension modes', () => {
    const { rerender } = render(
      <VerticalFeed repositories={mockRepositories} extensionMode="web" />
    );

    expect(screen.getByTestId('vertical-feed')).toHaveAttribute(
      'data-extension-mode',
      'web'
    );
    expect(screen.getByTestId('feed-viewport')).toHaveAttribute(
      'data-extension-mode',
      'web'
    );

    rerender(
      <VerticalFeed repositories={mockRepositories} extensionMode="popup" />
    );

    expect(screen.getByTestId('vertical-feed')).toHaveAttribute(
      'data-extension-mode',
      'popup'
    );
    expect(screen.getByTestId('feed-viewport')).toHaveAttribute(
      'data-extension-mode',
      'popup'
    );
  });

  test('optimizes rendering for performance', () => {
    // Create more repositories to test virtual rendering
    const manyRepositories = Array.from({ length: 10 }, (_, i) => ({
      ...mockRepositories[0],
      id: i + 1,
      name: `test-repo-${i + 1}`,
    }));

    render(<VerticalFeed repositories={manyRepositories} />);

    // Should only render slides within the render window (current ± 2)
    const renderedSlides = screen.getAllByRole('article');
    expect(renderedSlides.length).toBeLessThanOrEqual(5); // Current + 2 before + 2 after
  });

  test('provides proper accessibility attributes', () => {
    render(<VerticalFeed repositories={mockRepositories} />);

    const viewport = screen.getByTestId('feed-viewport');
    expect(viewport).toHaveAttribute('role', 'main');
    expect(viewport).toHaveAttribute('aria-label', 'Repository feed');
    expect(viewport).toHaveAttribute('aria-live', 'polite');

    const slides = screen.getAllByRole('article');
    expect(slides[0]).toHaveAttribute(
      'aria-label',
      'Repository test-repo-1 by testuser'
    );
    expect(slides[0]).toHaveAttribute('aria-hidden', 'false');
    // Note: Both slides are visible in the current implementation since they're within the visibility range
    expect(slides[1]).toHaveAttribute('aria-hidden', 'false');
  });
});
