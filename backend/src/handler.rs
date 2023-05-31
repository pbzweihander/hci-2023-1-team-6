use axum::{routing, Router};
use tower_http::services::ServeDir;

use crate::config::CONFIG;

pub fn create_router() -> Router {
    let api = Router::new().route("/health", routing::get(get_health));

    Router::new()
        .nest("/api", api)
        .nest_service("/", ServeDir::new(&CONFIG.static_file_directory))
}

async fn get_health() -> &'static str {
    "OK"
}
