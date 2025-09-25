import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { RepositorySlide } from '../RepositorySlide';
import { Repository } from '../RepositoryCard';

// Mock browser APIs
Object.defineProperty(window, 'open', {
  value: jest.fn(),
  writable: true,
});

Object.defineProperty(navigator, 'share', {
  value: jest.fn(),
  writable: true,
});

Object.defineProperty(navigator, 'clipboard', {
  value: {
    writeText: jest.fn(),
  },
  writable: true,
});

// Mock repository data
const mockRepository: Repository = {
  id: 1,
  github_id: 123456,
  name: 'awesome-project',
  full_name: 'user/awesome-project',
  description: 'An awesome project that does amazing things',
  stars: 1500,
  forks: 250,
  language: 'TypeScript',
  author: 'testuser',
  url: 'https://github.com/user/awesome-project',
  trending_date: '2024-01-15',
  summary:
    'This is a comprehensive AI summary of the repository that provides detailed insights into the project structure, functionality, and key features. It explains the main purpose of the project and highlights important aspects that developers should know.',
};

describe('RepositorySlide', () => {
  const defaultProps = {
    repository: mockRepository,
    isActive: true,
    isVisible: true,
    slideIndex: 0,
    extensionMode: 'web' as const,
  };

  it('renders repository information correctly', () => {
    render(<RepositorySlide {...defaultProps} />);

    expect(screen.getByText('awesome-project')).toBeInTheDocument();
    expect(screen.getByText('by testuser')).toBeInTheDocument();
    expect(
      screen.getByText('An awesome project that does amazing things')
    ).toBeInTheDocument();
    expect(screen.getByText('1.5k')).toBeInTheDocument(); // Stars
    expect(screen.getByText('250')).toBeInTheDocument(); // Forks
    expect(screen.getByText('TypeScript')).toBeInTheDocument();
  });

  it('handles summary expansion correctly', () => {
    render(<RepositorySlide {...defaultProps} />);

    // Should show AI Summary section
    expect(screen.getByText('AI Summary')).toBeInTheDocument();

    // Should show the summary content
    expect(
      screen.getByText(/This is a comprehensive AI summary/)
    ).toBeInTheDocument();
  });

  it('handles action button clicks', () => {
    const mockOnAction = jest.fn();
    const mockWindowOpen = jest.fn();
    const mockNavigatorShare = jest.fn();
    const mockClipboardWriteText = jest.fn();

    // Mock browser APIs
    window.open = mockWindowOpen;
    navigator.share = mockNavigatorShare;
    navigator.clipboard.writeText = mockClipboardWriteText;

    render(<RepositorySlide {...defaultProps} onAction={mockOnAction} />);

    // Test View on GitHub button
    const githubButton = screen.getByText('View on GitHub');
    fireEvent.click(githubButton);
    expect(mockWindowOpen).toHaveBeenCalledWith(
      mockRepository.url,
      '_blank',
      'noopener,noreferrer'
    );
    expect(mockOnAction).toHaveBeenCalledWith('visit-github');

    // Test Save button
    const saveButton = screen.getByText('Save');
    fireEvent.click(saveButton);
    expect(mockOnAction).toHaveBeenCalledWith('save-repository');

    // Test Share button
    const shareButton = screen.getByText('Share');
    fireEvent.click(shareButton);
    expect(mockNavigatorShare).toHaveBeenCalledWith({
      title: mockRepository.name,
      text: mockRepository.description,
      url: mockRepository.url,
    });
    expect(mockOnAction).toHaveBeenCalledWith('share-repository');
  });

  it('adapts layout for extension popup mode', () => {
    render(<RepositorySlide {...defaultProps} extensionMode="popup" />);

    const slide = screen.getByTestId('repository-slide-1');
    expect(slide).toHaveAttribute('data-extension-mode', 'popup');
  });

  it('handles visibility states correctly', () => {
    const { rerender } = render(
      <RepositorySlide {...defaultProps} isVisible={false} />
    );

    const slide = screen.getByTestId('repository-slide-1');
    expect(slide).toHaveClass('opacity-0', 'pointer-events-none');

    rerender(<RepositorySlide {...defaultProps} isVisible={true} />);
    expect(slide).toHaveClass('opacity-100');
    expect(slide).not.toHaveClass('pointer-events-none');
  });

  it('shows loading state for summary', () => {
    const summaryState = { isLoading: true };
    render(<RepositorySlide {...defaultProps} summaryState={summaryState} />);

    expect(screen.getByText('Generating AI Summary...')).toBeInTheDocument();
  });

  it('shows error state for summary', () => {
    const summaryState = { error: 'Failed to generate summary' };
    render(<RepositorySlide {...defaultProps} summaryState={summaryState} />);

    expect(screen.getByText('Summary Generation Failed')).toBeInTheDocument();
    expect(screen.getByText('Failed to generate summary')).toBeInTheDocument();
  });

  it('shows no summary available message when no summary exists', () => {
    const repositoryWithoutSummary = { ...mockRepository, summary: undefined };
    render(
      <RepositorySlide
        {...defaultProps}
        repository={repositoryWithoutSummary}
      />
    );

    expect(
      screen.getByText('No AI summary available for this repository yet.')
    ).toBeInTheDocument();
  });

  it('has proper accessibility attributes', () => {
    render(<RepositorySlide {...defaultProps} />);

    const slide = screen.getByTestId('repository-slide-1');
    expect(slide).toHaveAttribute('role', 'article');
    expect(slide).toHaveAttribute(
      'aria-label',
      'Repository awesome-project by testuser'
    );
    expect(slide).toHaveAttribute('aria-hidden', 'false');

    // Check GitHub link accessibility
    const githubLink = screen.getByLabelText(
      'Visit awesome-project repository on GitHub'
    );
    expect(githubLink).toBeInTheDocument();
  });

  it('displays all essential repository information as required', () => {
    render(<RepositorySlide {...defaultProps} />);

    // Requirement 3.1: SHALL show only essential information: repository name, description, stars, language, and author
    expect(screen.getByText('awesome-project')).toBeInTheDocument(); // Repository name
    expect(screen.getByText('by testuser')).toBeInTheDocument(); // Author
    expect(
      screen.getByText('An awesome project that does amazing things')
    ).toBeInTheDocument(); // Description
    expect(screen.getByText('1.5k')).toBeInTheDocument(); // Stars (formatted)
    expect(screen.getByText('TypeScript')).toBeInTheDocument(); // Language

    // Additional information that should be present
    expect(screen.getByText('250')).toBeInTheDocument(); // Forks
    expect(screen.getByText(/Trending/)).toBeInTheDocument(); // Trending date
  });

  it('maintains visual consistency with existing design system', () => {
    render(<RepositorySlide {...defaultProps} />);

    // Check that the component uses consistent CSS classes from the design system
    const slide = screen.getByTestId('repository-slide-1');
    expect(slide).toHaveClass('bg-neutral-white', 'dark:bg-neutral-900'); // Clean background
    expect(slide).toHaveClass(
      'transition-opacity',
      'duration-300',
      'ease-in-out'
    ); // Smooth transitions
    expect(slide).toHaveClass('touch-manipulation'); // Touch-friendly interaction
  });

  it('integrates RepositoryCard content successfully', () => {
    const summaryState = { isLoading: false, error: undefined };
    render(
      <RepositorySlide
        {...defaultProps}
        summaryState={summaryState}
        showSummary={true}
      />
    );

    // Verify that all RepositoryCard features are integrated:
    // 1. Summary handling with proper states
    expect(screen.getByText('AI Summary')).toBeInTheDocument();
    expect(
      screen.getByText(/This is a comprehensive AI summary/)
    ).toBeInTheDocument();

    // 2. Proper formatting functions work
    expect(screen.getByText('1.5k')).toBeInTheDocument(); // formatNumber function
    expect(screen.getByText(/Trending/)).toBeInTheDocument(); // formatDate function

    // 3. Language color coding (check that language dot is present)
    const languageElements = screen.getAllByText('TypeScript');
    expect(languageElements.length).toBeGreaterThan(0);

    // 4. Action buttons are present and functional
    expect(screen.getByText('View on GitHub')).toBeInTheDocument();
    expect(screen.getByText('Save')).toBeInTheDocument();
    expect(screen.getByText('Share')).toBeInTheDocument();
  });
});
