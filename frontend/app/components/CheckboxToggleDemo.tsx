'use client';

import React, { useState } from 'react';
import { Checkbox, Toggle } from './ui';

/**
 * Demo component showcasing Checkbox and Toggle components
 */
export const CheckboxToggleDemo: React.FC = () => {
  const [checkboxStates, setCheckboxStates] = useState({
    basic: false,
    indeterminate: false,
    withError: false,
    disabled: true,
  });

  const [toggleStates, setToggleStates] = useState({
    basic: false,
    success: true,
    warning: false,
    error: false,
    disabled: true,
  });

  const handleCheckboxChange = (key: string) => (checked: boolean) => {
    setCheckboxStates(prev => ({ ...prev, [key]: checked }));
  };

  const handleToggleChange = (key: string) => (checked: boolean) => {
    setToggleStates(prev => ({ ...prev, [key]: checked }));
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-12">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-6">
          Checkbox Components
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Basic Checkboxes */}
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200">
              Basic Checkboxes
            </h3>

            <div className="space-y-4">
              <Checkbox
                label="Basic checkbox"
                checked={checkboxStates.basic}
                onChange={handleCheckboxChange('basic')}
                helperText="This is a basic checkbox"
              />

              <Checkbox
                label="Indeterminate state"
                indeterminate={!checkboxStates.indeterminate}
                checked={checkboxStates.indeterminate}
                onChange={handleCheckboxChange('indeterminate')}
                helperText="Click to see indeterminate state"
              />

              <Checkbox
                label="Required field"
                required
                checked={checkboxStates.withError}
                onChange={handleCheckboxChange('withError')}
                error={
                  !checkboxStates.withError
                    ? 'This field is required'
                    : undefined
                }
              />

              <Checkbox
                label="Disabled checkbox"
                disabled
                checked={checkboxStates.disabled}
                onChange={handleCheckboxChange('disabled')}
                helperText="This checkbox is disabled"
              />
            </div>
          </div>

          {/* Checkbox Sizes */}
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200">
              Checkbox Sizes
            </h3>

            <div className="space-y-4">
              <Checkbox
                size="sm"
                label="Small checkbox"
                checked={true}
                helperText="Small size checkbox"
              />

              <Checkbox
                size="md"
                label="Medium checkbox (default)"
                checked={true}
                helperText="Medium size checkbox"
              />

              <Checkbox
                size="lg"
                label="Large checkbox"
                checked={true}
                helperText="Large size checkbox"
              />
            </div>
          </div>
        </div>
      </div>

      <div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-6">
          Toggle/Switch Components
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Basic Toggles */}
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200">
              Toggle Variants
            </h3>

            <div className="space-y-4">
              <Toggle
                label="Primary toggle"
                variant="primary"
                checked={toggleStates.basic}
                onChange={handleToggleChange('basic')}
                helperText="Primary color variant"
              />

              <Toggle
                label="Success toggle"
                variant="success"
                checked={toggleStates.success}
                onChange={handleToggleChange('success')}
                helperText="Success color variant"
              />

              <Toggle
                label="Warning toggle"
                variant="warning"
                checked={toggleStates.warning}
                onChange={handleToggleChange('warning')}
                helperText="Warning color variant"
              />

              <Toggle
                label="Error toggle"
                variant="error"
                checked={toggleStates.error}
                onChange={handleToggleChange('error')}
                error={
                  toggleStates.error
                    ? 'This setting causes an error'
                    : undefined
                }
              />

              <Toggle
                label="Disabled toggle"
                disabled
                checked={toggleStates.disabled}
                onChange={handleToggleChange('disabled')}
                helperText="This toggle is disabled"
              />
            </div>
          </div>

          {/* Toggle Sizes */}
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200">
              Toggle Sizes
            </h3>

            <div className="space-y-4">
              <Toggle
                size="sm"
                label="Small toggle"
                checked={true}
                helperText="Small size toggle"
              />

              <Toggle
                size="md"
                label="Medium toggle (default)"
                checked={true}
                helperText="Medium size toggle"
              />

              <Toggle
                size="lg"
                label="Large toggle"
                checked={true}
                helperText="Large size toggle"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Form Example */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-6">
          Form Integration Example
        </h2>

        <form
          className="space-y-4 p-6 border border-gray-200 dark:border-gray-700 rounded-lg"
          onSubmit={e => {
            e.preventDefault();
            const formData = new FormData(e.currentTarget);
            console.log('Form data:', Object.fromEntries(formData.entries()));
            alert('Check console for form data');
          }}
        >
          <Checkbox
            name="terms"
            label="I agree to the terms and conditions"
            required
            helperText="You must agree to continue"
          />

          <Checkbox
            name="newsletter"
            label="Subscribe to newsletter"
            helperText="Get weekly updates"
          />

          <Toggle
            name="notifications"
            value="enabled"
            label="Enable push notifications"
            helperText="Receive real-time updates"
          />

          <Toggle
            name="darkMode"
            value="on"
            label="Dark mode"
            variant="primary"
            helperText="Switch to dark theme"
          />

          <button
            type="submit"
            className="px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors"
          >
            Submit Form
          </button>
        </form>
      </div>
    </div>
  );
};

export default CheckboxToggleDemo;
