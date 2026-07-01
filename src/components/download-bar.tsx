import { useState, useEffect } from 'react'
import { getDownloads } from '../lib/api'
import { useStore } from '../lib/store'
import { Download, X } from 'lucide-react'
import type { DlItem } from '../lib/types'

export function DownloadBar() {
  const { setPage } = useStore()
  const [items, setItems] = useState<DlItem[]>([])
  const [dismissed, setDismissed] = useState(false)

  useEffect(() => {
    const fetch = () => getDownloads().then(setItems).catch(() => {})
    fetch()
    const t = setInterval(fetch, 3000)
    return () => clearInterval(t)
  }, [])

  const active = items.filter(i => i.status === 'downloading' || i.status === 'paused' || i.status === 'queued' || i.status === 'resolving')
  if (active.length === 0 || dismissed) return null

  const totalProgress = active.reduce((sum, i) => sum + i.progress, 0) / active.length
  const totalSpeed = active.filter(i => i.status === 'downloading').reduce((sum, i) => sum + parseFloat(i.speed.replace(/[^0-9.]/g, '') || '0'), 0)
  const speedUnit = active.find(i => i.speed.includes('MB/s')) ? 'MB/s' : 'KB/s'

  return (
    <div className="fixed bottom-4 right-4 z-[100]">
      <div onClick={() => { setPage('downloads'); setDismissed(true) }}
        className="cursor-pointer bg-gradient-to-br from-surface via-elevated to-surface rounded-2xl border border-border/60 shadow-[0_8px_32px_rgba(0,0,0,0.5)] px-4 py-3 min-w-[240px] hover:border-accent/30 transition-all duration-200 group">
        <div className="flex items-center gap-3">
          <div className="relative">
            <Download size={16} className="text-accent" />
            <span className="absolute -top-1 -right-1 w-2 h-2 bg-accent rounded-full animate-pulse" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between gap-2">
              <p className="text-sm font-medium text-text truncate">{active.length} download{active.length > 1 ? 's' : ''}</p>
              <div className="flex items-center gap-1.5">
                <span className="text-[11px] text-muted font-mono">{totalProgress.toFixed(0)}%</span>
                {totalSpeed > 0 && <span className="text-[11px] text-muted/60 font-mono">{totalSpeed.toFixed(1)} {speedUnit}</span>}
              </div>
            </div>
            <div className="w-full h-1 bg-white/5 rounded-full mt-2 overflow-hidden">
              <div className="h-full bg-accent rounded-full transition-all duration-500" style={{ width: `${totalProgress}%` }} />
            </div>
          </div>
          <button onClick={e => { e.stopPropagation(); setDismissed(true) }}
            className="p-1 rounded-lg text-muted/40 hover:text-text hover:bg-white/10 transition-colors opacity-0 group-hover:opacity-100 cursor-pointer">
            <X size={14} />
          </button>
        </div>
      </div>
    </div>
  )
}
