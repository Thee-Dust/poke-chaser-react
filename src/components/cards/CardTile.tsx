import { Link } from 'react-router-dom'
import type { Card } from '../../api/types'
import './CardGrid.css'

type CardTileProps = {
  card: Card
  showSetName?: boolean
}

function topMarketPrice(card: Card): number | undefined {
  const prices = card.tcgplayer?.prices
  if (!prices) return undefined
  const markets = Object.values(prices)
    .map((p) => p?.market)
    .filter((m): m is number => typeof m === 'number')
  return markets.length ? Math.max(...markets) : undefined
}

export function CardTile({ card, showSetName = false }: CardTileProps) {
  const image = card.images?.small ?? card.images?.large
  const price = topMarketPrice(card)

  return (
    <Link to={`/cards/${card.id}`} className="card-tile">
      <div className="card-tile__image-wrap">
        {image ? (
          <img src={image} alt={card.name} className="card-tile__image" loading="lazy" />
        ) : (
          <div className="card-tile__placeholder" aria-hidden="true" />
        )}
      </div>
      <div className="card-tile__body">
        <h2 className="card-tile__name">{card.name}</h2>
        {showSetName && card.set_name && (
          <p className="card-tile__set">{card.set_name}</p>
        )}
        <p className="card-tile__meta">
          {[card.number, card.rarity].filter(Boolean).join(' · ')}
        </p>
        {price !== undefined && (
          <p className="card-tile__price">${price.toFixed(2)}</p>
        )}
      </div>
    </Link>
  )
}
