# AppFlowy UI System - Base Component Infrastructure

This directory contains the base infrastructure for the AppFlowy UI component system, providing consistent TypeScript interfaces, utility functions, and testing utilities for building accessible, theme-aware components.

## Core Files

### `types.ts`

Defines the foundational TypeScript interfaces that all components should extend:

- **`BaseComponentProps`**: Common props for all components (className, children, data-testid, aria-label)
- **`InteractiveComponentProps`**: Props for interactive components (extends BaseComponentProps with disabled, loading, onClick, onKeyDown)
- **Type definitions**: ComponentSize, ComponentVariant, ThemeMode, ComponentState

### `utils.ts`

Provides utility functions for consistent component styling and behavior:

- **`cn(...inputs)`**: Merges Tailwind CSS classes using clsx and tailwind-merge
- **`createVariantClasses(component, variant, size?, state?)`**: Generates variant-specific CSS classes
- **`createFocusRing(variant)`**: Creates accessible focus ring styles
- **`createTransition(properties)`**: Generates smooth transition classes
- **Accessibility helpers**: Functions for creating accessible button and input props

### `test-utils.tsx`

Testing utilities with jest-axe integration for accessibility testing:

- **`renderWithProviders(ui, options)`**: Enhanced render function with theme support
- **`testAccessibility(container)`**: Tests component accessibility with axe-core
- **`testBothThemes(component, testFn?)`**: Tests components in both light and dark themes
- **`testKeyboardNavigation(container, expectedElements)`**: Tests keyboard navigation
- **`commonTestScenarios`**: Reusable test scenarios for common component behaviors
- **`mockUserInteractions`**: Utilities for simulating user interactions

## Usage Examples

### Creating a New Component

```typescript
import React from 'react';
import { InteractiveComponentProps, cn, createVariantClasses, createFocusRing } from './utils';

interface ButtonProps extends InteractiveComponentProps {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
}

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  className,
  disabled,
  loading,
  children,
  onClick,
  onKeyDown,
  ...props
}) => {
  return (
    <button
      className={cn(
        createVariantClasses('button', variant, size, disabled ? 'disabled' : 'default'),
        createFocusRing(variant),
        'transition-colors duration-200 ease-in-out',
        className
      )}
      disabled={disabled || loading}
      onClick={onClick}
      onKeyDown={onKeyDown}
      aria-disabled={disabled || loading}
      {...props}
    >
      {loading ? 'Loading...' : children}
    </button>
  );
};
```

### Testing a Component

```typescript
import React from 'react';
import { renderWithProviders, testAccessibility, testBothThemes, commonTestScenarios } from './test-utils';
import { Button } from './Button';

describe('Button Component', () => {
  it('should render without crashing', async () => {
    await commonTestScenarios.rendersWithoutCrashing(Button, {
      children: 'Test Button',
      'aria-label': 'Test button'
    });
  });

  it('should be accessible in both themes', async () => {
    await testBothThemes(
      <Button aria-label="Theme test button">Test Button</Button>
    );
  });

  it('should handle disabled state', async () => {
    await commonTestScenarios.handlesDisabledState(Button, {
      children: 'Disabled Button',
      'aria-label': 'Disabled button'
    });
  });
});
```

## Design Tokens

The utility functions include predefined design tokens for:

- **Colors**: AppFlowy brand colors (skyline, aqua, violet, amethyst, berry, coral, golden, amber, lemon)
- **Spacing**: Consistent padding, margin, and gap values
- **Typography**: Font sizes and weights
- **Border Radius**: Consistent corner radius values
- **Shadows**: Elevation and depth effects

## Accessibility Features

All components built with this infrastructure include:

- **ARIA attributes**: Proper labeling and state communication
- **Keyboard navigation**: Focus management and keyboard interaction support
- **Color contrast**: Sufficient contrast ratios in both light and dark themes
- **Screen reader support**: Semantic HTML and descriptive text
- **Focus indicators**: Clear visual focus states

## Theme Support

Components automatically support both light and dark themes through:

- **Class-based theming**: Uses Tailwind's `dark:` prefix for dark mode styles
- **Automatic color adaptation**: Theme-aware color variants
- **Smooth transitions**: Animated theme switching
- **System preference detection**: Respects user's OS theme preference

## Testing Strategy

The infrastructure supports comprehensive testing including:

- **Unit tests**: Individual component behavior and props
- **Accessibility tests**: Automated a11y testing with jest-axe
- **Theme tests**: Verification in both light and dark modes
- **Interaction tests**: Keyboard navigation and user interactions
- **Visual regression**: Component appearance consistency

## Best Practices

1. **Always extend base interfaces**: Use `BaseComponentProps` or `InteractiveComponentProps`
2. **Use utility functions**: Leverage `cn()` for className merging and variant functions for consistency
3. **Include accessibility**: Add proper ARIA attributes and test with jest-axe
4. **Support both themes**: Test components in light and dark modes
5. **Follow naming conventions**: Use consistent prop names and component structure
6. **Write comprehensive tests**: Include accessibility, theme, and interaction tests

## Dependencies

- **clsx**: Conditional className utility
- **tailwind-merge**: Tailwind CSS class deduplication
- **jest-axe**: Accessibility testing
- **@testing-library/react**: Component testing utilities
- **@testing-library/user-event**: User interaction simulation
