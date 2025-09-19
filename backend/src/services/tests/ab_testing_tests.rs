use crate::services::ab_testing::{
    ABTest, ABTestingFramework, EventType, PersonalizationLevel, TestStatus, TestVariant,
    VariantConfiguration,
};
use chrono::Utc;
use std::collections::HashMap;

fn create_test_ab_test() -> ABTest {
    ABTest {
        id: "test-1".to_string(),
        name: "Subject Line Test".to_string(),
        description: "Testing different subject lines".to_string(),
        status: TestStatus::Draft,
        variants: vec![
            TestVariant {
                id: "control".to_string(),
                name: "Control".to_string(),
                description: "Original subject line".to_string(),
                traffic_weight: 0.5,
                configuration: VariantConfiguration {
                    subject_line: Some("Weekly GitHub Trending".to_string()),
                    template_version: None,
                    send_time_hour: None,
                    content_personalization_level: None,
                    repository_count: None,
                    include_social_proof: None,
                    cta_text: None,
                    custom_properties: HashMap::new(),
                },
            },
            TestVariant {
                id: "variant-a".to_string(),
                name: "Variant A".to_string(),
                description: "Emoji subject line".to_string(),
                traffic_weight: 0.5,
                configuration: VariantConfiguration {
                    subject_line: Some("🚀 Weekly GitHub Trending".to_string()),
                    template_version: None,
                    send_time_hour: None,
                    content_personalization_level: None,
                    repository_count: None,
                    include_social_proof: None,
                    cta_text: None,
                    custom_properties: HashMap::new(),
                },
            },
        ],
        traffic_allocation: 1.0,
        created_at: Utc::now(),
        started_at: None,
        ended_at: None,
        target_metric: "conversion_rate".to_string(),
        minimum_sample_size: 100,
        confidence_level: 0.95,
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_create_ab_test() {
        let mut framework = ABTestingFramework::new();
        let test = create_test_ab_test();

        let test_id = framework.create_test(test).unwrap();
        assert!(!test_id.is_empty());
        assert!(framework.get_test(&test_id).is_some());
    }

    #[test]
    fn test_start_and_stop_test() {
        let mut framework = ABTestingFramework::new();
        let test = create_test_ab_test();
        let test_id = framework.create_test(test).unwrap();

        // Start test
        framework.start_test(&test_id).unwrap();
        let test = framework.get_test(&test_id).unwrap();
        assert!(matches!(test.status, TestStatus::Running));

        // Stop test
        framework.stop_test(&test_id).unwrap();
        let test = framework.get_test(&test_id).unwrap();
        assert!(matches!(test.status, TestStatus::Completed));
    }

    #[test]
    fn test_user_assignment() {
        let mut framework = ABTestingFramework::new();
        let test = create_test_ab_test();
        let test_id = framework.create_test(test).unwrap();
        framework.start_test(&test_id).unwrap();

        let assignment = framework
            .assign_user_to_test(&test_id, Some(1), "test@example.com")
            .unwrap();
        assert_eq!(assignment.test_id, test_id);
        assert!(!assignment.variant_id.is_empty());

        // Second assignment should return same variant
        let assignment2 = framework
            .assign_user_to_test(&test_id, Some(1), "test@example.com")
            .unwrap();
        assert_eq!(assignment.variant_id, assignment2.variant_id);
    }

    #[test]
    fn test_user_assignment_consistency() {
        let mut framework = ABTestingFramework::new();
        let test = create_test_ab_test();
        let test_id = framework.create_test(test).unwrap();
        framework.start_test(&test_id).unwrap();

        // Same email should always get same variant
        let assignment1 = framework
            .assign_user_to_test(&test_id, Some(1), "consistent@example.com")
            .unwrap();
        let assignment2 = framework
            .assign_user_to_test(&test_id, Some(1), "consistent@example.com")
            .unwrap();
        let assignment3 = framework
            .assign_user_to_test(&test_id, Some(1), "consistent@example.com")
            .unwrap();

        assert_eq!(assignment1.variant_id, assignment2.variant_id);
        assert_eq!(assignment2.variant_id, assignment3.variant_id);
    }

    #[test]
    fn test_record_event() {
        let mut framework = ABTestingFramework::new();
        let test = create_test_ab_test();
        let test_id = framework.create_test(test).unwrap();
        framework.start_test(&test_id).unwrap();

        let assignment = framework
            .assign_user_to_test(&test_id, Some(1), "test@example.com")
            .unwrap();

        let mut event_data = HashMap::new();
        event_data.insert(
            "campaign_id".to_string(),
            serde_json::Value::String("campaign-1".to_string()),
        );

        framework
            .record_event(
                &test_id,
                &assignment.variant_id,
                Some(1),
                "test@example.com",
                EventType::EmailSent,
                event_data,
            )
            .unwrap();

        assert_eq!(framework.get_events_count(), 1);
        let event = framework.get_event(0).unwrap();
        assert_eq!(event.test_id, test_id);
        assert_eq!(event.variant_id, assignment.variant_id);
    }

    #[test]
    fn test_multiple_event_types() {
        let mut framework = ABTestingFramework::new();
        let test = create_test_ab_test();
        let test_id = framework.create_test(test).unwrap();
        framework.start_test(&test_id).unwrap();

        let assignment = framework
            .assign_user_to_test(&test_id, Some(1), "test@example.com")
            .unwrap();

        // Record multiple events
        let event_types = vec![
            EventType::EmailSent,
            EventType::EmailOpened,
            EventType::EmailClicked,
            EventType::Conversion,
        ];

        for event_type in event_types {
            framework
                .record_event(
                    &test_id,
                    &assignment.variant_id,
                    Some(1),
                    "test@example.com",
                    event_type,
                    HashMap::new(),
                )
                .unwrap();
        }

        assert_eq!(framework.get_events_count(), 4);
    }

    #[test]
    fn test_invalid_test_configuration() {
        let mut framework = ABTestingFramework::new();

        // Test with invalid traffic weights (sum > 1.0)
        let mut test = create_test_ab_test();
        test.variants[0].traffic_weight = 0.6;
        test.variants[1].traffic_weight = 0.6; // Sum = 1.2 > 1.0

        let result = framework.create_test(test);
        assert!(result.is_err());
    }

    #[test]
    fn test_invalid_traffic_allocation() {
        let mut framework = ABTestingFramework::new();

        // Test with invalid traffic allocation
        let mut test = create_test_ab_test();
        test.traffic_allocation = 1.5; // > 1.0

        let result = framework.create_test(test);
        assert!(result.is_err());
    }

    #[test]
    fn test_invalid_confidence_level() {
        let mut framework = ABTestingFramework::new();

        // Test with invalid confidence level
        let mut test = create_test_ab_test();
        test.confidence_level = 1.5; // > 1.0

        let result = framework.create_test(test);
        assert!(result.is_err());
    }

    #[test]
    fn test_insufficient_variants() {
        let mut framework = ABTestingFramework::new();

        // Test with only one variant
        let mut test = create_test_ab_test();
        test.variants = vec![test.variants[0].clone()];

        let result = framework.create_test(test);
        assert!(result.is_err());
    }

    #[test]
    fn test_traffic_distribution() {
        let mut framework = ABTestingFramework::new();
        let test = create_test_ab_test();
        let test_id = framework.create_test(test).unwrap();
        framework.start_test(&test_id).unwrap();

        let mut variant_counts = HashMap::new();

        // Assign many users and check distribution
        for i in 0..1000 {
            let email = format!("user{}@example.com", i);
            let assignment = framework
                .assign_user_to_test(&test_id, Some(i), &email)
                .unwrap();
            *variant_counts.entry(assignment.variant_id).or_insert(0) += 1;
        }

        // Should have roughly equal distribution (within reasonable bounds)
        assert_eq!(variant_counts.len(), 2);
        for count in variant_counts.values() {
            assert!(*count > 400 && *count < 600); // Roughly 50% each with some variance
        }
    }

    #[test]
    fn test_personalization_level_configuration() {
        let mut framework = ABTestingFramework::new();
        let mut test = create_test_ab_test();

        // Add personalization level to variant
        test.variants[0].configuration.content_personalization_level =
            Some(PersonalizationLevel::Basic);
        test.variants[1].configuration.content_personalization_level =
            Some(PersonalizationLevel::Advanced);

        let test_id = framework.create_test(test).unwrap();
        framework.start_test(&test_id).unwrap();

        let assignment = framework
            .assign_user_to_test(&test_id, Some(1), "test@example.com")
            .unwrap();
        let test = framework.get_test(&test_id).unwrap();
        let variant = test
            .variants
            .iter()
            .find(|v| v.id == assignment.variant_id)
            .unwrap();

        assert!(variant
            .configuration
            .content_personalization_level
            .is_some());
    }

    #[test]
    fn test_custom_properties() {
        let mut framework = ABTestingFramework::new();
        let mut test = create_test_ab_test();

        // Add custom properties
        test.variants[0].configuration.custom_properties.insert(
            "custom_field".to_string(),
            serde_json::Value::String("custom_value".to_string()),
        );

        let test_id = framework.create_test(test).unwrap();
        let created_test = framework.get_test(&test_id).unwrap();

        assert!(created_test.variants[0]
            .configuration
            .custom_properties
            .contains_key("custom_field"));
    }

    #[test]
    fn test_get_all_tests() {
        let mut framework = ABTestingFramework::new();

        let test1 = create_test_ab_test();
        let test2 = {
            let mut t = create_test_ab_test();
            t.id = "test-2".to_string();
            t.name = "Second Test".to_string();
            t
        };

        framework.create_test(test1).unwrap();
        framework.create_test(test2).unwrap();

        let all_tests = framework.get_tests();
        assert_eq!(all_tests.len(), 2);
    }

    #[test]
    fn test_user_hash_consistency() {
        let framework = ABTestingFramework::new();

        // Same email should always produce same hash
        let hash1 = framework.hash_user_identifier("test@example.com");
        let hash2 = framework.hash_user_identifier("test@example.com");
        let hash3 = framework.hash_user_identifier("test@example.com");

        assert_eq!(hash1, hash2);
        assert_eq!(hash2, hash3);

        // Different emails should produce different hashes
        let hash_different = framework.hash_user_identifier("different@example.com");
        assert_ne!(hash1, hash_different);
    }
}
