import type { Meta, StoryObj } from '@storybook/react';
import { fn } from '@storybook/test';
import { Alert } from './Alert';

/**
 * The Alert component displays important messages to users with different severity levels.
 * It supports multiple variants, optional titles, custom icons, and dismissible functionality
 * following the AppFlowy design system.
 *
 * ## Usage Guidelines
 * - Use `success` for positive confirmations and completed actions
 * - Use `warning` for important information that needs attention
 * - Use `error` for critical issues and validation errors
 * - Use `info` for general information and tips
 * - Make alerts dismissible when appropriate
 * - Keep messages concise and actionable
 */
const meta: Meta<typeof Alert> = {
  title: 'UI Components/Alert',
  component: Alert,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'A versatile alert component for displaying important messages with proper accessibility features.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      options: ['success', 'warning', 'error', 'info'],
      description: 'Visual style and semantic meaning of the alert',
    },
    dismissible: {
      control: 'boolean',
      description: 'Whether the alert can be dismissed by the user',
    },
    showIcon: {
      control: 'boolean',
      description: 'Whether to show the default variant icon',
    },
    title: {
      control: 'text',
      description: 'Optional title/heading for the alert',
    },
    children: {
      control: 'text',
      description: 'Alert message content',
    },
  },
  args: {
    onDismiss: fn(),
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * Success alert for positive confirmations
 */
export const Success: Story = {
  args: {
    variant: 'success',
    children: 'Your changes have been saved successfully!',
  },
};

/**
 * Warning alert for important information
 */
export const Warning: Story = {
  args: {
    variant: 'warning',
    children: 'Your session will expire in 5 minutes. Please save your work.',
  },
};

/**
 * Error alert for critical issues
 */
export const Error: Story = {
  args: {
    variant: 'error',
    children:
      'Unable to save changes. Please check your connection and try again.',
  },
};

/**
 * Info alert for general information
 */
export const Info: Story = {
  args: {
    variant: 'info',
    children:
      'New features are available! Check out the latest updates in your dashboard.',
  },
};

/**
 * Alert with title
 */
export const WithTitle: Story = {
  args: {
    variant: 'success',
    title: 'Success!',
    children: 'Your profile has been updated successfully.',
  },
};

/**
 * Dismissible alert
 */
export const Dismissible: Story = {
  args: {
    variant: 'info',
    title: 'New Feature Available',
    children: 'Try out our new collaboration tools in the sidebar.',
    dismissible: true,
  },
};

/**
 * Alert without icon
 */
export const WithoutIcon: Story = {
  args: {
    variant: 'warning',
    title: 'Maintenance Notice',
    children: 'Scheduled maintenance will occur tonight from 2-4 AM EST.',
    showIcon: false,
  },
};

/**
 * Alert with custom icon
 */
export const WithCustomIcon: Story = {
  args: {
    variant: 'info',
    title: 'Update Available',
    children: 'A new version of the app is available for download.',
    icon: (
      <svg
        className="w-5 h-5"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
        />
      </svg>
    ),
  },
};

/**
 * Long content alert
 */
export const LongContent: Story = {
  args: {
    variant: 'error',
    title: 'Validation Error',
    children:
      'There are several issues with your form submission: Email address is invalid, password must be at least 8 characters long, and the confirmation password does not match. Please correct these errors and try again.',
    dismissible: true,
  },
};

/**
 * Alert with action buttons
 */
export const WithActions: Story = {
  args: {
    variant: 'warning',
    title: 'Unsaved Changes',
    children: (
      <div>
        <p className="mb-3">
          You have unsaved changes that will be lost if you leave this page.
        </p>
        <div className="flex gap-2">
          <button className="px-3 py-1 text-sm bg-warning-600 text-white rounded hover:bg-warning-700">
            Save Changes
          </button>
          <button className="px-3 py-1 text-sm border border-warning-600 text-warning-600 rounded hover:bg-warning-50">
            Discard
          </button>
        </div>
      </div>
    ),
    dismissible: true,
  },
};

/**
 * All alert variants comparison
 */
export const AllVariants: Story = {
  render: () => (
    <div className="space-y-4 w-96">
      <Alert variant="success" title="Success">
        Operation completed successfully!
      </Alert>
      <Alert variant="warning" title="Warning">
        Please review your settings before proceeding.
      </Alert>
      <Alert variant="error" title="Error">
        Something went wrong. Please try again.
      </Alert>
      <Alert variant="info" title="Information">
        Here&apos;s some helpful information for you.
      </Alert>
    </div>
  ),
  parameters: {
    layout: 'centered',
  },
};

/**
 * Dismissible alerts example
 */
export const DismissibleAlerts: Story = {
  render: () => (
    <div className="space-y-4 w-96">
      <Alert variant="success" dismissible>
        File uploaded successfully!
      </Alert>
      <Alert variant="info" title="Tip" dismissible>
        You can use keyboard shortcuts to work faster.
      </Alert>
      <Alert variant="warning" title="Storage Almost Full" dismissible>
        You&apos;re using 90% of your storage space.
      </Alert>
    </div>
  ),
  parameters: {
    layout: 'centered',
  },
};

/**
 * Form validation alerts
 */
export const FormValidation: Story = {
  render: () => (
    <div className="space-y-4 w-96">
      <div>
        <label className="block text-sm font-medium mb-1">Email</label>
        <input
          type="email"
          className="w-full px-3 py-2 border border-red-300 rounded-md"
          value="invalid-email"
        />
        <Alert variant="error" className="mt-2">
          Please enter a valid email address.
        </Alert>
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Password</label>
        <input
          type="password"
          className="w-full px-3 py-2 border border-green-300 rounded-md"
          value="strongpassword123"
        />
        <Alert variant="success" className="mt-2">
          Password strength: Strong
        </Alert>
      </div>
    </div>
  ),
  parameters: {
    layout: 'centered',
  },
};

/**
 * System status alerts
 */
export const SystemStatus: Story = {
  render: () => (
    <div className="space-y-4 w-96">
      <Alert variant="success" title="All Systems Operational">
        All services are running normally.
      </Alert>
      <Alert variant="warning" title="Partial Outage" dismissible>
        Some users may experience slow loading times.
      </Alert>
      <Alert variant="error" title="Service Unavailable" dismissible>
        Authentication service is currently down. We&apos;re working on a fix.
      </Alert>
    </div>
  ),
  parameters: {
    layout: 'centered',
  },
};
