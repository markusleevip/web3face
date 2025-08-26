use crate::domain::dto::Result;
use crate::domain::{LoginRequest,LoginResponse};
use crate::domain::enums::ResultCode;
use crate::jwt::{generate_token, Claims};
use spring_web::{axum::Json, route};
use std::str::FromStr;
use sui_sdk::types::base_types::SuiAddress;
use sui_sdk::types::crypto::{Signature,SuiSignature};
use shared_crypto::intent::{Intent, IntentMessage};

#[route("/auth", method = "POST")]
async fn auth(Json(login_request): Json<LoginRequest>) -> Json<Result> {

    let sign_text = &login_request.sign_text;
    let address_str = &login_request.public_key;
    println!("Received login request for address: {}", &login_request.sign);
    let sign = Signature::from_str(&login_request.sign).unwrap();
    let address = SuiAddress::from_str(address_str.trim_start_matches("0x")).unwrap();
    let intent_text = IntentMessage::new(Intent::personal_message(), sign_text);
    let res = sign.verify_secure(&intent_text, address, sui_types::crypto::SignatureScheme::ED25519);
    match res {
        Ok(_) => {
            println!("Signature verification SUCCESS for address: {}", address_str);
            let token = generate_token(address_str).unwrap();
            let login_response  = LoginResponse {
                public_key: address_str.clone(),
                nickname: "guest".to_string(),
                token,
                is_admin: false,
            };
            Json(Result::success(serde_json::to_value(login_response).unwrap()).into())            
        }
        Err(e) => {
            println!("Signature verification FAILED for address: {}", address_str);
            println!("Error details: {}", e);
            println!("Signature debug: {:?}", sign);
            println!("Public key: {:?}", address);
            return Json(Result::fail(ResultCode::Error as i32, "Signature verification failed".to_string()).into());
        }
    }    
}