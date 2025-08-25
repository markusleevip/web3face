use serde::{Deserialize, Serialize};

#[derive(Debug, Serialize, Deserialize)]
pub struct App {
    pub app_name: String,
    pub app_key: String,
    pub app_secret: String,
    pub state: u8,
}
