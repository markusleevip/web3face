use crate::domain::enums::ResultCode;
use crate::domain::{AdminAppSaveRequest, AppAuthRequest, AppAuthResponse, Result};
use crate::jwt::{Claims, generate_token, validate_token};
use serde_json::json;
use spring_web::axum::Json;
use spring_web::extractor::Path;
use spring_web::route;
use crate::database::model::{App};
use crate::database::setup::Database;
use crate::database::setup::get_db;


#[route("/admin/app/save", method = "POST")]
async fn add(Json(request): Json<AdminAppSaveRequest>) -> Json<Result> {
    log::info!("request.app_name:{},app_key:{},app_secret:{},state:{}",
        &request.app_name, &request.app_key, &request.app_secret, &request.state);
    let app = App {
        app_name: request.app_name,
        app_key: request.app_key,
        app_secret: request.app_secret,
        state: request.state,
    };
    let db = get_db();
    db.app_create(&app).expect("TODO: panic message");
    Json(Result::success_only_message("Ok".to_string()).into())
}

#[route("/admin/app/get/:app_key", method = "GET")]
async fn get_app_by_key(Path(app_key): Path<String>) -> Json<Result>  {
    let db = get_db();
    let mut response = AdminAppSaveRequest {
        app_name: "".to_string(),
        app_key: app_key.clone(),
        app_secret: "".to_string(),
        state: 0,
    };
    match db.app_get(&*app_key) {
        Ok(Some(app)) => {
            log::info!("App found: {:?}", app);
            response.app_key = app.app_key;
            response.app_name = app.app_name;
            response.app_secret = app.app_secret;
            response.state = app.state;
        },
        _ => {
            log::info!("App with key {} not found", app_key);
        },
    }

    Json(Result::success(json!(response)).into())
}

// validate app token
#[route("/admin/app/validate", method = "POST")]
async fn validate(Json(request): Json<AppAuthRequest>) -> Json<Result> {
    log::info!("request.app_key: {}", &request.app_key);
    let claims = validate_token(&request.app_key);
    if claims.is_err() {
        return Json(Result::fail(ResultCode::Error as i32, "Invalid app access token".to_string()).into(), );
    }
    log::info!("cliams: {:?}", claims);
    Json(Result::success(json!({"message": "App access token is valid"})).into())
}
