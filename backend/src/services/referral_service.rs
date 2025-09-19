use crate::models::UserProfile;
use crate::repositories::user_repo::UserRepository;
use anyhow::{anyhow, Result};
use chrono::{DateTime, Utc};
use rand::{distributions::Alphanumeric, Rng};
use serde::{Deserialize, Serialize};
use std::sync::Arc;

#[derive(Debug, Serialize, Deserialize)]
pub struct ReferralStats {
    pub referral_code: String,
    pub total_referrals: i64,
    pub successful_signups: i64,
    pub conversion_rate: f64,
    pub recent_referrals: Vec<ReferralEvent>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct ReferralEvent {
    pub referred_user_id: i64,
    pub referred_user_email: String,
    pub referred_user_username: Option<String>,
    pub signup_date: DateTime<Utc>,
    pub source: String, // 'github', 'google', 'direct'
}

#[derive(Debug, Serialize, Deserialize)]
pub struct ReferralDashboard {
    pub user_stats: ReferralStats,
    pub leaderboard: Vec<ReferralLeaderboardEntry>,
    pub rewards: Vec<ReferralReward>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct ReferralLeaderboardEntry {
    pub user_id: i64,
    pub username: Option<String>,
    pub referral_count: i64,
    pub rank: i32,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct ReferralReward {
    pub reward_type: String,
    pub description: String,
    pub threshold: i64,
    pub achieved: bool,
    pub achieved_at: Option<DateTime<Utc>>,
}

#[derive(Debug, Deserialize)]
pub struct TrackReferralRequest {
    pub referral_code: String,
    pub source: String,
    pub user_agent: Option<String>,
    pub ip_address: Option<String>,
}

pub struct ReferralService {
    user_repo: Arc<UserRepository>,
}

impl ReferralService {
    pub fn new(user_repo: Arc<UserRepository>) -> Self {
        Self { user_repo }
    }

    /// Generate a unique referral code
    pub fn generate_referral_code(&self) -> String {
        // In a real implementation, we'd check if this code already exists
        // For now, we'll assume it's unique
        rand::thread_rng()
            .sample_iter(&Alphanumeric)
            .take(8)
            .map(char::from)
            .collect::<String>()
            .to_uppercase()
    }

    /// Get referral statistics for a user
    pub async fn get_referral_stats(&self, user_id: i64) -> Result<ReferralStats> {
        let user = self
            .user_repo
            .find_user_by_id(user_id)
            .await?
            .ok_or_else(|| anyhow!("User not found"))?;

        let referral_code = user
            .referral_code
            .ok_or_else(|| anyhow!("User has no referral code"))?;

        // Get referred users
        let referred_users = self.user_repo.get_referred_users(user_id).await?;
        let total_referrals = referred_users.len() as i64;

        // Convert to referral events
        let recent_referrals: Vec<ReferralEvent> = referred_users
            .into_iter()
            .take(10) // Show only recent 10
            .map(|user| ReferralEvent {
                referred_user_id: user.id,
                referred_user_email: user.email,
                referred_user_username: user.username,
                signup_date: user
                    .created_at
                    .map(|dt| DateTime::from_naive_utc_and_offset(dt, Utc))
                    .unwrap_or_else(Utc::now),
                source: if user.github_id.is_some() {
                    "github".to_string()
                } else if user.google_id.is_some() {
                    "google".to_string()
                } else {
                    "direct".to_string()
                },
            })
            .collect();

        let successful_signups = total_referrals; // All referrals are successful signups
        let conversion_rate = if total_referrals > 0 { 100.0 } else { 0.0 };

        Ok(ReferralStats {
            referral_code,
            total_referrals,
            successful_signups,
            conversion_rate,
            recent_referrals,
        })
    }

    /// Get referral dashboard with stats, leaderboard, and rewards
    pub async fn get_referral_dashboard(&self, user_id: i64) -> Result<ReferralDashboard> {
        let user_stats = self.get_referral_stats(user_id).await?;
        let leaderboard = self.get_referral_leaderboard(10).await?;
        let rewards = self
            .get_referral_rewards(user_stats.total_referrals)
            .await?;

        Ok(ReferralDashboard {
            user_stats,
            leaderboard,
            rewards,
        })
    }

    /// Get referral leaderboard
    pub async fn get_referral_leaderboard(
        &self,
        _limit: i64,
    ) -> Result<Vec<ReferralLeaderboardEntry>> {
        // This is a simplified implementation
        // In a real system, we'd have a more efficient query
        let leaderboard = Vec::new();

        // For now, return empty leaderboard
        // In a full implementation, we'd query all users and their referral counts

        Ok(leaderboard)
    }

    /// Get referral rewards based on referral count
    pub async fn get_referral_rewards(&self, referral_count: i64) -> Result<Vec<ReferralReward>> {
        let rewards = vec![
            ReferralReward {
                reward_type: "bronze".to_string(),
                description: "First Referral - Bronze Badge".to_string(),
                threshold: 1,
                achieved: referral_count >= 1,
                achieved_at: if referral_count >= 1 {
                    Some(Utc::now())
                } else {
                    None
                },
            },
            ReferralReward {
                reward_type: "silver".to_string(),
                description: "5 Referrals - Silver Badge".to_string(),
                threshold: 5,
                achieved: referral_count >= 5,
                achieved_at: if referral_count >= 5 {
                    Some(Utc::now())
                } else {
                    None
                },
            },
            ReferralReward {
                reward_type: "gold".to_string(),
                description: "10 Referrals - Gold Badge".to_string(),
                threshold: 10,
                achieved: referral_count >= 10,
                achieved_at: if referral_count >= 10 {
                    Some(Utc::now())
                } else {
                    None
                },
            },
            ReferralReward {
                reward_type: "platinum".to_string(),
                description: "25 Referrals - Platinum Badge".to_string(),
                threshold: 25,
                achieved: referral_count >= 25,
                achieved_at: if referral_count >= 25 {
                    Some(Utc::now())
                } else {
                    None
                },
            },
            ReferralReward {
                reward_type: "diamond".to_string(),
                description: "50 Referrals - Diamond Badge".to_string(),
                threshold: 50,
                achieved: referral_count >= 50,
                achieved_at: if referral_count >= 50 {
                    Some(Utc::now())
                } else {
                    None
                },
            },
        ];

        Ok(rewards)
    }

    /// Track a referral click/visit
    pub async fn track_referral_click(&self, request: TrackReferralRequest) -> Result<()> {
        // Verify referral code exists
        let _referring_user = self
            .user_repo
            .find_user_by_referral_code(&request.referral_code)
            .await?
            .ok_or_else(|| anyhow!("Invalid referral code"))?;

        // In a full implementation, we'd track this in an analytics table
        // For now, we'll just log it
        log::info!(
            "Referral click tracked: code={}, source={}, user_agent={:?}, ip={:?}",
            request.referral_code,
            request.source,
            request.user_agent,
            request.ip_address
        );

        Ok(())
    }

    /// Validate a referral code
    pub async fn validate_referral_code(&self, referral_code: &str) -> Result<bool> {
        let user = self
            .user_repo
            .find_user_by_referral_code(referral_code)
            .await?;
        Ok(user.is_some())
    }

    /// Get referral attribution for analytics
    pub async fn get_referral_attribution(&self, user_id: i64) -> Result<Option<UserProfile>> {
        let user = self
            .user_repo
            .find_user_by_id(user_id)
            .await?
            .ok_or_else(|| anyhow!("User not found"))?;

        if let Some(referred_by_id) = user.referred_by_user_id {
            let referring_user = self.user_repo.find_user_by_id(referred_by_id).await?;
            Ok(referring_user.map(|u| u.into()))
        } else {
            Ok(None)
        }
    }

    /// Generate referral URL
    pub fn generate_referral_url(&self, referral_code: &str, base_url: &str) -> String {
        format!("{}?ref={}", base_url, referral_code)
    }

    /// Generate social sharing URLs with referral tracking
    pub fn generate_social_sharing_urls(
        &self,
        referral_code: &str,
        base_url: &str,
    ) -> Vec<(String, String)> {
        let referral_url = self.generate_referral_url(referral_code, base_url);
        let encoded_url = urlencoding::encode(&referral_url);
        let message =
            urlencoding::encode("Check out this awesome GitHub trending repository tracker!");

        vec![
            (
                "twitter".to_string(),
                format!(
                    "https://twitter.com/intent/tweet?text={}&url={}",
                    message, encoded_url
                ),
            ),
            (
                "linkedin".to_string(),
                format!(
                    "https://www.linkedin.com/sharing/share-offsite/?url={}",
                    encoded_url
                ),
            ),
            (
                "facebook".to_string(),
                format!(
                    "https://www.facebook.com/sharer/sharer.php?u={}",
                    encoded_url
                ),
            ),
            (
                "reddit".to_string(),
                format!(
                    "https://reddit.com/submit?url={}&title={}",
                    encoded_url, message
                ),
            ),
        ]
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::database::init_pool;
    use crate::repositories::user_repo::UserRepository;
    use std::sync::Arc;

    async fn setup_test_referral_service() -> ReferralService {
        let db_pool = init_pool();
        let user_repo = Arc::new(UserRepository::new(Arc::new(db_pool)));

        ReferralService::new(user_repo)
    }

    #[tokio::test]
    async fn test_generate_referral_code() {
        let service = setup_test_referral_service().await;

        let code1 = service.generate_referral_code();
        let code2 = service.generate_referral_code();

        assert_eq!(code1.len(), 8);
        assert_eq!(code2.len(), 8);
        assert_ne!(code1, code2);
        assert!(code1.chars().all(|c| c.is_ascii_alphanumeric()));
        assert!(code1.chars().all(|c| c.is_ascii_uppercase()));
    }

    #[tokio::test]
    async fn test_generate_referral_url() {
        let service = setup_test_referral_service().await;

        let url = service.generate_referral_url("TESTCODE", "https://example.com");
        assert_eq!(url, "https://example.com?ref=TESTCODE");
    }

    #[tokio::test]
    async fn test_generate_social_sharing_urls() {
        let service = setup_test_referral_service().await;

        let urls = service.generate_social_sharing_urls("TESTCODE", "https://example.com");

        assert_eq!(urls.len(), 4);
        assert!(urls.iter().any(|(platform, _)| platform == "twitter"));
        assert!(urls.iter().any(|(platform, _)| platform == "linkedin"));
        assert!(urls.iter().any(|(platform, _)| platform == "facebook"));
        assert!(urls.iter().any(|(platform, _)| platform == "reddit"));

        // Check that all URLs contain the referral code
        for (_, url) in urls {
            assert!(url.contains("TESTCODE"));
        }
    }

    #[tokio::test]
    async fn test_get_referral_rewards() {
        let service = setup_test_referral_service().await;

        let rewards = service
            .get_referral_rewards(7)
            .await
            .expect("Failed to get rewards");

        assert_eq!(rewards.len(), 5);

        // Check that rewards up to threshold are achieved
        assert!(rewards[0].achieved); // Bronze (1 referral)
        assert!(rewards[1].achieved); // Silver (5 referrals)
        assert!(!rewards[2].achieved); // Gold (10 referrals)
        assert!(!rewards[3].achieved); // Platinum (25 referrals)
        assert!(!rewards[4].achieved); // Diamond (50 referrals)
    }

    #[tokio::test]
    async fn test_track_referral_click() {
        let service = setup_test_referral_service().await;

        let request = TrackReferralRequest {
            referral_code: "TESTCODE".to_string(),
            source: "twitter".to_string(),
            user_agent: Some("Mozilla/5.0".to_string()),
            ip_address: Some("192.168.1.1".to_string()),
        };

        // This should not panic, even if the referral code doesn't exist in test
        // In a real implementation, we'd set up test data
        let result = service.track_referral_click(request).await;
        // We expect this to fail in tests since we don't have test data
        assert!(result.is_err());
    }
}
