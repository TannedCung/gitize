#![allow(dead_code)]

use crate::database::{DbConnection, DbPool};
use crate::models::{NewRepository, Repository, RepositoryFilters};
use crate::repositories::repository_repo::RepositoryRepository;
use crate::services::github_scraper::{GitHubScraper, ScraperError};
use chrono::{NaiveDate, Utc};
use std::collections::HashSet;
use std::sync::Arc;
use thiserror::Error;

#[allow(dead_code)]
#[derive(Error, Debug)]
pub enum RepositoryServiceError {
    #[error("Database error: {0}")]
    DatabaseError(#[from] diesel::result::Error),
    #[error("Connection pool error: {0}")]
    PoolError(#[from] r2d2::Error),
    #[error("Scraper error: {0}")]
    ScraperError(#[from] ScraperError),
    #[error("Data validation error: {0}")]
    ValidationError(String),
    #[error("Repository not found")]
    NotFound,
}

#[allow(dead_code)]
pub struct RepositoryService {
    db_pool: Arc<DbPool>,
    scraper: GitHubScraper,
}

impl RepositoryService {
    pub fn new(db_pool: Arc<DbPool>) -> Self {
        Self {
            db_pool,
            scraper: GitHubScraper::new(),
        }
    }

    pub fn with_scraper(db_pool: Arc<DbPool>, scraper: GitHubScraper) -> Self {
        Self { db_pool, scraper }
    }

    /// Get trending repositories with optional filters
    pub async fn get_trending_repositories(
        &self,
        filters: RepositoryFilters,
    ) -> Result<Vec<Repository>, RepositoryServiceError> {
        let mut conn = self.db_pool.get()?;
        let repositories = RepositoryRepository::find_all(&mut conn, filters)?;
        Ok(repositories)
    }

    /// Search repositories by query
    pub async fn search_repositories(
        &self,
        query: &str,
        limit: Option<i64>,
        offset: Option<i64>,
    ) -> Result<Vec<Repository>, RepositoryServiceError> {
        let mut conn = self.db_pool.get()?;
        let repositories = RepositoryRepository::search(&mut conn, query, limit, offset)?;
        Ok(repositories)
    }

    /// Get repository by ID
    pub async fn get_repository_by_id(
        &self,
        id: i64,
    ) -> Result<Repository, RepositoryServiceError> {
        let mut conn = self.db_pool.get()?;
        let repository = RepositoryRepository::find_by_id(&mut conn, id)?;
        Ok(repository)
    }

    /// Get repository by GitHub ID
    pub async fn get_repository_by_github_id(
        &self,
        github_id: i64,
    ) -> Result<Option<Repository>, RepositoryServiceError> {
        let mut conn = self.db_pool.get()?;
        let repository = RepositoryRepository::find_by_github_id(&mut conn, github_id)?;
        Ok(repository)
    }

    /// Refresh trending data by scraping GitHub
    pub async fn refresh_trending_data(&self) -> Result<RefreshResult, RepositoryServiceError> {
        log::info!("Starting trending data refresh");

        // Scrape trending repositories
        let scraped_repos = self.scraper.scrape_trending_repositories().await?;
        log::info!("Scraped {} repositories", scraped_repos.len());

        let mut conn = self.db_pool.get()?;
        let mut result = RefreshResult::new();

        // Process each scraped repository
        for scraped_repo in scraped_repos {
            match self
                .process_scraped_repository(&mut conn, scraped_repo)
                .await
            {
                Ok(ProcessResult::Created(repo)) => {
                    result.created.push(repo);
                }
                Ok(ProcessResult::Updated(repo)) => {
                    result.updated.push(repo);
                }
                Ok(ProcessResult::Skipped(reason)) => {
                    result.skipped.push(reason);
                }
                Err(e) => {
                    log::warn!("Failed to process repository: {}", e);
                    result.errors.push(e.to_string());
                }
            }
        }

        // Remove duplicates from today's trending data
        self.deduplicate_trending_data(&mut conn).await?;

        log::info!(
            "Refresh completed: {} created, {} updated, {} skipped, {} errors",
            result.created.len(),
            result.updated.len(),
            result.skipped.len(),
            result.errors.len()
        );

        Ok(result)
    }

    /// Refresh trending data with specific parameters
    pub async fn refresh_trending_data_with_params(
        &self,
        language: Option<&str>,
        since: &str,
    ) -> Result<RefreshResult, RepositoryServiceError> {
        log::info!(
            "Starting trending data refresh with params: language={:?}, since={}",
            language,
            since
        );

        let scraped_repos = self
            .scraper
            .scrape_trending_repositories_with_params(language, since)
            .await?;
        log::info!("Scraped {} repositories", scraped_repos.len());

        let mut conn = self.db_pool.get()?;
        let mut result = RefreshResult::new();

        for scraped_repo in scraped_repos {
            match self
                .process_scraped_repository(&mut conn, scraped_repo)
                .await
            {
                Ok(ProcessResult::Created(repo)) => {
                    result.created.push(repo);
                }
                Ok(ProcessResult::Updated(repo)) => {
                    result.updated.push(repo);
                }
                Ok(ProcessResult::Skipped(reason)) => {
                    result.skipped.push(reason);
                }
                Err(e) => {
                    log::warn!("Failed to process repository: {}", e);
                    result.errors.push(e.to_string());
                }
            }
        }

        self.deduplicate_trending_data(&mut conn).await?;

        log::info!(
            "Refresh completed: {} created, {} updated, {} skipped, {} errors",
            result.created.len(),
            result.updated.len(),
            result.skipped.len(),
            result.errors.len()
        );

        Ok(result)
    }

    /// Get trending repositories for a specific date
    pub async fn get_trending_by_date(
        &self,
        date: NaiveDate,
    ) -> Result<Vec<Repository>, RepositoryServiceError> {
        let mut conn = self.db_pool.get()?;
        let repositories = RepositoryRepository::find_trending_by_date(&mut conn, date)?;
        Ok(repositories)
    }

    /// Get top repositories by language
    pub async fn get_top_by_language(
        &self,
        language: &str,
        limit: i64,
    ) -> Result<Vec<Repository>, RepositoryServiceError> {
        let mut conn = self.db_pool.get()?;
        let repositories = RepositoryRepository::find_top_by_language(&mut conn, language, limit)?;
        Ok(repositories)
    }

    /// Get repository statistics
    pub async fn get_statistics(&self) -> Result<RepositoryStatistics, RepositoryServiceError> {
        let mut conn = self.db_pool.get()?;

        let total_count = RepositoryRepository::count(&mut conn)?;
        let today = Utc::now().date_naive();
        let today_repos = RepositoryRepository::find_trending_by_date(&mut conn, today)?;
        let today_count = today_repos.len() as i64;

        Ok(RepositoryStatistics {
            total_repositories: total_count,
            trending_today: today_count,
            last_updated: today,
        })
    }

    async fn process_scraped_repository(
        &self,
        conn: &mut DbConnection,
        scraped_repo: NewRepository,
    ) -> Result<ProcessResult, RepositoryServiceError> {
        // Check if repository already exists
        if let Some(existing_repo) =
            RepositoryRepository::find_by_github_id(conn, scraped_repo.github_id)?
        {
            // Check if we need to update (stars or forks changed significantly)
            if self.should_update_repository(&existing_repo, &scraped_repo) {
                let updated_repo = RepositoryRepository::upsert(conn, scraped_repo)?;
                Ok(ProcessResult::Updated(updated_repo))
            } else {
                Ok(ProcessResult::Skipped(format!(
                    "Repository {} already up to date",
                    scraped_repo.full_name
                )))
            }
        } else {
            // Create new repository
            let new_repo = RepositoryRepository::create(conn, scraped_repo)?;
            Ok(ProcessResult::Created(new_repo))
        }
    }

    fn should_update_repository(&self, existing: &Repository, scraped: &NewRepository) -> bool {
        // Update if stars or forks changed by more than 5% or if it's been more than a day
        let stars_diff = (existing.stars - scraped.stars).abs() as f64;
        let forks_diff = (existing.forks - scraped.forks).abs() as f64;

        let stars_change_percent = if existing.stars > 0 {
            stars_diff / existing.stars as f64
        } else {
            1.0 // Always update if existing has 0 stars
        };

        let forks_change_percent = if existing.forks > 0 {
            forks_diff / existing.forks as f64
        } else {
            1.0 // Always update if existing has 0 forks
        };

        let significant_change = stars_change_percent > 0.05 || forks_change_percent > 0.05;

        // Also update if the trending date is different (new trending period)
        let date_changed = existing.trending_date != scraped.trending_date;

        // Update if description changed
        let description_changed = existing.description != scraped.description;

        significant_change || date_changed || description_changed
    }

    async fn deduplicate_trending_data(
        &self,
        conn: &mut DbConnection,
    ) -> Result<(), RepositoryServiceError> {
        // Get today's trending repositories
        let today = Utc::now().date_naive();
        let today_repos = RepositoryRepository::find_trending_by_date(conn, today)?;

        // Track seen GitHub IDs to identify duplicates
        let mut seen_github_ids = HashSet::new();
        let mut duplicates_to_remove = Vec::new();

        for repo in today_repos {
            if seen_github_ids.contains(&repo.github_id) {
                duplicates_to_remove.push(repo.id);
            } else {
                seen_github_ids.insert(repo.github_id);
            }
        }

        // Remove duplicates (keep the first occurrence)
        for duplicate_id in duplicates_to_remove {
            RepositoryRepository::delete(conn, duplicate_id)?;
            log::info!("Removed duplicate repository with ID: {}", duplicate_id);
        }

        Ok(())
    }
}

#[derive(Debug)]
pub struct RefreshResult {
    pub created: Vec<Repository>,
    pub updated: Vec<Repository>,
    pub skipped: Vec<String>,
    pub errors: Vec<String>,
}

impl RefreshResult {
    fn new() -> Self {
        Self {
            created: Vec::new(),
            updated: Vec::new(),
            skipped: Vec::new(),
            errors: Vec::new(),
        }
    }

    pub fn total_processed(&self) -> usize {
        self.created.len() + self.updated.len() + self.skipped.len()
    }

    pub fn success_count(&self) -> usize {
        self.created.len() + self.updated.len()
    }

    pub fn has_errors(&self) -> bool {
        !self.errors.is_empty()
    }
}

#[derive(Debug)]
enum ProcessResult {
    Created(Repository),
    Updated(Repository),
    Skipped(String),
}

#[derive(Debug, serde::Serialize)]
pub struct RepositoryStatistics {
    pub total_repositories: i64,
    pub trending_today: i64,
    pub last_updated: NaiveDate,
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_refresh_result() {
        let mut result = RefreshResult::new();

        assert_eq!(result.total_processed(), 0);
        assert_eq!(result.success_count(), 0);
        assert!(!result.has_errors());

        result.errors.push("Test error".to_string());
        assert!(result.has_errors());

        result.skipped.push("Skipped repo".to_string());
        assert_eq!(result.total_processed(), 1);
        assert_eq!(result.success_count(), 0);
    }

    // Integration tests would go here but require database setup
    // They should be run with a test database
}
