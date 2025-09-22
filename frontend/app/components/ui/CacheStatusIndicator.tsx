'use client';

import React from 'react';
import { useCacheStatus } from '../../hooks/useRepositories';

interface CacheStatusIndicatorProps {
  className?: string;
  showWhenOnline?: boolean;
}

export function CacheStatusIndicator({
  className = '',
  showWhenOnline = false,
}: CacheStatusIndicatorProps) {
  const { isOffline, hasCachedData, isExtensionEnvironment } = useCacheStatus();
  const [lastFetchTime, setLastFetchTime] = React.useState<number | null>(null);

  React.useEffect(() => {
    const getLastFetchTime = async () => {
      if (!isExtensionEnvironment) return;

      try {
        // Type assertion for Chrome API in extension environment
        const chromeStorage = (globalThis as any).chrome?.storage;
        if (chromeStorage) {
          const result = await chromeStorage.local.get('last_fetch_timestamp');
          setLastFetchTime(result.last_fetch_timestamp || null);
        }
      } catch (error) {
        console.warn('Error getting last fetch time:', error);
      }
    };

    getLastFetchTime();
  }, [isExtensionEnvironment]);

  // Don't show anything if not in extension environment
  if (!isExtensionEnvironment) return null;

  // Don't show when online unless explicitly requested
  if (!isOffline && !showWhenOnline) return null;

  // Don't show if no cached data available
  if (!hasCachedData) return null;

  const getDataAge = () => {
    if (!lastFetchTime) return 'Unknown';

    const ageMs = Date.now() - lastFetchTime;
    const ageHours = Math.floor(ageMs / (1000 * 60 * 60));
    const ageDays = Math.floor(ageHours / 24);

    if (ageDays > 0) {
      return `${ageDays} day${ageDays > 1 ? 's' : ''} ago`;
    } else if (ageHours > 0) {
      return `${ageHours} hour${ageHours > 1 ? 's' : ''} ago`;
    } else {
      return 'Less than 1 hour ago';
    }
  };

  const isDataOld =
    lastFetchTime && Date.now() - lastFetchTime > 7 * 24 * 60 * 60 * 1000; // 7 days

  return (
    <div className={`flex items-center gap-2 text-sm ${className}`}>
      {isOffline && (
        <div className="flex items-center gap-1 text-amber-600 dark:text-amber-400">
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z"
            />
          </svg>
          <span>Offline</span>
        </div>
      )}

      <div className="text-gray-600 dark:text-gray-400">
        {isOffline ? 'Showing cached data from' : 'Data cached'} {getDataAge()}
      </div>

      {isDataOld && (
        <div className="text-orange-600 dark:text-orange-400 font-medium">
          Data is over 7 days old. Please go online to refresh.
        </div>
      )}
    </div>
  );
}

export default CacheStatusIndicator;
