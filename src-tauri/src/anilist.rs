use crate::models::{BrowseResult, CatalogItem};
use reqwest::Client;
use serde_json::{json, Value};

const API: &str = "https://graphql.anilist.co";

const BROWSE_QUERY: &str = r#"
query ($page: Int, $perPage: Int, $genre: String, $sort: [MediaSort], $type: MediaType) {
  Page(page: $page, perPage: $perPage) {
    pageInfo { total }
    media(type: $type, genre: $genre, sort: $sort, isAdult: false) {
      id title { romaji english }
      coverImage { large }
      averageScore
      genres
      episodes
      chapters
      status
      seasonYear
      description
    }
  }
}"#;

const SEARCH_QUERY: &str = r#"
query ($page: Int, $perPage: Int, $search: String, $type: MediaType) {
  Page(page: $page, perPage: $perPage) {
    pageInfo { total }
    media(type: $type, search: $search, isAdult: false) {
      id title { romaji english }
      coverImage { large }
      averageScore
      genres
      episodes
      chapters
      status
      seasonYear
      description
    }
  }
}"#;

const DETAIL_QUERY: &str = r#"
query ($id: Int, $type: MediaType) {
  Media(id: $id, type: $type) {
    id title { romaji english native }
    coverImage { large extraLarge }
    bannerImage
    averageScore
    genres
    episodes
    chapters
    duration
    status
    seasonYear
    description
    tags { name }
  }
}"#;

fn anilist_sort(sort: &str) -> Value {
    match sort {
        "rating" => json!("SCORE_DESC"),
        "year" => json!("START_DATE_DESC"),
        "title" => json!("TITLE_ROMAJI"),
        "title-desc" => json!("TITLE_ROMAJI_DESC"),
        _ => json!("TRENDING_DESC"),
    }
}

fn anilist_item_to_catalog(item: &Value, kind: &str) -> Option<CatalogItem> {
    let title_obj = item.get("title")?;
    let title = title_obj.get("english")
        .or_else(|| title_obj.get("romaji"))
        .and_then(|v| v.as_str()).unwrap_or("Unknown").to_string();
    let poster = item.pointer("/coverImage/large")
        .and_then(|v| v.as_str()).unwrap_or("").to_string();
    let rating = item.get("averageScore")
        .and_then(|v| v.as_f64()).map(|v| (v as f32) / 10.0).unwrap_or(0.0);
    let year = item.get("seasonYear").and_then(|v| v.as_i64()).unwrap_or(0) as i32;
    let genres: Vec<String> = item.get("genres")
        .and_then(|v| v.as_array())
        .map(|arr| arr.iter().filter_map(|g| g.as_str().map(String::from)).collect())
        .unwrap_or_default();
    let status = item.get("status").and_then(|v| v.as_str()).unwrap_or("").to_string();
    let eps = item.get("episodes").and_then(|v| v.as_i64()).unwrap_or(0) as i32;
    let id = item.get("id").and_then(|v| v.as_i64()).unwrap_or(0);
    Some(CatalogItem {
        id: format!("anilist-{}", id),
        title, poster, year, rating, genres,
        kind: kind.to_string(), tags: vec![],
        genre: None, status: Some(status), eps: Some(eps),
        icon: None, size: None, repacker: None,
    })
}

pub async fn browse(http: &Client, genre: &str, sort: &str, page: usize, limit: usize, media_type: &str) -> Result<BrowseResult, String> {
    let genre_val = if genre != "All" { json!(genre) } else { json!(null) };
    let body = json!({
        "query": BROWSE_QUERY,
        "variables": {
            "page": page,
            "perPage": limit,
            "genre": genre_val,
            "sort": [anilist_sort(sort)],
            "type": media_type,
        }
    });
    let resp = http.post(API).json(&body).send().await.map_err(|e| e.to_string())?;
    let data: Value = resp.json().await.map_err(|e| e.to_string())?;
    let page = data.pointer("/data/Page").ok_or("missing Page")?;
    let total = page.pointer("/pageInfo/total").and_then(|v| v.as_i64()).unwrap_or(0) as usize;
    let kind = if media_type == "MANGA" { "manga" } else { "anime" };
    let items: Vec<CatalogItem> = page.get("media")
        .and_then(|v| v.as_array())
        .map(|arr| arr.iter().filter_map(|m| anilist_item_to_catalog(m, kind)).collect())
        .unwrap_or_default();
    Ok(BrowseResult { items, total })
}

pub async fn detail(http: &Client, anilist_id: &str, media_type: &str) -> Result<Value, String> {
    let id: i64 = anilist_id.parse().map_err(|_| "invalid id".to_string())?;
    let body = json!({
        "query": DETAIL_QUERY,
        "variables": { "id": id, "type": media_type }
    });
    let resp = http.post(API).json(&body).send().await.map_err(|e| e.to_string())?;
    let data: Value = resp.json().await.map_err(|e| e.to_string())?;
    data.pointer("/data/Media").cloned().ok_or("not found".to_string())
}

pub async fn exchange_code(http: &Client, code: &str) -> Result<String, String> {
    let params = serde_json::json!({
        "grant_type": "authorization_code",
        "client_id": "20915",
        "client_secret": null,
        "redirect_uri": "aethhub://callback",
        "code": code,
    });
    let resp = http.post("https://anilist.co/api/v2/oauth/token")
        .json(&params)
        .send().await.map_err(|e| e.to_string())?;
    let data: Value = resp.json().await.map_err(|e| e.to_string())?;
    data.get("access_token")
        .and_then(|v| v.as_str().map(String::from))
        .ok_or_else(|| "No access_token in response".to_string())
}

pub async fn sync_anilist(http: &Client, token: &str, media_id: i64, score: i32, status: &str, progress: Option<i32>) -> Result<(), String> {
    let mutation = r#"
        mutation ($mediaId: Int, $score: Int, $status: MediaListStatus, $progress: Int) {
            SaveMediaListEntry(mediaId: $mediaId, score: $score, status: $status, progress: $progress) { id }
        }
    "#;
    let mut variables = serde_json::json!({
        "mediaId": media_id,
        "score": score,
        "status": status.to_uppercase(),
    });
    if let Some(p) = progress {
        variables["progress"] = serde_json::json!(p);
    }
    let body = serde_json::json!({ "query": mutation, "variables": variables });
    let resp = http.post("https://graphql.anilist.co")
        .header("Authorization", format!("Bearer {}", token))
        .json(&body)
        .send().await.map_err(|e| e.to_string())?;
    let data: Value = resp.json().await.map_err(|e| e.to_string())?;
    if data.get("errors").is_some() {
        return Err("AniList API error".to_string());
    }
    Ok(())
}

pub async fn search(http: &Client, query: &str, page: usize, limit: usize, media_type: &str) -> Result<BrowseResult, String> {
    let body = json!({
        "query": SEARCH_QUERY,
        "variables": { "page": page, "perPage": limit, "search": query, "type": media_type }
    });
    let resp = http.post(API).json(&body).send().await.map_err(|e| e.to_string())?;
    let data: Value = resp.json().await.map_err(|e| e.to_string())?;
    let page = data.pointer("/data/Page").ok_or("missing Page")?;
    let total = page.pointer("/pageInfo/total").and_then(|v| v.as_i64()).unwrap_or(0) as usize;
    let kind = if media_type == "MANGA" { "manga" } else { "anime" };
    let items: Vec<CatalogItem> = page.get("media")
        .and_then(|v| v.as_array())
        .map(|arr| arr.iter().filter_map(|m| anilist_item_to_catalog(m, kind)).collect())
        .unwrap_or_default();
    Ok(BrowseResult { items, total })
}
