interface Props {
  children: string
  variant?: 'default' | 'quality' | 'accent' | 'success' | 'warning'
  className?: string
}

export function Badge({ children, variant = 'default', className = '' }: Props) {
  const variants = {
    default: 'bg-white/10 text-dim',
    quality: 'bg-[rgba(0,230,118,0.15)] text-[#00E676]',
    accent: 'bg-[rgba(124,92,255,0.15)] text-accent',
    success: 'bg-[rgba(46,212,122,0.15)] text-success',
    warning: 'bg-[rgba(255,184,77,0.15)] text-warning',
  }
  return (
    <span className={`inline-flex items-center px-2 py-0.5 text-[11px] font-bold rounded-[4px] uppercase ${variants[variant]} ${className}`}>
      {children}
    </span>
  )
}
