use crate::database::DbPool;
use crate::repositories::user_repo::UserRepository;
use crate::services::{
    auth_service::AuthService, referral_service::ReferralService, AlertingConfig, AlertingService,
    MetricsCollector, NewsletterService, NewsletterServiceError, RepositoryService,
    RepositoryServiceError, SchedulerError, SchedulerService,
};
use std::sync::Arc;
use thiserror::Error;

#[derive(Error, Debug)]
pub enum ServiceManagerError {
    #[error("Newsletter service error: {0}")]
    NewsletterServiceError(#[from] NewsletterServiceError),
    #[error("Repository service error: {0}")]
    RepositoryServiceError(#[from] RepositoryServiceError),
    #[error("Scheduler service error: {0}")]
    SchedulerServiceError(#[from] SchedulerError),
}

pub struct ServiceManager {
    pub repository_service: Arc<RepositoryService>,
    pub newsletter_service: Arc<NewsletterService>,
    pub scheduler_service: Arc<tokio::sync::Mutex<SchedulerService>>,
    pub metrics_collector: Arc<MetricsCollector>,
    pub alerting_service: Arc<AlertingService>,
    pub auth_service: Arc<AuthService>,
    pub user_repository: Arc<UserRepository>,
    pub referral_service: Arc<ReferralService>,
}

impl ServiceManager {
    pub async fn new(db_pool: Arc<DbPool>) -> Result<Self, ServiceManagerError> {
        let repository_service = Arc::new(RepositoryService::new(db_pool.clone()));
        let newsletter_service = Arc::new(NewsletterService::new(
            db_pool.clone(),
            repository_service.clone(),
        )?);
        let metrics_collector = Arc::new(MetricsCollector::new());

        // Initialize user repository and auth service
        let user_repository = Arc::new(UserRepository::new(db_pool.clone()));
        let auth_service = Arc::new(AuthService::new(user_repository.clone()).map_err(|e| {
            ServiceManagerError::RepositoryServiceError(RepositoryServiceError::ValidationError(
                e.to_string(),
            ))
        })?);
        let referral_service = Arc::new(ReferralService::new(user_repository.clone()));

        // Initialize alerting service with configuration from environment
        let alerting_config = AlertingConfig {
            enabled: std::env::var("ALERTING_ENABLED")
                .unwrap_or_else(|_| "true".to_string())
                .parse()
                .unwrap_or(true),
            max_alerts: std::env::var("MAX_ALERTS")
                .unwrap_or_else(|_| "1000".to_string())
                .parse()
                .unwrap_or(1000),
            alert_retention_hours: std::env::var("ALERT_RETENTION_HOURS")
                .unwrap_or_else(|_| "168".to_string()) // 7 days
                .parse()
                .unwrap_or(168),
            email_notifications: std::env::var("ALERT_EMAIL_NOTIFICATIONS")
                .unwrap_or_else(|_| "false".to_string())
                .parse()
                .unwrap_or(false),
            webhook_url: std::env::var("ALERT_WEBHOOK_URL").ok(),
        };
        let alerting_service = Arc::new(AlertingService::new(alerting_config));

        let scheduler_service = Arc::new(tokio::sync::Mutex::new(
            SchedulerService::new(repository_service.clone(), newsletter_service.clone())
                .await?
                .with_metrics(metrics_collector.clone())
                .with_alerting(alerting_service.clone()),
        ));

        Ok(Self {
            repository_service,
            newsletter_service,
            scheduler_service,
            metrics_collector,
            alerting_service,
            auth_service,
            user_repository,
            referral_service,
        })
    }

    pub async fn start_scheduler(&self) -> Result<(), ServiceManagerError> {
        self.scheduler_service.lock().await.start().await?;
        Ok(())
    }

    pub async fn shutdown_scheduler(&self) -> Result<(), ServiceManagerError> {
        self.scheduler_service.lock().await.shutdown().await?;
        Ok(())
    }
}
