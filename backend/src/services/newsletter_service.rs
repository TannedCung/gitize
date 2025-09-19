use crate::database::DbPool;
use crate::models::{
    NewNewsletterSubscription, NewsletterSubscription, Repository, RepositoryFilters,
};
use crate::repositories::newsletter_repo::NewsletterRepository;
use crate::services::ab_testing::{ABTest, ABTestError, ABTestingFramework, EventType};
use crate::services::email_client::{EmailClient, EmailError};
use crate::services::newsletter_analytics::{
    CampaignAnalytics, EngagementEventType, NewsletterAnalyticsError, NewsletterAnalyticsService,
    UTMParameters,
};
use crate::services::newsletter_template::{NewsletterTemplate, TemplateError};
use crate::services::personalization_engine::{
    PersonalizationEngine, PersonalizationError, PersonalizationPreferences, UserSegment,
};
use crate::services::repository_service::{RepositoryService, RepositoryServiceError};
use chrono::{DateTime, Datelike, Duration, Utc};
use std::collections::HashMap;
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
    #[error("Personalization error: {0}")]
    PersonalizationError(#[from] PersonalizationError),
    #[error("A/B testing error: {0}")]
    ABTestError(#[from] ABTestError),
    #[error("Newsletter analytics error: {0}")]
    AnalyticsError(#[from] NewsletterAnalyticsError),
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
    personalization_engine: PersonalizationEngine,
    ab_testing_framework: ABTestingFramework,
    analytics_service: NewsletterAnalyticsService,
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
        let personalization_engine = PersonalizationEngine::new();
        let ab_testing_framework = ABTestingFramework::new();
        let analytics_service = NewsletterAnalyticsService::new();

        let base_url = env::var("BASE_URL").unwrap_or_else(|_| "http://localhost:3000".to_string());

        Ok(Self {
            db_pool,
            repository_service,
            email_client,
            template,
            personalization_engine,
            ab_testing_framework,
            analytics_service,
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

    /// Subscribe with advanced preferences
    pub async fn subscribe_with_preferences(
        &self,
        email: String,
        user_id: Option<i64>,
        frequency: Option<String>,
        preferred_languages: Option<Vec<String>>,
        tech_stack_interests: Option<Vec<String>>,
    ) -> Result<NewsletterSubscription, NewsletterServiceError> {
        let mut conn = self.db_pool.get()?;

        // Check if email is already subscribed
        if NewsletterRepository::is_subscribed(&mut conn, &email)? {
            return Err(NewsletterServiceError::AlreadySubscribed);
        }

        // Check if there's an inactive subscription we can reactivate
        if let Some(existing) = NewsletterRepository::find_by_email(&mut conn, &email)? {
            if !existing.is_active() {
                // Update preferences and reactivate
                let _updated_subscription = NewsletterRepository::update_preferences(
                    &mut conn,
                    &email,
                    frequency.clone(),
                    preferred_languages
                        .clone()
                        .map(|langs| langs.into_iter().map(Some).collect()),
                    tech_stack_interests
                        .clone()
                        .map(|interests| interests.into_iter().map(Some).collect()),
                )?;
                let reactivated = NewsletterRepository::reactivate_by_email(&mut conn, &email)?;
                return Ok(reactivated);
            }
        }

        // Create new subscription with preferences
        let mut new_subscription = NewNewsletterSubscription::new(email);
        new_subscription.user_id = user_id;
        new_subscription.frequency = frequency;
        new_subscription.preferred_languages =
            preferred_languages.map(|langs| langs.into_iter().map(Some).collect());
        new_subscription.tech_stack_interests =
            tech_stack_interests.map(|interests| interests.into_iter().map(Some).collect());

        let subscription = NewsletterRepository::create(&mut conn, new_subscription)?;

        log::info!(
            "New newsletter subscription with preferences created: {}",
            subscription.email
        );
        Ok(subscription)
    }

    /// Update subscription preferences
    pub async fn update_preferences(
        &self,
        email: &str,
        frequency: Option<String>,
        preferred_languages: Option<Vec<String>>,
        tech_stack_interests: Option<Vec<String>>,
    ) -> Result<NewsletterSubscription, NewsletterServiceError> {
        let mut conn = self.db_pool.get()?;

        let updated_subscription = NewsletterRepository::update_preferences(
            &mut conn,
            email,
            frequency,
            preferred_languages.map(|langs| langs.into_iter().map(Some).collect()),
            tech_stack_interests.map(|interests| interests.into_iter().map(Some).collect()),
        )?;

        log::info!("Newsletter preferences updated for: {}", email);
        Ok(updated_subscription)
    }

    /// Send personalized newsletter to specific segment
    pub async fn send_personalized_newsletter(
        &mut self,
        segment_id: Option<String>,
        test_id: Option<String>,
    ) -> Result<PersonalizedNewsletterResult, NewsletterServiceError> {
        log::info!("Starting personalized newsletter generation and sending");

        // Get repositories for personalization
        let repositories = self.get_repositories_for_newsletter(20).await?;

        if repositories.is_empty() {
            log::warn!("No repositories found for personalized newsletter");
            return Ok(PersonalizedNewsletterResult::new());
        }

        // Get subscriptions based on segment
        let subscriptions = if let Some(segment_id) = segment_id {
            self.get_subscriptions_by_segment(&segment_id).await?
        } else {
            self.get_active_subscriptions(None, None).await?
        };

        if subscriptions.is_empty() {
            log::info!("No active subscriptions found for segment");
            return Ok(PersonalizedNewsletterResult::new());
        }

        let mut result = PersonalizedNewsletterResult::new();
        let (week_start, week_end) = self.get_current_week_dates();

        for subscription in subscriptions {
            // Create personalization preferences from subscription
            let preferences = self
                .create_personalization_preferences(&subscription)
                .await?;

            // Personalize content for this user
            let personalized_content = self
                .personalization_engine
                .personalize_content(repositories.clone(), &preferences)?;

            // Handle A/B testing if test is active
            let (subject, template_config) = if let Some(test_id) = &test_id {
                self.handle_ab_testing(test_id, &subscription).await?
            } else {
                (
                    format!(
                        "🚀 Your Personalized GitHub Trending - {} to {}",
                        week_start, week_end
                    ),
                    HashMap::new(),
                )
            };

            // Generate personalized newsletter content
            let unsubscribe_url = format!(
                "{}/newsletter/unsubscribe/{}",
                self.base_url, subscription.unsubscribe_token
            );

            let html_content = self.template.render_personalized_html_newsletter(
                &personalized_content.repositories,
                &unsubscribe_url,
                &week_start,
                &week_end,
                &personalized_content.segment,
                &personalized_content.reasons,
                &template_config,
            )?;

            let text_content = self.template.render_personalized_text_newsletter(
                &personalized_content.repositories,
                &unsubscribe_url,
                &week_start,
                &week_end,
                &personalized_content.segment,
                &personalized_content.reasons,
            )?;

            // Send personalized newsletter
            match self
                .email_client
                .send_newsletter(
                    &subscription.email,
                    &subject,
                    &html_content,
                    &text_content,
                    &unsubscribe_url,
                )
                .await
            {
                Ok(_) => {
                    result.successful_sends.push(subscription.email.clone());
                    result.personalization_scores.insert(
                        subscription.email.clone(),
                        personalized_content.personalization_score,
                    );

                    // Record A/B test event if applicable
                    if let Some(test_id) = &test_id {
                        let assignment = self
                            .ab_testing_framework
                            .get_user_assignment(&subscription.email)
                            .cloned();

                        if let Some(assignment) = assignment {
                            let mut event_data = HashMap::new();
                            event_data.insert(
                                "personalization_score".to_string(),
                                serde_json::Value::Number(
                                    serde_json::Number::from_f64(
                                        personalized_content.personalization_score,
                                    )
                                    .unwrap(),
                                ),
                            );

                            self.ab_testing_framework.record_event(
                                test_id,
                                &assignment.variant_id,
                                subscription.user_id,
                                &subscription.email,
                                EventType::EmailSent,
                                event_data,
                            )?;
                        }
                    }

                    // Update engagement score and last sent timestamp
                    self.update_engagement_metrics(&subscription.email, 0.1)
                        .await?;
                }
                Err(e) => {
                    log::warn!(
                        "Failed to send personalized newsletter to {}: {}",
                        subscription.email,
                        e
                    );
                    result
                        .failed_sends
                        .push((subscription.email, e.to_string()));
                }
            }

            // Add delay to avoid rate limiting
            tokio::time::sleep(tokio::time::Duration::from_millis(200)).await;
        }

        log::info!(
            "Personalized newsletter sending completed: {} successful, {} failed",
            result.successful_sends.len(),
            result.failed_sends.len()
        );

        Ok(result)
    }

    /// Get subscriptions by user segment
    pub async fn get_subscriptions_by_segment(
        &self,
        segment_id: &str,
    ) -> Result<Vec<NewsletterSubscription>, NewsletterServiceError> {
        let all_subscriptions = self.get_active_subscriptions(None, None).await?;
        let mut segmented_subscriptions = Vec::new();

        for subscription in all_subscriptions {
            let preferences = self
                .create_personalization_preferences(&subscription)
                .await?;
            let user_segment = self
                .personalization_engine
                .determine_user_segment(&preferences)?;

            if user_segment.id == segment_id {
                segmented_subscriptions.push(subscription);
            }
        }

        Ok(segmented_subscriptions)
    }

    /// Create A/B test for newsletter campaigns
    pub async fn create_newsletter_ab_test(
        &mut self,
        test: ABTest,
    ) -> Result<String, NewsletterServiceError> {
        let test_id = self.ab_testing_framework.create_test(test)?;
        Ok(test_id)
    }

    /// Start A/B test
    pub async fn start_ab_test(&mut self, test_id: &str) -> Result<(), NewsletterServiceError> {
        self.ab_testing_framework.start_test(test_id)?;
        Ok(())
    }

    /// Get A/B test results
    pub async fn get_ab_test_results(
        &self,
        test_id: &str,
    ) -> Result<crate::services::ab_testing::TestResults, NewsletterServiceError> {
        let results = self.ab_testing_framework.analyze_test_results(test_id)?;
        Ok(results)
    }

    /// Get user segments and statistics
    pub async fn get_user_segments(&self) -> Result<Vec<UserSegmentStats>, NewsletterServiceError> {
        let subscriptions = self.get_active_subscriptions(None, None).await?;
        let mut segment_stats = HashMap::new();

        for subscription in subscriptions {
            let preferences = self
                .create_personalization_preferences(&subscription)
                .await?;
            let segment = self
                .personalization_engine
                .determine_user_segment(&preferences)?;

            let stats = segment_stats
                .entry(segment.id.clone())
                .or_insert(UserSegmentStats {
                    segment,
                    user_count: 0,
                    avg_engagement_score: 0.0,
                    total_engagement: 0.0,
                });

            stats.user_count += 1;
            stats.total_engagement += subscription.engagement_score.unwrap_or(0.0);
            stats.avg_engagement_score = stats.total_engagement / stats.user_count as f64;
        }

        Ok(segment_stats.into_values().collect())
    }

    /// Create personalization preferences from subscription
    async fn create_personalization_preferences(
        &self,
        subscription: &NewsletterSubscription,
    ) -> Result<PersonalizationPreferences, NewsletterServiceError> {
        let preferred_languages = subscription
            .preferred_languages
            .as_ref()
            .map(|langs| langs.iter().filter_map(|l| l.clone()).collect())
            .unwrap_or_default();

        let tech_stack_interests = subscription
            .tech_stack_interests
            .as_ref()
            .map(|interests| interests.iter().filter_map(|i| i.clone()).collect())
            .unwrap_or_default();

        Ok(PersonalizationPreferences {
            preferred_languages,
            tech_stack_interests,
            frequency: subscription
                .frequency
                .clone()
                .unwrap_or_else(|| "weekly".to_string()),
            engagement_score: subscription.engagement_score.unwrap_or(0.5),
            user_id: subscription.user_id,
            signup_date: subscription
                .subscribed_at
                .map(|dt| DateTime::from_naive_utc_and_offset(dt, Utc)),
        })
    }

    /// Handle A/B testing for newsletter
    async fn handle_ab_testing(
        &mut self,
        test_id: &str,
        subscription: &NewsletterSubscription,
    ) -> Result<(String, HashMap<String, serde_json::Value>), NewsletterServiceError> {
        // Assign user to test variant
        let assignment = self.ab_testing_framework.assign_user_to_test(
            test_id,
            subscription.user_id,
            &subscription.email,
        )?;

        // Get test configuration
        let test = self.ab_testing_framework.get_test(test_id).ok_or_else(|| {
            NewsletterServiceError::ABTestError(ABTestError::TestNotFound(test_id.to_string()))
        })?;

        // Find variant configuration
        let variant = test
            .variants
            .iter()
            .find(|v| v.id == assignment.variant_id)
            .ok_or_else(|| {
                NewsletterServiceError::ABTestError(ABTestError::InvalidConfiguration(
                    "Variant not found".to_string(),
                ))
            })?;

        // Extract subject line and template configuration
        let subject = variant
            .configuration
            .subject_line
            .clone()
            .unwrap_or_else(|| "🚀 GitHub Trending Weekly".to_string());

        let mut template_config = HashMap::new();
        if let Some(repo_count) = variant.configuration.repository_count {
            template_config.insert(
                "repository_count".to_string(),
                serde_json::Value::Number(serde_json::Number::from(repo_count)),
            );
        }
        if let Some(include_social_proof) = variant.configuration.include_social_proof {
            template_config.insert(
                "include_social_proof".to_string(),
                serde_json::Value::Bool(include_social_proof),
            );
        }
        if let Some(cta_text) = &variant.configuration.cta_text {
            template_config.insert(
                "cta_text".to_string(),
                serde_json::Value::String(cta_text.clone()),
            );
        }

        Ok((subject, template_config))
    }

    /// Update engagement metrics for a user
    async fn update_engagement_metrics(
        &self,
        email: &str,
        engagement_delta: f64,
    ) -> Result<(), NewsletterServiceError> {
        let mut conn = self.db_pool.get()?;
        NewsletterRepository::update_engagement_score(&mut conn, email, engagement_delta)?;
        Ok(())
    }

    /// Get repositories for newsletter with enhanced filtering
    async fn get_repositories_for_newsletter(
        &self,
        limit: usize,
    ) -> Result<Vec<Repository>, NewsletterServiceError> {
        let end_date = Utc::now().date_naive();
        let start_date = end_date - Duration::days(7);

        let filters = RepositoryFilters {
            language: None,
            min_stars: Some(5), // Lower threshold for more variety
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

    /// Create a newsletter campaign for analytics tracking
    pub async fn create_campaign(
        &mut self,
        name: String,
        subject_line: String,
        template_version: String,
        segment_criteria: Option<serde_json::Value>,
    ) -> Result<String, NewsletterServiceError> {
        let campaign_id = self.analytics_service.create_campaign(
            name,
            subject_line,
            template_version,
            segment_criteria,
        )?;
        Ok(campaign_id)
    }

    /// Track email engagement event
    #[allow(clippy::too_many_arguments)]
    pub async fn track_engagement(
        &mut self,
        campaign_id: String,
        email: String,
        user_id: Option<i64>,
        event_type: EngagementEventType,
        event_data: std::collections::HashMap<String, serde_json::Value>,
        user_agent: Option<String>,
        ip_address: Option<String>,
    ) -> Result<String, NewsletterServiceError> {
        let engagement_id = self.analytics_service.track_engagement(
            campaign_id,
            email,
            user_id,
            event_type,
            event_data,
            user_agent,
            ip_address,
        )?;
        Ok(engagement_id)
    }

    /// Generate UTM parameters for newsletter links
    pub async fn generate_utm_parameters(
        &self,
        campaign_id: &str,
        link_identifier: &str,
    ) -> Result<UTMParameters, NewsletterServiceError> {
        let utm_params = self
            .analytics_service
            .generate_utm_parameters(campaign_id, link_identifier)?;
        Ok(utm_params)
    }

    /// Add UTM tracking to a URL
    pub async fn add_utm_tracking_to_url(
        &self,
        base_url: &str,
        utm_params: &UTMParameters,
    ) -> Result<String, NewsletterServiceError> {
        let tracked_url = self
            .analytics_service
            .add_utm_to_url(base_url, utm_params)?;
        Ok(tracked_url)
    }

    /// Get comprehensive analytics for a campaign
    pub async fn get_campaign_analytics(
        &self,
        campaign_id: &str,
    ) -> Result<CampaignAnalytics, NewsletterServiceError> {
        let analytics = self.analytics_service.get_campaign_analytics(campaign_id)?;
        Ok(analytics)
    }

    /// Get analytics for all campaigns
    pub async fn get_all_campaigns_analytics(&self) -> Vec<CampaignAnalytics> {
        self.analytics_service.get_all_campaigns_analytics()
    }

    /// Compare multiple campaigns
    pub async fn compare_campaigns(
        &self,
        campaign_ids: Vec<String>,
    ) -> Result<crate::services::newsletter_analytics::CampaignComparison, NewsletterServiceError>
    {
        let comparison = self.analytics_service.compare_campaigns(campaign_ids)?;
        Ok(comparison)
    }

    /// Get segment performance analytics
    pub async fn get_segment_performance(
        &self,
    ) -> Vec<crate::services::newsletter_analytics::SegmentPerformance> {
        self.analytics_service.get_segment_performance()
    }

    /// Get optimization recommendations for a segment
    pub async fn get_optimization_recommendations(
        &self,
        segment_id: &str,
    ) -> Result<Vec<String>, NewsletterServiceError> {
        let recommendations = self
            .analytics_service
            .get_optimization_recommendations(segment_id)?;
        Ok(recommendations)
    }

    /// Send newsletter with analytics tracking
    pub async fn send_tracked_newsletter(
        &mut self,
        campaign_name: String,
        subject_line: String,
        segment_id: Option<String>,
        test_id: Option<String>,
    ) -> Result<TrackedNewsletterResult, NewsletterServiceError> {
        log::info!("Starting tracked newsletter campaign: {}", campaign_name);

        // Create campaign for tracking
        let segment_criteria = segment_id
            .as_ref()
            .map(|id| serde_json::json!({ "segment_id": id }));

        let campaign_id = self.analytics_service.create_campaign(
            campaign_name.clone(),
            subject_line.clone(),
            "v1.0".to_string(),
            segment_criteria,
        )?;

        // Get repositories for newsletter
        let repositories = self.get_repositories_for_newsletter(20).await?;

        if repositories.is_empty() {
            log::warn!("No repositories found for tracked newsletter");
            return Ok(TrackedNewsletterResult::new(campaign_id));
        }

        // Get subscriptions based on segment
        let subscriptions = if let Some(segment_id) = segment_id {
            self.get_subscriptions_by_segment(&segment_id).await?
        } else {
            self.get_active_subscriptions(None, None).await?
        };

        if subscriptions.is_empty() {
            log::info!("No active subscriptions found for segment");
            return Ok(TrackedNewsletterResult::new(campaign_id));
        }

        // Mark campaign as sent
        self.analytics_service
            .mark_campaign_sent(&campaign_id, subscriptions.len() as i32)?;

        let mut result = TrackedNewsletterResult::new(campaign_id.clone());
        let (week_start, week_end) = self.get_current_week_dates();

        for subscription in subscriptions {
            // Create personalization preferences from subscription
            let preferences = self
                .create_personalization_preferences(&subscription)
                .await?;

            // Personalize content for this user
            let personalized_content = self
                .personalization_engine
                .personalize_content(repositories.clone(), &preferences)?;

            // Handle A/B testing if test is active
            let (final_subject, template_config) = if let Some(test_id) = &test_id {
                self.handle_ab_testing(test_id, &subscription).await?
            } else {
                (subject_line.clone(), std::collections::HashMap::new())
            };

            // Generate UTM parameters for tracking
            let utm_params = self
                .analytics_service
                .generate_utm_parameters(&campaign_id, "newsletter")?;

            // Generate newsletter content with UTM tracking
            let unsubscribe_url = format!(
                "{}/newsletter/unsubscribe/{}",
                self.base_url, subscription.unsubscribe_token
            );

            let tracked_unsubscribe_url = self
                .analytics_service
                .add_utm_to_url(&unsubscribe_url, &utm_params)?;

            let html_content = self.template.render_personalized_html_newsletter(
                &personalized_content.repositories,
                &tracked_unsubscribe_url,
                &week_start,
                &week_end,
                &personalized_content.segment,
                &personalized_content.reasons,
                &template_config,
            )?;

            let text_content = self.template.render_personalized_text_newsletter(
                &personalized_content.repositories,
                &tracked_unsubscribe_url,
                &week_start,
                &week_end,
                &personalized_content.segment,
                &personalized_content.reasons,
            )?;

            // Send newsletter
            match self
                .email_client
                .send_newsletter(
                    &subscription.email,
                    &final_subject,
                    &html_content,
                    &text_content,
                    &tracked_unsubscribe_url,
                )
                .await
            {
                Ok(_) => {
                    result.successful_sends.push(subscription.email.clone());
                    result.personalization_scores.insert(
                        subscription.email.clone(),
                        personalized_content.personalization_score,
                    );

                    // Track sent event
                    self.analytics_service.track_engagement(
                        campaign_id.clone(),
                        subscription.email.clone(),
                        subscription.user_id,
                        EngagementEventType::Sent,
                        std::collections::HashMap::new(),
                        None,
                        None,
                    )?;

                    // Record A/B test event if applicable
                    if let Some(test_id) = &test_id {
                        let assignment_variant = self
                            .ab_testing_framework
                            .get_user_assignment(&subscription.email)
                            .map(|a| a.variant_id.clone());

                        if let Some(variant_id) = assignment_variant {
                            let mut event_data = std::collections::HashMap::new();
                            event_data.insert(
                                "campaign_id".to_string(),
                                serde_json::Value::String(campaign_id.clone()),
                            );
                            event_data.insert(
                                "personalization_score".to_string(),
                                serde_json::Value::Number(
                                    serde_json::Number::from_f64(
                                        personalized_content.personalization_score,
                                    )
                                    .unwrap(),
                                ),
                            );

                            self.ab_testing_framework.record_event(
                                test_id,
                                &variant_id,
                                subscription.user_id,
                                &subscription.email,
                                EventType::EmailSent,
                                event_data,
                            )?;
                        }
                    }

                    // Update engagement score and last sent timestamp
                    self.update_engagement_metrics(&subscription.email, 0.1)
                        .await?;
                }
                Err(e) => {
                    log::warn!(
                        "Failed to send tracked newsletter to {}: {}",
                        subscription.email,
                        e
                    );
                    result
                        .failed_sends
                        .push((subscription.email, e.to_string()));
                }
            }

            // Add delay to avoid rate limiting
            tokio::time::sleep(tokio::time::Duration::from_millis(200)).await;
        }

        log::info!(
            "Tracked newsletter campaign completed: {} successful, {} failed",
            result.successful_sends.len(),
            result.failed_sends.len()
        );

        Ok(result)
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

#[derive(Debug, serde::Serialize)]
pub struct PersonalizedNewsletterResult {
    pub successful_sends: Vec<String>,
    pub failed_sends: Vec<(String, String)>, // (email, error_message)
    pub personalization_scores: HashMap<String, f64>, // email -> personalization_score
    pub total_repositories: usize,
}

#[derive(Debug, serde::Serialize)]
pub struct UserSegmentStats {
    pub segment: UserSegment,
    pub user_count: usize,
    pub avg_engagement_score: f64,
    pub total_engagement: f64,
}

#[derive(Debug, serde::Serialize)]
pub struct TrackedNewsletterResult {
    pub campaign_id: String,
    pub successful_sends: Vec<String>,
    pub failed_sends: Vec<(String, String)>, // (email, error_message)
    pub personalization_scores: HashMap<String, f64>, // email -> personalization_score
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

impl Default for PersonalizedNewsletterResult {
    fn default() -> Self {
        Self::new()
    }
}

impl PersonalizedNewsletterResult {
    pub fn new() -> Self {
        Self {
            successful_sends: Vec::new(),
            failed_sends: Vec::new(),
            personalization_scores: HashMap::new(),
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

    pub fn avg_personalization_score(&self) -> f64 {
        if self.personalization_scores.is_empty() {
            0.0
        } else {
            let total: f64 = self.personalization_scores.values().sum();
            total / self.personalization_scores.len() as f64
        }
    }
}

impl Default for TrackedNewsletterResult {
    fn default() -> Self {
        Self::new("".to_string())
    }
}

impl TrackedNewsletterResult {
    pub fn new(campaign_id: String) -> Self {
        Self {
            campaign_id,
            successful_sends: Vec::new(),
            failed_sends: Vec::new(),
            personalization_scores: HashMap::new(),
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

    pub fn avg_personalization_score(&self) -> f64 {
        if self.personalization_scores.is_empty() {
            0.0
        } else {
            let total: f64 = self.personalization_scores.values().sum();
            total / self.personalization_scores.len() as f64
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
