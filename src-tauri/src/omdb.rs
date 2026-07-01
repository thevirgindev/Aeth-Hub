use serde::{Deserialize, Serialize};

#[derive(Serialize, Deserialize, Debug)]
#[allow(non_snake_case)]
pub struct OmdbMovie {
    pub Title: Option<String>,
    pub Year: Option<String>,
    pub Rated: Option<String>,
    pub Released: Option<String>,
    pub Runtime: Option<String>,
    pub Genre: Option<String>,
    pub Director: Option<String>,
    pub Writer: Option<String>,
    pub Actors: Option<String>,
    pub Plot: Option<String>,
    pub Poster: Option<String>,
    pub imdbRating: Option<String>,
    pub imdbID: Option<String>,
    #[allow(dead_code)]
    #[serde(rename = "Type")]
    pub type_: Option<String>,
    pub totalSeasons: Option<String>,
}

pub async fn fetch_omdb_by_id(imdb_id: &str) -> Result<OmdbMovie, String> {
    let client = reqwest::Client::new();
    let url = format!("https://www.omdbapi.com/?apikey=b351c3c0&i={}", imdb_id);
    let res = client.get(&url).send().await.map_err(|e| e.to_string())?;
    let data: OmdbMovie = res.json().await.map_err(|e| e.to_string())?;
    Ok(data)
}

pub async fn fetch_omdb(title: &str, year: Option<&str>) -> Result<OmdbMovie, String> {
    let client = reqwest::Client::new();
    let mut url = format!("https://www.omdbapi.com/?apikey=b351c3c0&t={}", title);
    if let Some(y) = year {
        url = format!("{}&y={}", url, y);
    }
    let res = client.get(&url).send().await.map_err(|e| e.to_string())?;
    let data: OmdbMovie = res.json().await.map_err(|e| e.to_string())?;
    Ok(data)
}
