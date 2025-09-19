use crate::models::Repository;
use crate::services::personalization_engine::UserSegment;
use chrono::Datelike;
use handlebars::Handlebars;
use serde_json::json;
use std::collections::HashMap;
use thiserror::Error;

#[derive(Error, Debug)]
pub enum TemplateError {
    #[error("Template rendering error: {0}")]
    RenderError(#[from] handlebars::RenderError),
    #[error("Template registration error: {0}")]
    RegistrationError(String),
    #[error("Data serialization error: {0}")]
    SerializationError(#[from] serde_json::Error),
}

pub struct NewsletterTemplate {
    handlebars: Handlebars<'static>,
}

impl NewsletterTemplate {
    pub fn new() -> Result<Self, TemplateError> {
        let mut handlebars = Handlebars::new();

        // Register HTML template
        handlebars
            .register_template_string("newsletter_html", Self::html_template())
            .map_err(|e| TemplateError::RegistrationError(format!("HTML template: {}", e)))?;

        // Register text template
        handlebars
            .register_template_string("newsletter_text", Self::text_template())
            .map_err(|e| TemplateError::RegistrationError(format!("Text template: {}", e)))?;

        // Register personalized HTML template
        handlebars
            .register_template_string(
                "personalized_newsletter_html",
                Self::personalized_html_template(),
            )
            .map_err(|e| {
                TemplateError::RegistrationError(format!("Personalized HTML template: {}", e))
            })?;

        // Register personalized text template
        handlebars
            .register_template_string(
                "personalized_newsletter_text",
                Self::personalized_text_template(),
            )
            .map_err(|e| {
                TemplateError::RegistrationError(format!("Personalized text template: {}", e))
            })?;

        Ok(Self { handlebars })
    }

    pub fn render_html_newsletter(
        &self,
        repositories: &[Repository],
        unsubscribe_url: &str,
        week_start: &str,
        week_end: &str,
    ) -> Result<String, TemplateError> {
        let data =
            self.prepare_template_data(repositories, unsubscribe_url, week_start, week_end)?;
        let html = self.handlebars.render("newsletter_html", &data)?;
        Ok(html)
    }

    pub fn render_text_newsletter(
        &self,
        repositories: &[Repository],
        unsubscribe_url: &str,
        week_start: &str,
        week_end: &str,
    ) -> Result<String, TemplateError> {
        let data =
            self.prepare_template_data(repositories, unsubscribe_url, week_start, week_end)?;
        let text = self.handlebars.render("newsletter_text", &data)?;
        Ok(text)
    }

    #[allow(clippy::too_many_arguments)]
    pub fn render_personalized_html_newsletter(
        &self,
        repositories: &[Repository],
        unsubscribe_url: &str,
        week_start: &str,
        week_end: &str,
        segment: &UserSegment,
        personalization_reasons: &[String],
        template_config: &HashMap<String, serde_json::Value>,
    ) -> Result<String, TemplateError> {
        let data = self.prepare_personalized_template_data(
            repositories,
            unsubscribe_url,
            week_start,
            week_end,
            segment,
            personalization_reasons,
            template_config,
        )?;
        let html = self
            .handlebars
            .render("personalized_newsletter_html", &data)?;
        Ok(html)
    }

    pub fn render_personalized_text_newsletter(
        &self,
        repositories: &[Repository],
        unsubscribe_url: &str,
        week_start: &str,
        week_end: &str,
        segment: &UserSegment,
        personalization_reasons: &[String],
    ) -> Result<String, TemplateError> {
        let data = self.prepare_personalized_template_data(
            repositories,
            unsubscribe_url,
            week_start,
            week_end,
            segment,
            personalization_reasons,
            &HashMap::new(),
        )?;
        let text = self
            .handlebars
            .render("personalized_newsletter_text", &data)?;
        Ok(text)
    }

    fn prepare_template_data(
        &self,
        repositories: &[Repository],
        unsubscribe_url: &str,
        week_start: &str,
        week_end: &str,
    ) -> Result<serde_json::Value, TemplateError> {
        let repo_data: Vec<serde_json::Value> = repositories
            .iter()
            .enumerate()
            .map(|(index, repo)| {
                json!({
                    "rank": index + 1,
                    "name": repo.name,
                    "full_name": repo.full_name,
                    "description": repo.description.as_deref().unwrap_or("No description available"),
                    "stars": repo.stars,
                    "forks": repo.forks,
                    "language": repo.language.as_deref().unwrap_or("Unknown"),
                    "author": repo.author,
                    "url": repo.url,
                    "stars_formatted": Self::format_number(repo.stars),
                    "forks_formatted": Self::format_number(repo.forks)
                })
            })
            .collect();

        Ok(json!({
            "repositories": repo_data,
            "week_start": week_start,
            "week_end": week_end,
            "unsubscribe_url": unsubscribe_url,
            "total_repos": repositories.len(),
            "current_year": chrono::Utc::now().year()
        }))
    }

    #[allow(clippy::too_many_arguments)]
    fn prepare_personalized_template_data(
        &self,
        repositories: &[Repository],
        unsubscribe_url: &str,
        week_start: &str,
        week_end: &str,
        segment: &UserSegment,
        personalization_reasons: &[String],
        template_config: &HashMap<String, serde_json::Value>,
    ) -> Result<serde_json::Value, TemplateError> {
        let repo_count = template_config
            .get("repository_count")
            .and_then(|v| v.as_u64())
            .unwrap_or(repositories.len() as u64) as usize;

        let limited_repos = &repositories[..repo_count.min(repositories.len())];

        let repo_data: Vec<serde_json::Value> = limited_repos
            .iter()
            .enumerate()
            .map(|(index, repo)| {
                json!({
                    "rank": index + 1,
                    "name": repo.name,
                    "full_name": repo.full_name,
                    "description": repo.description.as_deref().unwrap_or("No description available"),
                    "stars": repo.stars,
                    "forks": repo.forks,
                    "language": repo.language.as_deref().unwrap_or("Unknown"),
                    "author": repo.author,
                    "url": repo.url,
                    "stars_formatted": Self::format_number(repo.stars),
                    "forks_formatted": Self::format_number(repo.forks)
                })
            })
            .collect();

        let include_social_proof = template_config
            .get("include_social_proof")
            .and_then(|v| v.as_bool())
            .unwrap_or(true);

        let cta_text = template_config
            .get("cta_text")
            .and_then(|v| v.as_str())
            .unwrap_or("View on GitHub");

        Ok(json!({
            "repositories": repo_data,
            "week_start": week_start,
            "week_end": week_end,
            "unsubscribe_url": unsubscribe_url,
            "total_repos": limited_repos.len(),
            "current_year": chrono::Utc::now().year(),
            "segment": {
                "name": segment.name,
                "description": segment.description
            },
            "personalization_reasons": personalization_reasons,
            "has_personalization": !personalization_reasons.is_empty(),
            "include_social_proof": include_social_proof,
            "cta_text": cta_text
        }))
    }

    fn format_number(num: i32) -> String {
        if num >= 1000 {
            let k_value = num as f64 / 1000.0;
            if k_value.fract() == 0.0 {
                format!("{}k", k_value as i32)
            } else {
                format!("{:.1}k", k_value)
            }
        } else {
            num.to_string()
        }
    }

    fn html_template() -> &'static str {
        r#"
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>GitHub Trending Weekly Digest</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
            background-color: #f8f9fa;
        }
        .container {
            background-color: white;
            border-radius: 8px;
            padding: 30px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }
        .header {
            text-align: center;
            border-bottom: 2px solid #e9ecef;
            padding-bottom: 20px;
            margin-bottom: 30px;
        }
        .header h1 {
            color: #2c3e50;
            margin: 0;
            font-size: 28px;
        }
        .header p {
            color: #6c757d;
            margin: 10px 0 0 0;
            font-size: 16px;
        }
        .repo-item {
            border: 1px solid #e9ecef;
            border-radius: 6px;
            padding: 20px;
            margin-bottom: 20px;
            background-color: #fff;
        }
        .repo-header {
            display: flex;
            align-items: center;
            margin-bottom: 10px;
        }
        .repo-rank {
            background-color: #007bff;
            color: white;
            border-radius: 50%;
            width: 30px;
            height: 30px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-weight: bold;
            margin-right: 15px;
            font-size: 14px;
        }
        .repo-name {
            font-size: 20px;
            font-weight: 600;
            color: #2c3e50;
            text-decoration: none;
            margin: 0;
        }
        .repo-name:hover {
            color: #007bff;
        }
        .repo-author {
            color: #6c757d;
            font-size: 14px;
            margin-left: 5px;
        }
        .repo-description {
            color: #495057;
            margin: 10px 0;
            line-height: 1.5;
        }
        .repo-stats {
            display: flex;
            gap: 20px;
            margin-top: 15px;
        }
        .stat {
            display: flex;
            align-items: center;
            color: #6c757d;
            font-size: 14px;
        }
        .stat-icon {
            margin-right: 5px;
        }
        .language-tag {
            background-color: #f8f9fa;
            color: #495057;
            padding: 4px 8px;
            border-radius: 4px;
            font-size: 12px;
            font-weight: 500;
        }
        .footer {
            text-align: center;
            margin-top: 40px;
            padding-top: 20px;
            border-top: 1px solid #e9ecef;
            color: #6c757d;
            font-size: 14px;
        }
        .unsubscribe {
            color: #6c757d;
            text-decoration: none;
            font-size: 12px;
        }
        .unsubscribe:hover {
            color: #007bff;
        }
        @media (max-width: 600px) {
            body {
                padding: 10px;
            }
            .container {
                padding: 20px;
            }
            .repo-stats {
                flex-direction: column;
                gap: 10px;
            }
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🚀 GitHub Trending Weekly</h1>
            <p>Top {{total_repos}} trending repositories from {{week_start}} to {{week_end}}</p>
        </div>

        {{#each repositories}}
        <div class="repo-item">
            <div class="repo-header">
                <div class="repo-rank">{{rank}}</div>
                <div>
                    <a href="{{url}}" class="repo-name">{{name}}</a>
                    <span class="repo-author">by {{author}}</span>
                </div>
            </div>

            <div class="repo-description">{{description}}</div>

            <div class="repo-stats">
                <div class="stat">
                    <span class="stat-icon">⭐</span>
                    <span>{{stars_formatted}} stars</span>
                </div>
                <div class="stat">
                    <span class="stat-icon">🍴</span>
                    <span>{{forks_formatted}} forks</span>
                </div>
                <div class="stat">
                    <span class="language-tag">{{language}}</span>
                </div>
            </div>
        </div>
        {{/each}}

        <div class="footer">
            <p>Happy coding! 💻</p>
            <p>
                <a href="{{unsubscribe_url}}" class="unsubscribe">Unsubscribe</a> |
                © {{current_year}} GitHub Trending Summarizer
            </p>
        </div>
    </div>
</body>
</html>
        "#
    }

    fn text_template() -> &'static str {
        r#"
GitHub Trending Weekly Digest
{{week_start}} to {{week_end}}

Top {{total_repos}} trending repositories this week:

{{#each repositories}}
{{rank}}. {{name}} by {{author}}
   {{description}}
   ⭐ {{stars_formatted}} stars | 🍴 {{forks_formatted}} forks | {{language}}
   {{url}}

{{/each}}

Happy coding! 💻

---
Unsubscribe: {{unsubscribe_url}}
© {{current_year}} GitHub Trending Summarizer
        "#
    }

    fn personalized_html_template() -> &'static str {
        r#"
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Your Personalized GitHub Trending Digest</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
            background-color: #f8f9fa;
        }
        .container {
            background-color: white;
            border-radius: 8px;
            padding: 30px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }
        .header {
            text-align: center;
            border-bottom: 2px solid #e9ecef;
            padding-bottom: 20px;
            margin-bottom: 30px;
        }
        .header h1 {
            color: #2c3e50;
            margin: 0;
            font-size: 28px;
        }
        .header p {
            color: #6c757d;
            margin: 10px 0 0 0;
            font-size: 16px;
        }
        .personalization-info {
            background-color: #e3f2fd;
            border-left: 4px solid #2196f3;
            padding: 15px;
            margin-bottom: 25px;
            border-radius: 4px;
        }
        .personalization-info h3 {
            margin: 0 0 10px 0;
            color: #1976d2;
            font-size: 16px;
        }
        .personalization-info p {
            margin: 5px 0;
            color: #424242;
            font-size: 14px;
        }
        .reasons-list {
            list-style: none;
            padding: 0;
            margin: 10px 0 0 0;
        }
        .reasons-list li {
            background-color: #f5f5f5;
            padding: 5px 10px;
            margin: 5px 0;
            border-radius: 3px;
            font-size: 13px;
            color: #555;
        }
        .repo-item {
            border: 1px solid #e9ecef;
            border-radius: 6px;
            padding: 20px;
            margin-bottom: 20px;
            background-color: #fff;
        }
        .repo-header {
            display: flex;
            align-items: center;
            margin-bottom: 10px;
        }
        .repo-rank {
            background-color: #007bff;
            color: white;
            border-radius: 50%;
            width: 30px;
            height: 30px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-weight: bold;
            margin-right: 15px;
            font-size: 14px;
        }
        .repo-name {
            font-size: 20px;
            font-weight: 600;
            color: #2c3e50;
            text-decoration: none;
            margin: 0;
        }
        .repo-name:hover {
            color: #007bff;
        }
        .repo-author {
            color: #6c757d;
            font-size: 14px;
            margin-left: 5px;
        }
        .repo-description {
            color: #495057;
            margin: 10px 0;
            line-height: 1.5;
        }
        .repo-stats {
            display: flex;
            gap: 20px;
            margin-top: 15px;
        }
        .stat {
            display: flex;
            align-items: center;
            color: #6c757d;
            font-size: 14px;
        }
        .stat-icon {
            margin-right: 5px;
        }
        .language-tag {
            background-color: #f8f9fa;
            color: #495057;
            padding: 4px 8px;
            border-radius: 4px;
            font-size: 12px;
            font-weight: 500;
        }
        .cta-button {
            background-color: #007bff;
            color: white;
            padding: 8px 16px;
            text-decoration: none;
            border-radius: 4px;
            font-size: 14px;
            font-weight: 500;
            display: inline-block;
            margin-top: 10px;
        }
        .cta-button:hover {
            background-color: #0056b3;
            color: white;
        }
        .social-proof {
            background-color: #f8f9fa;
            padding: 10px;
            border-radius: 4px;
            margin-top: 10px;
            font-size: 13px;
            color: #6c757d;
        }
        .footer {
            text-align: center;
            margin-top: 40px;
            padding-top: 20px;
            border-top: 1px solid #e9ecef;
            color: #6c757d;
            font-size: 14px;
        }
        .unsubscribe {
            color: #6c757d;
            text-decoration: none;
            font-size: 12px;
        }
        .unsubscribe:hover {
            color: #007bff;
        }
        @media (max-width: 600px) {
            body {
                padding: 10px;
            }
            .container {
                padding: 20px;
            }
            .repo-stats {
                flex-direction: column;
                gap: 10px;
            }
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🚀 Your Personalized GitHub Trending</h1>
            <p>Top {{total_repos}} repositories curated for you from {{week_start}} to {{week_end}}</p>
        </div>

        {{#if has_personalization}}
        <div class="personalization-info">
            <h3>📊 Personalized for {{segment.name}}</h3>
            <p>{{segment.description}}</p>
            {{#if personalization_reasons}}
            <p><strong>Why these repositories?</strong></p>
            <ul class="reasons-list">
                {{#each personalization_reasons}}
                <li>{{this}}</li>
                {{/each}}
            </ul>
            {{/if}}
        </div>
        {{/if}}

        {{#each repositories}}
        <div class="repo-item">
            <div class="repo-header">
                <div class="repo-rank">{{rank}}</div>
                <div>
                    <a href="{{url}}" class="repo-name">{{name}}</a>
                    <span class="repo-author">by {{author}}</span>
                </div>
            </div>

            <div class="repo-description">{{description}}</div>

            <div class="repo-stats">
                <div class="stat">
                    <span class="stat-icon">⭐</span>
                    <span>{{stars_formatted}} stars</span>
                </div>
                <div class="stat">
                    <span class="stat-icon">🍴</span>
                    <span>{{forks_formatted}} forks</span>
                </div>
                <div class="stat">
                    <span class="language-tag">{{language}}</span>
                </div>
            </div>

            <a href="{{url}}" class="cta-button">{{../cta_text}}</a>

            {{#if ../include_social_proof}}
            <div class="social-proof">
                💡 This repository is trending with developers like you
            </div>
            {{/if}}
        </div>
        {{/each}}

        <div class="footer">
            <p>Happy coding! 💻</p>
            <p>
                <a href="{{unsubscribe_url}}" class="unsubscribe">Unsubscribe</a> |
                © {{current_year}} GitHub Trending Summarizer
            </p>
        </div>
    </div>
</body>
</html>
        "#
    }

    fn personalized_text_template() -> &'static str {
        r#"
Your Personalized GitHub Trending Digest
{{week_start}} to {{week_end}}

{{#if has_personalization}}
📊 Personalized for {{segment.name}}
{{segment.description}}

{{#if personalization_reasons}}
Why these repositories?
{{#each personalization_reasons}}
• {{this}}
{{/each}}

{{/if}}
{{/if}}

Top {{total_repos}} repositories curated for you:

{{#each repositories}}
{{rank}}. {{name}} by {{author}}
   {{description}}
   ⭐ {{stars_formatted}} stars | 🍴 {{forks_formatted}} forks | {{language}}
   {{url}}

{{/each}}

Happy coding! 💻

---
Unsubscribe: {{unsubscribe_url}}
© {{current_year}} GitHub Trending Summarizer
        "#
    }
}

impl Default for NewsletterTemplate {
    fn default() -> Self {
        Self::new().expect("Failed to create newsletter template")
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::models::Repository;
    use chrono::NaiveDate;

    fn create_test_repository() -> Repository {
        Repository {
            id: 1,
            github_id: 123456,
            name: "test-repo".to_string(),
            full_name: "testuser/test-repo".to_string(),
            description: Some("A test repository for unit testing".to_string()),
            stars: 1250,
            forks: 89,
            language: Some("Rust".to_string()),
            author: "testuser".to_string(),
            url: "https://github.com/testuser/test-repo".to_string(),
            trending_date: NaiveDate::from_ymd_opt(2024, 1, 1).unwrap(),
            created_at: None,
            updated_at: None,
        }
    }

    #[test]
    fn test_newsletter_template_creation() {
        let template = NewsletterTemplate::new();
        assert!(template.is_ok());
    }

    #[test]
    fn test_format_number() {
        assert_eq!(NewsletterTemplate::format_number(500), "500");
        assert_eq!(NewsletterTemplate::format_number(1500), "1.5k");
        assert_eq!(NewsletterTemplate::format_number(12500), "12.5k");
    }

    #[test]
    fn test_render_templates() {
        let template = NewsletterTemplate::new().unwrap();
        let repos = vec![create_test_repository()];
        let unsubscribe_url = "https://example.com/unsubscribe/token";
        let week_start = "Jan 1, 2024";
        let week_end = "Jan 7, 2024";

        let html = template.render_html_newsletter(&repos, unsubscribe_url, week_start, week_end);
        assert!(html.is_ok());
        let html_content = html.unwrap();
        assert!(html_content.contains("test-repo"));
        assert!(html_content.contains("1.2k stars")); // 1250 is formatted to 1.2k (rounded down)

        let text = template.render_text_newsletter(&repos, unsubscribe_url, week_start, week_end);
        assert!(text.is_ok());
        let text_content = text.unwrap();
        assert!(text_content.contains("test-repo"));
        assert!(text_content.contains("1.2k stars")); // 1250 is formatted to 1.2k (rounded down)
    }
}
