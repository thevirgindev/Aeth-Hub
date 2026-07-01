import { useState } from 'react'
import { X } from 'lucide-react'

interface FilterOption {
  label: string
  count: number
}

interface FilterModalProps {
  label: string
  options: FilterOption[]
  selected: string[]
  onToggle: (value: string) => void
  onClear: () => void
  accent?: string
  icon?: React.ReactNode
}

function FilterModal({ label, options, selected, onToggle, onClear, accent = '#7C5CFF' }: FilterModalProps) {
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState('')
  if (options.length === 0) return null
  const activeCount = selected.length
  const filtered = search.trim()
    ? options.filter(o => o.label.toLowerCase().includes(search.toLowerCase()))
    : options

  return (
    <>
      <button onClick={() => setOpen(true)}
        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-medium transition-all cursor-pointer ${
          activeCount > 0
            ? 'text-white border shadow-sm'
            : 'text-muted/60 hover:text-text hover:bg-white/[0.04] border border-transparent'
        }`}
        style={activeCount > 0 ? { background: accent, borderColor: accent, boxShadow: `0 0 12px ${accent}40` } : {}}>
        <span style={activeCount > 0 ? {} : { color: accent }}>{label}</span>
        {activeCount > 0 && <span className="ml-1.5 text-[10px] font-bold tabular-nums bg-white/20 text-white px-1.5 py-0.5 rounded-md">{activeCount}</span>}
      </button>
      {open && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setOpen(false)} />
          <div className="relative bg-surface/95 backdrop-blur-2xl border border-border/60 rounded-2xl shadow-[0_24px_64px_rgba(0,0,0,0.5)] w-[380px] max-h-[70vh] flex flex-col animate-modal-in">
            <div className="flex items-center justify-between p-4 pb-3 border-b border-border/20">
              <h3 className="text-sm font-bold text-text">{label}</h3>
              <button onClick={() => setOpen(false)}
                className="w-7 h-7 rounded-lg text-muted hover:text-text hover:bg-white/10 transition-colors flex items-center justify-center cursor-pointer">
                <X size={14} />
              </button>
            </div>
            <div className="px-4 pt-3 pb-2">
              <input value={search} onChange={e => setSearch(e.target.value)}
                placeholder={`Search ${label.toLowerCase()}...`}
                className="w-full bg-deep border border-border/30 rounded-lg px-3 py-2 text-xs text-text outline-none focus:border-white/20 transition-colors"
                autoFocus />
            </div>
            <div className="flex-1 overflow-y-auto px-4 pb-4 pt-2">
              <div className="flex flex-wrap gap-1.5">
                {filtered.map(opt => {
                  const active = selected.includes(opt.label)
                  return (
                    <button key={opt.label} onClick={() => onToggle(opt.label)}
                      className={`text-[11px] px-2.5 py-1.5 rounded-lg font-medium transition-all cursor-pointer flex items-center gap-1 ${
                        active
                          ? 'text-white shadow-sm'
                          : 'text-muted/60 hover:text-text hover:bg-white/[0.04]'
                      }`}
                      style={active ? { background: accent, boxShadow: `0 0 12px ${accent}40` } : {}}>
                      {opt.label}
                      <span className="text-[10px] opacity-50 ml-1">{opt.count}</span>
                    </button>
                  )
                })}
                {filtered.length === 0 && (
                  <p className="text-xs text-muted/50 py-4 w-full text-center">No {label.toLowerCase()} match your search</p>
                )}
              </div>
            </div>
            {activeCount > 0 && (
              <div className="p-3 border-t border-border/20 flex justify-between items-center">
                <span className="text-[11px] text-muted/60">{activeCount} selected</span>
                <button onClick={() => { onClear(); setOpen(false) }}
                  className="text-[11px] text-error/70 hover:text-error hover:bg-white/5 px-3 py-1.5 rounded-lg transition-colors cursor-pointer">
                  Clear all
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  )
}

interface FilterBarProps {
  genres: FilterOption[]
  ratings: FilterOption[]
  years: FilterOption[]
  selected: string[]
  onToggle: (value: string) => void
  onClear: () => void
}

export function FilterBar({ genres, ratings, years, selected, onToggle, onClear }: FilterBarProps) {
  const allEmpty = genres.length === 0 && ratings.length === 0 && years.length === 0
  if (allEmpty) return null
  return (
    <div className="flex flex-wrap items-center gap-2 mb-4 px-1">
      <FilterModal label="Genre" options={genres} selected={selected} onToggle={onToggle} onClear={onClear} accent="#7C5CFF" />
      <FilterModal label="Rating" options={ratings} selected={selected} onToggle={onToggle} onClear={onClear} accent="#FFD700" />
      <FilterModal label="Year" options={years} selected={selected} onToggle={onToggle} onClear={onClear} accent="#FF8C42" />
      {selected.length > 0 && (
        <button onClick={onClear}
          className="px-2 py-1 rounded-lg text-[10px] text-error/60 hover:text-error hover:bg-white/5 transition-colors cursor-pointer">
          Clear All
        </button>
      )}
    </div>
  )
}
