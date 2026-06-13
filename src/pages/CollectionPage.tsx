import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import type { Card } from '../api/types'
import { CardGrid } from '../components/cards/CardGrid'
import { useAuth } from '../context/AuthContext'
import { useData } from '../providers/DataProviderContext'

export function CollectionPage() {
  const data = useData()
  const { collection } = useAuth()
  const [cards, setCards] = useState<Card[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false

    async function loadCollection() {
      setLoading(true)

      const results = await Promise.all(
        collection.map((cardId) => data.getCard(cardId)),
      )

      if (!cancelled) {
        setCards(results.filter((card): card is Card => Boolean(card)))
        setLoading(false)
      }
    }

    loadCollection()

    return () => {
      cancelled = true
    }
  }, [data, collection])

  return (
    <div className="page">
      <h1>My Collection</h1>

      {!loading && collection.length === 0 && (
        <p className="page__message">
          No cards tracked yet.{' '}
          <Link to="/">Browse sets</Link> and add cards to your collection.
        </p>
      )}

      <CardGrid cards={cards} loading={loading} showSetName />
    </div>
  )
}
