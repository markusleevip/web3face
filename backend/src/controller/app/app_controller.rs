use crate::domain::enums::ResultCode;
use crate::domain::{AppAuthRequest, AppAuthResponse, Result};
use crate::jwt::{generate_token, validate_token, Claims};
use serde_json::json;
use spring_web::axum::Json;
use spring_web::route;

#[route("/app/auth", method = "POST")]
async fn auth(Json(request): Json<AppAuthRequest>) -> Json<Result> {
    log::info!("request.app_key: {}", &request.app_key);
    let token = generate_token(&request.app_key).unwrap();
    log::info!("Generated token: {}", token);
    if let Err(e) = validate_token(&token) {
        log::error!("Token validation failed: {}", e);
        return Json(Result::fail(ResultCode::Error as i32, "Token validation failed".to_string()).into());
    }
    let response = AppAuthResponse {
        app_access_token: token,
    };
    Json(Result::success(json!(response)).into())
}
