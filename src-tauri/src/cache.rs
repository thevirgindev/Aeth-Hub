use std::collections::HashMap;
use std::sync::Mutex;

pub struct Cache {
    store: Mutex<HashMap<String, CacheEntry>>,
}

struct CacheEntry {
    data: String,
    expires: i64,
}

impl Cache {
    pub fn new() -> Self { Self { store: Mutex::new(HashMap::new()) } }

    pub fn get(&self, key: &str) -> Option<String> {
        let store = self.store.lock().unwrap();
        let entry = store.get(key)?;
        let now = chrono::Utc::now().timestamp();
        if entry.expires > now {
            Some(entry.data.clone())
        } else {
            None
        }
    }

    pub fn set(&self, key: &str, data: &str, ttl_secs: i64) {
        let expires = chrono::Utc::now().timestamp() + ttl_secs;
        let mut store = self.store.lock().unwrap();
        store.insert(key.to_string(), CacheEntry { data: data.to_string(), expires });
    }
}
