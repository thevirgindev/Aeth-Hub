import type { ButtonHTMLAttributes } from 'react'

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'ghost' | 'outline'
  size?: 'sm' | 'md' | 'lg'
}

export function Button({ variant = 'ghost', size = 'md', className = '', children, ...props }: Props) {
  const base = 'inline-flex items-center justify-center gap-2 font-medium transition-all duration-150 cursor-pointer select-none'
  const variants = {
    primary: 'bg-accent text-white hover:brightness-110 rounded-xl',
    ghost: 'glass glass-hover rounded-xl text-dim hover:text-text',
    outline: 'border border-border rounded-xl text-dim hover:text-text hover:border-border-hover',
  }
  const sizes = { sm: 'px-3 py-1.5 text-xs', md: 'px-4 py-2 text-sm', lg: 'px-6 py-3 text-base' }
  return (
    <button className={`${base} ${variants[variant]} ${sizes[size]} ${className}`} {...props}>
      {children}
    </button>
  )
}
