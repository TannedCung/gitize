use crate::database::DbPool;
use crate::services::{Alert, ServiceManager};
use rocket::{get, serde::json::Json, State};
use serde::{Deserialize, Serialize};
use std::collections::HashMap;

#[derive(Serialize, Deserialize)]
pub struct HealthResponse {
    pub status: String,
    pub timestamp: String,
    pub version: String,
    pub services: ServiceHealthStatus,
}

#[derive(Serialize, Deserialize)]
pub struct ServiceHealthStatus {
    pub database: ComponentHealth,
    pub scheduler: ComponentHealth,
    pub external_apis: HashMap<String, ComponentHealth>,
}

#[derive(Serialize, Deserialize)]
pub struct ComponentHealth {
    pub status: String,
    pub message: Option<String>,
    pub response_time_ms: Option<u64>,
    pub last_check: String,
}

#[derive(Serialize, Deserialize)]
pub struct DetailedHealthResponse {
    pub status: String,
    pub timestamp: String,
    pub version: String,
    pub uptime_seconds: u64,
    pub services: ServiceHealthStatus,
    pub metrics: SystemMetrics,
}

#[derive(Serialize, Deserialize)]
pub struct SystemMetrics {
    pub total_requests: u64,
    pub active_connections: u32,
    pub memory_usage_mb: u64,
    pub scheduler_jobs: SchedulerMetrics,
}

#[derive(Serialize, Deserialize)]
pub struct SchedulerMetrics {
    pub is_running: bool,
    pub total_executions: usize,
    pub failed_executions: usize,
    pub last_daily_refresh: Option<String>,
    pub last_newsletter: Option<String>,
}

#[get("/health")]
pub async fn health_check(
    service_manager: &State<ServiceManager>,
    db_pool: &State<DbPool>,
) -> Json<HealthResponse> {
    let _start_time = std::time::Instant::now();

    // Check database health
    let database_health = check_database_health(db_pool).await;

    // Check scheduler health
    let scheduler_health = check_scheduler_health(service_manager).await;

    // Check external APIs (basic connectivity)
    let mut external_apis = HashMap::new();
    external_apis.insert("github".to_string(), check_github_health().await);

    let overall_status =
        if database_health.status == "healthy" && scheduler_health.status == "healthy" {
            "healthy"
        } else {
            "degraded"
        };

    Json(HealthResponse {
        status: overall_status.to_string(),
        timestamp: chrono::Utc::now().to_rfc3339(),
        version: env!("CARGO_PKG_VERSION").to_string(),
        services: ServiceHealthStatus {
            database: database_health,
            scheduler: scheduler_health,
            external_apis,
        },
    })
}

#[get("/health/detailed")]
pub async fn detailed_health_check(
    service_manager: &State<ServiceManager>,
    db_pool: &State<DbPool>,
) -> Json<DetailedHealthResponse> {
    let _start_time = std::time::Instant::now();

    // Get basic health info
    let health_response = health_check(service_manager, db_pool).await;
    let health = health_response.into_inner();

    // Get scheduler metrics
    let scheduler_status = service_manager
        .scheduler_service
        .lock()
        .await
        .get_scheduler_status()
        .await;
    let job_history = service_manager
        .scheduler_service
        .lock()
        .await
        .get_job_history(None)
        .await;

    let failed_executions = job_history
        .values()
        .flat_map(|executions| executions.iter())
        .filter(|execution| {
            matches!(
                execution.status,
                crate::services::scheduler::JobStatus::Failed
            )
        })
        .count();

    Json(DetailedHealthResponse {
        status: health.status,
        timestamp: health.timestamp,
        version: health.version,
        uptime_seconds: service_manager
            .metrics_collector
            .get_system_metrics()
            .uptime_seconds,
        services: health.services,
        metrics: SystemMetrics {
            total_requests: service_manager
                .metrics_collector
                .get_api_metrics()
                .await
                .total_requests,
            active_connections: service_manager
                .metrics_collector
                .get_system_metrics()
                .active_connections,
            memory_usage_mb: get_memory_usage(),
            scheduler_jobs: SchedulerMetrics {
                is_running: scheduler_status.is_running,
                total_executions: scheduler_status.total_executions,
                failed_executions,
                last_daily_refresh: scheduler_status
                    .last_daily_refresh
                    .map(|dt| dt.to_rfc3339()),
                last_newsletter: scheduler_status.last_newsletter.map(|dt| dt.to_rfc3339()),
            },
        },
    })
}

async fn check_database_health(db_pool: &DbPool) -> ComponentHealth {
    let start_time = std::time::Instant::now();

    match db_pool.get() {
        Ok(mut conn) => {
            // Try a simple query
            use diesel::prelude::*;
            use diesel::sql_query;

            match sql_query("SELECT 1").execute(&mut conn) {
                Ok(_) => ComponentHealth {
                    status: "healthy".to_string(),
                    message: Some("Database connection successful".to_string()),
                    response_time_ms: Some(start_time.elapsed().as_millis() as u64),
                    last_check: chrono::Utc::now().to_rfc3339(),
                },
                Err(e) => ComponentHealth {
                    status: "unhealthy".to_string(),
                    message: Some(format!("Database query failed: {}", e)),
                    response_time_ms: Some(start_time.elapsed().as_millis() as u64),
                    last_check: chrono::Utc::now().to_rfc3339(),
                },
            }
        }
        Err(e) => ComponentHealth {
            status: "unhealthy".to_string(),
            message: Some(format!("Database connection failed: {}", e)),
            response_time_ms: Some(start_time.elapsed().as_millis() as u64),
            last_check: chrono::Utc::now().to_rfc3339(),
        },
    }
}

async fn check_scheduler_health(service_manager: &ServiceManager) -> ComponentHealth {
    let start_time = std::time::Instant::now();

    let scheduler_status = service_manager
        .scheduler_service
        .lock()
        .await
        .get_scheduler_status()
        .await;

    let status = if scheduler_status.is_running {
        "healthy"
    } else {
        "unhealthy"
    };

    let message = if scheduler_status.is_running {
        format!(
            "Scheduler running with {} jobs, {} total executions",
            scheduler_status.job_count, scheduler_status.total_executions
        )
    } else {
        "Scheduler is not running".to_string()
    };

    ComponentHealth {
        status: status.to_string(),
        message: Some(message),
        response_time_ms: Some(start_time.elapsed().as_millis() as u64),
        last_check: chrono::Utc::now().to_rfc3339(),
    }
}

async fn check_github_health() -> ComponentHealth {
    let start_time = std::time::Instant::now();

    // Simple connectivity check to GitHub
    match reqwest::get("https://api.github.com").await {
        Ok(response) => {
            let status = if response.status().is_success() {
                "healthy"
            } else {
                "degraded"
            };

            ComponentHealth {
                status: status.to_string(),
                message: Some(format!(
                    "GitHub API responded with status: {}",
                    response.status()
                )),
                response_time_ms: Some(start_time.elapsed().as_millis() as u64),
                last_check: chrono::Utc::now().to_rfc3339(),
            }
        }
        Err(e) => ComponentHealth {
            status: "unhealthy".to_string(),
            message: Some(format!("GitHub API unreachable: {}", e)),
            response_time_ms: Some(start_time.elapsed().as_millis() as u64),
            last_check: chrono::Utc::now().to_rfc3339(),
        },
    }
}

fn get_memory_usage() -> u64 {
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

#[derive(Serialize, Deserialize)]
pub struct SystemDiagnosticsResponse {
    pub timestamp: String,
    pub system_info: SystemInfo,
    pub performance_metrics: PerformanceMetrics,
    pub service_status: ServiceStatus,
    pub recent_alerts: Vec<Alert>,
    pub resource_usage: ResourceUsage,
}

#[derive(Serialize, Deserialize)]
pub struct SystemInfo {
    pub hostname: String,
    pub platform: String,
    pub architecture: String,
    pub rust_version: String,
    pub app_version: String,
}

#[derive(Serialize, Deserialize)]
pub struct PerformanceMetrics {
    pub avg_response_time_ms: f64,
    pub requests_per_minute: f64,
    pub error_rate_percent: f64,
    pub slowest_endpoints: Vec<EndpointPerformance>,
}

#[derive(Serialize, Deserialize)]
pub struct EndpointPerformance {
    pub endpoint: String,
    pub avg_response_time_ms: f64,
    pub request_count: u64,
    pub error_count: u64,
}

#[derive(Serialize, Deserialize)]
pub struct ServiceStatus {
    pub database_pool_size: u32,
    pub scheduler_jobs_count: usize,
    pub active_subscriptions: i64,
    pub total_repositories: i64,
    pub last_data_refresh: Option<String>,
}

#[derive(Serialize, Deserialize)]
pub struct ResourceUsage {
    pub memory_mb: u64,
    pub cpu_usage_percent: f64,
    pub disk_usage_percent: f64,
    pub network_connections: u32,
}

#[get("/health/diagnostics")]
pub async fn system_diagnostics(
    service_manager: &State<ServiceManager>,
    db_pool: &State<DbPool>,
) -> Json<SystemDiagnosticsResponse> {
    // Get system information
    let system_info = SystemInfo {
        hostname: std::env::var("HOSTNAME").unwrap_or_else(|_| "unknown".to_string()),
        platform: std::env::consts::OS.to_string(),
        architecture: std::env::consts::ARCH.to_string(),
        rust_version: std::env::var("RUSTC_VERSION").unwrap_or_else(|_| "unknown".to_string()),
        app_version: env!("CARGO_PKG_VERSION").to_string(),
    };

    // Get performance metrics
    let api_metrics = service_manager.metrics_collector.get_api_metrics().await;
    let endpoint_metrics = service_manager
        .metrics_collector
        .get_endpoint_metrics()
        .await;

    let error_rate = if api_metrics.total_requests > 0 {
        (api_metrics.failed_requests as f64 / api_metrics.total_requests as f64) * 100.0
    } else {
        0.0
    };

    let requests_per_minute = if let Some(last_request) = api_metrics.last_request {
        let minutes_since_start = (chrono::Utc::now() - last_request).num_minutes() as f64;
        if minutes_since_start > 0.0 {
            api_metrics.total_requests as f64 / minutes_since_start
        } else {
            0.0
        }
    } else {
        0.0
    };

    // Get slowest endpoints
    let mut slowest_endpoints: Vec<EndpointPerformance> = endpoint_metrics
        .into_values()
        .map(|metrics| EndpointPerformance {
            endpoint: format!("{} {}", metrics.method, metrics.path),
            avg_response_time_ms: metrics.average_response_time_ms,
            request_count: metrics.request_count,
            error_count: metrics.error_count,
        })
        .collect();

    slowest_endpoints.sort_by(|a, b| {
        b.avg_response_time_ms
            .partial_cmp(&a.avg_response_time_ms)
            .unwrap()
    });
    slowest_endpoints.truncate(5); // Top 5 slowest

    let performance_metrics = PerformanceMetrics {
        avg_response_time_ms: api_metrics.average_response_time_ms,
        requests_per_minute,
        error_rate_percent: error_rate,
        slowest_endpoints,
    };

    // Get service status
    let scheduler_status = service_manager
        .scheduler_service
        .lock()
        .await
        .get_scheduler_status()
        .await;
    let service_status = ServiceStatus {
        database_pool_size: 10, // Default pool size - could be made configurable
        scheduler_jobs_count: scheduler_status.job_count,
        active_subscriptions: get_active_subscriptions_count(db_pool).await,
        total_repositories: get_total_repositories_count(db_pool).await,
        last_data_refresh: scheduler_status
            .last_daily_refresh
            .map(|dt| dt.to_rfc3339()),
    };

    // Get recent alerts (last 10)
    let recent_alerts = service_manager
        .alerting_service
        .get_all_alerts(Some(10))
        .await;

    // Get resource usage
    let system_metrics = service_manager.metrics_collector.get_system_metrics();
    let resource_usage = ResourceUsage {
        memory_mb: system_metrics.memory_usage_mb,
        cpu_usage_percent: get_cpu_usage(),
        disk_usage_percent: get_disk_usage(),
        network_connections: system_metrics.active_connections,
    };

    Json(SystemDiagnosticsResponse {
        timestamp: chrono::Utc::now().to_rfc3339(),
        system_info,
        performance_metrics,
        service_status,
        recent_alerts,
        resource_usage,
    })
}

async fn get_active_subscriptions_count(db_pool: &DbPool) -> i64 {
    use crate::schema::newsletter_subscriptions::dsl::*;
    use diesel::prelude::*;

    match db_pool.get() {
        Ok(mut conn) => newsletter_subscriptions
            .filter(is_active.eq(true))
            .count()
            .get_result(&mut conn)
            .unwrap_or(0),
        Err(_) => 0,
    }
}

async fn get_total_repositories_count(db_pool: &DbPool) -> i64 {
    use crate::schema::repositories::dsl::*;
    use diesel::prelude::*;

    match db_pool.get() {
        Ok(mut conn) => repositories.count().get_result(&mut conn).unwrap_or(0),
        Err(_) => 0,
    }
}

fn get_cpu_usage() -> f64 {
    // Basic CPU usage estimation
    // In a production environment, you might want to use a more sophisticated approach
    #[cfg(target_os = "linux")]
    {
        if let Ok(loadavg) = std::fs::read_to_string("/proc/loadavg") {
            if let Some(load_str) = loadavg.split_whitespace().next() {
                if let Ok(load) = load_str.parse::<f64>() {
                    // Convert load average to approximate CPU percentage
                    // This is a rough estimation
                    return (load * 100.0).min(100.0);
                }
            }
        }
    }

    0.0 // Fallback
}

fn get_disk_usage() -> f64 {
    // Basic disk usage estimation
    // In a production environment, you might want to use a more sophisticated approach
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

    0.0 // Fallback
}

pub fn routes() -> Vec<rocket::Route> {
    rocket::routes![health_check, detailed_health_check, system_diagnostics]
}
