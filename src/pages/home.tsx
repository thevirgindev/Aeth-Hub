import { useState, useEffect, useCallback } from 'react'
import { HeroBanner } from '../components/hero-banner'
import { ArrowScrollRow } from '../components/arrow-scroll-row'
import { AnimeCard, AnimeCardSkeleton } from '../components/cards/anime-card'
import { CachedImage } from '../components/cached-image'
import { useStore } from '../lib/store'
import { browseCatalog, getPlayback } from '../lib/api'
import { preloadBatch } from '../lib/img-cache'
import type { CatalogItem, PlaybackPos } from '../lib/types'
import { Play, Clock, Shuffle, Sparkles, Swords, Smile, Star } from 'lucide-react'

const SECTION_GENRES = ['Drama', 'Action', 'Comedy'] as const

export function HomePage() {
  const { setPage, setDetailId, setDetailType, setDetailPoster } = useStore()
  const [anime, setAnime] = useState<CatalogItem[]>([])
  const [playback, setPlayback] = useState<PlaybackPos[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      browseCatalog('anime', 'All', 'rating', 0, 40).catch(() => ({ items: [], total: 0 })),
      getPlayback().catch(() => [] as PlaybackPos[]),
    ]).then(([a, p]) => {
      const seen = new Set<string>()
      setAnime(a.items.filter(item => {
        if (seen.has(item.id)) return false
        seen.add(item.id)
        return true
      }))
      setPlayback(p)
    }).finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    if (anime.length === 0) return
    const urls = anime.slice(0, 15).map(a => a.poster).filter(Boolean) as string[]
    preloadBatch(urls)
  }, [anime])

  const heroItems = anime
    .filter(a => a.poster && a.poster.length > 0)
    .slice(0, 4)
    .map(a => ({
      id: a.id, title: a.title, backdrop: a.poster, overview: '',
      year: a.year, rating: a.rating, genres: a.genres,
    }))

  const openDetail = useCallback((id: string, type: string, poster?: string) => {
    setDetailId(id); setDetailType(type); setDetailPoster(poster || ''); setPage('detail')
  }, [setDetailId, setDetailType, setDetailPoster, setPage])

  const surprise = useCallback(() => {
    const pool = anime.map(a => ({ id: a.id, type: 'anime', poster: a.poster }))
    if (pool.length === 0) return
    const pick = pool[Math.floor(Math.random() * pool.length)]
    openDetail(pick.id, pick.type, pick.poster)
  }, [anime, openDetail])

  const continuePlayback = playback.filter(p => p.mtype === 'anime').slice(0, 6)
  const continueCards = continuePlayback.map(p => ({
    ...p,
    poster: anime.find(i => i.id === p.content_id)?.poster || '',
  }))

  const genreIcons: Record<string, typeof Swords> = {
    Drama: Sparkles, Action: Swords, Comedy: Smile,
  }

  return (
    <div className="flex-1 animate-fade overflow-x-hidden">
      <HeroBanner
        items={heroItems}
        onPlay={(id) => openDetail(id, 'anime')}
        onDetail={(id) => openDetail(id, 'anime')}
      />

      <div className="px-6 -mt-2 relative z-10">
        <div className="flex items-center justify-between mb-4">
          <p className="text-sm text-dim/70">Discover and stream anime</p>
          <button onClick={surprise}
            className="glass glass-hover rounded-xl px-3.5 py-1.5 text-xs text-dim flex items-center gap-1.5 cursor-pointer transition-all hover:text-text">
            <Shuffle size={12} /> Surprise Me
          </button>
        </div>

        {continueCards.length > 0 && (
          <div className="animate-fade" style={{ animationDelay: '100ms' }}>
            <section className="mb-7" style={{ contentVisibility: 'auto' }}>
              <h3 className="text-xl font-extrabold tracking-tight text-text mb-3 flex items-center gap-2">
                <Clock size={16} /> Continue Watching
                <span className="h-[2px] flex-1 bg-gradient-to-r from-accent/30 to-transparent ml-2" />
              </h3>
              <ArrowScrollRow carousel>
                {continueCards.map(p => (
                  <div key={`${p.content_id}-${p.episode ?? ''}`}
                    onClick={() => { setDetailId(p.content_id); setDetailType(p.mtype); setDetailPoster(p.poster); setPage('detail') }}
                    className="group/card relative w-[200px] shrink-0 rounded-xl overflow-hidden bg-surface border border-white/[0.06] hover:border-accent/30 transition-all duration-300 cursor-pointer">
                    {p.poster ? (
                      <div className="aspect-[2/3] overflow-hidden">
                        <CachedImage src={p.poster} alt={p.title} title={p.title}
                          className="w-full h-full object-cover group-hover/card:scale-105 transition-transform duration-[400ms]" />
                      </div>
                    ) : (
                      <div className="aspect-[2/3] bg-surface/50 flex items-center justify-center">
                        <Play size={24} className="text-muted/30" />
                      </div>
                    )}
                    <div className="absolute top-2 left-2">
                      <div className="bg-accent/90 text-white text-[9px] font-bold px-1.5 py-0.5 rounded flex items-center gap-1">
                        <Play size={8} fill="white" /> Resume
                      </div>
                    </div>
                    <div className="absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-deep/95 via-deep/80 to-transparent">
                      <p className="text-xs font-bold text-text truncate">{p.title}</p>
                      {p.episode != null && (
                        <p className="text-[10px] text-dim/80">{p.season != null ? `S${p.season} · ` : ''}Ep {p.episode}</p>
                      )}
                      <div className="w-full h-0.5 bg-white/10 rounded-full mt-1.5 overflow-hidden">
                        <div className="h-full bg-accent rounded-full transition-all" style={{ width: `${p.duration_secs > 0 ? (p.position_secs / p.duration_secs * 100) : 0}%` }} />
                      </div>
                    </div>
                  </div>
                ))}
              </ArrowScrollRow>
            </section>
          </div>
        )}

        {SECTION_GENRES.map((genre, gi) => {
          const genreItems = anime.filter(a => a.genres.includes(genre)).slice(0, 15)
          if (genreItems.length === 0) return null
          const GIcon = genreIcons[genre] || Sparkles
          return (
            <div key={genre} className="animate-fade" style={{ animationDelay: `${200 + gi * 100}ms` }}>
              <section className="mb-7" style={{ contentVisibility: 'auto' }}>
                <h3 className="text-xl font-extrabold tracking-tight text-text mb-3 flex items-center gap-2">
                  <GIcon size={16} className="text-accent" /> {genre}
                  <span className="h-[2px] flex-1 bg-gradient-to-r from-accent/30 to-transparent ml-2" />
                </h3>
                <ArrowScrollRow carousel>
                  {genreItems.map(a => (
                    <AnimeCard key={a.id} anime={a} onSelect={() => openDetail(a.id, 'anime', a.poster)} />
                  ))}
                </ArrowScrollRow>
              </section>
            </div>
          )
        })}

        <div className="animate-fade" style={{ animationDelay: '400ms' }}>
          <section className="mb-7" style={{ contentVisibility: 'auto' }}>
            <h3 className="text-xl font-extrabold tracking-tight text-text mb-3 flex items-center gap-2">
              <Star size={16} className="text-accent" /> Top Anime
              <span className="h-[2px] flex-1 bg-gradient-to-r from-accent/30 to-transparent ml-2" />
            </h3>
            <ArrowScrollRow carousel>
              {loading
                ? Array.from({ length: 5 }).map((_, i) => <AnimeCardSkeleton key={i} />)
                : anime.slice(0, 20).map(a => (
                    <AnimeCard key={a.id} anime={a} onSelect={() => openDetail(a.id, 'anime', a.poster)} />
                  ))}
            </ArrowScrollRow>
          </section>
        </div>

        <div className="h-8" />
      </div>
    </div>
  )
}
