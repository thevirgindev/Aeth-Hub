import { useState, useEffect, useRef, useMemo } from 'react'
import { useStore } from '../lib/store'
import { useSearchCatalog } from '../lib/use-catalog'
import { sanitizeInput } from '../lib/sanitize'
import { Input } from '../components/ui/input'
import { Search, Film, Star, Hash, ArrowUpDown, X, Loader } from 'lucide-react'
import type { CatalogItem } from '../lib/types'

const typeIcons: Record<string, typeof Film> = {
  anime: Film,
}

const groupLabels: Record<string, string> = {
  anime: 'Anime', hentai: 'Anime',
}

const groupOrder = ['Anime']

export function SearchOverlay() {
  const { searchOpen, setSearchOpen, setPage, setDetailId, setDetailType, settings: _settings } = useStore()
  const [selIdx, setSelIdx] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null!)
  const { results, total, loading, query, debouncedSearch, loadMoreResults, hasMore, setKind } = useSearchCatalog()

  useEffect(() => {
    if (searchOpen) {
      setKind('anime'); setSelIdx(0)
      setTimeout(() => inputRef.current?.focus(), 100)
    }
  }, [searchOpen, setKind])

  const groups = useMemo(() => {
    const map = new Map<string, CatalogItem[]>()
    for (const item of results) {
      const label = groupLabels[item.kind] || 'Other'
      if (!map.has(label)) map.set(label, [])
      if (map.get(label)!.length < 10) map.get(label)!.push(item)
    }
    return groupOrder.filter(g => map.has(g)).map(g => [g, map.get(g)!] as [string, CatalogItem[]])
  }, [results])

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') { e.preventDefault(); setSearchOpen(!searchOpen); return }
      if (!searchOpen) return
      if (e.key === 'Escape') setSearchOpen(false)
      if (e.key === 'ArrowUp') { e.preventDefault(); setSelIdx(i => Math.max(0, i - 1)) }
      if (e.key === 'ArrowDown') { e.preventDefault(); setSelIdx(i => Math.min(total - 1, i + 1)) }
      if (e.key === 'Enter' && results[selIdx]) {
        const item = results[selIdx]
        setDetailId(item.id)
        setDetailType(item.kind === 'series' ? 'series' : item.kind)
        setSearchOpen(false)
        setPage('detail')
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [searchOpen, setSearchOpen, results, total, selIdx, setDetailId, setDetailType, setPage])

  if (!searchOpen) return null

  const filters = [
    { key: 'anime' as const, label: 'Anime' },
  ]

  const navigate = (item: CatalogItem) => {
    setDetailId(item.id)
    setDetailType(item.kind === 'series' ? 'series' : item.kind)
    setSearchOpen(false)
    setPage('detail')
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-start justify-center pt-[8vh] animate-fade" onClick={() => setSearchOpen(false)}>
      <div className="relative w-full max-w-[680px] max-h-[80vh]" onClick={e => e.stopPropagation()}>
        <div className="absolute inset-0 bg-gradient-to-br from-accent/5 via-transparent to-transparent pointer-events-none rounded-2xl" />
        <div className="relative glass-modal w-full max-h-[80vh] rounded-2xl overflow-hidden border border-border shadow-[0_20px_60px_rgba(0,0,0,0.5)]">
        <div className="p-4 border-b border-border flex items-center gap-3">
          <Search size={18} className="text-muted shrink-0" />
          <Input ref={inputRef} placeholder="Search anime..." value={query}
            onChange={e => { debouncedSearch(sanitizeInput(e.target.value), 'anime'); setSelIdx(0) }}
            className="flex-1 border-0 bg-transparent px-0 outline-none focus:outline-none focus:ring-0 text-text text-sm" />
          {loading && <Loader size={16} className="text-accent animate-spin shrink-0" />}
          {query && <button onClick={() => { debouncedSearch('', 'all'); setSelIdx(0) }}
            className="text-muted hover:text-text transition-colors cursor-pointer p-0.5"><X size={14} /></button>}
        </div>
        {query && (
          <div className="px-4 py-2 border-b border-border/50 flex gap-1.5 overflow-x-auto" style={{ scrollbarWidth: 'none' }}>
            {filters.map(f => (
              <button key={f.key} onClick={() => { setKind(f.key); debouncedSearch(query, f.key); setSelIdx(0) }}
                className="px-2.5 py-1 text-[11px] rounded-lg font-medium transition-all cursor-pointer whitespace-nowrap bg-accent/20 text-accent">
                {f.label}
              </button>
            ))}
            <span className="text-[10px] text-muted/40 ml-auto self-center whitespace-nowrap">{total} results</span>
          </div>
        )}
        <div className="overflow-y-auto max-h-[55vh] p-4">
          {groups.map(([type, items]) => (
            <div key={type} className="mb-5 last:mb-0">
              <div className="flex items-center justify-between mb-2.5 px-0.5">
                <h3 className="text-sm font-semibold text-accent uppercase tracking-wider">{type}</h3>
                <span className="text-[10px] text-muted/50"><Hash size={10} className="inline mr-0.5" />{items.length}</span>
              </div>
              <div className="space-y-1">
                {items.map((item, i) => {
                  const globalIdx = results.indexOf(item)
                  const Icon = typeIcons[item.kind] || Film
                  return (
                    <div key={`${item.id}-${i}`}
                      className={`flex items-center gap-3 p-2.5 rounded-lg transition-all duration-100 cursor-pointer text-left ${
                        globalIdx === selIdx ? 'bg-accent/10 ring-1 ring-accent/30' : 'hover:bg-white/5'
                      }`}
                      onClick={() => navigate(item)}>
                      <Icon size={16} className={`shrink-0 ${globalIdx === selIdx ? 'text-accent' : 'text-muted'}`} />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-text truncate">{item.title}</p>
                        <div className="flex items-center gap-2 text-[11px] text-muted mt-0.5">
                          <span className="flex items-center gap-0.5 text-[#FFD700]">
                            <Star size={9} fill="#FFD700" /> {item.rating.toFixed(1)}
                          </span>
                          <span>{item.year}</span>
                          {item.genres.length > 0 && (
                            <span className="text-dim truncate max-w-[160px]">{item.genres.slice(0, 2).join(', ')}</span>
                          )}
                          {item.genre && <span className="text-dim">{item.genre}</span>}
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          ))}
          {hasMore && (
            <button onClick={loadMoreResults} className="w-full py-2 text-sm text-accent hover:text-text transition-colors cursor-pointer">
              Load more results...
            </button>
          )}
          {query && results.length === 0 && !loading && (
            <div className="flex flex-col items-center text-center text-muted text-sm py-10 gap-2">
              <Search size={24} className="text-muted/20" />
              <p>No results for "<span className="text-dim">{query}</span>"</p>
              <p className="text-[11px] text-muted/50">Try fewer or different keywords</p>
            </div>
          )}
          {!query && (
            <div className="flex flex-col items-center text-center text-muted text-sm py-10 gap-2">
              <ArrowUpDown size={24} className="text-muted/20" />
              <p>Start typing to search anime</p>
              <p className="text-[11px] text-muted/50">Press Ctrl+K to open, arrows to navigate, Enter to select</p>
            </div>
          )}
        </div>
      </div>
    </div>
    </div>
  )
}
