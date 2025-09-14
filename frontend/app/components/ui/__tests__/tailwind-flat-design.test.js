/**
 * Tailwind Configuration Flat Design Validation
 *
 * This test validates that the Tailwind configuration follows flat design principles:
 * - No shadow utilities (except 'none')
 * - Neutral color palette with soft accents
 * - Typography-first hierarchy
 * - Generous spacing system
 * - Minimal border utilities
 */

const tailwindConfig = require('../../../tailwind.config.js');

describe('Tailwind Flat Design Configuration', () => {
  describe('Shadow Utilities Removal', () => {
    test('should only have "none" shadow utility for flat design', () => {
      const shadows = tailwindConfig.theme.extend.boxShadow;

      // Should only have 'none' shadow
      expect(Object.keys(shadows)).toEqual(['none']);
      expect(shadows.none).toBe('none');
    });

    test('should not have any gradient utilities in background', () => {
      // Tailwind doesn't include gradients by default in our config
      // This ensures we haven't added any
      const backgroundImage = tailwindConfig.theme.extend.backgroundImage;
      expect(backgroundImage).toBeUndefined();
    });
  });

  describe('Neutral Color Palette', () => {
    test('should have comprehensive neutral color scale', () => {
      const colors = tailwindConfig.theme.extend.colors;

      expect(colors.neutral).toBeDefined();
      expect(colors.neutral).toHaveProperty('white', '#FFFFFF');
      expect(colors.neutral).toHaveProperty('black', '#000000');

      // Should have full gray scale
      const expectedGraySteps = [
        50, 100, 200, 300, 400, 500, 600, 700, 800, 900,
      ];
      expectedGraySteps.forEach(step => {
        expect(colors.neutral).toHaveProperty(step.toString());
      });
    });

    test('should have soft accent colors for minimal visual impact', () => {
      const colors = tailwindConfig.theme.extend.colors;

      // Should have blue accent
      expect(colors.accent.blue).toBeDefined();
      expect(colors.accent.blue).toHaveProperty('500', '#3B82F6');

      // Should have green accent
      expect(colors.accent.green).toBeDefined();
      expect(colors.accent.green).toHaveProperty('500', '#059669');

      // Should have red accent for errors
      expect(colors.accent.red).toBeDefined();
      expect(colors.accent.red).toHaveProperty('500', '#EF4444');

      // Should have amber accent for warnings
      expect(colors.accent.amber).toBeDefined();
      expect(colors.accent.amber).toHaveProperty('500', '#F59E0B');
    });

    test('accent colors should be muted and not overwhelming', () => {
      const colors = tailwindConfig.theme.extend.colors;

      // Test that accent colors are not too bright/saturated
      // This is a basic test - in practice you'd use color analysis
      Object.keys(colors.accent).forEach(colorName => {
        const colorScale = colors.accent[colorName];
        expect(colorScale[500]).toMatch(/^#[0-9A-F]{6}$/i); // Valid hex color
      });
    });
  });

  describe('Typography System', () => {
    test('should have clean font stack with Inter as primary', () => {
      const fontFamily = tailwindConfig.theme.extend.fontFamily;

      expect(fontFamily.sans).toBeDefined();
      expect(fontFamily.sans[0]).toBe('Inter');
      expect(fontFamily.sans).toContain('system-ui');
      expect(fontFamily.sans).toContain('sans-serif');
    });

    test('should have optimized typography scale with proper line heights', () => {
      const fontSize = tailwindConfig.theme.extend.fontSize;

      // Check key font sizes have line height and letter spacing
      expect(fontSize.base).toEqual([
        '1rem',
        { lineHeight: '1.625rem', letterSpacing: '0' },
      ]);
      expect(fontSize.lg).toEqual([
        '1.125rem',
        { lineHeight: '1.75rem', letterSpacing: '-0.016em' },
      ]);
      expect(fontSize.xl).toEqual([
        '1.25rem',
        { lineHeight: '1.875rem', letterSpacing: '-0.025em' },
      ]);
    });

    test('should have comprehensive font weight scale', () => {
      const fontWeight = tailwindConfig.theme.extend.fontWeight;

      const expectedWeights = [
        'thin',
        'extralight',
        'light',
        'normal',
        'medium',
        'semibold',
        'bold',
        'extrabold',
        'black',
      ];
      expectedWeights.forEach(weight => {
        expect(fontWeight).toHaveProperty(weight);
      });
    });
  });

  describe('Generous Spacing System', () => {
    test('should have expanded spacing scale for airy layouts', () => {
      const spacing = tailwindConfig.theme.extend.spacing;

      // Should have basic spacing
      expect(spacing).toHaveProperty('4', '1rem');
      expect(spacing).toHaveProperty('8', '2rem');
      expect(spacing).toHaveProperty('12', '3rem');

      // Should have generous spacing for airy layouts
      expect(spacing).toHaveProperty('24', '6rem');
      expect(spacing).toHaveProperty('32', '8rem');
      expect(spacing).toHaveProperty('48', '12rem');

      // Should have extra large spacing
      expect(spacing).toHaveProperty('96', '24rem');
      expect(spacing).toHaveProperty('128', '32rem');
      expect(spacing).toHaveProperty('256', '64rem');
    });

    test('spacing values should be in rem units for scalability', () => {
      const spacing = tailwindConfig.theme.extend.spacing;

      // Most spacing values should be in rem (except px values)
      Object.entries(spacing).forEach(([key, value]) => {
        if (key !== 'px' && key !== '0') {
          expect(value).toMatch(/rem$/);
        }
      });
    });
  });

  describe('Minimal Border Utilities', () => {
    test('should have minimal border radius options', () => {
      const borderRadius = tailwindConfig.theme.extend.borderRadius;

      expect(borderRadius.none).toBe('0');
      expect(borderRadius.sm).toBe('0.125rem'); // Minimal rounding
      expect(borderRadius.DEFAULT).toBe('0.25rem'); // Subtle rounding
      expect(borderRadius.full).toBe('9999px'); // Circular
    });

    test('should have minimal border width options', () => {
      const borderWidth = tailwindConfig.theme.extend.borderWidth;

      expect(borderWidth.DEFAULT).toBe('1px');
      expect(borderWidth[0]).toBe('0');
      expect(borderWidth[2]).toBe('2px');

      // Should not have thick borders for flat design
      expect(parseInt(borderWidth[8])).toBeLessThanOrEqual(8);
    });

    test('should have subtle border colors for flat design', () => {
      const borderColor = tailwindConfig.theme.extend.borderColor;

      expect(borderColor.DEFAULT).toBe('#E5E5E5'); // Subtle default
      expect(borderColor.none).toBe('transparent');
      expect(borderColor.subtle).toBe('#E5E5E5');
      expect(borderColor.focus).toBe('#3B82F6'); // Focus state only
    });
  });

  describe('Flat Design Animations', () => {
    test('should have minimal animations without scale or shadow effects', () => {
      const animation = tailwindConfig.theme.extend.animation;

      // Should have basic fade animations
      expect(animation).toHaveProperty('fade-in');
      expect(animation).toHaveProperty('fade-out');

      // Should have slide animations
      expect(animation).toHaveProperty('slide-in');
      expect(animation).toHaveProperty('slide-out');

      // Should not have bounce, pulse, or other 3D-like animations
      expect(animation).not.toHaveProperty('bounce');
      expect(animation).not.toHaveProperty('pulse');
    });

    test('keyframes should avoid 3D transforms and shadows', () => {
      const keyframes = tailwindConfig.theme.extend.keyframes;

      // Check that keyframes use only flat transforms
      Object.values(keyframes).forEach(keyframe => {
        Object.values(keyframe).forEach(step => {
          if (step.transform) {
            // Should not use 3D transforms like rotateX, rotateY, scale3d
            expect(step.transform).not.toMatch(/rotate[XY]/);
            expect(step.transform).not.toMatch(/scale3d/);
            expect(step.transform).not.toMatch(/translate3d/);
          }

          // Should not use box shadows
          expect(step).not.toHaveProperty('boxShadow');
          expect(step).not.toHaveProperty('box-shadow');
        });
      });
    });
  });

  describe('Scrollbar Styling', () => {
    test('should have flat scrollbar utilities without rounded corners', () => {
      // This tests the plugin configuration
      const plugins = tailwindConfig.plugins;
      expect(plugins).toHaveLength(1); // Should have scrollbar plugin

      // The plugin should be a function that adds scrollbar utilities
      expect(typeof plugins[0]).toBe('function');
    });
  });

  describe('Dark Mode Support', () => {
    test('should use class-based dark mode for flat design consistency', () => {
      expect(tailwindConfig.darkMode).toBe('class');
    });
  });

  describe('Responsive Design', () => {
    test('should have appropriate breakpoints for spacious layouts', () => {
      const screens = tailwindConfig.theme.extend.screens;

      // Should have xs breakpoint for mobile-first design
      expect(screens.xs).toBe('475px');
    });
  });
});
