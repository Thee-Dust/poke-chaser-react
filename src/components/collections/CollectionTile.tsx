import { Link } from 'react-router-dom'
import type { CollectionSummary } from '../../api/types'
import './CollectionGrid.css'

type CollectionTileProps = {
  collection: CollectionSummary
}

export function CollectionTile({ collection }: CollectionTileProps) {
  const marketValue = Number(collection.total_market_value)

  return (
    <Link to={`/collections/${collection.id}`} className="collection-tile">
      <div className="collection-tile__header">
        <h2 className="collection-tile__name">{collection.name}</h2>
        <span className="collection-tile__value">${marketValue.toFixed(2)}</span>
      </div>
      <p className="collection-tile__count">
        {collection.card_count} {collection.card_count === 1 ? 'card' : 'cards'}
      </p>
    </Link>
  )
}
