'use client';

export default function NewsletterPage() {
  return (
    <div className="container mx-auto px-8 py-16 lg:px-12 lg:py-20 max-w-5xl">
      <div className="text-center mb-20">
        <h1 className="text-4xl lg:text-5xl font-bold text-neutral-900 dark:text-white mb-8 leading-tight">
          Newsletter Subscription
        </h1>
        <p className="text-xl text-neutral-600 dark:text-neutral-300 mb-6 leading-relaxed">
          Stay updated with the latest trending repositories on GitHub
        </p>
        <p className="text-lg text-neutral-500 dark:text-neutral-400 leading-relaxed">
          Get a curated weekly digest of the top 5 trending repositories
          delivered straight to your inbox.
        </p>
      </div>

      <div className="mb-20">
        <div className="bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg p-12 text-center">
          <h3 className="text-xl font-semibold text-neutral-800 dark:text-neutral-200 mb-4">
            🚧 Newsletter Signup Coming Soon
          </h3>
          <p className="text-neutral-600 dark:text-neutral-400 leading-relaxed">
            The newsletter signup component will be available once the UI system
            is fully implemented.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-12 text-center">
        <div className="p-8">
          <div className="text-4xl mb-6">📊</div>
          <h3 className="text-lg font-semibold text-neutral-900 dark:text-white mb-4">
            Curated Content
          </h3>
          <p className="text-neutral-600 dark:text-neutral-400 leading-relaxed">
            Hand-picked trending repositories based on stars, activity, and
            community engagement
          </p>
        </div>

        <div className="p-8">
          <div className="text-4xl mb-6">⏰</div>
          <h3 className="text-lg font-semibold text-neutral-900 dark:text-white mb-4">
            Weekly Digest
          </h3>
          <p className="text-neutral-600 dark:text-neutral-400 leading-relaxed">
            Delivered every Sunday morning, perfect for your weekend reading
          </p>
        </div>

        <div className="p-8">
          <div className="text-4xl mb-6">🎯</div>
          <h3 className="text-lg font-semibold text-neutral-900 dark:text-white mb-4">
            No Spam
          </h3>
          <p className="text-neutral-600 dark:text-neutral-400 leading-relaxed">
            Only quality content, unsubscribe anytime with one click
          </p>
        </div>
      </div>
    </div>
  );
}
