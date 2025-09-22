// Chrome Extension Popup Script
// This script renders the TrendingFeed component in popup mode

// Simple React-like component system for the extension
class ExtensionPopup {
  constructor() {
    this.repositories = [];
    this.loading = true;
    this.error = null;
    this.searchQuery = '';
    this.maxItems = 10;

    this.init();
  }

  async init() {
    try {
      await this.loadRepositories();
      this.render();
      this.setupEventListeners();
    } catch (error) {
      this.error = error.message;
      this.loading = false;
      this.render();
    }
  }

  async loadRepositories() {
    try {
      // Try to get cached data first
      const cached = await this.getCachedData();
      if (cached && this.isCacheValid(cached)) {
        this.repositories = cached.repositories.slice(0, this.maxItems);
        this.loading = false;
        this.render();
      }

      // Fetch fresh data
      const response = await fetch(
        'http://localhost:8080/repositories/trending?limit=10'
      );
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      this.repositories = data.repositories || [];
      this.loading = false;

      // Cache the data
      await this.cacheData(data);

      this.render();
    } catch (error) {
      console.error('Failed to load repositories:', error);
      this.error = error.message;
      this.loading = false;
      this.render();
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
    if (!query.trim()) {
      await this.loadRepositories();
      return;
    }

    try {
      this.loading = true;
      this.render();

      const response = await fetch(
        `http://localhost:8080/repositories/search?q=${encodeURIComponent(query)}&limit=10`
      );
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      this.repositories = data.repositories || [];
      this.loading = false;
      this.render();
    } catch (error) {
      console.error('Failed to search repositories:', error);
      this.error = error.message;
      this.loading = false;
      this.render();
    }
  }

  handleRepositoryClick(repository) {
    // Open repository in new tab
    if (typeof chrome !== 'undefined' && chrome.tabs) {
      chrome.tabs.create({ url: repository.html_url });
    } else {
      // Fallback for testing
      window.open(repository.html_url, '_blank');
    }
  }

  handleViewMoreClick() {
    // Open full dashboard in new tab
    const dashboardUrl = 'http://localhost:3000';
    if (typeof chrome !== 'undefined' && chrome.tabs) {
      chrome.tabs.create({ url: dashboardUrl });
    } else {
      // Fallback for testing
      window.open(dashboardUrl, '_blank');
    }
  }

  setupEventListeners() {
    // Search functionality
    const searchInput = document.getElementById('search-input');
    if (searchInput) {
      let searchTimeout;
      searchInput.addEventListener('input', e => {
        clearTimeout(searchTimeout);
        searchTimeout = setTimeout(() => {
          this.searchQuery = e.target.value;
          this.searchRepositories(this.searchQuery);
        }, 300);
      });
    }

    // Repository click handlers
    document.addEventListener('click', e => {
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

      if (e.target.closest('.view-more-btn')) {
        this.handleViewMoreClick();
      }

      if (e.target.closest('.retry-btn')) {
        this.error = null;
        this.loading = true;
        this.render();
        this.loadRepositories();
      }
    });
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
    const root = document.getElementById('popup-root');
    if (!root) return;

    if (this.error) {
      root.innerHTML = `
        <div class="error-container">
          <div class="error-content">
            <div class="error-icon">⚠️</div>
            <h2>Something went wrong</h2>
            <p>${this.error}</p>
            <button class="retry-btn">Try again</button>
          </div>
        </div>
      `;
      return;
    }

    if (this.loading) {
      root.innerHTML = `
        <div class="loading-container">
          <div class="loading-content">
            <div class="loading-spinner"></div>
            <p>Loading repositories...</p>
          </div>
        </div>
      `;
      return;
    }

    const searchSection = `
      <div class="search-section">
        <h1>Trending</h1>
        <div class="search-container">
          <input
            type="text"
            id="search-input"
            placeholder="Search repositories..."
            value="${this.searchQuery}"
          />
        </div>
      </div>
    `;

    const repositoriesSection =
      this.repositories.length > 0
        ? `
      <div class="repositories-section">
        ${this.repositories
          .map(
            repo => `
          <div class="repository-card" data-repo-id="${repo.id}">
            <div class="repo-header">
              <h3 class="repo-name">${repo.name}</h3>
              <div class="repo-stats">
                <span class="stars">⭐ ${this.formatStars(repo.stargazers_count)}</span>
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

        <div class="view-more-section">
          <button class="view-more-btn">View more in dashboard</button>
        </div>
      </div>
    `
        : `
      <div class="empty-state">
        <div class="empty-icon">📁</div>
        <h2>No repositories found</h2>
        <p>${this.searchQuery ? 'Try adjusting your search query' : 'Check back later for trending repositories'}</p>
      </div>
    `;

    root.innerHTML = `
      <div class="popup-container">
        ${searchSection}
        ${repositoriesSection}
      </div>
    `;
  }
}

// Initialize the popup when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  new ExtensionPopup();
});
