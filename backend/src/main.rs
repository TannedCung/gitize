use rocket::launch;

use github_trending_summarizer::rocket as build_rocket;

#[launch]
fn rocket() -> rocket::Rocket<rocket::Build> {
    env_logger::init();
    build_rocket()
}
