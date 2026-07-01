import { memo } from 'react'
import { Badge } from '../ui/badge'
import { Star, Info, Heart } from 'lucide-react'
import { CachedImage } from '../cached-image'
import { useContextMenu } from '../context-menu'
import { useStore } from '../../lib/store'

export const GameCard = memo(function GameCard({ game, onSelect }: { game: { id: string; title: string; icon: string; genre: string; repacker: string; size: string; rating: number; tags?: string[] }; onSelect: () => void }) {
  const ctx = useContextMenu()
  const { favs, setFavs, showToast } = useStore()
  const isFav = favs.includes(game.id)
  const onCtx = (e: React.MouseEvent) => ctx.show([
    { label: 'View Details', icon: Info, onClick: onSelect },
    { label: isFav ? 'Remove Favorite' : 'Favorite', icon: Heart, onClick: () => { setFavs(isFav ? favs.filter(f => f !== game.id) : [...favs, game.id]); showToast({ msg: isFav ? 'Removed from favorites' : 'Added to favorites', type: 'success' }) } },
  ], e)
  return (
    <div className="card-surface w-[180px] cursor-pointer group/card" onContextMenu={onCtx} onClick={onSelect}>
      <div className="relative game-card-base w-full overflow-hidden rounded-b-none">
        <CachedImage src={game.icon} alt={game.title} title={game.title} className="w-full h-full" />
        <div className="absolute top-2 right-2 flex items-center gap-1">
          {game.rating > 0 && (
            <div className="bg-[rgba(17,18,26,0.85)] backdrop-blur-[4px] rounded-[4px] px-1.5 py-0.5 text-[11px] font-bold text-[#FFD700] flex items-center gap-0.5">
              <Star size={10} fill="#FFD700" /> {game.rating.toFixed(1)}
            </div>
          )}
          <Badge variant="accent">{game.repacker}</Badge>
        </div>
        {game.tags && game.tags.length > 0 && (
          <div className="absolute bottom-2 left-2 flex gap-1 flex-wrap">
            {game.tags!.map(t => (
              <span key={t} className="bg-[rgba(255,184,77,0.2)] text-[10px] text-warning px-1.5 py-0.5 rounded-[3px] font-bold uppercase">{t}</span>
            ))}
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-deep/90 via-deep/40 to-transparent backdrop-blur-[2px] opacity-0 group-hover/card:opacity-100 transition-opacity flex flex-col justify-end p-3 z-10 rounded-b-none">
          <p className="text-sm font-bold text-text leading-tight">{game.title}</p>
          <p className="text-[11px] text-warning mt-1">{game.genre}</p>
          <p className="text-[11px] text-dim mt-0.5">{game.repacker} · <span className="font-mono">{game.size}</span></p>
          <p className="text-[11px] text-[#FFD700] mt-0.5 flex items-center gap-1">
            <Star size={10} fill="#FFD700" /> {game.rating.toFixed(1)}
          </p>
        </div>
      </div>
      <div className="p-2.5">
        <p className="text-sm font-semibold text-text truncate">{game.title}</p>
        <p className="text-[12px] text-muted mt-0.5">{game.genre} · <span className="font-mono text-[11px]">{game.size}</span></p>
      </div>
    </div>
  )
})

export function GameCardSkeleton() {
  return (
    <div className="card-surface w-[180px]">
      <div className="game-card-base w-full rounded-b-none skeleton" />
      <div className="p-2.5 space-y-1.5">
        <div className="h-3 w-3/4 skeleton" />
        <div className="h-2.5 w-1/2 skeleton" />
      </div>
    </div>
  )
}
