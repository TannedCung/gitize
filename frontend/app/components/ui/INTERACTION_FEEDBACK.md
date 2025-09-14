# Interaction Feedback System

## Overview

The AppFlowy UI System implements a comprehensive interaction feedback system that maintains flat, borderless design principles while providing clear and accessible user feedback. This system ensures that all interactive elements communicate their state through subtle visual changes that preserve the clean, minimalist aesthetic.

## Design Principles

### 1. Flat Design Compliance

- **No shadows, gradients, or 3D effects**: All interaction states maintain the flat design aesthetic
- **Borderless by default**: Primary interactive elements (buttons, inputs) use minimal or no borders
- **Typography-first hierarchy**: Visual organization through font weight and spacing rather than containers

### 2. Subtle Interaction Feedback

- **Light gray backgrounds**: Hover states use subtle background color changes only
- **Minimal outlines**: Focus states use thin, single-pixel rings for accessibility
- **Smooth transitions**: All state changes use consistent 200ms ease-in-out transitions

### 3. Accessibility Compliance

- **WCAG 2.1 AA standards**: All color contrasts and focus indicators meet accessibility requirements
- **Enhanced keyboard navigation**: Focus-visible states provide enhanced visibility for keyboard users
- **Touch-friendly targets**: Minimum 44px touch targets for mobile accessibility

## Component Interaction States

### Button Components

```typescript
// Flat, borderless buttons with subtle feedback
const buttonStates = {
  default: 'bg-accent-blue-500 text-white border-none',
  hover: 'hover:bg-accent-blue-600',
  focus: 'focus:ring-1 focus:ring-neutral-500 focus:ring-offset-1',
  active: 'active:bg-accent-blue-700',
  disabled: 'disabled:opacity-50 disabled:cursor-not-allowed',
};
```

### Input Components

```typescript
// Borderless inputs with bottom-line or subtle-outline variants
const inputStates = {
  borderless: 'border-none bg-transparent hover:bg-neutral-50/25',
  bottomLine: 'border-b border-transparent focus:border-accent-blue-500',
  subtleOutline:
    'border border-transparent hover:border-neutral-200 focus:border-accent-blue-300',
};
```

### Form Elements

```typescript
// Flat checkboxes and toggles with minimal visual feedback
const formStates = {
  checkbox: 'border border-neutral-200 hover:bg-neutral-50 focus:ring-1',
  toggle: 'bg-neutral-200 hover:bg-neutral-300 focus:ring-1',
};
```

## Interaction State API

### Basic State Functions

#### `createHoverState(component: InteractiveComponent)`

Creates hover states using light gray backgrounds only, preserving flat design aesthetic.

```typescript
const buttonHover = createHoverState('button');
// Returns: 'hover:bg-neutral-100 dark:hover:bg-neutral-800'
```

#### `createFocusState(component: InteractiveComponent)`

Creates focus states with minimal outlines that maintain flat aesthetic while ensuring accessibility.

```typescript
const buttonFocus = createFocusState('button');
// Returns: 'focus:outline-none focus:ring-1 focus:ring-neutral-500'
```

#### `createActiveState(component: InteractiveComponent)`

Creates active states with minimal visual changes that provide feedback without breaking clean design.

```typescript
const buttonActive = createActiveState('button');
// Returns: 'active:bg-neutral-200 dark:active:bg-neutral-700'
```

### Enhanced State Functions

#### `createPressState(component: InteractiveComponent)`

Creates press/active state feedback with minimal visual changes and optional subtle scale for touch devices.

```typescript
const pressState = createPressState('button');
// Includes subtle scale transform for enhanced touch feedback
```

#### `createLoadingState(component: InteractiveComponent)`

Creates loading state classes that maintain flat design while providing clear loading feedback.

```typescript
const loadingState = createLoadingState('button');
// Returns: 'cursor-wait animate-pulse opacity-75'
```

#### `createErrorState(component: InteractiveComponent)`

Creates error state classes with minimal red accents that maintain flat design.

```typescript
const errorState = createErrorState('input');
// Returns: 'border-accent-red-200 text-accent-red-700 focus:ring-accent-red-400'
```

### Interaction Presets

#### Minimal Preset

For components that need only basic hover and focus feedback:

```typescript
const minimal = InteractionPresets.minimal('button');
```

#### Standard Preset

For full interaction states including hover, focus, active, and disabled:

```typescript
const standard = InteractionPresets.standard('button');
```

#### Enhanced Preset

For components that benefit from subtle transforms and enhanced feedback:

```typescript
const enhanced = InteractionPresets.enhanced('button');
```

#### Keyboard Preset

For enhanced keyboard navigation with improved focus visibility:

```typescript
const keyboard = InteractionPresets.keyboard('button');
```

#### Touch Preset

For touch-optimized interactions with proper target sizes:

```typescript
const touch = InteractionPresets.touch('button');
```

### Conditional State Building

The `buildConditionalStates` function allows dynamic state management based on component conditions:

```typescript
const dynamicState = buildConditionalStates('button', {
  isLoading: true,
  isDisabled: false,
  hasError: false,
  isSuccess: false,
});
// Returns appropriate state based on priority order
```

#### State Priority Order

1. Loading
2. Disabled
3. Error
4. Warning
5. Success
6. Selected
7. Active
8. Focused
9. Hovered
10. Default

## Usage Examples

### Basic Button with Interaction States

```tsx
import { InteractionPresets } from './ui/interaction-states';

const MyButton = ({ children, ...props }) => (
  <button
    className={cn(
      'px-4 py-2 rounded-md text-sm font-medium',
      'bg-accent-blue-500 text-white',
      InteractionPresets.standard('button')
    )}
    {...props}
  >
    {children}
  </button>
);
```

### Dynamic Input with State Management

```tsx
import { buildConditionalStates } from './ui/interaction-states';

const MyInput = ({ error, success, disabled, ...props }) => {
  const stateClasses = buildConditionalStates('input', {
    hasError: !!error,
    isSuccess: success,
    isDisabled: disabled,
  });

  return (
    <input
      className={cn(
        'w-full px-3 py-2 text-sm',
        'bg-transparent border-none',
        stateClasses
      )}
      disabled={disabled}
      {...props}
    />
  );
};
```

### Enhanced Card with Touch Support

```tsx
import { InteractionPresets } from './ui/interaction-states';

const InteractiveCard = ({ onClick, children }) => (
  <div
    className={cn(
      'p-6 rounded-lg border border-neutral-200',
      'cursor-pointer',
      InteractionPresets.touch('card')
    )}
    onClick={onClick}
    role="button"
    tabIndex={0}
  >
    {children}
  </div>
);
```

## Testing

The interaction feedback system includes comprehensive tests that verify:

- **Flat design compliance**: No shadows, gradients, or 3D effects
- **Subtle feedback**: Appropriate hover and focus states
- **Accessibility**: Proper focus indicators and contrast ratios
- **Component consistency**: All components follow the same interaction patterns
- **State management**: Conditional states work correctly with proper priority

Run the tests with:

```bash
npm test -- --testPathPatterns="interaction-states"
```

## Customization

### Adding New Component Types

To add support for a new interactive component:

1. Add the component type to `InteractiveComponent`:

```typescript
export type InteractiveComponent =
  | 'button'
  | 'input'
  // ... existing types
  | 'my-new-component';
```

2. Add configuration to `INTERACTION_CONFIGS`:

```typescript
'my-new-component': {
  base: 'transition-colors duration-200 ease-in-out',
  hover: 'hover:bg-neutral-100 dark:hover:bg-neutral-800',
  focus: 'focus:outline-none focus:ring-1 focus:ring-neutral-500',
  active: 'active:bg-neutral-200 dark:active:bg-neutral-700',
  disabled: 'disabled:opacity-50 disabled:cursor-not-allowed',
  selected: 'bg-neutral-200 dark:bg-neutral-700',
},
```

### Custom State Configurations

For component-specific customizations:

```typescript
const customButton = createCompleteInteractionStates('button', {
  customStates: {
    hover: 'hover:bg-custom-color',
    focus: 'focus:ring-custom-color',
  },
});
```

## Best Practices

1. **Always use the interaction state system** instead of manually writing hover/focus classes
2. **Choose appropriate presets** based on component complexity and usage
3. **Test with keyboard navigation** to ensure focus states are visible
4. **Verify touch targets** meet minimum size requirements on mobile
5. **Maintain flat design principles** - avoid adding shadows or 3D effects
6. **Use conditional state building** for dynamic components with multiple states
7. **Follow the state priority order** when multiple states could be active

## Migration Guide

### From Manual Classes

Replace manual interaction classes:

```tsx
// Before
<button className="hover:bg-blue-600 focus:ring-2 focus:ring-blue-500 active:bg-blue-700">

// After
<button className={cn('bg-blue-500', InteractionPresets.standard('button'))}>
```

### From Component-Specific States

Consolidate component-specific interaction logic:

```tsx
// Before
const buttonClasses = `
  ${isHovered ? 'bg-blue-600' : 'bg-blue-500'}
  ${isFocused ? 'ring-2 ring-blue-500' : ''}
  ${isActive ? 'bg-blue-700' : ''}
`;

// After
const buttonClasses = buildConditionalStates('button', {
  isHovered,
  isFocused,
  isActive,
});
```

This interaction feedback system ensures consistent, accessible, and beautiful interactions across the entire AppFlowy UI system while maintaining the flat, borderless design aesthetic.
