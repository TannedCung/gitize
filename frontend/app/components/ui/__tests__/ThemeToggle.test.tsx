import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { ThemeToggle } from '../ThemeToggle';

// Mock the useTheme hook
const mockSetTheme = jest.fn();
const mockUseTheme = {
  theme: 'system' as const,
  setTheme: mockSetTheme,
  resolvedTheme: 'light' as const,
};

jest.mock('../../../contexts/ThemeContext', () => ({
  ...jest.requireActual('../../../contexts/ThemeContext'),
  useTheme: () => mockUseTheme,
}));

describe('ThemeToggle', () => {
  beforeEach(() => {
    mockSetTheme.mockClear();
  });

  it('renders all theme options', () => {
    render(<ThemeToggle />);

    expect(screen.getByTitle('Light')).toBeInTheDocument();
    expect(screen.getByTitle('Dark')).toBeInTheDocument();
    expect(screen.getByTitle('System')).toBeInTheDocument();
  });

  it('shows system theme as active by default', () => {
    render(<ThemeToggle />);

    const systemButton = screen.getByTitle('System');
    expect(systemButton).toHaveClass(
      'bg-white',
      'dark:bg-gray-700',
      'text-primary-600'
    );
  });

  it('calls setTheme when light theme is clicked', () => {
    render(<ThemeToggle />);

    const lightButton = screen.getByTitle('Light');
    fireEvent.click(lightButton);

    expect(mockSetTheme).toHaveBeenCalledWith('light');
  });

  it('calls setTheme when dark theme is clicked', () => {
    render(<ThemeToggle />);

    const darkButton = screen.getByTitle('Dark');
    fireEvent.click(darkButton);

    expect(mockSetTheme).toHaveBeenCalledWith('dark');
  });

  it('calls setTheme when system theme is clicked', () => {
    render(<ThemeToggle />);

    const systemButton = screen.getByTitle('System');
    fireEvent.click(systemButton);

    expect(mockSetTheme).toHaveBeenCalledWith('system');
  });

  it('shows light theme as active when selected', () => {
    mockUseTheme.theme = 'light';

    render(<ThemeToggle />);

    const lightButton = screen.getByTitle('Light');
    expect(lightButton).toHaveClass(
      'bg-white',
      'dark:bg-gray-700',
      'text-primary-600'
    );

    const darkButton = screen.getByTitle('Dark');
    expect(darkButton).not.toHaveClass(
      'bg-white',
      'dark:bg-gray-700',
      'text-primary-600'
    );
  });

  it('shows dark theme as active when selected', () => {
    mockUseTheme.theme = 'dark';

    render(<ThemeToggle />);

    const darkButton = screen.getByTitle('Dark');
    expect(darkButton).toHaveClass(
      'bg-white',
      'dark:bg-gray-700',
      'text-primary-600'
    );

    const lightButton = screen.getByTitle('Light');
    expect(lightButton).not.toHaveClass(
      'bg-white',
      'dark:bg-gray-700',
      'text-primary-600'
    );
  });
});
