import { useEffect, useRef, useState, lazy, Suspense } from 'react'
import { useStore } from './lib/store'
import { getSettings, getFavs, discordConnect, discordUpdate, discordDisconnect, saveSettings } from './lib/api'
import { Titlebar } from './components/titlebar'
import { Sidebar } from './components/sidebar'
import { Toast } from './components/toast'
import { SearchOverlay } from './pages/search-overlay'

import { ContextMenuProvider } from './components/context-menu'
import type { UserTheme } from './lib/types'
import { checkForUpdate } from './lib/update-check'
import { DownloadBar } from './components/download-bar'
import { Welcome } from './components/welcome'
import { SignupModal } from './components/signup-modal'
import { PanelRightOpen, X } from 'lucide-react'
import { open } from '@tauri-apps/plugin-shell'

const HomePage = lazy(() => import('./pages/home').then(m => ({ default: m.HomePage })))
const MoviesPage = lazy(() => import('./pages/movies').then(m => ({ default: m.MoviesPage })))
const TvShowsPage = lazy(() => import('./pages/tvshows').then(m => ({ default: m.TvShowsPage })))
const KdramasPage = lazy(() => import('./pages/kdramas').then(m => ({ default: m.KdramasPage })))
const AnimePage = lazy(() => import('./pages/anime').then(m => ({ default: m.AnimePage })))
const GamesPage = lazy(() => import('./pages/games').then(m => ({ default: m.GamesPage })))
const DetailPage = lazy(() => import('./pages/detail').then(m => ({ default: m.DetailPage })))
const EpisodePage = lazy(() => import('./pages/episode').then(m => ({ default: m.EpisodePage })))
const DownloadsPage = lazy(() => import('./pages/downloads').then(m => ({ default: m.DownloadsPage })))
const SettingsPage = lazy(() => import('./pages/settings').then(m => ({ default: m.SettingsPage })))
const MarketplacePage = lazy(() => import('./pages/marketplace').then(m => ({ default: m.MarketplacePage })))
const WatchTogetherPage = lazy(() => import('./pages/watchtogether').then(m => ({ default: m.WatchTogetherPage })))
const WatchlistPage = lazy(() => import('./pages/watchlist').then(m => ({ default: m.WatchlistPage })))
const CollectionPage = lazy(() => import('./pages/collection').then(m => ({ default: m.CollectionPage })))
const ProfilePage = lazy(() => import('./pages/profile').then(m => ({ default: m.ProfilePage })))
const HistoryPage = lazy(() => import('./pages/history').then(m => ({ default: m.HistoryPage })))

const pageEntries: [string, React.LazyExoticComponent<React.ComponentType>][] = [
  ['home', HomePage],
  ['movies', MoviesPage],
  ['tvshows', TvShowsPage],
  ['kdramas', KdramasPage],
  ['anime', AnimePage],
  ['games', GamesPage],
  ['detail', DetailPage],
  ['episode', EpisodePage],
  ['downloads', DownloadsPage],
  ['settings', SettingsPage],
  ['marketplace', MarketplacePage],
  ['watchtogether', WatchTogetherPage],
  ['watchlist', WatchlistPage],
  ['collection', CollectionPage],
  ['profile', ProfilePage],
  ['history', HistoryPage],
]

export default function App() {
  const { page, setPage, prevPage, setSettings, setFavs, settings, detailType, detailTitle, showToast, sidebarOpen, setSidebarOpen, updateInfo, setUpdateInfo, goBack } = useStore()

  useEffect(() => {
    document.documentElement.setAttribute('data-theme-preset', settings.theme_preset || 'default')
  }, [settings.theme_preset])

  useEffect(() => {
    const root = document.documentElement
    const customThemeRaw = localStorage.getItem('aeth-custom-theme')

    if (settings.theme_preset === 'custom' && customThemeRaw) {
      try {
        const theme: UserTheme = JSON.parse(customThemeRaw)
        root.style.setProperty('--color-deep', theme.colors.deep)
        root.style.setProperty('--color-base', theme.colors.base)
        root.style.setProperty('--color-surface', theme.colors.surface)
        root.style.setProperty('--color-elevated', theme.colors.elevated)
        root.style.setProperty('--color-text', theme.colors.text)
        root.style.setProperty('--color-dim', theme.colors.dim)
        root.style.setProperty('--color-muted', theme.colors.muted)
        root.style.setProperty('--color-accent', theme.colors.accent)
        root.style.setProperty('--color-border', theme.colors.border)
      } catch {}
    } else {
      ;['deep', 'base', 'surface', 'elevated', 'text', 'dim', 'muted', 'accent', 'border'].forEach(k => {
        root.style.removeProperty(`--color-${k}`)
      })
    }
  }, [settings.theme_preset])

  useEffect(() => {
    const handler = (e: MouseEvent) => { if (e.button === 2) e.preventDefault() }
    const ctxHandler = (e: MouseEvent) => e.preventDefault()
    document.addEventListener('mousedown', handler)
    document.addEventListener('contextmenu', ctxHandler)
    return () => { document.removeEventListener('mousedown', handler); document.removeEventListener('contextmenu', ctxHandler) }
  }, [])

  useEffect(() => {
    const jsPattern = /\b(function|=>|eval|prompt|fetch|document\.cookie)\b/
    const handler = (e: ClipboardEvent) => {
      const text = e.clipboardData?.getData('text')
      if (!text || !jsPattern.test(text)) return
      const target = e.target as HTMLElement
      const isInput = target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable
      if (!isInput) e.preventDefault()
      showToast({ msg: 'Blocked potentially malicious code execution', type: 'error' })
    }
    document.addEventListener('paste', handler)
    return () => document.removeEventListener('paste', handler)
  }, [showToast])
  const dConnected = useRef(false)
  const dAttempted = useRef(false)
  const dErrored = useRef(false)
  const toastRef = useRef(showToast)
  toastRef.current = showToast
  const [showWelcome, setShowWelcome] = useState(false)
  const [zoom, setZoom] = useState(1)
  const [showUpdateNotif, setShowUpdateNotif] = useState(false)
  const [dismissingUpdate, setDismissingUpdate] = useState(false)

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const activeEl = document.activeElement
      const isInput = activeEl && (
        activeEl.tagName === 'INPUT' ||
        activeEl.tagName === 'TEXTAREA' ||
        (activeEl as HTMLElement).isContentEditable
      )

      if ((e.ctrlKey || e.metaKey) && (e.key === '=' || e.key === '+' || e.key === '-')) {
        e.preventDefault()
        setZoom(z => {
          const step = e.key === '-' ? -0.1 : 0.1
          return Math.max(0.5, Math.min(2, z + step))
        })
      }
      if ((e.ctrlKey || e.metaKey) && e.key === '0') {
        e.preventDefault()
        setZoom(1)
      }

      if (e.key === 'Escape' && page !== 'home') {
        e.preventDefault()
        goBack()
        return
      }

      if (!isInput) {
        if ((e.ctrlKey || e.metaKey) && (e.key.toLowerCase() === 'b' || e.key.toLowerCase() === 's')) {
          e.preventDefault()
          setSidebarOpen(!sidebarOpen)
        }

        if (e.altKey && e.key >= '1' && e.key <= '9') {
          e.preventDefault()
          const pageShortcuts = [
            'home', 'movies', 'tvshows', 'kdramas', 'anime',
            'games', 'downloads', 'watchlist', 'settings'
          ] as const
          const targetPage = pageShortcuts[parseInt(e.key, 10) - 1]
          if (targetPage) {
            setPage(targetPage)
          }
        }
      }
    }
    const handleWheel = (e: WheelEvent) => {
      if (e.ctrlKey || e.metaKey) {
        e.preventDefault()
        setZoom(z => Math.max(0.5, Math.min(2, z - e.deltaY * 0.001)))
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    window.addEventListener('wheel', handleWheel, { passive: false })
    return () => { window.removeEventListener('keydown', handleKeyDown); window.removeEventListener('wheel', handleWheel) }
  }, [setPage, setSidebarOpen])

  useEffect(() => {
    getSettings().then(s => { setSettings(s); if (!s.onboarded) setShowWelcome(true) }).catch(() => {})
    getFavs().then(f => setFavs(f)).catch(() => {})
  }, [])

  const handleWelcomeDismiss = () => {
    setShowWelcome(false)
    const updated = { ...settings, onboarded: true }
    setSettings(updated)
    saveSettings(updated).catch(() => {})
  }

  useEffect(() => {
    (async () => {
      if (!settings.discord_client_id) {
        if (dConnected.current) {
          try { await discordDisconnect() } catch {}
          dConnected.current = false
        }
        return
      }
      if (!dConnected.current && !dAttempted.current) {
        dAttempted.current = true
        try {
          await discordConnect(settings.discord_client_id)
          dConnected.current = true
        } catch {
          if (!dErrored.current) {
            dErrored.current = true
            toastRef.current({ msg: 'Discord RPC failed — is Discord running?', type: 'error' })
          }
          return
        }
      }
      let state: string
      let details: string
      const typeLabels: Record<string, string> = {
        movie: 'Movie', series: 'TV Series', anime: 'Anime', game: 'Game',
      }
      if (page === 'detail' && detailTitle) {
        const isGame = detailType === 'game'
        state = isGame ? `Playing ${detailTitle}` : `Watching ${detailTitle}`
        details = typeLabels[detailType] || 'Content'
      } else {
        const labels: Record<string, [string, string]> = {
          home: ['Exploring Home', 'Aeth Hub'],
          movies: ['Exploring Movies', 'Aeth Hub'],
          tvshows: ['Exploring TV Shows', 'Aeth Hub'],
          kdramas: ['Exploring K-Dramas', 'Aeth Hub'],
          anime: ['Exploring Anime', 'Aeth Hub'],
          games: ['Exploring Games', 'Aeth Hub'],
          collection: ['Browsing Collection', 'Aeth Hub'],
          detail: ['Viewing Details', 'Aeth Hub'],
          downloads: ['Managing Downloads', 'Aeth Hub'],
          marketplace: ['Browsing Marketplace', 'Aeth Hub'],
          settings: ['In Settings', 'Aeth Hub'],
          watchtogether: ['Watch Together', 'Aeth Hub'],
          watchlist: ['Browsing Watchlist', 'Aeth Hub'],
          profile: ['Viewing Profile', 'Aeth Hub'],
          history: ['Viewing History', 'Aeth Hub'],
        }
        ;[state, details] = labels[page] || ['Exploring Aeth Hub', 'Aeth Hub']
      }
      try { await discordUpdate(state, details) } catch {}
    })()
  }, [page, settings.discord_client_id, detailType, detailTitle])

  useEffect(() => {
    dAttempted.current = false
  }, [settings.discord_client_id])

  useEffect(() => {
    return () => { discordDisconnect().catch(() => {}) }
  }, [])

  useEffect(() => {
    let cancelled = false
    const check = async () => {
      const result = await checkForUpdate()
      if (cancelled) return
      setUpdateInfo(result)
      if (result.available) setShowUpdateNotif(true)
    }
    check()
    return () => { cancelled = true }
  }, [setUpdateInfo])

  const handleDismissUpdate = () => {
    setDismissingUpdate(true)
    setTimeout(() => { setShowUpdateNotif(false); setDismissingUpdate(false) }, 200)
  }

  return (
    <div className="h-screen w-screen flex flex-col bg-deep text-text overflow-hidden relative">
      <div className="fixed inset-0 pointer-events-none bg-gradient-to-b from-[#0c0b11] via-deep to-[#1a173e] -z-10" />

      <Titlebar />
      <div className="absolute left-0 top-0 h-screen pt-[38px] z-10">
        <Sidebar />
      </div>
      <ContextMenuProvider>
        <div className="flex-1 flex min-h-0 overflow-hidden">
          {sidebarOpen && <div className="w-[240px] shrink-0 transition-all duration-[200ms]" />}
          {!sidebarOpen && (
            <div className="fixed left-[14px] top-[50%] -translate-y-1/2 z-[60]">
              <button onClick={() => setSidebarOpen(true)}
                className="w-10 h-10 rounded-xl bg-surface/70 backdrop-blur-xl border border-white/10 shadow-lg hover:bg-surface/90 hover:border-accent/30 hover:shadow-[0_0_20px_rgba(124,92,255,0.15)] transition-all duration-200 cursor-pointer flex items-center justify-center group"
                title="Open sidebar">
                <PanelRightOpen size={16} className="text-muted/60 group-hover:text-accent transition-colors" />
              </button>
            </div>
          )}
          <div className="flex-1 overflow-y-auto min-h-0 page-scroll">
            <div className="min-h-full" style={{ zoom: `${zoom * 100}%` }}>
              <Suspense fallback={<div className="flex items-center justify-center p-12"><div className="w-6 h-6 border-2 border-accent/30 border-t-accent rounded-full animate-spin" /></div>}>
                {pageEntries.map(([key, Comp]) => {
                  const isActive = page === key || (key === 'anime' && page === 'hentai')
                  const keepAlive = key === 'detail' || key === 'settings' || key === 'watchlist' || key === 'marketplace' || key === prevPage
                  if (!isActive && !keepAlive) return null
                  return (
                    <div key={key} className={isActive ? 'flex flex-col animate-fade' : 'hidden'}>
                      <Comp />
                    </div>
                  )
                })}
              </Suspense>
            </div>
          </div>
        </div>
      </ContextMenuProvider>
      <DownloadBar />
      <Toast />
      <SearchOverlay />
      {showWelcome && <Welcome onDismiss={handleWelcomeDismiss} />}
      {showUpdateNotif && updateInfo?.available && (
        <div className={`fixed bottom-4 right-4 z-[300] w-[300px] glass-modal rounded-xl border border-green-500/20 shadow-[0_8px_32px_rgba(0,0,0,0.6)] overflow-hidden ${dismissingUpdate ? 'animate-fade-out' : 'animate-slide-up'}`}>
          <div className="p-3">
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-8 h-8 rounded-lg bg-green-500/15 flex items-center justify-center shrink-0">
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-green-400">
                    <circle cx="12" cy="12" r="10"/>
                    <circle cx="12" cy="12" r="3"/>
                  </svg>
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-bold text-text">Update Available</p>
                  <p className="text-[10px] text-muted/50">{updateInfo.version}</p>
                </div>
              </div>
              <button onClick={handleDismissUpdate}
                className="w-5 h-5 rounded-md text-muted/50 hover:text-text hover:bg-white/10 transition-colors flex items-center justify-center cursor-pointer shrink-0">
                <X size={10} />
              </button>
            </div>
            <div className="mt-2.5 h-1 bg-white/10 rounded-full overflow-hidden">
              <div className="h-full bg-green-400 rounded-full w-0 animate-pulse" style={{ width: '35%' }} />
            </div>
            <div className="flex items-center justify-between mt-2">
              <span className="text-[9px] text-muted/40">Downloading update...</span>
              <button onClick={() => open(updateInfo.url)}
                className="text-[10px] font-semibold text-green-400 hover:text-green-300 transition-colors cursor-pointer">
                Restart
              </button>
            </div>
          </div>
        </div>
      )}
      <SignupModal />
    </div>
  )
}