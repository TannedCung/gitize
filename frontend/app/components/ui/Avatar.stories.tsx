import type { Meta, StoryObj } from '@storybook/react';
import { fn } from '@storybook/test';
import { Avatar } from './Avatar';

/**
 * The Avatar component displays user profile images with fallback handling and status indicators.
 * It supports multiple sizes, loading states, and accessibility features following the AppFlowy design system.
 *
 * ## Usage Guidelines
 * - Always provide meaningful alt text for accessibility
 * - Use initials as fallback when images fail to load
 * - Status indicators help show user availability
 * - Consider using appropriate sizes for different contexts
 * - Make avatars clickable when they lead to user profiles
 */
const meta: Meta<typeof Avatar> = {
  title: 'UI Components/Avatar',
  component: Avatar,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'A user avatar component with image loading, fallback handling, and status indicators.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    size: {
      control: 'select',
      options: ['xs', 'sm', 'md', 'lg', 'xl'],
      description: 'Size of the avatar',
    },
    status: {
      control: 'select',
      options: ['online', 'offline', 'away', 'busy'],
      description: 'Status indicator to display',
    },
    showStatus: {
      control: 'boolean',
      description: 'Whether to show the status indicator',
    },
    src: {
      control: 'text',
      description: 'Image source URL',
    },
    alt: {
      control: 'text',
      description: 'Alt text for accessibility (required)',
    },
    fallback: {
      control: 'text',
      description: 'Fallback text (usually initials)',
    },
  },
  args: {
    onClick: fn(),
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * Default avatar with image
 */
export const Default: Story = {
  args: {
    src: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
    alt: 'John Doe',
  },
};

/**
 * Avatar with fallback initials (no image)
 */
export const WithFallback: Story = {
  args: {
    alt: 'Jane Smith',
    fallback: 'Jane Smith',
  },
};

/**
 * Avatar with online status
 */
export const WithOnlineStatus: Story = {
  args: {
    src: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
    alt: 'Sarah Wilson',
    status: 'online',
    showStatus: true,
  },
};

/**
 * Avatar with away status
 */
export const WithAwayStatus: Story = {
  args: {
    src: 'https://images.unsplash.com/photo-1519244703995-f4e0f30006d5?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
    alt: 'Mike Johnson',
    status: 'away',
    showStatus: true,
  },
};

/**
 * Avatar with busy status
 */
export const WithBusyStatus: Story = {
  args: {
    alt: 'Alex Chen',
    fallback: 'Alex Chen',
    status: 'busy',
    showStatus: true,
  },
};

/**
 * Avatar with offline status
 */
export const WithOfflineStatus: Story = {
  args: {
    alt: 'Emma Davis',
    fallback: 'Emma Davis',
    status: 'offline',
    showStatus: true,
  },
};

/**
 * Extra small avatar
 */
export const ExtraSmall: Story = {
  args: {
    src: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
    alt: 'John Doe',
    size: 'xs',
  },
};

/**
 * Small avatar
 */
export const Small: Story = {
  args: {
    src: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
    alt: 'John Doe',
    size: 'sm',
  },
};

/**
 * Large avatar
 */
export const Large: Story = {
  args: {
    src: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
    alt: 'John Doe',
    size: 'lg',
  },
};

/**
 * Extra large avatar
 */
export const ExtraLarge: Story = {
  args: {
    src: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
    alt: 'John Doe',
    size: 'xl',
  },
};

/**
 * Clickable avatar
 */
export const Clickable: Story = {
  args: {
    src: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
    alt: 'John Doe',
    onClick: fn(),
  },
};

/**
 * Avatar with broken image (shows fallback)
 */
export const BrokenImage: Story = {
  args: {
    src: 'https://broken-image-url.jpg',
    alt: 'Broken Image User',
    fallback: 'BI',
  },
};

/**
 * All avatar sizes comparison
 */
export const AllSizes: Story = {
  render: () => (
    <div className="flex items-center gap-4">
      <Avatar
        src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"
        alt="Extra Small"
        size="xs"
      />
      <Avatar
        src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"
        alt="Small"
        size="sm"
      />
      <Avatar
        src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"
        alt="Medium"
        size="md"
      />
      <Avatar
        src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"
        alt="Large"
        size="lg"
      />
      <Avatar
        src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"
        alt="Extra Large"
        size="xl"
      />
    </div>
  ),
  parameters: {
    layout: 'centered',
  },
};

/**
 * All status indicators comparison
 */
export const AllStatuses: Story = {
  render: () => (
    <div className="flex items-center gap-4">
      <Avatar
        alt="Online User"
        fallback="ON"
        status="online"
        showStatus={true}
      />
      <Avatar alt="Away User" fallback="AW" status="away" showStatus={true} />
      <Avatar alt="Busy User" fallback="BS" status="busy" showStatus={true} />
      <Avatar
        alt="Offline User"
        fallback="OF"
        status="offline"
        showStatus={true}
      />
    </div>
  ),
  parameters: {
    layout: 'centered',
  },
};

/**
 * Avatar group example
 */
export const AvatarGroup: Story = {
  render: () => (
    <div className="flex -space-x-2">
      <Avatar
        src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"
        alt="User 1"
        className="ring-2 ring-white dark:ring-gray-900"
      />
      <Avatar
        src="https://images.unsplash.com/photo-1494790108755-2616b612b786?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"
        alt="User 2"
        className="ring-2 ring-white dark:ring-gray-900"
      />
      <Avatar
        src="https://images.unsplash.com/photo-1519244703995-f4e0f30006d5?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"
        alt="User 3"
        className="ring-2 ring-white dark:ring-gray-900"
      />
      <Avatar
        alt="+2 more"
        fallback="+2"
        className="ring-2 ring-white dark:ring-gray-900 bg-gray-100 dark:bg-gray-800"
      />
    </div>
  ),
  parameters: {
    layout: 'centered',
  },
};

/**
 * User profile card example
 */
export const UserProfileCard: Story = {
  render: () => (
    <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-lg max-w-sm">
      <div className="flex items-center space-x-4">
        <Avatar
          src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"
          alt="John Doe"
          size="lg"
          status="online"
          showStatus={true}
        />
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            John Doe
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Software Engineer
          </p>
          <p className="text-xs text-green-600 dark:text-green-400">Online</p>
        </div>
      </div>
    </div>
  ),
  parameters: {
    layout: 'centered',
  },
};
