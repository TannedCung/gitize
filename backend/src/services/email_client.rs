use sendgrid::v3::{Content, Email, Message, Personalization, Sender};
use std::env;
use thiserror::Error;

#[derive(Error, Debug)]
pub enum EmailError {
    #[error("SendGrid API error: {0}")]
    SendGridError(#[from] sendgrid::SendgridError),
    #[error("Configuration error: {0}")]
    ConfigError(String),
    #[error("Template error: {0}")]
    TemplateError(String),
    #[error("Validation error: {0}")]
    ValidationError(String),
}

pub struct EmailClient {
    sender: Sender,
    from_email: String,
}

impl EmailClient {
    pub fn new() -> Result<Self, EmailError> {
        let api_key = env::var("SENDGRID_API_KEY")
            .map_err(|_| EmailError::ConfigError("SENDGRID_API_KEY not found".to_string()))?;

        let from_email = env::var("SENDGRID_FROM_EMAIL")
            .map_err(|_| EmailError::ConfigError("SENDGRID_FROM_EMAIL not found".to_string()))?;

        let sender = Sender::new(api_key);

        Ok(Self { sender, from_email })
    }

    pub async fn send_newsletter(
        &self,
        to_email: &str,
        subject: &str,
        html_content: &str,
        text_content: &str,
        unsubscribe_url: &str,
    ) -> Result<(), EmailError> {
        // Validate email
        self.validate_email(to_email)?;

        // Create email message
        let from = Email::new(&self.from_email);
        let to = Email::new(to_email);

        let mut personalization = Personalization::new(to);

        // Add unsubscribe header for compliance
        let mut headers = std::collections::HashMap::new();
        headers.insert(
            "List-Unsubscribe".to_string(),
            format!("<{}>", unsubscribe_url),
        );
        personalization = personalization.add_headers(headers);

        let html_content = Content::new()
            .set_content_type("text/html")
            .set_value(html_content);

        let text_content = Content::new()
            .set_content_type("text/plain")
            .set_value(text_content);

        let message = Message::new(from)
            .set_subject(subject)
            .add_content(html_content)
            .add_content(text_content)
            .add_personalization(personalization);

        // Send email
        match self.sender.send(&message).await {
            Ok(_) => {
                log::info!("Newsletter sent successfully to: {}", to_email);
                Ok(())
            }
            Err(e) => {
                log::error!("Failed to send newsletter to {}: {}", to_email, e);
                Err(EmailError::SendGridError(e))
            }
        }
    }

    pub async fn send_bulk_newsletter(
        &self,
        recipients: Vec<(String, String)>, // (email, unsubscribe_url)
        subject: &str,
        html_content: &str,
        text_content: &str,
    ) -> Result<BulkEmailResult, EmailError> {
        let mut result = BulkEmailResult::new();

        for (email, unsubscribe_url) in recipients {
            match self
                .send_newsletter(
                    &email,
                    subject,
                    html_content,
                    text_content,
                    &unsubscribe_url,
                )
                .await
            {
                Ok(_) => {
                    result.successful.push(email);
                }
                Err(e) => {
                    log::warn!("Failed to send newsletter to {}: {}", email, e);
                    result.failed.push((email, e.to_string()));
                }
            }

            // Add small delay to avoid rate limiting
            tokio::time::sleep(tokio::time::Duration::from_millis(100)).await;
        }

        log::info!(
            "Bulk newsletter sending completed: {} successful, {} failed",
            result.successful.len(),
            result.failed.len()
        );

        Ok(result)
    }

    fn validate_email(&self, email: &str) -> Result<(), EmailError> {
        let email_regex = regex::Regex::new(r"^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$")
            .map_err(|e| EmailError::ValidationError(format!("Regex error: {}", e)))?;

        if !email_regex.is_match(email) {
            return Err(EmailError::ValidationError(
                "Invalid email format".to_string(),
            ));
        }

        Ok(())
    }
}

#[derive(Debug)]
pub struct BulkEmailResult {
    pub successful: Vec<String>,
    pub failed: Vec<(String, String)>, // (email, error_message)
}

impl BulkEmailResult {
    fn new() -> Self {
        Self {
            successful: Vec::new(),
            failed: Vec::new(),
        }
    }

    pub fn total_sent(&self) -> usize {
        self.successful.len()
    }

    pub fn total_failed(&self) -> usize {
        self.failed.len()
    }

    pub fn success_rate(&self) -> f64 {
        let total = self.total_sent() + self.total_failed();
        if total == 0 {
            0.0
        } else {
            self.total_sent() as f64 / total as f64
        }
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_bulk_email_result() {
        let mut result = BulkEmailResult::new();

        result.successful.push("test1@example.com".to_string());
        result.successful.push("test2@example.com".to_string());
        result
            .failed
            .push(("test3@example.com".to_string(), "Error".to_string()));

        assert_eq!(result.total_sent(), 2);
        assert_eq!(result.total_failed(), 1);
        assert!((result.success_rate() - 0.6666666666666666).abs() < f64::EPSILON);
    }

    #[test]
    fn test_validate_email() {
        // This test would require setting up environment variables
        // In a real test environment, we'd use a mock or test configuration
    }
}
