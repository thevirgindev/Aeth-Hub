import { useState, useEffect } from 'react'
import { useStore } from '../lib/store'
import { getMovies, getGames, getAnime, getSeries, getHentai, searchMovies, searchSeries, searchAnime, searchHentai, searchGames, getEpisodeStreams, toggleFav, getApiDetail, anilistSync, getAnilistToken, playMedia } from '../lib/api'
import { Button } from '../components/ui/button'
import { Badge } from '../components/ui/badge'
import { Player } from '../components/player'
import type { Movie, Game, Anime, Series, Hentai, StrSrc } from '../lib/types'
import { open } from '@tauri-apps/plugin-shell'
import { Play, ArrowLeft, Star, Magnet, Bookmark, RotateCcw, AlertCircle, Loader2, Check } from 'lucide-react'
import { CachedImage } from '../components/cached-image'

export function DetailPage() {
  const { detailId, detailType, setPage, showToast, favs, setFavs, setDetailTitle } = useStore()
  const [movie, setMovie] = useState<Movie | null>(null)
  const [series, setSeries] = useState<Series | null>(null)
  const [game, setGame] = useState<Game | null>(null)
  const [anime, setAnime] = useState<Anime | null>(null)
  const [hentai, setHentai] = useState<Hentai | null>(null)
  const [streams, setStreams] = useState<StrSrc[]>([])
  const [searching, setSearching] = useState(false)
  const [initialSearchDone, setInitialSearchDone] = useState(false)
  const [selectedSeason, setSelectedSeason] = useState<number | null>(null)
  const [watchedEps, setWatchedEps] = useState<Set<string>>(new Set())
  const [playerOpen, setPlayerOpen] = useState(false)
  const [playerUrl, setPlayerUrl] = useState('')
  const [playerTitle, setPlayerTitle] = useState('')
  const [backdropFailed, setBackdropFailed] = useState(false)
  const [anilistRating, setAnilistRating] = useState(7)
  const [anilistStatus, setAnilistStatus] = useState('watching')

  const toggleWatched = (season: number, episode: number) => {
    const key = `${season}-${episode}`
    setWatchedEps(prev => {
      const next = new Set(prev)
      if (next.has(key)) { next.delete(key) } else { next.add(key) }
      return next
    })
  }

  useEffect(() => {
    if (!detailId) return
    setStreams([]); setDetailTitle(''); setInitialSearchDone(false)
    setSelectedSeason(null); setSearching(false); setBackdropFailed(false)
    const isApiId = detailId.startsWith('anilist-') || detailId.startsWith('steam-')
    if (isApiId) {
      getApiDetail(detailType, detailId).then((d: any) => {
        if (!d) return
        if (detailType === 'movie') {
          const isOmdb = !d.poster_path
          const m: typeof movie = {
            id: detailId, title: isOmdb ? (d.Title || '') : (d.title || ''),
            poster: isOmdb ? (d.Poster && d.Poster !== 'N/A' ? d.Poster : '') : (d.poster_path ? `https://image.tmdb.org/t/p/w500${d.poster_path}` : ''),
            backdrop: isOmdb ? (d.Poster && d.Poster !== 'N/A' ? d.Poster : '') : (d.backdrop_path ? `https://image.tmdb.org/t/p/original${d.backdrop_path}` : ''),
            year: isOmdb ? (parseInt(d.Year) || 0) : ((d.release_date || '').split('-')[0] as any || 0),
            rating: isOmdb ? (parseFloat(d.imdbRating) || 0) : (d.vote_average || 0),
            runtime: isOmdb ? (parseInt(d.Runtime) || 0) : (d.runtime || 0),
            overview: isOmdb ? (d.Plot || '') : (d.overview || ''),
            genres: isOmdb ? (d.Genre ? d.Genre.split(', ').filter((g: string) => g && g !== 'N/A') : []) : (d.genres || []).map((g: any) => g.name),
            tags: [], streams: [],
          }
          setMovie(m); setDetailTitle(m.title)
        } else if (detailType === 'series') {
          const isOmdb = !d.poster_path
          const s: typeof series = {
            id: detailId, title: isOmdb ? (d.Title || '') : (d.name || ''),
            poster: isOmdb ? (d.Poster && d.Poster !== 'N/A' ? d.Poster : '') : (d.poster_path ? `https://image.tmdb.org/t/p/w500${d.poster_path}` : ''),
            backdrop: isOmdb ? (d.Poster && d.Poster !== 'N/A' ? d.Poster : '') : (d.backdrop_path ? `https://image.tmdb.org/t/p/original${d.backdrop_path}` : ''),
            year: isOmdb ? (parseInt(d.Year) || 0) : ((d.first_air_date || '').split('-')[0] as any || 0),
            rating: isOmdb ? (parseFloat(d.imdbRating) || 0) : (d.vote_average || 0),
            overview: isOmdb ? (d.Plot || '') : (d.overview || ''),
            genres: isOmdb ? (d.Genre ? d.Genre.split(', ').filter((g: string) => g && g !== 'N/A') : []) : (d.genres || []).map((g: any) => g.name),
            tags: [], is_kdrama: false, seasons: (d.seasons || []).filter((s: any) => s.season_number > 0).map((s: any) => ({ num: s.season_number, episodes: [] })),
          }
          setSeries(s); setDetailTitle(s.title)
        } else if (detailType === 'anime') {
          const t = d.title || {}
          const a: typeof anime = {
            id: detailId, title: t.english || t.romaji || 'Unknown',
            poster: d.coverImage?.large || '', banner: d.bannerImage || '',
            year: d.seasonYear || 0, status: d.status || '', eps: d.episodes || 0,
            rating: (d.averageScore || 0) / 10, synopsis: d.description || '',
            genres: d.genres || [], tags: (d.tags || []).map((t: any) => t.name),
            streams: [], vmode: 'sub' as any,
          }
          setAnime(a); setDetailTitle(a.title)
        } else if (detailType === 'manga') {
          const t = d.title || {}
          const a: typeof anime = {
            id: detailId, title: t.english || t.romaji || 'Unknown',
            poster: d.coverImage?.large || '', banner: d.bannerImage || '',
            year: d.seasonYear || 0, status: d.status || '', eps: d.chapters || d.episodes || 0,
            rating: (d.averageScore || 0) / 10, synopsis: d.description || '',
            genres: d.genres || [], tags: (d.tags || []).map((t: any) => t.name),
            streams: [], vmode: 'sub' as any,
          }
          setAnime(a); setDetailTitle(a.title)
        } else if (detailType === 'game') {
          const g: typeof game = {
            id: detailId, title: d.name, icon: d.header_image || '', banner: d.background_raw || d.background || '',
            genre: d.genres?.[0]?.description || '', desc: d.short_description || d.detailed_description || '',
            size: '', repacker: 'Steam', url: '', dl_count: 0, rating: (d.metacritic?.score || 0) / 10,
            tags: (d.categories || []).map((c: any) => c.description),
            screenshots: (d.screenshots || []).map((s: any) => s.path_full),
          }
          setGame(g); setDetailTitle(g.title)
        }
      }).catch(() => {})
    } else {
      if (detailType === 'movie') getMovies().then(ms => { const m = ms.find(x => x.id === detailId) || null; setMovie(m); if (m) setDetailTitle(m.title) }).catch(() => {})
      else if (detailType === 'series') getSeries().then(ss => { const s = ss.find(x => x.id === detailId) || null; setSeries(s); if (s) setDetailTitle(s.title) }).catch(() => {})
      else if (detailType === 'game') getGames().then(gs => { const g = gs.find(x => x.id === detailId) || null; setGame(g); if (g) setDetailTitle(g.title) }).catch(() => {})
      else if (detailType === 'anime') getAnime().then(as => { const a = as.find(x => x.id === detailId) || null; setAnime(a); if (a) setDetailTitle(a.title) }).catch(() => {})
      else if (detailType === 'hentai') getHentai().then(hs => { const h = hs.find(x => x.id === detailId) || null; setHentai(h); if (h) setDetailTitle(h.title) }).catch(() => {})
    }
  }, [detailId, detailType])

  useEffect(() => {
    if (series && series.seasons.length > 0 && selectedSeason === null) {
      setSelectedSeason(series.seasons[0].num)
    }
  }, [series, selectedSeason])

  const item = (movie || series || game || anime || hentai) as Record<string, unknown> | null
  const itemTitle = item?.title as string || ''

  const doSearch = async (q: string) => {
    setSearching(true)
    const MIN_DURATION = 600
    const start = Date.now()
    try {
      const map: Record<string, (q: string) => Promise<StrSrc[]>> = {
        movie: searchMovies, series: searchSeries, anime: searchAnime, hentai: searchHentai, manga: searchAnime, game: searchGames,
      }
      const fn = map[detailType]
      if (fn) {
        const r = await fn(q)
        setStreams(r.filter(s => s.name && s.name.trim().length >= 3))
      }
    } catch {}
    const elapsed = Date.now() - start
    if (elapsed < MIN_DURATION) await new Promise(r => setTimeout(r, MIN_DURATION - elapsed))
    setSearching(false); setInitialSearchDone(true)
  }

  useEffect(() => {
    if (!item || !itemTitle) return
    doSearch(itemTitle)
  }, [item, itemTitle, detailType])

  const validStreams = streams.filter(s => s.name && s.name.trim().length >= 3)

  const openPlayer = (url: string, title: string) => {
    if (url.startsWith('magnet:')) {
      playMedia(url, title)
    } else if (url.startsWith('http') && (url.endsWith('.torrent') || detailType === 'game')) {
      open(url)
    } else {
      setPlayerUrl(url); setPlayerTitle(title); setPlayerOpen(true)
    }
  }

  const isGame = detailType === 'game'
  const actionLabel = isGame ? 'Play' : 'Watch'

  const showStreamSearch = ['movie', 'series', 'anime', 'hentai', 'manga'].includes(detailType)

  if (!item) return (
    <div className="flex-1 animate-fade">
      <div className="relative h-[35vh] min-h-[300px] overflow-hidden skeleton-pulse" />
      <div className="px-6 -mt-16 relative z-10">
        <div className="flex flex-col md:flex-row gap-6">
          <div className="shrink-0 w-[160px]">
            <div className="w-full aspect-[2/3] rounded-xl skeleton" />
          </div>
          <div className="flex-1 min-w-0 pt-12">
            <div className="h-7 w-3/4 skeleton mb-3" />
            <div className="h-4 w-1/3 skeleton mb-4" />
            <div className="space-y-2 mb-6">
              <div className="h-3 w-full skeleton" />
              <div className="h-3 w-5/6 skeleton" />
              <div className="h-3 w-4/6 skeleton" />
            </div>
            <div className="flex gap-3">
              <div className="h-10 w-28 skeleton" />
              <div className="h-10 w-36 skeleton" />
              <div className="h-10 w-12 skeleton" />
            </div>
          </div>
        </div>
      </div>
    </div>
  )

  const backdrop = movie?.backdrop || series?.backdrop || anime?.banner || hentai?.banner || game?.banner || ''
  const poster = movie?.poster || series?.poster || anime?.poster || hentai?.poster || game?.icon || ''
  const title = itemTitle
  const overview = movie?.overview || series?.overview || anime?.synopsis || hentai?.synopsis || game?.desc || ''
  const genres = (movie?.genres || series?.genres || anime?.genres || hentai?.genres || [game?.genre || ''].filter(Boolean)) as string[]
  const rating = (movie?.rating || series?.rating || anime?.rating || hentai?.rating || game?.rating || 0) as number
  const year = (movie?.year || series?.year || anime?.year || hentai?.year) as number | undefined
  const tags = (movie?.tags || series?.tags || anime?.tags || hentai?.tags || game?.tags || []) as string[]

  const typeLabels: Record<string, string> = { movie: 'Movie', series: 'Series', anime: 'Anime', manga: 'Manga', game: 'Game', hentai: 'Adult' }

  const showNoStreams = initialSearchDone && !searching && validStreams.length === 0
  const hasSeasons = series && series.seasons.length > 0
  const hasAnimeEps = anime && anime.eps > 0
  const showTwoCol = showStreamSearch && (hasSeasons || hasAnimeEps)

  return (
    <div className="flex-1 animate-fade">
      <div className="relative h-[35vh] min-h-[300px] overflow-hidden">
        {backdrop && !backdropFailed ? (
          <CachedImage src={backdrop} alt="" className="w-full h-full" fetchPriority="high" loading="eager"
            onError={() => setBackdropFailed(true)} />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-deep via-accent/5 to-deep" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-deep via-deep/60 to-transparent" />
        <button onClick={() => setPage('home')}
          className="absolute top-4 left-4 glass glass-hover rounded-xl px-3 py-2 text-sm text-dim cursor-pointer z-10 flex items-center gap-1.5">
          <ArrowLeft size={16} /> Back
        </button>
      </div>

      <div className="px-6 -mt-16 relative z-10">
        <div className="flex flex-col md:flex-row gap-6 mb-8">
          <div className="shrink-0 w-[160px]">
            <div className="relative">
              {poster && <CachedImage src={poster} alt="" title={title} className="poster-base w-full shadow-[0_8px_24px_rgba(0,0,0,0.5)]" fetchPriority="high" loading="eager" />}
            </div>
          </div>
          <div className="flex-1 min-w-0 pt-10">
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <Badge variant="accent">{typeLabels[detailType] || detailType}</Badge>
              {tags.slice(0, 3).map(t => <Badge key={t} variant="accent">{t}</Badge>)}
            </div>
            <h1 className="text-2xl font-extrabold text-text">{title}</h1>
            <div className="flex flex-wrap items-center gap-3 mt-2 text-sm text-dim">
              {rating > 0 && <span className="text-[#FFD700] flex items-center gap-1"><Star size={14} fill="#FFD700" /> {rating.toFixed(1)}</span>}
              {year && <span>{year}</span>}
              {movie?.runtime && <span>{movie.runtime}m</span>}
              {anime?.status && <span>{anime.status}</span>}
              {hentai?.status && <span>{hentai.status}</span>}
              {series?.seasons && <span>{series.seasons.length} seasons</span>}
              {anime?.eps && <span>{anime.eps} episodes</span>}
              {hentai?.eps && <span>{hentai.eps} episodes</span>}
              {hentai?.censored !== undefined && <span className="text-error text-[11px]">{hentai.censored ? 'CENSORED' : 'UNCENSORED'}</span>}
              {genres.filter(Boolean).slice(0, 4).map(g => (
                <span key={g} className="bg-white/10 px-2 py-0.5 rounded text-[11px]">{g}</span>
              ))}
            </div>
            <p className="mt-3 text-sm text-dim/80 leading-relaxed max-w-2xl">{overview || '—'}</p>
            {game && (
              <div className="mt-3 flex items-center gap-3 text-sm text-dim flex-wrap">
                <Badge variant="accent">{game.repacker}</Badge>
                <span className="font-mono text-[12px]">{game.size || '—'}</span>
                <span>{(game.dl_count || 0).toLocaleString()} downloads</span>
              </div>
            )}
            <div className="flex gap-3 mt-4">
              <Button variant="primary" size="md" disabled={!(validStreams.length > 0 && !searching)}
                onClick={() => validStreams[0] && openPlayer(validStreams[0].url, title)}>
                <Play size={16} /> {searching ? 'Searching...' : validStreams.length > 0 ? actionLabel : 'Unavailable'}
              </Button>
              <Button variant="outline" size="md" onClick={() => doSearch(title)} disabled={searching}>
                {searching ? <Loader2 size={14} className="animate-spin" /> : <Magnet size={16} />} {searching ? 'Searching...' : 'Search Streams'}
              </Button>
              <Button variant={favs.includes(detailId || '') ? 'primary' : 'ghost'} size="md"
                onClick={async () => {
                  if (!detailId) return
                  const added = await toggleFav(detailId, detailType, title, poster)
                  setFavs(added ? [...favs, detailId] : favs.filter(f => f !== detailId))
                  showToast({ msg: added ? 'Added to watchlist' : 'Removed from watchlist', type: 'success' })
                }}>
                <Bookmark size={16} fill={favs.includes(detailId || '') ? 'currentColor' : 'none'} />
              </Button>
            </div>
          </div>
        </div>

        {game?.screenshots && game.screenshots.length > 0 && (
          <div className="flex gap-2 overflow-x-auto mb-6">
            {game.screenshots.map((ss, i) => (
              <img key={i} src={ss} alt="" className="h-20 rounded-lg object-cover" loading="lazy"
                onError={e => { (e.target as HTMLImageElement).style.display = 'none' }} />
            ))}
          </div>
        )}

        {showStreamSearch && (
          <div className={`flex gap-6 ${showTwoCol ? 'flex-col lg:flex-row' : ''}`}>
            <div className={`${showTwoCol ? 'w-full lg:w-[400px] shrink-0' : 'max-w-2xl'}`}>
              <h3 className="text-base font-semibold text-text mb-3 flex items-center gap-2"><Magnet size={15} /> Available Streams</h3>
              {searching && !initialSearchDone && (
                <div className="glass rounded-xl p-5 text-center border border-border/50">
                  <Loader2 size={20} className="text-accent animate-spin mx-auto mb-2" />
                  <p className="text-sm text-dim animate-pulse">Searching for streams...</p>
                  <p className="text-[12px] text-muted/50 mt-1">Looking for available sources</p>
                </div>
              )}
              {showNoStreams && (
                <div className="glass rounded-xl p-5 text-center border border-border/50">
                  <AlertCircle size={20} className="text-muted/30 mx-auto mb-2" />
                  <p className="text-sm text-dim">No streams available</p>
                  <p className="text-[12px] text-muted/50 mt-1">Content providers found nothing. Check back later.</p>
                  <Button variant="outline" size="md" onClick={() => doSearch(title)} className="mt-3 border-white/10 hover:bg-white/10">
                    <RotateCcw size={14} /> Try Again
                  </Button>
                </div>
              )}
              {validStreams.length > 0 && (
                <div className="space-y-2 max-h-[500px] overflow-y-auto pr-1">
                  {validStreams.slice(0, 15).map((s, i) => (
                    <div key={i} onClick={() => openPlayer(s.url, title)}
                      className="glass rounded-xl p-3 flex items-center justify-between cursor-pointer hover:bg-white/5 transition-colors">
                      <div className="flex items-center gap-3 min-w-0">
                        <Badge variant={s.quality === 'Unknown' || !s.quality ? 'default' : 'quality'}>{s.quality || '—'}</Badge>
                        <span className="text-sm text-text truncate">{s.name}</span>
                        {s.size && s.size !== 'N/A' && <span className="text-[12px] text-muted font-mono">{s.size}</span>}
                        {s.seeders > 0 && <span className="text-[12px] text-muted">{s.seeders} seeders</span>}
                        {s.kind && <Badge variant="accent">{s.kind}</Badge>}
                      </div>
                      <Play size={14} className="text-muted shrink-0" />
                    </div>
                  ))}
                </div>
              )}
            </div>

            {hasSeasons && (
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-base font-semibold text-text">Episodes</h3>
                  <select value={selectedSeason ?? series.seasons[0].num}
                    onChange={(e) => setSelectedSeason(Number(e.target.value))}
                    className="bg-surface text-text border border-border/30 rounded-lg px-3 py-1.5 text-sm cursor-pointer">
                    {series.seasons.map(s => (
                      <option key={s.num} value={s.num}>Season {s.num}</option>
                    ))}
                  </select>
                </div>
                {(() => {
                  const season = series.seasons.find(s => s.num === selectedSeason)
                  if (!season) return null
                  const epCount = season.episodes.length
                  const watchedCount = season.episodes.filter(ep => watchedEps.has(`${season.num}-${ep.num}`)).length
                  const totalAllEps = series.seasons.reduce((a, s) => a + s.episodes.length, 0)
                  const totalAllWatched = series.seasons.reduce((a, s) => a + s.episodes.filter(ep => watchedEps.has(`${s.num}-${ep.num}`)).length, 0)
                  const totalPct = totalAllEps > 0 ? Math.round((totalAllWatched / totalAllEps) * 100) : 0
                  return (
                    <>
                      {totalAllEps > 0 && (
                        <div className="mb-3 text-xs text-muted flex items-center gap-2">
                          <span>Progress: {totalAllWatched}/{totalAllEps} episodes · {totalPct}%</span>
                        </div>
                      )}
                      <div className="w-full h-1.5 bg-white/[0.06] rounded-full overflow-hidden mb-4">
                        <div className="h-full bg-gradient-to-r from-accent to-success rounded-full transition-all duration-500" style={{ width: `${totalPct}%` }} />
                      </div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs text-dim">Season {season.num}</span>
                        <span className="text-xs text-muted">{watchedCount}/{epCount} ({epCount > 0 ? Math.round((watchedCount / epCount) * 100) : 0}%)</span>
                      </div>
                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2">
                        {season.episodes.map(ep => {
                          const isWatched = watchedEps.has(`${season.num}-${ep.num}`)
                          return (
                            <div key={ep.num} onClick={() => getEpisodeStreams(series.id, season.num, ep.num).then(s => s.length > 0 && openPlayer(s[0].url, `${series.title} - S${season.num}E${ep.num}`)).catch(() => {})}
                              className={`relative rounded-lg p-3 transition-all select-none cursor-pointer ${
                                isWatched
                                  ? 'bg-surface border border-success/30 opacity-60'
                                  : 'bg-surface/60 border border-border/30 hover:bg-white/10 hover:border-border-hover'
                              }`}>
                              <button onClick={(e) => { e.stopPropagation(); toggleWatched(season.num, ep.num) }}
                                className="absolute top-2 right-2 w-5 h-5 rounded-full flex items-center justify-center cursor-pointer hover:bg-white/10">
                                <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${isWatched ? 'bg-success border-success' : 'border-muted'}`}>
                                  {isWatched && <Check size={10} className="text-white" />}
                                </div>
                              </button>
                              <div className="text-base font-bold text-text mb-1">E{ep.num}</div>
                              <div className="text-xs text-dim leading-tight line-clamp-2">{ep.title || `Episode ${ep.num}`}</div>
                              <div className="text-[10px] text-accent mt-1 flex items-center gap-1">
                                <Play size={10} /> Play
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    </>
                  )
                })()}
              </div>
            )}

            {hasAnimeEps && (
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-base font-semibold text-text">Episodes</h3>
                  <span className="text-xs text-muted">{anime.eps} total</span>
                </div>
                {(() => {
                  const totalEps = anime.eps
                  const watchedCount = Array.from({ length: totalEps }, (_, i) => i + 1).filter(epNum => watchedEps.has(`1-${epNum}`)).length
                  return (
                    <>
                      <div className="mb-3 text-xs text-muted flex items-center gap-2">
                        <span>Progress: {watchedCount}/{totalEps} · {totalEps > 0 ? Math.round((watchedCount / totalEps) * 100) : 0}%</span>
                      </div>
                      <div className="w-full h-1.5 bg-white/[0.06] rounded-full overflow-hidden mb-4">
                        <div className="h-full bg-gradient-to-r from-accent to-success rounded-full transition-all duration-500" style={{ width: `${totalEps > 0 ? Math.round((watchedCount / totalEps) * 100) : 0}%` }} />
                      </div>
                      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-5 gap-2">
                        {Array.from({ length: Math.min(totalEps, 50) }, (_, i) => {
                          const epNum = i + 1
                          const isWatched = watchedEps.has(`1-${epNum}`)
                          return (
                            <div key={epNum} onClick={async () => {
                              try { const r = await searchAnime(anime.title); if (r.length > 0) openPlayer(r[0].url, `${anime.title} - Ep ${epNum}`) } catch {}
                            }}
                              className={`rounded-lg p-3 transition-all select-none cursor-pointer ${
                                isWatched
                                  ? 'bg-surface border border-success/30 opacity-60'
                                  : 'bg-surface/60 border border-border/30 hover:bg-white/10 hover:border-border-hover'
                              }`}>
                              <button onClick={(e) => { e.stopPropagation(); toggleWatched(1, epNum) }}
                                className="absolute top-2 right-2 w-5 h-5 rounded-full flex items-center justify-center cursor-pointer hover:bg-white/10">
                                <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${isWatched ? 'bg-success border-success' : 'border-muted'}`}>
                                  {isWatched && <Check size={10} className="text-white" />}
                                </div>
                              </button>
                              <div className="text-base font-bold text-text">E{epNum}</div>
                              <div className="text-[10px] text-accent mt-1 flex items-center gap-1">
                                <Play size={10} /> Play
                              </div>
                            </div>
                          )
                        })}
                        {totalEps > 50 && (
                          <div className="col-span-full text-center text-xs text-muted/50 pt-2">+ {totalEps - 50} more episodes</div>
                        )}
                      </div>
                    </>
                  )
                })()}
              </div>
            )}
          </div>
        )}

        {['anime', 'manga'].includes(detailType) && (
          <div className="mt-8 max-w-xl">
            <h3 className="text-base font-semibold text-text mb-3 flex items-center gap-2">
              <Star size={15} /> AniList Sync
            </h3>
            <div className="glass rounded-xl p-4 border border-border/50">
              <p className="text-xs text-muted/60 mb-3">Track your progress on AniList.</p>
              <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-end">
                <div className="flex-1 w-full">
                  <label className="text-[10px] text-muted/50 uppercase tracking-wider mb-1.5 block">Rating</label>
                  <div className="flex items-center gap-2">
                    <input type="range" min="1" max="10" value={anilistRating} onChange={e => setAnilistRating(Number(e.target.value))}
                      className="flex-1 accent-accent h-1.5 rounded-full appearance-none bg-white/10 cursor-pointer" />
                    <span className="text-sm font-bold text-accent min-w-[2ch]">{anilistRating}</span>
                  </div>
                </div>
                <div>
                  <label className="text-[10px] text-muted/50 uppercase tracking-wider mb-1.5 block">Status</label>
                  <select value={anilistStatus} onChange={e => setAnilistStatus(e.target.value)}
                    className="bg-surface text-text border border-border/30 rounded-lg px-3 py-2 text-sm cursor-pointer">
                    <option value="watching">Watching</option>
                    <option value="completed">Completed</option>
                    <option value="planning">Planning</option>
                    <option value="dropped">Dropped</option>
                  </select>
                </div>
                <button onClick={async () => {
                  const token = await getAnilistToken()
                  if (!token) { showToast({ msg: 'Connect AniList in Settings first', type: 'error' }); return }
                  const mediaId = parseInt((detailId || '').replace('anilist-', ''), 10)
                  if (isNaN(mediaId)) { showToast({ msg: 'No AniList media ID available', type: 'error' }); return }
                  try { await anilistSync(token, mediaId, anilistRating, anilistStatus); showToast({ msg: `Synced: ${anilistRating}/10 - ${anilistStatus}`, type: 'success' }) }
                  catch { showToast({ msg: 'AniList sync failed. Check your token.', type: 'error' }) }
                }}
                  className="px-4 py-2 bg-accent text-white rounded-lg text-sm font-semibold hover:brightness-110 transition-all cursor-pointer whitespace-nowrap">
                  Sync
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {playerOpen && <Player url={playerUrl} title={playerTitle} poster={poster} onClose={() => setPlayerOpen(false)} />}
    </div>
  )
}
