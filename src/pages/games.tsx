import { useState, useEffect } from 'react'
import { GameCard, GameCardSkeleton } from '../components/cards/game-card'
import { FilterChips } from '../components/cards/filter-chips'
import { useStore } from '../lib/store'
import { getGames } from '../lib/api'
import type { Game } from '../lib/types'

const genres = ['All', 'Action RPG', 'Open World RPG', 'CRPG', 'Action Adventure', 'Roguelike']

export function GamesPage() {
  const { setPage, setDetailId, setDetailType } = useStore()
  const [games, setGames] = useState<Game[]>([])
  const [genre, setGenre] = useState('All')
  const [loading, setLoading] = useState(true)

  useEffect(() => { getGames().then(g => { setGames(g); setLoading(false) }) }, [])

  const filtered = genre === 'All' ? games : games.filter(g => g.genre === genre)

  return (
    <div className="flex-1 overflow-y-auto p-6 animate-fade">
      <FilterChips items={genres} selected={genre} onSelect={setGenre} />
      <div className="mt-6 grid grid-cols-[repeat(auto-fill,minmax(180px,1fr))] gap-5">
        {loading
          ? Array.from({ length: 12 }).map((_, i) => <GameCardSkeleton key={i} />)
          : filtered.map(g => (
              <GameCard key={g.id} game={g} onSelect={() => { setDetailId(g.id); setDetailType('game'); setPage('detail') }} />
            ))}
      </div>
    </div>
  )
}
