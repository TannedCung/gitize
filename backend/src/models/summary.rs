use crate::schema::summaries;
use chrono::NaiveDateTime;
use diesel::prelude::*;
use serde::{Deserialize, Serialize};

#[derive(Queryable, Selectable, Serialize, Deserialize, Debug, Clone)]
#[diesel(table_name = summaries)]
pub struct Summary {
    pub id: i64,
    pub repository_id: Option<i64>,
    pub content: String,
    pub generated_at: Option<NaiveDateTime>,
}

#[derive(Insertable, Deserialize, Debug)]
#[diesel(table_name = summaries)]
pub struct NewSummary {
    pub repository_id: i64,
    pub content: String,
}

#[derive(AsChangeset, Deserialize, Debug)]
#[diesel(table_name = summaries)]
pub struct UpdateSummary {
    pub content: Option<String>,
}

#[allow(dead_code)]
impl Summary {
    /// Validate summary data
    pub fn validate(&self) -> Result<(), String> {
        if self.content.trim().is_empty() {
            return Err("Summary content cannot be empty".to_string());
        }

        if self.content.len() > 1000 {
            return Err("Summary content cannot exceed 1000 characters".to_string());
        }

        Ok(())
    }

    /// Check if summary is recent (generated within last 30 days)
    pub fn is_recent(&self) -> bool {
        if let Some(generated_at) = self.generated_at {
            let now = chrono::Utc::now().naive_utc();
            let days_diff = now.signed_duration_since(generated_at).num_days();
            days_diff <= 30
        } else {
            false
        }
    }

    /// Get truncated content for preview
    pub fn preview(&self, max_length: usize) -> String {
        if self.content.len() <= max_length {
            self.content.clone()
        } else {
            format!("{}...", &self.content[..max_length])
        }
    }
}

impl NewSummary {
    /// Validate new summary data
    pub fn validate(&self) -> Result<(), String> {
        if self.content.trim().is_empty() {
            return Err("Summary content cannot be empty".to_string());
        }

        if self.content.len() > 1000 {
            return Err("Summary content cannot exceed 1000 characters".to_string());
        }

        Ok(())
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use chrono::Utc;

    fn create_test_summary() -> Summary {
        Summary {
            id: 1,
            repository_id: Some(1),
            content: "This is a test summary of a repository.".to_string(),
            generated_at: Some(Utc::now().naive_utc()),
        }
    }

    fn create_test_new_summary() -> NewSummary {
        NewSummary {
            repository_id: 1,
            content: "This is a test summary of a repository.".to_string(),
        }
    }

    #[test]
    fn test_summary_validation_success() {
        let summary = create_test_summary();
        assert!(summary.validate().is_ok());
    }

    #[test]
    fn test_summary_validation_empty_content() {
        let mut summary = create_test_summary();
        summary.content = "".to_string();
        assert!(summary.validate().is_err());
        assert_eq!(
            summary.validate().unwrap_err(),
            "Summary content cannot be empty"
        );
    }

    #[test]
    fn test_summary_validation_content_too_long() {
        let mut summary = create_test_summary();
        summary.content = "a".repeat(1001);
        assert!(summary.validate().is_err());
        assert_eq!(
            summary.validate().unwrap_err(),
            "Summary content cannot exceed 1000 characters"
        );
    }

    #[test]
    fn test_new_summary_validation_success() {
        let new_summary = create_test_new_summary();
        assert!(new_summary.validate().is_ok());
    }

    #[test]
    fn test_new_summary_validation_empty_content() {
        let mut new_summary = create_test_new_summary();
        new_summary.content = "".to_string();
        assert!(new_summary.validate().is_err());
        assert_eq!(
            new_summary.validate().unwrap_err(),
            "Summary content cannot be empty"
        );
    }

    #[test]
    fn test_is_recent_true() {
        let summary = create_test_summary();
        assert!(summary.is_recent());
    }

    #[test]
    fn test_is_recent_false() {
        let mut summary = create_test_summary();
        summary.generated_at = Some(Utc::now().naive_utc() - chrono::Duration::days(35));
        assert!(!summary.is_recent());
    }

    #[test]
    fn test_is_recent_no_date() {
        let mut summary = create_test_summary();
        summary.generated_at = None;
        assert!(!summary.is_recent());
    }

    #[test]
    fn test_preview_short_content() {
        let summary = create_test_summary();
        let preview = summary.preview(100);
        assert_eq!(preview, summary.content);
    }

    #[test]
    fn test_preview_long_content() {
        let mut summary = create_test_summary();
        summary.content =
            "This is a very long summary that should be truncated when previewed".to_string();
        let preview = summary.preview(20);
        assert_eq!(preview, "This is a very long ...".to_string());
    }
}
