-- Drop indexes
DROP INDEX IF EXISTS idx_social_shares_user_id;
DROP INDEX IF EXISTS idx_social_shares_repository_id;
DROP INDEX IF EXISTS idx_analytics_events_created_at;
DROP INDEX IF EXISTS idx_analytics_events_user_id;
DROP INDEX IF EXISTS idx_extension_preferences_user_id;
DROP INDEX IF EXISTS idx_users_referral_code;
DROP INDEX IF EXISTS idx_users_email;
DROP INDEX IF EXISTS idx_users_google_id;
DROP INDEX IF EXISTS idx_users_github_id;

-- Remove columns from newsletter_subscriptions
ALTER TABLE newsletter_subscriptions
DROP COLUMN IF EXISTS engagement_score,
DROP COLUMN IF EXISTS last_sent_at,
DROP COLUMN IF EXISTS tech_stack_interests,
DROP COLUMN IF EXISTS preferred_languages,
DROP COLUMN IF EXISTS frequency,
DROP COLUMN IF EXISTS user_id;

-- Drop tables in reverse order
DROP TABLE IF EXISTS social_shares;
DROP TABLE IF EXISTS analytics_events;
DROP TABLE IF EXISTS extension_preferences;
DROP TABLE IF EXISTS users;
