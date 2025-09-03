use crate::database::DbConnection;
use crate::models::{NewTrendingHistory, TrendingHistory};
use crate::schema::trending_history;
use chrono::NaiveDateTime;
use diesel::prelude::*;

#[allow(dead_code)]
pub struct TrendingHistoryRepository;

#[allow(dead_code)]
impl TrendingHistoryRepository {
    /// Find trending history by ID
    pub fn find_by_id(
        conn: &mut DbConnection,
        history_id: i64,
    ) -> Result<TrendingHistory, diesel::result::Error> {
        trending_history::table.find(history_id).first(conn)
    }

    /// Find all history records for a repository
    pub fn find_by_repository_id(
        conn: &mut DbConnection,
        repository_id: i64,
        limit: Option<i64>,
    ) -> Result<Vec<TrendingHistory>, diesel::result::Error> {
        let limit = limit.unwrap_or(100);

        trending_history::table
            .filter(trending_history::repository_id.eq(repository_id))
            .order(trending_history::recorded_at.desc())
            .limit(limit)
            .load::<TrendingHistory>(conn)
    }

    /// Find latest history record for a repository
    pub fn find_latest_by_repository_id(
        conn: &mut DbConnection,
        repository_id: i64,
    ) -> Result<Option<TrendingHistory>, diesel::result::Error> {
        trending_history::table
            .filter(trending_history::repository_id.eq(repository_id))
            .order(trending_history::recorded_at.desc())
            .first(conn)
            .optional()
    }

    /// Find history records within date range
    pub fn find_by_date_range(
        conn: &mut DbConnection,
        start_date: NaiveDateTime,
        end_date: NaiveDateTime,
        limit: Option<i64>,
        offset: Option<i64>,
    ) -> Result<Vec<TrendingHistory>, diesel::result::Error> {
        let limit = limit.unwrap_or(1000);
        let offset = offset.unwrap_or(0);

        trending_history::table
            .filter(trending_history::recorded_at.between(start_date, end_date))
            .order(trending_history::recorded_at.desc())
            .limit(limit)
            .offset(offset)
            .load::<TrendingHistory>(conn)
    }

    /// Find recent history records (within specified hours)
    pub fn find_recent(
        conn: &mut DbConnection,
        hours: i32,
        limit: Option<i64>,
    ) -> Result<Vec<TrendingHistory>, diesel::result::Error> {
        let cutoff_date = chrono::Utc::now().naive_utc() - chrono::Duration::hours(hours as i64);
        let limit = limit.unwrap_or(100);

        trending_history::table
            .filter(trending_history::recorded_at.gt(cutoff_date))
            .order(trending_history::recorded_at.desc())
            .limit(limit)
            .load::<TrendingHistory>(conn)
    }

    /// Get all history records with pagination
    pub fn find_all(
        conn: &mut DbConnection,
        limit: Option<i64>,
        offset: Option<i64>,
    ) -> Result<Vec<TrendingHistory>, diesel::result::Error> {
        let limit = limit.unwrap_or(100);
        let offset = offset.unwrap_or(0);

        trending_history::table
            .order(trending_history::recorded_at.desc())
            .limit(limit)
            .offset(offset)
            .load::<TrendingHistory>(conn)
    }

    /// Create new history record
    pub fn create(
        conn: &mut DbConnection,
        new_history: NewTrendingHistory,
    ) -> Result<TrendingHistory, diesel::result::Error> {
        // Validate before inserting
        new_history.validate().map_err(|e| {
            diesel::result::Error::DatabaseError(
                diesel::result::DatabaseErrorKind::CheckViolation,
                Box::new(e),
            )
        })?;

        diesel::insert_into(trending_history::table)
            .values(&new_history)
            .returning(TrendingHistory::as_returning())
            .get_result(conn)
    }

    /// Create multiple history records in batch
    pub fn create_batch(
        conn: &mut DbConnection,
        new_histories: Vec<NewTrendingHistory>,
    ) -> Result<Vec<TrendingHistory>, diesel::result::Error> {
        // Validate all records before inserting
        for history in &new_histories {
            history.validate().map_err(|e| {
                diesel::result::Error::DatabaseError(
                    diesel::result::DatabaseErrorKind::CheckViolation,
                    Box::new(e),
                )
            })?;
        }

        diesel::insert_into(trending_history::table)
            .values(&new_histories)
            .returning(TrendingHistory::as_returning())
            .get_results(conn)
    }

    /// Delete history record
    pub fn delete(
        conn: &mut DbConnection,
        history_id: i64,
    ) -> Result<usize, diesel::result::Error> {
        diesel::delete(trending_history::table.find(history_id)).execute(conn)
    }

    /// Delete all history records for a repository
    pub fn delete_by_repository_id(
        conn: &mut DbConnection,
        repository_id: i64,
    ) -> Result<usize, diesel::result::Error> {
        diesel::delete(
            trending_history::table.filter(trending_history::repository_id.eq(repository_id)),
        )
        .execute(conn)
    }

    /// Delete old history records (older than specified days)
    pub fn delete_old_records(
        conn: &mut DbConnection,
        days: i32,
    ) -> Result<usize, diesel::result::Error> {
        let cutoff_date = chrono::Utc::now().naive_utc() - chrono::Duration::days(days as i64);

        diesel::delete(
            trending_history::table.filter(trending_history::recorded_at.lt(cutoff_date)),
        )
        .execute(conn)
    }

    /// Count total history records
    pub fn count(conn: &mut DbConnection) -> Result<i64, diesel::result::Error> {
        trending_history::table.count().get_result(conn)
    }

    /// Count history records for a repository
    pub fn count_by_repository_id(
        conn: &mut DbConnection,
        repository_id: i64,
    ) -> Result<i64, diesel::result::Error> {
        trending_history::table
            .filter(trending_history::repository_id.eq(repository_id))
            .count()
            .get_result(conn)
    }

    /// Get star growth statistics for a repository
    pub fn get_star_growth_stats(
        conn: &mut DbConnection,
        repository_id: i64,
        days: i32,
    ) -> Result<Option<(i32, i32, i32)>, diesel::result::Error> {
        let cutoff_date = chrono::Utc::now().naive_utc() - chrono::Duration::days(days as i64);

        let records: Vec<TrendingHistory> = trending_history::table
            .filter(trending_history::repository_id.eq(repository_id))
            .filter(trending_history::recorded_at.gt(cutoff_date))
            .order(trending_history::recorded_at.asc())
            .load::<TrendingHistory>(conn)?;

        if records.len() < 2 {
            return Ok(None);
        }

        let first = &records[0];
        let last = &records[records.len() - 1];
        let total_growth = last.stars - first.stars;
        let min_stars = records.iter().map(|r| r.stars).min().unwrap_or(0);
        let max_stars = records.iter().map(|r| r.stars).max().unwrap_or(0);

        Ok(Some((total_growth, min_stars, max_stars)))
    }
}
