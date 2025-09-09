# Accessibility Features Documentation

This document outlines the comprehensive accessibility features implemented in the AppFlowy UI System.

## Overview

The accessibility implementation includes:

- Focus management utilities for complex components
- ARIA live regions for dynamic content updates
- Enhanced keyboard navigation helpers
- Comprehensive automated accessibility testing with jest-axe

## Focus Management

### `useFocusManagement` Hook

Located in `hooks/useFocusManagement.ts`, this hook provides comprehensive focus management for complex components:

```typescript
const { focusFirst, focusLast, focusNext, focusPrevious } = useFocusManagement(
  containerRef,
  {
    isActive: true,
    trapFocus: true,
    restoreFocus: true,
    initialFocus: 'first',
  }
);
```

**Features:**

- Focus trapping within containers
- Focus restoration when components unmount
- Automatic initial focus setting
- Support for roving tabindex patterns

### `useRovingTabIndex` Hook

Implements roving tabindex pattern for keyboard navigation in lists and grids:

```typescript
const { focusIndex, moveFocus } = useRovingTabIndex(containerRef, {
  orientation: 'vertical',
  loop: true,
});
```

## ARIA Live Regions

### `useAriaLiveRegion` Hook

Located in `hooks/useAriaLiveRegion.ts`, provides screen reader announcements:

```typescript
const { announce, clear } = useAriaLiveRegion({
  politeness: 'polite',
  clearAfterAnnounce: true,
  clearDelay: 1000,
});
```

### Specialized Announcement Hooks

- `useFormAnnouncements` - Form validation and submission announcements
- `useNavigationAnnouncements` - Page and route change announcements
- `useDataAnnouncements` - Data loading and update announcements

### AccessibilityProvider

Global provider that manages all ARIA live regions:

```typescript
<AccessibilityProvider>
  <App />
</AccessibilityProvider>
```

Access announcements anywhere in the app:

```typescript
const { announcePolite, announceAssertive } = useAccessibility();
```

## Enhanced Keyboard Navigation

### `useKeyboardNavigation` Hook

Enhanced version with support for more keys and better configuration:

```typescript
useKeyboardNavigation({
  onEscape: () => closeModal(),
  onEnter: () => submitForm(),
  onArrowUp: () => moveSelection('up'),
  onHome: () => moveToFirst(),
  onEnd: () => moveToLast(),
  enabled: true,
  preventDefault: true,
});
```

### `useListNavigation` Hook

Specialized hook for list and grid navigation:

```typescript
const { focusItem, moveSelection } = useListNavigation(containerRef, {
  orientation: 'vertical',
  wrap: true,
  itemSelector: '[role="option"]',
});
```

### `useKeyboardShortcuts` Hook

Global keyboard shortcut management:

```typescript
useKeyboardShortcuts({
  'ctrl+s': () => save(),
  'ctrl+z': () => undo(),
  escape: () => closeModal(),
});
```

### `useModalKeyboard` Hook

Complete modal keyboard behavior:

```typescript
useModalKeyboard(isOpen, onClose, containerRef);
// Handles focus trapping, escape key, and background scroll prevention
```

## Accessibility Testing

### Comprehensive Testing Utilities

Located in `utils/accessibilityTesting.ts`:

```typescript
// Run full accessibility audit
const results = await runAccessibilityTests(element);

// Test specific aspects
await testColorContrast(element);
await testKeyboardAccessibility(element);
await testAriaImplementation(element);
await testFormAccessibility(element);
```

### Custom Jest Matchers

```typescript
// Custom accessibility matchers
await expect(container).toBeAccessible();
await expect(container).toHaveProperColorContrast();
await expect(container).toBeKeyboardAccessible();
await expect(container).toHaveProperAria();
```

### Enhanced Test Utils

Located in `components/ui/test-utils.tsx`:

```typescript
// Test component in both themes
await testBothThemes(<Component />, async (container, theme) => {
  const results = await testComprehensiveAccessibility(container);
  expect(results.passed).toBe(true);
});

// Test keyboard navigation
await testKeyboardNavigation(container, expectedFocusableElements);

// Test component variants
await testComponentVariants(Component, baseProps, variants);
```

## Implementation Examples

### Modal with Full Accessibility

```typescript
function Modal({ isOpen, onClose, children }) {
  const containerRef = useRef<HTMLDivElement>(null);

  // Focus management
  useFocusManagement(containerRef, {
    isActive: isOpen,
    trapFocus: true,
    restoreFocus: true,
  });

  // Keyboard handling
  useModalKeyboard(isOpen, onClose, containerRef);

  // Announcements
  const { announcePolite } = useAccessibility();

  useEffect(() => {
    if (isOpen) {
      announcePolite('Modal opened');
    }
  }, [isOpen, announcePolite]);

  return (
    <div
      ref={containerRef}
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      {children}
    </div>
  );
}
```

### Form with Accessibility Features

```typescript
function AccessibleForm() {
  const { announceFormError, announceFormSuccess } = useFormAccessibility();
  const [errors, setErrors] = useState({});

  const handleSubmit = async (data) => {
    try {
      await submitForm(data);
      announceFormSuccess('Form submitted successfully');
    } catch (error) {
      setErrors(error.fieldErrors);
      Object.entries(error.fieldErrors).forEach(([field, message]) => {
        announceFormError(field, message);
      });
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <TextField
        label="Email"
        error={errors.email}
        aria-describedby={errors.email ? 'email-error' : undefined}
        aria-invalid={!!errors.email}
      />
    </form>
  );
}
```

### List with Keyboard Navigation

```typescript
function NavigableList({ items }) {
  const containerRef = useRef<HTMLUListElement>(null);
  const [selectedIndex, setSelectedIndex] = useState(0);

  useListNavigation(containerRef, {
    orientation: 'vertical',
    onSelectionChange: setSelectedIndex,
  });

  return (
    <ul ref={containerRef} role="listbox">
      {items.map((item, index) => (
        <li
          key={item.id}
          role="option"
          data-navigable
          aria-selected={index === selectedIndex}
          tabIndex={index === selectedIndex ? 0 : -1}
        >
          {item.name}
        </li>
      ))}
    </ul>
  );
}
```

## Testing Examples

### Component Accessibility Test

```typescript
describe('Component Accessibility', () => {
  it('passes comprehensive accessibility tests', async () => {
    const { container } = renderWithProviders(<Component />);

    // Full accessibility audit
    const results = await testComprehensiveAccessibility(container);
    expect(results.passed).toBe(true);

    // Specific tests
    await expect(container).toBeAccessible();
    await expect(container).toHaveProperColorContrast();
    await expect(container).toBeKeyboardAccessible();
  });

  it('supports keyboard navigation', async () => {
    const { container } = renderWithProviders(<Component />);
    await testKeyboardNavigation(container, 3); // 3 focusable elements
  });

  it('works in both themes', async () => {
    await testBothThemes(<Component />);
  });
});
```

## WCAG 2.1 AA Compliance

All components are tested against WCAG 2.1 AA standards:

- **Color Contrast**: Minimum 4.5:1 ratio for normal text, 3:1 for large text
- **Keyboard Navigation**: All interactive elements accessible via keyboard
- **Focus Management**: Visible focus indicators and logical tab order
- **Screen Reader Support**: Proper ARIA labels, roles, and properties
- **Form Accessibility**: Labels, error messages, and validation states

## Browser Support

Accessibility features are tested and supported in:

- Chrome/Chromium-based browsers
- Firefox
- Safari
- Edge

## Performance Considerations

- ARIA live regions are created only when needed
- Focus management uses efficient DOM queries
- Keyboard event listeners are properly cleaned up
- Testing utilities are optimized for CI/CD environments

## Future Enhancements

Planned accessibility improvements:

- High contrast mode support
- Reduced motion preferences
- Voice control compatibility
- Mobile accessibility enhancements
- Internationalization support for screen readers
