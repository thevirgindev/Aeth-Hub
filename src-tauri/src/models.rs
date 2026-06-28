use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
#[serde(rename_all = "lowercase")]
pub enum MType { Movie, Series, Anime, Hentai, Game }

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
#[serde(rename_all = "lowercase")]
pub enum DlStat { Queued, Resolving, Downloading, Paused, Done, Failed }

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
#[serde(rename_all = "lowercase")]
pub enum VMode { Sub, Dub, Both }

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Movie {
    pub id: String, pub title: String, pub poster: String, pub backdrop: String,
    pub year: i32, pub rating: f32, pub runtime: i32, pub overview: String,
    pub genres: Vec<String>, pub tags: Vec<String>, pub streams: Vec<StrSrc>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Series {
    pub id: String, pub title: String, pub poster: String, pub backdrop: String,
    pub year: i32, pub rating: f32, pub overview: String, pub genres: Vec<String>,
    pub tags: Vec<String>, pub is_kdrama: bool, pub seasons: Vec<Season>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Season {
    pub num: i32, pub episodes: Vec<Episode>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Episode {
    pub num: i32, pub title: String, pub streams: Vec<StrSrc>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Anime {
    pub id: String, pub title: String, pub poster: String, pub banner: String,
    pub year: i32, pub status: String, pub eps: i32, pub rating: f32,
    pub synopsis: String, pub genres: Vec<String>, pub tags: Vec<String>,
    pub streams: Vec<StrSrc>, pub vmode: VMode,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Hentai {
    pub id: String, pub title: String, pub poster: String, pub banner: String,
    pub year: i32, pub status: String, pub eps: i32, pub rating: f32,
    pub synopsis: String, pub genres: Vec<String>, pub tags: Vec<String>,
    pub streams: Vec<StrSrc>, pub vmode: VMode, pub censored: bool,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Game {
    pub id: String, pub title: String, pub icon: String, pub banner: String,
    pub genre: String, pub desc: String, pub size: String, pub repacker: String,
    pub url: String, pub dl_count: i32, pub tags: Vec<String>, pub screenshots: Vec<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct DlItem {
    pub id: String, pub title: String, pub progress: f32, pub speed: String,
    pub eta: String, pub status: DlStat, pub path: String, pub src: String,
    pub magnet: String, pub bytes_done: i64, pub bytes_total: i64,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct StrSrc {
    pub name: String, pub url: String, pub quality: String, pub size: String,
    pub seeders: i32, pub kind: String, pub info_hash: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SearchRes {
    pub id: String, pub title: String, pub poster: String, pub year: i32,
    pub mtype: MType, pub rating: f32, pub source: String, pub quality: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct PlaybackPos {
    pub content_id: String, pub title: String, pub mtype: String,
    pub season: Option<i32>, pub episode: Option<i32>,
    pub position_secs: i64, pub duration_secs: i64, pub updated_at: i64,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct AppSettings {
    pub use_custom_player: bool, pub download_path: String,
    pub scrapers_enabled: Vec<String>, pub accent_color: String,
}
