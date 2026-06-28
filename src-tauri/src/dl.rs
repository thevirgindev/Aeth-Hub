use std::collections::HashMap;
use std::sync::Mutex;
use crate::models::{DlItem, DlStat};

pub struct DlMgr {
    items: Mutex<HashMap<String, DlItem>>,
}

impl DlMgr {
    pub fn new() -> Self { Self { items: Mutex::new(HashMap::new()) } }

    pub fn list(&self) -> Vec<DlItem> {
        let items = self.items.lock().unwrap();
        let mut vec: Vec<DlItem> = items.values().cloned().collect();
        vec.sort_by(|a, b| a.id.cmp(&b.id));
        vec
    }

    pub fn add(&self, item: DlItem) {
        let mut items = self.items.lock().unwrap();
        items.insert(item.id.clone(), item);
    }

    pub fn update(&self, id: &str, progress: f32, speed: &str, eta: &str, status: DlStat) {
        let mut items = self.items.lock().unwrap();
        if let Some(item) = items.get_mut(id) {
            item.progress = progress;
            item.speed = speed.to_string();
            item.eta = eta.to_string();
            item.status = status;
        }
    }

    pub fn remove(&self, id: &str) {
        let mut items = self.items.lock().unwrap();
        items.remove(id);
    }
}
