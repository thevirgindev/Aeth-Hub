export type Page = 'home' | 'movies' | 'tvshows' | 'kdramas' | 'anime' | 'hentai' | 'games' | 'detail' | 'downloads' | 'settings'

export type MType = 'movie' | 'series' | 'anime' | 'hentai' | 'game'
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
  tags: string[]; screenshots: string[]
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

export interface SearchRes {
  id: string; title: string; poster: string; year: number
  mtype: MType; rating: number; source: string; quality: string
}

export interface PlaybackPos {
  content_id: string; title: string; mtype: string
  season: number | null; episode: number | null
  position_secs: number; duration_secs: number; updated_at: number
}

export interface AppSettings {
  use_custom_player: boolean; download_path: string
  scrapers_enabled: string[]; accent_color: string
}
