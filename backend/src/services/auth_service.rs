use crate::models::{Claims, GitHubUser, GoogleUser, LoginResponse, NewUser, User, UserProfile};
use crate::repositories::user_repo::UserRepository;
use anyhow::{anyhow, Result};
use chrono::{Duration, Utc};
use jsonwebtoken::{decode, encode, Algorithm, DecodingKey, EncodingKey, Header, Validation};
use oauth2::{
    basic::BasicClient, reqwest::async_http_client, AuthUrl, AuthorizationCode, ClientId,
    ClientSecret, CsrfToken, RedirectUrl, Scope, TokenResponse, TokenUrl,
};
use rand::{distributions::Alphanumeric, Rng};
use reqwest::Client;
use serde_json::Value;
use std::env;
use std::sync::Arc;

pub struct AuthService {
    user_repo: Arc<UserRepository>,
    jwt_secret: String,
    github_client: BasicClient,
    google_client: BasicClient,
    http_client: Client,
}

impl AuthService {
    pub fn new(user_repo: Arc<UserRepository>) -> Result<Self> {
        let jwt_secret = env::var("JWT_SECRET").unwrap_or_else(|_| "your-secret-key".to_string());

        // GitHub OAuth client
        let github_client_id = ClientId::new(
            env::var("GITHUB_CLIENT_ID").map_err(|_| anyhow!("GITHUB_CLIENT_ID must be set"))?,
        );
        let github_client_secret = ClientSecret::new(
            env::var("GITHUB_CLIENT_SECRET")
                .map_err(|_| anyhow!("GITHUB_CLIENT_SECRET must be set"))?,
        );
        let github_auth_url = AuthUrl::new("https://github.com/login/oauth/authorize".to_string())
            .map_err(|_| anyhow!("Invalid GitHub auth URL"))?;
        let github_token_url =
            TokenUrl::new("https://github.com/login/oauth/access_token".to_string())
                .map_err(|_| anyhow!("Invalid GitHub token URL"))?;
        let github_redirect_url = RedirectUrl::new(
            env::var("GITHUB_REDIRECT_URL")
                .unwrap_or_else(|_| "http://localhost:3000/auth/github/callback".to_string()),
        )
        .map_err(|_| anyhow!("Invalid GitHub redirect URL"))?;

        let github_client = BasicClient::new(
            github_client_id,
            Some(github_client_secret),
            github_auth_url,
            Some(github_token_url),
        )
        .set_redirect_uri(github_redirect_url);

        // Google OAuth client
        let google_client_id = ClientId::new(
            env::var("GOOGLE_CLIENT_ID").map_err(|_| anyhow!("GOOGLE_CLIENT_ID must be set"))?,
        );
        let google_client_secret = ClientSecret::new(
            env::var("GOOGLE_CLIENT_SECRET")
                .map_err(|_| anyhow!("GOOGLE_CLIENT_SECRET must be set"))?,
        );
        let google_auth_url =
            AuthUrl::new("https://accounts.google.com/o/oauth2/v2/auth".to_string())
                .map_err(|_| anyhow!("Invalid Google auth URL"))?;
        let google_token_url =
            TokenUrl::new("https://www.googleapis.com/oauth2/v4/token".to_string())
                .map_err(|_| anyhow!("Invalid Google token URL"))?;
        let google_redirect_url = RedirectUrl::new(
            env::var("GOOGLE_REDIRECT_URL")
                .unwrap_or_else(|_| "http://localhost:3000/auth/google/callback".to_string()),
        )
        .map_err(|_| anyhow!("Invalid Google redirect URL"))?;

        let google_client = BasicClient::new(
            google_client_id,
            Some(google_client_secret),
            google_auth_url,
            Some(google_token_url),
        )
        .set_redirect_uri(google_redirect_url);

        Ok(Self {
            user_repo,
            jwt_secret,
            github_client,
            google_client,
            http_client: Client::new(),
        })
    }

    // JWT token methods
    pub fn generate_access_token(&self, user: &User) -> Result<String> {
        let expiration = Utc::now()
            .checked_add_signed(Duration::hours(24))
            .expect("valid timestamp")
            .timestamp() as usize;

        let claims = Claims {
            sub: user.id.to_string(),
            email: user.email.clone(),
            exp: expiration,
            iat: Utc::now().timestamp() as usize,
            iss: "github-trending-summarizer".to_string(),
        };

        let token = encode(
            &Header::default(),
            &claims,
            &EncodingKey::from_secret(self.jwt_secret.as_ref()),
        )?;

        Ok(token)
    }

    pub fn generate_refresh_token(&self, user: &User) -> Result<String> {
        let expiration = Utc::now()
            .checked_add_signed(Duration::days(30))
            .expect("valid timestamp")
            .timestamp() as usize;

        let claims = Claims {
            sub: user.id.to_string(),
            email: user.email.clone(),
            exp: expiration,
            iat: Utc::now().timestamp() as usize,
            iss: "github-trending-summarizer-refresh".to_string(),
        };

        let token = encode(
            &Header::default(),
            &claims,
            &EncodingKey::from_secret(self.jwt_secret.as_ref()),
        )?;

        Ok(token)
    }

    pub fn verify_token(&self, token: &str) -> Result<Claims> {
        let token_data = decode::<Claims>(
            token,
            &DecodingKey::from_secret(self.jwt_secret.as_ref()),
            &Validation::new(Algorithm::HS256),
        )?;

        Ok(token_data.claims)
    }

    pub fn generate_referral_code(&self) -> String {
        rand::thread_rng()
            .sample_iter(&Alphanumeric)
            .take(8)
            .map(char::from)
            .collect::<String>()
            .to_uppercase()
    }

    // GitHub OAuth methods
    pub fn get_github_auth_url(&self) -> (String, String) {
        let (auth_url, csrf_token) = self
            .github_client
            .authorize_url(CsrfToken::new_random)
            .add_scope(Scope::new("user:email".to_string()))
            .url();

        (auth_url.to_string(), csrf_token.secret().clone())
    }

    pub async fn github_callback(
        &self,
        code: &str,
        referral_code: Option<String>,
    ) -> Result<LoginResponse> {
        // Exchange code for token
        let token_result = self
            .github_client
            .exchange_code(AuthorizationCode::new(code.to_string()))
            .request_async(async_http_client)
            .await?;

        let access_token = token_result.access_token().secret();

        // Get user info from GitHub
        let github_user = self.get_github_user_info(access_token).await?;

        // Find or create user
        let user = match self
            .user_repo
            .find_user_by_github_id(github_user.id)
            .await?
        {
            Some(user) => {
                // Update last login
                self.user_repo.update_last_login(user.id).await?;
                user
            }
            None => {
                // Check if user exists with same email
                if let Some(existing_user) = self
                    .user_repo
                    .find_user_by_email(&github_user.email.clone().unwrap_or_default())
                    .await?
                {
                    // Link GitHub account to existing user
                    let update_user = crate::models::UpdateUser {
                        username: Some(github_user.login.clone()),
                        avatar_url: Some(github_user.avatar_url.clone()),
                        preferred_languages: None,
                        last_login_at: Some(Utc::now().naive_utc()),
                    };
                    self.user_repo
                        .update_user(existing_user.id, update_user)
                        .await?
                } else {
                    // Create new user
                    let referred_by_user_id = if let Some(ref_code) = referral_code {
                        self.user_repo
                            .find_user_by_referral_code(&ref_code)
                            .await?
                            .map(|u| u.id)
                    } else {
                        None
                    };

                    let new_user = NewUser {
                        github_id: Some(github_user.id),
                        google_id: None,
                        email: github_user.email.unwrap_or_default(),
                        username: Some(github_user.login),
                        avatar_url: Some(github_user.avatar_url),
                        preferred_languages: None,
                        referral_code: Some(self.generate_referral_code()),
                        referred_by_user_id,
                    };

                    self.user_repo.create_user(new_user).await?
                }
            }
        };

        // Generate tokens
        let access_token = self.generate_access_token(&user)?;
        let refresh_token = self.generate_refresh_token(&user)?;

        Ok(LoginResponse {
            access_token,
            refresh_token,
            user: user.into(),
        })
    }

    async fn get_github_user_info(&self, access_token: &str) -> Result<GitHubUser> {
        let response = self
            .http_client
            .get("https://api.github.com/user")
            .header("Authorization", format!("token {}", access_token))
            .header("User-Agent", "github-trending-summarizer")
            .send()
            .await?;

        if !response.status().is_success() {
            return Err(anyhow!(
                "Failed to get GitHub user info: {}",
                response.status()
            ));
        }

        let mut user: GitHubUser = response.json().await?;

        // Get user email if not public
        if user.email.is_none() {
            let email_response = self
                .http_client
                .get("https://api.github.com/user/emails")
                .header("Authorization", format!("token {}", access_token))
                .header("User-Agent", "github-trending-summarizer")
                .send()
                .await?;

            if email_response.status().is_success() {
                let emails: Vec<Value> = email_response.json().await?;
                if let Some(primary_email) = emails
                    .iter()
                    .find(|e| e["primary"].as_bool().unwrap_or(false))
                {
                    user.email = primary_email["email"].as_str().map(|s| s.to_string());
                }
            }
        }

        Ok(user)
    }

    // Google OAuth methods
    pub fn get_google_auth_url(&self) -> (String, String) {
        let (auth_url, csrf_token) = self
            .google_client
            .authorize_url(CsrfToken::new_random)
            .add_scope(Scope::new("email".to_string()))
            .add_scope(Scope::new("profile".to_string()))
            .url();

        (auth_url.to_string(), csrf_token.secret().clone())
    }

    pub async fn google_callback(
        &self,
        code: &str,
        referral_code: Option<String>,
    ) -> Result<LoginResponse> {
        // Exchange code for token
        let token_result = self
            .google_client
            .exchange_code(AuthorizationCode::new(code.to_string()))
            .request_async(async_http_client)
            .await?;

        let access_token = token_result.access_token().secret();

        // Get user info from Google
        let google_user = self.get_google_user_info(access_token).await?;

        // Find or create user
        let user = match self
            .user_repo
            .find_user_by_google_id(&google_user.id)
            .await?
        {
            Some(user) => {
                // Update last login
                self.user_repo.update_last_login(user.id).await?;
                user
            }
            None => {
                // Check if user exists with same email
                if let Some(existing_user) = self
                    .user_repo
                    .find_user_by_email(&google_user.email)
                    .await?
                {
                    // Link Google account to existing user
                    let update_user = crate::models::UpdateUser {
                        username: google_user.name.clone(),
                        avatar_url: google_user.picture.clone(),
                        preferred_languages: None,
                        last_login_at: Some(Utc::now().naive_utc()),
                    };
                    self.user_repo
                        .update_user(existing_user.id, update_user)
                        .await?
                } else {
                    // Create new user
                    let referred_by_user_id = if let Some(ref_code) = referral_code {
                        self.user_repo
                            .find_user_by_referral_code(&ref_code)
                            .await?
                            .map(|u| u.id)
                    } else {
                        None
                    };

                    let new_user = NewUser {
                        github_id: None,
                        google_id: Some(google_user.id),
                        email: google_user.email,
                        username: google_user.name,
                        avatar_url: google_user.picture,
                        preferred_languages: None,
                        referral_code: Some(self.generate_referral_code()),
                        referred_by_user_id,
                    };

                    self.user_repo.create_user(new_user).await?
                }
            }
        };

        // Generate tokens
        let access_token = self.generate_access_token(&user)?;
        let refresh_token = self.generate_refresh_token(&user)?;

        Ok(LoginResponse {
            access_token,
            refresh_token,
            user: user.into(),
        })
    }

    async fn get_google_user_info(&self, access_token: &str) -> Result<GoogleUser> {
        let response = self
            .http_client
            .get("https://www.googleapis.com/oauth2/v2/userinfo")
            .header("Authorization", format!("Bearer {}", access_token))
            .send()
            .await?;

        if !response.status().is_success() {
            return Err(anyhow!(
                "Failed to get Google user info: {}",
                response.status()
            ));
        }

        let user: GoogleUser = response.json().await?;
        Ok(user)
    }

    // Token refresh
    pub async fn refresh_access_token(&self, refresh_token: &str) -> Result<LoginResponse> {
        let claims = self.verify_token(refresh_token)?;

        // Verify this is a refresh token
        if claims.iss != "github-trending-summarizer-refresh" {
            return Err(anyhow!("Invalid refresh token"));
        }

        let user_id: i64 = claims.sub.parse()?;
        let user = self
            .user_repo
            .find_user_by_id(user_id)
            .await?
            .ok_or_else(|| anyhow!("User not found"))?;

        let access_token = self.generate_access_token(&user)?;
        let new_refresh_token = self.generate_refresh_token(&user)?;

        Ok(LoginResponse {
            access_token,
            refresh_token: new_refresh_token,
            user: user.into(),
        })
    }

    // User management
    pub async fn get_user_by_token(&self, token: &str) -> Result<User> {
        let claims = self.verify_token(token)?;
        let user_id: i64 = claims.sub.parse()?;

        self.user_repo
            .find_user_by_id(user_id)
            .await?
            .ok_or_else(|| anyhow!("User not found"))
    }

    pub async fn update_user_preferences(
        &self,
        user_id: i64,
        preferred_languages: Option<Vec<String>>,
        username: Option<String>,
    ) -> Result<UserProfile> {
        let update_user = crate::models::UpdateUser {
            username,
            avatar_url: None,
            preferred_languages: preferred_languages
                .map(|langs| langs.into_iter().map(Some).collect()),
            last_login_at: None,
        };

        let user = self.user_repo.update_user(user_id, update_user).await?;
        Ok(user.into())
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::database::init_pool;
    use crate::models::{NewUser, User};
    use crate::repositories::user_repo::UserRepository;
    use std::env;
    use std::sync::Arc;

    async fn setup_test_auth_service() -> AuthService {
        // Set test environment variables
        env::set_var("JWT_SECRET", "test-secret-key");
        env::set_var("GITHUB_CLIENT_ID", "test-github-client-id");
        env::set_var("GITHUB_CLIENT_SECRET", "test-github-client-secret");
        env::set_var("GOOGLE_CLIENT_ID", "test-google-client-id");
        env::set_var("GOOGLE_CLIENT_SECRET", "test-google-client-secret");

        let db_pool = init_pool();
        let user_repo = Arc::new(UserRepository::new(Arc::new(db_pool)));

        AuthService::new(user_repo).expect("Failed to create auth service")
    }

    async fn create_test_user(auth_service: &AuthService) -> User {
        let new_user = NewUser {
            github_id: Some(12345),
            google_id: None,
            email: "test@example.com".to_string(),
            username: Some("testuser".to_string()),
            avatar_url: Some("https://example.com/avatar.jpg".to_string()),
            preferred_languages: Some(vec![
                Some("rust".to_string()),
                Some("javascript".to_string()),
            ]),
            referral_code: Some("TESTREF1".to_string()),
            referred_by_user_id: None,
        };

        auth_service
            .user_repo
            .create_user(new_user)
            .await
            .expect("Failed to create test user")
    }

    #[tokio::test]
    async fn test_generate_access_token() {
        let auth_service = setup_test_auth_service().await;
        let user = create_test_user(&auth_service).await;

        let token = auth_service
            .generate_access_token(&user)
            .expect("Failed to generate access token");

        assert!(!token.is_empty());

        // Verify the token can be decoded
        let claims = auth_service
            .verify_token(&token)
            .expect("Failed to verify token");
        assert_eq!(claims.sub, user.id.to_string());
        assert_eq!(claims.email, user.email);
        assert_eq!(claims.iss, "github-trending-summarizer");
    }

    #[tokio::test]
    async fn test_generate_refresh_token() {
        let auth_service = setup_test_auth_service().await;
        let user = create_test_user(&auth_service).await;

        let token = auth_service
            .generate_refresh_token(&user)
            .expect("Failed to generate refresh token");

        assert!(!token.is_empty());

        // Verify the token can be decoded
        let claims = auth_service
            .verify_token(&token)
            .expect("Failed to verify token");
        assert_eq!(claims.sub, user.id.to_string());
        assert_eq!(claims.email, user.email);
        assert_eq!(claims.iss, "github-trending-summarizer-refresh");
    }

    #[tokio::test]
    async fn test_verify_token_invalid() {
        let auth_service = setup_test_auth_service().await;

        let result = auth_service.verify_token("invalid-token");
        assert!(result.is_err());
    }

    #[tokio::test]
    async fn test_generate_referral_code() {
        let auth_service = setup_test_auth_service().await;

        let code1 = auth_service.generate_referral_code();
        let code2 = auth_service.generate_referral_code();

        assert_eq!(code1.len(), 8);
        assert_eq!(code2.len(), 8);
        assert_ne!(code1, code2); // Should be different
        assert!(code1.chars().all(|c| c.is_ascii_alphanumeric()));
        assert!(code1.chars().all(|c| c.is_ascii_uppercase()));
    }

    #[tokio::test]
    async fn test_get_github_auth_url() {
        let auth_service = setup_test_auth_service().await;

        let (auth_url, csrf_token) = auth_service.get_github_auth_url();

        assert!(auth_url.contains("github.com/login/oauth/authorize"));
        assert!(auth_url.contains("client_id=test-github-client-id"));
        assert!(auth_url.contains("scope=user%3Aemail"));
        assert!(!csrf_token.is_empty());
    }

    #[tokio::test]
    async fn test_get_google_auth_url() {
        let auth_service = setup_test_auth_service().await;

        let (auth_url, csrf_token) = auth_service.get_google_auth_url();

        assert!(auth_url.contains("accounts.google.com/o/oauth2/v2/auth"));
        assert!(auth_url.contains("client_id=test-google-client-id"));
        assert!(auth_url.contains("scope=email"));
        assert!(!csrf_token.is_empty());
    }

    #[tokio::test]
    async fn test_refresh_access_token() {
        let auth_service = setup_test_auth_service().await;
        let user = create_test_user(&auth_service).await;

        // Generate a refresh token
        let refresh_token = auth_service
            .generate_refresh_token(&user)
            .expect("Failed to generate refresh token");

        // Use it to get a new access token
        let login_response = auth_service
            .refresh_access_token(&refresh_token)
            .await
            .expect("Failed to refresh token");

        assert!(!login_response.access_token.is_empty());
        assert!(!login_response.refresh_token.is_empty());
        assert_eq!(login_response.user.id, user.id);
        assert_eq!(login_response.user.email, user.email);
    }

    #[tokio::test]
    async fn test_get_user_by_token() {
        let auth_service = setup_test_auth_service().await;
        let user = create_test_user(&auth_service).await;

        let token = auth_service
            .generate_access_token(&user)
            .expect("Failed to generate access token");

        let retrieved_user = auth_service
            .get_user_by_token(&token)
            .await
            .expect("Failed to get user by token");

        assert_eq!(retrieved_user.id, user.id);
        assert_eq!(retrieved_user.email, user.email);
        assert_eq!(retrieved_user.username, user.username);
    }

    #[tokio::test]
    async fn test_update_user_preferences() {
        let auth_service = setup_test_auth_service().await;
        let user = create_test_user(&auth_service).await;

        let new_languages = Some(vec!["python".to_string(), "go".to_string()]);
        let new_username = Some("newusername".to_string());

        let updated_profile = auth_service
            .update_user_preferences(user.id, new_languages.clone(), new_username.clone())
            .await
            .expect("Failed to update user preferences");

        assert_eq!(updated_profile.id, user.id);
        assert_eq!(updated_profile.username, new_username);
        assert_eq!(updated_profile.preferred_languages, new_languages);
    }
}
