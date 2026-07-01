import { useState, useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import { useStore } from '../lib/store'
import { getPlayback } from '../lib/api'
import type { Page, PlaybackPos } from '../lib/types'
import {
  Home, Clapperboard, Tv, Drama, BookOpen, Gamepad2,
  Download, Bookmark, Settings,
  Compass, Library, Users, Clock,
  Store, FolderOpen, ExternalLink, ChevronLeft,
  Heart, Radio, Coffee, Rocket, Lock,
} from 'lucide-react'
import { open } from '@tauri-apps/plugin-shell'
import { checkForUpdate } from '../lib/update-check'

const REPO_URL = 'https://github.com/thevirgindev/aeth-hub'
const PATREON_URL = 'https://patreon.com/thevirgindev'
const KOFI_URL = 'https://ko-fi.com/thevirgindev'
const PROPELLER_URL = 'https://propellerads.com'

const allowedPages = ['home', 'anime', 'detail', 'downloads', 'settings', 'history', 'watchlist'] as const

type SectionItem = { page: Page; icon: typeof Home; label: string; tag?: string }

const sections: { label: string; icon: typeof Home; items: SectionItem[] }[] = [
  {
    label: 'Explore', icon: Compass,
    items: [
      { page: 'home', icon: Home, label: 'Home' },
      { page: 'movies', icon: Clapperboard, label: 'Movies' },
      { page: 'tvshows', icon: Tv, label: 'TV Shows' },
      { page: 'anime', icon: BookOpen, label: 'Anime & Manga' },
      { page: 'kdramas', icon: Drama, label: 'K-Dramas' },
    ],
  },
  {
    label: 'Quick Access', icon: Clock,
    items: [],
  },
  {
    label: 'Library', icon: Library,
    items: [
      { page: 'history', icon: Clock, label: 'History' },
      { page: 'collection', icon: FolderOpen, label: 'Collection' },
      { page: 'watchlist', icon: Bookmark, label: 'Watchlist' },
      { page: 'downloads', icon: Download, label: 'Downloads' },
      { page: 'games', icon: Gamepad2, label: 'Games' },
      { page: 'settings', icon: Settings, label: 'Settings' },
    ],
  },
  {
    label: 'Coming Soon', icon: Rocket,
    items: [
      { page: 'watchtogether', icon: Users, label: 'Watch Together', tag: 'Soon' },
      { page: 'marketplace', icon: Store, label: 'Marketplace', tag: 'New' },
    ],
  },
]

function AnimatedLabel({ show, children }: { show: boolean; children: React.ReactNode }) {
  return (
    <div className={`overflow-hidden whitespace-nowrap transition-all duration-200 ${show ? 'ml-2 max-w-[160px] opacity-100' : 'ml-0 max-w-0 opacity-0'}`}>
      <span className="text-sm font-medium tracking-wide block">{children}</span>
    </div>
  )
}

function Tooltip({ label, children }: { label: string; children?: React.ReactNode }) {
  const [show, setShow] = useState(false)
  const wrapRef = useRef<HTMLDivElement>(null)
  const [pos, setPos] = useState({ x: 0, y: 0 })
  const hideTimer = useRef(0)

  const handleEnter = () => {
    clearTimeout(hideTimer.current)
    if (wrapRef.current) {
      const r = wrapRef.current.getBoundingClientRect()
      setPos({ x: r.right + 8, y: r.top + r.height / 2 })
    }
    setShow(true)
  }

  const handleLeave = () => {
    hideTimer.current = window.setTimeout(() => setShow(false), 50)
  }

  useEffect(() => {
    return () => clearTimeout(hideTimer.current)
  }, [])

  const child = children ? (
    <div ref={wrapRef} onMouseEnter={handleEnter} onMouseLeave={handleLeave} className="contents">
      {children}
    </div>
  ) : null

  return (
    <>
      {child}
      {show && createPortal(
        <span style={{ left: pos.x, top: pos.y, transform: 'translateY(-50%)' }}
          onMouseEnter={handleEnter} onMouseLeave={handleLeave}
          className="fixed px-2.5 py-1.5 rounded-lg text-[11px] font-semibold whitespace-nowrap bg-surface border border-accent/20 shadow-[0_4px_20px_rgba(0,0,0,0.6)] backdrop-blur-[16px] text-text z-[9999] pointer-events-auto">
          {label}
        </span>,
        document.body
      )}
    </>
  )
}

function SectionHeader({ icon: Icon, label }: { icon: typeof Home; label: string }) {
  return (
    <div className="flex items-center px-4 mb-1.5 group">
      <Icon size={13} className="text-muted/40 shrink-0 group-hover:text-accent/60 transition-colors" />
      <div className="ml-2 overflow-hidden whitespace-nowrap transition-all duration-200">
        <p className="text-[10px] uppercase tracking-[0.22em] text-muted/50 font-semibold font-mono">{label}</p>
      </div>
    </div>
  )
}

const typeIcons: Record<string, typeof Home> = {
  anime: BookOpen, hentai: BookOpen,
}

export function Sidebar() {
  const { page, setPage, setDetailId, setDetailType, sidebarOpen, setSidebarOpen, updateInfo, setUpdateInfo, showToast } = useStore()
  const [recent, setRecent] = useState<PlaybackPos[]>([])

  useEffect(() => {
    getPlayback().then(p => setRecent(p.slice(0, 4))).catch(() => {})
  }, [])

  const handleNav = (p: Page) => { setPage(p); setDetailId(null); setDetailType('movie') }

  const isBlocked = (p: Page) => !(allowedPages as readonly string[]).includes(p)

  return (
    <nav className={`glass-sidebar flex flex-col h-full rounded-tr-2xl rounded-br-2xl transition-all duration-[400ms] ease-[cubic-bezier(0.4,0,0.2,1)] ${sidebarOpen ? 'w-[240px]' : 'w-0'}`} style={{ willChange: 'width', backfaceVisibility: 'hidden', WebkitBackfaceVisibility: 'hidden' }}>
      <div className="flex flex-col w-full min-w-[240px] flex-1 overflow-y-auto overflow-x-hidden sidebar-scroll custom-scroll" style={{ scrollbarWidth: 'thin', scrollbarColor: 'rgba(124,92,255,0.15) transparent' }}>

        {sidebarOpen && (
          <div className="px-4 mb-3 mt-1">
            <button onClick={() => showToast({ msg: 'Sign in will be available in a future update', type: 'info' })}
              className="flex items-center gap-2.5 w-full px-3.5 py-2.5 rounded-xl bg-accent/8 border border-accent/15 hover:bg-accent/15 hover:border-accent/30 transition-all cursor-pointer group">
              <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-accent/20 to-accent/5 flex items-center justify-center group-hover:scale-105 transition-transform">
                <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-accent/80">
                  <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/>
                  <polyline points="10 17 15 12 10 7"/>
                  <line x1="15" y1="12" x2="3" y2="12"/>
                </svg>
              </div>
              <div className="flex-1 text-left">
                <p className="text-xs font-semibold text-text/70 group-hover:text-text transition-colors">Sign In</p>
                <p className="text-[9px] text-muted/40">Sync across devices</p>
              </div>
              <div className="px-1.5 py-0.5 rounded text-[8px] font-bold uppercase tracking-[0.15em] text-muted/30 bg-white/[0.03] border border-white/5">Soon</div>
            </button>
          </div>
        )}

        {sections.map(section => {
          const SecIcon = section.icon
          if (section.label === 'Quick Access') {
            return recent.length > 0 ? (
              <div key={section.label} className="w-full mb-4 last:mb-0">
                {sidebarOpen && <SectionHeader icon={Clock} label="Quick Access" />}
                {recent.map(p => {
                  const RIcon = typeIcons[p.mtype] || Clock
                  const btn = (
                    <button key={`${p.content_id}-${p.episode ?? ''}`}
                      onClick={() => { setDetailId(p.content_id); setDetailType(p.mtype); setPage('detail') }}
                      className={`relative flex items-center h-9 transition-all duration-150 cursor-pointer rounded-xl ${
                        sidebarOpen ? 'mx-[14px] w-[calc(100%-28px)]' : 'w-9 ml-[14px]'
                      } text-muted/60 hover:text-dim hover:bg-white/[0.04]`}>
                      <div className="w-9 h-9 flex items-center justify-center shrink-0">
                        <RIcon size={15} className="text-muted/50" />
                      </div>
                      {sidebarOpen && (
                        <div className="overflow-hidden whitespace-nowrap transition-all duration-200 ml-2 max-w-[160px] opacity-100">
                          <span className="text-sm block truncate">{p.title}</span>
                        </div>
                      )}
                    </button>
                  )
                  return !sidebarOpen ? <Tooltip key={`${p.content_id}-${p.episode ?? ''}`} label={p.title}>{btn}</Tooltip> : btn
                })}
              </div>
            ) : null
          }
          return (
            <div key={section.label} className="w-full mb-4 last:mb-0">
              {sidebarOpen && <SectionHeader icon={SecIcon} label={section.label} />}
              {section.items.map(i => {
                const Icon = i.icon
                const active = page === i.page
                const blocked = isBlocked(i.page)
                const btn = (
                  <button key={i.page} onClick={() => {
                    if (blocked) { showToast({ msg: 'Not available in this preview', type: 'info' }); return }
                    handleNav(i.page)
                  }}
                    className={`relative flex items-center h-9 transition-all duration-150 rounded-xl ${
                      sidebarOpen ? 'mx-[14px] w-[calc(100%-28px)]' : 'w-9 ml-[14px]'
                    } ${blocked ? 'text-muted/30 cursor-not-allowed' : active ? 'text-text bg-white/[0.07] shadow-[inset_0_0_16px_rgba(124,92,255,0.1)] cursor-pointer' : 'text-muted/60 hover:text-dim hover:bg-white/[0.04] cursor-pointer'}`}>
                    {active && sidebarOpen && (
                      <div className="absolute left-[-12px] top-1/2 -translate-y-1/2 w-[3px] h-5 bg-accent rounded-r-full shadow-[0_0_12px_rgba(124,92,255,0.5)]" />
                    )}
                    <div className="w-9 h-9 flex items-center justify-center shrink-0">
                      <div className="relative">
                        <Icon size={18} className={`transition-all duration-150 ${active ? 'scale-110 text-accent' : ''} ${blocked ? 'opacity-40' : ''}`} />
                        {blocked && <Lock size={8} className="absolute -top-1 -right-1 text-muted/50" />}
                      </div>
                    </div>
                    <AnimatedLabel show={sidebarOpen}>
                      <span className="flex items-center gap-2 text-sm font-medium tracking-wide">
                        {i.label}
                        {i.tag && (
                          <span className={`text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-md ${i.tag === 'New' ? 'text-accent bg-accent/12' : 'text-amber-400 bg-amber-400/12'}`}>{i.tag}</span>
                        )}
                      </span>
                    </AnimatedLabel>
                  </button>
                )
                return !sidebarOpen ? <Tooltip key={i.page} label={i.label}>{btn}</Tooltip> : btn
              })}
              {section.label === 'Coming Soon' && sidebarOpen && recent.length > 0 && (
                <div className="mt-2 px-4">
                  <div className="border-t border-border/20 pt-2.5 space-y-0.5">
                    {recent.slice(0, 3).map(p => {
                      const RIcon = typeIcons[p.mtype] || Clock
                      return (
                        <button key={`community-${p.content_id}-${p.episode ?? ''}`}
                          onClick={() => { setDetailId(p.content_id); setDetailType(p.mtype); setPage('detail') }}
                          className="w-full flex items-center gap-2.5 p-2 rounded-lg hover:bg-white/5 transition-colors cursor-pointer text-left">
                          <RIcon size={13} className="text-muted shrink-0" />
                          <div className="min-w-0 flex-1">
                            <p className="text-[12px] text-text truncate">{p.title}</p>
                            {p.episode != null && (
                              <p className="text-[9px] text-muted/50">{p.season != null ? `S${p.season} · ` : ''}Ep {p.episode}</p>
                            )}
                          </div>
                        </button>
                      )
                    })}
                  </div>
                </div>
              )}
            </div>
          )
        })}

        {sidebarOpen && (
          <div className="mt-auto pt-4">
            <div className="flex items-center justify-between px-4 mb-3">
              <div className="flex items-center gap-2">
                <button onClick={() => open(REPO_URL)}
                  className="w-7 h-7 rounded-lg text-muted/30 hover:text-text hover:bg-white/10 transition-all cursor-pointer flex items-center justify-center"
                  title="View repository">
                  <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"/></svg>
                </button>
                <button onClick={async () => {
                  showToast({ msg: 'Checking for updates...', type: 'info' })
                  const result = await checkForUpdate()
                  setUpdateInfo(result)
                  if (!result.available) showToast({ msg: 'You\'re up to date!', type: 'success' })
                }}
                  className="w-7 h-7 rounded-lg text-muted/30 hover:text-text hover:bg-white/10 transition-all cursor-pointer flex items-center justify-center"
                  title="Check for updates">
                  <div className="relative">
                    <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke={updateInfo?.available ? '#22c55e' : 'currentColor'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="23 4 23 10 17 10"/>
                      <polyline points="1 20 1 14 7 14"/>
                      <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/>
                    </svg>
                    {updateInfo?.available && (
                      <div className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 rounded-full bg-green-400 animate-ping" />
                    )}
                  </div>
                </button>
              </div>
              <button onClick={() => setSidebarOpen(false)}
                className="flex items-center justify-center w-7 h-7 rounded-lg text-muted/40 hover:text-text hover:bg-white/10 transition-all cursor-pointer"
                title="Collapse sidebar (Ctrl+S)">
                <ChevronLeft size={14} />
              </button>
            </div>

            <div className="px-4 mb-3">
              <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl bg-white/[0.02] border border-border/10">
                <img src="/logos/aeth-withnobg_black.png" alt="Aeth" className="w-8 h-8 object-contain brightness-[4]" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-text/80 tracking-tight">Aeth Hub Preview</p>
                  <p className="text-[9px] font-mono text-muted/30 tracking-[0.15em]">beta v0.1.0</p>
                </div>
              </div>
            </div>

            <div className="px-4 mb-3">
              <div className="rounded-xl bg-white/[0.015] border border-border/10 px-3 py-2.5">
                <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-muted/40 mb-2">Support the project</p>
                <div className="flex flex-col gap-1">
                  <button onClick={() => open(PATREON_URL)}
                    className="flex items-center gap-2 px-2 py-1.5 rounded-lg text-[11px] text-muted/50 hover:text-text hover:bg-white/[0.04] transition-all cursor-pointer text-left">
                    <Heart size={12} className="text-red-400/60" />
                    <span className="font-medium">Patreon</span>
                  </button>
                  <button onClick={() => open(KOFI_URL)}
                    className="flex items-center gap-2 px-2 py-1.5 rounded-lg text-[11px] text-muted/50 hover:text-text hover:bg-white/[0.04] transition-all cursor-pointer text-left">
                    <Coffee size={12} className="text-amber-400/60" />
                    <span className="font-medium">Ko-fi</span>
                  </button>
                  <button onClick={() => open(PROPELLER_URL)}
                    className="flex items-center gap-2 px-2 py-1.5 rounded-lg text-[11px] text-muted/50 hover:text-text hover:bg-white/[0.04] transition-all cursor-pointer text-left">
                    <Radio size={12} className="text-accent/60" />
                    <span className="font-medium">Propeller Ads</span>
                  </button>
                </div>
              </div>
            </div>

          </div>
        )}

        {!sidebarOpen && (
          <div className="mt-auto flex justify-center py-3">
            <button onClick={() => open(REPO_URL)}
              className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-white/[0.04] transition-colors cursor-pointer"
              title="View repository">
              <ExternalLink size={12} className="text-muted/30" />
            </button>
          </div>
        )}

      </div>
    </nav>
  )
}
