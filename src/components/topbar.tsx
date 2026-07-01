import { useStore } from '../lib/store'

export function Topbar() {
  const { page } = useStore()
  const titles: Record<string, string> = {
    home: 'Home', movies: 'Movies', tvshows: 'TV Shows', kdramas: 'K-Dramas',
    anime: 'Anime', games: 'Games',
    downloads: 'Downloads', settings: 'Settings', addons: 'Addons', detail: '',
    watchtogether: 'Watch Together', watchlist: 'Watchlist', themes: 'Themes',
  }
  return (
    <header className="relative flex items-center justify-between h-14 px-6 shrink-0 z-40 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-r from-deep/95 via-deep/80 to-deep/95 backdrop-blur-[16px] border-b border-border/80" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(124,92,255,0.06),transparent_70%)] pointer-events-none" />
      <h1 className="relative text-xl font-bold text-text tracking-tight z-10">{titles[page] || ''}</h1>
    </header>
  )
}
