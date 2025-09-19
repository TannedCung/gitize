use chrono::{DateTime, Timelike, Utc};
use serde::{Deserialize, Serialize};
use std::collections::HashMap;
use thiserror::Error;
use uuid::Uuid;

#[derive(Error, Debug)]
pub enum NewsletterAnalyticsError {
    #[error("Database error: {0}")]
    DatabaseError(#[from] diesel::result::Error),
    #[error("Invalid tracking data: {0}")]
    InvalidTrackingData(String),
    #[error("Campaign not found: {0}")]
    CampaignNotFound(String),
    #[error("Analytics calculation error: {0}")]
    CalculationError(String),
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct NewsletterCampaign {
    pub id: String,
    pub name: String,
    pub subject_line: String,
    pub template_version: String,
    pub segment_criteria: Option<serde_json::Value>,
    pub sent_at: Option<DateTime<Utc>>,
    pub total_recipients: i32,
    pub created_at: DateTime<Utc>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct EmailEngagement {
    pub id: String,
    pub campaign_id: String,
    pub email: String,
    pub user_id: Option<i64>,
    pub event_type: EngagementEventType,
    pub event_data: HashMap<String, serde_json::Value>,
    pub timestamp: DateTime<Utc>,
    pub user_agent: Option<String>,
    pub ip_address: Option<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq, Hash)]
pub enum EngagementEventType {
    Sent,
    Delivered,
    Opened,
    Clicked,
    Bounced,
    Complained,
    Unsubscribed,
    Converted,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct UTMParameters {
    pub source: String,
    pub medium: String,
    pub campaign: String,
    pub term: Option<String>,
    pub content: Option<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CampaignAnalytics {
    pub campaign_id: String,
    pub campaign_name: String,
    pub sent_at: Option<DateTime<Utc>>,
    pub total_recipients: i32,
    pub delivered_count: i32,
    pub opened_count: i32,
    pub clicked_count: i32,
    pub bounced_count: i32,
    pub complained_count: i32,
    pub unsubscribed_count: i32,
    pub converted_count: i32,
    pub delivery_rate: f64,
    pub open_rate: f64,
    pub click_rate: f64,
    pub click_to_open_rate: f64,
    pub bounce_rate: f64,
    pub complaint_rate: f64,
    pub unsubscribe_rate: f64,
    pub conversion_rate: f64,
    pub engagement_score: f64,
    pub top_clicked_links: Vec<LinkAnalytics>,
    pub engagement_timeline: Vec<EngagementTimePoint>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct LinkAnalytics {
    pub url: String,
    pub click_count: i32,
    pub unique_clicks: i32,
    pub click_rate: f64,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct EngagementTimePoint {
    pub timestamp: DateTime<Utc>,
    pub event_type: EngagementEventType,
    pub count: i32,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SegmentPerformance {
    pub segment_id: String,
    pub segment_name: String,
    pub total_campaigns: i32,
    pub avg_open_rate: f64,
    pub avg_click_rate: f64,
    pub avg_conversion_rate: f64,
    pub avg_engagement_score: f64,
    pub best_performing_campaign: Option<String>,
    pub worst_performing_campaign: Option<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CampaignComparison {
    pub campaigns: Vec<CampaignAnalytics>,
    pub winner: Option<String>,
    pub statistical_significance: f64,
    pub improvement_metrics: HashMap<String, f64>,
}

pub struct NewsletterAnalyticsService {
    pub campaigns: HashMap<String, NewsletterCampaign>,
    pub engagements: Vec<EmailEngagement>,
}

impl NewsletterAnalyticsService {
    pub fn new() -> Self {
        Self {
            campaigns: HashMap::new(),
            engagements: Vec::new(),
        }
    }

    /// Create a new newsletter campaign
    pub fn create_campaign(
        &mut self,
        name: String,
        subject_line: String,
        template_version: String,
        segment_criteria: Option<serde_json::Value>,
    ) -> Result<String, NewsletterAnalyticsError> {
        let campaign_id = Uuid::new_v4().to_string();

        let campaign = NewsletterCampaign {
            id: campaign_id.clone(),
            name,
            subject_line,
            template_version,
            segment_criteria,
            sent_at: None,
            total_recipients: 0,
            created_at: Utc::now(),
        };

        self.campaigns.insert(campaign_id.clone(), campaign);
        Ok(campaign_id)
    }

    /// Mark campaign as sent
    pub fn mark_campaign_sent(
        &mut self,
        campaign_id: &str,
        total_recipients: i32,
    ) -> Result<(), NewsletterAnalyticsError> {
        let campaign = self
            .campaigns
            .get_mut(campaign_id)
            .ok_or_else(|| NewsletterAnalyticsError::CampaignNotFound(campaign_id.to_string()))?;

        campaign.sent_at = Some(Utc::now());
        campaign.total_recipients = total_recipients;
        Ok(())
    }

    /// Track email engagement event
    #[allow(clippy::too_many_arguments)]
    pub fn track_engagement(
        &mut self,
        campaign_id: String,
        email: String,
        user_id: Option<i64>,
        event_type: EngagementEventType,
        event_data: HashMap<String, serde_json::Value>,
        user_agent: Option<String>,
        ip_address: Option<String>,
    ) -> Result<String, NewsletterAnalyticsError> {
        // Verify campaign exists
        if !self.campaigns.contains_key(&campaign_id) {
            return Err(NewsletterAnalyticsError::CampaignNotFound(campaign_id));
        }

        let engagement_id = Uuid::new_v4().to_string();
        let engagement = EmailEngagement {
            id: engagement_id.clone(),
            campaign_id,
            email,
            user_id,
            event_type,
            event_data,
            timestamp: Utc::now(),
            user_agent,
            ip_address,
        };

        self.engagements.push(engagement);
        Ok(engagement_id)
    }

    /// Generate UTM parameters for tracking links
    pub fn generate_utm_parameters(
        &self,
        campaign_id: &str,
        link_identifier: &str,
    ) -> Result<UTMParameters, NewsletterAnalyticsError> {
        let campaign = self
            .campaigns
            .get(campaign_id)
            .ok_or_else(|| NewsletterAnalyticsError::CampaignNotFound(campaign_id.to_string()))?;

        Ok(UTMParameters {
            source: "newsletter".to_string(),
            medium: "email".to_string(),
            campaign: campaign.name.clone(),
            term: None,
            content: Some(link_identifier.to_string()),
        })
    }

    /// Add UTM parameters to a URL
    pub fn add_utm_to_url(
        &self,
        base_url: &str,
        utm_params: &UTMParameters,
    ) -> Result<String, NewsletterAnalyticsError> {
        let mut url = url::Url::parse(base_url).map_err(|e| {
            NewsletterAnalyticsError::InvalidTrackingData(format!("Invalid URL: {}", e))
        })?;

        url.query_pairs_mut()
            .append_pair("utm_source", &utm_params.source)
            .append_pair("utm_medium", &utm_params.medium)
            .append_pair("utm_campaign", &utm_params.campaign);

        if let Some(term) = &utm_params.term {
            url.query_pairs_mut().append_pair("utm_term", term);
        }

        if let Some(content) = &utm_params.content {
            url.query_pairs_mut().append_pair("utm_content", content);
        }

        Ok(url.to_string())
    }

    /// Generate comprehensive analytics for a campaign
    pub fn get_campaign_analytics(
        &self,
        campaign_id: &str,
    ) -> Result<CampaignAnalytics, NewsletterAnalyticsError> {
        let campaign = self
            .campaigns
            .get(campaign_id)
            .ok_or_else(|| NewsletterAnalyticsError::CampaignNotFound(campaign_id.to_string()))?;

        let campaign_engagements: Vec<&EmailEngagement> = self
            .engagements
            .iter()
            .filter(|e| e.campaign_id == campaign_id)
            .collect();

        // Calculate basic metrics
        let total_recipients = campaign.total_recipients as f64;
        let delivered_count =
            self.count_events(&campaign_engagements, &EngagementEventType::Delivered);
        let opened_count = self.count_events(&campaign_engagements, &EngagementEventType::Opened);
        let clicked_count = self.count_events(&campaign_engagements, &EngagementEventType::Clicked);
        let bounced_count = self.count_events(&campaign_engagements, &EngagementEventType::Bounced);
        let complained_count =
            self.count_events(&campaign_engagements, &EngagementEventType::Complained);
        let unsubscribed_count =
            self.count_events(&campaign_engagements, &EngagementEventType::Unsubscribed);
        let converted_count =
            self.count_events(&campaign_engagements, &EngagementEventType::Converted);

        // Calculate rates
        let delivery_rate = if total_recipients > 0.0 {
            delivered_count as f64 / total_recipients
        } else {
            0.0
        };
        let open_rate = if delivered_count > 0 {
            opened_count as f64 / delivered_count as f64
        } else {
            0.0
        };
        let click_rate = if delivered_count > 0 {
            clicked_count as f64 / delivered_count as f64
        } else {
            0.0
        };
        let click_to_open_rate = if opened_count > 0 {
            clicked_count as f64 / opened_count as f64
        } else {
            0.0
        };
        let bounce_rate = if total_recipients > 0.0 {
            bounced_count as f64 / total_recipients
        } else {
            0.0
        };
        let complaint_rate = if delivered_count > 0 {
            complained_count as f64 / delivered_count as f64
        } else {
            0.0
        };
        let unsubscribe_rate = if delivered_count > 0 {
            unsubscribed_count as f64 / delivered_count as f64
        } else {
            0.0
        };
        let conversion_rate = if delivered_count > 0 {
            converted_count as f64 / delivered_count as f64
        } else {
            0.0
        };

        // Calculate engagement score (weighted combination of metrics)
        let engagement_score = self.calculate_engagement_score(
            open_rate,
            click_rate,
            conversion_rate,
            bounce_rate,
            complaint_rate,
            unsubscribe_rate,
        );

        // Analyze link performance
        let top_clicked_links = self.analyze_link_performance(&campaign_engagements);

        // Generate engagement timeline
        let engagement_timeline = self.generate_engagement_timeline(&campaign_engagements);

        Ok(CampaignAnalytics {
            campaign_id: campaign_id.to_string(),
            campaign_name: campaign.name.clone(),
            sent_at: campaign.sent_at,
            total_recipients: campaign.total_recipients,
            delivered_count,
            opened_count,
            clicked_count,
            bounced_count,
            complained_count,
            unsubscribed_count,
            converted_count,
            delivery_rate,
            open_rate,
            click_rate,
            click_to_open_rate,
            bounce_rate,
            complaint_rate,
            unsubscribe_rate,
            conversion_rate,
            engagement_score,
            top_clicked_links,
            engagement_timeline,
        })
    }

    /// Get analytics for all campaigns
    pub fn get_all_campaigns_analytics(&self) -> Vec<CampaignAnalytics> {
        self.campaigns
            .keys()
            .filter_map(|campaign_id| self.get_campaign_analytics(campaign_id).ok())
            .collect()
    }

    /// Compare multiple campaigns
    pub fn compare_campaigns(
        &self,
        campaign_ids: Vec<String>,
    ) -> Result<CampaignComparison, NewsletterAnalyticsError> {
        let mut campaigns = Vec::new();

        for campaign_id in campaign_ids {
            let analytics = self.get_campaign_analytics(&campaign_id)?;
            campaigns.push(analytics);
        }

        if campaigns.is_empty() {
            return Ok(CampaignComparison {
                campaigns,
                winner: None,
                statistical_significance: 0.0,
                improvement_metrics: HashMap::new(),
            });
        }

        // Find winner based on engagement score
        let winner = campaigns
            .iter()
            .max_by(|a, b| a.engagement_score.partial_cmp(&b.engagement_score).unwrap())
            .map(|c| c.campaign_id.clone());

        // Calculate statistical significance (simplified)
        let statistical_significance = self.calculate_statistical_significance(&campaigns);

        // Calculate improvement metrics
        let improvement_metrics = self.calculate_improvement_metrics(&campaigns);

        Ok(CampaignComparison {
            campaigns,
            winner,
            statistical_significance,
            improvement_metrics,
        })
    }

    /// Get segment performance analytics
    pub fn get_segment_performance(&self) -> Vec<SegmentPerformance> {
        let mut segment_map: HashMap<String, Vec<&NewsletterCampaign>> = HashMap::new();

        // Group campaigns by segment
        for campaign in self.campaigns.values() {
            if let Some(segment_criteria) = &campaign.segment_criteria {
                if let Some(segment_id) =
                    segment_criteria.get("segment_id").and_then(|v| v.as_str())
                {
                    segment_map
                        .entry(segment_id.to_string())
                        .or_default()
                        .push(campaign);
                }
            }
        }

        let mut segment_performances = Vec::new();

        for (segment_id, campaigns) in segment_map {
            let mut total_open_rate = 0.0;
            let mut total_click_rate = 0.0;
            let mut total_conversion_rate = 0.0;
            let mut total_engagement_score = 0.0;
            let mut best_score = 0.0;
            let mut worst_score = f64::MAX;
            let mut best_campaign = None;
            let mut worst_campaign = None;

            for campaign in &campaigns {
                if let Ok(analytics) = self.get_campaign_analytics(&campaign.id) {
                    total_open_rate += analytics.open_rate;
                    total_click_rate += analytics.click_rate;
                    total_conversion_rate += analytics.conversion_rate;
                    total_engagement_score += analytics.engagement_score;

                    if analytics.engagement_score > best_score {
                        best_score = analytics.engagement_score;
                        best_campaign = Some(campaign.id.clone());
                    }

                    if analytics.engagement_score < worst_score {
                        worst_score = analytics.engagement_score;
                        worst_campaign = Some(campaign.id.clone());
                    }
                }
            }

            let campaign_count = campaigns.len() as f64;
            segment_performances.push(SegmentPerformance {
                segment_id: segment_id.clone(),
                segment_name: segment_id, // In a real implementation, this would be looked up
                total_campaigns: campaigns.len() as i32,
                avg_open_rate: total_open_rate / campaign_count,
                avg_click_rate: total_click_rate / campaign_count,
                avg_conversion_rate: total_conversion_rate / campaign_count,
                avg_engagement_score: total_engagement_score / campaign_count,
                best_performing_campaign: best_campaign,
                worst_performing_campaign: worst_campaign,
            });
        }

        segment_performances
    }

    /// Optimize campaign based on historical performance
    pub fn get_optimization_recommendations(
        &self,
        segment_id: &str,
    ) -> Result<Vec<String>, NewsletterAnalyticsError> {
        let segment_performance = self
            .get_segment_performance()
            .into_iter()
            .find(|sp| sp.segment_id == segment_id);

        let mut recommendations = Vec::new();

        if let Some(performance) = segment_performance {
            // Analyze performance and provide recommendations
            if performance.avg_open_rate < 0.20 {
                recommendations.push(
                    "Consider A/B testing different subject lines to improve open rates"
                        .to_string(),
                );
                recommendations.push(
                    "Optimize send times based on audience timezone and behavior".to_string(),
                );
            }

            if performance.avg_click_rate < 0.05 {
                recommendations.push(
                    "Improve email content relevance and call-to-action placement".to_string(),
                );
                recommendations.push("Test different email layouts and button designs".to_string());
            }

            if performance.avg_conversion_rate < 0.02 {
                recommendations
                    .push("Review landing page experience and conversion funnel".to_string());
                recommendations
                    .push("Ensure email content aligns with landing page messaging".to_string());
            }

            if performance.avg_engagement_score < 0.5 {
                recommendations.push(
                    "Consider segmenting this audience further for better personalization"
                        .to_string(),
                );
                recommendations
                    .push("Review email frequency to avoid subscriber fatigue".to_string());
            }

            if recommendations.is_empty() {
                recommendations.push(
                    "Performance looks good! Consider testing advanced personalization features"
                        .to_string(),
                );
            }
        } else {
            recommendations.push("No historical data available for this segment".to_string());
        }

        Ok(recommendations)
    }

    /// Helper method to count events of a specific type
    pub fn count_events(
        &self,
        engagements: &[&EmailEngagement],
        event_type: &EngagementEventType,
    ) -> i32 {
        engagements
            .iter()
            .filter(|e| std::mem::discriminant(&e.event_type) == std::mem::discriminant(event_type))
            .count() as i32
    }

    /// Calculate engagement score
    pub fn calculate_engagement_score(
        &self,
        open_rate: f64,
        click_rate: f64,
        conversion_rate: f64,
        bounce_rate: f64,
        complaint_rate: f64,
        unsubscribe_rate: f64,
    ) -> f64 {
        // Weighted scoring system
        let positive_score = (open_rate * 0.3) + (click_rate * 0.4) + (conversion_rate * 0.3);
        let negative_score =
            (bounce_rate * 0.4) + (complaint_rate * 0.3) + (unsubscribe_rate * 0.3);

        (positive_score - negative_score).clamp(0.0, 1.0)
    }

    /// Analyze link performance
    fn analyze_link_performance(&self, engagements: &[&EmailEngagement]) -> Vec<LinkAnalytics> {
        let mut link_clicks: HashMap<String, i32> = HashMap::new();
        let mut unique_clickers: HashMap<String, std::collections::HashSet<String>> =
            HashMap::new();

        for engagement in engagements {
            if matches!(engagement.event_type, EngagementEventType::Clicked) {
                if let Some(url) = engagement.event_data.get("url").and_then(|v| v.as_str()) {
                    *link_clicks.entry(url.to_string()).or_insert(0) += 1;
                    unique_clickers
                        .entry(url.to_string())
                        .or_default()
                        .insert(engagement.email.clone());
                }
            }
        }

        let total_delivered =
            self.count_events(engagements, &EngagementEventType::Delivered) as f64;

        let mut link_analytics: Vec<LinkAnalytics> = link_clicks
            .into_iter()
            .map(|(url, click_count)| {
                let unique_clicks =
                    unique_clickers.get(&url).map(|set| set.len()).unwrap_or(0) as i32;
                let click_rate = if total_delivered > 0.0 {
                    click_count as f64 / total_delivered
                } else {
                    0.0
                };

                LinkAnalytics {
                    url,
                    click_count,
                    unique_clicks,
                    click_rate,
                }
            })
            .collect();

        // Sort by click count descending
        link_analytics.sort_by(|a, b| b.click_count.cmp(&a.click_count));
        link_analytics.truncate(10); // Top 10 links

        link_analytics
    }

    /// Generate engagement timeline
    fn generate_engagement_timeline(
        &self,
        engagements: &[&EmailEngagement],
    ) -> Vec<EngagementTimePoint> {
        let mut timeline_map: HashMap<(DateTime<Utc>, EngagementEventType), i32> = HashMap::new();

        for engagement in engagements {
            // Round timestamp to nearest hour for grouping
            let rounded_timestamp = engagement
                .timestamp
                .with_minute(0)
                .unwrap()
                .with_second(0)
                .unwrap()
                .with_nanosecond(0)
                .unwrap();

            let key = (rounded_timestamp, engagement.event_type.clone());
            *timeline_map.entry(key).or_insert(0) += 1;
        }

        let mut timeline: Vec<EngagementTimePoint> = timeline_map
            .into_iter()
            .map(|((timestamp, event_type), count)| EngagementTimePoint {
                timestamp,
                event_type,
                count,
            })
            .collect();

        // Sort by timestamp
        timeline.sort_by(|a, b| a.timestamp.cmp(&b.timestamp));
        timeline
    }

    /// Calculate statistical significance (simplified)
    fn calculate_statistical_significance(&self, campaigns: &[CampaignAnalytics]) -> f64 {
        if campaigns.len() < 2 {
            return 0.0;
        }

        // Simple comparison based on sample sizes and conversion rates
        // In a real implementation, this would use proper statistical tests
        let best = campaigns
            .iter()
            .max_by(|a, b| a.engagement_score.partial_cmp(&b.engagement_score).unwrap())
            .unwrap();
        let second_best = campaigns
            .iter()
            .filter(|c| c.campaign_id != best.campaign_id)
            .max_by(|a, b| a.engagement_score.partial_cmp(&b.engagement_score).unwrap());

        if let Some(second) = second_best {
            let diff = (best.engagement_score - second.engagement_score).abs();
            let min_sample = best.total_recipients.min(second.total_recipients) as f64;

            // Simplified confidence calculation
            if min_sample > 100.0 && diff > 0.05 {
                0.95 // High confidence
            } else if min_sample > 50.0 && diff > 0.03 {
                0.80 // Medium confidence
            } else {
                0.60 // Low confidence
            }
        } else {
            0.0
        }
    }

    /// Calculate improvement metrics
    fn calculate_improvement_metrics(
        &self,
        campaigns: &[CampaignAnalytics],
    ) -> HashMap<String, f64> {
        let mut metrics = HashMap::new();

        if campaigns.len() < 2 {
            return metrics;
        }

        let best = campaigns
            .iter()
            .max_by(|a, b| a.engagement_score.partial_cmp(&b.engagement_score).unwrap())
            .unwrap();
        let avg_open_rate =
            campaigns.iter().map(|c| c.open_rate).sum::<f64>() / campaigns.len() as f64;
        let avg_click_rate =
            campaigns.iter().map(|c| c.click_rate).sum::<f64>() / campaigns.len() as f64;
        let avg_conversion_rate =
            campaigns.iter().map(|c| c.conversion_rate).sum::<f64>() / campaigns.len() as f64;

        if avg_open_rate > 0.0 {
            metrics.insert(
                "open_rate_improvement".to_string(),
                (best.open_rate - avg_open_rate) / avg_open_rate,
            );
        }
        if avg_click_rate > 0.0 {
            metrics.insert(
                "click_rate_improvement".to_string(),
                (best.click_rate - avg_click_rate) / avg_click_rate,
            );
        }
        if avg_conversion_rate > 0.0 {
            metrics.insert(
                "conversion_rate_improvement".to_string(),
                (best.conversion_rate - avg_conversion_rate) / avg_conversion_rate,
            );
        }

        metrics
    }
}

impl Default for NewsletterAnalyticsService {
    fn default() -> Self {
        Self::new()
    }
}

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
                campaign_id,
                "test@example.com".to_string(),
                Some(1),
                EngagementEventType::Opened,
                HashMap::new(),
                None,
                None,
            )
            .unwrap();

        assert!(!engagement_id.is_empty());
        assert_eq!(service.engagements.len(), 1);
    }

    #[test]
    fn test_utm_parameter_generation() {
        let service = NewsletterAnalyticsService::new();

        let utm_params = UTMParameters {
            source: "newsletter".to_string(),
            medium: "email".to_string(),
            campaign: "test-campaign".to_string(),
            term: None,
            content: Some("header-link".to_string()),
        };

        let tracked_url = service
            .add_utm_to_url("https://example.com", &utm_params)
            .unwrap();

        assert!(tracked_url.contains("utm_source=newsletter"));
        assert!(tracked_url.contains("utm_medium=email"));
        assert!(tracked_url.contains("utm_campaign=test-campaign"));
        assert!(tracked_url.contains("utm_content=header-link"));
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

        // Add some engagement events
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
            service
                .track_engagement(
                    campaign_id.clone(),
                    format!("user{}@example.com", i),
                    Some(i),
                    EngagementEventType::Clicked,
                    HashMap::new(),
                    None,
                    None,
                )
                .unwrap();
        }

        let analytics = service.get_campaign_analytics(&campaign_id).unwrap();

        assert_eq!(analytics.total_recipients, 100);
        assert_eq!(analytics.delivered_count, 80);
        assert_eq!(analytics.opened_count, 40);
        assert_eq!(analytics.clicked_count, 10);
        assert_eq!(analytics.delivery_rate, 0.8);
        assert_eq!(analytics.open_rate, 0.5);
        assert_eq!(analytics.click_rate, 0.125);
        assert!(analytics.engagement_score > 0.0);
    }

    #[test]
    fn test_engagement_score_calculation() {
        let service = NewsletterAnalyticsService::new();

        // Test high engagement
        let high_score = service.calculate_engagement_score(0.8, 0.3, 0.1, 0.02, 0.001, 0.005);
        assert!(high_score > 0.5);

        // Test low engagement
        let low_score = service.calculate_engagement_score(0.1, 0.01, 0.001, 0.1, 0.05, 0.02);
        assert!(low_score < 0.3);
    }
}
