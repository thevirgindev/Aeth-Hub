import type { Anime } from '../../lib/types'
import { Badge } from '../ui/badge'
import { Star } from 'lucide-react'

export function AnimeCard({ anime, onSelect }: { anime: Anime; onSelect: () => void }) {
  return (
    <div className="card-surface w-[165px] cursor-pointer group" onClick={onSelect}>
      <div className="relative poster-base w-full overflow-hidden rounded-b-none">
        <img src={anime.poster} alt={anime.title} className="w-full h-full object-cover"
          loading="lazy" onError={e => { (e.target as HTMLImageElement).src = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 300"><rect fill="%23111521" width="200" height="300"/><text fill="%23444" font-size="14" x="50%" y="50%" text-anchor="middle" dy=".3em">No Poster</text></svg>' }} />
        <div className="absolute top-2 left-2 flex gap-1">
          <Badge variant="quality">SUB</Badge>
          <Badge variant="warning">DUB</Badge>
        </div>
        <div className="absolute bottom-2 right-2 bg-[rgba(17,18,26,0.85)] backdrop-blur-[4px] rounded-[4px] px-1.5 py-0.5 text-[11px] font-bold text-text">
          {anime.eps} eps
        </div>
        {anime.tags?.length > 0 && (
          <div className="absolute bottom-2 left-2 flex gap-1 flex-wrap">
            {anime.tags.slice(0, 2).map(t => (
              <span key={t} className="bg-[rgba(124,92,255,0.2)] text-[10px] text-accent px-1.5 py-0.5 rounded-[3px] font-bold uppercase">{t}</span>
            ))}
          </div>
        )}
      </div>
      <div className="p-2.5">
        <p className="text-sm font-semibold text-text line-clamp-2 leading-tight">{anime.title}</p>
        <p className="text-[12px] text-muted mt-1 flex items-center gap-1">
          <Star size={10} className="text-[#FFD700]" fill="#FFD700" /> {anime.rating.toFixed(1)} · {anime.year}
        </p>
      </div>
    </div>
  )
}

export function AnimeCardSkeleton() {
  return (
    <div className="card-surface w-[165px]">
      <div className="poster-base w-full rounded-b-none skeleton" />
      <div className="p-2.5 space-y-1.5">
        <div className="h-3 w-3/4 skeleton" />
        <div className="h-2.5 w-1/2 skeleton" />
      </div>
    </div>
  )
}
