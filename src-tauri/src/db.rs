use sqlx::sqlite::{SqlitePool, SqlitePoolOptions};
use sqlx::Row;

pub async fn init_db(db_path: &str) -> SqlitePool {
    let pool = SqlitePoolOptions::new()
        .max_connections(1)
        .connect(db_path)
        .await
        .expect("Failed to connect to db");

    sqlx::query(
        "CREATE TABLE IF NOT EXISTS playback_history (
            content_id TEXT PRIMARY KEY, title TEXT NOT NULL, mtype TEXT NOT NULL,
            season INTEGER, episode INTEGER, position_secs INTEGER NOT NULL DEFAULT 0,
            duration_secs INTEGER NOT NULL DEFAULT 0, updated_at INTEGER NOT NULL
        )"
    ).execute(&pool).await.unwrap();

    sqlx::query(
        "CREATE TABLE IF NOT EXISTS download_queue (
            id TEXT PRIMARY KEY, title TEXT NOT NULL, url TEXT NOT NULL, magnet TEXT NOT NULL,
            path TEXT NOT NULL, bytes_done INTEGER DEFAULT 0, bytes_total INTEGER NOT NULL,
            status TEXT NOT NULL DEFAULT 'queued', created_at INTEGER NOT NULL
        )"
    ).execute(&pool).await.unwrap();

    sqlx::query(
        "CREATE TABLE IF NOT EXISTS favorites (
            content_id TEXT PRIMARY KEY, mtype TEXT NOT NULL, title TEXT NOT NULL,
            poster TEXT, added_at INTEGER NOT NULL
        )"
    ).execute(&pool).await.unwrap();

    sqlx::query(
        "CREATE TABLE IF NOT EXISTS scraper_cache (
            cache_key TEXT PRIMARY KEY, data TEXT NOT NULL,
            created_at INTEGER NOT NULL, expires_at INTEGER NOT NULL
        )"
    ).execute(&pool).await.unwrap();

    sqlx::query(
        "CREATE TABLE IF NOT EXISTS settings (
            key TEXT PRIMARY KEY, value TEXT NOT NULL
        )"
    ).execute(&pool).await.unwrap();

    pool
}

pub struct PlaybackRow {
    pub content_id: String, pub title: String, pub mtype: String,
    pub season: Option<i32>, pub episode: Option<i32>,
    pub position_secs: i64, pub duration_secs: i64, pub updated_at: i64,
}

pub async fn get_playback(pool: &SqlitePool, id: &str) -> Option<PlaybackRow> {
    let row = sqlx::query(
        "SELECT content_id, title, mtype, season, episode, position_secs, duration_secs, updated_at FROM playback_history WHERE content_id = ?"
    ).bind(id).fetch_optional(pool).await.ok()?;
    row.map(|r| PlaybackRow {
        content_id: r.get(0), title: r.get(1), mtype: r.get(2),
        season: r.get(3), episode: r.get(4), position_secs: r.get(5),
        duration_secs: r.get(6), updated_at: r.get(7),
    })
}

pub async fn get_all_playback(pool: &SqlitePool) -> Vec<PlaybackRow> {
    let rows = sqlx::query(
        "SELECT content_id, title, mtype, season, episode, position_secs, duration_secs, updated_at FROM playback_history ORDER BY updated_at DESC LIMIT 20"
    ).fetch_all(pool).await.unwrap_or_default();
    rows.into_iter().map(|r| PlaybackRow {
        content_id: r.get(0), title: r.get(1), mtype: r.get(2),
        season: r.get(3), episode: r.get(4), position_secs: r.get(5),
        duration_secs: r.get(6), updated_at: r.get(7),
    }).collect()
}

pub async fn save_playback(pool: &SqlitePool, id: &str, title: &str, mtype: &str, season: Option<i32>, episode: Option<i32>, pos: i64, dur: i64) {
    let now = chrono::Utc::now().timestamp();
    sqlx::query(
        "INSERT INTO playback_history (content_id, title, mtype, season, episode, position_secs, duration_secs, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)
         ON CONFLICT(content_id) DO UPDATE SET position_secs=excluded.position_secs, updated_at=excluded.updated_at"
    ).bind(id).bind(title).bind(mtype).bind(season).bind(episode).bind(pos).bind(dur).bind(now)
    .execute(pool).await.unwrap();
}

pub async fn get_favs(pool: &SqlitePool) -> Vec<String> {
    let rows = sqlx::query("SELECT content_id FROM favorites ORDER BY added_at DESC")
        .fetch_all(pool).await.unwrap_or_default();
    rows.into_iter().map(|r| r.get(0)).collect()
}

pub async fn toggle_fav(pool: &SqlitePool, id: &str, mtype: &str, title: &str, poster: &str) -> bool {
    let exists = sqlx::query("SELECT 1 FROM favorites WHERE content_id = ?")
        .bind(id).fetch_optional(pool).await.unwrap().is_some();
    if exists {
        sqlx::query("DELETE FROM favorites WHERE content_id = ?").bind(id).execute(pool).await.unwrap();
        false
    } else {
        let now = chrono::Utc::now().timestamp();
        sqlx::query("INSERT INTO favorites (content_id, mtype, title, poster, added_at) VALUES (?, ?, ?, ?, ?)")
            .bind(id).bind(mtype).bind(title).bind(poster).bind(now)
            .execute(pool).await.unwrap();
        true
    }
}

pub async fn load_settings(pool: &SqlitePool) -> Vec<(String, String)> {
    let rows = sqlx::query("SELECT key, value FROM settings")
        .fetch_all(pool).await.unwrap_or_default();
    rows.into_iter().map(|r| (r.get::<String, _>(0), r.get::<String, _>(1))).collect()
}

pub async fn save_setting(pool: &SqlitePool, key: &str, value: &str) {
    sqlx::query("INSERT INTO settings (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value=excluded.value")
        .bind(key).bind(value).execute(pool).await.unwrap();
}

pub async fn clear_scraper_cache(pool: &SqlitePool) {
    sqlx::query("DELETE FROM scraper_cache").execute(pool).await.unwrap();
}

pub async fn get_cached(pool: &SqlitePool, key: &str) -> Option<String> {
    let now = chrono::Utc::now().timestamp();
    let row = sqlx::query("SELECT data FROM scraper_cache WHERE cache_key = ? AND expires_at > ?")
        .bind(key).bind(now).fetch_optional(pool).await.unwrap();
    row.map(|r| r.get(0))
}

pub async fn set_cached(pool: &SqlitePool, key: &str, data: &str, ttl_secs: i64) {
    let now = chrono::Utc::now().timestamp();
    sqlx::query("INSERT INTO scraper_cache (cache_key, data, created_at, expires_at) VALUES (?, ?, ?, ?) ON CONFLICT(cache_key) DO UPDATE SET data=excluded.data, created_at=excluded.created_at, expires_at=excluded.expires_at")
        .bind(key).bind(data).bind(now).bind(now + ttl_secs)
        .execute(pool).await.unwrap();
}
