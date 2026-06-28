import { invoke } from '@tauri-apps/api/core'
import type { Movie, Series, Game, Anime, Hentai, StrSrc, SearchRes, DlItem, PlaybackPos, AppSettings } from './types'

export const getMovies = () => invoke<Movie[]>('get_movies')
export const getSeries = () => invoke<Series[]>('get_series')
export const getKdramas = () => invoke<Series[]>('get_kdramas')
export const getGames = () => invoke<Game[]>('get_games')
export const getAnime = () => invoke<Anime[]>('get_anime')
export const getHentai = () => invoke<Hentai[]>('get_hentai')

export const searchMovies = (q: string) => invoke<StrSrc[]>('search_movies', { q })
export const searchSeries = (q: string) => invoke<StrSrc[]>('search_series', { q })
export const searchAnime = (q: string) => invoke<StrSrc[]>('search_anime', { q })
export const searchHentai = (q: string) => invoke<StrSrc[]>('search_hentai', { q })
export const searchGames = (q: string) => invoke<StrSrc[]>('search_games', { q })
export const searchAll = (q: string) => invoke<StrSrc[]>('search_all', { q })

export const getEpisodeStreams = (seriesId: string, season: number, episode: number) =>
  invoke<StrSrc[]>('get_episode_streams', { seriesId, season, episode })

export const playMedia = (url: string, title: string) => invoke<string>('play_media', { url, title })
export const detectPlayer = () => invoke<string>('detect_player')

export const getPlayback = () => invoke<PlaybackPos[]>('get_playback')
export const savePlayback = (id: string, title: string, mtype: string, season: number | null, episode: number | null, pos: number, dur: number) =>
  invoke<void>('save_playback', { id, title, mtype, season, episode, pos, dur })

export const getFavs = () => invoke<string[]>('get_favs')
export const toggleFav = (id: string, mtype: string, title: string, poster: string) =>
  invoke<boolean>('toggle_fav', { id, mtype, title, poster })

export const getDownloads = () => invoke<DlItem[]>('get_downloads')

export const getSettings = () => invoke<AppSettings>('get_settings')
export const saveSettings = (settings: AppSettings) => invoke<void>('save_settings', { settings })
export const clearCache = () => invoke<void>('clear_cache')
