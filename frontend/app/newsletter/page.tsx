'use client';

export default function NewsletterPage() {
  return (
    <div className="container mx-auto px-6 py-12 lg:px-8 max-w-4xl">
      <div className="text-center mb-12">
        <h1 className="text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white mb-6">
          Newsletter Subscription
        </h1>
        <p className="text-xl text-gray-600 dark:text-gray-300 mb-4">
          Stay updated with the latest trending repositories on GitHub
        </p>
        <p className="text-lg text-gray-500 dark:text-gray-400">
          Get a curated weekly digest of the top 5 trending repositories
          delivered straight to your inbox.
        </p>
      </div>

      <div className="mb-12">
        <div className="bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-8 text-center">
          <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-2">
            🚧 Newsletter Signup Coming Soon
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            The newsletter signup component will be available once the UI system
            is fully implemented.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
        <div className="p-6">
          <div className="text-3xl mb-4">📊</div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            Curated Content
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            Hand-picked trending repositories based on stars, activity, and
            community engagement
          </p>
        </div>

        <div className="p-6">
          <div className="text-3xl mb-4">⏰</div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            Weekly Digest
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            Delivered every Sunday morning, perfect for your weekend reading
          </p>
        </div>

        <div className="p-6">
          <div className="text-3xl mb-4">🎯</div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            No Spam
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            Only quality content, unsubscribe anytime with one click
          </p>
        </div>
      </div>
    </div>
  );
}
