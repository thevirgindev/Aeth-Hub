import { useState, useEffect } from 'react'
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

  useEffect(() => { setErrored(false); setLoaded(false) }, [src])

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
    <div className={`relative overflow-hidden ${className}`} style={{ background: 'rgba(255,255,255,0.03)' }}>
      {showSkeleton && <div className="absolute inset-0 skeleton animate-pulse" />}
      {errored ? (
        <img src={initialsUrl(title || alt)} alt={alt} className="w-full h-full object-cover" />
      ) : (
        <img src={src} alt={alt} loading={loading} fetchPriority={fetchPriority}
          decoding="async" onLoad={handleLoad} onError={handleError}
          className={`w-full h-full object-cover transition-opacity duration-150 ${loaded ? 'opacity-100' : 'opacity-0'}`} />
      )}
    </div>
  )
}
