import { createContext, useContext, useState, useEffect, useCallback, type ReactNode, type MouseEvent } from 'react'
import { Play, Heart, Info, Copy, Download, ExternalLink } from 'lucide-react'

export interface CtxItem {
  label: string
  icon?: typeof Play
  onClick: () => void
  disabled?: boolean
  divider?: boolean
}

interface CtxState {
  x: number
  y: number
  items: CtxItem[]
}

interface CtxValue {
  show: (items: CtxItem[], e: MouseEvent) => void
  hide: () => void
}

const Ctx = createContext<CtxValue>(null!)

export function useContextMenu() { return useContext(Ctx) }

export function ContextMenuProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<CtxState | null>(null)

  const hide = useCallback(() => setState(null), [])

  const show = useCallback((items: CtxItem[], e: MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setState({ x: e.clientX, y: e.clientY, items })
  }, [])

  useEffect(() => {
    if (!state) return
    const close = (e: globalThis.MouseEvent | KeyboardEvent) => {
      if (e instanceof KeyboardEvent && e.key !== 'Escape') return
      hide()
    }
    window.addEventListener('click', close)
    window.addEventListener('keydown', close)
    return () => {
      window.removeEventListener('click', close)
      window.removeEventListener('keydown', close)
    }
  }, [state, hide])

  return (
    <Ctx.Provider value={{ show, hide }}>
      {children}
      {state && (
        <div
          className="fixed z-[9999] min-w-[180px] py-1.5 rounded-xl shadow-[0_8px_32px_rgba(0,0,0,0.6)] border border-border backdrop-blur-[24px] bg-[rgba(8,8,10,0.95)] animate-fade"
          style={{ left: state.x, top: state.y }}
          onContextMenu={e => e.preventDefault()}>
          {state.items.map((item, i) => {
            if (item.divider) {
              return <div key={i} className="h-[1px] bg-border my-1 mx-2" />
            }
            const Icon = item.icon
            return (
              <button key={i} onClick={() => { item.onClick(); hide() }}
                disabled={item.disabled}
                className={`w-full flex items-center gap-2.5 px-3 py-2 text-sm text-left transition-colors cursor-pointer ${
                  item.disabled
                    ? 'text-muted cursor-not-allowed'
                    : 'text-dim hover:text-text hover:bg-white/10'
                }`}>
                {Icon && <Icon size={15} className="shrink-0" />}
                <span>{item.label}</span>
              </button>
            )
          })}
        </div>
      )}
    </Ctx.Provider>
  )
}

export const CtxItems = {
  play: (onClick: () => void): CtxItem => ({ label: 'Play', icon: Play, onClick }),
  favorite: (onClick: () => void): CtxItem => ({ label: 'Favorite', icon: Heart, onClick }),
  details: (onClick: () => void): CtxItem => ({ label: 'View Details', icon: Info, onClick }),
  copyMagnet: (onClick: () => void): CtxItem => ({ label: 'Copy Magnet', icon: Copy, onClick }),
  download: (onClick: () => void): CtxItem => ({ label: 'Download', icon: Download, onClick }),
  openSource: (onClick: () => void): CtxItem => ({ label: 'Open Source', icon: ExternalLink, onClick }),
  divider: (): CtxItem => ({ label: '', divider: true, onClick: () => {} }),
}
