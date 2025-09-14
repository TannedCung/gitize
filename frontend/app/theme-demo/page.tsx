'use client';

import React from 'react';
import { useTheme } from '../contexts/ThemeContext';

export default function ThemeDemo() {
  const { theme, setTheme, resolvedTheme, designTokens } = useTheme();

  return (
    <div
      className="min-h-screen p-8"
      style={{
        backgroundColor: designTokens.colors.background,
        color: designTokens.colors.text,
      }}
    >
      <div className="max-w-4xl mx-auto space-y-8">
        <h1 className="text-4xl font-bold mb-8">
          Neutral Color Palette Theme Demo
        </h1>

        {/* Theme Controls */}
        <div className="space-y-4">
          <h2 className="text-2xl font-semibold">Theme Controls</h2>
          <div className="flex gap-4">
            <button
              onClick={() => setTheme('light')}
              className={`px-4 py-2 rounded ${theme === 'light' ? 'bg-neutral-200' : 'bg-neutral-100'}`}
              style={{
                backgroundColor:
                  theme === 'light'
                    ? designTokens.colors.neutral[200]
                    : designTokens.colors.neutral[100],
              }}
            >
              Light
            </button>
            <button
              onClick={() => setTheme('dark')}
              className={`px-4 py-2 rounded ${theme === 'dark' ? 'bg-neutral-700' : 'bg-neutral-600'}`}
              style={{
                backgroundColor:
                  theme === 'dark'
                    ? designTokens.colors.neutral[700]
                    : designTokens.colors.neutral[600],
              }}
            >
              Dark
            </button>
            <button
              onClick={() => setTheme('system')}
              className={`px-4 py-2 rounded ${theme === 'system' ? 'bg-neutral-500' : 'bg-neutral-400'}`}
              style={{
                backgroundColor:
                  theme === 'system'
                    ? designTokens.colors.neutral[500]
                    : designTokens.colors.neutral[400],
              }}
            >
              System
            </button>
          </div>
          <p style={{ color: designTokens.colors.textSecondary }}>
            Current: {theme} | Resolved: {resolvedTheme}
          </p>
        </div>

        {/* Color Palette Display */}
        <div className="space-y-6">
          <h2 className="text-2xl font-semibold">Neutral Color Palette</h2>
          <div className="grid grid-cols-6 gap-4">
            {Object.entries(designTokens.colors.neutral).map(([key, value]) => (
              <div key={key} className="text-center">
                <div
                  className="w-16 h-16 rounded mb-2 border"
                  style={{
                    backgroundColor: value,
                    borderColor: designTokens.colors.border,
                  }}
                />
                <p className="text-sm font-mono">{key}</p>
                <p
                  className="text-xs"
                  style={{ color: designTokens.colors.textMuted }}
                >
                  {value}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Accent Colors */}
        <div className="space-y-6">
          <h2 className="text-2xl font-semibold">Accent Colors</h2>
          <div className="grid grid-cols-4 gap-4">
            {Object.entries(designTokens.colors.accent).map(([key, value]) => (
              <div key={key} className="text-center">
                <div
                  className="w-16 h-16 rounded mb-2"
                  style={{ backgroundColor: value }}
                />
                <p className="text-sm font-mono">{key}</p>
                <p
                  className="text-xs"
                  style={{ color: designTokens.colors.textMuted }}
                >
                  {value}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
