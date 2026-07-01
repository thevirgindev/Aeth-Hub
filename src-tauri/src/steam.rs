use crate::models::{BrowseResult, CatalogItem};
use futures::future::join_all;
use reqwest::Client;
use serde::Deserialize;

const STORE: &str = "https://store.steampowered.com";

const POPULAR_IDS: &[i64] = &[
    730, 570, 440, 252490, 578080, 271590, 1623730, 1091500, 236390, 381210,
    1174180, 289070, 294100, 322170, 1085660, 413150, 427520, 252950, 306130, 275850,
    238960, 359550, 105600, 2050650, 1466860, 1938090, 1517290, 990080, 739630, 648800,
    1286830, 1599340, 221100, 814380, 377160, 881020, 1371580, 1811260, 526870, 39210,
];

async fn fetch_app_details(http: &Client, app_id: i64) -> Result<CatalogItem, String> {
    let url = format!("{}/api/appdetails?appids={}&cc=US&l=en", STORE, app_id);
    let resp = http.get(&url).send().await.map_err(|e| e.to_string())?;
    let data: serde_json::Value = resp.json().await.map_err(|e| e.to_string())?;
    let app = data.get(&app_id.to_string()).and_then(|v| v.get("data")).ok_or("no data")?;
    let name = app.get("name").and_then(|v| v.as_str()).unwrap_or("Unknown").to_string();
    let icon = app.get("header_image").and_then(|v| v.as_str()).unwrap_or("").to_string();
    let genre = app.pointer("/genres/0/description").and_then(|v| v.as_str()).unwrap_or("").to_string();
    let rating = app.pointer("/metacritic/score").and_then(|v| v.as_f64()).unwrap_or(0.0) as f32 / 10.0;
    Ok(CatalogItem {
        id: format!("steam-{}", app_id),
        title: name, poster: icon.clone(), year: 0, rating, genres: vec![],
        kind: "game".to_string(), tags: vec![],
        genre: Some(genre), status: None, eps: None,
        icon: Some(icon), size: None, repacker: None,
    })
}

pub async fn browse(http: &Client, _sort: &str, _page: usize, limit: usize) -> Result<BrowseResult, String> {
    let futures: Vec<_> = POPULAR_IDS.iter().take(limit).map(|&id| fetch_app_details(http, id)).collect();
    let results = join_all(futures).await;
    let items: Vec<_> = results.into_iter().filter_map(|r| r.ok()).collect();
    let total = items.len();
    Ok(BrowseResult { items, total })
}

pub async fn detail(http: &Client, app_id: &str) -> Result<serde_json::Value, String> {
    let url = format!("{}/api/appdetails?appids={}&cc=US&l=en", STORE, app_id);
    let resp = http.get(&url).send().await.map_err(|e| e.to_string())?;
    let data: serde_json::Value = resp.json().await.map_err(|e| e.to_string())?;
    data.get(app_id).and_then(|v| v.get("data")).cloned().ok_or("not found".to_string())
}

#[derive(Deserialize)]
#[allow(dead_code)]
struct SearchResponse {
    items: Vec<SearchItem>,
    total_count: usize,
}

#[derive(Deserialize)]
#[allow(dead_code)]
struct SearchItem {
    id: i64,
    name: String,
    tiny_image: String,
    #[serde(rename = "type")]
    item_type: Option<String>,
}

pub async fn search(http: &Client, query: &str, _page: usize, limit: usize) -> Result<BrowseResult, String> {
    let url = format!("{}/api/storesearch?term={}&l=en&cc=US", STORE, query);
    let resp = http.get(&url).send().await.map_err(|e| e.to_string())?;
    let data: SearchResponse = resp.json().await.map_err(|e| e.to_string())?;
    let items: Vec<CatalogItem> = data.items.into_iter().filter(|i| i.item_type.as_deref() == Some("app")).map(|i| CatalogItem {
        id: format!("steam-{}", i.id),
        title: i.name,
        poster: String::new(),
        year: 0,
        rating: 0.0,
        genres: vec![],
        kind: "game".to_string(),
        tags: vec![],
        genre: None, status: None, eps: None,
        icon: Some(i.tiny_image),
        size: None, repacker: None,
    }).collect();
    let total = items.len();
    let end = std::cmp::min(limit, items.len());
    Ok(BrowseResult { items: items[..end].to_vec(), total })
}
