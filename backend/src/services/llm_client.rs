#![allow(dead_code)]

use async_openai::{
    types::{
        ChatCompletionRequestSystemMessage, ChatCompletionRequestUserMessage,
        ChatCompletionRequestUserMessageContent, CreateChatCompletionRequestArgs, Role,
    },
    Client,
};
use serde::{Deserialize, Serialize};
use std::env;
use thiserror::Error;

#[allow(dead_code)]
#[derive(Error, Debug)]
pub enum LLMError {
    #[error("OpenAI API error: {0}")]
    ApiError(#[from] async_openai::error::OpenAIError),
    #[error("Configuration error: {0}")]
    ConfigError(String),
    #[error("Invalid response format: {0}")]
    InvalidResponse(String),
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct RepositoryContext {
    pub name: String,
    pub description: Option<String>,
    pub language: Option<String>,
    pub stars: i32,
    pub forks: i32,
    pub author: String,
}

#[allow(dead_code)]
#[derive(Debug, Clone)]
pub struct LLMClient {
    client: Client<async_openai::config::OpenAIConfig>,
    model: String,
}

impl LLMClient {
    pub fn new() -> Result<Self, LLMError> {
        let api_key = env::var("OPENAI_API_KEY")
            .map_err(|_| LLMError::ConfigError("OPENAI_API_KEY not found".to_string()))?;

        if api_key.is_empty() {
            return Err(LLMError::ConfigError(
                "OPENAI_API_KEY is not properly configured".to_string(),
            ));
        }

        let config = async_openai::config::OpenAIConfig::new().with_api_key(api_key);

        let client = Client::with_config(config);

        Ok(Self {
            client,
            model: "gpt-3.5-turbo".to_string(),
        })
    }

    pub fn with_model(mut self, model: String) -> Self {
        self.model = model;
        self
    }

    pub async fn generate_summary(
        &self,
        repo_context: &RepositoryContext,
    ) -> Result<String, LLMError> {
        let prompt = self.create_summary_prompt(repo_context);

        let request = CreateChatCompletionRequestArgs::default()
            .model(&self.model)
            .messages(vec![
                ChatCompletionRequestSystemMessage {
                    role: Role::System,
                    content: self.get_system_prompt(),
                    name: None,
                }
                .into(),
                ChatCompletionRequestUserMessage {
                    role: Role::User,
                    content: ChatCompletionRequestUserMessageContent::Text(prompt),
                    name: None,
                }
                .into(),
            ])
            .max_tokens(150u16)
            .temperature(0.3)
            .build()?;

        let response = self.client.chat().create(request).await?;

        let summary = response
            .choices
            .first()
            .and_then(|choice| choice.message.content.as_ref())
            .ok_or_else(|| LLMError::InvalidResponse("No content in response".to_string()))?;

        Ok(summary.trim().to_string())
    }

    fn get_system_prompt(&self) -> String {
        "You are a technical assistant that creates concise, informative summaries of GitHub repositories. \
         Your summaries should be 1-2 sentences that clearly explain what the project does, its main purpose, \
         and key features. Focus on technical accuracy and clarity. Avoid marketing language or excessive enthusiasm. \
         Keep summaries under 150 characters when possible.".to_string()
    }

    fn create_summary_prompt(&self, repo_context: &RepositoryContext) -> String {
        let mut prompt = format!(
            "Create a concise technical summary for this GitHub repository:\n\n\
             Repository: {}\n\
             Author: {}\n\
             Stars: {}\n\
             Forks: {}",
            repo_context.name, repo_context.author, repo_context.stars, repo_context.forks
        );

        if let Some(language) = &repo_context.language {
            prompt.push_str(&format!("\nPrimary Language: {}", language));
        }

        if let Some(description) = &repo_context.description {
            prompt.push_str(&format!("\nDescription: {}", description));
        }

        prompt.push_str("\n\nProvide a clear, technical summary in 1-2 sentences:");
        prompt
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use std::env;

    fn create_test_repo_context() -> RepositoryContext {
        RepositoryContext {
            name: "test-repo".to_string(),
            description: Some("A test repository for unit testing".to_string()),
            language: Some("Rust".to_string()),
            stars: 100,
            forks: 25,
            author: "testuser".to_string(),
        }
    }

    #[test]
    fn test_create_summary_prompt() {
        // Set a dummy API key for testing
        env::set_var("OPENAI_API_KEY", "test-key");

        let client = LLMClient::new().unwrap();
        let repo_context = create_test_repo_context();
        let prompt = client.create_summary_prompt(&repo_context);

        assert!(prompt.contains("test-repo"));
        assert!(prompt.contains("testuser"));
        assert!(prompt.contains("100"));
        assert!(prompt.contains("25"));
        assert!(prompt.contains("Rust"));
        assert!(prompt.contains("A test repository for unit testing"));
    }

    #[test]
    fn test_system_prompt() {
        env::set_var("OPENAI_API_KEY", "test-key");
        let client = LLMClient::new().unwrap();
        let system_prompt = client.get_system_prompt();

        assert!(system_prompt.contains("technical assistant"));
        assert!(system_prompt.contains("concise"));
        assert!(system_prompt.contains("GitHub repositories"));
    }

    #[test]
    fn test_new_with_missing_api_key() {
        let original_key = env::var("OPENAI_API_KEY").ok();
        env::remove_var("OPENAI_API_KEY");

        let result = LLMClient::new();

        // Restore original key if it existed
        if let Some(key) = original_key {
            env::set_var("OPENAI_API_KEY", key);
        }

        assert!(result.is_err());
        assert!(matches!(result.unwrap_err(), LLMError::ConfigError(_)));
    }

    #[test]
    fn test_new_with_placeholder_api_key() {
        env::set_var("OPENAI_API_KEY", "your_openai_api_key_here");
        let result = LLMClient::new();
        assert!(result.is_err());
        assert!(matches!(result.unwrap_err(), LLMError::ConfigError(_)));
    }

    #[test]
    fn test_with_model() {
        env::set_var("OPENAI_API_KEY", "test-key");
        let client = LLMClient::new().unwrap().with_model("gpt-4".to_string());
        assert_eq!(client.model, "gpt-4");
    }

    #[test]
    fn test_prompt_without_optional_fields() {
        env::set_var("OPENAI_API_KEY", "test-key");
        let client = LLMClient::new().unwrap();
        let repo_context = RepositoryContext {
            name: "minimal-repo".to_string(),
            description: None,
            language: None,
            stars: 5,
            forks: 1,
            author: "minimal-user".to_string(),
        };

        let prompt = client.create_summary_prompt(&repo_context);
        assert!(prompt.contains("minimal-repo"));
        assert!(prompt.contains("minimal-user"));
        assert!(!prompt.contains("Primary Language:"));
        assert!(!prompt.contains("Description:"));
    }
}
