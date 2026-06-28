import { forwardRef, type InputHTMLAttributes } from 'react'

export const Input = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement>>((props, ref) => (
  <input
    ref={ref}
    className="w-full bg-surface border border-border rounded-xl px-4 py-2.5 text-sm text-text placeholder:text-muted outline-none transition-colors focus:border-accent"
    {...props}
  />
))
Input.displayName = 'Input'
