/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  // Enable tree-shaking optimizations
  experimental: {
    optimizePackageImports: ['@/components/ui'],
  },
  // Optimize bundle splitting
  webpack: (config, { dev, isServer }) => {
    if (!dev && !isServer) {
      // Enable tree-shaking for production builds
      config.optimization = {
        ...config.optimization,
        usedExports: true,
        sideEffects: false,
        // Split chunks for better caching
        splitChunks: {
          ...config.optimization.splitChunks,
          cacheGroups: {
            ...config.optimization.splitChunks.cacheGroups,
            // Separate chunk for UI components
            uiComponents: {
              name: 'ui-components',
              test: /[\\/]app[\\/]components[\\/]ui[\\/]/,
              chunks: 'all',
              priority: 10,
            },
            // Separate chunk for utilities
            utils: {
              name: 'utils',
              test: /[\\/]app[\\/](utils|hooks)[\\/]/,
              chunks: 'all',
              priority: 5,
            },
          },
        },
      };
    }
    return config;
  },
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: 'http://localhost:88/api/:path*',
      },
    ];
  },
};

module.exports = nextConfig;
