import type { Meta, StoryObj } from '@storybook/react';
import { Button } from './Button';
import { TextField } from './TextField';
import { Avatar } from './Avatar';
import { Alert } from './Alert';

/**
 * AppFlowy Design System Overview
 *
 * This story showcases the complete AppFlowy UI design system, demonstrating
 * how components work together to create cohesive user interfaces. The design
 * system emphasizes accessibility, consistency, and modern aesthetics.
 *
 * ## Design Principles
 * - **Accessibility First**: All components meet WCAG 2.1 AA standards
 * - **Theme Aware**: Seamless light and dark mode support
 * - **Consistent**: Unified design tokens across all components
 * - **Flexible**: Composable components for various use cases
 * - **Performance**: Optimized for fast loading and smooth interactions
 */
const meta: Meta = {
  title: 'Design System/Overview',
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'Complete overview of the AppFlowy design system components and patterns.',
      },
    },
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * Complete design system showcase
 */
export const DesignSystemShowcase: Story = {
  render: () => (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-8">
      <div className="max-w-6xl mx-auto space-y-12">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-gray-100 mb-4">
            AppFlowy Design System
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            A comprehensive, accessible, and theme-aware component library built
            with Tailwind CSS
          </p>
        </div>

        {/* Color Palette */}
        <section>
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-6">
            Brand Colors
          </h2>
          <div className="grid grid-cols-3 md:grid-cols-5 gap-4">
            {[
              { name: 'Skyline', color: 'bg-[#00B5FF]', text: '#00B5FF' },
              { name: 'Aqua', color: 'bg-[#00C8FF]', text: '#00C8FF' },
              { name: 'Violet', color: 'bg-[#9327FF]', text: '#9327FF' },
              { name: 'Amethyst', color: 'bg-[#8427E0]', text: '#8427E0' },
              { name: 'Berry', color: 'bg-[#E3006D]', text: '#E3006D' },
              { name: 'Coral', color: 'bg-[#FB006D]', text: '#FB006D' },
              { name: 'Golden', color: 'bg-[#F7931E]', text: '#F7931E' },
              { name: 'Amber', color: 'bg-[#FFBD00]', text: '#FFBD00' },
              { name: 'Lemon', color: 'bg-[#FFCE00]', text: '#FFCE00' },
            ].map(color => (
              <div key={color.name} className="text-center">
                <div
                  className={`w-16 h-16 rounded-lg ${color.color} mx-auto mb-2`}
                />
                <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                  {color.name}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {color.text}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* Buttons */}
        <section>
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-6">
            Buttons
          </h2>
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">
                Variants
              </h3>
              <div className="flex flex-wrap gap-4">
                <Button variant="primary">Primary</Button>
                <Button variant="secondary">Secondary</Button>
                <Button variant="outline">Outline</Button>
                <Button variant="ghost">Ghost</Button>
                <Button variant="danger">Danger</Button>
              </div>
            </div>
            <div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">
                Sizes
              </h3>
              <div className="flex items-center gap-4">
                <Button size="sm">Small</Button>
                <Button size="md">Medium</Button>
                <Button size="lg">Large</Button>
              </div>
            </div>
            <div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">
                States
              </h3>
              <div className="flex flex-wrap gap-4">
                <Button>Normal</Button>
                <Button disabled>Disabled</Button>
                <Button loading>Loading</Button>
              </div>
            </div>
          </div>
        </section>

        {/* Form Elements */}
        <section>
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-6">
            Form Elements
          </h2>
          <div className="grid md:grid-cols-2 gap-8">
            <div className="space-y-4">
              <TextField
                label="Full Name"
                placeholder="Enter your full name"
                required
              />
              <TextField
                label="Email"
                type="email"
                placeholder="you@example.com"
                helperText="We'll never share your email"
              />
              <TextField
                label="Password"
                type="password"
                placeholder="Enter password"
                error="Password must be at least 8 characters"
                value="123"
              />
            </div>
            <div className="space-y-4">
              <TextField
                label="Success State"
                state="success"
                value="Valid input"
                helperText="This field is valid"
              />
              <TextField
                label="Disabled Field"
                disabled
                value="Cannot edit this"
              />
              <TextField
                label="With Character Count"
                maxLength={50}
                showCharCount
                value="Sample text with counter"
                helperText="Keep it concise"
              />
            </div>
          </div>
        </section>

        {/* Avatars */}
        <section>
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-6">
            Avatars
          </h2>
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">
                Sizes
              </h3>
              <div className="flex items-center gap-4">
                <Avatar
                  src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"
                  alt="User"
                  size="xs"
                />
                <Avatar
                  src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"
                  alt="User"
                  size="sm"
                />
                <Avatar
                  src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"
                  alt="User"
                  size="md"
                />
                <Avatar
                  src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"
                  alt="User"
                  size="lg"
                />
                <Avatar
                  src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"
                  alt="User"
                  size="xl"
                />
              </div>
            </div>
            <div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">
                Status Indicators
              </h3>
              <div className="flex items-center gap-4">
                <Avatar alt="Online" fallback="ON" status="online" showStatus />
                <Avatar alt="Away" fallback="AW" status="away" showStatus />
                <Avatar alt="Busy" fallback="BS" status="busy" showStatus />
                <Avatar
                  alt="Offline"
                  fallback="OF"
                  status="offline"
                  showStatus
                />
              </div>
            </div>
          </div>
        </section>

        {/* Alerts */}
        <section>
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-6">
            Alerts
          </h2>
          <div className="space-y-4">
            <Alert variant="success" title="Success">
              Your changes have been saved successfully!
            </Alert>
            <Alert variant="warning" title="Warning" dismissible>
              Your session will expire in 5 minutes.
            </Alert>
            <Alert variant="error" title="Error" dismissible>
              Unable to save changes. Please try again.
            </Alert>
            <Alert variant="info" title="Information" dismissible>
              New features are available in your dashboard.
            </Alert>
          </div>
        </section>

        {/* Example Application Layout */}
        <section>
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-6">
            Example Application Layout
          </h2>
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden">
            {/* Header */}
            <div className="bg-gray-50 dark:bg-gray-700 px-6 py-4 border-b border-gray-200 dark:border-gray-600">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                  User Profile
                </h3>
                <div className="flex items-center gap-3">
                  <Avatar
                    src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"
                    alt="John Doe"
                    size="sm"
                    status="online"
                    showStatus
                  />
                  <span className="text-sm text-gray-700 dark:text-gray-300">
                    John Doe
                  </span>
                </div>
              </div>
            </div>

            {/* Content */}
            <div className="p-6">
              <Alert variant="info" className="mb-6" dismissible>
                Complete your profile to get the most out of your experience.
              </Alert>

              <form className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <TextField label="First Name" value="John" required />
                  <TextField label="Last Name" value="Doe" required />
                </div>

                <TextField
                  label="Email Address"
                  type="email"
                  value="john.doe@example.com"
                  state="success"
                  helperText="Email verified"
                />

                <TextField
                  label="Bio"
                  placeholder="Tell us about yourself"
                  maxLength={160}
                  showCharCount
                  value="Software engineer passionate about creating great user experiences."
                />

                <div className="flex justify-end gap-3">
                  <Button variant="outline">Cancel</Button>
                  <Button variant="primary">Save Changes</Button>
                </div>
              </form>
            </div>
          </div>
        </section>

        {/* Footer */}
        <div className="text-center py-8">
          <p className="text-gray-600 dark:text-gray-400">
            AppFlowy Design System - Built with accessibility and performance in
            mind
          </p>
        </div>
      </div>
    </div>
  ),
  parameters: {
    layout: 'fullscreen',
  },
};
