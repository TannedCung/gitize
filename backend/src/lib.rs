pub mod database;
pub mod models;
pub mod repositories;
pub mod routes;
pub mod schema;
pub mod seed;
pub mod services;

use dotenv::dotenv;
use rocket::{routes, Build, Rocket};

pub fn rocket() -> Rocket<Build> {
    dotenv().ok();

    rocket::build()
        .attach(database::stage())
        .mount("/api", routes![routes::health::health_check])
        .mount("/api", routes::repositories::routes())
        .mount("/api", routes::newsletter::routes())
}
