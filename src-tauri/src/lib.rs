mod anilist;
mod cache;
mod cmds;
mod comments;
mod db;
mod discord;
mod dl;
mod imgproxy;
mod models;
mod omdb;
mod player;
mod scrapers;
mod steam;
mod streamer;

use cache::ApiCache;
use cmds::AppState;
use discord::DiscordRpc;
use dl::DlMgr;
use streamer::Streamer;
use reqwest::Client;
use std::sync::Mutex;
use tauri::Manager;
use tauri::menu::{Menu, MenuItem};
use tauri::tray::{TrayIconBuilder, TrayIconEvent, MouseButton, MouseButtonState};

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
            rt.block_on(comments::init_tables(&pool));
            let http = Client::builder()
                .cookie_store(true)
                .timeout(std::time::Duration::from_secs(30))
                .user_agent("Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36")
                .build().unwrap();

            // Tray setup
            let show = MenuItem::with_id(app, "show", "Show Aeth Hub", true, None::<&str>)?;
            let quit = MenuItem::with_id(app, "quit", "Quit", true, Some("CmdOrCtrl+Q"))?;
            let menu = Menu::with_items(app, &[&show, &quit])?;
            TrayIconBuilder::new()
                .icon(app.default_window_icon().unwrap().clone())
                .menu(&menu)
                .on_menu_event(|app, event| match event.id().as_ref() {
                    "show" => { if let Some(w) = app.get_webview_window("main") { w.show().ok(); w.set_focus().ok(); } }
                    "quit" => app.exit(0),
                    _ => {}
                })
                .on_tray_icon_event(|tray, event| {
                    if let TrayIconEvent::Click { button: MouseButton::Left, button_state: MouseButtonState::Up, .. } = event {
                        let app = tray.app_handle();
                        if let Some(w) = app.get_webview_window("main") {
                            if w.is_visible().unwrap_or(false) { w.hide().ok(); } else { w.show().ok(); w.set_focus().ok(); }
                        }
                    }
                })
                .build(app)?;

            if let Some(w) = app.get_webview_window("main") {
                let _ = w.set_background_color(Some(tauri::window::Color(8, 8, 10, 255)));
            }

            app.manage(AppState {
                dl: DlMgr::new(),
                db: pool,
                http,
                discord: Mutex::new(DiscordRpc::new()),
                streamer: Streamer::new(),
                cache: Mutex::new(ApiCache::new()),
            });
            Ok(())
        })
        .invoke_handler(cmds::create_handler())
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
