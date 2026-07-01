import { createContext, useContext, useState, type ReactNode } from 'react'
import type { Page, StrSrc, AppSettings, User, UpdateInfo } from './types'

interface Store {
  page: Page; setPage: (p: Page) => void
  prevPage: Page; setPrevPage: (p: Page) => void
  goBack: () => void
  detailId: string | null; setDetailId: (id: string | null) => void
  detailType: string; setDetailType: (t: string) => void
  detailTitle: string; setDetailTitle: (t: string) => void
  searchOpen: boolean; setSearchOpen: (v: boolean) => void
  searchResults: StrSrc[]; setSearchResults: (r: StrSrc[]) => void
  searchQuery: string; setSearchQuery: (q: string) => void
  toast: Toast | null; showToast: (t: Omit<Toast, 'id'>) => void; clearToast: () => void
  favs: string[]; setFavs: (f: string[]) => void
  settings: AppSettings; setSettings: (s: AppSettings) => void
  sidebarOpen: boolean; setSidebarOpen: (v: boolean) => void
  dockOpen: boolean; setDockOpen: (v: boolean) => void
  user: User | null; setUser: (u: User | null) => void
  showSignup: boolean; setShowSignup: (v: boolean) => void
  updateInfo: UpdateInfo | null; setUpdateInfo: (i: UpdateInfo | null) => void
}

export interface Toast { id: number; msg: string; type: 'info' | 'success' | 'error' }

const Ctx = createContext<Store>(null!)

let toastId = 0

export function StoreProvider({ children }: { children: ReactNode }) {
  const [page, setPage] = useState<Page>('home')
  const [prevPage, setPrevPage] = useState<Page>('home')
  const [pageHistory, setPageHistory] = useState<Page[]>([])
  const [detailId, setDetailId] = useState<string | null>(null)
  const [detailType, setDetailType] = useState('movie')
  const [detailTitle, setDetailTitle] = useState('')
  const [searchOpen, setSearchOpen] = useState(false)
  const [searchResults, setSearchResults] = useState<StrSrc[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [toast, setToast] = useState<Toast | null>(null)
  const [favs, setFavs] = useState<string[]>([])
  const [settings, setSettings] = useState<AppSettings>({
    use_custom_player: false, download_path: '',
    scrapers_enabled: ['1337x', 'TPB', 'YTS', 'EZTV', 'Nyaa', 'Sukebei', 'AniDex', 'FitGirl', 'DODI', 'SteamRIP', 'GOG', 'Online-Fix', 'OvaGames', 'XGamesZone'], accent_color: '#7C5CFF',
    show_hentai: false, discord_client_id: '1520908611725820085',
    onboarded: false, theme_mode: 'dark', theme_preset: 'default',
  })
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [dockOpen, setDockOpen] = useState(false)
  const [user, setUser] = useState<User | null>(null)
  const [showSignup, _setShowSignup] = useState(false)
  const setShowSignup = () => {}
  const [updateInfo, setUpdateInfo] = useState<UpdateInfo | null>(null)

  const allowedPages: Page[] = ['home', 'anime', 'detail', 'downloads', 'settings', 'history']

  const handleSetPage = (p: Page) => {
    if (!allowedPages.includes(p)) return
    if (page !== p) {
      setPageHistory(prev => [...prev, page])
      if (page !== 'detail') setPrevPage(page)
      setPage(p)
    }
  }

  const goBack = () => {
    if (pageHistory.length > 0) {
      const prev = pageHistory[pageHistory.length - 1]
      setPageHistory(prev => prev.slice(0, -1))
      setPage(prev)
    }
  }

  const showToast = (t: Omit<Toast, 'id'>) => {
    const id = ++toastId
    setToast({ ...t, id })
    setTimeout(() => setToast(null), 4000)
  }

  const clearToast = () => setToast(null)

  const handleSetSettings = (s: AppSettings) => {
    setSettings({ ...s, theme_mode: 'dark' })
  }

  return (
    <Ctx.Provider value={{
      page, setPage: handleSetPage, prevPage, setPrevPage, goBack,
      detailId, setDetailId, detailType, setDetailType, detailTitle, setDetailTitle,
      searchOpen, setSearchOpen, searchResults, setSearchResults,
      searchQuery, setSearchQuery, toast, showToast, clearToast, favs, setFavs,
      settings, setSettings: handleSetSettings, sidebarOpen, setSidebarOpen,
      dockOpen, setDockOpen,
      user, setUser, showSignup, setShowSignup,
      updateInfo, setUpdateInfo
    }}>
      {children}
    </Ctx.Provider>
  )
}

export const useStore = () => useContext(Ctx)
