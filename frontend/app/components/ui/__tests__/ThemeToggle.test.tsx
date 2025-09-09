import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe, toHaveNoViolations } from 'jest-axe';
import { ThemeToggle } from '../ThemeToggle';
import { ThemeProvider } from '../../../contexts/ThemeContext';

expect.extend(toHaveNoViolations);

// Mock localStorage
const mockLocalStorage = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};

Object.defineProperty(window, 'localStorage', {
  value: mockLocalStorage,
});

// Mock matchMedia
const mockMatchMedia = jest.fn();
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: mockMatchMedia,
});

describe('ThemeToggle', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockLocalStorage.getItem.mockReturnValue(null);

    mockMatchMedia.mockImplementation(query => ({
      matches: query === '(prefers-color-scheme: dark)' ? false : true,
      media: query,
      onchange: null,
      addListener: jest.fn(),
      removeListener: jest.fn(),
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
      dispatchEvent: jest.fn(),
    }));
  });

  it('renders all theme options', () => {
    render(
      <ThemeProvider>
        <ThemeToggle />
      </ThemeProvider>
    );

    expect(screen.getByTitle('Light')).toBeInTheDocument();
    expect(screen.getByTitle('Dark')).toBeInTheDocument();
    expect(screen.getByTitle('System (light)')).toBeInTheDocument();
  });

  it('shows system theme as active by default', () => {
    render(
      <ThemeProvider>
        <ThemeToggle />
      </ThemeProvider>
    );

    const systemButton = screen.getByTestId('theme-toggle-system');
    expect(systemButton).toHaveClass('appflowy-border-glow');
  });

  it('changes theme when buttons are clicked', async () => {
    const user = userEvent.setup();

    render(
      <ThemeProvider>
        <ThemeToggle />
      </ThemeProvider>
    );

    const lightButton = screen.getByTestId('theme-toggle-light');
    await user.click(lightButton);

    expect(lightButton).toHaveClass('appflowy-border-glow');
    expect(mockLocalStorage.setItem).toHaveBeenCalledWith(
      'appflowy-theme',
      'light'
    );
  });

  it('shows system preference in tooltip for system theme', () => {
    render(
      <ThemeProvider>
        <ThemeToggle />
      </ThemeProvider>
    );

    const systemButton = screen.getByTestId('theme-toggle-system');
    expect(systemButton).toHaveAttribute('title', 'System (light)');
  });

  it('disables buttons during theme transition', async () => {
    const user = userEvent.setup();

    render(
      <ThemeProvider>
        <ThemeToggle />
      </ThemeProvider>
    );

    const lightButton = screen.getByTestId('theme-toggle-light');
    await user.click(lightButton);

    // During transition, buttons should be disabled
    expect(lightButton).toBeDisabled();
  });

  it('shows labels when showLabels is true', () => {
    render(
      <ThemeProvider>
        <ThemeToggle showLabels />
      </ThemeProvider>
    );

    expect(screen.getByText('Light')).toBeInTheDocument();
    expect(screen.getByText('Dark')).toBeInTheDocument();
    expect(screen.getByText(/System/)).toBeInTheDocument();
  });

  it('applies different sizes correctly', () => {
    const { rerender } = render(
      <ThemeProvider>
        <ThemeToggle size="sm" />
      </ThemeProvider>
    );

    let buttons = screen.getAllByRole('radio');
    expect(buttons[0]).toHaveClass('p-1.5');

    rerender(
      <ThemeProvider>
        <ThemeToggle size="lg" />
      </ThemeProvider>
    );

    buttons = screen.getAllByRole('radio');
    expect(buttons[0]).toHaveClass('p-2.5');
  });

  it('has proper accessibility attributes', () => {
    render(
      <ThemeProvider>
        <ThemeToggle />
      </ThemeProvider>
    );

    const container = screen.getByRole('radiogroup');
    expect(container).toHaveAttribute('aria-label', 'Theme selection');

    const buttons = screen.getAllByRole('radio');
    buttons.forEach(button => {
      expect(button).toHaveAttribute('aria-checked');
      expect(button).toHaveAttribute('aria-label');
    });
  });

  it('should not have accessibility violations', async () => {
    const { container } = render(
      <ThemeProvider>
        <ThemeToggle />
      </ThemeProvider>
    );

    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('responds to system preference changes', async () => {
    let mediaQueryCallback: ((_e: MediaQueryListEvent) => void) | null = null;

    mockMatchMedia.mockImplementation(query => ({
      matches: query === '(prefers-color-scheme: dark)' ? false : true,
      media: query,
      onchange: null,
      addListener: jest.fn(),
      removeListener: jest.fn(),
      addEventListener: jest.fn((event, callback) => {
        if (event === 'change') {
          mediaQueryCallback = callback;
        }
      }),
      removeEventListener: jest.fn(),
      dispatchEvent: jest.fn(),
    }));

    render(
      <ThemeProvider>
        <ThemeToggle />
      </ThemeProvider>
    );

    // Initially light system preference
    expect(screen.getByTitle('System (light)')).toBeInTheDocument();

    // Simulate system preference change to dark
    if (mediaQueryCallback) {
      fireEvent(window, new Event('change'));
      mediaQueryCallback({ matches: true } as MediaQueryListEvent);
    }

    await waitFor(() => {
      expect(screen.getByTitle('System (dark)')).toBeInTheDocument();
    });
  });
});
