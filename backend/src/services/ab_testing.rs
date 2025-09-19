use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};
use std::collections::HashMap;
use thiserror::Error;
use uuid::Uuid;

#[derive(Error, Debug)]
pub enum ABTestError {
    #[error("Test not found: {0}")]
    TestNotFound(String),
    #[error("Invalid test configuration: {0}")]
    InvalidConfiguration(String),
    #[error("Test already exists: {0}")]
    TestAlreadyExists(String),
    #[error("Statistical error: {0}")]
    StatisticalError(String),
    #[error("Insufficient data for analysis")]
    InsufficientData,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ABTest {
    pub id: String,
    pub name: String,
    pub description: String,
    pub status: TestStatus,
    pub variants: Vec<TestVariant>,
    pub traffic_allocation: f64, // Percentage of users to include in test (0.0 to 1.0)
    pub created_at: DateTime<Utc>,
    pub started_at: Option<DateTime<Utc>>,
    pub ended_at: Option<DateTime<Utc>>,
    pub target_metric: String,
    pub minimum_sample_size: usize,
    pub confidence_level: f64, // e.g., 0.95 for 95% confidence
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum TestStatus {
    Draft,
    Running,
    Paused,
    Completed,
    Archived,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct TestVariant {
    pub id: String,
    pub name: String,
    pub description: String,
    pub traffic_weight: f64, // Percentage of test traffic (should sum to 1.0 across variants)
    pub configuration: VariantConfiguration,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct VariantConfiguration {
    pub subject_line: Option<String>,
    pub template_version: Option<String>,
    pub send_time_hour: Option<u8>, // Hour of day (0-23)
    pub content_personalization_level: Option<PersonalizationLevel>,
    pub repository_count: Option<usize>,
    pub include_social_proof: Option<bool>,
    pub cta_text: Option<String>,
    pub custom_properties: HashMap<String, serde_json::Value>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum PersonalizationLevel {
    None,
    Basic,
    Advanced,
    HighlyPersonalized,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct TestAssignment {
    pub user_id: Option<i64>,
    pub email: String,
    pub test_id: String,
    pub variant_id: String,
    pub assigned_at: DateTime<Utc>,
    pub session_id: Option<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct TestEvent {
    pub id: String,
    pub test_id: String,
    pub variant_id: String,
    pub user_id: Option<i64>,
    pub email: String,
    pub event_type: EventType,
    pub event_data: HashMap<String, serde_json::Value>,
    pub timestamp: DateTime<Utc>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum EventType {
    EmailSent,
    EmailOpened,
    EmailClicked,
    LinkClicked,
    Conversion,
    Unsubscribe,
    Custom(String),
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct TestResults {
    pub test_id: String,
    pub variant_results: Vec<VariantResults>,
    pub winner: Option<String>, // variant_id of winning variant
    pub confidence: f64,
    pub statistical_significance: bool,
    pub analyzed_at: DateTime<Utc>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct VariantResults {
    pub variant_id: String,
    pub variant_name: String,
    pub sample_size: usize,
    pub conversion_rate: f64,
    pub confidence_interval: (f64, f64),
    pub metrics: HashMap<String, f64>,
}

pub struct ABTestingFramework {
    tests: HashMap<String, ABTest>,
    assignments: HashMap<String, TestAssignment>, // email -> assignment
    events: Vec<TestEvent>,
}

impl ABTestingFramework {
    pub fn new() -> Self {
        Self {
            tests: HashMap::new(),
            assignments: HashMap::new(),
            events: Vec::new(),
        }
    }

    /// Create a new A/B test
    pub fn create_test(&mut self, mut test: ABTest) -> Result<String, ABTestError> {
        // Validate test configuration
        self.validate_test_configuration(&test)?;

        // Generate ID if not provided
        if test.id.is_empty() {
            test.id = Uuid::new_v4().to_string();
        }

        // Check if test already exists
        if self.tests.contains_key(&test.id) {
            return Err(ABTestError::TestAlreadyExists(test.id));
        }

        // Set creation timestamp
        test.created_at = Utc::now();
        test.status = TestStatus::Draft;

        let test_id = test.id.clone();
        self.tests.insert(test_id.clone(), test);

        Ok(test_id)
    }

    /// Start an A/B test
    pub fn start_test(&mut self, test_id: &str) -> Result<(), ABTestError> {
        let test = self
            .tests
            .get_mut(test_id)
            .ok_or_else(|| ABTestError::TestNotFound(test_id.to_string()))?;

        match test.status {
            TestStatus::Draft | TestStatus::Paused => {
                test.status = TestStatus::Running;
                test.started_at = Some(Utc::now());
                Ok(())
            }
            _ => Err(ABTestError::InvalidConfiguration(
                "Test cannot be started in current status".to_string(),
            )),
        }
    }

    /// Stop an A/B test
    pub fn stop_test(&mut self, test_id: &str) -> Result<(), ABTestError> {
        let test = self
            .tests
            .get_mut(test_id)
            .ok_or_else(|| ABTestError::TestNotFound(test_id.to_string()))?;

        match test.status {
            TestStatus::Running => {
                test.status = TestStatus::Completed;
                test.ended_at = Some(Utc::now());
                Ok(())
            }
            _ => Err(ABTestError::InvalidConfiguration(
                "Test is not currently running".to_string(),
            )),
        }
    }

    /// Assign a user to a test variant
    pub fn assign_user_to_test(
        &mut self,
        test_id: &str,
        user_id: Option<i64>,
        email: &str,
    ) -> Result<TestAssignment, ABTestError> {
        let test = self
            .tests
            .get(test_id)
            .ok_or_else(|| ABTestError::TestNotFound(test_id.to_string()))?;

        // Check if test is running
        if !matches!(test.status, TestStatus::Running) {
            return Err(ABTestError::InvalidConfiguration(
                "Test is not currently running".to_string(),
            ));
        }

        // Check if user is already assigned
        if let Some(existing_assignment) = self.assignments.get(email) {
            if existing_assignment.test_id == test_id {
                return Ok(existing_assignment.clone());
            }
        }

        // Determine if user should be included in test based on traffic allocation
        let user_hash = self.hash_user_identifier_internal(email);
        let traffic_threshold = (test.traffic_allocation * u32::MAX as f64) as u32;

        if user_hash > traffic_threshold {
            // User not included in test - assign to control (first variant)
            let control_variant = &test.variants[0];
            let assignment = TestAssignment {
                user_id,
                email: email.to_string(),
                test_id: test_id.to_string(),
                variant_id: control_variant.id.clone(),
                assigned_at: Utc::now(),
                session_id: None,
            };

            self.assignments
                .insert(email.to_string(), assignment.clone());
            return Ok(assignment);
        }

        // Assign user to variant based on traffic weights
        let variant = self.select_variant_for_user(&test.variants, email)?;

        let assignment = TestAssignment {
            user_id,
            email: email.to_string(),
            test_id: test_id.to_string(),
            variant_id: variant.id.clone(),
            assigned_at: Utc::now(),
            session_id: None,
        };

        self.assignments
            .insert(email.to_string(), assignment.clone());
        Ok(assignment)
    }

    /// Get user's test assignment
    pub fn get_user_assignment(&self, email: &str) -> Option<&TestAssignment> {
        self.assignments.get(email)
    }

    /// Record a test event
    pub fn record_event(
        &mut self,
        test_id: &str,
        variant_id: &str,
        user_id: Option<i64>,
        email: &str,
        event_type: EventType,
        event_data: HashMap<String, serde_json::Value>,
    ) -> Result<(), ABTestError> {
        // Verify test exists
        if !self.tests.contains_key(test_id) {
            return Err(ABTestError::TestNotFound(test_id.to_string()));
        }

        let event = TestEvent {
            id: Uuid::new_v4().to_string(),
            test_id: test_id.to_string(),
            variant_id: variant_id.to_string(),
            user_id,
            email: email.to_string(),
            event_type,
            event_data,
            timestamp: Utc::now(),
        };

        self.events.push(event);
        Ok(())
    }

    /// Analyze test results
    pub fn analyze_test_results(&self, test_id: &str) -> Result<TestResults, ABTestError> {
        let test = self
            .tests
            .get(test_id)
            .ok_or_else(|| ABTestError::TestNotFound(test_id.to_string()))?;

        // Get events for this test
        let test_events: Vec<&TestEvent> = self
            .events
            .iter()
            .filter(|e| e.test_id == test_id)
            .collect();

        if test_events.is_empty() {
            return Err(ABTestError::InsufficientData);
        }

        // Calculate results for each variant
        let mut variant_results = Vec::new();

        for variant in &test.variants {
            let variant_events: Vec<&TestEvent> = test_events
                .iter()
                .filter(|e| e.variant_id == variant.id)
                .copied()
                .collect();

            let sample_size = self.count_unique_users(&variant_events);

            if sample_size < test.minimum_sample_size {
                continue; // Skip variants with insufficient data
            }

            let conversion_rate = self.calculate_conversion_rate(&variant_events);
            let confidence_interval = self.calculate_confidence_interval(
                conversion_rate,
                sample_size,
                test.confidence_level,
            )?;

            let mut metrics = HashMap::new();
            metrics.insert(
                "open_rate".to_string(),
                self.calculate_open_rate(&variant_events),
            );
            metrics.insert(
                "click_rate".to_string(),
                self.calculate_click_rate(&variant_events),
            );
            metrics.insert(
                "unsubscribe_rate".to_string(),
                self.calculate_unsubscribe_rate(&variant_events),
            );

            variant_results.push(VariantResults {
                variant_id: variant.id.clone(),
                variant_name: variant.name.clone(),
                sample_size,
                conversion_rate,
                confidence_interval,
                metrics,
            });
        }

        // Determine winner and statistical significance
        let (winner, confidence, statistical_significance) =
            self.determine_winner(&variant_results, test.confidence_level)?;

        Ok(TestResults {
            test_id: test_id.to_string(),
            variant_results,
            winner,
            confidence,
            statistical_significance,
            analyzed_at: Utc::now(),
        })
    }

    /// Get all tests
    pub fn get_tests(&self) -> Vec<&ABTest> {
        self.tests.values().collect()
    }

    /// Get test by ID
    pub fn get_test(&self, test_id: &str) -> Option<&ABTest> {
        self.tests.get(test_id)
    }

    /// Get events count (for testing)
    pub fn get_events_count(&self) -> usize {
        self.events.len()
    }

    /// Get event by index (for testing)
    pub fn get_event(&self, index: usize) -> Option<&TestEvent> {
        self.events.get(index)
    }

    /// Hash user identifier (public for testing)
    pub fn hash_user_identifier(&self, email: &str) -> u32 {
        use std::collections::hash_map::DefaultHasher;
        use std::hash::{Hash, Hasher};

        let mut hasher = DefaultHasher::new();
        email.hash(&mut hasher);
        hasher.finish() as u32
    }

    /// Validate test configuration
    fn validate_test_configuration(&self, test: &ABTest) -> Result<(), ABTestError> {
        if test.variants.is_empty() {
            return Err(ABTestError::InvalidConfiguration(
                "Test must have at least one variant".to_string(),
            ));
        }

        if test.variants.len() < 2 {
            return Err(ABTestError::InvalidConfiguration(
                "Test must have at least two variants".to_string(),
            ));
        }

        // Check traffic weights sum to 1.0
        let total_weight: f64 = test.variants.iter().map(|v| v.traffic_weight).sum();
        if (total_weight - 1.0).abs() > 0.001 {
            return Err(ABTestError::InvalidConfiguration(
                "Variant traffic weights must sum to 1.0".to_string(),
            ));
        }

        // Check traffic allocation is valid
        if test.traffic_allocation < 0.0 || test.traffic_allocation > 1.0 {
            return Err(ABTestError::InvalidConfiguration(
                "Traffic allocation must be between 0.0 and 1.0".to_string(),
            ));
        }

        // Check confidence level is valid
        if test.confidence_level < 0.5 || test.confidence_level > 0.99 {
            return Err(ABTestError::InvalidConfiguration(
                "Confidence level must be between 0.5 and 0.99".to_string(),
            ));
        }

        Ok(())
    }

    /// Hash user identifier for consistent assignment (private implementation)
    fn hash_user_identifier_internal(&self, email: &str) -> u32 {
        self.hash_user_identifier(email)
    }

    /// Select variant for user based on traffic weights
    fn select_variant_for_user<'a>(
        &self,
        variants: &'a [TestVariant],
        email: &str,
    ) -> Result<&'a TestVariant, ABTestError> {
        let user_hash = self.hash_user_identifier_internal(email);
        let normalized_hash = (user_hash as f64) / (u32::MAX as f64);

        let mut cumulative_weight = 0.0;
        for variant in variants {
            cumulative_weight += variant.traffic_weight;
            if normalized_hash <= cumulative_weight {
                return Ok(variant);
            }
        }

        // Fallback to last variant
        variants.last().ok_or_else(move || {
            ABTestError::InvalidConfiguration("No variants available".to_string())
        })
    }

    /// Count unique users in events
    fn count_unique_users(&self, events: &[&TestEvent]) -> usize {
        let mut unique_emails = std::collections::HashSet::new();
        for event in events {
            unique_emails.insert(&event.email);
        }
        unique_emails.len()
    }

    /// Calculate conversion rate from events
    fn calculate_conversion_rate(&self, events: &[&TestEvent]) -> f64 {
        let total_users = self.count_unique_users(events);
        if total_users == 0 {
            return 0.0;
        }

        let conversions = events
            .iter()
            .filter(|e| matches!(e.event_type, EventType::Conversion))
            .count();

        conversions as f64 / total_users as f64
    }

    /// Calculate open rate from events
    fn calculate_open_rate(&self, events: &[&TestEvent]) -> f64 {
        let sent_count = events
            .iter()
            .filter(|e| matches!(e.event_type, EventType::EmailSent))
            .count();

        if sent_count == 0 {
            return 0.0;
        }

        let opened_count = events
            .iter()
            .filter(|e| matches!(e.event_type, EventType::EmailOpened))
            .count();

        opened_count as f64 / sent_count as f64
    }

    /// Calculate click rate from events
    fn calculate_click_rate(&self, events: &[&TestEvent]) -> f64 {
        let sent_count = events
            .iter()
            .filter(|e| matches!(e.event_type, EventType::EmailSent))
            .count();

        if sent_count == 0 {
            return 0.0;
        }

        let clicked_count = events
            .iter()
            .filter(|e| {
                matches!(
                    e.event_type,
                    EventType::EmailClicked | EventType::LinkClicked
                )
            })
            .count();

        clicked_count as f64 / sent_count as f64
    }

    /// Calculate unsubscribe rate from events
    fn calculate_unsubscribe_rate(&self, events: &[&TestEvent]) -> f64 {
        let sent_count = events
            .iter()
            .filter(|e| matches!(e.event_type, EventType::EmailSent))
            .count();

        if sent_count == 0 {
            return 0.0;
        }

        let unsubscribe_count = events
            .iter()
            .filter(|e| matches!(e.event_type, EventType::Unsubscribe))
            .count();

        unsubscribe_count as f64 / sent_count as f64
    }

    /// Calculate confidence interval for conversion rate
    fn calculate_confidence_interval(
        &self,
        conversion_rate: f64,
        sample_size: usize,
        confidence_level: f64,
    ) -> Result<(f64, f64), ABTestError> {
        if sample_size == 0 {
            return Err(ABTestError::InsufficientData);
        }

        // Use normal approximation for binomial proportion
        let z_score = match confidence_level {
            x if (x - 0.90).abs() < 0.01 => 1.645,
            x if (x - 0.95).abs() < 0.01 => 1.96,
            x if (x - 0.99).abs() < 0.01 => 2.576,
            _ => 1.96, // Default to 95%
        };

        let standard_error =
            (conversion_rate * (1.0 - conversion_rate) / sample_size as f64).sqrt();
        let margin_of_error = z_score * standard_error;

        let lower_bound = (conversion_rate - margin_of_error).max(0.0);
        let upper_bound = (conversion_rate + margin_of_error).min(1.0);

        Ok((lower_bound, upper_bound))
    }

    /// Determine winner and statistical significance
    fn determine_winner(
        &self,
        variant_results: &[VariantResults],
        confidence_level: f64,
    ) -> Result<(Option<String>, f64, bool), ABTestError> {
        if variant_results.len() < 2 {
            return Ok((None, 0.0, false));
        }

        // Find variant with highest conversion rate
        let best_variant = variant_results
            .iter()
            .max_by(|a, b| a.conversion_rate.partial_cmp(&b.conversion_rate).unwrap())
            .unwrap();

        // Check if the difference is statistically significant
        // Simple two-proportion z-test
        let mut is_significant = false;
        let mut max_confidence: f64 = 0.0;

        for variant in variant_results {
            if variant.variant_id == best_variant.variant_id {
                continue;
            }

            let confidence = self.calculate_statistical_confidence(
                best_variant.conversion_rate,
                best_variant.sample_size,
                variant.conversion_rate,
                variant.sample_size,
            )?;

            max_confidence = max_confidence.max(confidence);

            if confidence >= confidence_level {
                is_significant = true;
            }
        }

        let winner = if is_significant {
            Some(best_variant.variant_id.clone())
        } else {
            None
        };

        Ok((winner, max_confidence, is_significant))
    }

    /// Calculate statistical confidence between two variants
    fn calculate_statistical_confidence(
        &self,
        rate1: f64,
        size1: usize,
        rate2: f64,
        size2: usize,
    ) -> Result<f64, ABTestError> {
        if size1 == 0 || size2 == 0 {
            return Err(ABTestError::InsufficientData);
        }

        // Two-proportion z-test
        let pooled_rate =
            ((rate1 * size1 as f64) + (rate2 * size2 as f64)) / (size1 + size2) as f64;
        let standard_error =
            (pooled_rate * (1.0 - pooled_rate) * (1.0 / size1 as f64 + 1.0 / size2 as f64)).sqrt();

        if standard_error == 0.0 {
            return Ok(0.0);
        }

        let z_score = ((rate1 - rate2).abs()) / standard_error;

        // Convert z-score to confidence level (approximate)
        let confidence = match z_score {
            z if z >= 2.576 => 0.99,
            z if z >= 1.96 => 0.95,
            z if z >= 1.645 => 0.90,
            z if z >= 1.28 => 0.80,
            _ => 0.0,
        };

        Ok(confidence)
    }
}

impl Default for ABTestingFramework {
    fn default() -> Self {
        Self::new()
    }
}

#[cfg(test)]
mod tests {
    use super::*;

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

        assert_eq!(framework.events.len(), 1);
    }

    #[test]
    fn test_invalid_test_configuration() {
        let mut framework = ABTestingFramework::new();

        // Test with invalid traffic weights
        let mut test = create_test_ab_test();
        test.variants[0].traffic_weight = 0.6;
        test.variants[1].traffic_weight = 0.6; // Sum > 1.0

        let result = framework.create_test(test);
        assert!(result.is_err());
    }
}
