-- Database initialization script for GitHub Trending Summarizer
-- This script ensures the database is properly set up before the application starts

-- Create the database if it doesn't exist (this is handled by POSTGRES_DB env var)
-- But we can add any additional setup here

-- Set timezone to UTC for consistency
SET timezone = 'UTC';

-- Create extensions if needed
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Log the initialization
DO $$
BEGIN
    RAISE NOTICE 'GitHub Trending Summarizer database initialized successfully';
END $$;
