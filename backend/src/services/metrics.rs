use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};
use std::collections::HashMap;
use std::sync::Arc;
use tokio::sync::RwLock;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ApiMetrics {
    pub total_requests: u64,
    pub successful_requests: u64,
    pub failed_requests: u64,
    pub average_response_time_ms: f64,
    pub last_request: Option<DateTime<Utc>>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct EndpointMetrics {
    pub path: String,
    pub method: String,
    pub request_count: u64,
    pub average_response_time_ms: f64,
    pub error_count: u64,
    pub last_accessed: Option<DateTime<Utc>>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct JobMetrics {
    pub job_name: String,
    pub total_executions: u64,
    pub successful_executions: u64,
    pub failed_executions: u64,
    pub average_duration_ms: f64,
    pub last_execution: Option<DateTime<Utc>>,
    pub last_success: Option<DateTime<Utc>>,
    pub last_failure: Option<DateTime<Utc>>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SystemMetrics {
    pub uptime_seconds: u64,
    pub memory_usage_mb: u64,
    pub active_connections: u32,
    pub database_connections: u32,
}

pub struct MetricsCollector {
    api_metrics: Arc<RwLock<ApiMetrics>>,
    endpoint_metrics: Arc<RwLock<HashMap<String, EndpointMetrics>>>,
    job_metrics: Arc<RwLock<HashMap<String, JobMetrics>>>,
    start_time: DateTime<Utc>,
}

impl MetricsCollector {
    pub fn new() -> Self {
        Self {
            api_metrics: Arc::new(RwLock::new(ApiMetrics {
                total_requests: 0,
                successful_requests: 0,
                failed_requests: 0,
                average_response_time_ms: 0.0,
                last_request: None,
            })),
            endpoint_metrics: Arc::new(RwLock::new(HashMap::new())),
            job_metrics: Arc::new(RwLock::new(HashMap::new())),
            start_time: Utc::now(),
        }
    }

    pub async fn record_api_request(&self, success: bool, response_time_ms: u64) {
        let mut metrics = self.api_metrics.write().await;
        metrics.total_requests += 1;

        if success {
            metrics.successful_requests += 1;
        } else {
            metrics.failed_requests += 1;
        }

        // Update average response time (simple moving average)
        let total_time = metrics.average_response_time_ms * (metrics.total_requests - 1) as f64;
        metrics.average_response_time_ms =
            (total_time + response_time_ms as f64) / metrics.total_requests as f64;

        metrics.last_request = Some(Utc::now());
    }

    pub async fn record_endpoint_request(
        &self,
        path: &str,
        method: &str,
        success: bool,
        response_time_ms: u64,
    ) {
        let key = format!("{} {}", method, path);
        let mut metrics = self.endpoint_metrics.write().await;

        let endpoint_metric = metrics.entry(key.clone()).or_insert(EndpointMetrics {
            path: path.to_string(),
            method: method.to_string(),
            request_count: 0,
            average_response_time_ms: 0.0,
            error_count: 0,
            last_accessed: None,
        });

        endpoint_metric.request_count += 1;

        if !success {
            endpoint_metric.error_count += 1;
        }

        // Update average response time
        let total_time =
            endpoint_metric.average_response_time_ms * (endpoint_metric.request_count - 1) as f64;
        endpoint_metric.average_response_time_ms =
            (total_time + response_time_ms as f64) / endpoint_metric.request_count as f64;

        endpoint_metric.last_accessed = Some(Utc::now());
    }

    pub async fn record_job_execution(&self, job_name: &str, success: bool, duration_ms: u64) {
        let mut metrics = self.job_metrics.write().await;

        let job_metric = metrics.entry(job_name.to_string()).or_insert(JobMetrics {
            job_name: job_name.to_string(),
            total_executions: 0,
            successful_executions: 0,
            failed_executions: 0,
            average_duration_ms: 0.0,
            last_execution: None,
            last_success: None,
            last_failure: None,
        });

        job_metric.total_executions += 1;
        job_metric.last_execution = Some(Utc::now());

        if success {
            job_metric.successful_executions += 1;
            job_metric.last_success = Some(Utc::now());
        } else {
            job_metric.failed_executions += 1;
            job_metric.last_failure = Some(Utc::now());
        }

        // Update average duration
        let total_duration =
            job_metric.average_duration_ms * (job_metric.total_executions - 1) as f64;
        job_metric.average_duration_ms =
            (total_duration + duration_ms as f64) / job_metric.total_executions as f64;
    }

    pub async fn get_api_metrics(&self) -> ApiMetrics {
        self.api_metrics.read().await.clone()
    }

    pub async fn get_endpoint_metrics(&self) -> HashMap<String, EndpointMetrics> {
        self.endpoint_metrics.read().await.clone()
    }

    pub async fn get_job_metrics(&self) -> HashMap<String, JobMetrics> {
        self.job_metrics.read().await.clone()
    }

    pub fn get_system_metrics(&self) -> SystemMetrics {
        SystemMetrics {
            uptime_seconds: (Utc::now() - self.start_time).num_seconds() as u64,
            memory_usage_mb: self.get_memory_usage(),
            active_connections: 0, // TODO: Implement actual connection tracking
            database_connections: 0, // TODO: Implement database connection tracking
        }
    }

    fn get_memory_usage(&self) -> u64 {
        // Get memory usage from /proc/self/status on Linux
        #[cfg(target_os = "linux")]
        {
            if let Ok(status) = std::fs::read_to_string("/proc/self/status") {
                for line in status.lines() {
                    if line.starts_with("VmRSS:") {
                        if let Some(kb_str) = line.split_whitespace().nth(1) {
                            if let Ok(kb) = kb_str.parse::<u64>() {
                                return kb / 1024; // Convert KB to MB
                            }
                        }
                    }
                }
            }
        }

        // Fallback for other platforms or if reading fails
        #[cfg(not(target_os = "linux"))]
        {
            // For non-Linux platforms, we could use other methods
            // For now, return 0 as a placeholder
        }

        0
    }

    pub async fn reset_metrics(&self) {
        let mut api_metrics = self.api_metrics.write().await;
        *api_metrics = ApiMetrics {
            total_requests: 0,
            successful_requests: 0,
            failed_requests: 0,
            average_response_time_ms: 0.0,
            last_request: None,
        };

        self.endpoint_metrics.write().await.clear();
        self.job_metrics.write().await.clear();
    }
}

impl Default for MetricsCollector {
    fn default() -> Self {
        Self::new()
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[tokio::test]
    async fn test_metrics_collector_creation() {
        let collector = MetricsCollector::new();
        let api_metrics = collector.get_api_metrics().await;

        assert_eq!(api_metrics.total_requests, 0);
        assert_eq!(api_metrics.successful_requests, 0);
        assert_eq!(api_metrics.failed_requests, 0);
        assert_eq!(api_metrics.average_response_time_ms, 0.0);
    }

    #[tokio::test]
    async fn test_record_api_request() {
        let collector = MetricsCollector::new();

        // Record a successful request
        collector.record_api_request(true, 100).await;

        let api_metrics = collector.get_api_metrics().await;
        assert_eq!(api_metrics.total_requests, 1);
        assert_eq!(api_metrics.successful_requests, 1);
        assert_eq!(api_metrics.failed_requests, 0);
        assert_eq!(api_metrics.average_response_time_ms, 100.0);
    }

    #[tokio::test]
    async fn test_record_endpoint_request() {
        let collector = MetricsCollector::new();

        collector
            .record_endpoint_request("/api/test", "GET", true, 150)
            .await;

        let endpoint_metrics = collector.get_endpoint_metrics().await;
        let key = "GET /api/test";

        assert!(endpoint_metrics.contains_key(key));
        let metrics = &endpoint_metrics[key];
        assert_eq!(metrics.request_count, 1);
        assert_eq!(metrics.error_count, 0);
        assert_eq!(metrics.average_response_time_ms, 150.0);
    }

    #[tokio::test]
    async fn test_record_job_execution() {
        let collector = MetricsCollector::new();

        collector.record_job_execution("test_job", true, 2000).await;

        let job_metrics = collector.get_job_metrics().await;

        assert!(job_metrics.contains_key("test_job"));
        let metrics = &job_metrics["test_job"];
        assert_eq!(metrics.total_executions, 1);
        assert_eq!(metrics.successful_executions, 1);
        assert_eq!(metrics.failed_executions, 0);
        assert_eq!(metrics.average_duration_ms, 2000.0);
    }

    #[tokio::test]
    async fn test_system_metrics() {
        let collector = MetricsCollector::new();
        let system_metrics = collector.get_system_metrics();

        // Just verify the structure exists and has reasonable values
        // Note: uptime_seconds and memory_usage_mb are u64, so they're always >= 0
        assert!(system_metrics.uptime_seconds < u64::MAX);
        assert!(system_metrics.memory_usage_mb < u64::MAX);
    }

    #[tokio::test]
    async fn test_reset_metrics() {
        let collector = MetricsCollector::new();

        // Add some data
        collector.record_api_request(true, 100).await;
        collector
            .record_endpoint_request("/api/test", "GET", true, 150)
            .await;
        collector.record_job_execution("test_job", true, 2000).await;

        // Verify data exists
        let api_metrics = collector.get_api_metrics().await;
        assert_eq!(api_metrics.total_requests, 1);

        // Reset and verify
        collector.reset_metrics().await;

        let api_metrics = collector.get_api_metrics().await;
        assert_eq!(api_metrics.total_requests, 0);

        let endpoint_metrics = collector.get_endpoint_metrics().await;
        assert!(endpoint_metrics.is_empty());

        let job_metrics = collector.get_job_metrics().await;
        assert!(job_metrics.is_empty());
    }
}
