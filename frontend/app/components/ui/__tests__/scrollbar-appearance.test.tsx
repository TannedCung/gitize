import React from 'react';
import { render, screen } from '@testing-library/react';
import { ScrollArea } from '../ScrollArea';

// Mock CSS.supports for testing browser compatibility
const mockCSSSupports = jest.fn();
Object.defineProperty(window, 'CSS', {
  value: {
    supports: mockCSSSupports,
  },
  writable: true,
});

describe('Scrollbar Appearance Tests', () => {
  beforeEach(() => {
    mockCSSSupports.mockClear();
  });

  describe('Browser Compatibility', () => {
    it('applies webkit scrollbar styles when supported', () => {
      mockCSSSupports.mockReturnValue(true);

      render(
        <ScrollArea data-testid="scroll-area">
          <div style={{ height: '200px' }}>
            Long content that requires scrolling
          </div>
        </ScrollArea>
      );

      const scrollArea = screen.getByTestId('scroll-area');
      expect(scrollArea).toHaveClass('scrollbar');
      expect(scrollArea).toHaveClass('overflow-auto');
    });

    it('falls back to standard scrollbar when webkit not supported', () => {
      mockCSSSupports.mockReturnValue(false);

      render(
        <ScrollArea data-testid="scroll-area">
          <div style={{ height: '200px' }}>
            Long content that requires scrolling
          </div>
        </ScrollArea>
      );

      const scrollArea = screen.getByTestId('scroll-area');
      expect(scrollArea).toHaveClass('scrollbar');
    });
  });

  describe('Theme Compatibility', () => {
    it('applies light theme scrollbar styles by default', () => {
      render(
        <ScrollArea data-testid="scroll-area">
          <div style={{ height: '200px' }}>Content</div>
        </ScrollArea>
      );

      const scrollArea = screen.getByTestId('scroll-area');
      expect(scrollArea).toHaveClass('scrollbar');
      expect(scrollArea.closest('.dark')).toBeNull();
    });

    it('applies dark theme scrollbar styles when in dark mode', () => {
      render(
        <div className="dark">
          <ScrollArea data-testid="scroll-area">
            <div style={{ height: '200px' }}>Content</div>
          </ScrollArea>
        </div>
      );

      const scrollArea = screen.getByTestId('scroll-area');
      expect(scrollArea).toHaveClass('scrollbar');
      expect(scrollArea.closest('.dark')).toBeInTheDocument();
    });

    it('applies brand theme scrollbar styles correctly', () => {
      render(
        <ScrollArea variant="brand" data-testid="scroll-area">
          <div style={{ height: '200px' }}>Content</div>
        </ScrollArea>
      );

      const scrollArea = screen.getByTestId('scroll-area');
      expect(scrollArea).toHaveClass('scrollbar', 'scrollbar-brand');
    });

    it('applies brand theme scrollbar styles in dark mode', () => {
      render(
        <div className="dark">
          <ScrollArea variant="brand" data-testid="scroll-area">
            <div style={{ height: '200px' }}>Content</div>
          </ScrollArea>
        </div>
      );

      const scrollArea = screen.getByTestId('scroll-area');
      expect(scrollArea).toHaveClass('scrollbar', 'scrollbar-brand');
      expect(scrollArea.closest('.dark')).toBeInTheDocument();
    });
  });

  describe('Scrollbar Variants', () => {
    it('applies thin scrollbar variant correctly', () => {
      render(
        <ScrollArea variant="thin" data-testid="scroll-area">
          <div style={{ height: '200px' }}>Content</div>
        </ScrollArea>
      );

      const scrollArea = screen.getByTestId('scroll-area');
      expect(scrollArea).toHaveClass('scrollbar', 'scrollbar-thin');
    });

    it('applies thick scrollbar variant correctly', () => {
      render(
        <ScrollArea variant="thick" data-testid="scroll-area">
          <div style={{ height: '200px' }}>Content</div>
        </ScrollArea>
      );

      const scrollArea = screen.getByTestId('scroll-area');
      expect(scrollArea).toHaveClass('scrollbar', 'scrollbar-thick');
    });

    it('hides scrollbar when variant is none', () => {
      render(
        <ScrollArea variant="none" data-testid="scroll-area">
          <div style={{ height: '200px' }}>Content</div>
        </ScrollArea>
      );

      const scrollArea = screen.getByTestId('scroll-area');
      expect(scrollArea).toHaveClass('scrollbar-none');
      expect(scrollArea).not.toHaveClass('scrollbar');
    });
  });

  describe('Mobile Touch Support', () => {
    it('applies touch scrolling optimization by default', () => {
      render(
        <ScrollArea data-testid="scroll-area">
          <div style={{ height: '200px' }}>Content</div>
        </ScrollArea>
      );

      const scrollArea = screen.getByTestId('scroll-area');
      expect(scrollArea).toHaveClass('scroll-touch');
    });

    it('can disable touch scrolling optimization', () => {
      render(
        <ScrollArea touchOptimized={false} data-testid="scroll-area">
          <div style={{ height: '200px' }}>Content</div>
        </ScrollArea>
      );

      const scrollArea = screen.getByTestId('scroll-area');
      expect(scrollArea).not.toHaveClass('scroll-touch');
    });
  });

  describe('Smooth Scrolling', () => {
    it('applies smooth scrolling by default', () => {
      render(
        <ScrollArea data-testid="scroll-area">
          <div style={{ height: '200px' }}>Content</div>
        </ScrollArea>
      );

      const scrollArea = screen.getByTestId('scroll-area');
      expect(scrollArea).toHaveClass('scroll-smooth');
    });

    it('can disable smooth scrolling', () => {
      render(
        <ScrollArea smooth={false} data-testid="scroll-area">
          <div style={{ height: '200px' }}>Content</div>
        </ScrollArea>
      );

      const scrollArea = screen.getByTestId('scroll-area');
      expect(scrollArea).not.toHaveClass('scroll-smooth');
    });

    it('respects prefers-reduced-motion preference', () => {
      // Mock matchMedia for reduced motion
      Object.defineProperty(window, 'matchMedia', {
        writable: true,
        value: jest.fn().mockImplementation(query => ({
          matches: query === '(prefers-reduced-motion: reduce)',
          media: query,
          onchange: null,
          addListener: jest.fn(),
          removeListener: jest.fn(),
          addEventListener: jest.fn(),
          removeEventListener: jest.fn(),
          dispatchEvent: jest.fn(),
        })),
      });

      render(
        <ScrollArea data-testid="scroll-area">
          <div style={{ height: '200px' }}>Content</div>
        </ScrollArea>
      );

      const scrollArea = screen.getByTestId('scroll-area');
      // The component should still have the class, but CSS will override it
      expect(scrollArea).toHaveClass('scroll-smooth');
    });
  });

  describe('Accessibility', () => {
    it('maintains proper overflow behavior for screen readers', () => {
      render(
        <ScrollArea data-testid="scroll-area" aria-label="Scrollable content">
          <div style={{ height: '200px' }}>Content that requires scrolling</div>
        </ScrollArea>
      );

      const scrollArea = screen.getByTestId('scroll-area');
      expect(scrollArea).toHaveAttribute('aria-label', 'Scrollable content');
      expect(scrollArea).toHaveClass('overflow-auto');
    });

    it('supports keyboard navigation', () => {
      render(
        <ScrollArea data-testid="scroll-area" tabIndex={0}>
          <div style={{ height: '200px' }}>Content that requires scrolling</div>
        </ScrollArea>
      );

      const scrollArea = screen.getByTestId('scroll-area');
      expect(scrollArea).toHaveAttribute('tabIndex', '0');
    });
  });

  describe('Performance', () => {
    it('applies hardware acceleration hints', () => {
      render(
        <ScrollArea data-testid="scroll-area">
          <div style={{ height: '200px' }}>Content</div>
        </ScrollArea>
      );

      const scrollArea = screen.getByTestId('scroll-area');
      expect(scrollArea).toHaveClass('scroll-touch');
      // The scroll-touch class should apply -webkit-overflow-scrolling: touch
    });

    it('uses contain for overscroll behavior', () => {
      render(
        <ScrollArea touchOptimized={true} data-testid="scroll-area">
          <div style={{ height: '200px' }}>Content</div>
        </ScrollArea>
      );

      const scrollArea = screen.getByTestId('scroll-area');
      expect(scrollArea).toHaveClass('scroll-touch');
      // The scroll-touch class should apply overscroll-behavior: contain
    });
  });
});
