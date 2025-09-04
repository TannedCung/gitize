import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { RepositoryCard, Repository } from '../RepositoryCard';

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
  summary:
    'This is a comprehensive AI-generated summary of the repository that explains what the project does, its main features, and why it might be useful for developers. It provides detailed insights into the codebase and its potential applications.',
};

describe('RepositoryCard', () => {
  it('renders repository information correctly', () => {
    render(<RepositoryCard repository={mockRepository} />);

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

  it('formats large numbers correctly', () => {
    const repoWithLargeNumbers: Repository = {
      ...mockRepository,
      stars: 1500000,
      forks: 25000,
    };

    render(<RepositoryCard repository={repoWithLargeNumbers} />);

    expect(screen.getByText('1.5M')).toBeInTheDocument();
    expect(screen.getByText('25.0k')).toBeInTheDocument();
  });

  it('shows AI summary when provided', () => {
    render(<RepositoryCard repository={mockRepository} showSummary={true} />);

    expect(screen.getByText('AI Summary')).toBeInTheDocument();
    expect(
      screen.getByText(/This is a comprehensive AI-generated summary/)
    ).toBeInTheDocument();
  });

  it('hides AI summary when showSummary is false', () => {
    render(<RepositoryCard repository={mockRepository} showSummary={false} />);

    expect(screen.queryByText('AI Summary')).not.toBeInTheDocument();
  });

  it('truncates long summaries and shows expand/collapse', () => {
    const longSummary = 'A'.repeat(250); // Long summary
    const repoWithLongSummary: Repository = {
      ...mockRepository,
      summary: longSummary,
    };

    render(<RepositoryCard repository={repoWithLongSummary} />);

    expect(screen.getByText('Show more')).toBeInTheDocument();

    // Click to expand
    fireEvent.click(screen.getByText('Show more'));
    expect(screen.getByText('Show less')).toBeInTheDocument();

    // Click to collapse
    fireEvent.click(screen.getByText('Show less'));
    expect(screen.getByText('Show more')).toBeInTheDocument();
  });

  it('renders without description', () => {
    const repoWithoutDescription: Repository = {
      ...mockRepository,
      description: undefined,
    };

    render(<RepositoryCard repository={repoWithoutDescription} />);

    expect(screen.getByText('awesome-project')).toBeInTheDocument();
    expect(
      screen.queryByText('This is an awesome project')
    ).not.toBeInTheDocument();
  });

  it('renders without language', () => {
    const repoWithoutLanguage: Repository = {
      ...mockRepository,
      language: undefined,
    };

    render(<RepositoryCard repository={repoWithoutLanguage} />);

    expect(screen.getByText('awesome-project')).toBeInTheDocument();
    expect(screen.queryByText('TypeScript')).not.toBeInTheDocument();
  });

  it('has correct external link', () => {
    render(<RepositoryCard repository={mockRepository} />);

    const link = screen.getByRole('link', { name: 'awesome-project' });
    expect(link).toHaveAttribute(
      'href',
      'https://github.com/user/awesome-project'
    );
    expect(link).toHaveAttribute('target', '_blank');
    expect(link).toHaveAttribute('rel', 'noopener noreferrer');
  });
});
