import { useState, useEffect, useRef, useCallback } from 'react'
import { useStore } from '../lib/store'
import { getPlayback } from '../lib/api'
import type { Page, PlaybackPos } from '../lib/types'
import {
  Home, Clapperboard, Tv, Drama, Film, Gamepad2,
  User, LogIn, Clock, X, GripVertical,
  Bookmark, Download,
} from 'lucide-react'

const navItems: { page: Page; icon: typeof Home; label: string }[] = [
  { page: 'home', icon: Home, label: 'Home' },
  { page: 'movies', icon: Clapperboard, label: 'Movies' },
  { page: 'tvshows', icon: Tv, label: 'TV Shows' },
  { page: 'kdramas', icon: Drama, label: 'K-Dramas' },
  { page: 'anime', icon: Film, label: 'Anime' },
  { page: 'games', icon: Gamepad2, label: 'Games' },
  { page: 'watchlist', icon: Bookmark, label: 'Watchlist' },
  { page: 'downloads', icon: Download, label: 'Downloads' },
]

const typeIcons: Record<string, typeof Home> = {
  movie: Clapperboard, series: Tv, anime: Film, game: Gamepad2, hentai: Film,
}

const STORAGE_KEY = 'aeth-dock-pos'
const DOCK_W = 260
const DOCK_H = 380

function loadPos(): { x: number; y: number } {
  try {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved) return JSON.parse(saved)
  } catch {}
  return { x: Math.max(0, Math.min(window.innerWidth - DOCK_W, 24)), y: Math.max(0, Math.min(window.innerHeight - DOCK_H, 80)) }
}

function savePos(pos: { x: number; y: number }) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(pos)) } catch {}
}

function clampPos(x: number, y: number): { x: number; y: number } {
  return {
    x: Math.max(0, Math.min(window.innerWidth - DOCK_W, x)),
    y: Math.max(0, Math.min(window.innerHeight - DOCK_H, y)),
  }
}

export function FloatingDock() {
  const { dockOpen, setDockOpen, setPage, setDetailId, setDetailType, setShowSignup, user, setUser } = useStore()
  const [recent, setRecent] = useState<PlaybackPos[]>([])
  const [pos, setPos] = useState(loadPos)
  const [dragging, setDragging] = useState(false)
  const [visible, setVisible] = useState(false)
  const [closing, setClosing] = useState(false)
  const dragRef = useRef<{ startX: number; startY: number; origX: number; origY: number }>({ startX: 0, startY: 0, origX: 0, origY: 0 })
  const dockRef = useRef<HTMLDivElement>(null)
  const posRef = useRef(pos)
  posRef.current = pos

  useEffect(() => {
    const handler = () => {
      setPos(prev => {
        const clamped = clampPos(prev.x, prev.y)
        if (clamped.x !== prev.x || clamped.y !== prev.y) {
          savePos(clamped)
          return clamped
        }
        return prev
      })
    }
    window.addEventListener('resize', handler)
    return () => window.removeEventListener('resize', handler)
  }, [])

  useEffect(() => {
    if (dockOpen) {
      setClosing(false)
      setVisible(true)
      getPlayback().then(p => setRecent(p.slice(0, 4))).catch(() => {})
    } else {
      setClosing(true)
      const t = setTimeout(() => { setVisible(false); setClosing(false) }, 250)
      return () => clearTimeout(t)
    }
  }, [dockOpen])

  useEffect(() => {
    if (!dockOpen || closing) return
    const handler = (e: MouseEvent) => {
      if (dockRef.current && !dockRef.current.contains(e.target as Node)) {
        setDockOpen(false)
      }
    }
    setTimeout(() => document.addEventListener('mousedown', handler), 0)
    return () => document.removeEventListener('mousedown', handler)
  }, [dockOpen, closing, setDockOpen])

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && dockOpen) setDockOpen(false)
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [dockOpen, setDockOpen])

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault()
    dragRef.current = { startX: e.clientX, startY: e.clientY, origX: pos.x, origY: pos.y }
    setDragging(true)
  }, [pos])

  const deltaRef = useRef({ dx: 0, dy: 0 })

  useEffect(() => {
    if (!dragging) return
    const onMove = (e: MouseEvent) => {
      const dx = (e.clientX - dragRef.current.startX) / 1.5
      const dy = (e.clientY - dragRef.current.startY) / 1.5
      const newX = dragRef.current.origX + dx
      const newY = dragRef.current.origY + dy
      const clamped = clampPos(newX, newY)
      deltaRef.current = { dx: clamped.x - dragRef.current.origX, dy: clamped.y - dragRef.current.origY }
      if (dockRef.current) {
        dockRef.current.style.transition = 'none'
        dockRef.current.style.transform = `translate(${clamped.x - dragRef.current.origX}px, ${clamped.y - dragRef.current.origY}px)`
      }
    }
    const onUp = () => {
      setDragging(false)
      if (dockRef.current) {
        dockRef.current.style.transition = ''
        dockRef.current.style.transform = ''
      }
      const finalPos = clampPos(dragRef.current.origX + deltaRef.current.dx, dragRef.current.origY + deltaRef.current.dy)
      setPos(finalPos)
      savePos(finalPos)
    }
    window.addEventListener('mousemove', onMove)
    window.addEventListener('mouseup', onUp)
    return () => { window.removeEventListener('mousemove', onMove); window.removeEventListener('mouseup', onUp) }
  }, [dragging])

  const navigate = (p: Page) => {
    setPage(p); setDetailId(null); setDetailType('movie'); setDockOpen(false)
  }

  const openDetail = (id: string, mtype: string) => {
    setDetailId(id); setDetailType(mtype); setPage('detail'); setDockOpen(false)
  }

  if (!dockOpen && !visible) return null

  const animClass = closing
    ? 'animate-fade-out scale-[0.92] opacity-0 pointer-events-none'
    : dockOpen
      ? 'scale-100 opacity-100'
      : 'scale-[0.92] opacity-0 pointer-events-none'

  return (
    <div
      ref={dockRef}
      className={`fixed z-[200] w-[260px] transition-all duration-[250ms] ease-[cubic-bezier(0.16,1,0.3,1)] ${animClass}`}
      style={{ left: pos.x, top: pos.y, willChange: 'transform' }}
    >
      <div className="relative bg-base/95 backdrop-blur-2xl border border-border/60 rounded-xl shadow-[0_12px_40px_rgba(0,0,0,0.4)] overflow-hidden">
        <div
          onMouseDown={handleMouseDown}
          className="flex items-center justify-between px-3 py-2.5 border-b border-border/30 cursor-grab active:cursor-grabbing select-none"
        >
          <div className="flex items-center gap-2">
            <GripVertical size={12} className="text-muted/30" />
            <span className="text-[10px] text-muted/50 font-semibold uppercase tracking-[0.15em]">Quick Menu</span>
          </div>
          <button onClick={() => setDockOpen(false)}
            className="w-6 h-6 rounded-lg hover:bg-white/10 transition-colors flex items-center justify-center cursor-pointer">
            <X size={12} className="text-muted/50" />
          </button>
        </div>

        <div className="px-3 pt-3 pb-1">
          <div className="grid grid-cols-4 gap-1.5">
            {navItems.map(item => {
              const Icon = item.icon
              return (
                <button key={item.page} onClick={() => navigate(item.page)}
                  className="flex flex-col items-center gap-1 p-2 rounded-lg hover:bg-white/5 transition-all cursor-pointer active:scale-95">
                  <div className="w-8 h-8 rounded-lg bg-white/[0.03] flex items-center justify-center">
                    <Icon size={14} className="text-muted/60" />
                  </div>
                  <span className="text-[8px] text-muted/50 truncate w-full text-center">{item.label}</span>
                </button>
              )
            })}
          </div>
        </div>

        {recent.length > 0 && (
          <div className="px-3 pb-2">
            <div className="flex items-center gap-1.5 pt-2 pb-1.5 border-t border-border/20 mt-1">
              <Clock size={10} className="text-muted/30" />
              <span className="text-[9px] text-muted/40 font-semibold uppercase tracking-[0.12em]">Recent</span>
            </div>
            <div className="space-y-0.5">
              {recent.map(p => {
                const RIcon = typeIcons[p.mtype] || Clock
                return (
                  <button key={`${p.content_id}-${p.episode ?? ''}`} onClick={() => openDetail(p.content_id, p.mtype)}
                    className="w-full flex items-center gap-2 p-1.5 rounded-lg hover:bg-white/5 transition-colors cursor-pointer text-left">
                    <RIcon size={11} className="text-muted/40 shrink-0" />
                    <span className="text-[11px] text-text truncate">{p.title}</span>
                  </button>
                )
              })}
            </div>
          </div>
        )}

        <div className="border-t border-border/20 px-3 py-2.5">
          {user ? (
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-full bg-accent/20 flex items-center justify-center shrink-0 overflow-hidden ring-1 ring-accent/20">
                {user.avatar ? <img src={user.avatar} alt="" className="w-full h-full object-cover" /> : <User size={10} className="text-accent" />}
              </div>
              <span className="text-[11px] font-medium text-text truncate flex-1">{user.username}</span>
              <button onClick={() => { setUser(null); setDockOpen(false) }}
                className="text-[9px] text-error/60 hover:text-error transition-colors cursor-pointer px-1.5 py-1 rounded-md hover:bg-white/5">
                Sign Out
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-full bg-accent/10 flex items-center justify-center shrink-0">
                <User size={10} className="text-accent" />
              </div>
              <span className="text-[11px] text-dim flex-1">Not signed in</span>
              <button onClick={() => { setShowSignup(true); setDockOpen(false) }}
                className="flex items-center gap-1 px-2 py-1 bg-accent text-white rounded-md text-[10px] font-semibold hover:brightness-110 transition-all cursor-pointer">
                <LogIn size={9} /> Sign In
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
