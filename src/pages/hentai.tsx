import { useState, useEffect } from 'react'
import { FilterChips } from '../components/cards/filter-chips'
import { useStore } from '../lib/store'
import { getHentai } from '../lib/api'
import type { Hentai } from '../lib/types'
import { Star, EyeOff } from 'lucide-react'

const genres = ['All', 'Fantasy', 'Romance', 'School', 'Sci-Fi', 'Comedy']

export function HentaiPage() {
  const { setPage, setDetailId, setDetailType } = useStore()
  const [hentai, setHentai] = useState<Hentai[]>([])
  const [genre, setGenre] = useState('All')
  const [loading, setLoading] = useState(true)

  useEffect(() => { getHentai().then(h => { setHentai(h); setLoading(false) }) }, [])

  const filtered = genre === 'All' ? hentai : hentai.filter(h => h.genres.includes(genre))

  return (
    <div className="flex-1 overflow-y-auto p-6 animate-fade">
      <div className="flex items-center gap-3 mb-2">
        <EyeOff size={20} className="text-accent" />
        <p className="text-sm text-dim">Adult anime content — all titles filtered by default</p>
      </div>
      <div className="mb-4"><FilterChips items={genres} selected={genre} onSelect={setGenre} /></div>
      <div className="grid grid-cols-[repeat(auto-fill,minmax(165px,1fr))] gap-4">
        {loading
          ? Array.from({ length: 12 }).map((_, i) => (
              <div key={i} className="card-surface w-[165px]">
                <div className="poster-base w-full rounded-b-none skeleton" />
                <div className="p-2.5 space-y-1.5">
                  <div className="h-3 w-3/4 skeleton" />
                  <div className="h-2.5 w-1/2 skeleton" />
                </div>
              </div>
            ))
          : filtered.map(h => (
              <div key={h.id} onClick={() => { setDetailId(h.id); setDetailType('hentai'); setPage('detail') }}
                className="card-surface w-[165px] cursor-pointer group">
                <div className="relative poster-base w-full overflow-hidden rounded-b-none">
                  <img src={h.poster} alt={h.title} className="w-full h-full object-cover" loading="lazy"
                    onError={e => { (e.target as HTMLImageElement).src = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 300"><rect fill="%23111521" width="200" height="300"/><text fill="%23444" font-size="14" x="50%" y="50%" text-anchor="middle" dy=".3em">No Poster</text></svg>' }} />
                  {h.censored && (
                    <div className="absolute top-2 left-2 bg-[rgba(124,92,255,0.2)] text-[10px] text-accent px-1.5 py-0.5 rounded-[3px] font-bold uppercase">CENSORED</div>
                  )}
                  <div className="absolute bottom-2 right-2 bg-[rgba(17,18,26,0.85)] backdrop-blur-[4px] rounded-[4px] px-1.5 py-0.5 text-[11px] font-bold text-text">
                    {h.eps} eps
                  </div>
                  {h.tags?.length > 0 && (
                    <div className="absolute bottom-2 left-2 flex gap-1 flex-wrap">
                      {h.tags.map(t => (
                        <span key={t} className="bg-[rgba(255,90,106,0.2)] text-[10px] text-error px-1.5 py-0.5 rounded-[3px] font-bold uppercase">{t}</span>
                      ))}
                    </div>
                  )}
                </div>
                <div className="p-2.5">
                  <p className="text-sm font-semibold text-text line-clamp-2 leading-tight">{h.title}</p>
                  <p className="text-[12px] text-muted mt-1 flex items-center gap-1">
                    <Star size={10} className="text-[#FFD700]" fill="#FFD700" /> {h.rating.toFixed(1)} · {h.year}
                  </p>
                </div>
              </div>
            ))}
      </div>
    </div>
  )
}
