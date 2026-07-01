import { memo } from 'react'
import type { Hentai } from '../../lib/types'
import { Star, Info, Heart } from 'lucide-react'
import { CachedImage } from '../cached-image'
import { useContextMenu } from '../context-menu'
import { useStore } from '../../lib/store'

export const HentaiCard = memo(function HentaiCard({ hentai, onSelect }: { hentai: Hentai; onSelect: () => void }) {
  const ctx = useContextMenu()
  const { favs, setFavs, showToast } = useStore()
  const isFav = favs.includes(hentai.id)
  const onCtx = (e: React.MouseEvent) => ctx.show([
    { label: 'View Details', icon: Info, onClick: onSelect },
    { label: isFav ? 'Remove Favorite' : 'Favorite', icon: Heart, onClick: () => { setFavs(isFav ? favs.filter(f => f !== hentai.id) : [...favs, hentai.id]); showToast({ msg: isFav ? 'Removed from favorites' : 'Added to favorites', type: 'success' }) } },
  ], e)
  return (
    <div className="card-surface w-[175px] cursor-pointer group/card" onContextMenu={onCtx} onClick={onSelect}>
      <div className="relative poster-base w-full overflow-hidden rounded-b-none">
        <CachedImage src={hentai.poster} alt={hentai.title} title={hentai.title} className="w-full h-full" />
        {hentai.censored && (
          <div className="absolute top-2 left-2 bg-[rgba(124,92,255,0.2)] text-[10px] text-accent px-1.5 py-0.5 rounded-[3px] font-bold uppercase">CENSORED</div>
        )}
        <div className="absolute bottom-2 right-2 bg-[rgba(17,18,26,0.85)] backdrop-blur-[4px] rounded-[4px] px-1.5 py-0.5 text-[11px] font-bold text-text">
          {hentai.eps} eps
        </div>
        {hentai.tags?.length > 0 && (
          <div className="absolute bottom-2 left-2 flex gap-1 flex-wrap">
            {hentai.tags.map(t => (
              <span key={t} className="bg-[rgba(255,90,106,0.2)] text-[10px] text-error px-1.5 py-0.5 rounded-[3px] font-bold uppercase">{t}</span>
            ))}
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-deep/90 via-deep/40 to-transparent backdrop-blur-[2px] opacity-0 group-hover/card:opacity-100 transition-opacity flex flex-col justify-end p-3 z-10 rounded-b-none">
          <p className="text-sm font-bold text-text leading-tight">{hentai.title}</p>
          <p className="text-[11px] text-[#FFD700] mt-1 flex items-center gap-1">
            <Star size={10} fill="#FFD700" /> {hentai.rating.toFixed(1)} · {hentai.year}
          </p>
          <p className="text-[11px] text-dim mt-0.5 line-clamp-2">{hentai.genres.join(', ')}</p>
        </div>
      </div>
      <div className="p-2.5">
        <p className="text-sm font-semibold text-text line-clamp-2 leading-tight">{hentai.title}</p>
        <p className="text-[12px] text-muted mt-1 flex items-center gap-1">
          <Star size={10} className="text-[#FFD700]" fill="#FFD700" /> {hentai.rating.toFixed(1)} · {hentai.year}
        </p>
      </div>
    </div>
  )
})

export function HentaiCardSkeleton() {
  return (
    <div className="card-surface w-[175px]">
      <div className="poster-base w-full rounded-b-none skeleton" />
      <div className="p-2.5 space-y-1.5">
        <div className="h-3 w-3/4 skeleton" />
        <div className="h-2.5 w-1/2 skeleton" />
      </div>
    </div>
  )
}
