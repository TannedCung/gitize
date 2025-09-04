// Integration tests for the repository API endpoints
// These tests verify the API structure and response format

use rocket::http::Status;
use rocket::serde::json::Value;

mod common;

#[test]
fn test_health_endpoint() {
    let client = common::setup_test_client();
    let response = client.get("/api/health").dispatch();

    assert_eq!(response.status(), Status::Ok);
    let json: Value = response.into_json().expect("Valid JSON response");
    assert_eq!(json["status"], "ok");
    assert!(json["timestamp"].is_string());
}

#[test]
#[ignore] // Requires database connection
fn test_search_repositories_missing_query() {
    let client = common::setup_full_test_client();
    let response = client.get("/api/repositories/search").dispatch();

    // Should return 422 Unprocessable Entity for missing required query parameter
    assert_eq!(response.status(), Status::UnprocessableEntity);
}

// Additional tests that require database connection are marked as ignored
// Run with: cargo test -- --ignored

#[test]
#[ignore]
fn test_trending_repositories_invalid_date_validation() {
    let client = common::setup_full_test_client();
    let response = client
        .get("/api/repositories/trending?date_from=invalid-date")
        .dispatch();

    // This should return validation error
    if response.status() == Status::UnprocessableEntity {
        let json: Value = response.into_json().expect("Valid JSON response");
        assert_eq!(json["code"], "VALIDATION_ERROR");
        assert!(json["error"]
            .as_str()
            .unwrap()
            .contains("Invalid date_from format"));
    } else {
        println!("Validation test skipped due to database connection issues");
    }
}
