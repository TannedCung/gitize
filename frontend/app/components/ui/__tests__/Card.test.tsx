import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { axe, toHaveNoViolations } from 'jest-axe';
import {
  Card,
  CardHeader,
  CardContent,
  CardFooter,
  CardTitle,
  CardDescription,
} from '../Card';

expect.extend(toHaveNoViolations);

describe('Card Components', () => {
  describe('Card', () => {
    it('renders children correctly', () => {
      render(
        <Card data-testid="card">
          <div>Card content</div>
        </Card>
      );

      expect(screen.getByTestId('card')).toBeInTheDocument();
      expect(screen.getByText('Card content')).toBeInTheDocument();
    });

    it('applies variant classes correctly', () => {
      const { rerender } = render(
        <Card data-testid="card" variant="default">
          Content
        </Card>
      );

      expect(screen.getByTestId('card')).toHaveClass(
        'bg-white',
        'dark:bg-neutral-800'
      );

      rerender(
        <Card data-testid="card" variant="outlined">
          Content
        </Card>
      );

      expect(screen.getByTestId('card')).toHaveClass(
        'bg-transparent',
        'border'
      );

      rerender(
        <Card data-testid="card" variant="elevated">
          Content
        </Card>
      );

      expect(screen.getByTestId('card')).toHaveClass(
        'bg-white',
        'dark:bg-neutral-800'
      );
    });

    it('handles interactive behavior correctly', () => {
      const handleClick = jest.fn();
      render(
        <Card data-testid="card" interactive onClick={handleClick}>
          Content
        </Card>
      );

      const card = screen.getByTestId('card');
      expect(card).toHaveClass('cursor-pointer');
      expect(card).toHaveAttribute('role', 'button');
      expect(card).toHaveAttribute('tabIndex', '0');

      fireEvent.click(card);
      expect(handleClick).toHaveBeenCalledTimes(1);
    });

    it('handles keyboard interaction for interactive cards', () => {
      const handleClick = jest.fn();
      render(
        <Card data-testid="card" interactive onClick={handleClick}>
          Content
        </Card>
      );

      const card = screen.getByTestId('card');

      fireEvent.keyDown(card, { key: 'Enter' });
      expect(handleClick).toHaveBeenCalledTimes(1);

      fireEvent.keyDown(card, { key: ' ' });
      expect(handleClick).toHaveBeenCalledTimes(2);

      fireEvent.keyDown(card, { key: 'Escape' });
      expect(handleClick).toHaveBeenCalledTimes(2); // Should not trigger
    });

    it('should have no accessibility violations', async () => {
      const { container } = render(
        <Card>
          <CardHeader>
            <CardTitle>Card Title</CardTitle>
            <CardDescription>Card description</CardDescription>
          </CardHeader>
          <CardContent>Card content</CardContent>
          <CardFooter>Card footer</CardFooter>
        </Card>
      );

      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });
  });

  describe('CardHeader', () => {
    it('renders with divider when specified', () => {
      render(
        <CardHeader data-testid="header" divider>
          Header content
        </CardHeader>
      );

      expect(screen.getByTestId('header')).toHaveClass('border-b');
    });

    it('renders without divider by default', () => {
      render(<CardHeader data-testid="header">Header content</CardHeader>);

      expect(screen.getByTestId('header')).not.toHaveClass('border-b');
    });
  });

  describe('CardContent', () => {
    it('applies padding variants correctly', () => {
      const { rerender } = render(
        <CardContent data-testid="content" padding="none">
          Content
        </CardContent>
      );

      expect(screen.getByTestId('content')).not.toHaveClass('px-6');

      rerender(
        <CardContent data-testid="content" padding="sm">
          Content
        </CardContent>
      );

      expect(screen.getByTestId('content')).toHaveClass('px-6', 'py-4');

      rerender(
        <CardContent data-testid="content" padding="lg">
          Content
        </CardContent>
      );

      expect(screen.getByTestId('content')).toHaveClass('px-10', 'py-8');
    });
  });

  describe('CardFooter', () => {
    it('applies alignment classes correctly', () => {
      const { rerender } = render(
        <CardFooter data-testid="footer" align="left">
          Footer content
        </CardFooter>
      );

      expect(screen.getByTestId('footer')).toHaveClass('justify-start');

      rerender(
        <CardFooter data-testid="footer" align="center">
          Footer content
        </CardFooter>
      );

      expect(screen.getByTestId('footer')).toHaveClass('justify-center');

      rerender(
        <CardFooter data-testid="footer" align="between">
          Footer content
        </CardFooter>
      );

      expect(screen.getByTestId('footer')).toHaveClass('justify-between');
    });

    it('renders with divider when specified', () => {
      render(
        <CardFooter data-testid="footer" divider>
          Footer content
        </CardFooter>
      );

      expect(screen.getByTestId('footer')).toHaveClass('border-t');
    });
  });

  describe('CardTitle', () => {
    it('renders with correct heading level', () => {
      const { rerender } = render(<CardTitle level={1}>Title</CardTitle>);

      expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument();

      rerender(<CardTitle level={4}>Title</CardTitle>);

      expect(screen.getByRole('heading', { level: 4 })).toBeInTheDocument();
    });

    it('uses h3 as default heading level', () => {
      render(<CardTitle>Title</CardTitle>);
      expect(screen.getByRole('heading', { level: 3 })).toBeInTheDocument();
    });
  });

  describe('CardDescription', () => {
    it('renders description text correctly', () => {
      render(<CardDescription>This is a description</CardDescription>);
      expect(screen.getByText('This is a description')).toBeInTheDocument();
    });
  });

  describe('Card Composition', () => {
    it('works correctly when components are composed together', () => {
      render(
        <Card data-testid="composed-card">
          <CardHeader divider>
            <CardTitle>Test Card</CardTitle>
            <CardDescription>Test description</CardDescription>
          </CardHeader>
          <CardContent>
            <p>Card content goes here</p>
          </CardContent>
          <CardFooter divider align="between">
            <button>Cancel</button>
            <button>Save</button>
          </CardFooter>
        </Card>
      );

      expect(screen.getByTestId('composed-card')).toBeInTheDocument();
      expect(
        screen.getByRole('heading', { name: 'Test Card' })
      ).toBeInTheDocument();
      expect(screen.getByText('Test description')).toBeInTheDocument();
      expect(screen.getByText('Card content goes here')).toBeInTheDocument();
      expect(
        screen.getByRole('button', { name: 'Cancel' })
      ).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Save' })).toBeInTheDocument();
    });
  });
});
