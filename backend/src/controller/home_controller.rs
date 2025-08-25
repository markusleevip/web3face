use spring_web::axum::response::Html;
use spring_web::get;
use std::fs;
use std::str::FromStr;
use sui_sdk::types::base_types::SuiAddress;
use sui_sdk::types::crypto::{Signature,SuiSignature};
use shared_crypto::intent::{Intent, IntentMessage};

#[get("/")]
async fn hello_world() -> Html<String> {

    let sign_msg = "Sign in to Web3Face";
    let address_str = "0x61be9edeb2d47ca75ad15573cc50bbc2ae1cd03dfcb09986a7b788ff81f6b436";
    let sign = Signature::from_str("AJFWhdzQqR5dffDm54v3o0ZsKjAPDVJ3rpCN/R17XZ0dU1f0n9Nn8tTZNoew6QQ8slsVyGAzba54eD6eTtnLdAN8IMa176wRd8gxeEKLk/MnCRR9/CvQPqL+e935bFAxmQ==").unwrap();

    let address = SuiAddress::from_str(address_str.trim_start_matches("0x")).unwrap();
    let intent_msg = IntentMessage::new(Intent::personal_message(), sign_msg);
     
    let res = sign.verify_secure(&intent_msg, address, sui_types::crypto::SignatureScheme::ED25519);
    match res {
        Ok(_) => {
            println!("✅ Signature verification SUCCESS for address: {}", address_str);
        }
        Err(e) => {
            println!("❌ Signature verification FAILED for address: {}", address_str);
            println!("Error details: {}", e);
            println!("Signature debug: {:?}", sign);
            println!("Public key: {:?}", address);
        }
    }
    println!("=== Signature verification completed ===");
    match fs::read_to_string("static/index.html") {
        Ok(html) => Html(html),
        Err(_) => Html("404 Not find page".to_string()),
    }
}
