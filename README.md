# Aeth

A modern desktop media browser built with **Tauri v2**, **React**, **TypeScript**, and **Rust**.

Search and stream movies, TV shows, anime, hentai, and repacked games via torrents — all from a native desktop app with a dark space-themed UI.

## Features

- **Catalog browsing** — Movies, TV Shows, K-Dramas, Anime, Hentai, and repacked Games
- **Torrent search** — 12 built-in scrapers across 7 categories (1337x, TPB, YTS, EZTV, Nyaa, AniDex, FitGirl, DODI, SteamRIP, GOG, Online-Fix)
- **External player** — Detects mpv / VLC / MPC-HC automatically, launches magnet links
- **Continue watching** — Tracks playback position per title/episode
- **Favorites** — Save titles to your library
- **Persistent settings** — Accent color, download path, scraper toggles saved to SQLite
- **Dark UI** — Monochrome space theme with glassmorphism, Lucide icons, loading skeletons

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 19, TypeScript, Tailwind CSS v4, Vite 8 |
| Backend | Rust, Tauri v2 |
| Database | SQLite (via sqlx) |
| Icons | Lucide React |

## Building from Source

### Prerequisites

- [Rust](https://rustup.rs/) (stable, `x86_64-pc-windows-gnu` for Windows MSYS2)
- [Node.js](https://nodejs.org/) 20+
- System dependencies for Tauri 2 ([see guide](https://v2.tauri.app/start/prerequisites/))

### Build

```bash
npm install
cd src-tauri && cargo build --release
```

Release binary: `src-tauri/target/release/app.exe`

### Development

```bash
npm run tauri dev
```

## License

GNU General Public License v3.0 — see [LICENSE](LICENSE).

## Disclaimer

Aeth does not host or distribute any copyrighted content. It searches public torrent indexes and plays magnet links through external players. Users are responsible for complying with their local laws.
