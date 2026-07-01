import { invoke } from '@tauri-apps/api/core'
import { Store } from '@tauri-apps/plugin-store'
import type { Movie, Series, Game, Anime, Hentai, StrSrc, DlItem, PlaybackPos, AppSettings, BrowseResult } from './types'

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
export const addDownload = (title: string, url: string, magnet: string, path: string, bytesTotal: number) =>
  invoke<void>('add_download', { title, url, magnet, path, bytesTotal })
export const removeDownload = (id: string) => invoke<void>('remove_download', { id })
export const getDownloadsDb = () => invoke<DlItem[]>('get_downloads_db')

export const getSettings = () => invoke<AppSettings>('get_settings')
export const saveSettings = (settings: AppSettings) => invoke<void>('save_settings', { settings })
export const clearCache = () => invoke<void>('clear_cache')

export const discordConnect = (clientId: string) => invoke<void>('discord_connect', { clientId })
export const discordUpdate = (stateText: string, details: string) =>
  invoke<void>('discord_update', { stateText, details })
export const discordDisconnect = () => invoke<void>('discord_disconnect')

export const browseCatalog = (kind: string, genre: string, sort: string, offset: number, limit: number) =>
  invoke<BrowseResult>('browse_catalog', { kind, genre, sort, offset, limit })

export const searchCatalog = (q: string, kind: string, offset: number, limit: number) =>
  invoke<BrowseResult>('search_catalog', { q, kind, offset, limit })

export const streamMagnet = (magnet: string) => invoke<string>('stream_magnet', { magnet })
export const stopStream = (id: string) => invoke<void>('stop_stream', { id })

export const getApiDetail = (kind: string, id: string) => invoke<any>('get_api_detail', { kind, id })

export const browseAnilist = (genre: string, sort: string, page: number, limit: number, mediaType: string = 'ANIME') =>
  invoke<BrowseResult>('browse_anilist', { genre, sort, page, limit, mediaType })
export const searchAnilist = (query: string, page: number, limit: number, mediaType: string = 'ANIME') =>
  invoke<BrowseResult>('search_anilist', { query, page, limit, mediaType })

export const browseSteam = (sort: string, page: number, limit: number) =>
  invoke<BrowseResult>('browse_steam', { sort, page, limit })
export const searchSteam = (query: string, page: number, limit: number) =>
  invoke<BrowseResult>('search_steam', { query, page, limit })

const ANILIST_CLIENT_ID = '20915'
const ANILIST_REDIRECT_URI = 'aethhub://callback'

export function getAnilistAuthUrl(): string {
  return `https://anilist.co/api/v2/oauth/authorize?client_id=${ANILIST_CLIENT_ID}&redirect_uri=${encodeURIComponent(ANILIST_REDIRECT_URI)}&response_type=code`
}

export async function anilistExchangeCode(code: string): Promise<string> {
  return invoke<string>('anilist_exchange', { code })
}

export async function anilistSync(token: string, mediaId: number, score: number, status: string, progress?: number): Promise<void> {
  return invoke<void>('anilist_sync', { token, mediaId, score, status, progress: progress ?? null })
}

let _anilistStore: Awaited<ReturnType<typeof Store.load>> | null = null
async function getStore() {
  if (!_anilistStore) _anilistStore = await Store.load('anilist.json')
  return _anilistStore
}

export async function getAnilistToken(): Promise<string | null> {
  const s = await getStore()
  return (await s.get<string>('token')) || null
}

export async function setAnilistToken(token: string): Promise<void> {
  const s = await getStore()
  await s.set('token', token)
  await s.save()
}

export async function removeAnilistToken(): Promise<void> {
  const s = await getStore()
  await s.delete('token')
  await s.save()
}

export async function searchOmdb(title: string, year?: string): Promise<any> {
  return invoke<any>('search_omdb', { title, year: year || null })
}

export async function searchMovieDetail(imdbId: string): Promise<any> {
  return invoke<any>('search_movie_detail', { imdbId })
}

export const getPcUsername = () => invoke<string>('get_pc_username')

export async function proxyImage(url: string): Promise<string> {
  return invoke<string>('proxy_image', { url })
}

export interface Comment { id: number; content_id: string; episode: number | null; author: string; text: string; created_at: string }
export const addComment = (contentId: string, episode: number | null, author: string, text: string) => invoke<Comment>('add_comment', { contentId, episode, author, text })
export const getComments = (contentId: string, episode: number | null) => invoke<Comment[]>('get_comments', { contentId, episode })
export const deleteComment = (id: number) => invoke<void>('delete_comment', { id })
export const addToLibrary = (contentId: string, title: string, poster: string) => invoke<void>('add_to_library', { contentId, title, poster })
export const isInLibrary = (contentId: string) => invoke<boolean>('is_in_library', { contentId })

export interface LibraryItem { content_id: string; title: string; poster: string; added_at: string }
export const getLibrary = () => invoke<LibraryItem[]>('get_library')
export const removeFromLibrary = (contentId: string) => invoke<void>('remove_from_library', { contentId })
