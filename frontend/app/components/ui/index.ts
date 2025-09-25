// Core components (loaded immediately)
export * from './core';

// Application-specific components
export { RepositoryCard } from './RepositoryCard';
export { RepositorySlide } from './RepositorySlide';
export { LazyRepositoryCard } from './LazyRepositoryCard';
export { SearchBar } from './SearchBar';
export { CacheStatusIndicator } from './CacheStatusIndicator';
export { VerticalFeed, useFeedContext } from './VerticalFeed';

// Toast system (frequently used)
export { Toast, ToastContainer, useToast } from './Toast';
export { ToastProvider, useToastContext } from './ToastProvider';

// Form components (commonly used together)
export {
  Form,
  FormField,
  FormLabel,
  FormInput,
  FormTextarea,
  FormSelect,
  FormError,
  FormHelper,
  FormActions,
  useFormContext,
} from './Form';

// Lazy-loaded components (use dynamic imports)
// Note: Lazy components are not exported from main index to avoid SSR issues
// Import them directly from './lazy' when needed

// Application-specific types
export type { Repository } from './RepositoryCard';
export type { RepositorySlideProps } from './RepositorySlide';
export type { VerticalFeedProps } from './VerticalFeed';

// Toast types
export type { ToastProps, ToastConfig, ToastPosition } from './Toast';

// Form types
export type {
  FormProps,
  FormFieldProps,
  FormLabelProps,
  FormInputProps,
  FormTextareaProps,
  FormSelectProps,
  FormErrorProps,
  FormHelperProps,
  FormActionsProps,
} from './Form';

// Modal types (for lazy components)
export type {
  ModalProps,
  ModalHeaderProps,
  ModalBodyProps,
  ModalFooterProps,
  ModalTitleProps,
} from './Modal';

// Typography components for content-first hierarchy
export {
  Typography,
  H1,
  H2,
  H3,
  H4,
  H5,
  H6,
  Text,
  Lead,
  Muted,
  Code,
  Blockquote,
} from './Typography';

// Export base component infrastructure
export * from './types';
export * from './utils';
export * from './AccessibilityProvider';
