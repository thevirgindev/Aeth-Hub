import { useState, useEffect, useRef } from 'react'
import { initialsUrl } from './initials-fallback'

interface Props {
  src: string
  alt: string
  className?: string
  title?: string
  onError?: (e: React.SyntheticEvent<HTMLImageElement>) => void
  loading?: 'lazy' | 'eager'
  fetchPriority?: 'high' | 'low' | 'auto'
}

export function CachedImage({ src, alt, className = '', title, onError, loading = 'lazy', fetchPriority }: Props) {
  const [errored, setErrored] = useState(false)
  const [loaded, setLoaded] = useState(false)
  const [visible, setVisible] = useState(loading === 'eager')
  const imgRef = useRef<HTMLDivElement>(null)

  useEffect(() => { setErrored(false); setLoaded(false); setVisible(loading === 'eager') }, [src, loading])

  useEffect(() => {
    if (loading === 'eager') { setVisible(true); return }
    const el = imgRef.current
    if (!el) return
    const obs = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) { setVisible(true); obs.disconnect() }
    }, { rootMargin: '200px' })
    obs.observe(el)
    return () => obs.disconnect()
  }, [loading])

  const handleLoad = () => setLoaded(true)

  const handleError = (e: React.SyntheticEvent<HTMLImageElement>) => {
    setErrored(true)
    if (onError) onError(e)
  }

  if (!src || src === 'N/A') {
    return (
      <div className={`relative overflow-hidden ${className}`} style={{ background: 'rgba(255,255,255,0.03)' }}>
        <img src={initialsUrl(title || alt)} alt={alt} className="w-full h-full object-cover" />
      </div>
    )
  }

  const showSkeleton = !errored && !loaded

  return (
    <div ref={imgRef} className={`relative overflow-hidden ${className}`} style={{ background: 'rgba(255,255,255,0.03)' }}>
      {showSkeleton && <div className="absolute inset-0 skeleton animate-pulse" />}
      {errored ? (
        <img src={initialsUrl(title || alt)} alt={alt} className="w-full h-full object-cover" />
      ) : visible ? (
        <img src={src} alt={alt} fetchPriority={fetchPriority}
          decoding="async" onLoad={handleLoad} onError={handleError}
          className={`w-full h-full object-cover transition-opacity duration-150 ${loaded ? 'opacity-100' : 'opacity-0'}`} />
      ) : (
        <div className="w-full h-full" />
      )}
    </div>
  )
}