import { useState, useEffect } from 'react'
import { MoviePoster, MoviePosterSkeleton } from '../components/cards/movie-poster'
import { FilterChips } from '../components/cards/filter-chips'
import { useStore } from '../lib/store'
import { getMovies } from '../lib/api'
import type { Movie } from '../lib/types'

const genres = ['All', 'Sci-Fi', 'Action', 'Drama', 'Thriller', 'Adventure', 'Comedy', 'Crime', 'Fantasy']

export function MoviesPage() {
  const { setPage, setDetailId, setDetailType } = useStore()
  const [movies, setMovies] = useState<Movie[]>([])
  const [genre, setGenre] = useState('All')
  const [loading, setLoading] = useState(true)

  useEffect(() => { getMovies().then(m => { setMovies(m); setLoading(false) }) }, [])

  const filtered = genre === 'All' ? movies : movies.filter(m => m.genres.includes(genre))

  return (
    <div className="flex-1 overflow-y-auto p-6 animate-fade">
      <FilterChips items={genres} selected={genre} onSelect={setGenre} />
      <div className="mt-6 grid grid-cols-[repeat(auto-fill,minmax(160px,1fr))] gap-4">
        {loading
          ? Array.from({ length: 12 }).map((_, i) => <MoviePosterSkeleton key={i} />)
          : filtered.map(m => (
              <MoviePoster key={m.id} movie={m} onSelect={() => { setDetailId(m.id); setDetailType('movie'); setPage('detail') }} />
            ))}
      </div>
    </div>
  )
}
