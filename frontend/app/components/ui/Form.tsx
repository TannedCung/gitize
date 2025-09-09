'use client';

import React, { forwardRef, createContext, useContext, useId } from 'react';
import { BaseComponentProps } from './types';
import { cn } from './utils';

// Form Context for sharing validation state
interface FormContextValue {
  errors: Record<string, string>;
  touched: Record<string, boolean>;
  isSubmitting: boolean;
}

const FormContext = createContext<FormContextValue>({
  errors: {},
  touched: {},
  isSubmitting: false,
});

export const useFormContext = () => useContext(FormContext);

// Form Root Component
export interface FormProps extends BaseComponentProps {
  /** Form submission handler */
  onSubmit?: (_e: React.FormEvent<HTMLFormElement>) => void;
  /** Validation errors object */
  errors?: Record<string, string>;
  /** Touched fields object */
  touched?: Record<string, boolean>;
  /** Whether the form is currently submitting */
  isSubmitting?: boolean;
  /** Form layout variant */
  layout?: 'vertical' | 'horizontal';
  /** Spacing between form fields */
  spacing?: 'sm' | 'md' | 'lg';
}

export const Form = forwardRef<HTMLFormElement, FormProps>(
  (
    {
      className,
      children,
      onSubmit,
      errors = {},
      touched = {},
      isSubmitting = false,
      layout = 'vertical',
      spacing = 'md',
      ...props
    },
    ref
  ) => {
    const spacingClasses = {
      sm: 'space-y-3',
      md: 'space-y-4',
      lg: 'space-y-6',
    };

    const layoutClasses = {
      vertical: spacingClasses[spacing],
      horizontal: 'space-y-4',
    };

    const contextValue: FormContextValue = {
      errors,
      touched,
      isSubmitting,
    };

    return (
      <FormContext.Provider value={contextValue}>
        <form
          ref={ref}
          className={cn(layoutClasses[layout], className)}
          onSubmit={onSubmit}
          noValidate
          {...props}
        >
          {children}
        </form>
      </FormContext.Provider>
    );
  }
);

Form.displayName = 'Form';

// Form Field Component
export interface FormFieldProps extends BaseComponentProps {
  /** Field name for validation */
  name: string;
  /** Whether the field is required */
  required?: boolean;
  /** Custom error message (overrides context errors) */
  error?: string;
  /** Layout for this specific field */
  layout?: 'vertical' | 'horizontal';
}

export const FormField = forwardRef<HTMLDivElement, FormFieldProps>(
  (
    {
      className,
      children,
      name,
      required = false,
      error,
      layout = 'vertical',
      ...props
    },
    ref
  ) => {
    const { errors, touched } = useFormContext();
    const fieldError = error || (touched[name] ? errors[name] : undefined);
    const hasError = Boolean(fieldError);

    const layoutClasses = {
      vertical: 'space-y-2',
      horizontal: 'flex items-start space-x-4',
    };

    return (
      <div
        ref={ref}
        className={cn(layoutClasses[layout], className)}
        {...props}
      >
        {React.Children.map(children, child => {
          if (React.isValidElement(child)) {
            // Only pass form-specific props to form components
            const isFormComponent = [
              FormLabel,
              FormInput,
              FormTextarea,
              FormSelect,
              FormError,
              FormHelper,
            ].includes(child.type as any);

            if (isFormComponent) {
              return React.cloneElement(child, {
                ...child.props,
                name,
                required,
                error: fieldError,
                hasError,
              });
            }

            // For non-form components, just return as-is
            return child;
          }
          return child;
        })}
      </div>
    );
  }
);

FormField.displayName = 'FormField';

// Form Label Component
export interface FormLabelProps extends BaseComponentProps {
  /** Associated input name/id */
  htmlFor?: string;
  /** Whether the field is required */
  required?: boolean;
  /** Whether the field has an error */
  hasError?: boolean;
}

export const FormLabel = forwardRef<HTMLLabelElement, FormLabelProps>(
  (
    {
      className,
      children,
      htmlFor,
      required = false,
      hasError = false,
      ...props
    },
    ref
  ) => {
    return (
      <label
        ref={ref}
        htmlFor={htmlFor}
        className={cn(
          'block text-sm font-medium',
          hasError
            ? 'text-red-700 dark:text-red-400'
            : 'text-gray-700 dark:text-gray-300',
          className
        )}
        {...props}
      >
        {children}
        {required && (
          <span className="ml-1 text-red-500" aria-label="required">
            *
          </span>
        )}
      </label>
    );
  }
);

FormLabel.displayName = 'FormLabel';

// Form Input Component
export interface FormInputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'> {
  /** Input name */
  name?: string;
  /** Whether the field has an error */
  hasError?: boolean;
  /** Input size variant */
  size?: 'sm' | 'md' | 'lg';
}

export const FormInput = forwardRef<HTMLInputElement, FormInputProps>(
  ({ className, name, hasError = false, size = 'md', ...props }, ref) => {
    const id = useId();
    const inputId = props.id || `${name}-${id}`;

    const sizeClasses = {
      sm: 'px-3 py-1.5 text-sm',
      md: 'px-3 py-2 text-sm',
      lg: 'px-4 py-3 text-base',
    };

    return (
      <input
        ref={ref}
        id={inputId}
        name={name}
        className={cn(
          'block w-full rounded-md border transition-colors duration-200',
          'placeholder-gray-400 dark:placeholder-gray-500',
          'focus:outline-none focus:ring-2 focus:ring-offset-2 dark:focus:ring-offset-gray-900',
          sizeClasses[size],
          hasError
            ? 'border-red-300 dark:border-red-600 bg-red-50 dark:bg-red-900/20 text-red-900 dark:text-red-100 focus:border-red-500 focus:ring-red-500'
            : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:border-blue-500 focus:ring-blue-500',
          'disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-gray-100 dark:disabled:bg-gray-700',
          className
        )}
        aria-invalid={hasError}
        aria-describedby={hasError ? `${inputId}-error` : undefined}
        {...props}
      />
    );
  }
);

FormInput.displayName = 'FormInput';

// Form Textarea Component
export interface FormTextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  /** Textarea name */
  name?: string;
  /** Whether the field has an error */
  hasError?: boolean;
  /** Textarea size variant */
  size?: 'sm' | 'md' | 'lg';
}

export const FormTextarea = forwardRef<HTMLTextAreaElement, FormTextareaProps>(
  ({ className, name, hasError = false, size = 'md', ...props }, ref) => {
    const id = useId();
    const textareaId = props.id || `${name}-${id}`;

    const sizeClasses = {
      sm: 'px-3 py-1.5 text-sm',
      md: 'px-3 py-2 text-sm',
      lg: 'px-4 py-3 text-base',
    };

    return (
      <textarea
        ref={ref}
        id={textareaId}
        name={name}
        className={cn(
          'block w-full rounded-md border transition-colors duration-200 resize-vertical',
          'placeholder-gray-400 dark:placeholder-gray-500',
          'focus:outline-none focus:ring-2 focus:ring-offset-2 dark:focus:ring-offset-gray-900',
          sizeClasses[size],
          hasError
            ? 'border-red-300 dark:border-red-600 bg-red-50 dark:bg-red-900/20 text-red-900 dark:text-red-100 focus:border-red-500 focus:ring-red-500'
            : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:border-blue-500 focus:ring-blue-500',
          'disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-gray-100 dark:disabled:bg-gray-700',
          className
        )}
        aria-invalid={hasError}
        aria-describedby={hasError ? `${textareaId}-error` : undefined}
        {...props}
      />
    );
  }
);

FormTextarea.displayName = 'FormTextarea';

// Form Select Component
export interface FormSelectProps
  extends Omit<React.SelectHTMLAttributes<HTMLSelectElement>, 'size'> {
  /** Select name */
  name?: string;
  /** Whether the field has an error */
  hasError?: boolean;
  /** Select size variant */
  size?: 'sm' | 'md' | 'lg';
  /** Placeholder option text */
  placeholder?: string;
}

export const FormSelect = forwardRef<HTMLSelectElement, FormSelectProps>(
  (
    {
      className,
      name,
      hasError = false,
      size = 'md',
      placeholder,
      children,
      ...props
    },
    ref
  ) => {
    const id = useId();
    const selectId = props.id || `${name}-${id}`;

    const sizeClasses = {
      sm: 'px-3 py-1.5 text-sm',
      md: 'px-3 py-2 text-sm',
      lg: 'px-4 py-3 text-base',
    };

    return (
      <select
        ref={ref}
        id={selectId}
        name={name}
        className={cn(
          'block w-full rounded-md border transition-colors duration-200',
          'focus:outline-none focus:ring-2 focus:ring-offset-2 dark:focus:ring-offset-gray-900',
          sizeClasses[size],
          hasError
            ? 'border-red-300 dark:border-red-600 bg-red-50 dark:bg-red-900/20 text-red-900 dark:text-red-100 focus:border-red-500 focus:ring-red-500'
            : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:border-blue-500 focus:ring-blue-500',
          'disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-gray-100 dark:disabled:bg-gray-700',
          className
        )}
        aria-invalid={hasError}
        aria-describedby={hasError ? `${selectId}-error` : undefined}
        {...props}
      >
        {placeholder && (
          <option value="" disabled>
            {placeholder}
          </option>
        )}
        {children}
      </select>
    );
  }
);

FormSelect.displayName = 'FormSelect';

// Form Error Message Component
export interface FormErrorProps extends BaseComponentProps {
  /** Field name to show error for */
  name?: string;
  /** Custom error message */
  error?: string;
}

export const FormError = forwardRef<HTMLParagraphElement, FormErrorProps>(
  ({ className, children, name, error, ...props }, ref) => {
    const { errors, touched } = useFormContext();
    const id = useId();
    const fieldError =
      error || (name && touched[name] ? errors[name] : undefined);
    const errorId = `${name}-${id}-error`;

    if (!fieldError && !children) return null;

    return (
      <p
        ref={ref}
        id={errorId}
        className={cn('text-sm text-red-600 dark:text-red-400', className)}
        role="alert"
        {...props}
      >
        {fieldError || children}
      </p>
    );
  }
);

FormError.displayName = 'FormError';

// Form Helper Text Component
export interface FormHelperProps extends BaseComponentProps {
  /** Field name for helper text */
  name?: string;
}

export const FormHelper = forwardRef<HTMLParagraphElement, FormHelperProps>(
  ({ className, children, name, ...props }, ref) => {
    const id = useId();
    const helperId = `${name}-${id}-helper`;

    return (
      <p
        ref={ref}
        id={helperId}
        className={cn('text-sm text-gray-600 dark:text-gray-400', className)}
        {...props}
      >
        {children}
      </p>
    );
  }
);

FormHelper.displayName = 'FormHelper';

// Form Actions Component (for submit/cancel buttons)
export interface FormActionsProps extends BaseComponentProps {
  /** Alignment of action buttons */
  align?: 'left' | 'center' | 'right' | 'between';
  /** Whether to reverse button order */
  reverse?: boolean;
}

export const FormActions = forwardRef<HTMLDivElement, FormActionsProps>(
  (
    { className, children, align = 'right', reverse = false, ...props },
    ref
  ) => {
    const alignClasses = {
      left: 'justify-start',
      center: 'justify-center',
      right: 'justify-end',
      between: 'justify-between',
    };

    return (
      <div
        ref={ref}
        className={cn(
          'flex items-center gap-3',
          alignClasses[align],
          reverse && 'flex-row-reverse',
          className
        )}
        {...props}
      >
        {children}
      </div>
    );
  }
);

FormActions.displayName = 'FormActions';
