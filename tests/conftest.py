"""
Pytest configuration and fixtures for integration tests
"""
import os
import asyncio
import pytest
import requests
import psycopg2
import redis
from typing import Generator, Dict, Any
from urllib.parse import urlparse
import time

# Test configuration
API_BASE_URL = os.getenv("API_BASE_URL", "http://localhost:8001")
FRONTEND_BASE_URL = os.getenv("FRONTEND_BASE_URL", "http://localhost:3001")
DATABASE_URL = os.getenv("DATABASE_URL", "postgres://postgres:test_password@localhost:5435/github_trending_summarizer_test")
REDIS_URL = os.getenv("REDIS_URL", "redis://localhost:6380")

# Timeouts
SERVICE_STARTUP_TIMEOUT = 120  # seconds
REQUEST_TIMEOUT = 30  # seconds


@pytest.fixture(scope="session")
def event_loop():
    """Create an instance of the default event loop for the test session."""
    loop = asyncio.get_event_loop_policy().new_event_loop()
    yield loop
    loop.close()


@pytest.fixture(scope="session")
def api_client():
    """HTTP client for API testing"""
    session = requests.Session()
    session.timeout = REQUEST_TIMEOUT
    yield session
    session.close()


@pytest.fixture(scope="session")
def database_connection():
    """Database connection for direct database testing"""
    parsed_url = urlparse(DATABASE_URL)
    conn = psycopg2.connect(
        host=parsed_url.hostname,
        port=parsed_url.port or 5432,
        database=parsed_url.path[1:],  # Remove leading slash
        user=parsed_url.username,
        password=parsed_url.password
    )
    yield conn
    conn.close()


@pytest.fixture(scope="session")
def redis_client():
    """Redis client for cache testing"""
    parsed_url = urlparse(REDIS_URL)
    client = redis.Redis(
        host=parsed_url.hostname,
        port=parsed_url.port or 6379,
        decode_responses=True
    )
    yield client
    client.close()


@pytest.fixture(scope="session", autouse=True)
def wait_for_services():
    """Wait for all services to be healthy before running tests"""
    print("Waiting for services to be ready...")

    # Wait for backend API
    wait_for_service(f"{API_BASE_URL}/api/health", "Backend API")

    # Wait for frontend
    wait_for_service(FRONTEND_BASE_URL, "Frontend")

    # Wait for database
    wait_for_database()

    # Wait for Redis
    wait_for_redis()

    print("All services are ready!")


def wait_for_service(url: str, service_name: str, timeout: int = SERVICE_STARTUP_TIMEOUT):
    """Wait for a service to respond to HTTP requests"""
    start_time = time.time()
    while time.time() - start_time < timeout:
        try:
            response = requests.get(url, timeout=5)
            if response.status_code < 500:  # Accept any non-server-error response
                print(f"✓ {service_name} is ready")
                return
        except requests.exceptions.RequestException:
            pass

        time.sleep(2)

    raise TimeoutError(f"Service {service_name} did not become ready within {timeout} seconds")


def wait_for_database(timeout: int = SERVICE_STARTUP_TIMEOUT):
    """Wait for database to be ready"""
    start_time = time.time()
    while time.time() - start_time < timeout:
        try:
            parsed_url = urlparse(DATABASE_URL)
            conn = psycopg2.connect(
                host=parsed_url.hostname,
                port=parsed_url.port or 5432,
                database=parsed_url.path[1:],
                user=parsed_url.username,
                password=parsed_url.password,
                connect_timeout=5
            )
            conn.close()
            print("✓ Database is ready")
            return
        except psycopg2.OperationalError:
            pass

        time.sleep(2)

    raise TimeoutError(f"Database did not become ready within {timeout} seconds")


def wait_for_redis(timeout: int = SERVICE_STARTUP_TIMEOUT):
    """Wait for Redis to be ready"""
    start_time = time.time()
    while time.time() - start_time < timeout:
        try:
            parsed_url = urlparse(REDIS_URL)
            client = redis.Redis(
                host=parsed_url.hostname,
                port=parsed_url.port or 6379,
                socket_connect_timeout=5
            )
            client.ping()
            client.close()
            print("✓ Redis is ready")
            return
        except (redis.ConnectionError, redis.TimeoutError):
            pass

        time.sleep(2)

    raise TimeoutError(f"Redis did not become ready within {timeout} seconds")


@pytest.fixture
def sample_repository_data():
    """Sample repository data for testing"""
    return {
        "name": "test-repo",
        "full_name": "testuser/test-repo",
        "description": "A test repository for integration testing",
        "html_url": "https://github.com/testuser/test-repo",
        "stars": 100,
        "language": "Python",
        "created_at": "2024-01-01T00:00:00Z",
        "updated_at": "2024-01-02T00:00:00Z"
    }


@pytest.fixture
def sample_newsletter_subscription():
    """Sample newsletter subscription data for testing"""
    return {
        "email": "test@example.com",
        "preferences": {
            "languages": ["Python", "JavaScript"],
            "frequency": "weekly"
        }
    }


@pytest.fixture(autouse=True)
def cleanup_test_data(database_connection):
    """Clean up test data after each test"""
    yield

    # Clean up test data from database
    with database_connection.cursor() as cursor:
        # Clean up in reverse order of dependencies
        cursor.execute("DELETE FROM newsletter_subscriptions WHERE email LIKE '%test%' OR email LIKE '%example.com%'")
        cursor.execute("DELETE FROM repositories WHERE name LIKE '%test%'")
        database_connection.commit()


# Test markers
pytest.mark.integration = pytest.mark.integration
pytest.mark.api = pytest.mark.api
pytest.mark.frontend = pytest.mark.frontend
pytest.mark.database = pytest.mark.database
pytest.mark.scheduler = pytest.mark.scheduler
