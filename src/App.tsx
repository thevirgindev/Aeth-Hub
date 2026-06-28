import { useStore } from './lib/store'
import { Sidebar } from './components/sidebar'
import { Topbar } from './components/topbar'
import { Toast } from './components/toast'
import { SearchOverlay } from './pages/search-overlay'
import { HomePage } from './pages/home'
import { MoviesPage } from './pages/movies'
import { TvShowsPage } from './pages/tvshows'
import { KdramasPage } from './pages/kdramas'
import { AnimePage } from './pages/anime'
import { HentaiPage } from './pages/hentai'
import { GamesPage } from './pages/games'
import { DetailPage } from './pages/detail'
import { DownloadsPage } from './pages/downloads'
import { SettingsPage } from './pages/settings'

function PageRouter() {
  const { page } = useStore()
  switch (page) {
    case 'home': return <HomePage />
    case 'movies': return <MoviesPage />
    case 'tvshows': return <TvShowsPage />
    case 'kdramas': return <KdramasPage />
    case 'anime': return <AnimePage />
    case 'hentai': return <HentaiPage />
    case 'games': return <GamesPage />
    case 'detail': return <DetailPage />
    case 'downloads': return <DownloadsPage />
    case 'settings': return <SettingsPage />
    default: return <HomePage />
  }
}

export default function App() {
  const { page } = useStore()
  const titles: Record<string, string> = {
    home: 'Aeth', movies: 'Movies', tvshows: 'TV Shows', kdramas: 'K-Dramas',
    anime: 'Anime', hentai: 'Hentai', games: 'Games',
    detail: '', downloads: 'Downloads', settings: 'Settings',
  }

  return (
    <div className="h-screen w-screen flex bg-deep text-text overflow-hidden">
      <div className="fixed inset-0 pointer-events-none bg-gradient-to-br from-deep via-base to-deep -z-10" />
      <div className="fixed inset-0 pointer-events-none bg-[radial-gradient(ellipse_at_top_right,rgba(124,92,255,0.04),transparent_70%)] -z-10" />
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        {titles[page] && <Topbar />}
        <PageRouter />
      </div>
      <Toast />
      <SearchOverlay />
    </div>
  )
}
