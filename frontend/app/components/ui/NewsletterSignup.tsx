'use client';

import { useState } from 'react';
import { newsletterApi } from '../../lib/api';
import { BaseComponentProps } from './types';
import { cn } from './utils';
import { Button } from './Button';
import { TextField } from './TextField';
import { Alert } from './Alert';

interface NewsletterSignupProps extends BaseComponentProps {
  onSuccess?: (_message: string) => void;
  onError?: (_error: string) => void;
}

export function NewsletterSignup({
  className,
  onSuccess,
  onError,
  'data-testid': dataTestId,
  ...props
}: NewsletterSignupProps) {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<{
    type: 'success' | 'error';
    text: string;
  } | null>(null);
  const [isSubscribed, setIsSubscribed] = useState(false);

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return emailRegex.test(email);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email.trim()) {
      const errorMsg = 'Please enter your email address';
      setMessage({ type: 'error', text: errorMsg });
      onError?.(errorMsg);
      return;
    }

    if (!validateEmail(email)) {
      const errorMsg = 'Please enter a valid email address';
      setMessage({ type: 'error', text: errorMsg });
      onError?.(errorMsg);
      return;
    }

    setIsLoading(true);
    setMessage(null);

    try {
      const response = await newsletterApi.subscribe(email);
      const successMsg = response.message;
      setMessage({ type: 'success', text: successMsg });
      setIsSubscribed(true);
      setEmail('');
      onSuccess?.(successMsg);
    } catch (error: any) {
      let errorMsg = 'Failed to subscribe. Please try again.';

      if (error.response?.data?.code === 'ALREADY_SUBSCRIBED') {
        errorMsg = 'This email is already subscribed to our newsletter.';
      } else if (error.response?.data?.code === 'VALIDATION_ERROR') {
        errorMsg = error.response.data.error || 'Invalid email format.';
      } else if (error.response?.data?.error) {
        errorMsg = error.response.data.error;
      }

      setMessage({ type: 'error', text: errorMsg });
      onError?.(errorMsg);
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setMessage(null);
    setIsSubscribed(false);
    setEmail('');
  };

  if (isSubscribed && message?.type === 'success') {
    return (
      <Alert
        variant="success"
        title="Successfully subscribed!"
        className={className}
        data-testid={
          dataTestId ? `${dataTestId}-success` : 'newsletter-success'
        }
        {...props}
      >
        <div className="space-y-3">
          <p>{message.text}</p>
          <p className="text-sm">
            You&apos;ll receive our weekly digest with the top trending
            repositories.
          </p>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleReset}
            className="p-0 h-auto text-sm font-medium underline"
          >
            Subscribe another email
          </Button>
        </div>
      </Alert>
    );
  }

  return (
    <div
      className={cn(
        'bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700',
        'rounded-xl p-6 shadow-sm',
        className
      )}
      data-testid={dataTestId}
      {...props}
    >
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
          Stay Updated with Trending Repositories
        </h3>
        <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed">
          Get a weekly digest of the top 5 trending repositories delivered to
          your inbox.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <TextField
          type="email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          placeholder="Enter your email address"
          disabled={isLoading}
          required
          label="Email address"
          error={message?.type === 'error' ? message.text : undefined}
          data-testid="newsletter-email-input"
        />

        {message && message.type === 'success' && (
          <Alert variant="success" className="mb-4">
            {message.text}
          </Alert>
        )}

        <Button
          type="submit"
          disabled={isLoading}
          loading={isLoading}
          fullWidth
          size="lg"
          data-testid="newsletter-submit-button"
        >
          {isLoading ? 'Subscribing...' : 'Subscribe to Newsletter'}
        </Button>
      </form>

      <div className="mt-4 text-xs text-gray-500 dark:text-gray-400">
        <p>
          We respect your privacy. Unsubscribe at any time by clicking the link
          in our emails.
        </p>
      </div>
    </div>
  );
}
