// @generated automatically by Diesel CLI.

diesel::table! {
    analytics_events (id) {
        id -> Int8,
        user_id -> Nullable<Int8>,
        #[max_length = 255]
        session_id -> Nullable<Varchar>,
        #[max_length = 100]
        event_type -> Varchar,
        event_data -> Nullable<Jsonb>,
        #[max_length = 50]
        source -> Nullable<Varchar>,
        created_at -> Nullable<Timestamp>,
    }
}

diesel::table! {
    extension_preferences (id) {
        id -> Int8,
        user_id -> Nullable<Int8>,
        #[max_length = 255]
        device_id -> Nullable<Varchar>,
        language_filters -> Nullable<Array<Nullable<Text>>>,
        display_count -> Nullable<Int4>,
        #[max_length = 20]
        theme -> Nullable<Varchar>,
        auto_refresh_enabled -> Nullable<Bool>,
        created_at -> Nullable<Timestamp>,
        updated_at -> Nullable<Timestamp>,
    }
}

diesel::table! {
    newsletter_subscriptions (id) {
        id -> Int8,
        #[max_length = 255]
        email -> Varchar,
        #[max_length = 255]
        unsubscribe_token -> Varchar,
        subscribed_at -> Nullable<Timestamp>,
        is_active -> Nullable<Bool>,
        user_id -> Nullable<Int8>,
        #[max_length = 20]
        frequency -> Nullable<Varchar>,
        preferred_languages -> Nullable<Array<Nullable<Text>>>,
        tech_stack_interests -> Nullable<Array<Nullable<Text>>>,
        last_sent_at -> Nullable<Timestamp>,
        engagement_score -> Nullable<Float8>,
    }
}

diesel::table! {
    repositories (id) {
        id -> Int8,
        github_id -> Int8,
        #[max_length = 255]
        name -> Varchar,
        #[max_length = 255]
        full_name -> Varchar,
        description -> Nullable<Text>,
        stars -> Int4,
        forks -> Int4,
        #[max_length = 100]
        language -> Nullable<Varchar>,
        #[max_length = 255]
        author -> Varchar,
        #[max_length = 500]
        url -> Varchar,
        trending_date -> Date,
        created_at -> Nullable<Timestamp>,
        updated_at -> Nullable<Timestamp>,
    }
}

diesel::table! {
    social_shares (id) {
        id -> Int8,
        repository_id -> Nullable<Int8>,
        user_id -> Nullable<Int8>,
        #[max_length = 50]
        platform -> Varchar,
        shared_at -> Nullable<Timestamp>,
        referral_clicks -> Nullable<Int4>,
    }
}

diesel::table! {
    summaries (id) {
        id -> Int8,
        repository_id -> Nullable<Int8>,
        content -> Text,
        generated_at -> Nullable<Timestamp>,
    }
}

diesel::table! {
    trending_history (id) {
        id -> Int8,
        repository_id -> Nullable<Int8>,
        stars -> Int4,
        forks -> Int4,
        recorded_at -> Nullable<Timestamp>,
    }
}

diesel::table! {
    users (id) {
        id -> Int8,
        github_id -> Nullable<Int8>,
        #[max_length = 255]
        google_id -> Nullable<Varchar>,
        #[max_length = 255]
        email -> Varchar,
        #[max_length = 255]
        username -> Nullable<Varchar>,
        #[max_length = 500]
        avatar_url -> Nullable<Varchar>,
        preferred_languages -> Nullable<Array<Nullable<Text>>>,
        created_at -> Nullable<Timestamp>,
        last_login_at -> Nullable<Timestamp>,
        #[max_length = 50]
        referral_code -> Nullable<Varchar>,
        referred_by_user_id -> Nullable<Int8>,
    }
}

diesel::joinable!(analytics_events -> users (user_id));
diesel::joinable!(extension_preferences -> users (user_id));
diesel::joinable!(newsletter_subscriptions -> users (user_id));
diesel::joinable!(social_shares -> repositories (repository_id));
diesel::joinable!(social_shares -> users (user_id));
diesel::joinable!(summaries -> repositories (repository_id));
diesel::joinable!(trending_history -> repositories (repository_id));

diesel::allow_tables_to_appear_in_same_query!(
    analytics_events,
    extension_preferences,
    newsletter_subscriptions,
    repositories,
    social_shares,
    summaries,
    trending_history,
    users,
);
