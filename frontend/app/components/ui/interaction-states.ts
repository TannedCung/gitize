import { cn } from './utils';

/**
 * Interaction state types for flat minimalist design
 */
export type InteractionState =
  | 'default'
  | 'hover'
  | 'focus'
  | 'active'
  | 'disabled'
  | 'selected';

/**
 * Component types that support interaction states
 */
export type InteractiveComponent =
  | 'button'
  | 'input'
  | 'checkbox'
  | 'toggle'
  | 'card'
  | 'link'
  | 'menu-item'
  | 'tab'
  | 'nav-item'
  | 'list-item';

/**
 * Interaction feedback configuration for flat design
 */
interface InteractionConfig {
  /** Base classes for the component */
  base: string;
  /** Hover state classes - light gray backgrounds or thin border appearances only */
  hover: string;
  /** Focus state classes - minimal outlines that maintain flat aesthetic */
  focus: string;
  /** Active state classes - minimal visual changes */
  active: string;
  /** Disabled state classes - opacity and cursor changes */
  disabled: string;
  /** Selected state classes - minimal visual indication */
  selected: string;
}

/**
 * Flat minimalist interaction states for different component types
 * All states preserve clean, borderless design principles
 */
const INTERACTION_CONFIGS: Record<InteractiveComponent, InteractionConfig> = {
  button: {
    base: 'transition-colors duration-200 ease-in-out border-none',
    hover: 'hover:bg-neutral-100 dark:hover:bg-neutral-800',
    focus:
      'focus:outline-none focus:ring-1 focus:ring-neutral-500 focus:ring-offset-1 dark:focus:ring-neutral-500 dark:focus:ring-offset-neutral-900',
    active: 'active:bg-neutral-200 dark:active:bg-neutral-700',
    disabled:
      'disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none',
    selected:
      'bg-neutral-200 dark:bg-neutral-700 text-neutral-900 dark:text-neutral-100',
  },

  input: {
    base: 'transition-colors duration-200 ease-in-out bg-transparent border-none',
    hover: 'hover:bg-neutral-50/50 dark:hover:bg-neutral-900/25',
    focus:
      'focus:outline-none focus:ring-1 focus:ring-accent-blue-500 focus:ring-offset-0',
    active: '',
    disabled:
      'disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-neutral-100/50 dark:disabled:bg-neutral-800/50',
    selected: '',
  },

  checkbox: {
    base: 'transition-all duration-200 ease-in-out border border-neutral-200 dark:border-neutral-700',
    hover:
      'hover:bg-neutral-50 dark:hover:bg-neutral-800 hover:border-neutral-300 dark:hover:border-neutral-600',
    focus:
      'focus:outline-none focus:ring-1 focus:ring-accent-blue-500 focus:ring-offset-1 dark:focus:ring-offset-neutral-900',
    active: 'active:bg-neutral-100 dark:active:bg-neutral-700',
    disabled: 'disabled:opacity-50 disabled:cursor-not-allowed',
    selected:
      'bg-neutral-900 dark:bg-neutral-100 border-neutral-900 dark:border-neutral-100 text-neutral-white dark:text-neutral-900',
  },

  toggle: {
    base: 'transition-all duration-300 ease-in-out',
    hover: 'hover:bg-neutral-300 dark:hover:bg-neutral-600',
    focus:
      'focus:outline-none focus:ring-1 focus:ring-accent-blue-500 focus:ring-offset-1 dark:focus:ring-offset-neutral-900',
    active: '',
    disabled: 'disabled:opacity-50 disabled:cursor-not-allowed',
    selected: 'bg-neutral-900 dark:bg-neutral-100',
  },

  card: {
    base: 'transition-colors duration-200 ease-in-out border border-neutral-200 dark:border-neutral-700',
    hover:
      'hover:bg-neutral-50/50 dark:hover:bg-neutral-900/25 hover:border-neutral-300 dark:hover:border-neutral-600',
    focus:
      'focus:outline-none focus:ring-1 focus:ring-accent-blue-500 focus:ring-offset-2 dark:focus:ring-offset-neutral-900',
    active: 'active:bg-neutral-100/50 dark:active:bg-neutral-800/50',
    disabled: 'opacity-50 cursor-not-allowed pointer-events-none',
    selected:
      'bg-neutral-100 dark:bg-neutral-800 border-neutral-300 dark:border-neutral-600',
  },

  link: {
    base: 'transition-colors duration-200 ease-in-out underline decoration-1 underline-offset-2',
    hover:
      'hover:text-neutral-900 dark:hover:text-neutral-100 hover:decoration-2',
    focus:
      'focus:outline-none focus:ring-1 focus:ring-accent-blue-500 focus:ring-offset-1 dark:focus:ring-offset-neutral-900 rounded-sm',
    active: 'active:text-neutral-800 dark:active:text-neutral-200',
    disabled: 'opacity-50 cursor-not-allowed pointer-events-none no-underline',
    selected: 'text-neutral-900 dark:text-neutral-100 decoration-2',
  },

  'menu-item': {
    base: 'transition-colors duration-200 ease-in-out',
    hover: 'hover:bg-neutral-100/50 dark:hover:bg-neutral-800/50',
    focus:
      'focus:outline-none focus:bg-neutral-100/75 dark:focus:bg-neutral-800/75',
    active: 'active:bg-neutral-200/50 dark:active:bg-neutral-700/50',
    disabled: 'opacity-50 cursor-not-allowed pointer-events-none',
    selected:
      'bg-neutral-200/75 dark:bg-neutral-700/75 text-neutral-900 dark:text-neutral-100',
  },

  tab: {
    base: 'transition-colors duration-200 ease-in-out border-b-2 border-transparent',
    hover:
      'hover:text-neutral-900 dark:hover:text-neutral-100 hover:border-neutral-300 dark:hover:border-neutral-600',
    focus:
      'focus:outline-none focus:ring-1 focus:ring-accent-blue-500 focus:ring-offset-1 dark:focus:ring-offset-neutral-900 rounded-sm',
    active: 'active:text-neutral-800 dark:active:text-neutral-200',
    disabled: 'opacity-50 cursor-not-allowed pointer-events-none',
    selected:
      'text-neutral-900 dark:text-neutral-100 border-neutral-900 dark:border-neutral-100 font-medium',
  },

  'nav-item': {
    base: 'transition-colors duration-200 ease-in-out',
    hover:
      'hover:text-neutral-900 dark:hover:text-neutral-100 hover:bg-neutral-100/50 dark:hover:bg-neutral-800/50',
    focus:
      'focus:outline-none focus:ring-1 focus:ring-accent-blue-500 focus:ring-offset-1 dark:focus:ring-offset-neutral-900 rounded-sm',
    active: 'active:bg-neutral-200/50 dark:active:bg-neutral-700/50',
    disabled: 'opacity-50 cursor-not-allowed pointer-events-none',
    selected:
      'text-neutral-900 dark:text-neutral-100 bg-neutral-200/75 dark:bg-neutral-700/75 font-medium',
  },

  'list-item': {
    base: 'transition-colors duration-200 ease-in-out',
    hover: 'hover:bg-neutral-50 dark:hover:bg-neutral-900/50',
    focus:
      'focus:outline-none focus:bg-neutral-100/50 dark:focus:bg-neutral-800/50',
    active: 'active:bg-neutral-200/50 dark:active:bg-neutral-700/50',
    disabled: 'opacity-50 cursor-not-allowed pointer-events-none',
    selected:
      'bg-neutral-200/75 dark:bg-neutral-700/75 text-neutral-900 dark:text-neutral-100',
  },
};

/**
 * Creates interaction state classes for a specific component type
 * Maintains flat, borderless design principles with subtle feedback
 */
export function createInteractionStates(
  component: InteractiveComponent,
  states: InteractionState[] = ['hover', 'focus', 'active', 'disabled']
): string {
  const config = INTERACTION_CONFIGS[component];

  const stateClasses = states
    .map(state => {
      switch (state) {
        case 'default':
          return config.base;
        case 'hover':
          return config.hover;
        case 'focus':
          return config.focus;
        case 'active':
          return config.active;
        case 'disabled':
          return config.disabled;
        case 'selected':
          return config.selected;
        default:
          return '';
      }
    })
    .filter(Boolean);

  return cn(config.base, ...stateClasses);
}

/**
 * Creates hover state classes with light gray backgrounds only
 * Preserves flat design aesthetic
 */
export function createHoverState(component: InteractiveComponent): string {
  const config = INTERACTION_CONFIGS[component];
  return cn(config.base, config.hover);
}

/**
 * Creates focus state classes with minimal outlines
 * Maintains accessibility while preserving flat aesthetic
 */
export function createFocusState(component: InteractiveComponent): string {
  const config = INTERACTION_CONFIGS[component];
  return cn(config.base, config.focus);
}

/**
 * Creates active state classes with minimal visual changes
 * Provides feedback without breaking clean design
 */
export function createActiveState(component: InteractiveComponent): string {
  const config = INTERACTION_CONFIGS[component];
  return cn(config.base, config.active);
}

/**
 * Creates disabled state classes
 * Uses opacity and cursor changes only
 */
export function createDisabledState(component: InteractiveComponent): string {
  const config = INTERACTION_CONFIGS[component];
  return cn(config.base, config.disabled);
}

/**
 * Creates selected state classes with minimal visual indication
 * Communicates state through subtle background changes
 */
export function createSelectedState(component: InteractiveComponent): string {
  const config = INTERACTION_CONFIGS[component];
  return cn(config.base, config.selected);
}

/**
 * Creates complete interaction state classes for a component
 * Includes all states with flat design principles
 */
export function createCompleteInteractionStates(
  component: InteractiveComponent,
  options: {
    includeSelected?: boolean;
    customStates?: Partial<InteractionConfig>;
  } = {}
): string {
  const config = INTERACTION_CONFIGS[component];
  const { includeSelected = false, customStates = {} } = options;

  const mergedConfig = { ...config, ...customStates };

  const states = [
    mergedConfig.base,
    mergedConfig.hover,
    mergedConfig.focus,
    mergedConfig.active,
    mergedConfig.disabled,
  ];

  if (includeSelected) {
    states.push(mergedConfig.selected);
  }

  return cn(...states);
}

/**
 * Creates conditional interaction classes based on component state
 */
export function createConditionalInteractionStates(
  component: InteractiveComponent,
  conditions: {
    isHovered?: boolean;
    isFocused?: boolean;
    isActive?: boolean;
    isDisabled?: boolean;
    isSelected?: boolean;
  }
): string {
  const config = INTERACTION_CONFIGS[component];
  const {
    isHovered = false,
    isFocused = false,
    isActive = false,
    isDisabled = false,
    isSelected = false,
  } = conditions;

  const conditionalClasses = [
    config.base,
    isHovered && config.hover,
    isFocused && config.focus,
    isActive && config.active,
    isDisabled && config.disabled,
    isSelected && config.selected,
  ].filter(Boolean);

  return cn(...conditionalClasses);
}

/**
 * Creates keyboard navigation classes for interactive elements
 * Ensures proper focus management in flat design
 */
export function createKeyboardNavigationStates(
  component: InteractiveComponent
): string {
  const config = INTERACTION_CONFIGS[component];

  return cn(
    config.base,
    config.focus,
    // Additional keyboard-specific states
    'focus-visible:ring-2 focus-visible:ring-accent-blue-500 focus-visible:ring-offset-1',
    'dark:focus-visible:ring-offset-neutral-900'
  );
}

/**
 * Enhanced interaction state utilities for comprehensive feedback system
 */

/**
 * Creates press/active state feedback with minimal visual changes
 * Maintains flat design while providing clear interaction feedback
 */
export function createPressState(component: InteractiveComponent): string {
  const config = INTERACTION_CONFIGS[component];
  return cn(
    config.base,
    config.active,
    // Enhanced press feedback with subtle scale for touch devices
    'active:scale-[0.98] touch:active:scale-[0.98]',
    'transition-transform duration-75 ease-out'
  );
}

/**
 * Creates loading state classes that maintain flat design
 * Provides feedback without heavy visual effects
 */
export function createLoadingState(component: InteractiveComponent): string {
  const config = INTERACTION_CONFIGS[component];
  return cn(
    config.base,
    config.disabled,
    // Loading-specific styling
    'cursor-wait',
    'animate-pulse opacity-75'
  );
}

/**
 * Creates error state classes with minimal red accents
 * Maintains flat design while clearly indicating errors
 */
export function createErrorState(component: InteractiveComponent): string {
  const config = INTERACTION_CONFIGS[component];
  return cn(
    config.base,
    // Error-specific styling with minimal visual impact
    'border-accent-red-200 dark:border-accent-red-700',
    'text-accent-red-700 dark:text-accent-red-300',
    'focus:ring-accent-red-400 dark:focus:ring-accent-red-500'
  );
}

/**
 * Creates success state classes with minimal green accents
 * Maintains flat design while indicating successful states
 */
export function createSuccessState(component: InteractiveComponent): string {
  const config = INTERACTION_CONFIGS[component];
  return cn(
    config.base,
    // Success-specific styling with minimal visual impact
    'border-accent-green-200 dark:border-accent-green-700',
    'text-accent-green-700 dark:text-accent-green-300',
    'focus:ring-accent-green-400 dark:focus:ring-accent-green-500'
  );
}

/**
 * Creates warning state classes with minimal amber accents
 * Maintains flat design while indicating warning states
 */
export function createWarningState(component: InteractiveComponent): string {
  const config = INTERACTION_CONFIGS[component];
  return cn(
    config.base,
    // Warning-specific styling with minimal visual impact
    'border-accent-amber-200 dark:border-accent-amber-700',
    'text-accent-amber-700 dark:text-accent-amber-300',
    'focus:ring-accent-amber-400 dark:focus:ring-accent-amber-500'
  );
}

/**
 * Creates enhanced hover state with multiple feedback layers
 * Provides rich interaction feedback while maintaining flat design
 */
export function createEnhancedHoverState(
  component: InteractiveComponent,
  options: {
    includeTransform?: boolean;
    includeBorder?: boolean;
    includeBackground?: boolean;
  } = {}
): string {
  const config = INTERACTION_CONFIGS[component];
  const {
    includeTransform = false,
    includeBorder = true,
    includeBackground = true,
  } = options;

  const enhancedClasses = [
    config.base,
    includeBackground && config.hover,
    // Optional subtle transform for enhanced feedback
    includeTransform &&
      'hover:scale-[1.02] transition-transform duration-200 ease-out',
    // Optional border enhancement
    includeBorder && 'hover:border-neutral-300 dark:hover:border-neutral-600',
  ].filter(Boolean);

  return cn(...enhancedClasses);
}

/**
 * Creates comprehensive interaction state classes with all feedback types
 * Provides complete interaction system while preserving flat aesthetic
 */
export function createComprehensiveInteractionStates(
  component: InteractiveComponent,
  options: {
    includePress?: boolean;
    includeKeyboard?: boolean;
    includeTouch?: boolean;
    enhancedFeedback?: boolean;
  } = {}
): string {
  const config = INTERACTION_CONFIGS[component];
  const {
    includePress = true,
    includeKeyboard = true,
    includeTouch = true,
    enhancedFeedback = false,
  } = options;

  const comprehensiveClasses = [
    config.base,
    config.hover,
    config.focus,
    includePress && config.active,
    config.disabled,
    // Enhanced keyboard navigation
    includeKeyboard && 'focus-visible:ring-2',
    // Touch-friendly enhancements
    includeTouch && 'touch-manipulation select-none',
    includeTouch && 'min-h-[44px] min-w-[44px]', // Minimum touch target size
    // Enhanced feedback options
    enhancedFeedback && 'hover:scale-[1.01] active:scale-[0.99]',
    enhancedFeedback && 'transition-all duration-200 ease-out',
  ].filter(Boolean);

  return cn(...comprehensiveClasses);
}

/**
 * Creates touch-friendly interaction states for mobile devices
 * Maintains flat design while ensuring good touch targets
 */
export function createTouchInteractionStates(
  component: InteractiveComponent
): string {
  const config = INTERACTION_CONFIGS[component];

  return cn(
    config.base,
    config.hover,
    config.active,
    // Touch-specific enhancements
    'touch-manipulation',
    'select-none',
    // Ensure minimum touch target size
    'min-h-[44px] min-w-[44px]'
  );
}

/**
 * Enhanced interaction state presets for common use cases
 */
export const InteractionPresets = {
  // Minimal interaction - hover and focus only
  minimal: (component: InteractiveComponent) =>
    createInteractionStates(component, ['hover', 'focus']),

  // Standard interaction - hover, focus, active, disabled
  standard: (component: InteractiveComponent) =>
    createInteractionStates(component, [
      'hover',
      'focus',
      'active',
      'disabled',
    ]),

  // Complete interaction - all states including selected
  complete: (component: InteractiveComponent) =>
    createCompleteInteractionStates(component, { includeSelected: true }),

  // Keyboard-focused interaction for accessibility
  keyboard: (component: InteractiveComponent) =>
    createKeyboardNavigationStates(component),

  // Touch-optimized interaction for mobile
  touch: (component: InteractiveComponent) =>
    createTouchInteractionStates(component),

  // Enhanced interaction with subtle transforms
  enhanced: (component: InteractiveComponent) =>
    createComprehensiveInteractionStates(component, { enhancedFeedback: true }),
} as const;

/**
 * Utility to get interaction state classes for specific use cases
 */
export const InteractionStates = {
  button: (states?: InteractionState[]) =>
    createInteractionStates('button', states),
  input: (states?: InteractionState[]) =>
    createInteractionStates('input', states),
  checkbox: (states?: InteractionState[]) =>
    createInteractionStates('checkbox', states),
  toggle: (states?: InteractionState[]) =>
    createInteractionStates('toggle', states),
  card: (states?: InteractionState[]) =>
    createInteractionStates('card', states),
  link: (states?: InteractionState[]) =>
    createInteractionStates('link', states),
  menuItem: (states?: InteractionState[]) =>
    createInteractionStates('menu-item', states),
  tab: (states?: InteractionState[]) => createInteractionStates('tab', states),
  navItem: (states?: InteractionState[]) =>
    createInteractionStates('nav-item', states),
  listItem: (states?: InteractionState[]) =>
    createInteractionStates('list-item', states),
} as const;

/**
 * State-specific utilities for targeted interaction feedback
 */
export const StateUtils = {
  hover: createHoverState,
  focus: createFocusState,
  active: createActiveState,
  disabled: createDisabledState,
  selected: createSelectedState,
  press: createPressState,
  loading: createLoadingState,
  error: createErrorState,
  success: createSuccessState,
  warning: createWarningState,
  enhancedHover: createEnhancedHoverState,
  keyboard: createKeyboardNavigationStates,
  touch: createTouchInteractionStates,
  comprehensive: createComprehensiveInteractionStates,
} as const;

/**
 * Conditional state builder for dynamic interaction states
 */
export function buildConditionalStates(
  component: InteractiveComponent,
  conditions: {
    isHovered?: boolean;
    isFocused?: boolean;
    isActive?: boolean;
    isDisabled?: boolean;
    isSelected?: boolean;
    isLoading?: boolean;
    hasError?: boolean;
    isSuccess?: boolean;
    isWarning?: boolean;
  }
): string {
  const {
    isHovered = false,
    isFocused = false,
    isActive = false,
    isDisabled = false,
    isSelected = false,
    isLoading = false,
    hasError = false,
    isSuccess = false,
    isWarning = false,
  } = conditions;

  // Priority order: loading > disabled > error > warning > success > selected > active > focused > hovered
  if (isLoading) return createLoadingState(component);
  if (isDisabled) return createDisabledState(component);
  if (hasError) return createErrorState(component);
  if (isWarning) return createWarningState(component);
  if (isSuccess) return createSuccessState(component);
  if (isSelected) return createSelectedState(component);
  if (isActive) return createActiveState(component);
  if (isFocused) return createFocusState(component);
  if (isHovered) return createHoverState(component);

  // Default state
  const config = INTERACTION_CONFIGS[component];
  return config.base;
}
