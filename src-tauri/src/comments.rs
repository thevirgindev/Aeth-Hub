use sqlx::SqlitePool;

#[derive(Debug, Clone, serde::Serialize, serde::Deserialize)]
pub struct Comment {
    pub id: i64,
    pub content_id: String,
    pub episode: Option<i32>,
    pub author: String,
    pub text: String,
    pub created_at: String,
}

pub async fn init_tables(pool: &SqlitePool) {
    sqlx::query(
        "CREATE TABLE IF NOT EXISTS comments (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            content_id TEXT NOT NULL,
            episode INTEGER,
            author TEXT NOT NULL DEFAULT 'Anonymous',
            text TEXT NOT NULL,
            created_at TEXT NOT NULL
        )"
    ).execute(pool).await.ok();
    sqlx::query(
        "CREATE TABLE IF NOT EXISTS library (
            content_id TEXT PRIMARY KEY,
            title TEXT NOT NULL,
            poster TEXT NOT NULL DEFAULT '',
            added_at TEXT NOT NULL
        )"
    ).execute(pool).await.ok();
}

pub async fn add_comment(pool: &SqlitePool, content_id: &str, episode: Option<i32>, author: &str, text: &str) -> Result<Comment, String> {
    use std::time::{SystemTime, UNIX_EPOCH};
    let now = SystemTime::now().duration_since(UNIX_EPOCH).unwrap_or_default().as_secs().to_string();
    sqlx::query("INSERT INTO comments (content_id, episode, author, text, created_at) VALUES (?, ?, ?, ?, ?)")
        .bind(content_id).bind(episode).bind(author).bind(text).bind(&now)
        .execute(pool).await.map_err(|e| e.to_string())?;
    let id: i64 = sqlx::query_scalar("SELECT last_insert_rowid()")
        .fetch_one(pool).await.map_err(|e| e.to_string())?;
    Ok(Comment { id, content_id: content_id.to_string(), episode, author: author.to_string(), text: text.to_string(), created_at: now })
}

pub async fn get_comments(pool: &SqlitePool, content_id: &str, episode: Option<i32>) -> Result<Vec<Comment>, String> {
    let rows: Vec<(i64, String, Option<i32>, String, String, String)> = if let Some(ep) = episode {
        sqlx::query_as(
            "SELECT id, content_id, episode, author, text, created_at FROM comments WHERE content_id = ? AND episode = ? ORDER BY created_at DESC"
        ).bind(content_id).bind(ep).fetch_all(pool).await
    } else {
        sqlx::query_as(
            "SELECT id, content_id, episode, author, text, created_at FROM comments WHERE content_id = ? AND episode IS NULL ORDER BY created_at DESC"
        ).bind(content_id).fetch_all(pool).await
    }.map_err(|e| e.to_string())?;
    Ok(rows.into_iter().map(|(id, cid, ep, author, text, created_at)| {
        Comment { id, content_id: cid, episode: ep, author, text, created_at }
    }).collect())
}

pub async fn delete_comment(pool: &SqlitePool, id: i64) -> Result<(), String> {
    sqlx::query("DELETE FROM comments WHERE id = ?").bind(id).execute(pool).await.map_err(|e| e.to_string())?;
    Ok(())
}

pub async fn add_to_library(pool: &SqlitePool, content_id: &str, title: &str, poster: &str) -> Result<(), String> {
    use std::time::{SystemTime, UNIX_EPOCH};
    let now = SystemTime::now().duration_since(UNIX_EPOCH).unwrap_or_default().as_secs().to_string();
    sqlx::query("INSERT OR IGNORE INTO library (content_id, title, poster, added_at) VALUES (?, ?, ?, ?)")
        .bind(content_id).bind(title).bind(poster).bind(&now)
        .execute(pool).await.map_err(|e| e.to_string())?;
    Ok(())
}

pub async fn is_in_library(pool: &SqlitePool, content_id: &str) -> Result<bool, String> {
    let row: Option<(i64,)> = sqlx::query_as("SELECT 1 FROM library WHERE content_id = ?")
        .bind(content_id).fetch_optional(pool).await.map_err(|e| e.to_string())?;
    Ok(row.is_some())
}

#[derive(Debug, Clone, serde::Serialize, serde::Deserialize)]
pub struct LibraryItem {
    pub content_id: String,
    pub title: String,
    pub poster: String,
    pub added_at: String,
}

pub async fn get_library(pool: &SqlitePool) -> Result<Vec<LibraryItem>, String> {
    sqlx::query_as::<_, (String, String, String, String)>(
        "SELECT content_id, title, poster, added_at FROM library ORDER BY added_at DESC"
    ).fetch_all(pool).await
     .map(|rows| rows.into_iter().map(|(id, title, poster, added_at)| LibraryItem { content_id: id, title, poster, added_at }).collect())
     .map_err(|e| e.to_string())
}

pub async fn remove_from_library(pool: &SqlitePool, content_id: &str) -> Result<(), String> {
    sqlx::query("DELETE FROM library WHERE content_id = ?")
        .bind(content_id).execute(pool).await.map_err(|e| e.to_string())?;
    sqlx::query("DELETE FROM comments WHERE content_id = ?")
        .bind(content_id).execute(pool).await.ok();
    Ok(())
}
