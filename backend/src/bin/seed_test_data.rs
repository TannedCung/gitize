use chrono::{NaiveDate, Utc};
use diesel::pg::PgConnection;
use diesel::prelude::*;
use std::env;

use github_trending_summarizer::database::establish_connection;
use github_trending_summarizer::models::{
    NewNewsletterSubscription, NewRepository, NewSummary, NewTrendingHistory,
};
use github_trending_summarizer::schema::{
    newsletter_subscriptions, repositories, summaries, trending_history,
};

fn main() {
    let mut connection = establish_connection();

    println!("🌱 Seeding test data...");

    // Clear existing test data
    clear_test_data(&mut connection);

    // Seed repositories
    let repo_ids = seed_repositories(&mut connection);
    println!("✅ Seeded {} repositories", repo_ids.len());

    // Seed summaries
    seed_summaries(&mut connection, &repo_ids);
    println!("✅ Seeded summaries");

    // Seed trending history
    seed_trending_history(&mut connection, &repo_ids);
    println!("✅ Seeded trending history");

    // Seed newsletter subscriptions
    seed_newsletter_subscriptions(&mut connection);
    println!("✅ Seeded newsletter subscriptions");

    println!("🎉 Test data seeding complete!");
}

fn clear_test_data(connection: &mut PgConnection) {
    use github_trending_summarizer::schema::*;

    println!("🧹 Clearing existing test data...");

    // Delete in reverse dependency order
    diesel::delete(trending_history::table)
        .execute(connection)
        .expect("Failed to clear trending history");

    diesel::delete(summaries::table)
        .execute(connection)
        .expect("Failed to clear summaries");

    diesel::delete(newsletter_subscriptions::table)
        .execute(connection)
        .expect("Failed to clear newsletter subscriptions");

    diesel::delete(repositories::table)
        .execute(connection)
        .expect("Failed to clear repositories");
}

fn seed_repositories(connection: &mut PgConnection) -> Vec<i64> {
    let test_repositories = vec![
        NewRepository {
            github_id: 1001,
            name: "awesome-react-components".to_string(),
            full_name: "brillout/awesome-react-components".to_string(),
            description: Some("Curated List of React Components & Libraries.".to_string()),
            stars: 42500,
            forks: 3200,
            language: Some("JavaScript".to_string()),
            author: "brillout".to_string(),
            url: "https://github.com/brillout/awesome-react-components".to_string(),
            trending_date: NaiveDate::from_ymd_opt(2024, 1, 15).unwrap(),
        },
        NewRepository {
            github_id: 1002,
            name: "tensorflow".to_string(),
            full_name: "tensorflow/tensorflow".to_string(),
            description: Some("An Open Source Machine Learning Framework for Everyone".to_string()),
            stars: 185000,
            forks: 74000,
            language: Some("Python".to_string()),
            author: "tensorflow".to_string(),
            url: "https://github.com/tensorflow/tensorflow".to_string(),
            trending_date: NaiveDate::from_ymd_opt(2024, 1, 15).unwrap(),
        },
        NewRepository {
            github_id: 1003,
            name: "rust-analyzer".to_string(),
            full_name: "rust-lang/rust-analyzer".to_string(),
            description: Some("A Rust compiler front-end for IDEs".to_string()),
            stars: 14200,
            forks: 1600,
            language: Some("Rust".to_string()),
            author: "rust-lang".to_string(),
            url: "https://github.com/rust-lang/rust-analyzer".to_string(),
            trending_date: NaiveDate::from_ymd_opt(2024, 1, 15).unwrap(),
        },
        NewRepository {
            github_id: 1004,
            name: "typescript".to_string(),
            full_name: "microsoft/TypeScript".to_string(),
            description: Some("TypeScript is a superset of JavaScript that compiles to clean JavaScript output.".to_string()),
            stars: 100000,
            forks: 13000,
            language: Some("TypeScript".to_string()),
            author: "microsoft".to_string(),
            url: "https://github.com/microsoft/TypeScript".to_string(),
            trending_date: NaiveDate::from_ymd_opt(2024, 1, 15).unwrap(),
        },
        NewRepository {
            github_id: 1005,
            name: "go-ethereum".to_string(),
            full_name: "ethereum/go-ethereum".to_string(),
            description: Some("Official Go implementation of the Ethereum protocol".to_string()),
            stars: 47000,
            forks: 20000,
            language: Some("Go".to_string()),
            author: "ethereum".to_string(),
            url: "https://github.com/ethereum/go-ethereum".to_string(),
            trending_date: NaiveDate::from_ymd_opt(2024, 1, 15).unwrap(),
        },
        NewRepository {
            github_id: 1006,
            name: "spring-boot".to_string(),
            full_name: "spring-projects/spring-boot".to_string(),
            description: Some("Spring Boot helps you to create Spring-powered, production-grade applications and services with absolute minimum fuss.".to_string()),
            stars: 74000,
            forks: 40000,
            language: Some("Java".to_string()),
            author: "spring-projects".to_string(),
            url: "https://github.com/spring-projects/spring-boot".to_string(),
            trending_date: NaiveDate::from_ymd_opt(2024, 1, 15).unwrap(),
        },
        NewRepository {
            github_id: 1007,
            name: "llvm-project".to_string(),
            full_name: "llvm/llvm-project".to_string(),
            description: Some("The LLVM Project is a collection of modular and reusable compiler and toolchain technologies.".to_string()),
            stars: 28000,
            forks: 11500,
            language: Some("C++".to_string()),
            author: "llvm".to_string(),
            url: "https://github.com/llvm/llvm-project".to_string(),
            trending_date: NaiveDate::from_ymd_opt(2024, 1, 15).unwrap(),
        },
        NewRepository {
            github_id: 1008,
            name: "dotnet-core".to_string(),
            full_name: "dotnet/core".to_string(),
            description: Some(".NET is a cross-platform runtime for cloud, mobile, desktop, and IoT apps.".to_string()),
            stars: 21000,
            forks: 4800,
            language: Some("C#".to_string()),
            author: "dotnet".to_string(),
            url: "https://github.com/dotnet/core".to_string(),
            trending_date: NaiveDate::from_ymd_opt(2024, 1, 15).unwrap(),
        },
        NewRepository {
            github_id: 1009,
            name: "laravel".to_string(),
            full_name: "laravel/laravel".to_string(),
            description: Some("Laravel is a web application framework with expressive, elegant syntax.".to_string()),
            stars: 78000,
            forks: 24000,
            language: Some("PHP".to_string()),
            author: "laravel".to_string(),
            url: "https://github.com/laravel/laravel".to_string(),
            trending_date: NaiveDate::from_ymd_opt(2024, 1, 15).unwrap(),
        },
        NewRepository {
            github_id: 1010,
            name: "rails".to_string(),
            full_name: "rails/rails".to_string(),
            description: Some("Ruby on Rails is a full-stack web framework optimized for programmer happiness and sustainable productivity.".to_string()),
            stars: 55000,
            forks: 21000,
            language: Some("Ruby".to_string()),
            author: "rails".to_string(),
            url: "https://github.com/rails/rails".to_string(),
            trending_date: NaiveDate::from_ymd_opt(2024, 1, 15).unwrap(),
        },
        NewRepository {
            github_id: 1011,
            name: "next.js".to_string(),
            full_name: "vercel/next.js".to_string(),
            description: Some("The React Framework for the Web".to_string()),
            stars: 125000,
            forks: 26000,
            language: Some("JavaScript".to_string()),
            author: "vercel".to_string(),
            url: "https://github.com/vercel/next.js".to_string(),
            trending_date: NaiveDate::from_ymd_opt(2024, 1, 16).unwrap(),
        },
        NewRepository {
            github_id: 1012,
            name: "pytorch".to_string(),
            full_name: "pytorch/pytorch".to_string(),
            description: Some("Tensors and Dynamic neural networks in Python with strong GPU acceleration".to_string()),
            stars: 82000,
            forks: 22000,
            language: Some("Python".to_string()),
            author: "pytorch".to_string(),
            url: "https://github.com/pytorch/pytorch".to_string(),
            trending_date: NaiveDate::from_ymd_opt(2024, 1, 16).unwrap(),
        },
        NewRepository {
            github_id: 1013,
            name: "tokio".to_string(),
            full_name: "tokio-rs/tokio".to_string(),
            description: Some("A runtime for writing reliable asynchronous applications with Rust.".to_string()),
            stars: 26000,
            forks: 2400,
            language: Some("Rust".to_string()),
            author: "tokio-rs".to_string(),
            url: "https://github.com/tokio-rs/tokio".to_string(),
            trending_date: NaiveDate::from_ymd_opt(2024, 1, 16).unwrap(),
        },
        NewRepository {
            github_id: 1014,
            name: "vscode".to_string(),
            full_name: "microsoft/vscode".to_string(),
            description: Some("Visual Studio Code".to_string()),
            stars: 163000,
            forks: 29000,
            language: Some("TypeScript".to_string()),
            author: "microsoft".to_string(),
            url: "https://github.com/microsoft/vscode".to_string(),
            trending_date: NaiveDate::from_ymd_opt(2024, 1, 16).unwrap(),
        },
        NewRepository {
            github_id: 1015,
            name: "kubernetes".to_string(),
            full_name: "kubernetes/kubernetes".to_string(),
            description: Some("Production-Grade Container Scheduling and Management".to_string()),
            stars: 110000,
            forks: 39000,
            language: Some("Go".to_string()),
            author: "kubernetes".to_string(),
            url: "https://github.com/kubernetes/kubernetes".to_string(),
            trending_date: NaiveDate::from_ymd_opt(2024, 1, 16).unwrap(),
        },
    ];

    let mut repo_ids = Vec::new();

    for new_repo in test_repositories {
        let repo: github_trending_summarizer::models::Repository =
            diesel::insert_into(repositories::table)
                .values(&new_repo)
                .get_result(connection)
                .expect("Error saving new repository");

        repo_ids.push(repo.id);
    }

    repo_ids
}

fn seed_summaries(connection: &mut PgConnection, repo_ids: &[i64]) {
    let test_summaries = vec![
        "A comprehensive collection of React components and libraries, curated for developers building modern web applications.",
        "Google's open-source machine learning framework that enables researchers and developers to build and deploy ML models at scale.",
        "An advanced language server for Rust that provides IDE features like code completion, error checking, and refactoring.",
        "Microsoft's typed superset of JavaScript that adds static type definitions, enabling better tooling and error detection.",
        "The official Go implementation of Ethereum, providing a complete blockchain node with smart contract capabilities.",
        "Spring Boot simplifies Java application development by providing production-ready features with minimal configuration.",
        "The LLVM compiler infrastructure project that provides modular and reusable compiler and toolchain technologies.",
        ".NET Core is Microsoft's cross-platform runtime for building cloud, mobile, desktop, and IoT applications.",
        "Laravel is an elegant PHP web framework that emphasizes developer productivity and code maintainability.",
        "Ruby on Rails is a full-stack web framework that prioritizes convention over configuration and developer happiness.",
        "Next.js is a React framework that provides server-side rendering, static site generation, and many other production features.",
        "PyTorch is Facebook's deep learning framework that provides dynamic neural networks with strong GPU acceleration support.",
        "Tokio is an asynchronous runtime for Rust that enables building reliable, fast, and scalable network applications.",
        "Visual Studio Code is Microsoft's free, open-source code editor with extensive language support and debugging capabilities.",
        "Kubernetes is Google's container orchestration platform that automates deployment, scaling, and management of containerized applications.",
    ];

    for (i, &repo_id) in repo_ids.iter().enumerate() {
        if i < test_summaries.len() {
            let new_summary = NewSummary {
                repository_id: repo_id,
                content: test_summaries[i].to_string(),
            };

            diesel::insert_into(summaries::table)
                .values(&new_summary)
                .execute(connection)
                .expect("Error saving new summary");
        }
    }
}

fn seed_trending_history(connection: &mut PgConnection, repo_ids: &[i64]) {
    use chrono::Duration;

    for &repo_id in repo_ids {
        // Create history entries for the past 7 days
        for days_ago in 0..7 {
            let date = Utc::now().naive_utc() - Duration::days(days_ago);

            // Simulate star growth over time
            let base_stars = match repo_id % 5 {
                0 => 1000,
                1 => 5000,
                2 => 10000,
                3 => 25000,
                _ => 50000,
            };

            let stars = base_stars + (days_ago * 50) as i32;
            let forks = stars / 10;

            let new_history = NewTrendingHistory {
                repository_id: repo_id,
                stars,
                forks,
                recorded_at: Some(date),
            };

            diesel::insert_into(trending_history::table)
                .values(&new_history)
                .execute(connection)
                .expect("Error saving trending history");
        }
    }
}

fn seed_newsletter_subscriptions(connection: &mut PgConnection) {
    let test_subscriptions = vec![
        NewNewsletterSubscription {
            email: "developer@example.com".to_string(),
            unsubscribe_token: "token_dev_123".to_string(),
            frequency: Some("weekly".to_string()),
            preferred_languages: Some(vec!["JavaScript".to_string(), "TypeScript".to_string()]),
            is_active: Some(true),
        },
        NewNewsletterSubscription {
            email: "datascientist@example.com".to_string(),
            unsubscribe_token: "token_ds_456".to_string(),
            frequency: Some("daily".to_string()),
            preferred_languages: Some(vec!["Python".to_string(), "R".to_string()]),
            is_active: Some(true),
        },
        NewNewsletterSubscription {
            email: "rustacean@example.com".to_string(),
            unsubscribe_token: "token_rust_789".to_string(),
            frequency: Some("weekly".to_string()),
            preferred_languages: Some(vec!["Rust".to_string(), "C++".to_string()]),
            is_active: Some(true),
        },
        NewNewsletterSubscription {
            email: "fullstack@example.com".to_string(),
            unsubscribe_token: "token_fs_101".to_string(),
            frequency: Some("weekly".to_string()),
            preferred_languages: Some(vec![
                "JavaScript".to_string(),
                "Python".to_string(),
                "Go".to_string(),
            ]),
            is_active: Some(true),
        },
        NewNewsletterSubscription {
            email: "mobile@example.com".to_string(),
            unsubscribe_token: "token_mobile_202".to_string(),
            frequency: Some("daily".to_string()),
            preferred_languages: Some(vec![
                "Swift".to_string(),
                "Kotlin".to_string(),
                "Dart".to_string(),
            ]),
            is_active: Some(true),
        },
    ];

    for new_subscription in test_subscriptions {
        diesel::insert_into(newsletter_subscriptions::table)
            .values(&new_subscription)
            .execute(connection)
            .expect("Error saving new newsletter subscription");
    }
}
