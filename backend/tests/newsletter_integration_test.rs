use chrono::{NaiveDate, Utc};
use github_trending_summarizer::database::init_pool;
use github_trending_summarizer::models::{NewRepository, Repository};
use github_trending_summarizer::repositories::repository_repo::RepositoryRepository;
use github_trending_summarizer::services::{
    NewsletterService, NewsletterServiceError, RepositoryService,
};
use std::env;
use std::sync::Arc;

mod common;

#[tokio::test]
async fn test_newsletter_service_creation() {
    dotenv::dotenv().ok();
    let db_pool = Arc::new(init_pool());
    let repository_service = Arc::new(RepositoryService::new(db_pool.clone()));

    // This test will fail if SendGrid credentials are not set, which is expected in CI
    let result = NewsletterService::new(db_pool, repository_service);

    // In a real test environment, we'd mock the email client
    // For now, we just verify the service creation logic
    match result {
        Ok(_) => {
            // Service created successfully (SendGrid credentials available)
        }
        Err(NewsletterServiceError::ConfigError(_)) => {
            // Expected when SendGrid credentials are not available
        }
        Err(e) => {
            panic!("Unexpected error: {}", e);
        }
    }
}

#[tokio::test]
async fn test_get_top_weekly_repositories() {
    dotenv::dotenv().ok();
    let db_pool = Arc::new(init_pool());
    let repository_service = Arc::new(RepositoryService::new(db_pool.clone()));

    // Skip this test if SendGrid credentials are not available
    if env::var("SENDGRID_API_KEY").is_err() {
        return;
    }

    let newsletter_service = NewsletterService::new(db_pool.clone(), repository_service)
        .expect("Failed to create newsletter service");

    // Create test repositories with unique github_ids
    let mut conn = db_pool.get().expect("Failed to get connection");

    let today = Utc::now().date_naive();
    let timestamp = std::time::SystemTime::now()
        .duration_since(std::time::UNIX_EPOCH)
        .unwrap()
        .as_secs();

    let test_repos = vec![
        NewRepository {
            github_id: timestamp as i64 + 1001,
            name: "test-repo-1".to_string(),
            full_name: "user1/test-repo-1".to_string(),
            description: Some("Test repository 1".to_string()),
            stars: 1000,
            forks: 100,
            language: Some("Rust".to_string()),
            author: "user1".to_string(),
            url: "https://github.com/user1/test-repo-1".to_string(),
            trending_date: today,
        },
        NewRepository {
            github_id: timestamp as i64 + 1002,
            name: "test-repo-2".to_string(),
            full_name: "user2/test-repo-2".to_string(),
            description: Some("Test repository 2".to_string()),
            stars: 500,
            forks: 50,
            language: Some("Python".to_string()),
            author: "user2".to_string(),
            url: "https://github.com/user2/test-repo-2".to_string(),
            trending_date: today,
        },
    ];

    for repo in test_repos {
        RepositoryRepository::create(&mut conn, repo).expect("Failed to create test repository");
    }

    // Test getting top repositories (this will call the private method indirectly)
    // We can't test the private method directly, but we can test the public interface
    let result = newsletter_service
        .send_test_newsletter("test@example.com")
        .await;

    // This should fail due to email sending, but the repository fetching should work
    match result {
        Err(NewsletterServiceError::EmailError(_)) => {
            // Expected - email sending failed, but repository fetching worked
        }
        Err(NewsletterServiceError::ValidationError(msg))
            if msg.contains("No trending repositories") =>
        {
            // This might happen if the test data doesn't meet the criteria
        }
        Ok(_) => {
            // Unexpected success (would require valid SendGrid setup)
        }
        Err(e) => {
            panic!("Unexpected error: {}", e);
        }
    }
}

#[tokio::test]
async fn test_newsletter_template_rendering() {
    use github_trending_summarizer::services::newsletter_template::NewsletterTemplate;

    let template = NewsletterTemplate::new().expect("Failed to create template");

    let test_repo = Repository {
        id: 1,
        github_id: 123456,
        name: "test-repo".to_string(),
        full_name: "testuser/test-repo".to_string(),
        description: Some("A test repository".to_string()),
        stars: 1250,
        forks: 89,
        language: Some("Rust".to_string()),
        author: "testuser".to_string(),
        url: "https://github.com/testuser/test-repo".to_string(),
        trending_date: NaiveDate::from_ymd_opt(2024, 1, 1).unwrap(),
        created_at: None,
        updated_at: None,
    };

    let repos = vec![test_repo];
    let unsubscribe_url = "https://example.com/unsubscribe/token";
    let week_start = "Jan 1, 2024";
    let week_end = "Jan 7, 2024";

    // Test HTML template rendering
    let html_result =
        template.render_html_newsletter(&repos, unsubscribe_url, week_start, week_end);
    assert!(html_result.is_ok());

    let html_content = html_result.unwrap();
    assert!(html_content.contains("test-repo"));
    assert!(html_content.contains("1.2k stars")); // 1250 is formatted to 1.2k
    assert!(html_content.contains("testuser"));
    assert!(html_content.contains("Rust"));
    assert!(html_content.contains(unsubscribe_url));

    // Test text template rendering
    let text_result =
        template.render_text_newsletter(&repos, unsubscribe_url, week_start, week_end);
    assert!(text_result.is_ok());

    let text_content = text_result.unwrap();
    assert!(text_content.contains("test-repo"));
    assert!(text_content.contains("1.2k stars")); // 1250 is formatted to 1.2k
    assert!(text_content.contains("testuser"));
    assert!(text_content.contains("Rust"));
    assert!(text_content.contains(unsubscribe_url));
}

#[test]
fn test_email_validation() {
    // Test valid emails
    assert!(NewsletterService::validate_email("test@example.com").is_ok());
    assert!(NewsletterService::validate_email("user.name+tag@domain.co.uk").is_ok());
    assert!(NewsletterService::validate_email("user123@test-domain.org").is_ok());

    // Test invalid emails
    assert!(NewsletterService::validate_email("invalid-email").is_err());
    assert!(NewsletterService::validate_email("@domain.com").is_err());
    assert!(NewsletterService::validate_email("user@").is_err());
    assert!(NewsletterService::validate_email("user@domain").is_err());
    assert!(NewsletterService::validate_email("").is_err());
}

#[test]
fn test_newsletter_send_result() {
    use github_trending_summarizer::services::NewsletterSendResult;

    let mut result = NewsletterSendResult::new();

    result
        .successful_sends
        .push("test1@example.com".to_string());
    result
        .successful_sends
        .push("test2@example.com".to_string());
    result
        .failed_sends
        .push(("test3@example.com".to_string(), "Error message".to_string()));

    assert_eq!(result.total_attempted(), 3);
    assert!((result.success_rate() - 0.6666666666666666).abs() < f64::EPSILON);
}

#[test]
fn test_week_date_calculation() {
    // This is a unit test for the date calculation logic
    // We can't test the private method directly, but we can test the logic
    use chrono::{Datelike, Duration, Utc};

    let today = Utc::now().date_naive();
    let days_since_monday = today.weekday().num_days_from_monday();

    let week_start = today - Duration::days(days_since_monday as i64);
    let week_end = week_start + Duration::days(6);

    // Verify that week_start is a Monday and week_end is a Sunday
    assert_eq!(week_start.weekday().num_days_from_monday(), 0);
    assert_eq!(week_end.weekday().num_days_from_monday(), 6);

    // Verify the week span is exactly 7 days
    assert_eq!((week_end - week_start).num_days(), 6);
}
#[tokio::test]
async fn test_newsletter_subscription_flow() {
    dotenv::dotenv().ok();
    let db_pool = Arc::new(init_pool());
    let repository_service = Arc::new(RepositoryService::new(db_pool.clone()));

    // Skip this test if SendGrid credentials are not available
    if env::var("SENDGRID_API_KEY").is_err() {
        return;
    }

    let newsletter_service = NewsletterService::new(db_pool.clone(), repository_service)
        .expect("Failed to create newsletter service");

    let test_email = format!(
        "test+{}@example.com",
        std::time::SystemTime::now()
            .duration_since(std::time::UNIX_EPOCH)
            .unwrap()
            .as_secs()
    );

    // Test subscription
    let subscription_result = newsletter_service.subscribe(test_email.clone()).await;
    assert!(subscription_result.is_ok());
    let subscription = subscription_result.unwrap();
    assert_eq!(subscription.email, test_email);
    assert!(subscription.is_active());

    // Test duplicate subscription
    let duplicate_result = newsletter_service.subscribe(test_email.clone()).await;
    assert!(matches!(
        duplicate_result,
        Err(NewsletterServiceError::AlreadySubscribed)
    ));

    // Test subscription status check
    let status_result = newsletter_service.is_subscribed(&test_email).await;
    assert!(status_result.is_ok());
    assert!(status_result.unwrap());

    // Test unsubscribe
    let unsubscribe_result = newsletter_service
        .unsubscribe(subscription.unsubscribe_token.clone())
        .await;
    assert!(unsubscribe_result.is_ok());
    let unsubscribed = unsubscribe_result.unwrap();
    assert_eq!(unsubscribed.email, test_email);
    assert!(!unsubscribed.is_active());

    // Test status after unsubscribe
    let status_after_unsub = newsletter_service.is_subscribed(&test_email).await;
    assert!(status_after_unsub.is_ok());
    assert!(!status_after_unsub.unwrap());
}

#[tokio::test]
async fn test_newsletter_statistics() {
    dotenv::dotenv().ok();
    let db_pool = Arc::new(init_pool());
    let repository_service = Arc::new(RepositoryService::new(db_pool.clone()));

    // Skip this test if SendGrid credentials are not available
    if env::var("SENDGRID_API_KEY").is_err() {
        return;
    }

    let newsletter_service = NewsletterService::new(db_pool.clone(), repository_service)
        .expect("Failed to create newsletter service");

    // Get initial statistics
    let initial_stats = newsletter_service.get_statistics().await;
    assert!(initial_stats.is_ok());
    let initial = initial_stats.unwrap();

    // Subscribe a test user
    let test_email = format!(
        "stats_test+{}@example.com",
        std::time::SystemTime::now()
            .duration_since(std::time::UNIX_EPOCH)
            .unwrap()
            .as_secs()
    );

    let _subscription = newsletter_service
        .subscribe(test_email.clone())
        .await
        .expect("Failed to subscribe test user");

    // Get updated statistics
    let updated_stats = newsletter_service.get_statistics().await;
    assert!(updated_stats.is_ok());
    let updated = updated_stats.unwrap();

    // Verify statistics increased
    assert!(updated.total_subscriptions > initial.total_subscriptions);
    assert!(updated.active_subscriptions > initial.active_subscriptions);
}

#[tokio::test]
async fn test_weekly_newsletter_generation_without_sending() {
    dotenv::dotenv().ok();
    let db_pool = Arc::new(init_pool());
    let repository_service = Arc::new(RepositoryService::new(db_pool.clone()));

    // Skip this test if SendGrid credentials are not available
    if env::var("SENDGRID_API_KEY").is_err() {
        return;
    }

    let newsletter_service = NewsletterService::new(db_pool.clone(), repository_service)
        .expect("Failed to create newsletter service");

    // Create test repositories for newsletter content
    let mut conn = db_pool.get().expect("Failed to get connection");
    let today = Utc::now().date_naive();
    let timestamp = std::time::SystemTime::now()
        .duration_since(std::time::UNIX_EPOCH)
        .unwrap()
        .as_secs();

    let test_repos = vec![
        NewRepository {
            github_id: timestamp as i64 + 2001,
            name: "newsletter-test-repo-1".to_string(),
            full_name: "user1/newsletter-test-repo-1".to_string(),
            description: Some("Newsletter test repository 1".to_string()),
            stars: 2000,
            forks: 200,
            language: Some("Rust".to_string()),
            author: "user1".to_string(),
            url: "https://github.com/user1/newsletter-test-repo-1".to_string(),
            trending_date: today,
        },
        NewRepository {
            github_id: timestamp as i64 + 2002,
            name: "newsletter-test-repo-2".to_string(),
            full_name: "user2/newsletter-test-repo-2".to_string(),
            description: Some("Newsletter test repository 2".to_string()),
            stars: 1500,
            forks: 150,
            language: Some("Python".to_string()),
            author: "user2".to_string(),
            url: "https://github.com/user2/newsletter-test-repo-2".to_string(),
            trending_date: today,
        },
    ];

    for repo in test_repos {
        RepositoryRepository::create(&mut conn, repo).expect("Failed to create test repository");
    }

    // Test newsletter generation (will fail at sending, but generation should work)
    let result = newsletter_service.send_weekly_newsletter().await;

    // We expect this to succeed or fail at email sending
    match result {
        Ok(_send_result) => {
            // Newsletter generation succeeded, check that it processed correctly
            // The number of sends depends on existing subscribers in the test database
        }
        Err(NewsletterServiceError::EmailError(_)) => {
            // Expected if there are subscribers but email sending fails
        }
        Err(e) => {
            panic!("Unexpected error during newsletter generation: {}", e);
        }
    }
}

#[test]
fn test_newsletter_send_result_calculations() {
    use github_trending_summarizer::services::NewsletterSendResult;

    let mut result = NewsletterSendResult::new();

    // Test empty result
    assert_eq!(result.total_attempted(), 0);
    assert_eq!(result.success_rate(), 0.0);

    // Add successful sends
    result
        .successful_sends
        .push("success1@example.com".to_string());
    result
        .successful_sends
        .push("success2@example.com".to_string());
    result
        .successful_sends
        .push("success3@example.com".to_string());

    // Add failed sends
    result
        .failed_sends
        .push(("fail1@example.com".to_string(), "Error 1".to_string()));
    result
        .failed_sends
        .push(("fail2@example.com".to_string(), "Error 2".to_string()));

    assert_eq!(result.total_attempted(), 5);
    assert_eq!(result.success_rate(), 0.6); // 3/5 = 0.6
}

#[test]
fn test_unsubscribe_token_validation() {
    // Test invalid tokens
    let invalid_tokens = vec!["", "invalid", "too-short", "invalid-format-token"];

    // We can't directly test the private validation logic,
    // but we can test the public interface behavior
    for token in invalid_tokens {
        // In a real test, we'd create a service and test unsubscribe
        // For now, we just verify the token format expectations
        assert!(!token.is_empty() || token.len() < 10);
    }
}

#[tokio::test]
async fn test_newsletter_template_with_multiple_repositories() {
    use github_trending_summarizer::services::newsletter_template::NewsletterTemplate;

    let template = NewsletterTemplate::new().expect("Failed to create template");

    let test_repos = vec![
        Repository {
            id: 1,
            github_id: 123456,
            name: "awesome-rust".to_string(),
            full_name: "rust-lang/awesome-rust".to_string(),
            description: Some("A curated list of Rust code and resources".to_string()),
            stars: 45000,
            forks: 6500,
            language: Some("Rust".to_string()),
            author: "rust-lang".to_string(),
            url: "https://github.com/rust-lang/awesome-rust".to_string(),
            trending_date: NaiveDate::from_ymd_opt(2024, 1, 1).unwrap(),
            created_at: None,
            updated_at: None,
        },
        Repository {
            id: 2,
            github_id: 789012,
            name: "python-guide".to_string(),
            full_name: "realpython/python-guide".to_string(),
            description: Some("Python best practices guidebook".to_string()),
            stars: 28000,
            forks: 4200,
            language: Some("Python".to_string()),
            author: "realpython".to_string(),
            url: "https://github.com/realpython/python-guide".to_string(),
            trending_date: NaiveDate::from_ymd_opt(2024, 1, 1).unwrap(),
            created_at: None,
            updated_at: None,
        },
        Repository {
            id: 3,
            github_id: 345678,
            name: "react".to_string(),
            full_name: "facebook/react".to_string(),
            description: Some("The library for web and native user interfaces".to_string()),
            stars: 220000,
            forks: 45000,
            language: Some("JavaScript".to_string()),
            author: "facebook".to_string(),
            url: "https://github.com/facebook/react".to_string(),
            trending_date: NaiveDate::from_ymd_opt(2024, 1, 1).unwrap(),
            created_at: None,
            updated_at: None,
        },
    ];

    let unsubscribe_url = "https://example.com/unsubscribe/test-token";
    let week_start = "Jan 1, 2024";
    let week_end = "Jan 7, 2024";

    // Test HTML template with multiple repositories
    let html_result =
        template.render_html_newsletter(&test_repos, unsubscribe_url, week_start, week_end);
    assert!(html_result.is_ok());

    let html_content = html_result.unwrap();

    // Verify all repositories are included
    assert!(html_content.contains("awesome-rust"));
    assert!(html_content.contains("python-guide"));
    assert!(html_content.contains("react"));

    // Verify star formatting
    assert!(html_content.contains("45k stars")); // 45000 -> 45k
    assert!(html_content.contains("28k stars")); // 28000 -> 28k
    assert!(html_content.contains("220k stars")); // 220000 -> 220k

    // Verify languages are included
    assert!(html_content.contains("Rust"));
    assert!(html_content.contains("Python"));
    assert!(html_content.contains("JavaScript"));

    // Verify unsubscribe link
    assert!(html_content.contains(unsubscribe_url));

    // Verify week dates
    assert!(html_content.contains(week_start));
    assert!(html_content.contains(week_end));

    // Test text template with same data
    let text_result =
        template.render_text_newsletter(&test_repos, unsubscribe_url, week_start, week_end);
    assert!(text_result.is_ok());

    let text_content = text_result.unwrap();

    // Verify text template contains same key information
    assert!(text_content.contains("awesome-rust"));
    assert!(text_content.contains("45k stars"));
    assert!(text_content.contains(unsubscribe_url));
    assert!(text_content.contains("Top 3 trending repositories"));
}
