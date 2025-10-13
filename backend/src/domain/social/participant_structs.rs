use serde::{Deserialize, Serialize};

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct TaskParticipation {
    pub id: String,
    pub task_id: String,
    pub user_public_key: String,
    pub submission_url: String,
    pub submission_text: String,
    pub status: String, // "pending", "approved", "rejected"
    pub submitted_at: String,
    pub reviewed_at: Option<String>,
    pub reviewer_notes: Option<String>,
}

#[derive(Debug, Deserialize)]
pub struct SubmitParticipationRequest {
    pub task_id: String,
    pub submission_url: String,
    pub submission_text: String,
}

#[derive(Debug, Serialize)]
pub struct UserParticipationsResponse {
    pub participations: Vec<TaskParticipation>,
}
