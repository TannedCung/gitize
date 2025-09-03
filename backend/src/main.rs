#[macro_use]
extern crate rocket;

mod database;
mod models;
mod repositories;
mod routes;
mod schema;
mod seed;
mod services;

use dotenv::dotenv;
use rocket::{Build, Rocket};

#[launch]
fn rocket() -> Rocket<Build> {
    dotenv().ok();
    env_logger::init();

    rocket::build()
        .attach(database::stage())
        .mount("/api", routes![routes::health::health_check,])
}
