import type { Meta, StoryObj } from '@storybook/react';
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
} from './Typography';

const meta: Meta<typeof Typography> = {
  title: 'UI/Typography',
  component: Typography,
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component: `
Typography component for content-first hierarchy. Implements clean font stack with optimal readability settings and creates clear heading hierarchy using typography weight and size for visual separation instead of borders or containers.

## Features
- Content-first hierarchy with optimal readability
- Clean font stack (Inter + system fonts)
- Responsive typography scaling
- Accessibility-compliant contrast and focus states
- Typography-based visual separation
- Generous spacing for airy layouts
        `,
      },
    },
  },
  argTypes: {
    variant: {
      control: 'select',
      options: [
        'h1',
        'h2',
        'h3',
        'h4',
        'h5',
        'h6',
        'body',
        'body-large',
        'body-small',
        'caption',
        'overline',
        'lead',
        'muted',
        'code',
        'blockquote',
      ],
    },
    weight: {
      control: 'select',
      options: [
        'thin',
        'extralight',
        'light',
        'normal',
        'medium',
        'semibold',
        'bold',
        'extrabold',
        'black',
      ],
    },
    align: {
      control: 'select',
      options: ['left', 'center', 'right', 'justify'],
    },
    color: {
      control: 'select',
      options: [
        'default',
        'muted',
        'accent-blue',
        'accent-green',
        'accent-red',
        'accent-amber',
        'inherit',
      ],
    },
    as: {
      control: 'select',
      options: [
        'h1',
        'h2',
        'h3',
        'h4',
        'h5',
        'h6',
        'p',
        'span',
        'div',
        'code',
        'blockquote',
      ],
    },
  },
};

export default meta;
type Story = StoryObj<typeof Typography>;

export const Default: Story = {
  args: {
    variant: 'body',
    children:
      'This is the default typography component with optimal readability settings.',
  },
};

export const AllVariants: Story = {
  render: () => (
    <div className="space-y-8 max-w-4xl">
      <div>
        <Typography variant="overline" color="muted" className="mb-4">
          Typography Hierarchy
        </Typography>

        <div className="space-y-6">
          <H1>Heading 1 - Main Page Title</H1>
          <H2>Heading 2 - Section Title</H2>
          <H3>Heading 3 - Subsection Title</H3>
          <H4>Heading 4 - Component Title</H4>
          <H5>Heading 5 - Small Section</H5>
          <H6>Heading 6 - Minor Heading</H6>
        </div>
      </div>

      <div>
        <Typography variant="overline" color="muted" className="mb-4">
          Body Text Variants
        </Typography>

        <div className="space-y-4">
          <Lead>
            This is lead text - perfect for introductory paragraphs and
            important content that needs emphasis without being a heading.
          </Lead>

          <Typography variant="body-large">
            This is large body text - ideal for important content that needs
            more prominence than regular body text.
          </Typography>

          <Text>
            This is regular body text with optimal line height and letter
            spacing for comfortable reading. It's designed to be the primary
            text variant for most content.
          </Text>

          <Typography variant="body-small">
            This is small body text - perfect for secondary information,
            captions, and supporting content that doesn't need full prominence.
          </Typography>

          <Muted>
            This is muted text - ideal for less important information, metadata,
            and subtle supporting content.
          </Muted>
        </div>
      </div>

      <div>
        <Typography variant="overline" color="muted" className="mb-4">
          Special Content
        </Typography>

        <div className="space-y-4">
          <Typography variant="caption">
            Caption Text - For Image Captions and Labels
          </Typography>

          <Typography variant="overline">
            Overline Text - For Categories and Tags
          </Typography>

          <Code>const example = 'code text with monospace font';</Code>

          <Blockquote>
            "This is a blockquote - perfect for highlighting important quotes,
            testimonials, or emphasized content with elegant italic styling."
          </Blockquote>
        </div>
      </div>
    </div>
  ),
};

export const ColorVariants: Story = {
  render: () => (
    <div className="space-y-4">
      <Typography variant="overline" color="muted" className="mb-4">
        Color Variants
      </Typography>

      <Typography variant="h3" color="default">
        Default Text Color
      </Typography>

      <Typography variant="h3" color="muted">
        Muted Text Color
      </Typography>

      <Typography variant="h3" color="accent-blue">
        Accent Blue Color
      </Typography>

      <Typography variant="h3" color="accent-green">
        Accent Green Color
      </Typography>

      <Typography variant="h3" color="accent-red">
        Accent Red Color
      </Typography>

      <Typography variant="h3" color="accent-amber">
        Accent Amber Color
      </Typography>
    </div>
  ),
};

export const WeightVariants: Story = {
  render: () => (
    <div className="space-y-4">
      <Typography variant="overline" color="muted" className="mb-4">
        Font Weight Variants
      </Typography>

      <Typography variant="h4" weight="light">
        Light Weight (300)
      </Typography>

      <Typography variant="h4" weight="normal">
        Normal Weight (400)
      </Typography>

      <Typography variant="h4" weight="medium">
        Medium Weight (500)
      </Typography>

      <Typography variant="h4" weight="semibold">
        Semibold Weight (600)
      </Typography>

      <Typography variant="h4" weight="bold">
        Bold Weight (700)
      </Typography>
    </div>
  ),
};

export const AlignmentVariants: Story = {
  render: () => (
    <div className="space-y-6">
      <Typography variant="overline" color="muted" className="mb-4">
        Text Alignment
      </Typography>

      <Typography variant="body" align="left">
        Left aligned text - This is the default alignment for most content and
        provides the best readability for western languages.
      </Typography>

      <Typography variant="body" align="center">
        Center aligned text - Perfect for headings, callouts, and content that
        needs visual emphasis through centering.
      </Typography>

      <Typography variant="body" align="right">
        Right aligned text - Useful for specific layouts, numbers, or content
        that needs right alignment for design purposes.
      </Typography>

      <Typography variant="body" align="justify">
        Justified text - Creates even margins on both sides by adjusting word
        spacing. Best used sparingly for formal documents or specific design
        requirements.
      </Typography>
    </div>
  ),
};

export const ResponsiveExample: Story = {
  render: () => (
    <div className="space-y-8">
      <Typography variant="overline" color="muted" className="mb-4">
        Responsive Typography
      </Typography>

      <div className="space-y-6">
        <H1>Responsive Heading 1</H1>
        <Text>
          This heading scales from 2.25rem (36px) on mobile to 3rem (48px) on
          tablet and 3.75rem (60px) on desktop, maintaining optimal readability
          across all screen sizes.
        </Text>

        <H2>Responsive Heading 2</H2>
        <Text>
          Typography automatically adjusts for different screen sizes while
          maintaining the visual hierarchy and content-first approach of the
          flat minimalist design system.
        </Text>

        <Lead>
          Lead text maintains its prominence across all screen sizes with
          consistent line height and letter spacing for optimal readability.
        </Lead>
      </div>
    </div>
  ),
};

export const ContentExample: Story = {
  render: () => (
    <article className="max-w-3xl space-y-6">
      <header className="space-y-4">
        <Typography variant="overline" color="accent-blue">
          Design System
        </Typography>

        <H1>Typography in Flat Minimalist Design</H1>

        <Lead>
          Typography serves as the primary method of creating visual hierarchy
          and organization in our flat, borderless design system, prioritizing
          content readability over decorative elements.
        </Lead>
      </header>

      <section className="space-y-4">
        <H2>Content-First Approach</H2>

        <Text>
          Our typography system embraces a content-first philosophy where text
          clarity and readability take precedence over visual embellishments. By
          using carefully crafted font sizes, weights, and spacing, we create
          natural content groupings without relying on borders or containers.
        </Text>

        <Text>
          The clean font stack, built on Inter and system fonts, ensures
          consistent rendering across all platforms while maintaining the
          lightweight aesthetic that defines our flat minimalist approach.
        </Text>

        <H3>Key Principles</H3>

        <ul className="space-y-2 ml-6">
          <li>
            <Text as="span">
              <strong>Optimal Readability:</strong> Line heights, letter
              spacing, and font sizes are optimized for comfortable reading
              across all screen sizes.
            </Text>
          </li>
          <li>
            <Text as="span">
              <strong>Visual Hierarchy:</strong> Typography weight and size
              create clear content organization without visual containers.
            </Text>
          </li>
          <li>
            <Text as="span">
              <strong>Accessibility:</strong> All typography meets WCAG 2.1 AA
              standards for contrast and screen reader compatibility.
            </Text>
          </li>
        </ul>

        <Blockquote>
          "Good typography is invisible - it serves the content without drawing
          attention to itself, creating a seamless reading experience that feels
          natural and effortless."
        </Blockquote>

        <H4>Implementation Details</H4>

        <Text>
          The typography system uses CSS custom properties and Tailwind
          utilities to ensure consistency across all components. Each variant is
          carefully crafted to serve specific content needs:
        </Text>

        <div className="bg-neutral-50 dark:bg-neutral-900 p-4 rounded-md">
          <Code>
            {`// Example usage
<H1>Main Page Title</H1>
<Lead>Important introductory content</Lead>
<Text>Regular body content with optimal readability</Text>
<Muted>Supporting information and metadata</Muted>`}
          </Code>
        </div>
      </section>

      <footer className="pt-6 border-t border-neutral-200 dark:border-neutral-800">
        <Muted>
          This typography system is part of the AppFlowy UI flat minimalist
          design system, focusing on content clarity and user experience.
        </Muted>
      </footer>
    </article>
  ),
};

export const AccessibilityExample: Story = {
  render: () => (
    <div className="space-y-6">
      <Typography variant="overline" color="muted" className="mb-4">
        Accessibility Features
      </Typography>

      <div className="space-y-4">
        <H2>Screen Reader Compatibility</H2>
        <Text>
          All typography components use semantic HTML elements and proper
          heading hierarchy to ensure compatibility with screen readers and
          assistive technologies.
        </Text>

        <H3>Focus Management</H3>
        <Text>
          Interactive typography elements include proper focus indicators that
          work within the flat design aesthetic while meeting accessibility
          requirements.
        </Text>

        <div className="p-4 bg-accent-blue-50 dark:bg-accent-blue-900/20 rounded-md">
          <Typography variant="body-small" color="accent-blue">
            <strong>Accessibility Note:</strong> This typography system
            maintains WCAG 2.1 AA contrast ratios and provides clear visual
            hierarchy for users with various accessibility needs.
          </Typography>
        </div>
      </div>
    </div>
  ),
};
