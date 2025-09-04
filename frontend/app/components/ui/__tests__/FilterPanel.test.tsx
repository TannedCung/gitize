import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { FilterPanel, FilterOptions } from '../FilterPanel';

describe('FilterPanel', () => {
  const mockOnFiltersChange = jest.fn();
  const defaultFilters: FilterOptions = {};

  beforeEach(() => {
    mockOnFiltersChange.mockClear();
  });

  it('renders all filter sections', () => {
    render(
      <FilterPanel
        filters={defaultFilters}
        onFiltersChange={mockOnFiltersChange}
      />
    );

    expect(screen.getByText('Filters')).toBeInTheDocument();
    expect(screen.getByText('Language')).toBeInTheDocument();
    expect(screen.getByText('Stars')).toBeInTheDocument();
    expect(screen.getByText('Time Range')).toBeInTheDocument();
    expect(screen.getByText('Clear all filters')).toBeInTheDocument();
  });

  it('shows default values correctly', () => {
    render(
      <FilterPanel
        filters={defaultFilters}
        onFiltersChange={mockOnFiltersChange}
      />
    );

    expect(screen.getByDisplayValue('All Languages')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Any stars')).toBeInTheDocument();
    expect(screen.getByDisplayValue('All time')).toBeInTheDocument();
  });

  it('calls onFiltersChange when language is changed', () => {
    render(
      <FilterPanel
        filters={defaultFilters}
        onFiltersChange={mockOnFiltersChange}
      />
    );

    const languageSelect = screen.getByDisplayValue('All Languages');
    fireEvent.change(languageSelect, { target: { value: 'JavaScript' } });

    expect(mockOnFiltersChange).toHaveBeenCalledWith({
      language: 'JavaScript',
    });
  });

  it('calls onFiltersChange when star range is changed', () => {
    render(
      <FilterPanel
        filters={defaultFilters}
        onFiltersChange={mockOnFiltersChange}
      />
    );

    const starsSelect = screen.getByDisplayValue('Any stars');
    fireEvent.change(starsSelect, { target: { value: '100+ stars' } });

    expect(mockOnFiltersChange).toHaveBeenCalledWith({
      minStars: 100,
      maxStars: undefined,
    });
  });

  it('calls onFiltersChange when date range is changed', () => {
    render(
      <FilterPanel
        filters={defaultFilters}
        onFiltersChange={mockOnFiltersChange}
      />
    );

    const dateSelect = screen.getByDisplayValue('All time');
    fireEvent.change(dateSelect, { target: { value: 'This week' } });

    expect(mockOnFiltersChange).toHaveBeenCalledWith({
      dateRange: 'week',
    });
  });

  it('displays current filter values correctly', () => {
    const filtersWithValues: FilterOptions = {
      language: 'Python',
      minStars: 1000,
      dateRange: 'today',
    };

    render(
      <FilterPanel
        filters={filtersWithValues}
        onFiltersChange={mockOnFiltersChange}
      />
    );

    expect(screen.getByDisplayValue('Python')).toBeInTheDocument();
    expect(screen.getByDisplayValue('1k+ stars')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Today')).toBeInTheDocument();
  });

  it('clears all filters when clear button is clicked', () => {
    const filtersWithValues: FilterOptions = {
      language: 'Python',
      minStars: 1000,
      dateRange: 'today',
    };

    render(
      <FilterPanel
        filters={filtersWithValues}
        onFiltersChange={mockOnFiltersChange}
      />
    );

    const clearButton = screen.getByText('Clear all filters');
    fireEvent.click(clearButton);

    expect(mockOnFiltersChange).toHaveBeenCalledWith({});
  });

  it('handles "All Languages" selection correctly', () => {
    const filtersWithLanguage: FilterOptions = {
      language: 'JavaScript',
    };

    render(
      <FilterPanel
        filters={filtersWithLanguage}
        onFiltersChange={mockOnFiltersChange}
      />
    );

    const languageSelect = screen.getByDisplayValue('JavaScript');
    fireEvent.change(languageSelect, { target: { value: 'All Languages' } });

    expect(mockOnFiltersChange).toHaveBeenCalledWith({
      language: undefined,
    });
  });

  it('applies custom className', () => {
    const { container } = render(
      <FilterPanel
        filters={defaultFilters}
        onFiltersChange={mockOnFiltersChange}
        className="custom-class"
      />
    );

    expect(container.firstChild).toHaveClass('custom-class');
  });
});
