import { useStore } from '../lib/store'
import { Search } from 'lucide-react'

export function Topbar() {
  const { page, setSearchOpen } = useStore()
  const titles: Record<string, string> = {
    home: 'Home', movies: 'Movies', tvshows: 'TV Shows', kdramas: 'K-Dramas',
    anime: 'Anime', hentai: 'Hentai', games: 'Games',
    downloads: 'Downloads', settings: 'Settings', detail: '',
  }
  return (
    <header className="flex items-center justify-between h-14 px-6 border-b border-border shrink-0 bg-deep/80 backdrop-blur-[12px] z-40">
      <h1 className="text-xl font-bold text-text">{titles[page] || ''}</h1>
      <button
        onClick={() => setSearchOpen(true)}
        className="glass glass-hover rounded-xl px-4 py-2 text-sm text-dim flex items-center gap-2 cursor-pointer"
      >
        <Search size={16} />
        <span>Search...</span>
        <kbd className="text-muted text-[11px] ml-4 border border-border rounded px-1.5 py-0.5">⌘K</kbd>
      </button>
    </header>
  )
}
