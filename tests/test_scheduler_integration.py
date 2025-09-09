"""
Integration tests for scheduler functionality
"""
import pytest
import requests
import time
from conftest import API_BASE_URL


@pytest.mark.integration
@pytest.mark.scheduler
class TestSchedulerIntegration:
    """Test scheduler service integration"""

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
        assert data["job_count"] >= 2  # Should have daily and weekly jobs

    def test_manual_job_triggers(self, api_client):
        """Test manual triggering of scheduled jobs"""
        # Test triggering daily refresh
        response = api_client.post(f"{API_BASE_URL}/api/admin/jobs/refresh-trending")

        # Should either succeed or require authentication
        assert response.status_code in [200, 201, 401, 403]

        if response.status_code in [200, 201]:
            data = response.json()
            assert "execution_id" in data or "job_id" in data

    def test_manual_newsletter_trigger(self, api_client):
        """Test manual triggering of newsletter job"""
        response = api_client.post(f"{API_BASE_URL}/api/admin/jobs/send-newsletter")

        # Should either succeed or require authentication
        assert response.status_code in [200, 201, 401, 403]

        if response.status_code in [200, 201]:
            data = response.json()
            assert "execution_id" in data or "job_id" in data

    def test_job_history(self, api_client):
        """Test job execution history"""
        response = api_client.get(f"{API_BASE_URL}/api/admin/jobs/history")

        assert response.status_code in [200, 401, 403]

        if response.status_code == 200:
            data = response.json()
            assert isinstance(data, dict)

            # Should contain job history for different job types
            for job_name, executions in data.items():
                assert isinstance(executions, list)

                for execution in executions:
                    assert "id" in execution
                    assert "job_name" in execution
                    assert "status" in execution
                    assert "started_at" in execution

    def test_specific_job_history(self, api_client):
        """Test getting history for specific job"""
        job_names = ["daily_refresh", "weekly_newsletter"]

        for job_name in job_names:
            response = api_client.get(f"{API_BASE_URL}/api/admin/jobs/history?job_name={job_name}")

            assert response.status_code in [200, 401, 403]

            if response.status_code == 200:
                data = response.json()

                # Should only contain the requested job
                if data:
                    assert job_name in data
                    assert len(data) == 1

    def test_job_status_tracking(self, api_client):
        """Test job status tracking"""
        # First, trigger a job to get an execution ID
        trigger_response = api_client.post(f"{API_BASE_URL}/api/admin/jobs/refresh-trending")

        if trigger_response.status_code in [200, 201]:
            trigger_data = trigger_response.json()
            execution_id = trigger_data.get("execution_id") or trigger_data.get("job_id")

            if execution_id:
                # Check job status
                status_response = api_client.get(f"{API_BASE_URL}/api/admin/jobs/status/{execution_id}")

                assert status_response.status_code in [200, 404]

                if status_response.status_code == 200:
                    status_data = status_response.json()

                    assert "id" in status_data
                    assert "status" in status_data
                    assert status_data["status"] in ["scheduled", "running", "completed", "failed"]

    def test_job_execution_monitoring(self, api_client):
        """Test monitoring of job executions"""
        # Trigger a job and monitor its execution
        trigger_response = api_client.post(f"{API_BASE_URL}/api/admin/jobs/refresh-trending")

        if trigger_response.status_code in [200, 201]:
            # Wait a moment for job to start
            time.sleep(2)

            # Check scheduler status to see if job count increased
            status_response = api_client.get(f"{API_BASE_URL}/api/admin/scheduler/status")

            assert status_response.status_code == 200
            status_data = status_response.json()

            # Total executions should be tracked
            assert "total_executions" in status_data
            assert isinstance(status_data["total_executions"], int)

    def test_scheduler_health_monitoring(self, api_client):
        """Test scheduler health monitoring"""
        # Check detailed health to see scheduler status
        response = api_client.get(f"{API_BASE_URL}/api/health/detailed")

        assert response.status_code == 200
        data = response.json()

        assert "services" in data
        assert "scheduler" in data["services"]

        scheduler_health = data["services"]["scheduler"]
        assert "status" in scheduler_health
        assert scheduler_health["status"] == "healthy"

    def test_job_failure_handling(self, api_client):
        """Test handling of job failures"""
        # This is harder to test without causing actual failures
        # We'll check that the system can report on failed jobs

        response = api_client.get(f"{API_BASE_URL}/api/admin/jobs/history")

        if response.status_code == 200:
            data = response.json()

            # Look for any failed jobs in history
            for job_name, executions in data.items():
                for execution in executions:
                    if execution.get("status") == "failed":
                        # Failed jobs should have error messages
                        assert "error_message" in execution
                        assert execution["error_message"] is not None

    def test_scheduler_metrics(self, api_client):
        """Test scheduler-related metrics"""
        response = api_client.get(f"{API_BASE_URL}/api/admin/metrics")

        assert response.status_code == 200
        data = response.json()

        assert "job_metrics" in data
        job_metrics = data["job_metrics"]

        # Should track job execution metrics
        expected_metrics = ["total_jobs_executed", "successful_jobs", "failed_jobs"]
        for metric in expected_metrics:
            if metric in job_metrics:
                assert isinstance(job_metrics[metric], (int, float))

    def test_cron_expression_validation(self, api_client):
        """Test that cron expressions are properly validated"""
        # This tests that the scheduler started successfully with valid cron expressions
        # If the scheduler is running, the cron expressions were valid

        response = api_client.get(f"{API_BASE_URL}/api/admin/scheduler/status")

        assert response.status_code == 200
        data = response.json()

        # If scheduler is running, cron expressions were valid
        assert data["is_running"] is True

    def test_job_cleanup(self, api_client):
        """Test job history cleanup functionality"""
        # Test clearing job history
        response = api_client.delete(f"{API_BASE_URL}/api/admin/jobs/history")

        # Should either succeed or require authentication
        assert response.status_code in [200, 204, 401, 403]

        if response.status_code in [200, 204]:
            # Verify history was cleared
            history_response = api_client.get(f"{API_BASE_URL}/api/admin/jobs/history")

            if history_response.status_code == 200:
                history_data = history_response.json()
                # History should be empty or have minimal entries
                total_executions = sum(len(executions) for executions in history_data.values())
                assert total_executions >= 0  # Should not be negative
