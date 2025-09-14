'use client';

import React from 'react';
import { cn } from './utils';
import { BaseComponentProps } from './types';

/**
 * Typography component variants for content-first hierarchy
 */
export type TypographyVariant =
  | 'h1'
  | 'h2'
  | 'h3'
  | 'h4'
  | 'h5'
  | 'h6'
  | 'body'
  | 'body-large'
  | 'body-small'
  | 'caption'
  | 'overline'
  | 'lead'
  | 'muted'
  | 'code'
  | 'blockquote';

/**
 * Typography weight options for visual hierarchy
 */
export type TypographyWeight =
  | 'thin'
  | 'extralight'
  | 'light'
  | 'normal'
  | 'medium'
  | 'semibold'
  | 'bold'
  | 'extrabold'
  | 'black';

/**
 * Typography alignment options
 */
export type TypographyAlign = 'left' | 'center' | 'right' | 'justify';

/**
 * Typography color variants for flat design
 */
export type TypographyColor =
  | 'default'
  | 'muted'
  | 'accent-blue'
  | 'accent-green'
  | 'accent-red'
  | 'accent-amber'
  | 'inherit';

export interface TypographyProps extends BaseComponentProps {
  /** Typography variant that determines size and styling */
  variant?: TypographyVariant;
  /** Font weight for visual hierarchy */
  weight?: TypographyWeight;
  /** Text alignment */
  align?: TypographyAlign;
  /** Color variant for flat design */
  color?: TypographyColor;
  /** HTML element to render as */
  as?: keyof JSX.IntrinsicElements;
  /** Whether text should be truncated with ellipsis */
  truncate?: boolean;
  /** Whether text should wrap or not */
  noWrap?: boolean;
  /** Whether to use monospace font */
  mono?: boolean;
}

/**
 * Typography variant styles optimized for readability and content hierarchy
 */
const typographyVariants: Record<TypographyVariant, string> = {
  // Heading hierarchy with optimal size and weight scales
  h1: 'text-4xl md:text-5xl font-bold leading-tight tracking-tight',
  h2: 'text-3xl md:text-4xl font-bold leading-tight tracking-tight',
  h3: 'text-2xl md:text-3xl font-semibold leading-snug tracking-tight',
  h4: 'text-xl md:text-2xl font-semibold leading-snug tracking-tight',
  h5: 'text-lg md:text-xl font-medium leading-snug',
  h6: 'text-base md:text-lg font-medium leading-snug',

  // Body text with optimal readability settings
  body: 'text-base leading-relaxed tracking-normal',
  'body-large': 'text-lg leading-relaxed tracking-normal',
  'body-small': 'text-sm leading-relaxed tracking-normal',

  // Supporting text variants
  caption: 'text-xs leading-normal tracking-wide uppercase',
  overline: 'text-xs leading-normal tracking-widest uppercase font-medium',
  lead: 'text-xl leading-relaxed tracking-normal font-light',
  muted: 'text-sm leading-normal tracking-normal',

  // Special content variants
  code: 'text-sm font-mono leading-normal tracking-normal',
  blockquote: 'text-lg leading-relaxed tracking-normal font-light italic',
};

/**
 * Typography color styles for flat design
 */
const typographyColors: Record<TypographyColor, string> = {
  default: 'text-neutral-900 dark:text-neutral-100',
  muted: 'text-neutral-600 dark:text-neutral-400',
  'accent-blue': 'text-accent-blue-600 dark:text-accent-blue-400',
  'accent-green': 'text-accent-green-600 dark:text-accent-green-400',
  'accent-red': 'text-accent-red-600 dark:text-accent-red-400',
  'accent-amber': 'text-accent-amber-600 dark:text-accent-amber-400',
  inherit: 'text-inherit',
};

/**
 * Typography weight styles
 */
const typographyWeights: Record<TypographyWeight, string> = {
  thin: 'font-thin',
  extralight: 'font-extralight',
  light: 'font-light',
  normal: 'font-normal',
  medium: 'font-medium',
  semibold: 'font-semibold',
  bold: 'font-bold',
  extrabold: 'font-extrabold',
  black: 'font-black',
};

/**
 * Typography alignment styles
 */
const typographyAligns: Record<TypographyAlign, string> = {
  left: 'text-left',
  center: 'text-center',
  right: 'text-right',
  justify: 'text-justify',
};

/**
 * Default HTML elements for each variant
 */
const defaultElements: Record<TypographyVariant, keyof JSX.IntrinsicElements> =
  {
    h1: 'h1',
    h2: 'h2',
    h3: 'h3',
    h4: 'h4',
    h5: 'h5',
    h6: 'h6',
    body: 'p',
    'body-large': 'p',
    'body-small': 'p',
    caption: 'span',
    overline: 'span',
    lead: 'p',
    muted: 'span',
    code: 'code',
    blockquote: 'blockquote',
  };

/**
 * Typography component for content-first hierarchy
 *
 * Implements clean font stack with optimal readability settings and
 * creates clear heading hierarchy using typography weight and size
 * for visual separation instead of borders or containers.
 */
export function Typography({
  variant = 'body',
  weight,
  align = 'left',
  color = 'default',
  as,
  truncate = false,
  noWrap = false,
  mono = false,
  className,
  children,
  ...props
}: TypographyProps) {
  // Fallback to 'p' element for invalid variants
  const Component = as || defaultElements[variant] || 'p';

  // Fallback to body variant styles for invalid variants
  const variantStyles = typographyVariants[variant] || typographyVariants.body;

  return (
    <Component
      className={cn(
        // Base typography styles
        variantStyles,
        typographyColors[color],
        typographyAligns[align],

        // Optional weight override
        weight && typographyWeights[weight],

        // Monospace font option
        mono && 'font-mono',

        // Text wrapping options
        truncate && 'truncate',
        noWrap && 'whitespace-nowrap',

        // Custom classes
        className
      )}
      {...props}
    >
      {children}
    </Component>
  );
}

/**
 * Heading component shortcuts for common use cases
 */
export const H1 = (props: Omit<TypographyProps, 'variant'>) => (
  <Typography variant="h1" as="h1" {...props} />
);

export const H2 = (props: Omit<TypographyProps, 'variant'>) => (
  <Typography variant="h2" as="h2" {...props} />
);

export const H3 = (props: Omit<TypographyProps, 'variant'>) => (
  <Typography variant="h3" as="h3" {...props} />
);

export const H4 = (props: Omit<TypographyProps, 'variant'>) => (
  <Typography variant="h4" as="h4" {...props} />
);

export const H5 = (props: Omit<TypographyProps, 'variant'>) => (
  <Typography variant="h5" as="h5" {...props} />
);
export const H6 = (props: Omit<TypographyProps, 'variant'>) => (
  <Typography variant="h6" as="h6" {...props} />
);

/**
 * Body text component shortcuts
 */
export const Text = (props: Omit<TypographyProps, 'variant'>) => (
  <Typography variant="body" as="p" {...props} />
);

export const Lead = (props: Omit<TypographyProps, 'variant'>) => (
  <Typography variant="lead" as="p" {...props} />
);

export const Muted = (props: Omit<TypographyProps, 'variant'>) => (
  <Typography variant="muted" as="span" {...props} />
);

export const Code = (props: Omit<TypographyProps, 'variant'>) => (
  <Typography variant="code" as="code" {...props} />
);

export const Blockquote = (props: Omit<TypographyProps, 'variant'>) => (
  <Typography variant="blockquote" as="blockquote" {...props} />
);
