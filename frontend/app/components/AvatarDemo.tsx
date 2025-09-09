'use client';

import React, { useState } from 'react';
import { Avatar, AvatarStatus } from './ui/Avatar';

export const AvatarDemo: React.FC = () => {
  const [selectedStatus, setSelectedStatus] = useState<AvatarStatus>('online');
  const [showStatus, setShowStatus] = useState(true);

  const sizes = ['xs', 'sm', 'md', 'lg', 'xl'] as const;
  const statuses: AvatarStatus[] = ['online', 'offline', 'away', 'busy'];

  return (
    <div className="p-8 space-y-8">
      <div>
        <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-gray-100">
          Avatar Component Demo
        </h2>
        <p className="text-gray-600 dark:text-gray-400 mb-6">
          Showcasing the Avatar component with different sizes, fallbacks, and
          status indicators.
        </p>
      </div>

      {/* Size Variants */}
      <div>
        <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-gray-100">
          Size Variants
        </h3>
        <div className="flex items-center gap-4">
          {sizes.map(size => (
            <div key={size} className="flex flex-col items-center gap-2">
              <Avatar
                src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face"
                alt="John Doe"
                size={size}
                data-testid={`avatar-${size}`}
              />
              <span className="text-sm text-gray-600 dark:text-gray-400 capitalize">
                {size}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Fallback Examples */}
      <div>
        <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-gray-100">
          Fallback Handling
        </h3>
        <div className="flex items-center gap-4">
          <div className="flex flex-col items-center gap-2">
            <Avatar
              src="https://invalid-url.jpg"
              alt="Jane Smith"
              size="lg"
              data-testid="avatar-fallback-alt"
            />
            <span className="text-sm text-gray-600 dark:text-gray-400">
              Alt text fallback
            </span>
          </div>
          <div className="flex flex-col items-center gap-2">
            <Avatar
              src="https://invalid-url.jpg"
              alt="John Doe"
              fallback="Custom Fallback"
              size="lg"
              data-testid="avatar-fallback-custom"
            />
            <span className="text-sm text-gray-600 dark:text-gray-400">
              Custom fallback
            </span>
          </div>
          <div className="flex flex-col items-center gap-2">
            <Avatar
              alt="No Image User"
              size="lg"
              data-testid="avatar-no-image"
            />
            <span className="text-sm text-gray-600 dark:text-gray-400">
              No image
            </span>
          </div>
        </div>
      </div>

      {/* Status Indicators */}
      <div>
        <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-gray-100">
          Status Indicators
        </h3>
        <div className="space-y-4">
          <div className="flex items-center gap-4">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={showStatus}
                onChange={e => setShowStatus(e.target.checked)}
                className="rounded"
              />
              <span className="text-sm text-gray-700 dark:text-gray-300">
                Show status indicator
              </span>
            </label>
          </div>

          <div className="flex items-center gap-4">
            {statuses.map(status => (
              <label key={status} className="flex items-center gap-2">
                <input
                  type="radio"
                  name="status"
                  value={status}
                  checked={selectedStatus === status}
                  onChange={e =>
                    setSelectedStatus(e.target.value as AvatarStatus)
                  }
                  className="rounded"
                />
                <span className="text-sm text-gray-700 dark:text-gray-300 capitalize">
                  {status}
                </span>
              </label>
            ))}
          </div>

          <div className="flex items-center gap-4">
            {statuses.map(status => (
              <div key={status} className="flex flex-col items-center gap-2">
                <Avatar
                  src="https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face"
                  alt="Sarah Wilson"
                  size="lg"
                  status={status}
                  showStatus={showStatus}
                  data-testid={`avatar-status-${status}`}
                />
                <span className="text-sm text-gray-600 dark:text-gray-400 capitalize">
                  {status}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Interactive Example */}
      <div>
        <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-gray-100">
          Interactive Avatar
        </h3>
        <div className="flex items-center gap-4">
          <Avatar
            src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face"
            alt="Mike Johnson"
            size="xl"
            status={selectedStatus}
            showStatus={showStatus}
            onClick={() => alert('Avatar clicked!')}
            data-testid="avatar-interactive"
          />
          <div className="text-sm text-gray-600 dark:text-gray-400">
            <p>Click the avatar to see interaction</p>
            <p>Status: {selectedStatus}</p>
            <p>Show status: {showStatus ? 'Yes' : 'No'}</p>
          </div>
        </div>
      </div>

      {/* Different Users */}
      <div>
        <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-gray-100">
          User Gallery
        </h3>
        <div className="flex flex-wrap gap-4">
          {[
            {
              name: 'Alice Cooper',
              image:
                'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face',
              status: 'online',
            },
            {
              name: 'Bob Smith',
              image:
                'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
              status: 'away',
            },
            {
              name: 'Carol Johnson',
              image:
                'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face',
              status: 'busy',
            },
            {
              name: 'David Wilson',
              image: 'https://invalid-url.jpg',
              status: 'offline',
            },
            {
              name: 'Eva Martinez',
              image:
                'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&h=150&fit=crop&crop=face',
              status: 'online',
            },
          ].map((user, index) => (
            <div key={index} className="flex flex-col items-center gap-2">
              <Avatar
                src={user.image}
                alt={user.name}
                size="lg"
                status={user.status as AvatarStatus}
                showStatus={showStatus}
                data-testid={`avatar-user-${index}`}
              />
              <span className="text-sm text-gray-600 dark:text-gray-400 text-center">
                {user.name}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AvatarDemo;
