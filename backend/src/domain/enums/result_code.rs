#[derive(Debug)]
pub enum ResultCode {
    Success = 200,
    Error = 9999,
    Unauthorized = 401,
}

impl ResultCode {
    pub fn from_i32(value: i32) -> Option<Self> {
        match value {
            200 => Some(ResultCode::Success),
            9999 => Some(ResultCode::Error),
            401 => Some(ResultCode::Unauthorized),
            _ => None,
        }
    }
}
