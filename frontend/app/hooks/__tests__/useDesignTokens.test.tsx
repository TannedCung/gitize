import React from 'react';
import { render, screen, act } from '@testing-library/react';
import { useDesignTokens, useThemeTransition } from '../useDesignTokens';
import { ThemeProvider } from '../../contexts/ThemeContext';

// Mock matchMedia
const mockMatchMedia = jest.fn();
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: mockMatchMedia,
});

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

function TestDesignTokensComponent() {
  const {
    tokens: _tokens,
    colors,
    spacing: _spacing,
    borderRadius: _borderRadius,
    shadows: _shadows,
    theme,
    isTransitioning,
    cssVariables,
    getToken,
    getCSSVariable,
    getTokenStyles: _getTokenStyles,
    getColorWithOpacity,
    getBrandGradient,
    getResponsiveSpacing,
  } = useDesignTokens();

  return (
    <div>
      <div data-testid="theme">{theme}</div>
      <div data-testid="primary-color">{colors.primary}</div>
      <div data-testid="is-transitioning">{isTransitioning.toString()}</div>
      <div data-testid="css-var-primary">{cssVariables['--color-primary']}</div>
      <div data-testid="get-token">{getToken('colors', 'primary')}</div>
      <div data-testid="css-variable">{getCSSVariable('color', 'primary')}</div>
      <div data-testid="color-with-opacity">
        {getColorWithOpacity('primary', 0.5)}
      </div>
      <div data-testid="brand-gradient">{getBrandGradient()}</div>
      <div data-testid="responsive-spacing">
        {getResponsiveSpacing('md', 2)}
      </div>
    </div>
  );
}

function TestThemeTransitionComponent() {
  const { isTransitioning, transitionClass, theme } = useThemeTransition();

  return (
    <div>
      <div data-testid="transition-is-transitioning">
        {isTransitioning.toString()}
      </div>
      <div data-testid="transition-class">{transitionClass}</div>
      <div data-testid="transition-theme">{theme}</div>
    </div>
  );
}

describe('useDesignTokens', () => {
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

  it('should provide design tokens for light theme', () => {
    render(
      <ThemeProvider>
        <TestDesignTokensComponent />
      </ThemeProvider>
    );

    expect(screen.getByTestId('theme')).toHaveTextContent('light');
    expect(screen.getByTestId('primary-color')).toHaveTextContent('#00B5FF');
    expect(screen.getByTestId('css-var-primary')).toHaveTextContent('#00B5FF');
  });

  it('should provide utility functions', () => {
    render(
      <ThemeProvider>
        <TestDesignTokensComponent />
      </ThemeProvider>
    );

    expect(screen.getByTestId('get-token')).toHaveTextContent('#00B5FF');
    expect(screen.getByTestId('css-variable')).toHaveTextContent(
      'var(--color-primary)'
    );
    expect(screen.getByTestId('color-with-opacity')).toHaveTextContent(
      'rgba(0, 181, 255, 0.5)'
    );
    expect(screen.getByTestId('brand-gradient')).toHaveTextContent(
      'linear-gradient(135deg, #00B5FF 0%, #9327FF 100%)'
    );
    expect(screen.getByTestId('responsive-spacing')).toHaveTextContent('3rem');
  });

  it('should update tokens when theme changes', async () => {
    mockLocalStorage.getItem.mockReturnValue('dark');

    render(
      <ThemeProvider>
        <TestDesignTokensComponent />
      </ThemeProvider>
    );

    expect(screen.getByTestId('theme')).toHaveTextContent('dark');
    expect(screen.getByTestId('primary-color')).toHaveTextContent('#00C8FF');
  });
});

describe('useThemeTransition', () => {
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

  it('should provide transition state', () => {
    render(
      <ThemeProvider>
        <TestThemeTransitionComponent />
      </ThemeProvider>
    );

    expect(screen.getByTestId('transition-is-transitioning')).toHaveTextContent(
      'false'
    );
    expect(screen.getByTestId('transition-class')).toHaveTextContent('');
    expect(screen.getByTestId('transition-theme')).toHaveTextContent('light');
  });

  it('should handle transition class timing', async () => {
    jest.useFakeTimers();

    render(
      <ThemeProvider>
        <TestThemeTransitionComponent />
      </ThemeProvider>
    );

    // Simulate transition start
    act(() => {
      // This would normally be triggered by theme change
      jest.advanceTimersByTime(100);
    });

    jest.useRealTimers();
  });
});
