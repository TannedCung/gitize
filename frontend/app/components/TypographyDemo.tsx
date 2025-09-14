'use client';

import React from 'react';
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
} from './ui/Typography';

/**
 * Typography Demo Component
 *
 * Showcases the enhanced typography system for content-first hierarchy
 * with optimal readability settings and clean font stack implementation.
 */
export default function TypographyDemo() {
  return (
    <div className="max-w-4xl mx-auto p-6 space-y-12">
      {/* Header */}
      <header className="space-y-4">
        <Typography
          variant="overline"
          color="accent-blue"
          className="tracking-widest"
        >
          Design System
        </Typography>

        <H1>Typography System Demo</H1>

        <Lead>
          Explore our enhanced typography system designed for content-first
          hierarchy, featuring optimal readability settings, clean font stack,
          and accessibility compliance.
        </Lead>
      </header>

      {/* Heading Hierarchy */}
      <section className="space-y-6">
        <div>
          <Typography variant="overline" color="muted" className="mb-4">
            Heading Hierarchy
          </Typography>

          <div className="space-y-4">
            <H1>Heading 1 - Main Page Title</H1>
            <Text color="muted">
              Font: Bold 700, Size: 2.25rem → 3rem → 3.75rem (responsive), Line
              Height: 1.25 → 1.2 → 1.15, Letter Spacing: -0.025em
            </Text>

            <H2>Heading 2 - Section Title</H2>
            <Text color="muted">
              Font: Semibold 600, Size: 1.875rem → 2.25rem → 2.25rem
              (responsive), Line Height: 1.3 → 1.25 → 1.2, Letter Spacing:
              -0.025em
            </Text>

            <H3>Heading 3 - Subsection Title</H3>
            <Text color="muted">
              Font: Semibold 600, Size: 1.5rem → 1.875rem → 1.875rem
              (responsive), Line Height: 1.35 → 1.3 → 1.25, Letter Spacing:
              -0.016em
            </Text>

            <H4>Heading 4 - Component Title</H4>
            <Text color="muted">
              Font: Medium 500, Size: 1.25rem → 1.5rem → 1.5rem (responsive),
              Line Height: 1.4 → 1.35 → 1.3, Letter Spacing: 0
            </Text>

            <H5>Heading 5 - Small Section</H5>
            <Text color="muted">
              Font: Medium 500, Size: 1.125rem → 1.25rem → 1.25rem (responsive),
              Line Height: 1.45 → 1.4 → 1.35, Letter Spacing: 0
            </Text>

            <H6>Heading 6 - Minor Heading</H6>
            <Text color="muted">
              Font: Medium 500, Size: 1rem → 1.125rem → 1.125rem (responsive),
              Line Height: 1.5 → 1.45 → 1.4, Letter Spacing: 0
            </Text>
          </div>
        </div>
      </section>

      {/* Body Text Variants */}
      <section className="space-y-6">
        <div>
          <Typography variant="overline" color="muted" className="mb-4">
            Body Text Variants
          </Typography>

          <div className="space-y-6">
            <div>
              <Lead>
                Lead Text - Perfect for introductory paragraphs and important
                content that needs emphasis without being a heading. Uses
                lighter font weight and larger size for elegant prominence.
              </Lead>
              <Text color="muted" className="mt-2">
                Font: Light 300, Size: 1.25rem, Line Height: 1.625, Letter
                Spacing: 0
              </Text>
            </div>

            <div>
              <Typography variant="body-large">
                Large Body Text - Ideal for important content that needs more
                prominence than regular body text. Great for key information and
                highlighted content.
              </Typography>
              <Text color="muted" className="mt-2">
                Font: Normal 400, Size: 1.125rem, Line Height: 1.625, Letter
                Spacing: 0
              </Text>
            </div>

            <div>
              <Text>
                Regular Body Text - The primary text variant for most content.
                Optimized for comfortable reading with perfect line height,
                letter spacing, and font size balance. This is the foundation of
                our content hierarchy.
              </Text>
              <Text color="muted" className="mt-2">
                Font: Normal 400, Size: 1rem, Line Height: 1.625, Letter
                Spacing: 0
              </Text>
            </div>

            <div>
              <Typography variant="body-small">
                Small Body Text - Perfect for secondary information, captions,
                and supporting content that doesn't need full prominence but
                remains readable.
              </Typography>
              <Text color="muted" className="mt-2">
                Font: Normal 400, Size: 0.875rem, Line Height: 1.625, Letter
                Spacing: 0.016em
              </Text>
            </div>

            <div>
              <Muted>
                Muted Text - Ideal for less important information, metadata,
                timestamps, and subtle supporting content that provides context
                without competing for attention.
              </Muted>
              <Text color="muted" className="mt-2">
                Font: Normal 400, Size: 0.875rem, Line Height: 1.5, Letter
                Spacing: 0, Color: Secondary text color
              </Text>
            </div>
          </div>
        </div>
      </section>

      {/* Special Content Types */}
      <section className="space-y-6">
        <div>
          <Typography variant="overline" color="muted" className="mb-4">
            Special Content Types
          </Typography>

          <div className="space-y-6">
            <div>
              <Typography variant="caption" className="mb-2">
                Caption Text - For Image Captions and Labels
              </Typography>
              <Text color="muted">
                Font: Normal 400, Size: 0.75rem, Line Height: 1.5, Letter
                Spacing: 0.025em, Transform: Uppercase
              </Text>
            </div>

            <div>
              <Typography variant="overline" className="mb-2">
                Overline Text - For Categories and Tags
              </Typography>
              <Text color="muted">
                Font: Medium 500, Size: 0.75rem, Line Height: 1.5, Letter
                Spacing: 0.1em, Transform: Uppercase
              </Text>
            </div>

            <div>
              <Code className="mb-2 block">
                const example = 'Monospace code text with optimal spacing';
              </Code>
              <Text color="muted">
                Font: JetBrains Mono (monospace), Size: 0.875rem, Line Height:
                1.5, Letter Spacing: 0
              </Text>
            </div>

            <div>
              <Blockquote className="mb-2">
                "This is a blockquote - perfect for highlighting important
                quotes, testimonials, or emphasized content with elegant italic
                styling and subtle left border."
              </Blockquote>
              <Text color="muted">
                Font: Light 300 Italic, Size: 1.125rem, Line Height: 1.625,
                Letter Spacing: 0, Style: Italic with left border
              </Text>
            </div>
          </div>
        </div>
      </section>

      {/* Color Variants */}
      <section className="space-y-6">
        <div>
          <Typography variant="overline" color="muted" className="mb-4">
            Color Variants for Flat Design
          </Typography>

          <div className="space-y-3">
            <H4 color="default">Default Text Color - Primary content</H4>
            <H4 color="muted">Muted Text Color - Secondary content</H4>
            <H4 color="accent-blue">
              Accent Blue - Links and interactive elements
            </H4>
            <H4 color="accent-green">
              Accent Green - Success states and positive actions
            </H4>
            <H4 color="accent-red">
              Accent Red - Errors and destructive actions
            </H4>
            <H4 color="accent-amber">
              Accent Amber - Warnings and caution states
            </H4>
          </div>
        </div>
      </section>

      {/* Weight Variations */}
      <section className="space-y-6">
        <div>
          <Typography variant="overline" color="muted" className="mb-4">
            Font Weight Variations
          </Typography>

          <div className="space-y-3">
            <H4 weight="light">Light Weight (300) - Elegant and refined</H4>
            <H4 weight="normal">Normal Weight (400) - Standard body text</H4>
            <H4 weight="medium">Medium Weight (500) - Subtle emphasis</H4>
            <H4 weight="semibold">Semibold Weight (600) - Strong emphasis</H4>
            <H4 weight="bold">Bold Weight (700) - Maximum emphasis</H4>
          </div>
        </div>
      </section>

      {/* Alignment Options */}
      <section className="space-y-6">
        <div>
          <Typography variant="overline" color="muted" className="mb-4">
            Text Alignment Options
          </Typography>

          <div className="space-y-4">
            <Text align="left">
              Left aligned text - Default alignment for optimal readability in
              western languages. Provides consistent left edge for easy
              scanning.
            </Text>

            <Text align="center">
              Center aligned text - Perfect for headings, callouts, and content
              that needs visual emphasis through centering.
            </Text>

            <Text align="right">
              Right aligned text - Useful for specific layouts, numbers, or
              content that needs right alignment for design purposes.
            </Text>

            <Text align="justify">
              Justified text creates even margins on both sides by adjusting
              word spacing. Best used sparingly for formal documents or specific
              design requirements where uniform text blocks are needed.
            </Text>
          </div>
        </div>
      </section>

      {/* Content Example */}
      <section className="space-y-6">
        <div>
          <Typography variant="overline" color="muted" className="mb-4">
            Real Content Example
          </Typography>

          <article className="space-y-6">
            <header className="space-y-4">
              <Typography variant="overline" color="accent-blue">
                User Interface Design
              </Typography>

              <H2>The Power of Typography in Flat Design</H2>

              <Lead>
                Typography serves as the backbone of effective flat design,
                creating hierarchy and organization without relying on visual
                embellishments or decorative elements.
              </Lead>
            </header>

            <div className="space-y-4">
              <Text>
                In flat minimalist design, typography becomes the primary tool
                for creating visual hierarchy and guiding user attention. By
                carefully crafting font sizes, weights, and spacing, we can
                establish clear content relationships and improve the overall
                reading experience.
              </Text>

              <H3>Key Principles</H3>

              <ul className="space-y-2 ml-6">
                <li>
                  <Text as="span">
                    <strong>Readability First:</strong> Every typographic
                    decision prioritizes content clarity and user comprehension.
                  </Text>
                </li>
                <li>
                  <Text as="span">
                    <strong>Hierarchy Through Scale:</strong> Size and weight
                    create natural content organization without visual
                    containers.
                  </Text>
                </li>
                <li>
                  <Text as="span">
                    <strong>Consistent Spacing:</strong> Generous whitespace and
                    vertical rhythm create breathing room and improve
                    scanability.
                  </Text>
                </li>
              </ul>

              <Blockquote>
                "Good typography is invisible - it serves the content without
                drawing attention to itself, creating a seamless reading
                experience that feels natural and effortless."
              </Blockquote>

              <H4>Implementation Details</H4>

              <Text>
                Our typography system uses CSS custom properties and Tailwind
                utilities to ensure consistency across all components. The
                system automatically adapts to different screen sizes while
                maintaining optimal readability:
              </Text>

              <div className="bg-neutral-50 dark:bg-neutral-900 p-4 rounded-md">
                <Code>
                  {`// Responsive typography example
<H1>Scales from 36px → 48px → 60px</H1>
<Text>Maintains 1.625 line height across all sizes</Text>
<Muted>Subtle secondary information</Muted>`}
                </Code>
              </div>
            </div>
          </article>
        </div>
      </section>

      {/* Accessibility Features */}
      <section className="space-y-6">
        <div>
          <Typography variant="overline" color="muted" className="mb-4">
            Accessibility Features
          </Typography>

          <div className="space-y-4">
            <H3>WCAG 2.1 AA Compliance</H3>

            <Text>
              All typography variants maintain proper contrast ratios and
              support screen readers through semantic HTML elements and proper
              heading hierarchy.
            </Text>

            <div className="bg-accent-green-50 dark:bg-accent-green-900/20 p-4 rounded-md">
              <Typography variant="body-small" color="accent-green">
                <strong>Accessibility Note:</strong> This typography system
                includes proper focus indicators, semantic markup, and optimized
                contrast ratios for users with various accessibility needs.
              </Typography>
            </div>

            <ul className="space-y-2 ml-6">
              <li>
                <Text as="span">
                  <strong>Semantic HTML:</strong> Proper heading levels and
                  element types
                </Text>
              </li>
              <li>
                <Text as="span">
                  <strong>Focus Management:</strong> Clear focus indicators for
                  keyboard navigation
                </Text>
              </li>
              <li>
                <Text as="span">
                  <strong>Screen Reader Support:</strong> Proper ARIA attributes
                  and content structure
                </Text>
              </li>
              <li>
                <Text as="span">
                  <strong>High Contrast:</strong> Meets WCAG AA standards for
                  color contrast
                </Text>
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="pt-8 border-t border-neutral-200 dark:border-neutral-800">
        <Muted>
          This typography system is part of the AppFlowy UI flat minimalist
          design system, emphasizing content clarity, accessibility, and optimal
          user experience through thoughtful typographic choices.
        </Muted>
      </footer>
    </div>
  );
}
