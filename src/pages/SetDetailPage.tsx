import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import type { Card, Set } from '../api/types'
import { CardGrid } from '../components/cards/CardGrid'
import { Breadcrumb } from '../components/layout/Breadcrumb'
import { useData } from '../providers/DataProviderContext'

export function SetDetailPage() {
  const data = useData()
  const { setId = '' } = useParams()
  const [set, setSet] = useState<Set | undefined>()
  const [cards, setCards] = useState<Card[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false

    async function loadSetAndCards() {
      setLoading(true)
      setError(null)

      try {
        const [setData, cardData] = await Promise.all([
          data.getSet(setId),
          data.getCardsBySet(setId),
        ])

        if (!cancelled) {
          setSet(setData)
          setCards(cardData)
        }
      } catch {
        if (!cancelled) {
          setError('Failed to load cards for this set.')
        }
      } finally {
        if (!cancelled) {
          setLoading(false)
        }
      }
    }

    if (setId) {
      loadSetAndCards()
    }

    return () => {
      cancelled = true
    }
  }, [data, setId])

  return (
    <div className="page">
      <Breadcrumb
        items={[
          { label: 'Browse Sets', to: '/' },
          { label: set?.name ?? 'Set' },
        ]}
      />

      {set && (
        <header className="page__actions">
          {set.imageUrl && (
            <img
              src={set.imageUrl}
              alt=""
              style={{ maxHeight: 48, objectFit: 'contain' }}
            />
          )}
          <div>
            <h1>{set.name}</h1>
            {set.cardCount && (
              <p className="page__message">{set.cardCount} cards</p>
            )}
          </div>
        </header>
      )}

      {!set && !loading && <h1>Set</h1>}
      {error && <p className="page__error">{error}</p>}
      <CardGrid cards={cards} loading={loading} />
    </div>
  )
}
