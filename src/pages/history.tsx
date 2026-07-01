import { useEffect, useState } from 'react'
import { useStore } from '../lib/store'
import { getPlayback } from '../lib/api'
import type { PlaybackPos } from '../lib/types'
import { Clock, Clapperboard, Tv, Film, Gamepad2, Play } from 'lucide-react'

const typeIcons: Record<string, typeof Clapperboard> = {
  movie: Clapperboard, series: Tv, anime: Film, game: Gamepad2, hentai: Film,
}

function formatTime(secs: number): string {
  const h = Math.floor(secs / 3600)
  const m = Math.floor((secs % 3600) / 60)
  if (h > 0) return `${h}h ${m}m`
  return `${m}m`
}

function formatDate(ts: number): string {
  const d = new Date(ts * 1000)
  const now = new Date()
  const diff = now.getTime() - d.getTime()
  if (diff < 86400000) return 'Today'
  if (diff < 172800000) return 'Yesterday'
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

export function HistoryPage() {
  const { setPage, setDetailId, setDetailType } = useStore()
  const [history, setHistory] = useState<PlaybackPos[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getPlayback().then(p => { setHistory(p); setLoading(false) }).catch(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div className="flex-1 p-8">
        <div className="max-w-3xl mx-auto">
          <div className="h-8 w-48 skeleton mb-6" />
          <div className="space-y-3">
            {[1, 2, 3, 4, 5].map(i => (
              <div key={i} className="h-16 skeleton rounded-xl" />
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex-1 p-8">
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-9 h-9 rounded-xl bg-accent/10 flex items-center justify-center">
            <Clock size={18} className="text-accent" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-text">Watch History</h1>
            <p className="text-xs text-muted">{history.length} items</p>
          </div>
        </div>

        {history.length === 0 ? (
          <div className="glass rounded-xl p-8 text-center border border-border/50">
            <Clock size={28} className="text-muted/30 mx-auto mb-3" />
            <p className="text-sm text-dim">No watch history yet</p>
            <p className="text-xs text-muted/50 mt-1">Start watching something to see it here</p>
          </div>
        ) : (
          <div className="space-y-2">
            {history.map((item, i) => {
              const Icon = typeIcons[item.mtype] || Clock
              return (
                <div key={`${item.content_id}-${item.episode ?? ''}-${i}`}
                  className="glass rounded-xl border border-border/20 p-3 flex items-center gap-3 hover:bg-white/[0.03] transition-colors cursor-pointer"
                  onClick={() => { setDetailId(item.content_id); setDetailType(item.mtype); setPage('detail') }}>
                  <div className="w-10 h-10 rounded-xl bg-surface/60 flex items-center justify-center shrink-0">
                    <Icon size={16} className="text-muted/60" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-text truncate">{item.title}</p>
                    <div className="flex items-center gap-2 text-[10px] text-muted/50 mt-0.5">
                      <span className="capitalize">{item.mtype}</span>
                      {item.season != null && <span>· S{item.season}</span>}
                      {item.episode != null && <span>· Ep {item.episode}</span>}
                      <span>· {formatTime(item.position_secs)} / {formatTime(item.duration_secs)}</span>
                      <span>· {formatDate(item.updated_at)}</span>
                    </div>
                    <div className="w-full h-1 bg-white/[0.06] rounded-full overflow-hidden mt-1.5 max-w-[200px]">
                      <div className="h-full bg-accent/60 rounded-full transition-all duration-300"
                        style={{ width: `${item.duration_secs > 0 ? Math.min(100, (item.position_secs / item.duration_secs) * 100) : 0}%` }} />
                    </div>
                  </div>
                  <Play size={14} className="text-muted/40 shrink-0" />
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
