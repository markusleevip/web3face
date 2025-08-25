use serde::{Deserialize, Serialize};

#[derive(Debug, Serialize, Deserialize)]
pub struct ProductDTO {
    pub id: i32,
    pub name: String,
    pub price: f64,
    pub fee_price: f64,
    pub image: String,
    pub description: String,
    // 1: on sale, 0: off sale
    pub state: i8,
}
