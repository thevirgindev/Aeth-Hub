import { useEffect, useState } from 'react'
import { Button } from './ui/button'
import { Film, Monitor, Gamepad2, Bookmark, Users, Sparkles } from 'lucide-react'

interface WelcomeProps {
  onDismiss: () => void
}

const features = [
  { icon: Film, title: 'Browse & Discover', desc: 'Explore movies, TV shows, anime, K-Dramas, hentai, and repacked games in one place.' },
  { icon: Monitor, title: 'Built-in Player', desc: 'Stream instantly with our custom HTML5 player. No external apps needed.' },
  { icon: Gamepad2, title: 'Repacked Games', desc: 'Download pre-installed repacked games from trusted scene groups.' },
  { icon: Film, title: 'Anime & Hentai', desc: 'Sub, dub, or both — merged catalog with uncensored options.' },
  { icon: Bookmark, title: 'Watchlist & History', desc: 'Save favorites and pick up where you left off across sessions.' },
  { icon: Users, title: 'Watch Together', desc: 'Sync playback with friends in real-time. (Coming in a future update)' },
]

export function Welcome({ onDismiss }: WelcomeProps) {
  const [visible, setVisible] = useState(false)
  const [cardVis, setCardVis] = useState<boolean[]>(features.map(() => false))

  useEffect(() => {
    setVisible(true)
    features.forEach((_, i) => {
      setTimeout(() => setCardVis(prev => { const n = [...prev]; n[i] = true; return n }), 200 + i * 100)
    })
  }, [])

  return (
    <div className={`fixed inset-0 z-[200] bg-deep flex flex-col items-center justify-center transition-opacity duration-500 ${visible ? 'opacity-100' : 'opacity-0'}`}>
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_rgba(124,92,255,0.12),transparent_70%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(124,92,255,0.04),transparent_50%)]" />
      <div className="relative z-10 max-w-2xl mx-auto px-6 text-center">
        <div className="mb-5">
          <img src="/logos/aeth-withnobg_black.png" alt="Aeth Hub" className="h-20 mx-auto" />
        </div>
        <h1 className="text-4xl font-extrabold text-text mb-2 tracking-tight">Welcome to <span className="text-accent">Aeth Hub</span></h1>
        <p className="text-dim text-sm mb-10 max-w-md mx-auto">Your all-in-one media hub for streaming, anime, and games.</p>
        <div className="grid grid-cols-2 gap-3 mb-10 text-left">
          {features.map((f, i) => {
            const Icon = f.icon
            return (
              <div key={i}
                className={`flex items-start gap-3 glass rounded-xl p-3.5 transition-all duration-400 ${cardVis[i] ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}
                style={{ transitionDelay: `${i * 80}ms` }}>
                <div className="w-9 h-9 rounded-lg bg-accent/20 flex items-center justify-center shrink-0 mt-0.5 ring-1 ring-accent/20">
                  <Icon size={15} className="text-accent" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-text">{f.title}</h3>
                  <p className="text-xs text-dim/70 leading-relaxed">{f.desc}</p>
                </div>
              </div>
            )
          })}
        </div>
        <div className="flex flex-col items-center gap-3">
          <Button variant="primary" size="lg" onClick={onDismiss} className="w-full max-w-xs">
            <Sparkles size={16} /> Get Started
          </Button>
          <button onClick={onDismiss}
            className="text-[11px] text-dim/40 hover:text-dim/70 transition-colors cursor-pointer">
            Already seen this? Skip
          </button>
        </div>
        <p className="text-[10px] text-dim/30 mt-6">Aeth Hub v0.1.0 &middot; GPL-3.0</p>
      </div>
    </div>
  )
}
