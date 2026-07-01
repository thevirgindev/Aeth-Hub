import { useState, useEffect, type ReactNode } from 'react'
import { Button } from './ui/button'
import { Play, Info } from 'lucide-react'

interface HeroItem {
  id: string; title: string; backdrop: string; overview: string
  year: number; rating: number; genres: string[]
}

interface Props {
  items: HeroItem[]
  onPlay: (id: string) => void
  onDetail: (id: string) => void
  renderMeta?: (item: HeroItem) => ReactNode
}

export function HeroBanner({ items, onPlay, onDetail, renderMeta }: Props) {
  const [idx, setIdx] = useState(0)
  const item = items[idx]

  useEffect(() => {
    if (items.length < 2) return
    const t = setInterval(() => setIdx(i => (i + 1) % items.length), 7000)
    return () => clearInterval(t)
  }, [items.length])

  if (!item) return <div className="w-full h-[55vh] min-h-[420px] max-h-[600px] skeleton-pulse" />

  return (
    <div className="relative w-full h-[55vh] min-h-[420px] max-h-[600px] overflow-hidden">
      {items.map((it, i) => (
        it.backdrop ? (
          <div
            key={it.id}
            className={`absolute inset-0 w-full h-full transition-opacity duration-[600ms] ease-in-out ${i === idx ? 'opacity-100' : 'opacity-0'}`}>
            <img
              src={it.backdrop}
              alt=""
              className="w-full h-full object-cover scale-110 blur-sm brightness-50"
              onError={e => { (e.target as HTMLImageElement).style.display = 'none' }}
            />
          </div>
        ) : (
          <div key={it.id}
            className={`absolute inset-0 w-full h-full transition-opacity duration-[600ms] ease-in-out ${i === idx ? 'opacity-100' : 'opacity-0'} bg-gradient-to-br from-accent/20 via-deep to-[#1a173e]`} />
        )
      ))}
      <div className="absolute inset-0 bg-gradient-to-t from-deep via-deep/60 to-transparent" />
      <div className="absolute inset-0 bg-gradient-to-r from-deep via-deep/40 to-transparent" />
      <div className="absolute bottom-0 left-0 right-0 p-8 md:p-10">
        <div className="max-w-[600px] animate-slide-up" key={item.id}>
          <h2 className="text-[32px] md:text-[38px] font-extrabold text-text tracking-tight leading-tight">{item.title}</h2>
          <div className="flex items-center gap-3 mt-2 text-sm text-dim">
            <span className="text-[#FFD700]">★ {item.rating.toFixed(1)}</span>
            <span>{item.year}</span>
            {item.genres.slice(0, 3).map(g => (
              <span key={g} className="bg-white/10 px-2 py-0.5 rounded text-[11px]">{g}</span>
            ))}
          </div>
          <p className="mt-2 text-sm text-dim/80 line-clamp-2 max-w-[550px]">{item.overview}</p>
          {renderMeta?.(item)}
          <div className="flex gap-3 mt-4">
            <Button variant="primary" size="lg" onClick={() => onPlay(item.id)}>
              <Play size={16} /> Play Now
            </Button>
            <Button variant="outline" size="lg" onClick={() => onDetail(item.id)}>
              <Info size={16} /> Details
            </Button>
          </div>
        </div>
      </div>
      <div className="absolute bottom-4 right-8 flex gap-1.5">
        {items.map((_, i) => (
          <button key={i} onClick={() => setIdx(i)}
            className={`w-2 h-2 rounded-full transition-all cursor-pointer ${i === idx ? 'bg-accent w-6' : 'bg-white/30 hover:bg-white/50'}`} />
        ))}
      </div>
    </div>
  )
}
