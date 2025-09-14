'use client';

import React, { useState } from 'react';
import { NavigationBar, TabBar } from '../components/ui';
import type { NavigationItem, TabItem } from '../components/ui';

export default function NavigationDemo() {
  const [activeTab, setActiveTab] = useState('tab1');

  const navigationItems: NavigationItem[] = [
    { id: 'home', label: 'Home', active: true },
    { id: 'about', label: 'About' },
    { id: 'services', label: 'Services' },
    { id: 'contact', label: 'Contact' },
  ];

  const tabItems: TabItem[] = [
    { id: 'tab1', label: 'Overview', active: activeTab === 'tab1' },
    { id: 'tab2', label: 'Analytics', active: activeTab === 'tab2' },
    { id: 'tab3', label: 'Settings', active: activeTab === 'tab3' },
  ];

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      {/* Navigation Bar Demo */}
      <NavigationBar
        items={navigationItems}
        brand={
          <span className="text-xl font-semibold text-gray-900 dark:text-gray-100">
            AppFlowy
          </span>
        }
        actions={
          <button className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100">
            Menu
          </button>
        }
      />

      <div className="max-w-4xl mx-auto px-8 py-12">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-8">
          Flat Navigation Components Demo
        </h1>

        <div className="space-y-12">
          {/* Tab Bar Demo */}
          <section>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-6">
              Tab Bar - Default Variant
            </h2>
            <TabBar
              tabs={tabItems}
              variant="default"
              onTabChange={tab => setActiveTab(tab.id)}
            />
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-6">
              Tab Bar - Pills Variant
            </h2>
            <TabBar
              tabs={tabItems}
              variant="pills"
              onTabChange={tab => setActiveTab(tab.id)}
            />
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-6">
              Tab Bar - Underline Variant
            </h2>
            <TabBar
              tabs={tabItems}
              variant="underline"
              onTabChange={tab => setActiveTab(tab.id)}
            />
          </section>

          {/* Menu Demo - Placeholder */}
          <section>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-6">
              Dropdown Menu (Coming Soon)
            </h2>
            <button className="px-6 py-3 text-sm font-medium text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100 border border-gray-200 dark:border-gray-700">
              Menu Component Not Implemented
            </button>
          </section>

          {/* Design Principles */}
          <section>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-6">
              Flat Design Principles Applied
            </h2>
            <div className="prose prose-gray dark:prose-invert max-w-none">
              <ul className="space-y-3 text-gray-600 dark:text-gray-400">
                <li>✓ Clean text-based navigation with subtle hover states</li>
                <li>
                  ✓ Borderless tabs using typography weight for active states
                </li>
                <li>
                  ✓ Flat dropdown panels with generous spacing and no shadows
                </li>
                <li>✓ Typography hierarchy instead of visual containers</li>
                <li>✓ Generous spacing for airy, uncluttered layouts</li>
                <li>
                  ✓ Minimal visual feedback that doesn't compete with content
                </li>
              </ul>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
