import { useStore } from '../lib/store'
import type { Page } from '../lib/types'
import { Home, Clapperboard, Tv, Drama, Film, Ghost, Gamepad2, Download, Settings } from 'lucide-react'

const items: { page: Page; icon: typeof Home; label: string }[] = [
  { page: 'home', icon: Home, label: 'Home' },
  { page: 'movies', icon: Clapperboard, label: 'Movies' },
  { page: 'tvshows', icon: Tv, label: 'TV Shows' },
  { page: 'kdramas', icon: Drama, label: 'K-Dramas' },
  { page: 'anime', icon: Film, label: 'Anime' },
  { page: 'hentai', icon: Ghost, label: 'Hentai' },
  { page: 'games', icon: Gamepad2, label: 'Games' },
  { page: 'downloads', icon: Download, label: 'Downloads' },
  { page: 'settings', icon: Settings, label: 'Settings' },
]

export function Sidebar() {
  const { page, setPage, setDetailId } = useStore()
  return (
    <nav className="glass-sidebar flex flex-col items-center gap-1 w-[72px] py-4 z-50 shrink-0">
      <div className="text-accent text-xl font-bold mb-6 mt-2">Ae</div>
      {items.map(i => {
        const Icon = i.icon
        return (
          <button
            key={i.page}
            onClick={() => { setPage(i.page); setDetailId(null) }}
            className={`relative w-11 h-11 flex items-center justify-center rounded-xl text-lg transition-all duration-150 cursor-pointer ${
              page === i.page
                ? 'text-text bg-white/10 before:absolute before:left-[-12px] before:top-1/2 before:-translate-y-1/2 before:w-[3px] before:h-6 before:bg-accent before:rounded-r-full'
                : 'text-muted hover:text-dim hover:bg-white/5'
            }`}
            title={i.label}
          >
            <Icon size={20} />
          </button>
        )
      })}
    </nav>
  )
}
