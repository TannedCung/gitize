use crate::database::DbConnection;
use crate::models::{NewRepository, Repository, RepositoryFilters, UpdateRepository};
use crate::schema::repositories;
use chrono::NaiveDate;
use diesel::prelude::*;

#[allow(dead_code)]
pub struct RepositoryRepository;

#[allow(dead_code)]
impl RepositoryRepository {
    /// Get all repositories with optional filters
    pub fn find_all(
        conn: &mut DbConnection,
        filters: RepositoryFilters,
    ) -> Result<Vec<Repository>, diesel::result::Error> {
        let mut query = repositories::table.into_boxed();

        // Apply filters
        if let Some(language) = filters.language {
            query = query.filter(repositories::language.eq(language));
        }

        if let Some(min_stars) = filters.min_stars {
            query = query.filter(repositories::stars.ge(min_stars));
        }

        if let Some(max_stars) = filters.max_stars {
            query = query.filter(repositories::stars.le(max_stars));
        }

        if let Some(date_from) = filters.date_from {
            query = query.filter(repositories::trending_date.ge(date_from));
        }

        if let Some(date_to) = filters.date_to {
            query = query.filter(repositories::trending_date.le(date_to));
        }

        // Apply pagination
        let limit = filters.limit.unwrap_or(50);
        let offset = filters.offset.unwrap_or(0);

        query
            .order(repositories::stars.desc())
            .limit(limit)
            .offset(offset)
            .load::<Repository>(conn)
    }

    /// Find repository by ID
    pub fn find_by_id(
        conn: &mut DbConnection,
        repo_id: i64,
    ) -> Result<Repository, diesel::result::Error> {
        repositories::table.find(repo_id).first(conn)
    }

    /// Find repository by GitHub ID
    pub fn find_by_github_id(
        conn: &mut DbConnection,
        github_id: i64,
    ) -> Result<Option<Repository>, diesel::result::Error> {
        repositories::table
            .filter(repositories::github_id.eq(github_id))
            .first(conn)
            .optional()
    }

    /// Search repositories by name or description
    pub fn search(
        conn: &mut DbConnection,
        query: &str,
        limit: Option<i64>,
        offset: Option<i64>,
    ) -> Result<Vec<Repository>, diesel::result::Error> {
        let search_pattern = format!("%{}%", query);
        let limit = limit.unwrap_or(50);
        let offset = offset.unwrap_or(0);

        repositories::table
            .filter(
                repositories::name
                    .ilike(&search_pattern)
                    .or(repositories::description.ilike(&search_pattern))
                    .or(repositories::full_name.ilike(&search_pattern)),
            )
            .order(repositories::stars.desc())
            .limit(limit)
            .offset(offset)
            .load::<Repository>(conn)
    }

    /// Get trending repositories for a specific date
    pub fn find_trending_by_date(
        conn: &mut DbConnection,
        date: NaiveDate,
    ) -> Result<Vec<Repository>, diesel::result::Error> {
        repositories::table
            .filter(repositories::trending_date.eq(date))
            .order(repositories::stars.desc())
            .load::<Repository>(conn)
    }

    /// Get top repositories by language
    pub fn find_top_by_language(
        conn: &mut DbConnection,
        language: &str,
        limit: i64,
    ) -> Result<Vec<Repository>, diesel::result::Error> {
        repositories::table
            .filter(repositories::language.eq(language))
            .order(repositories::stars.desc())
            .limit(limit)
            .load::<Repository>(conn)
    }

    /// Create new repository
    pub fn create(
        conn: &mut DbConnection,
        new_repo: NewRepository,
    ) -> Result<Repository, diesel::result::Error> {
        // Validate before inserting
        new_repo.validate().map_err(|e| {
            diesel::result::Error::DatabaseError(
                diesel::result::DatabaseErrorKind::CheckViolation,
                Box::new(e),
            )
        })?;

        diesel::insert_into(repositories::table)
            .values(&new_repo)
            .returning(Repository::as_returning())
            .get_result(conn)
    }

    /// Update repository
    pub fn update(
        conn: &mut DbConnection,
        repo_id: i64,
        update_data: UpdateRepository,
    ) -> Result<Repository, diesel::result::Error> {
        diesel::update(repositories::table.find(repo_id))
            .set(&update_data)
            .returning(Repository::as_returning())
            .get_result(conn)
    }

    /// Delete repository
    pub fn delete(conn: &mut DbConnection, repo_id: i64) -> Result<usize, diesel::result::Error> {
        diesel::delete(repositories::table.find(repo_id)).execute(conn)
    }

    /// Upsert repository (insert or update if exists)
    pub fn upsert(
        conn: &mut DbConnection,
        new_repo: NewRepository,
    ) -> Result<Repository, diesel::result::Error> {
        // Validate before upserting
        new_repo.validate().map_err(|e| {
            diesel::result::Error::DatabaseError(
                diesel::result::DatabaseErrorKind::CheckViolation,
                Box::new(e),
            )
        })?;

        diesel::insert_into(repositories::table)
            .values(&new_repo)
            .on_conflict(repositories::github_id)
            .do_update()
            .set((
                repositories::stars.eq(&new_repo.stars),
                repositories::forks.eq(&new_repo.forks),
                repositories::description.eq(&new_repo.description),
                repositories::updated_at.eq(chrono::Utc::now().naive_utc()),
            ))
            .returning(Repository::as_returning())
            .get_result(conn)
    }

    /// Count total repositories
    pub fn count(conn: &mut DbConnection) -> Result<i64, diesel::result::Error> {
        repositories::table.count().get_result(conn)
    }

    /// Count repositories by language
    pub fn count_by_language(
        conn: &mut DbConnection,
        language: &str,
    ) -> Result<i64, diesel::result::Error> {
        repositories::table
            .filter(repositories::language.eq(language))
            .count()
            .get_result(conn)
    }
}
