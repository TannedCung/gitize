'use client';

export default function DemoPage() {
  return (
    <div className="container mx-auto px-6 py-12 lg:px-8 space-y-16">
      <div className="text-center mb-12">
        <h1 className="text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white mb-4">
          Component Demo
        </h1>
        <p className="text-xl text-gray-600 dark:text-gray-300">
          Explore the AppFlowy design system components
        </p>
      </div>

      <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-8 text-center">
        <h2 className="text-2xl font-semibold text-yellow-800 dark:text-yellow-200 mb-4">
          🚧 Component Demos Coming Soon
        </h2>
        <p className="text-yellow-700 dark:text-yellow-300 mb-4">
          This page will showcase all the AppFlowy UI components once the system
          is fully implemented.
        </p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm">
            <div className="text-2xl mb-2">🔘</div>
            <div className="text-sm font-medium">Buttons</div>
          </div>
          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm">
            <div className="text-2xl mb-2">📝</div>
            <div className="text-sm font-medium">Text Fields</div>
          </div>
          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm">
            <div className="text-2xl mb-2">👤</div>
            <div className="text-sm font-medium">Avatars</div>
          </div>
          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm">
            <div className="text-2xl mb-2">✅</div>
            <div className="text-sm font-medium">Checkboxes</div>
          </div>
          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm">
            <div className="text-2xl mb-2">🔗</div>
            <div className="text-sm font-medium">Links</div>
          </div>
          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm">
            <div className="text-2xl mb-2">⚠️</div>
            <div className="text-sm font-medium">Alerts</div>
          </div>
          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm">
            <div className="text-2xl mb-2">💬</div>
            <div className="text-sm font-medium">Tooltips</div>
          </div>
          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm">
            <div className="text-2xl mb-2">📊</div>
            <div className="text-sm font-medium">Loading</div>
          </div>
        </div>
      </div>
    </div>
  );
}
