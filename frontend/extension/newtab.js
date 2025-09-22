// Chrome Extension New Tab Script
// This script renders the full TrendingFeed component as a new tab page

class ExtensionNewTab {
  constructor() {
    this.repositories = [];
    this.loading = true;
    this.error = null;
    this.searchQuery = '';
    this.isSearchMode = false;
    this.filters = {};
    this.showMobileFilters = false;
    this.hasNextPage = false;
    this.isFetchingNextPage = false;
    this.currentPage = 0;
    this.limit = 20;

    this.init();
  }

  async init() {
    try {
      await this.loadRepositories();
      this.render();
      this.setupEventListeners();
      this.setupInfiniteScroll();
    } catch (error) {
      this.error = error.message;
      this.loading = false;
      this.render();
    }
  }

  async loadRepositories(append = false) {
    try {
      if (!append) {
        // Try to get cached data first for initial load
        const cached = await this.getCachedData();
        if (cached && this.isCacheValid(cached)) {
          this.repositories = cached.repositories;
          this.loading = false;
          this.render();
        }
      }

      // Build query parameters
      const params = new URLSearchParams({
        limit: this.limit.toString(),
        offset: (this.currentPage * this.limit).toString(),
      });

      // Add filters
      if (this.filters.language)
        params.append('language', this.filters.language);
      if (this.filters.minStars)
        params.append('min_stars', this.filters.minStars.toString());
      if (this.filters.maxStars)
        params.append('max_stars', this.filters.maxStars.toString());
      if (this.filters.dateRange)
        params.append('date_range', this.filters.dateRange);

      const endpoint = this.isSearchMode ? 'search' : 'trending';
      if (this.isSearchMode && this.searchQuery) {
        params.set('q', this.searchQuery);
      }

      const response = await fetch(
        `http://localhost:8080/repositories/${endpoint}?${params}`
      );
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (append) {
        this.repositories = [
          ...this.repositories,
          ...(data.repositories || []),
        ];
      } else {
        this.repositories = data.repositories || [];
        this.currentPage = 0;
      }

      this.hasNextPage = data.has_more || false;
      this.loading = false;
      this.isFetchingNextPage = false;

      // Cache the data for initial loads only
      if (!append && !this.isSearchMode) {
        await this.cacheData(data);
      }

      this.render();
    } catch (error) {
      console.error('Failed to load repositories:', error);
      this.error = error.message;
      this.loading = false;
      this.isFetchingNextPage = false;
      this.render();
    }
  }

  async loadMore() {
    if (this.hasNextPage && !this.isFetchingNextPage) {
      this.isFetchingNextPage = true;
      this.currentPage++;
      this.render(); // Show loading indicator
      await this.loadRepositories(true);
    }
  }

  async getCachedData() {
    return new Promise(resolve => {
      if (typeof chrome !== 'undefined' && chrome.storage) {
        chrome.storage.local.get(
          ['trendingRepositories', 'lastFetch'],
          result => {
            resolve({
              repositories: result.trendingRepositories || [],
              lastFetch: result.lastFetch || 0,
            });
          }
        );
      } else {
        // Fallback to localStorage for testing
        const cached = localStorage.getItem('trendingRepositories');
        const lastFetch = localStorage.getItem('lastFetch');
        resolve({
          repositories: cached ? JSON.parse(cached) : [],
          lastFetch: lastFetch ? parseInt(lastFetch) : 0,
        });
      }
    });
  }

  async cacheData(data) {
    const cacheData = {
      trendingRepositories: data.repositories,
      lastFetch: Date.now(),
    };

    if (typeof chrome !== 'undefined' && chrome.storage) {
      chrome.storage.local.set(cacheData);
    } else {
      // Fallback to localStorage for testing
      localStorage.setItem(
        'trendingRepositories',
        JSON.stringify(data.repositories)
      );
      localStorage.setItem('lastFetch', Date.now().toString());
    }
  }

  isCacheValid(cached) {
    const oneHour = 60 * 60 * 1000; // 1 hour in milliseconds
    return Date.now() - cached.lastFetch < oneHour;
  }

  async searchRepositories(query) {
    this.searchQuery = query;
    this.isSearchMode = query.trim().length > 0;
    this.currentPage = 0;
    this.repositories = [];
    this.loading = true;
    this.render();
    await this.loadRepositories();
  }

  handleRepositoryClick(repository) {
    // Navigate to repository in current tab (new tab behavior)
    window.location.href = repository.html_url;
  }

  handleOpenDashboard() {
    // Open full dashboard in current tab
    window.location.href = 'http://localhost:3000';
  }

  setupEventListeners() {
    // Search functionality
    const searchInput = document.getElementById('search-input');
    if (searchInput) {
      let searchTimeout;
      searchInput.addEventListener('input', e => {
        clearTimeout(searchTimeout);
        searchTimeout = setTimeout(() => {
          this.searchRepositories(e.target.value);
        }, 300);
      });
    }

    // Filter functionality
    document.addEventListener('change', e => {
      if (e.target.matches('.filter-select')) {
        const filterType = e.target.dataset.filter;
        const value = e.target.value;

        if (value === '') {
          delete this.filters[filterType];
        } else {
          this.filters[filterType] =
            filterType === 'minStars' || filterType === 'maxStars'
              ? parseInt(value)
              : value;
        }

        this.currentPage = 0;
        this.repositories = [];
        this.loading = true;
        this.render();
        this.loadRepositories();
      }
    });

    // Mobile filter toggle
    document.addEventListener('click', e => {
      if (e.target.closest('.mobile-filter-toggle')) {
        this.showMobileFilters = !this.showMobileFilters;
        this.render();
      }

      if (e.target.closest('.repository-card')) {
        const card = e.target.closest('.repository-card');
        const repoId = card.dataset.repoId;
        const repository = this.repositories.find(
          repo => repo.id.toString() === repoId
        );
        if (repository) {
          this.handleRepositoryClick(repository);
        }
      }

      if (e.target.closest('.dashboard-btn')) {
        this.handleOpenDashboard();
      }

      if (e.target.closest('.retry-btn')) {
        this.error = null;
        this.loading = true;
        this.currentPage = 0;
        this.repositories = [];
        this.render();
        this.loadRepositories();
      }
    });
  }

  setupInfiniteScroll() {
    const observer = new IntersectionObserver(
      entries => {
        const target = entries[0];
        if (
          target.isIntersecting &&
          this.hasNextPage &&
          !this.isFetchingNextPage
        ) {
          this.loadMore();
        }
      },
      {
        threshold: 0.1,
        rootMargin: '100px',
      }
    );

    // Re-observe the sentinel after each render
    this.observeLoadMoreSentinel = () => {
      const sentinel = document.getElementById('load-more-sentinel');
      if (sentinel) {
        observer.observe(sentinel);
      }
    };
  }

  formatStars(stars) {
    if (stars >= 1000) {
      return (stars / 1000).toFixed(1) + 'k';
    }
    return stars.toString();
  }

  formatDate(dateString) {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 1) return '1 day ago';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.ceil(diffDays / 7)} weeks ago`;
    return `${Math.ceil(diffDays / 30)} months ago`;
  }

  render() {
    const root = document.getElementById('newtab-root');
    if (!root) return;

    if (this.error) {
      root.innerHTML = `
        <div class="newtab-container">
          <div class="error-container">
            <div class="error-content">
              <div class="error-icon">⚠️</div>
              <h2>Something went wrong</h2>
              <p>${this.error}</p>
              <button class="retry-btn">Try again</button>
            </div>
          </div>
        </div>
      `;
      return;
    }

    const headerSection = `
      <header class="newtab-header">
        <div class="header-content">
          <div class="title-section">
            <h1>${this.isSearchMode ? 'Search Results' : 'Trending Repositories'}</h1>
            <p>${
              this.isSearchMode
                ? `Found ${this.repositories.length} repositories matching "${this.searchQuery}"`
                : 'Discover the most popular GitHub repositories with AI-powered summaries'
            }</p>
          </div>

          <div class="search-section">
            <input
              type="text"
              id="search-input"
              placeholder="Search repositories by name, description, or topic..."
              value="${this.searchQuery}"
            />
          </div>
        </div>
      </header>
    `;

    const sidebarSection = `
      <div class="mobile-filter-toggle">
        <button class="filter-toggle-btn">
          <span>Filters & Options</span>
          <span class="chevron ${this.showMobileFilters ? 'rotated' : ''}">▼</span>
        </button>
      </div>

      <aside class="sidebar ${this.showMobileFilters ? 'mobile-visible' : ''}">
        <div class="filter-panel">
          <h3>Filters</h3>

          <div class="filter-group">
            <label>Language</label>
            <select class="filter-select" data-filter="language">
              <option value="">All languages</option>
              <option value="JavaScript" ${this.filters.language === 'JavaScript' ? 'selected' : ''}>JavaScript</option>
              <option value="Python" ${this.filters.language === 'Python' ? 'selected' : ''}>Python</option>
              <option value="TypeScript" ${this.filters.language === 'TypeScript' ? 'selected' : ''}>TypeScript</option>
              <option value="Java" ${this.filters.language === 'Java' ? 'selected' : ''}>Java</option>
              <option value="Go" ${this.filters.language === 'Go' ? 'selected' : ''}>Go</option>
              <option value="Rust" ${this.filters.language === 'Rust' ? 'selected' : ''}>Rust</option>
            </select>
          </div>

          <div class="filter-group">
            <label>Date Range</label>
            <select class="filter-select" data-filter="dateRange">
              <option value="">All time</option>
              <option value="today" ${this.filters.dateRange === 'today' ? 'selected' : ''}>Today</option>
              <option value="week" ${this.filters.dateRange === 'week' ? 'selected' : ''}>This week</option>
              <option value="month" ${this.filters.dateRange === 'month' ? 'selected' : ''}>This month</option>
            </select>
          </div>

          <div class="filter-group">
            <label>Minimum Stars</label>
            <select class="filter-select" data-filter="minStars">
              <option value="">Any</option>
              <option value="100" ${this.filters.minStars === 100 ? 'selected' : ''}>100+</option>
              <option value="1000" ${this.filters.minStars === 1000 ? 'selected' : ''}>1,000+</option>
              <option value="5000" ${this.filters.minStars === 5000 ? 'selected' : ''}>5,000+</option>
              <option value="10000" ${this.filters.minStars === 10000 ? 'selected' : ''}>10,000+</option>
            </select>
          </div>
        </div>

        <div class="results-summary">
          <p><strong>${this.repositories.length}</strong> ${this.isSearchMode ? 'repositories found' : 'trending repositories'}</p>
          ${this.hasNextPage ? '<p class="load-more-hint">Scroll down to load more</p>' : ''}
        </div>

        <div class="dashboard-section">
          <button class="dashboard-btn">Open Full Dashboard</button>
        </div>
      </aside>
    `;

    const mainContent =
      this.loading && this.repositories.length === 0
        ? `
      <main class="main-content">
        <div class="loading-container">
          <div class="loading-content">
            <div class="loading-spinner"></div>
            <p>Loading repositories...</p>
          </div>
        </div>
      </main>
    `
        : this.repositories.length === 0
          ? `
      <main class="main-content">
        <div class="empty-state">
          <div class="empty-icon">📁</div>
          <h2>${this.isSearchMode ? 'No repositories found' : 'No trending repositories'}</h2>
          <p>${this.isSearchMode ? 'Try adjusting your search query or filters' : 'Check back later for trending repositories'}</p>
        </div>
      </main>
    `
          : `
      <main class="main-content">
        <div class="repositories-grid">
          ${this.repositories
            .map(
              repo => `
            <div class="repository-card" data-repo-id="${repo.id}">
              <div class="repo-header">
                <h3 class="repo-name">${repo.name}</h3>
                <div class="repo-stats">
                  <span class="stars">⭐ ${this.formatStars(repo.stargazers_count)}</span>
                  <span class="forks">🍴 ${this.formatStars(repo.forks_count)}</span>
                </div>
              </div>
              <p class="repo-description">${repo.description || 'No description available'}</p>
              <div class="repo-footer">
                ${repo.language ? `<span class="language">${repo.language}</span>` : ''}
                <span class="updated">${this.formatDate(repo.updated_at)}</span>
              </div>
            </div>
          `
            )
            .join('')}
        </div>

        ${this.hasNextPage ? '<div id="load-more-sentinel" class="load-more-sentinel"></div>' : ''}

        ${
          this.isFetchingNextPage
            ? `
          <div class="loading-more">
            <div class="loading-spinner"></div>
            <p>Loading more repositories...</p>
          </div>
        `
            : ''
        }

        ${
          !this.hasNextPage && this.repositories.length > 0
            ? `
          <div class="end-of-results">
            <p>You've reached the end of the results</p>
          </div>
        `
            : ''
        }
      </main>
    `;

    root.innerHTML = `
      <div class="newtab-container">
        ${headerSection}
        <div class="content-layout">
          ${sidebarSection}
          ${mainContent}
        </div>
      </div>
    `;

    // Re-setup infinite scroll observer
    if (this.observeLoadMoreSentinel) {
      setTimeout(this.observeLoadMoreSentinel, 100);
    }
  }
}

// Initialize the new tab when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  new ExtensionNewTab();
});
