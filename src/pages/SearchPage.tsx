import { useEffect, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import type { Card } from '../api/types'
import { CardGrid } from '../components/cards/CardGrid'
import { AddToCollectionModal } from '../components/collections/AddToCollectionModal'
import { Pagination } from '../components/ui/Pagination'
import { CARD_SORT_OPTIONS, SortSelect } from '../components/ui/SortSelect'
import { useData } from '../providers/DataProviderContext'
import './SearchPage.css'

export function SearchPage() {
  const data = useData()
  const [searchParams] = useSearchParams()
  const query = searchParams.get('q') ?? ''
  const [cards, setCards] = useState<Card[]>([])
  const [page, setPage] = useState(1)
  const [pages, setPages] = useState(1)
  const [sort, setSort] = useState<string>('price_desc')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [addCard, setAddCard] = useState<Card | null>(null)

  useEffect(() => {
    setPage(1)
  }, [query, sort])

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
        const result = await data.searchCards(query, page, sort)
        if (!cancelled) {
          setCards(result.cards)
          setPages(result.pages)
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
  }, [data, query, page, sort])

  return (
    <div className="page page--wide">
      <div className="page__header page__header--above-list">
        <h1>
          {query ? `Search results for "${query}"` : 'Search'}
        </h1>
        <div className="search-page__controls">
          {query && (
            <SortSelect
              options={CARD_SORT_OPTIONS}
              value={sort}
              onChange={(value) => {
                setSort(value)
                setPage(1)
              }}
            />
          )}
          {query && (
            <Link to="/" className="btn">
              Clear search
            </Link>
          )}
        </div>
      </div>

      {!query && (
        <p className="page__message">Enter a card name in the search bar above.</p>
      )}

      {error && <p className="page__error">{error}</p>}
      {query && (
        <CardGrid
          cards={cards}
          loading={loading}
          showSetName
          onAddToCollection={(card) => setAddCard(card)}
        />
      )}
      <Pagination page={page} pages={pages} onPageChange={setPage} />

      {addCard && (
        <AddToCollectionModal
          cardId={addCard.id}
          cardName={addCard.name}
          onClose={() => setAddCard(null)}
        />
      )}
    </div>
  )
}
