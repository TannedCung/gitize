// Core components (loaded immediately)
export * from './core';

// Application-specific components
export { RepositoryCard } from './RepositoryCard';
export { LazyRepositoryCard } from './LazyRepositoryCard';
export { SearchBar } from './SearchBar';

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

// Export base component infrastructure
export * from './types';
export * from './utils';
export * from './AccessibilityProvider';
