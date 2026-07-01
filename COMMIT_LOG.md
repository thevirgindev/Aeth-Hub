# Aeth Hub — Commit Log

## Initial Release — v0.1.0-preview

### Core Architecture
| File | Message |
|------|---------|
| `src-tauri/src/main.rs` | feat: bootstrap Tauri v2 desktop entrypoint with custom window manager |
| `src-tauri/src/lib.rs` | feat: wire up command registry, plugin system, and tray lifecycle |
| `src-tauri/src/cmds.rs` | feat: implement Tauri IPC commands for catalog, playback, and settings |
| `src-tauri/src/cache.rs` | feat: add in-memory API cache with 300s TTL to reduce upstream calls |
| `src-tauri/src/models.rs` | feat: model definitions for Anime, Movie, Series, Game, and stream sources |
| `src-tauri/src/db.rs` | feat: SQLite persistence layer for playback positions, downloads, and favorites |
| `src-tauri/tauri.conf.json` | chore: configure 1280x800 fixed window, custom decorations, and NSIS target |
| `src-tauri/capabilities/default.json` | chore: configure Tauri v2 capability permissions |

### API Integrations
| File | Message |
|------|---------|
| `src-tauri/src/anilist.rs` | feat: AniList GraphQL client for anime/manga catalog, search, and OAuth |
| `src-tauri/src/steam.rs` | feat: Steam store API client for game catalog and appdetails |
| `src-tauri/src/omdb.rs` | feat: OMDb API client for movie/series metadata and poster resolution |
| `src-tauri/src/imgproxy.rs` | feat: Rust-side image proxy to bypass CORS and cache to filesystem |
| `src-tauri/src/scrapers/torrents.rs` | feat: torrent scraper pipeline — 1337x, TPB, Nyaa, FitGirl, and 10 more sources |

### Networking & Streaming
| File | Message |
|------|---------|
| `src-tauri/src/streamer.rs` | feat: magnet-to-HTTP streaming bridge for in-app video playback |
| `src-tauri/src/discord.rs` | feat: Discord Rich Presence integration with page-aware state updates |

### Frontend — Pages
| File | Message |
|------|---------|
| `src/pages/home.tsx` | feat: hero carousel with auto-rotate, genre sections (Drama/Action/Comedy), Top Anime, Surprise Me |
| `src/pages/anime.tsx` | feat: anime catalog with grid layout, genre filter modal, locked manga/hentai tabs |
| `src/pages/movies.tsx` | feat: movie browse page with genre/rating/year modal filters |
| `src/pages/tvshows.tsx` | feat: TV series browse page with modal filter system |
| `src/pages/kdramas.tsx` | feat: K-Drama browse page with modal filter system |
| `src/pages/games.tsx` | feat: game catalog from Steam with modal filter system |
| `src/pages/detail.tsx` | feat: blueprint-style detail page with season/episode stacking and progress bars |
| `src/pages/downloads.tsx` | feat: download manager with queue, progress, and status tracking |
| `src/pages/settings.tsx` | feat: settings panel with theme presets, scrapers, appearance, and about |
| `src/pages/search-overlay.tsx` | feat: Ctrl+K global search for anime with debounced results |
| `src/pages/watchlist.tsx` | feat: personal watchlist with favorites persistence |
| `src/pages/collection.tsx` | feat: collection browser with genre/rating/year filters |
| `src/pages/marketplace.tsx` | feat: theme marketplace with upload and mod dashboard |
| `src/pages/watchtogether.tsx` | feat: watch together placeholder with WebRTC signaling skeleton |
| `src/pages/history.tsx` | feat: playback history with resume support |
| `src/pages/profile.tsx` | feat: user profile page with activity feed |
| `src/pages/sources.tsx` | feat: scraper source management UI |

### Frontend — Components
| File | Message |
|------|---------|
| `src/components/sidebar.tsx` | feat: collapsible navigation with locked preview items, hero animation, update badge |
| `src/components/titlebar.tsx` | feat: custom window chrome with minimize/maximize/close, gradient border, update indicator |
| `src/components/hero-banner.tsx` | feat: animated hero carousel with blur-enriched poster backdrops |
| `src/components/arrow-scroll-row.tsx` | feat: horizontal scroll row with glass-style swipe navigation buttons |
| `src/components/media-row.tsx` | feat: reusable section row with gradient accent heading |
| `src/components/cached-image.tsx` | feat: lazy-loaded image with initials fallback and fetchPriority support |
| `src/components/tag-filter.tsx` | feat: modal genre/rating/year filter system used across browse pages |
| `src/components/floating-dock.tsx` | feat: draggable quick-menu dock with page grid and recent items |
| `src/components/player.tsx` | feat: custom HTML5 video player with speed controls and keyboard shortcuts |
| `src/components/context-menu.tsx` | feat: custom right-click context menu with view/favorite actions |
| `src/components/toast.tsx` | feat: toast notification system with auto-dismiss and progress bar |
| `src/components/download-bar.tsx` | feat: persistent download progress bar at bottom of viewport |
| `src/components/welcome.tsx` | feat: first-launch welcome overlay |
| `src/components/age-gate.tsx` | feat: age verification gate for 18+ content |
| `src/components/comments.tsx` | feat: comment section component with sign-in prompt |
| `src/components/signup-modal.tsx` | feat: sign-up/sign-in modal (blocked in preview) |

### Frontend — Cards
| File | Message |
|------|---------|
| `src/components/cards/anime-card.tsx` | feat: compact anime card with poster, rating, eps badge, context menu |
| `src/components/cards/game-card.tsx` | feat: game card with icon, repacker, and size badge |
| `src/components/cards/hentai-card.tsx` | feat: hentai card with 18+ badge and censored indicator |
| `src/components/cards/movie-poster.tsx` | feat: movie poster card with year and rating |
| `src/components/cards/filter-chips.tsx` | feat: inline filter bar with genre chips, year/sort dropdowns, search |

### Frontend — State & Data
| File | Message |
|------|---------|
| `src/lib/store.tsx` | feat: React context store for global app state with localStorage persistence |
| `src/lib/types.ts` | feat: TypeScript interfaces for all data models and API responses |
| `src/lib/api.ts` | feat: Tauri invoke wrappers for all IPC commands |
| `src/lib/use-catalog.ts` | feat: infinite-scroll hook for paginated catalog browsing |
| `src/lib/update-check.ts` | feat: GitHub release check for update notifications |
| `src/lib/img-cache.ts` | feat: lightweight image preload batching utility |
| `src/lib/mock-data.ts` | feat: mock data for development without backend |
| `src/lib/sanitize.ts` | feat: error message sanitization helper |
| `src/lib/theme-store.ts` | feat: custom theme CRUD with localStorage persistence |

### Frontend — UI Primitives
| File | Message |
|------|---------|
| `src/components/ui/button.tsx` | feat: reusable button variants (primary, outline, ghost) |
| `src/components/ui/badge.tsx` | feat: badge variants (quality, warning, accent) |
| `src/components/ui/input.tsx` | feat: styled input component |
| `src/components/sort-controls.tsx` | feat: sort dropdown control |

### Configuration
| File | Message |
|------|---------|
| `index.html` | chore: Vite entry with Google Fonts preconnect, preload hints, and CSP meta |
| `vite.config.ts` | chore: Vite config with manual chunks for 15 page bundles |
| `package.json` | chore: project metadata and dependency manifest |
| `tsconfig.json` | chore: TypeScript strict-mode configuration |
| `tsconfig.app.json` | chore: app-specific TS config |
| `tsconfig.node.json` | chore: node-specific TS config |
| `vite.config.ts` | chore: Vite build pipeline with Tailwind v4 and Rollup manual chunks |
| `.oxlintrc.json` | chore: linter configuration |
| `.gitignore` | chore: ignore dist, node_modules, and build artifacts |

### Project Documentation
| File | Message |
|------|---------|
| `README.md` | docs: project overview with features, stack, build guide, and keyboard shortcuts |
| `CLAUDE.md` | docs: AI context file with architecture, patterns, and session tracking |
| `RELEASE.md` | docs: release engineering guide — tag, build, and deploy to GitHub |

### Assets
| File | Message |
|------|---------|
| `public/logos/` | chore: Aeth Hub brand assets (SVG, PNG, favicon) |
| `src-tauri/icons/` | chore: multi-resolution app icons for Windows, macOS, and mobile |
