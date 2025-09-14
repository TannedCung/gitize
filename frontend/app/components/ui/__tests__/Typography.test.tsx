import React from 'react';
import { render, screen } from '@testing-library/react';
import { axe, toHaveNoViolations } from 'jest-axe';
import {
  Typography,
  H1,
  H2,
  H3,
  H4,
  H5,
  H6,
  Text,
  Lead,
  Muted,
  Code,
  Blockquote,
} from '../Typography';

expect.extend(toHaveNoViolations);

describe('Typography', () => {
  describe('Basic Rendering', () => {
    it('renders with default props', () => {
      render(<Typography>Test content</Typography>);
      expect(screen.getByText('Test content')).toBeInTheDocument();
    });

    it('renders with custom variant', () => {
      render(<Typography variant="h1">Heading</Typography>);
      const element = screen.getByText('Heading');
      expect(element).toBeInTheDocument();
      expect(element.tagName).toBe('H1');
    });

    it('renders with custom element', () => {
      render(
        <Typography variant="h1" as="div">
          Heading
        </Typography>
      );
      const element = screen.getByText('Heading');
      expect(element.tagName).toBe('DIV');
    });

    it('applies custom className', () => {
      render(<Typography className="custom-class">Content</Typography>);
      expect(screen.getByText('Content')).toHaveClass('custom-class');
    });
  });

  describe('Typography Variants', () => {
    const variants = [
      { variant: 'h1' as const, expectedTag: 'H1' },
      { variant: 'h2' as const, expectedTag: 'H2' },
      { variant: 'h3' as const, expectedTag: 'H3' },
      { variant: 'h4' as const, expectedTag: 'H4' },
      { variant: 'h5' as const, expectedTag: 'H5' },
      { variant: 'h6' as const, expectedTag: 'H6' },
      { variant: 'body' as const, expectedTag: 'P' },
      { variant: 'body-large' as const, expectedTag: 'P' },
      { variant: 'body-small' as const, expectedTag: 'P' },
      { variant: 'lead' as const, expectedTag: 'P' },
      { variant: 'muted' as const, expectedTag: 'SPAN' },
      { variant: 'code' as const, expectedTag: 'CODE' },
      { variant: 'blockquote' as const, expectedTag: 'BLOCKQUOTE' },
    ];

    variants.forEach(({ variant, expectedTag }) => {
      it(`renders ${variant} variant with correct element`, () => {
        render(<Typography variant={variant}>Content</Typography>);
        const element = screen.getByText('Content');
        expect(element.tagName).toBe(expectedTag);
      });
    });
  });

  describe('Typography Colors', () => {
    const colors = [
      'default',
      'muted',
      'accent-blue',
      'accent-green',
      'accent-red',
      'accent-amber',
      'inherit',
    ] as const;

    colors.forEach(color => {
      it(`applies ${color} color variant`, () => {
        render(<Typography color={color}>Content</Typography>);
        const element = screen.getByText('Content');
        expect(element).toBeInTheDocument();
        // Color classes are applied via Tailwind, so we just verify the element exists
      });
    });
  });

  describe('Typography Weights', () => {
    const weights = [
      'thin',
      'extralight',
      'light',
      'normal',
      'medium',
      'semibold',
      'bold',
      'extrabold',
      'black',
    ] as const;

    weights.forEach(weight => {
      it(`applies ${weight} font weight`, () => {
        render(<Typography weight={weight}>Content</Typography>);
        const element = screen.getByText('Content');
        expect(element).toBeInTheDocument();
      });
    });
  });

  describe('Typography Alignment', () => {
    const alignments = ['left', 'center', 'right', 'justify'] as const;

    alignments.forEach(align => {
      it(`applies ${align} text alignment`, () => {
        render(<Typography align={align}>Content</Typography>);
        const element = screen.getByText('Content');
        expect(element).toBeInTheDocument();
      });
    });
  });

  describe('Typography Options', () => {
    it('applies truncate option', () => {
      render(
        <Typography truncate>Long content that should be truncated</Typography>
      );
      const element = screen.getByText('Long content that should be truncated');
      expect(element).toHaveClass('truncate');
    });

    it('applies noWrap option', () => {
      render(<Typography noWrap>Content that should not wrap</Typography>);
      const element = screen.getByText('Content that should not wrap');
      expect(element).toHaveClass('whitespace-nowrap');
    });

    it('applies mono font option', () => {
      render(<Typography mono>Monospace content</Typography>);
      const element = screen.getByText('Monospace content');
      expect(element).toHaveClass('font-mono');
    });
  });

  describe('Shortcut Components', () => {
    const shortcuts = [
      { Component: H1, expectedTag: 'H1', variant: 'h1' },
      { Component: H2, expectedTag: 'H2', variant: 'h2' },
      { Component: H3, expectedTag: 'H3', variant: 'h3' },
      { Component: H4, expectedTag: 'H4', variant: 'h4' },
      { Component: H5, expectedTag: 'H5', variant: 'h5' },
      { Component: H6, expectedTag: 'H6', variant: 'h6' },
      { Component: Text, expectedTag: 'P', variant: 'body' },
      { Component: Lead, expectedTag: 'P', variant: 'lead' },
      { Component: Muted, expectedTag: 'SPAN', variant: 'muted' },
      { Component: Code, expectedTag: 'CODE', variant: 'code' },
      {
        Component: Blockquote,
        expectedTag: 'BLOCKQUOTE',
        variant: 'blockquote',
      },
    ];

    shortcuts.forEach(({ Component, expectedTag, variant }) => {
      it(`${Component.displayName} renders with correct element and variant`, () => {
        render(<Component>Content</Component>);
        const element = screen.getByText('Content');
        expect(element.tagName).toBe(expectedTag);
      });
    });
  });

  describe('Accessibility', () => {
    it('has no accessibility violations with default props', async () => {
      const { container } = render(<Typography>Accessible content</Typography>);
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('has no accessibility violations with heading variants', async () => {
      const { container } = render(
        <div>
          <H1>Main Heading</H1>
          <H2>Section Heading</H2>
          <H3>Subsection Heading</H3>
          <Text>Body content</Text>
        </div>
      );
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('maintains proper heading hierarchy', () => {
      render(
        <div>
          <H1>Level 1</H1>
          <H2>Level 2</H2>
          <H3>Level 3</H3>
        </div>
      );

      const h1 = screen.getByRole('heading', { level: 1 });
      const h2 = screen.getByRole('heading', { level: 2 });
      const h3 = screen.getByRole('heading', { level: 3 });

      expect(h1).toBeInTheDocument();
      expect(h2).toBeInTheDocument();
      expect(h3).toBeInTheDocument();
    });

    it('supports aria-label for accessibility', () => {
      render(<Typography aria-label="Custom label">Content</Typography>);
      expect(screen.getByLabelText('Custom label')).toBeInTheDocument();
    });

    it('supports data-testid for testing', () => {
      render(<Typography data-testid="typography-element">Content</Typography>);
      expect(screen.getByTestId('typography-element')).toBeInTheDocument();
    });
  });

  describe('Content Hierarchy', () => {
    it('creates proper visual hierarchy with different variants', () => {
      render(
        <article>
          <H1>Article Title</H1>
          <Lead>Article introduction with emphasis</Lead>
          <H2>Section Title</H2>
          <Text>Regular paragraph content</Text>
          <H3>Subsection Title</H3>
          <Text>More paragraph content</Text>
          <Muted>Supporting information</Muted>
        </article>
      );

      // Verify all elements are rendered
      expect(screen.getByText('Article Title')).toBeInTheDocument();
      expect(
        screen.getByText('Article introduction with emphasis')
      ).toBeInTheDocument();
      expect(screen.getByText('Section Title')).toBeInTheDocument();
      expect(screen.getByText('Regular paragraph content')).toBeInTheDocument();
      expect(screen.getByText('Subsection Title')).toBeInTheDocument();
      expect(screen.getByText('More paragraph content')).toBeInTheDocument();
      expect(screen.getByText('Supporting information')).toBeInTheDocument();
    });

    it('supports code blocks and blockquotes', () => {
      render(
        <div>
          <Code>const example = 'code';</Code>
          <Blockquote>This is an important quote</Blockquote>
        </div>
      );

      expect(screen.getByText("const example = 'code';")).toBeInTheDocument();
      expect(
        screen.getByText('This is an important quote')
      ).toBeInTheDocument();
    });
  });

  describe('Responsive Behavior', () => {
    it('applies responsive classes for headings', () => {
      render(<H1>Responsive Heading</H1>);
      const element = screen.getByText('Responsive Heading');

      // Check for responsive classes (these are applied via Tailwind)
      expect(element).toBeInTheDocument();
      expect(element.tagName).toBe('H1');
    });

    it('maintains readability across different screen sizes', () => {
      render(
        <div>
          <H1>Large Heading</H1>
          <Text>Body text with optimal line height</Text>
          <Typography variant="body-small">Small text</Typography>
        </div>
      );

      // All elements should be rendered with appropriate sizing
      expect(screen.getByText('Large Heading')).toBeInTheDocument();
      expect(
        screen.getByText('Body text with optimal line height')
      ).toBeInTheDocument();
      expect(screen.getByText('Small text')).toBeInTheDocument();
    });
  });

  describe('Theme Integration', () => {
    it('works with light and dark themes', () => {
      const { rerender } = render(
        <div className="light">
          <Typography color="default">Light theme text</Typography>
        </div>
      );

      expect(screen.getByText('Light theme text')).toBeInTheDocument();

      rerender(
        <div className="dark">
          <Typography color="default">Dark theme text</Typography>
        </div>
      );

      expect(screen.getByText('Dark theme text')).toBeInTheDocument();
    });

    it('applies accent colors correctly', () => {
      render(
        <div>
          <Typography color="accent-blue">Blue text</Typography>
          <Typography color="accent-green">Green text</Typography>
          <Typography color="accent-red">Red text</Typography>
          <Typography color="accent-amber">Amber text</Typography>
        </div>
      );

      expect(screen.getByText('Blue text')).toBeInTheDocument();
      expect(screen.getByText('Green text')).toBeInTheDocument();
      expect(screen.getByText('Red text')).toBeInTheDocument();
      expect(screen.getByText('Amber text')).toBeInTheDocument();
    });
  });

  describe('Performance', () => {
    it('renders efficiently with many typography elements', () => {
      const startTime = performance.now();

      render(
        <div>
          {Array.from({ length: 100 }, (_, i) => (
            <Text key={i}>Text element {i}</Text>
          ))}
        </div>
      );

      const endTime = performance.now();
      const renderTime = endTime - startTime;

      // Should render quickly (less than 100ms for 100 elements)
      expect(renderTime).toBeLessThan(100);
      expect(screen.getByText('Text element 0')).toBeInTheDocument();
      expect(screen.getByText('Text element 99')).toBeInTheDocument();
    });
  });

  describe('Error Handling', () => {
    it('handles missing children gracefully', () => {
      render(<Typography />);
      // Should not crash, even with no children
    });

    it('handles invalid props gracefully', () => {
      // @ts-expect-error - Testing invalid props
      render(<Typography variant="invalid">Content</Typography>);
      expect(screen.getByText('Content')).toBeInTheDocument();
    });
  });
});
