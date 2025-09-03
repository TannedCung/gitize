use crate::database::DbPool;
use crate::schema::{newsletter_subscriptions, repositories, summaries, trending_history};
use chrono::{NaiveDate, Utc};
use diesel::prelude::*;

#[derive(Insertable)]
#[diesel(table_name = repositories)]
pub struct NewRepository {
    pub github_id: i64,
    pub name: String,
    pub full_name: String,
    pub description: Option<String>,
    pub stars: i32,
    pub forks: i32,
    pub language: Option<String>,
    pub author: String,
    pub url: String,
    pub trending_date: NaiveDate,
}

#[derive(Insertable)]
#[diesel(table_name = summaries)]
pub struct NewSummary {
    pub repository_id: i64,
    pub content: String,
}

#[derive(Insertable)]
#[diesel(table_name = newsletter_subscriptions)]
pub struct NewNewsletterSubscription {
    pub email: String,
    pub unsubscribe_token: String,
}

#[derive(Insertable)]
#[diesel(table_name = trending_history)]
pub struct NewTrendingHistory {
    pub repository_id: i64,
    pub stars: i32,
    pub forks: i32,
}

/// Seed the database with development data
#[allow(dead_code)]
pub fn seed_database(pool: &DbPool) -> Result<(), diesel::result::Error> {
    let mut conn = pool
        .get()
        .map_err(|_| diesel::result::Error::BrokenTransactionManager)?;

    // Sample repositories
    let sample_repos = vec![
        NewRepository {
            github_id: 123456789,
            name: "awesome-rust".to_string(),
            full_name: "rust-unofficial/awesome-rust".to_string(),
            description: Some("A curated list of Rust code and resources.".to_string()),
            stars: 45000,
            forks: 6500,
            language: Some("Rust".to_string()),
            author: "rust-unofficial".to_string(),
            url: "https://github.com/rust-unofficial/awesome-rust".to_string(),
            trending_date: Utc::now().date_naive(),
        },
        NewRepository {
            github_id: 987654321,
            name: "react".to_string(),
            full_name: "facebook/react".to_string(),
            description: Some("The library for web and native user interfaces.".to_string()),
            stars: 220000,
            forks: 45000,
            language: Some("JavaScript".to_string()),
            author: "facebook".to_string(),
            url: "https://github.com/facebook/react".to_string(),
            trending_date: Utc::now().date_naive(),
        },
        NewRepository {
            github_id: 456789123,
            name: "tensorflow".to_string(),
            full_name: "tensorflow/tensorflow".to_string(),
            description: Some("An Open Source Machine Learning Framework for Everyone".to_string()),
            stars: 185000,
            forks: 74000,
            language: Some("Python".to_string()),
            author: "tensorflow".to_string(),
            url: "https://github.com/tensorflow/tensorflow".to_string(),
            trending_date: Utc::now().date_naive(),
        },
    ];

    // Insert repositories
    let inserted_repos: Vec<i64> = diesel::insert_into(repositories::table)
        .values(&sample_repos)
        .returning(repositories::id)
        .get_results(&mut conn)?;

    // Sample summaries for the repositories
    let sample_summaries = vec![
        NewSummary {
            repository_id: inserted_repos[0],
            content: "A comprehensive collection of Rust libraries, tools, and resources organized by category. Perfect for discovering new crates and staying updated with the Rust ecosystem.".to_string(),
        },
        NewSummary {
            repository_id: inserted_repos[1],
            content: "React is a declarative, efficient, and flexible JavaScript library for building user interfaces. It lets you compose complex UIs from small and isolated pieces of code called components.".to_string(),
        },
        NewSummary {
            repository_id: inserted_repos[2],
            content: "TensorFlow is an end-to-end open source platform for machine learning. It has a comprehensive, flexible ecosystem of tools, libraries and community resources.".to_string(),
        },
    ];

    diesel::insert_into(summaries::table)
        .values(&sample_summaries)
        .execute(&mut conn)?;

    // Sample newsletter subscriptions
    let sample_subscriptions = vec![
        NewNewsletterSubscription {
            email: "developer1@example.com".to_string(),
            unsubscribe_token: uuid::Uuid::new_v4().to_string(),
        },
        NewNewsletterSubscription {
            email: "developer2@example.com".to_string(),
            unsubscribe_token: uuid::Uuid::new_v4().to_string(),
        },
    ];

    diesel::insert_into(newsletter_subscriptions::table)
        .values(&sample_subscriptions)
        .execute(&mut conn)?;

    // Sample trending history
    let sample_history = vec![
        NewTrendingHistory {
            repository_id: inserted_repos[0],
            stars: 44500,
            forks: 6400,
        },
        NewTrendingHistory {
            repository_id: inserted_repos[1],
            stars: 219500,
            forks: 44800,
        },
        NewTrendingHistory {
            repository_id: inserted_repos[2],
            stars: 184500,
            forks: 73800,
        },
    ];

    diesel::insert_into(trending_history::table)
        .values(&sample_history)
        .execute(&mut conn)?;

    println!("Database seeded successfully with development data!");
    Ok(())
}
