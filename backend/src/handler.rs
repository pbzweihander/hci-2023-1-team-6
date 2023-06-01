use async_openai::types::{
    ChatCompletionRequestMessageArgs, CreateChatCompletionRequestArgs, Role,
};
use axum::{extract::State, http::StatusCode, routing, Json, Router};
use serde::Deserialize;
use tower_http::services::ServeDir;

use crate::config::CONFIG;

#[derive(Clone)]
struct AppState {
    openai_client: async_openai::Client,
}

pub fn create_router() -> Router {
    let openai_client = async_openai::Client::new();
    let state = AppState { openai_client };

    let api = Router::new()
        .route("/name/generate", routing::post(post_generate_name))
        .with_state(state)
        .route("/health", routing::get(get_health));

    Router::new()
        .nest("/api", api)
        .nest_service("/", ServeDir::new(&CONFIG.static_file_directory))
}

async fn get_health() -> &'static str {
    "OK"
}

#[derive(Deserialize)]
struct MessageHistory {
    role: Role,
    content: String,
}

#[derive(Deserialize)]
struct PostGenerateNameReq {
    histories: Vec<MessageHistory>,
}

async fn post_generate_name(
    State(state): State<AppState>,
    Json(req): Json<PostGenerateNameReq>,
) -> Result<String, (StatusCode, &'static str)> {
    let histories_len = req.histories.len();

    let openai_req = CreateChatCompletionRequestArgs::default()
        .max_tokens(512u16)
        .model("gpt-3.5-turbo")
        .messages(
            std::iter::once(
                ChatCompletionRequestMessageArgs::default()
                    .role(Role::System)
                    .content("You are a fictional character name recommender. Recommend a fictional character name in double quote (\"). Answer with reasons.")
                    .build(),
            )
            .chain(req.histories.into_iter().map(|history| {
                ChatCompletionRequestMessageArgs::default()
                    .role(history.role)
                    .content(history.content)
                    .build()
            }))
            .try_fold(
                Vec::with_capacity(histories_len + 1),
                |mut acc, m| match m {
                    Ok(m) => {
                        acc.push(m);
                        Ok(acc)
                    }
                    Err(e) => Err(e),
                },
            )
            .map_err(|_| {
                (
                    StatusCode::INTERNAL_SERVER_ERROR,
                    "failed to build message for OpenAI API",
                )
            })?,
        )
        .build()
        .map_err(|_| {
            (
                StatusCode::INTERNAL_SERVER_ERROR,
                "failed to build OpenAI request",
            )
        })?;

    let openai_resp = state
        .openai_client
        .chat()
        .create(openai_req)
        .await
        .map_err(|_| {
            (
                StatusCode::INTERNAL_SERVER_ERROR,
                "failed to request OpenAI",
            )
        })?;

    Ok(openai_resp
        .choices
        .first()
        .ok_or((
            StatusCode::INTERNAL_SERVER_ERROR,
            "OpenAI returned no choice",
        ))?
        .message
        .content
        .clone())
}
