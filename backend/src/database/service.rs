use crate::database::model::{App};
use crate::database::setup::Database;
use rusty_leveldb::LdbIterator;

const PRODUCT_LIST_KEY: &str = "product_list";
const APP_KEY: &str = "app_key:";

impl Database {
    pub fn app_create(&self, app: &App) -> Result<(), String> {
        let mut db = self.db.lock().unwrap();
        let key = format!("{}{}", APP_KEY, app.app_key);
        let value = serde_json::to_string(app).map_err(|e| e.to_string())?;
        db.put(key.as_bytes(), value.as_bytes()).map_err(|e| e.to_string())?;
        db.flush().unwrap();
        Ok(())
    }

    pub fn app_get(&self, app_key: &str) -> Result<Option<App>, String> {
        let mut db = self.db.lock().unwrap();
        let key = format!("{}{}", APP_KEY, app_key);
        match db.get(key.as_bytes()) {
            Some(value) => {
                let app: App = serde_json::from_slice(&value).map_err(|e| e.to_string())?;
                Ok(Some(app))
            },
            None => Ok(None),
        }
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use std::time;
    use crate::database::model::{App};

    #[test]
    fn test_app_create() -> Result<(), String> {
        let db = Database::new("/data/web3face_db_test");
        let app = App {
            app_name: "test".to_string(),
            app_key: "test_app".to_string(),
            app_secret: "".to_string(),
            state: 0,
        };
        db.app_create(&app)
    }

    #[test]
    fn test_app_get() -> Result<(), String> {
        let db = Database::new("/data/web3face_db_test");
        let app_key = "test_app";
        match db.app_get(app_key) {
            Ok(Some(app)) => {
                println!("App found: {:?}", app);
                Ok(())
            },
            Ok(None) => Err(format!("App with key {} not found", app_key)),
            Err(e) => Err(e),
        }
    }

}
