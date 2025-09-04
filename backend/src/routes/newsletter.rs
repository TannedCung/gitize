use crate::database::DbPool;
use crate::services::newsletter_service::{
    NewsletterService, NewsletterServiceError, NewsletterStatistics,
};
use rocket::serde::json::Json;
use rocket::{get, post, routes, Route, State};
use serde::{Deserialize, Serialize};
use std::sync::Arc;

#[derive(Deserialize)]
pub struct SubscribeRequest {
    email: String,
}

#[derive(Serialize)]
pub struct SubscribeResponse {
    message: String,
    subscription_id: i64,
    unsubscribe_url: String,
}

#[derive(Serialize)]
pub struct UnsubscribeResponse {
    message: String,
    email: String,
}

#[derive(Serialize)]
pub struct ErrorResponse {
    error: String,
    code: String,
}

#[derive(Serialize)]
pub struct StatusResponse {
    subscribed: bool,
    email: String,
}

impl From<NewsletterServiceError> for ErrorResponse {
    fn from(error: NewsletterServiceError) -> Self {
        let code = match error {
            NewsletterServiceError::DatabaseError(_) => "DATABASE_ERROR",
            NewsletterServiceError::PoolError(_) => "CONNECTION_ERROR",
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

#[post("/newsletter/subscribe", data = "<request>")]
pub async fn subscribe(
    db_pool: &State<Arc<DbPool>>,
    request: Json<SubscribeRequest>,
) -> Result<Json<SubscribeResponse>, Json<ErrorResponse>> {
    let service = NewsletterService::new(db_pool.inner().clone());

    // Validate email format
    if let Err(e) = NewsletterService::validate_email(&request.email) {
        return Err(Json(e.into()));
    }

    match service.subscribe(request.email.clone()).await {
        Ok(subscription) => {
            let unsubscribe_url = subscription.unsubscribe_url("http://localhost:8000");

            Ok(Json(SubscribeResponse {
                message: "Successfully subscribed to newsletter".to_string(),
                subscription_id: subscription.id,
                unsubscribe_url,
            }))
        }
        Err(e) => Err(Json(e.into())),
    }
}

#[get("/newsletter/unsubscribe/<token>")]
pub async fn unsubscribe(
    db_pool: &State<Arc<DbPool>>,
    token: String,
) -> Result<Json<UnsubscribeResponse>, Json<ErrorResponse>> {
    let service = NewsletterService::new(db_pool.inner().clone());

    match service.unsubscribe(token).await {
        Ok(subscription) => Ok(Json(UnsubscribeResponse {
            message: "Successfully unsubscribed from newsletter".to_string(),
            email: subscription.email,
        })),
        Err(e) => Err(Json(e.into())),
    }
}

#[get("/newsletter/status/<email>")]
pub async fn get_subscription_status(
    db_pool: &State<Arc<DbPool>>,
    email: String,
) -> Result<Json<StatusResponse>, Json<ErrorResponse>> {
    let service = NewsletterService::new(db_pool.inner().clone());

    // Validate email format
    if let Err(e) = NewsletterService::validate_email(&email) {
        return Err(Json(e.into()));
    }

    match service.is_subscribed(&email).await {
        Ok(subscribed) => Ok(Json(StatusResponse { subscribed, email })),
        Err(e) => Err(Json(e.into())),
    }
}

#[get("/newsletter/stats")]
pub async fn get_newsletter_statistics(
    db_pool: &State<Arc<DbPool>>,
) -> Result<Json<NewsletterStatistics>, Json<ErrorResponse>> {
    let service = NewsletterService::new(db_pool.inner().clone());

    match service.get_statistics().await {
        Ok(stats) => Ok(Json(stats)),
        Err(e) => Err(Json(e.into())),
    }
}

pub fn routes() -> Vec<Route> {
    routes![
        subscribe,
        unsubscribe,
        get_subscription_status,
        get_newsletter_statistics
    ]
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_subscribe_request_validation() {
        let request = SubscribeRequest {
            email: "test@example.com".to_string(),
        };

        assert_eq!(request.email, "test@example.com");
    }

    #[test]
    fn test_error_response_from_service_error() {
        let validation_error = NewsletterServiceError::ValidationError("Invalid email".to_string());
        let error_response: ErrorResponse = validation_error.into();
        assert_eq!(error_response.code, "VALIDATION_ERROR");

        let already_subscribed_error = NewsletterServiceError::AlreadySubscribed;
        let error_response: ErrorResponse = already_subscribed_error.into();
        assert_eq!(error_response.code, "ALREADY_SUBSCRIBED");

        let not_found_error = NewsletterServiceError::NotFound;
        let error_response: ErrorResponse = not_found_error.into();
        assert_eq!(error_response.code, "NOT_FOUND");
    }

    #[test]
    fn test_subscribe_response_structure() {
        let response = SubscribeResponse {
            message: "Success".to_string(),
            subscription_id: 123,
            unsubscribe_url: "http://example.com/unsubscribe/token".to_string(),
        };

        assert_eq!(response.message, "Success");
        assert_eq!(response.subscription_id, 123);
        assert!(response.unsubscribe_url.contains("unsubscribe"));
    }

    #[test]
    fn test_unsubscribe_response_structure() {
        let response = UnsubscribeResponse {
            message: "Unsubscribed".to_string(),
            email: "test@example.com".to_string(),
        };

        assert_eq!(response.message, "Unsubscribed");
        assert_eq!(response.email, "test@example.com");
    }

    #[test]
    fn test_status_response_structure() {
        let response = StatusResponse {
            subscribed: true,
            email: "test@example.com".to_string(),
        };

        assert!(response.subscribed);
        assert_eq!(response.email, "test@example.com");
    }
}
