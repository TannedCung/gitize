import { render, screen, waitFor } from '@testing-library/react';
import { UnsubscribePage } from '../UnsubscribePage';
import { newsletterApi } from '../../../lib/api';

// Mock the API
jest.mock('../../../lib/api', () => ({
  newsletterApi: {
    unsubscribe: jest.fn(),
  },
}));

const mockNewsletterApi = newsletterApi as jest.Mocked<typeof newsletterApi>;

describe('UnsubscribePage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('shows loading state initially', () => {
    mockNewsletterApi.unsubscribe.mockImplementation(
      () => new Promise(() => {})
    ); // Never resolves

    render(<UnsubscribePage token="test-token" />);

    expect(
      screen.getByText('Processing Unsubscribe Request')
    ).toBeInTheDocument();
    expect(
      screen.getByText(
        'Please wait while we process your unsubscribe request...'
      )
    ).toBeInTheDocument();
  });

  it('shows success state after successful unsubscribe', async () => {
    const mockResponse = {
      message: 'Successfully unsubscribed from newsletter',
      email: 'test@example.com',
    };

    mockNewsletterApi.unsubscribe.mockResolvedValue(mockResponse);

    render(<UnsubscribePage token="test-token" />);

    await waitFor(() => {
      expect(screen.getByText('Successfully Unsubscribed')).toBeInTheDocument();
      expect(
        screen.getByText('Successfully unsubscribed from newsletter')
      ).toBeInTheDocument();
      expect(screen.getByText('Email: test@example.com')).toBeInTheDocument();
    });

    expect(mockNewsletterApi.unsubscribe).toHaveBeenCalledWith('test-token');
  });

  it('shows error state for invalid token', async () => {
    const mockError = {
      response: {
        data: {
          code: 'INVALID_TOKEN',
          error: 'Invalid unsubscribe token',
        },
      },
    };

    mockNewsletterApi.unsubscribe.mockRejectedValue(mockError);

    render(<UnsubscribePage token="invalid-token" />);

    await waitFor(() => {
      expect(screen.getByText('Unsubscribe Failed')).toBeInTheDocument();
      expect(
        screen.getByText(
          'This unsubscribe link is invalid or has already been used.'
        )
      ).toBeInTheDocument();
    });
  });

  it('shows error state for not found subscription', async () => {
    const mockError = {
      response: {
        data: {
          code: 'NOT_FOUND',
          error: 'Subscription not found',
        },
      },
    };

    mockNewsletterApi.unsubscribe.mockRejectedValue(mockError);

    render(<UnsubscribePage token="test-token" />);

    await waitFor(() => {
      expect(screen.getByText('Unsubscribe Failed')).toBeInTheDocument();
      expect(
        screen.getByText('Subscription not found or already inactive.')
      ).toBeInTheDocument();
    });
  });

  it('shows generic error for network failures', async () => {
    const mockError = new Error('Network error');
    mockNewsletterApi.unsubscribe.mockRejectedValue(mockError);

    render(<UnsubscribePage token="test-token" />);

    await waitFor(() => {
      expect(screen.getByText('Unsubscribe Failed')).toBeInTheDocument();
      expect(
        screen.getByText(
          'Failed to unsubscribe. Please try again or contact support.'
        )
      ).toBeInTheDocument();
    });
  });

  it('shows error for empty token', async () => {
    render(<UnsubscribePage token="" />);

    await waitFor(() => {
      expect(screen.getByText('Unsubscribe Failed')).toBeInTheDocument();
      expect(
        screen.getByText('Invalid unsubscribe link. No token provided.')
      ).toBeInTheDocument();
    });

    expect(mockNewsletterApi.unsubscribe).not.toHaveBeenCalled();
  });

  it('renders navigation links in success state', async () => {
    const mockResponse = {
      message: 'Successfully unsubscribed from newsletter',
      email: 'test@example.com',
    };

    mockNewsletterApi.unsubscribe.mockResolvedValue(mockResponse);

    render(<UnsubscribePage token="test-token" />);

    await waitFor(() => {
      expect(screen.getByText('Successfully Unsubscribed')).toBeInTheDocument();
    });

    expect(screen.getByRole('link', { name: 'Back to Home' })).toHaveAttribute(
      'href',
      '/'
    );
    expect(screen.getByRole('link', { name: 'Resubscribe' })).toHaveAttribute(
      'href',
      '/newsletter'
    );
  });

  it('renders navigation links in error state', async () => {
    const mockError = new Error('Network error');
    mockNewsletterApi.unsubscribe.mockRejectedValue(mockError);

    render(<UnsubscribePage token="test-token" />);

    await waitFor(() => {
      expect(screen.getByText('Unsubscribe Failed')).toBeInTheDocument();
    });

    expect(screen.getByRole('link', { name: 'Back to Home' })).toHaveAttribute(
      'href',
      '/'
    );
    expect(
      screen.getByRole('button', { name: 'Try Again' })
    ).toBeInTheDocument();
  });

  it('handles server error with custom message', async () => {
    const mockError = {
      response: {
        data: {
          code: 'DATABASE_ERROR',
          error: 'Database connection failed',
        },
      },
    };

    mockNewsletterApi.unsubscribe.mockRejectedValue(mockError);

    render(<UnsubscribePage token="test-token" />);

    await waitFor(() => {
      expect(screen.getByText('Unsubscribe Failed')).toBeInTheDocument();
      expect(
        screen.getByText('Database connection failed')
      ).toBeInTheDocument();
    });
  });
});
