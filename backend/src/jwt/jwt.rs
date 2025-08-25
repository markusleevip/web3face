use axum_extra::headers::authorization::Bearer;
use axum_extra::headers::Authorization;
use axum_extra::TypedHeader;
use chrono::{Duration, Utc};
use jsonwebtoken::{Algorithm, DecodingKey, EncodingKey, Header, Validation};
use serde::{Deserialize, Serialize};
use spring_web::async_trait;
use spring_web::axum::http::request::Parts;
use spring_web::axum::RequestPartsExt;
use spring_web::error::{KnownWebError, WebError};

use spring_web::extractor::FromRequestParts;

const SECRET: &str = "web3face"; // Secret key for JWT

#[derive(Debug, Serialize, Deserialize)]
pub struct Claims {
    pub sub: String,
    pub exp: u64,
}

impl Claims {
    pub fn new(sub: String, exp: u64) -> Self {
        Self { sub, exp }
    }
}

#[async_trait]
impl<S> FromRequestParts<S> for Claims
where
    S: Send + Sync,
{
    type Rejection = WebError;
    async fn from_request_parts(
        parts: &mut Parts,
        _state: &S,
    ) -> Result<Self, Self::Rejection> {
        let TypedHeader(Authorization(bearer)) = parts
            .extract::<TypedHeader<Authorization<Bearer>>>()
            .await
            .map_err(|_| KnownWebError::bad_request("invalid token"))?;
        // Decode the user data
        let claims = decode(bearer.token())?;

        Ok(claims)
    }
}

// JWT encode
pub fn encode(claims: Claims) -> Result<String, WebError> {
    let header = Header::default();

    let token = jsonwebtoken::encode::<Claims>(
        &header,
        &claims,
        &EncodingKey::from_secret(SECRET.as_bytes()),
    )
    .map_err(|e| {
        tracing::error!("{:?}", e);
        KnownWebError::bad_request("encode invalid token")
    })?;

    Ok(token)
}

/// JWT decode
pub fn decode(token: &str) -> Result<Claims, WebError> {
    let validation = Validation::new(Algorithm::HS256);
    let token_data = jsonwebtoken::decode::<Claims>(
        &token,
        &DecodingKey::from_secret(SECRET.as_bytes()),
        &validation,
    )
    .map_err(|e| {
        tracing::error!("{:?}", e);
        KnownWebError::bad_request("decode invalid token")
    })?;
    Ok(token_data.claims)
}

// Generate JWT
pub fn generate_token(user_id: &str) -> Result<String, WebError> {
    let expiration = Utc::now()
        .checked_add_signed(Duration::days(1800))
        .expect("Invalid timestamp")
        .timestamp() as u64;

    let claims = Claims::new(user_id.to_owned(), expiration);
    encode(claims)
}

// Validate JWT
pub fn validate_token(token: &str) -> Result<Claims, WebError> {
    let claims = decode(token)?;

    let now = Utc::now().timestamp() as u64;
    if claims.exp < now {
        return Err(WebError::from(KnownWebError::unauthorized("token expired")));
    }

    Ok(claims)
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_generate_token() {
        let token = generate_token("user1").unwrap();
        println!("{}", token);
        let claims = decode(&token).unwrap();
        assert_eq!(claims.sub, "user1");
    }

    #[test]
    fn test_validate_token() {
        let token = generate_token("user1").unwrap();
        let claims = validate_token(&token).unwrap();
        println!("Claims: {:?}", claims);
        assert_eq!(claims.sub, "user1");
    }
}
