export type Page = 'home' | 'movies' | 'tvshows' | 'kdramas' | 'anime' | 'hentai' | 'games' | 'detail' | 'downloads' | 'settings' | 'marketplace' | 'watchtogether' | 'watchlist' | 'socialfeed' | 'recommendations' | 'events' | 'collection' | 'profile' | 'history'

export type DlStat = 'queued' | 'resolving' | 'downloading' | 'paused' | 'done' | 'failed'
export type VMode = 'sub' | 'dub' | 'both'

export interface Movie {
  id: string; title: string; poster: string; backdrop: string; year: number
  rating: number; runtime: number; overview: string; genres: string[]
  tags: string[]; streams: StrSrc[]
}

export interface Series {
  id: string; title: string; poster: string; backdrop: string; year: number
  rating: number; overview: string; genres: string[]; tags: string[]
  is_kdrama: boolean; seasons: Season[]
}

export interface Season { num: number; episodes: Episode[] }
export interface Episode { num: number; title: string; streams: StrSrc[] }

export interface Anime {
  id: string; title: string; poster: string; banner: string; year: number
  status: string; eps: number; rating: number; synopsis: string
  genres: string[]; tags: string[]; streams: StrSrc[]; vmode: VMode
}

export interface Hentai {
  id: string; title: string; poster: string; banner: string; year: number
  status: string; eps: number; rating: number; synopsis: string
  genres: string[]; tags: string[]; streams: StrSrc[]; vmode: VMode; censored: boolean
}

export interface Game {
  id: string; title: string; icon: string; banner: string; genre: string
  desc: string; size: string; repacker: string; url: string; dl_count: number
  rating: number; tags: string[]; screenshots: string[]
}

export interface DlItem {
  id: string; title: string; progress: number; speed: string; eta: string
  status: DlStat; path: string; src: string; magnet: string
  bytes_done: number; bytes_total: number
}

export interface StrSrc {
  name: string; url: string; quality: string; size: string
  seeders: number; kind: string; info_hash: string
}

export interface PlaybackPos {
  content_id: string; title: string; mtype: string
  season: number | null; episode: number | null
  position_secs: number; duration_secs: number; updated_at: number
}

export interface User {
  username: string; avatar: string
}

export interface CatalogItem {
  id: string; title: string; poster: string
  year: number; rating: number; genres: string[]
  kind: string; tags: string[]
  genre: string | null; status: string | null
  eps: number | null; icon: string | null
  size: string | null; repacker: string | null
}

export interface BrowseResult {
  items: CatalogItem[]
  total: number
}

export interface ThemePreset {
  id: string
  name: string
  author: string
  description: string
  type: 'builtin' | 'community'
  colors: {
    deep: string
    base: string
    surface: string
    elevated: string
    text: string
    dim: string
    muted: string
    accent: string
    accent2?: string
    success: string
    warning: string
    error: string
  }
  fontFamily?: string
  borderRadius?: string
  backdropBlur?: string
  scanlines?: boolean
  pixelated?: boolean
}

export interface UserTheme {
  id: string
  name: string
  description: string
  author: string
  version: string
  preset: 'custom'
  colors: {
    deep: string
    base: string
    surface: string
    elevated: string
    text: string
    dim: string
    muted: string
    accent: string
    border: string
  }
  fonts?: {
    body?: string
    heading?: string
    mono?: string
  }
  radius?: {
    sm?: number
    md?: number
    lg?: number
    xl?: number
  }
  effects?: {
    scanlines?: boolean
    blur?: number
    glow?: boolean
  }
  status: 'pending' | 'approved' | 'rejected'
  submittedAt: number
  downloads: number
  modNotes?: string
}

export interface ModComment {
  id: string
  themeId: string
  author: string
  text: string
  createdAt: number
  flagged: boolean
  moderated: boolean
}

export interface UpdateInfo {
  available: boolean
  version: string
  url: string
  notes: string
  published_at: string
}

export interface AppSettings {
  use_custom_player: boolean; download_path: string
  scrapers_enabled: string[]; accent_color: string
  show_hentai: boolean; discord_client_id: string
  onboarded: boolean; theme_mode: 'dark' | 'light'
  theme_preset: 'default' | 'pixelated-space' | 'custom'
}
