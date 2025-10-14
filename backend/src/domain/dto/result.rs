use crate::domain::enums::ResultCode;
use serde::{Deserialize, Serialize};
use serde_json::Value;
#[derive(Debug, Serialize, Deserialize)]
pub struct Result {
    pub code: i32,
    pub message: String,
    pub data: Value,
}
impl Result {
    pub fn new(code: i32, message: String, data: Value) -> Self {
        Self {
            code,
            message,
            data,
        }
    }

    pub fn success(data: Value) -> Self {
        Self {
            code: ResultCode::Success as i32,
            message: "success".to_string(),
            data,
        }
    }

    pub fn success_only_message(message: String) -> Self {
        Self {
            code: ResultCode::Success as i32,
            message,
            data: Value::Null,
        }
    }
    pub fn success_with_message(message: String, data: Value) -> Self {
        Self {
            code: ResultCode::Success as i32,
            message,
            data,
        }
    }

    pub fn fail(code: i32, message: String) -> Self {
        Self {
            code,
            message,
            data: Value::Null,
        }
    }

    pub fn error(message: String) -> Self {
        Self {
            code: ResultCode::Error as i32,
            message,
            data: Value::Null,
        }
    }
}
