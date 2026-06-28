import { useStore } from '../lib/store'
import { CircleCheck, CircleAlert, CircleX } from 'lucide-react'

export function Toast() {
  const { toast } = useStore()
  if (!toast) return null
  const icons = { info: CircleAlert, success: CircleCheck, error: CircleX }
  const colors = { info: 'border-accent', success: 'border-success', error: 'border-error' }
  const Icon = icons[toast.type]
  return (
    <div className="fixed bottom-6 right-6 z-[999] animate-toast-in">
      <div className={`glass-modal rounded-[12px] border-l-4 ${colors[toast.type]} px-4 py-3 shadow-[0_16px_48px_rgba(0,0,0,0.36)] min-w-[280px] max-w-[400px] flex items-center gap-3`}>
        <Icon size={18} className={toast.type === 'info' ? 'text-accent' : toast.type === 'success' ? 'text-success' : 'text-error'} />
        <p className="text-sm text-text">{toast.msg}</p>
      </div>
    </div>
  )
}
