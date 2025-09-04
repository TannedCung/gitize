import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SearchBar } from '../SearchBar';

describe('SearchBar', () => {
  let mockOnSearch: jest.Mock;

  beforeEach(() => {
    mockOnSearch = jest.fn();
  });

  it('renders with default placeholder', () => {
    render(<SearchBar onSearch={mockOnSearch} />);

    expect(
      screen.getByPlaceholderText('Search repositories...')
    ).toBeInTheDocument();
  });

  it('renders with custom placeholder', () => {
    render(
      <SearchBar onSearch={mockOnSearch} placeholder="Custom placeholder" />
    );

    expect(
      screen.getByPlaceholderText('Custom placeholder')
    ).toBeInTheDocument();
  });

  it('shows initial value', () => {
    render(<SearchBar onSearch={mockOnSearch} initialValue="initial search" />);

    expect(screen.getByDisplayValue('initial search')).toBeInTheDocument();
  });

  it('calls onSearch with debounce', async () => {
    render(<SearchBar onSearch={mockOnSearch} debounceMs={100} />);

    const input = screen.getByPlaceholderText('Search repositories...');

    // Type in the input
    await userEvent.type(input, 'react');

    // Should not call immediately
    expect(mockOnSearch).not.toHaveBeenCalled();

    // Wait for debounce
    await waitFor(
      () => {
        expect(mockOnSearch).toHaveBeenCalledWith('react');
      },
      { timeout: 200 }
    );
  });

  it('shows loading indicator while searching', async () => {
    render(<SearchBar onSearch={mockOnSearch} debounceMs={100} />);

    const input = screen.getByPlaceholderText('Search repositories...');

    // Type in the input
    await userEvent.type(input, 'vue');

    // Should show loading indicator
    const spinner = document.querySelector('.animate-spin');
    expect(spinner).toBeInTheDocument();

    // Wait for debounce to complete
    await waitFor(
      () => {
        expect(mockOnSearch).toHaveBeenCalledWith('vue');
      },
      { timeout: 200 }
    );
  });

  it('shows clear button when there is text', async () => {
    render(<SearchBar onSearch={mockOnSearch} />);

    const input = screen.getByPlaceholderText('Search repositories...');

    // Initially no clear button
    expect(
      screen.queryByRole('button', { name: /clear/i })
    ).not.toBeInTheDocument();

    // Type in the input
    await userEvent.type(input, 'angular');

    // Should show clear button
    expect(screen.getByRole('button')).toBeInTheDocument();
  });

  it('clears input when clear button is clicked', async () => {
    render(<SearchBar onSearch={mockOnSearch} />);

    const input = screen.getByPlaceholderText('Search repositories...');

    // Type in the input
    await userEvent.type(input, 'svelte');

    // Click clear button
    const clearButton = screen.getByRole('button');
    await userEvent.click(clearButton);

    // Input should be cleared
    expect(input).toHaveValue('');
    expect(mockOnSearch).toHaveBeenCalledWith('');
  });

  it('calls onSearch immediately on form submit', async () => {
    render(<SearchBar onSearch={mockOnSearch} debounceMs={100} />);

    const input = screen.getByPlaceholderText('Search repositories...');

    // Type in the input
    await userEvent.type(input, 'nextjs');

    // Submit form (press Enter)
    fireEvent.submit(input.closest('form')!);

    // Should call immediately without waiting for debounce
    expect(mockOnSearch).toHaveBeenCalledWith('nextjs');
  });

  it('shows search suggestion when typing', async () => {
    render(<SearchBar onSearch={mockOnSearch} />);

    const input = screen.getByPlaceholderText('Search repositories...');

    // Type in the input
    await userEvent.type(input, 'typescript');

    // Should show suggestion
    expect(
      screen.getByText('Press Enter to search for "typescript"')
    ).toBeInTheDocument();
  });

  it('applies custom className', () => {
    const { container } = render(
      <SearchBar onSearch={mockOnSearch} className="custom-search-class" />
    );

    expect(container.firstChild).toHaveClass('custom-search-class');
  });

  it('debounces multiple rapid changes', async () => {
    render(<SearchBar onSearch={mockOnSearch} debounceMs={100} />);

    const input = screen.getByPlaceholderText('Search repositories...');

    // Type multiple characters rapidly
    await userEvent.type(input, 'abc');

    // Should not call immediately
    expect(mockOnSearch).not.toHaveBeenCalled();

    // Wait for debounce
    await waitFor(
      () => {
        expect(mockOnSearch).toHaveBeenCalledTimes(1);
        expect(mockOnSearch).toHaveBeenCalledWith('abc');
      },
      { timeout: 200 }
    );
  });
});
