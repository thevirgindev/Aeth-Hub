use crate::models::BrowseResult;
use std::collections::HashMap;
use std::time::Instant;

const TTL_SECS: u64 = 300;

pub struct ApiCache {
    map: HashMap<String, (Instant, BrowseResult)>,
}

impl ApiCache {
    pub fn new() -> Self {
        Self { map: HashMap::new() }
    }

    pub fn get(&self, key: &str) -> Option<BrowseResult> {
        self.map.get(key).and_then(|(t, r)| {
            if t.elapsed().as_secs() < TTL_SECS {
                Some(r.clone())
            } else {
                None
            }
        })
    }

    pub fn set(&mut self, key: String, result: BrowseResult) {
        self.map.insert(key, (Instant::now(), result));
    }
}
