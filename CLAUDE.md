# Aeth Hub — Claude Code Prompt

You are working on Aeth Hub, a Tauri v2 desktop app (Windows WebView2). Stack: React/TS + Vite + Tailwind v4 + Rust (Tauri backend). Theme: monochrome space (#08080A deep, #111521 surface, #7C5CFF accent). GPL-3.0 license.

## Allowed Work
- **Redesigns**: UI polish, layout tweaks, component restructuring, CSS animation/choreography
- **Cache optimizations**: Rust-side TTL caches, React memoization, lazy loading, code splitting
- **Performance**: Bundle size reduction, scroll optimization, render efficiency, image loading strategies
- **Refactoring**: Clean up any file in src/ or src-tauri/src/ without changing business logic
- **Bug fixes**: Address console errors, layout bugs, scroll/event issues, WebView2 edge cases
- **Theme system**: Modifications to theme presets, CSS variables, dark/light mode, `data-theme-preset` attributes
- **Accessibility**: aria labels, focus management, keyboard nav
- **State management**: Store refactors, context optimization, persistence patterns

## Restricted (Require explicit ask)
- Adding new API integrations (new data sources, auth flows)
- Changing the build system (Vite, Tauri configs, eslint/tsconfig)
- Modifying `tauri.conf.json` capabilities or permissions
- Adding new Rust dependencies or system-level features
- Changing the licensing or legal files

## Key Patterns
- All pages are lazy-loaded via `React.lazy` + `Suspense`
- Pages stay mounted when active; inactive pages unmount (except detail/settings/watchlist/themes)
- Cards use `React.memo` and named groups (`group/card`)
- Scroll rows use `ArrowScrollRow` for smart swipe button visibility
- Theme via CSS variables on `:root`, controlled by `data-theme` (dark/light) and `data-theme-preset` (default/pixelated-space)
- OMDb key: `b351c3c0`; TMDB key: `1c2233ef62fad3a990270a4457005c83` (shipped in binary, not user-configurable)
- Store: React context (`src/lib/store.tsx`) + localStorage for settings/theme pos
- Discord RPC: refs to prevent duplicate toasts (`dAttempted`/`dErrored`)

## Potential Enhancements (Open for Improvement)
- **Rust image proxy**: proxy images through Tauri command + filesystem cache (kills CORS, offloads network from WebView2)
- **AniList OAuth polish**: real OAuth redirect flow using Tauri deep links (no manual token paste)
- **Virtual scrolling**: replace static genre-grouped rows with react-window or custom virtual list for 1000+ items
- **Drag-and-drop sidebar reordering**: let users rearrange nav sections, persist order to localStorage
- **Keyboard shortcuts**: global hotkeys for sidebar toggle, page nav, search, playback controls
- **Swipe gestures**: touchpad/mouse swipe left/right to navigate pages on trackpad users
- **Zoom persistence**: save zoom level per-page or globally to localStorage
- **Image blurhash**: show blurhash placeholder while full-res image loads (instead of gray skeleton)
- **Addon system cache**: cache addon catalog results to filesystem (reduce API calls on repeat visits)
- **Stream quality selector**: UI for selecting resolution/bitrate in the HTML5 player
- **Search indexing**: client-side Fuse.js index for instant search across all catalogs
- **Context menu extensions**: "Mark as watched", "Add to playlist", "Share" actions
- **Download manager UI**: progress bars per-file, pause/resume, speed limits in settings
- **Theme editor GUI**: visual editor for custom theme colors with live preview (instead of JSON editing)
- **Discord RPC rich presence**: add cover art, timestamps, and progress to RPC updates
- **Watch Together foundation**: WebRTC signaling skeleton with room creation/join flows
- **Settings search**: Ctrl+F within settings to find any toggle or section instantly
- **Migration to TheTVDB/OMDb**: replace TMDB image URLs with OMDb/TVDB CDN, remove TMDB dependency

## Testing
- `tsc -b --noEmit` for TS check
- `npm run build` for full Vite build
- `cargo check` (in src-tauri/) for Rust check
- `cargo tauri dev` for live app
