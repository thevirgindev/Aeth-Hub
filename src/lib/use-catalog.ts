import { useState, useEffect, useCallback, useRef } from 'react'
import { browseCatalog, searchCatalog } from './api'
import { sanitizeInput, isMalicious } from './sanitize'
import type { CatalogItem } from './types'

const PAGE = 50

export function usePaginatedCatalog(kind: string, genre: string, sort: string) {
  const [items, setItems] = useState<CatalogItem[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const offsetRef = useRef(0)
  const sentinelRef = useRef<HTMLDivElement | null>(null)
  const kindRef = useRef(kind)
  const genreRef = useRef(genre)
  const sortRef = useRef(sort)

  const loadMore = useCallback(async () => {
    if (kindRef.current === 'none') { setLoading(false); return }
    setLoadingMore(true)
    const res = await browseCatalog(kindRef.current, genreRef.current, sortRef.current, offsetRef.current, PAGE)
    setItems(prev => [...prev, ...res.items])
    setTotal(res.total)
    offsetRef.current += res.items.length
    setLoading(false)
    setLoadingMore(false)
  }, [])

  useEffect(() => {
    kindRef.current = kind
    genreRef.current = genre
    sortRef.current = sort
    setItems([])
    setTotal(0)
    offsetRef.current = 0
    setLoading(true)
    setLoadingMore(false)
    if (kind === 'none') { setLoading(false); return }
    loadMore()
  }, [kind, genre, sort, loadMore])

  useEffect(() => {
    const el = sentinelRef.current
    if (!el || kind === 'none') return
    const obs = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && offsetRef.current < total && !loading) loadMore()
    }, { rootMargin: '400px' })
    obs.observe(el)
    return () => obs.disconnect()
  }, [loadMore, total, loading, kind])

  const hasMore = offsetRef.current < total

  return { items, total, loading, loadingMore, hasMore, sentinelRef, loadMore }
}

export function useSearchCatalog() {
  const [results, setResults] = useState<CatalogItem[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(false)
  const [query, setQuery] = useState('')
  const [kind, setKind] = useState('all')
  const offsetRef = useRef(0)
  const timerRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)

  const search = useCallback(async (q: string, k: string, reset: boolean) => {
    const cleaned = sanitizeInput(q)
    if (!cleaned.trim() || isMalicious(q)) { setResults([]); setTotal(0); return }
    setLoading(true)
    const off = reset ? 0 : offsetRef.current
    const res = await searchCatalog(cleaned, k, off, PAGE)
    if (reset) {
      setResults(res.items)
    } else {
      setResults(prev => [...prev, ...res.items])
    }
    setTotal(res.total)
    offsetRef.current = (reset ? 0 : offsetRef.current) + res.items.length
    setLoading(false)
  }, [])

  const debouncedSearch = useCallback((q: string, k: string) => {
    setQuery(q)
    setKind(k)
    clearTimeout(timerRef.current)
    timerRef.current = setTimeout(() => search(q, k, true), 200)
  }, [search])

  useEffect(() => {
    return () => clearTimeout(timerRef.current)
  }, [])

  const loadMoreResults = useCallback(() => {
    if (offsetRef.current < total && !loading) search(query, kind, false)
  }, [search, query, kind, total, loading])

  const hasMore = offsetRef.current < total

  return { results, total, loading, query, kind, debouncedSearch, loadMoreResults, hasMore, setKind }
}
