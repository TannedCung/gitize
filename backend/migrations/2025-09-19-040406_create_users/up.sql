-- Create users table
CREATE TABLE users (
    id BIGSERIAL PRIMARY KEY,
    github_id BIGINT UNIQUE,
    google_id VARCHAR(255) UNIQUE,
    email VARCHAR(255) UNIQUE NOT NULL,
    username VARCHAR(255),
    avatar_url VARCHAR(500),
    preferred_languages TEXT[],
    created_at TIMESTAMP DEFAULT NOW(),
    last_login_at TIMESTAMP,
    referral_code VARCHAR(50) UNIQUE,
    referred_by_user_id BIGINT REFERENCES users(id)
);

-- Create extension preferences table
CREATE TABLE extension_preferences (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT REFERENCES users(id),
    device_id VARCHAR(255), -- For anonymous users
    language_filters TEXT[],
    display_count INTEGER DEFAULT 10,
    theme VARCHAR(20) DEFAULT 'system',
    auto_refresh_enabled BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(user_id, device_id)
);

-- Create analytics events table
CREATE TABLE analytics_events (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT REFERENCES users(id),
    session_id VARCHAR(255),
    event_type VARCHAR(100) NOT NULL,
    event_data JSONB,
    source VARCHAR(50), -- 'web', 'extension', 'newsletter'
    created_at TIMESTAMP DEFAULT NOW()
);

-- Create social shares table
CREATE TABLE social_shares (
    id BIGSERIAL PRIMARY KEY,
    repository_id BIGINT REFERENCES repositories(id),
    user_id BIGINT REFERENCES users(id),
    platform VARCHAR(50) NOT NULL, -- 'twitter', 'linkedin', etc.
    shared_at TIMESTAMP DEFAULT NOW(),
    referral_clicks INTEGER DEFAULT 0
);

-- Update newsletter_subscriptions to reference users
ALTER TABLE newsletter_subscriptions
ADD COLUMN user_id BIGINT REFERENCES users(id),
ADD COLUMN frequency VARCHAR(20) DEFAULT 'weekly',
ADD COLUMN preferred_languages TEXT[],
ADD COLUMN tech_stack_interests TEXT[],
ADD COLUMN last_sent_at TIMESTAMP,
ADD COLUMN engagement_score FLOAT DEFAULT 0.0;

-- Create indexes for performance
CREATE INDEX idx_users_github_id ON users(github_id);
CREATE INDEX idx_users_google_id ON users(google_id);
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_referral_code ON users(referral_code);
CREATE INDEX idx_extension_preferences_user_id ON extension_preferences(user_id);
CREATE INDEX idx_analytics_events_user_id ON analytics_events(user_id);
CREATE INDEX idx_analytics_events_created_at ON analytics_events(created_at);
CREATE INDEX idx_social_shares_repository_id ON social_shares(repository_id);
CREATE INDEX idx_social_shares_user_id ON social_shares(user_id);
