import React from 'react';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Link, LinkProps } from '../Link';
import {
  renderWithProviders,
  testAccessibility,
  testBothThemes,
  testComponentVariants,
  commonTestScenarios,
  createMockFunctions,
} from '../test-utils';

// Mock Next.js Link component
jest.mock('next/link', () => {
  return function MockLink({
    children,
    href,
    passHref,
    legacyBehavior,
    ...props
  }: any) {
    if (passHref && legacyBehavior) {
      return children;
    }
    return (
      <a href={href} {...props}>
        {children}
      </a>
    );
  };
});

// Mock window.location for external link detection
const mockLocation = {
  hostname: 'example.com',
};

// Store original location
const originalLocation = window.location;

beforeAll(() => {
  // Mock window.location
  delete (window as any).location;
  window.location = mockLocation as any;
});

afterAll(() => {
  // Restore original location
  window.location = originalLocation;
});

// Mock functions for testing
const mockFunctions = createMockFunctions();

describe('Link Component', () => {
  // Reset mocks before each test
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Basic Rendering', () => {
    it('renders without crashing', async () => {
      await commonTestScenarios.rendersWithoutCrashing(Link, {
        href: '/test',
        children: 'Test Link',
      });
    });

    it('renders with correct text content', () => {
      renderWithProviders(<Link href="/test">Click me</Link>);
      expect(
        screen.getByRole('link', { name: 'Click me' })
      ).toBeInTheDocument();
    });

    it('renders with custom aria-label', () => {
      renderWithProviders(
        <Link href="/test" aria-label="Custom label">
          Link
        </Link>
      );
      expect(
        screen.getByRole('link', { name: 'Custom label' })
      ).toBeInTheDocument();
    });

    it('renders with data-testid', () => {
      renderWithProviders(
        <Link href="/test" data-testid="test-link">
          Link
        </Link>
      );
      expect(screen.getByTestId('test-link')).toBeInTheDocument();
    });

    it('renders with correct href attribute', () => {
      renderWithProviders(<Link href="/test-path">Test Link</Link>);
      const link = screen.getByRole('link');
      expect(link).toHaveAttribute('href', '/test-path');
    });
  });

  describe('Variants', () => {
    const variants: Array<{
      variant: LinkProps['variant'];
      expectedClass: string;
    }> = [
      { variant: 'primary', expectedClass: 'text-primary-600' },
      { variant: 'secondary', expectedClass: 'text-gray-600' },
      { variant: 'outline', expectedClass: 'text-gray-700' },
      { variant: 'ghost', expectedClass: 'text-gray-500' },
      { variant: 'danger', expectedClass: 'text-error-600' },
    ];

    variants.forEach(({ variant, expectedClass }) => {
      it(`renders ${variant} variant correctly`, () => {
        renderWithProviders(
          <Link href="/test" variant={variant}>
            Test Link
          </Link>
        );
        const link = screen.getByRole('link');
        expect(link).toHaveClass(expectedClass);
      });
    });

    it('defaults to primary variant when no variant is specified', () => {
      renderWithProviders(<Link href="/test">Default Link</Link>);
      const link = screen.getByRole('link');
      expect(link).toHaveClass('text-primary-600');
    });
  });

  describe('External Links', () => {
    it('detects external links automatically based on href', () => {
      renderWithProviders(
        <Link href="https://external-site.com">External Link</Link>
      );
      const link = screen.getByRole('link');
      expect(link).toHaveAttribute('target', '_blank');
      expect(link).toHaveAttribute('rel', 'noopener noreferrer');
    });

    it('treats links with external prop as external', () => {
      renderWithProviders(
        <Link href="/internal" external>
          External Link
        </Link>
      );
      const link = screen.getByRole('link');
      expect(link).toHaveAttribute('target', '_blank');
      expect(link).toHaveAttribute('rel', 'noopener noreferrer');
    });

    it('shows external link icon by default for external links', () => {
      renderWithProviders(
        <Link href="https://external-site.com">External Link</Link>
      );
      const link = screen.getByRole('link');
      const icon = link.querySelector('svg');
      expect(icon).toBeInTheDocument();
      expect(icon).toHaveAttribute('aria-hidden', 'true');
    });

    it('hides external link icon when showExternalIcon is false', () => {
      renderWithProviders(
        <Link href="https://external-site.com" showExternalIcon={false}>
          External Link
        </Link>
      );
      const link = screen.getByRole('link');
      const icon = link.querySelector('svg');
      expect(icon).not.toBeInTheDocument();
    });

    it('adds accessibility label for external links', () => {
      renderWithProviders(
        <Link href="https://external-site.com">External Link</Link>
      );
      const link = screen.getByRole('link');
      expect(link).toHaveAttribute(
        'aria-label',
        'External Link (opens in new tab)'
      );
    });

    it('does not override custom aria-label for external links', () => {
      renderWithProviders(
        <Link
          href="https://external-site.com"
          aria-label="Custom external label"
        >
          External Link
        </Link>
      );
      const link = screen.getByRole('link');
      expect(link).toHaveAttribute('aria-label', 'Custom external label');
    });

    it('treats same-domain links as internal', () => {
      renderWithProviders(
        <Link href="https://example.com/internal">Same Domain Link</Link>
      );
      const link = screen.getByRole('link');
      expect(link).not.toHaveAttribute('target', '_blank');
      expect(link).not.toHaveAttribute('rel', 'noopener noreferrer');
    });
  });

  describe('Internal Links', () => {
    it('renders internal links without security attributes', () => {
      renderWithProviders(<Link href="/internal">Internal Link</Link>);
      const link = screen.getByRole('link');
      expect(link).not.toHaveAttribute('target');
      expect(link).not.toHaveAttribute('rel');
    });

    it('does not show external icon for internal links', () => {
      renderWithProviders(<Link href="/internal">Internal Link</Link>);
      const link = screen.getByRole('link');
      const icon = link.querySelector('svg');
      expect(icon).not.toBeInTheDocument();
    });

    it('handles hash links as regular anchor tags', () => {
      renderWithProviders(<Link href="#section">Hash Link</Link>);
      const link = screen.getByRole('link');
      expect(link).toHaveAttribute('href', '#section');
    });
  });

  describe('Disabled State', () => {
    it('handles disabled state correctly', async () => {
      const { container } = renderWithProviders(
        <Link href="/test" disabled>
          Disabled Link
        </Link>
      );

      const link = screen.getByRole('link');
      expect(link).toHaveAttribute('aria-disabled', 'true');
      await testAccessibility(container);
    });

    it('removes href when disabled', () => {
      renderWithProviders(
        <Link href="/test" disabled>
          Disabled Link
        </Link>
      );
      const link = screen.getByRole('link');
      expect(link).not.toHaveAttribute('href');
    });

    it('applies disabled styling', () => {
      renderWithProviders(
        <Link href="/test" disabled>
          Disabled Link
        </Link>
      );
      const link = screen.getByRole('link');
      expect(link).toHaveClass('opacity-50');
      expect(link).toHaveClass('cursor-not-allowed');
      expect(link).toHaveClass('pointer-events-none');
    });

    it('has proper ARIA attributes when disabled', () => {
      renderWithProviders(
        <Link href="/test" disabled>
          Disabled Link
        </Link>
      );
      const link = screen.getByRole('link');
      expect(link).toHaveAttribute('aria-disabled', 'true');
      expect(link).toHaveAttribute('tabIndex', '-1');
    });

    it('does not call onClick when disabled', async () => {
      const user = userEvent.setup();
      renderWithProviders(
        <Link href="/test" disabled onClick={mockFunctions.onClick}>
          Disabled Link
        </Link>
      );

      const link = screen.getByRole('link');
      await user.click(link);

      expect(mockFunctions.onClick).not.toHaveBeenCalled();
    });
  });

  describe('Interactions', () => {
    it('calls onClick when clicked', async () => {
      const user = userEvent.setup();
      renderWithProviders(
        <Link href="/test" onClick={mockFunctions.onClick}>
          Clickable Link
        </Link>
      );

      const link = screen.getByRole('link');
      await user.click(link);

      expect(mockFunctions.onClick).toHaveBeenCalledTimes(1);
    });

    it('handles Enter key press', async () => {
      const user = userEvent.setup();
      renderWithProviders(
        <Link href="/test" onClick={mockFunctions.onClick}>
          Keyboard Link
        </Link>
      );

      const link = screen.getByRole('link');
      link.focus();
      await user.keyboard('{Enter}');

      expect(mockFunctions.onClick).toHaveBeenCalledTimes(1);
    });

    it('calls onKeyDown when provided', async () => {
      const user = userEvent.setup();
      renderWithProviders(
        <Link href="/test" onKeyDown={mockFunctions.onKeyDown}>
          Keyboard Link
        </Link>
      );

      const link = screen.getByRole('link');
      link.focus();
      await user.keyboard('{Tab}');

      expect(mockFunctions.onKeyDown).toHaveBeenCalledTimes(1);
    });

    it('does not handle keyboard events when disabled', async () => {
      const user = userEvent.setup();
      renderWithProviders(
        <Link
          href="/test"
          disabled
          onClick={mockFunctions.onClick}
          onKeyDown={mockFunctions.onKeyDown}
        >
          Disabled Link
        </Link>
      );

      const link = screen.getByRole('link');
      link.focus();
      await user.keyboard('{Enter}');

      expect(mockFunctions.onClick).not.toHaveBeenCalled();
      expect(mockFunctions.onKeyDown).not.toHaveBeenCalled();
    });
  });

  describe('Custom Styling', () => {
    it('applies custom className', () => {
      renderWithProviders(
        <Link href="/test" className="custom-class">
          Custom Link
        </Link>
      );
      const link = screen.getByRole('link');
      expect(link).toHaveClass('custom-class');
    });

    it('merges custom className with default classes', () => {
      renderWithProviders(
        <Link href="/test" className="custom-class">
          Custom Link
        </Link>
      );
      const link = screen.getByRole('link');
      expect(link).toHaveClass('custom-class');
      expect(link).toHaveClass('text-primary-600'); // Default primary variant class
    });
  });

  describe('Accessibility', () => {
    it('passes accessibility tests', async () => {
      const { container } = renderWithProviders(
        <Link href="/test">Accessible Link</Link>
      );
      await testAccessibility(container);
    });

    it('passes accessibility tests in both themes', async () => {
      await testBothThemes(<Link href="/test">Theme Link</Link>);
    });

    it('maintains focus ring for keyboard navigation', () => {
      renderWithProviders(<Link href="/test">Focus Link</Link>);
      const link = screen.getByRole('link');
      expect(link).toHaveClass('focus:outline-none');
      expect(link).toHaveClass('focus:ring-2');
    });

    it('has proper focus ring colors for different variants', () => {
      const variants: Array<{
        variant: LinkProps['variant'];
        focusClass: string;
      }> = [
        { variant: 'primary', focusClass: 'focus:ring-primary-500' },
        { variant: 'secondary', focusClass: 'focus:ring-gray-500' },
        { variant: 'outline', focusClass: 'focus:ring-gray-500' },
        { variant: 'ghost', focusClass: 'focus:ring-gray-500' },
        { variant: 'danger', focusClass: 'focus:ring-error-500' },
      ];

      variants.forEach(({ variant, focusClass }) => {
        const { unmount } = renderWithProviders(
          <Link href="/test" variant={variant}>
            Focus Link
          </Link>
        );
        const link = screen.getByRole('link');
        expect(link).toHaveClass(focusClass);
        unmount();
      });
    });

    it('has proper tabIndex for enabled links', () => {
      renderWithProviders(<Link href="/test">Enabled Link</Link>);
      const link = screen.getByRole('link');
      expect(link).toHaveAttribute('tabIndex', '0');
    });

    it('has proper tabIndex for disabled links', () => {
      renderWithProviders(
        <Link href="/test" disabled>
          Disabled Link
        </Link>
      );
      const link = screen.getByRole('link');
      expect(link).toHaveAttribute('tabIndex', '-1');
    });

    it('includes underline decoration for better visibility', () => {
      renderWithProviders(<Link href="/test">Underlined Link</Link>);
      const link = screen.getByRole('link');
      expect(link).toHaveClass('underline');
      expect(link).toHaveClass('decoration-1');
      expect(link).toHaveClass('underline-offset-2');
    });
  });

  describe('Security Features', () => {
    it('adds security attributes to external links', () => {
      renderWithProviders(
        <Link href="https://malicious-site.com">External Link</Link>
      );
      const link = screen.getByRole('link');
      expect(link).toHaveAttribute('rel', 'noopener noreferrer');
      expect(link).toHaveAttribute('target', '_blank');
    });

    it('does not add security attributes to internal links', () => {
      renderWithProviders(<Link href="/internal">Internal Link</Link>);
      const link = screen.getByRole('link');
      expect(link).not.toHaveAttribute('rel');
      expect(link).not.toHaveAttribute('target');
    });

    it('adds security attributes when external prop is true', () => {
      renderWithProviders(
        <Link href="/internal" external>
          Forced External Link
        </Link>
      );
      const link = screen.getByRole('link');
      expect(link).toHaveAttribute('rel', 'noopener noreferrer');
      expect(link).toHaveAttribute('target', '_blank');
    });
  });

  describe('Component Variants Testing', () => {
    it('tests all variant combinations', async () => {
      const baseProps: LinkProps = {
        href: '/test',
        children: 'Test Link',
      };

      const variants = [
        { variant: 'primary' as const },
        { variant: 'secondary' as const },
        { variant: 'outline' as const },
        { variant: 'ghost' as const },
        { variant: 'danger' as const },
        { disabled: true },
        { external: true },
        { showExternalIcon: false },
      ];

      await testComponentVariants(Link, baseProps, variants);
    });
  });

  describe('Forward Ref', () => {
    it('forwards ref correctly', () => {
      const ref = React.createRef<HTMLAnchorElement>();
      renderWithProviders(
        <Link href="/test" ref={ref}>
          Ref Link
        </Link>
      );

      expect(ref.current).toBeInstanceOf(HTMLAnchorElement);
      expect(ref.current?.textContent).toBe('Ref Link');
    });
  });

  describe('External Link Icon', () => {
    it('renders external link icon with correct attributes', () => {
      renderWithProviders(
        <Link href="https://external.com">External Link</Link>
      );
      const icon = screen.getByRole('link').querySelector('svg');
      expect(icon).toBeInTheDocument();
      expect(icon).toHaveAttribute('aria-hidden', 'true');
      expect(icon).toHaveAttribute('width', '12');
      expect(icon).toHaveAttribute('height', '12');
    });

    it('positions external link icon correctly', () => {
      renderWithProviders(
        <Link href="https://external.com">External Link</Link>
      );
      const icon = screen.getByRole('link').querySelector('svg');
      expect(icon).toHaveClass('ml-1');
      expect(icon).toHaveClass('flex-shrink-0');
    });
  });

  describe('Link Types', () => {
    it('uses Next.js Link for internal routes', () => {
      renderWithProviders(<Link href="/internal">Internal Link</Link>);
      // Since we mocked Next.js Link, we can verify it's being used
      const link = screen.getByRole('link');
      expect(link).toHaveAttribute('href', '/internal');
    });

    it('uses regular anchor tag for external links', () => {
      renderWithProviders(
        <Link href="https://external.com">External Link</Link>
      );
      const link = screen.getByRole('link');
      expect(link).toHaveAttribute('href', 'https://external.com');
      expect(link).toHaveAttribute('target', '_blank');
    });

    it('uses regular anchor tag for hash links', () => {
      renderWithProviders(<Link href="#section">Hash Link</Link>);
      const link = screen.getByRole('link');
      expect(link).toHaveAttribute('href', '#section');
    });

    it('uses regular anchor tag for disabled links', () => {
      renderWithProviders(
        <Link href="/test" disabled>
          Disabled Link
        </Link>
      );
      const link = screen.getByRole('link');
      expect(link).not.toHaveAttribute('href');
    });
  });

  describe('Hover and Active States', () => {
    it('applies hover classes for primary variant', () => {
      renderWithProviders(
        <Link href="/test" variant="primary">
          Primary Link
        </Link>
      );
      const link = screen.getByRole('link');
      expect(link).toHaveClass('hover:text-primary-700');
      expect(link).toHaveClass('hover:decoration-primary-700');
    });

    it('applies active classes for danger variant', () => {
      renderWithProviders(
        <Link href="/test" variant="danger">
          Danger Link
        </Link>
      );
      const link = screen.getByRole('link');
      expect(link).toHaveClass('active:text-error-800');
      expect(link).toHaveClass('active:decoration-error-800');
    });

    it('includes transition classes for smooth state changes', () => {
      renderWithProviders(<Link href="/test">Animated Link</Link>);
      const link = screen.getByRole('link');
      expect(link).toHaveClass('transition-all');
      expect(link).toHaveClass('duration-200');
      expect(link).toHaveClass('ease-in-out');
    });
  });
});
