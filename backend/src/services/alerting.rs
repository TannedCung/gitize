use chrono::{DateTime, Utc};
use log::{error, info, warn};
use serde::{Deserialize, Serialize};
use std::collections::HashMap;
use std::sync::Arc;
use tokio::sync::RwLock;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum AlertSeverity {
    Low,
    Medium,
    High,
    Critical,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum AlertType {
    JobFailure,
    DatabaseError,
    ExternalApiError,
    SystemError,
    PerformanceDegradation,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Alert {
    pub id: String,
    pub alert_type: AlertType,
    pub severity: AlertSeverity,
    pub title: String,
    pub message: String,
    pub timestamp: DateTime<Utc>,
    pub resolved: bool,
    pub resolved_at: Option<DateTime<Utc>>,
    pub metadata: HashMap<String, String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct AlertingConfig {
    pub enabled: bool,
    pub max_alerts: usize,
    pub alert_retention_hours: u64,
    pub email_notifications: bool,
    pub webhook_url: Option<String>,
}

impl Default for AlertingConfig {
    fn default() -> Self {
        Self {
            enabled: true,
            max_alerts: 1000,
            alert_retention_hours: 24 * 7, // 7 days
            email_notifications: false,
            webhook_url: None,
        }
    }
}

pub struct AlertingService {
    config: AlertingConfig,
    alerts: Arc<RwLock<Vec<Alert>>>,
}

impl AlertingService {
    pub fn new(config: AlertingConfig) -> Self {
        Self {
            config,
            alerts: Arc::new(RwLock::new(Vec::new())),
        }
    }

    pub async fn create_alert(
        &self,
        alert_type: AlertType,
        severity: AlertSeverity,
        title: String,
        message: String,
        metadata: Option<HashMap<String, String>>,
    ) -> String {
        if !self.config.enabled {
            return String::new();
        }

        let alert_id = uuid::Uuid::new_v4().to_string();
        let alert = Alert {
            id: alert_id.clone(),
            alert_type: alert_type.clone(),
            severity: severity.clone(),
            title: title.clone(),
            message: message.clone(),
            timestamp: Utc::now(),
            resolved: false,
            resolved_at: None,
            metadata: metadata.unwrap_or_default(),
        };

        // Log the alert
        match severity {
            AlertSeverity::Critical => error!("[ALERT] {}: {}", title, message),
            AlertSeverity::High => error!("[ALERT] {}: {}", title, message),
            AlertSeverity::Medium => warn!("[ALERT] {}: {}", title, message),
            AlertSeverity::Low => info!("[ALERT] {}: {}", title, message),
        }

        // Store the alert
        {
            let mut alerts = self.alerts.write().await;
            alerts.push(alert.clone());

            // Cleanup old alerts if we exceed the limit
            if alerts.len() > self.config.max_alerts {
                alerts.remove(0);
            }
        }

        // Send notifications (if configured)
        self.send_notification(&alert).await;

        alert_id
    }

    pub async fn resolve_alert(&self, alert_id: &str) -> bool {
        let mut alerts = self.alerts.write().await;

        if let Some(alert) = alerts.iter_mut().find(|a| a.id == alert_id) {
            alert.resolved = true;
            alert.resolved_at = Some(Utc::now());
            info!("Alert resolved: {} - {}", alert.title, alert.message);
            return true;
        }

        false
    }

    pub async fn get_active_alerts(&self) -> Vec<Alert> {
        let alerts = self.alerts.read().await;
        alerts
            .iter()
            .filter(|alert| !alert.resolved)
            .cloned()
            .collect()
    }

    pub async fn get_all_alerts(&self, limit: Option<usize>) -> Vec<Alert> {
        let alerts = self.alerts.read().await;
        let mut result: Vec<Alert> = alerts.iter().cloned().collect();

        // Sort by timestamp (newest first)
        result.sort_by(|a, b| b.timestamp.cmp(&a.timestamp));

        if let Some(limit) = limit {
            result.truncate(limit);
        }

        result
    }

    pub async fn cleanup_old_alerts(&self) -> usize {
        let cutoff_time =
            Utc::now() - chrono::Duration::hours(self.config.alert_retention_hours as i64);
        let mut alerts = self.alerts.write().await;

        let initial_count = alerts.len();
        alerts.retain(|alert| alert.timestamp > cutoff_time);
        let removed_count = initial_count - alerts.len();

        if removed_count > 0 {
            info!("Cleaned up {} old alerts", removed_count);
        }

        removed_count
    }

    pub async fn get_alert_statistics(&self) -> AlertStatistics {
        let alerts = self.alerts.read().await;

        let total_alerts = alerts.len();
        let active_alerts = alerts.iter().filter(|a| !a.resolved).count();
        let resolved_alerts = alerts.iter().filter(|a| a.resolved).count();

        let mut severity_counts = HashMap::new();
        let mut type_counts = HashMap::new();

        for alert in alerts.iter() {
            let severity_key = format!("{:?}", alert.severity);
            let type_key = format!("{:?}", alert.alert_type);

            *severity_counts.entry(severity_key).or_insert(0) += 1;
            *type_counts.entry(type_key).or_insert(0) += 1;
        }

        AlertStatistics {
            total_alerts,
            active_alerts,
            resolved_alerts,
            severity_counts,
            type_counts,
        }
    }

    async fn send_notification(&self, alert: &Alert) {
        // In a production environment, you would implement actual notification sending
        // For now, we'll just log that a notification would be sent

        if self.config.email_notifications {
            info!("Would send email notification for alert: {}", alert.title);
        }

        if let Some(webhook_url) = &self.config.webhook_url {
            info!(
                "Would send webhook notification to {} for alert: {}",
                webhook_url, alert.title
            );
            // Here you would implement actual webhook sending using reqwest
        }
    }

    // Convenience methods for common alert types
    pub async fn alert_job_failure(&self, job_name: &str, error_message: &str) -> String {
        let mut metadata = HashMap::new();
        metadata.insert("job_name".to_string(), job_name.to_string());

        self.create_alert(
            AlertType::JobFailure,
            AlertSeverity::High,
            format!("Job Failed: {}", job_name),
            format!(
                "Scheduled job '{}' failed with error: {}",
                job_name, error_message
            ),
            Some(metadata),
        )
        .await
    }

    pub async fn alert_database_error(&self, operation: &str, error_message: &str) -> String {
        let mut metadata = HashMap::new();
        metadata.insert("operation".to_string(), operation.to_string());

        self.create_alert(
            AlertType::DatabaseError,
            AlertSeverity::Critical,
            "Database Error".to_string(),
            format!(
                "Database operation '{}' failed: {}",
                operation, error_message
            ),
            Some(metadata),
        )
        .await
    }

    pub async fn alert_external_api_error(&self, api_name: &str, error_message: &str) -> String {
        let mut metadata = HashMap::new();
        metadata.insert("api_name".to_string(), api_name.to_string());

        self.create_alert(
            AlertType::ExternalApiError,
            AlertSeverity::Medium,
            format!("External API Error: {}", api_name),
            format!("External API '{}' error: {}", api_name, error_message),
            Some(metadata),
        )
        .await
    }

    pub async fn alert_performance_degradation(
        &self,
        component: &str,
        metric: &str,
        value: f64,
    ) -> String {
        let mut metadata = HashMap::new();
        metadata.insert("component".to_string(), component.to_string());
        metadata.insert("metric".to_string(), metric.to_string());
        metadata.insert("value".to_string(), value.to_string());

        self.create_alert(
            AlertType::PerformanceDegradation,
            AlertSeverity::Medium,
            "Performance Degradation".to_string(),
            format!(
                "Component '{}' showing degraded performance: {} = {}",
                component, metric, value
            ),
            Some(metadata),
        )
        .await
    }
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct AlertStatistics {
    pub total_alerts: usize,
    pub active_alerts: usize,
    pub resolved_alerts: usize,
    pub severity_counts: HashMap<String, usize>,
    pub type_counts: HashMap<String, usize>,
}

impl Default for AlertingService {
    fn default() -> Self {
        Self::new(AlertingConfig::default())
    }
}
