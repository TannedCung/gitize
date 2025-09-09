import { ReactNode, MouseEvent, KeyboardEvent } from 'react';

/**
 * Base props that all components should extend from
 * Provides common accessibility and testing attributes
 */
export interface BaseComponentProps {
  /** Additional CSS classes to apply to the component */
  className?: string;
  /** Child elements to render inside the component */
  children?: ReactNode;
  /** Test identifier for automated testing */
  'data-testid'?: string;
  /** Accessible label for screen readers */
  'aria-label'?: string;
}

/**
 * Props for interactive components that can be clicked or focused
 * Extends BaseComponentProps with interaction-specific properties
 */
export interface InteractiveComponentProps extends BaseComponentProps {
  /** Whether the component is disabled */
  disabled?: boolean;
  /** Whether the component is in a loading state */
  loading?: boolean;
  /** Click event handler */
  onClick?: (_event: MouseEvent<HTMLElement>) => void;
  /** Keyboard event handler */
  onKeyDown?: (_event: KeyboardEvent<HTMLElement>) => void;
}

/**
 * Common size variants used across components
 */
export type ComponentSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';

/**
 * Common color variants used across components
 */
export type ComponentVariant =
  | 'primary'
  | 'secondary'
  | 'outline'
  | 'ghost'
  | 'danger';

/**
 * Theme mode types
 */
export type ThemeMode = 'light' | 'dark';

/**
 * Component state types for styling
 */
export type ComponentState =
  | 'default'
  | 'hover'
  | 'active'
  | 'disabled'
  | 'loading';
