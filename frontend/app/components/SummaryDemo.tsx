'use client';

import React, { useState } from 'react';
import { RepositoryCard, Repository, SummaryState } from './ui/RepositoryCard';

// Mock repository data for demonstration
const mockRepository: Repository = {
  id: 1,
  github_id: 123456,
  name: 'awesome-project',
  full_name: 'user/awesome-project',
  description:
    'A really awesome project that does amazing things with modern web technologies and provides excellent developer experience.',
  stars: 1250,
  forks: 89,
  language: 'TypeScript',
  author: 'user',
  url: 'https://github.com/user/awesome-project',
  trending_date: '2025-01-03',
};

const mockRepositoryWithSummary: Repository = {
  ...mockRepository,
  id: 2,
  name: 'another-project',
  full_name: 'user/another-project',
  summary:
    'This is a comprehensive web development framework that simplifies the process of building modern applications. It provides built-in routing, state management, and component libraries, making it an excellent choice for developers who want to quickly prototype and deploy scalable web applications. The framework emphasizes developer experience with hot reloading, TypeScript support, and extensive documentation.',
};

const mockRepositoryWithLongSummary: Repository = {
  ...mockRepository,
  id: 3,
  name: 'complex-project',
  full_name: 'user/complex-project',
  summary:
    'This is an extremely comprehensive and detailed project that demonstrates advanced software engineering principles and patterns. It includes multiple microservices, advanced caching strategies, distributed computing capabilities, real-time data processing, machine learning integration, and sophisticated monitoring and observability tools. The architecture is designed to handle high-scale production workloads with automatic scaling, fault tolerance, and disaster recovery mechanisms. It also provides extensive APIs, comprehensive documentation, and a rich ecosystem of plugins and extensions that make it suitable for enterprise-grade applications.',
};

export function SummaryDemo() {
  const [summaryStates, setSummaryStates] = useState<
    Record<number, SummaryState>
  >({});

  const simulateLoading = (repositoryId: number) => {
    setSummaryStates(prev => ({
      ...prev,
      [repositoryId]: { isLoading: true },
    }));

    // Simulate API call
    setTimeout(() => {
      setSummaryStates(prev => ({
        ...prev,
        [repositoryId]: { isLoading: false },
      }));
    }, 3000);
  };

  const simulateError = (repositoryId: number) => {
    setSummaryStates(prev => ({
      ...prev,
      [repositoryId]: {
        isLoading: false,
        error:
          'Failed to generate summary. The AI service is currently unavailable.',
      },
    }));
  };

  const clearState = (repositoryId: number) => {
    setSummaryStates(prev => {
      const newState = { ...prev };
      delete newState[repositoryId];
      return newState;
    });
  };

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
          Summary States Demo
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          This demonstrates different states of AI summary generation
        </p>
      </div>

      <div className="space-y-6">
        {/* Repository without summary */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              No Summary Available
            </h3>
            <div className="space-x-2">
              <button
                onClick={() => simulateLoading(mockRepository.id)}
                className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
                disabled={summaryStates[mockRepository.id]?.isLoading}
              >
                Simulate Loading
              </button>
              <button
                onClick={() => simulateError(mockRepository.id)}
                className="px-3 py-1 text-sm bg-red-600 text-white rounded hover:bg-red-700"
              >
                Simulate Error
              </button>
              <button
                onClick={() => clearState(mockRepository.id)}
                className="px-3 py-1 text-sm bg-gray-600 text-white rounded hover:bg-gray-700"
              >
                Clear State
              </button>
            </div>
          </div>
          <RepositoryCard
            repository={mockRepository}
            summaryState={summaryStates[mockRepository.id]}
          />
        </div>

        {/* Repository with summary */}
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            With Summary
          </h3>
          <RepositoryCard repository={mockRepositoryWithSummary} />
        </div>

        {/* Repository with long summary (expand/collapse) */}
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            With Long Summary (Expand/Collapse)
          </h3>
          <RepositoryCard repository={mockRepositoryWithLongSummary} />
        </div>
      </div>
    </div>
  );
}
