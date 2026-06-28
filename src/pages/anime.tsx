import { useState, useEffect } from 'react'
import { AnimeCard, AnimeCardSkeleton } from '../components/cards/anime-card'
import { FilterChips } from '../components/cards/filter-chips'
import { useStore } from '../lib/store'
import { getAnime } from '../lib/api'
import type { Anime } from '../lib/types'

const genres = ['All', 'Action', 'Fantasy', 'Drama', 'Adventure', 'Comedy', 'Romance', 'Slice of Life']

export function AnimePage() {
  const { setPage, setDetailId, setDetailType } = useStore()
  const [anime, setAnime] = useState<Anime[]>([])
  const [genre, setGenre] = useState('All')
  const [loading, setLoading] = useState(true)

  useEffect(() => { getAnime().then(a => { setAnime(a); setLoading(false) }) }, [])

  const filtered = genre === 'All' ? anime : anime.filter(a => a.genres.includes(genre))

  return (
    <div className="flex-1 overflow-y-auto p-6 animate-fade">
      <FilterChips items={genres} selected={genre} onSelect={setGenre} />
      <div className="mt-6 grid grid-cols-[repeat(auto-fill,minmax(165px,1fr))] gap-4">
        {loading
          ? Array.from({ length: 12 }).map((_, i) => <AnimeCardSkeleton key={i} />)
          : filtered.map(a => (
              <AnimeCard key={a.id} anime={a} onSelect={() => { setDetailId(a.id); setDetailType('anime'); setPage('detail') }} />
            ))}
      </div>
    </div>
  )
}
