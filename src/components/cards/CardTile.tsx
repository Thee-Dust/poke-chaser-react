import { Link } from 'react-router-dom'
import type { Card } from '../../api/types'
import { useAuth } from '../../context/AuthContext'
import './CardGrid.css'

type CardTileProps = {
  card: Card
  showSetName?: boolean
  onAdd?: (card: Card) => void
  onHistory?: () => void
  onRemove?: () => void
  marketValue?: string | null
  quantity?: number
  collectionId?: number
  collectionName?: string
}

function topMarketPrice(card: Card): number | undefined {
  const prices = card.tcgplayer?.prices
  if (!prices) return undefined
  const markets = Object.values(prices)
    .map((p) => p?.market)
    .filter((m): m is number => typeof m === 'number')
  return markets.length ? Math.max(...markets) : undefined
}

export function CardTile({
  card,
  showSetName = false,
  onAdd,
  onHistory,
  onRemove,
  marketValue,
  quantity,
  collectionId,
  collectionName,
}: CardTileProps) {
  const image = card.images?.small ?? card.images?.large
  const price = marketValue == null ? topMarketPrice(card) : undefined
  const { user } = useAuth()

  const cardPath = collectionId != null
    ? `/cards/${card.id}?collectionId=${collectionId}&collectionName=${encodeURIComponent(collectionName ?? '')}`
    : `/cards/${card.id}`

  return (
    <div className="card-tile">
      <Link
        to={cardPath}
        className="card-tile__link"
        aria-label={`View ${card.name}`}
      />
      <div className="card-tile__content">
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
          <div className="card-tile__footer">
            <div className="card-tile__price-group">
              {marketValue != null ? (
                <p className="card-tile__price">${Number(marketValue).toFixed(2)}</p>
              ) : price !== undefined ? (
                <p className="card-tile__price">${price.toFixed(2)}</p>
              ) : null}
              {quantity != null && (
                <span className="card-tile__quantity">Qty {quantity}</span>
              )}
            </div>
            {(onHistory || onRemove) && (
              <div className="card-tile__actions">
                {onHistory && (
                  <button
                    type="button"
                    className="card-tile__history-btn"
                    aria-label={`Purchase history for ${card.name}`}
                    onClick={(e) => {
                      e.stopPropagation()
                      e.preventDefault()
                      onHistory()
                    }}
                  >
                    <svg viewBox="0 0 16 16" width="13" height="13" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <circle cx="8" cy="8" r="6.5" />
                      <path d="M8 4.5V8l2.5 1.5" />
                    </svg>
                  </button>
                )}
                {onRemove && (
                  <button
                    type="button"
                    className="card-tile__remove-btn"
                    aria-label={`Remove ${card.name} from collection`}
                    onClick={(e) => {
                      e.stopPropagation()
                      e.preventDefault()
                      onRemove()
                    }}
                  >
                    <svg viewBox="0 0 16 16" width="13" height="13" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <path d="M2 4h12M5.5 4V2.5h5V4M6 7v4.5M10 7v4.5M3 4l.75 9h8.5L13 4" />
                    </svg>
                  </button>
                )}
              </div>
            )}
            {onAdd && user && (
              <button
                type="button"
                className="card-tile__add-btn"
                aria-label={`Add ${card.name} to collection`}
                onClick={(e) => {
                  e.stopPropagation()
                  e.preventDefault()
                  onAdd(card)
                }}
              >
                +
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
