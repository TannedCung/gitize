use crate::database::DbPool;
use crate::services::newsletter_analytics::{CampaignAnalytics, EngagementEventType};
use crate::services::newsletter_service::{
    NewsletterService, NewsletterServiceError, TrackedNewsletterResult,
};
use crate::services::repository_service::RepositoryService;
use rocket::serde::json::Json;
use rocket::{get, post, routes, Route, State};
use serde::{Deserialize, Serialize};
use std::collections::HashMap;
use std::sync::Arc;

#[derive(Deserialize)]
pub struct CreateCampaignRequest {
    name: String,
    subject_line: String,
    template_version: String,
    segment_criteria: Option<serde_json::Value>,
}

#[derive(Deserialize)]
pub struct TrackEngagementRequest {
    campaign_id: String,
    email: String,
    user_id: Option<i64>,
    event_type: String, // Will be converted to EngagementEventType
    event_data: HashMap<String, serde_json::Value>,
    user_agent: Option<String>,
    ip_address: Option<String>,
}

#[derive(Deserialize)]
pub struct SendTrackedNewsletterRequest {
    campaign_name: String,
    subject_line: String,
    segment_id: Option<String>,
    test_id: Option<String>,
}

#[derive(Deserialize)]
pub struct CompareCampaignsRequest {
    campaign_ids: Vec<String>,
}

#[derive(Serialize)]
pub struct CreateCampaignResponse {
    campaign_id: String,
    message: String,
}

#[derive(Serialize)]
pub struct TrackEngagementResponse {
    engagement_id: String,
    message: String,
}

#[derive(Serialize)]
pub struct ErrorResponse {
    error: String,
    code: String,
}

impl From<NewsletterServiceError> for ErrorResponse {
    fn from(error: NewsletterServiceError) -> Self {
        let code = match error {
            NewsletterServiceError::DatabaseError(_) => "DATABASE_ERROR",
            NewsletterServiceError::PoolError(_) => "CONNECTION_ERROR",
            NewsletterServiceError::RepositoryServiceError(_) => "REPOSITORY_ERROR",
            NewsletterServiceError::EmailError(_) => "EMAIL_ERROR",
            NewsletterServiceError::TemplateError(_) => "TEMPLATE_ERROR",
            NewsletterServiceError::PersonalizationError(_) => "PERSONALIZATION_ERROR",
            NewsletterServiceError::ABTestError(_) => "AB_TEST_ERROR",
            NewsletterServiceError::AnalyticsError(_) => "ANALYTICS_ERROR",
            NewsletterServiceError::ConfigError(_) => "CONFIG_ERROR",
            NewsletterServiceError::ValidationError(_) => "VALIDATION_ERROR",
            NewsletterServiceError::AlreadySubscribed => "ALREADY_SUBSCRIBED",
            NewsletterServiceError::NotFound => "NOT_FOUND",
            NewsletterServiceError::InvalidToken => "INVALID_TOKEN",
        };

        ErrorResponse {
            error: error.to_string(),
            code: code.to_string(),
        }
    }
}

fn parse_engagement_event_type(event_type: &str) -> Result<EngagementEventType, String> {
    match event_type.to_lowercase().as_str() {
        "sent" => Ok(EngagementEventType::Sent),
        "delivered" => Ok(EngagementEventType::Delivered),
        "opened" => Ok(EngagementEventType::Opened),
        "clicked" => Ok(EngagementEventType::Clicked),
        "bounced" => Ok(EngagementEventType::Bounced),
        "complained" => Ok(EngagementEventType::Complained),
        "unsubscribed" => Ok(EngagementEventType::Unsubscribed),
        "converted" => Ok(EngagementEventType::Converted),
        _ => Err(format!("Invalid event type: {}", event_type)),
    }
}

#[post("/newsletter/analytics/campaigns", data = "<request>")]
pub async fn create_campaign(
    db_pool: &State<Arc<DbPool>>,
    request: Json<CreateCampaignRequest>,
) -> Result<Json<CreateCampaignResponse>, Json<ErrorResponse>> {
    let repository_service = Arc::new(RepositoryService::new(db_pool.inner().clone()));
    let mut service = match NewsletterService::new(db_pool.inner().clone(), repository_service) {
        Ok(service) => service,
        Err(e) => return Err(Json(e.into())),
    };

    match service
        .create_campaign(
            request.name.clone(),
            request.subject_line.clone(),
            request.template_version.clone(),
            request.segment_criteria.clone(),
        )
        .await
    {
        Ok(campaign_id) => Ok(Json(CreateCampaignResponse {
            campaign_id,
            message: "Campaign created successfully".to_string(),
        })),
        Err(e) => Err(Json(e.into())),
    }
}

#[post("/newsletter/analytics/track", data = "<request>")]
pub async fn track_engagement(
    db_pool: &State<Arc<DbPool>>,
    request: Json<TrackEngagementRequest>,
) -> Result<Json<TrackEngagementResponse>, Json<ErrorResponse>> {
    let repository_service = Arc::new(RepositoryService::new(db_pool.inner().clone()));
    let mut service = match NewsletterService::new(db_pool.inner().clone(), repository_service) {
        Ok(service) => service,
        Err(e) => return Err(Json(e.into())),
    };

    let event_type = match parse_engagement_event_type(&request.event_type) {
        Ok(event_type) => event_type,
        Err(e) => {
            return Err(Json(ErrorResponse {
                error: e,
                code: "INVALID_EVENT_TYPE".to_string(),
            }))
        }
    };

    match service
        .track_engagement(
            request.campaign_id.clone(),
            request.email.clone(),
            request.user_id,
            event_type,
            request.event_data.clone(),
            request.user_agent.clone(),
            request.ip_address.clone(),
        )
        .await
    {
        Ok(engagement_id) => Ok(Json(TrackEngagementResponse {
            engagement_id,
            message: "Engagement tracked successfully".to_string(),
        })),
        Err(e) => Err(Json(e.into())),
    }
}

#[get("/newsletter/analytics/campaigns/<campaign_id>")]
pub async fn get_campaign_analytics(
    db_pool: &State<Arc<DbPool>>,
    campaign_id: String,
) -> Result<Json<CampaignAnalytics>, Json<ErrorResponse>> {
    let repository_service = Arc::new(RepositoryService::new(db_pool.inner().clone()));
    let service = match NewsletterService::new(db_pool.inner().clone(), repository_service) {
        Ok(service) => service,
        Err(e) => return Err(Json(e.into())),
    };

    match service.get_campaign_analytics(&campaign_id).await {
        Ok(analytics) => Ok(Json(analytics)),
        Err(e) => Err(Json(e.into())),
    }
}

#[get("/newsletter/analytics/campaigns")]
pub async fn get_all_campaigns_analytics(
    db_pool: &State<Arc<DbPool>>,
) -> Result<Json<Vec<CampaignAnalytics>>, Json<ErrorResponse>> {
    let repository_service = Arc::new(RepositoryService::new(db_pool.inner().clone()));
    let service = match NewsletterService::new(db_pool.inner().clone(), repository_service) {
        Ok(service) => service,
        Err(e) => return Err(Json(e.into())),
    };

    let analytics = service.get_all_campaigns_analytics().await;
    Ok(Json(analytics))
}

#[post("/newsletter/analytics/compare", data = "<request>")]
pub async fn compare_campaigns(
    db_pool: &State<Arc<DbPool>>,
    request: Json<CompareCampaignsRequest>,
) -> Result<Json<crate::services::newsletter_analytics::CampaignComparison>, Json<ErrorResponse>> {
    let repository_service = Arc::new(RepositoryService::new(db_pool.inner().clone()));
    let service = match NewsletterService::new(db_pool.inner().clone(), repository_service) {
        Ok(service) => service,
        Err(e) => return Err(Json(e.into())),
    };

    match service
        .compare_campaigns(request.campaign_ids.clone())
        .await
    {
        Ok(comparison) => Ok(Json(comparison)),
        Err(e) => Err(Json(e.into())),
    }
}

#[get("/newsletter/analytics/segments")]
pub async fn get_segment_performance(
    db_pool: &State<Arc<DbPool>>,
) -> Result<Json<Vec<crate::services::newsletter_analytics::SegmentPerformance>>, Json<ErrorResponse>>
{
    let repository_service = Arc::new(RepositoryService::new(db_pool.inner().clone()));
    let service = match NewsletterService::new(db_pool.inner().clone(), repository_service) {
        Ok(service) => service,
        Err(e) => return Err(Json(e.into())),
    };

    let performance = service.get_segment_performance().await;
    Ok(Json(performance))
}

#[get("/newsletter/analytics/segments/<segment_id>/recommendations")]
pub async fn get_optimization_recommendations(
    db_pool: &State<Arc<DbPool>>,
    segment_id: String,
) -> Result<Json<Vec<String>>, Json<ErrorResponse>> {
    let repository_service = Arc::new(RepositoryService::new(db_pool.inner().clone()));
    let service = match NewsletterService::new(db_pool.inner().clone(), repository_service) {
        Ok(service) => service,
        Err(e) => return Err(Json(e.into())),
    };

    match service.get_optimization_recommendations(&segment_id).await {
        Ok(recommendations) => Ok(Json(recommendations)),
        Err(e) => Err(Json(e.into())),
    }
}

#[post("/newsletter/analytics/send-tracked", data = "<request>")]
pub async fn send_tracked_newsletter(
    db_pool: &State<Arc<DbPool>>,
    request: Json<SendTrackedNewsletterRequest>,
) -> Result<Json<TrackedNewsletterResult>, Json<ErrorResponse>> {
    let repository_service = Arc::new(RepositoryService::new(db_pool.inner().clone()));
    let mut service = match NewsletterService::new(db_pool.inner().clone(), repository_service) {
        Ok(service) => service,
        Err(e) => return Err(Json(e.into())),
    };

    match service
        .send_tracked_newsletter(
            request.campaign_name.clone(),
            request.subject_line.clone(),
            request.segment_id.clone(),
            request.test_id.clone(),
        )
        .await
    {
        Ok(result) => {
            log::info!(
                "Tracked newsletter sent: {} successful, {} failed",
                result.successful_sends.len(),
                result.failed_sends.len()
            );
            Ok(Json(result))
        }
        Err(e) => {
            log::error!("Failed to send tracked newsletter: {}", e);
            Err(Json(e.into()))
        }
    }
}

pub fn routes() -> Vec<Route> {
    routes![
        create_campaign,
        track_engagement,
        get_campaign_analytics,
        get_all_campaigns_analytics,
        compare_campaigns,
        get_segment_performance,
        get_optimization_recommendations,
        send_tracked_newsletter
    ]
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_parse_engagement_event_type() {
        assert!(matches!(
            parse_engagement_event_type("sent"),
            Ok(EngagementEventType::Sent)
        ));
        assert!(matches!(
            parse_engagement_event_type("OPENED"),
            Ok(EngagementEventType::Opened)
        ));
        assert!(matches!(
            parse_engagement_event_type("clicked"),
            Ok(EngagementEventType::Clicked)
        ));
        assert!(parse_engagement_event_type("invalid").is_err());
    }

    #[test]
    fn test_create_campaign_request() {
        let request = CreateCampaignRequest {
            name: "Test Campaign".to_string(),
            subject_line: "Test Subject".to_string(),
            template_version: "v1.0".to_string(),
            segment_criteria: None,
        };

        assert_eq!(request.name, "Test Campaign");
        assert_eq!(request.subject_line, "Test Subject");
        assert_eq!(request.template_version, "v1.0");
        assert!(request.segment_criteria.is_none());
    }

    #[test]
    fn test_track_engagement_request() {
        let mut event_data = HashMap::new();
        event_data.insert(
            "url".to_string(),
            serde_json::Value::String("https://example.com".to_string()),
        );

        let request = TrackEngagementRequest {
            campaign_id: "campaign-123".to_string(),
            email: "test@example.com".to_string(),
            user_id: Some(1),
            event_type: "clicked".to_string(),
            event_data,
            user_agent: Some("Mozilla/5.0".to_string()),
            ip_address: Some("192.168.1.1".to_string()),
        };

        assert_eq!(request.campaign_id, "campaign-123");
        assert_eq!(request.email, "test@example.com");
        assert_eq!(request.user_id, Some(1));
        assert_eq!(request.event_type, "clicked");
        assert!(request.event_data.contains_key("url"));
    }

    #[test]
    fn test_error_response_from_service_error() {
        let analytics_error = NewsletterServiceError::AnalyticsError(
            crate::services::newsletter_analytics::NewsletterAnalyticsError::InvalidTrackingData(
                "test".to_string(),
            ),
        );
        let error_response: ErrorResponse = analytics_error.into();
        assert_eq!(error_response.code, "ANALYTICS_ERROR");
    }
}
