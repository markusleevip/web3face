use crate::domain::dto::Result;
use crate::domain::config;
use crate::domain::social::structs::{TweetInfo, XApiResponse, PromotionTask};
use crate::database::setup::{get_db, Database};
use spring_web::{axum::Json, route};
use spring_web::extractor::{Config, Path};
use serde::{Deserialize, Serialize};
use regex::Regex;
use reqwest::Client;
use rusty_leveldb::LdbIterator;
use std::time::{SystemTime, UNIX_EPOCH};
use uuid::Uuid;

#[derive(Debug, Deserialize)]
pub struct PromotionRequest {
    url: String,
}

#[route("/promotion/:platform", method = "POST")]
async fn get_promotion_info(
    Path(platform): Path<String>,
    Config(config): Config<config::CustomConfig>,
    Json(request): Json<PromotionRequest>
) -> Json<Result> {
    match platform.as_str() {
        "x" => {
            // 从URL中提取推文ID
            let tweet_id = match extract_x_tweet_id(&request.url) {
                Some(id) => id,
                None => {
                    return Json(Result::fail(400, "Invalid X.com URL".to_string()));
                }
            };

            // 调用X.com API
            match fetch_x_tweet_info(&tweet_id, &config.api_x_bearer_token).await {
                Ok(tweet_info) => {
                    Json(Result::success(serde_json::to_value(tweet_info).unwrap()))
                }
                Err(e) => {
                    println!("Error fetching tweet info: {}", e);
                    Json(Result::fail(500, format!("Failed to fetch tweet information: {}", e)))
                }
            }
        }
        _ => Json(Result::fail(400, format!("Unsupported platform: {}", platform)))
    }
}

fn extract_x_tweet_id(url: &str) -> Option<String> {
    let patterns = [
        r"https?://(?:www\.)?x\.com/[^/]+/status/(\d+)",
        r"https?://(?:www\.)?twitter\.com/[^/]+/status/(\d+)",
    ];

    for pattern in patterns.iter() {
        let re = Regex::new(pattern).unwrap();
        if let Some(captures) = re.captures(url) {
            if let Some(tweet_id) = captures.get(1) {
                return Some(tweet_id.as_str().to_string());
            }
        }
    }

    None
}

async fn fetch_x_tweet_info(tweet_id: &str, bearer_token: &str) -> std::result::Result<TweetInfo, Box<dyn std::error::Error>> {
    let client = Client::new();

    let url = format!(
        "https://api.x.com/2/tweets?ids={}&user.fields=username,name,description,public_metrics&expansions=author_id&tweet.fields=public_metrics,created_at",
        tweet_id
    );

    let response = client
        .get(&url)
        .header("Authorization", format!("Bearer {}", bearer_token))
        .send()
        .await?;

    if !response.status().is_success() {
        return Err(format!("API request failed with status: {}", response.status()).into());
    }

    let api_response: XApiResponse = response.json().await?;

    if let Some(tweets) = api_response.data {
        if let Some(tweet) = tweets.first() {
let mut tweet_info = TweetInfo {
    id: tweet.id.clone(),
    text: tweet.text.clone(),
    author_id: tweet.author_id.clone(),
    author_name: String::new(),
    author_username: String::new(),
    author_description: String::new(),
    author_followers_count: 0,
    author_following_count: 0,
    author_tweet_count: 0,
    author_like_count: 0,
    author_media_count: 0,
    retweet_count: tweet.public_metrics.retweet_count,
    reply_count: tweet.public_metrics.reply_count,
    like_count: tweet.public_metrics.like_count,
    quote_count: tweet.public_metrics.quote_count,
    view_count: tweet.public_metrics.impression_count,
    created_at: tweet.created_at.clone(),
};

            // 获取用户信息
            if let Some(includes) = api_response.includes {
                if let Some(users) = includes.users {
                    if let Some(user) = users.iter().find(|u| u.id == tweet.author_id) {
                        tweet_info.author_name = user.name.clone();
                        tweet_info.author_username = user.username.clone();
                        tweet_info.author_description = user.description.clone();
                        tweet_info.author_followers_count = user.public_metrics.followers_count;
                        tweet_info.author_following_count = user.public_metrics.following_count;
                        tweet_info.author_tweet_count = user.public_metrics.tweet_count;
                        tweet_info.author_like_count = user.public_metrics.like_count;
                        tweet_info.author_media_count = user.public_metrics.media_count;
                    }
                }
            }

            return Ok(tweet_info);
        }
    }

    Err("No tweet data found".into())
}

#[derive(Debug, Deserialize)]
pub struct CreatePromotionTaskRequest {
    pub platform: String,
    pub url: String,
    pub name: String,
    pub title: String,
    pub description: String,
    pub reward: u64,
    pub deadline: String,
    pub requirements: Vec<String>,
    pub created_by: String,
}

#[route("/promotion/tasks", method = "POST")]
async fn create_promotion_task(
    Json(request): Json<CreatePromotionTaskRequest>
) -> Json<Result> {
    let db = get_db();
    let mut db_guard = db.db.lock().unwrap();

    let task_id = Uuid::new_v4().to_string();
    let created_at = SystemTime::now()
        .duration_since(UNIX_EPOCH)
        .unwrap()
        .as_secs()
        .to_string();

    let promotion_task = PromotionTask {
        id: task_id.clone(),
        platform: request.platform,
        url: request.url,
        name: request.name,
        title: request.title,
        description: request.description,
        reward: request.reward,
        status: "active".to_string(),
        deadline: request.deadline,
        requirements: request.requirements,
        created_at,
        created_by: request.created_by,
        tweet_info: None,
    };

    // 序列化任务数据
    let task_data = serde_json::to_vec(&promotion_task).unwrap();
    
    // 保存到数据库，使用任务ID作为key
    db_guard.put(task_id.as_bytes(), &task_data).unwrap();

    Json(Result::success(serde_json::to_value(promotion_task).unwrap()))
}

#[route("/promotion/tasks", method = "GET")]
async fn get_promotion_tasks() -> Json<Result> {
    let db = get_db();
    let mut db_guard = db.db.lock().unwrap();

    let mut tasks: Vec<PromotionTask> = Vec::new();

    
    // 使用迭代器遍历所有key-value对
    let mut iter = db_guard.new_iter().unwrap();
    
    while let Some((key, value)) = iter.next() {
        // 尝试将key转换为字符串，如果是有效的UTF-8且看起来像UUID，则尝试解析为任务
        if let Ok(key_str) = std::str::from_utf8(&key) {
            // 简单检查key是否可能是UUID格式的任务ID
            if key_str.len() == 36 || Uuid::parse_str(key_str).is_ok() {
                match serde_json::from_slice::<PromotionTask>(&value) {
                    Ok(task) => {
                        tasks.push(task);
                    }
                    Err(e) => {
                        println!("Failed to deserialize task with key {}: {}", key_str, e);
                        // 跳过无法反序列化的数据
                        continue;
                    }
                }
            }
        }
    }
    

    
    // 临时解决方案：创建一个测试任务
    // let test_task = PromotionTask {
    //     id: "test-1".to_string(),
    //     platform: "x".to_string(),
    //     url: "https://x.com/test/status/1234567890".to_string(),
    //     name: "X平台内容推广".to_string(),
    //     title: "测试推广任务".to_string(),
    //     description: "这是一个测试推广任务".to_string(),
    //     reward: 50,
    //     status: "active".to_string(),
    //     deadline: "2025-10-20".to_string(),
    //     requirements: vec!["至少100个粉丝".to_string(), "包含指定标签".to_string()],
    //     created_at: SystemTime::now()
    //         .duration_since(UNIX_EPOCH)
    //         .unwrap()
    //         .as_secs()
    //         .to_string(),
    //     created_by: "test_user".to_string(),
    //     tweet_info: None,
    // };
    
    // tasks.push(test_task);


    
    Json(Result::success(serde_json::to_value(tasks).unwrap()))
}
