import React from 'react';
import { render, screen, act, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ThemeProvider, useTheme } from '../ThemeContext';

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

// Test component that uses the theme context
function TestComponent() {
  const {
    theme,
    setTheme,
    resolvedTheme,
    designTokens,
    isTransitioning,
    systemPreference,
  } = useTheme();

  return (
    <div>
      <div data-testid="current-theme">{theme}</div>
      <div data-testid="resolved-theme">{resolvedTheme}</div>
      <div data-testid="system-preference">{systemPreference}</div>
      <div data-testid="is-transitioning">{isTransitioning.toString()}</div>
      <div data-testid="accent-blue">{designTokens.colors.accent.blue}</div>
      <div data-testid="background-color">{designTokens.colors.background}</div>
      <div data-testid="text-color">{designTokens.colors.text}</div>
      <button onClick={() => setTheme('light')} data-testid="set-light">
        Light
      </button>
      <button onClick={() => setTheme('dark')} data-testid="set-dark">
        Dark
      </button>
      <button onClick={() => setTheme('system')} data-testid="set-system">
        System
      </button>
    </div>
  );
}

describe('ThemeContext', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockLocalStorage.getItem.mockReturnValue(null);

    // Mock light system preference by default
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

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('should provide default theme values', () => {
    render(
      <ThemeProvider>
        <TestComponent />
      </ThemeProvider>
    );

    expect(screen.getByTestId('current-theme')).toHaveTextContent('system');
    expect(screen.getByTestId('resolved-theme')).toHaveTextContent('light');
    expect(screen.getByTestId('system-preference')).toHaveTextContent('light');
    expect(screen.getByTestId('is-transitioning')).toHaveTextContent('false');
    expect(screen.getByTestId('accent-blue')).toHaveTextContent('#3B82F6');
    expect(screen.getByTestId('background-color')).toHaveTextContent('#FFFFFF');
    expect(screen.getByTestId('text-color')).toHaveTextContent('#171717');
  });

  it('should load saved theme from localStorage', () => {
    mockLocalStorage.getItem.mockReturnValue('dark');

    render(
      <ThemeProvider>
        <TestComponent />
      </ThemeProvider>
    );

    expect(screen.getByTestId('current-theme')).toHaveTextContent('dark');
    expect(screen.getByTestId('resolved-theme')).toHaveTextContent('dark');
  });

  it('should detect system dark preference', () => {
    mockMatchMedia.mockImplementation(query => ({
      matches: query === '(prefers-color-scheme: dark)' ? true : false,
      media: query,
      onchange: null,
      addListener: jest.fn(),
      removeListener: jest.fn(),
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
      dispatchEvent: jest.fn(),
    }));

    render(
      <ThemeProvider>
        <TestComponent />
      </ThemeProvider>
    );

    expect(screen.getByTestId('system-preference')).toHaveTextContent('dark');
    expect(screen.getByTestId('resolved-theme')).toHaveTextContent('dark');
  });

  it('should change theme and persist to localStorage', async () => {
    const user = userEvent.setup();

    render(
      <ThemeProvider>
        <TestComponent />
      </ThemeProvider>
    );

    await user.click(screen.getByTestId('set-dark'));

    expect(screen.getByTestId('current-theme')).toHaveTextContent('dark');
    expect(screen.getByTestId('resolved-theme')).toHaveTextContent('dark');
    expect(mockLocalStorage.setItem).toHaveBeenCalledWith(
      'appflowy-theme',
      'dark'
    );
  });

  it('should show transitioning state when changing themes', async () => {
    const user = userEvent.setup();

    render(
      <ThemeProvider>
        <TestComponent />
      </ThemeProvider>
    );

    await user.click(screen.getByTestId('set-dark'));

    // Should briefly show transitioning state
    expect(screen.getByTestId('is-transitioning')).toHaveTextContent('true');

    // Wait for transition to complete
    await waitFor(
      () => {
        expect(screen.getByTestId('is-transitioning')).toHaveTextContent(
          'false'
        );
      },
      { timeout: 500 }
    );
  });

  it('should update design tokens when theme changes', async () => {
    const user = userEvent.setup();

    render(
      <ThemeProvider>
        <TestComponent />
      </ThemeProvider>
    );

    // Initially light theme with neutral colors
    expect(screen.getByTestId('accent-blue')).toHaveTextContent('#3B82F6');
    expect(screen.getByTestId('background-color')).toHaveTextContent('#FFFFFF');

    await user.click(screen.getByTestId('set-dark'));

    // Dark theme should use brighter accent colors and inverted background
    await waitFor(() => {
      expect(screen.getByTestId('accent-blue')).toHaveTextContent('#60A5FA');
      expect(screen.getByTestId('background-color')).toHaveTextContent(
        '#000000'
      );
    });
  });

  it('should follow system preference when theme is system', async () => {
    const _user = userEvent.setup();
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
        <TestComponent />
      </ThemeProvider>
    );

    // Initially system theme with light preference
    expect(screen.getByTestId('current-theme')).toHaveTextContent('system');
    expect(screen.getByTestId('resolved-theme')).toHaveTextContent('light');

    // Simulate system preference change to dark
    if (mediaQueryCallback) {
      act(() => {
        mediaQueryCallback({ matches: true } as MediaQueryListEvent);
      });
    }

    await waitFor(() => {
      expect(screen.getByTestId('system-preference')).toHaveTextContent('dark');
      expect(screen.getByTestId('resolved-theme')).toHaveTextContent('dark');
    });
  });

  it('should handle localStorage errors gracefully', async () => {
    const user = userEvent.setup();
    const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();

    mockLocalStorage.setItem.mockImplementation(() => {
      throw new Error('Storage quota exceeded');
    });

    render(
      <ThemeProvider>
        <TestComponent />
      </ThemeProvider>
    );

    await user.click(screen.getByTestId('set-dark'));

    expect(consoleSpy).toHaveBeenCalledWith(
      'Failed to save theme preference:',
      expect.any(Error)
    );

    consoleSpy.mockRestore();
  });

  it('should apply theme classes to document element', async () => {
    const user = userEvent.setup();

    render(
      <ThemeProvider>
        <TestComponent />
      </ThemeProvider>
    );

    // Initially should have light class
    expect(document.documentElement.classList.contains('light')).toBe(true);
    expect(document.documentElement.classList.contains('dark')).toBe(false);

    await user.click(screen.getByTestId('set-dark'));

    await waitFor(() => {
      expect(document.documentElement.classList.contains('dark')).toBe(true);
      expect(document.documentElement.classList.contains('light')).toBe(false);
    });
  });

  it('should set CSS custom properties for design tokens', async () => {
    const user = userEvent.setup();

    render(
      <ThemeProvider>
        <TestComponent />
      </ThemeProvider>
    );

    // Check initial CSS custom properties
    expect(
      document.documentElement.style.getPropertyValue('--color-accent-blue')
    ).toBe('#3B82F6');
    expect(
      document.documentElement.style.getPropertyValue('--color-background')
    ).toBe('#FFFFFF');

    await user.click(screen.getByTestId('set-dark'));

    await waitFor(() => {
      expect(
        document.documentElement.style.getPropertyValue('--color-accent-blue')
      ).toBe('#60A5FA');
      expect(
        document.documentElement.style.getPropertyValue('--color-background')
      ).toBe('#000000');
    });
  });

  it('should dispatch theme change events', async () => {
    const user = userEvent.setup();
    const eventListener = jest.fn();

    window.addEventListener('themeChange', eventListener);

    render(
      <ThemeProvider>
        <TestComponent />
      </ThemeProvider>
    );

    await user.click(screen.getByTestId('set-dark'));

    await waitFor(() => {
      expect(eventListener).toHaveBeenCalledWith(
        expect.objectContaining({
          detail: expect.objectContaining({
            theme: 'dark',
            tokens: expect.any(Object),
          }),
        })
      );
    });

    window.removeEventListener('themeChange', eventListener);
  });

  it('should throw error when useTheme is used outside provider', () => {
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

    expect(() => {
      render(<TestComponent />);
    }).toThrow('useTheme must be used within a ThemeProvider');

    consoleSpy.mockRestore();
  });
});
