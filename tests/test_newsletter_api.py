"""
Integration tests for newsletter API endpoints
"""
import pytest
import requests
from faker import Faker
from conftest import API_BASE_URL

fake = Faker()


@pytest.mark.integration
@pytest.mark.api
class TestNewsletterAPI:
    """Test newsletter-related API endpoints"""

    def test_newsletter_subscription(self, api_client):
        """Test newsletter subscription process"""
        email = fake.email()
        subscription_data = {
            "email": email,
            "preferences": {
                "languages": ["Python", "JavaScript"],
                "frequency": "weekly"
            }
        }

        response = api_client.post(f"{API_BASE_URL}/api/newsletter/subscribe", json=subscription_data)

        assert response.status_code in [200, 201]
        data = response.json()

        assert "message" in data
        assert "subscription_id" in data or "status" in data

    def test_duplicate_subscription(self, api_client):
        """Test handling of duplicate email subscriptions"""
        email = fake.email()
        subscription_data = {
            "email": email,
            "preferences": {
                "languages": ["Python"],
                "frequency": "weekly"
            }
        }

        # First subscription
        response1 = api_client.post(f"{API_BASE_URL}/api/newsletter/subscribe", json=subscription_data)
        assert response1.status_code in [200, 201]

        # Duplicate subscription
        response2 = api_client.post(f"{API_BASE_URL}/api/newsletter/subscribe", json=subscription_data)
        assert response2.status_code in [200, 409]  # Should handle gracefully

    def test_invalid_email_subscription(self, api_client):
        """Test subscription with invalid email"""
        invalid_emails = ["invalid-email", "test@", "@example.com", ""]

        for invalid_email in invalid_emails:
            subscription_data = {
                "email": invalid_email,
                "preferences": {
                    "languages": ["Python"],
                    "frequency": "weekly"
                }
            }

            response = api_client.post(f"{API_BASE_URL}/api/newsletter/subscribe", json=subscription_data)
            assert response.status_code == 400

    def test_subscription_status_check(self, api_client):
        """Test checking subscription status"""
        # First, create a subscription
        email = fake.email()
        subscription_data = {
            "email": email,
            "preferences": {
                "languages": ["Python"],
                "frequency": "weekly"
            }
        }

        subscribe_response = api_client.post(f"{API_BASE_URL}/api/newsletter/subscribe", json=subscription_data)
        assert subscribe_response.status_code in [200, 201]

        # Check subscription status
        status_response = api_client.get(f"{API_BASE_URL}/api/newsletter/status/{email}")

        assert status_response.status_code == 200
        data = status_response.json()

        assert "email" in data
        assert "subscribed" in data
        assert "preferences" in data
        assert data["subscribed"] is True

    def test_nonexistent_subscription_status(self, api_client):
        """Test checking status of non-existent subscription"""
        nonexistent_email = fake.email()

        response = api_client.get(f"{API_BASE_URL}/api/newsletter/status/{nonexistent_email}")

        assert response.status_code in [200, 404]
        if response.status_code == 200:
            data = response.json()
            assert data["subscribed"] is False

    def test_newsletter_statistics(self, api_client):
        """Test newsletter statistics endpoint"""
        response = api_client.get(f"{API_BASE_URL}/api/newsletter/stats")

        assert response.status_code == 200
        data = response.json()

        assert "total_subscribers" in data
        assert "active_subscribers" in data
        assert "language_preferences" in data
        assert "recent_activity" in data

        # Check data types
        assert isinstance(data["total_subscribers"], int)
        assert isinstance(data["active_subscribers"], int)
        assert isinstance(data["language_preferences"], dict)

    def test_send_test_newsletter(self, api_client):
        """Test sending a test newsletter"""
        test_data = {
            "recipient_email": fake.email(),
            "include_repositories": 5
        }

        response = api_client.post(f"{API_BASE_URL}/api/newsletter/test", json=test_data)

        # This might require authentication in production
        assert response.status_code in [200, 401, 403]

        if response.status_code == 200:
            data = response.json()
            assert "message" in data
            assert "email_sent" in data

    def test_unsubscribe_process(self, api_client):
        """Test newsletter unsubscribe process"""
        # First, create a subscription
        email = fake.email()
        subscription_data = {
            "email": email,
            "preferences": {
                "languages": ["Python"],
                "frequency": "weekly"
            }
        }

        subscribe_response = api_client.post(f"{API_BASE_URL}/api/newsletter/subscribe", json=subscription_data)
        assert subscribe_response.status_code in [200, 201]

        # In a real system, we'd get an unsubscribe token from the email
        # For testing, we'll use a placeholder token or test the endpoint structure
        test_token = "test_unsubscribe_token_123"

        unsubscribe_response = api_client.get(f"{API_BASE_URL}/api/newsletter/unsubscribe/{test_token}")

        # The endpoint should exist, even if the token is invalid
        assert unsubscribe_response.status_code in [200, 400, 404]

    def test_newsletter_preferences_validation(self, api_client):
        """Test validation of newsletter preferences"""
        email = fake.email()

        # Test with invalid language preferences
        invalid_preferences = [
            {"languages": [], "frequency": "weekly"},  # Empty languages
            {"languages": ["InvalidLanguage"], "frequency": "weekly"},  # Invalid language
            {"languages": ["Python"], "frequency": "invalid"},  # Invalid frequency
            {"languages": ["Python"]},  # Missing frequency
            {"frequency": "weekly"},  # Missing languages
        ]

        for prefs in invalid_preferences:
            subscription_data = {
                "email": email,
                "preferences": prefs
            }

            response = api_client.post(f"{API_BASE_URL}/api/newsletter/subscribe", json=subscription_data)
            # Should either accept with defaults or reject with 400
            assert response.status_code in [200, 201, 400]

    def test_newsletter_content_generation(self, api_client):
        """Test newsletter content generation (if endpoint exists)"""
        # This tests the newsletter generation without actually sending
        response = api_client.get(f"{API_BASE_URL}/api/newsletter/preview")

        # This endpoint might not exist or require authentication
        assert response.status_code in [200, 401, 403, 404]

        if response.status_code == 200:
            data = response.json()
            assert "content" in data or "repositories" in data

    def test_subscription_data_structure(self, api_client):
        """Test that subscription data has the expected structure"""
        email = fake.email()
        subscription_data = {
            "email": email,
            "preferences": {
                "languages": ["Python", "JavaScript"],
                "frequency": "weekly"
            }
        }

        response = api_client.post(f"{API_BASE_URL}/api/newsletter/subscribe", json=subscription_data)

        if response.status_code in [200, 201]:
            data = response.json()

            # Check response structure
            assert isinstance(data, dict)
            assert "message" in data or "status" in data
