<div align="center">
  <img src="./public/logos/aeth-withnobg_black.png" width="120" alt="Aeth Hub" style="filter: brightness(4);" />
  <h1 align="center">Aeth Hub</h1>
  <p align="center">
    <strong>Open-source streaming desktop app for anime, movies, TV shows, and games</strong>
  </p>

  [![Tauri](https://img.shields.io/badge/Tauri-v2-7C5CFF?logo=tauri)](https://v2.tauri.app)
  [![React](https://img.shields.io/badge/React-19-61DAFB?logo=react)](https://react.dev)
  [![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript)](https://www.typescriptlang.org)
  [![License](https://img.shields.io/badge/License-GPL--3.0-7C5CFF)](LICENSE)
</div>

Aeth Hub is a native desktop media browser that lets you search, stream, and download anime, movies, TV shows, and repacked games — all through an embedded torrent pipeline. Built with Tauri v2 for a lightweight, sandboxed experience.

> **Preview release v0.1.0** — Only anime browsing is currently accessible. Other categories coming in subsequent releases.

## Features

- **Anime & Manga** — Browse and search via AniList API with detailed metadata
- **Torrent streaming** — Built-in HTML5 player with HLS support for magnet links
- **External player support** — Auto-detects mpv / VLC / MPC-HC
- **Download manager** — Hydra-style pipeline with queue and progress tracking
- **Continue watching** — Resumes playback from where you left off per episode
- **Favorites** — Save titles to your personal watchlist
- **Theme system** — Dark space theme (default) + Pixelated Space preset, expandable via marketplace
- **Discord Rich Presence** — Shows what you're watching or playing
- **Keyboard shortcuts** — Ctrl+K search, Alt+1-9 navigation, Ctrl+B sidebar toggle

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 19, TypeScript, Tailwind CSS v4, Vite 8 |
| Backend | Rust, Tauri v2 |
| Database | SQLite (sqlx) |
| APIs | AniList (GraphQL), Steam, OMDb |
| Icons | Lucide React |
| Scrapers | 1337x, TPB, YTS, EZTV, Nyaa, AniDex, FitGirl, DODI, SteamRIP, GOG, Online-Fix, OvaGames, XGamesZone |

## Building from Source

### Prerequisites

- [Rust](https://rustup.rs/) (stable, `x86_64-pc-windows-gnu` toolchain for MSYS2 on Windows)
- [Node.js](https://nodejs.org/) 20+
- Tauri v2 system dependencies ([Windows guide](https://v2.tauri.app/start/prerequisites/))

### Quick Start

```bash
git clone https://github.com/thevirgindev/Aeth-Hub.git
cd Aeth-Hub
npm install
npm run tauri dev
```

### Production Build

```bash
npm run build
cd src-tauri && cargo build --release
```

Release binary: `src-tauri/target/release/Aeth Hub.exe`

## Keyboard Shortcuts

| Key | Action |
|-----|--------|
| Ctrl+K | Toggle search overlay |
| Ctrl+B / Ctrl+S | Toggle sidebar |
| Esc | Go back / close modals |
| Alt+1-9 | Navigate pages |
| Ctrl+= / Ctrl+- | Zoom in / out |
| Ctrl+0 | Reset zoom |
| ↑↓ | Navigate search results |
| Enter | Select search result |

## License

GNU General Public License v3.0 — see [LICENSE](LICENSE).

## Disclaimer

Aeth Hub does not host or distribute any copyrighted content. It indexes public torrent catalogs and magnet links. Users are responsible for complying with their local laws.
