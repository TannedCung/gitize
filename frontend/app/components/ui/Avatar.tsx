'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { BaseComponentProps, ComponentSize } from './types';
import { cn, createTransition } from './utils';

/**
 * Status indicator types for Avatar component
 */
export type AvatarStatus = 'online' | 'offline' | 'away' | 'busy';

/**
 * Props for the Avatar component
 */
export interface AvatarProps extends BaseComponentProps {
  /** Image source URL */
  src?: string;
  /** Alt text for the image (required for accessibility) */
  alt: string;
  /** Size variant of the avatar */
  size?: ComponentSize;
  /** Status indicator to display */
  status?: AvatarStatus;
  /** Fallback text to display when image fails to load (usually initials) */
  fallback?: string;
  /** Whether to show the status indicator */
  showStatus?: boolean;
  /** Custom click handler */
  onClick?: () => void;
}

/**
 * Avatar component with image loading, fallback handling, and status indicators
 * Supports multiple sizes and accessibility features
 */
export const Avatar: React.FC<AvatarProps> = ({
  src,
  alt,
  size = 'md',
  status,
  fallback,
  showStatus = false,
  onClick,
  className,
  'data-testid': dataTestId,
  'aria-label': ariaLabel,
  ...props
}) => {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [isLoading, setIsLoading] = useState(!!src);

  // Reset states when src changes
  useEffect(() => {
    if (src) {
      setImageLoaded(false);
      setImageError(false);
      setIsLoading(true);
    } else {
      setImageLoaded(false);
      setImageError(false);
      setIsLoading(false);
    }
  }, [src]);

  // Handle image load success
  const handleImageLoad = () => {
    setImageLoaded(true);
    setImageError(false);
    setIsLoading(false);
  };

  // Handle image load error
  const handleImageError = () => {
    setImageLoaded(false);
    setImageError(true);
    setIsLoading(false);
  };

  // Generate initials from alt text or fallback
  const getInitials = (): string => {
    const text = fallback || alt;
    if (!text) return '';

    const words = text.trim().split(/\s+/);
    if (words.length === 1) {
      return words[0].charAt(0).toUpperCase();
    }

    return words
      .slice(0, 2)
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase();
  };

  // Get size classes
  const getSizeClasses = (): string => {
    const sizeMap: Record<ComponentSize, string> = {
      xs: 'w-6 h-6 text-xs',
      sm: 'w-8 h-8 text-sm',
      md: 'w-10 h-10 text-base',
      lg: 'w-12 h-12 text-lg',
      xl: 'w-16 h-16 text-xl',
    };
    return sizeMap[size];
  };

  // Get status indicator classes
  const getStatusClasses = (): string => {
    if (!status || !showStatus) return '';

    const statusMap: Record<AvatarStatus, string> = {
      online: 'bg-green-500',
      offline: 'bg-gray-400',
      away: 'bg-yellow-500',
      busy: 'bg-red-500',
    };
    return statusMap[status];
  };

  // Get status indicator size classes
  const getStatusSizeClasses = (): string => {
    const statusSizeMap: Record<ComponentSize, string> = {
      xs: 'w-1.5 h-1.5',
      sm: 'w-2 h-2',
      md: 'w-2.5 h-2.5',
      lg: 'w-3 h-3',
      xl: 'w-4 h-4',
    };
    return statusSizeMap[size];
  };

  // Determine if we should show image or fallback
  const shouldShowImage = src && imageLoaded && !imageError;
  const shouldShowFallback = !src || imageError || (!imageLoaded && !isLoading);

  return (
    <div
      className={cn(
        'relative inline-flex items-center justify-center rounded-full overflow-hidden',
        'bg-gray-100 dark:bg-gray-800',
        getSizeClasses(),
        onClick && 'cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-700',
        createTransition(['background-color']),
        className
      )}
      onClick={onClick}
      data-testid={dataTestId}
      aria-label={ariaLabel || alt}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={
        onClick
          ? e => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                onClick();
              }
            }
          : undefined
      }
      {...props}
    >
      {/* Image */}
      {src && (
        <Image
          src={src}
          alt={alt}
          fill
          className={cn(
            'object-cover',
            createTransition(['opacity']),
            shouldShowImage ? 'opacity-100' : 'opacity-0'
          )}
          onLoad={handleImageLoad}
          onError={handleImageError}
          style={{
            display: shouldShowImage ? 'block' : 'none',
            opacity: shouldShowImage ? 1 : 0,
          }}
        />
      )}

      {/* Loading state - flat design */}
      {isLoading && (
        <div
          className={cn(
            'absolute inset-0 flex items-center justify-center',
            'bg-gray-100 dark:bg-gray-800'
          )}
          data-testid={`${dataTestId}-loading`}
        >
          <div className="animate-pulse w-full h-full bg-gray-200 dark:bg-gray-700 rounded-full" />
        </div>
      )}

      {/* Fallback initials */}
      {shouldShowFallback && (
        <span
          className={cn(
            'font-medium text-gray-600 dark:text-gray-300',
            'select-none'
          )}
          data-testid={`${dataTestId}-fallback`}
        >
          {getInitials()}
        </span>
      )}

      {/* Status indicator - subtle flat design */}
      {status && showStatus && (
        <div
          className={cn(
            'absolute -bottom-0.5 -right-0.5 rounded-full',
            getStatusClasses(),
            getStatusSizeClasses()
          )}
          data-testid={`${dataTestId}-status`}
          role="img"
          aria-label={`Status: ${status}`}
        />
      )}
    </div>
  );
};

Avatar.displayName = 'Avatar';

export default Avatar;
