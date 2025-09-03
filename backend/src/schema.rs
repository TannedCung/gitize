// @generated automatically by Diesel CLI.

diesel::table! {
    newsletter_subscriptions (id) {
        id -> Int8,
        #[max_length = 255]
        email -> Varchar,
        #[max_length = 255]
        unsubscribe_token -> Varchar,
        subscribed_at -> Nullable<Timestamp>,
        is_active -> Nullable<Bool>,
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

diesel::joinable!(summaries -> repositories (repository_id));
diesel::joinable!(trending_history -> repositories (repository_id));

diesel::allow_tables_to_appear_in_same_query!(
    newsletter_subscriptions,
    repositories,
    summaries,
    trending_history,
);
