import { useRef, useState, useEffect, type ReactNode } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'

interface ArrowScrollRowProps {
  children: ReactNode
  className?: string
  carousel?: boolean
}

export function ArrowScrollRow({ children, className = '', carousel }: ArrowScrollRowProps) {
  const rowRef = useRef<HTMLDivElement>(null)
  const [canScrollL, setCanScrollL] = useState(false)
  const [canScrollR, setCanScrollR] = useState(true)

  const checkScroll = () => {
    const el = rowRef.current
    if (!el) return
    setCanScrollL(el.scrollLeft > 4)
    const hasOverflow = el.scrollWidth > el.clientWidth
    setCanScrollR(hasOverflow && el.scrollLeft + el.clientWidth < el.scrollWidth - 4)
  }

  useEffect(() => {
    const el = rowRef.current
    if (!el) return
    let ticking = false
    const onScroll = () => {
      if (!ticking) {
        ticking = true
        requestAnimationFrame(() => { checkScroll(); ticking = false })
      }
    }
    requestAnimationFrame(() => checkScroll())
    el.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll)
    return () => {
      el.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
    }
  }, [children])

  const scroll = (dir: 'l' | 'r') => {
    const el = rowRef.current
    if (!el) return
    if (carousel) {
      const pageW = el.clientWidth
      el.scrollBy({ left: dir === 'l' ? -pageW : pageW, behavior: 'smooth' })
    } else {
      const cardW = 200 + 16
      el.scrollBy({ left: dir === 'l' ? -cardW : cardW, behavior: 'smooth' })
    }
  }

  return (
    <div className={`relative ${className}`}>
      <div className="flex items-center gap-0">
        <button onClick={() => scroll('l')}
          className={`shrink-0 w-10 h-10 flex items-center justify-center bg-white/5 backdrop-blur-[4px] border border-white/10 rounded-xl text-muted hover:text-text hover:bg-white/15 hover:border-white/20 transition-all cursor-pointer mr-2 shadow-lg ${canScrollL ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
          <ChevronLeft size={18} />
        </button>
        <div ref={rowRef} className={`overflow-x-auto scrollbar-none py-1 flex-1 flex gap-4 ${carousel ? '[&>*]:flex-1 [&>*]:min-w-[160px] [&>*]:max-w-[200px] snap-x snap-mandatory' : ''}`}
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none', ...(carousel ? {} : { scrollSnapType: 'x mandatory' }) }}>
          {children}
        </div>
        <button onClick={() => scroll('r')}
          className={`shrink-0 w-10 h-10 flex items-center justify-center bg-white/5 backdrop-blur-[4px] border border-white/10 rounded-xl text-muted hover:text-text hover:bg-white/15 hover:border-white/20 transition-all cursor-pointer ml-2 shadow-lg ${canScrollR ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
          <ChevronRight size={18} />
        </button>
      </div>
    </div>
  )
}
