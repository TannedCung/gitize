use crate::database::DbPool;
use crate::models::{NewUser, UpdateUser, User};
use crate::schema::users;
use anyhow::Result;
use chrono::Utc;
use diesel::prelude::*;
use std::sync::Arc;

pub struct UserRepository {
    db_pool: Arc<DbPool>,
}

impl UserRepository {
    pub fn new(db_pool: Arc<DbPool>) -> Self {
        Self { db_pool }
    }

    pub async fn create_user(&self, new_user: NewUser) -> Result<User> {
        let mut conn = self.db_pool.get()?;

        let user = diesel::insert_into(users::table)
            .values(&new_user)
            .returning(User::as_returning())
            .get_result(&mut conn)?;

        Ok(user)
    }

    pub async fn find_user_by_id(&self, user_id: i64) -> Result<Option<User>> {
        let mut conn = self.db_pool.get()?;

        let user = users::table
            .filter(users::id.eq(user_id))
            .select(User::as_select())
            .first(&mut conn)
            .optional()?;

        Ok(user)
    }

    pub async fn find_user_by_email(&self, email: &str) -> Result<Option<User>> {
        let mut conn = self.db_pool.get()?;

        let user = users::table
            .filter(users::email.eq(email))
            .select(User::as_select())
            .first(&mut conn)
            .optional()?;

        Ok(user)
    }

    pub async fn find_user_by_github_id(&self, github_id: i64) -> Result<Option<User>> {
        let mut conn = self.db_pool.get()?;

        let user = users::table
            .filter(users::github_id.eq(github_id))
            .select(User::as_select())
            .first(&mut conn)
            .optional()?;

        Ok(user)
    }

    pub async fn find_user_by_google_id(&self, google_id: &str) -> Result<Option<User>> {
        let mut conn = self.db_pool.get()?;

        let user = users::table
            .filter(users::google_id.eq(google_id))
            .select(User::as_select())
            .first(&mut conn)
            .optional()?;

        Ok(user)
    }

    pub async fn find_user_by_referral_code(&self, referral_code: &str) -> Result<Option<User>> {
        let mut conn = self.db_pool.get()?;

        let user = users::table
            .filter(users::referral_code.eq(referral_code))
            .select(User::as_select())
            .first(&mut conn)
            .optional()?;

        Ok(user)
    }

    pub async fn update_user(&self, user_id: i64, update_user: UpdateUser) -> Result<User> {
        let mut conn = self.db_pool.get()?;

        let user = diesel::update(users::table.filter(users::id.eq(user_id)))
            .set(&update_user)
            .returning(User::as_returning())
            .get_result(&mut conn)?;

        Ok(user)
    }

    pub async fn update_last_login(&self, user_id: i64) -> Result<()> {
        let mut conn = self.db_pool.get()?;

        diesel::update(users::table.filter(users::id.eq(user_id)))
            .set(users::last_login_at.eq(Some(Utc::now().naive_utc())))
            .execute(&mut conn)?;

        Ok(())
    }

    pub async fn delete_user(&self, user_id: i64) -> Result<()> {
        let mut conn = self.db_pool.get()?;

        diesel::delete(users::table.filter(users::id.eq(user_id))).execute(&mut conn)?;

        Ok(())
    }

    // TODO: Extension Preferences, Analytics Events, and Social Shares methods
    // These will be implemented in a future iteration once the core user management is working

    // Referral methods
    pub async fn get_referral_count(&self, user_id: i64) -> Result<i64> {
        let mut conn = self.db_pool.get()?;

        let count = users::table
            .filter(users::referred_by_user_id.eq(user_id))
            .count()
            .get_result(&mut conn)?;

        Ok(count)
    }

    pub async fn get_referred_users(&self, user_id: i64) -> Result<Vec<User>> {
        let mut conn = self.db_pool.get()?;

        let users = users::table
            .filter(users::referred_by_user_id.eq(user_id))
            .order(users::created_at.desc())
            .select(User::as_select())
            .load(&mut conn)?;

        Ok(users)
    }
}
