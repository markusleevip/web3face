use serde::{Deserialize, Serialize};
#[derive(Debug, Serialize, Deserialize)]
pub struct LoginResponse {
    pub public_key: String,
    pub nickname: String,
    pub token: String,
    pub is_admin: bool,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct OrderResponse {
    pub order_no: String,
    pub user_id: String,
    pub product_id: u32,
    pub product_name: String,
    pub order_price: f64,
    pub pay_price: f64,
    pub fee_price: f64,
    pub receiver_account: String,
    pub signature: String,
    pub slot: u64,
    pub order_status: String,
    pub pay_status: String,
    pub pay_time: u64,
    pub create_time: u64,
}
