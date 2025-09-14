import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
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
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(),
    removeListener: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});

// Test component to access theme context
function TestComponent() {
  const { theme, setTheme, resolvedTheme, designTokens } = useTheme();

  return (
    <div>
      <div data-testid="current-theme">{theme}</div>
      <div data-testid="resolved-theme">{resolvedTheme}</div>
      <div data-testid="background-color">{designTokens.colors.background}</div>
      <div data-testid="text-color">{designTokens.colors.text}</div>
      <div data-testid="neutral-white">{designTokens.colors.neutral.white}</div>
      <div data-testid="neutral-black">{designTokens.colors.neutral.black}</div>
      <div data-testid="accent-blue">{designTokens.colors.accent.blue}</div>
      <div data-testid="accent-green">{designTokens.colors.accent.green}</div>
      <div data-testid="border-color">{designTokens.colors.border}</div>
      <div data-testid="shadow-none">{designTokens.shadows.none}</div>
      <button onClick={() => setTheme('light')} data-testid="light-button">
        Light
      </button>
      <button onClick={() => setTheme('dark')} data-testid="dark-button">
        Dark
      </button>
      <button onClick={() => setTheme('system')} data-testid="system-button">
        System
      </button>
    </div>
  );
}

describe('ThemeContext - Neutral Color Palette', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockLocalStorage.getItem.mockReturnValue(null);
  });

  it('should provide neutral color palette in light mode', () => {
    render(
      <ThemeProvider>
        <TestComponent />
      </ThemeProvider>
    );

    expect(screen.getByTestId('resolved-theme')).toHaveTextContent('light');
    expect(screen.getByTestId('background-color')).toHaveTextContent('#FFFFFF');
    expect(screen.getByTestId('text-color')).toHaveTextContent('#171717');
    expect(screen.getByTestId('neutral-white')).toHaveTextContent('#FFFFFF');
    expect(screen.getByTestId('neutral-black')).toHaveTextContent('#000000');
    expect(screen.getByTestId('border-color')).toHaveTextContent('#E5E5E5');
  });

  it('should provide neutral color palette in dark mode', async () => {
    render(
      <ThemeProvider>
        <TestComponent />
      </ThemeProvider>
    );

    fireEvent.click(screen.getByTestId('dark-button'));

    await waitFor(() => {
      expect(screen.getByTestId('resolved-theme')).toHaveTextContent('dark');
    });

    expect(screen.getByTestId('background-color')).toHaveTextContent('#000000');
    expect(screen.getByTestId('text-color')).toHaveTextContent('#FAFAFA');
    expect(screen.getByTestId('neutral-white')).toHaveTextContent('#000000'); // Inverted
    expect(screen.getByTestId('neutral-black')).toHaveTextContent('#FFFFFF'); // Inverted
    expect(screen.getByTestId('border-color')).toHaveTextContent('#404040');
  });

  it('should provide soft accent colors', () => {
    render(
      <ThemeProvider>
        <TestComponent />
      </ThemeProvider>
    );

    expect(screen.getByTestId('accent-blue')).toHaveTextContent('#3B82F6');
    expect(screen.getByTestId('accent-green')).toHaveTextContent('#059669');
  });

  it('should provide brighter accent colors in dark mode', async () => {
    render(
      <ThemeProvider>
        <TestComponent />
      </ThemeProvider>
    );

    fireEvent.click(screen.getByTestId('dark-button'));

    await waitFor(() => {
      expect(screen.getByTestId('resolved-theme')).toHaveTextContent('dark');
    });

    expect(screen.getByTestId('accent-blue')).toHaveTextContent('#60A5FA');
    expect(screen.getByTestId('accent-green')).toHaveTextContent('#34D399');
  });

  it('should only provide "none" shadow for flat design', () => {
    render(
      <ThemeProvider>
        <TestComponent />
      </ThemeProvider>
    );

    expect(screen.getByTestId('shadow-none')).toHaveTextContent('none');
  });

  it('should maintain flat design principles when switching themes', async () => {
    render(
      <ThemeProvider>
        <TestComponent />
      </ThemeProvider>
    );

    // Start in light mode
    expect(screen.getByTestId('shadow-none')).toHaveTextContent('none');

    // Switch to dark mode
    fireEvent.click(screen.getByTestId('dark-button'));

    await waitFor(() => {
      expect(screen.getByTestId('resolved-theme')).toHaveTextContent('dark');
    });

    // Should still have no shadows in dark mode
    expect(screen.getByTestId('shadow-none')).toHaveTextContent('none');

    // Switch back to light mode
    fireEvent.click(screen.getByTestId('light-button'));

    await waitFor(() => {
      expect(screen.getByTestId('resolved-theme')).toHaveTextContent('light');
    });

    // Should still have no shadows in light mode
    expect(screen.getByTestId('shadow-none')).toHaveTextContent('none');
  });

  it('should persist theme preference to localStorage', async () => {
    render(
      <ThemeProvider>
        <TestComponent />
      </ThemeProvider>
    );

    fireEvent.click(screen.getByTestId('dark-button'));

    await waitFor(() => {
      expect(mockLocalStorage.setItem).toHaveBeenCalledWith(
        'appflowy-theme',
        'dark'
      );
    });
  });

  it('should load saved theme from localStorage', () => {
    mockLocalStorage.getItem.mockReturnValue('dark');

    render(
      <ThemeProvider>
        <TestComponent />
      </ThemeProvider>
    );

    expect(screen.getByTestId('current-theme')).toHaveTextContent('dark');
  });
});

// Color contrast testing utilities
describe('Color Contrast Testing', () => {
  // Helper function to calculate relative luminance
  function getLuminance(hex: string): number {
    const rgb = parseInt(hex.slice(1), 16);
    const r = (rgb >> 16) & 0xff;
    const g = (rgb >> 8) & 0xff;
    const b = (rgb >> 0) & 0xff;

    const [rs, gs, bs] = [r, g, b].map(c => {
      c = c / 255;
      return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
    });

    return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
  }

  // Helper function to calculate contrast ratio
  function getContrastRatio(color1: string, color2: string): number {
    const lum1 = getLuminance(color1);
    const lum2 = getLuminance(color2);
    const brightest = Math.max(lum1, lum2);
    const darkest = Math.min(lum1, lum2);
    return (brightest + 0.05) / (darkest + 0.05);
  }

  it('should meet WCAG AA contrast requirements in light mode', () => {
    const lightBackground = '#FFFFFF';
    const lightText = '#171717';
    const lightTextSecondary = '#525252';

    const primaryContrast = getContrastRatio(lightBackground, lightText);
    const secondaryContrast = getContrastRatio(
      lightBackground,
      lightTextSecondary
    );

    // WCAG AA requires 4.5:1 for normal text, 3:1 for large text
    expect(primaryContrast).toBeGreaterThanOrEqual(4.5);
    expect(secondaryContrast).toBeGreaterThanOrEqual(4.5);
  });

  it('should meet WCAG AA contrast requirements in dark mode', () => {
    const darkBackground = '#000000';
    const darkText = '#FAFAFA';
    const darkTextSecondary = '#D4D4D4';

    const primaryContrast = getContrastRatio(darkBackground, darkText);
    const secondaryContrast = getContrastRatio(
      darkBackground,
      darkTextSecondary
    );

    // WCAG AA requires 4.5:1 for normal text, 3:1 for large text
    expect(primaryContrast).toBeGreaterThanOrEqual(4.5);
    expect(secondaryContrast).toBeGreaterThanOrEqual(4.5);
  });

  it('should have sufficient contrast for accent colors on light background', () => {
    const lightBackground = '#FFFFFF';
    const accentBlue = '#3B82F6';
    const accentGreen = '#059669';
    const accentRed = '#EF4444';

    const blueContrast = getContrastRatio(lightBackground, accentBlue);
    const greenContrast = getContrastRatio(lightBackground, accentGreen);
    const redContrast = getContrastRatio(lightBackground, accentRed);

    expect(blueContrast).toBeGreaterThanOrEqual(3.0);
    expect(greenContrast).toBeGreaterThanOrEqual(3.0);
    expect(redContrast).toBeGreaterThanOrEqual(3.0);
  });

  it('should have sufficient contrast for accent colors on dark background', () => {
    const darkBackground = '#000000';
    const accentBlue = '#60A5FA';
    const accentGreen = '#34D399';
    const accentRed = '#F87171';

    const blueContrast = getContrastRatio(darkBackground, accentBlue);
    const greenContrast = getContrastRatio(darkBackground, accentGreen);
    const redContrast = getContrastRatio(darkBackground, accentRed);

    expect(blueContrast).toBeGreaterThanOrEqual(3.0);
    expect(greenContrast).toBeGreaterThanOrEqual(3.0);
    expect(redContrast).toBeGreaterThanOrEqual(3.0);
  });
});
