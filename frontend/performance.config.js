/**
 * Performance configuration for AppFlowy UI System
 * Defines thresholds, monitoring settings, and optimization targets
 */

module.exports = {
  // Bundle size thresholds
  bundleSize: {
    // Maximum sizes in bytes
    maxTotalSize: 500 * 1024, // 500KB total
    maxUIComponentsSize: 100 * 1024, // 100KB for UI components
    maxChunkSize: 50 * 1024, // 50KB per chunk

    // Warning thresholds (percentage of max)
    warningThreshold: 0.8, // 80%
    errorThreshold: 0.95, // 95%

    // Component-specific limits
    components: {
      Button: 2 * 1024, // 2KB
      TextField: 3 * 1024, // 3KB
      Avatar: 1.5 * 1024, // 1.5KB
      Modal: 5 * 1024, // 5KB
      Grid: 8 * 1024, // 8KB
      List: 6 * 1024, // 6KB
    },
  },

  // Performance thresholds (in milliseconds)
  performance: {
    // Core Web Vitals
    firstContentfulPaint: 1500, // 1.5s
    largestContentfulPaint: 2500, // 2.5s
    firstInputDelay: 100, // 100ms
    cumulativeLayoutShift: 0.1, // 0.1 CLS score
    timeToInteractive: 3000, // 3s

    // Component-specific metrics
    componentRender: 16, // 16ms (60fps)
    themeSwitch: 300, // 300ms
    lazyComponentLoad: 200, // 200ms

    // Memory thresholds
    memory: {
      maxHeapIncrease: 5 * 1024 * 1024, // 5MB
      maxComponentMemory: 1 * 1024 * 1024, // 1MB per component
      gcThreshold: 10 * 1024 * 1024, // 10MB before GC warning
    },
  },

  // Tree-shaking configuration
  treeshaking: {
    // Minimum efficiency percentage
    minEfficiency: 85,

    // Maximum unused exports allowed
    maxUnusedExports: 5,

    // Critical components that should never be tree-shaken
    criticalComponents: ['Button', 'TextField', 'Avatar', 'Loading', 'Alert'],

    // Components that should be lazy-loaded
    lazyComponents: [
      'Modal',
      'Popover',
      'Tooltip',
      'Menu',
      'Grid',
      'List',
      'ScrollArea',
      'FilterPanel',
      'NewsletterSignup',
    ],
  },

  // Monitoring configuration
  monitoring: {
    // Enable/disable different monitoring types
    enabled: {
      bundleSize: true,
      performance: true,
      memory: true,
      coverage: true,
      accessibility: true,
    },

    // Monitoring intervals
    intervals: {
      performance: 60000, // 1 minute
      memory: 30000, // 30 seconds
      bundleSize: 300000, // 5 minutes
    },

    // Report generation
    reports: {
      format: 'json', // json, html, csv
      outputDir: './reports',
      retention: 30, // days
      includeCharts: true,
    },
  },

  // Optimization targets
  optimization: {
    // Target performance scores
    targets: {
      performanceScore: 90, // out of 100
      bundleSizeScore: 85, // out of 100
      treeshakingScore: 90, // out of 100
      memoryScore: 85, // out of 100
    },

    // Optimization strategies
    strategies: {
      // Code splitting
      codeSplitting: {
        enabled: true,
        strategy: 'component', // component, route, vendor
        minChunkSize: 10 * 1024, // 10KB
        maxChunkSize: 50 * 1024, // 50KB
      },

      // Lazy loading
      lazyLoading: {
        enabled: true,
        threshold: 5 * 1024, // 5KB minimum for lazy loading
        preloadCritical: true,
      },

      // Compression
      compression: {
        enabled: true,
        algorithm: 'gzip', // gzip, brotli
        level: 6, // compression level
      },

      // Caching
      caching: {
        enabled: true,
        strategy: 'stale-while-revalidate',
        maxAge: 3600, // 1 hour
      },
    },
  },

  // Development settings
  development: {
    // Performance warnings in development
    showWarnings: true,

    // Bundle analysis in development
    analyzeBundleOnBuild: false,

    // Performance monitoring in development
    enableDevMonitoring: true,

    // Hot reload optimization
    hotReload: {
      enabled: true,
      preserveState: true,
      optimizeRefresh: true,
    },
  },

  // Production settings
  production: {
    // Strict performance enforcement
    enforceThresholds: true,

    // Fail build on performance issues
    failOnError: true,

    // Enable all optimizations
    enableAllOptimizations: true,

    // Monitoring in production
    enableProdMonitoring: true,

    // Error reporting
    errorReporting: {
      enabled: true,
      endpoint: process.env.PERFORMANCE_MONITORING_ENDPOINT,
      sampleRate: 0.1, // 10% sampling
    },
  },

  // CI/CD integration
  ci: {
    // Performance regression detection
    regressionDetection: {
      enabled: true,
      threshold: 0.1, // 10% regression threshold
      baseline: 'main', // baseline branch
    },

    // Automated optimization
    autoOptimization: {
      enabled: false, // Disabled by default for safety
      strategies: ['treeshaking', 'compression'],
    },

    // Reporting
    reporting: {
      enabled: true,
      format: 'junit', // junit, json, markdown
      uploadArtifacts: true,
    },
  },

  // Experimental features
  experimental: {
    // Advanced tree-shaking
    advancedTreeshaking: false,

    // Micro-frontends support
    microfrontends: false,

    // Edge-side includes
    esi: false,

    // Service worker optimization
    serviceWorkerOptimization: false,
  },
};
