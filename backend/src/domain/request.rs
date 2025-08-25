use serde::{Deserialize, Serialize};

#[derive(Debug, Serialize, Deserialize)]
pub struct AppAuthRequest {
    pub app_key: String,
    pub app_sign: String,
    pub sign_time: u64,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct AppAuthResponse {
    pub app_access_token: String,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct LoginRequest {
    pub public_key: String,
    pub sign_text: String,
    pub sign: String,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct RegisterRequest {
    pub public_key: String,
    pub nickname: String,
    pub sign_msg: String,
    pub sign: String,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct CreateOrderRequest {
    pub product_id: u32,
    pub request_id: String,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct PayOrderRequest {
    pub order_no: String,
    pub pay_channel: String,
    pub pay_amount: f64,
    pub sign_msg: String,
    pub sign: String,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct OrderVerifyRequest {
    pub order_no: String,
    pub tx_signature: String,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct OrderDeleteRequest {
    pub order_no: String,
}

