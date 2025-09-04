use crate::database::DbPool;
use crate::models::{Repository, RepositoryFilters};
use crate::services::repository_service::{RepositoryService, RepositoryServiceError};
use chrono::NaiveDate;
use rocket::serde::json::Json;
use rocket::{get, routes, Route, State};
use serde::{Deserialize, Serialize};
use std::str::FromStr;
use std::sync::Arc;

#[derive(Deserialize, rocket::FromForm)]
pub struct TrendingQuery {
    language: Option<String>,
    min_stars: Option<i32>,
    max_stars: Option<i32>,
    date_from: Option<String>,
    date_to: Option<String>,
    limit: Option<i64>,
    offset: Option<i64>,
}

#[derive(Deserialize, rocket::FromForm)]
pub struct SearchQuery {
    q: String,
    limit: Option<i64>,
    offset: Option<i64>,
}

#[derive(Deserialize, rocket::FromForm)]
pub struct AdvancedSearchQuery {
    q: String,
    language: Option<String>,
    min_stars: Option<i32>,
    limit: Option<i64>,
    offset: Option<i64>,
}

#[derive(Serialize)]
pub struct TrendingResponse {
    repositories: Vec<Repository>,
    total: usize,
    limit: i64,
    offset: i64,
    has_more: bool,
}

#[derive(Serialize)]
pub struct SearchResponse {
    repositories: Vec<Repository>,
    query: String,
    total: usize,
    limit: i64,
    offset: i64,
    has_more: bool,
}

#[derive(Serialize)]
pub struct ErrorResponse {
    error: String,
    code: String,
}

impl From<RepositoryServiceError> for ErrorResponse {
    fn from(error: RepositoryServiceError) -> Self {
        let code = match error {
            RepositoryServiceError::DatabaseError(_) => "DATABASE_ERROR",
            RepositoryServiceError::PoolError(_) => "CONNECTION_ERROR",
            RepositoryServiceError::ScraperError(_) => "SCRAPER_ERROR",
            RepositoryServiceError::ValidationError(_) => "VALIDATION_ERROR",
            RepositoryServiceError::NotFound => "NOT_FOUND",
        };

        ErrorResponse {
            error: error.to_string(),
            code: code.to_string(),
        }
    }
}

#[get("/repositories/trending?<query..>")]
pub async fn get_trending_repositories(
    db_pool: &State<Arc<DbPool>>,
    query: TrendingQuery,
) -> Result<Json<TrendingResponse>, Json<ErrorResponse>> {
    let service = RepositoryService::new(db_pool.inner().clone());

    // Parse date strings if provided
    let date_from = if let Some(date_str) = query.date_from {
        match NaiveDate::from_str(&date_str) {
            Ok(date) => Some(date),
            Err(_) => {
                return Err(Json(ErrorResponse {
                    error: "Invalid date_from format. Use YYYY-MM-DD".to_string(),
                    code: "VALIDATION_ERROR".to_string(),
                }));
            }
        }
    } else {
        None
    };

    let date_to = if let Some(date_str) = query.date_to {
        match NaiveDate::from_str(&date_str) {
            Ok(date) => Some(date),
            Err(_) => {
                return Err(Json(ErrorResponse {
                    error: "Invalid date_to format. Use YYYY-MM-DD".to_string(),
                    code: "VALIDATION_ERROR".to_string(),
                }));
            }
        }
    } else {
        None
    };

    let filters = RepositoryFilters {
        language: query.language,
        min_stars: query.min_stars,
        max_stars: query.max_stars,
        date_from,
        date_to,
        limit: query.limit.or(Some(50)),
        offset: query.offset.or(Some(0)),
    };

    match service.get_trending_repositories(filters).await {
        Ok(repositories) => {
            let total = repositories.len();
            let limit = query.limit.unwrap_or(50);
            let offset = query.offset.unwrap_or(0);
            let has_more = total as i64 >= limit;

            Ok(Json(TrendingResponse {
                repositories,
                total,
                limit,
                offset,
                has_more,
            }))
        }
        Err(e) => Err(Json(e.into())),
    }
}

#[get("/repositories/search?<query..>")]
pub async fn search_repositories(
    db_pool: &State<Arc<DbPool>>,
    query: SearchQuery,
) -> Result<Json<SearchResponse>, Json<ErrorResponse>> {
    let service = RepositoryService::new(db_pool.inner().clone());

    let limit = query.limit.unwrap_or(50);
    let offset = query.offset.unwrap_or(0);

    match service
        .search_repositories(&query.q, Some(limit), Some(offset))
        .await
    {
        Ok(repositories) => {
            let total = repositories.len();
            let has_more = total as i64 >= limit;

            Ok(Json(SearchResponse {
                repositories,
                query: query.q,
                total,
                limit,
                offset,
                has_more,
            }))
        }
        Err(e) => Err(Json(e.into())),
    }
}

#[get("/repositories/search/advanced?<query..>")]
pub async fn advanced_search_repositories(
    db_pool: &State<Arc<DbPool>>,
    query: AdvancedSearchQuery,
) -> Result<Json<SearchResponse>, Json<ErrorResponse>> {
    let service = RepositoryService::new(db_pool.inner().clone());

    let limit = query.limit.unwrap_or(50);
    let offset = query.offset.unwrap_or(0);

    match service
        .advanced_search_repositories(
            &query.q,
            query.language,
            query.min_stars,
            Some(limit),
            Some(offset),
        )
        .await
    {
        Ok(repositories) => {
            let total = repositories.len();
            let has_more = total as i64 >= limit;

            Ok(Json(SearchResponse {
                repositories,
                query: query.q,
                total,
                limit,
                offset,
                has_more,
            }))
        }
        Err(e) => Err(Json(e.into())),
    }
}

pub fn routes() -> Vec<Route> {
    routes![
        get_trending_repositories,
        search_repositories,
        advanced_search_repositories
    ]
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_error_response_from_service_error() {
        let db_error = RepositoryServiceError::DatabaseError(diesel::result::Error::NotFound);
        let error_response: ErrorResponse = db_error.into();
        assert_eq!(error_response.code, "DATABASE_ERROR");

        let validation_error = RepositoryServiceError::ValidationError("Invalid input".to_string());
        let error_response: ErrorResponse = validation_error.into();
        assert_eq!(error_response.code, "VALIDATION_ERROR");
    }

    #[test]
    fn test_trending_response_has_more_calculation() {
        let repositories: Vec<Repository> = vec![];
        let limit = 50;
        let has_more = repositories.len() as i64 >= limit;
        assert!(!has_more);

        // Test with exactly limit number of items
        let repositories: Vec<Repository> = (0..50)
            .map(|i| Repository {
                id: i,
                github_id: i,
                name: format!("repo-{}", i),
                full_name: format!("user/repo-{}", i),
                description: None,
                stars: 100,
                forks: 10,
                language: Some("Rust".to_string()),
                author: "user".to_string(),
                url: format!("https://github.com/user/repo-{}", i),
                trending_date: chrono::Utc::now().date_naive(),
                created_at: None,
                updated_at: None,
            })
            .collect();

        let has_more = repositories.len() as i64 >= limit;
        assert!(has_more);
    }

    #[test]
    fn test_search_query_validation() {
        let search_query = SearchQuery {
            q: "rust".to_string(),
            limit: Some(10),
            offset: Some(0),
        };

        assert_eq!(search_query.q, "rust");
        assert_eq!(search_query.limit, Some(10));
        assert_eq!(search_query.offset, Some(0));
    }

    #[test]
    fn test_advanced_search_query_validation() {
        let advanced_query = AdvancedSearchQuery {
            q: "react".to_string(),
            language: Some("JavaScript".to_string()),
            min_stars: Some(100),
            limit: Some(20),
            offset: Some(10),
        };

        assert_eq!(advanced_query.q, "react");
        assert_eq!(advanced_query.language, Some("JavaScript".to_string()));
        assert_eq!(advanced_query.min_stars, Some(100));
        assert_eq!(advanced_query.limit, Some(20));
        assert_eq!(advanced_query.offset, Some(10));
    }
}
