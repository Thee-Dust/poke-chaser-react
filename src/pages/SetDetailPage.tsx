import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import type { Card, Set } from '../api/types'
import { CardGrid } from '../components/cards/CardGrid'
import { AddToCollectionModal } from '../components/collections/AddToCollectionModal'
import { Breadcrumb } from '../components/layout/Breadcrumb'
import { Pagination } from '../components/ui/Pagination'
import { useData } from '../providers/DataProviderContext'

const CARD_SORT_OPTIONS = [
  { value: 'number_asc', label: 'Default' },
  { value: 'price_desc', label: 'Price: High to Low' },
  { value: 'price_asc', label: 'Price: Low to High' },
  { value: 'name_asc', label: 'A–Z' },
  { value: 'name_desc', label: 'Z–A' },
] as const

export function SetDetailPage() {
  const data = useData()
  const { setId = '' } = useParams()
  const [set, setSet] = useState<Set | undefined>()
  const [cards, setCards] = useState<Card[]>([])
  const [page, setPage] = useState(1)
  const [pages, setPages] = useState(1)
  const [sort, setSort] = useState<string>('number_asc')
  const [loadingSet, setLoadingSet] = useState(true)
  const [loadingCards, setLoadingCards] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [addCard, setAddCard] = useState<Card | null>(null)

  useEffect(() => {
    let cancelled = false

    async function loadSet() {
      setLoadingSet(true)

      try {
        const setData = await data.getSet(setId)
        if (!cancelled) {
          setSet(setData)
        }
      } catch {
        if (!cancelled) {
          setError('Failed to load set details.')
        }
      } finally {
        if (!cancelled) {
          setLoadingSet(false)
        }
      }
    }

    if (setId) {
      loadSet()
    }

    return () => {
      cancelled = true
    }
  }, [data, setId])

  useEffect(() => {
    let cancelled = false

    async function loadCards() {
      setLoadingCards(true)
      setError(null)

      try {
        const result = await data.getCardsBySet(setId, page, sort)
        if (!cancelled) {
          setCards(result.cards)
          setPages(result.pages)
        }
      } catch {
        if (!cancelled) {
          setError('Failed to load cards for this set.')
        }
      } finally {
        if (!cancelled) {
          setLoadingCards(false)
        }
      }
    }

    if (setId) {
      loadCards()
    }

    return () => {
      cancelled = true
    }
  }, [data, setId, page, sort])

  const logo = set?.images?.logo
  const cardCount = set?.printed_total ?? set?.total

  return (
    <div className="page">
      <Breadcrumb
        items={[
          { label: 'Browse Sets', to: '/' },
          { label: set?.name ?? 'Set ' },
        ]}
      />

      {set && (
        <header className="set-detail__header">
          {logo && (
            <img
              src={logo}
              alt=""
              className="set-detail__logo"
            />
          )}
          <div>
            <h1>{set.name}</h1>
            {cardCount && (
              <p className="page__message">{cardCount} cards</p>
            )}
          </div>
        </header>
      )}

      {!set && !loadingSet && <h1>Set</h1>}
      {error && <p className="page__error">{error}</p>}

      <div className="page__header">
        <span />
        <label className="page__sort">
          <span className="page__sort-label">Sort</span>
          <select
            className="page__sort-select"
            value={sort}
            onChange={(event) => {
              setSort(event.target.value)
              setPage(1)
            }}
          >
            {CARD_SORT_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>
      </div>

      <CardGrid
        cards={cards}
        loading={loadingCards}
        onAddToCollection={(card) => setAddCard(card)}
      />
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
