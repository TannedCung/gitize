use crate::database::DbPool;
use crate::models::{
    NewNewsletterSubscription, NewsletterSubscription, Repository, RepositoryFilters,
};
use crate::repositories::newsletter_repo::NewsletterRepository;
use crate::services::email_client::{EmailClient, EmailError};
use crate::services::newsletter_template::{NewsletterTemplate, TemplateError};
use crate::services::repository_service::{RepositoryService, RepositoryServiceError};
use chrono::{Datelike, Duration, Utc};
use std::env;
use std::sync::Arc;
use thiserror::Error;

#[derive(Error, Debug)]
pub enum NewsletterServiceError {
    #[error("Database error: {0}")]
    DatabaseError(#[from] diesel::result::Error),
    #[error("Connection pool error: {0}")]
    PoolError(#[from] r2d2::Error),
    #[error("Repository service error: {0}")]
    RepositoryServiceError(#[from] RepositoryServiceError),
    #[error("Email service error: {0}")]
    EmailError(#[from] EmailError),
    #[error("Template error: {0}")]
    TemplateError(#[from] TemplateError),
    #[error("Configuration error: {0}")]
    ConfigError(String),
    #[error("Validation error: {0}")]
    ValidationError(String),
    #[error("Email already subscribed")]
    AlreadySubscribed,
    #[error("Subscription not found")]
    NotFound,
    #[error("Invalid unsubscribe token")]
    InvalidToken,
}

pub struct NewsletterService {
    db_pool: Arc<DbPool>,
    repository_service: Arc<RepositoryService>,
    email_client: EmailClient,
    template: NewsletterTemplate,
    base_url: String,
}

impl NewsletterService {
    pub fn new(
        db_pool: Arc<DbPool>,
        repository_service: Arc<RepositoryService>,
    ) -> Result<Self, NewsletterServiceError> {
        let email_client = EmailClient::new().map_err(|e| {
            NewsletterServiceError::ConfigError(format!("Email client setup failed: {}", e))
        })?;

        let template = NewsletterTemplate::new().map_err(NewsletterServiceError::TemplateError)?;

        let base_url = env::var("BASE_URL").unwrap_or_else(|_| "http://localhost:3000".to_string());

        Ok(Self {
            db_pool,
            repository_service,
            email_client,
            template,
            base_url,
        })
    }

    /// Subscribe a new email to the newsletter
    pub async fn subscribe(
        &self,
        email: String,
    ) -> Result<NewsletterSubscription, NewsletterServiceError> {
        let mut conn = self.db_pool.get()?;

        // Check if email is already subscribed
        if NewsletterRepository::is_subscribed(&mut conn, &email)? {
            return Err(NewsletterServiceError::AlreadySubscribed);
        }

        // Check if there's an inactive subscription we can reactivate
        if let Some(existing) = NewsletterRepository::find_by_email(&mut conn, &email)? {
            if !existing.is_active() {
                // Reactivate existing subscription
                let reactivated = NewsletterRepository::reactivate_by_email(&mut conn, &email)?;
                return Ok(reactivated);
            }
        }

        // Create new subscription
        let new_subscription = NewNewsletterSubscription::new(email);
        let subscription = NewsletterRepository::create(&mut conn, new_subscription)?;

        log::info!(
            "New newsletter subscription created: {}",
            subscription.email
        );
        Ok(subscription)
    }

    /// Unsubscribe using unsubscribe token
    pub async fn unsubscribe(
        &self,
        token: String,
    ) -> Result<NewsletterSubscription, NewsletterServiceError> {
        let mut conn = self.db_pool.get()?;

        // Find subscription by token
        let subscription = NewsletterRepository::find_by_token(&mut conn, &token)?
            .ok_or(NewsletterServiceError::InvalidToken)?;

        if !subscription.is_active() {
            return Err(NewsletterServiceError::NotFound);
        }

        // Deactivate subscription
        let unsubscribed = NewsletterRepository::deactivate_by_token(&mut conn, &token)?;

        log::info!(
            "Newsletter subscription deactivated: {}",
            unsubscribed.email
        );
        Ok(unsubscribed)
    }

    /// Get subscription by email
    pub async fn get_subscription_by_email(
        &self,
        email: &str,
    ) -> Result<Option<NewsletterSubscription>, NewsletterServiceError> {
        let mut conn = self.db_pool.get()?;
        let subscription = NewsletterRepository::find_by_email(&mut conn, email)?;
        Ok(subscription)
    }

    /// Get all active subscriptions
    pub async fn get_active_subscriptions(
        &self,
        limit: Option<i64>,
        offset: Option<i64>,
    ) -> Result<Vec<NewsletterSubscription>, NewsletterServiceError> {
        let mut conn = self.db_pool.get()?;
        let subscriptions = NewsletterRepository::find_active(&mut conn, limit, offset)?;
        Ok(subscriptions)
    }

    /// Check if email is subscribed
    pub async fn is_subscribed(&self, email: &str) -> Result<bool, NewsletterServiceError> {
        let mut conn = self.db_pool.get()?;
        let is_subscribed = NewsletterRepository::is_subscribed(&mut conn, email)?;
        Ok(is_subscribed)
    }

    /// Get subscription statistics
    pub async fn get_statistics(&self) -> Result<NewsletterStatistics, NewsletterServiceError> {
        let mut conn = self.db_pool.get()?;
        let (total, active, inactive) = NewsletterRepository::get_stats(&mut conn)?;

        Ok(NewsletterStatistics {
            total_subscriptions: total,
            active_subscriptions: active,
            inactive_subscriptions: inactive,
        })
    }

    /// Generate and send weekly newsletter to all active subscribers
    pub async fn send_weekly_newsletter(
        &self,
    ) -> Result<NewsletterSendResult, NewsletterServiceError> {
        log::info!("Starting weekly newsletter generation and sending");

        // Get top 5 trending repositories from the past week
        let top_repos = self.get_top_weekly_repositories(5).await?;

        if top_repos.is_empty() {
            log::warn!("No trending repositories found for this week");
            return Ok(NewsletterSendResult::new());
        }

        // Get all active subscriptions
        let subscriptions = self.get_active_subscriptions(None, None).await?;

        if subscriptions.is_empty() {
            log::info!("No active subscriptions found");
            return Ok(NewsletterSendResult::new());
        }

        // Generate newsletter content
        let (week_start, week_end) = self.get_current_week_dates();
        let subject = format!("🚀 GitHub Trending Weekly - {} to {}", week_start, week_end);

        // Prepare recipients with unsubscribe URLs
        let recipients: Vec<(String, String)> = subscriptions
            .iter()
            .map(|sub| {
                let unsubscribe_url = format!(
                    "{}/newsletter/unsubscribe/{}",
                    self.base_url, sub.unsubscribe_token
                );
                (sub.email.clone(), unsubscribe_url)
            })
            .collect();

        // Generate newsletter templates
        let html_content = self.template.render_html_newsletter(
            &top_repos,
            "", // Will be replaced per recipient
            &week_start,
            &week_end,
        )?;

        let text_content = self.template.render_text_newsletter(
            &top_repos,
            "", // Will be replaced per recipient
            &week_start,
            &week_end,
        )?;

        // Send newsletters
        let mut result = NewsletterSendResult::new();

        for (email, unsubscribe_url) in recipients {
            // Customize content with recipient-specific unsubscribe URL
            let personalized_html = html_content.replace("{{unsubscribe_url}}", &unsubscribe_url);
            let personalized_text = text_content.replace("{{unsubscribe_url}}", &unsubscribe_url);

            match self
                .email_client
                .send_newsletter(
                    &email,
                    &subject,
                    &personalized_html,
                    &personalized_text,
                    &unsubscribe_url,
                )
                .await
            {
                Ok(_) => {
                    result.successful_sends.push(email);
                }
                Err(e) => {
                    log::warn!("Failed to send newsletter to {}: {}", email, e);
                    result.failed_sends.push((email, e.to_string()));
                }
            }

            // Add delay to avoid rate limiting
            tokio::time::sleep(tokio::time::Duration::from_millis(200)).await;
        }

        log::info!(
            "Weekly newsletter sending completed: {} successful, {} failed",
            result.successful_sends.len(),
            result.failed_sends.len()
        );

        Ok(result)
    }

    /// Get top trending repositories from the past week
    async fn get_top_weekly_repositories(
        &self,
        limit: usize,
    ) -> Result<Vec<Repository>, NewsletterServiceError> {
        let end_date = Utc::now().date_naive();
        let start_date = end_date - Duration::days(7);

        // Get repositories from the past week, sorted by stars
        let filters = RepositoryFilters {
            language: None,
            min_stars: Some(10), // Only include repos with at least 10 stars
            max_stars: None,
            date_from: Some(start_date),
            date_to: Some(end_date),
            limit: Some(limit as i64),
            offset: None,
        };

        let mut repositories = self
            .repository_service
            .get_trending_repositories(filters)
            .await?;

        // Sort by stars descending and take top N
        repositories.sort_by(|a, b| b.stars.cmp(&a.stars));
        repositories.truncate(limit);

        Ok(repositories)
    }

    /// Get current week date range for newsletter
    fn get_current_week_dates(&self) -> (String, String) {
        let today = Utc::now().date_naive();
        let days_since_monday = today.weekday().num_days_from_monday();

        let week_start = today - Duration::days(days_since_monday as i64);
        let week_end = week_start + Duration::days(6);

        let week_start_str = week_start.format("%b %d, %Y").to_string();
        let week_end_str = week_end.format("%b %d, %Y").to_string();

        (week_start_str, week_end_str)
    }

    /// Send newsletter to a specific email (for testing)
    pub async fn send_test_newsletter(&self, email: &str) -> Result<(), NewsletterServiceError> {
        // Validate email
        Self::validate_email(email)?;

        // Get top 5 repositories
        let top_repos = self.get_top_weekly_repositories(5).await?;

        if top_repos.is_empty() {
            return Err(NewsletterServiceError::ValidationError(
                "No trending repositories available for newsletter".to_string(),
            ));
        }

        // Generate content
        let (week_start, week_end) = self.get_current_week_dates();
        let subject = "🚀 Test Newsletter - GitHub Trending Weekly".to_string();
        let unsubscribe_url = format!("{}/newsletter/unsubscribe/test", self.base_url);

        let html_content = self.template.render_html_newsletter(
            &top_repos,
            &unsubscribe_url,
            &week_start,
            &week_end,
        )?;

        let text_content = self.template.render_text_newsletter(
            &top_repos,
            &unsubscribe_url,
            &week_start,
            &week_end,
        )?;

        // Send email
        self.email_client
            .send_newsletter(
                email,
                &subject,
                &html_content,
                &text_content,
                &unsubscribe_url,
            )
            .await?;

        log::info!("Test newsletter sent successfully to: {}", email);
        Ok(())
    }

    /// Validate email format
    pub fn validate_email(email: &str) -> Result<(), NewsletterServiceError> {
        let email_regex = regex::Regex::new(r"^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$")
            .map_err(|e| NewsletterServiceError::ValidationError(format!("Regex error: {}", e)))?;

        if !email_regex.is_match(email) {
            return Err(NewsletterServiceError::ValidationError(
                "Invalid email format".to_string(),
            ));
        }

        Ok(())
    }
}

#[derive(Debug, serde::Serialize)]
pub struct NewsletterStatistics {
    pub total_subscriptions: i64,
    pub active_subscriptions: i64,
    pub inactive_subscriptions: i64,
}

#[derive(Debug, serde::Serialize)]
pub struct NewsletterSendResult {
    pub successful_sends: Vec<String>,
    pub failed_sends: Vec<(String, String)>, // (email, error_message)
    pub total_repositories: usize,
}

impl Default for NewsletterSendResult {
    fn default() -> Self {
        Self::new()
    }
}

impl NewsletterSendResult {
    pub fn new() -> Self {
        Self {
            successful_sends: Vec::new(),
            failed_sends: Vec::new(),
            total_repositories: 0,
        }
    }

    pub fn total_attempted(&self) -> usize {
        self.successful_sends.len() + self.failed_sends.len()
    }

    pub fn success_rate(&self) -> f64 {
        let total = self.total_attempted();
        if total == 0 {
            0.0
        } else {
            self.successful_sends.len() as f64 / total as f64
        }
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_validate_email_valid() {
        assert!(NewsletterService::validate_email("test@example.com").is_ok());
        assert!(NewsletterService::validate_email("user.name+tag@domain.co.uk").is_ok());
        assert!(NewsletterService::validate_email("user123@test-domain.org").is_ok());
    }

    #[test]
    fn test_validate_email_invalid() {
        assert!(NewsletterService::validate_email("invalid-email").is_err());
        assert!(NewsletterService::validate_email("@domain.com").is_err());
        assert!(NewsletterService::validate_email("user@").is_err());
        assert!(NewsletterService::validate_email("user@domain").is_err());
        assert!(NewsletterService::validate_email("").is_err());
    }

    #[test]
    fn test_newsletter_statistics() {
        let stats = NewsletterStatistics {
            total_subscriptions: 100,
            active_subscriptions: 85,
            inactive_subscriptions: 15,
        };

        assert_eq!(stats.total_subscriptions, 100);
        assert_eq!(stats.active_subscriptions, 85);
        assert_eq!(stats.inactive_subscriptions, 15);
    }
}
