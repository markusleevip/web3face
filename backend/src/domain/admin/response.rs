use serde::{Deserialize, Serialize};


#[derive(Debug, Serialize, Deserialize)]
pub struct AdminAppSaveResponse {
    pub app_access_token: String,
}