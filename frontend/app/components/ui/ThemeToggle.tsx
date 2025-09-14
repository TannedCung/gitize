'use client';

import React from 'react';
import {
  SunIcon,
  MoonIcon,
  ComputerDesktopIcon,
} from '@heroicons/react/24/outline';
import { useTheme } from '../../contexts/ThemeContext';
import {
  useDesignTokens,
  useThemeTransition,
} from '../../hooks/useDesignTokens';
import { BaseComponentProps } from './types';
import { cn } from './utils';
// import { Button } from './Button';

interface ThemeToggleProps extends BaseComponentProps {
  /** Size variant for the toggle buttons */
  size?: 'sm' | 'md' | 'lg';
  /** Whether to show labels alongside icons */
  showLabels?: boolean;
}

export function ThemeToggle({
  className,
  size = 'md',
  showLabels = false,
  'data-testid': dataTestId,
  ...props
}: ThemeToggleProps) {
  const { theme, setTheme, systemPreference } = useTheme();
  const { colors, isTransitioning } = useDesignTokens();
  const { transitionClass } = useThemeTransition();

  const themes = [
    { value: 'light', icon: SunIcon, label: 'Light' },
    { value: 'dark', icon: MoonIcon, label: 'Dark' },
    { value: 'system', icon: ComputerDesktopIcon, label: 'System' },
  ] as const;

  const sizeClasses = {
    sm: 'p-1.5',
    md: 'p-2',
    lg: 'p-2.5',
  };

  const iconSizeClasses = {
    sm: 'h-3 w-3',
    md: 'h-4 w-4',
    lg: 'h-5 w-5',
  };

  return (
    <div
      className={cn(
        'flex items-center space-x-1 bg-token-surface rounded-xl p-1',
        'border border-token-border shadow-token-sm',
        'transition-all duration-300 ease-out brand-element',
        isTransitioning && 'pointer-events-none',
        transitionClass,
        className
      )}
      data-testid={dataTestId}
      role="radiogroup"
      aria-label="Theme selection"
      style={{
        backgroundColor: colors.surface,
        borderColor: colors.border,
      }}
      {...props}
    >
      {themes.map(({ value, icon: Icon, label }) => {
        const isActive = theme === value;
        const isSystemAndMatches = value === 'system' && theme === 'system';

        return (
          <button
            key={value}
            onClick={() => setTheme(value)}
            disabled={isTransitioning}
            className={cn(
              'flex items-center justify-center rounded-lg transition-all duration-300 ease-out',
              'touch-manipulation focus:outline-none focus-visible-ring',
              'disabled:opacity-50 disabled:cursor-not-allowed',
              sizeClasses[size],
              showLabels && 'px-3 space-x-2',
              isActive
                ? cn(
                    'bg-token-background text-token-primary shadow-token-md',
                    'border border-token-primary/20 transform scale-105',
                    'appflowy-border-glow'
                  )
                : cn(
                    'text-token-text-secondary hover:text-token-text',
                    'hover:bg-token-background/50 hover:scale-102',
                    'active:scale-95'
                  )
            )}
            style={{
              ...(isActive && {
                backgroundColor: colors.background,
                color: colors.accent.blue,
                borderColor: `${colors.accent.blue}33`,
              }),
              ...(!isActive && {
                color: colors.textSecondary,
              }),
            }}
            title={`${label}${isSystemAndMatches ? ` (${systemPreference})` : ''}`}
            aria-label={`Switch to ${label.toLowerCase()} theme${isSystemAndMatches ? `, currently ${systemPreference}` : ''}`}
            role="radio"
            aria-checked={isActive}
            data-testid={`theme-toggle-${value}`}
          >
            <Icon className={cn(iconSizeClasses[size], 'flex-shrink-0')} />
            {showLabels && (
              <span className="text-xs font-medium">
                {label}
                {isSystemAndMatches && (
                  <span className="ml-1 opacity-60">({systemPreference})</span>
                )}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
