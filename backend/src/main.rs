#[macro_use]
extern crate rocket;

mod database;
mod models;
mod routes;
mod schema;
mod services;

use dotenv::dotenv;
use rocket::{Build, Rocket};

#[launch]
fn rocket() -> Rocket<Build> {
    dotenv().ok();
    env_logger::init();

    rocket::build().mount("/api", routes![routes::health::health_check,])
}
