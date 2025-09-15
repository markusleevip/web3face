use serde::{Deserialize, Serialize};

#[derive(Debug, Serialize, Deserialize)]
pub struct TweetInfo {
    pub id: String,
    pub text: String,
    pub author_id: String,
    pub author_name: String,
    pub author_username: String,
    pub author_description: String,
    pub author_followers_count: u64,
    pub author_following_count: u64,
    pub author_tweet_count: u64,
    pub author_like_count: u64,
    pub author_media_count: u64,
    pub retweet_count: u64,
    pub reply_count: u64,
    pub like_count: u64,
    pub quote_count: u64,
    pub view_count: u64,
    pub created_at: String,
}

#[derive(Debug, Deserialize)]
pub struct XApiResponse {
    pub data: Option<Vec<TweetData>>,
    pub includes: Option<Includes>,
}

#[derive(Debug, Deserialize)]
pub struct TweetData {
    pub id: String,
    pub text: String,
    pub author_id: String,
    pub public_metrics: PublicMetrics,
    pub created_at: String,
}

#[derive(Debug, Deserialize)]
pub struct Includes {
    pub users: Option<Vec<UserData>>,
}

#[derive(Debug, Deserialize)]
pub struct UserData {
    pub id: String,
    pub name: String,
    pub username: String,
    pub description: String,
    pub public_metrics: UserPublicMetrics,
}

#[derive(Debug, Deserialize)]
pub struct PublicMetrics {
    pub retweet_count: u64,
    pub reply_count: u64,
    pub like_count: u64,
    pub quote_count: u64,
    pub impression_count: u64,
}

#[derive(Debug, Deserialize)]
pub struct UserPublicMetrics {
    pub followers_count: u64,
    pub following_count: u64,
    pub tweet_count: u64,
    pub like_count: u64,
    pub media_count: u64,
}
