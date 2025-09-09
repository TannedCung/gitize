'use client';

import React, { useState, useRef } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ThemeToggle, NavigationBar } from '../ui';
import {
  useKeyboardNavigation,
  useFocusTrap,
} from '../../hooks/useKeyboardNavigation';

interface AppLayoutProps {
  children: React.ReactNode;
}

const navigation = [
  { id: 'trending', label: 'Trending', href: '/' },
  { id: 'search', label: 'Search', href: '/search' },
  { id: 'newsletter', label: 'Newsletter', href: '/newsletter' },
];

export function AppLayout({ children }: AppLayoutProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();
  const mobileMenuRef = useRef<HTMLDivElement>(null);

  // Close mobile menu on escape key
  useKeyboardNavigation({
    onEscape: () => {
      if (mobileMenuOpen) {
        setMobileMenuOpen(false);
      }
    },
    enabled: mobileMenuOpen,
  });

  // Focus trap for mobile menu
  useFocusTrap(mobileMenuRef, mobileMenuOpen);

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 transition-colors">
      {/* Header */}
      <NavigationBar
        items={navigation.map(item => ({
          ...item,
          active: pathname === item.href,
        }))}
        brand={
          <Link
            href="/"
            className="flex items-center space-x-2 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 rounded"
            aria-label="GitHub Trending - Go to homepage"
          >
            <div
              className="h-7 w-7 sm:h-8 sm:w-8 bg-primary-600 rounded-lg flex items-center justify-center"
              aria-hidden="true"
            >
              <span className="text-white font-bold text-xs sm:text-sm">
                GT
              </span>
            </div>
            <span className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white hidden xs:block">
              Gitize
            </span>
            <span className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white block xs:hidden">
              GT
            </span>
          </Link>
        }
        actions={<ThemeToggle />}
        responsive={true}
        onItemSelect={() => setMobileMenuOpen(false)}
      />

      {/* Main Content */}
      <main className="flex-1" id="main-content">
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:absolute focus:top-6 focus:left-6 bg-primary-600 text-white px-4 py-2 rounded-lg z-50 font-medium"
        >
          Skip to main content
        </a>
        {children}
      </main>

      {/* Footer */}
      <footer
        className="bg-gray-50 dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700"
        role="contentinfo"
      >
        <div className="mx-auto max-w-7xl px-6 lg:px-8 py-12">
          <div className="text-center text-sm text-gray-600 dark:text-gray-400">
            <p>
              &copy; 2024 GitHub Trending Summarizer. Built with Next.js and
              Rust.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
