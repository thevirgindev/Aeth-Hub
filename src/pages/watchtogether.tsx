import { useStore } from '../lib/store'
import { Users, LogIn } from 'lucide-react'

export function WatchTogetherPage() {
  const { user, setShowSignup } = useStore()
  if (!user) {
    return (
      <div className="flex-1 p-6 animate-fade">
        <div className="flex flex-col items-center justify-center h-full text-center gap-4">
          <Users size={48} className="text-muted/20" />
          <h2 className="text-xl font-bold text-text">Sign In Required</h2>
          <p className="text-dim text-sm max-w-md">Create an account or sign in to use Watch Together.</p>
          <button onClick={() => setShowSignup(true)}
            className="flex items-center gap-2 px-5 py-2.5 bg-accent text-white rounded-xl text-sm font-semibold hover:brightness-110 transition-all cursor-pointer">
            <LogIn size={16} /> Sign In
          </button>
        </div>
      </div>
    )
  }
  return (
    <div className="flex-1 p-6 animate-fade">
      <div className="flex flex-col items-center justify-center h-full text-center gap-4">
        <Users size={48} className="text-accent/30" />
        <h2 className="text-xl font-bold text-text">Watch Together</h2>
        <p className="text-dim text-sm max-w-md">Coming soon — create rooms, invite friends, and sync playback in real-time.</p>
      </div>
    </div>
  )
}
