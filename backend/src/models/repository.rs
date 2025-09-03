use crate::schema::repositories;
use chrono::{NaiveDate, NaiveDateTime};
use diesel::prelude::*;
use serde::{Deserialize, Serialize};

#[derive(Queryable, Selectable, Serialize, Deserialize, Debug, Clone)]
#[diesel(table_name = repositories)]
pub struct Repository {
    pub id: i64,
    pub github_id: i64,
    pub name: String,
    pub full_name: String,
    pub description: Option<String>,
    pub stars: i32,
    pub forks: i32,
    pub language: Option<String>,
    pub author: String,
    pub url: String,
    pub trending_date: NaiveDate,
    pub created_at: Option<NaiveDateTime>,
    pub updated_at: Option<NaiveDateTime>,
}

#[derive(Insertable, Deserialize, Debug)]
#[diesel(table_name = repositories)]
pub struct NewRepository {
    pub github_id: i64,
    pub name: String,
    pub full_name: String,
    pub description: Option<String>,
    pub stars: i32,
    pub forks: i32,
    pub language: Option<String>,
    pub author: String,
    pub url: String,
    pub trending_date: NaiveDate,
}

#[derive(AsChangeset, Deserialize, Debug)]
#[diesel(table_name = repositories)]
pub struct UpdateRepository {
    pub stars: Option<i32>,
    pub forks: Option<i32>,
    pub description: Option<String>,
    pub updated_at: Option<NaiveDateTime>,
}

#[allow(dead_code)]
impl Repository {
    /// Validate repository data
    pub fn validate(&self) -> Result<(), String> {
        if self.name.trim().is_empty() {
            return Err("Repository name cannot be empty".to_string());
        }

        if self.full_name.trim().is_empty() {
            return Err("Repository full name cannot be empty".to_string());
        }

        if self.author.trim().is_empty() {
            return Err("Repository author cannot be empty".to_string());
        }

        if self.url.trim().is_empty() {
            return Err("Repository URL cannot be empty".to_string());
        }

        if self.stars < 0 {
            return Err("Stars count cannot be negative".to_string());
        }

        if self.forks < 0 {
            return Err("Forks count cannot be negative".to_string());
        }

        Ok(())
    }

    /// Check if repository is recently trending (within last 7 days)
    pub fn is_recently_trending(&self) -> bool {
        let now = chrono::Utc::now().date_naive();
        let days_diff = now.signed_duration_since(self.trending_date).num_days();
        days_diff <= 7
    }
}

impl NewRepository {
    /// Validate new repository data
    pub fn validate(&self) -> Result<(), String> {
        if self.name.trim().is_empty() {
            return Err("Repository name cannot be empty".to_string());
        }

        if self.full_name.trim().is_empty() {
            return Err("Repository full name cannot be empty".to_string());
        }

        if self.author.trim().is_empty() {
            return Err("Repository author cannot be empty".to_string());
        }

        if self.url.trim().is_empty() {
            return Err("Repository URL cannot be empty".to_string());
        }

        if self.stars < 0 {
            return Err("Stars count cannot be negative".to_string());
        }

        if self.forks < 0 {
            return Err("Forks count cannot be negative".to_string());
        }

        Ok(())
    }
}

#[allow(dead_code)]
#[derive(Deserialize, Debug)]
pub struct RepositoryFilters {
    pub language: Option<String>,
    pub min_stars: Option<i32>,
    pub max_stars: Option<i32>,
    pub date_from: Option<NaiveDate>,
    pub date_to: Option<NaiveDate>,
    pub limit: Option<i64>,
    pub offset: Option<i64>,
}

impl Default for RepositoryFilters {
    fn default() -> Self {
        Self {
            language: None,
            min_stars: None,
            max_stars: None,
            date_from: None,
            date_to: None,
            limit: Some(50),
            offset: Some(0),
        }
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use chrono::Utc;

    fn create_test_repository() -> Repository {
        Repository {
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
        }
    }

    fn create_test_new_repository() -> NewRepository {
        NewRepository {
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
        }
    }

    #[test]
    fn test_repository_validation_success() {
        let repo = create_test_repository();
        assert!(repo.validate().is_ok());
    }

    #[test]
    fn test_repository_validation_empty_name() {
        let mut repo = create_test_repository();
        repo.name = "".to_string();
        assert!(repo.validate().is_err());
        assert_eq!(
            repo.validate().unwrap_err(),
            "Repository name cannot be empty"
        );
    }

    #[test]
    fn test_repository_validation_empty_full_name() {
        let mut repo = create_test_repository();
        repo.full_name = "".to_string();
        assert!(repo.validate().is_err());
        assert_eq!(
            repo.validate().unwrap_err(),
            "Repository full name cannot be empty"
        );
    }

    #[test]
    fn test_repository_validation_empty_author() {
        let mut repo = create_test_repository();
        repo.author = "".to_string();
        assert!(repo.validate().is_err());
        assert_eq!(
            repo.validate().unwrap_err(),
            "Repository author cannot be empty"
        );
    }

    #[test]
    fn test_repository_validation_empty_url() {
        let mut repo = create_test_repository();
        repo.url = "".to_string();
        assert!(repo.validate().is_err());
        assert_eq!(
            repo.validate().unwrap_err(),
            "Repository URL cannot be empty"
        );
    }

    #[test]
    fn test_repository_validation_negative_stars() {
        let mut repo = create_test_repository();
        repo.stars = -1;
        assert!(repo.validate().is_err());
        assert_eq!(
            repo.validate().unwrap_err(),
            "Stars count cannot be negative"
        );
    }

    #[test]
    fn test_repository_validation_negative_forks() {
        let mut repo = create_test_repository();
        repo.forks = -1;
        assert!(repo.validate().is_err());
        assert_eq!(
            repo.validate().unwrap_err(),
            "Forks count cannot be negative"
        );
    }

    #[test]
    fn test_new_repository_validation_success() {
        let new_repo = create_test_new_repository();
        assert!(new_repo.validate().is_ok());
    }

    #[test]
    fn test_new_repository_validation_empty_name() {
        let mut new_repo = create_test_new_repository();
        new_repo.name = "".to_string();
        assert!(new_repo.validate().is_err());
        assert_eq!(
            new_repo.validate().unwrap_err(),
            "Repository name cannot be empty"
        );
    }

    #[test]
    fn test_is_recently_trending_true() {
        let repo = create_test_repository();
        assert!(repo.is_recently_trending());
    }

    #[test]
    fn test_is_recently_trending_false() {
        let mut repo = create_test_repository();
        repo.trending_date = Utc::now().date_naive() - chrono::Duration::days(10);
        assert!(!repo.is_recently_trending());
    }

    #[test]
    fn test_repository_filters_default() {
        let filters = RepositoryFilters::default();
        assert_eq!(filters.limit, Some(50));
        assert_eq!(filters.offset, Some(0));
        assert!(filters.language.is_none());
        assert!(filters.min_stars.is_none());
        assert!(filters.max_stars.is_none());
    }
}
