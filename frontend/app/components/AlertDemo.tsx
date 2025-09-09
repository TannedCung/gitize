'use client';

import React, { useState } from 'react';
import { Alert, AlertVariant } from './ui/Alert';
import { Button } from './ui/Button';
import { ToastProvider, useToastContext } from './ui/ToastProvider';

/**
 * Demo component for Alert functionality
 */
const AlertDemoContent: React.FC = () => {
  const [alerts, setAlerts] = useState<
    Array<{
      id: string;
      variant: AlertVariant;
      message: string;
      title?: string;
    }>
  >([]);

  const addAlert = (variant: AlertVariant, message: string, title?: string) => {
    const id = Math.random().toString(36).substr(2, 9);
    setAlerts(prev => [...prev, { id, variant, message, title }]);
  };

  const removeAlert = (id: string) => {
    setAlerts(prev => prev.filter(alert => alert.id !== id));
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-4">Alert Components</h2>

        <div className="flex flex-wrap gap-2 mb-6">
          <Button
            variant="primary"
            onClick={() =>
              addAlert('success', 'This is a success message!', 'Success')
            }
          >
            Add Success Alert
          </Button>
          <Button
            variant="secondary"
            onClick={() =>
              addAlert('warning', 'This is a warning message!', 'Warning')
            }
          >
            Add Warning Alert
          </Button>
          <Button
            variant="danger"
            onClick={() =>
              addAlert('error', 'This is an error message!', 'Error')
            }
          >
            Add Error Alert
          </Button>
          <Button
            variant="outline"
            onClick={() =>
              addAlert('info', 'This is an info message!', 'Information')
            }
          >
            Add Info Alert
          </Button>
        </div>

        <div className="space-y-4">
          {alerts.map(alert => (
            <Alert
              key={alert.id}
              variant={alert.variant}
              title={alert.title}
              dismissible
              onDismiss={() => removeAlert(alert.id)}
            >
              {alert.message}
            </Alert>
          ))}
        </div>
      </div>
    </div>
  );
};

/**
 * Demo component for Toast functionality
 */
const ToastDemoContent: React.FC = () => {
  const { success, error, warning, info, addToast } = useToastContext();

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-4">Toast Notifications</h2>

        <div className="flex flex-wrap gap-2 mb-6">
          <Button
            variant="primary"
            onClick={() => success('Success toast message!')}
          >
            Success Toast
          </Button>
          <Button
            variant="secondary"
            onClick={() => warning('Warning toast message!')}
          >
            Warning Toast
          </Button>
          <Button
            variant="danger"
            onClick={() => error('Error toast message!')}
          >
            Error Toast
          </Button>
          <Button variant="outline" onClick={() => info('Info toast message!')}>
            Info Toast
          </Button>
          <Button
            variant="ghost"
            onClick={() =>
              addToast({
                message: 'Custom toast with action',
                variant: 'info',
                title: 'Custom Toast',
                duration: 10000,
                action: {
                  label: 'Undo',
                  onClick: () => console.log('Undo clicked!'),
                },
              })
            }
          >
            Custom Toast
          </Button>
        </div>
      </div>
    </div>
  );
};

/**
 * Main Alert and Toast Demo Component
 */
export const AlertDemo: React.FC = () => {
  return (
    <ToastProvider position="top-right" maxToasts={5}>
      <div className="max-w-4xl mx-auto p-6 space-y-8">
        <AlertDemoContent />
        <ToastDemoContent />
      </div>
    </ToastProvider>
  );
};

export default AlertDemo;
