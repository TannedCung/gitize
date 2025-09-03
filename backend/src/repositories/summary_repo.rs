use crate::database::DbConnection;
use crate::models::{NewSummary, Summary, UpdateSummary};
use crate::schema::summaries;
use diesel::prelude::*;

#[allow(dead_code)]
pub struct SummaryRepository;

#[allow(dead_code)]
impl SummaryRepository {
    /// Find summary by ID
    pub fn find_by_id(
        conn: &mut DbConnection,
        summary_id: i64,
    ) -> Result<Summary, diesel::result::Error> {
        summaries::table.find(summary_id).first(conn)
    }

    /// Find summary by repository ID
    pub fn find_by_repository_id(
        conn: &mut DbConnection,
        repository_id: i64,
    ) -> Result<Option<Summary>, diesel::result::Error> {
        summaries::table
            .filter(summaries::repository_id.eq(repository_id))
            .first(conn)
            .optional()
    }

    /// Get all summaries with pagination
    pub fn find_all(
        conn: &mut DbConnection,
        limit: Option<i64>,
        offset: Option<i64>,
    ) -> Result<Vec<Summary>, diesel::result::Error> {
        let limit = limit.unwrap_or(50);
        let offset = offset.unwrap_or(0);

        summaries::table
            .order(summaries::generated_at.desc())
            .limit(limit)
            .offset(offset)
            .load::<Summary>(conn)
    }

    /// Create new summary
    pub fn create(
        conn: &mut DbConnection,
        new_summary: NewSummary,
    ) -> Result<Summary, diesel::result::Error> {
        // Validate before inserting
        new_summary.validate().map_err(|e| {
            diesel::result::Error::DatabaseError(
                diesel::result::DatabaseErrorKind::CheckViolation,
                Box::new(e),
            )
        })?;

        diesel::insert_into(summaries::table)
            .values(&new_summary)
            .returning(Summary::as_returning())
            .get_result(conn)
    }

    /// Update summary
    pub fn update(
        conn: &mut DbConnection,
        summary_id: i64,
        update_data: UpdateSummary,
    ) -> Result<Summary, diesel::result::Error> {
        diesel::update(summaries::table.find(summary_id))
            .set(&update_data)
            .returning(Summary::as_returning())
            .get_result(conn)
    }

    /// Update summary by repository ID
    pub fn update_by_repository_id(
        conn: &mut DbConnection,
        repository_id: i64,
        update_data: UpdateSummary,
    ) -> Result<Summary, diesel::result::Error> {
        diesel::update(summaries::table.filter(summaries::repository_id.eq(repository_id)))
            .set(&update_data)
            .returning(Summary::as_returning())
            .get_result(conn)
    }

    /// Delete summary
    pub fn delete(
        conn: &mut DbConnection,
        summary_id: i64,
    ) -> Result<usize, diesel::result::Error> {
        diesel::delete(summaries::table.find(summary_id)).execute(conn)
    }

    /// Delete summary by repository ID
    pub fn delete_by_repository_id(
        conn: &mut DbConnection,
        repository_id: i64,
    ) -> Result<usize, diesel::result::Error> {
        diesel::delete(summaries::table.filter(summaries::repository_id.eq(repository_id)))
            .execute(conn)
    }

    /// Upsert summary (insert or update if exists)
    pub fn upsert(
        conn: &mut DbConnection,
        new_summary: NewSummary,
    ) -> Result<Summary, diesel::result::Error> {
        // Validate before upserting
        new_summary.validate().map_err(|e| {
            diesel::result::Error::DatabaseError(
                diesel::result::DatabaseErrorKind::CheckViolation,
                Box::new(e),
            )
        })?;

        diesel::insert_into(summaries::table)
            .values(&new_summary)
            .on_conflict(summaries::repository_id)
            .do_update()
            .set((
                summaries::content.eq(&new_summary.content),
                summaries::generated_at.eq(chrono::Utc::now().naive_utc()),
            ))
            .returning(Summary::as_returning())
            .get_result(conn)
    }

    /// Count total summaries
    pub fn count(conn: &mut DbConnection) -> Result<i64, diesel::result::Error> {
        summaries::table.count().get_result(conn)
    }

    /// Find recent summaries (generated within specified days)
    pub fn find_recent(
        conn: &mut DbConnection,
        days: i32,
        limit: Option<i64>,
    ) -> Result<Vec<Summary>, diesel::result::Error> {
        let cutoff_date = chrono::Utc::now().naive_utc() - chrono::Duration::days(days as i64);
        let limit = limit.unwrap_or(50);

        summaries::table
            .filter(summaries::generated_at.gt(cutoff_date))
            .order(summaries::generated_at.desc())
            .limit(limit)
            .load::<Summary>(conn)
    }

    /// Check if summary exists for repository
    pub fn exists_for_repository(
        conn: &mut DbConnection,
        repository_id: i64,
    ) -> Result<bool, diesel::result::Error> {
        use diesel::dsl::exists;
        use diesel::select;

        select(exists(
            summaries::table.filter(summaries::repository_id.eq(repository_id)),
        ))
        .get_result(conn)
    }
}
