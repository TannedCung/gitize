use github_trending_summarizer::rocket;
use rocket::http::{ContentType, Status};
use rocket::local::asynchronous::Client;
use serde_json::json;

#[tokio::test]
async fn test_referral_flow_integration() {
    let client = Client::tracked(rocket())
        .await
        .expect("valid rocket instance");

    // Test referral code validation endpoint
    let response = client
        .get("/api/referral/validate/TESTCODE123")
        .dispatch()
        .await;

    assert_eq!(response.status(), Status::Ok);

    let json_response: serde_json::Value = response.into_json().await.expect("valid json");
    assert_eq!(json_response["referral_code"], "TESTCODE123");
    // The valid field will be false since we don't have test data
    assert_eq!(json_response["valid"], false);
}

#[tokio::test]
async fn test_track_referral_click() {
    let client = Client::tracked(rocket())
        .await
        .expect("valid rocket instance");

    let track_request = json!({
        "referral_code": "TESTCODE123",
        "source": "twitter",
        "user_agent": "Mozilla/5.0",
        "ip_address": "192.168.1.1"
    });

    let response = client
        .post("/api/referral/track")
        .header(ContentType::JSON)
        .json(&track_request)
        .dispatch()
        .await;

    // This will fail because the referral code doesn't exist in test data
    // But it tests that the endpoint is properly configured
    assert_eq!(response.status(), Status::BadRequest);
}

#[tokio::test]
async fn test_social_sharing_urls() {
    let client = Client::tracked(rocket())
        .await
        .expect("valid rocket instance");

    let response = client
        .get("/api/referral/social-sharing/TESTCODE123?base_url=https://example.com")
        .dispatch()
        .await;

    assert_eq!(response.status(), Status::Ok);

    let json_response: serde_json::Value = response.into_json().await.expect("valid json");
    assert_eq!(json_response["referral_code"], "TESTCODE123");
    assert_eq!(json_response["base_url"], "https://example.com");

    let sharing_urls = json_response["sharing_urls"]
        .as_object()
        .expect("sharing_urls object");
    assert!(sharing_urls.contains_key("twitter"));
    assert!(sharing_urls.contains_key("linkedin"));
    assert!(sharing_urls.contains_key("facebook"));
    assert!(sharing_urls.contains_key("reddit"));

    // Check that URLs contain the referral code
    for (_, url) in sharing_urls {
        let url_str = url.as_str().expect("url string");
        assert!(url_str.contains("TESTCODE123"));
    }
}

#[tokio::test]
async fn test_referral_endpoints_require_auth() {
    let client = Client::tracked(rocket())
        .await
        .expect("valid rocket instance");

    // Test that protected endpoints require authentication
    let protected_endpoints = vec![
        "/api/referral/stats",
        "/api/referral/dashboard",
        "/api/referral/attribution",
    ];

    for endpoint in protected_endpoints {
        let response = client.get(endpoint).dispatch().await;
        assert_eq!(response.status(), Status::Unauthorized);
    }
}
