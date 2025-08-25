use serde::{Deserialize, Serialize};
#[derive(Debug, Serialize, Deserialize)]
pub struct LoginDTO {
    pub public_key: String,
    pub sign_msg: String,
    pub sign: String,
    pub nickname: String,
    pub rsa_public_key: String,
}
