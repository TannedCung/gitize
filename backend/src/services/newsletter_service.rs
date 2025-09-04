use crate::database::DbPool;
use crate::models::{NewNewsletterSubscription, NewsletterSubscription};
use crate::repositories::newsletter_repo::NewsletterRepository;
use std::sync::Arc;
use thiserror::Error;

#[derive(Error, Debug)]
pub enum NewsletterServiceError {
    #[error("Database error: {0}")]
    DatabaseError(#[from] diesel::result::Error),
    #[error("Connection pool error: {0}")]
    PoolError(#[from] r2d2::Error),
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
}

impl NewsletterService {
    pub fn new(db_pool: Arc<DbPool>) -> Self {
        Self { db_pool }
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
