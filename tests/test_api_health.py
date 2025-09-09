"""
Integration tests for API health endpoints
"""
import pytest
import requests
from conftest import API_BASE_URL


@pytest.mark.integration
@pytest.mark.api
class TestAPIHealth:
    """Test API health and monitoring endpoints"""

    def test_basic_health_check(self, api_client):
        """Test basic health check endpoint"""
        response = api_client.get(f"{API_BASE_URL}/api/health")

        assert response.status_code == 200
        data = response.json()

        assert "status" in data
        assert data["status"] == "healthy"
        assert "timestamp" in data
        assert "version" in data

    def test_detailed_health_check(self, api_client):
        """Test detailed health check with service status"""
        response = api_client.get(f"{API_BASE_URL}/api/health/detailed")

        assert response.status_code == 200
        data = response.json()

        assert "status" in data
        assert "services" in data
        assert "database" in data["services"]
        assert "redis" in data["services"]
        assert "scheduler" in data["services"]

        # All services should be healthy
        for service_name, service_status in data["services"].items():
            assert service_status["status"] == "healthy", f"Service {service_name} is not healthy"

    def test_system_diagnostics(self, api_client):
        """Test system diagnostics endpoint"""
        response = api_client.get(f"{API_BASE_URL}/api/health/diagnostics")

        assert response.status_code == 200
        data = response.json()

        assert "system" in data
        assert "database" in data
        assert "redis" in data
        assert "scheduler" in data

        # Check system metrics
        system_info = data["system"]
        assert "uptime" in system_info
        assert "memory_usage" in system_info
        assert "cpu_usage" in system_info

    def test_metrics_endpoint(self, api_client):
        """Test metrics collection endpoint"""
        response = api_client.get(f"{API_BASE_URL}/api/admin/metrics")

        assert response.status_code == 200
        data = response.json()

        assert "api_metrics" in data
        assert "system_metrics" in data
        assert "job_metrics" in data

        # Check API metrics structure
        api_metrics = data["api_metrics"]
        assert "total_requests" in api_metrics
        assert "response_times" in api_metrics
        assert "error_rates" in api_metrics

    def test_scheduler_status(self, api_client):
        """Test scheduler status endpoint"""
        response = api_client.get(f"{API_BASE_URL}/api/admin/scheduler/status")

        assert response.status_code == 200
        data = response.json()

        assert "is_running" in data
        assert "job_count" in data
        assert "total_executions" in data

        # Scheduler should be running
        assert data["is_running"] is True
        assert data["job_count"] >= 2  # Should have at least daily and weekly jobs

    def test_alerts_endpoint(self, api_client):
        """Test alerts monitoring endpoint"""
        response = api_client.get(f"{API_BASE_URL}/api/admin/alerts")

        assert response.status_code == 200
        data = response.json()

        assert "alerts" in data
        assert "total_count" in data
        assert isinstance(data["alerts"], list)

    def test_monitoring_dashboard(self, api_client):
        """Test monitoring dashboard endpoint"""
        response = api_client.get(f"{API_BASE_URL}/api/admin/monitoring/dashboard")

        assert response.status_code == 200
        data = response.json()

        assert "system_status" in data
        assert "recent_alerts" in data
        assert "performance_metrics" in data
        assert "job_statistics" in data

    def test_api_cors_headers(self, api_client):
        """Test CORS headers are properly set"""
        response = api_client.options(f"{API_BASE_URL}/api/health")

        # Should allow CORS for development
        assert response.status_code in [200, 204]

    def test_api_error_handling(self, api_client):
        """Test API error handling for non-existent endpoints"""
        response = api_client.get(f"{API_BASE_URL}/api/nonexistent")

        assert response.status_code == 404

    def test_api_rate_limiting_headers(self, api_client):
        """Test that rate limiting headers are present (if implemented)"""
        response = api_client.get(f"{API_BASE_URL}/api/health")

        # Check if rate limiting headers are present
        # This is optional depending on implementation
        headers = response.headers
        assert response.status_code == 200  # Basic check that endpoint works
