import { ArrowUpDown } from 'lucide-react'

export type SortKey = 'title' | 'title-desc' | 'year' | 'rating' | 'name'

export const sortOptions: { key: SortKey; label: string }[] = [
  { key: 'rating', label: 'Rating' },
  { key: 'year', label: 'Year' },
  { key: 'title', label: 'Title A-Z' },
  { key: 'title-desc', label: 'Title Z-A' },
]

export function SortControls({ sort, onSort }: { sort: SortKey; onSort: (k: SortKey) => void }) {
  return (
    <div className="flex items-center gap-2 mb-4">
      <ArrowUpDown size={14} className="text-muted" />
      <span className="text-[12px] text-muted mr-1">Sort:</span>
      {sortOptions.map(o => (
        <button key={o.key} onClick={() => onSort(o.key)}
          className={`px-3 py-1 text-[12px] rounded-lg transition-all cursor-pointer ${
            sort === o.key ? 'bg-accent text-white' : 'bg-white/10 text-dim hover:bg-white/20'
          }`}>
          {o.label}
        </button>
      ))}
    </div>
  )
}
