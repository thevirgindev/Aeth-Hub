import { useState, useEffect } from 'react'
import { getDownloads } from '../lib/api'
import { useStore } from '../lib/store'
import type { DlItem } from '../lib/types'
import { Download, Gamepad2, FolderOpen, Play, Trash2 } from 'lucide-react'

export function CollectionPage() {
  const { setPage, showToast } = useStore()
  const [items, setItems] = useState<DlItem[]>([])

  useEffect(() => {
    const fetch = () => getDownloads().then(setItems)
    fetch()
    const t = setInterval(fetch, 3000)
    return () => clearInterval(t)
  }, [])

  const games = items.filter(d => d.status === 'done')
  const totalSize = games.reduce((acc, g) => acc + (g.bytes_total || 0), 0)

  if (games.length === 0) {
    return (
      <div className="flex-1 p-6 animate-fade">
        <div className="flex items-center gap-3 mb-5">
          <div className="w-7 h-7 rounded-lg bg-accent/15 flex items-center justify-center">
            <FolderOpen size={14} className="text-accent" />
          </div>
          <p className="text-sm text-dim/80">Your downloaded games library — nothing here yet</p>
        </div>
        <div className="flex flex-col items-center justify-center text-muted py-32 gap-3">
          <div className="w-16 h-16 rounded-2xl bg-white/[0.04] flex items-center justify-center">
            <Gamepad2 size={32} className="text-muted/30" />
          </div>
          <p className="text-base text-dim font-medium">Your collection is empty</p>
          <p className="text-sm text-muted/60 max-w-xs text-center">Download some games to build your library — they'll appear here automatically</p>
          <button onClick={() => setPage('games')}
            className="mt-4 px-5 py-2 rounded-xl text-sm font-medium bg-accent text-white hover:brightness-110 transition-all cursor-pointer flex items-center gap-2">
            <Download size={14} /> Browse Games
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="flex-1 p-6 animate-fade">
      <div className="flex items-center gap-3 mb-5">
        <div className="w-7 h-7 rounded-lg bg-accent/15 flex items-center justify-center">
          <FolderOpen size={14} className="text-accent" />
        </div>
        <p className="text-sm text-dim/80">{games.length} game{games.length !== 1 ? 's' : ''} · {(totalSize / 1024 / 1024 / 1024).toFixed(1)} GB total</p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-5 gap-3 md:gap-4">
        {games.map(d => (
          <div key={d.id}
            className="group/card relative rounded-xl overflow-hidden bg-surface border border-white/[0.06] hover:border-accent/30 hover:shadow-[0_0_24px_rgba(124,92,255,0.18)] transition-all duration-300 cursor-pointer">
            <div className="aspect-[3/4] overflow-hidden bg-surface/50 flex items-center justify-center">
              <Gamepad2 size={36} className="text-muted/20" />
            </div>
            <div className="absolute bottom-0 left-0 right-0 p-2.5 bg-gradient-to-t from-deep/95 via-deep/80 to-transparent">
              <p className="text-sm font-bold text-text truncate leading-tight">{d.title}</p>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-[10px] text-success font-medium flex items-center gap-1">
                  <Download size={8} /> Installed
                </span>
                {d.bytes_total > 0 && (
                  <span className="text-[9px] text-muted font-mono">{(d.bytes_total / 1024 / 1024 / 1024).toFixed(1)} GB</span>
                )}
              </div>
            </div>
            <div className="absolute inset-0 bg-deep/80 backdrop-blur-sm opacity-0 group-hover/card:opacity-100 transition-opacity flex items-center justify-center gap-2 z-10">
              <button onClick={() => { showToast({ msg: 'Launching game — feature coming soon', type: 'info' }) }}
                className="w-10 h-10 rounded-full bg-accent text-white hover:brightness-110 transition-all flex items-center justify-center">
                <Play size={16} />
              </button>
              <button onClick={() => { showToast({ msg: 'Remove from collection?', type: 'info' }) }}
                className="w-10 h-10 rounded-full bg-white/10 text-dim hover:text-error hover:bg-error/20 transition-all flex items-center justify-center">
                <Trash2 size={14} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
