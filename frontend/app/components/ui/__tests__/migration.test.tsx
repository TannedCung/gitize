import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { RepositoryCard, Repository } from '../RepositoryCard';
import { ThemeToggle } from '../ThemeToggle';
import { NewsletterSignup } from '../NewsletterSignup';
import { LazyRepositoryCard } from '../LazyRepositoryCard';
import { ThemeProvider } from '../../../contexts/ThemeContext';

// Mock the newsletter API
jest.mock('../../../lib/api', () => ({
  newsletterApi: {
    subscribe: jest.fn(),
  },
}));

const mockRepository: Repository = {
  id: 1,
  github_id: 123456,
  name: 'awesome-project',
  full_name: 'user/awesome-project',
  description: 'This is an awesome project that does amazing things',
  stars: 1250,
  forks: 89,
  language: 'TypeScript',
  author: 'user',
  url: 'https://github.com/user/awesome-project',
  trending_date: '2024-01-15',
  summary: 'This is a comprehensive AI-generated summary of the repository.',
};

// Wrapper component for theme context
const ThemeWrapper: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => <ThemeProvider>{children}</ThemeProvider>;

describe('Migration Tests - Design System Integration', () => {
  describe('RepositoryCard Migration', () => {
    it('maintains all original functionality after migration', () => {
      render(<RepositoryCard repository={mockRepository} />);

      // Check that all original content is still present
      expect(screen.getByText('awesome-project')).toBeInTheDocument();
      expect(screen.getByText('by user')).toBeInTheDocument();
      expect(
        screen.getByText('This is an awesome project that does amazing things')
      ).toBeInTheDocument();
      expect(screen.getByText('1.3k')).toBeInTheDocument(); // stars
      expect(screen.getByText('89')).toBeInTheDocument(); // forks
      expect(screen.getByText('TypeScript')).toBeInTheDocument();
      expect(screen.getByText(/Trending Jan 15, 2024/)).toBeInTheDocument();
    });

    it('uses new design system classes and components', () => {
      render(
        <RepositoryCard repository={mockRepository} data-testid="repo-card" />
      );

      const card = screen.getByTestId('repo-card');

      // Check for new design system classes
      expect(card).toHaveClass('rounded-xl'); // Updated border radius
      expect(card).toHaveClass('hover:shadow-appflowy-md'); // AppFlowy shadow
      expect(card).toHaveClass('hover:border-primary-300'); // Primary color hover
    });

    it('maintains AI summary functionality with new Alert component', () => {
      render(<RepositoryCard repository={mockRepository} showSummary={true} />);

      expect(screen.getByText('AI Summary')).toBeInTheDocument();
      expect(
        screen.getByText(
          'This is a comprehensive AI-generated summary of the repository.'
        )
      ).toBeInTheDocument();
    });

    it('shows loading state with new Spinner component', () => {
      render(
        <RepositoryCard
          repository={mockRepository}
          showSummary={true}
          summaryState={{ isLoading: true }}
        />
      );

      expect(screen.getByText('Generating AI Summary...')).toBeInTheDocument();
    });

    it('shows error state with new Alert component', () => {
      render(
        <RepositoryCard
          repository={mockRepository}
          showSummary={true}
          summaryState={{ error: 'Failed to generate summary' }}
        />
      );

      expect(screen.getByText('Summary Generation Failed')).toBeInTheDocument();
      expect(
        screen.getByText('Failed to generate summary')
      ).toBeInTheDocument();
    });

    it('maintains expand/collapse functionality with new Button component', () => {
      const longSummary = 'A'.repeat(250);
      const repoWithLongSummary: Repository = {
        ...mockRepository,
        summary: longSummary,
      };

      render(<RepositoryCard repository={repoWithLongSummary} />);

      const showMoreButton = screen.getByText('Show more');
      expect(showMoreButton).toBeInTheDocument();

      // Click to expand
      fireEvent.click(showMoreButton);
      expect(screen.getByText('Show less')).toBeInTheDocument();

      // Click to collapse
      fireEvent.click(screen.getByText('Show less'));
      expect(screen.getByText('Show more')).toBeInTheDocument();
    });
  });

  describe('ThemeToggle Migration', () => {
    it('maintains theme switching functionality', () => {
      render(
        <ThemeWrapper>
          <ThemeToggle data-testid="theme-toggle" />
        </ThemeWrapper>
      );

      const lightButton = screen.getByTestId('theme-toggle-light');
      const darkButton = screen.getByTestId('theme-toggle-dark');
      const systemButton = screen.getByTestId('theme-toggle-system');

      expect(lightButton).toBeInTheDocument();
      expect(darkButton).toBeInTheDocument();
      expect(systemButton).toBeInTheDocument();

      // Test clicking different theme options
      fireEvent.click(darkButton);
      expect(darkButton).toHaveAttribute('aria-pressed', 'true');

      fireEvent.click(lightButton);
      expect(lightButton).toHaveAttribute('aria-pressed', 'true');
    });

    it('uses new design system styling', () => {
      render(
        <ThemeWrapper>
          <ThemeToggle data-testid="theme-toggle" />
        </ThemeWrapper>
      );

      const container = screen.getByTestId('theme-toggle');

      // Check for new design system classes
      expect(container).toHaveClass('rounded-xl'); // Updated border radius
      expect(container).toHaveClass('shadow-sm'); // New shadow
    });

    it('supports new size and label props', () => {
      render(
        <ThemeWrapper>
          <ThemeToggle
            size="lg"
            showLabels={true}
            data-testid="theme-toggle-large"
          />
        </ThemeWrapper>
      );

      expect(screen.getByText('Light')).toBeInTheDocument();
      expect(screen.getByText('Dark')).toBeInTheDocument();
      expect(screen.getByText('System')).toBeInTheDocument();
    });
  });

  describe('NewsletterSignup Migration', () => {
    it('maintains form submission functionality', () => {
      render(<NewsletterSignup data-testid="newsletter" />);

      expect(
        screen.getByText('Stay Updated with Trending Repositories')
      ).toBeInTheDocument();
      expect(screen.getByTestId('newsletter-email-input')).toBeInTheDocument();
      expect(
        screen.getByTestId('newsletter-submit-button')
      ).toBeInTheDocument();
    });

    it('uses new TextField component', () => {
      render(<NewsletterSignup data-testid="newsletter" />);

      const emailInput = screen.getByTestId('newsletter-email-input');
      expect(emailInput).toBeInTheDocument();
      expect(emailInput).toHaveAttribute('type', 'email');
      expect(emailInput).toHaveAttribute('required');
    });

    it('uses new Button component for submission', () => {
      render(<NewsletterSignup data-testid="newsletter" />);

      const submitButton = screen.getByTestId('newsletter-submit-button');
      expect(submitButton).toBeInTheDocument();
      expect(submitButton).toHaveTextContent('Subscribe to Newsletter');
    });

    it('shows success state with new Alert component', async () => {
      const { newsletterApi } = require('../../../lib/api');
      newsletterApi.subscribe.mockResolvedValue({
        message: 'Successfully subscribed!',
      });

      render(<NewsletterSignup data-testid="newsletter" />);

      const emailInput = screen.getByTestId('newsletter-email-input');
      const submitButton = screen.getByTestId('newsletter-submit-button');

      fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
      fireEvent.click(submitButton);

      // Wait for success state
      await screen.findByText('Successfully subscribed!');
      expect(screen.getByText('Successfully subscribed!')).toBeInTheDocument();
    });
  });

  describe('LazyRepositoryCard Migration', () => {
    it('uses new RepositoryCardSkeleton component', () => {
      // Mock IntersectionObserver
      const mockIntersectionObserver = jest.fn();
      mockIntersectionObserver.mockReturnValue({
        observe: () => null,
        unobserve: () => null,
        disconnect: () => null,
      });
      window.IntersectionObserver = mockIntersectionObserver;

      render(
        <LazyRepositoryCard
          repository={mockRepository}
          data-testid="lazy-card"
        />
      );

      // Should render skeleton initially
      expect(screen.getByTestId('lazy-card-skeleton')).toBeInTheDocument();
    });

    it('maintains lazy loading functionality', () => {
      const mockObserve = jest.fn();
      const mockUnobserve = jest.fn();
      const mockIntersectionObserver = jest.fn();
      mockIntersectionObserver.mockReturnValue({
        observe: mockObserve,
        unobserve: mockUnobserve,
        disconnect: () => null,
      });
      window.IntersectionObserver = mockIntersectionObserver;

      render(<LazyRepositoryCard repository={mockRepository} />);

      // Should have set up intersection observer
      expect(mockIntersectionObserver).toHaveBeenCalled();
      expect(mockObserve).toHaveBeenCalled();
    });
  });

  describe('Accessibility Compliance', () => {
    it('maintains ARIA attributes in RepositoryCard', () => {
      render(<RepositoryCard repository={mockRepository} />);

      const link = screen.getByRole('link');
      expect(link).toHaveAttribute('aria-label');

      const starCount = screen.getByLabelText(/stars/);
      expect(starCount).toBeInTheDocument();

      const forkCount = screen.getByLabelText(/forks/);
      expect(forkCount).toBeInTheDocument();
    });

    it('maintains keyboard navigation in ThemeToggle', () => {
      render(
        <ThemeWrapper>
          <ThemeToggle />
        </ThemeWrapper>
      );

      const buttons = screen.getAllByRole('radio');
      buttons.forEach(button => {
        expect(button).toHaveAttribute('aria-label');
        expect(button).toHaveAttribute('aria-checked');
      });
    });

    it('maintains form accessibility in NewsletterSignup', () => {
      render(<NewsletterSignup />);

      const emailInput = screen.getByRole('textbox');
      expect(emailInput).toHaveAttribute('aria-required', 'true');
      expect(emailInput).toHaveAttribute('type', 'email');

      const submitButton = screen.getByRole('button');
      expect(submitButton).toBeInTheDocument();
    });
  });

  describe('Design Token Integration', () => {
    it('uses AppFlowy brand colors', () => {
      render(
        <RepositoryCard repository={mockRepository} data-testid="repo-card" />
      );

      const card = screen.getByTestId('repo-card');

      // Check for primary color usage in hover states
      expect(card).toHaveClass('hover:border-primary-300');
    });

    it('uses consistent border radius tokens', () => {
      render(
        <RepositoryCard repository={mockRepository} data-testid="repo-card" />
      );

      const card = screen.getByTestId('repo-card');
      expect(card).toHaveClass('rounded-xl');
    });

    it('uses AppFlowy shadow tokens', () => {
      render(
        <RepositoryCard repository={mockRepository} data-testid="repo-card" />
      );

      const card = screen.getByTestId('repo-card');
      expect(card).toHaveClass('hover:shadow-appflowy-md');
    });
  });
});
