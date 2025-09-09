use diesel::prelude::*;
use diesel::r2d2::{ConnectionManager, Pool, PooledConnection};
use diesel_migrations::{embed_migrations, EmbeddedMigrations, MigrationHarness};
use rocket::fairing::AdHoc;
use std::env;

pub type DbPool = Pool<ConnectionManager<PgConnection>>;
#[allow(dead_code)]
pub type DbConnection = PooledConnection<ConnectionManager<PgConnection>>;

pub const MIGRATIONS: EmbeddedMigrations = embed_migrations!("migrations");

/// Initialize database connection pool
pub fn init_pool() -> DbPool {
    let database_url = env::var("DATABASE_URL").expect("DATABASE_URL must be set");

    let manager = ConnectionManager::<PgConnection>::new(database_url);

    Pool::builder()
        .max_size(10)
        .build(manager)
        .expect("Failed to create database connection pool")
}

/// Run database migrations
pub fn run_migrations(
    pool: &DbPool,
) -> Result<(), Box<dyn std::error::Error + Send + Sync + 'static>> {
    let mut conn = pool.get()?;
    conn.run_pending_migrations(MIGRATIONS)?;
    Ok(())
}

/// Rocket fairing for database initialization
pub fn stage() -> AdHoc {
    AdHoc::on_ignite("Database", |rocket| async {
        let pool = init_pool();

        // Run migrations
        if let Err(e) = run_migrations(&pool) {
            panic!("Failed to run database migrations: {}", e);
        }

        // Wrap in Arc to match the expected state type
        let pool_arc = std::sync::Arc::new(pool);

        rocket.manage(pool_arc)
    })
}
