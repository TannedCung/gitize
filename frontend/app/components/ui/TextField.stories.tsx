import type { Meta, StoryObj } from '@storybook/react';
import { fn } from '@storybook/test';
import { TextField } from './TextField';

/**
 * The TextField component embraces flat, borderless minimalism inspired by Notion and AppFlowy.
 * It prioritizes content over chrome using typography, whitespace, and subtle visual cues.
 * Features three variants: borderless (pure flat), bottom-line (focus indicator), and subtle-outline (minimal border).
 *
 * ## Flat Design Principles
 * - Borderless by default for clean, minimal appearance
 * - Typography-first hierarchy with generous spacing
 * - Subtle interaction feedback without visual overwhelm
 * - Neutral color palette with soft accent colors
 * - Accessibility compliance within flat design constraints
 *
 * ## Usage Guidelines
 * - Use borderless variant for pure flat design
 * - Use bottom-line variant when focus indication is needed
 * - Use subtle-outline variant for alternative minimal styling
 * - Always provide meaningful labels for accessibility
 * - Show error messages with minimal red accents
 */
const meta: Meta<typeof TextField> = {
  title: 'UI Components/TextField',
  component: TextField,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'A comprehensive text input component with validation states, icons, and accessibility features.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    type: {
      control: 'select',
      options: ['text', 'email', 'password', 'search', 'tel', 'url', 'number'],
      description: 'Input type for better UX and validation',
    },
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg'],
      description: 'Size of the input field',
    },
    variant: {
      control: 'select',
      options: ['borderless', 'bottom-line', 'subtle-outline'],
      description: 'Design variant for flat minimalist styling',
    },
    state: {
      control: 'select',
      options: ['default', 'error', 'success', 'disabled'],
      description: 'Validation state of the input',
    },
    disabled: {
      control: 'boolean',
      description: 'Whether the input is disabled',
    },
    required: {
      control: 'boolean',
      description: 'Whether the input is required',
    },
    readOnly: {
      control: 'boolean',
      description: 'Whether the input is read-only',
    },
    showCharCount: {
      control: 'boolean',
      description: 'Whether to show character count',
    },
  },
  args: {
    onChange: fn(),
    onFocus: fn(),
    onBlur: fn(),
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * Default text field with label
 */
export const Default: Story = {
  args: {
    label: 'Full Name',
    placeholder: 'Enter your full name',
  },
};

/**
 * Text field with helper text
 */
export const WithHelperText: Story = {
  args: {
    label: 'Email Address',
    type: 'email',
    placeholder: 'you@example.com',
    helperText: "We'll never share your email with anyone else.",
  },
};

/**
 * Required text field
 */
export const Required: Story = {
  args: {
    label: 'Username',
    placeholder: 'Enter username',
    required: true,
    helperText: 'Username must be unique',
  },
};

/**
 * Text field with error state
 */
export const WithError: Story = {
  args: {
    label: 'Password',
    type: 'password',
    placeholder: 'Enter password',
    error: 'Password must be at least 8 characters long',
    value: '123',
  },
};

/**
 * Text field with success state
 */
export const WithSuccess: Story = {
  args: {
    label: 'Email Address',
    type: 'email',
    placeholder: 'you@example.com',
    state: 'success',
    value: 'user@example.com',
    helperText: 'Email address is valid',
  },
};

/**
 * Disabled text field
 */
export const Disabled: Story = {
  args: {
    label: 'Account ID',
    value: 'ACC-12345',
    disabled: true,
    helperText: 'This field cannot be modified',
  },
};

/**
 * Read-only text field
 */
export const ReadOnly: Story = {
  args: {
    label: 'User ID',
    value: 'user_123456789',
    readOnly: true,
    helperText: 'This is your unique user identifier',
  },
};

/**
 * Small size text field
 */
export const Small: Story = {
  args: {
    label: 'Code',
    size: 'sm',
    placeholder: 'Enter code',
    maxLength: 6,
  },
};

/**
 * Large size text field
 */
export const Large: Story = {
  args: {
    label: 'Description',
    size: 'lg',
    placeholder: 'Enter description',
  },
};

/**
 * Text field with character count
 */
export const WithCharacterCount: Story = {
  args: {
    label: 'Bio',
    placeholder: 'Tell us about yourself',
    maxLength: 160,
    showCharCount: true,
    value:
      'I am a software developer passionate about creating great user experiences.',
    helperText: 'Keep it short and sweet',
  },
};

/**
 * Text field with start icon
 */
export const WithStartIcon: Story = {
  args: {
    label: 'Search',
    type: 'search',
    placeholder: 'Search repositories...',
    startIcon: (
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
          d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
        />
      </svg>
    ),
  },
};

/**
 * Text field with end icon
 */
export const WithEndIcon: Story = {
  args: {
    label: 'Website URL',
    type: 'url',
    placeholder: 'https://example.com',
    endIcon: (
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
          d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
        />
      </svg>
    ),
  },
};

/**
 * Password field with visibility toggle
 */
export const PasswordField: Story = {
  args: {
    label: 'Password',
    type: 'password',
    placeholder: 'Enter your password',
    endIcon: (
      <button type="button" className="text-gray-400 hover:text-gray-600">
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
            d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
          />
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
          />
        </svg>
      </button>
    ),
  },
};

/**
 * All text field sizes comparison
 */
export const AllSizes: Story = {
  render: () => (
    <div className="space-y-4 w-80">
      <TextField label="Small" size="sm" placeholder="Small input" />
      <TextField label="Medium" size="md" placeholder="Medium input" />
      <TextField label="Large" size="lg" placeholder="Large input" />
    </div>
  ),
  parameters: {
    layout: 'centered',
  },
};

/**
 * All text field variants comparison
 */
export const AllVariants: Story = {
  render: () => (
    <div className="space-y-6 w-80">
      <TextField
        label="Borderless (Default)"
        variant="borderless"
        placeholder="Pure flat design with no borders"
      />
      <TextField
        label="Bottom Line"
        variant="bottom-line"
        placeholder="Shows line on focus"
      />
      <TextField
        label="Subtle Outline"
        variant="subtle-outline"
        placeholder="Minimal outline on focus"
      />
    </div>
  ),
  parameters: {
    layout: 'centered',
  },
};

/**
 * All text field states comparison
 */
export const AllStates: Story = {
  render: () => (
    <div className="space-y-6 w-80">
      <TextField label="Default" placeholder="Default state" />
      <TextField label="Success" state="success" value="Valid input" />
      <TextField label="Error" error="This field is required" />
      <TextField label="Disabled" disabled value="Disabled input" />
    </div>
  ),
  parameters: {
    layout: 'centered',
  },
};

/**
 * Text field with bottom line variant
 */
export const BottomLine: Story = {
  args: {
    label: 'Email Address',
    type: 'email',
    variant: 'bottom-line',
    placeholder: 'you@example.com',
    helperText: 'Focus to see the bottom line appear',
  },
};

/**
 * Text field with subtle outline variant
 */
export const SubtleOutline: Story = {
  args: {
    label: 'Full Name',
    variant: 'subtle-outline',
    placeholder: 'Enter your full name',
    helperText: 'Minimal outline appears on focus',
  },
};

/**
 * Flat design form example with different variants
 */
export const FlatDesignForm: Story = {
  render: () => (
    <form className="space-y-6 w-96">
      <TextField
        label="First Name"
        variant="borderless"
        placeholder="Enter your first name"
        required
      />
      <TextField
        label="Email Address"
        type="email"
        variant="bottom-line"
        placeholder="you@example.com"
        required
        helperText="We'll use this to send you updates"
      />
      <TextField
        label="Phone Number"
        type="tel"
        variant="subtle-outline"
        placeholder="+1 (555) 123-4567"
        helperText="Optional - for account recovery"
      />
      <TextField
        label="Bio"
        variant="borderless"
        placeholder="Tell us about yourself"
        maxLength={160}
        showCharCount
        helperText="This will be shown on your profile"
      />
    </form>
  ),
  parameters: {
    layout: 'centered',
  },
};

/**
 * Form example with multiple text fields
 */
export const FormExample: Story = {
  render: () => (
    <form className="space-y-4 w-96">
      <TextField
        label="First Name"
        placeholder="Enter your first name"
        required
      />
      <TextField
        label="Last Name"
        placeholder="Enter your last name"
        required
      />
      <TextField
        label="Email"
        type="email"
        placeholder="you@example.com"
        required
        helperText="We'll use this to send you updates"
      />
      <TextField
        label="Phone"
        type="tel"
        placeholder="+1 (555) 123-4567"
        helperText="Optional - for account recovery"
      />
      <TextField
        label="Bio"
        placeholder="Tell us about yourself"
        maxLength={160}
        showCharCount
        helperText="This will be shown on your profile"
      />
    </form>
  ),
  parameters: {
    layout: 'centered',
  },
};
