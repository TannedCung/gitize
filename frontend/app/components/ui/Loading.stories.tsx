import type { Meta, StoryObj } from '@storybook/react';
import {
  Spinner,
  Progress,
  Skeleton,
  SkeletonText,
  SkeletonAvatar,
  SkeletonButton,
  RepositoryCardSkeleton,
} from './Loading';

/**
 * Loading components provide visual feedback during async operations and content loading.
 * The collection includes spinners, progress bars, and skeleton placeholders following
 * the AppFlowy design system.
 *
 * ## Usage Guidelines
 * - Use `Spinner` for short loading operations
 * - Use `Progress` for operations with known duration
 * - Use `Skeleton` components to maintain layout during content loading
 * - Choose appropriate sizes and colors for context
 * - Provide meaningful loading text when helpful
 */
const meta: Meta = {
  title: 'UI Components/Loading',
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'Loading components for providing visual feedback during async operations.',
      },
    },
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * Basic spinner component
 */
export const BasicSpinner: Story = {
  render: () => <Spinner />,
};

/**
 * Spinner with text
 */
export const SpinnerWithText: Story = {
  render: () => <Spinner text="Loading..." />,
};

/**
 * All spinner sizes
 */
export const SpinnerSizes: Story = {
  render: () => (
    <div className="flex items-center gap-8">
      <div className="text-center">
        <Spinner size="xs" />
        <p className="text-xs mt-2 text-gray-600">Extra Small</p>
      </div>
      <div className="text-center">
        <Spinner size="sm" />
        <p className="text-xs mt-2 text-gray-600">Small</p>
      </div>
      <div className="text-center">
        <Spinner size="md" />
        <p className="text-xs mt-2 text-gray-600">Medium</p>
      </div>
      <div className="text-center">
        <Spinner size="lg" />
        <p className="text-xs mt-2 text-gray-600">Large</p>
      </div>
      <div className="text-center">
        <Spinner size="xl" />
        <p className="text-xs mt-2 text-gray-600">Extra Large</p>
      </div>
    </div>
  ),
};

/**
 * Spinner color variants
 */
export const SpinnerColors: Story = {
  render: () => (
    <div className="grid grid-cols-4 gap-6">
      <div className="text-center">
        <Spinner color="primary" />
        <p className="text-xs mt-2 text-gray-600">Primary</p>
      </div>
      <div className="text-center">
        <Spinner color="success" />
        <p className="text-xs mt-2 text-gray-600">Success</p>
      </div>
      <div className="text-center">
        <Spinner color="warning" />
        <p className="text-xs mt-2 text-gray-600">Warning</p>
      </div>
      <div className="text-center">
        <Spinner color="error" />
        <p className="text-xs mt-2 text-gray-600">Error</p>
      </div>
    </div>
  ),
};

/**
 * Spinner animation speeds
 */
export const SpinnerSpeeds: Story = {
  render: () => (
    <div className="flex items-center gap-8">
      <div className="text-center">
        <Spinner speed="slow" />
        <p className="text-xs mt-2 text-gray-600">Slow</p>
      </div>
      <div className="text-center">
        <Spinner speed="normal" />
        <p className="text-xs mt-2 text-gray-600">Normal</p>
      </div>
      <div className="text-center">
        <Spinner speed="fast" />
        <p className="text-xs mt-2 text-gray-600">Fast</p>
      </div>
    </div>
  ),
};

/**
 * Basic progress bar
 */
export const BasicProgress: Story = {
  render: () => <Progress value={65} showValue />,
};

/**
 * Progress bar with label
 */
export const ProgressWithLabel: Story = {
  render: () => <Progress value={45} label="Upload Progress" showValue />,
};

/**
 * Indeterminate progress bar
 */
export const IndeterminateProgress: Story = {
  render: () => <Progress indeterminate label="Processing..." />,
};

/**
 * Progress bar sizes
 */
export const ProgressSizes: Story = {
  render: () => (
    <div className="space-y-4 w-80">
      <div>
        <p className="text-sm text-gray-600 mb-2">Small</p>
        <Progress value={30} size="sm" />
      </div>
      <div>
        <p className="text-sm text-gray-600 mb-2">Medium</p>
        <Progress value={60} size="md" />
      </div>
      <div>
        <p className="text-sm text-gray-600 mb-2">Large</p>
        <Progress value={90} size="lg" />
      </div>
    </div>
  ),
};

/**
 * Progress bar colors
 */
export const ProgressColors: Story = {
  render: () => (
    <div className="space-y-4 w-80">
      <Progress value={25} color="primary" label="Primary" />
      <Progress value={50} color="success" label="Success" />
      <Progress value={75} color="warning" label="Warning" />
      <Progress value={90} color="error" label="Error" />
    </div>
  ),
};

/**
 * Basic skeleton
 */
export const BasicSkeleton: Story = {
  render: () => <Skeleton />,
};

/**
 * Skeleton variants
 */
export const SkeletonVariants: Story = {
  render: () => (
    <div className="space-y-4">
      <div>
        <p className="text-sm text-gray-600 mb-2">Text</p>
        <Skeleton variant="text" />
      </div>
      <div>
        <p className="text-sm text-gray-600 mb-2">Rectangular</p>
        <Skeleton variant="rectangular" width="200px" height="100px" />
      </div>
      <div>
        <p className="text-sm text-gray-600 mb-2">Circular</p>
        <Skeleton variant="circular" />
      </div>
    </div>
  ),
};

/**
 * Multi-line text skeleton
 */
export const TextSkeleton: Story = {
  render: () => (
    <div className="w-80">
      <SkeletonText lines={4} />
    </div>
  ),
};

/**
 * Skeleton components collection
 */
export const SkeletonComponents: Story = {
  render: () => (
    <div className="space-y-6">
      <div>
        <p className="text-sm text-gray-600 mb-2">Avatar Skeletons</p>
        <div className="flex items-center gap-4">
          <SkeletonAvatar size="sm" />
          <SkeletonAvatar size="md" />
          <SkeletonAvatar size="lg" />
        </div>
      </div>
      <div>
        <p className="text-sm text-gray-600 mb-2">Button Skeletons</p>
        <div className="flex items-center gap-4">
          <SkeletonButton size="sm" />
          <SkeletonButton size="md" />
          <SkeletonButton size="lg" />
        </div>
      </div>
    </div>
  ),
};

/**
 * Repository card skeleton
 */
export const RepositoryCardSkeletonExample: Story = {
  render: () => (
    <div className="w-96">
      <RepositoryCardSkeleton />
    </div>
  ),
};

/**
 * Loading states in context
 */
export const LoadingStatesInContext: Story = {
  render: () => (
    <div className="space-y-8 w-96">
      {/* Loading form */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border">
        <h3 className="text-lg font-semibold mb-4">Loading Form</h3>
        <div className="space-y-4">
          <div>
            <Skeleton width="25%" height="1rem" className="mb-2" />
            <Skeleton height="2.5rem" />
          </div>
          <div>
            <Skeleton width="30%" height="1rem" className="mb-2" />
            <Skeleton height="2.5rem" />
          </div>
          <div className="flex gap-2 justify-end">
            <SkeletonButton size="md" />
            <SkeletonButton size="md" />
          </div>
        </div>
      </div>

      {/* Loading list */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border">
        <h3 className="text-lg font-semibold mb-4">Loading List</h3>
        <div className="space-y-4">
          {[1, 2, 3].map(item => (
            <div key={item} className="flex items-center gap-3">
              <SkeletonAvatar size="md" />
              <div className="flex-1">
                <Skeleton width="60%" height="1rem" className="mb-1" />
                <Skeleton width="40%" height="0.75rem" />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Loading with progress */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border">
        <h3 className="text-lg font-semibold mb-4">File Upload</h3>
        <div className="text-center">
          <Spinner size="lg" text="Uploading files..." className="mb-4" />
          <Progress value={73} label="Progress" showValue />
        </div>
      </div>
    </div>
  ),
};
