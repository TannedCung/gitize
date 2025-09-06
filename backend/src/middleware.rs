use crate::services::{AlertingService, MetricsCollector, StructuredLogger};
use log::{info, warn};
use rocket::fairing::{Fairing, Info, Kind};
use rocket::{Data, Request, Response};
use std::sync::Arc;
use std::time::Instant;

pub struct MetricsFairing {
    metrics_collector: Arc<MetricsCollector>,
    alerting_service: Arc<AlertingService>,
}

impl MetricsFairing {
    pub fn new(
        metrics_collector: Arc<MetricsCollector>,
        alerting_service: Arc<AlertingService>,
    ) -> Self {
        Self {
            metrics_collector,
            alerting_service,
        }
    }
}

#[rocket::async_trait]
impl Fairing for MetricsFairing {
    fn info(&self) -> Info {
        Info {
            name: "API Metrics and Monitoring",
            kind: Kind::Request | Kind::Response,
        }
    }

    async fn on_request(&self, request: &mut Request<'_>, _: &mut Data<'_>) {
        // Store the start time in request local state
        request.local_cache(Instant::now);

        // Log the incoming request with structured logging
        let client_ip = request.client_ip().map(|ip| ip.to_string());

        info!(
            "Incoming request: {} {} from {}",
            request.method(),
            request.uri(),
            client_ip.as_deref().unwrap_or("unknown")
        );
    }

    async fn on_response<'r>(&self, request: &'r Request<'_>, response: &mut Response<'r>) {
        // Get the start time from request local state
        let start_time = request.local_cache(Instant::now);
        let duration = start_time.elapsed();
        let duration_ms = duration.as_millis() as u64;

        let method = request.method().to_string();
        let path = request.uri().path().to_string();
        let status = response.status();
        let success = status.code < 400;

        // Record metrics
        self.metrics_collector
            .record_api_request(success, duration_ms)
            .await;
        self.metrics_collector
            .record_endpoint_request(&path, &method, success, duration_ms)
            .await;

        // Log the response with structured logging
        let client_ip = request.client_ip().map(|ip| ip.to_string());
        let user_agent = request.headers().get_one("User-Agent");

        StructuredLogger::log_api_request(
            &method,
            &path,
            status.code,
            duration_ms,
            client_ip.as_deref(),
            user_agent,
        );

        // Also log with traditional logging for backwards compatibility
        let client_ip_str = client_ip.clone().unwrap_or_else(|| "unknown".to_string());
        if success {
            info!(
                "Response: {} {} {} - {}ms - {} from {}",
                method,
                path,
                status.code,
                duration_ms,
                status.reason().unwrap_or(""),
                client_ip_str
            );
        } else {
            warn!(
                "Error response: {} {} {} - {}ms - {} from {}",
                method,
                path,
                status.code,
                duration_ms,
                status.reason().unwrap_or(""),
                client_ip_str
            );
        }

        // Check for performance issues and create alerts
        if duration_ms > 5000 {
            // Alert if response time > 5 seconds
            self.alerting_service
                .alert_performance_degradation(
                    &format!("{} {}", method, path),
                    "response_time_ms",
                    duration_ms as f64,
                )
                .await;
        }

        // Alert on server errors
        if status.code >= 500 {
            self.alerting_service
                .create_alert(
                    crate::services::AlertType::SystemError,
                    crate::services::AlertSeverity::High,
                    format!("Server Error: {} {}", method, path),
                    format!(
                        "Server error {} occurred for {} {} ({}ms)",
                        status.code, method, path, duration_ms
                    ),
                    Some({
                        let mut metadata = std::collections::HashMap::new();
                        metadata.insert("method".to_string(), method);
                        metadata.insert("path".to_string(), path);
                        metadata.insert("status_code".to_string(), status.code.to_string());
                        metadata.insert("response_time_ms".to_string(), duration_ms.to_string());
                        metadata.insert(
                            "client_ip".to_string(),
                            client_ip.unwrap_or_else(|| "unknown".to_string()),
                        );
                        metadata
                    }),
                )
                .await;
        }
    }
}

pub struct StructuredLoggingFairing;

#[rocket::async_trait]
impl Fairing for StructuredLoggingFairing {
    fn info(&self) -> Info {
        Info {
            name: "Structured Logging",
            kind: Kind::Ignite | Kind::Liftoff | Kind::Shutdown,
        }
    }

    async fn on_ignite(&self, rocket: rocket::Rocket<rocket::Build>) -> rocket::fairing::Result {
        info!("🚀 GitHub Trending Summarizer API starting up...");
        info!(
            "Environment: {}",
            std::env::var("ROCKET_ENV").unwrap_or_else(|_| "development".to_string())
        );
        info!(
            "Database URL configured: {}",
            std::env::var("DATABASE_URL").is_ok()
        );
        info!(
            "OpenAI API configured: {}",
            std::env::var("OPENAI_API_KEY").is_ok()
        );
        info!(
            "SendGrid API configured: {}",
            std::env::var("SENDGRID_API_KEY").is_ok()
        );
        Ok(rocket)
    }

    async fn on_liftoff(&self, _rocket: &rocket::Rocket<rocket::Orbit>) {
        info!("✅ GitHub Trending Summarizer API is ready to serve requests");
        info!("Health check available at: /api/health");
        info!("Detailed health check available at: /api/health/detailed");
        info!("Admin endpoints available at: /api/admin/*");
    }

    async fn on_shutdown(&self, _rocket: &rocket::Rocket<rocket::Orbit>) {
        info!("🛑 GitHub Trending Summarizer API shutting down...");
    }
}
