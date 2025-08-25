#[derive(Debug, Clone, PartialEq, Eq)]
pub enum PaymentStatus {
    Pending,
    Success,
    Failed,
    Closed,
    Processed,
}

impl PaymentStatus {
    pub fn as_str(&self) -> &'static str {
        match self {
            PaymentStatus::Pending => "pending",
            PaymentStatus::Success => "success",
            PaymentStatus::Failed => "failed",
            PaymentStatus::Closed => "closed",
            PaymentStatus::Processed => "processed",
        }
    }
}

#[derive(Debug, Clone, PartialEq, Eq)]
pub enum OrderStatus {
    Pending,
    Success,
    Failed,
    Closed,
}

impl OrderStatus {
    pub fn as_str(&self) -> &'static str {
        match self {
            OrderStatus::Pending => "pending",
            OrderStatus::Success => "success",
            OrderStatus::Failed => "failed",
            OrderStatus::Closed => "closed",
        }
    }
}
