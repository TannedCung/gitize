use crate::models::Repository;
use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};
use std::collections::HashMap;
use thiserror::Error;

#[derive(Error, Debug)]
pub enum PersonalizationError {
    #[error("Invalid user preferences")]
    InvalidPreferences,
    #[error("No repositories found for personalization")]
    NoRepositories,
    #[error("Segmentation error: {0}")]
    SegmentationError(String),
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct UserSegment {
    pub id: String,
    pub name: String,
    pub description: String,
    pub criteria: SegmentCriteria,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SegmentCriteria {
    pub languages: Option<Vec<String>>,
    pub engagement_score_min: Option<f64>,
    pub engagement_score_max: Option<f64>,
    pub frequency: Option<String>,
    pub tech_interests: Option<Vec<String>>,
    pub signup_days_ago_min: Option<i64>,
    pub signup_days_ago_max: Option<i64>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct PersonalizationPreferences {
    pub preferred_languages: Vec<String>,
    pub tech_stack_interests: Vec<String>,
    pub frequency: String,
    pub engagement_score: f64,
    pub user_id: Option<i64>,
    pub signup_date: Option<DateTime<Utc>>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct PersonalizedContent {
    pub repositories: Vec<Repository>,
    pub segment: UserSegment,
    pub personalization_score: f64,
    pub reasons: Vec<String>,
}

pub struct PersonalizationEngine {
    segments: Vec<UserSegment>,
}

impl PersonalizationEngine {
    pub fn new() -> Self {
        Self {
            segments: Self::create_default_segments(),
        }
    }

    /// Create default user segments for newsletter personalization
    fn create_default_segments() -> Vec<UserSegment> {
        vec![
            UserSegment {
                id: "new_users".to_string(),
                name: "New Users".to_string(),
                description: "Users who signed up in the last 7 days".to_string(),
                criteria: SegmentCriteria {
                    languages: None,
                    engagement_score_min: None,
                    engagement_score_max: None,
                    frequency: None,
                    tech_interests: None,
                    signup_days_ago_min: Some(0),
                    signup_days_ago_max: Some(7),
                },
            },
            UserSegment {
                id: "highly_engaged".to_string(),
                name: "Highly Engaged".to_string(),
                description: "Users with high engagement scores".to_string(),
                criteria: SegmentCriteria {
                    languages: None,
                    engagement_score_min: Some(0.7),
                    engagement_score_max: None,
                    frequency: None,
                    tech_interests: None,
                    signup_days_ago_min: None,
                    signup_days_ago_max: None,
                },
            },
            UserSegment {
                id: "javascript_developers".to_string(),
                name: "JavaScript Developers".to_string(),
                description: "Users interested in JavaScript and related technologies".to_string(),
                criteria: SegmentCriteria {
                    languages: Some(vec!["JavaScript".to_string(), "TypeScript".to_string()]),
                    engagement_score_min: None,
                    engagement_score_max: None,
                    frequency: None,
                    tech_interests: Some(vec![
                        "React".to_string(),
                        "Node.js".to_string(),
                        "Vue".to_string(),
                        "Angular".to_string(),
                    ]),
                    signup_days_ago_min: None,
                    signup_days_ago_max: None,
                },
            },
            UserSegment {
                id: "rust_developers".to_string(),
                name: "Rust Developers".to_string(),
                description: "Users interested in Rust and systems programming".to_string(),
                criteria: SegmentCriteria {
                    languages: Some(vec!["Rust".to_string(), "C++".to_string(), "C".to_string()]),
                    engagement_score_min: None,
                    engagement_score_max: None,
                    frequency: None,
                    tech_interests: Some(vec![
                        "WebAssembly".to_string(),
                        "Systems Programming".to_string(),
                        "Performance".to_string(),
                    ]),
                    signup_days_ago_min: None,
                    signup_days_ago_max: None,
                },
            },
            UserSegment {
                id: "python_developers".to_string(),
                name: "Python Developers".to_string(),
                description: "Users interested in Python and data science".to_string(),
                criteria: SegmentCriteria {
                    languages: Some(vec!["Python".to_string()]),
                    engagement_score_min: None,
                    engagement_score_max: None,
                    frequency: None,
                    tech_interests: Some(vec![
                        "Machine Learning".to_string(),
                        "Data Science".to_string(),
                        "Django".to_string(),
                        "FastAPI".to_string(),
                    ]),
                    signup_days_ago_min: None,
                    signup_days_ago_max: None,
                },
            },
            UserSegment {
                id: "daily_subscribers".to_string(),
                name: "Daily Subscribers".to_string(),
                description: "Users who prefer daily newsletter frequency".to_string(),
                criteria: SegmentCriteria {
                    languages: None,
                    engagement_score_min: None,
                    engagement_score_max: None,
                    frequency: Some("daily".to_string()),
                    tech_interests: None,
                    signup_days_ago_min: None,
                    signup_days_ago_max: None,
                },
            },
            UserSegment {
                id: "low_engagement".to_string(),
                name: "Low Engagement".to_string(),
                description: "Users with low engagement who might need re-engagement".to_string(),
                criteria: SegmentCriteria {
                    languages: None,
                    engagement_score_min: Some(0.0),
                    engagement_score_max: Some(0.3),
                    frequency: None,
                    tech_interests: None,
                    signup_days_ago_min: Some(30),
                    signup_days_ago_max: None,
                },
            },
        ]
    }

    /// Personalize repository content for a user based on their preferences
    pub fn personalize_content(
        &self,
        repositories: Vec<Repository>,
        preferences: &PersonalizationPreferences,
    ) -> Result<PersonalizedContent, PersonalizationError> {
        if repositories.is_empty() {
            return Err(PersonalizationError::NoRepositories);
        }

        // Determine user segment
        let segment = self.determine_user_segment(preferences)?;

        // Score and filter repositories based on preferences
        let mut scored_repos: Vec<(Repository, f64, Vec<String>)> = repositories
            .into_iter()
            .map(|repo| {
                let (score, reasons) = self.calculate_repository_score(&repo, preferences);
                (repo, score, reasons)
            })
            .collect();

        // Sort by score descending
        scored_repos.sort_by(|a, b| b.1.partial_cmp(&a.1).unwrap_or(std::cmp::Ordering::Equal));

        // Take top repositories and extract reasons
        let personalized_repos: Vec<Repository> = scored_repos
            .iter()
            .take(10) // Limit to top 10 personalized repositories
            .map(|(repo, _, _)| repo.clone())
            .collect();

        let all_reasons: Vec<String> = scored_repos
            .iter()
            .take(5) // Get reasons for top 5
            .flat_map(|(_, _, reasons)| reasons.clone())
            .collect();

        // Calculate overall personalization score
        let personalization_score = if scored_repos.is_empty() {
            0.0
        } else {
            scored_repos
                .iter()
                .take(5)
                .map(|(_, score, _)| score)
                .sum::<f64>()
                / 5.0
        };

        Ok(PersonalizedContent {
            repositories: personalized_repos,
            segment,
            personalization_score,
            reasons: all_reasons,
        })
    }

    /// Determine which segment a user belongs to based on their preferences
    pub fn determine_user_segment(
        &self,
        preferences: &PersonalizationPreferences,
    ) -> Result<UserSegment, PersonalizationError> {
        let mut best_match: Option<(UserSegment, f64)> = None;

        for segment in &self.segments {
            let match_score = self.calculate_segment_match_score(&segment.criteria, preferences);

            if match_score > 0.0 {
                match best_match {
                    None => best_match = Some((segment.clone(), match_score)),
                    Some((_, current_score)) => {
                        if match_score > current_score {
                            best_match = Some((segment.clone(), match_score));
                        }
                    }
                }
            }
        }

        // Return best matching segment or default to general segment
        match best_match {
            Some((segment, _)) => Ok(segment),
            None => Ok(UserSegment {
                id: "general".to_string(),
                name: "General".to_string(),
                description: "General audience".to_string(),
                criteria: SegmentCriteria {
                    languages: None,
                    engagement_score_min: None,
                    engagement_score_max: None,
                    frequency: None,
                    tech_interests: None,
                    signup_days_ago_min: None,
                    signup_days_ago_max: None,
                },
            }),
        }
    }

    /// Calculate how well a user matches a segment's criteria
    pub fn calculate_segment_match_score(
        &self,
        criteria: &SegmentCriteria,
        preferences: &PersonalizationPreferences,
    ) -> f64 {
        let mut score = 0.0;
        let mut total_criteria = 0.0;

        // Check language preferences
        if let Some(segment_languages) = &criteria.languages {
            total_criteria += 1.0;
            let language_match = preferences
                .preferred_languages
                .iter()
                .any(|lang| segment_languages.contains(lang));
            if language_match {
                score += 1.0;
            }
        }

        // Check engagement score
        if let Some(min_engagement) = criteria.engagement_score_min {
            total_criteria += 1.0;
            if preferences.engagement_score >= min_engagement {
                score += 1.0;
            }
        }

        if let Some(max_engagement) = criteria.engagement_score_max {
            total_criteria += 1.0;
            if preferences.engagement_score <= max_engagement {
                score += 1.0;
            }
        }

        // Check frequency preference
        if let Some(segment_frequency) = &criteria.frequency {
            total_criteria += 1.0;
            if preferences.frequency == *segment_frequency {
                score += 1.0;
            }
        }

        // Check tech interests
        if let Some(segment_interests) = &criteria.tech_interests {
            total_criteria += 1.0;
            let interest_match = preferences
                .tech_stack_interests
                .iter()
                .any(|interest| segment_interests.contains(interest));
            if interest_match {
                score += 1.0;
            }
        }

        // Check signup date criteria
        if let (Some(signup_date), Some(min_days)) =
            (preferences.signup_date, criteria.signup_days_ago_min)
        {
            total_criteria += 1.0;
            let days_since_signup = (Utc::now() - signup_date).num_days();
            if days_since_signup >= min_days {
                score += 1.0;
            }
        }

        if let (Some(signup_date), Some(max_days)) =
            (preferences.signup_date, criteria.signup_days_ago_max)
        {
            total_criteria += 1.0;
            let days_since_signup = (Utc::now() - signup_date).num_days();
            if days_since_signup <= max_days {
                score += 1.0;
            }
        }

        // Return normalized score
        if total_criteria > 0.0 {
            score / total_criteria
        } else {
            0.0
        }
    }

    /// Calculate personalization score for a repository based on user preferences
    pub fn calculate_repository_score(
        &self,
        repository: &Repository,
        preferences: &PersonalizationPreferences,
    ) -> (f64, Vec<String>) {
        let mut score = 0.0;
        let mut reasons = Vec::new();

        // Base score for all repositories
        score += 0.1;

        // Language preference matching
        if let Some(repo_language) = &repository.language {
            if preferences.preferred_languages.contains(repo_language) {
                score += 0.4;
                reasons.push(format!("Matches your {} preference", repo_language));
            }
        }

        // Tech stack interest matching (check in description)
        if let Some(description) = &repository.description {
            let description_lower = description.to_lowercase();
            for interest in &preferences.tech_stack_interests {
                if description_lower.contains(&interest.to_lowercase()) {
                    score += 0.2;
                    reasons.push(format!("Related to {}", interest));
                }
            }
        }

        // Repository popularity boost
        let star_score = match repository.stars {
            0..=100 => 0.0,
            101..=1000 => 0.1,
            1001..=5000 => 0.2,
            5001..=10000 => 0.3,
            _ => 0.4,
        };
        score += star_score;

        if repository.stars > 1000 {
            reasons.push(format!("Popular project with {} stars", repository.stars));
        }

        // Recent trending boost
        let days_since_trending = (Utc::now().date_naive() - repository.trending_date).num_days();
        if days_since_trending <= 1 {
            score += 0.2;
            reasons.push("Recently trending".to_string());
        } else if days_since_trending <= 3 {
            score += 0.1;
            reasons.push("Trending this week".to_string());
        }

        // Engagement score influence
        let engagement_multiplier = 1.0 + (preferences.engagement_score * 0.2);
        score *= engagement_multiplier;

        (score, reasons)
    }

    /// Get all available segments
    pub fn get_segments(&self) -> &Vec<UserSegment> {
        &self.segments
    }

    /// Add a custom segment
    pub fn add_segment(&mut self, segment: UserSegment) {
        self.segments.push(segment);
    }

    /// Get segment statistics for a list of users
    pub fn get_segment_statistics(
        &self,
        user_preferences: Vec<PersonalizationPreferences>,
    ) -> Result<HashMap<String, usize>, PersonalizationError> {
        let mut segment_counts = HashMap::new();

        for preferences in user_preferences {
            let segment = self.determine_user_segment(&preferences)?;
            *segment_counts.entry(segment.id).or_insert(0) += 1;
        }

        Ok(segment_counts)
    }
}

impl Default for PersonalizationEngine {
    fn default() -> Self {
        Self::new()
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use chrono::{Duration, Utc};

    fn create_test_repository(
        name: &str,
        language: Option<&str>,
        stars: i32,
        description: Option<&str>,
    ) -> Repository {
        Repository {
            id: 1,
            github_id: 1,
            name: name.to_string(),
            full_name: format!("test/{}", name),
            description: description.map(|s| s.to_string()),
            stars,
            forks: 10,
            language: language.map(|s| s.to_string()),
            author: "test".to_string(),
            url: "https://github.com/test/repo".to_string(),
            trending_date: Utc::now().date_naive(),
            created_at: Some(Utc::now().naive_utc()),
            updated_at: Some(Utc::now().naive_utc()),
        }
    }

    fn create_test_preferences() -> PersonalizationPreferences {
        PersonalizationPreferences {
            preferred_languages: vec!["Rust".to_string(), "JavaScript".to_string()],
            tech_stack_interests: vec!["React".to_string(), "WebAssembly".to_string()],
            frequency: "weekly".to_string(),
            engagement_score: 0.8,
            user_id: Some(1),
            signup_date: Some(Utc::now() - Duration::days(5)),
        }
    }

    #[test]
    fn test_personalization_engine_creation() {
        let engine = PersonalizationEngine::new();
        assert!(!engine.segments.is_empty());
        assert!(engine
            .segments
            .iter()
            .any(|s| s.id == "javascript_developers"));
        assert!(engine.segments.iter().any(|s| s.id == "rust_developers"));
    }

    #[test]
    fn test_repository_scoring() {
        let engine = PersonalizationEngine::new();
        let preferences = create_test_preferences();

        let rust_repo = create_test_repository(
            "awesome-rust-project",
            Some("Rust"),
            5000,
            Some("A WebAssembly-powered Rust library"),
        );

        let (score, reasons) = engine.calculate_repository_score(&rust_repo, &preferences);

        assert!(score > 0.5); // Should have high score due to language and tech interest match
        assert!(reasons.iter().any(|r| r.contains("Rust")));
        assert!(reasons.iter().any(|r| r.contains("WebAssembly")));
    }

    #[test]
    fn test_user_segmentation() {
        let engine = PersonalizationEngine::new();
        let preferences = create_test_preferences();

        let segment = engine.determine_user_segment(&preferences).unwrap();

        // Should match either rust_developers or highly_engaged segment
        assert!(segment.id == "rust_developers" || segment.id == "highly_engaged");
    }

    #[test]
    fn test_content_personalization() {
        let engine = PersonalizationEngine::new();
        let preferences = create_test_preferences();

        let repositories = vec![
            create_test_repository("rust-project", Some("Rust"), 1000, Some("Rust library")),
            create_test_repository(
                "js-project",
                Some("JavaScript"),
                500,
                Some("React component"),
            ),
            create_test_repository("python-project", Some("Python"), 2000, Some("Django app")),
        ];

        let personalized = engine
            .personalize_content(repositories, &preferences)
            .unwrap();

        assert!(!personalized.repositories.is_empty());
        assert!(personalized.personalization_score > 0.0);
        assert!(!personalized.reasons.is_empty());

        // Rust project should be ranked higher due to language preference
        assert_eq!(
            personalized.repositories[0].language,
            Some("Rust".to_string())
        );
    }

    #[test]
    fn test_segment_statistics() {
        let engine = PersonalizationEngine::new();

        let user_preferences = vec![
            PersonalizationPreferences {
                preferred_languages: vec!["JavaScript".to_string()],
                tech_stack_interests: vec!["React".to_string()],
                frequency: "weekly".to_string(),
                engagement_score: 0.5,
                user_id: Some(1),
                signup_date: Some(Utc::now() - Duration::days(2)),
            },
            PersonalizationPreferences {
                preferred_languages: vec!["Rust".to_string()],
                tech_stack_interests: vec!["WebAssembly".to_string()],
                frequency: "daily".to_string(),
                engagement_score: 0.9,
                user_id: Some(2),
                signup_date: Some(Utc::now() - Duration::days(10)),
            },
        ];

        let stats = engine.get_segment_statistics(user_preferences).unwrap();
        assert!(!stats.is_empty());
    }
}
