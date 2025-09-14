/**
 * Typography utilities for content-first hierarchy
 * Provides helper functions for typography calculations and accessibility
 */

/**
 * Typography scale configuration for consistent sizing
 */
export const typographyScale = {
  // Base font size in rem
  base: 1,

  // Scale ratios for different screen sizes
  ratios: {
    mobile: 1.125, // Minor second
    tablet: 1.2, // Minor third
    desktop: 1.25, // Major third
  },

  // Line height ratios for optimal readability
  lineHeights: {
    tight: 1.25,
    normal: 1.5,
    relaxed: 1.625,
    loose: 2,
  },

  // Letter spacing values for different text sizes
  letterSpacing: {
    tighter: '-0.05em',
    tight: '-0.025em',
    normal: '0',
    wide: '0.025em',
    wider: '0.05em',
    widest: '0.1em',
  },
} as const;

/**
 * Calculate font size based on scale and level
 */
export function calculateFontSize(
  level: number,
  screenSize: keyof typeof typographyScale.ratios = 'desktop'
): number {
  const ratio = typographyScale.ratios[screenSize];
  return typographyScale.base * Math.pow(ratio, level);
}

/**
 * Get optimal line height for a given font size
 */
export function getOptimalLineHeight(fontSize: number): number {
  // Smaller text needs more line height for readability
  if (fontSize <= 0.875) return 1.625; // relaxed
  if (fontSize <= 1) return 1.5; // normal
  if (fontSize <= 1.25) return 1.375; // snug
  return 1.25; // tight for large headings
}

/**
 * Get optimal letter spacing for a given font size
 */
export function getOptimalLetterSpacing(fontSize: number): string {
  // Larger text benefits from tighter letter spacing
  if (fontSize >= 2) return typographyScale.letterSpacing.tight;
  if (fontSize >= 1.5) return typographyScale.letterSpacing.normal;
  if (fontSize <= 0.875) return typographyScale.letterSpacing.wide;
  return typographyScale.letterSpacing.normal;
}

/**
 * Typography hierarchy configuration for content-first design
 */
export const typographyHierarchy = {
  // Display text for hero sections
  display: {
    fontSize: { mobile: '2.5rem', tablet: '3rem', desktop: '3.75rem' },
    lineHeight: { mobile: '1.2', tablet: '1.15', desktop: '1.1' },
    letterSpacing: '-0.025em',
    fontWeight: '700',
  },

  // Heading levels with responsive sizing
  h1: {
    fontSize: { mobile: '2rem', tablet: '2.5rem', desktop: '3rem' },
    lineHeight: { mobile: '1.25', tablet: '1.2', desktop: '1.15' },
    letterSpacing: '-0.025em',
    fontWeight: '700',
  },

  h2: {
    fontSize: { mobile: '1.75rem', tablet: '2rem', desktop: '2.25rem' },
    lineHeight: { mobile: '1.3', tablet: '1.25', desktop: '1.2' },
    letterSpacing: '-0.025em',
    fontWeight: '600',
  },

  h3: {
    fontSize: { mobile: '1.5rem', tablet: '1.75rem', desktop: '1.875rem' },
    lineHeight: { mobile: '1.35', tablet: '1.3', desktop: '1.25' },
    letterSpacing: '-0.016em',
    fontWeight: '600',
  },

  h4: {
    fontSize: { mobile: '1.25rem', tablet: '1.375rem', desktop: '1.5rem' },
    lineHeight: { mobile: '1.4', tablet: '1.35', desktop: '1.3' },
    letterSpacing: '0',
    fontWeight: '500',
  },

  h5: {
    fontSize: { mobile: '1.125rem', tablet: '1.25rem', desktop: '1.25rem' },
    lineHeight: { mobile: '1.45', tablet: '1.4', desktop: '1.35' },
    letterSpacing: '0',
    fontWeight: '500',
  },

  h6: {
    fontSize: { mobile: '1rem', tablet: '1.125rem', desktop: '1.125rem' },
    lineHeight: { mobile: '1.5', tablet: '1.45', desktop: '1.4' },
    letterSpacing: '0',
    fontWeight: '500',
  },

  // Body text variants
  'body-large': {
    fontSize: { mobile: '1.125rem', tablet: '1.125rem', desktop: '1.125rem' },
    lineHeight: { mobile: '1.625', tablet: '1.625', desktop: '1.625' },
    letterSpacing: '0',
    fontWeight: '400',
  },

  body: {
    fontSize: { mobile: '1rem', tablet: '1rem', desktop: '1rem' },
    lineHeight: { mobile: '1.625', tablet: '1.625', desktop: '1.625' },
    letterSpacing: '0',
    fontWeight: '400',
  },

  'body-small': {
    fontSize: { mobile: '0.875rem', tablet: '0.875rem', desktop: '0.875rem' },
    lineHeight: { mobile: '1.625', tablet: '1.625', desktop: '1.625' },
    letterSpacing: '0.016em',
    fontWeight: '400',
  },

  // Supporting text
  caption: {
    fontSize: { mobile: '0.75rem', tablet: '0.75rem', desktop: '0.75rem' },
    lineHeight: { mobile: '1.5', tablet: '1.5', desktop: '1.5' },
    letterSpacing: '0.025em',
    fontWeight: '400',
  },

  overline: {
    fontSize: { mobile: '0.75rem', tablet: '0.75rem', desktop: '0.75rem' },
    lineHeight: { mobile: '1.5', tablet: '1.5', desktop: '1.5' },
    letterSpacing: '0.1em',
    fontWeight: '500',
  },
} as const;

/**
 * Generate responsive typography CSS for a given variant
 */
export function generateResponsiveTypography(
  variant: keyof typeof typographyHierarchy
): Record<string, any> {
  const config = typographyHierarchy[variant];

  return {
    fontSize: config.fontSize.mobile,
    lineHeight: config.lineHeight.mobile,
    letterSpacing: config.letterSpacing,
    fontWeight: config.fontWeight,

    '@media (min-width: 768px)': {
      fontSize: config.fontSize.tablet,
      lineHeight: config.lineHeight.tablet,
    },

    '@media (min-width: 1024px)': {
      fontSize: config.fontSize.desktop,
      lineHeight: config.lineHeight.desktop,
    },
  };
}

/**
 * Typography accessibility utilities
 */
export const typographyA11y = {
  /**
   * Check if text contrast meets WCAG guidelines
   */
  checkContrast(
    foreground: string,
    background: string
  ): {
    ratio: number;
    aa: boolean;
    aaa: boolean;
  } {
    // Simplified contrast calculation - in production, use a proper library
    const getLuminance = (hex: string): number => {
      const rgb = parseInt(hex.slice(1), 16);
      const r = (rgb >> 16) & 0xff;
      const g = (rgb >> 8) & 0xff;
      const b = (rgb >> 0) & 0xff;

      const [rs, gs, bs] = [r, g, b].map(c => {
        c = c / 255;
        return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
      });

      return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
    };

    const l1 = getLuminance(foreground);
    const l2 = getLuminance(background);
    const ratio = (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05);

    return {
      ratio,
      aa: ratio >= 4.5,
      aaa: ratio >= 7,
    };
  },

  /**
   * Get recommended font weight for better readability
   */
  getRecommendedWeight(fontSize: number, contrast: number): string {
    // Smaller text or lower contrast needs heavier weight
    if (fontSize <= 0.875 || contrast < 4.5) return '500';
    if (fontSize <= 1) return '400';
    return '400';
  },

  /**
   * Generate ARIA attributes for typography elements
   */
  getAriaAttributes(
    variant: keyof typeof typographyHierarchy
  ): Record<string, string> {
    const headingLevels = ['h1', 'h2', 'h3', 'h4', 'h5', 'h6'];

    if (headingLevels.includes(variant)) {
      return {
        role: 'heading',
        'aria-level': variant.slice(1),
      };
    }

    if (variant === 'caption' || variant === 'overline') {
      return {
        'aria-label': 'Supporting text',
      };
    }

    return {};
  },
};

/**
 * Typography spacing utilities for content organization
 */
export const typographySpacing = {
  // Vertical rhythm based on line height
  getVerticalRhythm(baseLineHeight: number = 1.5): Record<string, string> {
    const unit = baseLineHeight;

    return {
      'space-y-rhythm-xs': `${unit * 0.25}rem`,
      'space-y-rhythm-sm': `${unit * 0.5}rem`,
      'space-y-rhythm-md': `${unit * 1}rem`,
      'space-y-rhythm-lg': `${unit * 1.5}rem`,
      'space-y-rhythm-xl': `${unit * 2}rem`,
      'space-y-rhythm-2xl': `${unit * 3}rem`,
    };
  },

  // Margin utilities for typography elements
  getTypographyMargins(): Record<string, string> {
    return {
      // Heading margins for proper spacing
      'mb-heading-1': '1.5rem',
      'mb-heading-2': '1.25rem',
      'mb-heading-3': '1rem',
      'mb-heading-4': '0.875rem',
      'mb-heading-5': '0.75rem',
      'mb-heading-6': '0.625rem',

      // Paragraph margins
      'mb-paragraph': '1rem',
      'mb-paragraph-large': '1.25rem',
      'mb-paragraph-small': '0.75rem',

      // List margins
      'mb-list': '1rem',
      'ml-list': '1.5rem',

      // Section spacing
      'mb-section': '2rem',
      'mb-section-large': '3rem',
    };
  },
};

/**
 * Export all typography utilities
 */
export const typography = {
  scale: typographyScale,
  hierarchy: typographyHierarchy,
  a11y: typographyA11y,
  spacing: typographySpacing,
  calculateFontSize,
  getOptimalLineHeight,
  getOptimalLetterSpacing,
  generateResponsiveTypography,
} as const;
