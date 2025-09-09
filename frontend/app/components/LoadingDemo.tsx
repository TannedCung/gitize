'use client';

import React, { useState, useEffect } from 'react';
import {
  Spinner,
  Progress,
  Skeleton,
  SkeletonText,
  SkeletonAvatar,
  SkeletonButton,
  RepositoryCardSkeleton,
} from './ui';

export function LoadingDemo() {
  const [progress, setProgress] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress(prev => (prev >= 100 ? 0 : prev + 10));
    }, 500);

    return () => clearInterval(interval);
  }, []);

  const handleStartLoading = () => {
    setIsLoading(true);
    setTimeout(() => setIsLoading(false), 3000);
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Loading Components Demo
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          AppFlowy UI System - Loading, Progress, and Skeleton Components
        </p>
      </div>

      {/* Spinner Components */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">
          Spinner Components
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-medium mb-4">Sizes</h3>
            <div className="flex items-center space-x-4">
              <Spinner size="xs" />
              <Spinner size="sm" />
              <Spinner size="md" />
              <Spinner size="lg" />
              <Spinner size="xl" />
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-medium mb-4">Colors</h3>
            <div className="grid grid-cols-3 gap-4">
              <Spinner color="primary" />
              <Spinner color="secondary" />
              <Spinner color="accent" />
              <Spinner color="success" />
              <Spinner color="warning" />
              <Spinner color="error" />
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-medium mb-4">With Text</h3>
            <div className="space-y-4">
              <Spinner text="Loading..." />
              <Spinner size="sm" text="Processing" color="success" />
              <Spinner size="lg" text="Uploading files" color="info" />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-medium mb-4">Animation Speeds</h3>
          <div className="flex items-center space-x-8">
            <div className="text-center">
              <Spinner speed="slow" />
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                Slow
              </p>
            </div>
            <div className="text-center">
              <Spinner speed="normal" />
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                Normal
              </p>
            </div>
            <div className="text-center">
              <Spinner speed="fast" />
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                Fast
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Progress Components */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">
          Progress Components
        </h2>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-medium mb-4">Determinate Progress</h3>
            <div className="space-y-4">
              <Progress value={progress} showValue label="Auto Progress" />
              <Progress
                value={75}
                showValue
                label="Upload Progress"
                color="success"
              />
              <Progress
                value={30}
                showValue
                label="Download Progress"
                color="info"
                size="lg"
              />
              <Progress
                value={90}
                showValue
                label="Processing"
                color="warning"
                size="sm"
              />
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-medium mb-4">Indeterminate Progress</h3>
            <div className="space-y-4">
              <Progress indeterminate label="Loading..." />
              <Progress indeterminate label="Syncing data" color="secondary" />
              <Progress
                indeterminate
                label="Processing request"
                color="accent"
                size="lg"
              />
              <Progress indeterminate color="success" size="sm" />
            </div>
          </div>
        </div>
      </section>

      {/* Skeleton Components */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">
          Skeleton Components
        </h2>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-medium mb-4">Basic Skeletons</h3>
            <div className="space-y-4">
              <Skeleton variant="text" />
              <Skeleton variant="rectangular" height="3rem" />
              <Skeleton variant="circular" width="3rem" height="3rem" />
              <SkeletonText lines={3} />
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-medium mb-4">Specialized Skeletons</h3>
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <SkeletonAvatar size="md" />
                <div className="flex-1">
                  <SkeletonText lines={2} />
                </div>
              </div>
              <div className="flex space-x-3">
                <SkeletonButton size="sm" />
                <SkeletonButton size="md" />
                <SkeletonButton size="lg" />
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-medium mb-4">Repository Card Skeleton</h3>
          <RepositoryCardSkeleton />
        </div>
      </section>

      {/* Interactive Demo */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">
          Interactive Demo
        </h2>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium">Loading State Simulation</h3>
            <button
              onClick={handleStartLoading}
              disabled={isLoading}
              className="px-4 py-2 bg-primary-500 text-white rounded-md hover:bg-primary-600 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Loading...' : 'Start Loading'}
            </button>
          </div>

          {isLoading ? (
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <Spinner size="sm" color="primary" />
                <span className="text-gray-600 dark:text-gray-400">
                  Fetching data...
                </span>
              </div>
              <RepositoryCardSkeleton />
              <RepositoryCardSkeleton />
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              Click &quot;Start Loading&quot; to see the loading simulation
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
