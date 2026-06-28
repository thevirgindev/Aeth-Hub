import type { ReactNode } from 'react'

interface Props {
  title: ReactNode
  children: ReactNode
}

export function MediaRow({ title, children }: Props) {
  return (
    <section className="mb-6">
      <h3 className="text-xl font-semibold text-text mb-3 px-1">{title}</h3>
      <div className="scroll-row">
        {children}
      </div>
    </section>
  )
}
