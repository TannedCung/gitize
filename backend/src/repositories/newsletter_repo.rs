use crate::database::DbConnection;
use crate::models::{
    NewNewsletterSubscription, NewsletterSubscription, UpdateNewsletterSubscription,
};
use crate::schema::newsletter_subscriptions;
use diesel::prelude::*;

#[allow(dead_code)]
pub struct NewsletterRepository;

#[allow(dead_code)]
impl NewsletterRepository {
    /// Find subscription by ID
    pub fn find_by_id(
        conn: &mut DbConnection,
        subscription_id: i64,
    ) -> Result<NewsletterSubscription, diesel::result::Error> {
        newsletter_subscriptions::table
            .find(subscription_id)
            .first(conn)
    }

    /// Find subscription by email
    pub fn find_by_email(
        conn: &mut DbConnection,
        email: &str,
    ) -> Result<Option<NewsletterSubscription>, diesel::result::Error> {
        newsletter_subscriptions::table
            .filter(newsletter_subscriptions::email.eq(email))
            .first(conn)
            .optional()
    }

    /// Find subscription by unsubscribe token
    pub fn find_by_token(
        conn: &mut DbConnection,
        token: &str,
    ) -> Result<Option<NewsletterSubscription>, diesel::result::Error> {
        newsletter_subscriptions::table
            .filter(newsletter_subscriptions::unsubscribe_token.eq(token))
            .first(conn)
            .optional()
    }

    /// Get all active subscriptions
    pub fn find_active(
        conn: &mut DbConnection,
        limit: Option<i64>,
        offset: Option<i64>,
    ) -> Result<Vec<NewsletterSubscription>, diesel::result::Error> {
        let limit = limit.unwrap_or(1000);
        let offset = offset.unwrap_or(0);

        newsletter_subscriptions::table
            .filter(newsletter_subscriptions::is_active.eq(true))
            .order(newsletter_subscriptions::subscribed_at.desc())
            .limit(limit)
            .offset(offset)
            .load::<NewsletterSubscription>(conn)
    }

    /// Get all subscriptions with pagination
    pub fn find_all(
        conn: &mut DbConnection,
        limit: Option<i64>,
        offset: Option<i64>,
    ) -> Result<Vec<NewsletterSubscription>, diesel::result::Error> {
        let limit = limit.unwrap_or(50);
        let offset = offset.unwrap_or(0);

        newsletter_subscriptions::table
            .order(newsletter_subscriptions::subscribed_at.desc())
            .limit(limit)
            .offset(offset)
            .load::<NewsletterSubscription>(conn)
    }

    /// Create new subscription
    pub fn create(
        conn: &mut DbConnection,
        new_subscription: NewNewsletterSubscription,
    ) -> Result<NewsletterSubscription, diesel::result::Error> {
        // Validate before inserting
        new_subscription.validate().map_err(|e| {
            diesel::result::Error::DatabaseError(
                diesel::result::DatabaseErrorKind::CheckViolation,
                Box::new(e),
            )
        })?;

        diesel::insert_into(newsletter_subscriptions::table)
            .values(&new_subscription)
            .returning(NewsletterSubscription::as_returning())
            .get_result(conn)
    }

    /// Update subscription
    pub fn update(
        conn: &mut DbConnection,
        subscription_id: i64,
        update_data: UpdateNewsletterSubscription,
    ) -> Result<NewsletterSubscription, diesel::result::Error> {
        diesel::update(newsletter_subscriptions::table.find(subscription_id))
            .set(&update_data)
            .returning(NewsletterSubscription::as_returning())
            .get_result(conn)
    }

    /// Update subscription by email
    pub fn update_by_email(
        conn: &mut DbConnection,
        email: &str,
        update_data: UpdateNewsletterSubscription,
    ) -> Result<NewsletterSubscription, diesel::result::Error> {
        diesel::update(
            newsletter_subscriptions::table.filter(newsletter_subscriptions::email.eq(email)),
        )
        .set(&update_data)
        .returning(NewsletterSubscription::as_returning())
        .get_result(conn)
    }

    /// Deactivate subscription by token
    pub fn deactivate_by_token(
        conn: &mut DbConnection,
        token: &str,
    ) -> Result<NewsletterSubscription, diesel::result::Error> {
        diesel::update(
            newsletter_subscriptions::table
                .filter(newsletter_subscriptions::unsubscribe_token.eq(token)),
        )
        .set(newsletter_subscriptions::is_active.eq(false))
        .returning(NewsletterSubscription::as_returning())
        .get_result(conn)
    }

    /// Reactivate subscription by email
    pub fn reactivate_by_email(
        conn: &mut DbConnection,
        email: &str,
    ) -> Result<NewsletterSubscription, diesel::result::Error> {
        diesel::update(
            newsletter_subscriptions::table.filter(newsletter_subscriptions::email.eq(email)),
        )
        .set(newsletter_subscriptions::is_active.eq(true))
        .returning(NewsletterSubscription::as_returning())
        .get_result(conn)
    }

    /// Delete subscription
    pub fn delete(
        conn: &mut DbConnection,
        subscription_id: i64,
    ) -> Result<usize, diesel::result::Error> {
        diesel::delete(newsletter_subscriptions::table.find(subscription_id)).execute(conn)
    }

    /// Delete subscription by email
    pub fn delete_by_email(
        conn: &mut DbConnection,
        email: &str,
    ) -> Result<usize, diesel::result::Error> {
        diesel::delete(
            newsletter_subscriptions::table.filter(newsletter_subscriptions::email.eq(email)),
        )
        .execute(conn)
    }

    /// Check if email is already subscribed
    pub fn is_subscribed(
        conn: &mut DbConnection,
        email: &str,
    ) -> Result<bool, diesel::result::Error> {
        use diesel::dsl::exists;
        use diesel::select;

        select(exists(
            newsletter_subscriptions::table
                .filter(newsletter_subscriptions::email.eq(email))
                .filter(newsletter_subscriptions::is_active.eq(true)),
        ))
        .get_result(conn)
    }

    /// Count total subscriptions
    pub fn count(conn: &mut DbConnection) -> Result<i64, diesel::result::Error> {
        newsletter_subscriptions::table.count().get_result(conn)
    }

    /// Count active subscriptions
    pub fn count_active(conn: &mut DbConnection) -> Result<i64, diesel::result::Error> {
        newsletter_subscriptions::table
            .filter(newsletter_subscriptions::is_active.eq(true))
            .count()
            .get_result(conn)
    }

    /// Get subscription statistics
    pub fn get_stats(conn: &mut DbConnection) -> Result<(i64, i64, i64), diesel::result::Error> {
        let total = Self::count(conn)?;
        let active = Self::count_active(conn)?;
        let inactive = total - active;
        Ok((total, active, inactive))
    }
}
