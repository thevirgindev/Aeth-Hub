import { useEffect, useState } from 'react'
import { useStore } from '../lib/store'
import { getFavs } from '../lib/api'
import { User, Film, Bookmark, Clock, Settings, Heart } from 'lucide-react'

const statCards = [
  { label: 'Watchlist', icon: Bookmark, value: '0', color: 'text-accent' },
  { label: 'Favorites', icon: Heart, value: '0', color: 'text-red-400' },
  { label: 'Completed', icon: Film, value: '0', color: 'text-emerald-400' },
  { label: 'Hours Watched', icon: Clock, value: '0', color: 'text-amber-400' },
]

export function ProfilePage() {
  const { user, setShowSignup, setPage } = useStore()
  const [favCount, setFavCount] = useState(0)

  useEffect(() => {
    getFavs().then(f => setFavCount(f.length)).catch(() => {})
  }, [])

  if (!user) {
    return (
      <div className="flex-1 p-8 flex flex-col items-center justify-center gap-4">
        <div className="w-20 h-20 rounded-full bg-accent/10 flex items-center justify-center ring-2 ring-accent/20">
          <User size={36} className="text-accent/60" />
        </div>
        <h1 className="text-2xl font-bold text-text mt-2">Not signed in</h1>
        <p className="text-sm text-muted max-w-md text-center">Sign in to track your watch history, sync with AniList, save favorites, and more.</p>
        <button onClick={() => setShowSignup(true)}
          className="px-6 py-2.5 bg-accent text-white rounded-xl text-sm font-semibold hover:brightness-110 transition-all cursor-pointer">
          Sign In
        </button>
        <button onClick={() => setPage('settings')}
          className="text-xs text-accent/60 hover:text-accent cursor-pointer mt-2 transition-colors">
          Configure AniList in Settings
        </button>
      </div>
    )
  }

  statCards[0] = { ...statCards[0], value: String(favCount) }

  return (
    <div className="flex-1 p-8 max-w-4xl mx-auto w-full">
      <div className="flex items-center gap-5 mb-8">
        <div className="w-20 h-20 rounded-full bg-accent/15 flex items-center justify-center ring-2 ring-accent/25 overflow-hidden shrink-0">
          {user.avatar ? (
            <img src={user.avatar} alt="" className="w-full h-full object-cover" />
          ) : (
            <User size={32} className="text-accent/60" />
          )}
        </div>
        <div>
          <h1 className="text-2xl font-bold text-text">{user.username}</h1>
          <p className="text-sm text-muted mt-0.5">AniList · Online</p>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
        {statCards.map(c => {
          const Icon = c.icon
          return (
            <div key={c.label} className="glass-card rounded-xl border border-border/20 p-4 flex flex-col gap-2">
              <div className="flex items-center gap-2">
                <Icon size={14} className={c.color} />
                <span className="text-[11px] text-muted font-medium">{c.label}</span>
              </div>
              <span className={`text-2xl font-extrabold ${c.color}`}>{c.value}</span>
            </div>
          )
        })}
      </div>

      {favCount > 0 && (
        <div className="mb-8">
          <h2 className="text-lg font-bold text-text mb-3 flex items-center gap-2">
            <Heart size={16} className="text-red-400" />
            Favorites
          </h2>
          <p className="text-sm text-muted">{favCount} items saved</p>
        </div>
      )}

      <div className="border-t border-border/20 pt-6">
        <h2 className="text-lg font-bold text-text mb-3">Account</h2>
        <div className="space-y-2">
          <button onClick={() => setPage('settings')}
            className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-white/[0.04] transition-colors cursor-pointer text-left">
            <Settings size={16} className="text-muted" />
            <div>
              <p className="text-sm font-medium text-text">Settings</p>
              <p className="text-[10px] text-muted">App preferences, AniList sync, and themes</p>
            </div>
          </button>
        </div>
      </div>
    </div>
  )
}
