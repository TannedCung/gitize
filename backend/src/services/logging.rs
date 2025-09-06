use chrono::{DateTime, Utc};
use log::{debug, error, info, warn};
use serde::{Deserialize, Serialize};
use std::collections::HashMap;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum LogLevel {
    Debug,
    Info,
    Warn,
    Error,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum LogCategory {
    ApiRequest,
    DatabaseOperation,
    ExternalApiCall,
    ScheduledJob,
    SystemEvent,
    SecurityEvent,
    PerformanceEvent,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct StructuredLogEntry {
    pub timestamp: DateTime<Utc>,
    pub level: LogLevel,
    pub category: LogCategory,
    pub message: String,
    pub context: HashMap<String, String>,
    pub duration_ms: Option<u64>,
    pub error_details: Option<String>,
}

pub struct StructuredLogger;

impl StructuredLogger {
    pub fn log_api_request(
        method: &str,
        path: &str,
        status_code: u16,
        duration_ms: u64,
        client_ip: Option<&str>,
        user_agent: Option<&str>,
    ) {
        let mut context = HashMap::new();
        context.insert("method".to_string(), method.to_string());
        context.insert("path".to_string(), path.to_string());
        context.insert("status_code".to_string(), status_code.to_string());

        if let Some(ip) = client_ip {
            context.insert("client_ip".to_string(), ip.to_string());
        }

        if let Some(ua) = user_agent {
            context.insert("user_agent".to_string(), ua.to_string());
        }

        let entry = StructuredLogEntry {
            timestamp: Utc::now(),
            level: if status_code >= 500 {
                LogLevel::Error
            } else if status_code >= 400 {
                LogLevel::Warn
            } else {
                LogLevel::Info
            },
            category: LogCategory::ApiRequest,
            message: format!("{} {} - {}", method, path, status_code),
            context,
            duration_ms: Some(duration_ms),
            error_details: None,
        };

        Self::emit_log(&entry);
    }

    pub fn log_database_operation(
        operation: &str,
        table: &str,
        success: bool,
        duration_ms: u64,
        error: Option<&str>,
    ) {
        let mut context = HashMap::new();
        context.insert("operation".to_string(), operation.to_string());
        context.insert("table".to_string(), table.to_string());
        context.insert("success".to_string(), success.to_string());

        let entry = StructuredLogEntry {
            timestamp: Utc::now(),
            level: if success {
                LogLevel::Info
            } else {
                LogLevel::Error
            },
            category: LogCategory::DatabaseOperation,
            message: format!(
                "Database {} on {} - {}",
                operation,
                table,
                if success { "SUCCESS" } else { "FAILED" }
            ),
            context,
            duration_ms: Some(duration_ms),
            error_details: error.map(|e| e.to_string()),
        };

        Self::emit_log(&entry);
    }

    pub fn log_external_api_call(
        api_name: &str,
        endpoint: &str,
        method: &str,
        status_code: Option<u16>,
        duration_ms: u64,
        error: Option<&str>,
    ) {
        let mut context = HashMap::new();
        context.insert("api_name".to_string(), api_name.to_string());
        context.insert("endpoint".to_string(), endpoint.to_string());
        context.insert("method".to_string(), method.to_string());

        if let Some(code) = status_code {
            context.insert("status_code".to_string(), code.to_string());
        }

        let success = status_code.is_some_and(|code| code < 400);

        let entry = StructuredLogEntry {
            timestamp: Utc::now(),
            level: if success {
                LogLevel::Info
            } else {
                LogLevel::Error
            },
            category: LogCategory::ExternalApiCall,
            message: format!(
                "External API call to {} {} - {}",
                api_name,
                endpoint,
                status_code.map_or("ERROR".to_string(), |c| c.to_string())
            ),
            context,
            duration_ms: Some(duration_ms),
            error_details: error.map(|e| e.to_string()),
        };

        Self::emit_log(&entry);
    }

    pub fn log_scheduled_job(
        job_name: &str,
        status: &str,
        duration_ms: Option<u64>,
        error: Option<&str>,
        metadata: Option<HashMap<String, String>>,
    ) {
        let mut context = HashMap::new();
        context.insert("job_name".to_string(), job_name.to_string());
        context.insert("status".to_string(), status.to_string());

        if let Some(meta) = metadata {
            context.extend(meta);
        }

        let entry = StructuredLogEntry {
            timestamp: Utc::now(),
            level: match status {
                "completed" => LogLevel::Info,
                "failed" => LogLevel::Error,
                "started" => LogLevel::Info,
                _ => LogLevel::Warn,
            },
            category: LogCategory::ScheduledJob,
            message: format!("Scheduled job '{}' - {}", job_name, status.to_uppercase()),
            context,
            duration_ms,
            error_details: error.map(|e| e.to_string()),
        };

        Self::emit_log(&entry);
    }

    pub fn log_system_event(
        event_type: &str,
        message: &str,
        severity: LogLevel,
        metadata: Option<HashMap<String, String>>,
    ) {
        let mut context = HashMap::new();
        context.insert("event_type".to_string(), event_type.to_string());

        if let Some(meta) = metadata {
            context.extend(meta);
        }

        let entry = StructuredLogEntry {
            timestamp: Utc::now(),
            level: severity,
            category: LogCategory::SystemEvent,
            message: format!("System event: {} - {}", event_type, message),
            context,
            duration_ms: None,
            error_details: None,
        };

        Self::emit_log(&entry);
    }

    pub fn log_security_event(
        event_type: &str,
        client_ip: Option<&str>,
        user_agent: Option<&str>,
        details: &str,
    ) {
        let mut context = HashMap::new();
        context.insert("event_type".to_string(), event_type.to_string());

        if let Some(ip) = client_ip {
            context.insert("client_ip".to_string(), ip.to_string());
        }

        if let Some(ua) = user_agent {
            context.insert("user_agent".to_string(), ua.to_string());
        }

        let entry = StructuredLogEntry {
            timestamp: Utc::now(),
            level: LogLevel::Warn,
            category: LogCategory::SecurityEvent,
            message: format!("Security event: {} - {}", event_type, details),
            context,
            duration_ms: None,
            error_details: None,
        };

        Self::emit_log(&entry);
    }

    pub fn log_performance_event(
        component: &str,
        metric: &str,
        value: f64,
        threshold: f64,
        details: &str,
    ) {
        let mut context = HashMap::new();
        context.insert("component".to_string(), component.to_string());
        context.insert("metric".to_string(), metric.to_string());
        context.insert("value".to_string(), value.to_string());
        context.insert("threshold".to_string(), threshold.to_string());

        let entry = StructuredLogEntry {
            timestamp: Utc::now(),
            level: if value > threshold {
                LogLevel::Warn
            } else {
                LogLevel::Info
            },
            category: LogCategory::PerformanceEvent,
            message: format!(
                "Performance event: {} {} = {} (threshold: {})",
                component, metric, value, threshold
            ),
            context,
            duration_ms: None,
            error_details: if value > threshold {
                Some(details.to_string())
            } else {
                None
            },
        };

        Self::emit_log(&entry);
    }

    fn emit_log(entry: &StructuredLogEntry) {
        let log_message = if let Ok(json) = serde_json::to_string(entry) {
            json
        } else {
            format!(
                "[{}] {} - {}",
                entry.timestamp.format("%Y-%m-%d %H:%M:%S UTC"),
                format!("{:?}", entry.level).to_uppercase(),
                entry.message
            )
        };

        match entry.level {
            LogLevel::Debug => debug!("{}", log_message),
            LogLevel::Info => info!("{}", log_message),
            LogLevel::Warn => warn!("{}", log_message),
            LogLevel::Error => error!("{}", log_message),
        }
    }
}

// Convenience macros for structured logging
#[macro_export]
macro_rules! log_api_request {
    ($method:expr, $path:expr, $status:expr, $duration:expr) => {
        $crate::services::logging::StructuredLogger::log_api_request(
            $method, $path, $status, $duration, None, None,
        );
    };
    ($method:expr, $path:expr, $status:expr, $duration:expr, $ip:expr, $ua:expr) => {
        $crate::services::logging::StructuredLogger::log_api_request(
            $method, $path, $status, $duration, $ip, $ua,
        );
    };
}

#[macro_export]
macro_rules! log_db_operation {
    ($op:expr, $table:expr, $success:expr, $duration:expr) => {
        $crate::services::logging::StructuredLogger::log_database_operation(
            $op, $table, $success, $duration, None,
        );
    };
    ($op:expr, $table:expr, $success:expr, $duration:expr, $error:expr) => {
        $crate::services::logging::StructuredLogger::log_database_operation(
            $op,
            $table,
            $success,
            $duration,
            Some($error),
        );
    };
}

#[macro_export]
macro_rules! log_external_api {
    ($api:expr, $endpoint:expr, $method:expr, $status:expr, $duration:expr) => {
        $crate::services::logging::StructuredLogger::log_external_api_call(
            $api, $endpoint, $method, $status, $duration, None,
        );
    };
    ($api:expr, $endpoint:expr, $method:expr, $status:expr, $duration:expr, $error:expr) => {
        $crate::services::logging::StructuredLogger::log_external_api_call(
            $api,
            $endpoint,
            $method,
            $status,
            $duration,
            Some($error),
        );
    };
}
