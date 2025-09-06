pub mod alerting;
pub mod email_client;
pub mod github_scraper;
pub mod llm_client;
pub mod logging;
pub mod metrics;
pub mod newsletter_service;
pub mod newsletter_template;
pub mod repository_service;
pub mod scheduler;
pub mod service_manager;
pub mod summary_service;

#[allow(unused_imports)]
pub use alerting::{
    Alert, AlertSeverity, AlertStatistics, AlertType, AlertingConfig, AlertingService,
};
#[allow(unused_imports)]
pub use email_client::{BulkEmailResult, EmailClient, EmailError};
#[allow(unused_imports)]
pub use github_scraper::{GitHubScraper, ScraperError};
#[allow(unused_imports)]
pub use llm_client::{LLMClient, LLMError, RepositoryContext};
#[allow(unused_imports)]
pub use logging::{LogCategory, LogLevel, StructuredLogEntry, StructuredLogger};
#[allow(unused_imports)]
pub use metrics::{ApiMetrics, EndpointMetrics, JobMetrics, MetricsCollector, SystemMetrics};
#[allow(unused_imports)]
pub use newsletter_service::{
    NewsletterSendResult, NewsletterService, NewsletterServiceError, NewsletterStatistics,
};
#[allow(unused_imports)]
pub use newsletter_template::{NewsletterTemplate, TemplateError};
#[allow(unused_imports)]
pub use repository_service::{
    RefreshResult, RepositoryService, RepositoryServiceError, RepositoryStatistics,
};
#[allow(unused_imports)]
pub use scheduler::{JobExecution, JobStatus, SchedulerError, SchedulerService};
#[allow(unused_imports)]
pub use service_manager::{ServiceManager, ServiceManagerError};
#[allow(unused_imports)]
pub use summary_service::{SummaryService, SummaryServiceError, SummaryStatistics};
