use crate::services::newsletter_analytics::{
    EngagementEventType, NewsletterAnalyticsService, UTMParameters,
};
use std::collections::HashMap;

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_create_campaign() {
        let mut service = NewsletterAnalyticsService::new();

        let campaign_id = service
            .create_campaign(
                "Test Campaign".to_string(),
                "Test Subject".to_string(),
                "v1.0".to_string(),
                None,
            )
            .unwrap();

        assert!(!campaign_id.is_empty());
        assert!(service.campaigns.contains_key(&campaign_id));

        let campaign = service.campaigns.get(&campaign_id).unwrap();
        assert_eq!(campaign.name, "Test Campaign");
        assert_eq!(campaign.subject_line, "Test Subject");
        assert_eq!(campaign.template_version, "v1.0");
        assert!(campaign.sent_at.is_none());
        assert_eq!(campaign.total_recipients, 0);
    }

    #[test]
    fn test_mark_campaign_sent() {
        let mut service = NewsletterAnalyticsService::new();

        let campaign_id = service
            .create_campaign(
                "Test Campaign".to_string(),
                "Test Subject".to_string(),
                "v1.0".to_string(),
                None,
            )
            .unwrap();

        service.mark_campaign_sent(&campaign_id, 100).unwrap();

        let campaign = service.campaigns.get(&campaign_id).unwrap();
        assert!(campaign.sent_at.is_some());
        assert_eq!(campaign.total_recipients, 100);
    }

    #[test]
    fn test_track_engagement() {
        let mut service = NewsletterAnalyticsService::new();

        let campaign_id = service
            .create_campaign(
                "Test Campaign".to_string(),
                "Test Subject".to_string(),
                "v1.0".to_string(),
                None,
            )
            .unwrap();

        let engagement_id = service
            .track_engagement(
                campaign_id.clone(),
                "test@example.com".to_string(),
                Some(1),
                EngagementEventType::Opened,
                HashMap::new(),
                Some("Mozilla/5.0".to_string()),
                Some("192.168.1.1".to_string()),
            )
            .unwrap();

        assert!(!engagement_id.is_empty());
        assert_eq!(service.engagements.len(), 1);

        let engagement = &service.engagements[0];
        assert_eq!(engagement.campaign_id, campaign_id);
        assert_eq!(engagement.email, "test@example.com");
        assert_eq!(engagement.user_id, Some(1));
        assert!(matches!(engagement.event_type, EngagementEventType::Opened));
        assert_eq!(engagement.user_agent, Some("Mozilla/5.0".to_string()));
        assert_eq!(engagement.ip_address, Some("192.168.1.1".to_string()));
    }

    #[test]
    fn test_track_engagement_invalid_campaign() {
        let mut service = NewsletterAnalyticsService::new();

        let result = service.track_engagement(
            "invalid-campaign-id".to_string(),
            "test@example.com".to_string(),
            Some(1),
            EngagementEventType::Opened,
            HashMap::new(),
            None,
            None,
        );

        assert!(result.is_err());
    }

    #[test]
    fn test_generate_utm_parameters() {
        let mut service = NewsletterAnalyticsService::new();

        let campaign_id = service
            .create_campaign(
                "Test Campaign".to_string(),
                "Test Subject".to_string(),
                "v1.0".to_string(),
                None,
            )
            .unwrap();

        let utm_params = service
            .generate_utm_parameters(&campaign_id, "header-link")
            .unwrap();

        assert_eq!(utm_params.source, "newsletter");
        assert_eq!(utm_params.medium, "email");
        assert_eq!(utm_params.campaign, "Test Campaign");
        assert_eq!(utm_params.content, Some("header-link".to_string()));
        assert!(utm_params.term.is_none());
    }

    #[test]
    fn test_add_utm_to_url() {
        let service = NewsletterAnalyticsService::new();

        let utm_params = UTMParameters {
            source: "newsletter".to_string(),
            medium: "email".to_string(),
            campaign: "test-campaign".to_string(),
            term: Some("test-term".to_string()),
            content: Some("header-link".to_string()),
        };

        let tracked_url = service
            .add_utm_to_url("https://example.com", &utm_params)
            .unwrap();

        assert!(tracked_url.contains("utm_source=newsletter"));
        assert!(tracked_url.contains("utm_medium=email"));
        assert!(tracked_url.contains("utm_campaign=test-campaign"));
        assert!(tracked_url.contains("utm_term=test-term"));
        assert!(tracked_url.contains("utm_content=header-link"));
    }

    #[test]
    fn test_add_utm_to_url_with_existing_params() {
        let service = NewsletterAnalyticsService::new();

        let utm_params = UTMParameters {
            source: "newsletter".to_string(),
            medium: "email".to_string(),
            campaign: "test-campaign".to_string(),
            term: None,
            content: None,
        };

        let tracked_url = service
            .add_utm_to_url("https://example.com?existing=param", &utm_params)
            .unwrap();

        assert!(tracked_url.contains("existing=param"));
        assert!(tracked_url.contains("utm_source=newsletter"));
        assert!(tracked_url.contains("utm_medium=email"));
        assert!(tracked_url.contains("utm_campaign=test-campaign"));
    }

    #[test]
    fn test_add_utm_to_invalid_url() {
        let service = NewsletterAnalyticsService::new();

        let utm_params = UTMParameters {
            source: "newsletter".to_string(),
            medium: "email".to_string(),
            campaign: "test-campaign".to_string(),
            term: None,
            content: None,
        };

        let result = service.add_utm_to_url("not-a-valid-url", &utm_params);
        assert!(result.is_err());
    }

    #[test]
    fn test_campaign_analytics_calculation() {
        let mut service = NewsletterAnalyticsService::new();

        let campaign_id = service
            .create_campaign(
                "Test Campaign".to_string(),
                "Test Subject".to_string(),
                "v1.0".to_string(),
                None,
            )
            .unwrap();

        service.mark_campaign_sent(&campaign_id, 100).unwrap();

        // Add engagement events
        for i in 0..80 {
            service
                .track_engagement(
                    campaign_id.clone(),
                    format!("user{}@example.com", i),
                    Some(i),
                    EngagementEventType::Delivered,
                    HashMap::new(),
                    None,
                    None,
                )
                .unwrap();
        }

        for i in 0..40 {
            service
                .track_engagement(
                    campaign_id.clone(),
                    format!("user{}@example.com", i),
                    Some(i),
                    EngagementEventType::Opened,
                    HashMap::new(),
                    None,
                    None,
                )
                .unwrap();
        }

        for i in 0..10 {
            let mut event_data = HashMap::new();
            event_data.insert(
                "url".to_string(),
                serde_json::Value::String("https://example.com".to_string()),
            );

            service
                .track_engagement(
                    campaign_id.clone(),
                    format!("user{}@example.com", i),
                    Some(i),
                    EngagementEventType::Clicked,
                    event_data,
                    None,
                    None,
                )
                .unwrap();
        }

        for i in 0..5 {
            service
                .track_engagement(
                    campaign_id.clone(),
                    format!("user{}@example.com", i),
                    Some(i),
                    EngagementEventType::Converted,
                    HashMap::new(),
                    None,
                    None,
                )
                .unwrap();
        }

        let analytics = service.get_campaign_analytics(&campaign_id).unwrap();

        assert_eq!(analytics.campaign_id, campaign_id);
        assert_eq!(analytics.campaign_name, "Test Campaign");
        assert_eq!(analytics.total_recipients, 100);
        assert_eq!(analytics.delivered_count, 80);
        assert_eq!(analytics.opened_count, 40);
        assert_eq!(analytics.clicked_count, 10);
        assert_eq!(analytics.converted_count, 5);

        // Check calculated rates
        assert_eq!(analytics.delivery_rate, 0.8); // 80/100
        assert_eq!(analytics.open_rate, 0.5); // 40/80
        assert_eq!(analytics.click_rate, 0.125); // 10/80
        assert_eq!(analytics.click_to_open_rate, 0.25); // 10/40
        assert_eq!(analytics.conversion_rate, 0.0625); // 5/80

        // Check engagement score is calculated
        assert!(analytics.engagement_score > 0.0);
        assert!(analytics.engagement_score <= 1.0);

        // Check link analytics
        assert_eq!(analytics.top_clicked_links.len(), 1);
        assert_eq!(analytics.top_clicked_links[0].url, "https://example.com");
        assert_eq!(analytics.top_clicked_links[0].click_count, 10);
        assert_eq!(analytics.top_clicked_links[0].unique_clicks, 10);

        // Check engagement timeline
        assert!(!analytics.engagement_timeline.is_empty());
    }

    #[test]
    fn test_campaign_analytics_no_events() {
        let mut service = NewsletterAnalyticsService::new();

        let campaign_id = service
            .create_campaign(
                "Test Campaign".to_string(),
                "Test Subject".to_string(),
                "v1.0".to_string(),
                None,
            )
            .unwrap();

        service.mark_campaign_sent(&campaign_id, 100).unwrap();

        let analytics = service.get_campaign_analytics(&campaign_id).unwrap();

        assert_eq!(analytics.total_recipients, 100);
        assert_eq!(analytics.delivered_count, 0);
        assert_eq!(analytics.opened_count, 0);
        assert_eq!(analytics.clicked_count, 0);
        assert_eq!(analytics.delivery_rate, 0.0);
        assert_eq!(analytics.open_rate, 0.0);
        assert_eq!(analytics.click_rate, 0.0);
        assert_eq!(analytics.engagement_score, 0.0);
        assert!(analytics.top_clicked_links.is_empty());
        assert!(analytics.engagement_timeline.is_empty());
    }

    #[test]
    fn test_get_all_campaigns_analytics() {
        let mut service = NewsletterAnalyticsService::new();

        let campaign1_id = service
            .create_campaign(
                "Campaign 1".to_string(),
                "Subject 1".to_string(),
                "v1.0".to_string(),
                None,
            )
            .unwrap();

        let campaign2_id = service
            .create_campaign(
                "Campaign 2".to_string(),
                "Subject 2".to_string(),
                "v1.0".to_string(),
                None,
            )
            .unwrap();

        service.mark_campaign_sent(&campaign1_id, 50).unwrap();
        service.mark_campaign_sent(&campaign2_id, 75).unwrap();

        let all_analytics = service.get_all_campaigns_analytics();

        assert_eq!(all_analytics.len(), 2);

        let campaign1_analytics = all_analytics
            .iter()
            .find(|a| a.campaign_id == campaign1_id)
            .unwrap();
        let campaign2_analytics = all_analytics
            .iter()
            .find(|a| a.campaign_id == campaign2_id)
            .unwrap();

        assert_eq!(campaign1_analytics.campaign_name, "Campaign 1");
        assert_eq!(campaign1_analytics.total_recipients, 50);
        assert_eq!(campaign2_analytics.campaign_name, "Campaign 2");
        assert_eq!(campaign2_analytics.total_recipients, 75);
    }

    #[test]
    fn test_compare_campaigns() {
        let mut service = NewsletterAnalyticsService::new();

        let campaign1_id = service
            .create_campaign(
                "Campaign 1".to_string(),
                "Subject 1".to_string(),
                "v1.0".to_string(),
                None,
            )
            .unwrap();

        let campaign2_id = service
            .create_campaign(
                "Campaign 2".to_string(),
                "Subject 2".to_string(),
                "v1.0".to_string(),
                None,
            )
            .unwrap();

        service.mark_campaign_sent(&campaign1_id, 100).unwrap();
        service.mark_campaign_sent(&campaign2_id, 100).unwrap();

        // Add better performance to campaign 2
        for i in 0..60 {
            service
                .track_engagement(
                    campaign2_id.clone(),
                    format!("user{}@example.com", i),
                    Some(i),
                    EngagementEventType::Delivered,
                    HashMap::new(),
                    None,
                    None,
                )
                .unwrap();

            service
                .track_engagement(
                    campaign2_id.clone(),
                    format!("user{}@example.com", i),
                    Some(i),
                    EngagementEventType::Opened,
                    HashMap::new(),
                    None,
                    None,
                )
                .unwrap();
        }

        // Add lower performance to campaign 1
        for i in 0..30 {
            service
                .track_engagement(
                    campaign1_id.clone(),
                    format!("user{}@example.com", i),
                    Some(i),
                    EngagementEventType::Delivered,
                    HashMap::new(),
                    None,
                    None,
                )
                .unwrap();
        }

        let comparison = service
            .compare_campaigns(vec![campaign1_id.clone(), campaign2_id.clone()])
            .unwrap();

        assert_eq!(comparison.campaigns.len(), 2);
        assert_eq!(comparison.winner, Some(campaign2_id)); // Campaign 2 should win
        assert!(comparison.statistical_significance > 0.0);
        assert!(!comparison.improvement_metrics.is_empty());
    }

    #[test]
    fn test_compare_campaigns_empty() {
        let service = NewsletterAnalyticsService::new();

        let comparison = service.compare_campaigns(vec![]).unwrap();

        assert!(comparison.campaigns.is_empty());
        assert!(comparison.winner.is_none());
        assert_eq!(comparison.statistical_significance, 0.0);
        assert!(comparison.improvement_metrics.is_empty());
    }

    #[test]
    fn test_engagement_score_calculation() {
        let service = NewsletterAnalyticsService::new();

        // Test high engagement scenario
        let high_score = service.calculate_engagement_score(0.8, 0.3, 0.1, 0.02, 0.001, 0.005);
        assert!(high_score > 0.5);
        assert!(high_score <= 1.0);

        // Test low engagement scenario
        let low_score = service.calculate_engagement_score(0.1, 0.01, 0.001, 0.1, 0.05, 0.02);
        assert!(low_score < 0.5);
        assert!(low_score >= 0.0);

        // Test zero engagement
        let zero_score = service.calculate_engagement_score(0.0, 0.0, 0.0, 0.0, 0.0, 0.0);
        assert_eq!(zero_score, 0.0);

        // Test negative scenario (high negative metrics)
        let negative_score = service.calculate_engagement_score(0.1, 0.05, 0.01, 0.5, 0.3, 0.2);
        assert_eq!(negative_score, 0.0); // Should be clamped to 0
    }

    #[test]
    fn test_get_optimization_recommendations() {
        let mut service = NewsletterAnalyticsService::new();

        // Create a campaign with segment criteria
        let segment_criteria = serde_json::json!({ "segment_id": "low_engagement_segment" });
        let campaign_id = service
            .create_campaign(
                "Low Engagement Campaign".to_string(),
                "Subject".to_string(),
                "v1.0".to_string(),
                Some(segment_criteria),
            )
            .unwrap();

        service.mark_campaign_sent(&campaign_id, 100).unwrap();

        // Add low engagement events
        for i in 0..50 {
            service
                .track_engagement(
                    campaign_id.clone(),
                    format!("user{}@example.com", i),
                    Some(i),
                    EngagementEventType::Delivered,
                    HashMap::new(),
                    None,
                    None,
                )
                .unwrap();
        }

        // Only 5 opens (10% open rate - low)
        for i in 0..5 {
            service
                .track_engagement(
                    campaign_id.clone(),
                    format!("user{}@example.com", i),
                    Some(i),
                    EngagementEventType::Opened,
                    HashMap::new(),
                    None,
                    None,
                )
                .unwrap();
        }

        let recommendations = service
            .get_optimization_recommendations("low_engagement_segment")
            .unwrap();

        assert!(!recommendations.is_empty());
        assert!(recommendations.iter().any(|r| r.contains("subject lines")));
        assert!(recommendations.iter().any(|r| r.contains("send times")));
    }

    #[test]
    fn test_get_optimization_recommendations_no_data() {
        let service = NewsletterAnalyticsService::new();

        let recommendations = service
            .get_optimization_recommendations("nonexistent_segment")
            .unwrap();

        assert_eq!(recommendations.len(), 1);
        assert!(recommendations[0].contains("No historical data"));
    }

    #[test]
    fn test_count_events() {
        let service = NewsletterAnalyticsService::new();

        let engagement1 = crate::services::newsletter_analytics::EmailEngagement {
            id: "1".to_string(),
            campaign_id: "test".to_string(),
            email: "test1@example.com".to_string(),
            user_id: Some(1),
            event_type: EngagementEventType::Opened,
            event_data: HashMap::new(),
            timestamp: chrono::Utc::now(),
            user_agent: None,
            ip_address: None,
        };
        let engagement2 = crate::services::newsletter_analytics::EmailEngagement {
            id: "2".to_string(),
            campaign_id: "test".to_string(),
            email: "test2@example.com".to_string(),
            user_id: Some(2),
            event_type: EngagementEventType::Opened,
            event_data: HashMap::new(),
            timestamp: chrono::Utc::now(),
            user_agent: None,
            ip_address: None,
        };
        let engagement3 = crate::services::newsletter_analytics::EmailEngagement {
            id: "3".to_string(),
            campaign_id: "test".to_string(),
            email: "test3@example.com".to_string(),
            user_id: Some(3),
            event_type: EngagementEventType::Clicked,
            event_data: HashMap::new(),
            timestamp: chrono::Utc::now(),
            user_agent: None,
            ip_address: None,
        };
        let engagements = vec![&engagement1, &engagement2, &engagement3];

        let opened_count = service.count_events(&engagements, &EngagementEventType::Opened);
        let clicked_count = service.count_events(&engagements, &EngagementEventType::Clicked);
        let delivered_count = service.count_events(&engagements, &EngagementEventType::Delivered);

        assert_eq!(opened_count, 2);
        assert_eq!(clicked_count, 1);
        assert_eq!(delivered_count, 0);
    }
}
