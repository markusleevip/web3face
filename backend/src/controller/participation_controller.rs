use crate::domain::dto::Result;
use crate::domain::social::participant_structs::{TaskParticipation, SubmitParticipationRequest, UserParticipationsResponse};
use crate::database::setup::get_db;
use crate::jwt::Claims;
use spring_web::{axum::Json, route};
use rusty_leveldb::LdbIterator;

use std::time::{SystemTime, UNIX_EPOCH};
use uuid::Uuid;

#[route("/participation", method = "POST")]
async fn submit_participation(
    claims: Claims,
    Json(request): Json<SubmitParticipationRequest>
) -> Json<Result> {
    let db = get_db();
    let mut db_guard = db.db.lock().unwrap();
    
    let user_public_key = claims.sub;
    
    let participation_id = Uuid::new_v4().to_string();
    let submitted_at = SystemTime::now()
        .duration_since(UNIX_EPOCH)
        .unwrap()
        .as_secs()
        .to_string();

    let participation = TaskParticipation {
        id: participation_id.clone(),
        task_id: request.task_id,
        user_public_key,
        submission_url: request.submission_url,
        submission_text: request.submission_text,
        status: "pending".to_string(),
        submitted_at,
        reviewed_at: None,
        reviewer_notes: None,
    };

    // 序列化参与数据
    let participation_data = serde_json::to_vec(&participation).unwrap();
    
    // 保存到数据库，使用参与ID作为key
    db_guard.put(participation_id.as_bytes(), &participation_data).unwrap();

    Json(Result::success(serde_json::to_value(participation).unwrap()))
}

#[route("/participation/user", method = "GET")]
async fn get_user_participations(claims: Claims) -> Json<Result> {
    let db = get_db();
    let mut db_guard = db.db.lock().unwrap();

    let mut participations: Vec<TaskParticipation> = Vec::new();
    
    // 这里需要从JWT token中获取用户信息，暂时使用模拟数据
    let user_public_key = claims.sub;

    // 使用迭代器遍历数据库中的所有参与记录
    let mut iter = db_guard.new_iter().unwrap();
    
    while let Some((_key, value)) = iter.next() {
        // Convert key and value to Vec<u8> if they are not already
        let value: Vec<u8> = value.to_vec();
        match serde_json::from_slice::<TaskParticipation>(&value) {
            Ok(participation) => {
                if participation.user_public_key == user_public_key {
                    participations.push(participation);
                }
            }
            Err(_) => {
                continue;
            }
        }
    }

    let response = UserParticipationsResponse {
        participations,
    };

    Json(Result::success(serde_json::to_value(response).unwrap()))
}

#[route("/participation/:participation_id/approve", method = "PUT")]
async fn approve_participation(
    spring_web::extractor::Path(participation_id): spring_web::extractor::Path<String>,
    claims: Claims
) -> Json<Result> {
    let db = get_db();
    let mut db_guard = db.db.lock().unwrap();

    // 查找参与记录
    match db_guard.get(participation_id.as_bytes()) {
        Some(value) => {
            let mut participation: TaskParticipation = serde_json::from_slice(&value).unwrap();
            
            // 更新状态为已批准
            participation.status = "approved".to_string();
            participation.reviewed_at = Some(
                SystemTime::now()
                    .duration_since(UNIX_EPOCH)
                    .unwrap()
                    .as_secs()
                    .to_string()
            );
            
            // 保存更新后的记录
            let updated_data = serde_json::to_vec(&participation).unwrap();
            db_guard.put(participation_id.as_bytes(), &updated_data).unwrap();
            
            Json(Result::success(serde_json::to_value(participation).unwrap()))
        }
        None => {
            Json(Result::error("Participation not found".to_string()))
        }
    }
}

#[route("/participation/:participation_id/reject", method = "PUT")]
async fn reject_participation(
    spring_web::extractor::Path(participation_id): spring_web::extractor::Path<String>,
    claims: Claims
) -> Json<Result> {
    let db = get_db();
    let mut db_guard = db.db.lock().unwrap();

    // 查找参与记录
    match db_guard.get(participation_id.as_bytes()) {
        Some(value) => {
            let mut participation: TaskParticipation = serde_json::from_slice(&value).unwrap();
            
            // 更新状态为已拒绝
            participation.status = "rejected".to_string();
            participation.reviewed_at = Some(
                SystemTime::now()
                    .duration_since(UNIX_EPOCH)
                    .unwrap()
                    .as_secs()
                    .to_string()
            );
            
            // 保存更新后的记录
            let updated_data = serde_json::to_vec(&participation).unwrap();
            db_guard.put(participation_id.as_bytes(), &updated_data).unwrap();
            
            Json(Result::success(serde_json::to_value(participation).unwrap()))
        }
        None => {
            Json(Result::error("Participation not found".to_string()))
        }
    }
}

#[route("/participation/task/:task_id", method = "GET")]
async fn get_task_participations(
    spring_web::extractor::Path(task_id): spring_web::extractor::Path<String>,
    claims: Claims
) -> Json<Result> {
    let db = get_db();
    let mut db_guard = db.db.lock().unwrap();

    let mut participations: Vec<TaskParticipation> = Vec::new();

    // 使用迭代器遍历数据库中的所有参与记录
    let mut iter = db_guard.new_iter().unwrap();
    
    while let Some((_key, value)) = iter.next() {
        let value: Vec<u8> = value.to_vec();
        match serde_json::from_slice::<TaskParticipation>(&value) {
            Ok(participation) => {
                // 只返回指定任务的参与记录
                if participation.task_id == task_id {
                    participations.push(participation);
                }
            }
            Err(_) => {
                continue;
            }
        }
    }

    let response = UserParticipationsResponse {
        participations,
    };

    Json(Result::success(serde_json::to_value(response).unwrap()))
}
