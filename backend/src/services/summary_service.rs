#![allow(dead_code)]

use crate::database::DbPool;
use crate::models::{NewSummary, Repository, Summary};
use crate::repositories::SummaryRepository;
use crate::services::{LLMClient, LLMError, RepositoryContext};
use std::sync::Arc;
use thiserror::Error;
use tokio::task;

#[allow(dead_code)]
#[derive(Error, Debug)]
pub enum SummaryServiceError {
    #[error("Database error: {0}")]
    DatabaseError(#[from] diesel::result::Error),
    #[error("LLM error: {0}")]
    LLMError(#[from] LLMError),
    #[error("Repository not found: {0}")]
    RepositoryNotFound(i64),
    #[error("Summary generation failed: {0}")]
    GenerationFailed(String),
    #[error("Connection pool error: {0}")]
    PoolError(#[from] r2d2::Error),
}

#[allow(dead_code)]
#[derive(Debug, Clone)]
pub struct SummaryService {
    db_pool: Arc<DbPool>,
    llm_client: Arc<LLMClient>,
}

impl SummaryService {
    pub fn new(db_pool: Arc<DbPool>, llm_client: Arc<LLMClient>) -> Self {
        Self {
            db_pool,
            llm_client,
        }
    }

    /// Get summary for a repository, generating it if it doesn't exist or is outdated
    pub async fn get_or_generate_summary(
        &self,
        repository: &Repository,
    ) -> Result<Summary, SummaryServiceError> {
        // First, try to get cached summary
        if let Some(cached_summary) = self.get_cached_summary(repository.id).await? {
            if cached_summary.is_recent() {
                return Ok(cached_summary);
            }
        }

        // Generate new summary if not cached or outdated
        self.generate_and_cache_summary(repository).await
    }

    /// Get cached summary from database
    pub async fn get_cached_summary(
        &self,
        repository_id: i64,
    ) -> Result<Option<Summary>, SummaryServiceError> {
        let db_pool = Arc::clone(&self.db_pool);

        let summary =
            task::spawn_blocking(move || -> Result<Option<Summary>, SummaryServiceError> {
                let mut conn = db_pool.get()?;
                let result = SummaryRepository::find_by_repository_id(&mut conn, repository_id)?;
                Ok(result)
            })
            .await
            .map_err(|e| {
                SummaryServiceError::GenerationFailed(format!("Task join error: {}", e))
            })??;

        Ok(summary)
    }

    /// Generate new summary and cache it in database
    pub async fn generate_and_cache_summary(
        &self,
        repository: &Repository,
    ) -> Result<Summary, SummaryServiceError> {
        // Create repository context for LLM
        let repo_context = RepositoryContext {
            name: repository.name.clone(),
            description: repository.description.clone(),
            language: repository.language.clone(),
            stars: repository.stars,
            forks: repository.forks,
            author: repository.author.clone(),
        };

        // Generate summary using LLM
        let summary_content = self.llm_client.generate_summary(&repo_context).await?;

        // Cache the summary in database
        let new_summary = NewSummary {
            repository_id: repository.id,
            content: summary_content,
        };

        let db_pool = Arc::clone(&self.db_pool);
        let summary = task::spawn_blocking(move || -> Result<Summary, SummaryServiceError> {
            let mut conn = db_pool.get()?;
            let result = SummaryRepository::upsert(&mut conn, new_summary)?;
            Ok(result)
        })
        .await
        .map_err(|e| SummaryServiceError::GenerationFailed(format!("Task join error: {}", e)))??;

        Ok(summary)
    }

    /// Generate summaries for multiple repositories in batch
    pub async fn generate_batch_summaries(
        &self,
        repositories: Vec<Repository>,
    ) -> Result<Vec<Result<Summary, SummaryServiceError>>, SummaryServiceError> {
        let mut results = Vec::new();

        for repository in repositories {
            let result = self.generate_and_cache_summary(&repository).await;
            results.push(result);
        }

        Ok(results)
    }

    /// Refresh outdated summaries
    pub async fn refresh_outdated_summaries(
        &self,
        max_age_days: i32,
    ) -> Result<Vec<Summary>, SummaryServiceError> {
        // Get repositories that have outdated summaries or no summaries
        let repositories = self
            .get_repositories_needing_summaries(max_age_days)
            .await?;

        let mut refreshed_summaries = Vec::new();

        for repository in repositories {
            match self.generate_and_cache_summary(&repository).await {
                Ok(summary) => refreshed_summaries.push(summary),
                Err(e) => {
                    log::warn!(
                        "Failed to refresh summary for repository {}: {}",
                        repository.id,
                        e
                    );
                    // Continue with other repositories instead of failing the entire batch
                }
            }
        }

        Ok(refreshed_summaries)
    }

    /// Get repositories that need summary generation or refresh
    async fn get_repositories_needing_summaries(
        &self,
        _max_age_days: i32,
    ) -> Result<Vec<Repository>, SummaryServiceError> {
        let db_pool = Arc::clone(&self.db_pool);

        let repositories =
            task::spawn_blocking(move || -> Result<Vec<Repository>, SummaryServiceError> {
                let mut conn = db_pool.get()?;

                // This is a simplified query - in a real implementation, you'd want to join
                // repositories with summaries and filter by age
                use crate::schema::repositories;
                use diesel::prelude::*;

                let repos = repositories::table
                    .limit(100) // Limit batch size
                    .load::<Repository>(&mut conn)?;
                Ok(repos)
            })
            .await
            .map_err(|e| {
                SummaryServiceError::GenerationFailed(format!("Task join error: {}", e))
            })??;

        // Filter repositories that need summary refresh
        let mut filtered_repositories = Vec::new();

        for repository in repositories {
            match self.get_cached_summary(repository.id).await? {
                Some(summary) if summary.is_recent() => {
                    // Skip repositories with recent summaries
                    continue;
                }
                _ => {
                    // Include repositories with no summary or outdated summary
                    filtered_repositories.push(repository);
                }
            }
        }

        Ok(filtered_repositories)
    }

    /// Delete summary for a repository
    pub async fn delete_summary(&self, repository_id: i64) -> Result<bool, SummaryServiceError> {
        let db_pool = Arc::clone(&self.db_pool);

        let deleted_count = task::spawn_blocking(move || -> Result<usize, SummaryServiceError> {
            let mut conn = db_pool.get()?;
            let count = SummaryRepository::delete_by_repository_id(&mut conn, repository_id)?;
            Ok(count)
        })
        .await
        .map_err(|e| SummaryServiceError::GenerationFailed(format!("Task join error: {}", e)))??;

        Ok(deleted_count > 0)
    }

    /// Get summary statistics
    pub async fn get_summary_statistics(&self) -> Result<SummaryStatistics, SummaryServiceError> {
        let db_pool = Arc::clone(&self.db_pool);

        let (total_summaries, recent_summaries) =
            task::spawn_blocking(move || -> Result<(i64, i64), SummaryServiceError> {
                let mut conn = db_pool.get()?;

                let total = SummaryRepository::count(&mut conn)?;
                let recent = SummaryRepository::find_recent(&mut conn, 30, None)?.len() as i64;

                Ok((total, recent))
            })
            .await
            .map_err(|e| {
                SummaryServiceError::GenerationFailed(format!("Task join error: {}", e))
            })??;

        Ok(SummaryStatistics {
            total_summaries,
            recent_summaries,
        })
    }
}

#[derive(Debug, Clone)]
pub struct SummaryStatistics {
    pub total_summaries: i64,
    pub recent_summaries: i64,
}

#[cfg(test)]
mod tests {
    use super::*;
    use chrono::Utc;

    #[allow(dead_code)]
    fn create_test_repository() -> Repository {
        Repository {
            id: 1,
            github_id: 123456789,
            name: "test-repo".to_string(),
            full_name: "user/test-repo".to_string(),
            description: Some("A test repository for summary generation".to_string()),
            stars: 100,
            forks: 20,
            language: Some("Rust".to_string()),
            author: "testuser".to_string(),
            url: "https://github.com/user/test-repo".to_string(),
            trending_date: Utc::now().date_naive(),
            created_at: Some(Utc::now().naive_utc()),
            updated_at: Some(Utc::now().naive_utc()),
        }
    }

    #[test]
    fn test_summary_statistics() {
        let stats = SummaryStatistics {
            total_summaries: 100,
            recent_summaries: 50,
        };

        assert_eq!(stats.total_summaries, 100);
        assert_eq!(stats.recent_summaries, 50);
    }

    #[test]
    fn test_repository_context_creation() {
        let repository = Repository {
            id: 1,
            github_id: 123456789,
            name: "test-repo".to_string(),
            full_name: "user/test-repo".to_string(),
            description: Some("A test repository".to_string()),
            stars: 100,
            forks: 20,
            language: Some("Rust".to_string()),
            author: "user".to_string(),
            url: "https://github.com/user/test-repo".to_string(),
            trending_date: Utc::now().date_naive(),
            created_at: Some(Utc::now().naive_utc()),
            updated_at: Some(Utc::now().naive_utc()),
        };

        let repo_context = RepositoryContext {
            name: repository.name.clone(),
            description: repository.description.clone(),
            language: repository.language.clone(),
            stars: repository.stars,
            forks: repository.forks,
            author: repository.author.clone(),
        };

        assert_eq!(repo_context.name, "test-repo");
        assert_eq!(
            repo_context.description,
            Some("A test repository".to_string())
        );
        assert_eq!(repo_context.language, Some("Rust".to_string()));
        assert_eq!(repo_context.stars, 100);
        assert_eq!(repo_context.forks, 20);
        assert_eq!(repo_context.author, "user");
    }
}
