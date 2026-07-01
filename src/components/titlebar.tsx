import { useEffect, useState } from 'react'
import { getCurrentWindow } from '@tauri-apps/api/window'
import { Minus, Square, X } from 'lucide-react'
import { useStore } from '../lib/store'
import { getPcUsername } from '../lib/api'

const appWindow = getCurrentWindow()


const titles: Record<string, string> = {
  home: 'Home', movies: 'Movies', tvshows: 'TV Shows', kdramas: 'K-Dramas',
  anime: 'Anime', games: 'Games', collection: 'Collection',
  detail: 'Details', downloads: 'Downloads', settings: 'Settings', marketplace: 'Marketplace',
  watchtogether: 'Watch Together', watchlist: 'Watchlist', profile: 'Profile', history: 'History',
}

export function Titlebar() {
  const { page, updateInfo, user } = useStore()
  const [pcUser, setPcUser] = useState('')
  const [maximized, setMaximized] = useState(false)

  useEffect(() => {
    getPcUsername().then(setPcUser).catch(() => setPcUser('User'))
  }, [])

  useEffect(() => {
    const unlisten = appWindow.onResized(() => {
      appWindow.isMaximized().then(setMaximized)
    })
    appWindow.isMaximized().then(setMaximized)
    return () => { unlisten.then(fn => fn()) }
  }, [])

  const pageTitle = titles[page] || 'Home'
  const displayTitle = page === 'home'
    ? (user ? `Welcome back, ${user.username}!` : pcUser ? `Welcome back, ${pcUser}!` : 'Welcome back!')
    : `Aeth Hub | ${pageTitle}`

  return (
    <div className="h-[38px] flex items-center bg-deep select-none shrink-0 border-b border-border relative">
      <div className="flex items-center gap-2 pl-3">
        <img src="/logos/aeth-withnobg_black.png" alt="Aeth" className="h-4 object-contain brightness-[3]" />
      </div>
      <div data-tauri-drag-region className="flex-1 h-full flex items-center justify-center gap-2">
        <p className="text-[12px] text-muted/60 font-semibold tracking-[0.04em]">{displayTitle}</p>
        {updateInfo?.available && (
          <div className="w-[6px] h-[6px] rounded-full bg-amber-400 animate-pulse shadow-[0_0_6px_rgba(251,191,36,0.5)]" />
        )}
      </div>
      <div className="flex items-center pr-1.5">
        <button onClick={() => appWindow.minimize()}
          className="w-[46px] h-[32px] flex items-center justify-center text-dim/40 hover:text-text transition-colors cursor-pointer">
          <Minus size={14} />
        </button>
        <button onClick={() => appWindow.toggleMaximize()}
          className="w-[46px] h-[32px] flex items-center justify-center text-dim/40 hover:text-text transition-colors cursor-pointer">
          {maximized ? (
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="2.5" y="0.5" width="9" height="9" rx="1" />
              <rect x="0.5" y="2.5" width="9" height="9" rx="1" fill="var(--color-deep)" />
            </svg>
          ) : <Square size={12} />}
        </button>
        <button onClick={() => appWindow.close()}
          className="w-[46px] h-[32px] flex items-center justify-center text-dim/40 hover:text-white hover:bg-error/80 transition-colors cursor-pointer">
          <X size={14} />
        </button>
      </div>
      <div className="absolute bottom-0 left-0 right-0 h-px pointer-events-none"
        style={{
          background: `linear-gradient(to right, #7C5CFF50 0%, #7C5CFF25 120px, transparent 60%)`,
        }} />
    </div>
  )
}
