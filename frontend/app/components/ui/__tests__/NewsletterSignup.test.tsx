import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { NewsletterSignup } from '../NewsletterSignup';
import { newsletterApi } from '../../../lib/api';

// Mock the API
jest.mock('../../../lib/api', () => ({
  newsletterApi: {
    subscribe: jest.fn(),
  },
}));

const mockNewsletterApi = newsletterApi as jest.Mocked<typeof newsletterApi>;

describe('NewsletterSignup', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders the newsletter signup form', () => {
    render(<NewsletterSignup />);

    expect(
      screen.getByText('Stay Updated with Trending Repositories')
    ).toBeInTheDocument();
    expect(
      screen.getByPlaceholderText('Enter your email address')
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: 'Subscribe to Newsletter' })
    ).toBeInTheDocument();
  });

  it('shows validation error for empty email', async () => {
    render(<NewsletterSignup />);

    const form = screen
      .getByRole('button', { name: 'Subscribe to Newsletter' })
      .closest('form')!;
    fireEvent.submit(form);

    await waitFor(() => {
      expect(
        screen.getByText('Please enter your email address')
      ).toBeInTheDocument();
    });
  });

  it('shows validation error for invalid email format', async () => {
    render(<NewsletterSignup />);

    const emailInput = screen.getByPlaceholderText('Enter your email address');
    const form = screen
      .getByRole('button', { name: 'Subscribe to Newsletter' })
      .closest('form')!;

    fireEvent.change(emailInput, { target: { value: 'invalid-email' } });
    fireEvent.submit(form);

    await waitFor(() => {
      expect(
        screen.getByText('Please enter a valid email address')
      ).toBeInTheDocument();
    });
  });

  it('successfully subscribes with valid email', async () => {
    const mockResponse = {
      message: 'Successfully subscribed to newsletter',
      subscription_id: 123,
      unsubscribe_url: 'http://localhost/newsletter/unsubscribe/token123',
    };

    mockNewsletterApi.subscribe.mockResolvedValue(mockResponse);

    const onSuccess = jest.fn();
    render(<NewsletterSignup onSuccess={onSuccess} />);

    const emailInput = screen.getByPlaceholderText('Enter your email address');
    const form = screen
      .getByRole('button', { name: 'Subscribe to Newsletter' })
      .closest('form')!;

    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.submit(form);

    await waitFor(() => {
      expect(mockNewsletterApi.subscribe).toHaveBeenCalledWith(
        'test@example.com'
      );
      expect(screen.getByText('Successfully subscribed!')).toBeInTheDocument();
      expect(onSuccess).toHaveBeenCalledWith(mockResponse.message);
    });
  });

  it('handles already subscribed error', async () => {
    const mockError = {
      response: {
        data: {
          code: 'ALREADY_SUBSCRIBED',
          error: 'Email already subscribed',
        },
      },
    };

    mockNewsletterApi.subscribe.mockRejectedValue(mockError);

    const onError = jest.fn();
    render(<NewsletterSignup onError={onError} />);

    const emailInput = screen.getByPlaceholderText('Enter your email address');
    const form = screen
      .getByRole('button', { name: 'Subscribe to Newsletter' })
      .closest('form')!;

    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.submit(form);

    await waitFor(() => {
      expect(
        screen.getByText('This email is already subscribed to our newsletter.')
      ).toBeInTheDocument();
      expect(onError).toHaveBeenCalledWith(
        'This email is already subscribed to our newsletter.'
      );
    });
  });

  it('handles validation error from server', async () => {
    const mockError = {
      response: {
        data: {
          code: 'VALIDATION_ERROR',
          error: 'Invalid email format',
        },
      },
    };

    mockNewsletterApi.subscribe.mockRejectedValue(mockError);

    render(<NewsletterSignup />);

    const emailInput = screen.getByPlaceholderText('Enter your email address');
    const form = screen
      .getByRole('button', { name: 'Subscribe to Newsletter' })
      .closest('form')!;

    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.submit(form);

    await waitFor(() => {
      expect(screen.getByText('Invalid email format')).toBeInTheDocument();
    });
  });

  it('handles generic network error', async () => {
    const mockError = new Error('Network error');
    mockNewsletterApi.subscribe.mockRejectedValue(mockError);

    render(<NewsletterSignup />);

    const emailInput = screen.getByPlaceholderText('Enter your email address');
    const form = screen
      .getByRole('button', { name: 'Subscribe to Newsletter' })
      .closest('form')!;

    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.submit(form);

    await waitFor(() => {
      expect(
        screen.getByText('Failed to subscribe. Please try again.')
      ).toBeInTheDocument();
    });
  });

  it('shows loading state during submission', async () => {
    mockNewsletterApi.subscribe.mockImplementation(
      () => new Promise(resolve => setTimeout(resolve, 100))
    );

    render(<NewsletterSignup />);

    const emailInput = screen.getByPlaceholderText('Enter your email address');
    const form = screen
      .getByRole('button', { name: 'Subscribe to Newsletter' })
      .closest('form')!;
    const submitButton = screen.getByRole('button', {
      name: 'Subscribe to Newsletter',
    });

    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.submit(form);

    expect(screen.getByText('Subscribing...')).toBeInTheDocument();
    expect(submitButton).toBeDisabled();
  });

  it('allows subscribing another email after success', async () => {
    const mockResponse = {
      message: 'Successfully subscribed to newsletter',
      subscription_id: 123,
      unsubscribe_url: 'http://localhost/newsletter/unsubscribe/token123',
    };

    mockNewsletterApi.subscribe.mockResolvedValue(mockResponse);

    render(<NewsletterSignup />);

    const emailInput = screen.getByPlaceholderText('Enter your email address');
    const form = screen
      .getByRole('button', { name: 'Subscribe to Newsletter' })
      .closest('form')!;

    // First subscription
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.submit(form);

    await waitFor(() => {
      expect(screen.getByText('Successfully subscribed!')).toBeInTheDocument();
    });

    // Click "Subscribe another email"
    const subscribeAnotherButton = screen.getByText('Subscribe another email');
    fireEvent.click(subscribeAnotherButton);

    // Should show the form again
    expect(
      screen.getByPlaceholderText('Enter your email address')
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: 'Subscribe to Newsletter' })
    ).toBeInTheDocument();
  });

  it('validates email format correctly', () => {
    render(<NewsletterSignup />);

    const emailInput = screen.getByPlaceholderText('Enter your email address');
    const form = screen
      .getByRole('button', { name: 'Subscribe to Newsletter' })
      .closest('form')!;

    // Test valid emails
    const validEmails = [
      'test@example.com',
      'user.name+tag@domain.co.uk',
      'user123@test-domain.org',
    ];

    validEmails.forEach(email => {
      fireEvent.change(emailInput, { target: { value: email } });
      fireEvent.submit(form);
      // Should not show validation error for valid emails
      expect(
        screen.queryByText('Please enter a valid email address')
      ).not.toBeInTheDocument();
    });
  });

  it('applies custom className', () => {
    const { container } = render(<NewsletterSignup className="custom-class" />);
    expect(container.firstChild).toHaveClass('custom-class');
  });
});
