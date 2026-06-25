import type { Card, CollectionItem } from '../../api/types'
import { CardTile } from './CardTile'
import './CardGrid.css'

type CardGridProps = {
  cards?: Card[]
  items?: CollectionItem[]
  loading?: boolean
  showSetName?: boolean
  onAddToCollection?: (card: Card) => void
  onHistory?: (item: CollectionItem) => void
}

export function CardGrid({ cards, items, loading, showSetName = false, onAddToCollection, onHistory }: CardGridProps) {
  const isEmpty = items ? items.length === 0 : (cards ?? []).length === 0

  if (loading) {
    return (
      <div className="card-grid card-grid--loading" aria-busy="true">
        {Array.from({ length: 8 }).map((_, index) => (
          <div key={index} className="card-tile card-tile--skeleton" />
        ))}
      </div>
    )
  }

  if (isEmpty) {
    return <p className="card-grid__empty">No cards found.</p>
  }

  if (items) {
    return (
      <div className="card-grid">
        {items.map((item) => (
          <CardTile
            key={item.card.id}
            card={item.card}
            showSetName={showSetName}
            marketValue={item.market_price ?? null}
            quantity={item.quantity}
            onAdd={onAddToCollection}
            onHistory={onHistory ? () => onHistory(item) : undefined}
          />
        ))}
      </div>
    )
  }

  return (
    <div className="card-grid">
      {(cards ?? []).map((card) => (
        <CardTile
          key={card.id}
          card={card}
          showSetName={showSetName}
          onAdd={onAddToCollection}
        />
      ))}
    </div>
  )
}
