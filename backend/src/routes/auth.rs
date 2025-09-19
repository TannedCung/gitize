use crate::models::{
    LoginRequest, LoginResponse, RefreshTokenRequest, UpdateUserPreferencesRequest, UserProfile,
};
use crate::services::ServiceManager;
use rocket::http::{Header, Status};
use rocket::outcome::Outcome;
use rocket::request::{self, FromRequest, Request};
use rocket::serde::json::Json;
use rocket::{get, post, put, routes, Route, State};
use serde_json::json;

pub fn routes() -> Vec<Route> {
    routes![
        github_auth_url,
        github_callback,
        google_auth_url,
        google_callback,
        refresh_token,
        get_profile,
        update_preferences,
        logout
    ]
}

// JWT Authentication Guard
pub struct AuthenticatedUser {
    pub user_id: i64,
    pub email: String,
}

#[rocket::async_trait]
impl<'r> FromRequest<'r> for AuthenticatedUser {
    type Error = &'static str;

    async fn from_request(request: &'r Request<'_>) -> request::Outcome<Self, Self::Error> {
        let service_manager = match request.guard::<&State<ServiceManager>>().await {
            Outcome::Success(sm) => sm,
            _ => return Outcome::Error((Status::InternalServerError, "Service manager not found")),
        };

        let auth_header = match request.headers().get_one("Authorization") {
            Some(header) => header,
            None => return Outcome::Error((Status::Unauthorized, "Missing authorization header")),
        };

        let token = match auth_header.strip_prefix("Bearer ") {
            Some(token) => token,
            None => {
                return Outcome::Error((
                    Status::Unauthorized,
                    "Invalid authorization header format",
                ))
            }
        };

        match service_manager.auth_service.verify_token(token) {
            Ok(claims) => {
                let user_id = match claims.sub.parse::<i64>() {
                    Ok(id) => id,
                    Err(_) => {
                        return Outcome::Error((Status::Unauthorized, "Invalid user ID in token"))
                    }
                };

                Outcome::Success(AuthenticatedUser {
                    user_id,
                    email: claims.email,
                })
            }
            Err(_) => Outcome::Error((Status::Unauthorized, "Invalid or expired token")),
        }
    }
}

#[get("/auth/github")]
pub async fn github_auth_url(
    service_manager: &State<ServiceManager>,
) -> Result<Json<serde_json::Value>, Status> {
    let (auth_url, csrf_token) = service_manager.auth_service.get_github_auth_url();

    Ok(Json(json!({
        "auth_url": auth_url,
        "state": csrf_token
    })))
}

#[post("/auth/github/callback", data = "<login_request>")]
pub async fn github_callback(
    login_request: Json<LoginRequest>,
    service_manager: &State<ServiceManager>,
) -> Result<Json<LoginResponse>, Status> {
    match service_manager
        .auth_service
        .github_callback(&login_request.code, login_request.state.clone())
        .await
    {
        Ok(response) => Ok(Json(response)),
        Err(e) => {
            log::error!("GitHub callback error: {}", e);
            Err(Status::BadRequest)
        }
    }
}

#[get("/auth/google")]
pub async fn google_auth_url(
    service_manager: &State<ServiceManager>,
) -> Result<Json<serde_json::Value>, Status> {
    let (auth_url, csrf_token) = service_manager.auth_service.get_google_auth_url();

    Ok(Json(json!({
        "auth_url": auth_url,
        "state": csrf_token
    })))
}

#[post("/auth/google/callback", data = "<login_request>")]
pub async fn google_callback(
    login_request: Json<LoginRequest>,
    service_manager: &State<ServiceManager>,
) -> Result<Json<LoginResponse>, Status> {
    match service_manager
        .auth_service
        .google_callback(&login_request.code, login_request.state.clone())
        .await
    {
        Ok(response) => Ok(Json(response)),
        Err(e) => {
            log::error!("Google callback error: {}", e);
            Err(Status::BadRequest)
        }
    }
}

#[post("/auth/refresh", data = "<refresh_request>")]
pub async fn refresh_token(
    refresh_request: Json<RefreshTokenRequest>,
    service_manager: &State<ServiceManager>,
) -> Result<Json<LoginResponse>, Status> {
    match service_manager
        .auth_service
        .refresh_access_token(&refresh_request.refresh_token)
        .await
    {
        Ok(response) => Ok(Json(response)),
        Err(e) => {
            log::error!("Token refresh error: {}", e);
            Err(Status::Unauthorized)
        }
    }
}

#[get("/user/profile")]
pub async fn get_profile(
    user: AuthenticatedUser,
    service_manager: &State<ServiceManager>,
) -> Result<Json<UserProfile>, Status> {
    match service_manager
        .user_repository
        .find_user_by_id(user.user_id)
        .await
    {
        Ok(Some(user)) => Ok(Json(user.into())),
        Ok(None) => Err(Status::NotFound),
        Err(e) => {
            log::error!("Error fetching user profile: {}", e);
            Err(Status::InternalServerError)
        }
    }
}

#[put("/user/preferences", data = "<preferences>")]
pub async fn update_preferences(
    user: AuthenticatedUser,
    preferences: Json<UpdateUserPreferencesRequest>,
    service_manager: &State<ServiceManager>,
) -> Result<Json<UserProfile>, Status> {
    match service_manager
        .auth_service
        .update_user_preferences(
            user.user_id,
            preferences.preferred_languages.clone(),
            preferences.username.clone(),
        )
        .await
    {
        Ok(user_profile) => Ok(Json(user_profile)),
        Err(e) => {
            log::error!("Error updating user preferences: {}", e);
            Err(Status::InternalServerError)
        }
    }
}

#[post("/auth/logout")]
pub async fn logout() -> Result<Json<serde_json::Value>, Status> {
    // In a JWT-based system, logout is typically handled client-side
    // by removing the token. We could implement a token blacklist here
    // if needed for enhanced security.
    Ok(Json(json!({
        "message": "Logged out successfully"
    })))
}

// CORS headers for authentication endpoints
pub struct CorsHeaders;

impl CorsHeaders {
    pub fn headers() -> Vec<Header<'static>> {
        vec![
            Header::new("Access-Control-Allow-Origin", "*"),
            Header::new(
                "Access-Control-Allow-Methods",
                "GET, POST, PUT, DELETE, OPTIONS",
            ),
            Header::new(
                "Access-Control-Allow-Headers",
                "Content-Type, Authorization",
            ),
            Header::new("Access-Control-Max-Age", "86400"),
        ]
    }
}
