use std::path::PathBuf;

use once_cell::sync::Lazy;
use serde::Deserialize;

pub static CONFIG: Lazy<Config> =
    Lazy::new(|| envy::from_env::<Config>().expect("failed to get config"));

fn default_listen_addr() -> String {
    "0.0.0.0:3000".to_string()
}

fn default_static_file_directory() -> PathBuf {
    PathBuf::from("../frontend/dist")
}

#[derive(Deserialize)]
pub struct Config {
    #[serde(default = "default_listen_addr")]
    pub listen_addr: String,

    #[serde(default = "default_static_file_directory")]
    pub static_file_directory: PathBuf,
}
