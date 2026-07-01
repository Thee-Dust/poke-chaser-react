import { Link } from 'react-router-dom'
import type { CollectionSummary } from '../../api/types'
import './CollectionGrid.css'

type CollectionTileProps = {
  collection: CollectionSummary
  onDelete?: (collection: CollectionSummary) => void
}

export function CollectionTile({ collection, onDelete }: CollectionTileProps) {
  const marketValue = Number(collection.total_market_value)
  const to = `/collections/${collection.id}`

  return (
    <div className="collection-tile">
      <Link
        to={to}
        className="collection-tile__link"
        aria-label={`View ${collection.name}`}
      />
      {!collection.is_default && onDelete && (
        <button
          type="button"
          className="collection-tile__delete-btn"
          aria-label="Delete collection"
          onClick={(e) => {
            e.stopPropagation()
            onDelete(collection)
          }}
        >
          <svg viewBox="0 0 16 16" width="16" height="16" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M2 4h12M5.5 4V2.5h5V4M6 7v4.5M10 7v4.5M3 4l.75 9h8.5L13 4" />
          </svg>
        </button>
      )}
      <div className="collection-tile__content">
        <div className="collection-tile__info">
          <span className="collection-tile__name">{collection.name}</span>
          <span className="collection-tile__count">
            {collection.card_count} {collection.card_count === 1 ? 'card' : 'cards'}
          </span>
        </div>
        <span className="collection-tile__value">${marketValue.toFixed(2)}</span>
      </div>
    </div>
  )
}
