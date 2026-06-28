use crate::models::StrSrc;
use reqwest::Client;
use scraper::{Html, Selector};
use std::collections::HashMap;
use std::time::Duration;

const TIMEOUT: Duration = Duration::from_secs(8);

fn ih(magnet: &str) -> String {
    if let Some(start) = magnet.find("btih:") {
        let h = &magnet[start + 5..];
        if let Some(end) = h.find('&') { h[..end].to_uppercase() }
        else { h.to_uppercase() }
    } else {
        String::new()
    }
}

fn size_bytes(s: &str) -> i64 {
    let s = s.trim().to_lowercase();
    let n: f64 = s.split_whitespace().next().unwrap_or("0").parse().unwrap_or(0.0);
    if s.contains("tb") { (n * 1_099_511_627_776.0) as i64 }
    else if s.contains("gb") { (n * 1_073_741_824.0) as i64 }
    else if s.contains("mb") { (n * 1_048_576.0) as i64 }
    else if s.contains("kb") { (n * 1024.0) as i64 }
    else { n as i64 }
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
    client.get(url)
        .header("User-Agent", "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36")
        .timeout(TIMEOUT)
        .send().await.map_err(|e| e.to_string())?
        .text().await.map_err(|e| e.to_string())
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
        let name_sel = Selector::parse(".detName a").unwrap();
        let magnet_sel = Selector::parse("a[href^='magnet:']").unwrap();
        let seeds_sel = Selector::parse("td:nth-child(3)").unwrap();
        let size_sel = Selector::parse("font.detDesc").unwrap();

        for row in doc.select(&row_sel).take(15) {
            let title = row.select(&name_sel).next()
                .map(|e| e.text().collect::<String>().trim().to_string()).unwrap_or_default();
            let seeds: i32 = row.select(&seeds_sel).next()
                .and_then(|e| e.text().next())
                .and_then(|s| s.trim().parse().ok()).unwrap_or(0);
            let magnet = row.select(&magnet_sel).next()
                .and_then(|e| e.value().attr("href")).unwrap_or("").to_string();
            let size_text = row.select(&size_sel).next()
                .map(|e| e.text().collect::<String>()).unwrap_or_default();
            let size = size_text.split(',').nth(1).unwrap_or("").trim().to_string();

            if !magnet.is_empty() {
                let quality = extract_quality(&title);
                results.push(StrSrc {
                    name: title, url: magnet.clone(), quality,
                    size, seeders: seeds, kind: cat.to_string(), info_hash: ih(&magnet),
                });
            }
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
    }).filter(|s| !s.url.is_empty()).collect()
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
    }).filter(|s| !s.url.is_empty()).collect()
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
    }).filter(|s| !s.url.is_empty()).collect()
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

fn dedup_sorted(mut results: Vec<StrSrc>) -> Vec<StrSrc> {
    let mut seen = HashMap::new();
    let mut deduped = Vec::new();
    for s in results.drain(..) {
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

pub async fn search_movies(client: &Client, query: &str) -> Vec<StrSrc> {
    dedup_sorted(join_search!(
        client,
        search_1337x(client, query, "Movies"),
        search_tpb(client, query, "200"),
        search_yts(client, query),
    ))
}

pub async fn search_tv(client: &Client, query: &str) -> Vec<StrSrc> {
    dedup_sorted(join_search!(
        client,
        search_1337x(client, query, "TV"),
        search_tpb(client, query, "205"),
        search_eztv(client, query),
    ))
}

pub async fn search_anime(client: &Client, query: &str) -> Vec<StrSrc> {
    dedup_sorted(join_search!(
        client,
        search_nyaa(client, query, "Anime"),
        search_anidex(client, query),
        search_1337x(client, query, "Anime"),
    ))
}

pub async fn search_hentai(client: &Client, query: &str) -> Vec<StrSrc> {
    dedup_sorted(join_search!(
        client,
        search_nyaa(client, query, "Hentai"),
        search_1337x(client, query, "XXX"),
    ))
}

pub async fn search_games(client: &Client, query: &str) -> Vec<StrSrc> {
    dedup_sorted(join_search!(
        client,
        search_fitgirl(client, query),
        search_dodi(client, query),
        search_steamrip(client, query),
        search_gog(client, query),
        search_onlinefix(client, query),
        search_1337x(client, query, "Games"),
        search_tpb(client, query, "300"),
    ))
}

pub async fn search_all(client: &Client, query: &str) -> Vec<StrSrc> {
    let movies = search_movies(client, query);
    let tv = search_tv(client, query);
    let anime = search_anime(client, query);
    let hentai = search_hentai(client, query);
    let games = search_games(client, query);

    let movies = movies.await;
    let tv = tv.await;
    let anime = anime.await;
    let hentai = hentai.await;
    let games = games.await;

    let mut all = Vec::new();
    all.extend(movies);
    all.extend(tv);
    all.extend(anime);
    all.extend(hentai);
    all.extend(games);
    dedup_sorted(all)
}

fn urlencoding(s: &str) -> String {
    s.chars().map(|c| match c {
        'A'..='Z' | 'a'..='z' | '0'..='9' | '-' | '_' | '.' | '~' => c.to_string(),
        ' ' => "+".to_string(),
        _ => format!("%{:02X}", c as u8),
    }).collect()
}
