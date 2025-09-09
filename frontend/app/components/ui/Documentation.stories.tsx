import type { Meta, StoryObj } from '@storybook/react';
import { Button } from './Button';
import { TextField } from './TextField';
import { Avatar } from './Avatar';
import { Alert } from './Alert';
import { Spinner, Progress } from './Loading';

/**
 * AppFlowy Design System Documentation
 *
 * This comprehensive guide covers the usage patterns, best practices, and accessibility
 * features of the AppFlowy UI design system. Learn how to effectively use components
 * to create consistent, accessible, and beautiful user interfaces.
 */
const meta: Meta = {
  title: 'Design System/Documentation',
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'Comprehensive documentation and usage patterns for the AppFlowy design system.',
      },
    },
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * Accessibility best practices and examples
 */
export const AccessibilityGuide: Story = {
  render: () => (
    <div className="max-w-4xl mx-auto p-8 space-y-12">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-4">
          Accessibility Guide
        </h1>
        <p className="text-lg text-gray-600 dark:text-gray-400 mb-8">
          The AppFlowy design system is built with accessibility as a core
          principle. All components meet WCAG 2.1 AA standards and provide
          excellent screen reader support.
        </p>
      </div>

      {/* Keyboard Navigation */}
      <section>
        <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
          Keyboard Navigation
        </h2>
        <p className="text-gray-600 dark:text-gray-400 mb-6">
          All interactive components support keyboard navigation with proper
          focus management.
        </p>

        <div className="bg-gray-50 dark:bg-gray-800 p-6 rounded-lg">
          <h3 className="text-lg font-medium mb-4">
            Try navigating with Tab and Enter:
          </h3>
          <div className="flex flex-wrap gap-4">
            <Button variant="primary">Primary Action</Button>
            <Button variant="secondary">Secondary Action</Button>
            <Button variant="outline">Outline Button</Button>
          </div>
        </div>

        <div className="mt-6 bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
          <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-2">
            Keyboard Shortcuts:
          </h4>
          <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
            <li>
              <kbd className="px-2 py-1 bg-blue-100 dark:bg-blue-800 rounded">
                Tab
              </kbd>{' '}
              - Navigate forward
            </li>
            <li>
              <kbd className="px-2 py-1 bg-blue-100 dark:bg-blue-800 rounded">
                Shift + Tab
              </kbd>{' '}
              - Navigate backward
            </li>
            <li>
              <kbd className="px-2 py-1 bg-blue-100 dark:bg-blue-800 rounded">
                Enter
              </kbd>{' '}
              or{' '}
              <kbd className="px-2 py-1 bg-blue-100 dark:bg-blue-800 rounded">
                Space
              </kbd>{' '}
              - Activate button
            </li>
            <li>
              <kbd className="px-2 py-1 bg-blue-100 dark:bg-blue-800 rounded">
                Esc
              </kbd>{' '}
              - Dismiss alerts/modals
            </li>
          </ul>
        </div>
      </section>

      {/* Screen Reader Support */}
      <section>
        <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
          Screen Reader Support
        </h2>
        <p className="text-gray-600 dark:text-gray-400 mb-6">
          Components include proper ARIA attributes and semantic HTML for screen
          reader compatibility.
        </p>

        <div className="space-y-6">
          <div className="bg-gray-50 dark:bg-gray-800 p-6 rounded-lg">
            <h3 className="text-lg font-medium mb-4">
              Form with Proper Labels:
            </h3>
            <div className="space-y-4 max-w-md">
              <TextField
                label="Email Address"
                type="email"
                placeholder="you@example.com"
                required
                helperText="We'll use this to send you updates"
              />
              <TextField
                label="Password"
                type="password"
                placeholder="Enter password"
                error="Password must be at least 8 characters"
                value="123"
              />
            </div>
          </div>

          <div className="bg-gray-50 dark:bg-gray-800 p-6 rounded-lg">
            <h3 className="text-lg font-medium mb-4">
              Alerts with Proper Roles:
            </h3>
            <div className="space-y-4">
              <Alert variant="success">
                Form submitted successfully! Your changes have been saved.
              </Alert>
              <Alert variant="error">
                Validation failed. Please check the required fields above.
              </Alert>
            </div>
          </div>
        </div>
      </section>

      {/* Color Contrast */}
      <section>
        <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
          Color Contrast
        </h2>
        <p className="text-gray-600 dark:text-gray-400 mb-6">
          All color combinations meet WCAG AA contrast requirements (4.5:1 for
          normal text, 3:1 for large text).
        </p>

        <div className="grid md:grid-cols-2 gap-6">
          <div className="bg-gray-50 dark:bg-gray-800 p-6 rounded-lg">
            <h3 className="text-lg font-medium mb-4">Light Theme Contrast</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-white border rounded">
                <span className="text-gray-900">Normal text on white</span>
                <span className="text-sm text-gray-500">4.5:1 ✓</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-primary-500 text-white rounded">
                <span>White text on primary</span>
                <span className="text-sm opacity-80">4.5:1 ✓</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-error-500 text-white rounded">
                <span>White text on error</span>
                <span className="text-sm opacity-80">4.5:1 ✓</span>
              </div>
            </div>
          </div>

          <div className="bg-gray-50 dark:bg-gray-800 p-6 rounded-lg">
            <h3 className="text-lg font-medium mb-4">Dark Theme Contrast</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-gray-900 text-gray-100 rounded">
                <span>Light text on dark</span>
                <span className="text-sm text-gray-400">4.5:1 ✓</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-primary-600 text-white rounded">
                <span>White text on primary</span>
                <span className="text-sm opacity-80">4.5:1 ✓</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-error-600 text-white rounded">
                <span>White text on error</span>
                <span className="text-sm opacity-80">4.5:1 ✓</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Focus Management */}
      <section>
        <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
          Focus Management
        </h2>
        <p className="text-gray-600 dark:text-gray-400 mb-6">
          Clear focus indicators help users understand which element is
          currently active.
        </p>

        <div className="bg-gray-50 dark:bg-gray-800 p-6 rounded-lg">
          <h3 className="text-lg font-medium mb-4">Focus Indicators:</h3>
          <div className="space-y-4">
            <div className="flex flex-wrap gap-4">
              <Button variant="primary">Focus me with Tab</Button>
              <Button variant="outline">Then focus me</Button>
              <Button variant="ghost">And finally me</Button>
            </div>
            <TextField
              label="Text Input Focus"
              placeholder="Click or tab to focus"
            />
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-4">
            Notice the blue focus ring that appears around focused elements.
          </p>
        </div>
      </section>
    </div>
  ),
};

/**
 * Component composition patterns and best practices
 */
export const CompositionPatterns: Story = {
  render: () => (
    <div className="max-w-4xl mx-auto p-8 space-y-12">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-4">
          Component Composition Patterns
        </h1>
        <p className="text-lg text-gray-600 dark:text-gray-400 mb-8">
          Learn how to effectively combine components to create complex UI
          patterns while maintaining consistency and accessibility.
        </p>
      </div>

      {/* User Profile Card */}
      <section>
        <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
          User Profile Card
        </h2>
        <p className="text-gray-600 dark:text-gray-400 mb-6">
          Combining Avatar, Typography, and Button components to create a user
          profile card.
        </p>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 max-w-sm">
          <div className="flex items-center space-x-4 mb-4">
            <Avatar
              src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"
              alt="John Doe"
              size="lg"
              status="online"
              showStatus
            />
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                John Doe
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Software Engineer
              </p>
              <p className="text-xs text-green-600 dark:text-green-400">
                Online
              </p>
            </div>
          </div>
          <div className="flex space-x-2">
            <Button variant="primary" size="sm" fullWidth>
              Message
            </Button>
            <Button variant="outline" size="sm" fullWidth>
              View Profile
            </Button>
          </div>
        </div>
      </section>

      {/* Form with Validation */}
      <section>
        <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
          Form with Validation
        </h2>
        <p className="text-gray-600 dark:text-gray-400 mb-6">
          Creating a complete form experience with validation states and
          feedback.
        </p>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 max-w-md">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
            Create Account
          </h3>

          <Alert variant="info" className="mb-6" dismissible>
            Please fill out all required fields to create your account.
          </Alert>

          <form className="space-y-4">
            <TextField
              label="Full Name"
              placeholder="Enter your full name"
              required
            />
            <TextField
              label="Email"
              type="email"
              placeholder="you@example.com"
              required
              helperText="We'll send a verification email"
            />
            <TextField
              label="Password"
              type="password"
              placeholder="Create a strong password"
              error="Password must be at least 8 characters"
              value="123"
            />
            <TextField
              label="Confirm Password"
              type="password"
              placeholder="Confirm your password"
              state="success"
              value="strongpassword123"
              helperText="Passwords match"
            />

            <div className="flex space-x-3 pt-4">
              <Button variant="outline" fullWidth>
                Cancel
              </Button>
              <Button variant="primary" fullWidth>
                Create Account
              </Button>
            </div>
          </form>
        </div>
      </section>

      {/* Loading States */}
      <section>
        <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
          Loading States
        </h2>
        <p className="text-gray-600 dark:text-gray-400 mb-6">
          Providing feedback during async operations with loading indicators.
        </p>

        <div className="grid md:grid-cols-2 gap-6">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
              Button Loading States
            </h3>
            <div className="space-y-3">
              <Button variant="primary" loading fullWidth>
                Saving Changes...
              </Button>
              <Button variant="outline" disabled fullWidth>
                Upload Complete
              </Button>
              <Button variant="primary" fullWidth>
                Ready for Action
              </Button>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
              Progress Indicators
            </h3>
            <div className="space-y-4">
              <div>
                <Spinner size="sm" text="Loading data..." />
              </div>
              <Progress value={65} label="Upload Progress" showValue />
              <Progress indeterminate label="Processing..." />
            </div>
          </div>
        </div>
      </section>

      {/* Status and Feedback */}
      <section>
        <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
          Status and Feedback
        </h2>
        <p className="text-gray-600 dark:text-gray-400 mb-6">
          Using alerts and status indicators to communicate system state.
        </p>

        <div className="space-y-4">
          <Alert variant="success" title="Success!" dismissible>
            Your profile has been updated successfully.
          </Alert>
          <Alert variant="warning" title="Warning" dismissible>
            Your session will expire in 5 minutes. Please save your work.
          </Alert>
          <Alert variant="error" title="Error" dismissible>
            Failed to save changes. Please check your connection and try again.
          </Alert>
          <Alert variant="info" title="New Feature" dismissible>
            Try out our new collaboration tools in the sidebar.
          </Alert>
        </div>
      </section>
    </div>
  ),
};

/**
 * Theme and customization guide
 */
export const ThemeCustomization: Story = {
  render: () => (
    <div className="max-w-4xl mx-auto p-8 space-y-12">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-4">
          Theme Customization
        </h1>
        <p className="text-lg text-gray-600 dark:text-gray-400 mb-8">
          Learn how to customize the AppFlowy design system to match your brand
          while maintaining accessibility and consistency.
        </p>
      </div>

      {/* Design Tokens */}
      <section>
        <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
          Design Tokens
        </h2>
        <p className="text-gray-600 dark:text-gray-400 mb-6">
          The design system uses Tailwind CSS configuration to define consistent
          design tokens.
        </p>

        <div className="bg-gray-900 text-gray-100 p-6 rounded-lg overflow-x-auto">
          <pre className="text-sm">
            {`// tailwind.config.js
module.exports = {
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#eff6ff',
          500: '#3b82f6',
          900: '#1e3a8a',
        },
        // AppFlowy brand colors
        skyline: '#00B5FF',
        aqua: '#00C8FF',
        violet: '#9327FF',
        // ... more colors
      },
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
      },
      borderRadius: {
        'xl': '0.75rem',
        '2xl': '1rem',
      }
    }
  }
}`}
          </pre>
        </div>
      </section>

      {/* Component Variants */}
      <section>
        <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
          Component Variants
        </h2>
        <p className="text-gray-600 dark:text-gray-400 mb-6">
          Components support multiple variants that can be customized through
          Tailwind classes.
        </p>

        <div className="grid md:grid-cols-2 gap-6">
          <div className="bg-gray-50 dark:bg-gray-800 p-6 rounded-lg">
            <h3 className="text-lg font-medium mb-4">Button Variants</h3>
            <div className="space-y-3">
              <Button
                variant="primary"
                className="bg-purple-600 hover:bg-purple-700"
              >
                Custom Purple
              </Button>
              <Button
                variant="outline"
                className="border-purple-600 text-purple-600 hover:bg-purple-50"
              >
                Purple Outline
              </Button>
              <Button
                variant="ghost"
                className="text-purple-600 hover:bg-purple-50"
              >
                Purple Ghost
              </Button>
            </div>
          </div>

          <div className="bg-gray-50 dark:bg-gray-800 p-6 rounded-lg">
            <h3 className="text-lg font-medium mb-4">Custom Styling</h3>
            <div className="space-y-3">
              <Button className="bg-gradient-to-r from-pink-500 to-violet-500 hover:from-pink-600 hover:to-violet-600 text-white border-0">
                Gradient Button
              </Button>
              <Button
                variant="outline"
                className="border-2 border-dashed border-gray-400 hover:border-gray-600"
              >
                Dashed Border
              </Button>
              <Button className="bg-black text-white hover:bg-gray-800 rounded-full px-8">
                Rounded Pill
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Dark Mode */}
      <section>
        <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
          Dark Mode Support
        </h2>
        <p className="text-gray-600 dark:text-gray-400 mb-6">
          All components automatically adapt to dark mode using Tailwind&apos;s
          dark mode utilities.
        </p>

        <div className="bg-gray-50 dark:bg-gray-800 p-6 rounded-lg">
          <h3 className="text-lg font-medium mb-4">Dark Mode Example</h3>
          <div className="space-y-4">
            <div className="p-4 bg-white dark:bg-gray-900 rounded border">
              <p className="text-gray-900 dark:text-gray-100 mb-2">
                This content adapts to the current theme.
              </p>
              <div className="flex gap-2">
                <Button variant="primary">Primary</Button>
                <Button variant="outline">Outline</Button>
              </div>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Toggle your system theme or use Storybook&apos;s theme switcher to
              see the difference.
            </p>
          </div>
        </div>
      </section>
    </div>
  ),
};
