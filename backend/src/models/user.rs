use crate::schema::users;
use chrono::NaiveDateTime;
use diesel::prelude::*;
use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Queryable, Selectable, Serialize, Deserialize)]
#[diesel(table_name = users)]
#[diesel(check_for_backend(diesel::pg::Pg))]
pub struct User {
    pub id: i64,
    pub github_id: Option<i64>,
    pub google_id: Option<String>,
    pub email: String,
    pub username: Option<String>,
    pub avatar_url: Option<String>,
    pub preferred_languages: Option<Vec<Option<String>>>,
    pub created_at: Option<NaiveDateTime>,
    pub last_login_at: Option<NaiveDateTime>,
    pub referral_code: Option<String>,
    pub referred_by_user_id: Option<i64>,
}

#[derive(Debug, Insertable, Deserialize)]
#[diesel(table_name = users)]
pub struct NewUser {
    pub github_id: Option<i64>,
    pub google_id: Option<String>,
    pub email: String,
    pub username: Option<String>,
    pub avatar_url: Option<String>,
    pub preferred_languages: Option<Vec<Option<String>>>,
    pub referral_code: Option<String>,
    pub referred_by_user_id: Option<i64>,
}

#[derive(Debug, AsChangeset, Deserialize)]
#[diesel(table_name = users)]
pub struct UpdateUser {
    pub username: Option<String>,
    pub avatar_url: Option<String>,
    pub preferred_languages: Option<Vec<Option<String>>>,
    pub last_login_at: Option<NaiveDateTime>,
}

// TODO: Extension Preferences, Analytics Events, and Social Shares models
// These will be implemented in a future iteration once the core user management is working

// JWT Claims structure
#[derive(Debug, Serialize, Deserialize)]
pub struct Claims {
    pub sub: String, // User ID
    pub email: String,
    pub exp: usize,  // Expiration time
    pub iat: usize,  // Issued at
    pub iss: String, // Issuer
}

// OAuth user info structures
#[derive(Debug, Deserialize)]
pub struct GitHubUser {
    pub id: i64,
    pub login: String,
    pub email: Option<String>,
    pub avatar_url: String,
    pub name: Option<String>,
}

#[derive(Debug, Deserialize)]
pub struct GoogleUser {
    pub id: String,
    pub email: String,
    pub name: Option<String>,
    pub picture: Option<String>,
}

// API request/response structures
#[derive(Debug, Deserialize)]
pub struct LoginRequest {
    pub code: String,
    pub state: Option<String>,
}

#[derive(Debug, Serialize)]
pub struct LoginResponse {
    pub access_token: String,
    pub refresh_token: String,
    pub user: UserProfile,
}

#[derive(Debug, Serialize)]
pub struct UserProfile {
    pub id: i64,
    pub email: String,
    pub username: Option<String>,
    pub avatar_url: Option<String>,
    pub preferred_languages: Option<Vec<String>>,
    pub referral_code: Option<String>,
}

#[derive(Debug, Deserialize)]
pub struct UpdateUserPreferencesRequest {
    pub preferred_languages: Option<Vec<String>>,
    pub username: Option<String>,
}

#[derive(Debug, Deserialize)]
pub struct RefreshTokenRequest {
    pub refresh_token: String,
}

impl From<User> for UserProfile {
    fn from(user: User) -> Self {
        UserProfile {
            id: user.id,
            email: user.email,
            username: user.username,
            avatar_url: user.avatar_url,
            preferred_languages: user
                .preferred_languages
                .map(|langs| langs.into_iter().flatten().collect()),
            referral_code: user.referral_code,
        }
    }
}
