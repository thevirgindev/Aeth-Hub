use crate::anilist;
use crate::cache::ApiCache;
use crate::comments;
use crate::db;
use crate::discord::DiscordRpc;
use crate::dl::DlMgr;
use crate::imgproxy;
use crate::models::*;
use crate::omdb;
use crate::player;
use crate::scrapers::torrents;
use crate::steam;
use crate::streamer::Streamer;

use reqwest::Client;
use sqlx::SqlitePool;
use std::sync::Mutex;
use tauri::State;

pub fn sanitize_error(e: &str) -> String {
    e.replace(std::env::current_exe().unwrap_or_default().to_string_lossy().as_ref(), "[binary]")
}

pub struct AppState {
    pub dl: DlMgr,
    pub db: SqlitePool,
    pub http: Client,
    pub discord: Mutex<DiscordRpc>,
    pub streamer: Streamer,
    pub cache: Mutex<ApiCache>,
}


fn to_catalog_item(kind: &str, id: &str, title: &str, poster: &str, year: i32, rating: f32, genres: &[String], tags: &[String]) -> CatalogItem {
    CatalogItem {
        id: id.to_string(), title: title.to_string(), poster: poster.to_string(),
        year, rating, genres: genres.to_vec(), kind: kind.to_string(), tags: tags.to_vec(),
        genre: None, status: None, eps: None, icon: None, size: None, repacker: None,
    }
}

#[tauri::command]
pub async fn browse_catalog(state: State<'_, AppState>, kind: String, genre: String, sort: String, offset: usize, limit: usize) -> Result<BrowseResult, String> {
    let cache_key = format!("browse:{}:{}:{}:{}", kind, genre, sort, offset / limit.max(1));
    {
        let cache = state.cache.lock().unwrap();
        if let Some(r) = cache.get(&cache_key) {
            return Ok(r);
        }
    }
    let page = (offset / limit.max(1)) + 1;
    match kind.as_str() {
        "anime" => {
            match anilist::browse(&state.http, &genre, &sort, page, limit, "ANIME").await {
                Ok(r) => {
                    state.cache.lock().unwrap().set(cache_key.clone(), r.clone());
                    return Ok(r);
                }
                Err(e) => { eprintln!("[browse] AniList anime failed: {}", e); return Err(sanitize_error(&e)); }
            }
        }
        "manga" => {
            match anilist::browse(&state.http, &genre, &sort, page, limit, "MANGA").await {
                Ok(r) => {
                    state.cache.lock().unwrap().set(cache_key.clone(), r.clone());
                    return Ok(r);
                }
                Err(e) => { eprintln!("[browse] AniList manga failed: {}", e); return Err(sanitize_error(&e)); }
            }
        }
        "game" => {
            match steam::browse(&state.http, &sort, page, limit).await {
                Ok(r) => {
                    state.cache.lock().unwrap().set(cache_key.clone(), r.clone());
                    return Ok(r);
                }
                Err(e) => { eprintln!("[browse] Steam failed: {}", e); return Err(sanitize_error(&e)); }
            }
        }
        "movie" => {
            let items = torrents::fetch_movie_catalog(&state.http, &state.db).await;
            let items: Vec<CatalogItem> = items.into_iter()
                .filter(|m| genre == "All" || m.genres.contains(&genre))
                .map(|m| to_catalog_item("movie", &m.id, &m.title, &m.poster, m.year, m.rating, &m.genres, &m.tags))
                .collect();
            let mut sorted = items;
            match sort.as_str() {
                "rating" => sorted.sort_by(|a, b| b.rating.partial_cmp(&a.rating).unwrap_or(std::cmp::Ordering::Equal)),
                "year" => sorted.sort_by(|a, b| b.year.cmp(&a.year)),
                "title" => sorted.sort_by(|a, b| a.title.cmp(&b.title)),
                "title-desc" => sorted.sort_by(|a, b| b.title.cmp(&a.title)),
                _ => {}
            }
            let total = sorted.len();
            let end = std::cmp::min(offset + limit, total);
            let items = if offset >= total { vec![] } else { sorted[offset..end].to_vec() };
            let result = BrowseResult { items, total };
            state.cache.lock().unwrap().set(cache_key, result.clone());
            return Ok(result);
        }
        "series" => {
            let items = torrents::fetch_series_catalog(&state.http, &state.db).await;
            let items: Vec<CatalogItem> = items.into_iter()
                .filter(|s| genre == "All" || s.genres.contains(&genre))
                .filter(|s| !s.is_kdrama)
                .map(|s| to_catalog_item("series", &s.id, &s.title, &s.poster, s.year, s.rating, &s.genres, &s.tags))
                .collect();
            let mut sorted = items;
            match sort.as_str() {
                "rating" => sorted.sort_by(|a, b| b.rating.partial_cmp(&a.rating).unwrap_or(std::cmp::Ordering::Equal)),
                "year" => sorted.sort_by(|a, b| b.year.cmp(&a.year)),
                "title" => sorted.sort_by(|a, b| a.title.cmp(&b.title)),
                "title-desc" => sorted.sort_by(|a, b| b.title.cmp(&a.title)),
                _ => {}
            }
            let total = sorted.len();
            let end = std::cmp::min(offset + limit, total);
            let items = if offset >= total { vec![] } else { sorted[offset..end].to_vec() };
            let result = BrowseResult { items, total };
            state.cache.lock().unwrap().set(cache_key, result.clone());
            return Ok(result);
        }
        "kdrama" => {
            let items = torrents::fetch_series_catalog(&state.http, &state.db).await;
            let items: Vec<CatalogItem> = items.into_iter()
                .filter(|s| genre == "All" || s.genres.contains(&genre))
                .filter(|s| s.is_kdrama)
                .map(|s| to_catalog_item("series", &s.id, &s.title, &s.poster, s.year, s.rating, &s.genres, &s.tags))
                .collect();
            let mut sorted = items;
            match sort.as_str() {
                "rating" => sorted.sort_by(|a, b| b.rating.partial_cmp(&a.rating).unwrap_or(std::cmp::Ordering::Equal)),
                "year" => sorted.sort_by(|a, b| b.year.cmp(&a.year)),
                "title" => sorted.sort_by(|a, b| a.title.cmp(&b.title)),
                "title-desc" => sorted.sort_by(|a, b| b.title.cmp(&a.title)),
                _ => {}
            }
            let total = sorted.len();
            let end = std::cmp::min(offset + limit, total);
            let items = if offset >= total { vec![] } else { sorted[offset..end].to_vec() };
            let result = BrowseResult { items, total };
            state.cache.lock().unwrap().set(cache_key, result.clone());
            return Ok(result);
        }
        "hentai" => {
            let items = torrents::fetch_hentai_catalog(&state.http, &state.db).await;
            let items: Vec<CatalogItem> = items.into_iter()
                .filter(|h| genre == "All" || h.genres.contains(&genre))
                .map(|h| CatalogItem {
                    id: h.id.clone(), title: h.title.clone(), poster: h.poster.clone(),
                    year: h.year, rating: h.rating, genres: h.genres.clone(),
                    kind: "hentai".to_string(), tags: h.tags.clone(),
                    genre: None, status: Some(h.status.clone()), eps: Some(h.eps),
                    icon: None, size: None, repacker: None,
                })
                .collect();
            let mut sorted = items;
            match sort.as_str() {
                "rating" => sorted.sort_by(|a, b| b.rating.partial_cmp(&a.rating).unwrap_or(std::cmp::Ordering::Equal)),
                "year" => sorted.sort_by(|a, b| b.year.cmp(&a.year)),
                "title" => sorted.sort_by(|a, b| a.title.cmp(&b.title)),
                "title-desc" => sorted.sort_by(|a, b| b.title.cmp(&a.title)),
                _ => {}
            }
            let total = sorted.len();
            let end = std::cmp::min(offset + limit, total);
            let items = if offset >= total { vec![] } else { sorted[offset..end].to_vec() };
            let result = BrowseResult { items, total };
            state.cache.lock().unwrap().set(cache_key, result.clone());
            return Ok(result);
        }
        _ => return Err(sanitize_error("invalid kind")),
    }
}

#[tauri::command]
pub async fn get_api_detail(state: State<'_, AppState>, kind: String, id: String) -> Result<serde_json::Value, String> {
    let inner = id.trim_start_matches("tmdb-").trim_start_matches("anilist-").trim_start_matches("steam-");
    match kind.as_str() {
        "movie" => {
            let title = {
                let items = torrents::fetch_movie_catalog(&state.http, &state.db).await;
                items.iter().find(|m| m.id == inner)
                    .map(|m| m.title.clone())
                    .unwrap_or_default()
            };
            if title.is_empty() {
                return Err(sanitize_error("Movie not found"));
            }
            match omdb::fetch_omdb(&title, None).await {
                Ok(omdb_movie) => {
                    let json = serde_json::to_value(&omdb_movie).map_err(|e| sanitize_error(&e.to_string()))?;
                    Ok(json)
                }
                Err(e) => Err(sanitize_error(&e)),
            }
        }
        "series" => {
            let title = {
                let items = torrents::fetch_series_catalog(&state.http, &state.db).await;
                items.iter().find(|s| s.id == inner)
                    .map(|s| s.title.clone())
                    .unwrap_or_default()
            };
            if title.is_empty() {
                return Err(sanitize_error("Series not found"));
            }
            match omdb::fetch_omdb(&title, None).await {
                Ok(omdb_movie) => {
                    let json = serde_json::to_value(&omdb_movie).map_err(|e| sanitize_error(&e.to_string()))?;
                    Ok(json)
                }
                Err(e) => Err(sanitize_error(&e)),
            }
        }
        "anime" => anilist::detail(&state.http, inner, "ANIME").await.map_err(|e| sanitize_error(&e)),
        "manga" => anilist::detail(&state.http, inner, "MANGA").await.map_err(|e| sanitize_error(&e)),
        "game" => steam::detail(&state.http, inner).await.map_err(|e| sanitize_error(&e)),
        _ => Err(sanitize_error("unknown kind")),
    }
}

#[tauri::command]
pub async fn browse_anilist(state: State<'_, AppState>, genre: String, sort: String, page: usize, limit: usize, media_type: String) -> Result<BrowseResult, String> {
    anilist::browse(&state.http, &genre, &sort, page, limit, &media_type).await
}

#[tauri::command]
pub async fn search_anilist(state: State<'_, AppState>, query: String, page: usize, limit: usize, media_type: String) -> Result<BrowseResult, String> {
    anilist::search(&state.http, &query, page, limit, &media_type).await
}

#[tauri::command]
pub async fn browse_steam(state: State<'_, AppState>, sort: String, page: usize, limit: usize) -> Result<BrowseResult, String> {
    steam::browse(&state.http, &sort, page, limit).await
}

#[tauri::command]
pub async fn search_steam(state: State<'_, AppState>, query: String, page: usize, limit: usize) -> Result<BrowseResult, String> {
    steam::search(&state.http, &query, page, limit).await
}

#[tauri::command]
pub async fn search_catalog(state: State<'_, AppState>, q: String, kind: String, offset: usize, limit: usize) -> Result<BrowseResult, String> {
    if q.trim().len() < 1 { return Ok(BrowseResult { items: vec![], total: 0 }); }
    if kind != "all" {
        let page = (offset / limit.max(1)) + 1;
        let api_result = match kind.as_str() {
            "anime" => anilist::search(&state.http, &q, page, limit, "ANIME").await,
            "manga" => anilist::search(&state.http, &q, page, limit, "MANGA").await,
            "game" => steam::search(&state.http, &q, page, limit).await,
            _ => Err("skip".to_string()),
        };
        if let Ok(r) = api_result { return Ok(r); }
    }
    let q = q.to_lowercase();
    let kinds: Vec<&str> = if kind == "all" { vec!["movie","series","anime","hentai","game"] } else { vec![kind.as_str()] };
    let mut results: Vec<CatalogItem> = Vec::new();

    if kinds.contains(&"movie") {
        let items = torrents::fetch_movie_catalog(&state.http, &state.db).await;
        for m in &items {
            if m.title.to_lowercase().contains(&q) {
                results.push(to_catalog_item("movie", &m.id, &m.title, &m.poster, m.year, m.rating, &m.genres, &m.tags));
            }
        }
    }
    if kinds.contains(&"series") {
        let items = torrents::fetch_series_catalog(&state.http, &state.db).await;
        for s in &items {
            if s.title.to_lowercase().contains(&q) {
                results.push(to_catalog_item("series", &s.id, &s.title, &s.poster, s.year, s.rating, &s.genres, &s.tags));
            }
        }
    }
    if kinds.contains(&"anime") {
        let items = torrents::fetch_anime_catalog(&state.http, &state.db).await;
        for a in &items {
            if a.title.to_lowercase().contains(&q) {
                results.push(CatalogItem {
                    id: a.id.clone(), title: a.title.clone(), poster: a.poster.clone(),
                    year: a.year, rating: a.rating, genres: a.genres.clone(),
                    kind: "anime".to_string(), tags: a.tags.clone(),
                    genre: None, status: Some(a.status.clone()), eps: Some(a.eps),
                    icon: None, size: None, repacker: None,
                });
            }
        }
    }
    if kinds.contains(&"hentai") {
        let items = torrents::fetch_hentai_catalog(&state.http, &state.db).await;
        for h in &items {
            if h.title.to_lowercase().contains(&q) {
                results.push(CatalogItem {
                    id: h.id.clone(), title: h.title.clone(), poster: h.poster.clone(),
                    year: h.year, rating: h.rating, genres: h.genres.clone(),
                    kind: "hentai".to_string(), tags: h.tags.clone(),
                    genre: None, status: Some(h.status.clone()), eps: Some(h.eps),
                    icon: None, size: None, repacker: None,
                });
            }
        }
    }
    if kinds.contains(&"game") {
        let items = torrents::fetch_game_catalog(&state.http, &state.db).await;
        for g in &items {
            if g.title.to_lowercase().contains(&q) {
                results.push(CatalogItem {
                    id: g.id.clone(), title: g.title.clone(), poster: g.icon.clone(),
                    year: 0, rating: g.rating, genres: vec![],
                    kind: "game".to_string(), tags: g.tags.clone(),
                    genre: Some(g.genre.clone()), status: None, eps: None,
                    icon: Some(g.icon.clone()), size: Some(g.size.clone()), repacker: Some(g.repacker.clone()),
                });
            }
        }
    }

    results.sort_by(|a, b| b.rating.partial_cmp(&a.rating).unwrap_or(std::cmp::Ordering::Equal));
    let total = results.len();
    let end = std::cmp::min(offset + limit, total);
    let items = if offset >= total { vec![] } else { results[offset..end].to_vec() };
    Ok(BrowseResult { items, total })
}

#[tauri::command]
pub async fn get_movies(state: State<'_, AppState>) -> Result<Vec<Movie>, String> {
    let results = torrents::fetch_movie_catalog(&state.http, &state.db).await;
    Ok(results)
}

#[tauri::command]
pub async fn get_series(state: State<'_, AppState>) -> Result<Vec<Series>, String> {
    let results = torrents::fetch_series_catalog(&state.http, &state.db).await;
    Ok(results)
}

#[tauri::command]
pub async fn get_kdramas(state: State<'_, AppState>) -> Result<Vec<Series>, String> {
    let results = torrents::fetch_series_catalog(&state.http, &state.db).await;
    Ok(results.into_iter().filter(|s| s.is_kdrama).collect())
}

#[tauri::command]
pub async fn get_games(state: State<'_, AppState>) -> Result<Vec<Game>, String> {
    let results = torrents::fetch_game_catalog(&state.http, &state.db).await;
    Ok(results)
}

#[tauri::command]
pub async fn get_anime(state: State<'_, AppState>) -> Result<Vec<Anime>, String> {
    let results = torrents::fetch_anime_catalog(&state.http, &state.db).await;
    Ok(results)
}

#[tauri::command]
pub async fn get_hentai(state: State<'_, AppState>) -> Result<Vec<Hentai>, String> {
    let results = torrents::fetch_hentai_catalog(&state.http, &state.db).await;
    Ok(results)
}

#[tauri::command]
pub async fn search_movies(q: String, state: State<'_, AppState>) -> Result<Vec<StrSrc>, String> {
    let q = q.trim().to_string();
    if q.len() < 3 { return Ok(vec![]) }
    Ok(torrents::search_movies(&state.http, &state.db, &q).await)
}

#[tauri::command]
pub async fn search_series(q: String, state: State<'_, AppState>) -> Result<Vec<StrSrc>, String> {
    let q = q.trim().to_string();
    if q.len() < 3 { return Ok(vec![]) }
    Ok(torrents::search_tv(&state.http, &state.db, &q).await)
}

#[tauri::command]
pub async fn search_anime(q: String, state: State<'_, AppState>) -> Result<Vec<StrSrc>, String> {
    let q = q.trim().to_string();
    if q.len() < 3 { return Ok(vec![]) }
    Ok(torrents::search_anime(&state.http, &state.db, &q).await)
}

#[tauri::command]
pub async fn search_hentai(q: String, state: State<'_, AppState>) -> Result<Vec<StrSrc>, String> {
    let q = q.trim().to_string();
    if q.len() < 3 { return Ok(vec![]) }
    Ok(torrents::search_hentai(&state.http, &state.db, &q).await)
}

#[tauri::command]
pub async fn search_games(q: String, state: State<'_, AppState>) -> Result<Vec<StrSrc>, String> {
    let q = q.trim().to_string();
    if q.len() < 3 { return Ok(vec![]) }
    Ok(torrents::search_games(&state.http, &state.db, &q).await)
}

#[tauri::command]
pub async fn search_all(q: String, state: State<'_, AppState>) -> Result<Vec<StrSrc>, String> {
    let q = q.trim().to_string();
    if q.len() < 2 { return Ok(vec![]) }
    Ok(torrents::search_all(&state.http, &state.db, &q).await)
}

#[tauri::command]
pub async fn get_episode_streams(series_id: String, season: i32, episode: i32, state: State<'_, AppState>) -> Result<Vec<StrSrc>, String> {
    let catalog = torrents::fetch_series_catalog(&state.http, &state.db).await;
    let mut query = String::new();
    for s in &catalog {
        if s.id == series_id {
            query = format!("{} S{:02}E{:02}", s.title, season, episode);
            break;
        }
    }
    if query.is_empty() { return Ok(vec![]) }
    Ok(torrents::search_tv(&state.http, &state.db, &query).await)
}

#[tauri::command]
pub fn play_media(url: String, title: String) -> Result<String, String> {
    let player = player::detect_player().ok_or_else(|| sanitize_error("No player found. Install mpv or VLC."))?;
    let t = title.clone();
    let p = player.clone();
    tauri::async_runtime::spawn(async move {
        let _ = player::play_url(&url, &t, &p).await;
    });
    Ok(format!("Launching {} via {}", title, player))
}

#[tauri::command]
pub fn detect_player() -> Result<String, String> {
    player::detect_player().ok_or_else(|| sanitize_error("No player found"))
}

#[tauri::command]
pub async fn get_playback(state: State<'_, AppState>) -> Result<Vec<PlaybackPos>, String> {
    let rows = db::get_all_playback(&state.db).await;
    Ok(rows.into_iter().map(|r| PlaybackPos {
        content_id: r.content_id, title: r.title, mtype: r.mtype,
        season: r.season, episode: r.episode, position_secs: r.position_secs,
        duration_secs: r.duration_secs, updated_at: r.updated_at,
    }).collect())
}

#[tauri::command]
pub async fn save_playback(state: State<'_, AppState>, id: String, title: String, mtype: String, season: Option<i32>, episode: Option<i32>, pos: i64, dur: i64) -> Result<(), String> {
    db::save_playback(&state.db, &id, &title, &mtype, season, episode, pos, dur).await;
    Ok(())
}

#[tauri::command]
pub async fn get_favs(state: State<'_, AppState>) -> Result<Vec<String>, String> {
    Ok(db::get_favs(&state.db).await)
}

#[tauri::command]
pub async fn toggle_fav(state: State<'_, AppState>, id: String, mtype: String, title: String, poster: String) -> Result<bool, String> {
    Ok(db::toggle_fav(&state.db, &id, &mtype, &title, &poster).await)
}

#[tauri::command]
pub fn get_downloads(state: State<AppState>) -> Vec<DlItem> {
    state.dl.list()
}

#[tauri::command]
pub async fn add_download(state: State<'_, AppState>, title: String, url: String, magnet: String, path: String, bytes_total: i64) -> Result<(), String> {
    let id = format!("dl{}", chrono::Utc::now().timestamp());
    db::add_download(&state.db, &id, &title, &url, &magnet, &path, bytes_total).await;
    state.dl.add(DlItem {
        id: id.clone(), title, progress: 0.0, speed: String::new(),
        eta: String::new(), status: DlStat::Queued, path, src: url,
        magnet, bytes_done: 0, bytes_total,
    });
    Ok(())
}

#[tauri::command]
pub async fn remove_download(state: State<'_, AppState>, id: String) -> Result<(), String> {
    db::remove_download(&state.db, &id).await;
    state.dl.remove(&id);
    Ok(())
}

#[tauri::command]
pub async fn get_downloads_db(state: State<'_, AppState>) -> Result<Vec<DlItem>, String> {
    let rows = db::get_downloads(&state.db).await;
    Ok(rows.into_iter().map(|r| DlItem {
        id: r.id, title: r.title, progress: if r.status == "done" { 1.0 } else { 0.0 },
        speed: String::new(), eta: String::new(),
        status: match r.status.as_str() {
            "queued" => DlStat::Queued, "downloading" => DlStat::Downloading,
            "paused" => DlStat::Paused, "done" => DlStat::Done,
            "failed" => DlStat::Failed, _ => DlStat::Queued,
        },
        path: r.path, src: r.url, magnet: r.magnet,
        bytes_done: r.bytes_done, bytes_total: r.bytes_total,
    }).collect())
}

#[tauri::command]
pub fn discord_connect(state: State<'_, AppState>, client_id: String) -> Result<(), String> {
    let mut rpc = state.discord.lock().unwrap();
    rpc.connect(&client_id)
}

#[tauri::command]
pub fn discord_update(state: State<'_, AppState>, state_text: String, details: String) -> Result<(), String> {
    let mut rpc = state.discord.lock().unwrap();
    rpc.update(&state_text, &details)
}

#[tauri::command]
pub fn discord_disconnect(state: State<'_, AppState>) -> Result<(), String> {
    let mut rpc = state.discord.lock().unwrap();
    rpc.disconnect();
    Ok(())
}

#[tauri::command]
pub async fn get_settings(state: State<'_, AppState>) -> Result<AppSettings, String> {
    let rows = db::load_settings(&state.db).await;
    let mut s = AppSettings {
        use_custom_player: true,
        download_path: String::new(),
        scrapers_enabled: vec![],
        accent_color: "#7C5CFF".into(),
        show_hentai: false,
        discord_client_id: "1520908611725820085".into(),
        onboarded: false,
        theme_mode: "dark".into(),
    };
    for (k, v) in rows {
        match k.as_str() {
            "use_custom_player" => s.use_custom_player = v == "true",
            "download_path" => s.download_path = v,
            "scrapers_enabled" => s.scrapers_enabled = v.split(',').map(|x| x.to_string()).collect(),
            "accent_color" => s.accent_color = v,
            "show_hentai" => s.show_hentai = v == "true",
            "discord_client_id" => s.discord_client_id = v,
            "onboarded" => s.onboarded = v == "true",
            "theme_mode" => s.theme_mode = v,
            _ => {}
        }
    }
    Ok(s)
}

#[tauri::command]
pub async fn save_settings(state: State<'_, AppState>, settings: AppSettings) -> Result<(), String> {
    db::save_setting(&state.db, "use_custom_player", &settings.use_custom_player.to_string()).await;
    db::save_setting(&state.db, "download_path", &settings.download_path).await;
    db::save_setting(&state.db, "scrapers_enabled", &settings.scrapers_enabled.join(",")).await;
    db::save_setting(&state.db, "accent_color", &settings.accent_color).await;
    db::save_setting(&state.db, "show_hentai", &settings.show_hentai.to_string()).await;
    db::save_setting(&state.db, "discord_client_id", &settings.discord_client_id).await;
    db::save_setting(&state.db, "onboarded", &settings.onboarded.to_string()).await;
    db::save_setting(&state.db, "theme_mode", &settings.theme_mode).await;
    Ok(())
}

#[tauri::command]
pub async fn clear_cache(state: State<'_, AppState>) -> Result<(), String> {
    db::clear_scraper_cache(&state.db).await;
    Ok(())
}

#[tauri::command]
pub async fn stream_magnet(magnet: String, state: State<'_, AppState>) -> Result<String, String> {
    state.streamer.start_stream(&magnet).await.map_err(|e| sanitize_error(&e))
}

#[tauri::command]
pub async fn stop_stream(id: String, state: State<'_, AppState>) -> Result<(), String> {
    state.streamer.stop_stream(&id).await;
    Ok(())
}

#[tauri::command]
pub async fn anilist_exchange(state: State<'_, AppState>, code: String) -> Result<String, String> {
    anilist::exchange_code(&state.http, &code).await.map_err(|e| sanitize_error(&e))
}

#[tauri::command]
pub async fn anilist_sync(state: State<'_, AppState>, token: String, media_id: i64, score: i32, status: String, progress: Option<i32>) -> Result<(), String> {
    anilist::sync_anilist(&state.http, &token, media_id, score, &status, progress).await.map_err(|e| sanitize_error(&e))
}

#[tauri::command]
pub async fn search_omdb(_state: State<'_, AppState>, title: String, year: Option<String>) -> Result<serde_json::Value, String> {
    let movie = omdb::fetch_omdb(&title, year.as_deref()).await.map_err(|e| sanitize_error(&e))?;
    serde_json::to_value(&movie).map_err(|e| sanitize_error(&e.to_string()))
}

#[tauri::command]
pub async fn search_movie_detail(_state: State<'_, AppState>, imdb_id: String) -> Result<serde_json::Value, String> {
    let movie = omdb::fetch_omdb_by_id(&imdb_id).await.map_err(|e| sanitize_error(&e))?;
    serde_json::to_value(&movie).map_err(|e| sanitize_error(&e.to_string()))
}

#[tauri::command]
pub async fn get_pc_username() -> String {
    std::env::var("USERNAME").unwrap_or_else(|_| "User".to_string())
}

#[tauri::command]
pub async fn proxy_image(url: String) -> Result<String, String> {
    imgproxy::proxy_image(url).await.map_err(|e| sanitize_error(&e))
}

#[tauri::command]
pub async fn add_comment(content_id: String, episode: Option<i32>, author: String, text: String, state: State<'_, AppState>) -> Result<comments::Comment, String> {
    comments::add_comment(&state.db, &content_id, episode, &author, &text).await
}

#[tauri::command]
pub async fn get_comments(content_id: String, episode: Option<i32>, state: State<'_, AppState>) -> Result<Vec<comments::Comment>, String> {
    comments::get_comments(&state.db, &content_id, episode).await
}

#[tauri::command]
pub async fn delete_comment(id: i64, state: State<'_, AppState>) -> Result<(), String> {
    comments::delete_comment(&state.db, id).await
}

#[tauri::command]
pub async fn add_to_library(content_id: String, title: String, poster: String, state: State<'_, AppState>) -> Result<(), String> {
    comments::add_to_library(&state.db, &content_id, &title, &poster).await
}

#[tauri::command]
pub async fn is_in_library(content_id: String, state: State<'_, AppState>) -> Result<bool, String> {
    comments::is_in_library(&state.db, &content_id).await
}

#[tauri::command]
pub async fn get_library(state: State<'_, AppState>) -> Result<Vec<comments::LibraryItem>, String> {
    comments::get_library(&state.db).await
}

#[tauri::command]
pub async fn remove_from_library(content_id: String, state: State<'_, AppState>) -> Result<(), String> {
    comments::remove_from_library(&state.db, &content_id).await
}

pub fn create_handler() -> impl Fn(tauri::ipc::Invoke<tauri::Wry>) -> bool + Send + Sync + 'static {
    tauri::generate_handler![
        get_movies, get_series, get_kdramas, get_games, get_anime, get_hentai,
        search_movies, search_series, search_anime, search_hentai, search_games, search_all,
        get_episode_streams,
        play_media, detect_player,
        get_playback, save_playback,
        get_favs, toggle_fav,
        get_downloads, add_download, remove_download, get_downloads_db,
        get_settings, save_settings, clear_cache,
        discord_connect, discord_update, discord_disconnect,
        stream_magnet, stop_stream,
        browse_catalog, search_catalog,
        get_api_detail,
        browse_anilist, search_anilist,
        browse_steam, search_steam,
        anilist_exchange, anilist_sync,
        search_omdb, search_movie_detail,
        proxy_image, get_pc_username,
        add_comment, get_comments, delete_comment,
        add_to_library, is_in_library, get_library, remove_from_library,
    ]
}
