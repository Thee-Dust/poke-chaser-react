import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import type { Card } from '../api/types'
import { Breadcrumb } from '../components/layout/Breadcrumb'
import { useAuth } from '../context/AuthContext'
import { useData } from '../providers/DataProviderContext'

export function CardDetailPage() {
  const data = useData()
  const { cardId = '' } = useParams()
  const { user, isInCollection, addToCollection, removeFromCollection } = useAuth()
  const [card, setCard] = useState<Card | undefined>()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const inCollection = card ? isInCollection(card.id) : false

  useEffect(() => {
    let cancelled = false

    async function loadCard() {
      setLoading(true)
      setError(null)

      try {
        const result = await data.getCard(cardId)
        if (!cancelled) {
          setCard(result)
        }
      } catch {
        if (!cancelled) {
          setError('Failed to load card details.')
        }
      } finally {
        if (!cancelled) {
          setLoading(false)
        }
      }
    }

    if (cardId) {
      loadCard()
    }

    return () => {
      cancelled = true
    }
  }, [data, cardId])

  if (loading) {
    return (
      <div className="page">
        <p className="page__message">Loading card...</p>
      </div>
    )
  }

  if (error || !card) {
    return (
      <div className="page">
        <Breadcrumb items={[{ label: 'Browse Sets', to: '/' }, { label: 'Card' }]} />
        <p className="page__error">{error ?? 'Card not found.'}</p>
        <Link to="/" className="btn">
          Back to sets
        </Link>
      </div>
    )
  }

  return (
    <div className="page">
      <Breadcrumb
        items={[
          { label: 'Browse Sets', to: '/' },
          ...(card.setId && card.setName
            ? [{ label: card.setName, to: `/sets/${card.setId}` }]
            : []),
          { label: card.name },
        ]}
      />

      <div className="card-detail">
        {card.imageUrl ? (
          <img src={card.imageUrl} alt={card.name} className="card-detail__image" />
        ) : (
          <div className="card-detail__image" />
        )}

        <div className="card-detail__meta">
          <h1>{card.name}</h1>
          <dl>
            {card.setName && (
              <>
                <dt>Set</dt>
                <dd>{card.setName}</dd>
              </>
            )}
            {card.number && (
              <>
                <dt>Number</dt>
                <dd>{card.number}</dd>
              </>
            )}
            {card.rarity && (
              <>
                <dt>Rarity</dt>
                <dd>{card.rarity}</dd>
              </>
            )}
          </dl>

          <div className="card-detail__cta">
            {user ? (
              inCollection ? (
                <button
                  type="button"
                  className="btn"
                  onClick={() => removeFromCollection(card.id)}
                >
                  Remove from collection
                </button>
              ) : (
                <button
                  type="button"
                  className="btn btn--primary"
                  onClick={() => addToCollection(card.id)}
                >
                  Add to collection
                </button>
              )
            ) : (
              <p className="page__message">
                <Link to="/login">Sign in</Link> to track this card in your collection.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
