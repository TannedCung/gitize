"""
Integration tests for repositories API endpoints
"""
import pytest
import requests
from conftest import API_BASE_URL


@pytest.mark.integration
@pytest.mark.api
class TestRepositoriesAPI:
    """Test repository-related API endpoints"""

    def test_get_trending_repositories(self, api_client):
        """Test fetching trending repositories"""
        response = api_client.get(f"{API_BASE_URL}/api/repositories/trending")

        assert response.status_code == 200
        data = response.json()

        assert "repositories" in data
        assert "total_count" in data
        assert "page" in data
        assert "per_page" in data
        assert isinstance(data["repositories"], list)

    def test_get_trending_repositories_with_language_filter(self, api_client):
        """Test fetching trending repositories with language filter"""
        response = api_client.get(f"{API_BASE_URL}/api/repositories/trending?language=Python")

        assert response.status_code == 200
        data = response.json()

        assert "repositories" in data
        # If there are repositories, they should match the language filter
        for repo in data["repositories"]:
            if repo.get("language"):
                assert repo["language"].lower() == "python"

    def test_get_trending_repositories_with_pagination(self, api_client):
        """Test pagination in trending repositories"""
        # Test first page
        response1 = api_client.get(f"{API_BASE_URL}/api/repositories/trending?page=1&per_page=5")
        assert response1.status_code == 200
        data1 = response1.json()

        # Test second page
        response2 = api_client.get(f"{API_BASE_URL}/api/repositories/trending?page=2&per_page=5")
        assert response2.status_code == 200
        data2 = response2.json()

        # Pages should have different content (if there's enough data)
        if data1["total_count"] > 5:
            assert data1["repositories"] != data2["repositories"]

    def test_search_repositories(self, api_client):
        """Test repository search functionality"""
        response = api_client.get(f"{API_BASE_URL}/api/repositories/search?q=python")

        assert response.status_code == 200
        data = response.json()

        assert "repositories" in data
        assert "total_count" in data
        assert isinstance(data["repositories"], list)

    def test_advanced_search_repositories(self, api_client):
        """Test advanced repository search"""
        params = {
            "q": "machine learning",
            "language": "Python",
            "min_stars": "100",
            "sort": "stars",
            "order": "desc"
        }

        response = api_client.get(f"{API_BASE_URL}/api/repositories/search/advanced", params=params)

        assert response.status_code == 200
        data = response.json()

        assert "repositories" in data
        assert "search_metadata" in data

        # Check that results match search criteria
        for repo in data["repositories"]:
            if repo.get("stars"):
                assert repo["stars"] >= 100
            if repo.get("language"):
                assert repo["language"].lower() == "python"

    def test_repository_data_structure(self, api_client):
        """Test that repository data has the expected structure"""
        response = api_client.get(f"{API_BASE_URL}/api/repositories/trending?per_page=1")

        assert response.status_code == 200
        data = response.json()

        if data["repositories"]:
            repo = data["repositories"][0]

            # Check required fields
            required_fields = ["name", "full_name", "html_url", "description"]
            for field in required_fields:
                assert field in repo

            # Check optional but expected fields
            expected_fields = ["stars", "language", "created_at", "updated_at"]
            for field in expected_fields:
                # Field should exist, but can be null
                assert field in repo

    def test_invalid_search_parameters(self, api_client):
        """Test handling of invalid search parameters"""
        # Test with invalid language
        response = api_client.get(f"{API_BASE_URL}/api/repositories/search?language=InvalidLanguage123")
        assert response.status_code == 200  # Should return empty results, not error

        # Test with invalid pagination
        response = api_client.get(f"{API_BASE_URL}/api/repositories/trending?page=-1")
        assert response.status_code in [200, 400]  # Should handle gracefully

        # Test with invalid per_page
        response = api_client.get(f"{API_BASE_URL}/api/repositories/trending?per_page=0")
        assert response.status_code in [200, 400]  # Should handle gracefully

    def test_empty_search_query(self, api_client):
        """Test search with empty query"""
        response = api_client.get(f"{API_BASE_URL}/api/repositories/search?q=")

        # Should handle empty query gracefully
        assert response.status_code in [200, 400]

    def test_repository_caching(self, api_client):
        """Test that repository data is properly cached"""
        # Make two identical requests
        response1 = api_client.get(f"{API_BASE_URL}/api/repositories/trending?per_page=5")
        response2 = api_client.get(f"{API_BASE_URL}/api/repositories/trending?per_page=5")

        assert response1.status_code == 200
        assert response2.status_code == 200

        # Responses should be identical (cached)
        assert response1.json() == response2.json()

        # Second request should be faster (this is hard to test reliably)
        # We'll just check that both requests succeeded

    def test_repository_sorting(self, api_client):
        """Test repository sorting functionality"""
        # Test sorting by stars
        response = api_client.get(f"{API_BASE_URL}/api/repositories/trending?sort=stars&order=desc&per_page=10")

        assert response.status_code == 200
        data = response.json()

        if len(data["repositories"]) > 1:
            # Check that repositories are sorted by stars in descending order
            stars = [repo.get("stars", 0) for repo in data["repositories"]]
            assert stars == sorted(stars, reverse=True)

    def test_repository_language_filtering(self, api_client):
        """Test filtering repositories by programming language"""
        languages = ["Python", "JavaScript", "Go", "Rust"]

        for language in languages:
            response = api_client.get(f"{API_BASE_URL}/api/repositories/trending?language={language}")

            assert response.status_code == 200
            data = response.json()

            # All returned repositories should match the language filter
            for repo in data["repositories"]:
                if repo.get("language"):
                    assert repo["language"].lower() == language.lower()
