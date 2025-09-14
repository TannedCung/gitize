/**
 * Visual Flat Design Validation Tests
 *
 * This test suite validates the visual appearance of flat design implementation:
 * - Components render with flat, borderless appearance
 * - Interaction states provide subtle feedback
 * - Typography creates clear hierarchy
 * - Layouts feel spacious and uncluttered
 */

import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { Button } from '../Button';
import { TextField } from '../TextField';
import { Avatar } from '../Avatar';
import { Card } from '../Card';
import { Alert } from '../Alert';
import { Loading } from '../Loading';
import { Typography } from '../Typography';

describe('Flat Design Visual Validation', () => {
  describe('Component Flat Appearance', () => {
    test('Button variants render with flat, borderless design', () => {
      const { container } = render(
        <div data-testid="button-showcase">
          <Button variant="primary" data-testid="primary-btn">
            Primary
          </Button>
          <Button variant="secondary" data-testid="secondary-btn">
            Secondary
          </Button>
          <Button variant="outline" data-testid="outline-btn">
            Outline
          </Button>
          <Button variant="ghost" data-testid="ghost-btn">
            Ghost
          </Button>
          <Button variant="danger" data-testid="danger-btn">
            Danger
          </Button>
        </div>
      );

      // Test each button variant for flat design characteristics
      const variants = ['primary', 'secondary', 'outline', 'ghost', 'danger'];

      variants.forEach(variant => {
        const button = screen.getByTestId(`${variant}-btn`);
        expect(button).toBeInTheDocument();

        // Should have flat appearance classes
        expect(button).toHaveClass('border-none'); // No borders
        expect(button).not.toHaveClass(/shadow/); // No shadows
        expect(button).not.toHaveClass(/gradient/); // No gradients

        // Should have proper flat styling
        const computedStyle = window.getComputedStyle(button);
        expect(computedStyle.boxShadow).toBe('none');
        expect(computedStyle.backgroundImage).toBe('none');
      });
    });

    test('TextField variants render with borderless flat design', () => {
      const { container } = render(
        <div data-testid="textfield-showcase">
          <TextField
            label="Borderless Input"
            variant="borderless"
            data-testid="borderless-input"
          />
          <TextField
            label="Bottom Line Input"
            variant="bottom-line"
            data-testid="bottom-line-input"
          />
          <TextField
            label="Subtle Outline Input"
            variant="subtle-outline"
            data-testid="subtle-outline-input"
          />
        </div>
      );

      const borderlessInput = container.querySelector(
        '[data-testid="borderless-input"] input'
      );
      const bottomLineInput = container.querySelector(
        '[data-testid="bottom-line-input"] input'
      );
      const subtleOutlineInput = container.querySelector(
        '[data-testid="subtle-outline-input"] input'
      );

      // Borderless should have no borders
      expect(borderlessInput).toHaveClass('border-0');

      // Bottom line should have minimal border styling
      expect(bottomLineInput).toHaveClass('border-0', 'border-b');

      // Subtle outline should have transparent border by default
      expect(subtleOutlineInput).toHaveClass('border', 'border-transparent');

      // All should have flat appearance
      [borderlessInput, bottomLineInput, subtleOutlineInput].forEach(input => {
        if (input) {
          const styles = window.getComputedStyle(input);
          expect(styles.boxShadow).toBe('none');
          expect(styles.backgroundImage).toBe('none');
        }
      });
    });

    test('Avatar renders with flat, circular design', () => {
      const { container } = render(
        <div data-testid="avatar-showcase">
          <Avatar alt="User 1" fallback="U1" data-testid="avatar-fallback" />
          <Avatar
            alt="User 2"
            src="/test-avatar.jpg"
            data-testid="avatar-image"
          />
          <Avatar
            alt="User 3"
            fallback="U3"
            status="online"
            showStatus
            data-testid="avatar-status"
          />
        </div>
      );

      const avatars = container.querySelectorAll('[data-testid^="avatar-"]');

      avatars.forEach(avatar => {
        const styles = window.getComputedStyle(avatar);

        // Should be circular and flat
        expect(styles.borderRadius).toBe('9999px'); // rounded-full
        expect(styles.boxShadow).toBe('none');
        expect(styles.backgroundImage).toBe('none');
      });
    });

    test('Card components render with flat, borderless design', () => {
      const { container } = render(
        <Card data-testid="flat-card">
          <Card.Header data-testid="card-header">
            <Typography variant="h3">Card Title</Typography>
          </Card.Header>
          <Card.Content data-testid="card-content">
            <Typography variant="body">
              Card content with flat design.
            </Typography>
          </Card.Content>
          <Card.Footer data-testid="card-footer">
            <Button variant="primary">Action</Button>
          </Card.Footer>
        </Card>
      );

      const card = screen.getByTestId('flat-card');
      const cardElements = [
        card,
        ...container.querySelectorAll('[data-testid^="card-"]'),
      ];

      cardElements.forEach(element => {
        const styles = window.getComputedStyle(element);

        // Should have flat appearance
        expect(styles.boxShadow).toBe('none');
        expect(styles.backgroundImage).toBe('none');
      });
    });

    test('Alert components render with flat, borderless notifications', () => {
      const { container } = render(
        <div data-testid="alert-showcase">
          <Alert variant="info" data-testid="info-alert">
            Info message
          </Alert>
          <Alert variant="success" data-testid="success-alert">
            Success message
          </Alert>
          <Alert variant="warning" data-testid="warning-alert">
            Warning message
          </Alert>
          <Alert variant="error" data-testid="error-alert">
            Error message
          </Alert>
        </div>
      );

      const alerts = container.querySelectorAll('[role="alert"]');

      alerts.forEach(alert => {
        const styles = window.getComputedStyle(alert);

        // Should have flat appearance with soft backgrounds
        expect(styles.boxShadow).toBe('none');
        expect(styles.backgroundImage).toBe('none');

        // Should have subtle background colors, not heavy borders
        expect(styles.backgroundColor).not.toBe('transparent');
      });
    });

    test('Loading components render with flat, simple animations', () => {
      const { container } = render(
        <div data-testid="loading-showcase">
          <Loading variant="spinner" data-testid="spinner-loading" />
          <Loading variant="dots" data-testid="dots-loading" />
          <Loading variant="pulse" data-testid="pulse-loading" />
        </div>
      );

      const loadingElements = container.querySelectorAll(
        '[data-testid$="-loading"]'
      );

      loadingElements.forEach(element => {
        const styles = window.getComputedStyle(element);

        // Should have flat appearance
        expect(styles.boxShadow).toBe('none');
        expect(styles.backgroundImage).toBe('none');
      });
    });
  });

  describe('Typography Hierarchy Validation', () => {
    test('Typography components create clear hierarchy through size and weight', () => {
      const { container } = render(
        <div data-testid="typography-hierarchy">
          <Typography variant="h1" data-testid="heading-1">
            Heading 1
          </Typography>
          <Typography variant="h2" data-testid="heading-2">
            Heading 2
          </Typography>
          <Typography variant="h3" data-testid="heading-3">
            Heading 3
          </Typography>
          <Typography variant="body" data-testid="body-text">
            Body text
          </Typography>
          <Typography variant="caption" data-testid="caption-text">
            Caption text
          </Typography>
        </div>
      );

      const h1 = screen.getByTestId('heading-1');
      const h2 = screen.getByTestId('heading-2');
      const h3 = screen.getByTestId('heading-3');
      const body = screen.getByTestId('body-text');
      const caption = screen.getByTestId('caption-text');

      // Get computed styles
      const h1Styles = window.getComputedStyle(h1);
      const h2Styles = window.getComputedStyle(h2);
      const h3Styles = window.getComputedStyle(h3);
      const bodyStyles = window.getComputedStyle(body);
      const captionStyles = window.getComputedStyle(caption);

      // Verify size hierarchy
      expect(parseInt(h1Styles.fontSize)).toBeGreaterThan(
        parseInt(h2Styles.fontSize)
      );
      expect(parseInt(h2Styles.fontSize)).toBeGreaterThan(
        parseInt(h3Styles.fontSize)
      );
      expect(parseInt(h3Styles.fontSize)).toBeGreaterThanOrEqual(
        parseInt(bodyStyles.fontSize)
      );
      expect(parseInt(bodyStyles.fontSize)).toBeGreaterThan(
        parseInt(captionStyles.fontSize)
      );

      // Verify weight hierarchy
      expect(parseInt(h1Styles.fontWeight)).toBeGreaterThanOrEqual(
        parseInt(h2Styles.fontWeight)
      );
      expect(parseInt(h2Styles.fontWeight)).toBeGreaterThanOrEqual(
        parseInt(h3Styles.fontWeight)
      );
    });

    test('Button sizes use typography for hierarchy instead of heavy styling', () => {
      const { container } = render(
        <div data-testid="button-sizes">
          <Button size="sm" data-testid="small-btn">
            Small
          </Button>
          <Button size="md" data-testid="medium-btn">
            Medium
          </Button>
          <Button size="lg" data-testid="large-btn">
            Large
          </Button>
        </div>
      );

      const smallBtn = screen.getByTestId('small-btn');
      const mediumBtn = screen.getByTestId('medium-btn');
      const largeBtn = screen.getByTestId('large-btn');

      const smallStyles = window.getComputedStyle(smallBtn);
      const mediumStyles = window.getComputedStyle(mediumBtn);
      const largeStyles = window.getComputedStyle(largeBtn);

      // Verify typography-based sizing
      expect(parseInt(largeStyles.fontSize)).toBeGreaterThanOrEqual(
        parseInt(mediumStyles.fontSize)
      );
      expect(parseInt(mediumStyles.fontSize)).toBeGreaterThanOrEqual(
        parseInt(smallStyles.fontSize)
      );

      // Verify font weight differences
      expect(parseInt(largeStyles.fontWeight)).toBeGreaterThanOrEqual(
        parseInt(mediumStyles.fontWeight)
      );

      // All should maintain flat appearance
      [smallBtn, mediumBtn, largeBtn].forEach(btn => {
        const styles = window.getComputedStyle(btn);
        expect(styles.boxShadow).toBe('none');
      });
    });
  });

  describe('Spacious Layout Validation', () => {
    test('Components have generous internal spacing', () => {
      const { container } = render(
        <div data-testid="spacing-test">
          <Button size="lg" data-testid="spacious-button">
            Spacious Button
          </Button>
          <TextField
            label="Spacious Input"
            size="lg"
            helperText="With generous spacing"
            data-testid="spacious-input"
          />
          <Card data-testid="spacious-card">
            <Card.Content>Spacious card content</Card.Content>
          </Card>
        </div>
      );

      const button = screen.getByTestId('spacious-button');
      const input = container.querySelector(
        '[data-testid="spacious-input"] input'
      );
      const card = screen.getByTestId('spacious-card');

      // Button should have generous padding
      const buttonStyles = window.getComputedStyle(button);
      expect(parseInt(buttonStyles.paddingLeft)).toBeGreaterThanOrEqual(24); // At least 1.5rem
      expect(parseInt(buttonStyles.paddingTop)).toBeGreaterThanOrEqual(12); // At least 0.75rem

      // Input should have generous padding
      if (input) {
        const inputStyles = window.getComputedStyle(input);
        expect(parseInt(inputStyles.paddingTop)).toBeGreaterThanOrEqual(16); // At least 1rem
      }

      // Card should have generous internal spacing
      const cardStyles = window.getComputedStyle(card);
      expect(parseInt(cardStyles.padding)).toBeGreaterThanOrEqual(16); // At least 1rem
    });

    test('Form layouts have airy spacing between elements', () => {
      const { container } = render(
        <form className="space-y-6" data-testid="airy-form">
          <TextField label="First Name" />
          <TextField label="Last Name" />
          <TextField label="Email" />
          <div className="pt-4">
            <Button type="submit">Submit</Button>
          </div>
        </form>
      );

      const form = screen.getByTestId('airy-form');
      const formStyles = window.getComputedStyle(form);

      // Should have spacing between form elements
      // This tests the space-y-6 class application
      expect(form).toHaveClass('space-y-6');
    });

    test('Card layouts provide breathing room around content', () => {
      const { container } = render(
        <div className="space-y-8" data-testid="card-layout">
          <Card>
            <Card.Header>
              <Typography variant="h3">First Card</Typography>
            </Card.Header>
            <Card.Content>
              <Typography variant="body">
                Content with breathing room.
              </Typography>
            </Card.Content>
          </Card>
          <Card>
            <Card.Header>
              <Typography variant="h3">Second Card</Typography>
            </Card.Header>
            <Card.Content>
              <Typography variant="body">More content with space.</Typography>
            </Card.Content>
          </Card>
        </div>
      );

      const layout = screen.getByTestId('card-layout');

      // Should have generous spacing between cards
      expect(layout).toHaveClass('space-y-8');

      // Cards should have internal spacing
      const cards = container.querySelectorAll('[role="region"], div');
      cards.forEach(card => {
        const styles = window.getComputedStyle(card);
        // Should have some form of padding or margin
        const hasPadding =
          parseInt(styles.padding) > 0 ||
          parseInt(styles.paddingTop) > 0 ||
          parseInt(styles.margin) > 0;
        if (card.tagName === 'DIV' && card.textContent) {
          expect(hasPadding).toBe(true);
        }
      });
    });
  });

  describe('Responsive Flat Design', () => {
    test('Components maintain flat design across different viewport sizes', () => {
      // Test mobile viewport
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 375,
      });

      const { container, rerender } = render(
        <div className="p-4 md:p-8" data-testid="responsive-container">
          <Button className="w-full md:w-auto" data-testid="responsive-btn">
            Responsive Button
          </Button>
          <TextField
            label="Responsive Input"
            className="w-full"
            data-testid="responsive-input"
          />
        </div>
      );

      let button = screen.getByTestId('responsive-btn');
      let buttonStyles = window.getComputedStyle(button);

      // Should maintain flat design on mobile
      expect(buttonStyles.boxShadow).toBe('none');
      expect(buttonStyles.backgroundImage).toBe('none');

      // Test desktop viewport
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 1920,
      });

      rerender(
        <div className="p-4 md:p-8" data-testid="responsive-container">
          <Button className="w-full md:w-auto" data-testid="responsive-btn">
            Responsive Button
          </Button>
          <TextField
            label="Responsive Input"
            className="w-full"
            data-testid="responsive-input"
          />
        </div>
      );

      button = screen.getByTestId('responsive-btn');
      buttonStyles = window.getComputedStyle(button);

      // Should maintain flat design on desktop
      expect(buttonStyles.boxShadow).toBe('none');
      expect(buttonStyles.backgroundImage).toBe('none');
    });
  });

  describe('Accessibility in Flat Design', () => {
    test('Focus states are visible while maintaining flat aesthetic', () => {
      const { container } = render(
        <div data-testid="focus-test">
          <Button data-testid="focusable-btn">Focusable Button</Button>
          <TextField label="Focusable Input" data-testid="focusable-input" />
        </div>
      );

      const button = screen.getByTestId('focusable-btn');
      const input = container.querySelector(
        '[data-testid="focusable-input"] input'
      );

      // Should have focus ring classes for accessibility
      expect(button).toHaveClass(/focus:/);
      if (input) {
        expect(input).toHaveClass(/focus:/);
      }
    });

    test('Error states use minimal visual feedback', () => {
      const { container } = render(
        <div data-testid="error-states">
          <TextField
            label="Error Input"
            error="This field is required"
            data-testid="error-input"
          />
          <Alert variant="error" data-testid="error-alert">
            Error message
          </Alert>
        </div>
      );

      const errorAlert = screen.getByTestId('error-alert');
      const errorInput = container.querySelector(
        '[data-testid="error-input"] input'
      );

      // Error states should maintain flat design
      const alertStyles = window.getComputedStyle(errorAlert);
      expect(alertStyles.boxShadow).toBe('none');

      if (errorInput) {
        const inputStyles = window.getComputedStyle(errorInput);
        expect(inputStyles.boxShadow).toBe('none');
      }
    });
  });
});
