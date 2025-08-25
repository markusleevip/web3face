use once_cell::sync::OnceCell;
use rusty_leveldb::{Options, DB};
use std::path::Path;
use std::sync::{Arc, Mutex};

#[derive(Clone)]
pub struct Database {
    pub db: Arc<Mutex<DB>>,
}

impl Database {
    pub fn new(db_path: &str) -> Self {
        let path = Path::new(db_path);
        let mut options = Options::default();
        options.create_if_missing = true;
        let db = Arc::new(Mutex::new(DB::open(path, options).unwrap()));
        Database { db }
    }

    pub fn init(db_path: &str) -> &'static Self {
        let path = Path::new(db_path);
        let mut options = Options::default();
        options.create_if_missing = true;
        let db = Arc::new(Mutex::new(DB::open(path, options).unwrap()));
        GLOBAL_DB.get_or_init(|| Database { db })
    }
}

// global storage for database
pub static GLOBAL_DB: OnceCell<Database> = OnceCell::new();

// Get the database instance
pub fn get_db() -> &'static Database {
    GLOBAL_DB.get().expect("Database not initialized")
}

pub fn close_db() {
    let db = GLOBAL_DB.get().expect("Database not initialized");
    db.db.lock().unwrap().close().unwrap();
}
