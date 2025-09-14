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
    <div className="min-h-screen bg-neutral-white dark:bg-neutral-900 transition-colors">
      {/* Header */}
      <NavigationBar
        items={navigation.map(item => ({
          ...item,
          active: pathname === item.href,
        }))}
        brand={
          <Link
            href="/"
            className="flex items-center space-x-3 focus:outline-none focus:ring-1 focus:ring-accent-blue-500 focus:ring-offset-2 rounded-sm"
            aria-label="GitHub Trending - Go to homepage"
          >
            <div
              className="h-8 w-8 sm:h-9 sm:w-9 bg-accent-blue-600 flex items-center justify-center"
              aria-hidden="true"
            >
              <span className="text-neutral-white font-bold text-sm sm:text-base">
                GT
              </span>
            </div>
            <span className="text-xl sm:text-2xl font-bold text-neutral-900 dark:text-neutral-white hidden xs:block">
              Gitize
            </span>
            <span className="text-xl sm:text-2xl font-bold text-neutral-900 dark:text-neutral-white block xs:hidden">
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
          className="sr-only focus:not-sr-only focus:absolute focus:top-8 focus:left-8 bg-accent-blue-600 text-neutral-white px-6 py-3 z-50 font-medium"
        >
          Skip to main content
        </a>
        {children}
      </main>

      {/* Footer - Flat design with typography emphasis */}
      <footer className="py-20" role="contentinfo">
        <div className="mx-auto max-w-7xl px-8 lg:px-12">
          <div className="text-center text-base text-neutral-600 dark:text-neutral-400 leading-relaxed">
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
