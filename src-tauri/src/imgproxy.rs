use std::path::PathBuf;
use tokio::fs;
use sha2::{Sha256, Digest};

const CACHE_DIR: &str = "aeth-image-cache";

fn cache_path(url: &str) -> PathBuf {
    let mut hasher = Sha256::new();
    hasher.update(url.as_bytes());
    let hash = hex::encode(hasher.finalize());
    let ext = url.rsplit('.').next().unwrap_or("jpg");
    let dir = std::env::temp_dir().join(CACHE_DIR);
    dir.join(format!("{}.{}", hash, ext))
}

pub async fn proxy_image(url: String) -> Result<String, String> {
    let cached = cache_path(&url);

    if cached.exists() {
        return Ok(format!("file:///{}", cached.to_string_lossy()));
    }

    let client = reqwest::Client::new();
    let bytes = client.get(&url).send().await
        .map_err(|e| e.to_string())?
        .bytes().await
        .map_err(|e| e.to_string())?;

    if let Some(parent) = cached.parent() {
        fs::create_dir_all(parent).await.map_err(|e| e.to_string())?;
    }

    fs::write(&cached, &bytes).await.map_err(|e| e.to_string())?;

    Ok(format!("file:///{}", cached.to_string_lossy()))
}
