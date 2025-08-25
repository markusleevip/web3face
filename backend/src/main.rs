mod controller;
mod domain;
mod jwt;
mod database;

use spring::{App, auto_config};
use spring_web::{WebConfigurator, WebPlugin};
use crate::database::setup::close_db;

use crate::database::setup::Database;

#[auto_config(WebConfigurator)]
#[tokio::main]
async fn main() {
    Database::init("/data/web3face_db");
    App::new().add_plugin(WebPlugin).run().await;
    close_db();
}
