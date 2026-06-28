use crate::cache::Cache;
use crate::db;
use crate::dl::DlMgr;
use crate::models::*;
use crate::player;
use crate::scrapers::torrents;
use reqwest::Client;
use sqlx::SqlitePool;
use std::sync::Mutex;
use tauri::State;

pub struct AppState {
    pub cache: Cache,
    pub dl: DlMgr,
    pub favs: Mutex<Vec<String>>,
    pub db: SqlitePool,
    pub http: Client,
}

macro_rules! sample_movies { () => { vec![
    Movie { id: "m1".into(), title: "Dune: Part Two".into(), poster: "https://image.tmdb.org/t/p/w500/1pdfLvkbY9ohJlCjQH2CZjjYVvJ.jpg".into(), backdrop: "https://image.tmdb.org/t/p/w1280/8uVKf2EhC6pMEGgVnVo1LDNQ4mk.jpg".into(), year: 2024, rating: 8.6, runtime: 166, overview: "Paul Atreides unites with the Fremen to seek revenge against those who destroyed his family.".into(), genres: vec!["Sci-Fi".into(), "Adventure".into()], tags: vec!["Trending".into(), "4K".into()], streams: vec![] },
    Movie { id: "m2".into(), title: "The Batman".into(), poster: "https://image.tmdb.org/t/p/w500/74xTEgt7R36Fpooo50r9T25onhq.jpg".into(), backdrop: "https://image.tmdb.org/t/p/w1280/6MKr3KgOLmzOPWMSnR3BfZ7ZpT8.jpg".into(), year: 2022, rating: 7.8, runtime: 176, overview: "When a sadistic serial killer begins murdering key political figures in Gotham, Batman is forced to investigate the city's hidden corruption.".into(), genres: vec!["Action".into(), "Crime".into(), "Drama".into()], tags: vec!["New".into(), "4K".into()], streams: vec![] },
    Movie { id: "m3".into(), title: "Interstellar".into(), poster: "https://image.tmdb.org/t/p/w500/gEU2QniE6E77NI6lCU6MxlNBvIx.jpg".into(), backdrop: "https://image.tmdb.org/t/p/w1280/rAiYTfKGqDCRIIqo664sY9XZIvQ.jpg".into(), year: 2014, rating: 8.7, runtime: 169, overview: "When Earth becomes uninhabitable, a team of astronauts travel through a wormhole in search of a new home for humanity.".into(), genres: vec!["Sci-Fi".into(), "Drama".into()], tags: vec!["Top Rated".into()], streams: vec![] },
    Movie { id: "m4".into(), title: "Blade Runner 2049".into(), poster: "https://image.tmdb.org/t/p/w500/gajva2L0rPYkyRjMt4HfN1c5tLc.jpg".into(), backdrop: "https://image.tmdb.org/t/p/w1280/9E5esxT0X3THMvJCC4nN1STyp6c.jpg".into(), year: 2017, rating: 8.0, runtime: 164, overview: "A young blade runner discovers a long-buried secret that leads him to track down former blade runner Rick Deckard.".into(), genres: vec!["Sci-Fi".into(), "Thriller".into()], tags: vec!["4K".into(), "HDR".into()], streams: vec![] },
    Movie { id: "m5".into(), title: "John Wick: Chapter 4".into(), poster: "https://image.tmdb.org/t/p/w500/vZloFAK7NmvMGKE7VkF5UHaz0I.jpg".into(), backdrop: "https://image.tmdb.org/t/p/w1280/3V4kLQg0kSqPLct2aTSLehJQwTC.jpg".into(), year: 2023, rating: 7.8, runtime: 169, overview: "John Wick uncovers a path to defeating The High Table.".into(), genres: vec!["Action".into(), "Thriller".into()], tags: vec!["Trending".into()], streams: vec![] },
    Movie { id: "m6".into(), title: "Everything Everywhere All at Once".into(), poster: "https://image.tmdb.org/t/p/w500/w3LxiVYdWWRvEVdn5RYq6jIqkb1.jpg".into(), backdrop: "https://image.tmdb.org/t/p/w1280/7fVDxpn4fU5RQ4P5zT03x6prRHM.jpg".into(), year: 2022, rating: 8.3, runtime: 139, overview: "An aging Chinese immigrant is swept up in an insane adventure where she alone can save the world by exploring other universes.".into(), genres: vec!["Action".into(), "Comedy".into(), "Sci-Fi".into()], tags: vec!["Top Rated".into()], streams: vec![] },
] } }

macro_rules! sample_series { () => { vec![
    Series { id: "s1".into(), title: "Severance".into(), poster: "https://image.tmdb.org/t/p/w500/1ZkwHUSe80Lx20HmEkSkCxJACu.jpg".into(), backdrop: "https://image.tmdb.org/t/p/w1280/6Pw3vTLEbVLy4RTxIJbSCMSAMs.jpg".into(), year: 2022, rating: 8.7, overview: "Mark leads a team of office workers whose memories have been surgically divided between their work and personal lives.".into(), genres: vec!["Sci-Fi".into(), "Drama".into(), "Thriller".into()], tags: vec!["Trending".into(), "4K".into()], is_kdrama: false, seasons: vec![Season { num: 1, episodes: vec![
        Episode { num: 1, title: "Good News About Hell".into(), streams: vec![] },
        Episode { num: 2, title: "Half Loop".into(), streams: vec![] },
        Episode { num: 3, title: "In Perpetuity".into(), streams: vec![] },
    ]}, Season { num: 2, episodes: vec![
        Episode { num: 1, title: "Hello, Ms. Cobel".into(), streams: vec![] },
        Episode { num: 2, title: "Goodbye, Mrs. Selvig".into(), streams: vec![] },
    ]}] },
    Series { id: "s2".into(), title: "The Last of Us".into(), poster: "https://image.tmdb.org/t/p/w500/uKvVjHNqB1VmM3s4FJ6KQn5CP6.jpg".into(), backdrop: "https://image.tmdb.org/t/p/w1280/b8Q6WBNn2iMpbNj2lQpOBr6ZJ2.jpg".into(), year: 2023, rating: 8.8, overview: "After a global pandemic destroys civilization, a hardened survivor takes charge of a 14-year-old girl who may be humanity's last hope.".into(), genres: vec!["Action".into(), "Drama".into(), "Horror".into()], tags: vec!["New".into(), "HDR".into()], is_kdrama: false, seasons: vec![Season { num: 1, episodes: vec![
        Episode { num: 1, title: "When You're Lost in the Darkness".into(), streams: vec![] },
        Episode { num: 2, title: "Infected".into(), streams: vec![] },
    ]}] },
    Series { id: "s3".into(), title: "The Glory".into(), poster: "https://image.tmdb.org/t/p/w500/4f452s5G3nECi4YfI6B0cT7W8j.jpg".into(), backdrop: "https://image.tmdb.org/t/p/w1280/xZJzQjs9sVjU4JxG7JkZ4Q5fR8k.jpg".into(), year: 2023, rating: 8.3, overview: "A woman seeks revenge against her childhood bullies.".into(), genres: vec!["Drama".into(), "Thriller".into()], tags: vec!["Trending".into()], is_kdrama: true, seasons: vec![Season { num: 1, episodes: vec![
        Episode { num: 1, title: "The Beginning".into(), streams: vec![] },
        Episode { num: 2, title: "The Reunion".into(), streams: vec![] },
    ]}] },
    Series { id: "s4".into(), title: "Crash Landing on You".into(), poster: "https://image.tmdb.org/t/p/w500/6pG64KwF2RBJZP7Q0gNq5F9y3t.jpg".into(), backdrop: "https://image.tmdb.org/t/p/w1280/1S9Hw5GKxJ4LgYcM6f3yX6F5zR.jpg".into(), year: 2019, rating: 8.6, overview: "A South Korean heiress accidentally lands in North Korea.".into(), genres: vec!["Romance".into(), "Drama".into(), "Comedy".into()], tags: vec!["Top Rated".into()], is_kdrama: true, seasons: vec![Season { num: 1, episodes: vec![
        Episode { num: 1, title: "Episode 1".into(), streams: vec![] },
        Episode { num: 2, title: "Episode 2".into(), streams: vec![] },
    ]}] },
] } }

macro_rules! sample_games { () => { vec![
    Game { id: "g1".into(), title: "Elden Ring".into(), icon: "https://cdn.akamai.steamstatic.com/steam/apps/1245620/library_600x900.jpg".into(), banner: "".into(), genre: "Action RPG".into(), desc: "The Golden Order has been broken.".into(), size: "48.2 GB".into(), repacker: "FitGirl".into(), url: "".into(), dl_count: 14203, tags: vec!["Top Rated".into()], screenshots: vec![] },
    Game { id: "g2".into(), title: "Cyberpunk 2077".into(), icon: "https://cdn.akamai.steamstatic.com/steam/apps/1091500/library_600x900.jpg".into(), banner: "".into(), genre: "Open World RPG".into(), desc: "An open-world action-adventure story set in Night City.".into(), size: "69.1 GB".into(), repacker: "DODI".into(), url: "".into(), dl_count: 9876, tags: vec!["Trending".into()], screenshots: vec![] },
    Game { id: "g3".into(), title: "Baldur's Gate 3".into(), icon: "https://cdn.akamai.steamstatic.com/steam/apps/1086940/library_600x900.jpg".into(), banner: "".into(), genre: "CRPG".into(), desc: "Gather your party and return to the Forgotten Realms.".into(), size: "122 GB".into(), repacker: "FitGirl".into(), url: "".into(), dl_count: 21543, tags: vec!["Top Rated".into(), "New".into()], screenshots: vec![] },
    Game { id: "g4".into(), title: "Red Dead Redemption 2".into(), icon: "https://cdn.akamai.steamstatic.com/steam/apps/1174180/library_600x900.jpg".into(), banner: "".into(), genre: "Action Adventure".into(), desc: "America, 1899. The end of the Wild West era has begun.".into(), size: "109 GB".into(), repacker: "DODI".into(), url: "".into(), dl_count: 16782, tags: vec![], screenshots: vec![] },
    Game { id: "g5".into(), title: "Dark Souls III".into(), icon: "https://cdn.akamai.steamstatic.com/steam/apps/374320/library_600x900.jpg".into(), banner: "".into(), genre: "Action RPG".into(), desc: "Embrace the darkness.".into(), size: "24.8 GB".into(), repacker: "FitGirl".into(), url: "".into(), dl_count: 12456, tags: vec!["Top Rated".into()], screenshots: vec![] },
    Game { id: "g6".into(), title: "Hades".into(), icon: "https://cdn.akamai.steamstatic.com/steam/apps/1145360/library_600x900.jpg".into(), banner: "".into(), genre: "Roguelike".into(), desc: "Defy the god of the dead as you hack and slash out of the Underworld.".into(), size: "8.4 GB".into(), repacker: "Chovkaz".into(), url: "".into(), dl_count: 8921, tags: vec![], screenshots: vec![] },
] } }

macro_rules! sample_anime { () => { vec![
    Anime { id: "a1".into(), title: "Attack on Titan".into(), poster: "https://cdn.myanimelist.net/images/anime/10/47347.jpg".into(), banner: "".into(), year: 2013, status: "Completed".into(), eps: 94, rating: 9.1, synopsis: "Giant humanoid Titans threaten humanity's existence.".into(), genres: vec!["Action".into(), "Drama".into(), "Fantasy".into()], tags: vec!["Top Rated".into()], streams: vec![], vmode: VMode::Sub },
    Anime { id: "a2".into(), title: "Jujutsu Kaisen".into(), poster: "https://cdn.myanimelist.net/images/anime/1171/109222.jpg".into(), banner: "".into(), year: 2020, status: "Airing".into(), eps: 47, rating: 8.8, synopsis: "A boy swallows a cursed talisman and joins a school of sorcerers.".into(), genres: vec!["Action".into(), "Fantasy".into()], tags: vec!["Trending".into()], streams: vec![], vmode: VMode::Sub },
    Anime { id: "a3".into(), title: "Demon Slayer".into(), poster: "https://cdn.myanimelist.net/images/anime/1286/99889.jpg".into(), banner: "".into(), year: 2019, status: "Completed".into(), eps: 55, rating: 8.7, synopsis: "A boy becomes a demon slayer to avenge his family.".into(), genres: vec!["Action".into(), "Fantasy".into()], tags: vec![], streams: vec![], vmode: VMode::Sub },
    Anime { id: "a4".into(), title: "Solo Leveling".into(), poster: "https://cdn.myanimelist.net/images/anime/1206/136553.jpg".into(), banner: "".into(), year: 2024, status: "Airing".into(), eps: 12, rating: 8.5, synopsis: "The weakest hunter becomes the strongest.".into(), genres: vec!["Action".into(), "Fantasy".into()], tags: vec!["New".into(), "Trending".into()], streams: vec![], vmode: VMode::Sub },
    Anime { id: "a5".into(), title: "Fullmetal Alchemist: Brotherhood".into(), poster: "https://cdn.myanimelist.net/images/anime/1223/96541.jpg".into(), banner: "".into(), year: 2009, status: "Completed".into(), eps: 64, rating: 9.2, synopsis: "Two brothers search for the Philosopher's Stone to restore their bodies.".into(), genres: vec!["Action".into(), "Adventure".into(), "Drama".into()], tags: vec!["Top Rated".into()], streams: vec![], vmode: VMode::Sub },
    Anime { id: "a6".into(), title: "One Punch Man".into(), poster: "https://cdn.myanimelist.net/images/anime/12/76049.jpg".into(), banner: "".into(), year: 2015, status: "Completed".into(), eps: 24, rating: 8.5, synopsis: "A hero who can defeat anyone with a single punch.".into(), genres: vec!["Action".into(), "Comedy".into()], tags: vec![], streams: vec![], vmode: VMode::Sub },
] } }

macro_rules! sample_hentai { () => { vec![
    Hentai { id: "h1".into(), title: "Interspecies Reviewers".into(), poster: "https://cdn.myanimelist.net/images/anime/1038/107350.jpg".into(), banner: "".into(), year: 2020, status: "Completed".into(), eps: 12, rating: 7.4, synopsis: "Adventurers review fantasy species at various establishments.".into(), genres: vec!["Comedy".into(), "Fantasy".into(), "Ecchi".into()], tags: vec!["Dubbed".into()], streams: vec![], vmode: VMode::Both, censored: false },
    Hentai { id: "h2".into(), title: "To Love-Ru".into(), poster: "https://cdn.myanimelist.net/images/anime/7/18114.jpg".into(), banner: "".into(), year: 2008, status: "Completed".into(), eps: 26, rating: 7.2, synopsis: "A boy meets an alien princess who falls in love with him.".into(), genres: vec!["Comedy".into(), "Romance".into(), "Ecchi".into()], tags: vec!["Subbed".into()], streams: vec![], vmode: VMode::Sub, censored: true },
    Hentai { id: "h3".into(), title: "High School DxD".into(), poster: "https://cdn.myanimelist.net/images/anime/11/75554.jpg".into(), banner: "".into(), year: 2012, status: "Completed".into(), eps: 64, rating: 7.8, synopsis: "A perverted high school student is reincarnated as a devil.".into(), genres: vec!["Action".into(), "Comedy".into(), "Fantasy".into(), "Ecchi".into()], tags: vec!["Dubbed".into(), "Uncensored".into()], streams: vec![], vmode: VMode::Both, censored: false },
] } }

// --- Catalog commands (sample data for browsing) ---

#[tauri::command]
pub fn get_movies() -> Vec<Movie> { sample_movies!() }

#[tauri::command]
pub fn get_series() -> Vec<Series> { sample_series!() }

#[tauri::command]
pub fn get_kdramas() -> Vec<Series> {
    sample_series!().into_iter().filter(|s| s.is_kdrama).collect()
}

#[tauri::command]
pub fn get_games() -> Vec<Game> { sample_games!() }

#[tauri::command]
pub fn get_anime() -> Vec<Anime> { sample_anime!() }

#[tauri::command]
pub fn get_hentai() -> Vec<Hentai> { sample_hentai!() }

// --- Scraper search commands (real torrent results) ---

#[tauri::command]
pub async fn search_movies(q: String, state: State<'_, AppState>) -> Result<Vec<StrSrc>, String> {
    let q = q.trim().to_string();
    if q.len() < 3 { return Ok(vec![]) }
    let client = &state.http;
    Ok(torrents::search_movies(client, &q).await)
}

#[tauri::command]
pub async fn search_series(q: String, state: State<'_, AppState>) -> Result<Vec<StrSrc>, String> {
    let q = q.trim().to_string();
    if q.len() < 3 { return Ok(vec![]) }
    let client = &state.http;
    Ok(torrents::search_tv(client, &q).await)
}

#[tauri::command]
pub async fn search_anime(q: String, state: State<'_, AppState>) -> Result<Vec<StrSrc>, String> {
    let q = q.trim().to_string();
    if q.len() < 3 { return Ok(vec![]) }
    let client = &state.http;
    Ok(torrents::search_anime(client, &q).await)
}

#[tauri::command]
pub async fn search_hentai(q: String, state: State<'_, AppState>) -> Result<Vec<StrSrc>, String> {
    let q = q.trim().to_string();
    if q.len() < 3 { return Ok(vec![]) }
    let client = &state.http;
    Ok(torrents::search_hentai(client, &q).await)
}

#[tauri::command]
pub async fn search_games(q: String, state: State<'_, AppState>) -> Result<Vec<StrSrc>, String> {
    let q = q.trim().to_string();
    if q.len() < 3 { return Ok(vec![]) }
    let client = &state.http;
    Ok(torrents::search_games(client, &q).await)
}

#[tauri::command]
pub async fn search_all(q: String, state: State<'_, AppState>) -> Result<Vec<StrSrc>, String> {
    let q = q.trim().to_string();
    if q.len() < 2 { return Ok(vec![]) }
    let client = &state.http;
    Ok(torrents::search_all(client, &q).await)
}

// --- Episode streams ---

#[tauri::command]
pub async fn get_episode_streams(series_id: String, season: i32, episode: i32, state: State<'_, AppState>) -> Result<Vec<StrSrc>, String> {
    let series = sample_series!();
    let mut query = String::new();
    for s in &series {
        if s.id == series_id {
            query = format!("{} S{:02}E{:02}", s.title, season, episode);
            break;
        }
    }
    if query.is_empty() { return Ok(vec![]) }
    let client = &state.http;
    Ok(torrents::search_tv(client, &query).await)
}

// --- Player commands ---

#[tauri::command]
pub fn play_media(url: String, title: String) -> Result<String, String> {
    let player = player::detect_player().ok_or("No player found. Install mpv or VLC.".to_string())?;
    let t = title.clone();
    let p = player.clone();
    tauri::async_runtime::spawn(async move {
        let _ = player::play_url(&url, &t, &p).await;
    });
    Ok(format!("Launching {} via {}", title, player))
}

#[tauri::command]
pub fn detect_player() -> Result<String, String> {
    player::detect_player().ok_or("No player found".to_string())
}

// --- Playback commands (DB) ---

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

// --- Favorites (DB) ---

#[tauri::command]
pub async fn get_favs(state: State<'_, AppState>) -> Result<Vec<String>, String> {
    Ok(db::get_favs(&state.db).await)
}

#[tauri::command]
pub async fn toggle_fav(state: State<'_, AppState>, id: String, mtype: String, title: String, poster: String) -> Result<bool, String> {
    Ok(db::toggle_fav(&state.db, &id, &mtype, &title, &poster).await)
}

// --- Downloads ---

#[tauri::command]
pub fn get_downloads(state: State<AppState>) -> Vec<DlItem> {
    state.dl.list()
}

// --- Settings ---

#[tauri::command]
pub async fn get_settings(state: State<'_, AppState>) -> Result<AppSettings, String> {
    let rows = db::load_settings(&state.db).await;
    let mut s = AppSettings {
        use_custom_player: true,
        download_path: String::new(),
        scrapers_enabled: vec![],
        accent_color: "#7C5CFF".into(),
    };
    for (k, v) in rows {
        match k.as_str() {
            "use_custom_player" => s.use_custom_player = v == "true",
            "download_path" => s.download_path = v,
            "scrapers_enabled" => s.scrapers_enabled = v.split(',').map(|x| x.to_string()).collect(),
            "accent_color" => s.accent_color = v,
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
    Ok(())
}

#[tauri::command]
pub async fn clear_cache(state: State<'_, AppState>) -> Result<(), String> {
    db::clear_scraper_cache(&state.db).await;
    Ok(())
}

// --- Handler ---

pub fn create_handler() -> impl Fn(tauri::ipc::Invoke<tauri::Wry>) -> bool + Send + Sync + 'static {
    tauri::generate_handler![
        get_movies, get_series, get_kdramas, get_games, get_anime, get_hentai,
        search_movies, search_series, search_anime, search_hentai, search_games, search_all,
        get_episode_streams,
        play_media, detect_player,
        get_playback, save_playback,
        get_favs, toggle_fav,
        get_downloads,
        get_settings, save_settings, clear_cache,
    ]
}
