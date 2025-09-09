use crate::database::DbPool;
use crate::services::scheduler::SchedulerStatus;
use crate::services::{
    Alert, AlertStatistics, ApiMetrics, EndpointMetrics, JobExecution, JobMetrics, LogLevel,
    ServiceManager, StructuredLogger, SystemMetrics,
};
use rocket::serde::{json::Json, Serialize};
use rocket::{delete, get, post, routes, Route, State};
use std::collections::HashMap;
use std::sync::Arc;

#[derive(Serialize)]
pub struct TriggerJobResponse {
    pub success: bool,
    pub execution_id: Option<String>,
    pub message: String,
}

#[derive(Serialize)]
pub struct JobHistoryResponse {
    pub jobs: HashMap<String, Vec<JobExecution>>,
}

#[derive(Serialize)]
pub struct JobStatusResponse {
    pub execution: Option<JobExecution>,
}

#[derive(Serialize)]
pub struct SchedulerStatusResponse {
    pub status: SchedulerStatus,
}

#[derive(Serialize)]
pub struct ClearHistoryResponse {
    pub success: bool,
    pub cleared_count: usize,
    pub message: String,
}

#[derive(Serialize)]
pub struct MetricsResponse {
    pub api_metrics: ApiMetrics,
    pub endpoint_metrics: HashMap<String, EndpointMetrics>,
    pub job_metrics: HashMap<String, JobMetrics>,
    pub system_metrics: SystemMetrics,
}

#[derive(Serialize)]
pub struct AlertsResponse {
    pub alerts: Vec<Alert>,
    pub total_count: usize,
}

#[derive(Serialize)]
pub struct AlertStatisticsResponse {
    pub statistics: AlertStatistics,
}

#[derive(Serialize)]
pub struct ResolveAlertResponse {
    pub success: bool,
    pub message: String,
}

#[derive(Serialize)]
pub struct SystemHealthSummary {
    pub overall_status: String,
    pub critical_issues: Vec<String>,
    pub warnings: Vec<String>,
    pub uptime_seconds: u64,
    pub last_health_check: String,
}

#[derive(Serialize)]
pub struct MonitoringDashboard {
    pub health_summary: SystemHealthSummary,
    pub performance_overview: PerformanceOverview,
    pub recent_activity: RecentActivity,
    pub resource_utilization: ResourceUtilization,
}

#[derive(Serialize)]
pub struct PerformanceOverview {
    pub avg_response_time_ms: f64,
    pub requests_last_hour: u64,
    pub error_rate_percent: f64,
    pub slowest_endpoint: Option<String>,
}

#[derive(Serialize)]
pub struct RecentActivity {
    pub recent_jobs: Vec<JobExecution>,
    pub recent_alerts: Vec<Alert>,
    pub active_connections: u32,
}

#[derive(Serialize)]
pub struct ResourceUtilization {
    pub memory_usage_mb: u64,
    pub cpu_usage_percent: f64,
    pub database_connections: u32,
    pub disk_usage_percent: f64,
}

#[post("/admin/jobs/refresh-trending")]
pub async fn trigger_trending_refresh(
    service_manager: &State<ServiceManager>,
) -> Json<TriggerJobResponse> {
    match service_manager
        .scheduler_service
        .lock()
        .await
        .trigger_daily_refresh()
        .await
    {
        Ok(execution_id) => Json(TriggerJobResponse {
            success: true,
            execution_id: Some(execution_id),
            message: "Daily trending refresh triggered successfully".to_string(),
        }),
        Err(e) => Json(TriggerJobResponse {
            success: false,
            execution_id: None,
            message: format!("Failed to trigger daily trending refresh: {}", e),
        }),
    }
}

#[post("/admin/jobs/send-newsletter")]
pub async fn trigger_newsletter(
    service_manager: &State<ServiceManager>,
) -> Json<TriggerJobResponse> {
    match service_manager
        .scheduler_service
        .lock()
        .await
        .trigger_newsletter()
        .await
    {
        Ok(execution_id) => Json(TriggerJobResponse {
            success: true,
            execution_id: Some(execution_id),
            message: "Newsletter sending triggered successfully".to_string(),
        }),
        Err(e) => Json(TriggerJobResponse {
            success: false,
            execution_id: None,
            message: format!("Failed to trigger newsletter: {}", e),
        }),
    }
}

#[get("/admin/jobs/history?<job_name>")]
pub async fn get_job_history(
    service_manager: &State<ServiceManager>,
    job_name: Option<String>,
) -> Json<JobHistoryResponse> {
    let jobs = service_manager
        .scheduler_service
        .lock()
        .await
        .get_job_history(job_name)
        .await;
    Json(JobHistoryResponse { jobs })
}

#[get("/admin/jobs/status/<execution_id>")]
pub async fn get_job_status(
    service_manager: &State<ServiceManager>,
    execution_id: &str,
) -> Json<JobStatusResponse> {
    let execution = service_manager
        .scheduler_service
        .lock()
        .await
        .get_job_status(execution_id)
        .await;
    Json(JobStatusResponse { execution })
}

#[get("/admin/scheduler/status")]
pub async fn get_scheduler_status(
    service_manager: &State<ServiceManager>,
) -> Json<SchedulerStatusResponse> {
    let status = service_manager
        .scheduler_service
        .lock()
        .await
        .get_scheduler_status()
        .await;
    Json(SchedulerStatusResponse { status })
}

#[delete("/admin/jobs/history?<job_name>")]
pub async fn clear_job_history(
    service_manager: &State<ServiceManager>,
    job_name: Option<String>,
) -> Json<ClearHistoryResponse> {
    match service_manager
        .scheduler_service
        .lock()
        .await
        .clear_job_history(job_name.clone())
        .await
    {
        Ok(cleared_count) => Json(ClearHistoryResponse {
            success: true,
            cleared_count,
            message: match job_name {
                Some(name) => format!("Cleared {} executions for job '{}'", cleared_count, name),
                None => format!("Cleared {} total job executions", cleared_count),
            },
        }),
        Err(e) => Json(ClearHistoryResponse {
            success: false,
            cleared_count: 0,
            message: format!("Failed to clear job history: {}", e),
        }),
    }
}

#[get("/admin/metrics")]
pub async fn get_metrics(service_manager: &State<ServiceManager>) -> Json<MetricsResponse> {
    let api_metrics = service_manager.metrics_collector.get_api_metrics().await;
    let endpoint_metrics = service_manager
        .metrics_collector
        .get_endpoint_metrics()
        .await;
    let job_metrics = service_manager.metrics_collector.get_job_metrics().await;
    let system_metrics = service_manager.metrics_collector.get_system_metrics();

    Json(MetricsResponse {
        api_metrics,
        endpoint_metrics,
        job_metrics,
        system_metrics,
    })
}

#[post("/admin/metrics/reset")]
pub async fn reset_metrics(service_manager: &State<ServiceManager>) -> Json<serde_json::Value> {
    service_manager.metrics_collector.reset_metrics().await;
    Json(serde_json::json!({
        "success": true,
        "message": "Metrics reset successfully"
    }))
}

#[get("/admin/alerts?<active_only>&<limit>")]
pub async fn get_alerts(
    service_manager: &State<ServiceManager>,
    active_only: Option<bool>,
    limit: Option<usize>,
) -> Json<AlertsResponse> {
    let alerts = if active_only.unwrap_or(false) {
        service_manager.alerting_service.get_active_alerts().await
    } else {
        service_manager.alerting_service.get_all_alerts(limit).await
    };

    let total_count = alerts.len();

    Json(AlertsResponse {
        alerts,
        total_count,
    })
}

#[get("/admin/alerts/statistics")]
pub async fn get_alert_statistics(
    service_manager: &State<ServiceManager>,
) -> Json<AlertStatisticsResponse> {
    let statistics = service_manager
        .alerting_service
        .get_alert_statistics()
        .await;

    Json(AlertStatisticsResponse { statistics })
}

#[post("/admin/alerts/<alert_id>/resolve")]
pub async fn resolve_alert(
    service_manager: &State<ServiceManager>,
    alert_id: &str,
) -> Json<ResolveAlertResponse> {
    let success = service_manager
        .alerting_service
        .resolve_alert(alert_id)
        .await;

    Json(ResolveAlertResponse {
        success,
        message: if success {
            format!("Alert {} resolved successfully", alert_id)
        } else {
            format!("Alert {} not found or already resolved", alert_id)
        },
    })
}

#[delete("/admin/alerts/cleanup")]
pub async fn cleanup_old_alerts(
    service_manager: &State<ServiceManager>,
) -> Json<serde_json::Value> {
    let removed_count = service_manager.alerting_service.cleanup_old_alerts().await;

    Json(serde_json::json!({
        "success": true,
        "removed_count": removed_count,
        "message": format!("Cleaned up {} old alerts", removed_count)
    }))
}

#[get("/admin/monitoring/dashboard")]
pub async fn monitoring_dashboard(
    service_manager: &State<ServiceManager>,
    _db_pool: &State<Arc<DbPool>>,
) -> Json<MonitoringDashboard> {
    // Get health summary
    let api_metrics = service_manager.metrics_collector.get_api_metrics().await;
    let system_metrics = service_manager.metrics_collector.get_system_metrics();
    let active_alerts = service_manager.alerting_service.get_active_alerts().await;

    let mut critical_issues = Vec::new();
    let mut warnings = Vec::new();

    // Check for critical issues
    if api_metrics.total_requests > 0 {
        let error_rate =
            (api_metrics.failed_requests as f64 / api_metrics.total_requests as f64) * 100.0;
        if error_rate > 10.0 {
            critical_issues.push(format!("High error rate: {:.1}%", error_rate));
        } else if error_rate > 5.0 {
            warnings.push(format!("Elevated error rate: {:.1}%", error_rate));
        }
    }

    if api_metrics.average_response_time_ms > 2000.0 {
        critical_issues.push(format!(
            "High response time: {:.0}ms",
            api_metrics.average_response_time_ms
        ));
    } else if api_metrics.average_response_time_ms > 1000.0 {
        warnings.push(format!(
            "Elevated response time: {:.0}ms",
            api_metrics.average_response_time_ms
        ));
    }

    // Check for active critical alerts
    for alert in &active_alerts {
        match alert.severity {
            crate::services::AlertSeverity::Critical => {
                critical_issues.push(format!("Critical alert: {}", alert.title));
            }
            crate::services::AlertSeverity::High => {
                warnings.push(format!("High priority alert: {}", alert.title));
            }
            _ => {}
        }
    }

    let overall_status = if !critical_issues.is_empty() {
        "critical"
    } else if !warnings.is_empty() {
        "warning"
    } else {
        "healthy"
    };

    let health_summary = SystemHealthSummary {
        overall_status: overall_status.to_string(),
        critical_issues,
        warnings,
        uptime_seconds: system_metrics.uptime_seconds,
        last_health_check: chrono::Utc::now().to_rfc3339(),
    };

    // Get performance overview
    let endpoint_metrics = service_manager
        .metrics_collector
        .get_endpoint_metrics()
        .await;
    let slowest_endpoint = endpoint_metrics
        .iter()
        .max_by(|a, b| {
            a.1.average_response_time_ms
                .partial_cmp(&b.1.average_response_time_ms)
                .unwrap()
        })
        .map(|(endpoint, _)| endpoint.clone());

    let requests_last_hour = api_metrics.total_requests; // Simplified - in production you'd track hourly
    let error_rate = if api_metrics.total_requests > 0 {
        (api_metrics.failed_requests as f64 / api_metrics.total_requests as f64) * 100.0
    } else {
        0.0
    };

    let performance_overview = PerformanceOverview {
        avg_response_time_ms: api_metrics.average_response_time_ms,
        requests_last_hour,
        error_rate_percent: error_rate,
        slowest_endpoint,
    };

    // Get recent activity
    let job_history = service_manager
        .scheduler_service
        .lock()
        .await
        .get_job_history(None)
        .await;
    let recent_jobs: Vec<JobExecution> = job_history
        .values()
        .flat_map(|executions| executions.iter())
        .cloned()
        .collect::<Vec<_>>()
        .into_iter()
        .rev()
        .take(5)
        .collect();

    let recent_alerts = service_manager
        .alerting_service
        .get_all_alerts(Some(5))
        .await;

    let recent_activity = RecentActivity {
        recent_jobs,
        recent_alerts,
        active_connections: system_metrics.active_connections,
    };

    // Get resource utilization
    let resource_utilization = ResourceUtilization {
        memory_usage_mb: system_metrics.memory_usage_mb,
        cpu_usage_percent: get_cpu_usage(),
        database_connections: system_metrics.database_connections,
        disk_usage_percent: get_disk_usage(),
    };

    Json(MonitoringDashboard {
        health_summary,
        performance_overview,
        recent_activity,
        resource_utilization,
    })
}

#[post("/admin/monitoring/test-alert")]
pub async fn test_alert_system(service_manager: &State<ServiceManager>) -> Json<serde_json::Value> {
    let alert_id = service_manager
        .alerting_service
        .create_alert(
            crate::services::AlertType::SystemError,
            crate::services::AlertSeverity::Low,
            "Test Alert".to_string(),
            "This is a test alert to verify the alerting system is working correctly".to_string(),
            Some({
                let mut metadata = std::collections::HashMap::new();
                metadata.insert("test".to_string(), "true".to_string());
                metadata.insert("timestamp".to_string(), chrono::Utc::now().to_rfc3339());
                metadata
            }),
        )
        .await;

    // Log the test event
    StructuredLogger::log_system_event(
        "test_alert",
        "Test alert created via admin endpoint",
        LogLevel::Info,
        Some({
            let mut metadata = std::collections::HashMap::new();
            metadata.insert("alert_id".to_string(), alert_id.clone());
            metadata
        }),
    );

    Json(serde_json::json!({
        "success": true,
        "alert_id": alert_id,
        "message": "Test alert created successfully"
    }))
}

fn get_cpu_usage() -> f64 {
    // Basic CPU usage estimation
    #[cfg(target_os = "linux")]
    {
        if let Ok(loadavg) = std::fs::read_to_string("/proc/loadavg") {
            if let Some(load_str) = loadavg.split_whitespace().next() {
                if let Ok(load) = load_str.parse::<f64>() {
                    return (load * 100.0).min(100.0);
                }
            }
        }
    }
    0.0
}

fn get_disk_usage() -> f64 {
    // Basic disk usage estimation
    #[cfg(target_os = "linux")]
    {
        if let Ok(output) = std::process::Command::new("df").args(["-h", "/"]).output() {
            if let Ok(output_str) = String::from_utf8(output.stdout) {
                for line in output_str.lines().skip(1) {
                    let parts: Vec<&str> = line.split_whitespace().collect();
                    if parts.len() >= 5 {
                        if let Some(usage_str) = parts[4].strip_suffix('%') {
                            if let Ok(usage) = usage_str.parse::<f64>() {
                                return usage;
                            }
                        }
                    }
                }
            }
        }
    }
    0.0
}

pub fn routes() -> Vec<Route> {
    routes![
        trigger_trending_refresh,
        trigger_newsletter,
        get_job_history,
        get_job_status,
        get_scheduler_status,
        clear_job_history,
        get_metrics,
        reset_metrics,
        get_alerts,
        get_alert_statistics,
        resolve_alert,
        cleanup_old_alerts,
        monitoring_dashboard,
        test_alert_system
    ]
}
