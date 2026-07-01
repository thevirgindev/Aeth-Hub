import { useEffect, useState, useRef } from 'react'
import { useStore } from '../lib/store'
import { CircleCheck, CircleAlert, CircleX, X } from 'lucide-react'

export function Toast() {
  const { toast, clearToast } = useStore()
  const [leaving, setLeaving] = useState(false)
  const timerRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)

  useEffect(() => {
    if (!toast) { setLeaving(false); return }
    setLeaving(false)
    clearTimeout(timerRef.current)
    timerRef.current = setTimeout(() => {
      setLeaving(true)
      setTimeout(clearToast, 300)
    }, 3700)
    return () => clearTimeout(timerRef.current)
  }, [toast])

  if (!toast && !leaving) return null
  const icons = { info: CircleAlert, success: CircleCheck, error: CircleX }
  const accent = { info: '#7C5CFF', success: '#2ED47A', error: '#FF5A6A' }
  const Icon = icons[toast?.type || 'info']
  const msg = toast?.msg || ''

  return (
    <div className={`fixed bottom-6 right-6 z-[999] ${leaving ? 'animate-toast-out' : 'animate-toast-in'}`}>
      <div className="flex items-start gap-3 px-4 py-3.5 min-w-[280px] max-w-[400px] rounded-2xl shadow-[0_16px_48px_rgba(0,0,0,0.5)] border border-white/[0.06]"
        style={{
          background: 'linear-gradient(135deg, rgba(17,21,33,0.98), rgba(23,28,42,0.95))',
          backdropFilter: 'blur(20px)',
          boxShadow: `inset 0 1px 0 rgba(255,255,255,0.06), 0 0 24px ${accent[toast?.type || 'info']}15`,
        }}>
        <div className="shrink-0 mt-0.5" style={{ filter: `drop-shadow(0 0 6px ${accent[toast?.type || 'info']}40)` }}>
          <Icon size={16} style={{ color: accent[toast?.type || 'info'] }} />
        </div>
        <p className="text-sm text-text flex-1 leading-5">{msg}</p>
        <button onClick={() => { setLeaving(true); setTimeout(clearToast, 300) }}
          className="shrink-0 p-0.5 rounded-md text-muted hover:text-text hover:bg-white/10 transition-colors cursor-pointer -mr-1 -mt-0.5">
          <X size={14} />
        </button>
        <div className="absolute bottom-0 left-4 right-4 h-[2px] rounded-full overflow-hidden"
          style={{ background: `${accent[toast?.type || 'info']}20` }}>
          <div className="h-full animate-toast-progress"
            style={{ background: `linear-gradient(90deg, ${accent[toast?.type || 'info']}, ${accent[toast?.type || 'info']}80)`,
              boxShadow: `0 0 8px ${accent[toast?.type || 'info']}40` }} />
        </div>
      </div>
    </div>
  )
}
