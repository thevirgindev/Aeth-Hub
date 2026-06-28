import type { Movie } from '../../lib/types'
import { Star } from 'lucide-react'

export function MoviePoster({ movie, onSelect }: { movie: Movie; onSelect: () => void }) {
  return (
    <div className="card-surface w-[160px] cursor-pointer group" onClick={onSelect}>
      <div className="relative poster-base w-full overflow-hidden rounded-b-none">
        <img src={movie.poster} alt={movie.title} className="w-full h-full object-cover"
          loading="lazy" onError={e => { (e.target as HTMLImageElement).src = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 300"><rect fill="%23111521" width="200" height="300"/><text fill="%23444" font-size="14" x="50%" y="50%" text-anchor="middle" dy=".3em">No Poster</text></svg>' }} />
        <div className="absolute top-2 right-2 bg-[rgba(17,18,26,0.85)] backdrop-blur-[4px] rounded-[4px] px-1.5 py-0.5 text-[11px] font-bold text-[#FFD700] flex items-center gap-0.5">
          <Star size={10} fill="#FFD700" /> {movie.rating.toFixed(1)}
        </div>
        {movie.tags?.length > 0 && (
          <div className="absolute bottom-2 left-2 flex gap-1 flex-wrap">
            {movie.tags.map(t => (
              <span key={t} className="bg-[rgba(124,92,255,0.2)] text-[10px] text-accent px-1.5 py-0.5 rounded-[3px] font-bold uppercase">{t}</span>
            ))}
          </div>
        )}
      </div>
      <div className="p-2.5">
        <p className="text-sm font-semibold text-text truncate">{movie.title}</p>
        <p className="text-[12px] text-muted mt-0.5">{movie.year} · {movie.runtime}m</p>
      </div>
    </div>
  )
}

export function MoviePosterSkeleton() {
  return (
    <div className="card-surface w-[160px]">
      <div className="poster-base w-full rounded-b-none skeleton" />
      <div className="p-2.5 space-y-1.5">
        <div className="h-3 w-3/4 skeleton" />
        <div className="h-2.5 w-1/2 skeleton" />
      </div>
    </div>
  )
}
