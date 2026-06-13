import { Link } from 'react-router-dom'
import type { Card } from '../../api/types'
import './CardGrid.css'

type CardTileProps = {
  card: Card
  showSetName?: boolean
}

export function CardTile({ card, showSetName = false }: CardTileProps) {
  return (
    <Link to={`/cards/${card.id}`} className="card-tile">
      <div className="card-tile__image-wrap">
        {card.imageUrl ? (
          <img src={card.imageUrl} alt={card.name} className="card-tile__image" loading="lazy" />
        ) : (
          <div className="card-tile__placeholder" aria-hidden="true" />
        )}
      </div>
      <div className="card-tile__body">
        <h2 className="card-tile__name">{card.name}</h2>
        {showSetName && card.setName && (
          <p className="card-tile__set">{card.setName}</p>
        )}
        <p className="card-tile__meta">
          {[card.number, card.rarity].filter(Boolean).join(' · ')}
        </p>
      </div>
    </Link>
  )
}
