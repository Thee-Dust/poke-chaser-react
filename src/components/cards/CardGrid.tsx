import type { Card } from '../../api/types'
import { CardTile } from './CardTile'
import './CardGrid.css'

type CardGridProps = {
  cards: Card[]
  loading?: boolean
  showSetName?: boolean
}

export function CardGrid({ cards, loading, showSetName = false }: CardGridProps) {
  if (loading) {
    return (
      <div className="card-grid card-grid--loading" aria-busy="true">
        {Array.from({ length: 8 }).map((_, index) => (
          <div key={index} className="card-tile card-tile--skeleton" />
        ))}
      </div>
    )
  }

  if (cards.length === 0) {
    return <p className="card-grid__empty">No cards found.</p>
  }

  return (
    <div className="card-grid">
      {cards.map((card) => (
        <CardTile key={card.id} card={card} showSetName={showSetName} />
      ))}
    </div>
  )
}
