#![allow(dead_code)]

use crate::models::repository::NewRepository;
use anyhow::Result;
use chrono::Utc;
use regex::Regex;
use reqwest::Client;
use scraper::{Html, Selector};
use std::time::Duration;
use thiserror::Error;

#[allow(dead_code)]
#[derive(Error, Debug)]
pub enum ScraperError {
    #[error("HTTP request failed: {0}")]
    HttpError(#[from] reqwest::Error),
    #[error("HTML parsing failed: {0}")]
    ParseError(String),
    #[error("Data extraction failed: {0}")]
    ExtractionError(String),
    #[error("Rate limit exceeded")]
    RateLimitError,
    #[error("GitHub trending page unavailable")]
    ServiceUnavailable,
}

#[allow(dead_code)]
pub struct GitHubScraper {
    client: Client,
    base_url: String,
    max_retries: u32,
    retry_delay: Duration,
}

impl Default for GitHubScraper {
    fn default() -> Self {
        Self::new()
    }
}

impl GitHubScraper {
    pub fn new() -> Self {
        let client = Client::builder()
            .user_agent("Mozilla/5.0 (compatible; GitHubTrendingScraper/1.0)")
            .timeout(Duration::from_secs(30))
            .build()
            .expect("Failed to create HTTP client");

        Self {
            client,
            base_url: "https://github.com/trending".to_string(),
            max_retries: 3,
            retry_delay: Duration::from_secs(2),
        }
    }

    pub fn with_config(base_url: String, max_retries: u32, retry_delay: Duration) -> Self {
        let client = Client::builder()
            .user_agent("Mozilla/5.0 (compatible; GitHubTrendingScraper/1.0)")
            .timeout(Duration::from_secs(30))
            .build()
            .expect("Failed to create HTTP client");

        Self {
            client,
            base_url,
            max_retries,
            retry_delay,
        }
    }

    /// Scrape trending repositories for today
    pub async fn scrape_trending_repositories(&self) -> Result<Vec<NewRepository>, ScraperError> {
        self.scrape_trending_repositories_with_params(None, "daily")
            .await
    }

    /// Scrape trending repositories with optional language filter and time period
    pub async fn scrape_trending_repositories_with_params(
        &self,
        language: Option<&str>,
        since: &str,
    ) -> Result<Vec<NewRepository>, ScraperError> {
        let mut url = format!("{}?since={}", self.base_url, since);
        if let Some(lang) = language {
            url = format!("{}&l={}", url, lang);
        }

        let html = self.fetch_with_retry(&url).await?;
        self.parse_trending_repositories(&html).await
    }

    async fn fetch_with_retry(&self, url: &str) -> Result<String, ScraperError> {
        let mut last_error = None;

        for attempt in 0..=self.max_retries {
            match self.client.get(url).send().await {
                Ok(response) => {
                    if response.status().is_success() {
                        match response.text().await {
                            Ok(html) => return Ok(html),
                            Err(e) => last_error = Some(ScraperError::HttpError(e)),
                        }
                    } else if response.status() == 429 {
                        return Err(ScraperError::RateLimitError);
                    } else if response.status().is_server_error() {
                        last_error = Some(ScraperError::ServiceUnavailable);
                    } else {
                        return Err(ScraperError::HttpError(
                            response.error_for_status().unwrap_err(),
                        ));
                    }
                }
                Err(e) => last_error = Some(ScraperError::HttpError(e)),
            }

            if attempt < self.max_retries {
                tokio::time::sleep(self.retry_delay * (attempt + 1)).await;
            }
        }

        Err(last_error.unwrap_or(ScraperError::ServiceUnavailable))
    }

    async fn parse_trending_repositories(
        &self,
        html: &str,
    ) -> Result<Vec<NewRepository>, ScraperError> {
        let document = Html::parse_document(html);
        let repo_selector = Selector::parse("article.Box-row").map_err(|e| {
            ScraperError::ParseError(format!("Failed to create repo selector: {:?}", e))
        })?;

        let mut repositories = Vec::new();
        let today = Utc::now().date_naive();

        for repo_element in document.select(&repo_selector) {
            match self.extract_repository_data(&repo_element, today).await {
                Ok(repo) => repositories.push(repo),
                Err(e) => {
                    log::warn!("Failed to extract repository data: {}", e);
                    continue; // Skip this repository but continue with others
                }
            }
        }

        if repositories.is_empty() {
            return Err(ScraperError::ExtractionError(
                "No repositories found on trending page".to_string(),
            ));
        }

        Ok(repositories)
    }

    async fn extract_repository_data(
        &self,
        element: &scraper::ElementRef<'_>,
        trending_date: chrono::NaiveDate,
    ) -> Result<NewRepository, ScraperError> {
        // Extract repository name and author
        let name_selector = Selector::parse("h2.h3 a").map_err(|e| {
            ScraperError::ParseError(format!("Failed to create name selector: {:?}", e))
        })?;

        let name_element = element.select(&name_selector).next().ok_or_else(|| {
            ScraperError::ExtractionError("Repository name not found".to_string())
        })?;

        let href = name_element.value().attr("href").ok_or_else(|| {
            ScraperError::ExtractionError("Repository href not found".to_string())
        })?;

        let full_name = href.trim_start_matches('/').to_string();
        let parts: Vec<&str> = full_name.split('/').collect();
        if parts.len() != 2 {
            return Err(ScraperError::ExtractionError(format!(
                "Invalid repository path: {}",
                full_name
            )));
        }

        let author = parts[0].to_string();
        let name = parts[1].to_string();
        let url = format!("https://github.com{}", href);

        // Extract description
        let desc_selector = Selector::parse("p.col-9").map_err(|e| {
            ScraperError::ParseError(format!("Failed to create description selector: {:?}", e))
        })?;

        let description = element
            .select(&desc_selector)
            .next()
            .map(|el| el.text().collect::<Vec<_>>().join(" ").trim().to_string())
            .filter(|s| !s.is_empty());

        // Extract language
        let lang_selector =
            Selector::parse("span[itemprop='programmingLanguage']").map_err(|e| {
                ScraperError::ParseError(format!("Failed to create language selector: {:?}", e))
            })?;

        let language = element
            .select(&lang_selector)
            .next()
            .map(|el| el.text().collect::<Vec<_>>().join("").trim().to_string())
            .filter(|s| !s.is_empty());

        // Extract stars and forks
        let stats_selector = Selector::parse("div.f6 a").map_err(|e| {
            ScraperError::ParseError(format!("Failed to create stats selector: {:?}", e))
        })?;

        let stats: Vec<String> = element
            .select(&stats_selector)
            .map(|el| el.text().collect::<Vec<_>>().join("").trim().to_string())
            .collect();

        let (stars, forks) = self.parse_stats(&stats)?;

        // Generate a mock GitHub ID based on the repository path
        // In a real implementation, you might want to fetch this from GitHub API
        let github_id = self.generate_github_id(&full_name);

        let new_repo = NewRepository {
            github_id,
            name,
            full_name,
            description,
            stars,
            forks,
            language,
            author,
            url,
            trending_date,
        };

        // Validate the repository data
        new_repo.validate().map_err(|e| {
            ScraperError::ExtractionError(format!("Repository validation failed: {}", e))
        })?;

        Ok(new_repo)
    }

    fn parse_stats(&self, stats: &[String]) -> Result<(i32, i32), ScraperError> {
        let number_regex = Regex::new(r"[\d,]+").map_err(|e| {
            ScraperError::ParseError(format!("Failed to create number regex: {}", e))
        })?;

        let mut stars = 0;
        let mut forks = 0;

        for stat in stats {
            if let Some(captures) = number_regex.find(stat) {
                let number_str = captures.as_str().replace(',', "");
                if let Ok(number) = number_str.parse::<i32>() {
                    if stat.contains("star") || (!stat.contains("fork") && stars == 0) {
                        stars = number;
                    } else if stat.contains("fork") {
                        forks = number;
                    }
                }
            }
        }

        Ok((stars, forks))
    }

    fn generate_github_id(&self, full_name: &str) -> i64 {
        // Generate a deterministic ID based on the repository full name
        // This is a simple hash-based approach for the MVP
        use std::collections::hash_map::DefaultHasher;
        use std::hash::{Hash, Hasher};

        let mut hasher = DefaultHasher::new();
        full_name.hash(&mut hasher);
        let hash = hasher.finish();

        // Convert to positive i64
        (hash as i64).abs()
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_scraper_creation() {
        let scraper = GitHubScraper::new();
        assert_eq!(scraper.base_url, "https://github.com/trending");
        assert_eq!(scraper.max_retries, 3);
    }

    #[test]
    fn test_scraper_with_config() {
        let scraper = GitHubScraper::with_config(
            "https://example.com".to_string(),
            5,
            Duration::from_secs(1),
        );
        assert_eq!(scraper.base_url, "https://example.com");
        assert_eq!(scraper.max_retries, 5);
        assert_eq!(scraper.retry_delay, Duration::from_secs(1));
    }

    #[test]
    fn test_parse_stats() {
        let scraper = GitHubScraper::new();

        let stats = vec!["1,234 stars".to_string(), "567 forks".to_string()];
        let (stars, forks) = scraper.parse_stats(&stats).unwrap();
        assert_eq!(stars, 1234);
        assert_eq!(forks, 567);
    }

    #[test]
    fn test_parse_stats_no_commas() {
        let scraper = GitHubScraper::new();

        let stats = vec!["42 stars".to_string(), "13 forks".to_string()];
        let (stars, forks) = scraper.parse_stats(&stats).unwrap();
        assert_eq!(stars, 42);
        assert_eq!(forks, 13);
    }

    #[test]
    fn test_generate_github_id() {
        let scraper = GitHubScraper::new();

        let id1 = scraper.generate_github_id("user/repo1");
        let id2 = scraper.generate_github_id("user/repo2");
        let id3 = scraper.generate_github_id("user/repo1"); // Same as id1

        assert_ne!(id1, id2);
        assert_eq!(id1, id3);
        assert!(id1 > 0);
        assert!(id2 > 0);
    }

    #[tokio::test]
    async fn test_parse_trending_repositories_empty_html() {
        let scraper = GitHubScraper::new();
        let html = "<html><body></body></html>";

        let result = scraper.parse_trending_repositories(html).await;
        assert!(result.is_err());

        if let Err(ScraperError::ExtractionError(msg)) = result {
            assert!(msg.contains("No repositories found"));
        } else {
            panic!("Expected ExtractionError");
        }
    }

    // Integration test - only run when INTEGRATION_TESTS env var is set
    #[tokio::test]
    #[ignore]
    async fn test_scrape_trending_repositories_integration() {
        if std::env::var("INTEGRATION_TESTS").is_err() {
            return;
        }

        let scraper = GitHubScraper::new();
        let result = scraper.scrape_trending_repositories().await;

        match result {
            Ok(repos) => {
                assert!(!repos.is_empty());
                for repo in &repos {
                    assert!(!repo.name.is_empty());
                    assert!(!repo.full_name.is_empty());
                    assert!(!repo.author.is_empty());
                    assert!(!repo.url.is_empty());
                    assert!(repo.stars >= 0);
                    assert!(repo.forks >= 0);
                    assert!(repo.validate().is_ok());
                }
            }
            Err(e) => {
                // Log the error but don't fail the test since GitHub might be unavailable
                println!("Integration test failed (this is expected in CI): {}", e);
            }
        }
    }
}
