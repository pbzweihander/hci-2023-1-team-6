use async_openai::types::{
    ChatCompletionRequestMessage, ChatCompletionRequestMessageArgs,
    CreateChatCompletionRequestArgs, Role,
};
use axum::{extract::State, http::StatusCode, routing, Json, Router};
use itertools::join;
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
struct Relationship {
    to: String,
    description: String,
}

#[derive(Deserialize)]
struct PostGenerateNameReq {
    histories: Vec<MessageHistory>,
    characteristics: Vec<String>,
    relationships: Vec<Relationship>,
}

const PROMPT: &str = "You are a fictional character name recommender. Recommend a fictional character name in double quote (\"). Answer with reasons.";

async fn post_generate_name(
    State(state): State<AppState>,
    Json(req): Json<PostGenerateNameReq>,
) -> Result<String, (StatusCode, &'static str)> {
    let mut messages = Vec::<ChatCompletionRequestMessage>::with_capacity(
        if req.characteristics.is_empty() && req.relationships.is_empty() {
            req.histories.len() + 1
        } else {
            req.histories.len() + 2
        },
    );

    messages.push(
        ChatCompletionRequestMessageArgs::default()
            .role(Role::System)
            .content(PROMPT)
            .build()
            .map_err(|_| {
                (
                    StatusCode::INTERNAL_SERVER_ERROR,
                    "failed to build message for OpenAI API",
                )
            })?,
    );

    if !req.characteristics.is_empty() || !req.relationships.is_empty() {
        messages.push(
            ChatCompletionRequestMessageArgs::default()
                .role(Role::User)
                .content(format!(
                    "{}\n{}",
                    join(
                        req.characteristics
                            .iter()
                            .map(|ch| format!("- This character {}", ch)),
                        "\n"
                    ),
                    join(
                        req.relationships.iter().map(|rel| format!(
                            "- This character and {} {}",
                            rel.to, rel.description
                        )),
                        "\n"
                    )
                ))
                .build()
                .map_err(|_| {
                    (
                        StatusCode::INTERNAL_SERVER_ERROR,
                        "failed to build message for OpenAI API",
                    )
                })?,
        );
    }

    for history in req.histories {
        messages.push(
            ChatCompletionRequestMessageArgs::default()
                .role(history.role)
                .content(history.content)
                .build()
                .map_err(|_| {
                    (
                        StatusCode::INTERNAL_SERVER_ERROR,
                        "failed to build message for OpenAI API",
                    )
                })?,
        );
    }

    let openai_req = CreateChatCompletionRequestArgs::default()
        .max_tokens(512u16)
        .model("gpt-3.5-turbo")
        .messages(messages)
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
