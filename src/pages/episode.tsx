import { useState, useEffect } from 'react'
import { useStore } from '../lib/store'
import { searchAnime, getEpisodeStreams } from '../lib/api'
import { Player } from '../components/player'
import CommentSection from '../components/comment-section'
import { ArrowLeft, Play, Loader2, AlertCircle } from 'lucide-react'
import type { StrSrc } from '../lib/types'

export function EpisodePage() {
  const { episodeId, episodeTitle, episodeContentId, goBack, detailTitle } = useStore()
  const [streams, setStreams] = useState<StrSrc[]>([])
  const [searching, setSearching] = useState(true)
  const [playerOpen, setPlayerOpen] = useState(false)
  const [playerUrl, setPlayerUrl] = useState('')

  useEffect(() => {
    if (!episodeId) return
    setSearching(true)
    const load = async () => {
      try {
        if (episodeContentId && episodeContentId.includes('series-') || episodeContentId.startsWith('anilist-')) {
          const s = await getEpisodeStreams(episodeContentId.replace(/\D/g, ''), 1, episodeId)
          setStreams(s)
        } else {
          const q = `${episodeTitle || detailTitle || ''} Episode ${episodeId}`
          const r = await searchAnime(q)
          setStreams(r.filter(s => s.name?.trim().length >= 3))
        }
      } catch { setStreams([]) }
      setSearching(false)
    }
    load()
  }, [episodeId, episodeContentId, episodeTitle, detailTitle])

  const openStream = (url: string) => {
    setPlayerUrl(url); setPlayerOpen(true)
  }

  return (
    <div className="flex-1 animate-fade">
      <div className="px-6 pt-4 pb-2 flex items-center gap-3">
        <button onClick={() => goBack()}
          className="glass glass-hover rounded-xl px-3 py-2 text-sm text-dim cursor-pointer flex items-center gap-1.5">
          <ArrowLeft size={16} /> Back
        </button>
        <h1 className="text-lg font-bold text-text truncate">
          {episodeTitle || detailTitle} — Episode {episodeId}
        </h1>
      </div>

      <div className="px-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          {searching ? (
            <div className="glass rounded-xl p-10 text-center border border-border/50">
              <Loader2 size={24} className="text-accent animate-spin mx-auto mb-3" />
              <p className="text-sm text-dim">Searching for streams...</p>
            </div>
          ) : streams.length === 0 ? (
            <div className="glass rounded-xl p-10 text-center border border-border/50">
              <AlertCircle size={24} className="text-muted/30 mx-auto mb-3" />
              <p className="text-sm text-dim">No streams available for this episode</p>
            </div>
          ) : (
            <>
              <div className="glass rounded-xl overflow-hidden border border-border/50">
                {streams.map((s, i) => (
                  <div key={i} onClick={() => openStream(s.url)}
                    className="flex items-center justify-between p-4 hover:bg-white/5 transition-colors cursor-pointer border-b border-border/20 last:border-0">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-8 h-8 rounded-md bg-accent/10 flex items-center justify-center shrink-0">
                        <Play size={14} className="text-accent" />
                      </div>
                      <div>
                        <p className="text-sm text-text truncate">{s.name}</p>
                        <p className="text-xs text-muted/50">{s.quality} {s.size ? `• ${s.size}` : ''} {s.seeders ? `• ${s.seeders} seeders` : ''}</p>
                      </div>
                    </div>
                    <span className="text-xs text-accent font-medium">Play</span>
                  </div>
                ))}
              </div>
              <div className="glass rounded-xl border border-border/50 p-4">
                <CommentSection contentId={episodeContentId || `ep-${episodeId}`} episode={episodeId ?? undefined} />
              </div>
            </>
          )}
        </div>

        <div className="space-y-4">
          <div className="glass rounded-xl border border-border/50 p-4">
            <h3 className="text-sm font-semibold text-text mb-3">Episode Info</h3>
            <p className="text-sm text-dim">Episode {episodeId}</p>
            <p className="text-xs text-muted/50 mt-1">
              {streams.length > 0 ? `${streams.length} stream(s) available` : 'No streams'}
            </p>
          </div>
        </div>
      </div>

      {playerOpen && <Player url={playerUrl} title={`${episodeTitle || detailTitle} - Ep ${episodeId}`} onClose={() => setPlayerOpen(false)} />}
    </div>
  )
}
