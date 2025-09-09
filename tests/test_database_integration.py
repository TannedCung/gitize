"""
Integration tests for database operations
"""
import pytest
import psycopg2
from conftest import DATABASE_URL


@pytest.mark.integration
@pytest.mark.database
class TestDatabaseIntegration:
    """Test database connectivity and operations"""

    def test_database_connection(self, database_connection):
        """Test basic database connectivity"""
        with database_connection.cursor() as cursor:
            cursor.execute("SELECT 1")
            result = cursor.fetchone()
            assert result[0] == 1

    def test_database_tables_exist(self, database_connection):
        """Test that required database tables exist"""
        expected_tables = [
            "repositories",
            "newsletter_subscriptions",
            "__diesel_schema_migrations"
        ]

        with database_connection.cursor() as cursor:
            cursor.execute("""
                SELECT table_name
                FROM information_schema.tables
                WHERE table_schema = 'public'
            """)

            existing_tables = [row[0] for row in cursor.fetchall()]

            for table in expected_tables:
                assert table in existing_tables, f"Table {table} does not exist"

    def test_repositories_table_structure(self, database_connection):
        """Test repositories table structure"""
        with database_connection.cursor() as cursor:
            cursor.execute("""
                SELECT column_name, data_type, is_nullable
                FROM information_schema.columns
                WHERE table_name = 'repositories'
                ORDER BY ordinal_position
            """)

            columns = cursor.fetchall()
            column_names = [col[0] for col in columns]

            # Check required columns exist
            required_columns = ["id", "name", "full_name", "html_url", "description"]
            for col in required_columns:
                assert col in column_names, f"Column {col} missing from repositories table"

    def test_newsletter_subscriptions_table_structure(self, database_connection):
        """Test newsletter_subscriptions table structure"""
        with database_connection.cursor() as cursor:
            cursor.execute("""
                SELECT column_name, data_type, is_nullable
                FROM information_schema.columns
                WHERE table_name = 'newsletter_subscriptions'
                ORDER BY ordinal_position
            """)

            columns = cursor.fetchall()
            column_names = [col[0] for col in columns]

            # Check required columns exist
            required_columns = ["id", "email", "subscribed_at"]
            for col in required_columns:
                assert col in column_names, f"Column {col} missing from newsletter_subscriptions table"

    def test_database_migrations_applied(self, database_connection):
        """Test that database migrations have been applied"""
        with database_connection.cursor() as cursor:
            cursor.execute("""
                SELECT version FROM __diesel_schema_migrations
                ORDER BY version
            """)

            migrations = cursor.fetchall()
            assert len(migrations) > 0, "No migrations have been applied"

    def test_database_constraints(self, database_connection):
        """Test database constraints and indexes"""
        with database_connection.cursor() as cursor:
            # Test unique constraints
            cursor.execute("""
                SELECT constraint_name, table_name, column_name
                FROM information_schema.key_column_usage
                WHERE table_schema = 'public'
                AND constraint_name LIKE '%unique%' OR constraint_name LIKE '%pkey%'
            """)

            constraints = cursor.fetchall()
            assert len(constraints) > 0, "No unique constraints found"

    def test_repository_crud_operations(self, database_connection, sample_repository_data):
        """Test CRUD operations on repositories table"""
        with database_connection.cursor() as cursor:
            # Create
            cursor.execute("""
                INSERT INTO repositories (name, full_name, description, html_url, stars, language, created_at, updated_at)
                VALUES (%(name)s, %(full_name)s, %(description)s, %(html_url)s, %(stars)s, %(language)s, %(created_at)s, %(updated_at)s)
                RETURNING id
            """, sample_repository_data)

            repo_id = cursor.fetchone()[0]
            assert repo_id is not None

            # Read
            cursor.execute("SELECT * FROM repositories WHERE id = %s", (repo_id,))
            repo = cursor.fetchone()
            assert repo is not None

            # Update
            cursor.execute("""
                UPDATE repositories
                SET stars = %s
                WHERE id = %s
            """, (150, repo_id))

            cursor.execute("SELECT stars FROM repositories WHERE id = %s", (repo_id,))
            updated_stars = cursor.fetchone()[0]
            assert updated_stars == 150

            # Delete
            cursor.execute("DELETE FROM repositories WHERE id = %s", (repo_id,))
            cursor.execute("SELECT COUNT(*) FROM repositories WHERE id = %s", (repo_id,))
            count = cursor.fetchone()[0]
            assert count == 0

            database_connection.commit()

    def test_newsletter_subscription_crud(self, database_connection, sample_newsletter_subscription):
        """Test CRUD operations on newsletter_subscriptions table"""
        with database_connection.cursor() as cursor:
            # Create
            cursor.execute("""
                INSERT INTO newsletter_subscriptions (email, preferences, subscribed_at)
                VALUES (%(email)s, %s, NOW())
                RETURNING id
            """, (sample_newsletter_subscription["email"],
                  psycopg2.extras.Json(sample_newsletter_subscription["preferences"])))

            sub_id = cursor.fetchone()[0]
            assert sub_id is not None

            # Read
            cursor.execute("SELECT * FROM newsletter_subscriptions WHERE id = %s", (sub_id,))
            subscription = cursor.fetchone()
            assert subscription is not None

            # Update
            cursor.execute("""
                UPDATE newsletter_subscriptions
                SET active = %s
                WHERE id = %s
            """, (False, sub_id))

            # Delete
            cursor.execute("DELETE FROM newsletter_subscriptions WHERE id = %s", (sub_id,))

            database_connection.commit()

    def test_database_performance(self, database_connection):
        """Test basic database performance"""
        with database_connection.cursor() as cursor:
            # Test query performance on repositories
            cursor.execute("""
                EXPLAIN ANALYZE
                SELECT * FROM repositories
                WHERE language = 'Python'
                ORDER BY stars DESC
                LIMIT 10
            """)

            explain_result = cursor.fetchall()
            assert len(explain_result) > 0

    def test_database_transactions(self, database_connection, sample_repository_data):
        """Test database transaction handling"""
        with database_connection.cursor() as cursor:
            try:
                # Start transaction
                cursor.execute("BEGIN")

                # Insert test data
                cursor.execute("""
                    INSERT INTO repositories (name, full_name, description, html_url, stars, language, created_at, updated_at)
                    VALUES (%(name)s, %(full_name)s, %(description)s, %(html_url)s, %(stars)s, %(language)s, %(created_at)s, %(updated_at)s)
                    RETURNING id
                """, sample_repository_data)

                repo_id = cursor.fetchone()[0]

                # Rollback transaction
                cursor.execute("ROLLBACK")

                # Verify data was not committed
                cursor.execute("SELECT COUNT(*) FROM repositories WHERE id = %s", (repo_id,))
                count = cursor.fetchone()[0]
                assert count == 0

            except Exception:
                cursor.execute("ROLLBACK")
                raise

    def test_database_connection_pooling(self, database_connection):
        """Test that database connection pooling is working"""
        # This is more of a smoke test - in a real scenario you'd test
        # multiple concurrent connections
        with database_connection.cursor() as cursor:
            cursor.execute("SELECT COUNT(*) FROM pg_stat_activity WHERE datname = current_database()")
            connection_count = cursor.fetchone()[0]
            assert connection_count > 0
