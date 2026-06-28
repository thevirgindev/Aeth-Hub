import { useState, useEffect, useRef } from 'react'
import { useStore } from '../lib/store'
import { searchAll } from '../lib/api'
import { Input } from '../components/ui/input'
import { Badge } from '../components/ui/badge'
import type { StrSrc } from '../lib/types'
import { Search, Clapperboard, Gamepad2, Film, Ghost, Monitor, Loader } from 'lucide-react'

const typeIcons: Record<string, typeof Clapperboard> = {
  movie: Clapperboard, series: Monitor, anime: Film, hentai: Ghost, game: Gamepad2,
}

export function SearchOverlay() {
  const { searchOpen, setSearchOpen, showToast } = useStore()
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<StrSrc[]>([])
  const [loading, setLoading] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null!)
  const timerRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)

  useEffect(() => {
    if (searchOpen) {
      setQuery(''); setResults([]); setLoading(false)
      setTimeout(() => inputRef.current?.focus(), 100)
    }
  }, [searchOpen])

  useEffect(() => {
    if (!query.trim()) { setResults([]); return }
    if (timerRef.current) clearTimeout(timerRef.current)
    timerRef.current = window.setTimeout(async () => {
      setLoading(true)
      try {
        const r = await searchAll(query)
        setResults(r)
      } catch { setResults([]) }
      setLoading(false)
    }, 350)
    return () => { if (timerRef.current) clearTimeout(timerRef.current) }
  }, [query])

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') { e.preventDefault(); setSearchOpen(!searchOpen) }
      if (e.key === 'Escape') setSearchOpen(false)
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [searchOpen, setSearchOpen])

  const groups = results.reduce<Record<string, StrSrc[]>>((acc, r) => {
    const type = r.kind === 'game' ? 'Games' : r.kind === 'anime' ? 'Anime' : r.kind === 'hentai' ? 'Hentai' : 'Movies & Series'
    if (!acc[type]) acc[type] = []
    acc[type].push(r)
    return acc
  }, {})

  if (!searchOpen) return null

  const qualityColors: Record<string, 'quality' | 'warning' | 'accent'> = {
    '4K': 'quality', '1080p': 'quality', '720p': 'warning', '480p': 'accent',
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-start justify-center pt-[10vh] animate-fade" onClick={() => setSearchOpen(false)}>
      <div className="glass-modal w-full max-w-[640px] max-h-[75vh] rounded-2xl overflow-hidden shadow-[0_20px_60px_rgba(0,0,0,0.5)]" onClick={e => e.stopPropagation()}>
        <div className="p-4 border-b border-border flex items-center gap-3">
          <Search size={18} className="text-muted" />
          <Input ref={inputRef} placeholder="Search movies, series, games, anime..." value={query} onChange={e => setQuery(e.target.value)}
            className="border-0 bg-transparent px-0 focus:ring-0" />
          {loading && <Loader size={16} className="text-accent animate-spin" />}
        </div>
        <div className="overflow-y-auto max-h-[60vh] p-4">
          {Object.entries(groups).map(([type, items]) => (
            <div key={type} className="mb-4">
              <h3 className="text-sm font-semibold text-accent mb-2 uppercase tracking-wider">{type}</h3>
              <div className="space-y-1">
                {items.map((item, i) => {
                  const Icon = typeIcons[item.kind] || Clapperboard
                  return (
                    <div key={`${item.info_hash}-${i}`}
                      className="flex items-center gap-3 p-2 hover:bg-white/5 rounded-lg transition-colors cursor-pointer text-left"
                      onClick={() => {
                        showToast({ msg: `Opening stream from ${item.name}`, type: 'info' })
                        setSearchOpen(false)
                      }}>
                      <Icon size={16} className="text-muted shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-text truncate">{item.name}</p>
                        <div className="flex items-center gap-2 text-[11px] text-muted mt-0.5">
                          <Badge variant={qualityColors[item.quality] || 'default'}>{item.quality}</Badge>
                          <span>{item.size}</span>
                          <span>{item.seeders} seeders</span>
                        </div>
                      </div>
                      <Badge variant="accent">{item.kind}</Badge>
                    </div>
                  )
                })}
              </div>
            </div>
          ))}
          {query && results.length === 0 && !loading && (
            <div className="text-center text-muted text-sm py-8">No results for "{query}"</div>
          )}
          {!query && <div className="text-center text-muted text-sm py-8">Type to search across all catalogs</div>}
        </div>
      </div>
    </div>
  )
}
