import type { ReactNode } from 'react'

interface Props {
  title: ReactNode
  children: ReactNode
}

export function MediaRow({ title, children }: Props) {
  return (
    <section className="mb-8" style={{ contentVisibility: 'auto' }}>
      <h3 className="text-3xl font-extrabold tracking-tight text-text mb-4 px-1 flex items-center gap-3">
        {title}
        <span className="h-[2px] flex-1 bg-gradient-to-r from-accent/30 to-transparent mt-1" />
      </h3>
      <div className="scroll-row">
        {children}
      </div>
    </section>
  )
}
