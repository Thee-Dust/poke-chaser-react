import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import type { Card, Set } from '../api/types'
import { CardGrid } from '../components/cards/CardGrid'
import { AddToCollectionModal } from '../components/collections/AddToCollectionModal'
import { Breadcrumb } from '../components/layout/Breadcrumb'
import { Pagination } from '../components/ui/Pagination'
import { CARD_SORT_OPTIONS, SortSelect } from '../components/ui/SortSelect'
import { useData } from '../providers/DataProviderContext'
import { parseSetIdFromParam } from '../utils/setSlug'

const SET_CARD_SORT_OPTIONS = [
  { value: 'number_asc', label: 'Default' },
  ...CARD_SORT_OPTIONS,
] as const

export function SetDetailPage() {
  const data = useData()
  const { setSlug = '' } = useParams()
  const setId = parseSetIdFromParam(setSlug)
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
    <div className="page page--wide">
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

      <div className="page__header page__header--above-list">
        <span />
        <SortSelect
          options={SET_CARD_SORT_OPTIONS}
          value={sort}
          onChange={(value) => {
            setSort(value)
            setPage(1)
          }}
        />
      </div>

      {error && <p className="page__error">{error}</p>}

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
