import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { axe, toHaveNoViolations } from 'jest-axe';
import { Avatar, AvatarProps } from '../Avatar';

expect.extend(toHaveNoViolations);

// Test setup for image loading simulation

describe('Avatar Component', () => {
  const defaultProps: AvatarProps = {
    alt: 'John Doe',
    'data-testid': 'avatar',
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Basic Rendering', () => {
    it('renders without crashing', () => {
      render(<Avatar {...defaultProps} />);
      expect(screen.getByTestId('avatar')).toBeInTheDocument();
    });

    it('renders with correct accessibility attributes', () => {
      render(<Avatar {...defaultProps} />);
      const avatar = screen.getByTestId('avatar');

      expect(avatar).toHaveAttribute('aria-label', 'John Doe');
      expect(avatar).not.toHaveAttribute('role');
    });

    it('renders as button when onClick is provided', () => {
      const handleClick = jest.fn();
      render(<Avatar {...defaultProps} onClick={handleClick} />);
      const avatar = screen.getByTestId('avatar');

      expect(avatar).toHaveAttribute('role', 'button');
      expect(avatar).toHaveAttribute('tabIndex', '0');
    });

    it('applies custom className', () => {
      render(<Avatar {...defaultProps} className="custom-class" />);
      expect(screen.getByTestId('avatar')).toHaveClass('custom-class');
    });
  });

  describe('Size Variants', () => {
    it.each([
      ['xs', 'w-6 h-6 text-xs'],
      ['sm', 'w-8 h-8 text-sm'],
      ['md', 'w-10 h-10 text-base'],
      ['lg', 'w-12 h-12 text-lg'],
      ['xl', 'w-16 h-16 text-xl'],
    ])('renders %s size with correct classes', (size, expectedClasses) => {
      render(<Avatar {...defaultProps} size={size as any} />);
      const avatar = screen.getByTestId('avatar');

      expectedClasses.split(' ').forEach(className => {
        expect(avatar).toHaveClass(className);
      });
    });

    it('defaults to medium size', () => {
      render(<Avatar {...defaultProps} />);
      const avatar = screen.getByTestId('avatar');

      expect(avatar).toHaveClass('w-10', 'h-10', 'text-base');
    });
  });

  describe('Image Loading', () => {
    it('shows loading state initially when src is provided', () => {
      render(<Avatar {...defaultProps} src="https://example.com/avatar.jpg" />);

      expect(screen.getByTestId('avatar-loading')).toBeInTheDocument();
    });

    it('shows image when loading succeeds', async () => {
      render(<Avatar {...defaultProps} src="https://example.com/avatar.jpg" />);

      // Find the image element and simulate load event
      const img = screen.getByAltText('John Doe');
      expect(img).toHaveAttribute('src', 'https://example.com/avatar.jpg');

      // Simulate successful image load
      fireEvent.load(img);

      await waitFor(() => {
        expect(img).toHaveStyle('opacity: 1');
        expect(screen.queryByTestId('avatar-loading')).not.toBeInTheDocument();
      });
    });

    it('shows fallback when image fails to load', async () => {
      render(
        <Avatar
          {...defaultProps}
          src="https://example.com/error.jpg"
          fallback="John Doe"
        />
      );

      // Find the image element and simulate error event
      const img = screen.getByAltText('John Doe');
      fireEvent.error(img);

      await waitFor(() => {
        expect(screen.getByTestId('avatar-fallback')).toBeInTheDocument();
        expect(screen.getByTestId('avatar-fallback')).toHaveTextContent('JD');
        expect(screen.queryByTestId('avatar-loading')).not.toBeInTheDocument();
      });
    });

    it('generates initials from alt text when no fallback provided', async () => {
      render(
        <Avatar
          {...defaultProps}
          src="https://example.com/error.jpg"
          alt="John Doe"
        />
      );

      // Find the image element and simulate error event
      const img = screen.getByAltText('John Doe');
      fireEvent.error(img);

      await waitFor(() => {
        expect(screen.getByTestId('avatar-fallback')).toBeInTheDocument();
        expect(screen.getByTestId('avatar-fallback')).toHaveTextContent('JD');
      });
    });

    it('handles single name initials correctly', async () => {
      render(
        <Avatar
          {...defaultProps}
          src="https://example.com/error.jpg"
          alt="John"
        />
      );

      // Find the image element and simulate error event
      const img = screen.getByAltText('John');
      fireEvent.error(img);

      await waitFor(() => {
        expect(screen.getByTestId('avatar-fallback')).toHaveTextContent('J');
      });
    });

    it('limits initials to 2 characters', async () => {
      render(
        <Avatar
          {...defaultProps}
          src="https://example.com/error.jpg"
          alt="John Michael Doe"
        />
      );

      // Find the image element and simulate error event
      const img = screen.getByAltText('John Michael Doe');
      fireEvent.error(img);

      await waitFor(() => {
        expect(screen.getByTestId('avatar-fallback')).toHaveTextContent('JM');
      });
    });
  });

  describe('Fallback Handling', () => {
    it('shows fallback immediately when no src provided', () => {
      render(<Avatar {...defaultProps} fallback="John Doe" />);

      expect(screen.getByTestId('avatar-fallback')).toBeInTheDocument();
      expect(screen.getByTestId('avatar-fallback')).toHaveTextContent('JD');
    });

    it('uses alt text for initials when no fallback provided', () => {
      render(<Avatar {...defaultProps} alt="Jane Smith" />);

      expect(screen.getByTestId('avatar-fallback')).toHaveTextContent('JS');
    });

    it('prefers fallback over alt text for initials', () => {
      render(
        <Avatar {...defaultProps} alt="Jane Smith" fallback="Custom Name" />
      );

      expect(screen.getByTestId('avatar-fallback')).toHaveTextContent('CN');
    });
  });

  describe('Status Indicators', () => {
    it('does not show status indicator by default', () => {
      render(<Avatar {...defaultProps} status="online" />);

      expect(screen.queryByTestId('avatar-status')).not.toBeInTheDocument();
    });

    it('shows status indicator when showStatus is true', () => {
      render(<Avatar {...defaultProps} status="online" showStatus />);

      expect(screen.getByTestId('avatar-status')).toBeInTheDocument();
    });

    it.each([
      ['online', 'bg-green-500'],
      ['offline', 'bg-gray-400'],
      ['away', 'bg-yellow-500'],
      ['busy', 'bg-red-500'],
    ])('renders %s status with correct color', (status, expectedClass) => {
      render(<Avatar {...defaultProps} status={status as any} showStatus />);
      const statusIndicator = screen.getByTestId('avatar-status');

      expect(statusIndicator).toHaveClass(expectedClass);
      expect(statusIndicator).toHaveAttribute(
        'aria-label',
        `Status: ${status}`
      );
    });

    it('sizes status indicator based on avatar size', () => {
      render(<Avatar {...defaultProps} size="xl" status="online" showStatus />);
      const statusIndicator = screen.getByTestId('avatar-status');

      expect(statusIndicator).toHaveClass('w-4', 'h-4');
    });
  });

  describe('Interactions', () => {
    it('calls onClick when clicked', () => {
      const handleClick = jest.fn();
      render(<Avatar {...defaultProps} onClick={handleClick} />);

      fireEvent.click(screen.getByTestId('avatar'));
      expect(handleClick).toHaveBeenCalledTimes(1);
    });

    it('calls onClick when Enter key is pressed', () => {
      const handleClick = jest.fn();
      render(<Avatar {...defaultProps} onClick={handleClick} />);

      fireEvent.keyDown(screen.getByTestId('avatar'), { key: 'Enter' });
      expect(handleClick).toHaveBeenCalledTimes(1);
    });

    it('calls onClick when Space key is pressed', () => {
      const handleClick = jest.fn();
      render(<Avatar {...defaultProps} onClick={handleClick} />);

      fireEvent.keyDown(screen.getByTestId('avatar'), { key: ' ' });
      expect(handleClick).toHaveBeenCalledTimes(1);
    });

    it('does not call onClick for other keys', () => {
      const handleClick = jest.fn();
      render(<Avatar {...defaultProps} onClick={handleClick} />);

      fireEvent.keyDown(screen.getByTestId('avatar'), { key: 'Tab' });
      expect(handleClick).not.toHaveBeenCalled();
    });

    it('shows hover effect when clickable', () => {
      const handleClick = jest.fn();
      render(<Avatar {...defaultProps} onClick={handleClick} />);

      expect(screen.getByTestId('avatar')).toHaveClass(
        'cursor-pointer',
        'hover:opacity-80'
      );
    });
  });

  describe('Accessibility', () => {
    it('should not have accessibility violations', async () => {
      const { container } = render(<Avatar {...defaultProps} />);
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('should not have accessibility violations with status', async () => {
      const { container } = render(
        <Avatar {...defaultProps} status="online" showStatus />
      );
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('should not have accessibility violations when clickable', async () => {
      const { container } = render(
        <Avatar {...defaultProps} onClick={() => {}} />
      );
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('provides proper aria-label for status', () => {
      render(<Avatar {...defaultProps} status="busy" showStatus />);
      const statusIndicator = screen.getByTestId('avatar-status');

      expect(statusIndicator).toHaveAttribute('aria-label', 'Status: busy');
    });

    it('uses custom aria-label when provided', () => {
      render(<Avatar {...defaultProps} aria-label="User profile picture" />);

      expect(screen.getByTestId('avatar')).toHaveAttribute(
        'aria-label',
        'User profile picture'
      );
    });
  });

  describe('Edge Cases', () => {
    it('handles empty alt text gracefully', () => {
      render(<Avatar alt="" data-testid="avatar" />);

      expect(screen.getByTestId('avatar-fallback')).toHaveTextContent('');
    });

    it('handles special characters in alt text', () => {
      render(<Avatar alt="John-Paul O'Connor" data-testid="avatar" />);

      expect(screen.getByTestId('avatar-fallback')).toHaveTextContent('JO');
    });

    it('handles very long names', () => {
      render(
        <Avatar alt="Verylongfirstname Verylonglastname" data-testid="avatar" />
      );

      expect(screen.getByTestId('avatar-fallback')).toHaveTextContent('VV');
    });

    it('resets loading state when src changes', async () => {
      const { rerender } = render(
        <Avatar {...defaultProps} src="https://example.com/avatar1.jpg" />
      );

      // Simulate initial load
      const img1 = screen.getByAltText('John Doe');
      fireEvent.load(img1);

      await waitFor(() => {
        expect(screen.queryByTestId('avatar-loading')).not.toBeInTheDocument();
      });

      // Change src
      rerender(
        <Avatar {...defaultProps} src="https://example.com/avatar2.jpg" />
      );

      // Should show loading again
      expect(screen.getByTestId('avatar-loading')).toBeInTheDocument();
    });

    it('handles src being removed', () => {
      const { rerender } = render(
        <Avatar {...defaultProps} src="https://example.com/avatar.jpg" />
      );

      rerender(<Avatar {...defaultProps} />);

      expect(screen.getByTestId('avatar-fallback')).toBeInTheDocument();
      expect(screen.queryByTestId('avatar-loading')).not.toBeInTheDocument();
    });
  });
});
