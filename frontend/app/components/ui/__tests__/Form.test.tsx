import React, { useState } from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { axe, toHaveNoViolations } from 'jest-axe';
import {
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
} from '../Form';

expect.extend(toHaveNoViolations);

// Test component for form validation
const TestForm: React.FC = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: '',
    category: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Simple validation
    const newErrors: Record<string, string> = {};
    if (!formData.name.trim()) newErrors.name = 'Name is required';
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!formData.email.includes('@')) {
      newErrors.email = 'Invalid email format';
    }

    setErrors(newErrors);
    setTouched({ name: true, email: true, message: true, category: true });

    setTimeout(() => {
      setIsSubmitting(false);
    }, 1000);
  };

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (touched[field] && errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleBlur = (field: string) => {
    setTouched(prev => ({ ...prev, [field]: true }));
  };

  return (
    <Form
      onSubmit={handleSubmit}
      errors={errors}
      touched={touched}
      isSubmitting={isSubmitting}
      data-testid="test-form"
    >
      <FormField name="name" required>
        <FormLabel htmlFor="name">Name</FormLabel>
        <FormInput
          id="name"
          value={formData.name}
          onChange={e => handleChange('name', e.target.value)}
          onBlur={() => handleBlur('name')}
          placeholder="Enter your name"
        />
        <FormError name="name" />
      </FormField>

      <FormField name="email" required>
        <FormLabel htmlFor="email">Email</FormLabel>
        <FormInput
          id="email"
          type="email"
          value={formData.email}
          onChange={e => handleChange('email', e.target.value)}
          onBlur={() => handleBlur('email')}
          placeholder="Enter your email"
        />
        <FormError name="email" />
        <FormHelper name="email">We&apos;ll never share your email</FormHelper>
      </FormField>

      <FormField name="category">
        <FormLabel htmlFor="category">Category</FormLabel>
        <FormSelect
          id="category"
          value={formData.category}
          onChange={e => handleChange('category', e.target.value)}
          placeholder="Select a category"
        >
          <option value="general">General</option>
          <option value="support">Support</option>
          <option value="feedback">Feedback</option>
        </FormSelect>
      </FormField>

      <FormField name="message">
        <FormLabel htmlFor="message">Message</FormLabel>
        <FormTextarea
          id="message"
          value={formData.message}
          onChange={e => handleChange('message', e.target.value)}
          onBlur={() => handleBlur('message')}
          placeholder="Enter your message"
          rows={4}
        />
        <FormHelper name="message">Optional message</FormHelper>
      </FormField>

      <FormActions>
        <button type="button">Cancel</button>
        <button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Submitting...' : 'Submit'}
        </button>
      </FormActions>
    </Form>
  );
};

// Component to test form context
const FormContextTest: React.FC = () => {
  const { errors, touched, isSubmitting } = useFormContext();

  return (
    <div data-testid="context-info">
      <span data-testid="errors-count">{Object.keys(errors).length}</span>
      <span data-testid="touched-count">{Object.keys(touched).length}</span>
      <span data-testid="is-submitting">{isSubmitting.toString()}</span>
    </div>
  );
};

describe('Form Components', () => {
  describe('Form', () => {
    it('renders children correctly', () => {
      render(
        <Form data-testid="form">
          <div>Form content</div>
        </Form>
      );

      expect(screen.getByTestId('form')).toBeInTheDocument();
      expect(screen.getByText('Form content')).toBeInTheDocument();
    });

    it('applies layout classes correctly', () => {
      const { rerender } = render(
        <Form data-testid="form" layout="vertical" spacing="sm">
          <div>Content</div>
        </Form>
      );

      expect(screen.getByTestId('form')).toHaveClass('space-y-3');

      rerender(
        <Form data-testid="form" layout="vertical" spacing="lg">
          <div>Content</div>
        </Form>
      );

      expect(screen.getByTestId('form')).toHaveClass('space-y-6');
    });

    it('provides form context to children', () => {
      const errors = { name: 'Required' };
      const touched = { name: true };

      render(
        <Form errors={errors} touched={touched} isSubmitting={true}>
          <FormContextTest />
        </Form>
      );

      expect(screen.getByTestId('errors-count')).toHaveTextContent('1');
      expect(screen.getByTestId('touched-count')).toHaveTextContent('1');
      expect(screen.getByTestId('is-submitting')).toHaveTextContent('true');
    });

    it('handles form submission', () => {
      const handleSubmit = jest.fn(e => e.preventDefault());
      render(
        <Form onSubmit={handleSubmit} data-testid="form">
          <button type="submit">Submit</button>
        </Form>
      );

      fireEvent.click(screen.getByRole('button', { name: 'Submit' }));
      expect(handleSubmit).toHaveBeenCalledTimes(1);
    });
  });

  describe('FormField', () => {
    it('passes props to children correctly', () => {
      render(
        <Form errors={{ test: 'Error message' }} touched={{ test: true }}>
          <FormField name="test" required>
            <FormLabel data-testid="label">Label</FormLabel>
            <FormInput data-testid="input" />
            <FormError data-testid="error" />
          </FormField>
        </Form>
      );

      expect(screen.getByTestId('label')).toHaveTextContent('*'); // Required indicator
      expect(screen.getByTestId('input')).toHaveAttribute(
        'aria-invalid',
        'true'
      );
      expect(screen.getByTestId('error')).toHaveTextContent('Error message');
    });

    it('applies layout classes correctly', () => {
      const { rerender } = render(
        <FormField name="test" data-testid="field" layout="vertical">
          <div>Content</div>
        </FormField>
      );

      expect(screen.getByTestId('field')).toHaveClass('space-y-2');

      rerender(
        <FormField name="test" data-testid="field" layout="horizontal">
          <div>Content</div>
        </FormField>
      );

      expect(screen.getByTestId('field')).toHaveClass(
        'flex',
        'items-start',
        'space-x-4'
      );
    });
  });

  describe('FormLabel', () => {
    it('renders required indicator when required', () => {
      render(<FormLabel required>Label text</FormLabel>);

      expect(screen.getByText('*')).toBeInTheDocument();
      expect(screen.getByText('*')).toHaveAttribute('aria-label', 'required');
    });

    it('applies error styles when hasError is true', () => {
      const { rerender } = render(
        <FormLabel data-testid="label">Label</FormLabel>
      );

      expect(screen.getByTestId('label')).toHaveClass('text-gray-700');

      rerender(
        <FormLabel data-testid="label" hasError>
          Label
        </FormLabel>
      );

      expect(screen.getByTestId('label')).toHaveClass('text-red-700');
    });
  });

  describe('FormInput', () => {
    it('applies error styles when hasError is true', () => {
      const { rerender } = render(
        <FormInput data-testid="input" name="test" />
      );

      expect(screen.getByTestId('input')).toHaveClass('border-gray-300');

      rerender(<FormInput data-testid="input" name="test" hasError />);

      expect(screen.getByTestId('input')).toHaveClass('border-red-300');
      expect(screen.getByTestId('input')).toHaveAttribute(
        'aria-invalid',
        'true'
      );
    });

    it('applies size classes correctly', () => {
      const { rerender } = render(<FormInput data-testid="input" size="sm" />);

      expect(screen.getByTestId('input')).toHaveClass(
        'px-3',
        'py-1.5',
        'text-sm'
      );

      rerender(<FormInput data-testid="input" size="lg" />);

      expect(screen.getByTestId('input')).toHaveClass(
        'px-4',
        'py-3',
        'text-base'
      );
    });

    it('generates unique IDs correctly', () => {
      render(
        <>
          <FormInput name="input1" />
          <FormInput name="input2" />
        </>
      );

      const inputs = screen.getAllByRole('textbox');
      expect(inputs[0]).toHaveAttribute('id');
      expect(inputs[1]).toHaveAttribute('id');
      expect(inputs[0].getAttribute('id')).not.toBe(
        inputs[1].getAttribute('id')
      );
    });
  });

  describe('FormTextarea', () => {
    it('renders as textarea element', () => {
      render(<FormTextarea name="message" placeholder="Enter message" />);

      expect(screen.getByRole('textbox')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('Enter message')).toBeInTheDocument();
    });

    it('applies error styles when hasError is true', () => {
      render(<FormTextarea data-testid="textarea" hasError />);

      expect(screen.getByTestId('textarea')).toHaveClass('border-red-300');
    });
  });

  describe('FormSelect', () => {
    it('renders placeholder option when provided', () => {
      render(
        <FormSelect placeholder="Choose option" defaultValue="">
          <option value="1">Option 1</option>
          <option value="2">Option 2</option>
        </FormSelect>
      );

      expect(screen.getByText('Choose option')).toBeInTheDocument();
      const select = screen.getByRole('combobox');
      expect(select.value).toBe('');
    });

    it('applies error styles when hasError is true', () => {
      render(
        <FormSelect data-testid="select" hasError>
          <option value="1">Option 1</option>
        </FormSelect>
      );

      expect(screen.getByTestId('select')).toHaveClass('border-red-300');
    });
  });

  describe('FormError', () => {
    it('renders error message from context', () => {
      render(
        <Form errors={{ test: 'Field is required' }} touched={{ test: true }}>
          <FormError name="test" />
        </Form>
      );

      expect(screen.getByText('Field is required')).toBeInTheDocument();
      expect(screen.getByRole('alert')).toBeInTheDocument();
    });

    it('renders custom error message', () => {
      render(<FormError error="Custom error message" />);

      expect(screen.getByText('Custom error message')).toBeInTheDocument();
    });

    it('does not render when no error', () => {
      render(
        <Form errors={{}} touched={{}}>
          <FormError name="test" />
        </Form>
      );

      expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    });
  });

  describe('FormHelper', () => {
    it('renders helper text', () => {
      render(<FormHelper>This is helper text</FormHelper>);

      expect(screen.getByText('This is helper text')).toBeInTheDocument();
    });
  });

  describe('FormActions', () => {
    it('applies alignment classes correctly', () => {
      const { rerender } = render(
        <FormActions data-testid="actions" align="left">
          <button>Action</button>
        </FormActions>
      );

      expect(screen.getByTestId('actions')).toHaveClass('justify-start');

      rerender(
        <FormActions data-testid="actions" align="between">
          <button>Action</button>
        </FormActions>
      );

      expect(screen.getByTestId('actions')).toHaveClass('justify-between');
    });

    it('reverses button order when reverse is true', () => {
      render(
        <FormActions data-testid="actions" reverse>
          <button>Action</button>
        </FormActions>
      );

      expect(screen.getByTestId('actions')).toHaveClass('flex-row-reverse');
    });
  });

  describe('Form Integration', () => {
    it('handles complete form workflow', async () => {
      render(<TestForm />);

      // Initially no errors
      expect(screen.queryByRole('alert')).not.toBeInTheDocument();

      // Fill in form fields
      fireEvent.change(screen.getByLabelText(/Name/), {
        target: { value: 'John Doe' },
      });

      fireEvent.change(screen.getByLabelText(/Email/), {
        target: { value: 'john@example.com' },
      });

      fireEvent.change(screen.getByLabelText(/Message/), {
        target: { value: 'Test message' },
      });

      // Submit form
      fireEvent.click(screen.getByRole('button', { name: /Submit/ }));

      // Should show submitting state
      await waitFor(() => {
        expect(screen.getByText('Submitting...')).toBeInTheDocument();
      });

      // Wait for submission to complete
      await waitFor(() => {
        expect(screen.getByText('Submit')).toBeInTheDocument();
      });
    });

    it('should have no accessibility violations', async () => {
      const { container } = render(<TestForm />);

      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });
  });
});
