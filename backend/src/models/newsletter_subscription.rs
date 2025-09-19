use crate::schema::newsletter_subscriptions;
use chrono::NaiveDateTime;
use diesel::prelude::*;
use serde::{Deserialize, Serialize};

#[derive(Queryable, Selectable, Serialize, Deserialize, Debug, Clone)]
#[diesel(table_name = newsletter_subscriptions)]
#[diesel(check_for_backend(diesel::pg::Pg))]
pub struct NewsletterSubscription {
    pub id: i64,
    pub email: String,
    pub unsubscribe_token: String,
    pub subscribed_at: Option<NaiveDateTime>,
    pub is_active: Option<bool>,
    pub user_id: Option<i64>,
    pub frequency: Option<String>,
    pub preferred_languages: Option<Vec<Option<String>>>,
    pub tech_stack_interests: Option<Vec<Option<String>>>,
    pub last_sent_at: Option<NaiveDateTime>,
    pub engagement_score: Option<f64>,
}

#[derive(Insertable, Deserialize, Debug)]
#[diesel(table_name = newsletter_subscriptions)]
pub struct NewNewsletterSubscription {
    pub email: String,
    pub unsubscribe_token: String,
    pub user_id: Option<i64>,
    pub frequency: Option<String>,
    pub preferred_languages: Option<Vec<Option<String>>>,
    pub tech_stack_interests: Option<Vec<Option<String>>>,
}

#[derive(AsChangeset, Deserialize, Debug)]
#[diesel(table_name = newsletter_subscriptions)]
pub struct UpdateNewsletterSubscription {
    pub is_active: Option<bool>,
    pub frequency: Option<String>,
    pub preferred_languages: Option<Vec<Option<String>>>,
    pub tech_stack_interests: Option<Vec<Option<String>>>,
    pub last_sent_at: Option<NaiveDateTime>,
    pub engagement_score: Option<f64>,
}

#[allow(dead_code)]
impl NewsletterSubscription {
    /// Validate newsletter subscription data
    pub fn validate(&self) -> Result<(), String> {
        if !self.is_valid_email() {
            return Err("Invalid email format".to_string());
        }

        if self.unsubscribe_token.trim().is_empty() {
            return Err("Unsubscribe token cannot be empty".to_string());
        }

        Ok(())
    }

    /// Check if email format is valid
    pub fn is_valid_email(&self) -> bool {
        let email_regex =
            regex::Regex::new(r"^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$").unwrap();
        email_regex.is_match(&self.email)
    }

    /// Check if subscription is active
    pub fn is_active(&self) -> bool {
        self.is_active.unwrap_or(true)
    }

    /// Generate unsubscribe URL
    pub fn unsubscribe_url(&self, base_url: &str) -> String {
        format!(
            "{}/api/newsletter/unsubscribe/{}",
            base_url, self.unsubscribe_token
        )
    }
}

impl NewNewsletterSubscription {
    /// Create new subscription with generated token
    pub fn new(email: String) -> Self {
        Self {
            email,
            unsubscribe_token: uuid::Uuid::new_v4().to_string(),
            user_id: None,
            frequency: Some("weekly".to_string()),
            preferred_languages: None,
            tech_stack_interests: None,
        }
    }

    /// Create new subscription with user ID
    pub fn new_with_user(email: String, user_id: i64) -> Self {
        Self {
            email,
            unsubscribe_token: uuid::Uuid::new_v4().to_string(),
            user_id: Some(user_id),
            frequency: Some("weekly".to_string()),
            preferred_languages: None,
            tech_stack_interests: None,
        }
    }

    /// Validate new newsletter subscription data
    pub fn validate(&self) -> Result<(), String> {
        if !self.is_valid_email() {
            return Err("Invalid email format".to_string());
        }

        if self.unsubscribe_token.trim().is_empty() {
            return Err("Unsubscribe token cannot be empty".to_string());
        }

        Ok(())
    }

    /// Check if email format is valid
    pub fn is_valid_email(&self) -> bool {
        let email_regex =
            regex::Regex::new(r"^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$").unwrap();
        email_regex.is_match(&self.email)
    }
}
