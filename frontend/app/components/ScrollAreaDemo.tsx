'use client';

import React, { useState } from 'react';
import { ScrollArea } from './ui/ScrollArea';
import { Button } from './ui/Button';
import { Toggle } from './ui/Toggle';

export function ScrollAreaDemo() {
  const [variant, setVariant] = useState<
    'default' | 'brand' | 'thin' | 'thick' | 'none'
  >('default');
  const [smooth, setSmooth] = useState(true);
  const [touchOptimized, setTouchOptimized] = useState(true);

  const generateContent = (lines: number) => {
    return Array.from({ length: lines }, (_, i) => (
      <div
        key={i}
        className="py-2 px-4 border-b border-gray-200 dark:border-gray-700"
      >
        <h3 className="font-semibold text-gray-900 dark:text-gray-100">
          Item {i + 1}
        </h3>
        <p className="text-gray-600 dark:text-gray-400">
          This is some sample content for item {i + 1}. It demonstrates how the
          scrollbar appears and behaves with different styling options.
        </p>
      </div>
    ));
  };

  return (
    <div className="space-y-6 p-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">
          ScrollArea Component Demo
        </h2>
        <p className="text-gray-600 dark:text-gray-400 mb-6">
          Demonstrates custom scrollbar styling with different variants and
          options.
        </p>
      </div>

      {/* Controls */}
      <div className="space-y-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
        <h3 className="font-semibold text-gray-900 dark:text-gray-100">
          Controls
        </h3>

        <div className="flex flex-wrap gap-2">
          <Button
            variant={variant === 'default' ? 'primary' : 'outline'}
            size="sm"
            onClick={() => setVariant('default')}
          >
            Default
          </Button>
          <Button
            variant={variant === 'brand' ? 'primary' : 'outline'}
            size="sm"
            onClick={() => setVariant('brand')}
          >
            Brand
          </Button>
          <Button
            variant={variant === 'thin' ? 'primary' : 'outline'}
            size="sm"
            onClick={() => setVariant('thin')}
          >
            Thin
          </Button>
          <Button
            variant={variant === 'thick' ? 'primary' : 'outline'}
            size="sm"
            onClick={() => setVariant('thick')}
          >
            Thick
          </Button>
          <Button
            variant={variant === 'none' ? 'primary' : 'outline'}
            size="sm"
            onClick={() => setVariant('none')}
          >
            Hidden
          </Button>
        </div>

        <div className="flex gap-4">
          <div className="flex items-center gap-2">
            <Toggle
              checked={smooth}
              onChange={setSmooth}
              label="Smooth Scrolling"
            />
          </div>

          <div className="flex items-center gap-2">
            <Toggle
              checked={touchOptimized}
              onChange={setTouchOptimized}
              label="Touch Optimized"
            />
          </div>
        </div>
      </div>

      {/* Demo Areas */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Vertical Scrolling */}
        <div className="space-y-2">
          <h3 className="font-semibold text-gray-900 dark:text-gray-100">
            Vertical Scrolling
          </h3>
          <ScrollArea
            variant={variant}
            smooth={smooth}
            touchOptimized={touchOptimized}
            maxHeight={300}
            className="border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900"
          >
            {generateContent(20)}
          </ScrollArea>
        </div>

        {/* Horizontal Scrolling */}
        <div className="space-y-2">
          <h3 className="font-semibold text-gray-900 dark:text-gray-100">
            Horizontal Scrolling
          </h3>
          <ScrollArea
            variant={variant}
            smooth={smooth}
            touchOptimized={touchOptimized}
            maxHeight={200}
            className="border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900"
          >
            <div className="flex gap-4 p-4" style={{ width: '800px' }}>
              {Array.from({ length: 10 }, (_, i) => (
                <div
                  key={i}
                  className="flex-shrink-0 w-32 h-24 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-lg flex items-center justify-center text-white font-semibold"
                >
                  Card {i + 1}
                </div>
              ))}
            </div>
          </ScrollArea>
        </div>

        {/* Both Directions */}
        <div className="space-y-2 md:col-span-2">
          <h3 className="font-semibold text-gray-900 dark:text-gray-100">
            Both Directions
          </h3>
          <ScrollArea
            variant={variant}
            smooth={smooth}
            touchOptimized={touchOptimized}
            maxHeight={250}
            className="border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900"
          >
            <div className="p-4" style={{ width: '1200px' }}>
              <div className="grid grid-cols-6 gap-4">
                {Array.from({ length: 30 }, (_, i) => (
                  <div
                    key={i}
                    className="h-20 bg-gradient-to-br from-accent-500 to-warning-500 rounded-lg flex items-center justify-center text-white font-semibold text-sm"
                  >
                    Item {i + 1}
                  </div>
                ))}
              </div>
            </div>
          </ScrollArea>
        </div>
      </div>

      {/* Code Example */}
      <div className="space-y-2">
        <h3 className="font-semibold text-gray-900 dark:text-gray-100">
          Current Configuration
        </h3>
        <ScrollArea
          variant="thin"
          maxHeight={150}
          className="bg-gray-900 dark:bg-gray-800 rounded-lg p-4 text-sm font-mono"
        >
          <pre className="text-green-400">
            {`<ScrollArea
  variant="${variant}"
  smooth={${smooth}}
  touchOptimized={${touchOptimized}}
  maxHeight={300}
  className="border rounded-lg"
>
  {/* Your scrollable content */}
</ScrollArea>`}
          </pre>
        </ScrollArea>
      </div>
    </div>
  );
}
