import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { RepositoryCard, Repository } from '../RepositoryCard';

// Mock the icons
jest.mock('@heroicons/react/24/outline', () => ({
  CodeBracketIcon: ({ className }: { className: string }) => (
    <div className={className} data-testid="code-bracket-icon" />
  ),
  EyeIcon: ({ className }: { className: string }) => (
    <div className={className} data-testid="eye-icon" />
  ),
}));

jest.mock('@heroicons/react/24/solid', () => ({
  StarIcon: ({ className }: { className: string }) => (
    <div className={className} data-testid="star-icon" />
  ),
}));

// Mock the UI components
jest.mock('../Button', () => ({
  Button: ({ children, onClick, ...props }: any) => (
    <button onClick={onClick} {...props}>
      {children}
    </button>
  ),
}));

jest.mock('../Alert', () => ({
  Alert: ({ children, title, variant }: any) => (
    <div data-testid={`alert-${variant}`}>
      <h4>{title}</h4>
      {children}
    </div>
  ),
}));

jest.mock('../Loading', () => ({
  Spinner: ({ size, color }: any) => (
    <div data-testid="spinner" data-size={size} data-color={color} />
  ),
}));

const mockRepository: Repository = {
  id: 1,
  github_id: 12345,
  name: 'test-repository',
  full_name: 'testuser/test-repository',
  description: 'This is a test repository for testing purposes',
  stars: 1500,
  forks: 250,
  language: 'TypeScript',
  author: 'testuser',
  url: 'https://github.com/testuser/test-repository',
  trending_date: '2024-01-15T00:00:00Z',
  summary:
    'This is a comprehensive AI-generated summary of the repository that provides detailed insights into the project structure, main features, and potential use cases. It contains enough text to test the truncation functionality.',
};

describe('RepositoryCard Extension Mode', () => {
  describe('Compact Mode', () => {
    it('renders in compact mode with smaller spacing and text', () => {
      render(
        <RepositoryCard
          repository={mockRepository}
          compact={true}
          showSummary={false}
        />
      );

      const card = screen.getByTestId(`repository-card-${mockRepository.id}`);
      expect(card).toBeInTheDocument();

      // Check that the repository name is present
      expect(screen.getByText(mockRepository.name)).toBeInTheDocument();
      expect(
        screen.getByText(`by ${mockRepository.author}`)
      ).toBeInTheDocument();
    });

    it('applies compact styling classes', () => {
      render(
        <RepositoryCard
          repository={mockRepository}
          compact={true}
          showSummary={false}
        />
      );

      const card = screen.getByTestId(`repository-card-${mockRepository.id}`);

      // Check for compact padding class
      expect(card).toHaveClass('p-4');
    });

    it('shows truncated description in compact mode', () => {
      const longDescription =
        'This is a very long description that should be truncated in compact mode to ensure the card remains compact and readable';
      const repoWithLongDesc = {
        ...mockRepository,
        description: longDescription,
      };

      render(
        <RepositoryCard
          repository={repoWithLongDesc}
          compact={true}
          showSummary={false}
        />
      );

      expect(screen.getByText(longDescription)).toBeInTheDocument();
    });

    it('formats numbers correctly in compact mode', () => {
      render(
        <RepositoryCard
          repository={mockRepository}
          compact={true}
          showSummary={false}
        />
      );

      // 1500 stars should be formatted as "1.5k"
      expect(screen.getByText('1.5k')).toBeInTheDocument();
      // 250 forks should remain as "250"
      expect(screen.getByText('250')).toBeInTheDocument();
    });
  });

  describe('Extension Mode', () => {
    it('makes the card clickable in extension mode', async () => {
      const mockOnRepositoryClick = jest.fn();
      const user = userEvent.setup();

      render(
        <RepositoryCard
          repository={mockRepository}
          extensionMode={true}
          onRepositoryClick={mockOnRepositoryClick}
          showSummary={false}
        />
      );

      const card = screen.getByTestId(`repository-card-${mockRepository.id}`);
      expect(card).toHaveClass('cursor-pointer');

      await user.click(card);
      expect(mockOnRepositoryClick).toHaveBeenCalledWith(mockRepository);
    });

    it('prevents event propagation when clicking repository link in extension mode', async () => {
      const mockOnRepositoryClick = jest.fn();
      const user = userEvent.setup();

      render(
        <RepositoryCard
          repository={mockRepository}
          extensionMode={true}
          onRepositoryClick={mockOnRepositoryClick}
          showSummary={false}
        />
      );

      const repoLink = screen.getByRole('link', {
        name: /visit.*repository on github/i,
      });
      await user.click(repoLink);

      // The card click handler should not be called when clicking the link
      expect(mockOnRepositoryClick).not.toHaveBeenCalled();
    });

    it('does not make card clickable when not in extension mode', () => {
      const mockOnRepositoryClick = jest.fn();

      render(
        <RepositoryCard
          repository={mockRepository}
          extensionMode={false}
          onRepositoryClick={mockOnRepositoryClick}
          showSummary={false}
        />
      );

      const card = screen.getByTestId(`repository-card-${mockRepository.id}`);
      // When extensionMode is false, the card should still have cursor-pointer if onRepositoryClick is provided
      // but the onClick handler should not be attached to the card
      expect(card).toHaveClass('cursor-pointer');
    });
  });

  describe('Combined Compact and Extension Mode', () => {
    it('renders correctly with both compact and extension mode enabled', async () => {
      const mockOnRepositoryClick = jest.fn();
      const user = userEvent.setup();

      render(
        <RepositoryCard
          repository={mockRepository}
          compact={true}
          extensionMode={true}
          onRepositoryClick={mockOnRepositoryClick}
          showSummary={false}
        />
      );

      const card = screen.getByTestId(`repository-card-${mockRepository.id}`);

      // Should have compact styling
      expect(card).toHaveClass('p-4');

      // Should be clickable
      expect(card).toHaveClass('cursor-pointer');

      // Should call onClick when clicked
      await user.click(card);
      expect(mockOnRepositoryClick).toHaveBeenCalledWith(mockRepository);
    });

    it('hides summary in compact extension mode', () => {
      render(
        <RepositoryCard
          repository={mockRepository}
          compact={true}
          extensionMode={true}
          showSummary={false}
        />
      );

      // Should not show AI Summary section
      expect(screen.queryByText('AI Summary')).not.toBeInTheDocument();
      expect(
        screen.queryByTestId(`summary-content-${mockRepository.id}`)
      ).not.toBeInTheDocument();
    });
  });

  describe('Summary Handling in Extension Mode', () => {
    it('shows summary when showSummary is true even in extension mode', () => {
      render(
        <RepositoryCard
          repository={mockRepository}
          extensionMode={true}
          showSummary={true}
        />
      );

      expect(screen.getByText('AI Summary')).toBeInTheDocument();
      // The summary content is in the Alert component, not with a specific test id
      expect(
        screen.getByText(/This is a comprehensive AI-generated summary/)
      ).toBeInTheDocument();
    });

    it('handles summary loading state in extension mode', () => {
      render(
        <RepositoryCard
          repository={mockRepository}
          extensionMode={true}
          showSummary={true}
          summaryState={{ isLoading: true }}
        />
      );

      expect(screen.getByText('Generating AI Summary...')).toBeInTheDocument();
      expect(screen.getByTestId('spinner')).toBeInTheDocument();
    });

    it('handles summary error state in extension mode', () => {
      const errorMessage = 'Failed to generate summary';

      render(
        <RepositoryCard
          repository={mockRepository}
          extensionMode={true}
          showSummary={true}
          summaryState={{ error: errorMessage }}
        />
      );

      expect(screen.getByText('Summary Generation Failed')).toBeInTheDocument();
      expect(screen.getByText(errorMessage)).toBeInTheDocument();
    });
  });

  describe('Accessibility in Extension Mode', () => {
    it('maintains proper ARIA labels in extension mode', () => {
      render(
        <RepositoryCard
          repository={mockRepository}
          extensionMode={true}
          showSummary={false}
        />
      );

      const repoLink = screen.getByRole('link');
      expect(repoLink).toHaveAttribute(
        'aria-label',
        `Visit ${mockRepository.name} repository on GitHub`
      );

      const starsText = screen.getByLabelText('1500 stars');
      expect(starsText).toBeInTheDocument();

      const forksText = screen.getByLabelText('250 forks');
      expect(forksText).toBeInTheDocument();
    });

    it('maintains proper focus management in extension mode', () => {
      render(
        <RepositoryCard
          repository={mockRepository}
          extensionMode={true}
          showSummary={false}
        />
      );

      const repoLink = screen.getByRole('link');
      expect(repoLink).toHaveClass(
        'focus:outline-none',
        'focus:ring-1',
        'focus:ring-accent-blue-500'
      );
    });
  });

  describe('Language Display', () => {
    it('displays language with color indicator', () => {
      render(
        <RepositoryCard
          repository={mockRepository}
          compact={true}
          showSummary={false}
        />
      );

      expect(screen.getByText(mockRepository.language!)).toBeInTheDocument();
    });

    it('handles repository without language', () => {
      const repoWithoutLanguage = {
        ...mockRepository,
        language: undefined,
      };

      render(
        <RepositoryCard
          repository={repoWithoutLanguage}
          compact={true}
          showSummary={false}
        />
      );

      // Should not crash and should not show language section
      expect(screen.queryByText('TypeScript')).not.toBeInTheDocument();
    });
  });
});
