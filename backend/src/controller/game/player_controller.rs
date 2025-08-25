use crate::jwt::Claims;
use spring_web::axum::Json;
use spring_web::route;

#[route("/game/auth", method = "POST")]
async fn auth(claims: Claims) -> Json<crate::domain::Result> {
    println!("auth.Claims: {:?}", claims);
    Json(crate::domain::Result::fail(crate::domain::enums::ResultCode::Error as i32, "Unauthorized".to_string()).into())
}


