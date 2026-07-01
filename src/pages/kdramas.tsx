import { useState, useMemo, memo } from 'react'
import { CachedImage } from '../components/cached-image'
import { useStore } from '../lib/store'
import { usePaginatedCatalog } from '../lib/use-catalog'
import type { CatalogItem } from '../lib/types'
import { Search, Star, Info, Heart, Drama, ChevronDown } from 'lucide-react'
import { useContextMenu } from '../components/context-menu'

const KdramaGridCard = memo(function KdramaGridCard({ s, onSelect }: { s: CatalogItem; onSelect: () => void }) {
  const ctx = useContextMenu()
  const { favs, setFavs, showToast } = useStore()
  const isFav = favs.includes(s.id)
  const onCtx = (e: React.MouseEvent) => ctx.show([
    { label: 'View Details', icon: Info, onClick: onSelect },
    { label: isFav ? 'Remove Favorite' : 'Favorite', icon: Heart, onClick: () => { setFavs(isFav ? favs.filter(f => f !== s.id) : [...favs, s.id]); showToast({ msg: isFav ? 'Removed from favorites' : 'Added to favorites', type: 'success' }) } },
  ], e)

  return (
    <div onContextMenu={onCtx} onClick={onSelect}
      className="group/card relative rounded-xl overflow-hidden bg-surface border border-white/[0.06] hover:border-accent/30 hover:shadow-[0_0_24px_rgba(124,92,255,0.18)] transition-all duration-300 cursor-pointer">
      <div className="aspect-[2/3] overflow-hidden">
        <CachedImage src={s.poster} alt={s.title} title={s.title}
          className="w-full h-full object-cover group-hover/card:scale-[1.08] transition-transform duration-[400ms]" />
      </div>
      <div className="absolute top-2 right-2">
        <span className="bg-[rgba(17,18,26,0.85)] backdrop-blur-[4px] rounded px-1.5 py-0.5 text-[10px] font-bold text-[#FFD700] flex items-center gap-0.5">
          <Star size={8} fill="#FFD700" /> {s.rating.toFixed(1)}
        </span>
      </div>
      <div className="absolute bottom-0 left-0 right-0 p-2.5 bg-gradient-to-t from-deep/95 via-deep/80 to-transparent">
        <p className="text-sm font-bold text-text truncate leading-tight">{s.title}</p>
        <div className="flex items-center gap-2 mt-0.5">
          <span className="text-[10px] text-muted">{s.year}</span>
          {s.genres.slice(0, 2).map(g => (
            <span key={g} className="text-[9px] text-error/80 bg-error/10 px-1 py-0.5 rounded">{g}</span>
          ))}
        </div>
      </div>
    </div>
  )
})

function KdramaSkeleton() {
  return (
    <div className="rounded-xl overflow-hidden bg-surface border border-white/[0.06]">
      <div className="aspect-[2/3] skeleton" />
    </div>
  )
}

export function KdramasPage() {
  const { setPage, setDetailId, setDetailType } = useStore()
  const [search, setSearch] = useState('')
  const [genreFilter, setGenreFilter] = useState('all')
  const { items, loading, loadingMore, hasMore, sentinelRef } = usePaginatedCatalog('kdrama', 'All', 'rating')

  const genres = useMemo(() => {
    const set = new Set<string>()
    for (const s of items) {
      for (const g of s.genres) if (g && g !== 'All') set.add(g)
    }
    return ['all', ...Array.from(set).sort()]
  }, [items])

  const filtered = useMemo(() => {
    let list = items
    if (search) {
      const q = search.toLowerCase()
      list = list.filter(s => s.title.toLowerCase().includes(q))
    }
    if (genreFilter !== 'all') {
      list = list.filter(s => s.genres.some(g => g.toLowerCase() === genreFilter.toLowerCase()))
    }
    return list
  }, [items, search, genreFilter])

  return (
    <div className="flex-1 p-6 animate-fade">
      <div className="flex items-center gap-3 mb-5">
        <div className="w-7 h-7 rounded-lg bg-error/15 flex items-center justify-center">
          <Drama size={14} className="text-error" />
        </div>
        <p className="text-sm text-dim/80">Romantic, thrilling & everything in between — curated K-Drama catalog</p>
      </div>

      <div className="flex items-center gap-3 mb-6 flex-wrap">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted/60" />
          <input type="text" value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search K-dramas..."
            className="w-full pl-9 pr-4 py-2 bg-white/5 border border-white/[0.08] rounded-xl text-sm text-text placeholder:text-muted/40 focus:outline-none focus:border-accent/30 transition-colors" />
        </div>
        <div className="flex gap-1 bg-white/[0.04] rounded-xl p-1 overflow-x-auto">
          {genres.slice(0, 8).map(g => (
            <button key={g} onClick={() => setGenreFilter(g)}
              className={`whitespace-nowrap px-3 py-1.5 rounded-lg text-xs font-medium capitalize transition-all cursor-pointer ${
                genreFilter === g
                  ? 'bg-error text-white shadow-sm'
                  : 'text-dim hover:text-text hover:bg-white/5'
              }`}>
              {g === 'all' ? 'All' : g}
            </button>
          ))}
          {genres.length > 8 && (
            <div className="relative group">
              <button className="px-3 py-1.5 rounded-lg text-xs font-medium text-dim hover:text-text hover:bg-white/5 transition-all cursor-pointer flex items-center gap-1">
                More <ChevronDown size={10} />
              </button>
              <div className="absolute top-full right-0 mt-1 w-40 glass-modal rounded-xl border border-border/40 shadow-xl p-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-20">
                {genres.slice(8).map(g => (
                  <button key={g} onClick={() => setGenreFilter(g)}
                    className={`w-full text-left px-2 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                      genreFilter === g ? 'bg-error/20 text-error' : 'text-dim hover:text-text hover:bg-white/5'
                    }`}>
                    {g}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
        <span className="text-xs text-muted/50 ml-auto hidden sm:block">{filtered.length} title{filtered.length !== 1 ? 's' : ''}</span>
      </div>

      {loading && items.length === 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-5 gap-3 md:gap-4">
          {Array.from({ length: 12 }).map((_, i) => <KdramaSkeleton key={i} />)}
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center text-muted py-24 gap-3">
          <Drama size={40} className="text-muted/30" />
          <p className="text-sm text-dim">No K-dramas match</p>
          <p className="text-[12px]">Try a different genre or search term</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-5 gap-3 md:gap-4">
            {filtered.map(s => (
              <KdramaGridCard key={s.id} s={s}
                onSelect={() => { setDetailId(s.id); setDetailType('series'); setPage('detail') }} />
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
