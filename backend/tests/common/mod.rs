use rocket::routes;

use rocket::local::blocking::Client;
use std::sync::Once;

static INIT: Once = Once::new();

pub fn setup_test_client() -> Client {
    INIT.call_once(|| {
        dotenv::dotenv().ok();
        std::env::set_var("RUST_LOG", "debug");
        env_logger::try_init().ok();
    });

    // Create a minimal test rocket instance with just health endpoint
    let rocket = rocket::build().mount(
        "/api",
        routes![github_trending_summarizer::routes::health::health_check],
    );

    Client::tracked(rocket).expect("valid rocket instance")
}

pub fn setup_full_test_client() -> Client {
    INIT.call_once(|| {
        dotenv::dotenv().ok();
        std::env::set_var("RUST_LOG", "debug");
        env_logger::try_init().ok();
    });

    // Create full rocket instance (requires database)
    let rocket = github_trending_summarizer::rocket();
    Client::tracked(rocket).expect("valid rocket instance")
}

#[allow(dead_code)]
pub fn setup_test_database() {
    // This would set up a test database with sample data
    // For now, we'll rely on the existing database setup
    // In a real implementation, you'd want to use a separate test database
    // and seed it with known test data
}
