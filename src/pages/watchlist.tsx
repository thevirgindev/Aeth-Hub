import { useState, useEffect } from 'react'
import { useStore } from '../lib/store'
import { getMovies, getGames, getAnime, getSeries, getHentai, toggleFav } from '../lib/api'
import { MoviePoster } from '../components/cards/movie-poster'
import { GameCard } from '../components/cards/game-card'
import { AnimeCard } from '../components/cards/anime-card'
import { HentaiCard } from '../components/cards/hentai-card'
import type { Movie, Game, Anime, Series, Hentai } from '../lib/types'
import { Bookmark, Trash2, LogIn } from 'lucide-react'

type FavItem = { id: string; type: string }

export function WatchlistPage() {
  const { user, setShowSignup, favs, setFavs, setPage, setDetailId, setDetailType, showToast } = useStore()
  const [movies, setMovies] = useState<Movie[]>([])
  const [series, setSeries] = useState<Series[]>([])
  const [games, setGames] = useState<Game[]>([])
  const [anime, setAnime] = useState<Anime[]>([])
  const [hentai, setHentai] = useState<Hentai[]>([])
  const [loading, setLoading] = useState(true)

  if (!user) {
    return (
      <div className="flex-1 p-6 animate-fade">
        <div className="flex flex-col items-center justify-center h-full text-center gap-4">
          <Bookmark size={48} className="text-muted/20" />
          <h2 className="text-xl font-bold text-text">Sign In Required</h2>
          <p className="text-dim text-sm max-w-md">Sign in to save and manage your watchlist.</p>
          <button onClick={() => setShowSignup(true)}
            className="flex items-center gap-2 px-5 py-2.5 bg-accent text-white rounded-xl text-sm font-semibold hover:brightness-110 transition-all cursor-pointer">
            <LogIn size={16} /> Sign In
          </button>
        </div>
      </div>
    )
  }

  useEffect(() => {
    Promise.all([getMovies(), getSeries(), getGames(), getAnime(), getHentai()])
      .then(([m, s, g, a, h]) => { setMovies(m); setSeries(s); setGames(g); setAnime(a); setHentai(h) })
      .finally(() => setLoading(false))
  }, [])

  const allItems: FavItem[] = [
    ...movies.filter(m => favs.includes(m.id)).map(m => ({ id: m.id, type: 'movie' as const })),
    ...series.filter(s => favs.includes(s.id)).map(s => ({ id: s.id, type: 'series' as const })),
    ...games.filter(g => favs.includes(g.id)).map(g => ({ id: g.id, type: 'game' as const })),
    ...anime.filter(a => favs.includes(a.id)).map(a => ({ id: a.id, type: 'anime' as const })),
    ...hentai.filter(h => favs.includes(h.id)).map(h => ({ id: h.id, type: 'hentai' as const })),
  ]

  const openDetail = (id: string, type: string) => {
    setDetailId(id); setDetailType(type); setPage('detail')
  }

  const removeFav = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation()
    await toggleFav(id, '', '', '')
    setFavs(favs.filter(f => f !== id))
    showToast({ msg: 'Removed from watchlist', type: 'success' })
  }

  if (loading) return (
    <div className="flex-1 p-6 animate-fade">
      <div className="grid grid-cols-[repeat(auto-fill,minmax(175px,1fr))] gap-4">
        {Array.from({ length: Math.max(favs.length, 1) }).map((_, i) => (
          <div key={i} className="card-surface w-full">
            <div className="poster-base w-full rounded-b-none skeleton" />
            <div className="p-2.5 space-y-1.5"><div className="h-3 w-3/4 skeleton" /><div className="h-2.5 w-1/2 skeleton" /></div>
          </div>
        ))}
      </div>
    </div>
  )

  return (
    <div className="flex-1 p-6 animate-fade">
      {allItems.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-full text-center gap-4">
          <Bookmark size={48} className="text-accent/30" />
          <h2 className="text-xl font-bold text-text">Your Watchlist is Empty</h2>
          <p className="text-dim text-sm max-w-md">Open any movie, show, game, or anime and click the bookmark icon to save it here.</p>
        </div>
      ) : (
        <>
          <p className="text-dim text-sm mb-4">{allItems.length} saved item{allItems.length !== 1 ? 's' : ''}</p>
          <div className="grid grid-cols-[repeat(auto-fill,minmax(175px,1fr))] gap-4">
            {allItems.map(item => {
              const match = (
                (item.type === 'movie' ? movies.find(m => m.id === item.id) : null) ||
                (item.type === 'series' ? series.find(s => s.id === item.id) : null) ||
                (item.type === 'game' ? games.find(g => g.id === item.id) : null) ||
                (item.type === 'anime' ? anime.find(a => a.id === item.id) : null) ||
                (item.type === 'hentai' ? hentai.find(h => h.id === item.id) : null)
              )
              if (!match) return null
              return (
                <div key={item.id} className="relative group">
                  <button onClick={(e) => removeFav(e, item.id)}
                    className="absolute top-2 right-2 z-10 w-7 h-7 flex items-center justify-center rounded-lg bg-deep/80 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer hover:bg-error/80">
                    <Trash2 size={13} className="text-white" />
                  </button>
                  {item.type === 'movie' && <MoviePoster movie={match as Movie} onSelect={() => openDetail(item.id, 'movie')} />}
                  {item.type === 'series' && (
                    <div onClick={() => openDetail(item.id, 'series')} className="card-surface w-full cursor-pointer group/card">
                      <div className="poster-base w-full rounded-b-none overflow-hidden">
                        <img src={(match as Series).poster} alt={(match as Series).title} className="w-full h-full object-cover" loading="lazy" />
                      </div>
                      <div className="p-2.5">
                        <p className="text-sm font-semibold text-text truncate">{(match as Series).title}</p>
                        <p className="text-[12px] text-muted mt-0.5">{(match as Series).year} · {(match as Series).seasons?.length || 0} seasons</p>
                      </div>
                    </div>
                  )}
                  {item.type === 'game' && <GameCard game={match as Game} onSelect={() => openDetail(item.id, 'game')} />}
                  {item.type === 'anime' && <AnimeCard anime={match as Anime} onSelect={() => openDetail(item.id, 'anime')} />}
                  {item.type === 'hentai' && <HentaiCard hentai={match as Hentai} onSelect={() => openDetail(item.id, 'hentai')} />}
                </div>
              )
            })}
          </div>
        </>
      )}
    </div>
  )
}
