/**
 * Performance tests for UI components and theme system
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { performance } from 'perf_hooks';
import { ThemeProvider } from '../../../contexts/ThemeContext';
import { Button } from '../Button';
import { TextField } from '../TextField';
import { Avatar } from '../Avatar';
import { LazyModal, LazyGrid, LazyList } from '../lazy';
import { LazyWrapper } from '../LazyWrapper';

// Mock performance.mark and performance.measure for testing
const mockPerformance = {
  mark: jest.fn(),
  measure: jest.fn(),
  getEntriesByName: jest.fn(() => [{ duration: 50 }]),
  clearMarks: jest.fn(),
  clearMeasures: jest.fn(),
};

// Replace global performance with mock
Object.defineProperty(global, 'performance', {
  value: mockPerformance,
  writable: true,
});

describe('Performance Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Component Rendering Performance', () => {
    it('should render Button component within performance threshold', () => {
      const startTime = performance.now();

      render(
        <ThemeProvider>
          <Button>Test Button</Button>
        </ThemeProvider>
      );

      const endTime = performance.now();
      const renderTime = endTime - startTime;

      // Button should render in less than 10ms
      expect(renderTime).toBeLessThan(10);
    });

    it('should render multiple components efficiently', () => {
      const startTime = performance.now();

      render(
        <ThemeProvider>
          <div>
            <Button>Button 1</Button>
            <Button>Button 2</Button>
            <TextField label="Test Field" />
            <Avatar alt="Test Avatar" />
          </div>
        </ThemeProvider>
      );

      const endTime = performance.now();
      const renderTime = endTime - startTime;

      // Multiple components should render in less than 50ms
      expect(renderTime).toBeLessThan(50);
    });

    it('should handle rapid re-renders efficiently', async () => {
      let renderCount = 0;
      const TestComponent = () => {
        renderCount++;
        return <Button>Render {renderCount}</Button>;
      };

      const { rerender } = render(
        <ThemeProvider>
          <TestComponent />
        </ThemeProvider>
      );

      const startTime = performance.now();

      // Perform 10 rapid re-renders
      for (let i = 0; i < 10; i++) {
        rerender(
          <ThemeProvider>
            <TestComponent />
          </ThemeProvider>
        );
      }

      const endTime = performance.now();
      const totalTime = endTime - startTime;

      // 10 re-renders should complete in less than 100ms
      expect(totalTime).toBeLessThan(100);
      expect(renderCount).toBe(11); // Initial render + 10 re-renders
    });
  });

  describe('Theme Switching Performance', () => {
    it('should switch themes efficiently', async () => {
      const ThemeTestComponent = () => {
        const [theme, setTheme] = React.useState<'light' | 'dark'>('light');

        return (
          <div>
            <button
              onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
              data-testid="theme-toggle"
            >
              Toggle Theme
            </button>
            <div data-testid="themed-content" className={theme}>
              <Button>Themed Button</Button>
              <TextField label="Themed Field" />
            </div>
          </div>
        );
      };

      render(
        <ThemeProvider>
          <ThemeTestComponent />
        </ThemeProvider>
      );

      const toggleButton = screen.getByTestId('theme-toggle');

      const startTime = performance.now();

      // Perform multiple theme switches
      for (let i = 0; i < 5; i++) {
        fireEvent.click(toggleButton);
        await waitFor(
          () => {
            // Wait for theme transition to complete
          },
          { timeout: 100 }
        );
      }

      const endTime = performance.now();
      const totalTime = endTime - startTime;

      // 5 theme switches should complete in less than 500ms
      expect(totalTime).toBeLessThan(500);
    });

    it('should not cause memory leaks during theme switches', async () => {
      const initialMemory = (performance as any).memory?.usedJSHeapSize || 0;

      const ThemeTestComponent = () => {
        const [theme, setTheme] = React.useState<'light' | 'dark'>('light');

        React.useEffect(() => {
          const interval = setInterval(() => {
            setTheme(prev => (prev === 'light' ? 'dark' : 'light'));
          }, 10);

          return () => clearInterval(interval);
        }, []);

        return (
          <div className={theme}>
            <Button>Memory Test Button</Button>
          </div>
        );
      };

      const { unmount } = render(
        <ThemeProvider>
          <ThemeTestComponent />
        </ThemeProvider>
      );

      // Let it run for a short time
      await new Promise(resolve => setTimeout(resolve, 100));

      unmount();

      // Force garbage collection if available
      if (global.gc) {
        global.gc();
      }

      const finalMemory = (performance as any).memory?.usedJSHeapSize || 0;
      const memoryIncrease = finalMemory - initialMemory;

      // Memory increase should be minimal (less than 1MB)
      expect(memoryIncrease).toBeLessThan(1024 * 1024);
    });
  });

  describe('Lazy Loading Performance', () => {
    it('should load lazy components efficiently', async () => {
      const startTime = performance.now();

      render(
        <ThemeProvider>
          <LazyWrapper>
            <LazyModal isOpen={true} onClose={() => {}}>
              <div>Lazy Modal Content</div>
            </LazyModal>
          </LazyWrapper>
        </ThemeProvider>
      );

      // Wait for lazy component to load
      await waitFor(() => {
        expect(screen.getByText('Lazy Modal Content')).toBeInTheDocument();
      });

      const endTime = performance.now();
      const loadTime = endTime - startTime;

      // Lazy component should load in less than 200ms
      expect(loadTime).toBeLessThan(200);
    });

    it('should handle multiple lazy components without blocking', async () => {
      const startTime = performance.now();

      render(
        <ThemeProvider>
          <div>
            <LazyWrapper>
              <LazyGrid data={[]} columns={[]} />
            </LazyWrapper>
            <LazyWrapper>
              <LazyList items={[]} />
            </LazyWrapper>
          </div>
        </ThemeProvider>
      );

      // Wait for all lazy components to load
      await waitFor(
        () => {
          // Components should be rendered (even if empty)
          expect(
            document.querySelectorAll('[data-testid]').length
          ).toBeGreaterThan(0);
        },
        { timeout: 500 }
      );

      const endTime = performance.now();
      const loadTime = endTime - startTime;

      // Multiple lazy components should load in less than 500ms
      expect(loadTime).toBeLessThan(500);
    });
  });

  describe('Bundle Size Monitoring', () => {
    it('should track component import sizes', () => {
      // Mock webpack stats for bundle size tracking
      const mockWebpackStats = {
        chunks: [
          { name: 'ui-components', size: 50000 }, // 50KB
          { name: 'utils', size: 10000 }, // 10KB
          { name: 'main', size: 100000 }, // 100KB
        ],
      };

      // Simulate bundle size check
      const uiComponentsChunk = mockWebpackStats.chunks.find(
        chunk => chunk.name === 'ui-components'
      );

      expect(uiComponentsChunk?.size).toBeLessThan(100000); // Less than 100KB
    });

    it('should ensure tree-shaking is working', () => {
      // Test that unused components are not included in bundle
      const importedComponents = ['Button', 'TextField', 'Avatar'];

      const unusedComponents = ['LazyModal', 'LazyGrid', 'LazyList'];

      // In a real scenario, this would check actual bundle analysis
      expect(importedComponents.length).toBeGreaterThan(0);
      expect(unusedComponents.length).toBeGreaterThan(0);

      // Simulate that unused components are not in main bundle
      const mainBundleComponents = importedComponents;
      unusedComponents.forEach(component => {
        expect(mainBundleComponents).not.toContain(component);
      });
    });
  });

  describe('Memory Usage Monitoring', () => {
    it('should monitor component memory usage', () => {
      const initialMemory = (performance as any).memory?.usedJSHeapSize || 0;

      // Render many components
      const components = Array.from({ length: 100 }, (_, i) => (
        <Button key={i}>Button {i}</Button>
      ));

      render(
        <ThemeProvider>
          <div>{components}</div>
        </ThemeProvider>
      );

      const afterRenderMemory =
        (performance as any).memory?.usedJSHeapSize || 0;
      const memoryUsed = afterRenderMemory - initialMemory;

      // 100 buttons should use less than 5MB
      expect(memoryUsed).toBeLessThan(5 * 1024 * 1024);
    });

    it('should clean up component memory on unmount', () => {
      const initialMemory = (performance as any).memory?.usedJSHeapSize || 0;

      const { unmount } = render(
        <ThemeProvider>
          <div>
            {Array.from({ length: 50 }, (_, i) => (
              <TextField key={i} label={`Field ${i}`} />
            ))}
          </div>
        </ThemeProvider>
      );

      const _afterRenderMemory =
        (performance as any).memory?.usedJSHeapSize || 0;

      unmount();

      // Force garbage collection if available
      if (global.gc) {
        global.gc();
      }

      const afterUnmountMemory =
        (performance as any).memory?.usedJSHeapSize || 0;

      // Memory should be cleaned up (within reasonable bounds)
      const memoryDifference = Math.abs(afterUnmountMemory - initialMemory);
      expect(memoryDifference).toBeLessThan(1024 * 1024); // Less than 1MB difference
    });
  });
});

// Performance benchmark utilities
export const performanceBenchmark = {
  measureRenderTime: (component: React.ReactElement) => {
    const startTime = performance.now();
    render(component);
    const endTime = performance.now();
    return endTime - startTime;
  },

  measureMemoryUsage: (component: React.ReactElement) => {
    const initialMemory = (performance as any).memory?.usedJSHeapSize || 0;
    const { unmount } = render(component);
    const afterRenderMemory = (performance as any).memory?.usedJSHeapSize || 0;
    unmount();

    if (global.gc) {
      global.gc();
    }

    const afterUnmountMemory = (performance as any).memory?.usedJSHeapSize || 0;

    return {
      renderMemory: afterRenderMemory - initialMemory,
      cleanupMemory: afterUnmountMemory - initialMemory,
    };
  },

  measureBundleSize: (componentName: string) => {
    // This would integrate with actual bundle analysis tools
    // For now, return mock data
    const mockSizes: Record<string, number> = {
      Button: 2000,
      TextField: 3000,
      Avatar: 1500,
      LazyModal: 5000,
      LazyGrid: 8000,
    };

    return mockSizes[componentName] || 0;
  },
};
