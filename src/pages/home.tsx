import { useState, useEffect } from 'react'
import { HeroBanner } from '../components/hero-banner'
import { MediaRow } from '../components/media-row'
import { MoviePoster, MoviePosterSkeleton } from '../components/cards/movie-poster'
import { GameCard, GameCardSkeleton } from '../components/cards/game-card'
import { AnimeCard, AnimeCardSkeleton } from '../components/cards/anime-card'
import { useStore } from '../lib/store'
import { getMovies, getGames, getAnime, getSeries, getPlayback } from '../lib/api'
import type { Movie, Game, Anime, Series, PlaybackPos } from '../lib/types'
import { Play, Clock, ChevronRight } from 'lucide-react'

export function HomePage() {
  const { setPage, setDetailId, setDetailType, showToast } = useStore()
  const [movies, setMovies] = useState<Movie[]>([])
  const [games, setGames] = useState<Game[]>([])
  const [anime, setAnime] = useState<Anime[]>([])
  const [series, setSeries] = useState<Series[]>([])
  const [playback, setPlayback] = useState<PlaybackPos[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      getMovies(), getGames(), getAnime(), getSeries(), getPlayback()
    ]).then(([m, g, a, s, p]) => {
      setMovies(m); setGames(g); setAnime(a); setSeries(s); setPlayback(p)
    }).finally(() => setLoading(false))
  }, [])

  const heroItems = movies.slice(0, 4).map(m => ({
    id: m.id, title: m.title, backdrop: m.backdrop, overview: m.overview,
    year: m.year, rating: m.rating, genres: m.genres,
  }))

  const openDetail = (id: string, type: string) => {
    setDetailId(id); setDetailType(type); setPage('detail')
  }

  return (
    <div className="flex-1 overflow-y-auto p-6 animate-fade">
      <HeroBanner
        items={heroItems}
        onPlay={(id) => { showToast({ msg: 'Launching player...', type: 'info' }) }}
        onDetail={(id) => openDetail(id, 'movie')}
      />
      {playback.length > 0 && (
        <MediaRow title={<span className="flex items-center gap-2"><Clock size={18} /> Continue Watching</span>}>
          {playback.slice(0, 5).map(p => (
            <div key={p.content_id}
              onClick={() => { setDetailId(p.content_id); setDetailType(p.mtype); setPage('detail') }}
              className="card-surface w-[200px] p-3 cursor-pointer">
              <div className="flex items-center gap-3 mb-2">
                <Play size={14} className="text-accent shrink-0" />
                <p className="text-sm font-semibold text-text truncate">{p.title}</p>
              </div>
              <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden">
                <div className="h-full bg-accent rounded-full" style={{ width: `${p.duration_secs > 0 ? (p.position_secs / p.duration_secs * 100) : 0}%` }} />
              </div>
              <p className="text-[10px] text-muted mt-1 font-mono">{Math.floor(p.position_secs / 60)}m / {Math.floor(p.duration_secs / 60)}m</p>
            </div>
          ))}
        </MediaRow>
      )}
      <MediaRow title={<span className="flex items-center gap-2"><ChevronRight size={18} /> Trending Movies</span>}>
        {loading
          ? Array.from({ length: 6 }).map((_, i) => <MoviePosterSkeleton key={i} />)
          : movies.slice(0, 10).map(m => (
              <MoviePoster key={m.id} movie={m} onSelect={() => openDetail(m.id, 'movie')} />
            ))}
      </MediaRow>
      {series.length > 0 && (
        <MediaRow title={<span className="flex items-center gap-2"><ChevronRight size={18} /> Popular Series</span>}>
          {series.slice(0, 8).map(s => (
            <div key={s.id} onClick={() => openDetail(s.id, 'series')}
              className="card-surface w-[160px] cursor-pointer">
              <div className="poster-base w-full rounded-b-none">
                <img src={s.poster} alt={s.title} className="w-full h-full object-cover" loading="lazy"
                  onError={e => { (e.target as HTMLImageElement).src = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 300"><rect fill="%23111521" width="200" height="300"/><text fill="%23444" font-size="14" x="50%" y="50%" text-anchor="middle" dy=".3em">No Poster</text></svg>' }} />
              </div>
              <div className="p-2.5">
                <p className="text-sm font-semibold text-text truncate">{s.title}</p>
                <p className="text-[12px] text-muted">{s.year} · {s.seasons?.length || 0} seasons</p>
              </div>
            </div>
          ))}
        </MediaRow>
      )}
      <MediaRow title={<span className="flex items-center gap-2"><ChevronRight size={18} /> Popular Games</span>}>
        {loading
          ? Array.from({ length: 6 }).map((_, i) => <GameCardSkeleton key={i} />)
          : games.slice(0, 8).map(g => (
              <GameCard key={g.id} game={g} onSelect={() => openDetail(g.id, 'game')} />
            ))}
      </MediaRow>
      <MediaRow title={<span className="flex items-center gap-2"><ChevronRight size={18} /> Top Anime</span>}>
        {loading
          ? Array.from({ length: 6 }).map((_, i) => <AnimeCardSkeleton key={i} />)
          : anime.slice(0, 8).map(a => (
              <AnimeCard key={a.id} anime={a} onSelect={() => openDetail(a.id, 'anime')} />
            ))}
      </MediaRow>
    </div>
  )
}
