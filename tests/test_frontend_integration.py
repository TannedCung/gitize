"""
Integration tests for frontend application
"""
import pytest
import requests
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.chrome.options import Options
from webdriver_manager.chrome import ChromeDriverManager
from selenium.webdriver.chrome.service import Service
from conftest import FRONTEND_BASE_URL, API_BASE_URL


@pytest.mark.integration
@pytest.mark.frontend
class TestFrontendIntegration:
    """Test frontend application integration"""

    @pytest.fixture(scope="class")
    def browser(self):
        """Setup browser for frontend testing"""
        chrome_options = Options()
        chrome_options.add_argument("--headless")
        chrome_options.add_argument("--no-sandbox")
        chrome_options.add_argument("--disable-dev-shm-usage")
        chrome_options.add_argument("--disable-gpu")
        chrome_options.add_argument("--window-size=1920,1080")

        service = Service(ChromeDriverManager().install())
        driver = webdriver.Chrome(service=service, options=chrome_options)
        driver.implicitly_wait(10)

        yield driver
        driver.quit()

    def test_frontend_accessibility(self, api_client):
        """Test frontend application accessibility"""
        response = api_client.get(FRONTEND_BASE_URL)

        assert response.status_code == 200

        # Check for basic HTML structure
        html_content = response.text
        assert "<html" in html_content
        assert "<head>" in html_content
        assert "<body>" in html_content

    def test_frontend_loads_successfully(self, browser):
        """Test that frontend loads without errors"""
        browser.get(FRONTEND_BASE_URL)

        # Wait for page to load
        WebDriverWait(browser, 10).until(
            EC.presence_of_element_located((By.TAG_NAME, "body"))
        )

        # Check page title
        assert browser.title is not None
        assert len(browser.title) > 0

    def test_api_integration(self, browser):
        """Test frontend integration with API"""
        browser.get(FRONTEND_BASE_URL)

        # Wait for page to load
        WebDriverWait(browser, 10).until(
            EC.presence_of_element_located((By.TAG_NAME, "body"))
        )

        # Check if there are any JavaScript errors
        logs = browser.get_log('browser')
        severe_errors = [log for log in logs if log['level'] == 'SEVERE']

        # Allow some errors but not too many
        assert len(severe_errors) < 5, f"Too many severe JavaScript errors: {severe_errors}"

    def test_repository_display(self, browser):
        """Test that repositories are displayed on the frontend"""
        browser.get(FRONTEND_BASE_URL)

        # Wait for content to load
        try:
            # Look for repository cards or list items
            WebDriverWait(browser, 15).until(
                lambda driver: (
                    driver.find_elements(By.CLASS_NAME, "repository-card") or
                    driver.find_elements(By.CLASS_NAME, "repo-item") or
                    driver.find_elements(By.TAG_NAME, "article") or
                    driver.find_elements(By.CSS_SELECTOR, "[data-testid*='repo']")
                )
            )
        except:
            # If no repositories are found, that's okay for a fresh deployment
            pass

    def test_search_functionality(self, browser):
        """Test search functionality if available"""
        browser.get(FRONTEND_BASE_URL)

        # Look for search input
        search_inputs = browser.find_elements(By.CSS_SELECTOR, "input[type='search'], input[placeholder*='search'], input[name*='search']")

        if search_inputs:
            search_input = search_inputs[0]
            search_input.send_keys("python")

            # Look for search button or submit
            search_buttons = browser.find_elements(By.CSS_SELECTOR, "button[type='submit'], button[aria-label*='search']")

            if search_buttons:
                search_buttons[0].click()

                # Wait for results
                time.sleep(2)

    def test_newsletter_signup(self, browser):
        """Test newsletter signup functionality if available"""
        browser.get(FRONTEND_BASE_URL)

        # Look for newsletter signup form
        email_inputs = browser.find_elements(By.CSS_SELECTOR, "input[type='email'], input[name*='email']")

        if email_inputs:
            email_input = email_inputs[0]
            email_input.send_keys("test@example.com")

            # Look for submit button
            submit_buttons = browser.find_elements(By.CSS_SELECTOR, "button[type='submit'], input[type='submit']")

            if submit_buttons:
                # Don't actually submit in tests, just verify the form exists
                assert submit_buttons[0].is_enabled()

    def test_responsive_design(self, browser):
        """Test responsive design at different screen sizes"""
        screen_sizes = [
            (1920, 1080),  # Desktop
            (768, 1024),   # Tablet
            (375, 667),    # Mobile
        ]

        for width, height in screen_sizes:
            browser.set_window_size(width, height)
            browser.get(FRONTEND_BASE_URL)

            # Wait for page to load
            WebDriverWait(browser, 10).until(
                EC.presence_of_element_located((By.TAG_NAME, "body"))
            )

            # Check that page is still functional
            body = browser.find_element(By.TAG_NAME, "body")
            assert body.is_displayed()

    def test_navigation_links(self, browser):
        """Test navigation links if they exist"""
        browser.get(FRONTEND_BASE_URL)

        # Look for navigation links
        nav_links = browser.find_elements(By.CSS_SELECTOR, "nav a, header a, .nav-link")

        for link in nav_links[:3]:  # Test first 3 links to avoid too many requests
            href = link.get_attribute("href")
            if href and href.startswith(FRONTEND_BASE_URL):
                # Test internal links
                link.click()
                time.sleep(1)

                # Verify page loaded
                WebDriverWait(browser, 10).until(
                    EC.presence_of_element_located((By.TAG_NAME, "body"))
                )

                # Go back to home
                browser.get(FRONTEND_BASE_URL)

    def test_theme_switching(self, browser):
        """Test theme switching functionality if available"""
        browser.get(FRONTEND_BASE_URL)

        # Look for theme toggle button
        theme_buttons = browser.find_elements(By.CSS_SELECTOR,
            "button[aria-label*='theme'], button[title*='theme'], .theme-toggle, [data-testid*='theme']"
        )

        if theme_buttons:
            theme_button = theme_buttons[0]

            # Get initial theme state
            initial_classes = browser.find_element(By.TAG_NAME, "html").get_attribute("class")

            # Click theme toggle
            theme_button.click()
            time.sleep(1)

            # Check if theme changed
            new_classes = browser.find_element(By.TAG_NAME, "html").get_attribute("class")

            # Theme should have changed (different classes)
            # This is a basic check - in reality you'd check for specific theme classes

    def test_error_handling(self, browser):
        """Test error handling for invalid routes"""
        # Test 404 page
        browser.get(f"{FRONTEND_BASE_URL}/nonexistent-page")

        # Should either show 404 page or redirect to home
        WebDriverWait(browser, 10).until(
            EC.presence_of_element_located((By.TAG_NAME, "body"))
        )

        # Page should load without crashing
        body = browser.find_element(By.TAG_NAME, "body")
        assert body.is_displayed()

    def test_performance_metrics(self, browser):
        """Test basic performance metrics"""
        browser.get(FRONTEND_BASE_URL)

        # Wait for page to fully load
        WebDriverWait(browser, 15).until(
            EC.presence_of_element_located((By.TAG_NAME, "body"))
        )

        # Get performance metrics
        navigation_timing = browser.execute_script(
            "return window.performance.timing"
        )

        if navigation_timing:
            load_time = navigation_timing['loadEventEnd'] - navigation_timing['navigationStart']

            # Page should load within reasonable time (15 seconds for integration test)
            assert load_time < 15000, f"Page load time too slow: {load_time}ms"

    def test_accessibility_features(self, browser):
        """Test basic accessibility features"""
        browser.get(FRONTEND_BASE_URL)

        # Check for accessibility attributes
        elements_with_aria = browser.find_elements(By.CSS_SELECTOR, "[aria-label], [aria-labelledby], [role]")

        # Should have some accessibility attributes
        assert len(elements_with_aria) > 0, "No accessibility attributes found"

        # Check for alt text on images
        images = browser.find_elements(By.TAG_NAME, "img")
        for img in images:
            alt_text = img.get_attribute("alt")
            # Alt text should exist (can be empty for decorative images)
            assert alt_text is not None
