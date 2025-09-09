import React from 'react';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {
  renderWithProviders,
  testComprehensiveAccessibility,
  accessibilityTests,
  testBothThemes,
} from '../test-utils';
import { Button } from '../Button';
import { TextField } from '../TextField';
import { Modal } from '../Modal';
import { NavigationBar } from '../NavigationBar';
import { Alert } from '../Alert';
import { Checkbox } from '../Checkbox';
import { Toggle } from '../Toggle';

// Mock complex component that combines multiple UI elements
const ComplexForm: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const [formData, setFormData] = React.useState({
    name: '',
    email: '',
    newsletter: false,
    notifications: false,
  });
  const [errors, setErrors] = React.useState<Record<string, string>>({});
  const [showSuccess, setShowSuccess] = React.useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }

    setErrors(newErrors);

    if (Object.keys(newErrors).length === 0) {
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
    }
  };

  return (
    <div>
      <NavigationBar
        title="Accessibility Test App"
        items={[
          { label: 'Home', href: '/', active: true },
          { label: 'About', href: '/about' },
          { label: 'Contact', href: '/contact' },
        ]}
      />

      <main role="main" aria-labelledby="main-heading">
        <h1 id="main-heading">User Registration Form</h1>

        {showSuccess && (
          <Alert
            variant="success"
            title="Success"
            message="Form submitted successfully!"
            dismissible
            onDismiss={() => setShowSuccess(false)}
          />
        )}

        <form onSubmit={handleSubmit} aria-label="User registration form">
          <TextField
            label="Full Name"
            value={formData.name}
            onChange={e => setFormData({ ...formData, name: e.target.value })}
            error={errors.name}
            required
            aria-describedby={errors.name ? 'name-error' : undefined}
          />

          <TextField
            label="Email Address"
            type="email"
            value={formData.email}
            onChange={e => setFormData({ ...formData, email: e.target.value })}
            error={errors.email}
            required
            aria-describedby={errors.email ? 'email-error' : undefined}
          />

          <Checkbox
            checked={formData.newsletter}
            onChange={checked =>
              setFormData({ ...formData, newsletter: checked })
            }
            label="Subscribe to newsletter"
            aria-describedby="newsletter-description"
          />
          <p id="newsletter-description" className="text-sm text-gray-600">
            Receive updates about new features and promotions
          </p>

          <Toggle
            checked={formData.notifications}
            onChange={checked =>
              setFormData({ ...formData, notifications: checked })
            }
            label="Enable notifications"
            aria-describedby="notifications-description"
          />
          <p id="notifications-description" className="text-sm text-gray-600">
            Get notified about important account updates
          </p>

          <div className="flex gap-4">
            <Button type="submit" variant="primary">
              Submit Form
            </Button>
            <Button
              type="button"
              variant="secondary"
              onClick={() => setIsModalOpen(true)}
            >
              Open Help Modal
            </Button>
          </div>
        </form>

        <Modal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          title="Help Information"
          aria-describedby="modal-description"
        >
          <div id="modal-description">
            <h2>How to fill out this form</h2>
            <ul>
              <li>Enter your full legal name in the name field</li>
              <li>Provide a valid email address for account verification</li>
              <li>Choose your communication preferences</li>
            </ul>
            <Button onClick={() => setIsModalOpen(false)}>
              Got it, thanks!
            </Button>
          </div>
        </Modal>
      </main>
    </div>
  );
};

describe('Comprehensive Accessibility Tests', () => {
  describe('Complex Form Component', () => {
    it('passes comprehensive accessibility audit', async () => {
      const { container } = renderWithProviders(<ComplexForm />);

      const results = await testComprehensiveAccessibility(container);

      // Should pass all accessibility tests
      expect(results.passed).toBe(true);
      expect(results.summary.violationCount).toBe(0);

      // Should have reasonable number of passed tests
      expect(results.summary.passCount).toBeGreaterThan(10);
    });

    it('passes color contrast tests', async () => {
      const { container } = renderWithProviders(<ComplexForm />);

      const results = await accessibilityTests.colorContrast(container);
      expect(results.passed).toBe(true);
    });

    it('passes keyboard accessibility tests', async () => {
      const { container } = renderWithProviders(<ComplexForm />);

      const results = await accessibilityTests.keyboard(container);
      expect(results.passed).toBe(true);
    });

    it('passes ARIA implementation tests', async () => {
      const { container } = renderWithProviders(<ComplexForm />);

      const results = await accessibilityTests.aria(container);
      expect(results.passed).toBe(true);
    });

    it('passes form accessibility tests', async () => {
      const { container } = renderWithProviders(<ComplexForm />);

      const results = await accessibilityTests.forms(container);
      expect(results.passed).toBe(true);
    });

    it('passes heading structure tests', async () => {
      const { container } = renderWithProviders(<ComplexForm />);

      const results = await accessibilityTests.headings(container);
      expect(results.passed).toBe(true);
    });

    it('supports full keyboard navigation', async () => {
      const user = userEvent.setup();
      renderWithProviders(<ComplexForm />);

      // Tab through all interactive elements
      const nameInput = screen.getByLabelText('Full Name');
      const emailInput = screen.getByLabelText('Email Address');
      const newsletterCheckbox = screen.getByLabelText(
        'Subscribe to newsletter'
      );
      const notificationsToggle = screen.getByLabelText('Enable notifications');
      const submitButton = screen.getByRole('button', { name: 'Submit Form' });
      const helpButton = screen.getByRole('button', {
        name: 'Open Help Modal',
      });

      // Start from the first element
      nameInput.focus();
      expect(document.activeElement).toBe(nameInput);

      // Tab to next elements
      await user.tab();
      expect(document.activeElement).toBe(emailInput);

      await user.tab();
      expect(document.activeElement).toBe(newsletterCheckbox);

      await user.tab();
      expect(document.activeElement).toBe(notificationsToggle);

      await user.tab();
      expect(document.activeElement).toBe(submitButton);

      await user.tab();
      expect(document.activeElement).toBe(helpButton);
    });

    it('handles form validation with proper ARIA announcements', async () => {
      const user = userEvent.setup();
      renderWithProviders(<ComplexForm />);

      const submitButton = screen.getByRole('button', { name: 'Submit Form' });

      // Submit empty form
      await user.click(submitButton);

      // Check for error messages
      await waitFor(() => {
        expect(screen.getByText('Name is required')).toBeInTheDocument();
        expect(screen.getByText('Email is required')).toBeInTheDocument();
      });

      // Check ARIA attributes on invalid fields
      const nameInput = screen.getByLabelText('Full Name');
      const emailInput = screen.getByLabelText('Email Address');

      expect(nameInput).toHaveAttribute('aria-invalid', 'true');
      expect(emailInput).toHaveAttribute('aria-invalid', 'true');
      expect(nameInput).toHaveAttribute('aria-describedby', 'name-error');
      expect(emailInput).toHaveAttribute('aria-describedby', 'email-error');
    });

    it('handles modal accessibility correctly', async () => {
      const user = userEvent.setup();
      renderWithProviders(<ComplexForm />);

      const helpButton = screen.getByRole('button', {
        name: 'Open Help Modal',
      });

      // Open modal
      await user.click(helpButton);

      // Check modal is properly labeled
      const modal = screen.getByRole('dialog');
      expect(modal).toHaveAttribute('aria-labelledby');
      expect(modal).toHaveAttribute('aria-describedby', 'modal-description');

      // Check focus is trapped in modal
      const modalButton = screen.getByRole('button', {
        name: 'Got it, thanks!',
      });
      expect(document.activeElement).toBe(modalButton);

      // Test escape key closes modal
      await user.keyboard('{Escape}');

      await waitFor(() => {
        expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
      });
    });

    it('passes accessibility tests in both light and dark themes', async () => {
      await testBothThemes(<ComplexForm />, async (container, _theme) => {
        const results = await testComprehensiveAccessibility(container);
        expect(results.passed).toBe(true);

        // Color contrast should pass in both themes
        const contrastResults =
          await accessibilityTests.colorContrast(container);
        expect(contrastResults.passed).toBe(true);
      });
    });

    it('provides proper screen reader announcements', async () => {
      const user = userEvent.setup();
      renderWithProviders(<ComplexForm />);

      // Fill out form correctly
      const nameInput = screen.getByLabelText('Full Name');
      const emailInput = screen.getByLabelText('Email Address');
      const submitButton = screen.getByRole('button', { name: 'Submit Form' });

      await user.type(nameInput, 'John Doe');
      await user.type(emailInput, 'john@example.com');
      await user.click(submitButton);

      // Check success message appears
      await waitFor(() => {
        const successAlert = screen.getByRole('alert');
        expect(successAlert).toBeInTheDocument();
        expect(successAlert).toHaveTextContent('Form submitted successfully!');
      });
    });

    it('handles focus management correctly', async () => {
      const user = userEvent.setup();
      renderWithProviders(<ComplexForm />);

      // Open modal
      const helpButton = screen.getByRole('button', {
        name: 'Open Help Modal',
      });
      await user.click(helpButton);

      // Focus should be in modal
      const modalButton = screen.getByRole('button', {
        name: 'Got it, thanks!',
      });
      expect(document.activeElement).toBe(modalButton);

      // Close modal
      await user.click(modalButton);

      // Focus should return to help button
      await waitFor(() => {
        expect(document.activeElement).toBe(helpButton);
      });
    });
  });

  describe('Individual Component Accessibility', () => {
    it('Button component passes all accessibility tests', async () => {
      const { container } = renderWithProviders(
        <Button onClick={() => {}}>Test Button</Button>
      );

      const results = await testComprehensiveAccessibility(container);
      expect(results.passed).toBe(true);
    });

    it('TextField component passes all accessibility tests', async () => {
      const { container } = renderWithProviders(
        <TextField
          label="Test Field"
          value=""
          onChange={() => {}}
          helperText="This is a helper text"
        />
      );

      const results = await testComprehensiveAccessibility(container);
      expect(results.passed).toBe(true);
    });

    it('Checkbox component passes all accessibility tests', async () => {
      const { container } = renderWithProviders(
        <Checkbox checked={false} onChange={() => {}} label="Test Checkbox" />
      );

      const results = await testComprehensiveAccessibility(container);
      expect(results.passed).toBe(true);
    });

    it('Toggle component passes all accessibility tests', async () => {
      const { container } = renderWithProviders(
        <Toggle checked={false} onChange={() => {}} label="Test Toggle" />
      );

      const results = await testComprehensiveAccessibility(container);
      expect(results.passed).toBe(true);
    });

    it('Alert component passes all accessibility tests', async () => {
      const { container } = renderWithProviders(
        <Alert
          variant="info"
          title="Test Alert"
          message="This is a test alert message"
        />
      );

      const results = await testComprehensiveAccessibility(container);
      expect(results.passed).toBe(true);
    });
  });

  describe('Accessibility Matchers', () => {
    it('uses custom accessibility matchers', async () => {
      const { container } = renderWithProviders(
        <Button onClick={() => {}}>Accessible Button</Button>
      );

      // Test custom matchers
      await expect(container).toBeAccessible();
      await expect(container).toHaveProperColorContrast();
      await expect(container).toBeKeyboardAccessible();
      await expect(container).toHaveProperAria();
    });

    it('detects accessibility violations with custom matchers', async () => {
      const { container } = renderWithProviders(
        <button style={{ color: 'white', backgroundColor: 'white' }}>
          Bad Contrast Button
        </button>
      );

      // This should fail due to poor color contrast
      await expect(async () => {
        await expect(container).toHaveProperColorContrast();
      }).rejects.toThrow();
    });
  });
});
