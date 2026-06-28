import type { Game } from '../../lib/types'
import { Badge } from '../ui/badge'

export function GameCard({ game, onSelect }: { game: Game; onSelect: () => void }) {
  return (
    <div className="card-surface w-[180px] cursor-pointer group" onClick={onSelect}>
      <div className="relative game-card-base w-full overflow-hidden rounded-b-none">
        <img src={game.icon} alt={game.title} className="w-full h-full object-cover"
          loading="lazy" onError={e => { (e.target as HTMLImageElement).src = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 267"><rect fill="%23111521" width="200" height="267"/><text fill="%23444" font-size="14" x="50%" y="50%" text-anchor="middle" dy=".3em">No Art</text></svg>' }} />
        <div className="absolute top-2 right-2">
          <Badge variant="accent">{game.repacker}</Badge>
        </div>
        {game.tags?.length > 0 && (
          <div className="absolute bottom-2 left-2 flex gap-1 flex-wrap">
            {game.tags.map(t => (
              <span key={t} className="bg-[rgba(255,184,77,0.2)] text-[10px] text-warning px-1.5 py-0.5 rounded-[3px] font-bold uppercase">{t}</span>
            ))}
          </div>
        )}
      </div>
      <div className="p-2.5">
        <p className="text-sm font-semibold text-text truncate">{game.title}</p>
        <p className="text-[12px] text-muted mt-0.5">{game.genre} · <span className="font-mono text-[11px]">{game.size}</span></p>
      </div>
    </div>
  )
}

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
