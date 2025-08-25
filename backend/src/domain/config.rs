use serde::Deserialize;
use spring::config::Configurable;

#[derive(Configurable, Deserialize)]
#[config_prefix = "config"]
pub struct CustomConfig {
    pub admin_ids: Vec<String>,
    pub sui_network: String,
}
