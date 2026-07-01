import { useState, useMemo, memo } from 'react'
import { useStore } from '../lib/store'
import { usePaginatedCatalog } from '../lib/use-catalog'
import type { CatalogItem } from '../lib/types'
import { BookOpen, Film, Ghost, Sparkles, Search, X, Star, Info, Heart } from 'lucide-react'
import { CachedImage } from '../components/cached-image'
import { useContextMenu } from '../components/context-menu'

type Tab = 'all' | 'anime' | 'manga' | 'hentai'

const AnimeGridCard = memo(function AnimeGridCard({ item, onSelect }: { item: CatalogItem; onSelect: () => void }) {
  const ctx = useContextMenu()
  const { favs, setFavs, showToast } = useStore()
  const isFav = favs.includes(item.id)
  const onCtx = (e: React.MouseEvent) => ctx.show([
    { label: 'View Details', icon: Info, onClick: onSelect },
    { label: isFav ? 'Remove Favorite' : 'Favorite', icon: Heart, onClick: () => { setFavs(isFav ? favs.filter(f => f !== item.id) : [...favs, item.id]); showToast({ msg: isFav ? 'Removed from favorites' : 'Added to favorites', type: 'success' }) } },
  ], e)
  const isHentai = item.id.startsWith('hentai-')
  return (
    <div onContextMenu={onCtx} onClick={onSelect} className="card-surface cursor-pointer group/card">
      <div className="relative poster-base w-full overflow-hidden rounded-b-none">
        <CachedImage src={item.poster} alt={item.title} title={item.title} className="w-full h-full" />
        {isHentai && <div className="absolute top-2 right-2 bg-accent/80 text-[9px] text-white px-1.5 py-0.5 rounded font-bold uppercase">18+</div>}
        <div className="absolute bottom-2 right-2 bg-[rgba(17,18,26,0.85)] backdrop-blur-[4px] rounded-[4px] px-1.5 py-0.5 text-[11px] font-bold text-text">
          {item.eps ?? '?'} eps
        </div>
        <div className="absolute inset-0 bg-gradient-to-t from-deep/90 via-deep/40 to-transparent backdrop-blur-[2px] opacity-0 group-hover/card:opacity-100 transition-opacity flex flex-col justify-end p-3 z-10 rounded-b-none">
          <p className="text-sm font-bold text-text leading-tight">{item.title}</p>
          <p className="text-[11px] text-[#FFD700] mt-1 flex items-center gap-1">
            <Star size={10} fill="#FFD700" /> {item.rating.toFixed(1)} · {item.year}
          </p>
          <p className="text-[11px] text-dim mt-0.5 line-clamp-2">{item.genres.join(', ')}</p>
          <p className="text-[10px] text-muted/60 mt-0.5">{item.status || '?'} · {item.eps ?? '?'} eps</p>
        </div>
      </div>
      <div className="p-2.5">
        <p className="text-sm font-semibold text-text line-clamp-2 leading-tight">{item.title}</p>
        <p className="text-[12px] text-muted mt-1 flex items-center gap-1">
          <Star size={10} className="text-[#FFD700]" fill="#FFD700" /> {item.rating.toFixed(1)} · {item.year}
        </p>
      </div>
    </div>
  )
})

function GridSkeleton() {
  return (
    <div className="card-surface">
      <div className="poster-base w-full rounded-b-none skeleton" />
      <div className="p-2.5 space-y-1.5">
        <div className="h-3 w-3/4 skeleton" />
        <div className="h-2.5 w-1/2 skeleton" />
      </div>
    </div>
  )
}

export function AnimePage() {
  const { setPage, setDetailId, setDetailType, showToast } = useStore()
  const [tab, setTab] = useState<Tab>('all')
  const [search, setSearch] = useState('')
  const [genreFilter, setGenreFilter] = useState('all')
  const [showMore, setShowMore] = useState(false)

  const animeEnabled = tab === 'all' || tab === 'anime'

  const animeHook = usePaginatedCatalog(animeEnabled ? 'anime' : 'none', 'All', 'rating')

  const tabs: { key: Tab; label: string; icon: typeof Film; locked?: boolean }[] = [
    { key: 'all', label: 'All', icon: Sparkles },
    { key: 'anime', label: 'Anime', icon: Film },
    { key: 'manga', label: 'Manga', icon: BookOpen, locked: true },
    { key: 'hentai', label: 'Hentai', icon: Ghost, locked: true },
  ]

  const activeTab = tabs.find(t => t.key === tab) ? tab : 'all'

  const items = useMemo(() => {
    let list = animeHook.items
    const seen = new Set<string>()
    return list.filter(item => {
      if (seen.has(item.id)) return false
      seen.add(item.id)
      return true
    })
  }, [animeHook.items])

  const loading = animeHook.loading && animeHook.items.length === 0

  const genres = useMemo(() => {
    const gs = new Set<string>()
    for (const item of items) { for (const g of item.genres) gs.add(g) }
    return ['all', ...Array.from(gs).sort()]
  }, [items])

  const filtered = useMemo(() => {
    let list = items
    if (search.trim()) {
      const q = search.toLowerCase()
      list = list.filter(x => x.title.toLowerCase().includes(q))
    }
    if (genreFilter !== 'all') {
      list = list.filter(x => x.genres.includes(genreFilter) || x.tags.includes(genreFilter))
    }
    return list
  }, [items, search, genreFilter])

  const sentinelRef = animeHook.sentinelRef
  const hasMore = animeHook.hasMore
  const loadingMore = animeHook.loadingMore

  return (
    <div className="flex-1 p-6 animate-fade">
      <div className="flex items-center gap-3 mb-4">
          <span className="text-[#A855F7] text-lg">◆</span>
        <p className="text-sm text-dim">Anime & Manga — from shonen epics to slice-of-life gems</p>
      </div>

      <div className="flex items-center gap-1 mb-4 bg-white/[0.04] rounded-xl p-1 w-fit">
        {tabs.map(t => {
          const Icon = t.icon
          return (
            <button key={t.key} onClick={() => {
              if (t.locked) {
                showToast({ msg: `${t.label} not available in this preview`, type: 'info' })
                if (tab !== 'all') setTab('all')
                return
              }
              setTab(t.key); setGenreFilter('all'); setSearch('')
            }}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-150 cursor-pointer ${
                activeTab === t.key
                  ? 'bg-accent text-white shadow-lg shadow-accent/20'
                  : t.locked
                    ? 'text-muted/30 cursor-not-allowed'
                    : 'text-dim hover:text-text hover:bg-white/5'
              }`}>
              <Icon size={15} className={t.locked ? 'opacity-40' : ''} />
              {t.label}
              {t.locked && <span className="text-[8px] uppercase tracking-wider text-muted/40 ml-0.5">🔒</span>}
            </button>
          )
        })}
      </div>

      <div className="flex items-center gap-3 mb-5 flex-wrap">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted/60" />
          <input type="text" value={search} onChange={e => setSearch(e.target.value)}
            placeholder={`Search ${activeTab === 'hentai' ? 'hentai' : activeTab === 'manga' ? 'manga' : 'anime'}...`}
            className="w-full pl-9 pr-4 py-2 bg-white/5 border border-white/[0.08] rounded-xl text-sm text-text placeholder:text-muted/40 focus:outline-none focus:border-accent/30 transition-colors" />
        </div>
        <div className="flex gap-1 bg-white/[0.04] rounded-xl p-1 overflow-x-auto">
          {genres.slice(0, 8).map(g => (
            <button key={g} onClick={() => setGenreFilter(g)}
              className={`whitespace-nowrap px-3 py-1.5 rounded-lg text-xs font-medium capitalize transition-all cursor-pointer ${
                genreFilter === g
                  ? 'bg-accent text-white shadow-sm'
                  : 'text-dim hover:text-text hover:bg-white/5'
              }`}>
              {g === 'all' ? 'All' : g}
            </button>
          ))}
          {genres.length > 8 && (
            <>
              <button onClick={() => setShowMore(true)}
                className="px-3 py-1.5 rounded-lg text-xs font-medium text-dim hover:text-text hover:bg-white/5 transition-all cursor-pointer flex items-center gap-1">
                +{genres.length - 8} more
              </button>
              {showMore && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4" onClick={() => setShowMore(false)}>
                  <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
                  <div className="relative bg-surface/95 backdrop-blur-2xl border border-border/60 rounded-2xl shadow-[0_24px_64px_rgba(0,0,0,0.5)] w-[380px] max-h-[70vh] flex flex-col animate-modal-in" onClick={e => e.stopPropagation()}>
                    <div className="flex items-center justify-between p-4 pb-3 border-b border-border/20">
                      <h3 className="text-sm font-bold text-text">Genres</h3>
                      <button onClick={() => setShowMore(false)}
                        className="w-7 h-7 rounded-lg text-muted hover:text-text hover:bg-white/10 transition-colors flex items-center justify-center cursor-pointer">
                        <X size={14} />
                      </button>
                    </div>
                    <div className="flex-1 overflow-y-auto p-4">
                      <div className="flex flex-wrap gap-1.5">
                        {genres.slice(8).map(g => (
                          <button key={g} onClick={() => { setGenreFilter(g); setShowMore(false) }}
                            className={`text-[11px] px-2.5 py-1.5 rounded-lg font-medium transition-all cursor-pointer flex items-center gap-1 ${
                              genreFilter === g
                                ? 'bg-accent text-white shadow-sm'
                                : 'text-muted/60 hover:text-text hover:bg-white/[0.04]'
                            }`}>
                            {g}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
        <span className="text-xs text-muted/50 ml-auto hidden sm:block">{filtered.length} title{filtered.length !== 1 ? 's' : ''}</span>
      </div>

      {loading ? (
        <div className="grid gap-3 md:gap-4" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))' }}>
          {Array.from({ length: 12 }).map((_, i) => <GridSkeleton key={i} />)}
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center text-muted py-24 gap-3">
          <Film size={40} className="text-muted/30" />
          <p className="text-sm text-dim">No titles match</p>
          <p className="text-[12px]">Try a different genre or search term</p>
        </div>
      ) : (
        <>
          <div className="grid gap-3 md:gap-4" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))' }}>
            {filtered.map(item => (
              <AnimeGridCard key={`${activeTab}-${item.id}`} item={item}
                onSelect={() => { setDetailId(item.id); setDetailType(activeTab === 'hentai' ? 'hentai' : activeTab === 'manga' ? 'manga' : 'anime'); setPage('detail') }} />
            ))}
          </div>
          {hasMore && (
            <div ref={sentinelRef} className="h-16 flex items-center justify-center">
              {loadingMore && <div className="w-5 h-5 border-2 border-accent/30 border-t-accent rounded-full animate-spin" />}
            </div>
          )}
        </>
      )}
    </div>
  )
}
