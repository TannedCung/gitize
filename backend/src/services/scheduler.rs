use crate::services::{
    AlertingService, MetricsCollector, NewsletterService, RepositoryService, StructuredLogger,
};
use chrono::{DateTime, Utc};
use log::{error, info, warn};
use serde::{Deserialize, Serialize};
use std::collections::HashMap;
use std::sync::Arc;
use thiserror::Error;
use tokio::sync::{mpsc, RwLock};
use tokio_cron_scheduler::{Job, JobScheduler};
use uuid::Uuid;

#[derive(Error, Debug)]
pub enum SchedulerError {
    #[error("Job not found: {0}")]
    JobNotFound(String),
    #[error("Service error: {0}")]
    ServiceError(String),
    #[error("Scheduler error: {0}")]
    SchedulerError(String),
    #[error("Cron scheduler error: {0}")]
    CronSchedulerError(#[from] tokio_cron_scheduler::JobSchedulerError),
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum JobStatus {
    Scheduled,
    Running,
    Completed,
    Failed,
    Cancelled,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct JobExecution {
    pub id: String,
    pub job_name: String,
    pub status: JobStatus,
    pub started_at: Option<DateTime<Utc>>,
    pub completed_at: Option<DateTime<Utc>>,
    pub error_message: Option<String>,
    pub duration_ms: Option<u64>,
}

#[derive(Debug, Clone)]
pub enum ScheduledJobType {
    DailyRefresh,
    WeeklyNewsletter,
}

pub struct SchedulerService {
    repository_service: Arc<RepositoryService>,
    newsletter_service: Arc<NewsletterService>,
    job_history: Arc<RwLock<HashMap<String, Vec<JobExecution>>>>,
    scheduler: Option<JobScheduler>,
    job_sender: Option<mpsc::UnboundedSender<ScheduledJobType>>,
    metrics_collector: Option<Arc<MetricsCollector>>,
    alerting_service: Option<Arc<AlertingService>>,
}

impl SchedulerService {
    pub async fn new(
        repository_service: Arc<RepositoryService>,
        newsletter_service: Arc<NewsletterService>,
    ) -> Result<Self, SchedulerError> {
        Ok(Self {
            repository_service,
            newsletter_service,
            job_history: Arc::new(RwLock::new(HashMap::new())),
            scheduler: None,
            job_sender: None,
            metrics_collector: None,
            alerting_service: None,
        })
    }

    pub fn with_metrics(mut self, metrics_collector: Arc<MetricsCollector>) -> Self {
        self.metrics_collector = Some(metrics_collector);
        self
    }

    pub fn with_alerting(mut self, alerting_service: Arc<AlertingService>) -> Self {
        self.alerting_service = Some(alerting_service);
        self
    }

    pub async fn start(&mut self) -> Result<(), SchedulerError> {
        info!("Starting scheduler service with cron jobs");

        let scheduler = JobScheduler::new().await?;
        let (job_sender, mut job_receiver) = mpsc::unbounded_channel::<ScheduledJobType>();

        // Schedule daily trending data refresh at 6:00 AM UTC
        let daily_job = self.create_daily_refresh_job(job_sender.clone()).await?;
        scheduler.add(daily_job).await?;

        // Schedule weekly newsletter on Sundays at 9:00 AM UTC
        let weekly_job = self
            .create_weekly_newsletter_job(job_sender.clone())
            .await?;
        scheduler.add(weekly_job).await?;

        // Start the scheduler
        scheduler.start().await?;

        self.scheduler = Some(scheduler);
        self.job_sender = Some(job_sender);

        // Start the job execution handler
        let repository_service = self.repository_service.clone();
        let newsletter_service = self.newsletter_service.clone();
        let job_history = self.job_history.clone();
        let metrics_collector = self.metrics_collector.clone();
        let alerting_service = self.alerting_service.clone();

        tokio::spawn(async move {
            while let Some(job_type) = job_receiver.recv().await {
                match job_type {
                    ScheduledJobType::DailyRefresh => {
                        info!("Executing scheduled daily trending refresh");
                        Self::execute_daily_refresh(
                            repository_service.clone(),
                            job_history.clone(),
                            metrics_collector.clone(),
                            alerting_service.clone(),
                        )
                        .await;
                    }
                    ScheduledJobType::WeeklyNewsletter => {
                        info!("Executing scheduled weekly newsletter");
                        Self::execute_weekly_newsletter(
                            newsletter_service.clone(),
                            job_history.clone(),
                            metrics_collector.clone(),
                            alerting_service.clone(),
                        )
                        .await;
                    }
                }
            }
        });

        info!("Scheduler service started successfully with cron jobs");
        Ok(())
    }

    pub async fn shutdown(&mut self) -> Result<(), SchedulerError> {
        if let Some(mut scheduler) = self.scheduler.take() {
            scheduler.shutdown().await?;
            info!("Scheduler service shut down successfully");
        } else {
            warn!("Scheduler was not running");
        }
        Ok(())
    }

    async fn create_daily_refresh_job(
        &self,
        job_sender: mpsc::UnboundedSender<ScheduledJobType>,
    ) -> Result<Job, SchedulerError> {
        let job = Job::new("0 6 * * *", move |_uuid, _l| {
            info!("Daily trending refresh job triggered");
            if let Err(e) = job_sender.send(ScheduledJobType::DailyRefresh) {
                error!("Failed to send daily refresh job signal: {}", e);
            }
        })?;

        Ok(job)
    }

    async fn create_weekly_newsletter_job(
        &self,
        job_sender: mpsc::UnboundedSender<ScheduledJobType>,
    ) -> Result<Job, SchedulerError> {
        let job = Job::new("0 9 * * 0", move |_uuid, _l| {
            info!("Weekly newsletter job triggered");
            if let Err(e) = job_sender.send(ScheduledJobType::WeeklyNewsletter) {
                error!("Failed to send weekly newsletter job signal: {}", e);
            }
        })?;

        Ok(job)
    }

    async fn execute_daily_refresh(
        repository_service: Arc<RepositoryService>,
        job_history: Arc<RwLock<HashMap<String, Vec<JobExecution>>>>,
        metrics_collector: Option<Arc<MetricsCollector>>,
        alerting_service: Option<Arc<AlertingService>>,
    ) {
        let execution_id = Uuid::new_v4().to_string();
        let job_name = "daily_refresh".to_string();
        let started_at = Utc::now();

        info!("Starting daily trending refresh job: {}", execution_id);

        // Log job start with structured logging
        StructuredLogger::log_scheduled_job(
            &job_name,
            "started",
            None,
            None,
            Some({
                let mut metadata = std::collections::HashMap::new();
                metadata.insert("execution_id".to_string(), execution_id.clone());
                metadata
            }),
        );

        let mut execution = JobExecution {
            id: execution_id.clone(),
            job_name: job_name.clone(),
            status: JobStatus::Running,
            started_at: Some(started_at),
            completed_at: None,
            error_message: None,
            duration_ms: None,
        };

        // Update job history
        {
            let mut history = job_history.write().await;
            history
                .entry(job_name.clone())
                .or_insert_with(Vec::new)
                .push(execution.clone());
        }

        match repository_service.refresh_trending_data().await {
            Ok(_) => {
                let completed_at = Utc::now();
                let duration = (completed_at - started_at).num_milliseconds() as u64;

                execution.status = JobStatus::Completed;
                execution.completed_at = Some(completed_at);
                execution.duration_ms = Some(duration);

                // Record metrics
                if let Some(metrics) = &metrics_collector {
                    metrics
                        .record_job_execution("daily_refresh", true, duration)
                        .await;
                }

                info!(
                    "Daily trending refresh completed successfully in {}ms",
                    duration
                );

                // Log successful completion with structured logging
                StructuredLogger::log_scheduled_job(
                    &job_name,
                    "completed",
                    Some(duration),
                    None,
                    Some({
                        let mut metadata = std::collections::HashMap::new();
                        metadata.insert("execution_id".to_string(), execution_id.clone());
                        metadata
                            .insert("repositories_processed".to_string(), "unknown".to_string()); // Could be enhanced
                        metadata
                    }),
                );
            }
            Err(e) => {
                let completed_at = Utc::now();
                let duration = (completed_at - started_at).num_milliseconds() as u64;
                let error_msg = format!("Failed to refresh trending data: {}", e);

                execution.status = JobStatus::Failed;
                execution.completed_at = Some(completed_at);
                execution.duration_ms = Some(duration);
                execution.error_message = Some(error_msg.clone());

                // Record metrics
                if let Some(metrics) = &metrics_collector {
                    metrics
                        .record_job_execution("daily_refresh", false, duration)
                        .await;
                }

                error!("Daily trending refresh failed: {}", error_msg);

                // Log failure with structured logging
                StructuredLogger::log_scheduled_job(
                    &job_name,
                    "failed",
                    Some(duration),
                    Some(&error_msg),
                    Some({
                        let mut metadata = std::collections::HashMap::new();
                        metadata.insert("execution_id".to_string(), execution_id.clone());
                        metadata
                    }),
                );

                // Send alert for job failure
                if let Some(alerting) = &alerting_service {
                    alerting
                        .alert_job_failure("daily_refresh", &error_msg)
                        .await;
                }
            }
        }

        // Update final job status
        {
            let mut history = job_history.write().await;
            if let Some(job_executions) = history.get_mut(&job_name) {
                if let Some(last_execution) = job_executions.last_mut() {
                    *last_execution = execution;
                }
            }
        }
    }

    async fn execute_weekly_newsletter(
        newsletter_service: Arc<NewsletterService>,
        job_history: Arc<RwLock<HashMap<String, Vec<JobExecution>>>>,
        metrics_collector: Option<Arc<MetricsCollector>>,
        alerting_service: Option<Arc<AlertingService>>,
    ) {
        let execution_id = Uuid::new_v4().to_string();
        let job_name = "weekly_newsletter".to_string();
        let started_at = Utc::now();

        info!("Starting weekly newsletter job: {}", execution_id);

        // Log job start with structured logging
        StructuredLogger::log_scheduled_job(
            &job_name,
            "started",
            None,
            None,
            Some({
                let mut metadata = std::collections::HashMap::new();
                metadata.insert("execution_id".to_string(), execution_id.clone());
                metadata
            }),
        );

        let mut execution = JobExecution {
            id: execution_id.clone(),
            job_name: job_name.clone(),
            status: JobStatus::Running,
            started_at: Some(started_at),
            completed_at: None,
            error_message: None,
            duration_ms: None,
        };

        // Update job history
        {
            let mut history = job_history.write().await;
            history
                .entry(job_name.clone())
                .or_insert_with(Vec::new)
                .push(execution.clone());
        }

        match newsletter_service.send_weekly_newsletter().await {
            Ok(sent_count) => {
                let completed_at = Utc::now();
                let duration = (completed_at - started_at).num_milliseconds() as u64;

                execution.status = JobStatus::Completed;
                execution.completed_at = Some(completed_at);
                execution.duration_ms = Some(duration);

                // Record metrics
                if let Some(metrics) = &metrics_collector {
                    metrics
                        .record_job_execution("weekly_newsletter", true, duration)
                        .await;
                }

                info!(
                    "Weekly newsletter sent successfully to {} subscribers in {}ms",
                    sent_count.successful_sends.len(),
                    duration
                );

                // Log successful completion with structured logging
                StructuredLogger::log_scheduled_job(
                    &job_name,
                    "completed",
                    Some(duration),
                    None,
                    Some({
                        let mut metadata = std::collections::HashMap::new();
                        metadata.insert("execution_id".to_string(), execution_id.clone());
                        metadata.insert(
                            "subscribers_sent".to_string(),
                            sent_count.successful_sends.len().to_string(),
                        );
                        metadata.insert(
                            "failed_sends".to_string(),
                            sent_count.failed_sends.len().to_string(),
                        );
                        metadata
                    }),
                );
            }
            Err(e) => {
                let completed_at = Utc::now();
                let duration = (completed_at - started_at).num_milliseconds() as u64;
                let error_msg = format!("Failed to send weekly newsletter: {}", e);

                execution.status = JobStatus::Failed;
                execution.completed_at = Some(completed_at);
                execution.duration_ms = Some(duration);
                execution.error_message = Some(error_msg.clone());

                // Record metrics
                if let Some(metrics) = &metrics_collector {
                    metrics
                        .record_job_execution("weekly_newsletter", false, duration)
                        .await;
                }

                error!("Weekly newsletter failed: {}", error_msg);

                // Log failure with structured logging
                StructuredLogger::log_scheduled_job(
                    &job_name,
                    "failed",
                    Some(duration),
                    Some(&error_msg),
                    Some({
                        let mut metadata = std::collections::HashMap::new();
                        metadata.insert("execution_id".to_string(), execution_id.clone());
                        metadata
                    }),
                );

                // Send alert for job failure
                if let Some(alerting) = &alerting_service {
                    alerting
                        .alert_job_failure("weekly_newsletter", &error_msg)
                        .await;
                }
            }
        }

        // Update final job status
        {
            let mut history = job_history.write().await;
            if let Some(job_executions) = history.get_mut(&job_name) {
                if let Some(last_execution) = job_executions.last_mut() {
                    *last_execution = execution;
                }
            }
        }
    }

    pub async fn trigger_daily_refresh(&self) -> Result<String, SchedulerError> {
        let execution_id = Uuid::new_v4().to_string();
        info!(
            "Manually triggering daily trending refresh: {}",
            execution_id
        );

        let repository_service = self.repository_service.clone();
        let job_history = self.job_history.clone();

        // Spawn the task to avoid blocking
        let metrics_collector = self.metrics_collector.clone();
        let alerting_service = self.alerting_service.clone();
        tokio::spawn(async move {
            Self::execute_daily_refresh(
                repository_service,
                job_history,
                metrics_collector,
                alerting_service,
            )
            .await;
        });

        Ok(execution_id)
    }

    pub async fn trigger_newsletter(&self) -> Result<String, SchedulerError> {
        let execution_id = Uuid::new_v4().to_string();
        info!("Manually triggering newsletter: {}", execution_id);

        let newsletter_service = self.newsletter_service.clone();
        let job_history = self.job_history.clone();

        // Spawn the task to avoid blocking
        let metrics_collector = self.metrics_collector.clone();
        let alerting_service = self.alerting_service.clone();
        tokio::spawn(async move {
            Self::execute_weekly_newsletter(
                newsletter_service,
                job_history,
                metrics_collector,
                alerting_service,
            )
            .await;
        });

        Ok(execution_id)
    }

    pub async fn get_job_history(
        &self,
        job_name: Option<String>,
    ) -> HashMap<String, Vec<JobExecution>> {
        let history = self.job_history.read().await;

        match job_name {
            Some(name) => {
                let mut result = HashMap::new();
                if let Some(executions) = history.get(&name) {
                    result.insert(name, executions.clone());
                }
                result
            }
            None => history.clone(),
        }
    }

    pub async fn get_job_status(&self, execution_id: &str) -> Option<JobExecution> {
        let history = self.job_history.read().await;

        for executions in history.values() {
            if let Some(execution) = executions.iter().find(|e| e.id == execution_id) {
                return Some(execution.clone());
            }
        }

        None
    }

    pub async fn get_scheduler_status(&self) -> SchedulerStatus {
        let is_running = self.scheduler.is_some();
        let job_count = if self.scheduler.is_some() {
            // For now, we know we have 2 jobs: daily refresh and weekly newsletter
            2
        } else {
            0
        };

        let history = self.job_history.read().await;
        let total_executions = history.values().map(|v| v.len()).sum();

        SchedulerStatus {
            is_running,
            job_count,
            total_executions,
            last_daily_refresh: self.get_last_execution_time("daily_refresh").await,
            last_newsletter: self.get_last_execution_time("weekly_newsletter").await,
        }
    }

    async fn get_last_execution_time(&self, job_name: &str) -> Option<DateTime<Utc>> {
        let history = self.job_history.read().await;
        history
            .get(job_name)
            .and_then(|executions| executions.last())
            .and_then(|execution| execution.completed_at)
    }

    pub async fn clear_job_history(
        &self,
        job_name: Option<String>,
    ) -> Result<usize, SchedulerError> {
        let mut history = self.job_history.write().await;

        match job_name {
            Some(name) => {
                let count = history.get(&name).map(|v| v.len()).unwrap_or(0);
                history.remove(&name);
                Ok(count)
            }
            None => {
                let count = history.values().map(|v| v.len()).sum();
                history.clear();
                Ok(count)
            }
        }
    }
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SchedulerStatus {
    pub is_running: bool,
    pub job_count: usize,
    pub total_executions: usize,
    pub last_daily_refresh: Option<DateTime<Utc>>,
    pub last_newsletter: Option<DateTime<Utc>>,
}
