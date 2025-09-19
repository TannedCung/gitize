use crate::models::Repository;
use crate::services::personalization_engine::{
    PersonalizationEngine, PersonalizationPreferences, SegmentCriteria, UserSegment,
};
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

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_personalization_engine_creation() {
        let engine = PersonalizationEngine::new();
        assert!(!engine.get_segments().is_empty());
        assert!(engine
            .get_segments()
            .iter()
            .any(|s| s.id == "javascript_developers"));
        assert!(engine
            .get_segments()
            .iter()
            .any(|s| s.id == "rust_developers"));
        assert!(engine
            .get_segments()
            .iter()
            .any(|s| s.id == "python_developers"));
    }

    #[test]
    fn test_repository_scoring_language_match() {
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
    fn test_repository_scoring_no_match() {
        let engine = PersonalizationEngine::new();
        let preferences = create_test_preferences();

        let python_repo = create_test_repository(
            "python-project",
            Some("Python"),
            100,
            Some("A simple Python script"),
        );

        let (score, reasons) = engine.calculate_repository_score(&python_repo, &preferences);

        assert!(score < 0.5); // Should have lower score due to no language/interest match
        assert!(reasons.len() <= 1); // Should have minimal reasons
    }

    #[test]
    fn test_repository_scoring_popularity_boost() {
        let engine = PersonalizationEngine::new();
        let preferences = create_test_preferences();

        let popular_repo = create_test_repository(
            "popular-project",
            Some("Rust"),
            15000,
            Some("Very popular Rust project"),
        );

        let unpopular_repo = create_test_repository(
            "unpopular-project",
            Some("Rust"),
            50,
            Some("Small Rust project"),
        );

        let (popular_score, popular_reasons) =
            engine.calculate_repository_score(&popular_repo, &preferences);
        let (unpopular_score, _) = engine.calculate_repository_score(&unpopular_repo, &preferences);

        assert!(popular_score > unpopular_score);
        assert!(popular_reasons
            .iter()
            .any(|r| r.contains("Popular project")));
    }

    #[test]
    fn test_user_segmentation_rust_developer() {
        let engine = PersonalizationEngine::new();
        let preferences = PersonalizationPreferences {
            preferred_languages: vec!["Rust".to_string(), "C++".to_string()],
            tech_stack_interests: vec![
                "WebAssembly".to_string(),
                "Systems Programming".to_string(),
            ],
            frequency: "weekly".to_string(),
            engagement_score: 0.6,
            user_id: Some(1),
            signup_date: Some(Utc::now() - Duration::days(10)),
        };

        let segment = engine.determine_user_segment(&preferences).unwrap();
        assert_eq!(segment.id, "rust_developers");
    }

    #[test]
    fn test_user_segmentation_javascript_developer() {
        let engine = PersonalizationEngine::new();
        let preferences = PersonalizationPreferences {
            preferred_languages: vec!["JavaScript".to_string(), "TypeScript".to_string()],
            tech_stack_interests: vec!["React".to_string(), "Node.js".to_string()],
            frequency: "weekly".to_string(),
            engagement_score: 0.5,
            user_id: Some(1),
            signup_date: Some(Utc::now() - Duration::days(15)),
        };

        let segment = engine.determine_user_segment(&preferences).unwrap();
        assert_eq!(segment.id, "javascript_developers");
    }

    #[test]
    fn test_user_segmentation_highly_engaged() {
        let engine = PersonalizationEngine::new();
        let preferences = PersonalizationPreferences {
            preferred_languages: vec!["Go".to_string()],
            tech_stack_interests: vec!["Kubernetes".to_string()],
            frequency: "daily".to_string(),
            engagement_score: 0.9, // High engagement
            user_id: Some(1),
            signup_date: Some(Utc::now() - Duration::days(30)),
        };

        let segment = engine.determine_user_segment(&preferences).unwrap();
        assert_eq!(segment.id, "highly_engaged");
    }

    #[test]
    fn test_user_segmentation_new_user() {
        let engine = PersonalizationEngine::new();
        let preferences = PersonalizationPreferences {
            preferred_languages: vec!["Java".to_string()],
            tech_stack_interests: vec!["Spring".to_string()],
            frequency: "weekly".to_string(),
            engagement_score: 0.5,
            user_id: Some(1),
            signup_date: Some(Utc::now() - Duration::days(2)), // Very recent signup
        };

        let segment = engine.determine_user_segment(&preferences).unwrap();
        assert_eq!(segment.id, "new_users");
    }

    #[test]
    fn test_user_segmentation_daily_subscriber() {
        let engine = PersonalizationEngine::new();
        let preferences = PersonalizationPreferences {
            preferred_languages: vec!["PHP".to_string()],
            tech_stack_interests: vec!["Laravel".to_string()],
            frequency: "daily".to_string(), // Daily frequency
            engagement_score: 0.6,
            user_id: Some(1),
            signup_date: Some(Utc::now() - Duration::days(20)),
        };

        let segment = engine.determine_user_segment(&preferences).unwrap();
        assert_eq!(segment.id, "daily_subscribers");
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
            create_test_repository("go-project", Some("Go"), 800, Some("Go microservice")),
        ];

        let personalized = engine
            .personalize_content(repositories, &preferences)
            .unwrap();

        assert!(!personalized.repositories.is_empty());
        assert!(personalized.personalization_score > 0.0);
        assert!(!personalized.reasons.is_empty());

        // Rust and JavaScript projects should be ranked higher due to language preferences
        let top_languages: Vec<Option<String>> = personalized
            .repositories
            .iter()
            .take(2)
            .map(|r| r.language.clone())
            .collect();

        assert!(
            top_languages.contains(&Some("Rust".to_string()))
                || top_languages.contains(&Some("JavaScript".to_string()))
        );
    }

    #[test]
    fn test_content_personalization_empty_repositories() {
        let engine = PersonalizationEngine::new();
        let preferences = create_test_preferences();

        let repositories = vec![];
        let result = engine.personalize_content(repositories, &preferences);

        assert!(result.is_err());
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
            PersonalizationPreferences {
                preferred_languages: vec!["Python".to_string()],
                tech_stack_interests: vec!["Django".to_string()],
                frequency: "weekly".to_string(),
                engagement_score: 0.3,
                user_id: Some(3),
                signup_date: Some(Utc::now() - Duration::days(45)),
            },
        ];

        let stats = engine.get_segment_statistics(user_preferences).unwrap();
        assert!(!stats.is_empty());

        // Should have at least new_users, rust_developers, and python_developers segments
        assert!(stats.len() >= 3);
    }

    #[test]
    fn test_custom_segment_addition() {
        let mut engine = PersonalizationEngine::new();
        let initial_count = engine.get_segments().len();

        let custom_segment = UserSegment {
            id: "custom_segment".to_string(),
            name: "Custom Segment".to_string(),
            description: "A custom test segment".to_string(),
            criteria: SegmentCriteria {
                languages: Some(vec!["CustomLang".to_string()]),
                engagement_score_min: None,
                engagement_score_max: None,
                frequency: None,
                tech_interests: None,
                signup_days_ago_min: None,
                signup_days_ago_max: None,
            },
        };

        engine.add_segment(custom_segment);
        assert_eq!(engine.get_segments().len(), initial_count + 1);
        assert!(engine
            .get_segments()
            .iter()
            .any(|s| s.id == "custom_segment"));
    }

    #[test]
    fn test_segment_match_scoring() {
        let engine = PersonalizationEngine::new();

        // Test perfect match
        let perfect_match_preferences = PersonalizationPreferences {
            preferred_languages: vec!["JavaScript".to_string(), "TypeScript".to_string()],
            tech_stack_interests: vec!["React".to_string(), "Node.js".to_string()],
            frequency: "weekly".to_string(),
            engagement_score: 0.6,
            user_id: Some(1),
            signup_date: Some(Utc::now() - Duration::days(15)),
        };

        let js_segment = engine
            .get_segments()
            .iter()
            .find(|s| s.id == "javascript_developers")
            .unwrap();

        let match_score =
            engine.calculate_segment_match_score(&js_segment.criteria, &perfect_match_preferences);
        assert!(match_score > 0.5); // Should have high match score

        // Test no match
        let no_match_preferences = PersonalizationPreferences {
            preferred_languages: vec!["COBOL".to_string()],
            tech_stack_interests: vec!["Mainframe".to_string()],
            frequency: "monthly".to_string(),
            engagement_score: 0.1,
            user_id: Some(2),
            signup_date: Some(Utc::now() - Duration::days(365)),
        };

        let no_match_score =
            engine.calculate_segment_match_score(&js_segment.criteria, &no_match_preferences);
        assert_eq!(no_match_score, 0.0); // Should have no match
    }
}
