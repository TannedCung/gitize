'use client';

import { useState } from 'react';
import { VerticalFeed } from '../components/ui/VerticalFeed';
import {
  useTrendingRepositories,
  useAllRepositories,
} from '../hooks/useRepositories';

export default function VerticalFeedDemo() {
  const [isStarted, setIsStarted] = useState(false);

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    error,
  } = useTrendingRepositories({
    enabled: isStarted,
    limit: 10,
  });

  const repositories = useAllRepositories({
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    error,
  } as any);

  const handleGetStarted = () => {
    setIsStarted(true);
  };

  if (!isStarted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 flex items-center justify-center p-4">
        <div className="text-center max-w-2xl mx-auto">
          <div className="mb-8">
            <h1 className="text-5xl font-bold text-white mb-4 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              GitHub Trending
            </h1>
            <p className="text-xl text-gray-300 leading-relaxed">
              Discover the most popular repositories trending on GitHub today.
              Stay up-to-date with the latest developments in the open source
              community.
            </p>
          </div>

          <div className="mb-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 border border-white/20">
                <div className="text-3xl mb-2">🔥</div>
                <h3 className="text-white font-semibold mb-2">
                  Trending Repos
                </h3>
                <p className="text-gray-400 text-sm">
                  Discover what's hot in the developer community
                </p>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 border border-white/20">
                <div className="text-3xl mb-2">⚡</div>
                <h3 className="text-white font-semibold mb-2">
                  Real-time Data
                </h3>
                <p className="text-gray-400 text-sm">
                  Fresh data directly from GitHub's API
                </p>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 border border-white/20">
                <div className="text-3xl mb-2">📱</div>
                <h3 className="text-white font-semibold mb-2">Mobile Ready</h3>
                <p className="text-gray-400 text-sm">
                  Swipe through repos like your favorite social feed
                </p>
              </div>
            </div>
          </div>

          <button
            onClick={handleGetStarted}
            className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-semibold py-4 px-8 rounded-full text-lg transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
          >
            Get Started
          </button>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-white">Loading trending repositories...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center p-4">
        <div className="text-center max-w-md">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h2 className="text-white text-xl font-semibold mb-2">
            Something went wrong
          </h2>
          <p className="text-gray-400 mb-6">
            {error instanceof Error
              ? error.message
              : 'Failed to load repositories'}
          </p>
          <button
            onClick={() => setIsStarted(false)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition-colors"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black">
      <VerticalFeed
        repositories={repositories}
        onLoadMore={() => {
          if (hasNextPage && !isFetchingNextPage) {
            fetchNextPage();
          }
        }}
        extensionMode="newtab"
      />
    </div>
  );
}
