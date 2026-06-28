import { useState, useEffect } from 'react'
import { FilterChips } from '../components/cards/filter-chips'
import { useStore } from '../lib/store'
import { getSeries } from '../lib/api'
import type { Series } from '../lib/types'
import { Star } from 'lucide-react'

const genres = ['All', 'Sci-Fi', 'Drama', 'Thriller', 'Adventure', 'Comedy', 'Crime', 'Fantasy']

export function TvShowsPage() {
  const { setPage, setDetailId, setDetailType } = useStore()
  const [series, setSeries] = useState<Series[]>([])
  const [genre, setGenre] = useState('All')
  const [loading, setLoading] = useState(true)

  useEffect(() => { getSeries().then(s => { setSeries(s); setLoading(false) }) }, [])

  const filtered = genre === 'All' ? series : series.filter(s => s.genres.includes(genre))

  return (
    <div className="flex-1 overflow-y-auto p-6 animate-fade">
      <FilterChips items={genres} selected={genre} onSelect={setGenre} />
      <div className="mt-6 grid grid-cols-[repeat(auto-fill,minmax(160px,1fr))] gap-4">
        {loading
          ? Array.from({ length: 12 }).map((_, i) => (
              <div key={i} className="card-surface w-[160px]">
                <div className="poster-base w-full rounded-b-none skeleton" />
                <div className="p-2.5 space-y-1.5">
                  <div className="h-3 w-3/4 skeleton" />
                  <div className="h-2.5 w-1/2 skeleton" />
                </div>
              </div>
            ))
          : filtered.map(s => (
              <div key={s.id} onClick={() => { setDetailId(s.id); setDetailType('series'); setPage('detail') }}
                className="card-surface w-[160px] cursor-pointer group">
                <div className="relative poster-base w-full overflow-hidden rounded-b-none">
                  <img src={s.poster} alt={s.title} className="w-full h-full object-cover" loading="lazy"
                    onError={e => { (e.target as HTMLImageElement).src = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 300"><rect fill="%23111521" width="200" height="300"/><text fill="%23444" font-size="14" x="50%" y="50%" text-anchor="middle" dy=".3em">No Poster</text></svg>' }} />
                  {s.tags?.length > 0 && (
                    <div className="absolute bottom-2 left-2 flex gap-1 flex-wrap">
                      {s.tags.map(t => (
                        <span key={t} className="bg-[rgba(124,92,255,0.2)] text-[10px] text-accent px-1.5 py-0.5 rounded-[3px] font-bold uppercase">{t}</span>
                      ))}
                    </div>
                  )}
                </div>
                <div className="p-2.5">
                  <p className="text-sm font-semibold text-text truncate">{s.title}</p>
                  <p className="text-[12px] text-muted mt-0.5 flex items-center gap-1">
                    <Star size={10} className="text-[#FFD700]" fill="#FFD700" /> {s.rating.toFixed(1)} · {s.year} · {s.seasons?.length || 0} seasons
                  </p>
                </div>
              </div>
            ))}
      </div>
    </div>
  )
}
