/**
 * Test configuration for different environments
 */

export interface TestConfig {
  apiBaseUrl: string;
  frontendBaseUrl: string;
  timeout: {
    default: number;
    api: number;
    navigation: number;
    element: number;
  };
  retries: number;
  parallel: boolean;
  headless: boolean;
  slowMo: number;
  video: boolean;
  screenshot: boolean;
  trace: boolean;
}

export const testConfigs: Record<string, TestConfig> = {
  development: {
    apiBaseUrl: 'http://localhost:8000',
    frontendBaseUrl: 'http://localhost:3000',
    timeout: {
      default: 30000,
      api: 10000,
      navigation: 15000,
      element: 10000,
    },
    retries: 1,
    parallel: true,
    headless: false,
    slowMo: 0,
    video: false,
    screenshot: true,
    trace: true,
  },

  ci: {
    apiBaseUrl: process.env.API_BASE_URL || 'http://localhost:8000',
    frontendBaseUrl: process.env.FRONTEND_BASE_URL || 'http://localhost:3000',
    timeout: {
      default: 60000,
      api: 20000,
      navigation: 30000,
      element: 15000,
    },
    retries: 2,
    parallel: false,
    headless: true,
    slowMo: 0,
    video: true,
    screenshot: true,
    trace: true,
  },

  staging: {
    apiBaseUrl:
      process.env.STAGING_API_URL || 'https://api-staging.example.com',
    frontendBaseUrl:
      process.env.STAGING_FRONTEND_URL || 'https://staging.example.com',
    timeout: {
      default: 45000,
      api: 15000,
      navigation: 20000,
      element: 12000,
    },
    retries: 2,
    parallel: true,
    headless: true,
    slowMo: 100,
    video: true,
    screenshot: true,
    trace: true,
  },

  production: {
    apiBaseUrl: process.env.PRODUCTION_API_URL || 'https://api.example.com',
    frontendBaseUrl:
      process.env.PRODUCTION_FRONTEND_URL || 'https://example.com',
    timeout: {
      default: 60000,
      api: 20000,
      navigation: 30000,
      element: 15000,
    },
    retries: 3,
    parallel: false,
    headless: true,
    slowMo: 200,
    video: true,
    screenshot: true,
    trace: true,
  },
};

export function getTestConfig(): TestConfig {
  const environment = process.env.TEST_ENV || 'development';
  return testConfigs[environment] || testConfigs.development;
}

export const testData = {
  validEmails: [
    'test@example.com',
    'user.name@domain.co.uk',
    'test+tag@gmail.com',
  ],

  invalidEmails: [
    'invalid-email',
    '@domain.com',
    'test@',
    'test..test@domain.com',
    '',
  ],

  searchQueries: [
    'react',
    'python',
    'javascript',
    'typescript',
    'rust',
    'go',
    'java',
    'machine learning',
    'web framework',
    'api',
  ],

  programmingLanguages: [
    'JavaScript',
    'Python',
    'TypeScript',
    'Rust',
    'Go',
    'Java',
    'C++',
    'C#',
    'PHP',
    'Ruby',
  ],

  mockRepositories: [
    {
      id: 1,
      name: 'awesome-project',
      full_name: 'developer/awesome-project',
      description:
        'An awesome project that does amazing things with modern web technologies',
      stars: 1250,
      forks: 89,
      language: 'JavaScript',
      author: 'developer',
      url: 'https://github.com/developer/awesome-project',
      trending_date: new Date().toISOString().split('T')[0],
    },
    {
      id: 2,
      name: 'ml-toolkit',
      full_name: 'datascientist/ml-toolkit',
      description:
        'Machine learning toolkit with comprehensive data analysis capabilities',
      stars: 2100,
      forks: 156,
      language: 'Python',
      author: 'datascientist',
      url: 'https://github.com/datascientist/ml-toolkit',
      trending_date: new Date().toISOString().split('T')[0],
    },
    {
      id: 3,
      name: 'rust-cli',
      full_name: 'rustacean/rust-cli',
      description: 'Fast and efficient command-line interface built with Rust',
      stars: 890,
      forks: 45,
      language: 'Rust',
      author: 'rustacean',
      url: 'https://github.com/rustacean/rust-cli',
      trending_date: new Date().toISOString().split('T')[0],
    },
    {
      id: 4,
      name: 'type-safe-api',
      full_name: 'typescript-dev/type-safe-api',
      description:
        'Type-safe API framework with automatic validation and documentation',
      stars: 1680,
      forks: 92,
      language: 'TypeScript',
      author: 'typescript-dev',
      url: 'https://github.com/typescript-dev/type-safe-api',
      trending_date: new Date().toISOString().split('T')[0],
    },
    {
      id: 5,
      name: 'go-microservice',
      full_name: 'gopher/go-microservice',
      description: 'Scalable microservice architecture template built with Go',
      stars: 756,
      forks: 67,
      language: 'Go',
      author: 'gopher',
      url: 'https://github.com/gopher/go-microservice',
      trending_date: new Date().toISOString().split('T')[0],
    },
  ],

  mockSummaries: [
    'A modern web framework built with performance and developer experience in mind.',
    'Machine learning library with comprehensive tools for data analysis and modeling.',
    'Command-line interface tool for managing development workflows efficiently.',
    'Database migration tool with support for multiple database engines.',
    'Real-time communication library with WebSocket and HTTP/2 support.',
  ],
};

export const selectors = {
  // Navigation
  homeLink: '[data-testid="nav-home"], a[href="/"]',
  newsletterLink: '[data-testid="nav-newsletter"], a[href="/newsletter"]',
  searchLink: '[data-testid="nav-search"], a[href="/search"]',
  demoLink: '[data-testid="nav-demo"], a[href="/demo"]',

  // Theme
  themeToggle:
    '[data-testid="theme-toggle"], button[aria-label*="theme"], button[aria-label*="Toggle"]',

  // Search
  searchInput:
    '[data-testid="search-input"], input[placeholder*="search"], input[type="search"]',
  searchButton: '[data-testid="search-button"], button[type="submit"]',
  searchResults: '[data-testid="search-results"]',
  noResults: '[data-testid="no-results"], [data-testid="empty-state"]',

  // Repository cards
  repositoryCard: '[data-testid="repository-card"]',
  repositoryName: '[data-testid="repo-name"]',
  repositoryStars: '[data-testid="repo-stars"]',
  repositoryForks: '[data-testid="repo-forks"]',
  repositoryLanguage: '[data-testid="repo-language"]',
  repositoryAuthor: '[data-testid="repo-author"]',
  repositoryDescription: '[data-testid="repo-description"]',
  repositoryUrl: '[data-testid="repo-url"]',

  // Filters
  filterPanel: '[data-testid="filter-panel"]',
  languageFilter: '[data-testid="language-filter"]',
  starsFilter: '[data-testid="stars-filter"]',
  dateFilter: '[data-testid="date-filter"]',
  clearFilters: '[data-testid="clear-filters"]',

  // Newsletter
  emailInput: '[data-testid="email-input"], input[type="email"]',
  subscribeButton: '[data-testid="subscribe-button"], button[type="submit"]',
  unsubscribeLink: '[data-testid="unsubscribe-link"]',

  // Loading states
  loading: '[data-testid="loading"], .loading, .spinner',
  skeleton: '[data-testid="skeleton"], .skeleton, .animate-pulse',

  // Error states
  errorMessage: '[data-testid="error-message"], .error, [role="alert"]',
  retryButton: '[data-testid="retry-button"], button[aria-label*="retry"]',

  // Mobile
  mobileMenuButton: '[data-testid="mobile-menu"], button[aria-label*="menu"]',
  mobileNavigation: '[data-testid="mobile-nav"], nav[aria-label*="mobile"]',

  // Accessibility
  skipLink: '[data-testid="skip-link"], a[href="#main"]',
  mainContent: '[data-testid="main-content"], main, [role="main"]',

  // Pagination
  nextPage: '[data-testid="next-page"], button[aria-label*="next"]',
  prevPage: '[data-testid="prev-page"], button[aria-label*="previous"]',
  pageNumber: '[data-testid="page-number"]',

  // Social sharing
  shareButton: '[data-testid="share-button"]',
  twitterShare: '[data-testid="twitter-share"]',
  linkedinShare: '[data-testid="linkedin-share"]',

  // Notifications
  toast: '[data-testid="toast"], .toast, [role="status"]',
  notification: '[data-testid="notification"], .notification',
};

export const apiEndpoints = {
  health: '/api/health',
  stats: '/api/stats',
  trending: '/api/repositories/trending',
  search: '/api/repositories/search',
  refresh: '/api/repositories/refresh',
  subscribe: '/api/newsletter/subscribe',
  unsubscribe: '/api/newsletter/unsubscribe',
  preferences: '/api/newsletter/preferences',
};

export const testViewports = {
  mobile: { width: 375, height: 667 },
  tablet: { width: 768, height: 1024 },
  desktop: { width: 1280, height: 720 },
  largeDesktop: { width: 1920, height: 1080 },
};

export const performanceThresholds = {
  pageLoad: 5000,
  apiResponse: 2000,
  searchResponse: 3000,
  themeSwitch: 1000,
  filterApplication: 2000,
  imageLoad: 1000,

  // Core Web Vitals
  lcp: 2500, // Largest Contentful Paint
  fcp: 1800, // First Contentful Paint
  cls: 0.1, // Cumulative Layout Shift
  fid: 100, // First Input Delay
};

export const accessibilityRules = {
  skipLink: true,
  headingHierarchy: true,
  altText: true,
  ariaLabels: true,
  keyboardNavigation: true,
  colorContrast: true,
  focusManagement: true,
};
