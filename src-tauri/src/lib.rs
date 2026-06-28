mod cache;
mod cmds;
mod db;
mod dl;
mod models;
mod player;
mod scrapers;

use cache::Cache;
use cmds::AppState;
use dl::DlMgr;
use reqwest::Client;
use std::sync::Mutex;
use tauri::Manager;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_shell::init())
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_store::Builder::default().build())
        .setup(|app| {
            let rt = tokio::runtime::Runtime::new().unwrap();
            let db_dir = app.path().app_data_dir().unwrap_or_else(|_| std::path::PathBuf::from("."));
            std::fs::create_dir_all(&db_dir).expect("Failed to create app data dir");
            let db_path = db_dir.join("aeth.db");
            let db_url = format!("sqlite:{}?mode=rwc", db_path.display());
            let pool = rt.block_on(db::init_db(&db_url));
            let http = Client::builder()
                .timeout(std::time::Duration::from_secs(10))
                .user_agent("Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36")
                .build().unwrap();
            app.manage(AppState {
                cache: Cache::new(),
                dl: DlMgr::new(),
                favs: Mutex::new(Vec::new()),
                db: pool,
                http,
            });
            Ok(())
        })
        .invoke_handler(cmds::create_handler())
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
