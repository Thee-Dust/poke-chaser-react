import { useEffect, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import type { Card } from '../api/types'
import { CardGrid } from '../components/cards/CardGrid'
import { useData } from '../providers/DataProviderContext'

export function SearchPage() {
  const data = useData()
  const [searchParams] = useSearchParams()
  const query = searchParams.get('q') ?? ''
  const [cards, setCards] = useState<Card[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false

    async function loadResults() {
      if (!query.trim()) {
        setCards([])
        setLoading(false)
        return
      }

      setLoading(true)
      setError(null)

      try {
        const result = await data.searchCards(query)
        if (!cancelled) {
          setCards(result)
        }
      } catch {
        if (!cancelled) {
          setError('Search failed. Please try again.')
        }
      } finally {
        if (!cancelled) {
          setLoading(false)
        }
      }
    }

    loadResults()

    return () => {
      cancelled = true
    }
  }, [data, query])

  return (
    <div className="page">
      <div className="page__actions">
        <h1>
          {query ? `Search results for "${query}"` : 'Search'}
        </h1>
        {query && (
          <Link to="/" className="btn">
            Clear search
          </Link>
        )}
      </div>

      {!query && (
        <p className="page__message">Enter a card name in the search bar above.</p>
      )}

      {error && <p className="page__error">{error}</p>}
      {query && <CardGrid cards={cards} loading={loading} showSetName />}
    </div>
  )
}
