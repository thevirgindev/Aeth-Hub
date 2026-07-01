import { useState, useRef, useEffect } from 'react'
import { X, Play, Pause, Maximize, Minimize, Volume2, VolumeX, Loader2 } from 'lucide-react'

interface PlayerProps {
  url: string
  title: string
  poster?: string
  onClose: () => void
}

export function Player({ url, title, poster, onClose }: PlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const controlsRef = useRef<HTMLDivElement>(null)
  const [playing, setPlaying] = useState(true)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [volume, setVolume] = useState(1)
  const [muted, setMuted] = useState(false)
  const [fullscreen, setFullscreen] = useState(false)
  const [showControls, setShowControls] = useState(true)
  const [playbackRate, setPlaybackRate] = useState(1.0)
  const [torrentStatus, setTorrentStatus] = useState<string | null>(null)
  const [torrentError, setTorrentError] = useState<string | null>(null)
  const hideTimerRef = useRef<number | null>(null)
  const rateRef = useRef(1.0)
  const isMagnet = url.startsWith('magnet:')

  rateRef.current = playbackRate

  const changePlaybackRate = (rate: number) => {
    const r = Math.max(0.5, Math.min(2.0, rate))
    setPlaybackRate(r)
    if (videoRef.current) videoRef.current.playbackRate = r
  }

  useEffect(() => {
    if (!isMagnet) return
    let client: any
    let cancelled = false
    setTorrentStatus('Connecting to peers...')
    const init = async () => {
      try {
        const WebTorrent = (await import('webtorrent')).default
        client = new WebTorrent()
        client.add(url, (torrent: any) => {
          if (cancelled) { client.destroy(); return }
          setTorrentStatus(`Downloading: ${(torrent.progress * 100).toFixed(0)}%`)
          const file = torrent.files.find((f: any) =>
            f.name.endsWith('.mp4') || f.name.endsWith('.mkv') || f.name.endsWith('.avi') || f.name.endsWith('.webm')
          )
          if (file && videoRef.current) {
            setTorrentStatus(null)
            file.renderTo(videoRef.current, { autoplay: true })
          } else {
            setTorrentStatus('No playable video file found')
          }
        })
        client.on('error', (err: Error) => {
          setTorrentError(err.message)
        })
      } catch (e: any) {
        setTorrentError(e?.message || 'Failed to load torrent engine')
      }
    }
    init()
    return () => { cancelled = true; client?.destroy() }
  }, [url, isMagnet])

  useEffect(() => {
    if (isMagnet) return
    const v = videoRef.current
    if (!v) return
    const onTime = () => { setCurrentTime(v.currentTime) }
    const onMeta = () => {
      setDuration(v.duration)
      v.playbackRate = rateRef.current
      v.play()
    }
    const onKey = (e: KeyboardEvent) => {
      if (e.key === ' ' || e.key === 'k') { e.preventDefault(); togglePlay() }
      if (e.key === 'f') toggleFullscreen()
      if (e.key === 'Escape') { if (fullscreen) document.exitFullscreen(); else onClose() }
      if (e.key === 'ArrowRight' || e.key === 'l') v.currentTime = Math.min(v.currentTime + 10, v.duration)
      if (e.key === 'ArrowLeft' || e.key === 'j') v.currentTime = Math.max(v.currentTime - 10, 0)
      if (e.key === 'ArrowUp') { e.preventDefault(); setVolume(prev => { const n = Math.min(prev + 0.1, 1); if (videoRef.current) videoRef.current.volume = n; return n }) }
      if (e.key === 'ArrowDown') { e.preventDefault(); setVolume(prev => { const n = Math.max(prev - 0.1, 0); if (videoRef.current) videoRef.current.volume = n; return n }) }
      if (e.key === 'm') toggleMute()
      if (e.key >= '0' && e.key <= '9') {
        const pct = parseInt(e.key, 10) / 10
        v.currentTime = v.duration * pct
      }
      if (e.key === '<') {
        const rates = [0.5, 1.0, 1.25, 1.5, 2.0]
        const idx = rates.indexOf(rateRef.current)
        if (idx > 0) changePlaybackRate(rates[idx - 1])
      }
      if (e.key === '>') {
        const rates = [0.5, 1.0, 1.25, 1.5, 2.0]
        const idx = rates.indexOf(rateRef.current)
        if (idx !== -1 && idx < rates.length - 1) changePlaybackRate(rates[idx + 1])
      }
    }
    v.addEventListener('timeupdate', onTime)
    v.addEventListener('loadedmetadata', onMeta)
    window.addEventListener('keydown', onKey)
    return () => {
      v.removeEventListener('timeupdate', onTime)
      v.removeEventListener('loadedmetadata', onMeta)
      window.removeEventListener('keydown', onKey)
    }
  }, [])

  useEffect(() => {
    const onFull = () => setFullscreen(!!document.fullscreenElement)
    document.addEventListener('fullscreenchange', onFull)
    return () => document.removeEventListener('fullscreenchange', onFull)
  }, [])

  const togglePlay = () => {
    const v = videoRef.current
    if (!v) return
    if (v.paused) { v.play(); setPlaying(true) } else { v.pause(); setPlaying(false) }
  }

  const toggleMute = () => {
    const v = videoRef.current
    if (!v) return
    v.muted = !v.muted; setMuted(v.muted)
  }

  const toggleFullscreen = async () => {
    const el = videoRef.current?.parentElement
    if (!el) return
    if (!document.fullscreenElement) { await el.requestFullscreen() } else { await document.exitFullscreen() }
  }

  const handleVolume = (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = parseFloat(e.target.value); setVolume(v)
    if (videoRef.current) { videoRef.current.volume = v; videoRef.current.muted = false; setMuted(false) }
  }

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const t = parseFloat(e.target.value)
    if (videoRef.current) { videoRef.current.currentTime = t; setCurrentTime(t) }
  }

  const showControlsTemp = () => {
    setShowControls(true)
    if (hideTimerRef.current) clearTimeout(hideTimerRef.current)
    hideTimerRef.current = window.setTimeout(() => { if (playing) setShowControls(false) }, 3000)
  }

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60); const sec = Math.floor(s % 60)
    return `${m}:${sec.toString().padStart(2, '0')}`
  }

  return (
    <div className="fixed inset-0 z-[100] bg-black flex items-center justify-center"
      onMouseMove={showControlsTemp} onMouseDown={showControlsTemp}>
      {poster && (
        <div className="absolute inset-0 opacity-30 bg-cover bg-center blur-xl"
          style={{ backgroundImage: `url(${poster})` }} />
      )}
      <div className="relative w-full h-full flex items-center justify-center">
        {torrentStatus && (
          <div className="absolute inset-0 flex flex-col items-center justify-center z-10 gap-3">
            <Loader2 size={32} className="text-accent animate-spin" />
            <p className="text-white/60 text-sm">{torrentStatus}</p>
          </div>
        )}
        {torrentError && (
          <div className="absolute inset-0 flex flex-col items-center justify-center z-10 gap-3">
            <p className="text-error text-sm">Stream failed: {torrentError}</p>
            <button onClick={onClose}
              className="glass glass-hover rounded-xl px-4 py-2 text-sm text-text cursor-pointer">
              Close
            </button>
          </div>
        )}
        <video ref={videoRef} src={isMagnet ? undefined : url}
          className={`max-w-full max-h-full w-auto h-auto ${torrentStatus ? 'opacity-0' : 'opacity-100'}`}
          onClick={togglePlay}
          crossOrigin="anonymous" />
        <div ref={controlsRef}
          className={`absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent px-4 pb-3 pt-12 transition-opacity duration-300 ${showControls ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
          <div className="max-w-4xl mx-auto">
            <input type="range" min={0} max={duration || 0} value={currentTime} onChange={handleSeek}
              className="w-full h-1 accent-accent cursor-pointer mb-3 player-range" />
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <button onClick={togglePlay} className="text-white hover:text-accent cursor-pointer transition-colors">
                  {playing ? <Pause size={20} /> : <Play size={20} />}
                </button>
                <span className="text-white/80 text-xs font-mono">{formatTime(currentTime)} / {formatTime(duration)}</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1.5">
                  <button onClick={toggleMute} className="text-white/80 hover:text-accent cursor-pointer transition-colors">
                    {muted || volume === 0 ? <VolumeX size={16} /> : <Volume2 size={16} />}
                  </button>
                  <input type="range" min={0} max={1} step={0.05} value={muted ? 0 : volume} onChange={handleVolume}
                    className="w-16 h-1 accent-accent cursor-pointer player-range" />
                </div>
                <div className="relative group/speed flex items-center">
                  <button className="text-white/80 hover:text-accent text-[11px] font-bold px-2.5 py-1 rounded bg-white/5 hover:bg-white/10 transition-colors cursor-pointer min-w-[44px]">
                    {playbackRate}x
                  </button>
                  <div className="absolute bottom-full right-0 mb-1 bg-black/90 border border-white/10 rounded-lg shadow-lg opacity-0 invisible group-hover/speed:opacity-100 group-hover/speed:visible transition-all duration-150 py-1 flex flex-col min-w-[64px] z-50 backdrop-blur-md">
                    {[0.5, 1.0, 1.25, 1.5, 2.0].map(r => (
                      <button key={r} onClick={() => changePlaybackRate(r)}
                        className={`px-2.5 py-1 text-[11px] hover:bg-accent/20 text-left font-medium transition-colors cursor-pointer w-full ${
                          playbackRate === r ? 'text-accent' : 'text-white/80 hover:text-white'
                        }`}>
                        {r}x
                      </button>
                    ))}
                  </div>
                </div>
                <button onClick={toggleFullscreen} className="text-white/80 hover:text-accent cursor-pointer transition-colors">
                  {fullscreen ? <Minimize size={16} /> : <Maximize size={16} />}
                </button>
              </div>
            </div>
          </div>
          <div className="absolute top-3 right-3">
            <button onClick={onClose} className="text-white/60 hover:text-white cursor-pointer transition-colors p-1">
              <X size={20} />
            </button>
          </div>
          <div className="absolute top-3 left-4">
            <span className="text-white/60 text-sm truncate max-w-[300px] block">{title}</span>
          </div>
        </div>
      </div>
    </div>
  )
}