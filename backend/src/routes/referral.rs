use crate::routes::auth::AuthenticatedUser;
use crate::services::{
    referral_service::{ReferralDashboard, ReferralStats, TrackReferralRequest},
    ServiceManager,
};
use rocket::http::Status;
use rocket::serde::json::Json;
use rocket::{get, post, routes, Route, State};
use serde_json::json;

pub fn routes() -> Vec<Route> {
    routes![
        get_referral_stats,
        get_referral_dashboard,
        track_referral_click,
        validate_referral_code,
        get_referral_attribution,
        get_social_sharing_urls
    ]
}

#[get("/referral/stats")]
pub async fn get_referral_stats(
    user: AuthenticatedUser,
    service_manager: &State<ServiceManager>,
) -> Result<Json<ReferralStats>, Status> {
    match service_manager
        .referral_service
        .get_referral_stats(user.user_id)
        .await
    {
        Ok(stats) => Ok(Json(stats)),
        Err(e) => {
            log::error!("Error getting referral stats: {}", e);
            Err(Status::InternalServerError)
        }
    }
}

#[get("/referral/dashboard")]
pub async fn get_referral_dashboard(
    user: AuthenticatedUser,
    service_manager: &State<ServiceManager>,
) -> Result<Json<ReferralDashboard>, Status> {
    match service_manager
        .referral_service
        .get_referral_dashboard(user.user_id)
        .await
    {
        Ok(dashboard) => Ok(Json(dashboard)),
        Err(e) => {
            log::error!("Error getting referral dashboard: {}", e);
            Err(Status::InternalServerError)
        }
    }
}

#[post("/referral/track", data = "<track_request>")]
pub async fn track_referral_click(
    track_request: Json<TrackReferralRequest>,
    service_manager: &State<ServiceManager>,
) -> Result<Json<serde_json::Value>, Status> {
    match service_manager
        .referral_service
        .track_referral_click(track_request.into_inner())
        .await
    {
        Ok(_) => Ok(Json(json!({
            "success": true,
            "message": "Referral click tracked successfully"
        }))),
        Err(e) => {
            log::error!("Error tracking referral click: {}", e);
            Err(Status::BadRequest)
        }
    }
}

#[get("/referral/validate/<referral_code>")]
pub async fn validate_referral_code(
    referral_code: &str,
    service_manager: &State<ServiceManager>,
) -> Result<Json<serde_json::Value>, Status> {
    match service_manager
        .referral_service
        .validate_referral_code(referral_code)
        .await
    {
        Ok(is_valid) => Ok(Json(json!({
            "valid": is_valid,
            "referral_code": referral_code
        }))),
        Err(e) => {
            log::error!("Error validating referral code: {}", e);
            Err(Status::InternalServerError)
        }
    }
}

#[get("/referral/attribution")]
pub async fn get_referral_attribution(
    user: AuthenticatedUser,
    service_manager: &State<ServiceManager>,
) -> Result<Json<serde_json::Value>, Status> {
    match service_manager
        .referral_service
        .get_referral_attribution(user.user_id)
        .await
    {
        Ok(attribution) => Ok(Json(json!({
            "referred_by": attribution
        }))),
        Err(e) => {
            log::error!("Error getting referral attribution: {}", e);
            Err(Status::InternalServerError)
        }
    }
}

#[get("/referral/social-sharing/<referral_code>?<base_url>")]
pub async fn get_social_sharing_urls(
    referral_code: &str,
    base_url: Option<&str>,
    service_manager: &State<ServiceManager>,
) -> Result<Json<serde_json::Value>, Status> {
    let base_url = base_url.unwrap_or("https://github-trending-summarizer.com");

    let urls = service_manager
        .referral_service
        .generate_social_sharing_urls(referral_code, base_url);

    let url_map: std::collections::HashMap<String, String> = urls.into_iter().collect();

    Ok(Json(json!({
        "referral_code": referral_code,
        "base_url": base_url,
        "sharing_urls": url_map
    })))
}
