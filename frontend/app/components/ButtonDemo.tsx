'use client';

import React, { useState } from 'react';
import { Button } from './ui/Button';
import { HeartIcon, ArrowDownIcon } from '@heroicons/react/24/outline';

export function ButtonDemo() {
  const [loading, setLoading] = useState(false);
  const [clickCount, setClickCount] = useState(0);

  const handleLoadingDemo = () => {
    setLoading(true);
    setTimeout(() => setLoading(false), 2000);
  };

  const handleClick = () => {
    setClickCount(prev => prev + 1);
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
          Flat Minimalist Button Component Demo
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Borderless, flat design button component with typography-first
          hierarchy and subtle interactions
        </p>
      </div>

      {/* Variants Section */}
      <section className="space-y-4">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
          Button Variants
        </h2>
        <div className="flex flex-wrap gap-4">
          <Button variant="primary">Primary</Button>
          <Button variant="secondary">Secondary</Button>
          <Button variant="outline">Outline</Button>
          <Button variant="ghost">Ghost</Button>
          <Button variant="danger">Danger</Button>
        </div>
      </section>

      {/* Sizes Section */}
      <section className="space-y-4">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
          Button Sizes
        </h2>
        <div className="flex flex-wrap items-center gap-4">
          <Button size="sm">Small</Button>
          <Button size="md">Medium</Button>
          <Button size="lg">Large</Button>
        </div>
      </section>

      {/* States Section */}
      <section className="space-y-4">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
          Button States
        </h2>
        <div className="flex flex-wrap gap-4">
          <Button>Normal</Button>
          <Button disabled>Disabled</Button>
          <Button loading={loading} onClick={handleLoadingDemo}>
            {loading ? 'Loading...' : 'Click to Load'}
          </Button>
        </div>
      </section>

      {/* Icons Section */}
      <section className="space-y-4">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
          Buttons with Icons
        </h2>
        <div className="flex flex-wrap gap-4">
          <Button leftIcon={<HeartIcon className="w-4 h-4" />}>Like</Button>
          <Button rightIcon={<ArrowDownIcon className="w-4 h-4" />}>
            Download
          </Button>
          <Button
            leftIcon={<HeartIcon className="w-4 h-4" />}
            rightIcon={<ArrowDownIcon className="w-4 h-4" />}
          >
            Both Icons
          </Button>
        </div>
      </section>

      {/* Full Width Section */}
      <section className="space-y-4">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
          Full Width Button
        </h2>
        <Button fullWidth variant="primary">
          Full Width Button
        </Button>
      </section>

      {/* Interactive Demo */}
      <section className="space-y-4">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
          Interactive Demo
        </h2>
        <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
            Click count: {clickCount}
          </p>
          <div className="flex gap-4">
            <Button onClick={handleClick}>Click Me</Button>
            <Button variant="outline" onClick={() => setClickCount(0)}>
              Reset
            </Button>
          </div>
        </div>
      </section>

      {/* Accessibility Note */}
      <section className="space-y-4">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
          Accessibility Features
        </h2>
        <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
          <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
            <li>• Full keyboard navigation support (Tab, Enter, Space)</li>
            <li>• Proper ARIA attributes for screen readers</li>
            <li>• Focus rings for keyboard navigation</li>
            <li>• Disabled and loading state handling</li>
            <li>• High contrast support in both light and dark themes</li>
          </ul>
        </div>
      </section>
    </div>
  );
}
