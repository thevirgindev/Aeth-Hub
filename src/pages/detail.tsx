import { useState, useEffect } from 'react'
import { useStore } from '../lib/store'
import { getMovies, getGames, getAnime, getSeries, getHentai, searchAll, getEpisodeStreams } from '../lib/api'
import { Button } from '../components/ui/button'
import { Badge } from '../components/ui/badge'
import type { Movie, Game, Anime, Series, Hentai, StrSrc } from '../lib/types'
import { Play, Download, ArrowLeft, Star, ChevronDown, ChevronRight, Magnet } from 'lucide-react'

export function DetailPage() {
  const { detailId, detailType, setPage, showToast } = useStore()
  const [movie, setMovie] = useState<Movie | null>(null)
  const [series, setSeries] = useState<Series | null>(null)
  const [game, setGame] = useState<Game | null>(null)
  const [anime, setAnime] = useState<Anime | null>(null)
  const [hentai, setHentai] = useState<Hentai | null>(null)
  const [streams, setStreams] = useState<StrSrc[]>([])
  const [searching, setSearching] = useState(false)
  const [expandedSeason, setExpandedSeason] = useState<number | null>(null)

  useEffect(() => {
    if (!detailId) return
    setStreams([])
    setExpandedSeason(null)
    if (detailType === 'movie') getMovies().then(ms => setMovie(ms.find(m => m.id === detailId) || null))
    else if (detailType === 'series') getSeries().then(ss => setSeries(ss.find(s => s.id === detailId) || null))
    else if (detailType === 'game') getGames().then(gs => setGame(gs.find(g => g.id === detailId) || null))
    else if (detailType === 'anime') getAnime().then(as => setAnime(as.find(a => a.id === detailId) || null))
    else if (detailType === 'hentai') getHentai().then(hs => setHentai(hs.find(h => h.id === detailId) || null))
  }, [detailId, detailType])

  const searchStreams = async () => {
    const title = item?.title
    if (!title) return
    setSearching(true)
    try {
      const results = await searchAll(title)
      setStreams(results)
    } catch { showToast({ msg: 'Search failed', type: 'error' }) }
    setSearching(false)
  }

  const item: Record<string, unknown> | null = movie || series || game || anime || hentai
  if (!item) return (
    <div className="flex-1 flex items-center justify-center animate-fade">
      <div className="text-center">
        <div className="w-12 h-12 mx-auto mb-4 skeleton rounded-xl" />
        <p className="text-muted text-sm">Loading...</p>
      </div>
    </div>
  )

  const backdrop = movie?.backdrop || series?.backdrop || anime?.banner || hentai?.banner || game?.banner || ''
  const poster = movie?.poster || series?.poster || anime?.poster || hentai?.poster || game?.icon || ''
  const title = item.title as string
  const overview = movie?.overview || series?.overview || anime?.synopsis || hentai?.synopsis || game?.desc || ''
  const genres = (movie?.genres || series?.genres || anime?.genres || hentai?.genres || [game?.genre || ''].filter(Boolean)) as string[]
  const rating = (movie?.rating || series?.rating || anime?.rating || hentai?.rating || 0) as number
  const year = (movie?.year || series?.year || anime?.year || hentai?.year) as number | undefined
  const tags = (movie?.tags || series?.tags || anime?.tags || hentai?.tags || game?.tags || []) as string[]

  const episodeKey = (s: number, e: number) => `${s}-${e}`

  return (
    <div className="flex-1 overflow-y-auto animate-fade">
      <div className="relative h-[45vh] min-h-[350px] overflow-hidden">
        {backdrop && (
          <img src={backdrop} alt="" className="w-full h-full object-cover"
            onError={e => { (e.target as HTMLImageElement).style.display = 'none' }} />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-deep via-deep/60 to-transparent" />
        <button onClick={() => setPage('home')}
          className="absolute top-4 left-4 glass glass-hover rounded-xl px-3 py-2 text-sm text-dim cursor-pointer z-10 flex items-center gap-1.5">
          <ArrowLeft size={16} /> Back
        </button>
      </div>
      <div className="px-8 -mt-20 relative z-10">
        <div className="flex flex-col md:flex-row gap-8">
          <div className="shrink-0 w-[200px]">
            {poster && <img src={poster} alt="" className="poster-base w-full shadow-[0_8px_24px_rgba(0,0,0,0.5)]"
              onError={e => { (e.target as HTMLImageElement).style.display = 'none' }} />}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-start gap-3 flex-wrap">
              <h1 className="text-3xl font-extrabold text-text">{title}</h1>
              {tags.length > 0 && tags.map(t => (
                <Badge key={t} variant="accent">{t}</Badge>
              ))}
            </div>
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
              {genres.filter(Boolean).map(g => (
                <span key={g} className="bg-white/10 px-2 py-0.5 rounded text-[11px]">{g}</span>
              ))}
            </div>
            <p className="mt-4 text-sm text-dim/80 leading-relaxed max-w-2xl">{overview}</p>
            {game && (
              <div className="mt-3 flex items-center gap-3 text-sm text-dim flex-wrap">
                <Badge variant="accent">{game.repacker}</Badge>
                <span className="font-mono text-[12px]">{game.size}</span>
                <span>{game.dl_count.toLocaleString()} downloads</span>
              </div>
            )}
            {game?.screenshots && game.screenshots.length > 0 && (
              <div className="mt-4 flex gap-2 overflow-x-auto">
                {game.screenshots.map((ss, i) => (
                  <img key={i} src={ss} alt="" className="h-20 rounded-lg object-cover" loading="lazy"
                    onError={e => { (e.target as HTMLImageElement).style.display = 'none' }} />
                ))}
              </div>
            )}
            <div className="flex gap-3 mt-6">
              <Button variant="primary" size="lg" onClick={() => { showToast({ msg: 'Launching player...', type: 'info' }) }}>
                <Play size={16} /> Play
              </Button>
              <Button variant="outline" size="lg" onClick={searchStreams} disabled={searching}>
                <Magnet size={16} /> {searching ? 'Searching...' : 'Search Streams'}
              </Button>
            </div>
            {streams.length > 0 && (
              <div className="mt-6">
                <h3 className="text-lg font-semibold text-text mb-3 flex items-center gap-2"><Magnet size={16} /> Available Streams</h3>
                <div className="space-y-2 max-w-2xl">
                  {streams.map((s, i) => (
                    <div key={i} className="glass rounded-xl p-3 flex items-center justify-between">
                      <div className="flex items-center gap-3 min-w-0">
                        <Badge variant="quality">{s.quality}</Badge>
                        <span className="text-sm text-text truncate">{s.name}</span>
                        <span className="text-[12px] text-muted font-mono">{s.size}</span>
                        <span className="text-[12px] text-muted">{s.seeders} seeders</span>
                        <Badge variant="accent">{s.kind}</Badge>
                      </div>
                      <Button variant="ghost" size="sm" onClick={() => showToast({ msg: `Playing from ${s.name}`, type: 'success' })}>
                        <Play size={14} />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}
            {series && series.seasons && series.seasons.length > 0 && (
              <div className="mt-8">
                <h3 className="text-lg font-semibold text-text mb-3">Episodes</h3>
                <div className="space-y-2 max-w-2xl">
                  {series.seasons.map(s => (
                    <div key={s.num} className="glass rounded-xl overflow-hidden">
                      <button onClick={() => setExpandedSeason(expandedSeason === s.num ? null : s.num)}
                        className="w-full flex items-center justify-between p-3 cursor-pointer hover:bg-white/5 transition-colors">
                        <span className="text-sm font-semibold text-text">Season {s.num}</span>
                        {expandedSeason === s.num ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                      </button>
                      {expandedSeason === s.num && (
                        <div className="px-3 pb-3 grid grid-cols-[repeat(auto-fill,minmax(48px,1fr))] gap-2">
                          {s.episodes.map(ep => (
                            <div key={ep.num} className="flex flex-col items-center gap-1">
                              <button onClick={async () => {
                                try {
                                  const epStreams = await getEpisodeStreams(series.id, s.num, ep.num)
                                  if (epStreams.length > 0) setStreams(epStreams)
                                  showToast({ msg: `Episode ${ep.num} streams loaded`, type: 'success' })
                                } catch { showToast({ msg: 'Failed to load episode streams', type: 'error' }) }
                              }}
                                className="w-full aspect-square flex items-center justify-center rounded-lg bg-surface text-sm text-dim hover:bg-white/20 hover:text-text transition-colors cursor-pointer">
                                {ep.num}
                              </button>
                              <span className="text-[9px] text-muted truncate w-full text-center leading-tight">{ep.title}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
            {anime && (
              <div className="mt-8">
                <h3 className="text-lg font-semibold text-text mb-3">Episodes</h3>
                <div className="grid grid-cols-[repeat(auto-fill,minmax(50px,1fr))] gap-2 max-w-[600px]">
                  {Array.from({ length: anime.eps }, (_, i) => (
                    <button key={i}
                      className="aspect-square flex items-center justify-center rounded-lg bg-surface text-sm text-dim hover:bg-white/20 hover:text-text transition-colors cursor-pointer">
                      {i + 1}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
