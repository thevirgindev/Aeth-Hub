import { useState, useEffect } from 'react'
import { getDownloads } from '../lib/api'
import { Badge } from '../components/ui/badge'
import { Button } from '../components/ui/button'
import type { DlItem } from '../lib/types'
import { Download, Pause, Play, Trash2 } from 'lucide-react'

const statusColors: Record<string, 'default' | 'success' | 'warning' | 'quality'> = {
  downloading: 'quality', paused: 'warning', done: 'success',
  failed: 'error' as any, queued: 'default', resolving: 'default',
}

const statusIcons: Record<string, typeof Download> = {
  downloading: Download, paused: Pause, done: Download, failed: Download, queued: Download, resolving: Download,
}

export function DownloadsPage() {
  const [items, setItems] = useState<DlItem[]>([])

  useEffect(() => {
    getDownloads().then(setItems)
    const t = setInterval(() => getDownloads().then(setItems), 2000)
    return () => clearInterval(t)
  }, [])

  return (
    <div className="flex-1 p-6 animate-fade">
      <p className="text-sm text-dim mb-4">{items.length} download{items.length !== 1 ? 's' : ''}</p>
      {items.length === 0 && (
        <div className="flex flex-col items-center justify-center h-64 text-muted">
          <Download size={36} className="mb-3 text-muted" />
          <p className="text-sm">No active downloads</p>
          <p className="text-[12px] mt-1">Stream something to see it here</p>
        </div>
      )}
      <div className="space-y-3">
        {items.map(item => {
          const StatIcon = statusIcons[item.status] || Download
          return (
            <div key={item.id} className="glass rounded-xl p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-3 min-w-0">
                  <StatIcon size={16} className="text-dim shrink-0" />
                  <span className="text-sm font-semibold text-text truncate">{item.title}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={statusColors[item.status] || 'default'}>{item.status}</Badge>
                  {item.status === 'downloading' && (
                    <Button variant="ghost" size="sm"><Pause size={14} /></Button>
                  )}
                  {item.status === 'paused' && (
                    <Button variant="ghost" size="sm"><Play size={14} /></Button>
                  )}
                  {(item.status === 'done' || item.status === 'failed') && (
                    <Button variant="ghost" size="sm"><Trash2 size={14} className="text-error" /></Button>
                  )}
                </div>
              </div>
              <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
                <div className={`h-full rounded-full transition-all duration-300 ${item.status === 'done' ? 'bg-success' : 'bg-accent'}`}
                  style={{ width: `${Math.min(item.progress, 100)}%` }} />
              </div>
              <div className="flex items-center justify-between mt-2 text-[12px] text-dim font-mono">
                <span>{item.speed}</span>
                <div className="flex items-center gap-3">
                  {item.bytes_total > 0 && (
                    <span>{(item.bytes_done / 1024 / 1024).toFixed(1)}MB / {(item.bytes_total / 1024 / 1024).toFixed(1)}MB</span>
                  )}
                  <span>{item.progress.toFixed(0)}% · ETA: {item.eta}</span>
                </div>
              </div>
              {item.status === 'done' && item.path && (
                <p className="text-[10px] text-muted mt-1 truncate">{item.path}</p>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
