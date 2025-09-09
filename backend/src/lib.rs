pub mod database;
pub mod middleware;
pub mod models;
pub mod repositories;
pub mod routes;
pub mod schema;
pub mod seed;
pub mod services;

use dotenv::dotenv;
use middleware::{MetricsFairing, StructuredLoggingFairing};
use rocket::fairing::AdHoc;
use rocket::{Build, Rocket};
use services::ServiceManager;
use std::sync::Arc;

pub fn rocket() -> Rocket<Build> {
    dotenv().ok();

    rocket::build()
        .attach(StructuredLoggingFairing)
        .attach(database::stage())
        .attach(services_stage())
        .attach(metrics_stage())
        .mount("/api", routes::health::routes())
        .mount("/api", routes::repositories::routes())
        .mount("/api", routes::newsletter::routes())
        .mount("/api", routes::admin::routes())
}

/// Rocket fairing for services initialization
fn services_stage() -> AdHoc {
    AdHoc::on_ignite("Services", |rocket| async {
        let db_pool = rocket
            .state::<Arc<database::DbPool>>()
            .expect("Database pool not found")
            .clone();

        let service_manager = ServiceManager::new(db_pool)
            .await
            .expect("Failed to initialize service manager");

        // Start the scheduler
        if let Err(e) = service_manager.start_scheduler().await {
            log::error!("Failed to start scheduler: {}", e);
            panic!("Failed to start scheduler: {}", e);
        }

        log::info!("Services initialized successfully");

        rocket.manage(service_manager)
    })
}

/// Rocket fairing for metrics and monitoring initialization
fn metrics_stage() -> AdHoc {
    AdHoc::on_ignite("Metrics and Monitoring", |rocket| async {
        let service_manager = rocket
            .state::<ServiceManager>()
            .expect("Service manager not found");

        // Attach metrics fairing
        let metrics_fairing = MetricsFairing::new(
            service_manager.metrics_collector.clone(),
            service_manager.alerting_service.clone(),
        );

        rocket.attach(metrics_fairing)
    })
}
