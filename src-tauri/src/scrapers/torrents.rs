use crate::models::*;
use crate::db;
use reqwest::Client;
use scraper::{Html, Selector};
use sqlx::SqlitePool;
use std::collections::HashMap;
use std::time::Duration;

const TIMEOUT: Duration = Duration::from_secs(30);

const USER_AGENTS: &[&str] = &[
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36",
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:121.0) Gecko/20100101 Firefox/121.0",
    "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.1 Safari/605.1.15",
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36 Edg/120.0.0.0",
    "Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:121.0) Gecko/20100101 Firefox/121.0",
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/118.0.0.0 Safari/537.36",
    "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1",
];

fn pick_ua() -> &'static str {
    let i = std::time::SystemTime::now()
        .duration_since(std::time::UNIX_EPOCH)
        .unwrap_or_default()
        .as_nanos() as usize % USER_AGENTS.len();
    USER_AGENTS[i]
}

fn ih(magnet: &str) -> String {
    if let Some(start) = magnet.find("btih:") {
        let h = &magnet[start + 5..];
        if let Some(end) = h.find('&') { h[..end].to_uppercase() }
        else { h.to_uppercase() }
    } else {
        String::new()
    }
}

fn extract_quality(title: &str) -> String {
    let title = title.to_uppercase();
    if title.contains("2160P") || title.contains("4K") || title.contains("UHD") { return "4K".into() }
    if title.contains("1080P") || title.contains("FULLHD") { return "1080p".into() }
    if title.contains("720P") || title.contains("HD") { return "720p".into() }
    if title.contains("480P") || title.contains("SD") { return "480p".into() }
    "Unknown".into()
}

async fn get(client: &Client, url: &str) -> Result<String, String> {
    let resp = client.get(url)
        .header("User-Agent", pick_ua())
        .timeout(TIMEOUT)
        .send().await;
    let resp = match resp {
        Ok(r) => r,
        Err(e) => { eprintln!("[scraper] request failed: {} — {}", url, e); return Err(e.to_string()) }
    };
    let text = resp.text().await;
    match text {
        Ok(t) => Ok(t),
        Err(e) => { eprintln!("[scraper] body read failed: {} — {}", url, e); Err(e.to_string()) }
    }
}

struct RowInfo {
    title: String,
    href: String,
    seeds: i32,
    size: String,
}

pub async fn search_1337x(client: &Client, query: &str, cat: &str) -> Vec<StrSrc> {
    let encoded: String = urlencoding(&query);
    let ok = get(client, &format!("https://1337x.to/category-search/{}/{}/1/", encoded, cat)).await;
    let html = match ok { Ok(h) => h, Err(_) => return vec![] };

    let rows: Vec<RowInfo> = {
        let doc = Html::parse_document(&html);
        let row_sel = Selector::parse(".table-list tbody tr").unwrap();
        let name_sel = Selector::parse("td.name a:nth-child(2)").unwrap();
        let seeds_sel = Selector::parse("td.seeds").unwrap();
        let size_sel = Selector::parse("td.size").unwrap();

        let mut rows = vec![];
        for row in doc.select(&row_sel).take(15) {
            let link_el = row.select(&name_sel).next();
            let seeds: i32 = row.select(&seeds_sel).next()
                .and_then(|e| e.text().next())
                .and_then(|s| s.trim().parse().ok()).unwrap_or(0);
            let size = row.select(&size_sel).next()
                .and_then(|e| e.text().next())
                .unwrap_or("").trim().to_string();

            if let Some(link) = link_el {
                let title = link.text().collect::<String>().trim().to_string();
                if title.is_empty() || title.len() < 3 { continue; }
                let href = link.value().attr("href").unwrap_or("").to_string();
                rows.push(RowInfo { title, href, seeds, size });
            }
        }
        rows
    };

    let mut results = vec![];
    for r in &rows {
        let detail_url = format!("https://1337x.to{}", r.href);
        if let Ok(html2) = get(client, &detail_url).await {
            let doc2 = Html::parse_document(&html2);
            let magnet_sel = Selector::parse(".l42y a[href^='magnet:']").unwrap();
            if let Some(mag) = doc2.select(&magnet_sel).next() {
                if let Some(url) = mag.value().attr("href") {
                    results.push(StrSrc {
                        name: r.title.clone(), url: url.to_string(),
                        quality: extract_quality(&r.title), size: r.size.clone(),
                        seeders: r.seeds, kind: cat.to_string(), info_hash: ih(url),
                    });
                }
            }
        }
    }
    results
}

pub async fn search_tpb(client: &Client, query: &str, cat: &str) -> Vec<StrSrc> {
    let encoded: String = urlencoding(&query);
    let domains = ["piratebay.party", "thepiratebay.org", "tpb.party"];
    let mut results = vec![];

    for domain in &domains {
        let html = match get(client, &format!("https://{}/search/{}/1/99/{}", domain, encoded, cat)).await {
            Ok(h) => h, Err(_) => continue,
        };
        let doc = Html::parse_document(&html);
        let row_sel = Selector::parse("#searchResult tr").unwrap();
        let name_sel = Selector::parse(".detName a, .item-name a, a[href^='/torrent/']").unwrap();
        let magnet_sel = Selector::parse("a[href^='magnet:']").unwrap();
        let seeds_sel = Selector::parse("td:nth-child(3)").unwrap();

        for row in doc.select(&row_sel).take(15) {
            let title = row.select(&name_sel).next()
                .map(|e| e.text().collect::<String>().trim().to_string()).unwrap_or_default();
            if title.is_empty() || title.len() < 3 { continue; }
            let seeds: i32 = row.select(&seeds_sel).next()
                .and_then(|e| e.text().next())
                .and_then(|s| s.trim().parse().ok()).unwrap_or(0);
            let magnet = row.select(&magnet_sel).next()
                .and_then(|e| e.value().attr("href")).unwrap_or("").to_string();
            if magnet.is_empty() { continue; }

            let quality = extract_quality(&title);
            results.push(StrSrc {
                name: title, url: magnet.clone(), quality,
                size: String::new(), seeders: seeds, kind: cat.to_string(), info_hash: ih(&magnet),
            });
        }
        if !results.is_empty() { break; }
    }
    results
}

pub async fn search_yts(client: &Client, query: &str) -> Vec<StrSrc> {
    let encoded: String = urlencoding(&query);
    let json = match get(client, &format!("https://yts.mx/api/v2/list_movies.json?query_term={}&limit=50", encoded)).await {
        Ok(j) => j, Err(_) => return vec![]
    };
    let v: serde_json::Value = match serde_json::from_str(&json) { Ok(j) => j, Err(_) => return vec![] };
    let movies = v["data"]["movies"].as_array().map(|a| a.clone()).unwrap_or_default();

    let mut results = vec![];
    for movie in &movies {
        let title = movie["title"].as_str().unwrap_or("").to_string();
        let year = movie["year"].as_i64().unwrap_or(0);

        if let Some(torrents) = movie["torrents"].as_array() {
            for t in torrents {
                let quality = t["quality"].as_str().unwrap_or("Unknown").to_string();
                let size = t["size"].as_str().unwrap_or("").to_string();
                let seeds = t["seeds"].as_i64().unwrap_or(0) as i32;
                let url = t["url"].as_str().unwrap_or("").to_string();

                results.push(StrSrc {
                    name: format!("{} ({})", title, year),
                    url: url.clone(), quality, size, seeders: seeds,
                    kind: "Movies".into(), info_hash: ih(&url),
                });
            }
        }
    }
    results
}

pub async fn search_nyaa(client: &Client, query: &str, cat: &str) -> Vec<StrSrc> {
    let encoded: String = urlencoding(&query);
    let base = if cat == "Hentai" { "sukebei.nyaa.si" } else { "nyaa.si" };
    let cat_param = if cat == "Anime" { "1_0" } else if cat == "Hentai" { "2_0" } else { "0_0" };

    let html = match get(client, &format!("https://{}/?q={}&c={}&s=seeders&o=desc", base, encoded, cat_param)).await {
        Ok(h) => h, Err(_) => return vec![]
    };
    let doc = Html::parse_document(&html);
    let row_sel = Selector::parse("table.torrent-list tbody tr").unwrap();
    let magnet_sel = Selector::parse("a[href^='magnet:']").unwrap();
    let title_sel = Selector::parse("td:nth-child(2) a:last-child").unwrap();
    let size_sel = Selector::parse("td:nth-child(4)").unwrap();
    let seeds_sel = Selector::parse("td:nth-child(6)").unwrap();

    doc.select(&row_sel).take(20).map(|row| {
        let title = row.select(&title_sel).next()
            .map(|e| e.text().collect::<String>()).unwrap_or_default();
        let magnet = row.select(&magnet_sel).next()
            .and_then(|e| e.value().attr("href")).unwrap_or("").to_string();
        let size = row.select(&size_sel).next()
            .and_then(|e| e.text().next()).unwrap_or("").to_string();
        let seeds: i32 = row.select(&seeds_sel).next()
            .and_then(|e| e.text().next())
            .and_then(|s| s.trim().parse().ok()).unwrap_or(0);
        let quality = extract_quality(&title);
        let info_hash = ih(&magnet);
        StrSrc {
            name: title, url: magnet, quality,
            size, seeders: seeds, kind: cat.to_string(), info_hash,
        }
    }).filter(|s| !s.url.is_empty() && !s.name.is_empty() && s.name.len() >= 3).collect()
}

pub async fn search_eztv(client: &Client, query: &str) -> Vec<StrSrc> {
    let encoded: String = urlencoding(&query);
    let html = match get(client, &format!("https://eztv.re/search/{}", encoded)).await {
        Ok(h) => h, Err(_) => return vec![]
    };
    let doc = Html::parse_document(&html);
    let row_sel = Selector::parse("tr.forum_header_border").unwrap();
    let magnet_sel = Selector::parse("a[href^='magnet:']").unwrap();
    let title_sel = Selector::parse("td:nth-child(2) a").unwrap();
    let size_sel = Selector::parse("td:nth-child(4)").unwrap();

    doc.select(&row_sel).take(20).map(|row| {
        let title = row.select(&title_sel).next()
            .map(|e| e.text().collect::<String>()).unwrap_or_default();
        let magnet = row.select(&magnet_sel).next()
            .and_then(|e| e.value().attr("href")).unwrap_or("").to_string();
        let size = row.select(&size_sel).next()
            .and_then(|e| e.text().next()).unwrap_or("").to_string();
        let quality = extract_quality(&title);
        let info_hash = ih(&magnet);
        StrSrc {
            name: title, url: magnet, quality,
            size, seeders: 0, kind: "TV".into(), info_hash,
        }
    }).filter(|s| !s.url.is_empty() && !s.name.is_empty() && s.name.len() >= 3).collect()
}

pub async fn search_anidex(client: &Client, query: &str) -> Vec<StrSrc> {
    let encoded: String = urlencoding(&query);
    let html = match get(client, &format!("https://anidex.info/?q={}&category_id=1", encoded)).await {
        Ok(h) => h, Err(_) => return vec![]
    };
    let doc = Html::parse_document(&html);
    let row_sel = Selector::parse("table tbody tr").unwrap();
    let magnet_sel = Selector::parse("a[href^='magnet:']").unwrap();
    let title_sel = Selector::parse("td:nth-child(3) a").unwrap();
    let seeds_sel = Selector::parse("td:nth-child(7)").unwrap();

    doc.select(&row_sel).take(20).map(|row| {
        let title = row.select(&title_sel).next()
            .map(|e| e.text().collect::<String>()).unwrap_or_default();
        let magnet = row.select(&magnet_sel).next()
            .and_then(|e| e.value().attr("href")).unwrap_or("").to_string();
        let seeds: i32 = row.select(&seeds_sel).next()
            .and_then(|e| e.text().next())
            .and_then(|s| s.trim().parse().ok()).unwrap_or(0);
        let quality = extract_quality(&title);
        let info_hash = ih(&magnet);
        StrSrc {
            name: title, url: magnet, quality,
            size: String::new(), seeders: seeds, kind: "Anime".into(), info_hash,
        }
    }).filter(|s| !s.url.is_empty() && !s.name.is_empty() && s.name.len() >= 3).collect()
}

async fn scrape_repack_site(client: &Client, url: &str, repacker: &str) -> Vec<StrSrc> {
    let html = match get(client, url).await { Ok(h) => h, Err(_) => return vec![] };
    let articles: Vec<(String, String)> = {
        let doc = Html::parse_document(&html);
        let article_sel = Selector::parse("article").unwrap();
        let title_sel = Selector::parse("h1.entry-title a, h2.entry-title a, .post-title a").unwrap();

        let mut articles = vec![];
        for article in doc.select(&article_sel).take(10) {
            let title = article.select(&title_sel).next()
                .map(|e| e.text().collect::<String>()).unwrap_or_default();
            let url = article.select(&title_sel).next()
                .and_then(|e| e.value().attr("href")).unwrap_or("").to_string();
            if !title.is_empty() {
                articles.push((title, url));
            }
        }
        articles
    };

    let mut results = vec![];
    for (title, article_url) in &articles {
        let magnet = if !article_url.is_empty() {
            if let Ok(html2) = get(client, article_url).await {
                let doc2 = Html::parse_document(&html2);
                let mag_sel = Selector::parse("a[href^='magnet:']").unwrap();
                doc2.select(&mag_sel).next()
                    .and_then(|e| e.value().attr("href")).unwrap_or("").to_string()
            } else { String::new() }
        } else { String::new() };

        results.push(StrSrc {
            name: title.clone(), url: magnet, quality: "Repack".into(),
            size: "Unknown".into(), seeders: 0,
            kind: repacker.to_string(), info_hash: String::new(),
        });
    }
    results
}

pub async fn search_fitgirl(client: &Client, query: &str) -> Vec<StrSrc> {
    let encoded: String = urlencoding(&query);
    scrape_repack_site(client, &format!("https://fitgirl-repacks.site/?s={}", encoded), "FitGirl").await
}

pub async fn search_dodi(client: &Client, query: &str) -> Vec<StrSrc> {
    let encoded: String = urlencoding(&query);
    scrape_repack_site(client, &format!("https://dodi-repacks.site/?s={}", encoded), "DODI").await
}

pub async fn search_steamrip(client: &Client, query: &str) -> Vec<StrSrc> {
    let encoded: String = urlencoding(&query);
    let html = match get(client, &format!("https://steamrip.com/?s={}", encoded)).await {
        Ok(h) => h, Err(_) => return vec![]
    };
    let doc = Html::parse_document(&html);
    let article_sel = Selector::parse("article").unwrap();
    let title_sel = Selector::parse("h2.entry-title a").unwrap();

    doc.select(&article_sel).take(10).map(|article| {
        let title = article.select(&title_sel).next()
            .map(|e| e.text().collect::<String>()).unwrap_or_default();
        let url = article.select(&title_sel).next()
            .and_then(|e| e.value().attr("href")).unwrap_or("").to_string();
        StrSrc {
            name: title, url, quality: "Pre-Installed".into(),
            size: "Unknown".into(), seeders: 0,
            kind: "SteamRIP".into(), info_hash: String::new(),
        }
    }).filter(|s| !s.name.is_empty()).collect()
}

pub async fn search_gog(client: &Client, query: &str) -> Vec<StrSrc> {
    let encoded: String = urlencoding(&query);
    let html = match get(client, &format!("https://gog-games.com/search/{}", encoded)).await {
        Ok(h) => h, Err(_) => return vec![]
    };
    let doc = Html::parse_document(&html);
    let game_sel = Selector::parse(".game-item, .search-result, .card").unwrap();
    let title_sel = Selector::parse("a, h3, .title, .name").unwrap();

    doc.select(&game_sel).take(10).map(|el| {
        let title = el.select(&title_sel).next()
            .map(|e| e.text().collect::<String>()).unwrap_or_default();
        let url = el.select(&title_sel).next()
            .and_then(|e| e.value().attr("href")).unwrap_or("").to_string();
        StrSrc {
            name: title, url, quality: "DRM-Free".into(),
            size: String::new(), seeders: 0,
            kind: "GOG".into(), info_hash: String::new(),
        }
    }).filter(|s| !s.name.is_empty()).collect()
}

pub async fn search_onlinefix(client: &Client, query: &str) -> Vec<StrSrc> {
    let encoded: String = urlencoding(&query);
    let html = match get(client, &format!("https://online-fix.me/?s={}", encoded)).await {
        Ok(h) => h, Err(_) => return vec![]
    };
    let doc = Html::parse_document(&html);
    let post_sel = Selector::parse(".post, article, .entry").unwrap();
    let title_sel = Selector::parse("a, h2, .title").unwrap();

    doc.select(&post_sel).take(10).map(|el| {
        let title = el.select(&title_sel).next()
            .map(|e| e.text().collect::<String>()).unwrap_or_default();
        let url = el.select(&title_sel).next()
            .and_then(|e| e.value().attr("href")).unwrap_or("").to_string();
        StrSrc {
            name: title, url, quality: "Online-Fix".into(),
            size: String::new(), seeders: 0,
            kind: "OnlineFix".into(), info_hash: String::new(),
        }
    }).filter(|s| !s.name.is_empty()).collect()
}

async fn delay_between_scrapes() {
    let seed = std::time::SystemTime::now()
        .duration_since(std::time::UNIX_EPOCH)
        .unwrap_or_default()
        .as_micros() as u64;
    let secs = 5 + (seed % 11);
    tokio::time::sleep(Duration::from_secs(secs)).await;
}

pub async fn search_ovagames(client: &Client, query: &str) -> Vec<StrSrc> {
    let encoded: String = urlencoding(&query);
    scrape_repack_site(client, &format!("https://ovagames.com/?s={}", encoded), "OvaGames").await
}

pub async fn search_xgameszone(client: &Client, query: &str) -> Vec<StrSrc> {
    let encoded: String = urlencoding(&query);
    scrape_repack_site(client, &format!("https://xgames.zone/?s={}", encoded), "XGamesZone").await
}

fn dedup_sorted(mut results: Vec<StrSrc>) -> Vec<StrSrc> {
    let mut seen = HashMap::new();
    let mut deduped = Vec::new();
    for s in results.drain(..) {
        if s.name.is_empty() || s.name.len() < 3 { continue; }
        let key = if s.info_hash.is_empty() { s.name.clone() } else { s.info_hash.clone() };
        let entry = seen.entry(key).or_insert(StrSrc { seeders: -1, ..s.clone() });
        if s.seeders > entry.seeders { *entry = s; }
    }
    for (_, v) in seen.drain() { deduped.push(v); }
    deduped.sort_by(|a, b| b.seeders.cmp(&a.seeders));
    deduped
}

macro_rules! join_search {
    ($client:expr, $($f:expr),+ $(,)?) => {{
        let mut all = Vec::new();
        $(
            let v = $f.await;
            all.extend(v);
        )+
        all
    }};
}

async fn cached_search(
    pool: &SqlitePool,
    cache_key: &str,
    ttl_secs: i64,
    f: impl std::future::Future<Output = Vec<StrSrc>>,
) -> Vec<StrSrc> {
    if let Some(cached) = db::get_cached(pool, cache_key).await {
        if let Ok(results) = serde_json::from_str::<Vec<StrSrc>>(&cached) {
            return results;
        }
    }
    let results = f.await;
    if let Ok(json) = serde_json::to_string(&results) {
        db::set_cached(pool, cache_key, &json, ttl_secs).await;
    }
    results
}

pub async fn search_movies(client: &Client, pool: &SqlitePool, query: &str) -> Vec<StrSrc> {
    let cache_key = format!("search_movies:{}", query.to_lowercase());
    cached_search(pool, &cache_key, 2592000, async move {
        dedup_sorted(join_search!(
            client,
            search_1337x(client, query, "Movies"),
            search_tpb(client, query, "200"),
            search_yts(client, query),
        ))
    }).await
}

pub async fn search_tv(client: &Client, pool: &SqlitePool, query: &str) -> Vec<StrSrc> {
    let cache_key = format!("search_tv:{}", query.to_lowercase());
    cached_search(pool, &cache_key, 2592000, async move {
        dedup_sorted(join_search!(
            client,
            search_1337x(client, query, "TV"),
            search_tpb(client, query, "205"),
            search_eztv(client, query),
        ))
    }).await
}

pub async fn search_anime(client: &Client, pool: &SqlitePool, query: &str) -> Vec<StrSrc> {
    let cache_key = format!("search_anime:{}", query.to_lowercase());
    cached_search(pool, &cache_key, 2592000, async move {
        dedup_sorted(join_search!(
            client,
            search_nyaa(client, query, "Anime"),
            search_anidex(client, query),
            search_1337x(client, query, "Anime"),
        ))
    }).await
}

pub async fn search_hentai(client: &Client, pool: &SqlitePool, query: &str) -> Vec<StrSrc> {
    let cache_key = format!("search_hentai:{}", query.to_lowercase());
    cached_search(pool, &cache_key, 2592000, async move {
        dedup_sorted(join_search!(
            client,
            search_nyaa(client, query, "Hentai"),
            search_1337x(client, query, "XXX"),
        ))
    }).await
}

pub async fn search_games(client: &Client, pool: &SqlitePool, query: &str) -> Vec<StrSrc> {
    let cache_key = format!("search_games:{}", query.to_lowercase());
    cached_search(pool, &cache_key, 2592000, async move {
        let mut all = Vec::new();
        all.extend(search_fitgirl(client, query).await);
        delay_between_scrapes().await;
        all.extend(search_dodi(client, query).await);
        delay_between_scrapes().await;
        all.extend(search_steamrip(client, query).await);
        delay_between_scrapes().await;
        all.extend(search_gog(client, query).await);
        delay_between_scrapes().await;
        all.extend(search_onlinefix(client, query).await);
        delay_between_scrapes().await;
        all.extend(search_ovagames(client, query).await);
        delay_between_scrapes().await;
        all.extend(search_xgameszone(client, query).await);
        delay_between_scrapes().await;
        all.extend(search_1337x(client, query, "Games").await);
        delay_between_scrapes().await;
        all.extend(search_tpb(client, query, "300").await);
        dedup_sorted(all)
    }).await
}

pub async fn search_all(client: &Client, pool: &SqlitePool, query: &str) -> Vec<StrSrc> {
    let cache_key = format!("search_all:{}", query.to_lowercase());
    cached_search(pool, &cache_key, 2592000, async move {
        let movies = search_movies(client, pool, query);
        let tv = search_tv(client, pool, query);
        let anime = search_anime(client, pool, query);
        let hentai = search_hentai(client, pool, query);
        let games = search_games(client, pool, query);

        let mut all = Vec::new();
        all.extend(movies.await);
        all.extend(tv.await);
        all.extend(anime.await);
        all.extend(hentai.await);
        all.extend(games.await);
        dedup_sorted(all)
    }).await
}

pub async fn fetch_movie_catalog(client: &Client, pool: &SqlitePool) -> Vec<Movie> {
    let cache_key = "catalog:movies";
    if let Some(cached) = db::get_cached(pool, cache_key).await {
        if let Ok(results) = serde_json::from_str::<Vec<Movie>>(&cached) {
            return results;
        }
    }
    let json = match get(client, "https://yts.mx/api/v2/list_movies.json?limit=50&sort=download_count&order_by=desc").await {
        Ok(j) => j, Err(_) => return vec![]
    };
    let v: serde_json::Value = match serde_json::from_str(&json) { Ok(j) => j, Err(_) => return vec![] };
    let movies = v["data"]["movies"].as_array().map(|a| a.clone()).unwrap_or_default();

    let results: Vec<Movie> = movies.iter().enumerate().map(|(i, m)| {
        let genres: Vec<String> = m["genres"].as_array()
            .map(|a| a.iter().filter_map(|g| g.as_str().map(String::from)).collect())
            .unwrap_or_default();
        Movie {
            id: format!("ym{}", m["id"].as_i64().unwrap_or(i as i64)),
            title: m["title"].as_str().unwrap_or("").to_string(),
            poster: m["medium_cover_image"].as_str().unwrap_or("").to_string(),
            backdrop: m["background_image"].as_str().unwrap_or("").to_string(),
            year: m["year"].as_i64().unwrap_or(0) as i32,
            rating: m["rating"].as_f64().unwrap_or(0.0).min(10.0) as f32,
            runtime: m["runtime"].as_i64().unwrap_or(0) as i32,
            overview: m["summary"].as_str().unwrap_or("").to_string(),
            genres,
            tags: vec![],
            streams: vec![],
        }
    }).collect();

    if let Ok(json) = serde_json::to_string(&results) {
        db::set_cached(pool, cache_key, &json, 7200).await;
    }
    results
}

pub async fn fetch_anime_catalog(client: &Client, pool: &SqlitePool) -> Vec<Anime> {
    let cache_key = "catalog:anime";
    if let Some(cached) = db::get_cached(pool, cache_key).await {
        if let Ok(results) = serde_json::from_str::<Vec<Anime>>(&cached) {
            return results;
        }
    }
    let json = match get(client, "https://api.jikan.moe/v4/top/anime?limit=25&filter=bypopularity").await {
        Ok(j) => j, Err(_) => return vec![]
    };
    let v: serde_json::Value = match serde_json::from_str(&json) { Ok(j) => j, Err(_) => return vec![] };
    let list = v["data"].as_array().map(|a| a.clone()).unwrap_or_default();

    let results: Vec<Anime> = list.iter().enumerate().map(|(i, entry)| {
        let genres: Vec<String> = entry["genres"].as_array()
            .map(|a| a.iter().filter_map(|g| g["name"].as_str().map(String::from)).collect())
            .unwrap_or_default();
        Anime {
            id: format!("aj{}", entry["mal_id"].as_i64().unwrap_or(i as i64)),
            title: entry["title"].as_str().unwrap_or("").to_string(),
            poster: entry["images"]["jpg"]["image_url"].as_str().unwrap_or("").to_string(),
            banner: entry["images"]["jpg"]["large_image_url"].as_str().unwrap_or("").to_string(),
            year: entry["year"].as_i64().or_else(|| entry["aired"]["prop"]["from"]["year"].as_i64()).unwrap_or(0) as i32,
            status: entry["status"].as_str().unwrap_or("").to_string(),
            eps: entry["episodes"].as_i64().unwrap_or(0) as i32,
            rating: entry["score"].as_f64().unwrap_or(0.0).min(10.0) as f32,
            synopsis: entry["synopsis"].as_str().unwrap_or("").to_string(),
            genres,
            tags: vec![],
            streams: vec![],
            vmode: VMode::Sub,
        }
    }).collect();

    if let Ok(json) = serde_json::to_string(&results) {
        db::set_cached(pool, cache_key, &json, 7200).await;
    }
    results
}

pub async fn fetch_series_catalog(client: &Client, pool: &SqlitePool) -> Vec<Series> {
    let cache_key = "catalog:series";
    if let Some(cached) = db::get_cached(pool, cache_key).await {
        if let Ok(results) = serde_json::from_str::<Vec<Series>>(&cached) {
            return results;
        }
    }
    let json = match get(client, "https://api.tvmaze.com/shows?page=0").await {
        Ok(j) => j, Err(_) => return vec![]
    };
    let v: Vec<serde_json::Value> = match serde_json::from_str(&json) { Ok(j) => j, Err(_) => return vec![] };
    let results: Vec<Series> = v.iter().take(25).enumerate().map(|(i, s)| {
        let genres: Vec<String> = s["genres"].as_array()
            .map(|a| a.iter().filter_map(|g| g.as_str().map(String::from)).collect())
            .unwrap_or_default();
        let is_kdrama = genres.iter().any(|g| g == "Romance" || g == "Drama") &&
            s["network"]["country"]["name"].as_str().map(|n| n == "South Korea").unwrap_or(false);
        let img = s["image"]["original"].as_str().or_else(|| s["image"]["medium"].as_str()).unwrap_or("").to_string();
        Series {
            id: format!("tv{}", s["id"].as_i64().unwrap_or(i as i64)),
            title: s["name"].as_str().unwrap_or("").to_string(),
            poster: img.clone(),
            backdrop: s["image"]["medium"].as_str().unwrap_or("").to_string(),
            year: s["premiered"].as_str().and_then(|d| d[..4].parse().ok()).unwrap_or(0),
            rating: s["rating"]["average"].as_f64().unwrap_or(0.0).min(10.0) as f32,
            overview: s["summary"].as_str().map(|h| {
                h.replace("<p>", "").replace("</p>", "\n").replace("<b>", "").replace("</b>", "")
            }).unwrap_or_default().trim().to_string(),
            genres, tags: vec![],
            is_kdrama,
            seasons: vec![],
        }
    }).collect();

    if let Ok(json) = serde_json::to_string(&results) {
        db::set_cached(pool, cache_key, &json, 7200).await;
    }
    results
}

pub async fn fetch_game_catalog(client: &Client, pool: &SqlitePool) -> Vec<Game> {
    let cache_key = "catalog:games";
    if let Some(cached) = db::get_cached(pool, cache_key).await {
        if let Ok(results) = serde_json::from_str::<Vec<Game>>(&cached) {
            return results;
        }
    }
    let json = match get(client, "https://www.freetogame.com/api/games?sort-by=release-date").await {
        Ok(j) => j, Err(_) => return vec![]
    };
    let v: Vec<serde_json::Value> = match serde_json::from_str(&json) { Ok(j) => j, Err(_) => return vec![] };
    let results: Vec<Game> = v.iter().enumerate().map(|(i, g)| {
        let genre = g["genre"].as_str().unwrap_or("").to_string();
        Game {
            id: format!("fg{}", g["id"].as_i64().unwrap_or(i as i64)),
            title: g["title"].as_str().unwrap_or("").to_string(),
            icon: g["thumbnail"].as_str().unwrap_or("").to_string(),
            banner: g["thumbnail"].as_str().map(|t| t.replace("/thumbnail.jpg", "/background.jpg")).unwrap_or_default(),
            genre,
            desc: g["short_description"].as_str().unwrap_or("").to_string(),
            size: String::new(),
            repacker: String::new(),
            url: g["game_url"].as_str().unwrap_or("").to_string(),
            dl_count: g["freetogame_profile_url"].as_str().map(|_| g["id"].as_i64().unwrap_or(i as i64) as i32).unwrap_or(0),
            rating: 0.0,
            tags: vec![],
            screenshots: vec![],
        }
    }).collect();

    if let Ok(json) = serde_json::to_string(&results) {
        db::set_cached(pool, cache_key, &json, 7200).await;
    }
    results
}

pub async fn fetch_hentai_catalog(client: &Client, pool: &SqlitePool) -> Vec<Hentai> {
    let cache_key = "catalog:hentai";
    if let Some(cached) = db::get_cached(pool, cache_key).await {
        if let Ok(results) = serde_json::from_str::<Vec<Hentai>>(&cached) {
            return results;
        }
    }
    let json = match get(client, "https://api.jikan.moe/v4/anime?genres=12&order_by=popularity&limit=25&sfw=false").await {
        Ok(j) => j, Err(_) => return vec![]
    };
    let v: serde_json::Value = match serde_json::from_str(&json) { Ok(j) => j, Err(_) => return vec![] };
    let list = v["data"].as_array().map(|a| a.clone()).unwrap_or_default();

    let results: Vec<Hentai> = list.iter().enumerate().map(|(i, entry)| {
        let genres: Vec<String> = entry["genres"].as_array()
            .map(|a| a.iter().filter_map(|g| g["name"].as_str().map(String::from)).collect())
            .unwrap_or_default();
        Hentai {
            id: format!("hj{}", entry["mal_id"].as_i64().unwrap_or(i as i64)),
            title: entry["title"].as_str().unwrap_or("").to_string(),
            poster: entry["images"]["jpg"]["image_url"].as_str().unwrap_or("").to_string(),
            banner: entry["images"]["jpg"]["large_image_url"].as_str().unwrap_or("").to_string(),
            year: entry["year"].as_i64().or_else(|| entry["aired"]["prop"]["from"]["year"].as_i64()).unwrap_or(0) as i32,
            status: entry["status"].as_str().unwrap_or("").to_string(),
            eps: entry["episodes"].as_i64().unwrap_or(0) as i32,
            rating: entry["score"].as_f64().unwrap_or(0.0).min(10.0) as f32,
            synopsis: entry["synopsis"].as_str().unwrap_or("").to_string(),
            genres,
            tags: vec![],
            streams: vec![],
            vmode: VMode::Sub,
            censored: !entry["rating"].as_str().map(|r| r.contains("Rx")).unwrap_or(true),
        }
    }).collect();

    if let Ok(json) = serde_json::to_string(&results) {
        db::set_cached(pool, cache_key, &json, 7200).await;
    }
    results
}

fn urlencoding(s: &str) -> String {
    s.chars().map(|c| match c {
        'A'..='Z' | 'a'..='z' | '0'..='9' | '-' | '_' | '.' | '~' => c.to_string(),
        ' ' => "+".to_string(),
        _ => format!("%{:02X}", c as u8),
    }).collect()
}
