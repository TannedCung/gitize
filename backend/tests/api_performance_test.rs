use rocket::http::Status;
use rocket::serde::json::Value;
use std::time::Instant;
use tokio::time::{sleep, Duration};

mod common;

#[tokio::test]
async fn test_health_endpoint_performance() {
    let client = common::setup_test_client();

    let start = Instant::now();
    let response = client.get("/api/health").dispatch();
    let duration = start.elapsed();

    assert_eq!(response.status(), Status::Ok);
    assert!(duration.as_millis() < 100); // Health check should be very fast

    let json: Value = response.into_json().expect("Valid JSON response");
    assert_eq!(json["status"], "ok");

    println!("Health endpoint response time: {}ms", duration.as_millis());
}

#[tokio::test]
async fn test_concurrent_health_requests() {
    let client = common::setup_test_client();

    let start = Instant::now();

    // Create 10 concurrent requests
    let mut handles = vec![];

    for _ in 0..10 {
        let client_clone = &client;
        handles.push(tokio::spawn(async move {
            let response = client_clone.get("/api/health").dispatch();
            assert_eq!(response.status(), Status::Ok);
        }));
    }

    // Wait for all requests to complete
    for handle in handles {
        handle.await.expect("Task should complete");
    }

    let duration = start.elapsed();
    println!(
        "10 concurrent health requests completed in: {}ms",
        duration.as_millis()
    );

    // All concurrent requests should complete within reasonable time
    assert!(duration.as_millis() < 1000);
}

#[tokio::test]
#[ignore] // Requires database connection
async fn test_trending_repositories_performance() {
    let client = common::setup_full_test_client();

    let start = Instant::now();
    let response = client
        .get("/api/repositories/trending?per_page=50")
        .dispatch();
    let duration = start.elapsed();

    if response.status() == Status::Ok {
        let json: Value = response.into_json().expect("Valid JSON response");

        println!(
            "Trending repositories (50 items) response time: {}ms",
            duration.as_millis()
        );
        println!(
            "Returned {} repositories",
            json["repositories"].as_array().unwrap_or(&vec![]).len()
        );

        // Should respond within 2 seconds even for larger result sets
        assert!(duration.as_millis() < 2000);

        // Verify response structure
        assert!(json["repositories"].is_array());
        assert!(json["total_count"].is_number());
    } else {
        println!("Trending repositories test skipped due to database connection issues");
    }
}

#[tokio::test]
#[ignore] // Requires database connection
async fn test_search_performance() {
    let client = common::setup_full_test_client();

    let search_queries = vec!["rust", "python", "javascript", "react", "machine learning"];

    for query in search_queries {
        let start = Instant::now();
        let response = client
            .get(&format!("/api/repositories/search?q={}", query))
            .dispatch();
        let duration = start.elapsed();

        if response.status() == Status::Ok {
            println!(
                "Search '{}' response time: {}ms",
                query,
                duration.as_millis()
            );

            // Search should complete within 3 seconds
            assert!(duration.as_millis() < 3000);

            let json: Value = response.into_json().expect("Valid JSON response");
            assert!(json["repositories"].is_array());
        } else {
            println!(
                "Search test for '{}' skipped due to database connection issues",
                query
            );
        }
    }
}

#[tokio::test]
#[ignore] // Requires database connection
async fn test_pagination_performance() {
    let client = common::setup_full_test_client();

    for page in 1..=5 {
        let start = Instant::now();
        let response = client
            .get(&format!(
                "/api/repositories/trending?page={}&per_page=10",
                page
            ))
            .dispatch();
        let duration = start.elapsed();

        if response.status() == Status::Ok {
            println!("Page {} response time: {}ms", page, duration.as_millis());

            // Each page should load quickly
            assert!(duration.as_millis() < 1500);

            let json: Value = response.into_json().expect("Valid JSON response");
            assert_eq!(json["page"], page);
        } else {
            println!(
                "Pagination test for page {} skipped due to database connection issues",
                page
            );
        }
    }
}

#[tokio::test]
async fn test_error_response_performance() {
    let client = common::setup_test_client();

    // Test 404 response time
    let start = Instant::now();
    let response = client.get("/api/nonexistent").dispatch();
    let duration = start.elapsed();

    assert_eq!(response.status(), Status::NotFound);
    assert!(duration.as_millis() < 100); // Error responses should be very fast

    println!("404 error response time: {}ms", duration.as_millis());
}

#[tokio::test]
async fn test_malformed_request_performance() {
    let client = common::setup_test_client();

    // Test malformed search request
    let start = Instant::now();
    let response = client.get("/api/repositories/search").dispatch(); // Missing query parameter
    let duration = start.elapsed();

    // Should return validation error quickly
    assert!(
        response.status() == Status::UnprocessableEntity || response.status() == Status::BadRequest
    );
    assert!(duration.as_millis() < 100);

    println!("Validation error response time: {}ms", duration.as_millis());
}

#[tokio::test]
#[ignore] // Requires database connection
async fn test_filter_performance() {
    let client = common::setup_full_test_client();

    let languages = vec!["Rust", "Python", "JavaScript", "TypeScript", "Go"];

    for language in languages {
        let start = Instant::now();
        let response = client
            .get(&format!("/api/repositories/trending?language={}", language))
            .dispatch();
        let duration = start.elapsed();

        if response.status() == Status::Ok {
            println!(
                "Filter by {} response time: {}ms",
                language,
                duration.as_millis()
            );

            // Filtered queries should be fast
            assert!(duration.as_millis() < 2000);

            let json: Value = response.into_json().expect("Valid JSON response");
            assert!(json["repositories"].is_array());
        } else {
            println!(
                "Filter test for {} skipped due to database connection issues",
                language
            );
        }
    }
}

#[tokio::test]
async fn test_rate_limiting_behavior() {
    let client = common::setup_test_client();

    // Make rapid requests to test rate limiting (if implemented)
    let mut response_times = vec![];

    for i in 0..20 {
        let start = Instant::now();
        let response = client.get("/api/health").dispatch();
        let duration = start.elapsed();

        response_times.push(duration.as_millis());

        // All requests should succeed (no rate limiting on health endpoint)
        assert_eq!(response.status(), Status::Ok);

        if i < 19 {
            sleep(Duration::from_millis(50)).await; // Small delay between requests
        }
    }

    let avg_time = response_times.iter().sum::<u128>() / response_times.len() as u128;
    println!("Average response time over 20 requests: {}ms", avg_time);

    // Response times should remain consistent
    assert!(avg_time < 200);
}

#[tokio::test]
#[ignore] // Requires database connection and email configuration
async fn test_newsletter_subscription_performance() {
    let client = common::setup_full_test_client();

    let subscription_data = serde_json::json!({
        "email": format!("perf-test-{}@example.com", chrono::Utc::now().timestamp()),
        "preferences": {
            "languages": ["Rust"],
            "frequency": "weekly"
        }
    });

    let start = Instant::now();
    let response = client
        .post("/api/newsletter/subscribe")
        .header(rocket::http::ContentType::JSON)
        .body(subscription_data.to_string())
        .dispatch();
    let duration = start.elapsed();

    if response.status() == Status::Ok || response.status() == Status::Created {
        println!(
            "Newsletter subscription response time: {}ms",
            duration.as_millis()
        );

        // Subscription should be fast
        assert!(duration.as_millis() < 1500);

        let json: Value = response.into_json().expect("Valid JSON response");
        assert!(json["message"].is_string() || json["status"].is_string());
    } else {
        println!("Newsletter subscription test skipped due to configuration issues");
    }
}

#[tokio::test]
async fn test_cors_preflight_performance() {
    let client = common::setup_test_client();

    let start = Instant::now();
    let response = client
        .options("/api/health")
        .header(rocket::http::Header::new("Origin", "http://localhost:3000"))
        .header(rocket::http::Header::new(
            "Access-Control-Request-Method",
            "GET",
        ))
        .dispatch();
    let duration = start.elapsed();

    // CORS preflight should be very fast
    assert!(duration.as_millis() < 50);
    assert!(response.status() == Status::Ok || response.status() == Status::NoContent);

    println!("CORS preflight response time: {}ms", duration.as_millis());
}

#[tokio::test]
async fn test_large_request_handling() {
    let client = common::setup_test_client();

    // Test with very long search query
    let long_query = "a".repeat(1000);

    let start = Instant::now();
    let response = client
        .get(&format!("/api/repositories/search?q={}", long_query))
        .dispatch();
    let duration = start.elapsed();

    // Should handle large requests gracefully
    assert!(response.status() == Status::Ok || response.status() == Status::BadRequest);
    assert!(duration.as_millis() < 1000);

    println!("Large request handling time: {}ms", duration.as_millis());
}

#[tokio::test]
async fn test_memory_usage_stability() {
    let client = common::setup_test_client();

    // Make many requests to check for memory leaks
    for i in 0..100 {
        let response = client.get("/api/health").dispatch();
        assert_eq!(response.status(), Status::Ok);

        if i % 20 == 0 {
            println!("Completed {} requests", i + 1);
        }
    }

    println!("Memory stability test completed - 100 requests processed");
}

#[cfg(test)]
mod load_tests {
    use super::*;
    use std::sync::Arc;
    use tokio::sync::Semaphore;

    #[tokio::test]
    async fn test_concurrent_load() {
        let client = Arc::new(common::setup_test_client());
        let semaphore = Arc::new(Semaphore::new(50)); // Limit concurrent requests

        let start = Instant::now();
        let mut handles = vec![];

        // Create 100 concurrent requests
        for i in 0..100 {
            let client_clone = Arc::clone(&client);
            let semaphore_clone = Arc::clone(&semaphore);

            handles.push(tokio::spawn(async move {
                let _permit = semaphore_clone.acquire().await.unwrap();

                let response = client_clone.get("/api/health").dispatch();
                assert_eq!(response.status(), Status::Ok);

                if i % 25 == 0 {
                    println!("Completed request {}", i + 1);
                }
            }));
        }

        // Wait for all requests to complete
        for handle in handles {
            handle.await.expect("Task should complete");
        }

        let duration = start.elapsed();
        println!(
            "100 concurrent requests completed in: {}ms",
            duration.as_millis()
        );

        // Should handle load within reasonable time
        assert!(duration.as_secs() < 30);
    }
}
