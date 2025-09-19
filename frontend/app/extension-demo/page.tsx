'use client';

import React from 'react';
import { TrendingFeed } from '../components/TrendingFeed';
import { QueryProvider } from '../providers/QueryProvider';

export default function ExtensionDemoPage() {
  const handleRepositoryClick = (repository: any) => {
    console.log('Repository clicked:', repository);
    if (repository.action === 'view_more') {
      console.log('View more clicked - would open dashboard');
    } else {
      console.log(
        'Repository clicked - would open in new tab:',
        repository.url
      );
    }
  };

  return (
    <QueryProvider>
      <div className="min-h-screen bg-neutral-50 dark:bg-neutral-900 p-8">
        <div className="max-w-6xl mx-auto space-y-12">
          <header className="text-center">
            <h1 className="text-3xl font-bold text-neutral-900 dark:text-white mb-4">
              Extension Mode Demo
            </h1>
            <p className="text-lg text-neutral-600 dark:text-neutral-300">
              Testing the TrendingFeed component in different extension modes
            </p>
          </header>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Web Mode */}
            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-neutral-900 dark:text-white">
                Web Mode (Default)
              </h2>
              <div className="bg-white dark:bg-neutral-800 rounded-lg p-6 shadow-sm">
                <TrendingFeed
                  extensionMode="web"
                  className="max-h-96 overflow-y-auto"
                />
              </div>
            </div>

            {/* Popup Mode */}
            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-neutral-900 dark:text-white">
                Popup Mode (Compact)
              </h2>
              <div className="bg-white dark:bg-neutral-800 rounded-lg shadow-sm w-96 h-[600px] overflow-hidden">
                <TrendingFeed
                  extensionMode="popup"
                  maxItems={5}
                  onRepositoryClick={handleRepositoryClick}
                />
              </div>
            </div>
          </div>

          {/* New Tab Mode */}
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-neutral-900 dark:text-white">
              New Tab Mode
            </h2>
            <div className="bg-white dark:bg-neutral-800 rounded-lg p-6 shadow-sm">
              <TrendingFeed
                extensionMode="newtab"
                onRepositoryClick={handleRepositoryClick}
                className="max-h-96 overflow-y-auto"
              />
            </div>
          </div>
        </div>
      </div>
    </QueryProvider>
  );
}
