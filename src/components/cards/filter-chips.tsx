import { useState, useRef, useEffect } from 'react'
import { ChevronDown, Filter, Search, X } from 'lucide-react'
import type { SortKey } from '../sort-controls'

const yearOptions = [
  { value: 'all', label: 'All Years' },
  { value: '2020', label: '2020s' },
  { value: '2010', label: '2010s' },
  { value: '2000', label: '2000s' },
  { value: '1990', label: '1990s' },
  { value: '1980', label: '1980s' },
]

const sortOptions: { key: SortKey; label: string }[] = [
  { key: 'rating', label: 'Rating' },
  { key: 'year', label: 'Year' },
  { key: 'title', label: 'Title A-Z' },
  { key: 'title-desc', label: 'Title Z-A' },
]

interface Props {
  genres: string[]
  selectedGenre: string
  onGenreChange: (v: string) => void
  selectedYear: string
  onYearChange: (v: string) => void
  sort: SortKey
  onSortChange: (k: SortKey) => void
  filteredCount: number
  totalCount: number
  searchQuery?: string
  onSearchChange?: (v: string) => void
  genreCounts?: Record<string, number>
}

export function FilterBar({ genres, selectedGenre, onGenreChange, selectedYear, onYearChange, sort, onSortChange, filteredCount, totalCount, searchQuery, onSearchChange, genreCounts }: Props) {
  const [yearOpen, setYearOpen] = useState(false)
  const [sortOpen, setSortOpen] = useState(false)
  const yearRef = useRef<HTMLDivElement>(null!)
  const sortRef = useRef<HTMLDivElement>(null!)

  useEffect(() => {
    const close = (e: MouseEvent) => {
      if (yearRef.current && !yearRef.current.contains(e.target as Node)) setYearOpen(false)
      if (sortRef.current && !sortRef.current.contains(e.target as Node)) setSortOpen(false)
    }
    document.addEventListener('mousedown', close)
    return () => document.removeEventListener('mousedown', close)
  }, [])

  const activeCount = (selectedGenre !== 'All' ? 1 : 0) + (selectedYear !== 'all' ? 1 : 0)

  return (
    <div className="flex flex-wrap items-center gap-2">
      <div className="flex gap-1.5 overflow-x-auto pb-1" style={{ scrollbarWidth: 'none' }}>
        {genres.map(g => (
          <button key={g} onClick={() => onGenreChange(g)}
            className={`px-3 py-1.5 text-sm rounded-[14px] transition-all duration-150 cursor-pointer whitespace-nowrap ${
              g === selectedGenre
                ? 'bg-accent text-white'
                : 'bg-white/10 text-dim hover:bg-white/20 hover:text-text'
            }`}>
            {g}{g !== 'All' && genreCounts?.[g] != null ? <span className="ml-1 text-[10px] opacity-60">({genreCounts[g]})</span> : ''}
          </button>
        ))}
      </div>

      <div ref={yearRef} className="relative">
        <button onClick={() => { setYearOpen(!yearOpen); setSortOpen(false) }}
          className="flex items-center gap-1.5 px-3 py-1.5 text-sm rounded-[14px] bg-white/10 text-dim hover:bg-white/20 hover:text-text transition-all cursor-pointer whitespace-nowrap">
          {yearOptions.find(y => y.value === selectedYear)?.label || 'All Years'}
          <ChevronDown size={13} className={`transition-transform ${yearOpen ? 'rotate-180' : ''}`} />
        </button>
        {yearOpen && (
          <div className="absolute top-full left-0 mt-1 z-50 w-36 bg-surface border border-border rounded-xl shadow-xl overflow-hidden">
            {yearOptions.map(y => (
              <button key={y.value} onClick={() => { onYearChange(y.value); setYearOpen(false) }}
                className={`w-full text-left px-3.5 py-2 text-sm transition-colors cursor-pointer ${
                  y.value === selectedYear ? 'bg-accent/20 text-accent' : 'text-dim hover:bg-white/5 hover:text-text'
                }`}>
                {y.label}
              </button>
            ))}
          </div>
        )}
      </div>

      <div ref={sortRef} className="relative">
        <button onClick={() => { setSortOpen(!sortOpen); setYearOpen(false) }}
          className="flex items-center gap-1.5 px-3 py-1.5 text-sm rounded-[14px] bg-white/10 text-dim hover:bg-white/20 hover:text-text transition-all cursor-pointer whitespace-nowrap">
          {sortOptions.find(s => s.key === sort)?.label || 'Rating'}
          <ChevronDown size={13} className={`transition-transform ${sortOpen ? 'rotate-180' : ''}`} />
        </button>
        {sortOpen && (
          <div className="absolute top-full left-0 mt-1 z-50 w-40 bg-surface border border-border rounded-xl shadow-xl overflow-hidden">
            {sortOptions.map(s => (
              <button key={s.key} onClick={() => { onSortChange(s.key); setSortOpen(false) }}
                className={`w-full text-left px-3.5 py-2 text-sm transition-colors cursor-pointer ${
                  s.key === sort ? 'bg-accent/20 text-accent' : 'text-dim hover:bg-white/5 hover:text-text'
                }`}>
                {s.label}
              </button>
            ))}
          </div>
        )}
      </div>

      {activeCount > 0 && (
        <div className="flex items-center gap-1 px-2.5 py-1 text-[11px] text-accent bg-accent/15 rounded-full font-semibold">
          <Filter size={11} />
          {activeCount}
        </div>
      )}

      {onSearchChange && (
        <div className="relative ml-auto min-w-[140px]">
          <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted/60 pointer-events-none" />
          <input type="text" value={searchQuery || ''} onChange={e => onSearchChange(e.target.value)}
            placeholder="Filter titles..."
            className="w-full pl-7.5 pr-7 py-1.5 text-sm rounded-[14px] bg-white/10 text-text placeholder:text-muted/40 border-none outline-none focus:bg-white/15 focus:ring-1 focus:ring-white/30 transition-all" />
          {searchQuery && (
            <button onClick={() => onSearchChange('')} className="absolute right-2 top-1/2 -translate-y-1/2 text-muted/60 hover:text-text cursor-pointer">
              <X size={13} />
            </button>
          )}
        </div>
      )}

      <span className="text-[11px] text-muted/50 whitespace-nowrap">
        {filteredCount} / {totalCount}
      </span>
    </div>
  )
}
