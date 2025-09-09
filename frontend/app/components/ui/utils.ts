import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { ComponentSize, ComponentVariant, ComponentState } from './types';

/**
 * Utility function to merge Tailwind CSS classes
 * Combines clsx for conditional classes and tailwind-merge for deduplication
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Creates a variant class name based on component type and variant
 */
export function createVariantClasses(
  component: string,
  variant: ComponentVariant,
  size?: ComponentSize,
  state?: ComponentState
): string {
  const baseClasses = getBaseVariantClasses(component, variant);
  const sizeClasses = size ? getSizeClasses(component, size) : '';
  const stateClasses = state ? getStateClasses(component, state) : '';

  return cn(baseClasses, sizeClasses, stateClasses);
}

/**
 * Gets base variant classes for different component types
 */
function getBaseVariantClasses(
  component: string,
  variant: ComponentVariant
): string {
  const variantMap: Record<string, Record<ComponentVariant, string>> = {
    button: {
      primary: 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500',
      secondary:
        'bg-gray-200 text-gray-900 hover:bg-gray-300 focus:ring-gray-500 dark:bg-gray-700 dark:text-gray-100 dark:hover:bg-gray-600',
      outline:
        'border border-gray-300 bg-transparent text-gray-700 hover:bg-gray-50 focus:ring-gray-500 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-800',
      ghost:
        'bg-transparent text-gray-700 hover:bg-gray-100 focus:ring-gray-500 dark:text-gray-300 dark:hover:bg-gray-800',
      danger: 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500',
    },
    alert: {
      primary:
        'bg-blue-50 border-blue-200 text-blue-800 dark:bg-blue-900/20 dark:border-blue-800 dark:text-blue-200',
      secondary:
        'bg-gray-50 border-gray-200 text-gray-800 dark:bg-gray-900/20 dark:border-gray-700 dark:text-gray-200',
      outline:
        'border border-gray-300 bg-transparent text-gray-700 dark:border-gray-600 dark:text-gray-300',
      ghost: 'bg-transparent text-gray-700 dark:text-gray-300',
      danger:
        'bg-red-50 border-red-200 text-red-800 dark:bg-red-900/20 dark:border-red-800 dark:text-red-200',
    },
  };

  return variantMap[component]?.[variant] || '';
}

/**
 * Gets size classes for different component types
 */
function getSizeClasses(component: string, size: ComponentSize): string {
  const sizeMap: Record<string, Record<ComponentSize, string>> = {
    button: {
      xs: 'px-2 py-1 text-xs',
      sm: 'px-3 py-1.5 text-sm',
      md: 'px-4 py-2 text-sm',
      lg: 'px-6 py-3 text-base',
      xl: 'px-8 py-4 text-lg',
    },
    avatar: {
      xs: 'w-6 h-6 text-xs',
      sm: 'w-8 h-8 text-sm',
      md: 'w-10 h-10 text-base',
      lg: 'w-12 h-12 text-lg',
      xl: 'w-16 h-16 text-xl',
    },
    input: {
      xs: 'px-2 py-1 text-xs',
      sm: 'px-3 py-1.5 text-sm',
      md: 'px-3 py-2 text-sm',
      lg: 'px-4 py-3 text-base',
      xl: 'px-5 py-4 text-lg',
    },
  };

  return sizeMap[component]?.[size] || '';
}

/**
 * Gets state classes for different component states
 */
function getStateClasses(component: string, state: ComponentState): string {
  const stateMap: Record<string, Record<ComponentState, string>> = {
    button: {
      default: '',
      hover: '',
      active: 'scale-95',
      disabled: 'opacity-50 cursor-not-allowed pointer-events-none',
      loading: 'opacity-75 cursor-wait',
    },
    input: {
      default: '',
      hover: '',
      active: '',
      disabled: 'opacity-50 cursor-not-allowed bg-gray-100 dark:bg-gray-800',
      loading: 'opacity-75',
    },
  };

  return stateMap[component]?.[state] || '';
}

/**
 * Creates focus ring classes for accessibility
 */
export function createFocusRing(variant: ComponentVariant = 'primary'): string {
  const focusRingMap: Record<ComponentVariant, string> = {
    primary:
      'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-900',
    secondary:
      'focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 dark:focus:ring-offset-gray-900',
    outline:
      'focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 dark:focus:ring-offset-gray-900',
    ghost:
      'focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 dark:focus:ring-offset-gray-900',
    danger:
      'focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 dark:focus:ring-offset-gray-900',
  };

  return focusRingMap[variant];
}

/**
 * Creates transition classes for smooth animations
 */
export function createTransition(properties: string[] = ['all']): string {
  return `transition-${properties.includes('all') ? 'all' : 'colors'} duration-200 ease-in-out`;
}

/**
 * Validates and normalizes component props
 */
export function normalizeProps<T extends Record<string, any>>(
  props: T,
  defaults: Partial<T>
): T {
  return { ...defaults, ...props };
}

/**
 * Creates accessible button props
 */
export function createAccessibleButtonProps(
  disabled?: boolean,
  loading?: boolean,
  ariaLabel?: string
) {
  return {
    'aria-disabled': disabled || loading,
    'aria-label': ariaLabel,
    tabIndex: disabled ? -1 : 0,
    role: 'button',
  };
}

/**
 * Creates accessible input props
 */
export function createAccessibleInputProps(
  id: string,
  required?: boolean,
  invalid?: boolean,
  describedBy?: string
) {
  return {
    id,
    'aria-required': required,
    'aria-invalid': invalid,
    'aria-describedby': describedBy,
  };
}
